#!/usr/bin/env node

/**
 * AI Governance MCP Server - Version 2.0 avec Slash Commands
 *
 * Utilise des prompts MCP pour créer des slash commands intuitives
 * Exemple: /config, /detect_mode, /switch_mode, etc.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RULES_DIR = path.join(__dirname, "..", "rules");
const HOOKS_DIR = path.join(__dirname, "..", "hooks");
const PROJECT_CONFIG_FILE = ".ai-governance.json";

const AGENT_CONFIGS = {
  claude: { dir: ".claude", file: "CLAUDE.md" },
  cursor: { dir: ".cursor", file: "cursorrules" },
  gemini: { dir: ".gemini", file: "GEMINI.md" },
  aider: { dir: ".aider", file: "AIDER.md" },
  continue: { dir: ".continue", file: "CONTINUE.md" },
};

class AIGovernanceServer {
  constructor() {
    this.server = new Server(
      {
        name: "ai-governance",
        version: "2.0.0",
      },
      {
        capabilities: {
          tools: {},
          prompts: {},
          resources: {},
        },
      },
    );

    this.setupHandlers();
    this.server.onerror = (error) => console.error("[MCP Error]", error);

    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async detectProjectMode() {
    const cwd = process.cwd();
    const configPath = path.join(cwd, PROJECT_CONFIG_FILE);

    try {
      const config = JSON.parse(await fs.readFile(configPath, "utf-8"));
      return config.mode || "standard";
    } catch {
      return "standard";
    }
  }

  async saveProjectMode(mode) {
    const cwd = process.cwd();
    const configPath = path.join(cwd, PROJECT_CONFIG_FILE);

    const config = {
      mode,
      updatedAt: new Date().toISOString(),
    };

    await fs.writeFile(configPath, JSON.stringify(config, null, 2), "utf-8");
  }

  async readRulesFile(mode) {
    const filePath = path.join(RULES_DIR, `${mode}.md`);
    return await fs.readFile(filePath, "utf-8");
  }

  async detectAgent() {
    const cwd = process.cwd();

    for (const [agent, config] of Object.entries(AGENT_CONFIGS)) {
      const agentDir = path.join(cwd, config.dir);
      const agentFile = path.join(cwd, config.file);

      const dirExists = await fs
        .access(agentDir)
        .then(() => true)
        .catch(() => false);
      const fileExists = await fs
        .access(agentFile)
        .then(() => true)
        .catch(() => false);

      if (dirExists || fileExists) {
        return agent;
      }
    }

    return null;
  }

  async configureForAgent(agent, mode) {
    const cwd = process.cwd();
    const config = AGENT_CONFIGS[agent];

    if (!config) {
      throw new Error(`Agent non supporté: ${agent}`);
    }

    const agentDir = path.join(cwd, config.dir);
    const governanceFile = path.join(agentDir, "GOVERNANCE.md");
    const agentMainFile = path.join(cwd, config.file);

    await fs.mkdir(agentDir, { recursive: true });

    const rules = await this.readRulesFile(mode);
    await fs.writeFile(governanceFile, rules, "utf-8");

    const header = this.generateHeader(agent, config.dir);

    const fileExists = await fs
      .access(agentMainFile)
      .then(() => true)
      .catch(() => false);

    if (!fileExists) {
      const template = this.generateTemplate(agent, config.dir);
      await fs.writeFile(agentMainFile, header + "\n\n" + template, "utf-8");
    } else {
      const content = await fs.readFile(agentMainFile, "utf-8");

      if (!content.includes("GOVERNANCE.md")) {
        await fs.writeFile(agentMainFile, header + "\n\n" + content, "utf-8");
      }
    }

    await this.saveProjectMode(mode);

    return {
      agent,
      agentDir,
      governanceFile,
      agentMainFile,
      created: !fileExists,
    };
  }

  generateHeader(agent, dir) {
    return `# Project Overview

This project uses AI Governance rules to ensure consistent development practices.

> **🔴 IMPORTANT: GOVERNANCE ENFORCEMENT**
> You **MUST** read the file \`${dir}/GOVERNANCE.md\` immediately at the start of every session to understand and apply the active strictness rules and workflow constraints.
> Do not proceed with any code modification until you have ingested these rules.`;
  }

  generateTemplate(agent, dir) {
    return `## Project Description

[Describe your project here]

## Tech Stack

- Language: [e.g., JavaScript, Python]
- Framework: [e.g., React, Django]
- Database: [e.g., PostgreSQL, MongoDB]

## Development Commands

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test
\`\`\`

## Important Notes

- See \`${dir}/GOVERNANCE.md\` for AI governance rules
- Follow conventional commits format
- Write tests for new features

## Current Focus

[What are you currently working on?]`;
  }

  setupHandlers() {
    // ==================================================================
    // RESOURCES
    // ==================================================================

    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      const currentMode = await this.detectProjectMode();

      return {
        resources: [
          {
            uri: "governance://current",
            mimeType: "text/markdown",
            name: `Règles de gouvernance actuelles (${currentMode})`,
            description: `Auto-injectées dans le system prompt - Mode ${currentMode}`,
          },
          {
            uri: "governance://light",
            mimeType: "text/markdown",
            name: "Règles mode LIGHT",
            description: "Prototypes, expérimentation rapide",
          },
          {
            uri: "governance://standard",
            mimeType: "text/markdown",
            name: "Règles mode STANDARD",
            description: "Développement quotidien",
          },
          {
            uri: "governance://strict",
            mimeType: "text/markdown",
            name: "Règles mode STRICT",
            description: "Production critique",
          },
        ],
      };
    });

    this.server.setRequestHandler(
      ReadResourceRequestSchema,
      async (request) => {
        const uri = request.params.uri;
        const mode = uri.replace("governance://", "");

        if (mode === "current") {
          const currentMode = await this.detectProjectMode();
          const content = await this.readRulesFile(currentMode);

          return {
            contents: [
              {
                uri,
                mimeType: "text/markdown",
                text: `# Mode actuel: ${currentMode.toUpperCase()}\n\n${content}`,
              },
            ],
          };
        }

        if (["light", "standard", "strict"].includes(mode)) {
          const content = await this.readRulesFile(mode);

          return {
            contents: [
              {
                uri,
                mimeType: "text/markdown",
                text: content,
              },
            ],
          };
        }

        throw new Error(`Mode inconnu: ${mode}`);
      },
    );

    // ==================================================================
    // PROMPTS - SLASH COMMANDS
    // ==================================================================

    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: "governance_init",
            description:
              "Charge automatiquement les règles de gouvernance au démarrage",
            arguments: [],
          },
          {
            name: "governance_config",
            description:
              "Configure le projet pour un agent (Claude, Cursor, Gemini, etc.)",
            arguments: [
              {
                name: "agent",
                description:
                  "Agent à configurer (claude/cursor/gemini/aider/continue/auto)",
                required: false,
              },
              {
                name: "mode",
                description: "Mode de gouvernance (light/standard/strict)",
                required: false,
              },
            ],
          },
          {
            name: "governance_detect_mode",
            description:
              "Affiche le mode de gouvernance actuel du projet",
            arguments: [],
          },
          {
            name: "governance_switch_mode",
            description: "Change le mode de gouvernance",
            arguments: [
              {
                name: "mode",
                description: "Nouveau mode (light/standard/strict)",
                required: true,
              },
            ],
          },
          {
            name: "governance_explain_mode",
            description:
              "Explique le mode actuel et ses règles",
            arguments: [],
          },
          {
            name: "governance_install_hooks",
            description:
              "Installe les git hooks pour vérifier les règles",
            arguments: [
              {
                name: "force",
                description: "Écraser les hooks existants (true/false)",
                required: false,
              },
            ],
          },
          {
            name: "governance_help",
            description:
              "Affiche la liste des commandes disponibles",
            arguments: [],
          },
        ],
      };
    });

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name: fullPromptName, arguments: args } = request.params;
      const name = fullPromptName.replace("governance_", "");

      // ==================================================================
      // /init - Auto-charge les règles
      // ==================================================================
      if (name === "init") {
        const currentMode = await this.detectProjectMode();
        const rules = await this.readRulesFile(currentMode);

        return {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `🤖 **AI GOVERNANCE SYSTEM ACTIVATED**

You are working on a project with **${currentMode.toUpperCase()} governance mode**.

# CRITICAL INSTRUCTIONS

**YOU MUST** read and follow ALL rules below before ANY action.
These rules are **MANDATORY** and override your default behaviors.

---

${rules}

---

**CONFIRMATION REQUIRED:**

Before proceeding with any task, confirm that you have:
1. ✅ Read all governance rules above
2. ✅ Understood the current mode (${currentMode})
3. ✅ Will apply these rules to every interaction

Respond with:
"✅ Governance rules loaded (${currentMode} mode). Ready to assist."

**Available commands:**
- \`/config\` - Configure project for your agent
- \`/detect_mode\` - Check current mode
- \`/switch_mode\` - Change governance mode
- \`/explain_mode\` - Explain current rules
- \`/install_hooks\` - Install git hooks
- \`/help\` - Show all commands`,
              },
            },
          ],
        };
      }

      // ==================================================================
      // /config - Configure le projet
      // ==================================================================
      if (name === "config") {
        const agent = args?.agent || "auto";
        const mode = args?.mode || "standard";

        let detectedAgent = agent;

        if (agent === "auto") {
          const detected = await this.detectAgent();
          if (!detected) {
            return {
              messages: [
                {
                  role: "user",
                  content: {
                    type: "text",
                    text: `❌ **Impossible de détecter l'agent automatiquement**

Aucun fichier de configuration d'agent détecté dans ce projet.

**Agents supportés:**
- \`claude\` - Claude Desktop
- \`cursor\` - Cursor IDE
- \`gemini\` - Gemini CLI
- \`aider\` - Aider
- \`continue\` - Continue

**Usage:**
\`/config agent=gemini mode=standard\`

**Exemple:**
Tape simplement: \`/config agent=gemini\``,
                  },
                },
              ],
            };
          }
          detectedAgent = detected;
        }

        if (!AGENT_CONFIGS[detectedAgent]) {
          return {
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: `❌ Agent non supporté: ${detectedAgent}

**Agents valides:** ${Object.keys(AGENT_CONFIGS).join(", ")}

**Usage:**
\`/config agent=gemini mode=standard\``,
                },
              },
            ],
          };
        }

        const result = await this.configureForAgent(detectedAgent, mode);
        const config = AGENT_CONFIGS[detectedAgent];

        return {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `✅ **Projet configuré pour ${detectedAgent.toUpperCase()}**

**Mode de gouvernance:** ${mode.toUpperCase()} ${mode === "light" ? "⚡" : mode === "standard" ? "⚙️" : "🔒"}

**Fichiers créés/mis à jour:**
- \`${config.dir}/GOVERNANCE.md\` - Règles complètes du mode ${mode}
- \`${config.file}\` - ${result.created ? "Créé avec template" : "Header ajouté"}

**Prochaines étapes:**
1. Révise \`${config.file}\` et complète les informations du projet
2. Lis \`${config.dir}/GOVERNANCE.md\` pour comprendre les règles
3. Installe les git hooks: \`/install_hooks\`

Les règles de gouvernance sont maintenant actives ! 🎉

**Autres commandes utiles:**
- \`/detect_mode\` - Vérifier le mode actuel
- \`/explain_mode\` - Comprendre les règles
- \`/help\` - Voir toutes les commandes`,
              },
            },
          ],
        };
      }

      // ==================================================================
      // /detect_mode - Détecte le mode actuel
      // ==================================================================
      if (name === "detect_mode") {
        const cwd = process.cwd();
        const mode = await this.detectProjectMode();
        const agent = await this.detectAgent();
        const configPath = path.join(cwd, PROJECT_CONFIG_FILE);
        const hasConfig = await fs
          .access(configPath)
          .then(() => true)
          .catch(() => false);

        let configInfo = "";
        if (agent) {
          const agentConfig = AGENT_CONFIGS[agent];
          const governanceFile = path.join(
            cwd,
            agentConfig.dir,
            "GOVERNANCE.md",
          );
          const hasGov = await fs
            .access(governanceFile)
            .then(() => true)
            .catch(() => false);

          configInfo = `\n**Agent détecté:** ${agent.toUpperCase()}`;
          configInfo += `\n**Fichier de règles:** ${hasGov ? "✅" : "❌"} \`${agentConfig.dir}/GOVERNANCE.md\``;

          if (!hasGov) {
            configInfo += `\n\n⚠️ Fichier de règles manquant. Lance \`/config agent=${agent}\` pour le créer.`;
          }
        }

        return {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `📋 **Configuration du projet**

**Projet:** ${path.basename(cwd)}
**Mode:** ${mode.toUpperCase()} ${mode === "light" ? "⚡" : mode === "standard" ? "⚙️" : "🔒"}
**Config MCP:** ${hasConfig ? "✅" : "⚠️ Par défaut"}${configInfo}

**Commandes utiles:**
- \`/switch_mode mode=strict\` - Changer de mode
- \`/explain_mode\` - Comprendre les règles
- \`/install_hooks\` - Installer les git hooks`,
              },
            },
          ],
        };
      }

      // ==================================================================
      // /switch_mode - Change le mode
      // ==================================================================
      if (name === "switch_mode") {
        const newMode = args?.mode;

        if (!newMode || !["light", "standard", "strict"].includes(newMode)) {
          return {
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: `❌ **Mode invalide**

**Usage:**
\`/switch_mode mode=strict\`

**Modes valides:**
- \`light\` - Prototypage rapide ⚡
- \`standard\` - Développement quotidien ⚙️
- \`strict\` - Production critique 🔒`,
                },
              },
            ],
          };
        }

        const oldMode = await this.detectProjectMode();

        if (newMode === oldMode) {
          return {
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: `ℹ️ Le projet est déjà en mode **${newMode.toUpperCase()}**.

**Autres commandes:**
- \`/detect_mode\` - Voir le statut actuel
- \`/explain_mode\` - Comprendre les règles`,
                },
              },
            ],
          };
        }

        await this.saveProjectMode(newMode);

        let filesUpdated = [];
        const agent = await this.detectAgent();
        if (agent) {
          const agentConfig = AGENT_CONFIGS[agent];
          const governanceFile = path.join(
            process.cwd(),
            agentConfig.dir,
            "GOVERNANCE.md",
          );
          const rules = await this.readRulesFile(newMode);

          await fs.writeFile(governanceFile, rules, "utf-8");
          filesUpdated.push(`${agentConfig.dir}/GOVERNANCE.md`);
        }

        return {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `✅ **Mode changé: ${oldMode.toUpperCase()} → ${newMode.toUpperCase()}**

**Fichiers mis à jour:**
${filesUpdated.length > 0 ? filesUpdated.map((f) => `- ${f}`).join("\n") : "- .ai-governance.json uniquement"}

${newMode === "strict" ? "\n⚠️ **Mode STRICT activé** - Installe les git hooks: `/install_hooks`" : ""}

Les nouvelles règles sont maintenant actives. Tape \`/explain_mode\` pour les découvrir.`,
              },
            },
          ],
        };
      }

      // ==================================================================
      // /explain_mode - Explique le mode actuel
      // ==================================================================
      if (name === "explain_mode") {
        const mode = await this.detectProjectMode();
        const rules = await this.readRulesFile(mode);

        const explanations = {
          light: {
            emoji: "⚡",
            title: "LIGHT - Prototypage rapide",
            summary:
              "5 règles essentielles, IA autonome, idéal pour side projects et expérimentation",
          },
          standard: {
            emoji: "⚙️",
            title: "STANDARD - Développement quotidien",
            summary:
              "10 règles équilibrées, balance vitesse/qualité, pour projets maintenus",
          },
          strict: {
            emoji: "🔒",
            title: "STRICT - Production critique",
            summary:
              "19 règles complètes, contrôle total, pour applications critiques et grandes équipes",
          },
        };

        const current = explanations[mode];

        return {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `${current.emoji} **Mode ${mode.toUpperCase()}**

${current.summary}

---

${rules}

---

**Commandes utiles:**
- \`/switch_mode mode=autre\` - Changer de mode
- \`/install_hooks\` - Installer les git hooks
- \`/detect_mode\` - Voir le statut`,
              },
            },
          ],
        };
      }

      // ==================================================================
      // /install_hooks - Installe les git hooks
      // ==================================================================
      if (name === "install_hooks") {
        const force = args?.force === "true" || args?.force === true;
        const cwd = process.cwd();
        const gitHooksDir = path.join(cwd, ".git", "hooks");
        const mode = await this.detectProjectMode();

        try {
          await fs.access(path.join(cwd, ".git"));
        } catch {
          return {
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: `❌ **Pas un dépôt Git**

Initialise d'abord Git avec:
\`\`\`bash
git init
\`\`\`

Puis relance: \`/install_hooks\``,
                },
              },
            ],
          };
        }

        const hooksToInstall = ["pre-commit", "commit-msg", "pre-push"];
        const installed = [];
        const skipped = [];

        for (const hookName of hooksToInstall) {
          const sourcePath = path.join(HOOKS_DIR, hookName);
          const targetPath = path.join(gitHooksDir, hookName);

          const exists = await fs
            .access(targetPath)
            .then(() => true)
            .catch(() => false);

          if (exists && !force) {
            skipped.push(hookName);
            continue;
          }

          const content = await fs.readFile(sourcePath, "utf-8");
          await fs.writeFile(targetPath, content, "utf-8");
          await fs.chmod(targetPath, 0o755);
          installed.push(hookName);
        }

        let message = "✅ **Git hooks installés**\n\n";

        if (installed.length > 0) {
          message += `**Installés:**\n${installed.map((h) => `- ${h}`).join("\n")}\n\n`;
        }

        if (skipped.length > 0) {
          message += `**Ignorés (déjà présents):**\n${skipped.map((h) => `- ${h}`).join("\n")}\n\n`;
          message += "Pour écraser: `/install_hooks force=true`\n\n";
        }

        message += `**Mode:** ${mode.toUpperCase()}\n`;
        message += `Les hooks vérifient maintenant le respect des règles à chaque commit et push.`;

        return {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: message,
              },
            },
          ],
        };
      }

      // ==================================================================
      // /help - Liste toutes les commandes
      // ==================================================================
      if (name === "help") {
        return {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `📚 **AI Governance MCP - Commandes disponibles**

**🚀 Setup & Configuration**
- \`/init\` - Charge les règles de gouvernance au démarrage
- \`/config agent=gemini mode=standard\` - Configure le projet
  → Agents: claude, cursor, gemini, aider, continue, auto
  → Modes: light, standard, strict

**🔍 Information**
- \`/detect_mode\` - Affiche le mode actuel du projet
- \`/explain_mode\` - Explique les règles du mode actuel

**🔄 Modification**
- \`/switch_mode mode=strict\` - Change le mode de gouvernance
- \`/install_hooks\` - Installe les git hooks
- \`/install_hooks force=true\` - Force l'installation

**❓ Aide**
- \`/help\` - Affiche cette aide

---

**Workflow type:**

1. **Nouveau projet:**
   \`\`\`
   /config agent=gemini mode=standard
   /install_hooks
   \`\`\`

2. **Projet existant:**
   \`\`\`
   /detect_mode
   /explain_mode
   \`\`\`

3. **Changer de mode:**
   \`\`\`
   /switch_mode mode=strict
   \`\`\`

---

**Raccourcis:**
- \`/config\` seul = détection auto de l'agent
- Mode par défaut = standard`,
              },
            },
          ],
        };
      }

      throw new Error(`Prompt inconnu: ${name}`);
    });

    // ==================================================================
    // TOOLS - Gardés pour rétro-compatibilité mais découragés
    // ==================================================================

    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "_deprecated_use_slash_commands",
            description:
              "⚠️ Les tools sont dépréciés. Utilisez les slash commands: /config, /detect_mode, /switch_mode, /explain_mode, /install_hooks, /help",
            inputSchema: {
              type: "object",
              properties: {},
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      return {
        content: [
          {
            type: "text",
            text: `⚠️ **Les tools sont dépréciés**

Utilisez maintenant les **slash commands** à la place:

- \`/config\` au lieu de \`config()\`
- \`/detect_mode\` au lieu de \`detect_mode()\`
- \`/switch_mode mode=strict\` au lieu de \`switch_mode()\`
- \`/explain_mode\` au lieu de \`explain_mode()\`
- \`/install_hooks\` au lieu de \`install_hooks()\`

Tape \`/help\` pour voir toutes les commandes disponibles.`,
          },
        ],
      };
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("AI Governance MCP Server v2.0 running with slash commands");
  }
}

const server = new AIGovernanceServer();
server.run().catch(console.error);

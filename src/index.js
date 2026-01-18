#!/usr/bin/env node

/**
 * AI Governance MCP Server - Version 2.0
 *
 * Fournit les règles de gouvernance de 2 manières :
 * 1. Auto-injection dans le system prompt (Claude Desktop)
 * 2. Génération de fichiers locaux (Cursor, Gemini, etc.)
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

// Map des agents supportés et leurs configs
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

  /**
   * Détecte quel agent est utilisé en regardant les fichiers présents
   */
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

  /**
   * Configure le projet pour un agent spécifique
   */
  async configureForAgent(agent, mode) {
    const cwd = process.cwd();
    const config = AGENT_CONFIGS[agent];

    if (!config) {
      throw new Error(`Agent non supporté: ${agent}`);
    }

    const agentDir = path.join(cwd, config.dir);
    const governanceFile = path.join(agentDir, "GOVERNANCE.md");
    const agentMainFile = path.join(cwd, config.file);

    // 1. Crée le dossier de l'agent
    await fs.mkdir(agentDir, { recursive: true });

    // 2. Copie les règles dans GOVERNANCE.md
    const rules = await this.readRulesFile(mode);
    await fs.writeFile(governanceFile, rules, "utf-8");

    // 3. Gère le fichier principal de l'agent
    const header = this.generateHeader(agent, config.dir);

    const fileExists = await fs
      .access(agentMainFile)
      .then(() => true)
      .catch(() => false);

    if (!fileExists) {
      // Crée un nouveau fichier avec template
      const template = this.generateTemplate(agent, config.dir);
      await fs.writeFile(agentMainFile, header + "\n\n" + template, "utf-8");
    } else {
      // Ajoute juste le header si pas déjà présent
      const content = await fs.readFile(agentMainFile, "utf-8");

      if (!content.includes("GOVERNANCE.md")) {
        await fs.writeFile(agentMainFile, header + "\n\n" + content, "utf-8");
      }
    }

    // 4. Sauvegarde la config
    await this.saveProjectMode(mode);

    return {
      agent,
      agentDir,
      governanceFile,
      agentMainFile,
      created: !fileExists,
    };
  }

  /**
   * Génère le header pour le fichier de l'agent
   */
  generateHeader(agent, dir) {
    return `# Project Overview

This project uses AI Governance rules to ensure consistent development practices.

> **🔴 IMPORTANT: GOVERNANCE ENFORCEMENT**
> You **MUST** read the file \`${dir}/GOVERNANCE.md\` immediately at the start of every session to understand and apply the active strictness rules and workflow constraints.
> Do not proceed with any code modification until you have ingested these rules.`;
  }

  /**
   * Génère un template de base pour le fichier de l'agent
   */
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
    // PROMPTS - Auto-injection au démarrage
    // ==================================================================

    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: "governance_autoload",
            description:
              "🤖 CHARGE AUTOMATIQUEMENT les règles de gouvernance au démarrage",
            arguments: [],
          },
          {
            name: "governance_explain",
            description: "Explique les règles du mode actuel",
            arguments: [],
          },
        ],
      };
    });

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name } = request.params;
      const currentMode = await this.detectProjectMode();
      const rules = await this.readRulesFile(currentMode);

      if (name === "governance_autoload") {
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

If you understand and will follow these rules, respond with:
"✅ Governance rules loaded (${currentMode} mode). Ready to assist."

Otherwise, ask for clarification on any rule you don't understand.`,
              },
            },
          ],
        };
      }

      if (name === "governance_explain") {
        return {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `Explique-moi les règles de gouvernance du mode ${currentMode} avec des exemples concrets.`,
              },
            },
          ],
        };
      }

      throw new Error(`Prompt inconnu: ${name}`);
    });

    // ==================================================================
    // TOOLS
    // ==================================================================

    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "config",
            description:
              "🔧 Configure le projet pour un agent spécifique (Claude, Cursor, Gemini, etc.)",
            inputSchema: {
              type: "object",
              properties: {
                agent: {
                  type: "string",
                  enum: [
                    "claude",
                    "cursor",
                    "gemini",
                    "aider",
                    "continue",
                    "auto",
                  ],
                  description:
                    "L'agent à configurer ('auto' pour détection automatique)",
                  default: "auto",
                },
                mode: {
                  type: "string",
                  enum: ["light", "standard", "strict"],
                  description: "Le mode de gouvernance",
                  default: "standard",
                },
              },
            },
          },
          {
            name: "detect_mode",
            description: "Détecte le mode de gouvernance actuel",
            inputSchema: {
              type: "object",
              properties: {},
            },
          },
          {
            name: "switch_mode",
            description: "Change le mode de gouvernance",
            inputSchema: {
              type: "object",
              properties: {
                mode: {
                  type: "string",
                  enum: ["light", "standard", "strict"],
                },
                update_files: {
                  type: "boolean",
                  description: "Mettre à jour les fichiers de config locaux",
                  default: true,
                },
              },
              required: ["mode"],
            },
          },
          {
            name: "install_hooks",
            description: "Installe les git hooks",
            inputSchema: {
              type: "object",
              properties: {
                force: {
                  type: "boolean",
                  default: false,
                },
              },
            },
          },
          {
            name: "explain_mode",
            description: "Explique le mode actuel",
            inputSchema: {
              type: "object",
              properties: {},
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      // ============================================================
      // TOOL: config (NOUVEAU - LE PLUS IMPORTANT)
      // ============================================================
      if (name === "config") {
        const { agent: requestedAgent = "auto", mode = "standard" } =
          args || {};

        let agent = requestedAgent;

        // Détection automatique si demandé
        if (agent === "auto") {
          const detected = await this.detectAgent();
          if (detected) {
            agent = detected;
          } else {
            return {
              content: [
                {
                  type: "text",
                  text: `❌ **Impossible de détecter l'agent automatiquement**

Aucun fichier de configuration d'agent détecté dans ce projet.

**Agents supportés:**
- \`claude\` - Claude Desktop (.claude/)
- \`cursor\` - Cursor IDE (.cursor/)
- \`gemini\` - Gemini CLI (.gemini/)
- \`aider\` - Aider (.aider/)
- \`continue\` - Continue (.continue/)

**Usage:**
Spécifie l'agent manuellement:
\`\`\`
config(agent="gemini", mode="standard")
\`\`\``,
                },
              ],
              isError: true,
            };
          }
        }

        // Vérifie que l'agent est supporté
        if (!AGENT_CONFIGS[agent]) {
          return {
            content: [
              {
                type: "text",
                text: `❌ Agent non supporté: ${agent}

Agents valides: ${Object.keys(AGENT_CONFIGS).join(", ")}`,
              },
            ],
            isError: true,
          };
        }

        // Configure le projet
        const result = await this.configureForAgent(agent, mode);
        const config = AGENT_CONFIGS[agent];

        return {
          content: [
            {
              type: "text",
              text: `✅ **Projet configuré pour ${agent.toUpperCase()}**

**Mode de gouvernance:** ${mode.toUpperCase()} ${mode === "light" ? "⚡" : mode === "standard" ? "⚙️" : "🔒"}

**Fichiers créés/mis à jour:**
- \`${config.dir}/GOVERNANCE.md\` - Règles complètes du mode ${mode}
- \`${config.file}\` - ${result.created ? "Créé avec template" : "Header ajouté"}

**Structure:**
\`\`\`
projet/
├── ${config.dir}/
│   └── GOVERNANCE.md    ← Règles de gouvernance
├── ${config.file}       ← Fichier principal de l'agent
└── .ai-governance.json  ← Configuration MCP
\`\`\`

${
  agent === "cursor"
    ? `
**Pour Cursor:**
Les règles dans \`.cursor/GOVERNANCE.md\` seront automatiquement lues.
Le fichier \`cursorrules\` sera utilisé comme contexte de base.
`
    : agent === "gemini"
      ? `
**Pour Gemini CLI:**
Les règles sont dans \`.gemini/GOVERNANCE.md\`.
Le fichier \`GEMINI.md\` contient le contexte du projet.

Lance Gemini avec:
\`\`\`bash
gemini chat
\`\`\`
`
      : agent === "claude"
        ? `
**Pour Claude Desktop:**
Les règles sont dans \`.claude/GOVERNANCE.md\`.
Le MCP les charge automatiquement via le prompt \`governance_autoload\`.
`
        : ""
}

**Prochaines étapes recommandées:**
1. Révise \`${config.file}\` et complète les informations du projet
2. Lis \`${config.dir}/GOVERNANCE.md\` pour comprendre les règles
3. Installe les git hooks: \`install_hooks()\`

Les règles de gouvernance sont maintenant actives ! 🎉`,
            },
          ],
        };
      }

      // ============================================================
      // TOOL: detect_mode
      // ============================================================
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

          configInfo = `\n**Agent détecté:** ${agent}`;
          configInfo += `\n**Fichier de règles:** ${hasGov ? "✅" : "❌"} \`${agentConfig.dir}/GOVERNANCE.md\``;

          if (!hasGov) {
            configInfo += `\n\n⚠️ Fichier de règles manquant. Lance \`config(agent="${agent}")\` pour le créer.`;
          }
        }

        return {
          content: [
            {
              type: "text",
              text: `📋 **Configuration du projet**

**Projet:** ${path.basename(cwd)}
**Mode:** ${mode.toUpperCase()} ${mode === "light" ? "⚡" : mode === "standard" ? "⚙️" : "🔒"}
**Config MCP:** ${hasConfig ? "✅" : "⚠️ Par défaut"}${configInfo}`,
            },
          ],
        };
      }

      // ============================================================
      // TOOL: switch_mode (AMÉLIORÉ)
      // ============================================================
      if (name === "switch_mode") {
        const { mode, update_files = true } = args;
        const oldMode = await this.detectProjectMode();

        if (mode === oldMode) {
          return {
            content: [
              {
                type: "text",
                text: `ℹ️ Le projet est déjà en mode **${mode.toUpperCase()}**.`,
              },
            ],
          };
        }

        await this.saveProjectMode(mode);

        let filesUpdated = [];

        // Met à jour les fichiers locaux si configuré
        if (update_files) {
          const agent = await this.detectAgent();
          if (agent) {
            const agentConfig = AGENT_CONFIGS[agent];
            const governanceFile = path.join(
              process.cwd(),
              agentConfig.dir,
              "GOVERNANCE.md",
            );
            const rules = await this.readRulesFile(mode);

            await fs.writeFile(governanceFile, rules, "utf-8");
            filesUpdated.push(`${agentConfig.dir}/GOVERNANCE.md`);
          }
        }

        return {
          content: [
            {
              type: "text",
              text: `✅ **Mode changé: ${oldMode.toUpperCase()} → ${mode.toUpperCase()}**

**Fichiers mis à jour:**
${filesUpdated.length > 0 ? filesUpdated.map((f) => `- ${f}`).join("\n") : "- .ai-governance.json uniquement"}

${mode === "strict" ? "\n⚠️ **Mode STRICT activé** - Installe les git hooks: `install_hooks()`" : ""}

Les nouvelles règles sont maintenant actives.`,
            },
          ],
        };
      }

      // ============================================================
      // TOOL: install_hooks
      // ============================================================
      if (name === "install_hooks") {
        const { force = false } = args || {};
        const cwd = process.cwd();
        const gitHooksDir = path.join(cwd, ".git", "hooks");
        const mode = await this.detectProjectMode();

        try {
          await fs.access(path.join(cwd, ".git"));
        } catch {
          return {
            content: [
              {
                type: "text",
                text: `❌ Pas un dépôt Git. Initialise avec \`git init\``,
              },
            ],
            isError: true,
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
          message += `**Ignorés:**\n${skipped.map((h) => `- ${h}`).join("\n")}\n`;
        }

        message += `\n**Mode:** ${mode.toUpperCase()}\n`;
        message += `Les hooks vérifient maintenant le respect des règles.`;

        return {
          content: [{ type: "text", text: message }],
        };
      }

      // ============================================================
      // TOOL: explain_mode
      // ============================================================
      if (name === "explain_mode") {
        const mode = await this.detectProjectMode();

        const explanations = {
          light: {
            emoji: "⚡",
            title: "LIGHT - Prototypage rapide",
            description: "5 règles essentielles, IA autonome",
          },
          standard: {
            emoji: "⚙️",
            title: "STANDARD - Développement quotidien",
            description: "10 règles équilibrées, vitesse/qualité",
          },
          strict: {
            emoji: "🔒",
            title: "STRICT - Production critique",
            description: "19 règles complètes, contrôle total",
          },
        };

        const current = explanations[mode];

        return {
          content: [
            {
              type: "text",
              text: `${current.emoji} **Mode ${mode.toUpperCase()}**

${current.description}

Pour changer: \`switch_mode(mode="autre_mode")\``,
            },
          ],
        };
      }

      throw new Error(`Tool inconnu: ${name}`);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("AI Governance MCP Server v2.0 running");
  }
}

const server = new AIGovernanceServer();
server.run().catch(console.error);

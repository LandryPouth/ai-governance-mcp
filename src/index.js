#!/usr/bin/env node

/**
 * AI Governance MCP Server
 *
 * Ce serveur MCP fournit automatiquement les règles de gouvernance IA
 * à ton agent (Claude, Gemini, etc.) selon le mode du projet
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

// Chemin vers les règles de gouvernance
const RULES_DIR = path.join(__dirname, "..", "rules");
const HOOKS_DIR = path.join(__dirname, "..", "hooks");

// Fichier de config locale du projet
const PROJECT_CONFIG_FILE = ".ai-governance.json";

class AIGovernanceServer {
  constructor() {
    this.server = new Server(
      {
        name: "ai-governance",
        version: "1.0.0",
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

  /**
   * Détecte le mode de gouvernance du projet actuel
   */
  async detectProjectMode() {
    const cwd = process.cwd();
    const configPath = path.join(cwd, PROJECT_CONFIG_FILE);

    try {
      const config = JSON.parse(await fs.readFile(configPath, "utf-8"));
      return config.mode || "standard";
    } catch {
      // Pas de config = mode standard par défaut
      return "standard";
    }
  }

  /**
   * Sauvegarde le mode dans le projet
   */
  async saveProjectMode(mode) {
    const cwd = process.cwd();
    const configPath = path.join(cwd, PROJECT_CONFIG_FILE);

    const config = {
      mode,
      updatedAt: new Date().toISOString(),
    };

    await fs.writeFile(configPath, JSON.stringify(config, null, 2), "utf-8");
  }

  /**
   * Lit le contenu d'un fichier de règles
   */
  async readRulesFile(mode) {
    const filePath = path.join(RULES_DIR, `${mode}.md`);
    return await fs.readFile(filePath, "utf-8");
  }

  setupHandlers() {
    // ==================================================================
    // RESOURCES - Les règles de gouvernance accessibles
    // ==================================================================

    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      const currentMode = await this.detectProjectMode();

      return {
        resources: [
          {
            uri: "governance://current",
            mimeType: "text/markdown",
            name: `Règles de gouvernance actuelles (${currentMode})`,
            description: `Les règles de gouvernance en mode ${currentMode} pour ce projet`,
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
            description: "Développement quotidien, projets maintenus",
          },
          {
            uri: "governance://strict",
            mimeType: "text/markdown",
            name: "Règles mode STRICT",
            description: "Production critique, équipes moyennes/grandes",
          },
        ],
      };
    });

    this.server.setRequestHandler(
      ReadResourceRequestSchema,
      async (request) => {
        const uri = request.params.uri;

        if (!uri.startsWith("governance://")) {
          throw new Error(`URI non supportée: ${uri}`);
        }

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
    // PROMPTS - Prompts système pour initialiser l'IA
    // ==================================================================

    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: "governance_init",
            description:
              "Initialise l'IA avec les règles de gouvernance du projet",
            arguments: [],
          },
          {
            name: "governance_explain",
            description: "Explique les règles du mode actuel avec exemples",
            arguments: [],
          },
        ],
      };
    });

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name } = request.params;
      const currentMode = await this.detectProjectMode();
      const rules = await this.readRulesFile(currentMode);

      if (name === "governance_init") {
        return {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `Tu es un assistant de développement qui doit STRICTEMENT suivre les règles de gouvernance définies ci-dessous.

# MODE ACTUEL: ${currentMode.toUpperCase()}

${rules}

IMPORTANT:
- Lis attentivement toutes les règles avant de commencer
- Applique-les systématiquement à chaque interaction
- Si une règle est violée, refuse poliment et explique pourquoi
- Utilise les outils disponibles (detect_mode, switch_mode, install_hooks) quand nécessaire

Es-tu prêt à suivre ces règles ?`,
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
                text: `Explique-moi les règles de gouvernance actuelles (mode ${currentMode}) avec des exemples concrets de code et de situations.

Sois pédagogue et donne des exemples de ce qui est autorisé ✅ et interdit ❌.`,
              },
            },
          ],
        };
      }

      throw new Error(`Prompt inconnu: ${name}`);
    });

    // ==================================================================
    // TOOLS - Actions disponibles pour l'IA
    // ==================================================================

    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "detect_mode",
            description:
              "Détecte et affiche le mode de gouvernance actuel du projet",
            inputSchema: {
              type: "object",
              properties: {},
            },
          },
          {
            name: "switch_mode",
            description: "Change le mode de gouvernance du projet",
            inputSchema: {
              type: "object",
              properties: {
                mode: {
                  type: "string",
                  enum: ["light", "standard", "strict"],
                  description: "Le nouveau mode à appliquer",
                },
              },
              required: ["mode"],
            },
          },
          {
            name: "install_hooks",
            description:
              "Installe les git hooks pour respecter les règles de gouvernance",
            inputSchema: {
              type: "object",
              properties: {
                force: {
                  type: "boolean",
                  description: "Écraser les hooks existants",
                  default: false,
                },
              },
            },
          },
          {
            name: "explain_mode",
            description:
              "Explique le mode actuel et ses différences avec les autres",
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
      // TOOL: detect_mode
      // ============================================================
      if (name === "detect_mode") {
        const cwd = process.cwd();
        const mode = await this.detectProjectMode();
        const configPath = path.join(cwd, PROJECT_CONFIG_FILE);
        const hasConfig = await fs
          .access(configPath)
          .then(() => true)
          .catch(() => false);

        const result = {
          project: path.basename(cwd),
          projectPath: cwd,
          mode: mode,
          configured: hasConfig,
          configFile: hasConfig ? configPath : null,
        };

        return {
          content: [
            {
              type: "text",
              text: `📋 **Mode de gouvernance détecté**

**Projet:** ${result.project}
**Chemin:** ${result.projectPath}
**Mode actuel:** ${mode.toUpperCase()} ${mode === "light" ? "⚡" : mode === "standard" ? "⚙️" : "🔒"}
**Configuration:** ${hasConfig ? "✅ Présente" : "⚠️ Par défaut (standard)"}

${!hasConfig ? "\n💡 Astuce: Utilise `switch_mode` pour configurer explicitement le mode." : ""}`,
            },
          ],
        };
      }

      // ============================================================
      // TOOL: switch_mode
      // ============================================================
      if (name === "switch_mode") {
        const { mode } = args;
        const oldMode = await this.detectProjectMode();

        if (mode === oldMode) {
          return {
            content: [
              {
                type: "text",
                text: `ℹ️ Le projet est déjà en mode **${mode.toUpperCase()}**. Aucun changement nécessaire.`,
              },
            ],
          };
        }

        await this.saveProjectMode(mode);
        const cwd = process.cwd();

        return {
          content: [
            {
              type: "text",
              text: `✅ **Mode de gouvernance changé**

**Ancien mode:** ${oldMode.toUpperCase()}
**Nouveau mode:** ${mode.toUpperCase()} ${mode === "light" ? "⚡" : mode === "standard" ? "⚙️" : "🔒"}

**Fichier créé/mis à jour:** ${path.join(cwd, PROJECT_CONFIG_FILE)}

${mode === "strict" ? "\n⚠️ **Mode STRICT activé** - Recommandation: Installe les git hooks avec `install_hooks`" : ""}

Les nouvelles règles sont maintenant actives. Je vais les appliquer à partir de maintenant.`,
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

        // Vérifie qu'on est dans un repo git
        try {
          await fs.access(path.join(cwd, ".git"));
        } catch {
          return {
            content: [
              {
                type: "text",
                text: `❌ **Erreur**: Ce n'est pas un dépôt Git.

Initialise d'abord Git avec:
\`\`\`bash
git init
\`\`\``,
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

          // Vérifie si le hook existe déjà
          const exists = await fs
            .access(targetPath)
            .then(() => true)
            .catch(() => false);

          if (exists && !force) {
            skipped.push(hookName);
            continue;
          }

          // Copie et rend exécutable
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
          message +=
            "💡 Utilise `force: true` pour écraser les hooks existants.\n\n";
        }

        message += `**Mode actuel:** ${mode.toUpperCase()}\n`;
        message += `**Localisation:** ${gitHooksDir}\n\n`;
        message += `Les hooks vont maintenant vérifier que tu respectes les règles de gouvernance à chaque commit et push.`;

        return {
          content: [
            {
              type: "text",
              text: message,
            },
          ],
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
            title: "Mode LIGHT - Prototypage rapide",
            description: "Pour expérimentation, side projects, apprentissage",
            rules: "5 règles essentielles",
            features: [
              "IA autonome sur petites décisions",
              "Validation uniquement pour actions critiques",
              "Pas de plan obligatoire pour micro-tasks",
              "Tests basiques suffisants",
            ],
            useCases: [
              "Prototypes jetables",
              "Apprentissage de nouvelles technos",
              "Hackathons",
              "POC",
            ],
          },
          standard: {
            emoji: "⚙️",
            title: "Mode STANDARD - Développement quotidien",
            description: "Équilibre entre vitesse et qualité",
            rules: "10 règles équilibrées",
            features: [
              "Plan obligatoire pour features moyennes/grandes",
              "Gestion des branches",
              "Tests obligatoires",
              "Autorisations pour actions critiques",
            ],
            useCases: [
              "Projets maintenus >6 mois",
              "Applications avec 10-1000 users",
              "Petites équipes (1-5 devs)",
            ],
          },
          strict: {
            emoji: "🔒",
            title: "Mode STRICT - Production critique",
            description: "Qualité maximale, zéro surprise",
            rules: "19 règles complètes",
            features: [
              "Plan détaillé obligatoire",
              "RFC pour tâches complexes",
              "Tests complets (unitaires + intégration + E2E)",
              "Feature flags et rollback",
              "Traçabilité complète",
            ],
            useCases: [
              "Production >1000 users",
              "Finance/santé/données sensibles",
              "Équipes >5 devs",
            ],
          },
        };

        const current = explanations[mode];
        const others = Object.keys(explanations).filter((m) => m !== mode);

        let message = `${current.emoji} **${current.title}**\n\n`;
        message += `${current.description}\n\n`;
        message += `**Caractéristiques:**\n`;
        message += `- ${current.rules}\n`;
        current.features.forEach((f) => (message += `- ${f}\n`));
        message += `\n**Cas d'usage:**\n`;
        current.useCases.forEach((u) => (message += `- ${u}\n`));
        message += `\n---\n\n**Autres modes disponibles:**\n\n`;

        others.forEach((m) => {
          const other = explanations[m];
          message += `${other.emoji} **${m.toUpperCase()}** - ${other.description}\n`;
        });

        message += `\n💡 Pour changer de mode: \`switch_mode\``;

        return {
          content: [
            {
              type: "text",
              text: message,
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
    console.error("AI Governance MCP Server running");
  }
}

// Démarrage du serveur
const server = new AIGovernanceServer();
server.run().catch(console.error);

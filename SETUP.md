# 🚀 Guide de Setup Complet - AI Governance MCP

Ce guide te montre comment setup le MCP de A à Z pour qu'il fonctionne automatiquement avec tes agents IA.

---

## 📋 Prérequis

- Node.js >= 18.0.0
- Git
- Claude Desktop, Gemini CLI, ou autre agent compatible MCP
- Un compte GitHub (pour héberger le MCP)

---

## 🎯 ÉTAPE 1 : Créer le Repository

### Sur GitHub

```bash
# Crée le repo sur GitHub (via web ou CLI)
gh repo create ai-governance-mcp --public --clone

# Ou manuellement : crée sur github.com puis clone
git clone https://github.com/TON-USERNAME/ai-governance-mcp.git
```

### Structure Initiale

```bash
cd ai-governance-mcp

# Crée la structure
mkdir -p src rules hooks

# Crée les fichiers de base
touch package.json
touch README.md
touch src/index.js
touch rules/light.md
touch rules/standard.md
touch rules/strict.md
touch hooks/pre-commit
touch hooks/commit-msg
touch hooks/pre-push
```

---

## 🎯 ÉTAPE 2 : Copier les Fichiers

### package.json

Copie le contenu du fichier `package.json` que je t'ai fourni.

### src/index.js

Copie le contenu complet du serveur MCP.

### Les 3 fichiers de règles

```bash
# Copie tes 3 fichiers de gouvernance
cp /chemin/vers/gouvernance-light.md rules/light.md
cp /chemin/vers/gouvernance-standard.md rules/standard.md
cp /chemin/vers/gouvernance-strict.md rules/strict.md
```

### Les Git Hooks

Copie le contenu des 3 hooks (pre-commit, commit-msg, pre-push).

### README.md

Copie le README complet.

---

## 🎯 ÉTAPE 3 : Installation

```bash
# Installe les dépendances
npm install

# Vérifie que tout fonctionne
npm start

# Tu devrais voir :
# AI Governance MCP Server running
```

**Si ça fonctionne, le serveur MCP est prêt ! 🎉**

Arrête le serveur (Ctrl+C).

---

## 🎯 ÉTAPE 4 : Configuration Claude Desktop

### Localise le fichier de config

**macOS :**
```bash
~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Windows :**
```bash
%APPDATA%\Claude\claude_desktop_config.json
```

**Linux :**
```bash
~/.config/Claude/claude_desktop_config.json
```

### Édite la configuration

```bash
# Ouvre avec ton éditeur
code ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Ou
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

### Ajoute le MCP

```json
{
  "mcpServers": {
    "ai-governance": {
      "command": "node",
      "args": [
        "/Users/TON-USER/ai-governance-mcp/src/index.js"
      ],
      "env": {}
    }
  }
}
```

**⚠️ IMPORTANT : Utilise le CHEMIN ABSOLU vers ton fichier src/index.js**

Pour obtenir le chemin absolu :
```bash
cd ai-governance-mcp
pwd
# Copie le résultat et ajoute /src/index.js
```

### Si tu as déjà d'autres MCP

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/projects"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your-token"
      }
    },
    "ai-governance": {
      "command": "node",
      "args": ["/Users/TON-USER/ai-governance-mcp/src/index.js"]
    }
  }
}
```

---

## 🎯 ÉTAPE 5 : Tester le MCP

### Redémarre Claude Desktop

Ferme complètement Claude Desktop et relance-le.

### Vérifie que le MCP est chargé

Dans Claude, tape :

```
Liste les MCP servers disponibles
```

Tu devrais voir `ai-governance` dans la liste.

### Test de base

```
Utilise le tool detect_mode
```

Si ça fonctionne, Claude devrait répondre avec le mode détecté !

---

## 🎯 ÉTAPE 6 : Premier Projet de Test

### Crée un projet test

```bash
cd ~/projets
mkdir test-governance
cd test-governance
git init
```

### Configure le mode

```bash
# Mode standard (par défaut)
echo '{"mode": "standard"}' > .ai-governance.json

# Ou laisse vide, standard sera utilisé
```

### Lance Claude et teste

```
Toi: Utilise detect_mode

Claude: [Exécute le tool]
📋 Mode de gouvernance détecté
Projet: test-governance
Mode actuel: STANDARD ⚙️
```

### Teste le switch de mode

```
Toi: Passe en mode strict

Claude: [Exécute switch_mode]
✅ Mode changé: STANDARD → STRICT 🔒
```

### Installe les hooks

```
Toi: Installe les git hooks

Claude: [Exécute install_hooks]
✅ Git hooks installés
```

### Teste les règles

```
Toi: Ajoute une fonction pour calculer la somme de deux nombres

Claude: [Lit governance://current]
📋 PLAN PROPOSÉ (mode STRICT détecté)

1. Design
   - Fonction pure `sum(a, b)`
   - Validation des inputs
   
2. Tests prévus
   - Test avec nombres positifs
   - Test avec nombres négatifs
   - Test avec zéros
   
3. Plan de rollback
   - Simple revert du commit

OK pour implémenter ?
```

**Si tout ça fonctionne, ton MCP est parfaitement configuré ! 🎉**

---

## 🎯 ÉTAPE 7 : Push sur GitHub

```bash
cd ai-governance-mcp

# Ignore node_modules
echo "node_modules/" > .gitignore

# Premier commit
git add .
git commit -m "feat: initial commit AI governance MCP"

# Push
git push origin main
```

---

## 🎯 ÉTAPE 8 : Utilisation Quotidienne

### Sur un nouveau projet

```bash
# 1. Crée ton projet
mkdir mon-app
cd mon-app
git init

# 2. (Optionnel) Configure le mode
echo '{"mode": "standard"}' > .ai-governance.json

# 3. Lance Claude
# Les règles sont automatiquement appliquées !
```

### Sur un projet existant

```bash
# 1. Va dans ton projet
cd projet-existant

# 2. Configure le mode
echo '{"mode": "strict"}' > .ai-governance.json

# 3. Demande à Claude d'installer les hooks
# Toi: Installe les git hooks
```

---

## 🔧 Configuration Avancée

### Utiliser avec Gemini CLI

Si Gemini supporte MCP (vérifie leur doc), configure de la même manière.

Sinon, tu peux lancer le serveur manuellement :

```bash
# Terminal 1 : Lance le serveur MCP
cd ai-governance-mcp
npm start

# Terminal 2 : Lance Gemini avec le serveur
gemini chat --m
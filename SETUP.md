# 🚀 Guide d'Installation et Configuration - AI Governance MCP

Ce guide explique comment installer le serveur MCP et configurer vos agents IA (Claude, Cursor, Gemini, etc.) pour utiliser les règles de gouvernance.

---

## 📋 Prérequis

- **Node.js** >= 18.0.0
- **Git**
- Un agent compatible MCP (Claude Desktop, Cursor, Gemini CLI, etc.)

---

## 🎯 ÉTAPE 1 : Installation du Serveur (Une seule fois)

Cette étape installe le serveur MCP sur votre machine. Vous n'avez besoin de le faire qu'une seule fois.

### 1. Cloner le dépôt

```bash
git clone https://github.com/ton-username/ai-governance-mcp.git
cd ai-governance-mcp
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Préparer les règles (Optionnel)

Le MCP vient avec des règles par défaut, mais vous pouvez copier vos propres fichiers de règles dans le dossier `rules/`.

```bash
# Exemple : Copie vos règles personnelles
cp /mon/chemin/vers/mes-regles-light.md rules/light.md
cp /mon/chemin/vers/mes-regles-standard.md rules/standard.md
cp /mon/chemin/vers/mes-regles-strict.md rules/strict.md
```

### 4. Obtenir le chemin absolu

Vous en aurez besoin pour la configuration.

```bash
pwd
# Copiez le chemin affiché (ex: /home/user/dev/ai-governance-mcp)
```

---

## 🎯 ÉTAPE 2 : Configuration de votre Agent

Configurez votre agent préféré pour qu'il puisse communiquer avec le serveur MCP.

### Option A : Claude Desktop

1. Ouvrez le fichier de configuration :
   - **macOS :** `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows :** `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux :** `~/.config/Claude/claude_desktop_config.json`

2. Ajoutez le serveur MCP (remplacez `/CHEMIN/ABSOLU` par le chemin obtenu à l'étape 1) :

```json
{
  "mcpServers": {
    "ai-governance": {
      "command": "node",
      "args": ["/CHEMIN/ABSOLU/vers/ai-governance-mcp/src/index.js"]
    }
  }
}
```

3. Redémarrez Claude Desktop.

### Option B : Gemini CLI / Autres

La plupart des agents CLI peuvent être configurés via des arguments ou des fichiers de config. Assurez-vous simplement de lancer le script `src/index.js` avec `node` comme serveur MCP.

---

## 🎯 ÉTAPE 3 : Utilisation dans un Projet (Workflow v2)

Une fois le serveur installé, voici comment l'utiliser dans vos projets quotidiens.

### 1. Initialiser un projet

Dans n'importe quel projet où vous voulez de la gouvernance IA :

1. Ouvrez votre agent (Claude, Gemini, Cursor).
2. Lancez la commande de configuration :

```
Toi: /governance_config agent=gemini mode=standard
```

### 2. Ce que fait la commande `/governance_config`

L'agent va automatiquement :
1. **Détecter votre environnement** (Claude, Gemini, Cursor, etc.).
2. **Créer le dossier de configuration** (ex: `.gemini/`, `.cursor/`, `.claude/`).
3. **Copier les règles de gouvernance** dans ce dossier (fichier `GOVERNANCE.md`).
4. **Créer/Mettre à jour le fichier de contexte** du projet (ex: `GEMINI.md`, `cursorrules`) avec un header obligatoire qui force l'IA à lire les règles.

### 3. Exemple : Nouveau projet avec Gemini

```bash
# 1. Créez votre projet
mkdir mon-app && cd mon-app
git init

# 2. Lancez Gemini
gemini chat

# 3. Configurez
Toi: /governance_config agent=gemini mode=standard

Gemini: ✅ Projet configuré pour GEMINI
Mode: STANDARD ⚙️

Fichiers créés:
- .gemini/GOVERNANCE.md (règles complètes)
- GEMINI.md (contexte projet + lien vers règles)
- .ai-governance.json (config MCP)
```

Maintenant, à chaque fois que Gemini démarre dans ce dossier, il lira `GEMINI.md`, qui lui dira de lire `.gemini/GOVERNANCE.md`, et il appliquera vos règles !

---

## 🎯 ÉTAPE 4 : Commandes Quotidiennes

Une fois configuré, vous avez accès à ces outils via votre agent :

| Commande | Description |
|---|---|
| `/governance_config` | Configure ou reconfigure le projet (agent, mode). |
| `/governance_detect_mode` | Affiche le mode actuel et l'état de la config. |
| `/governance_switch_mode` | Change de mode (ex: standard -> strict) et met à jour les fichiers de règles localement. |
| `/governance_install_hooks` | Installe les Git hooks pour vérifier les règles avant commit/push. |
| `/governance_explain_mode` | Explique les différences entre les modes. |

---

## ❓ Dépannage

### L'agent ne voit pas les règles

**Solution :** Lancez `/governance_detect_mode`. Si le fichier de règles est marqué manquant, relancez `/governance_config`.

### Les fichiers ne sont pas créés

**Solution :** Vérifiez les permissions d'écriture dans le dossier du projet (`chmod +w .`).

### Je veux changer de mode

**Solution :** Lancez simplement : `/governance_switch_mode mode=strict`. Cela mettra à jour la configuration `.ai-governance.json` ET le fichier de règles local `GOVERNANCE.md`.

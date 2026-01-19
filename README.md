# 🤖 AI Governance MCP Server

Un serveur MCP (Model Context Protocol) qui applique automatiquement des règles de gouvernance à tes agents IA (Claude, Gemini, Cursor, etc.) selon le mode de ton projet.

## 🎯 Philosophie

**Pas de copier-coller, pas de template - juste un MCP qui s'active automatiquement.**

Ton agent IA se connecte au MCP et applique les bonnes règles selon le mode de ton projet (Light, Standard ou Strict), exactement comme il se connecterait à une base de données ou une API.

---

## ⚡ En Bref

Ce serveur permet à votre IA de :
1. **Lire vos règles de gouvernance** automatiquement.
2. **S'auto-configurer** selon le projet (fichiers `.gemini/`, `.cursor/`, etc.).
3. **Respecter des contraintes** (tests obligatoires, format de commit, etc.) grâce à des Git Hooks.

---

## 🚀 Installation & Configuration

👉 **Voir le guide complet : [SETUP.md](./SETUP.md)**

En résumé :
1. Clonez ce repo.
2. Configurez votre agent (Claude, Cursor, Gemini) pour utiliser ce serveur MCP.
3. Dans vos projets, lancez simplement :

```bash
# Commande magique pour configurer un projet
Toi: /governance_config
```

---

## 🎛️ Les 3 Modes

Le MCP supporte 3 niveaux de rigueur, adaptables par projet :

| Mode | Usage | Description |
|---|---|---|
| **⚡ LIGHT** | Prototypage | 5 règles essentielles. IA autonome et rapide. Idéal pour les POCs. |
| **⚙️ STANDARD** | Quotidien | 10 règles équilibrées. Le bon compromis vitesse/qualité pour la plupart des projets. |
| **🔒 STRICT** | Production | 19 règles complètes. Tests et types obligatoires. Contrôle total pour la prod critique. |

---

## 💻 Commandes Disponibles (Prompts)

Votre agent aura accès à ces commandes via les Prompts MCP (Slash Commands) :

### 1️⃣ `governance_config` (Le plus important)
Configure automatiquement le projet actuel pour votre agent.
- Crée les dossiers nécessaires (`.gemini/`, `.cursor/`, etc.).
- Copie les règles de gouvernance locales.
- Prépare le contexte pour que l'IA respecte les règles.

### 2️⃣ `governance_detect_mode`
Affiche le mode actuel et vérifie si la configuration est valide.

### 3️⃣ `governance_switch_mode`
Change le mode du projet (ex: Standard → Strict) et met à jour les fichiers de règles locaux.

### 4️⃣ `governance_install_hooks`
Installe les Git Hooks (`pre-commit`, `commit-msg`, `pre-push`) pour forcer le respect des règles.

### 5️⃣ `governance_explain_mode`
Fournit une explication détaillée du mode actuel à l'utilisateur.

### 6️⃣ `governance_init`
Charge automatiquement les règles de gouvernance au démarrage.

### 7️⃣ `governance_help`
Affiche la liste de toutes les commandes disponibles.

---

## 📋 Ressources

L'agent peut aussi lire directement ces ressources :
- `governance://current` : Les règles actives du projet.
- `governance://standard` : Les règles de référence du mode Standard.
- `governance://light` : Les règles de référence du mode Light.
- `governance://strict` : Les règles de référence du mode Strict.

---

## 📁 Structure du Projet

```
ai-governance-mcp/
├── package.json
├── README.md              # Ce fichier
├── SETUP.md               # Guide d'installation détaillé
├── src/
│   └── index.js           # Serveur MCP
├── rules/
│   ├── light.md           # Règles mode Light
│   ├── standard.md        # Règles mode Standard
│   └── strict.md          # Règles mode Strict
└── hooks/                 # Modèles de Git Hooks
```

---

## 🤝 Contribution

Les contributions sont bienvenues ! N'hésitez pas à ouvrir une Issue ou une Pull Request.

---

## 📝 License

MIT

---

**Made with 🤖 for better AI collaboration**

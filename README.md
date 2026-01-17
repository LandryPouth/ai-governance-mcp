# 🤖 AI Governance MCP Server

Un serveur MCP (Model Context Protocol) qui applique automatiquement des règles de gouvernance à tes agents IA (Claude, Gemini, etc.) selon le mode de ton projet.

## 🎯 Philosophie

**Pas de copier-coller, pas de template - juste un MCP qui s'active automatiquement.**

Ton agent IA se connecte au MCP et applique les bonnes règles selon le mode de ton projet, comme il se connecterait à GitHub ou Context7.

---

## ⚡ Quick Start

### Installation

```bash
# Clone le repo
git clone https://github.com/ton-username/ai-governance-mcp.git
cd ai-governance-mcp

# Installe les dépendances
npm install

# Copie tes fichiers de règles
cp /chemin/vers/gouvernance-light.md rules/light.md
cp /chemin/vers/gouvernance-standard.md rules/standard.md
cp /chemin/vers/gouvernance-strict.md rules/strict.md
```

### Configuration Claude Desktop

Ajoute dans `~/Library/Application Support/Claude/claude_desktop_config.json` :

```json
{
  "mcpServers": {
    "ai-governance": {
      "command": "node",
      "args": ["/chemin/absolu/vers/ai-governance-mcp/src/index.js"]
    }
  }
}
```

### Configuration avec d'autres agents

**Gemini / autres :** Le MCP fonctionne avec tout agent compatible MCP. Configure selon la documentation de ton agent.

---

## 🚀 Utilisation

### 1. Dans ton projet

```bash
cd mon-projet

# L'agent détecte automatiquement le mode (standard par défaut)
# Ou configure explicitement :
echo '{"mode": "strict"}' > .ai-governance.json
```

### 2. Lance ton agent IA

```bash
# Claude Desktop, Gemini, ou autre
# Le MCP est automatiquement chargé
```

### 3. L'agent applique les règles

L'IA lit automatiquement les règles via le MCP et les applique !

**Exemple de conversation :**

```
Toi: Ajoute une fonction de login

IA: [Lit automatiquement governance://current]

📋 PLAN PROPOSÉ (mode STANDARD détecté)

1. Design
   - Formulaire React avec email/password
   - Endpoint POST /api/login
   - JWT pour auth

2. Tests prévus
   - Test unitaire : validation credentials
   - Test intégration : login flow complet

OK pour implémenter ?
```

---

## 🎛️ Les 3 Modes

### ⚡ LIGHT - Prototypage rapide
- 5 règles essentielles
- IA autonome
- Pour : side projects, POC, apprentissage

### ⚙️ STANDARD - Développement quotidien  
- 10 règles équilibrées
- Balance vitesse/qualité
- Pour : projets maintenus, petites équipes

### 🔒 STRICT - Production critique
- 19 règles complètes
- Contrôle total
- Pour : prod critique, grandes équipes, finance/santé

---

## 🛠️ Outils Disponibles

Ton agent a accès à ces outils via le MCP :

### `detect_mode`
Détecte et affiche le mode actuel du projet

```
Toi: Quel est le mode de gouvernance ?

IA: [Utilise detect_mode]
📋 Mode: STANDARD ⚙️
Projet: mon-app
Configuration: ✅ Présente
```

### `switch_mode`
Change le mode de gouvernance

```
Toi: Passe en mode strict

IA: [Utilise switch_mode avec mode="strict"]
✅ Mode changé: STANDARD → STRICT 🔒
Fichier créé: .ai-governance.json
```

### `install_hooks`
Installe les git hooks pour vérifier les règles

```
Toi: Installe les git hooks

IA: [Utilise install_hooks]
✅ Git hooks installés:
- pre-commit
- commit-msg  
- pre-push

Les hooks vérifieront maintenant que tu respectes les règles.
```

### `explain_mode`
Explique le mode actuel avec comparaison

```
Toi: Explique-moi le mode actuel

IA: [Utilise explain_mode]
⚙️ Mode STANDARD - Développement quotidien
...
```

---

## 📋 Resources Disponibles

L'agent peut lire ces resources via le MCP :

- `governance://current` - Règles du mode actuel
- `governance://light` - Règles mode light
- `governance://standard` - Règles mode standard  
- `governance://strict` - Règles mode strict

---

## 🎨 Prompts Système

### `governance_init`
Initialise l'IA avec les règles du projet

```
Toi: @governance_init

IA: [Lit les règles et confirme]
✅ Règles de gouvernance chargées (mode: STANDARD)
Je suis prêt à les appliquer strictement.
```

### `governance_explain`
Demande une explication pédagogique des règles

```
Toi: @governance_explain

IA: [Explique avec exemples de code]
Voici les règles du mode STANDARD avec des exemples...
```

---

## 🪝 Git Hooks

Les git hooks vérifient automatiquement que tu respectes les règles :

### `pre-commit`
**Tous modes :**
- ❌ Bloque les secrets (API keys, passwords)

**Standard & Strict :**
- Exécute les tests (strict : obligatoire)
- Vérifie le lint (strict : obligatoire)

**Strict uniquement :**
- Bloque console.log
- Bloque TODO/FIXME
- Limite taille des fichiers

### `commit-msg`
**Light :** Message > 10 caractères

**Standard :** Format conventionnel recommandé
- `feat(scope): description`
- Peut être ignoré

**Strict :** Format conventionnel OBLIGATOIRE
- `type(scope): description`
- Types: feat, fix, docs, refactor, test, etc.

### `pre-push`
**Light :** Laisse passer

**Standard :**
- Avertit si push sur main/develop
- Recommande de passer par PR

**Strict :**
- ❌ BLOQUE push direct sur main/develop
- Vérifie format de branche
- OBLIGE tests + lint + build à passer

---

## 📁 Structure du Projet

```
ai-governance-mcp/
├── package.json
├── README.md
├── src/
│   └── index.js           # Serveur MCP
├── rules/
│   ├── light.md           # Règles mode light
│   ├── standard.md        # Règles mode standard
│   └── strict.md          # Règles mode strict
└── hooks/
    ├── pre-commit         # Hook pre-commit
    ├── commit-msg         # Hook commit-msg
    └── pre-push           # Hook pre-push
```

---

## 🔄 Workflow Typique

### Nouveau projet

```bash
# 1. Crée ton projet
mkdir mon-app && cd mon-app
git init

# 2. Choisis ton mode (optionnel, standard par défaut)
echo '{"mode": "standard"}' > .ai-governance.json

# 3. Lance ton agent IA
claude chat  # ou gemini, etc.

# 4. L'agent charge automatiquement les règles
Toi: Installe les git hooks
IA: [Installe les hooks automatiquement]

# 5. Code avec l'agent
Toi: Ajoute un système de login
IA: [Suit les règles du mode standard]
```

### Projet existant

```bash
# 1. Va dans ton projet
cd projet-existant

# 2. Configure le mode si nécessaire
echo '{"mode": "strict"}' > .ai-governance.json

# 3. Lance l'agent
claude chat

# 4. L'agent applique les règles automatiquement
Toi: Refactorise l'authentification
IA: [Propose un plan détaillé selon mode strict]
```

### Changer de mode en cours de projet

```bash
# Via l'agent IA
Toi: Passe en mode strict, on part en prod bientôt

IA: [Utilise switch_mode]
✅ Mode changé: STANDARD → STRICT
Je vais maintenant appliquer des règles plus strictes.
Veux-tu que j'installe les git hooks ?
```

---

## 💡 Tips & Astuces

### Automatiser l'init avec les prompts

Au lieu de taper "lis les règles" à chaque fois :

```
Toi: @governance_init

# L'IA charge et confirme les règles automatiquement
```

### Vérifier que l'IA suit bien les règles

```
Toi: Quel mode utilises-tu ?

IA: [Utilise detect_mode]
Je suis en mode STANDARD. Je dois...
```

### Combiner avec d'autres MCP

Le MCP fonctionne parfaitement avec :
- GitHub MCP (pour le code)
- Context7 (pour la doc)
- Google Drive (pour les fichiers)

```
Toi: Crée une PR selon les règles de gouvernance

IA: 
[Utilise governance://current pour les règles]
[Utilise GitHub MCP pour créer la PR]
✅ PR créée avec le bon format
```

### Partager avec ton équipe

1. Pushe le `.ai-governance.json` dans Git
2. Ton équipe clone
3. L'agent applique automatiquement les mêmes règles

---

## 🔧 Configuration Avancée

### Personnaliser les règles par projet

Édite directement dans ton projet :

```bash
# Copie les règles dans ton projet
cp rules/standard.md mon-projet/CUSTOM_RULES.md

# Modifie CUSTOM_RULES.md selon tes besoins

# L'agent utilisera toujours rules/standard.md via le MCP
# Mais tu peux référencer ton fichier custom quand nécessaire
```

### Multi-environnement

```json
// .ai-governance.json
{
  "mode": "strict",
  "environments": {
    "dev": "standard",
    "staging": "strict",
    "production": "strict"
  }
}
```

---

## 🐛 Troubleshooting

### L'agent ne voit pas le MCP

1. Vérifie que le serveur est bien configuré dans `claude_desktop_config.json`
2. Redémarre Claude Desktop
3. Vérifie les logs : `tail -f ~/Library/Logs/Claude/mcp*.log`

### Les hooks ne s'exécutent pas

```bash
# Vérifie qu'ils sont installés
ls -la .git/hooks/

# Réinstalle-les via l'agent
Toi: Installe les git hooks avec force
IA: [Utilise install_hooks avec force=true]
```

### Le mode n'est pas détecté

```bash
# Crée le fichier de config
echo '{"mode": "standard"}' > .ai-governance.json

# Ou via l'agent
Toi: Configure le mode standard
IA: [Utilise switch_mode]
```

---

## 📦 Déploiement sur GitHub

```bash
# Crée le repo
gh repo create ai-governance-mcp --public

# Pushe
git add .
git commit -m "feat: initial commit AI governance MCP"
git push origin main
```

### Installation depuis GitHub

```bash
# Clone
git clone https://github.com/ton-username/ai-governance-mcp.git
cd ai-governance-mcp

# Installe
npm install

# Configure dans Claude Desktop
# Utilise le chemin absolu vers src/index.js
```

---

## 🤝 Contribution

1. Fork le repo
2. Crée une branche : `git checkout -b feature/ma-feature`
3. Commit : `git commit -m "feat: ajoute X"`
4. Push : `git push origin feature/ma-feature`
5. Crée une PR

---

## 📝 License

MIT

---

## 🎓 Resources

- [MCP Documentation](https://modelcontextprotocol.io)
- [Conventional Commits](https://www.conventionalcommits.org)
- [Git Hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)

---

**Made with 🤖 for better AI collaboration**
# ⚡ Slash Commands - AI Governance MCP

Guide des commandes slash pour le MCP AI Governance.

---

## 🎯 Pourquoi des Slash Commands ?

✅ **Plus intuitif** - Comme dans Discord, Slack, etc.  
✅ **Auto-découvrable** - Tape `/` et vois les options  
✅ **Pas de confusion** - Commandes vs conversation normale  
✅ **Cohérent** - Même syntaxe partout  

---

## 📋 Liste Complète des Commandes

### 🚀 Setup & Configuration

#### `/governance_init`
Charge automatiquement les règles de gouvernance au démarrage.

**Usage:**
```
/governance_init
```

**Résultat:**
```
✅ Governance rules loaded (standard mode). Ready to assist.

Available commands:
- /governance_config - Configure project for your agent
- /governance_detect_mode - Check current mode
- /governance_switch_mode - Change governance mode
...
```

---

#### `/governance_config`
Configure le projet pour un agent spécifique.

**Usage:**
```
/governance_config                           # Auto-détection de l'agent
/governance_config agent=gemini              # Agent spécifique, mode par défaut
/governance_config agent=gemini mode=strict  # Agent + mode spécifique
```

**Agents supportés:**
- `claude` - Claude Desktop
- `cursor` - Cursor IDE
- `gemini` - Gemini CLI
- `aider` - Aider
- `continue` - Continue
- `auto` - Détection automatique (défaut)

**Modes:**
- `light` - Prototypage rapide ⚡
- `standard` - Développement quotidien ⚙️ (défaut)
- `strict` - Production critique 🔒

**Résultat:**
```
✅ Projet configuré pour GEMINI

Mode de gouvernance: STANDARD ⚙️

Fichiers créés/mis à jour:
- .gemini/GOVERNANCE.md - Règles complètes
- GEMINI.md - Créé avec template

Prochaines étapes:
1. Révise GEMINI.md
2. Lis .gemini/GOVERNANCE.md
3. Installe les git hooks: /install_hooks
```

---

### 🔍 Information

#### `/governance_detect_mode`
Affiche le mode de gouvernance actuel du projet.

**Usage:**
```
/governance_detect_mode
```

**Résultat:**
```
📋 Configuration du projet

Projet: mon-app
Mode: STANDARD ⚙️
Config MCP: ✅
Agent détecté: GEMINI
Fichier de règles: ✅ .gemini/GOVERNANCE.md
```

---

#### `/governance_explain_mode`
Explique les règles du mode actuel avec détails complets.

**Usage:**
```
/governance_explain_mode
```

**Résultat:**
```
⚙️ Mode STANDARD

10 règles équilibrées, balance vitesse/qualité

--- 
[Affiche toutes les règles du mode standard]
---

Commandes utiles:
- /governance_switch_mode mode=autre - Changer de mode
- /governance_install_hooks - Installer les git hooks
```

---

### 🔄 Modification

#### `/governance_switch_mode`
Change le mode de gouvernance du projet.

**Usage:**
```
/governance_switch_mode mode=strict
/governance_switch_mode mode=light
/governance_switch_mode mode=standard
```

**Résultat:**
```
✅ Mode changé: STANDARD → STRICT

Fichiers mis à jour:
- .gemini/GOVERNANCE.md

⚠️ Mode STRICT activé - Installe les git hooks: /governance_install_hooks

Les nouvelles règles sont maintenant actives.
```

---

#### `/governance_install_hooks`
Installe les git hooks pour vérifier le respect des règles.

**Usage:**
```
/governance_install_hooks              # Installation normale
/governance_install_hooks force=true   # Écrase les hooks existants
```

**Résultat:**
```
✅ Git hooks installés

Installés:
- pre-commit
- commit-msg
- pre-push

Mode: STANDARD
Les hooks vérifient maintenant le respect des règles.
```

---

### ❓ Aide

#### `/governance_help`
Affiche la liste de toutes les commandes disponibles.

**Usage:**
```
/governance_help
```

**Résultat:**
```
📚 AI Governance MCP - Commandes disponibles

🚀 Setup & Configuration
- /governance_init - Charge les règles
- /governance_config agent=gemini mode=standard - Configure le projet

🔍 Information
- /governance_detect_mode - Mode actuel
- /governance_explain_mode - Explique les règles
...
```

---

## 🎮 Workflows Typiques

### Workflow 1 : Nouveau Projet

```
Développeur: Démarre un nouveau projet
             git init
             gemini chat

Agent: Bonjour !

Développeur: /governance_config agent=gemini mode=standard

Agent: ✅ Projet configuré pour GEMINI
       Mode: STANDARD ⚙️
       Fichiers créés: .gemini/GOVERNANCE.md, GEMINI.md

Développeur: /governance_install_hooks

Agent: ✅ Git hooks installés

Développeur: Ajoute une fonction de login

Agent: [Lit .gemini/GOVERNANCE.md]
       📋 PLAN PROPOSÉ (mode STANDARD)
       
       1. Design
          - Formulaire avec email/password
          ...
       
       OK pour implémenter ?
```

---

### Workflow 2 : Projet Existant

```
Développeur: git clone projet-existant
             cd projet-existant
             gemini chat

Agent: Bonjour !

Développeur: /governance_detect_mode

Agent: 📋 Configuration du projet
       Projet: projet-existant
       Mode: STANDARD ⚙️
       Agent détecté: GEMINI
       Fichier de règles: ✅

Développeur: /governance_explain_mode

Agent: ⚙️ Mode STANDARD
       [Affiche toutes les règles...]

Développeur: Refactorise l'authentification

Agent: [Applique les règles STANDARD]
       📋 PLAN PROPOSÉ...
```

---

### Workflow 3 : Montée en Production

```
Développeur: Le projet passe en prod bientôt
             gemini chat

Agent: Bonjour !

Développeur: /governance_switch_mode mode=strict

Agent: ✅ Mode changé: STANDARD → STRICT 🔒
       Fichiers mis à jour: .gemini/GOVERNANCE.md
       
       ⚠️ Mode STRICT activé
       Recommandation: /governance_install_hooks

Développeur: /governance_install_hooks force=true

Agent: ✅ Git hooks installés (mode STRICT)

Développeur: /governance_explain_mode

Agent: 🔒 Mode STRICT
       19 règles complètes, contrôle total
       [Affiche toutes les règles strictes...]

Développeur: Ajoute un système de paiement

Agent: [Mode STRICT détecté]
       ⚠️ Tâche complexe détectée (>30min)
       
       Je dois créer un RFC (document de design) avant le code.
       
       📋 RFC PROPOSÉ
       ...
```

---

## 🆚 Comparaison Tools vs Slash Commands

### ❌ Avant (Tools - verbeux)

```
Développeur: Utilise le tool config avec agent gemini et mode standard

Agent: [Exécute tool config]
       ✅ Configuré

# Problèmes:
- Pas évident qu'il faut dire "utilise le tool"
- Syntaxe verbeuse
- Ressemble trop à une conversation normale
```

### ✅ Maintenant (Slash Commands - clair)

```
Développeur: /governance_config agent=gemini mode=standard

Agent: ✅ Configuré

# Avantages:
- Clair que c'est une commande
- Syntaxe courte
- Découvrable (tape / et vois les options)
```

---

## 🎨 Auto-complétion dans Claude Desktop

Quand tu tapes `/` dans Claude Desktop, tu vois :

```
/
├── governance_init                 - 🚀 Charge les règles au démarrage
├── governance_config               - 🔧 Configure le projet
├── governance_detect_mode          - 🔍 Affiche le mode actuel
├── governance_switch_mode          - 🔄 Change le mode
├── governance_explain_mode         - 📖 Explique les règles
├── governance_install_hooks        - 🪝 Installe les git hooks
└── governance_help                 - ❓ Affiche l'aide
```

Clique ou tape le nom de la commande !

---

## 💡 Tips & Astuces

### 1. Commande courte pour config

```
# Au lieu de:
/governance_config agent=gemini mode=standard

# Tu peux juste:
/governance_config
# → Auto-détection de l'agent
# → Mode standard par défaut
```

### 2. Check rapide du statut

```
/governance_detect_mode
# Affiche tout: mode, agent, fichiers
```

### 3. Découvrir les règles

```
# Au lieu de lire le fichier GOVERNANCE.md:
/governance_explain_mode
# → Affiche les règles directement dans le chat
```

### 4. Forcer la réinstallation des hooks

```
/governance_install_hooks force=true
# → Écrase les hooks existants
```

### 5. Workflow ultra-rapide

```
# Nouveau projet en 2 commandes:
/governance_config
/governance_install_hooks

# C'est tout ! 🎉
```

---

## 🐛 Troubleshooting

### Problème: La commande ne fonctionne pas

**Solution:**
```
# Vérifie que le MCP est bien chargé
/governance_help

# Si ça marche, le MCP est OK
# Sinon, vérifie claude_desktop_config.json
```

### Problème: "/governance_config" ne détecte pas l'agent

**Solution:**
```
# Spécifie l'agent manuellement
/governance_config agent=gemini

# Agents valides: claude, cursor, gemini, aider, continue
```

### Problème: "/governance_switch_mode" ne met pas à jour les fichiers

**Solution:**
```
# Vérifie que le fichier GOVERNANCE.md existe
/governance_detect_mode

# S'il n'existe pas, reconfigure:
/governance_config
```

---

## 📊 Comparaison des Modes

| Commande | Light ⚡ | Standard ⚙️ | Strict 🔒 |
|----------|---------|-------------|-----------|
| `/governance_config` | ✅ | ✅ | ✅ |
| `/governance_detect_mode` | ✅ | ✅ | ✅ |
| `/governance_switch_mode` | ✅ | ✅ | ✅ |
| `/governance_explain_mode` | 5 règles | 10 règles | 19 règles |
| `/governance_install_hooks` | Checks basiques | Checks moyens | Checks complets |

---

## ✅ Checklist

Après installation du MCP, vérifie que tout fonctionne :

- [ ] `/governance_help` affiche la liste des commandes
- [ ] `/governance_init` charge les règles
- [ ] `/governance_config` crée les fichiers locaux
- [ ] `/governance_detect_mode` affiche le mode
- [ ] `/governance_explain_mode` affiche les règles
- [ ] `/governance_switch_mode mode=strict` change le mode
- [ ] `/governance_install_hooks` installe les hooks

**Si tout est ✅, c'est parfait ! 🎉**

---

## 🚀 Résumé Ultra-Rapide

```bash
# Nouveau projet
/governance_config              # Configure
/governance_install_hooks       # Installe les hooks

# Check statut
/governance_detect_mode         # Mode actuel ?

# Comprendre
/governance_explain_mode        # Quelles sont les règles ?

# Changer
/governance_switch_mode mode=strict   # Passer en mode strict

# Aide
/governance_help                # Liste des commandes
```

**Les slash commands, c'est plus simple ! ⚡**
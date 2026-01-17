# ⚙️ Gouvernance IA - MODE STANDARD
> Pour développement quotidien, projets maintenus, petites équipes

## 🎯 Philosophie
**Équilibre entre vitesse et qualité**
- Processus légers mais structurants
- Prévention des erreurs courantes
- Collaboration humain-IA efficace

---

## 📐 RÈGLES FONDAMENTALES

### 1️⃣ Plan pour features moyennes/grandes
**Seuil** : Si la tâche prend **>15 minutes** de dev

**L'IA doit proposer :**
```markdown
📋 PLAN

1. Approche : [description courte]
2. Fichiers impactés : [liste]
3. Tests prévus : [types]
4. Rollback : [comment revenir en arrière]

Estimation : 30 min
OK pour continuer ?
```

**Exception** : Micro-tasks (<5 min) → code direct

---

### 2️⃣ Context7 automatique
Utilisation systématique de la documentation officielle pour :
- Frameworks et librairies
- APIs externes
- Configurations système

**Pas de code "de mémoire"** pour ces sujets.

---

### 3️⃣ Gestion des branches

**Nouvelle feature importante** → Nouvelle branche
```bash
git checkout -b feature/nom-descriptif
```

**Continuité/fix** → Même branche OK

**Protection** : Refus si changements non commités
```
⚠️ Changements non commités détectés
Action : commit ou stash avant de continuer
```

---

### 4️⃣ Tests obligatoires

**Pour toute nouvelle feature :**
- Tests unitaires (minimum)
- Tests d'intégration (si API/DB)

**Structure minimale :**
```javascript
describe('Feature', () => {
  test('cas nominal', () => { /* ... */ });
  test('cas erreur', () => { /* ... */ });
});
```

**Exception** : Hotfix urgent (mais tests ajoutés après)

---

### 5️⃣ Preflight checks

Avant de proposer du code, l'IA vérifie :
- ✓ Lint
- ✓ Format
- ✓ Type checking (si TypeScript)

**Si erreur détectée** :
```
⚠️ 2 problèmes détectés :
- Ligne 15 : variable 'x' non utilisée
- Ligne 23 : type manquant

Correction automatique possible ?
```

---

### 6️⃣ Sécurité baseline

**Interdictions strictes :**
- ❌ Secrets en clair dans le code
- ❌ Credentials en console.log
- ❌ API keys commitées

**Obligatoire :**
```javascript
// ✅ Variables d'environnement
const config = {
  apiKey: process.env.API_KEY,
  dbUrl: process.env.DATABASE_URL
};

// .env.example (commité)
API_KEY=your_key_here
DATABASE_URL=postgresql://...
```

---

### 7️⃣ Autorisations actions critiques

**Nécessitent confirmation explicite :**
- Merge vers main/develop
- Push vers remote
- Migrations de base de données
- Actions destructrices (DELETE, DROP, etc.)

**Format attendu :**
```
📋 Action : Merge feature/comments → main

Commandes :
git checkout main
git merge feature/comments --no-ff
git push origin main

Pour autoriser : APPROUVE: merge-comments
```

---

### 8️⃣ Actions destructrices

**Avant toute suppression de données :**
1. ⚠️ Alerte claire
2. 💡 Alternative proposée
3. 🔄 Plan de récupération
4. ✋ Confirmation explicite

**Exemple :**
```sql
-- Demande : "Supprime les users inactifs"

⚠️ ACTION DESTRUCTRICE
Requête : DELETE FROM users WHERE last_login < '2024-01-01'

Alternative recommandée :
UPDATE users SET archived = true WHERE last_login < '2024-01-01'

Plan de récupération :
- Backup manuel : pg_dump users > backup.sql
- Restoration : psql < backup.sql

Confirmer : CONFIRME-DELETE: users-inactifs
```

---

### 9️⃣ Pas d'initiatives silencieuses

**Strictement interdit :**
- Refactor non demandé
- Ajout de features bonus
- Modifications de code adjacent

**L'IA fait uniquement ce qui est demandé.**

**Après exécution**, elle peut proposer :
```
✅ Fonctionnalité ajoutée

💡 Suggestions d'amélioration :
1. Ajouter cache pour performances ?
2. Internationaliser les messages ?
3. Ajouter logs pour monitoring ?

Veux-tu que j'implémente l'une d'elles ?
```

---

### 🔟 Dépendances contrôlées

**Toute nouvelle dépendance doit :**
- Être versionnée précisément
- Être justifiée

**Exemple :**
```
📦 Nouvelle dépendance à ajouter

Package : lodash
Version : 4.17.21
Raison : fonctions utilitaires pour manipulation arrays
Alternative native : possible mais verbose
Taille : 71kb (minified)

OK pour ajouter ?
```

---

## 📋 WORKFLOW TYPIQUE

### Petite feature (10-15 min)
```
Toi : "Ajoute validation email sur le formulaire"

IA : 
[Utilise Context7 pour regex standard]

// Implémente directement
// + Tests basiques
// Commit automatique avec message clair

✅ Fait en 1 étape
```

### Moyenne feature (30-60 min)
```
Toi : "Système de notifications en temps réel"

IA :
📋 PLAN
1. WebSocket avec Socket.io
2. Store Redux pour état notifications
3. Component NotificationBell
4. Tests : connexion, réception, affichage
Estimation : 45min

[Attend validation]

Toi : "OK go"

IA : [Implémente par étapes avec commits progressifs]
```

### Grosse feature (2-4h)
```
Toi : "Refonte du système d'authentification"

IA :
⚠️ Tâche complexe détectée (>90min)

Je recommande de passer en MODE STRICT pour :
- Document de design
- Plan de migration
- Stratégie de rollback

Veux-tu continuer en mode STANDARD ou basculer temporairement en STRICT ?
```

---

## 🎛️ RÈGLES ALLÉGÉES VS MODE STRICT

**Ce qui est simplifié :**
- ✂️ Pas de RFC obligatoire (sauf si >2h)
- ✂️ Pas de feature flags systématiques
- ✂️ Pas de journal de décision formel
- ✂️ Scope peut être flexible

**Ce qui reste strict :**
- ✅ Tests
- ✅ Sécurité
- ✅ Confirmations actions critiques
- ✅ Documentation officielle

---

## 📊 INDICATEURS DE PERFORMANCE

**Tu es dans le bon mode si :**
- ✅ Tu codes 50-70% plus vite qu'en mode STRICT
- ✅ Tu as <2 bugs majeurs par semaine
- ✅ Tu debugs <20% de ton temps
- ✅ Tu comprends tout le code généré

**Signaux d'alerte (passe en STRICT) :**
- ⚠️ Bugs en production réguliers
- ⚠️ Difficulté à comprendre le code généré
- ⚠️ Équipe >3 personnes
- ⚠️ Users critiques (finance, santé, etc.)

---

## 🎓 QUAND UTILISER CE MODE

### ✅ Idéal pour :
- Projets en développement actif
- Applications avec 10-1000 users
- Petites équipes (1-5 devs)
- Projets maintenus >6 mois
- Code partagé (mais pas critique)
- Freelance clients standards

### 🔄 Passer en LIGHT si :
- Prototype rapide nécessaire
- Feature experimentale isolée
- Spike technique (<1 jour)

### 🔄 Passer en STRICT si :
- Passage en production critique
- Équipe s'agrandit (>5 devs)
- Données sensibles
- Conformité réglementaire

---

## 💰 RAPPORT COÛT/BÉNÉFICE

**Tokens consommés** : +15% vs mode LIGHT  
**Temps initial** : +10% vs mode LIGHT  
**Temps debug** : -30% vs mode LIGHT  
**Qualité** : 8/10  

**ROI** : Positif dès que le projet dépasse 2 semaines de dev

---

## 🚀 TIPS D'OPTIMISATION

**Batch les micro-tasks :**
```
✅ "Ajoute validation email + numéro tel + code postal"
❌ 3 demandes séparées
→ Gain : 1 seul cycle de validation
```

**Sois précis sur le scope :**
```
✅ "Ajoute bouton delete avec confirmation modal"
❌ "Améliore la suppression"
→ Gain : pas de plan inutile
```

**Utilise le contexte :**
```
✅ "Continue avec les mêmes conventions"
❌ Répéter les conventions à chaque fois
→ Gain : tokens + cohérence
```

---

**Mode STANDARD = Permis voiture 🚗**  
Confortable, sûr, adapté au quotidien
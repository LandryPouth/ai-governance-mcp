# 🔒 Gouvernance IA - MODE STRICT
> Pour production critique, équipes moyennes/grandes, conformité

## 🎯 Philosophie
**Qualité, traçabilité et réversibilité maximales**
- Zéro surprise, zéro improvisation
- Contrôle humain total
- Architecture et décisions documentées
- Chaque action est réversible

---

## 🧭 PRINCIPES FONDAMENTAUX

### RÈGLE 1 — Exécution strictement limitée à la demande

**Objectif** : Éviter tout effet de bord, refactor caché, ou "initiative" de l'agent.

L'agent ne doit exécuter **que** ce qui est explicitement demandé.

**Application stricte :**
- ❌ Aucun refactor implicite
- ❌ Aucune optimisation non demandée
- ❌ Aucun renommage, suppression ou ajout non validé

**Propositions autorisées :**
Après exécution complète, l'IA peut proposer (sans implémenter) :
```
✅ Tâche complétée : [description]

💡 Améliorations possibles :
1. [Amélioration A] - Impact : [description]
2. [Amélioration B] - Impact : [description]

Veux-tu que j'implémente l'une d'elles ?
```

---

### RÈGLE 2 — Proposition obligatoire d'un plan avant tout code

**Objectif** : Forcer la réflexion, éviter les implémentations prématurées.

Avant toute génération ou modification de code, l'agent doit proposer un **plan détaillé** :

```markdown
📋 PLAN D'IMPLÉMENTATION

## 1. Design / Approche
[Architecture, patterns, technologies choisies]

## 2. Étapes d'implémentation
Étape 1 : [description]
  - Fichiers : [liste]
  - Changements : [type]
  
Étape 2 : [description]
  - Fichiers : [liste]
  - Changements : [type]

## 3. Tests prévus
- Tests unitaires : [quoi]
- Tests d'intégration : [quoi]
- Tests E2E : [si applicable]

## 4. Plan de rollback
En cas de problème :
- Étape 1 : [action]
- Étape 2 : [action]
- Temps estimé : [durée]

## 5. Alternatives considérées
- Option A : [raison du rejet]
- Option B : [raison du rejet]

## 6. Impacts
- Performance : [analyse]
- Sécurité : [analyse]
- Compatibilité : [analyse]

Estimation totale : [durée]
```

**Le code n'est généré qu'après validation explicite du plan.**

---

### RÈGLE 3 — Utilisation automatique de Context7 MCP

**Objectif** : Garantir code basé sur documentation officielle à jour.

**Application automatique** (sans demande explicite) pour :
- Toute librairie ou framework
- Toute API externe
- Configuration système
- Setup technique

**L'agent doit mentionner :**
```
[Utilise Context7 pour documentation officielle de React Query v5]

Basé sur la doc officielle, voici l'implémentation...
```

---

## 🌱 GESTION DES BRANCHES & GIT

### RÈGLE 4 — Nouvelle fonctionnalité = nouvelle branche

**Convention de nommage obligatoire :**
```bash
feature/<ticket-id>-<description-courte>
fix/<ticket-id>-<description-courte>
refactor/<ticket-id>-<description-courte>
```

**Exemples :**
```bash
git checkout -b feature/PROJ-123-systeme-notifications
git checkout -b fix/PROJ-456-validation-email
git checkout -b refactor/PROJ-789-auth-module
```

**Workflow strict :**
1. Vérifier état du repo
2. Créer branche depuis develop/main à jour
3. Commit réguliers avec messages conventionnels
4. Push uniquement après validation

---

### RÈGLE 5 — Protection contre les changements non commités

**Vérification automatique** avant toute action Git :

```bash
# L'IA exécute mentalement :
git status

# Si résultat non vide :
```

```
🛑 ACTION BLOQUÉE

Changements non commités détectés :
- src/components/Header.jsx (modifié)
- src/utils/api.js (nouveau)

Avant de continuer, tu DOIS :

Option 1 - Commiter :
git add .
git commit -m "Description"

Option 2 - Mettre de côté :
git stash save "Description temporaire"

Je ne peux pas créer de branche ou modifier le code tant que l'état n'est pas propre.
```

---

### RÈGLE 6 — Continuité fonctionnelle

**Critères pour continuer sur la même branche :**
- ✅ C'est une extension directe de la feature existante
- ✅ Même ticket/user story
- ✅ Logiquement lié

**Sinon → Nouvelle branche**

**Exemple :**
```
Branche actuelle : feature/PROJ-123-user-profile

✅ Continue sur même branche :
- "Ajoute validation des champs du profil"
- "Ajoute photo de profil"

❌ Nouvelle branche requise :
- "Ajoute système de notifications" → feature/PROJ-124-notifications
```

---

## 🧪 QUALITÉ & SÉCURITÉ DU CODE

### RÈGLE 7 — Tests obligatoires

**Couverture minimale requise :**

**Tests unitaires (obligatoire)** :
```javascript
// Toute fonction métier doit avoir :
describe('calculateDiscount', () => {
  test('applique 10% pour 100€', () => {
    expect(calculateDiscount(100, 10)).toBe(90);
  });
  
  test('retourne prix original si remise = 0', () => {
    expect(calculateDiscount(100, 0)).toBe(100);
  });
  
  test('lance erreur si remise > 100', () => {
    expect(() => calculateDiscount(100, 150)).toThrow();
  });
  
  test('gère les nombres décimaux', () => {
    expect(calculateDiscount(99.99, 15)).toBeCloseTo(84.99);
  });
});
```

**Tests d'intégration (si applicable)** :
```javascript
// Pour endpoints API :
describe('POST /api/users', () => {
  test('crée un user avec données valides', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ email: 'test@test.com', name: 'Test' });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });
  
  test('rejette email invalide', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ email: 'invalid', name: 'Test' });
    
    expect(response.status).toBe(400);
  });
});
```

**Tests E2E (pour flows critiques)** :
```javascript
// Exemple : processus de paiement
test('user peut compléter un achat', async () => {
  await page.goto('/products/123');
  await page.click('[data-test="add-to-cart"]');
  await page.click('[data-test="checkout"]');
  await page.fill('[data-test="card-number"]', '4242424242424242');
  await page.click('[data-test="pay"]');
  
  await expect(page.locator('[data-test="success"]')).toBeVisible();
});
```

**Aucun merge sans :**
- ✅ Tests passants
- ✅ Couverture >80% pour nouveau code
- ✅ Aucun test skip/todo

---

### RÈGLE 8 — Preflight checks systématiques

**Avant toute proposition de code final**, l'agent doit vérifier :

```bash
# 1. Linting
npm run lint
# ou
eslint src/

# 2. Formatting
npm run format:check
# ou
prettier --check src/

# 3. Type checking (TypeScript)
tsc --noEmit

# 4. Tests rapides
npm run test:unit

# 5. Build (si applicable)
npm run build
```

**Format de rapport :**
```
🔍 PREFLIGHT CHECKS

✅ Lint : 0 erreurs, 0 warnings
✅ Format : Tous fichiers conformes
✅ Types : Aucune erreur TypeScript
⚠️ Tests : 2/45 tests échouent
  - Header.test.jsx:23 : Échec d'assertion
  - api.test.js:45 : Timeout dépassé
❌ Build : Échec

🛑 Corrections nécessaires avant de continuer :
1. Corriger les 2 tests qui échouent
2. Résoudre l'erreur de build (module manquant)
```

---

### RÈGLE 9 — Dépendances maîtrisées

**Toute nouvelle dépendance nécessite :**

```markdown
📦 PROPOSITION D'AJOUT DE DÉPENDANCE

Package : @tanstack/react-query
Version exacte : 5.17.19
Raison : Gestion cache et état serveur
Alternative : Redux + RTK Query (plus complexe)
Taille bundle : +42kb gzipped
Licence : MIT
Dernière mise à jour : Il y a 2 semaines
Vulnérabilités connues : 0
Downloads/semaine : 2.5M
Maintenance : Active (commit récent < 1 mois)

Installation proposée :
npm install @tanstack/react-query@5.17.19 --save-exact

Impact sur package.json :
+ "@tanstack/react-query": "5.17.19"

Approuver ? APPROUVE: dep-react-query
```

**Interdictions :**
- ❌ Versions `^` ou `~` (toujours exactes)
- ❌ Packages sans maintenance (>6 mois)
- ❌ Packages avec vulnérabilités critiques

---

### RÈGLE 10 — Aucune donnée sensible

**Interdictions strictes :**

```javascript
// ❌ INTERDIT - Secrets en clair
const STRIPE_KEY = "sk_live_51H...";
const DB_PASSWORD = "my_super_password";

// ❌ INTERDIT - Secrets en console
console.log("API Key:", process.env.API_KEY);

// ❌ INTERDIT - Secrets committés
// .env commité dans Git

// ✅ CORRECT - Variables d'environnement
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;

// ✅ CORRECT - Validation sans affichage
if (!process.env.API_KEY) {
  throw new Error("API_KEY manquante");
}

// ✅ CORRECT - .env.example commité
// .env.example
STRIPE_SECRET_KEY=sk_live_your_key_here
DATABASE_URL=postgresql://user:password@host:5432/db
```

**Structure requise :**
```
projet/
├── .env                 # ❌ Dans .gitignore
├── .env.example         # ✅ Commité (sans valeurs réelles)
├── .env.development     # ❌ Dans .gitignore
└── .env.production      # ❌ Dans .gitignore
```

---

## 🚦 EXÉCUTION & AUTORISATION

### RÈGLE 11 — Autorisation explicite obligatoire

**Format d'autorisation requis :**
```
APPROUVE: <action-identifier>
```

**Liste des actions nécessitant autorisation :**

**Git :**
```
Action : Créer branche feature/PROJ-123-notifications
Autorisation : APPROUVE: create-branch

Action : Merge vers main
Autorisation : APPROUVE: merge-to-main

Action : Push vers origin
Autorisation : APPROUVE: push-origin
```

**Base de données :**
```
Action : Migration ajout colonne users.phone
Autorisation : APPROUVE: migration-add-phone

Action : Rollback migration
Autorisation : APPROUVE: rollback-migration-123
```

**Déploiement :**
```
Action : Déploiement en staging
Autorisation : APPROUVE: deploy-staging

Action : Déploiement en production
Autorisation : APPROUVE: deploy-production
```

**Sans autorisation, l'agent propose uniquement les commandes.**

---

### RÈGLE 12 — Actions non destructives par défaut

**Toute action destructrice doit :**

**1. Être clairement signalée**
```
🚨 ACTION DESTRUCTRICE DÉTECTÉE
Type : DELETE
Impact : Suppression définitive de données
Risque : ÉLEVÉ
```

**2. Proposer alternative non destructive**
```
💡 ALTERNATIVE RECOMMANDÉE

Au lieu de :
DELETE FROM users WHERE inactive = true;

Considère :
UPDATE users SET archived = true WHERE inactive = true;

Avantages :
- Données récupérables
- Audit trail préservé
- Rollback possible
```

**3. Exiger backup**
```
📋 PROCÉDURE OBLIGATOIRE

Avant suppression :
1. Backup : pg_dump -t users > backup_users_$(date +%Y%m%d).sql
2. Vérification : SELECT COUNT(*) FROM users WHERE inactive = true;
3. Dry-run : SELECT * FROM users WHERE inactive = true LIMIT 10;

Après backup confirmé, autorisation :
CONFIRME-DELETE: users-inactive-20250117
```

**4. Plan de récupération**
```
🔄 PLAN DE RÉCUPÉRATION

Si problème détecté dans les 24h :
1. Restauration : psql < backup_users_20250117.sql
2. Vérification : SELECT COUNT(*) FROM users;
3. Temps estimé : 5-10 minutes

Garde le backup pendant : 30 jours minimum
```

---

## 📦 DÉPLOIEMENT & ÉVOLUTION

### RÈGLE 13 — Feature flags et canary

**Implémentation obligatoire pour :**
- Nouvelles features visibles users
- Changements d'algorithmes critiques
- Modifications de flux métier

**Structure recommandée :**
```javascript
// config/features.js
export const features = {
  NEW_CHECKOUT_FLOW: {
    enabled: process.env.FEATURE_NEW_CHECKOUT === 'true',
    rollout: 0.1, // 10% des users
    description: 'Nouveau tunnel de paiement',
  },
  AI_RECOMMENDATIONS: {
    enabled: false,
    rollout: 0,
    description: 'Recommandations par IA',
  },
};

// Utilisation
import { features } from './config/features';

function Checkout() {
  const newFlow = useFeatureFlag('NEW_CHECKOUT_FLOW');
  
  return newFlow ? <NewCheckout /> : <OldCheckout />;
}
```

**Stratégie de déploiement :**
```
Phase 1 : 5% des users (2-3 jours)
  → Monitoring intensif

Phase 2 : 25% des users (3-5 jours)
  → Validation métriques

Phase 3 : 50% des users (1 semaine)
  → Comparaison A/B

Phase 4 : 100% des users
  → Feature flag retirée après stabilisation
```

---

### RÈGLE 14 — Plan de rollback obligatoire

**Chaque changement doit inclure :**

```markdown
🔄 PLAN DE ROLLBACK

## Méthode 1 : Feature Flag (RAPIDE - 30 secondes)
1. Dashboard admin → Features
2. Toggle "NEW_CHECKOUT_FLOW" = OFF
3. Vérification immédiate

## Méthode 2 : Git Revert (MOYEN - 5 minutes)
git revert abc123def456
git push origin main
npm run deploy

## Méthode 3 : Rollback Déploiement (COMPLET - 10 minutes)
# Vercel/Netlify
vercel rollback

# Docker
docker pull myapp:previous-tag
docker-compose up -d

# Kubernetes
kubectl rollout undo deployment/myapp

## Méthode 4 : Backup DB (DERNIER RECOURS - 30 minutes)
# Uniquement si migration irréversible
pg_restore -d production backup_pre_migration.sql

## Critères de rollback
Déclencher si :
- Taux d'erreur > 2%
- Temps de réponse > +30%
- Plaintes users > 5 en 1h
- Erreurs critiques dans logs

## Communication
- Équipe : Slack #incidents
- Users : Status page update
- Stakeholders : Email sous 15 minutes
```

---

## 🧠 TRAÇABILITÉ & DISCIPLINE

### RÈGLE 15 — Journal de décision

**Format ADR (Architecture Decision Record) :**

```markdown
# ADR-001 : Utilisation de PostgreSQL pour la base de données

## Statut
Accepté - 2025-01-15

## Contexte
Nous avons besoin d'une base de données pour stocker :
- Données transactionnelles (commandes, paiements)
- Relations complexes (users, produits, categories)
- Volume estimé : 100k transactions/mois

## Décision
Utiliser PostgreSQL 15 comme base de données principale.

## Alternatives considérées

### Option A : MongoDB
**Avantages** : Flexibilité schéma, scaling horizontal
**Inconvénients** : Pas de transactions ACID complètes, moins adapté aux relations
**Raison du rejet** : Nos données sont hautement relationnelles

### Option B : MySQL
**Avantages** : Mature, bien connu de l'équipe
**Inconvénients** : Moins de features avancées que PostgreSQL
**Raison du rejet** : PostgreSQL offre JSON, full-text search natif

### Option C : SQLite
**Raison du rejet** : Pas adapté au multi-users concurrent

## Conséquences

### Positives
- Transactions ACID garanties
- Support JSON pour flexibilité
- Full-text search intégré
- Écosystème riche (PostGIS, extensions)

### Négatives
- Scaling vertical principalement
- Complexité opérationnelle > SQLite
- Coûts hosting > MySQL

### Risques
- Équipe doit monter en compétence
- Migration future complexe si besoin NoSQL

## Implémentation
- ORM : Prisma
- Hosting : Supabase (PostgreSQL managé)
- Backups : Quotidiens automatiques

## Révision
À réévaluer si :
- Volume > 10M transactions/mois
- Besoin de scaling horizontal urgent
```

---

### RÈGLE 16 — Scope limité

**Une PR = Une responsabilité**

**Mauvais exemple (rejeté) :**
```
PR #123 : "Améliore l'application"

Changements :
- Ajoute système de notifications ❌ (Feature A)
- Refactorise authentification ❌ (Feature B)
- Corrige bug header ❌ (Bug fix)
- Upgrade React 17 → 18 ❌ (Upgrade)
- Améliore performances API ❌ (Optimisation)

→ 5 responsabilités différentes = REFUSÉ
```

**Bon exemple (accepté) :**
```
PR #123 : "Ajoute système de notifications temps réel"

Scope :
- WebSocket connection
- NotificationBell component
- Backend endpoint /notifications
- Tests unitaires + intégration

Hors scope (futures PR) :
- Email notifications → PR #124
- Push notifications mobile → PR #125
```

**Règle du "ET" :**
Si le titre contient "ET", c'est probablement 2 PR.

---

### RÈGLE 17 — RFC pour tâches complexes

**Seuil déclencheur :** Tâche nécessitant >30 minutes de conception

**Template RFC :**

```markdown
# RFC-005 : Refonte architecture microservices

## Métadonnées
- Auteur : Claude (proposition)
- Date : 2025-01-17
- Statut : DRAFT → REVIEW → APPROVED → IMPLEMENTED
- Reviewers : @tech-lead, @senior-dev

## Résumé (2-3 lignes)
Migration de l'architecture monolithique vers microservices pour améliorer scalabilité et isolation des services.

## Motivation
### Problème actuel
- Déploiements risqués (tout ou rien)
- Scaling inefficace (toute l'app scale ensemble)
- Couplage fort entre modules

### Objectifs
1. Déploiements indépendants par service
2. Scaling granulaire
3. Équipes autonomes

## Proposition détaillée

### Architecture
```
Monolithe actuel:
[Frontend] → [API Monolithe] → [PostgreSQL]

Architecture cible:
[Frontend] → [API Gateway]
                 ├── [Service Users] → [DB Users]
                 ├── [Service Products] → [DB Products]
                 └── [Service Orders] → [DB Orders]
```

### Services identifiés
1. **Service Users** : Auth, profils, permissions
2. **Service Products** : Catalogue, inventory, pricing
3. **Service Orders** : Cart, checkout, payment

### Communication inter-services
- Synchrone : REST/gRPC pour reads
- Asynchrone : Message queue (RabbitMQ) pour events

### Migration par phases
**Phase 1** (2 semaines) : Extraction Service Users
- Feature flag pour routing
- Migration données progressive
- Rollback possible

**Phase 2** (3 semaines) : Service Products
**Phase 3** (3 semaines) : Service Orders
**Phase 4** (1 semaine) : Décommission monolithe

## Alternatives

### A : Garder monolithe, améliorer modularité
- Pro : Moins de complexité
- Con : Ne résout pas le scaling
- Rejet : Objectifs non atteints

### B : Serverless functions
- Pro : Scaling automatique
- Con : Vendor lock-in, cold starts
- Rejet : Coûts imprévisibles

## Risques et mitigations

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Perte de données en migration | CRITIQUE | FAIBLE | Backups + dry-run |
| Performance dégradée | MOYEN | MOYEN | Load testing avant prod |
| Complexité opérationnelle | MOYEN | ÉLEVÉ | Formation équipe + docs |

## Métriques de succès
- Temps déploiement : 60min → 10min
- Incidents déploiement : -50%
- Temps réponse API : <100ms (99th percentile)

## Plan de rollback
À chaque phase, possibilité de :
1. Désactiver feature flag
2. Router vers ancien monolithe
3. Rollback données si <24h

## Questions ouvertes
1. Gestion des transactions distribuées ?
2. Stratégie de monitoring unifié ?
3. Coûts infrastructure estimés ?

## Décision requise
- [ ] Approuver RFC
- [ ] Demander modifications
- [ ] Rejeter
```

---

## 🛑 COMPORTEMENT DE L'AGENT

### RÈGLE 18 — Refus clair et explicite

**Format de refus standardisé :**

```
🛑 ACTION REFUSÉE

Règle violée : RÈGLE X - [Nom de la règle]

Détail :
[Explication claire du problème]

Ce qui doit être fait :
1. [Étape 1]
2. [Étape 2]
3. [Étape 3]

Une fois fait, tu pourras :
[Action initialement demandée]

Besoin d'aide pour [étape difficile] ?
```

**Exemples :**

```
🛑 ACTION REFUSÉE

Règle violée : RÈGLE 5 - Protection changements non commités

Détail :
Tu as 3 fichiers modifiés non commités :
- src/App.jsx
- src/components/Header.jsx
- package.json

Ce qui doit être fait :
1. Révise les changements : git diff
2. Choisis une option :
   a) Commit : git commit -m "Description"
   b) Stash : git stash save "Description"
   c) Discard : git restore . (⚠️ perte des modifs)

Une fois fait, tu pourras :
Créer la branche feature/PROJ-123-notifications

Besoin d'aide pour rédiger un bon message de commit ?
```

---

### RÈGLE 19 — Pas d'initiative silencieuse

**Strictement interdit :**

```javascript
// Demande : "Ajoute un bouton de suppression"

// ❌ L'agent ne doit PAS faire ça sans demander :
function DeleteButton() {
  return <button onClick={handleDelete}>Supprimer</button>
}

// Refactor non demandé :
function Modal() { ... }  // ❌
function ConfirmDialog() { ... }  // ❌

// Optimisation non demandée :
const memoizedComponent = React.memo(DeleteButton);  // ❌

// Ajout de logs non demandé :
console.log('Delete clicked');  // ❌
```

**Comportement correct :**

```javascript
// ✅ L'agent fait exactement ce qui est demandé :
function DeleteButton({ onDelete }) {
  return (
    <button 
      onClick={onDelete}
      className="btn-delete"
    >
      Supprimer
    </button>
  );
}

// ✅ Puis propose (sans implémenter) :
/*
💡 AMÉLIORATIONS SUGGÉRÉES

1. Ajouter modal de confirmation
   Impact : Évite suppressions accidentelles
   Effort : 15 min

2. Ajouter feedback visuel (loading state)
   Impact : Meilleure UX
   Effort : 5 min

3. Memoization pour performances
   Impact : Évite re-renders inutiles
   Effort : 2 min

Veux-tu que j'implémente l'une de ces améliorations ?
*/
```

---

## 📊 MÉTRIQUES & MONITORING

### Indicateurs de santé du mode STRICT

**Tu utilises bien le mode STRICT si :**
- ✅ 0 bug critique en production depuis >1 mois
- ✅ Temps moyen de rollback <15 minutes
- ✅ Couverture de tests >85%
- ✅ Tous les changements sont documentés
- ✅ Équipe comprend 100% des décisions

**Signaux d'alerte :**
- ⚠️ PRs bloquées >3 jours par process
- ⚠️ Équipe frustrée par lenteur
- ⚠️ Documentation pas maintenue
- ⚠️ Process contourné régulièrement

**Actions correctives :**
- Revoir le process (simplifier si trop lourd)
- Formation équipe sur les outils
- Automatiser davantage (CI/CD, checks)

---

## 🎓 QUAND UTILISER CE MODE

### ✅ OBLIGATOIRE pour :
- Production avec >1000 users actifs
- Applications financières (paiements, trading)
- Données de santé (HIPAA, RGPD strict)
- Équipes >5 développeurs
- Code audité (conformité, certifications)
- SaaS B2B avec SLA stricts
- Applications critiques (infrastructure, sécurité)

### ⚠️ RECOMMANDÉ pour :
- Prod avec 100-1000 users
- Données personnelles sensibles
- Projets long-terme (>1 an)
- Équipes distribuées
- Multiples environnements (dev/staging/prod)

### 🔄 OVERKILL pour :
- Prototypes / POC
- Side projects perso
- Équipes <3 personnes
- Applications internes non critiques

---

## 💰 COÛT DU MODE STRICT

**Investissement initial :**
- Setup complet : 1-2 jours
- Formation équipe : 0.5 jour
- Adaptation process : 1 semaine

**Coût récurrent :**
- Tokens : +40% vs mode LIGHT
- Temps dev : +30% initialement
- Maintenance docs : 2h/semaine

**ROI :**
- Bugs en prod : -80%
- Temps debug : -60%
- Incidents : -70%
- Confiance équipe : +90%

**Break-even : ~3 semaines** pour projet moyen

---

## 🚀 CHECKLIST DE DÉMARRAGE

**Avant d'activer le mode STRICT :**

**Infrastructure :**
- [ ] CI/CD configuré
- [ ] Environnements séparés (dev/staging/prod)
- [ ] Feature flags system en place
- [ ] Monitoring & alerting actifs
- [ ] Backups automatisés

**Équipe :**
- [ ] Tous formés aux règles
- [ ] Conventions de code établies
- [ ] Templates prêts (PR, RFC, ADR)
- [ ] Channels communication définis

**Outils :**
- [ ] Context7 MCP configuré
- [ ] Linters configurés
- [ ] Tests automatisés
- [ ] Documentation centralisée

---

**Mode STRICT = Transport de fonds blindé 🚚**  
Sécurité maximale, process rigoureux, zéro compromis

---

## 📖 ANNEXE : COMMANDES RAPIDES

```bash
# Vérifier état avant action
git status

# Créer branche selon convention
git checkout -b feature/PROJ-123-description

# Commit conventionnel
git commit -m "feat(scope): description"
git commit -m "fix(scope): description"
git commit -m "refactor(scope): description"

# Checks avant PR
npm run lint
npm run test
npm run build

# Backup DB avant migration
pg_dump -d production > backup_$(date +%Y%m%d_%H%M%S).sql

# Rollback rapide
git revert <commit-hash>
vercel rollback
```
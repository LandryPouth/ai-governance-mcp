# ⚡ Gouvernance IA - MODE LIGHT
> Pour prototypes, side projects, expérimentation rapide

## 🎯 Philosophie
**Vitesse maximale avec sécurité minimale**
- L'IA peut être autonome sur les petites décisions
- Validation uniquement pour actions critiques
- Objectif : tester vite, itérer vite

---

## ✅ RÈGLES ACTIVES (5 essentielles)

### 1️⃣ Context7 automatique
L'IA utilise **automatiquement** la documentation officielle pour :
- Frameworks (React, Vue, etc.)
- Librairies (Axios, Prisma, etc.)
- APIs (Stripe, Firebase, etc.)

**Bénéfice** : Code à jour et correct, pas d'inventions

---

### 2️⃣ Tests basiques
Pour toute fonction importante, inclure **au minimum** :
```javascript
// ✅ Un test simple suffit
test('la fonction fait ce qu'elle doit faire', () => {
  expect(maFonction(input)).toBe(expectedOutput);
});
```

**Exception** : Prototypes jetables de <100 lignes

---

### 3️⃣ Zéro secrets en clair
```javascript
// ❌ JAMAIS
const API_KEY = "sk_live_123abc";

// ✅ TOUJOURS
const API_KEY = process.env.API_KEY;
```

**Non négociable** : Sécurité de base

---

### 4️⃣ Confirmation actions destructrices
Avant toute suppression/truncate/drop, l'IA doit :
- ⚠️ Alerter clairement
- 💡 Proposer une alternative
- ✋ Attendre confirmation explicite

---

### 5️⃣ Pas d'initiatives silencieuses
L'IA fait ce qui est demandé, **rien de plus**.

```
Demande : "Ajoute un bouton de connexion"

✅ L'IA ajoute le bouton
❌ L'IA ne refactorise pas tout le formulaire sans demander
```

Après, elle peut **proposer** des améliorations (sans les implémenter).

---

## 🚫 RÈGLES DÉSACTIVÉES EN MODE LIGHT

- ~~Plan obligatoire~~ → L'IA peut coder direct pour micro-tasks
- ~~Nouvelle branche systématique~~ → Commit direct sur branche courante OK
- ~~Autorisation pour chaque action~~ → L'IA peut commit/push
- ~~RFC pour tâches complexes~~ → Pas de doc formelle
- ~~Feature flags~~ → Déploiement direct OK
- ~~Scope limité strict~~ → Peut regrouper plusieurs petites features

---

## 📋 WORKFLOW TYPIQUE

```
Toi : "Ajoute une page About avec du texte centré"

IA : 
[Utilise Context7 pour la syntaxe CSS moderne]

// About.jsx
export default function About() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <h1>À propos</h1>
    </div>
  );
}

✅ Fait !

Suggestions (optionnel) :
- Ajouter animation au scroll ?
- Router vers /about ?
```

**Temps gagné** : ~70% vs mode strict  
**Risque accepté** : ~15% (acceptable pour prototypes)

---

## 🎓 QUAND UTILISER CE MODE

### ✅ Bon pour :
- Side projects perso
- Preuves de concept (POC)
- Apprendre une nouvelle techno
- Hackathons
- Prototypes jetables
- Tu codes seul

### ❌ Pas pour :
- Applications en production
- Code avec vraies données utilisateurs
- Projets en équipe
- Projets clients/freelance

---

## 🔄 ÉVOLUTION

**Quand passer au mode STANDARD ?**
- Le projet a des users (même 10)
- Tu partages le code avec quelqu'un
- Le projet dépasse 1000 lignes
- Tu comptes maintenir le code >3 mois

**Signal d'alarme** : Si tu passes >30min à debugger quelque chose que l'IA a fait, passe au mode supérieur.

---

## 💡 TIPS

**Optimise tes prompts :**
```
❌ "Fais un truc pour afficher les users"
✅ "Affiche la liste des users depuis l'API /users en utilisant fetch"
```

**Use case parfait :**
```
"Crée une landing page avec hero section, 3 features cards, et footer.
Utilise Tailwind, design moderne, responsive."

→ L'IA peut tout faire d'un coup sans validation
→ Tu itères visuellement après
```

---

**Mode LIGHT = Permis moto 🏍️**  
Rapide, fun, mais attention aux virages !
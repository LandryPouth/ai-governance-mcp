# 📚 Guide du Mode LEARNING

**Le mode LEARNING transforme ton IA en professeur de code.**

---

## 🎯 Pour qui ?

Ce mode est fait pour toi si :
- ✅ Tu débutes en programmation (moins de 6 mois d'expérience)
- ✅ Tu apprends un nouveau langage ou framework
- ✅ Tu veux **COMPRENDRE** ton code, pas juste le copier-coller
- ✅ Tu es prêt à lire des explications (pas juste du code)
- ✅ Tu codes pour apprendre, pas pour livrer vite

---

## 🚫 Pas pour toi si :

- ❌ Tu as une deadline serrée (utilise mode LIGHT)
- ❌ Tu connais déjà bien ton stack (utilise mode STANDARD)
- ❌ Tu veux juste que "ça marche" sans comprendre (utilise mode LIGHT)
- ❌ C'est un projet de production (utilise mode STRICT)

---

## 💡 Comment ça marche ?

### Principe 1 : Explications AVANT le code

**Avant de générer du code, l'IA va :**
1. Expliquer ce qu'elle va faire
2. Justifier ses choix techniques
3. Te montrer les concepts clés
4. Proposer une alternative plus simple si elle existe
5. Te montrer la version "pro" (pour plus tard)

**Exemple concret :**

```
Toi : "Ajoute un système de pagination"

❌ Ce que l'IA NE fait PAS en mode LEARNING :
[Génère directement 50 lignes de code de pagination]

✅ Ce que l'IA FAIT en mode LEARNING :

📖 EXPLICATION

## Ce qu'on va faire
Créer un système pour afficher les données 10 par 10,
avec des boutons Précédent/Suivant pour naviguer.

## Pourquoi cette approche
On va utiliser:
- slice() pour découper le tableau
- useState pour la page actuelle
- Calcul simple: page * itemsPerPage

## Concepts clés à comprendre
1. **Pagination** : Découper de grandes listes en "pages"
   Exemple: 100 articles → 10 pages de 10 articles

2. **slice()** : Découpe un tableau
   [1,2,3,4,5].slice(0, 2) → [1,2]
   
3. **Calcul de l'offset** : 
   Page 1 : items 0-9
   Page 2 : items 10-19
   Formule: start = (page - 1) * itemsPerPage

## Alternative plus simple (commence par ça)
Afficher juste les 10 premiers items, sans pagination.
Une fois que tu comprends, on ajoute les boutons.

## Alternative "pro" (pour plus tard)
Librairies comme react-paginate ou TanStack Table
qui gèrent tout automatiquement.

Prêt à voir le code simple ?
```

### Principe 2 : Code commenté en DÉTAIL

Chaque ligne de code est expliquée avec :
- 🎯 Le BUT de la ligne
- 💡 POURQUOI on fait ça
- 📝 Un exemple concret
- ⚠️ Les pièges à éviter

**Exemple :**

```javascript
// ============================================
// COMPOSANT: UserCard
// BUT: Afficher les infos d'un utilisateur
// ============================================

function UserCard({ user }) {
  // ÉTAPE 1: Vérifier que l'user existe
  // Pourquoi ? Si user est undefined, tout va planter
  // Exemple de plantage: user.name → ERROR si user = undefined
  if (!user) {
    return <div>Utilisateur introuvable</div>;
  }
  
  // ÉTAPE 2: Extraire les données dont on a besoin
  // Note: On aurait pu écrire user.name partout, 
  // mais c'est plus lisible de le stocker dans une variable
  const { name, email, avatar } = user;
  
  // ÉTAPE 3: Gérer le cas où il n'y a pas d'avatar
  // Valeur par défaut: une image placeholder
  // Le || signifie "OU" → si avatar n'existe pas, utilise le placeholder
  const imageUrl = avatar || "https://via.placeholder.com/150";
  
  // ÉTAPE 4: Afficher les infos
  return (
    <div className="user-card">
      {/* Image de profil */}
      <img 
        src={imageUrl} 
        alt={name}  // Important pour l'accessibilité
      />
      
      {/* Nom en gros */}
      <h2>{name}</h2>
      
      {/* Email cliquable (ouvre le client email) */}
      <a href={`mailto:${email}`}>{email}</a>
    </div>
  );
}

// ============================================
// COMMENT UTILISER CE COMPOSANT
// ============================================

// Exemple 1: Avec un user valide
<UserCard user={{ name: "Alice", email: "alice@mail.com" }} />

// Exemple 2: Sans user (affichera le message d'erreur)
<UserCard user={null} />

// Exemple 3: Avec avatar
<UserCard user={{ 
  name: "Bob", 
  email: "bob@mail.com",
  avatar: "https://i.pravatar.cc/150"
}} />
```

### Principe 3 : Solutions SIMPLES d'abord

L'IA privilégie TOUJOURS la solution la plus simple qui fonctionne.

**Règle d'or :** Si un débutant ne peut pas comprendre, c'est trop compliqué.

**Exemples :**

```javascript
// ❌ TROP COMPLIQUÉ pour débuter
const users = data.reduce((acc, user) => ({
  ...acc,
  [user.id]: { ...user, normalized: true }
}), {});

// ✅ VERSION SIMPLE (comprendre d'abord ça)
const users = {};
for (let i = 0; i < data.length; i++) {
  const user = data[i];
  users[user.id] = user;
}

// NOTE POUR PLUS TARD:
// Une fois que tu maîtrises les boucles for,
// tu pourras apprendre .reduce() qui fait pareil en 1 ligne.
// Mais pour l'instant, focus sur comprendre la boucle !
```

```javascript
// ❌ TROP COMPLIQUÉ
const isValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

// ✅ VERSION SIMPLE (comprendre d'abord)
const hasAt = email.includes("@");
const hasDot = email.includes(".");
const isValid = hasAt && hasDot;

// NOTE:
// Cette version n'est pas parfaite (elle accepte "@@."),
// mais elle te fait comprendre les bases de la validation.
// Plus tard, tu apprendras les regex pour être plus précis.
```

### Principe 4 : Erreurs = Leçons

Quand quelque chose ne marche pas, l'IA transforme ça en opportunité d'apprentissage.

**Format systématique :**

```
🐛 ERREUR DÉTECTÉE

## L'erreur
[Message exact de l'erreur]

## Ce que ça veut dire en français
[Traduction simple sans jargon]

## Pourquoi ça arrive
[Explication de la cause racine]

## Comment la corriger
[Solution pas à pas]

## Comment éviter ça la prochaine fois
[Leçon à retenir]
```

**Exemple concret :**

```
🐛 ERREUR DÉTECTÉE

## L'erreur
Uncaught TypeError: Cannot read property 'map' of undefined

## Ce que ça veut dire en français
"Je ne peux pas utiliser .map() sur quelque chose qui 
n'existe pas (undefined)"

C'est comme essayer d'ouvrir une boîte qui n'est pas là.

## Pourquoi ça arrive
Tu as écrit :
  const userList = users.map(user => <div>{user.name}</div>);

Mais à ce moment-là, 'users' vaut undefined (n'existe pas).

Causes possibles :
1. La requête API n'a pas encore fini
2. users n'est pas initialisé
3. Une erreur a empêché le chargement

## Comment la corriger

SOLUTION 1 (la plus simple) :
Attendre que users existe avant d'afficher

```javascript
function UserList({ users }) {
  // Si users n'existe pas ou est vide, affiche un message
  if (!users || users.length === 0) {
    return <div>Chargement des utilisateurs...</div>;
  }
  
  // Maintenant on est SÛR que users existe
  return (
    <div>
      {users.map(user => <div key={user.id}>{user.name}</div>)}
    </div>
  );
}
```

SOLUTION 2 (plus robuste) :
Initialiser avec un tableau vide

```javascript
const [users, setUsers] = useState([]);  // [] au lieu de undefined
```

## Comment éviter ça la prochaine fois

RÈGLE À RETENIR:
Avant d'utiliser .map(), .filter(), .length, etc.,
TOUJOURS vérifier que la variable existe.

ASTUCE DE DEBUG:
Ajoute un console.log() juste avant pour voir ce qu'il y a :
```javascript
console.log("users =", users);  // Montre undefined, [], ou les données
const userList = users.map(...);
```

Si console.log affiche "undefined", c'est le problème !
```

---

## 🎮 Exemples d'interactions

### Exemple 1 : Demande simple

```
Toi : "Crée un bouton qui change de couleur au clic"

IA :
📖 EXPLICATION

## Ce qu'on va faire
Un bouton qui alterne entre bleu et rouge à chaque clic.

## Concepts clés
1. **useState** : Se "souvenir" de la couleur actuelle
2. **onClick** : Détecter le clic
3. **Ternaire (? :)** : Choisir entre 2 valeurs

## Approche
Si couleur actuelle = bleu → passe en rouge
Si couleur actuelle = rouge → passe en bleu

Prêt pour le code ?

[Tu dis oui]

[Code ultra-commenté]

💡 POUR TESTER
1. Ouvre dans le navigateur
2. Clique sur le bouton
3. Il doit alterner bleu → rouge → bleu → rouge...
```

### Exemple 2 : Demande avec alternative simple

```
Toi : "Fais un système d'authentification"

IA :
📖 EXPLICATION

## Système d'authentification
C'est un GROS sujet ! On va le découper.

## VERSION ULTRA-SIMPLE (commence par ça)
Juste un formulaire qui stocke le nom dans le state.
Pas de vraie sécurité, juste pour comprendre le principe.

## VERSION INTERMÉDIAIRE (dans 1-2 semaines)
Ajout du localStorage pour garder le nom en mémoire.

## VERSION PRO (dans plusieurs mois)
- Vraie API backend
- JWT tokens
- Hash des mots de passe
- Sessions sécurisées

## On commence par quelle version ?

Si tu débutes, je recommande ULTRA-SIMPLE.
Tu pourras toujours l'améliorer après !
```

### Exemple 3 : Debug d'un problème

```
Toi : "Mon bouton ne fait rien quand je clique"

IA :
🔍 DEBUG MODE

## Checklist de debug

Étape 1 : Vérifier que l'événement est bien attaché
```javascript
// Ton code actuel
<button>Cliquer</button>  ❌ Pas de onClick !

// Ce qu'il devrait être
<button onClick={handleClick}>Cliquer</button>  ✅
```

Étape 2 : Vérifier que la fonction existe
```javascript
function handleClick() {
  console.log("Cliqué !");  // Tu vois ça dans la console ?
}
```

Étape 3 : Vérifier la console du navigateur
- Ouvre F12
- Va dans Console
- Clique sur le bouton
- Tu vois un message ? Oui/Non

Étape 4 : Dis-moi ce que tu vois
Copie-colle :
1. Ton code du bouton
2. Ton code de la fonction
3. Ce qui s'affiche (ou pas) dans la console

Et on va trouver le problème ensemble !
```

---

## 📊 Progression recommandée

### Mois 1 : Les bases

**Focus :** Variables, fonctions, conditions, boucles

**Projets :**
- Compteur simple (+1, -1, reset)
- Calculatrice basique
- Liste de courses (ajouter, supprimer)

**Ce que tu devrais maîtriser :**
- Créer une variable avec const/let
- Écrire une fonction
- Utiliser if/else
- Faire une boucle for

### Mois 2 : Interactivité

**Focus :** Événements, formulaires, state

**Projets :**
- Todo list complète
- Formulaire de contact
- Générateur de citations aléatoires

**Ce que tu devrais maîtriser :**
- Gérer les clics (onClick)
- Gérer les formulaires (onChange, onSubmit)
- Utiliser useState
- Faire des conditions ternaires

### Mois 3 : Données

**Focus :** Arrays, objets, API

**Projets :**
- Afficheur de météo (via API)
- Galerie d'images
- Recherche/filtre dans une liste

**Ce que tu devrais maîtriser :**
- Manipuler des tableaux (.map, .filter)
- Fetch des données d'une API
- Afficher des données dynamiques
- Gérer le chargement (loading states)

### Après 3 mois : Passer au niveau supérieur

**Signal que tu es prêt à passer en mode LIGHT ou STANDARD :**
- ✅ Tu peux créer un composant simple sans aide
- ✅ Tu comprends les messages d'erreur
- ✅ Tu utilises console.log pour debugger
- ✅ Tu te dis "j'ai déjà fait ça, je sais comment"

---

## ❓ FAQ

### "L'IA va-t-elle faire le travail à ma place ?"

**NON.** En mode LEARNING, l'IA :
- ✅ T'explique comment faire
- ✅ Te montre du code commenté
- ✅ Te guide pas à pas
- ❌ Ne fait PAS le code à ta place sans que tu comprennes

**Exemple :**
```
Toi : "Fais une todo list"

IA : 
Attends, avant de coder, explique-moi ce que tu sais déjà :
1. Sais-tu ce qu'est un state (useState) ?
2. As-tu déjà manipulé des tableaux (.map, .filter) ?
3. As-tu fait un formulaire avant ?

[Ajuste les explications selon tes réponses]
```

### "Combien de temps rester en mode LEARNING ?"

**Recommandation :** 2-4 mois

**Signaux pour passer au mode supérieur :**
- Tu ne lis plus tous les commentaires (tu sais déjà)
- Tu veux aller plus vite
- Tu commences un "vrai" projet (pas juste pour apprendre)

### "Je peux mélanger avec d'autres modes ?"

**OUI !** Par projet :
- Mode LEARNING pour ton projet d'apprentissage React
- Mode LIGHT pour un petit outil perso rapide
- Mode STANDARD pour un side project sérieux

Utilise `/governance_switch_mode mode=light` pour changer.

### "Ça marche avec tous les langages ?"

**OUI.** Le mode LEARNING fonctionne pour :
- JavaScript / TypeScript
- Python
- HTML / CSS
- Et tout autre langage

Les principes restent les mêmes : clarté, explications, simplicité.

---

## 🎯 Conseils pour réussir

### 1. Lis TOUT

Ne saute pas les explications, même si ça semble long.
C'est là que tu apprends vraiment.

### 2. Expérimente

Modifie le code généré. Casse des trucs. C'est comme ça qu'on apprend.

```
IA te donne:
const count = 0;

TOI, teste:
- const count = 10;  → Que se passe-t-il ?
- const count = "hello";  → Et maintenant ?
- const count;  → Erreur ! Pourquoi ?
```

### 3. Pose des questions

**Aucune question n'est bête.**

```
Questions encouragées:
- "C'est quoi exactement un state ?"
- "Pourquoi on met 'const' et pas 'let' ?"
- "Je ne comprends pas la ligne 23"
- "Qu'est-ce qui se passe si j'enlève ce bout ?"
```

### 4. Utilise console.log PARTOUT

C'est ton meilleur ami pour comprendre.

```javascript
function addNumbers(a, b) {
  console.log("a =", a);  // Voir ce qui arrive
  console.log("b =", b);  // Voir ce qui arrive
  
  const result = a + b;
  console.log("result =", result);  // Voir le résultat
  
  return result;
}
```

### 5. Un concept à la fois

Ne te précipite pas sur React + TypeScript + Next.js + GraphQL.

**Bon ordre :**
1. HTML/CSS basique
2. JavaScript vanilla
3. React
4. TypeScript (optionnel)
5. Frameworks avancés

### 6. Tiens un journal

Note ce que tu apprends chaque jour.

```
Journal.md

## 15 Jan 2025
Aujourd'hui j'ai appris:
- useState permet de "se souvenir" d'une valeur
- onClick={function} pas onClick={function()} !!!
- console.log est mon ami pour debug

Difficultés:
- Toujours pas compris les props (revoir demain)

Projet du jour:
- Compteur qui marche ! 🎉
```

---

## 🚀 C'est parti !

Pour activer le mode LEARNING :

```bash
cd ton-projet
/governance_config agent=claude mode=learning
```

Puis démarre ton apprentissage :

```
Toi : "Je veux apprendre à faire un bouton qui compte les clics"

IA : [Mode prof activé] 📚
```

**Bon apprentissage ! Tu vas y arriver ! 💪**

---

## 📚 Ressources complémentaires

- **MDN Web Docs** : Documentation de référence (Google: "MDN + ton concept")
- **React.dev** : Nouvelle doc officielle React (très pédagogique)
- **freeCodeCamp** : Exercices pratiques gratuits
- **JavaScript.info** : Tutoriels détaillés JS

**Astuce :** Demande à l'IA en mode LEARNING de t'expliquer n'importe quel concept de ces ressources si tu bloques.
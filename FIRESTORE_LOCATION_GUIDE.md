# Guide Visuel : Trouver Firestore Database dans Firebase Console

## 🎯 Objectif
Créer une **Firestore Database** pour partager les données de BuyList entre tous les utilisateurs.

---

## 📍 Où Cliquer Exactement

### 1️⃣ **Accéder à Firebase Console**
```
URL: https://console.firebase.google.com
```
- Connecte-toi avec ton compte Google (celui que tu as utilisé pour créer le projet)

---

### 2️⃣ **Sélectionner ton projet "wishlist-907be"**
Une fois connecté, tu dois voir une liste de tes projets.

**Clique sur**: `wishlist-907be` (ou le nom de ton projet)

*Cela t'ouvre le tableau de bord du projet.*

---

### 3️⃣ **Trouver "Build" dans le menu gauche**
Dans le **menu gauche** de la console Firebase, tu verras :

```
🏠 Overview
📊 Realtime Database
🔥 Firestore Database  ← C'EST LÀ QUE TU DOIS CLIQUER
🎯 Cloud Storage
⚙️ Hosting
🔐 Authentication
```

**Clique sur**: `🔥 Firestore Database`

*Si tu ne vois pas ce menu sur la gauche, vérifie que tu es dans le bon projet.*

---

### 4️⃣ **Créer la base de données**
Une fois dans Firestore, tu verras un gros bouton bleu:

```
╔════════════════════════════════╗
║  ➕ Create database            ║
╚════════════════════════════════╝
```

**Clique sur**: `➕ Create database`

---

### 5️⃣ **Remplir les paramètres**

Une modal s'ouvre avec des options:

```
┌─────────────────────────────────────┐
│  Create Firestore Database          │
├─────────────────────────────────────┤
│                                     │
│  Firestore Location:                │
│  ┌──────────────────────────────┐   │
│  │ eur3 (Europe)          ▼    │   │  ← Sélectionne ta région
│  └──────────────────────────────┘   │
│                                     │
│  ⭕ Test mode (default)  ← À cocher │
│  ⭕ Production mode                 │
│                                     │
│         ┌──────────────────┐       │
│         │  Create          │       │
│         └──────────────────┘       │
└─────────────────────────────────────┘
```

**À faire:**
1. **Localisation**: Choisis la région la plus proche
   - Europe: `eur3` ✅ (recommandé)
   - France: `europe-west1` ✅
   - USA: `us-central1`
   
2. **Mode**: Laisse **"Test mode"** coché ✅ (permet lecture/écriture)

3. **Clique**: `Create` (le gros bouton bleu)

---

### 6️⃣ **Attendre la création**
La console affiche: `⏳ Creating your database...`

**Attends 1-2 minutes** pendant que Firebase crée la base de données. 

Tu verras ensuite:
```
✅ Database created successfully
```

---

## 🎉 Bravo!
Tu es maintenant dans **Firestore Database**. Tu dois voir:

```
DATA  |  RULES  |  INDEXES  |  USAGE
────────────────────────────────────
[+ Start collection]  ← Prochaine étape!
```

---

## ⏭️ Prochaine Étape: Step 5 (Initialiser la Collection)

Une fois la DB créée, tu vas:

1. Cliquer `[+ Start collection]`
2. Entrer **ID**: `state`
3. Cliquer `Auto ID` pour le document
4. Ajouter les champs `categories` et `items`
5. Cliquer `Save`

---

## ❌ Si tu ne trouves pas "Firestore Database"

**Vérification:**

1. ✅ Tu es connecté à Firebase avec le bon compte Google?
2. ✅ Tu as sélectionné le bon projet (`wishlist-907be`)?
3. ✅ Tu regardes le **menu gauche** de la console?
4. ✅ La page a fini de charger (attends quelques secondes)?

**Soluce**: 
- Rafraîchis la page (F5)
- Essaie d'aller directement sur: `https://console.firebase.google.com/project/wishlist-907be/firestore`
- Remplace `wishlist-907be` par ton ID de projet si différent

---

## 💡 À Retenir

| Concept | Explication |
|---------|------------|
| **Project** | Conteneur pour ton app (tu as `wishlist-907be`) |
| **Firestore** | La base de données (crée une seule fois par projet) |
| **Collection** | Dossier de documents (ex: `state`) |
| **Document** | Fichier JSON (ex: `main`) |
| **Test Mode** | Permet à tout le monde de lire/écrire (pour dev) |

---

**Questions? Consulte la console et cherche les onglets verts qui disent "Firestore Database" 🔥**

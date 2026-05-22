# 🛒 BuyList

Application web de gestion d'achats avec assistant IA **100% gratuit** (Groq + Llama 3.3).

## Fonctionnalités

- **Budget** — liste d'articles par catégorie, total en temps réel, cocher les articles achetés
- **Détails & comparaisons** — fiche produit avec tableau comparatif
- **Catégories** — créer, modifier, supprimer des catégories
- **Assistant IA** — chat Llama 3.3 via Groq (gratuit, ultra rapide)
- **Persistance** — tout sauvegardé en localStorage

## Déploiement GitHub Pages (100% gratuit)

```bash
git init && git add . && git commit -m "init buylist"
git remote add origin https://github.com/TON_PSEUDO/buylist.git
git push -u origin main
```

Puis : **Settings → Pages → Source → `main` / root**

Ton site → `https://ton-pseudo.github.io/buylist`

## Configurer l'IA (Groq — gratuit)

1. Aller sur **[console.groq.com/keys](https://console.groq.com/keys)**
2. Créer un compte gratuit (connexion Google ou GitHub)
3. Cliquer **"Create API Key"** → copier la clé (`gsk_...`)
4. Dans l'app, aller sur **Assistant IA** et coller la clé

La clé est stockée uniquement dans ton navigateur (localStorage). Limite gratuite : **14 400 requêtes/jour**.

## Modifier la liste par défaut

Éditer `DEFAULT_DATA` dans `js/data.js`.

## Structure

```
buylist/
├── index.html
├── css/style.css
├── js/
│   ├── data.js     ← articles & catégories par défaut
│   ├── app.js      ← logique, routing, comparaisons
│   └── ai.js       ← chat Groq/Llama
└── README.md
```

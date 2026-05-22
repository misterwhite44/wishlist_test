# 🛒 BuyList

Application web de gestion d'achats avec IA intégrée. Fonctionne entièrement en local (pas de serveur nécessaire).

## Fonctionnalités

- **Budget** — liste d'articles par catégorie, total en temps réel, cochage des articles achetés
- **Détails & comparaisons** — fiche produit avec tableau comparatif des modèles
- **Catégories** — créer, modifier, supprimer des catégories personnalisées
- **Assistant IA** — chat avec Claude (Anthropic) pour comparer produits, analyser le budget, obtenir des conseils
- **Persistance locale** — données sauvegardées dans localStorage

## Structure

```
buylist/
├── index.html        ← Point d'entrée
├── css/
│   └── style.css     ← Styles globaux
├── js/
│   ├── data.js       ← Données & localStorage
│   ├── app.js        ← Logique principale & routing
│   └── ai.js         ← Chat IA (Anthropic API)
└── README.md
```

## Déploiement GitHub Pages

1. Créer un repo GitHub (ex: `buylist`)
2. Uploader tous les fichiers en conservant la structure de dossiers
3. Aller dans **Settings → Pages → Source** → `main` / `root`
4. Le site sera disponible sur `https://ton-pseudo.github.io/buylist`

## IA

L'assistant IA utilise l'API Anthropic (Claude). Les appels API sont faits côté client — aucune clé n'est nécessaire dans le code (gérée par le proxy Anthropic).

> Si tu héberges hors de claude.ai, tu devras ajouter ta propre clé API dans `js/ai.js` dans le header `Authorization: Bearer VOTRE_CLE`.

## Personnalisation

Pour modifier la liste initiale (avant toute modification en localStorage), éditer le tableau `DEFAULT_DATA` dans `js/data.js`.

---

Fait avec ❤️ pour gérer ses achats intelligemment.

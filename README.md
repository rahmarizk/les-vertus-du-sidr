# Les Vertus du Sidr — code source du blog

Blog statique (HTML + CSS, sans dépendance ni build) sur le sidr (jujubier), design inspiré de la structure du blog Yuka avec la palette de marque « Les Vertus du Sidr » (vert profond, or, fond crème).

## Faire tourner le blog en local

Aucune installation n'est nécessaire : ouvrez simplement `index.html` dans votre navigateur (double-clic, ou clic droit → Ouvrir avec → votre navigateur).

Pour un rendu identique à celui d'un vrai serveur (recommandé, notamment pour tester le SEO), vous pouvez aussi lancer un petit serveur local :

```bash
# Avec Python 3 (déjà installé sur Mac/Linux, à installer sur Windows)
cd chemin/vers/le/dossier
python3 -m http.server 8000
# puis ouvrez http://localhost:8000 dans votre navigateur
```

## Structure des fichiers

Tous les fichiers sont volontairement à plat (pas de sous-dossiers), pour que les liens fonctionnent aussi bien en ouverture directe des fichiers qu'avec un serveur local.

- `index.html` — page d'accueil (hero, filtres de catégories, grille d'articles)
- `about.html` — page « Qui sommes-nous » (méthodologie éditoriale, contact — utile pour la crédibilité éditoriale et Google News)
- `article-*.html` — les 7 articles du magazine
- `style.css` — feuille de style unique (variables de couleurs en haut du fichier)
- `img-logo.svg`, `img-icon.svg` — logo et favicon (voir ci-dessous pour votre logo définitif)
- `img-cover-*.svg` — illustrations de couverture de chaque article, en SVG vectoriel (aucune dépendance externe, fonctionne 100% hors-ligne)
- `robots.txt`, `sitemap.xml`, `news-sitemap.xml` — fichiers techniques SEO / Google News

## Intégrer votre logo définitif

Vous m'avez transmis votre logo (arbre + « Les Vertus du Sidr ») en cours de conversation. Pour des raisons techniques de cette session (le bac à sable d'exécution de fichiers était indisponible), j'ai recréé une version SVG du logo dans les mêmes couleurs en attendant, plutôt que de copier directement votre fichier image.

Pour utiliser votre fichier original :

1. Enregistrez votre logo sous le nom `logo.png` (ou `logo.jpg`) dans ce même dossier.
2. Remplacez, dans chaque fichier `.html`, les deux occurrences de `img-logo.svg` par `logo.png` (recherche/remplace global — tous les fichiers utilisent exactement ce nom).
3. Le favicon (`img-icon.svg`, référencé dans `<link rel="icon">`) peut rester tel quel, ou être remplacé par une version carrée recadrée de votre logo.

Dites-le-moi si vous voulez que je fasse ce remplacement à votre place lors d'une prochaine session — je pourrai le faire automatiquement dès que l'environnement d'exécution est disponible.

## Avant la mise en ligne

- **Nom de domaine** : toutes les URLs canoniques, Open Graph et sitemaps utilisent le domaine provisoire `https://www.lesvertusdusidr.fr/`. Remplacez-le par votre vrai nom de domaine avant publication (recherche/remplace global sur tous les fichiers).
- **Google News** : depuis octobre 2025, Google n'exige plus de candidature manuelle — l'inclusion dépend du crawl et du respect des critères éditoriaux (transparence de la rédaction, page « À propos », politique de correction, sitemap d'actualités à jour). Le fichier `news-sitemap.xml` ne doit contenir que les articles publiés dans les **48 dernières heures** : pensez à le régénérer à chaque nouvelle publication et à retirer les anciens articles.
- **CMS** : ce livrable est un site 100% statique, pensé comme base avant l'intégration d'un CMS (WordPress, ou un générateur de site statique type Astro/Eleventy) dans un second temps, comme convenu.
- **Emails / analytics** : le formulaire de newsletter sur `index.html` est une démonstration (il n'envoie rien) — à connecter à votre outil d'emailing.

## Sourcing éditorial

Chaque article contient un encart « Sources » en bas de page avec des liens vers les études, ouvrages ou pages de référence utilisés pour sa rédaction. Aucune information n'a été inventée : lorsque la science manque, l'article le précise explicitement plutôt que de présenter une allégation commerciale comme un fait établi.

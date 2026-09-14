# Les Vertus du Sidr — code source du blog

Blog statique (HTML + CSS, sans JavaScript ni dépendance) sur le sidr (jujubier) : https://www.lesvertusdusidr.fr — édité par RAHMA&RIZK (SASU, Paris).

## Hébergement et déploiement

- Hébergé sur **Cloudflare Workers** (assets statiques). Chaque commit sur `main` déclenche un build automatique (environ 1 minute).
- Cloudflare sert les fichiers `x.html` à l'URL propre `/x` et redirige `/x.html` → `/x`, `/index.html` → `/`. **Toutes les URLs du site sont donc sans `.html`** (liens, canonical, sitemap).
- `lesvertusdusidr.fr` redirige en 301 vers `www.lesvertusdusidr.fr` (règle de redirection Cloudflare).
- `_headers` (cache, en-têtes de sécurité) et `_redirects` (`/news-sitemap.xml` → `/sitemap.xml`) sont pris en compte par Cloudflare.

## Structure des fichiers (à plat)

| Fichier | Rôle |
|---|---|
| `index.html` | Accueil (H1 « sidr / poudre de sidr », bloc « Par où commencer », grille d'articles) |
| `poudre-de-sidr.html` | **Page pilier** `/poudre-de-sidr` (guide complet, FAQ, tableaux) — cible « poudre de sidr » |
| `article-*.html` | Articles (14 au 14/09/2026) |
| `about.html`, `mentions-legales.html` | Qui sommes-nous (liens d'intérêt) ; mentions légales (LCEN, `noindex`) |
| `style.css` | Feuille de style unique (chargée en `style.css?v=3`) |
| `logo.jpg` / `logo.webp`, `img-icon.svg` | Logo (720 px) et favicon |
| `img-cover-*.jpg` + `.webp` + `-600.webp`, `body-*.jpg` + `.webp` + `-600.webp` | Images optimisées le 14/09/2026 (max 1 200 px, JPG progressif + WebP en deux tailles, servies via `<picture>`) |
| `sitemap.xml`, `robots.txt`, `llms.txt` | Fichiers techniques (le sitemap liste les URLs propres avec `lastmod`) |
| `CONTENT-PLAN.md` | Plan éditorial + **conventions techniques obligatoires** pour tout nouvel article |
| `KPI-TRACKING.md` | Suivi hebdomadaire (Search Console, Cloudflare, Bing) et mots-clés → pages |

## Comment le site est généré

Les pages en ligne sont produites par un générateur Python (`build.py`, hors dépôt : dossier `lesvertusdusidr-site/site/` chez l'éditeur) à partir de sources (`src/parts/<slug>.head.html` + `<slug>.article.html`, `src/pages.py`, `src/pilier.py`). Le générateur normalise : URLs propres, `Article` + `BreadcrumbList` (+ `FAQPage` quand il y a une FAQ), sommaire depuis les H2, images (`<picture>` WebP, `width`/`height`, `loading`, `fetchpriority` sur l'image de couverture), header/nav/footer, sitemap, robots, `_headers`, `_redirects`, `llms.txt`. `python3 build.py` → `dist/` à uploader tel quel dans ce dépôt.

Un article ajouté directement dans le dépôt (publication automatique du vendredi) doit suivre la section « Conventions techniques » de `CONTENT-PLAN.md` ; il est ensuite réintégré dans les sources du générateur.

## Ajouter un article (résumé)

1. Copier la structure d'un article récent (`article-poudre-sidr-maroc-yemen-inde.html`) : même `<head>`, header à 9 entrées, footer.
2. URLs sans `.html` partout ; `canonical`/`og:url`/`mainEntityOfPage` = `https://www.lesvertusdusidr.fr/<slug>`.
3. JSON-LD `Article` (auteur : Organization « Rédaction Les Vertus du Sidr », `/about`) + `BreadcrumbList`.
4. Image de couverture `img-cover-<slug-court>.jpg` ≤ 200 Ko (idéalement + `.webp` et `-600.webp`), dans `<figure class="article-cover">`.
5. Au moins 3 liens internes dont 1 vers `/poudre-de-sidr` ; 1 lien retour depuis la page la plus proche.
6. Ajouter une carte dans `index.html` et une entrée `<url>` dans `sitemap.xml` ; demander l'indexation dans Search Console.

## Sourcing éditorial

Chaque article contient un encart « Sources » en bas de page (études, ouvrages, pages de référence). Aucune information n'est inventée : lorsque la science manque, l'article le précise plutôt que de présenter une allégation commerciale comme un fait établi. Le site est édité par la société qui commercialise la poudre de sidr La Maison du Jujubier ; ce lien d'intérêt est indiqué sur « Qui sommes-nous », dans les mentions légales et sur les pages d'achat (`rel="sponsored"` sur le produit maison, `rel="nofollow"` sur les boutiques tierces).

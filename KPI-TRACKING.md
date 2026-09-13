# Suivi KPI -- Les Vertus du Sidr

Ce fichier est mis a jour chaque semaine par la tache planifiee "sidr-weekly-article", en meme temps que la publication de l'article. Il sert de memoire longue pour suivre l'evolution du trafic et du referencement du site, et pour consigner les recommandations d'actions au fil du temps.

## Mots-cles principaux suivis

Depuis la refonte SEO du 14/09/2026, les URLs du site sont propres (sans `.html`) : relever les positions sur ces URLs.

| Mot-cle | Page cible |
|---|---|
| sidr | / (home) |
| poudre de sidr | /poudre-de-sidr (page pilier, publiee le 14/09/2026) |
| poudre de sidr cheveux | /poudre-de-sidr |
| poudre de sidr bienfaits | /poudre-de-sidr |
| feuille de sidr | /article-origine-histoire-sidr |
| sidr cheveux | /article-bienfaits-cheveux-sidr |
| sidr peau | /article-bienfaits-peau-sidr |
| jujubier | /article-sidr-jujubier-difference |
| masque sidr | /article-recettes-masques-sidr |
| acheter poudre de sidr | /article-ou-acheter-poudre-sidr |
| ou acheter poudre de sidr | /article-ou-acheter-poudre-sidr |
| sidr bienfaits | /article-faq-sidr |
| sidr islam | /article-traditions-culturelles-sidr |
| sidrat al muntaha | /article-sidr-coran-islam |
| poudre de sidr pure | /article-reconnaitre-poudre-sidr-pure |
| poudre de sidr maroc yemen inde | /article-poudre-sidr-maroc-yemen-inde |
| miel de sidr | /article-miel-de-sidr |

## Historique hebdomadaire

Chaque vendredi, ajouter une nouvelle ligne en bas du tableau (ne jamais supprimer les lignes precedentes -- c'est l'historique). Sources : Cloudflare Web Analytics (visites/pages vues), Google Search Console (clics/impressions/position moyenne sur 7 jours), Bing Webmaster Tools (clics/position moyenne sur 7 jours).

| Date | Visites (Cloudflare) | Clics Google (7j) | Impressions Google (7j) | Position moy. Google | Clics Bing (7j) | Position moy. Bing | Article publie |
|---|---|---|---|---|---|---|---|
| 17/08/2026 | 3 (donnees encore tres limitees, site jeune) | 1 | 121 | 10.1 | 0 (Bing vient d'etre configure, pas encore de donnees) | -- | article-interview-khuwaylid-fondateur-maison-jujubier.html |
| 21/08/2026 | Non disponible (session Cloudflare non connectee dans le navigateur cette semaine -- a reverifier la prochaine fois) | 7 | 217 | 10.1 | 0 | 6.0 (moyenne des 5 mots-cles avec impressions : 8.0, 6.0, 7.0, 6.0, 3.0) | article-sidr-coran-islam.html |
| 28/08/2026 | Non disponible (session Cloudflare non authentifiee cette semaine -- login requis, a reconnecter) | 5 | 202 | 8.2 | Non disponible (session Bing non authentifiee cette semaine -- login requis, a reconnecter) | -- | article-miel-de-sidr.html |
| 05/09/2026 | Non disponible (session Cloudflare non authentifiee cette semaine -- login requis, a reconnecter) | 1 | 180 | 18.2 | Non disponible (session Bing non authentifiee cette semaine -- login requis, a reconnecter) | -- | article-reconnaitre-poudre-sidr-pure.html |
| 11/09/2026 | Cloudflare authentifie mais widget de selection de periode 7 jours inaccessible dans cet environnement automatise cette semaine (0 visite / 0 page vue affichees sur les dernieres 24h par defaut) | 4 | 120 | 26.1 | Non disponible (session Bing non authentifiee cette semaine -- login requis, a reconnecter) | -- | article-poudre-sidr-maroc-yemen-inde.html |
| 14/09/2026 (hors cycle : refonte SEO) | -- | Reference 28 jours (15/08-11/09) : 19 clics | 643 impressions (28j) | 13.5 (28j) | -- | -- | poudre-de-sidr.html (page pilier) + refonte complete du site (URLs propres, comparatif « ou acheter », mentions legales, redirection non-www -> www, sitemap 17 URLs, 6 demandes d'indexation dans Search Console) |

## Recommandations en cours

Cette section est reecrite chaque semaine avec les recommandations actives (garder 3-5 recommandations maximum, retirer celles qui ne sont plus pertinentes, expliquer brievement le pourquoi).

- Refonte SEO deployee le 14/09/2026 (plan 30 jours, objectif « sidr » / « poudre de sidr ») : verifier chaque vendredi dans Search Console que `/poudre-de-sidr`, `/article-ou-acheter-poudre-sidr`, `/article-reconnaitre-poudre-sidr-pure`, `/article-poudre-sidr-maroc-yemen-inde` et `/article-miel-de-sidr` passent en « Indexee » (au 14/09 : 13 pages non indexees dont 8 « page en double avec canonique », 4 « detectee, non indexee », 1 « page avec redirection »). Relancer une demande d'indexation pour celles encore non indexees.
- Respecter strictement les conventions techniques decrites dans CONTENT-PLAN.md (URLs sans `.html`, modele de page du 14/09, `Article` + `BreadcrumbList`, lien vers `/poudre-de-sidr`) pour chaque nouvel article.
- Position moyenne Google en degradation sur 4 semaines (10.1 -> 8.2 -> 18.2 -> 26.1) : la hausse d'impressions sur de nouvelles requetes longue traine (feuille de jujubier bienfaits, plante sidr, masque sidr cheveux, positions 30-75) explique une partie de la baisse ; suivre surtout les positions de « poudre de sidr » et « sidr » sur la home et la page pilier.
- Bing Webmaster Tools : reconnexion toujours a faire (session non authentifiee depuis 4 semaines) ; activer IndexNow des que possible.

## Ou trouver les chiffres

- Cloudflare Web Analytics : https://dash.cloudflare.com/f96b1c965b2bbb12bfe117fec63291fd/web-analytics/sites puis cliquer sur lesvertusdusidr.fr (visites, pages vues, pages les plus visitees, referents).
- Google Search Console : https://search.google.com/search-console/performance/search-analytics?resource_id=https%3A%2F%2Fwww.lesvertusdusidr.fr%2F -- filtrer sur "7 days", relever total clics, impressions, position moyenne, et les principales requetes dans l'onglet Queries.
- Bing Webmaster Tools : https://www.bing.com/webmasters/dashboard puis "Search Performance" pour www.lesvertusdusidr.fr (clics, impressions, position moyenne).

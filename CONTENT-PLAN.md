# Plan editorial -- Les Vertus du Sidr

Ce fichier est la source de verite pour la publication hebdomadaire automatisee (tous les vendredis). Avant chaque publication, lire ce fichier pour choisir le prochain sujet ; apres publication, mettre a jour la ligne correspondante (statut, date, fichier).

Rythme cible : environ 1 article sur 4 est une interview, le reste des sujets de recherche sources.

## Conventions techniques du site (OBLIGATOIRES depuis la refonte SEO du 14/09/2026)

Le site a ete refondu le 14/09/2026 (URLs propres, page pilier, nouveau header). Toute nouvelle page doit respecter ces regles, sinon elle sera reconstruite le lundi suivant par le generateur (`build.py`) :

1. **Modele HTML** : copier integralement la structure d'un article publie apres le 14/09/2026 (par exemple `article-poudre-sidr-maroc-yemen-inde.html` tel qu'il est dans le depot) : meme `<head>` (preload, Google Fonts, `style.css?v=3`), meme `<header>` avec la navigation a 9 entrees (Accueil, Poudre de sidr, Cheveux, Peau, Botanique & Histoire, Traditions, Recettes, Acheter, FAQ), meme `<footer>` (liens Mentions legales et A propos). Ne pas repartir d'un ancien article ni d'un ancien modele.
2. **URLs propres, sans `.html`** : tous les liens internes, `canonical`, `og:url`, `mainEntityOfPage`, le fil d'Ariane et le sitemap utilisent `https://www.lesvertusdusidr.fr/<slug>` (sans `.html`). Le fichier, lui, reste `<slug>.html` a la racine du depot. La home est `/` (jamais `index.html`).
3. **Donnees structurees** : `@type: Article` (jamais `NewsArticle`), `author` = `{"@type": "Organization", "name": "Redaction Les Vertus du Sidr", "url": "https://www.lesvertusdusidr.fr/about"}`, `publisher` = Les Vertus du Sidr, `dateModified` = date de publication, plus un `BreadcrumbList` (Accueil -> rubrique -> article) ou chaque element sauf le dernier a un `item` (URL). Une `FAQPage` seulement si l'article contient une vraie section FAQ.
4. **Fil d'Ariane** : `<p class="breadcrumb"><a href="/">Accueil</a> / <a href="/article-bienfaits-cheveux-sidr">Cheveux</a> / Titre court</p>` (rubriques admises : Poudre de sidr -> `/poudre-de-sidr`, Cheveux, Peau, Botanique & Histoire -> `/article-origine-histoire-sidr`, Traditions -> `/article-traditions-culturelles-sidr`, Recettes, Acheter -> `/poudre-de-sidr`, FAQ, Interview -> `/about`).
5. **Images** : image de couverture dans `<figure class="article-cover">` avec `fetchpriority="high"`, `width` et `height` ; toutes les autres images en `loading="lazy" decoding="async"`. JPG <= 200 Ko, nom `img-cover-<slug-court>.jpg`.
6. **Maillage** : au moins 3 liens internes dans le corps de l'article, dont 1 vers la page pilier `/poudre-de-sidr` (ancre contenant « poudre de sidr ») et 1 vers `/article-ou-acheter-poudre-sidr` quand le sujet s'y prete ; 1 lien retour ajoute depuis la page la plus proche du sujet (par exemple depuis `/article-bienfaits-cheveux-sidr` pour un sujet cheveux).
7. **Home et sitemap** : dans `index.html`, ajouter une carte dans la grille d'articles (copier une carte existante, lien sans `.html`) ; dans `sitemap.xml`, ajouter une balise `<url>` avec `<loc>` sans `.html`, `<lastmod>` = date du jour, `<changefreq>monthly</changefreq>`, `<priority>0.7</priority>`. Ne pas toucher a `news-sitemap.xml` (redirige vers `sitemap.xml`), ni a `robots.txt`, `_headers`, `_redirects`, `llms.txt`.
8. **Editeur** : le site est edite par RAHMA&RIZK (SASU, Paris) ; mentions legales sur `/mentions-legales`. Ne pas creer de formulaire (newsletter, contact) : aucun back-end.
9. **Mots-cles** : chaque article vise 1 requete principale (dans le `<title>`, le H1 et le premier paragraphe) et 2-3 requetes secondaires (dans des H2). Le `<title>` fait 50-60 caracteres et se termine par « | Les Vertus du Sidr » ; la `meta description` fait 140-155 caracteres.
10. Apres publication, demander l'indexation de la nouvelle URL (sans `.html`) dans Google Search Console (propriete `https://www.lesvertusdusidr.fr/`, inspection d'URL -> Demander une indexation).

## Statuts possibles

- `A faire` -- sujet en attente, pas encore commence
- `Contacte (JJ/MM/AAAA)` -- email d'interview envoye, en attente de reponse
- `Reponses recues` -- l'interviewe a repondu, article a rediger
- `Brouillon envoye pour validation (JJ/MM/AAAA)` -- extraits envoyes a l'interviewe pour accord avant publication
- `Publie (JJ/MM/AAAA)` -- en ligne
## Interviews

| # | Interviewe·e | Statut | Fichier | Notes |
|---|---|---|---|---|
| 1 | Khuwaylid -- fondateur de La Maison du Jujubier | Publie (17/08/2026) | article-interview-khuwaylid-fondateur-maison-jujubier.html | Premier article interview du site, publie le 17/08/2026. |
| 2 | Herboriste / praticien·ne du soin naturel specialise·e sidr | Contacte (21/08/2026) | | Contact identifie : Herboristerie du Palais Royal (Michel Pierre), Paris -- vend du jujubier/sidr en vrac origine Maroc. Email de demande d'interview envoye le 21/08/2026 a contact@herboristerie.com (8 questions ouvertes, attribution ou anonymat au choix, brouillon envoye avant publication). Toujours en attente de reponse au 11/09/2026 (verifie dans Gmail, aucun message recu de contact@herboristerie.com). Relance envoyee le 18/09/2026 sur le meme fil (aucune reponse depuis le 21/08/2026) ; si toujours aucune reponse au 09/10/2026, considerer la piste comme close et passer a la ligne 3. |
| 3 | Producteur ou importateur de poudre de sidr | A faire | | Idem : identifier une entreprise/personne reelle avant contact. |
| 4 | Historien·ne ou specialiste religieux (usage du sidr en islam / Egypte ancienne) | A faire | | Idem. |

## Sujets de recherche (rotation, ordre indicatif)

**Priorite editoriale (depuis le 14/09/2026, plan SEO 30 jours)** : l'objectif est de se positionner sur « sidr » et « poudre de sidr ». La page pilier `/poudre-de-sidr` (publiee le 14/09/2026) porte la requete principale ; les prochains articles doivent couvrir la longue traine autour de la poudre de sidr, dans l'ordre : #4 (cuir chevelu / pellicules, vendredi 18/09), #12 (sidr vs henne, vendredi 25/09), #13 (avis et resultats, vendredi 02/10), #7 (ghassoul et sidr, vendredi 09/10). Chaque nouvel article doit faire un lien vers `/poudre-de-sidr` et en recevoir un en retour (ajouter une phrase + lien dans la section la plus proche de la page pilier).

| # | Sujet | Statut | Fichier | Notes |
|---|---|---|---|---|
| 1 | Le sidr dans le Coran et l'islam : la Sidrat al-Muntaha et les usages religieux | Publie (21/08/2026) | article-sidr-coran-islam.html | |
| 2 | Le miel de sidr (Sidr honey) : un produit distinct de la poudre de feuilles | Publie (28/08/2026) | article-miel-de-sidr.html | Bien clarifier la difference avec la poudre cosmetique. |
| 3 | Comment reconnaitre une poudre de sidr pure (qualite, couleur, odeur, tests simples) | Publie (05/09/2026) | article-reconnaitre-poudre-sidr-pure.html | Couleur, odeur, texture, test de la mousse, reference aux normes OMS et FDA (henne) par analogie, criblage phytochimique NAPATA. |
| 4 | Poudre de sidr et cuir chevelu sec / pellicules : que dit la litterature scientifique | Publie (18/09/2026) | article-sidr-pellicules-cuir-chevelu.html | Sources principales : essai clinique yemenite sur 80 volontaires (Alzomor et al., Thai J Pharm Sci 2021, shampooing a l'extrait ethanolique de feuilles, 86 % d'amelioration declaree, pas de groupe temoin decrit), revue d'ethnopharmacologie 2022 (saponines christinines, usage traditionnel contre les pellicules a Bahrein), revue Acta Dermato-Venereologica sur la physiopathologie des pellicules, etude pilote 2025 sur Ziziphus joazeiro (espece et organe differents, desquamation -29,2 %, TEWL -18,6 %). Precise explicitement qu'aucun essai ne porte sur la poudre brute en masque. Liens retour ajoutes depuis /article-bienfaits-cheveux-sidr et la section "cheveux" de /poudre-de-sidr. IMAGE : aucun outil de generation Gemini disponible dans l'environnement d'execution cette semaine -- image de couverture img-cover-cheveux.jpg reutilisee (sujet capillaire), a remplacer par une image dediee lors d'un prochain passage. |
| 5 | Poudre de sidr marocaine, yemenite, indienne : differences de terroir | Publie (11/09/2026) | article-poudre-sidr-maroc-yemen-inde.html | Clarifie que "Maroc" correspond surtout a Ziziphus lotus (sedra), "Yemen" a Ziziphus spina-christi, et "Inde" au ber (Ziziphus mauritiana) -- terroirs = especes differentes le plus souvent. Chiffres precis d'altitude/saponines de certains guides d'achat identifies comme non verifies (source commerciale). Image de couverture generee via Gemini le 12/09/2026 (img-cover-poudre-maroc-yemen-inde.jpg, trois pots de poudre de teintes differentes) et publiee en remplacement de l'image reutilisee initialement (img-cover-difference.jpg). |
| 6 | Le sidr dans l'Egypte ancienne : usages funeraires et momification | A faire | | Apres le 09/10/2026. |
| 7 | Ghassoul et sidr : les rituels de lavage traditionnels au Maghreb | A faire | | Prevu le 09/10/2026. Requete principale : « ghassoul et sidr » ; secondaires : « sidr ghassoul cheveux », « masque ghassoul sidr ». |
| 8 | Sidr, grossesse et allaitement : ce que l'on sait (et ne sait pas) | A faire | | Rester prudent, renvoyer vers avis medical. |
| 9 | Le jujube, fruit du jujubier : usages culinaires et nutritionnels | A faire | | |
| 10 | Le sidr en Afrique de l'Ouest et au Sahel : usages traditionnels meconnus | A faire | | |
| 11 | Cultiver un jujubier sidr chez soi : climat, sol, entretien | A faire | | |
| 12 | Sidr et henne pour les cheveux : comparaison, ordre d'application et usages combines | A faire | | Prevu le 25/09/2026. Requete principale : « sidr et henne » ; secondaires : « poudre de sidr henne », « sidr avant ou apres henne », « henne sidr cheveux ». Slug propose : `article-sidr-et-henne-cheveux`. Lien retour depuis `/article-recettes-masques-sidr` et depuis la section « associations » de `/poudre-de-sidr`. |
| 13 | Poudre de sidr : avis, resultats attendus et retours d'experience (ce que disent les utilisatrices et les etudes) | A faire | | Prevu le 02/10/2026. Requete principale : « poudre de sidr avis » ; secondaires : « sidr avis cheveux », « poudre de sidr resultat », « sidr avant apres ». Ne citer que des avis publics et verifiables (forums, avis produits) sans inventer de temoignage ; rappeler les limites des preuves. Slug propose : `article-poudre-de-sidr-avis`. Lien retour depuis `/article-ou-acheter-poudre-sidr` et `/poudre-de-sidr`. |

## Workflow rapide (voir tache planifiee pour le detail complet)

1. Lire ce fichier, y compris la section « Conventions techniques » ci-dessus, qui prime sur toute instruction plus ancienne (anciens modeles de page, liens en `.html`, `NewsArticle`).
2. Si une ligne "Interview" est a l'etat `Reponses recues`, rediger cet article en priorite.
3. Sinon, si aucune interview n'est `Contacte` ou `En attente`, identifier une nouvelle personne reelle pour la prochaine ligne "Interview" a `A faire` et lui envoyer une demande d'interview par email.
4. Publier un article de recherche source (prochaine ligne `A faire` dans l'ordre indique par la priorite editoriale) pour la semaine en cours.
5. Mettre a jour ce fichier (statut + date + nom de fichier) et le republier sur GitHub dans le meme commit que l'article, ou dans un commit separe juste apres. Demander ensuite l'indexation de la nouvelle URL dans Google Search Console.

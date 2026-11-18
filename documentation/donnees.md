# Les données de Lumen

Les données vivent dans la base Firestore du projet Firebase « lumen-veritatis ». Les règles de sécurité (`regles-firestore.txt`) ouvrent tout au compte d'Emmanuel, et à tout autre compte connecté, à l'adresse confirmée, son seul propre espace. Ce qui appartient à un compte se range sous `users/{son identifiant}/`.

Les fichiers lourds (cours d'Étude, articles, anciennes ressources) vivent dans le **coffre R2** (voir plus bas). Dans Firestore (conversations), un contenu lourd se découpe encore en **tranches** de moins d'un mégaoctet, rangées dans une sous-collection `tranches` sous sa fiche, parce que Firestore refuse un document de plus d'un mégaoctet.

## Bible

| Chemin | Contenu |
|---|---|
| `users/{uid}/bibleNotes/{id}` | Notes, surlignages et signets, une fiche chacun ; les fiches `lv-…` portent les réglages de la page. Notes, surlignages et signets se classent selon la traduction (Chérubin ou Séraphin). |

Le texte des deux Bibles ne vient pas de la base : il est découpé par livre à la fabrication, à partir de `contenu/bible.json` et `contenu/bible-seraphin.json`.

## Mémoriser

| Chemin | Contenu |
|---|---|
| `config/memoriser` | Une bibliothèque de départ en ligne, que la page ne lit que si celle qu'elle embarque est vide. La bibliothèque qui fait foi est `contenu/memoriser.json`, embarquée par la fabrication : les **versets de base**, une catégorie par thème du parcours, rangée dans la section de son bloc (`bloc`), chaque verset portant sa note « pourquoi l'apprendre » (`note`, où `*mot*` s'affiche en italique). Une catégorie ne garde que les versets qui valent d'être sus par cœur : ce qui sert surtout à comprendre reste dans les cours. Un même verset peut figurer dans plusieurs blocs : sa progression est partagée entre ses catégories. Ils ne se modifient ni ne se suppriment ; leur progression est rangée comme celle des autres versets. |
| `users/{uid}/categories/{id}` | Les catégories créées par Emmanuel, avec leurs versets ; un verset vaut `{id, fr: {text, ref}}`. |
| `users/{uid}/meta/progress` | La progression : la couleur et l'historique de chaque verset, par identifiant de verset. |
| `users/{uid}/meta/prefs` | Ce qui entre dans les séries, à deux niveaux (`v: 2`) : les versets décochés (`offV`) et les catégories éteintes (`offC`). Éteindre une catégorie garde les coches de ses versets. `connues` liste les catégories déjà vues, pour qu'une catégorie nouvelle arrive éteinte ; `selCats` garde les catégories entièrement prises. |
| `users/{uid}/meta/baseEdits` | Ses retouches sur les catégories de la bibliothèque de départ. |
| `users/{uid}/meta/sections` | Les sections qui regroupent les catégories. |
| `users/{uid}/meta/trash` | La corbeille. |

La progression est rangée par identifiant de verset : un verset garde sa progression quand il change de catégorie, et un même verset présent dans plusieurs catégories partage la sienne.

## Articles

La page Articles ne lit rien dans la base : le catalogue vit dans le dépôt, `articles/articles.json`, et la fabrication le pose dans la page. Sa forme : `{"categories": [{"id", "nom", "sections": [{"id", "nom"}]}], "articles": [{"fichier", "question", "extrait", "categorie", "section"}]}`. `fichier` est le nom du fichier dans le coffre (lettres, chiffres, points, tirets, `.html`) ; `question` est le titre de l'article, `extrait` le début de sa réponse, qui paraît sous la question dans la liste ; `section` est facultative. L'ordre du catalogue est l'ordre d'affichage. La fabrication refuse un catalogue où un article vise une catégorie ou une section inconnue, ou un même fichier deux fois. La place de lecture d'un article se garde sur l'appareil (`lv_art_pos_{fichier}`).

Les anciennes données de la page d'avant restent dans le compte, sans page pour les afficher : `art_pages`, `art_code`, `art_medias`, `art_lecture`, `art_qc`, `art_avant`, `meta/art_rubriques` et `meta/art_rubriques_ia_avant`. L'IA du site lit encore ces anciens articles.

## Ressources

La page Ressources n'existe plus : ses données restent dans le compte et dans le coffre, et l'IA du site les lit encore. Même organisation que les anciens articles, avec ses propres noms : `ressources`, `res_code`, `res_medias`, `res_lecture`, `res_qc`, `res_avant`, `meta/res_rubriques` et `meta/res_rubriques_ia_avant`. Une ressource porte en plus une espèce (code, image, PDF, lien) et une marque (livre, diagramme, cours, parcours…) : `marque` est celle qui s'affiche, `marqueIA` dit qu'elle vient de l'IA au dépôt du fichier (elle peut alors la revoir au dépôt suivant), et `marqueDevinee` garde, pour les fiches plus anciennes, la marque qui leur avait été trouvée.

## Étude

| Chemin | Contenu |
|---|---|
| `users/{uid}/etude_lecture/{id}` | La mémoire de lecture du parcours (`parcours`) et de chaque fichier de cours (`c_` suivi du nom du fichier) : l'état du contenu (`etat` : page, sections ouvertes, réglages), la place de lecture (`pos`) et la progression (`prog` : sujets du parcours, « Je sais… » cochés d'un cours), chacun avec son heure (`etatMaj`, `posMaj`, `progMaj`). `_reglages` garde la taille du texte commune au parcours et aux cours (`taille`, en crans depuis le plus grand). Les mêmes valeurs vivent dans le stockage de l'appareil, rangées sous le compte connecté (`lv_etu_<uid>_…`, et `lv_etu_v_…` pour qui n'est pas connecté), pour que deux personnes sur un même navigateur ne partagent pas leur progression ; à l'ouverture, la plus récente l'emporte. |

## Anciens commentaires bibliques

Le site n'a plus de commentaires bibliques. Leurs données restent dans la base, sans page pour les écrire ni pour les afficher : `users/{uid}/commentaires/{id}` (les commentaires) et `users/{uid}/medias/{id}` (leurs images), puis leurs copies affichées autrefois dans la Bible, `public_commentaires/{id}` et `public_medias/{id}`.

## La conversation avec l'IA

| Chemin | Contenu |
|---|---|
| `users/{uid}/questions/{id}` | Une conversation avec l'IA (sur un passage, sur toute une page, ou libre) : le passage (et l'endroit où la page est rangée, pour la relire), la conversation telle que l'IA la relit (pour la continuer), les questions et réponses affichées (avec la réflexion, les étapes, les sources, les pages créées, les pièces jointes), les dates. Gardée après chaque réponse ; « Mes questions » la rouvre. Au-delà de 900 000 octets, les messages et les échanges complets partent en tranches sous `msgs/m`, et la fiche garde un résumé de chaque échange (`msgsN` le signale). |
| `users/{uid}/qa_pieces/{id}` | Les images et PDF joints à une conversation, en tranches au-delà d'un mégaoctet ; la conversation n'en garde que l'identifiant. |
| `users/{uid}/meta/ia_memoire` | La mémoire de l'IA du site : une liste de lignes, tenue par l'IA et corrigée par Emmanuel. Sans lien avec la mémoire de Claude. |
| `users/{uid}/ia_textes/{a_id ou r_id}` | Le texte lisible d'un article (`a_`) ou d'une ressource (`r_`), tiré de sa page et gardé avec la date de la page, pour que l'IA cherche dans la bibliothèque sans relire chaque page. |

## Le coffre R2

Le coffre est le bucket `lumen-ressources` de Cloudflare R2, sans accès public. Ses clés vivent dans les variables secrètes de Netlify et dans les secrets du dépôt GitHub (`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`), nulle part ailleurs.

| Rangement | Contenu |
|---|---|
| `cours/{fichier}.html` | Les fichiers de cours d'Étude, rangés compressés (gzip) par le robot et servis à `/parcours/cours/{fichier}.html`, l'adresse qu'ils avaient sur le site. Le dépôt garde leur sommaire (`parcours/cours-sommaire.json` : poids, empreinte, cours réunis). |
| `articles/{fichier}.html` | Les articles, rangés compressés par le robot et servis à `/articles/{fichier}.html`. Le dépôt garde leur catalogue (`articles/articles.json`). |
| `meditations/…` | La méditation du jour : `{AAAA-MM-JJ}.json` (titre, sujet, résumé, texte affiché, texte préparé pour la voix, voix faite ou non, durée, moment où la voix dit chaque mot affiché), `{AAAA-MM-JJ}.mp3` (sa voix), `journal.json` (les méditations parues avec leur résumé, que l'IA lit pour ne pas se répéter, et la durée de chacune), `etat.json` (où en est la fabrique : faite, en pause, crédits épuisés, panne, avec les crédits ElevenLabs), `reglages.json` (la pause) et `essais/{AAAA-MM-JJ}.json` (les pannes du jour, trois pour le texte et trois pour la voix au plus). Écrite par les fonctions de `netlify/functions/`, servie à l'accueil par `/api/meditation` (`netlify/edge-functions/meditation.js`), derrière la porte, pour les trente derniers jours et seulement avec sa voix ; l'état et la pause ne répondent qu'au compte d'Emmanuel. Au-delà de trente jours, l'horloge efface la méditation, sa voix et ses essais ; `journal.json` oublie chaque méditation un an après sa parution. |
| `res_code/…`, `art_code/…`, `res_avant/…`, `art_avant/…`, `res_medias/…`, `art_medias/…`, `arrivees/…`, `a-ranger/…`, `index/…` | Les anciennes pages, copies et fichiers joints des ressources et des articles de la page d'avant, sans page pour les afficher. L'IA du site lit encore leurs pages. |

Le navigateur lit le coffre par `/fichiers/{clé}`, `/parcours/cours/{fichier}` et `/articles/{fichier}` : c'est `netlify/edge-functions/fichiers.js`. `/fichiers/` ne répond qu'au compte d'Emmanuel, d'après le jeton de connexion joint à la demande (ce sont ses anciennes ressources, qui ne deviendront pas publiques) ; les cours et les articles sont ouverts à tous. `/api/fichiers` (adresse d'envoi signée, copie, effacement, liste, écriture d'une petite liste) ne répond qu'au compte d'Emmanuel.

### Le robot du coffre

L'espace de travail de Claude ne joint pas Cloudflare : il passe par GitHub, et le robot `.github/workflows/coffre.yml` fait le lien.

- **Envoyer des cours d'Étude.** Claude pousse une branche `envoi/{nom}` qui porte un dossier `envoi/` : les fichiers et `envoi/envoi.json`, de la forme `{"entrees": [{"fichier": "…", "espece": "cours"}]}`. La branche porte aussi `parcours/cours-sommaire.json` à jour (refait par `node fabrication/cours-sommaire.js` et les fichiers) : le robot vérifie chaque fichier contre lui (même empreinte, mêmes cours), refuse tout le lot au moindre écart, sinon met les fichiers, compressés, droit dans `cours/`, puis supprime la branche. Le sommaire entre ensuite dans `main` avec le dépôt.
- **Envoyer des articles.** Même branche `envoi/…`, avec `"espece": "article"` pour chaque fichier. La branche porte le catalogue à jour (`articles/articles.json`), où chaque fichier envoyé est inscrit : le robot refuse tout le lot si l'un ne l'est pas, sinon range les fichiers, compressés, dans `articles/`. Le catalogue entre ensuite dans `main` avec le dépôt, et l'article paraît sur le site.
- **Envoyer la méditation préparée.** La tâche programmée du soir pousse une branche `envoi/meditation-…` avec `"espece": "meditation"` ; le robot range le fichier tel quel dans `meditations/`, s'il n'y est pas déjà. Elle lit le journal par une branche `demande/…` d'espèce « meditation ». Le détail est dans `documentation/meditation.md`.
- **Reprendre pour modifier.** Claude pousse une branche `demande/{nom}` qui porte `demande/demande.json`, de la forme `{"espece": "cours", "titres": ["…"]}` ou `{"espece": "article", "titres": ["…"]}` : un titre nomme un fichier, un cours qu'il contient, ou la question d'un article. Le robot dépose sur la même branche, dans `recu/`, chaque fichier trouvé, décompressé, et `recu/fiches.json` (fichiers trouvés, introuvables). Claude modifie le fichier, le renvoie par une branche `envoi/…`, puis supprime la branche de demande.

## Supprimer un compte

Dans « Mon compte », sous « Déconnexion », « Supprimer mon compte » (`commun/compte.js`) efface pour de bon, après que la personne a confirmé son identité (son mot de passe, ou Google) :

- tout `users/{son identifiant}/`, collection par collection (`bibleNotes`, `categories`, `meta`, `etude_lecture`, `questions` avec `msgs` et `tranches`, `qa_pieces`, `ia_textes`, et les anciennes `art_pages`, `ressources`, `articles`, `res_code`, `art_code`, `commentaires`, `medias`) ; la base est vidée deux fois, à une seconde et demie d'écart, car une page ouverte qui écoute la base pourrait y renvoyer ce qu'elle gardait ;
- ce que l'appareil gardait pour ce compte (Étude, Bible) ;
- le compte lui-même, chez Firebase.

Quand une nouvelle collection apparaît sous `users/{uid}/`, elle s'ajoute à la liste du fichier, et à la page de confidentialité si elle garde une donnée d'une autre sorte. Le compte d'Emmanuel ne voit pas ce lien : le serveur le reconnaît.

La page de confidentialité et des mentions légales (`racine/confidentialite.html`) dit, en langage simple, ce que le site garde et comment l'effacer ; un lien y mène sous « Créer un compte » et dans « Mon compte ».

## Les corbeilles

Mémoriser et les questions à l'IA ont chacun leur corbeille. Ce qui y tombe se remet ou se supprime pour de bon ; au bout de trente jours, cela part de soi-même, au premier passage sur la page. Une conversation à la corbeille porte la date de sa mise au rebut dans `jete`.

## Données anciennes

- `users/{uid}/articles` : les articles de l'ancien éditeur, que la page n'affiche plus ; Emmanuel les supprimera lui-même.
- `users/{uid}/meta/menage_public` : la trace du ménage fait une fois pour toutes dans les anciennes copies publiques des articles et des ressources.

# Les données de Lumen

Les données d'Emmanuel vivent dans la base Firestore du projet Firebase « lumen-veritatis ». Les règles de sécurité (`regles-firestore.txt`) n'ouvrent la base qu'à son compte, connecté et vérifié. Tout ce qui lui appartient se range sous `users/{son identifiant}/`.

Les pages et les fichiers des Articles et des Ressources vivent dans le **coffre R2** (voir plus bas) ; Firestore n'en garde qu'une petite fiche qui dit où ils sont. Ailleurs (commentaires, conversations), un contenu lourd se découpe encore en **tranches** de moins d'un mégaoctet, rangées dans une sous-collection `tranches` sous sa fiche, parce que Firestore refuse un document de plus d'un mégaoctet.

## Bible

| Chemin | Contenu |
|---|---|
| `users/{uid}/bibleNotes/{id}` | Notes, surlignages et signets, une fiche chacun ; les fiches `lv-…` portent les réglages de la page. Notes, surlignages et signets se classent selon la traduction (Chérubin ou Séraphin). |
| `public_commentaires/{id}` | Les commentaires bibliques affichés dans le texte (copiés là par « Afficher dans la Bible »). |
| `public_medias/{id}` | Les images de ces commentaires, en tranches. |

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

| Chemin | Contenu |
|---|---|
| `users/{uid}/art_pages/{id}` | La fiche de chaque article : titre, extrait (le bloc « En bref »), catégorie, rang, dates, taille. |
| `users/{uid}/art_code/{id}` | Où est la page HTML de l'article : `{r2, taille, v}`, `r2` étant sa clé dans le coffre et `v` sa version. |
| `users/{uid}/art_medias/{id}` | Un fichier joint : `{r2, mime, taille, nom, complet, cree}`. |
| `users/{uid}/art_lecture/{id}` | L'endroit où la lecture s'est arrêtée. |
| `users/{uid}/meta/art_rubriques` | Les catégories et sections, et la corbeille des rubriques. |
| `users/{uid}/meta/art_rubriques_ia_avant` | Le rangement d'avant le dernier rangement par l'IA (pour y revenir). |
| `users/{uid}/art_qc/{id}` | Le dernier contrôle qualité de l'article : date, bilan, problèmes relevés, points écartés, et l'état de la dernière correction. |
| `users/{uid}/art_avant/{id}` | Où est la page telle qu'elle était avant la dernière correction par l'IA, ou avant la dernière version déposée par Claude : `{r2, taille, v}`. |

## Ressources

Même organisation qu'Articles, avec ses propres noms : `ressources`, `res_code`, `res_medias`, `res_lecture`, `res_qc`, `res_avant`, `meta/res_rubriques` et `meta/res_rubriques_ia_avant`. Une ressource porte en plus une espèce (code, image, PDF, lien) et une marque (livre, diagramme, cours, parcours…) : `marque` est celle qui s'affiche, `marqueIA` dit qu'elle vient de l'IA au dépôt du fichier (elle peut alors la revoir au dépôt suivant), et `marqueDevinee` garde, pour les fiches plus anciennes, la marque qui leur avait été trouvée.

## Étude

| Chemin | Contenu |
|---|---|
| `users/{uid}/etude_lecture/{id}` | La mémoire de lecture du parcours (`parcours`) et de chaque fichier de cours (`c_` suivi du nom du fichier) : l'état du contenu (`etat` : page, sections ouvertes, réglages), la place de lecture (`pos`) et la progression (`prog` : sujets du parcours, « Je sais… » cochés d'un cours), chacun avec son heure (`etatMaj`, `posMaj`, `progMaj`). `_reglages` garde la taille du texte commune au parcours et aux cours (`taille`, en crans depuis le plus grand). Les mêmes valeurs vivent dans le stockage de l'appareil ; à l'ouverture, la plus récente l'emporte. |

## Commentaires (l'atelier)

| Chemin | Contenu |
|---|---|
| `users/{uid}/commentaires/{id}` | Les commentaires en cours d'écriture et affichés. |
| `users/{uid}/medias/{id}` | Leurs images, en tranches. |

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
| `res_code/{id}/{v}.html`, `art_code/{id}/{v}.html` | La page d'une ressource ou d'un article. Chaque version s'écrit sous une clé neuve, la fiche bascule d'un coup, puis l'ancienne version s'efface. |
| `res_avant/{id}/{v}.html`, `art_avant/{id}/{v}.html` | La copie « avant correction ». |
| `res_medias/{id}/{nom}`, `art_medias/{id}/{nom}` | Les fichiers joints (images, PDF). |
| `arrivees/{date}/…` | Les fichiers que le robot vient d'envoyer, en attente d'être rangés. |
| `a-ranger/{ressources ou articles}/{date}.json` | La liste « à ranger » laissée par le robot : pour chaque fichier, son espèce, son titre, sa marque, son rangement par noms (`["Bible", "Genèse"]`) et, s'il remplace un élément, l'identifiant de cet élément (`remplace`). |
| `cours/{fichier}.html` | Les fichiers de cours d'Étude, rangés compressés (gzip) par le robot et servis à `/parcours/cours/{fichier}.html`, l'adresse qu'ils avaient sur le site. Le dépôt garde leur sommaire (`parcours/cours-sommaire.json` : poids, empreinte, cours réunis). |
| `index/{ressources ou articles}.json` | La liste des éléments (identifiant, titre, rangement, espèce, marque, date), que la page réécrit quand elle change ; le robot s'en sert pour retrouver une page par son titre. |

Le navigateur lit le coffre par `/fichiers/{clé}`, et lui parle par `/api/fichiers` (adresse d'envoi signée, copie, effacement, liste, écriture d'une petite liste) : c'est `netlify/edge-functions/fichiers.js`, qui vérifie la porte à mot de passe et, pour `/api/fichiers`, le compte d'Emmanuel. Le navigateur envoie un fichier directement au coffre, par une adresse signée valable un quart d'heure ; pour cela, le coffre porte une règle CORS qui accepte `https://lumenveritatis.net` (méthodes PUT et GET, en-tête `content-type`).

À l'ouverture de Ressources ou d'Articles, la page (`commun/coffre.js`) range les arrivées (elle crée les fiches et les rubriques qui manquent ; un fichier qui remplace un élément garde la version d'avant, que le ⋯ du contrôle qualité propose de remettre), puis réécrit l'index.

### Le robot du coffre

L'espace de travail de Claude ne joint pas Cloudflare : il passe par GitHub, et le robot `.github/workflows/coffre.yml` fait le lien.

- **Envoyer.** Claude pousse une branche `envoi/{nom}` qui porte un dossier `envoi/` : les fichiers (pages HTML, images, PDF) et `envoi/envoi.json`, de la forme `{"entrees": [{"fichier": "…", "espece": "ressources", "titre": "…", "marque": "cours", "rubrique": ["Bible", "Genèse"], "remplace": "…"}]}` (seul `fichier` est obligatoire ; `espece` vaut `ressources` par défaut, `remplace` donne l'identifiant de l'élément à remplacer). Le robot envoie les fichiers dans `arrivees/`, écrit la liste « à ranger », puis supprime la branche. Les fichiers paraissent sur le site à la prochaine ouverture de la page.
- **Envoyer des cours d'Étude.** Même branche `envoi/…`, avec `"espece": "cours"` pour chaque fichier. La branche porte aussi `parcours/cours-sommaire.json` à jour (refait par `node fabrication/cours-sommaire.js` et les fichiers) : le robot vérifie chaque fichier contre lui (même empreinte, mêmes cours), refuse tout le lot au moindre écart, sinon met les fichiers, compressés, droit dans `cours/`. Repris par une branche `demande/…`, un cours revient décompressé. Le sommaire entre ensuite dans `main` avec le dépôt.
- **Reprendre pour modifier.** Claude pousse une branche `demande/{nom}` qui porte `demande/demande.json`, de la forme `{"espece": "ressources", "titres": ["…"], "ids": ["…"]}`. Le robot dépose sur la même branche, dans `recu/`, la dernière version de chaque page trouvée et `recu/fiches.json` (identifiant, titre, rangement). Claude modifie la page, puis la renvoie par une branche `envoi/…` avec `"remplace": "{identifiant}"` ; il supprime ensuite la branche de demande. Pour un cours, `{"espece": "cours", "titres": ["…"]}` nomme un fichier ou un cours qu'il contient ; le cours modifié repart avec l'espèce « cours ».

### Le déménagement

Les contenus rangés autrefois dans Firestore (champ `code`, ou tranches `{n, gen}`) se lisent toujours. Le bandeau en tête de Ressources et d'Articles propose de les déménager : chaque contenu part dans le coffre, est relu et comparé, puis sa fiche reçoit `r2` et `verifie: true` en gardant l'original. Quand tout est vérifié, « Libérer la place » retire les originaux de Firestore.

## Les corbeilles

Articles, Ressources, Mémoriser et les questions à l'IA ont chacun leur corbeille. Ce qui y tombe se remet ou se supprime pour de bon ; au bout de trente jours, cela part de soi-même, au premier passage sur la page. Une conversation à la corbeille porte la date de sa mise au rebut dans `jete`.

## Données anciennes

- `users/{uid}/articles` : les articles de l'ancien éditeur, que la page n'affiche plus ; Emmanuel les supprimera lui-même.
- `users/{uid}/meta/menage_public` : la trace du ménage fait une fois pour toutes dans les anciennes copies publiques des articles et des ressources.

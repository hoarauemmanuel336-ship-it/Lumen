# Les données de Lumen

Les données d'Emmanuel vivent dans la base Firestore du projet Firebase « lumen-veritatis ». Les règles de sécurité (`regles-firestore.txt`) n'ouvrent la base qu'à son compte, connecté et vérifié. Tout ce qui lui appartient se range sous `users/{son identifiant}/`.

Un contenu lourd (une page HTML, un fichier) se découpe en **tranches** de moins d'un mégaoctet, rangées dans une sous-collection `tranches` sous sa fiche, parce que Firestore refuse un document de plus d'un mégaoctet.

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
| `config/memoriser` | La bibliothèque de départ en ligne : la page la relit au chargement et la préfère, quand elle existe, à celle qu'elle embarque. La fabrication, elle, embarque dans la page `contenu/memoriser.json`. |
| `users/{uid}/categories/{id}` | Les catégories créées par Emmanuel, avec leurs versets ; un verset vaut `{id, fr: {text, ref}}`. |
| `users/{uid}/meta/progress` | La progression : la couleur et l'historique de chaque verset, par identifiant de verset. |
| `users/{uid}/meta/prefs` | Les catégories choisies, les versets écartés des séries. |
| `users/{uid}/meta/baseEdits` | Ses retouches sur les catégories de la bibliothèque de départ. |
| `users/{uid}/meta/sections` | Les sections qui regroupent les catégories. |
| `users/{uid}/meta/trash` | La corbeille. |

La progression est rangée par identifiant de verset : un verset garde sa progression quand il change de catégorie, et un même verset présent dans plusieurs catégories partage la sienne.

## Articles

| Chemin | Contenu |
|---|---|
| `users/{uid}/art_pages/{id}` | La fiche de chaque article : titre, extrait (le bloc « En bref »), catégorie, rang, dates, taille. |
| `users/{uid}/art_code/{id}` | La page HTML de l'article (en tranches au-delà de 900 000 octets). |
| `users/{uid}/art_medias/{id}` | Fichiers joints, en tranches. |
| `users/{uid}/art_lecture/{id}` | L'endroit où la lecture s'est arrêtée. |
| `users/{uid}/meta/art_rubriques` | Les catégories et sections, et la corbeille des rubriques. |
| `users/{uid}/meta/art_rubriques_ia_avant` | Le rangement d'avant le dernier rangement par l'IA (pour y revenir). |
| `users/{uid}/art_qc/{id}` | Le dernier contrôle qualité de l'article : date, bilan, problèmes relevés, points écartés, et l'état de la dernière correction. |
| `users/{uid}/art_avant/{id}` | La page telle qu'elle était avant la dernière correction par l'IA (en tranches au-delà de 900 000 octets). |

## Ressources

Même organisation qu'Articles, avec ses propres noms : `ressources`, `res_code`, `res_medias`, `res_lecture`, `res_qc`, `res_avant`, `meta/res_rubriques` et `meta/res_rubriques_ia_avant`. Une ressource porte en plus une espèce (code, image, PDF, lien) et une marque (livre, diagramme, cours, parcours…) : `marque` est celle qui s'affiche, `marqueIA` dit qu'elle vient de l'IA au dépôt du fichier (elle peut alors la revoir au dépôt suivant), et `marqueDevinee` garde, pour les fiches plus anciennes, la marque qui leur avait été trouvée.

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

## Les corbeilles

Articles, Ressources, Mémoriser et les questions à l'IA ont chacun leur corbeille. Ce qui y tombe se remet ou se supprime pour de bon ; au bout de trente jours, cela part de soi-même, au premier passage sur la page. Une conversation à la corbeille porte la date de sa mise au rebut dans `jete`.

## Données anciennes

- `users/{uid}/articles` : les articles de l'ancien éditeur, que la page n'affiche plus ; Emmanuel les supprimera lui-même.
- `users/{uid}/meta/menage_public` : la trace du ménage fait une fois pour toutes dans les anciennes copies publiques des articles et des ressources.

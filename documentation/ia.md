# L'IA dans Lumen

Pour les modèles de langage (LLM), le site utilise uniquement Anthropic, par l'API Claude. Chaque usage reçoit le modèle qui donne le meilleur rapport qualité-prix pour ce qu'il demande. C'est Emmanuel qui décide quels usages ajouter.

## Le passage vers l'API

Tout appel passe par `netlify/edge-functions/ia.js`, à l'adresse `/api/ia` :

1. La page envoie la tâche et ses données, avec le jeton de connexion d'Emmanuel.
2. Le serveur demande à Google à qui appartient ce jeton ; seul le compte d'Emmanuel, vérifié, est accepté.
3. Le serveur construit la demande (consignes, modèle, forme de la réponse), l'envoie à l'API avec la clé `ANTHROPIC_API_KEY` réglée dans Netlify, et relaie la réponse au fil de l'eau. La page la lit à mesure qu'elle arrive, ce qui évite tout délai d'attente.

Les consignes et la forme de la réponse vivent dans le serveur, tâche par tâche. Côté pages, `commun/ia.js` porte l'appel et ce que la page fait de la réponse.

La consommation se paie sur les crédits API compris dans l'abonnement Max d'Emmanuel (console : platform.claude.com). Quand les crédits du mois sont épuisés, l'IA du site s'arrête jusqu'au mois suivant.

## Les usages en place

| Usage | Où | Modèle | Pourquoi ce modèle |
|---|---|---|---|
| Ranger | « Organiser », puis « Ranger avec l'IA », dans Articles et Ressources | Claude Sonnet 5.5 | Réorganiser une bibliothèque demande du jugement ; Sonnet le fait presque aussi finement qu'Opus, plus vite et pour moitié prix. |
| Contrôler | « Contrôle qualité » dans le ⋯ d'un article ou d'une ressource HTML | Claude Opus 5.5, avec réflexion | Relire le fond (doctrine, citations, exactitude) est un travail exigeant ; Opus le fait au niveau voulu pour deux fois moins que Fable. |
| Conversation | L'icône de l'IA dans la barre du haut (toutes les pages), « Demander à l'IA » sur un texte sélectionné, le bouton de l'IA dans une ressource ou un article ouvert | Claude Opus 5.5, avec réflexion, recherche sur internet et les outils du site | Une réponse de doctrine ou d'exégèse doit être juste avant tout, et la conversation peut composer un livre ou un cours entier : c'est le travail du plus grand modèle. |
| Corriger | « Corriger », dans l'écran du contrôle qualité | Claude Opus 5.5, avec réflexion | Corriger sans abîmer le reste de la page demande la même finesse que la relecture. |
| Nommer | Le dépôt d'un fichier HTML dans un article ou une ressource | Claude Haiku 5.5 | Donner un titre juste et reconnaître la forme d'une page est une tâche courte et nette ; le plus léger des modèles la fait bien pour une fraction de centime. |

**Ranger.** L'IA reçoit les catégories et sections actuelles et, pour chaque élément, son titre, sa description, son endroit et un aperçu de son contenu (les titres de ses parties et le début du texte, 1 800 signes au plus), lu dans la page avant l'envoi. Elle rend un rangement complet : elle peut créer, renommer, fusionner, déplacer et supprimer des catégories et des sections, jusqu'à cinq niveaux, et placer chaque élément une fois. Le rangement s'applique aussitôt, sans validation (choix d'Emmanuel). Le rangement d'avant est gardé : « Organiser », puis « Revenir au rangement d'avant ».

**Contrôler.** L'IA reçoit la page HTML entière et, pour chaque référence biblique que la page cite, le texte des deux Bibles du site (la page repère les références et va chercher les versets elle-même). Elle examine le fond, l'Écriture, la forme et le fonctionnement sous les trois angles qu'Emmanuel a fixés : au regard de ses instructions et de la skill qui a fait la page, à son niveau et avec toutes ses compétences, tout est-il correct ? pourrait-elle faire mieux ? ferait-elle la même chose aujourd'hui ? Elle rend un bilan puis les problèmes classés en « grave », « à revoir » et « mineur », chacun avec son endroit, le passage fautif, le constat et la correction proposée. Avant chaque contrôle, on choisit ce qu'il examine : le contenu, la partie technique (code, apparence, fonctionnement) ou les deux. Le contrôle seul ne change rien à la page. En mode « Choisir », dans Articles et Ressources, « Contrôle qualité » contrôle plusieurs éléments d'un coup, l'un après l'autre. Le dernier rapport de chaque élément est gardé ; « Copier le rapport » le met en texte simple.

**Corriger.** Dans le rapport, chaque problème se coche ou se décoche (tous cochés d'emblée). « Corriger » envoie à l'IA la page, les points cochés et les versets cités. Elle ne réécrit pas la page entière, qu'un livre rendrait trop longue : elle rend des remplacements, chacun un passage exact de la page et ce qui le remplace, et peut laisser un point en disant pourquoi. La page applique les remplacements dont le passage s'y trouve une seule fois, enregistre aussitôt la page corrigée (choix d'Emmanuel : « il faut surtout qu'elle puisse corriger l'artefact »), et dit dans le rapport ce qui n'a pas pu l'être. La version d'avant est gardée : « Revenir à la version d'avant » la remet.

**Nommer.** Quand un fichier HTML est déposé dans l'éditeur d'un article ou d'une ressource, l'IA reçoit le nom du fichier, le titre écrit dans la page, le début et la fin du code et un aperçu du texte. Sans titre donné, elle donne à la page son vrai titre, qui nomme le sujet sans nommer la forme (l'icône la dit) ; un titre retouché à la main entre-temps est gardé. Pour une ressource, elle donne aussi la marque (diagramme, livre, cours, parcours, carte ou aucune) d'après la page et les descriptions des skills ; une marque choisie à la main reste celle d'Emmanuel (`marqueIA` retient qu'une marque vient de l'IA). Le cercle tourne à côté du nom du fichier pendant qu'elle lit. Une panne laisse le titre tiré du fichier.

**Conversation.** Emmanuel : « quelque chose d'aussi abouti que Claude sur tous les aspects ». Le panneau de l'IA s'ouvre de trois façons : l'icône de l'IA dans la barre du haut de chaque page (conversation libre, ou celle en cours) ; un texte sélectionné, qui fait paraître deux icônes collées, copier et demander à l'IA (dans la Bible, elles prennent place dans le petit menu de la sélection, collées à « Retirer ») ; le bouton de l'IA au bout du bandeau d'une ressource ou d'un article ouvert, qui interroge toute la page. Le panneau est un salon de discussion : le passage en tête quand il y en a un, puis les messages. On peut joindre des images ou des PDF (trombone, collage, glisser-déposer ; 4,5 Mo par pièce, cinq par message), arrêter une réponse en cours (le bouton d'envoi devient un carré), relancer la dernière réponse, modifier une question (la conversation repart d'elle). Chaque réponse montre, repliés, le résumé de la réflexion de l'IA et ce qu'elle a fait, puis son texte (titres, listes, tableaux, citations), ses sources prises sur internet et les pages qu'elle a créées.

L'IA reçoit la conversation, ses instructions, la mémoire du site, le passage et le texte qui l'entoure, et tout le texte de la page d'où vient la question (toutes les leçons d'un cours, tous les chapitres d'un livre). Ses outils :
- **lire_versets** : le texte exact des versets, lu dans les deux Bibles du site (`commun/versets.js`).
- **chercher_bibliotheque**, **lire_element** : les articles, les ressources, les commentaires bibliques et les notes de la Bible. Le texte de chaque page HTML se tire une fois de son code puis se garde dans `ia_textes` avec sa date ; la première recherche lit toute la bibliothèque, les suivantes vont vite.
- **chercher_conversations** : les conversations passées (« Mes questions »).
- **memoire** : la mémoire propre au site (voir plus bas).
- **lire_skill**, **creer_page** : un livre, un diagramme, un cours ou un parcours, composé avec la skill, assemblé dans la page avec le moteur de la skill (`commun/assemblage.js`, servi depuis `/ia-moteurs/`) et rangé au premier niveau de Ressources avec sa marque ; un article, rangé dans Articles. Une réponse coupée au milieu d'une création (trop longue) reprend une fois en plus court.
- **web_search**, **web_fetch** : la recherche sur internet et la lecture d'une page web, qui tournent chez Anthropic.

Les outils du site s'exécutent dans la page (`commun/question.js`, `commun/ia-outils.js`). Chaque conversation est gardée dans le compte après chaque réponse ; « Mes questions » (dans le panneau et dans « Mon compte ») les rouvre, les cherche, et on peut les continuer. Une poubelle en met une à la corbeille, et « Choisir » en met plusieurs ou toutes ; la corbeille les remet ou les supprime pour de bon, et se vide d'elle-même au bout de trente jours. Comme dans Claude, une conversation n'a aucune limite en nombre de messages : quand elle approche de ce que l'IA peut lire d'un coup (seuil de 600 000 tokens, sur une fenêtre d'un million), l'API résume elle-même les échanges les plus anciens, d'après une consigne qui garde le passage, les réponses établies, les versets, les sources et les pages créées, puis la conversation continue (fonction en bêta chez Anthropic, en-tête `compact-2026-01-12`). La page garde tout l'échange pour l'affichage, et n'envoie à l'IA que le résumé et ce qui le suit. La conversation se garde en cache d'un message à l'autre, ce qui en réduit le coût.

**La mémoire.** Emmanuel : « l'IA doit avoir la mémoire, juste pas synchronisée avec Claude ». Une liste de lignes (`meta/ia_memoire`) que l'IA reçoit à chaque message et tient à jour par l'outil memoire : qui il est, ce qu'il étudie, ses projets, ses préférences sur les réponses. « Mémoire », dans « Mes questions » et dans « Mon compte », la montre et la corrige. Elle n'a aucun lien avec la mémoire de Claude.

Dans Articles et Ressources, la page tourne dans un cadre isolé : le cadre dit seulement ce qui y est sélectionné, et c'est la page du site qui montre le bouton.

## Les skills et les instructions d'Emmanuel

Le contrôle, la correction et la conversation lisent ses instructions personnalisées (`ia/instructions.md`) et la skill qui a fait la page, d'après sa marque : article-html pour un article, livre-html, diagrammes-interactifs, cours-html ou parcours-etude pour une ressource. La conversation lit une skill entière quand elle compose une page (le serveur la rend sans appel à l'IA, tâche « skill »). Les moteurs des quatre skills de ressources sont copiés à la fabrication dans `/ia-moteurs/`, où la page les lit pour assembler. La fabrication réunit le texte des SKILL.md et les instructions dans `netlify/savoir/savoir.js`, que lit le serveur ; les moteurs des skills restent dans le dépôt, pour que chaque skill y soit complète. Ces copies suivent celles de Claude (voir CLAUDE.md) ; la mémoire de Claude n'en fait pas partie.

## Choisir le modèle

Anthropic sort souvent de nouveaux modèles. Le choix ne repose donc sur aucune liste figée : à chaque nouvel usage, et quand une nouvelle génération de modèles paraît, l'IA consulte la gamme du moment et ses prix dans la documentation d'Anthropic (platform.claude.com/docs, page « Models overview »), puis retient pour chaque tâche le modèle au meilleur rapport qualité-prix. Elle met ensuite à jour le tableau des usages ci-dessus et le modèle écrit dans `netlify/edge-functions/ia.js`.

Les repères qui ne changent pas d'une génération à l'autre : le plus petit modèle de la gamme sert les tâches simples et répétées (classer, extraire, proposer une catégorie) ; le modèle intermédiaire sert le quotidien, où il faut à la fois du jugement et de la rapidité ; le plus grand sert le travail exigeant (écrire un contenu, relire le fond, comparer des traductions).

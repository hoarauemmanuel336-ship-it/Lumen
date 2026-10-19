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
| Question | « Demander à l'IA » sur un texte sélectionné dans un article, une ressource ou la Bible | Claude Opus 5.5 | Une réponse de doctrine ou d'exégèse doit être juste avant tout ; pour une réponse courte, Opus coûte à peine plus d'un centime. |
| Corriger | « Corriger », dans l'écran du contrôle qualité | Claude Opus 5.5, avec réflexion | Corriger sans abîmer le reste de la page demande la même finesse que la relecture. |

**Ranger.** L'IA reçoit les catégories et sections actuelles et, pour chaque élément, son titre, sa description, son endroit et un aperçu de son contenu (les titres de ses parties et le début du texte, 1 800 signes au plus), lu dans la page avant l'envoi. Elle rend un rangement complet : elle peut créer, renommer, fusionner, déplacer et supprimer des catégories et des sections, jusqu'à cinq niveaux, et placer chaque élément une fois. Le rangement s'applique aussitôt, sans validation (choix d'Emmanuel). Le rangement d'avant est gardé : « Organiser », puis « Revenir au rangement d'avant ».

**Contrôler.** L'IA reçoit la page HTML entière et, pour chaque référence biblique que la page cite, le texte des deux Bibles du site (la page repère les références et va chercher les versets elle-même). Elle examine le fond, l'Écriture, la forme et le fonctionnement, et rend un bilan puis les problèmes classés en « grave », « à revoir » et « mineur », chacun avec son endroit, le passage fautif, le constat et la correction proposée. Avant chaque contrôle, on choisit ce qu'il examine : le contenu, la partie technique (code, apparence, fonctionnement) ou les deux. Le contrôle seul ne change rien à la page. En mode « Choisir », dans Articles et Ressources, « Contrôle qualité » contrôle plusieurs éléments d'un coup, l'un après l'autre. Le dernier rapport de chaque élément est gardé ; « Copier le rapport » le met en texte simple.

**Corriger.** Dans le rapport, chaque problème se coche ou se décoche (tous cochés d'emblée). « Corriger » envoie à l'IA la page, les points cochés et les versets cités. Elle ne réécrit pas la page entière, qu'un livre rendrait trop longue : elle rend des remplacements, chacun un passage exact de la page et ce qui le remplace, et peut laisser un point en disant pourquoi. La page applique les remplacements dont le passage s'y trouve une seule fois, enregistre aussitôt la page corrigée (choix d'Emmanuel : « il faut surtout qu'elle puisse corriger l'artefact »), et dit dans le rapport ce qui n'a pas pu l'être. La version d'avant est gardée : « Revenir à la version d'avant » la remet.

**Question.** Un texte sélectionné fait paraître deux icônes collées, copier et demander à l'IA (dans la Bible, elles prennent place dans le petit menu de la sélection, collées à « Retirer »). Le panneau montre le passage, puis la conversation ; on peut poser plusieurs questions à la suite. Chaque conversation est gardée dans le compte après chaque réponse ; « Mes questions » (dans le panneau et dans « Mon compte ») la rouvre, et on peut la continuer. Une poubelle en met une à la corbeille, et « Choisir » en met plusieurs ou toutes ; la corbeille, au bout de la liste, les remet ou les supprime pour de bon, et se vide d'elle-même au bout de trente jours. L'IA reçoit le passage, le texte qui l'entoure, la conversation et les instructions d'Emmanuel. Pour citer un verset, elle demande son texte exact par l'outil lire_versets ; la page le lit dans les deux Bibles du site (`commun/versets.js`) et le lui rend. Dans Articles et Ressources, la page tourne dans un cadre isolé : le cadre dit seulement ce qui y est sélectionné, et c'est la page du site qui montre le bouton (`commun/question.js`).

## Les skills et les instructions d'Emmanuel

Le contrôle et la correction lisent ses instructions personnalisées (`ia/instructions.md`) et la skill qui a fait la page, d'après sa marque : article-html pour un article, livre-html, diagrammes-interactifs, cours-html ou parcours-etude pour une ressource. La fabrication réunit le texte des SKILL.md et les instructions dans `netlify/savoir/savoir.js`, que lit le serveur ; les moteurs des skills restent dans le dépôt, pour que chaque skill y soit complète. Ces copies suivent celles de Claude (voir CLAUDE.md) ; la mémoire de Claude n'en fait pas partie.

## Choisir le modèle

Anthropic sort souvent de nouveaux modèles. Le choix ne repose donc sur aucune liste figée : à chaque nouvel usage, et quand une nouvelle génération de modèles paraît, l'IA consulte la gamme du moment et ses prix dans la documentation d'Anthropic (platform.claude.com/docs, page « Models overview »), puis retient pour chaque tâche le modèle au meilleur rapport qualité-prix. Elle met ensuite à jour le tableau des usages ci-dessus et le modèle écrit dans `netlify/edge-functions/ia.js`.

Les repères qui ne changent pas d'une génération à l'autre : le plus petit modèle de la gamme sert les tâches simples et répétées (classer, extraire, proposer une catégorie) ; le modèle intermédiaire sert le quotidien, où il faut à la fois du jugement et de la rapidité ; le plus grand sert le travail exigeant (écrire un contenu, relire le fond, comparer des traductions).

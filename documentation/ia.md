# L'IA dans Lumen

Le site utilise uniquement les modèles d'Anthropic, par l'API Claude. Chaque usage reçoit le modèle qui donne le meilleur rapport qualité-prix pour ce qu'il demande. C'est Emmanuel qui décide quels usages ajouter.

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

**Ranger.** L'IA reçoit les catégories et sections actuelles et, pour chaque élément, son titre, sa description et son endroit. Elle rend un rangement complet : elle peut créer, renommer, fusionner, déplacer et supprimer des catégories et des sections, jusqu'à cinq niveaux, et placer chaque élément une fois. Le rangement s'applique aussitôt, sans validation (choix d'Emmanuel). Le rangement d'avant est gardé : « Organiser », puis « Revenir au rangement d'avant ».

## Choisir le modèle

Anthropic sort souvent de nouveaux modèles. Le choix ne repose donc sur aucune liste figée : à chaque nouvel usage, et quand une nouvelle génération de modèles paraît, l'IA consulte la gamme du moment et ses prix dans la documentation d'Anthropic (platform.claude.com/docs, page « Models overview »), puis retient pour chaque tâche le modèle au meilleur rapport qualité-prix. Elle met ensuite à jour le tableau des usages ci-dessus et le modèle écrit dans `netlify/edge-functions/ia.js`.

Les repères qui ne changent pas d'une génération à l'autre : le plus petit modèle de la gamme sert les tâches simples et répétées (classer, extraire, proposer une catégorie) ; le modèle intermédiaire sert le quotidien, où il faut à la fois du jugement et de la rapidité ; le plus grand sert le travail exigeant (écrire un contenu, relire le fond, comparer des traductions).

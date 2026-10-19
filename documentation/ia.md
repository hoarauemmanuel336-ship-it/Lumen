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

## Les modèles disponibles

| Modèle | Identifiant | Pour quoi |
|---|---|---|
| Claude Haiku 5.5 | `claude-haiku-5-5` | Petites tâches rapides et répétées : classer, extraire, proposer une catégorie. |
| Claude Sonnet 5.5 | `claude-sonnet-5-5` | Le quotidien : le meilleur équilibre entre vitesse et intelligence. |
| Claude Opus 5.5 | `claude-opus-5-5` | Le travail exigeant : écrire un contenu, relire le fond, comparer des traductions. |
| Claude Fable 5.1 | `claude-fable-5-1` | Les cas les plus difficiles, quand Opus ne suffit pas. |

Les prix et les modèles évoluent : la référence est la documentation d'Anthropic (platform.claude.com/docs, page « Models overview »).

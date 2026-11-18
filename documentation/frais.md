# Les frais du site : ce qui peut coûter, et comment tout plafonner

Le site s'appuie sur cinq services. Chacun a une offre gratuite ; certains peuvent facturer au-delà. Cette fiche dit, service par service, ce qui se passe quand l'offre gratuite est dépassée, et le réglage qui empêche toute facture surprise. Le principe est le même partout : **quand la limite est atteinte, le service s'arrête au lieu de facturer**. Le site peut alors être indisponible quelques jours ; le compte bancaire, lui, ne bouge pas.

## Ce que le site fait déjà

- **L'IA et la voix ne coûtent qu'à Emmanuel, et seulement pour lui.** La conversation avec l'IA n'utilise la clé du site que pour le compte d'Emmanuel ; tout autre compte doit donner sa propre clé de l'API Anthropic, et c'est lui qui paie ses questions. La méditation du jour coûte la même chose qu'il y ait un lecteur ou dix mille : elle s'écrit et se lit une fois par jour, puis se sert depuis le coffre.
- **Le coffre R2 ne se fait jamais lire en boucle par un même lecteur** : les cours, les articles et la méditation restent dans la mémoire du navigateur une fois lus.
- **Les anciens fichiers du coffre sont réservés au compte d'Emmanuel** : personne d'autre ne peut les télécharger.

## Les réglages à faire, service par service

### Netlify (l'hébergement)

Netlify compte l'usage en crédits (visites, données envoyées, fonctions). Sur l'offre gratuite (300 crédits par mois), c'est une limite ferme : une fois les crédits épuisés, le site se met en pause jusqu'au mois suivant, sans aucune facture. Sur une offre payante, la « recharge automatique » achète des crédits à mesure ; elle est éteinte par défaut.

À vérifier : dans Netlify, « Team settings » puis « Billing » (ou « Usage & billing ») : soit l'offre est **Free**, soit la **recharge automatique (Auto recharge) est éteinte**.

### Firebase (les comptes et la base de données)

Deux offres : **Spark**, gratuite, qui s'arrête à ses quotas (50 000 lectures, 20 000 écritures et 20 000 suppressions par jour, 1 Go gardé) et ne peut jamais facturer ; **Blaze**, qui continue au-delà et facture, sans plafond possible (les alertes de budget préviennent, elles n'arrêtent rien).

Le site n'a besoin que de la connexion et de la base : **Spark suffit**. À vérifier : dans la console Firebase, en bas de la colonne de gauche, le nom de l'offre. Si c'est Blaze, repasser en Spark (« Modifier l'offre »), sauf si un autre projet Google en dépend.

Avec Spark, si un jour il y a beaucoup de lecteurs, la base peut s'arrêter jusqu'au lendemain (le compteur repart chaque jour vers midi, heure de La Réunion). Ce jour-là, il sera temps d'en reparler.

### Cloudflare R2 (le coffre)

Gratuit jusqu'à 10 Go gardés, 1 million d'écritures et 10 millions de lectures par mois ; l'envoi des fichiers aux lecteurs est toujours gratuit. Au-delà, la facture est petite (36 centimes de dollar par million de lectures) mais sans plafond, et R2 demande une carte enregistrée.

À faire : dans Cloudflare, « Manage Account » puis « Billing » puis « Billable Usage », « Create budget alert » : une **alerte de budget** à 1 dollar, pour recevoir un courriel dès le premier dollar dépensé. Elle prévient, elle n'arrête rien ; mais à ce prix, le temps de réagir ne coûte que quelques centimes.

### Anthropic (l'IA)

Les crédits de l'API se paient d'avance : quand le solde est vide, l'IA s'arrête. Seule la « recharge automatique » (Auto-reload) peut dépenser plus.

À vérifier : sur platform.claude.com, « Settings » puis « Billing » : **Auto-reload éteint**. Le solde acheté est alors le plafond.

### ElevenLabs (la voix de la méditation)

L'abonnement donne un nombre de crédits par mois ; la méditation se raccourcit d'elle-même quand ils manquent, et s'arrête quand ils sont épuisés. Seul un réglage de paiement au-delà du quota peut dépenser plus : selon l'abonnement, « Usage based billing » ou la recharge automatique de « Pay As You Go » (« Auto Top Up »).

À vérifier : sur elevenlabs.io, « Subscription » puis « Manage Subscription » : **Usage based billing éteint**, et **Auto Top Up éteint** s'il paraît.

## Quand le site deviendra public

Le site est ouvert : les cours, les articles et la méditation pourront être gardés par Netlify au plus près des lecteurs, pour qu'un même fichier ne soit lu qu'une fois dans le coffre : c'est à faire en même temps que l'ouverture.

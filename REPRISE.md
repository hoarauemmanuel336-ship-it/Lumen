# Reprendre le travail sur le bloc « La liturgie et les sacrements »

Sauvegarde : branche GitHub `sauvegarde/liturgie` (à part, sans les fichiers du site). Même méthode que pour le bloc de la doctrine sociale (branche `sauvegarde/doctrine-sociale`, fichier REPRISE.md) : 101 cours (`commandes/*.txt`), un rédacteur par cours avec le message « Lisez d'abord en entier la consigne commune /home/claude/liturgie/consigne.md et suivez-la à la lettre. Vous écrivez le cours de code {code} (fichier {nn}, lettre {x}) : sa commande est /home/claude/liturgie/commandes/{code}.txt. Livrez /home/claude/liturgie/redaction/{code}.html. », puis une relecture par cours (`consigne-relecture.md`). Un cours est écrit quand `redaction/{code}.html` existe ; relu quand il figure dans `relus.txt`.
lances.txt / relances.txt / relus.txt : suivi des lancements (outils/suivant.py)

## État au 18 novembre, 07 h 30
Bloc entier écrit (101/101) et relu (101/101). Assemblé dans /home/claude/lumen/parcours/cours (63 à 74).
36 liens arrière posés (outils/liens-arriere.py), 40 versets Mémoriser (memoriser-lit.py), cours.json et sommaire à jour, fabrication propre.
Prêts en local, NON poussés : branche depot/liturgie (commit aeea319, à pousser sur main) et branche envoi/liturgie (33 fichiers pour le coffre).
On attend le « dépose-le » de l'utilisateur. Ordre : pousser envoi/liturgie, attendre le robot, puis pousser depot/liturgie sur main.

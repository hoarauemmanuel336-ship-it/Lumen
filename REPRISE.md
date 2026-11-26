# Reprise : bloc « Les Pères de l’Église » (60 cours, fichiers 22 à 26)
Répartition : l'ami d'Emmanuel (cette session) fait Pères, Philosophie, Église et Vierge Marie, Morale fondamentale, Morale appliquée. Emmanuel fait les cinq autres blocs (Vie de l'Église, Vie spirituelle, Dieu un et trine, Création et homme, Dialogue et synthèse) : ne pas y toucher.
Dossier : /home/claude/peres. Sauvegarde : branche GitHub sauvegarde/peres (bash outils/sauvegarder.sh une).
Consignes : consigne.md (écriture), consigne-relecture.md (relecture). Plan : plan.json, plan-lisible.md. Ordre de lancement : ordre.txt (plus longues commandes d'abord).
Suivi : lances.txt, relances.txt, relus.txt ; python3 outils/suivant.py.
Message d'écriture : « Lisez d'abord en entier la consigne commune /home/claude/peres/consigne.md et suivez-la à la lettre. Vous écrivez le cours de code {code} (fichier {nn}, lettre {x}) : sa commande est /home/claude/peres/commandes/{code}.txt. Livrez /home/claude/peres/redaction/{code}.html. »
Message de relecture : « Lisez en entier /home/claude/peres/consigne-relecture.md et suivez-la à la lettre. Votre cours : code {code}. »
Après tout : outils/assembler-bloc.sh, liens arrière, Mémoriser, cours.json, sommaire, fabrication, captures, puis attendre « dépose-le ».
Le dossier /home/claude/eglise est préparé (plan, outils) mais sans consigne : bloc suivant après Philosophie.
26-09-i et 26-01-l : livrés sans rapport d'écriture (rédacteur coupé par la limite hebdomadaire) ; le relecteur fait le passage humaniser complet.

## État au 26 novembre, vers 17 h 40
Bloc entier écrit (60/60) et relu (60/60). Assemblé dans /home/claude/lumen/parcours/cours (22 à 26).
68 liens arrière dans 36 cours (outils/liens-arriere.py), 25 versets Mémoriser (memoriser-peres.py), cours.json, sommaire, nouveautes.html à jour, fabrication propre.
Prêts en local, NON poussés : depot/peres (84a537e) et envoi/peres (41 fichiers, empreintes vérifiées).
On attend le « dépose-le ». Ordre : pousser envoi/peres, attendre le robot, rebaser depot/peres sur origin/main (conflits possibles sur cours.json, sommaire, memoriser.json, nouveautes.html si Emmanuel a déposé entre-temps : refaire alors cours.json par script, le sommaire par cours-sommaire.js, memoriser par memoriser-peres.py), puis pousser sur main.
Bloc suivant : « La philosophie au service de la foi » (57 cours).

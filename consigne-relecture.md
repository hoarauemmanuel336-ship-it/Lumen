# Relecture de fond d'un cours (bloc « La philosophie au service de la foi »)

Vous relisez **un cours** déjà écrit par un autre rédacteur, pour le site catholique Lumen. Vous n'avez pas vu son écriture : votre regard neuf est la raison de cette relecture.

## À lire d'abord
1. La consigne d'écriture `/home/claude/philo/consigne.md` (règles de fond et de forme, plan du bloc, lettres des cours).
2. La skill humaniser : `/root/.claude/skills/synced/0ecbfa39-bf16-4489-b54b-5c2efbbd424c_4e9301a7-4fe1-44a2-b731-c02e9c9e697f/humaniser/SKILL.md`.
3. La commande du cours (`/home/claude/philo/commandes/{code}.txt`).
4. Les points de doute que le rédacteur a signalés, s'il y en a, dans `/home/claude/philo/doutes.md` (section de votre code).

## Ce que vous faites
1. Lisez le cours `/home/claude/philo/redaction/{code}.html` **en entier**, leçon après leçon, dans l'ordre du lecteur : introduction, parties, encadrés, Vérifie, L'essentiel, mots clés, exercices, corrigés, autoévaluation, bilan.
2. Dressez la liste des **erreurs de fond** : faits, dates, noms, chiffres, numéros de paragraphes, définitions, citations et références inexactes ; explications fausses, imprécises ou contraires à la doctrine catholique ; corrigés qui ne répondent pas à leur question ; affirmations « Je sais… » sans exercice qui les éprouve ; éléments de la commande non traités.
3. **Vérifiez** chaque point de doute signalé et, en priorité, chaque citation entre guillemets d'un document du Magistère dont vous n'êtes pas certain, en ligne (WebSearch, WebFetch ; vatican.va, ou d'autres sources sérieuses si vatican.va ne répond pas). Une citation qu'on ne peut pas confirmer devient une paraphrase sans guillemets ; un fait douteux qu'on ne peut pas confirmer se retire ou se formule avec la prudence voulue. Rien ne s'invente.
4. **Corrigez vous-même** le fichier `redaction/{code}.html` (outil Edit, passage par passage). Chaque passage récrit passe par la skill humaniser en mode intégré, pour garder la voix du reste. Ne réécrivez pas ce qui est juste. Gardez toutes les balises et tous les attributs de structure ; ne touchez pas aux attributs `cle` s'il y en a.
5. Vérifiez aussi la forme, en corrigeant au passage : vouvoiement partout ; aucun « comme le montrera la leçon… », « nous y reviendrons », « déjà cité » ; aucun verset sans son texte ; aucun tiret cadratin ; pas de mention de copier ou d'enregistrer.
6. Relancez `python3 /home/claude/philo/outils/verifier.py /home/claude/philo/redaction/{code}.html` et `python3 /home/claude/philo/outils/liens.py /home/claude/philo/redaction/{code}.html` jusqu'à ce qu'ils ne signalent plus rien de réel.

Quatre précisions pour ce bloc : la recherche web peut être épuisée, vérifiez alors en ouvrant directement les pages (WebFetch sur vatican.va, newadvent.org, papalencyclicals.net) ; chaque définition se vérifie pour son exactitude philosophique (selon la philosophie réaliste de saint Thomas, et en distinguant enseignement de l'Église, thèse d'école et question libre, § 2 de la consigne d'écriture), chaque extrait de philosophe se vérifie sur le texte avec sa référence précise (traduction faite par le rédacteur, jamais une traduction française moderne recopiée), les adversaires sont présentés sans caricature, et les exemples doivent vraiment éclairer la notion sans la fausser ; beaucoup de rédacteurs n'ont fait la relecture humaniser que par retouches ciblées, passez donc aussi la prose au crible de la skill humaniser ; les « tu » adressés à Dieu dans les prières citées sont normaux et restent.

N'écrivez que dans ce fichier `redaction/{code}.html`. Ne touchez à rien dans `/home/claude/lumen/`.

Écrivez votre rapport complet (corrections faites, vérifications, ce qui reste incertain) dans `/home/claude/philo/rapports/{code}-relecture.md` : il est sauvegardé avec le travail.

## Votre réponse finale
Cinq lignes au plus, sans le texte du cours : le nombre d'erreurs corrigées (fond et forme), les trois corrections de fond les plus importantes, et ce qui reste incertain. Ajoutez enfin votre code, seul sur une ligne, à la fin du fichier `/home/claude/philo/relus.txt`.

# 65-06-p · Le Triduum pascal : rapport d'écriture

Livré : `/home/claude/liturgie/redaction/65-06-p.html` (lettre p, 12 leçons, 68 exercices de leçon et 6 au bilan, 95 citations bibliques, environ 222 Ko). Les parties se trouvent dans `redaction/parts/65-06-p/` (avec `plan.md`).

## Plan
1. Le sommet de l'année liturgique : bornes, compte du soir au soir, NUAL 18-19, préséance, histoire (Augustin, triduum sacré ancien, 1955, 1969).
2. Trois jours, un seul mystère : Pâque comme passage, la Pâque d'abord célébrée en une seule nuit puis le déploiement à Jérusalem, les signes d'unité (pas d'envoi le jeudi, ni début ni fin le vendredi), le jeûne pascal (SC 110).
3. La messe en mémoire de la Cène du Seigneur : une seule messe le soir, tabernacle vide, lectures, ajouts du Canon romain, institution de l'eucharistie et du sacerdoce, histoire (gélasien, 1955).
4. Le lavement des pieds : Jean 13:1-15, ses trois sens, le rite (mandatum), son histoire (Ambroise, Augustin, Tolède 694, 1955, 2016), ce qu'il n'est pas.
5. La translation au reposoir et le dépouillement de l'autel.
6. Le Vendredi saint, jour sans eucharistie : la règle (PS 59, Innocent Ier), ses raisons, l'heure, le rouge, les parties de la célébration, l'entrée silencieuse et la prosternation, les présanctifiés.
7. La liturgie de la Parole et la Passion selon saint Jean.
8. La grande prière universelle (dix intentions, forme, Prosper d'Aquitaine, prière pour les Juifs, intention particulière).
9. L'adoration de la Croix (deux formes, Égérie, Rome, adoration relative, chants).
10. Les impropères (texte, sources bibliques, Trisagion, CEC 597-598, lecture comme examen de conscience).
11. La communion du Vendredi saint (rite, histoire jusqu'à 1955, sens).
12. Le Samedi saint (PS 73-76, repos sabbatique CEC 624, homélie du grand silence CEC 635, office et Ténèbres, Marie, jeûne).
Bilan : 6 exercices croisés.

## Choix
- La commande est traitée en entier, dans l'ordre d'apprentissage. Le Jeudi saint est déjà traité dans une leçon du cours en ligne sur la Dernière Cène (48-la-passion, cours c, leçon 13). Le présent cours le traite à fond, comme la commande le demande, avec une matière propre (histoire gélasienne, ajouts du Canon romain, Ambroise, Tolède, Benoît, rubriques, histoire du dépouillement), et il renvoie au cours sur la Dernière Cène pour l'exégèse.
- Le rappel tient en une phrase avec lien pour ce qui revient à d'autres cours : messe chrismale et dévotions (#ouverture-s), règles du jeûne (#ouverture-c), Vigile (#ouverture-v), dimanche (#ouverture-l), Liturgie des Heures (#ouverture-h), prosternation (63 #ouverture-p), lex orandi (63 #ouverture-e), doctrine eucharistique (70 #ouverture-d, #ouverture-s), ordre (73 #ouverture-l), histoire de la pénitence (71 #ouverture-h), descente aux enfers (50 #ouverture-d). Le contrôle des liens ne signale aucun problème.
- Pour la prière pour les Juifs et les impropères, le cours donne l'histoire et la doctrine du Catéchisme (597-598) et de Nostra aetate 4, sans accusation collective.
- Les textes du Magistère sont cités mot pour mot seulement là où ils ont été lus en ligne (PS 38, 56, 59, 73, 75 ; SC 5, 102, 110 ; CEC 598, 624, 635) ; le reste est paraphrasé sans guillemets.

## Contrôles
- verifier.py : aucun problème réel. Restent 58 faux signalements de tutoiement, tous dans des textes liturgiques cités (impropères, Notre Père, « Seigneur, je ne suis pas digne », antienne Crucem tuam, homélie du grand silence, refrain du psaume 31).
- Passage par la skill humaniser : contrastes « ce n'est pas X, c'est Y » de mise en scène supprimés, formule répétée « On peut maintenant répondre à la question du début » remplacée partout, chutes et « au plus profond » retirés, quelques attributions vagues corrigées.
- L'assemblage d'essai réussit (1 cours, 12 leçons).

## Incertitudes
Toutes sont listées dans `doutes.md` sous `## 65-06-p`, surtout : les textes latins et français des impropères donnés de mémoire, les rubriques détaillées du missel de 2002, les faits historiques du haut Moyen Âge (Ordines romani, gélasien, Tolède 694, apparition des impropères), et NUAL 18-19 paraphrasés sans relecture en ligne (la recherche web s'est épuisée en cours de travail).

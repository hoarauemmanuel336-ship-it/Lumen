# Rapport d'écriture : 24-07-s, Éphrem le Syrien

Fichier livré : `/home/claude/peres/redaction/24-07-s.html` (lettre s, environ 239 Ko), avec les parties dans `redaction/parts/24-07-s/` (00-ouverture, 01 à 12, 99-bilan) et le plan (`plan.md`).

## Contenu

Douze leçons, 73 exercices de leçon et 7 exercices de bilan (80 au total), 62 citations bibliques contrôlées.

1. Le syriaque et la tradition syriaque des Pères (langue, Peshitta, Aphraate, troisième tradition, Églises héritières, sources et légendes).
2. Nisibe : le diacre et le maître (naissance vers 306, Jacques de Nisibe, fils de l'alliance, diaconat, question de l'école, sièges de 338, 346, 350, Hymnes de Nisibe).
3. Édesse : l'exil, la famine et la mort (363, Hymnes contre Julien, Édesse et les palutiens, Palladios et Sozomène, juin 373, légendes).
4. Madrashê et mêmrê (forme, qala, refrain, acrostiche ; Bardesane et Harmonios ; chœurs de filles de l'alliance ; mêmrê ; prose).
5. Hymnes sur la foi (scrutateurs, séraphins, Sinaï, soleil, perle).
6. Théologie symbolique (raza, tupsa, nature et Écriture, noms empruntés et noms exacts, vêtement).
7. Hymnes sur le Paradis (montagne, arbres-sanctuaire, faute d'Adam, vêtement de gloire, bon larron, Église, âme séparée).
8. Hymnes sur la Nativité et Marie (paradoxes, mère-sœur-épouse, Ève et Marie, perle, pureté de Marie, Éphèse).
9. Hymnes contre les hérésies (Marcion, Bardesane, Mani ; quatre vérités ; hymne 22 et le nom de chrétien).
10. Commentaire du Diatessaron (Tatien, survie arménienne et syriaque, authenticité, témoin du texte, Parole inépuisable, remplacement au Ve siècle).
11. L'eucharistie : le feu et l'Esprit (Hymnes sur la foi 10 et 6, braise d'Isaïe, épiclèse, vêtement et corps).
12. Docteur de l'Église universelle (vénération ancienne, Benoît XV 1920, calendrier, seul diacre docteur, discernement).

Tous les éléments de la commande sont traités ; l'ordre suit l'apprentissage : la théologie symbolique (élément 13 de la commande) vient juste après les Hymnes sur la foi, parce qu'elle éclaire les séries suivantes ; les mêmrê (élément 11) sont traités avec les madrashê, à la leçon 4.

## Choix

- Extraits d'Éphrem traduits par le rédacteur depuis des traductions anglaises anciennes : J. B. Morris (1847) pour les Hymnes sur la foi et la Perle, Nicene and Post-Nicene Fathers (1898, New Advent) pour les Hymnes de Nisibe, sur la Nativité et l'Homélie sur Notre-Seigneur. Les séries sans traduction ancienne libre (Paradis, contre les hérésies, virginité, Église, Commentaire du Diatessaron) sont paraphrasées sans guillemets, avec la référence de l'hymne.
- Numéros d'hymnes donnés seulement quand ils paraissaient sûrs ; la différence de numérotation des Hymnes sur la Nativité est signalée dans la leçon 8.
- Magistère : Benoît XV (encyclique italienne de vatican.va, traduite par le rédacteur) ; Benoît XVI, catéchèse du 28 novembre 2007, citée mot pour mot dans la version française de vatican.va ; Nostra aetate paraphrasée.
- Juger avec justesse : légendes (Basile, Égypte, folie simulée, père païen), Éphrem grec et prière de carême, École de Nisibe (489), âme séparée aux abords du Paradis (opinion, Benoît XII 1336), pureté de Marie sans anachronisme avec 1854, polémique anti-juive jugée par Nostra aetate, ton polémique des hymnes contre les hérésies, authenticité du Commentaire du Diatessaron.
- Liens : 22 (l, f, g, p), 23 (g, n, i), 24 (l, b), 26 (m), 27 (t), 28 (c, e, o), 11 (e, n), 12 (t), 64 (e), 66 (e), 70 (p), et `#sujet:` pour Marie (nouvelle Ève, virginité, Immaculée Conception, Théotokos) et Nostra aetate.
- Passage de la skill humaniser : contrastes « pas X, mais Y » réduits là où la moitié négative ne corrigeait aucune idée réelle, chutes retirées, formule répétée « On peut maintenant répondre à la question de départ » remplacée par des retours variés à la question.

## Contrôle

`verifier.py` : aucune erreur de verset ; il reste seulement de faux signalements de tutoiement, tous dans des citations d'Éphrem ou de prières adressées à Dieu, ou sur le nom « ton » (« Ce ton appartient… »). Assemblage d'essai réussi (`assembler.py`, 1 cours, 12 leçons).

## Incertitudes

Détaillées dans `doutes.md` sous `## 24-07-s` : concordance des numéros Morris / Beck, strophes 10, 8 et 10, 17, hymne 11 de la Nativité pour « mère, sœur », Hymnes de Nisibe 27, palutiens dans l'hymne 22, numéros des Hymnes sur le Paradis, date du 9 juin d'après la Chronique d'Édesse, baptistère de 359, présence du passage du Diatessaron dans la Liturgie des Heures, prière de saint Éphrem traduite de mémoire.

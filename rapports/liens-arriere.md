# Liens arrière vers le bloc « Les Pères de l’Église »

Script : `/home/claude/peres/outils/liens-arriere.py` (copie du modèle `/home/claude/histoire/outils/liens-arriere.py` : même fonction `L`, même `motif`, même règle « trouvé une seule fois, sinon rien n’est écrit », même option `--essai` ; seuls la docstring, le dictionnaire `F` et la liste `POSES` changent).

Mode essai : `68 passages trouvés, rien n’est écrit (essai)`. Le script n’a jamais été lancé sans `--essai` : aucun fichier n’a été modifié.

## En chiffres

- 68 liens, dans 36 fichiers en ligne (3 liens au plus par fichier).
- Les 60 cours du bloc reçoivent tous au moins un lien. Huit en reçoivent deux : 22-01-l, 22-08-r, 23-12-r, 24-01-l, 24-08-j, 25-02-a, 25-03-j, 26-01-l.
- Aucun fichier n’a deux liens vers le même cours.
- Vérifications faites sur chaque passage : aucun n’est dans une balise, dans un lien `<a>` déjà posé, entre guillemets, dans un titre, une définition, un mot clé, un repère, une carte, les objectifs, un exercice ou un corrigé. Les ancres `#ouverture-x` sont fabriquées au chargement depuis `<cours lettre="x">` (même mécanisme que pour les cours 27 à 33), et les 60 lettres existent dans les fichiers 22 à 26.

## Les liens

| Fichier | Mot lié | Cible |
|---|---|---|
| 02-la-transmission-de-la-revelation.html | nom de père | `22-la-patristique.html#ouverture-l` (Qu’est-ce qu’un Père de l’Église) |
| 44-l-incarnation.html | Pères de l’Église | `22-la-patristique.html#ouverture-l` (Qu’est-ce qu’un Père de l’Église) |
| 03-l-autorite-de-l-enseignement.html | écrivains ecclésiastiques | `22-la-patristique.html#ouverture-p` (Pères, docteurs et écrivains ecclésiastiques) |
| 11-inspiration-verite-et-canon.html | l’accord unanime des Pères | `22-la-patristique.html#ouverture-a` (L’autorité du consensus des Pères) |
| 12-interpreter-l-ecriture.html | l’école d’Alexandrie | `22-la-patristique.html#ouverture-e` (L’école d’Alexandrie) |
| 16-les-livres-sapientiaux-et-poetiques.html | l’école d’Antioche | `22-la-patristique.html#ouverture-c` (L’école d’Antioche) |
| 05-les-symboles-de-foi.html | Pères cappadociens | `22-la-patristique.html#ouverture-f` (Les autres foyers de la patristique) |
| 33-l-eglise-contemporaine.html | catéchèse dite mystagogique | `22-la-patristique.html#ouverture-g` (Les genres de la littérature patristique) |
| 32-l-eglise-a-l-epoque-moderne.html | bénédictins de la congrégation de Saint-Maur | `22-la-patristique.html#ouverture-r` (Les grandes collections et éditions des Pères) |
| 50-la-resurrection-et-la-gloire.html | l’abbé Migne | `22-la-patristique.html#ouverture-r` (Les grandes collections et éditions des Pères) |
| 70-l-eucharistie.html | *Didachè* | `23-les-premiers-temoins.html#ouverture-l` (La Didachè) |
| 19-les-actes-et-saint-paul.html | saint Clément de Rome | `23-les-premiers-temoins.html#ouverture-c` (Clément de Rome) |
| 50-la-resurrection-et-la-gloire.html | Saint Ignace d’Antioche | `23-les-premiers-temoins.html#ouverture-i` (Ignace d’Antioche) |
| 66-les-rites-les-sacramentaux-et-la-piete.html | Saint Polycarpe | `23-les-premiers-temoins.html#ouverture-p` (Polycarpe de Smyrne) |
| 18-les-evangiles.html | Papias | `23-les-premiers-temoins.html#ouverture-h` (Papias de Hiérapolis) |
| 71-la-penitence.html | Hermas | `23-les-premiers-temoins.html#ouverture-a` (Le Pasteur d’Hermas) |
| 65-le-temps-liturgique.html | *Lettre de Barnabé* | `23-les-premiers-temoins.html#ouverture-e` (L’Épître de Barnabé) |
| 93-les-domaines-de-la-vie-sociale.html | *Lettre à Diognète* | `23-les-premiers-temoins.html#ouverture-d` (La Lettre à Diognète) |
| 11-inspiration-verite-et-canon.html | l’apologiste Athénagore | `23-les-premiers-temoins.html#ouverture-g` (Les apologistes grecs du IIe siècle) |
| 44-l-incarnation.html | Saint Justin | `23-les-premiers-temoins.html#ouverture-j` (Justin martyr) |
| 18-les-evangiles.html | la gnose | `23-les-premiers-temoins.html#ouverture-n` (Le gnosticisme) |
| 01-la-revelation.html | Saint Irénée de Lyon | `23-les-premiers-temoins.html#ouverture-r` (Irénée de Lyon) |
| 75-la-mort-et-le-jugement-particulier.html | Saint Irénée de Lyon | `23-les-premiers-temoins.html#ouverture-r` (Irénée de Lyon) |
| 68-le-bapteme.html | Tertullien | `23-les-premiers-temoins.html#ouverture-t` (Tertullien) |
| 48-la-passion.html | Saint Cyprien | `23-les-premiers-temoins.html#ouverture-y` (Cyprien de Carthage) |
| 63-qu-est-ce-que-la-liturgie.html | Minucius Felix | `23-les-premiers-temoins.html#ouverture-o` (Les apologistes latins avant Nicée) |
| 74-le-mariage.html | Clément d’Alexandrie | `23-les-premiers-temoins.html#ouverture-m` (Clément d’Alexandrie) |
| 72-l-onction-des-malades.html | Origène | `23-les-premiers-temoins.html#ouverture-v` (Origène : vie et œuvres) |
| 76-le-ciel-le-purgatoire-et-l-enfer.html | Origène | `23-les-premiers-temoins.html#ouverture-s` (Origène : doctrine et controverses) |
| 77-la-fin-des-temps.html | saint Hippolyte de Rome | `23-les-premiers-temoins.html#ouverture-b` (Hippolyte de Rome) |
| 16-les-livres-sapientiaux-et-poetiques.html | Saint Athanase d’Alexandrie | `24-les-peres-d-orient.html#ouverture-l` (Athanase d’Alexandrie) |
| 03-l-autorite-de-l-enseignement.html | Saint Athanase | `24-les-peres-d-orient.html#ouverture-l` (Athanase d’Alexandrie) |
| 45-le-dogme-christologique.html | Eusèbe de Césarée | `24-les-peres-d-orient.html#ouverture-e` (Eusèbe de Césarée) |
| 71-la-penitence.html | Saint Basile | `24-les-peres-d-orient.html#ouverture-b` (Basile de Césarée) |
| 44-l-incarnation.html | saint Grégoire de Nazianze | `24-les-peres-d-orient.html#ouverture-g` (Grégoire de Nazianze) |
| 76-le-ciel-le-purgatoire-et-l-enfer.html | Saint Grégoire de Nysse | `24-les-peres-d-orient.html#ouverture-n` (Grégoire de Nysse) |
| 70-l-eucharistie.html | saint Cyrille de Jérusalem | `24-les-peres-d-orient.html#ouverture-c` (Cyrille de Jérusalem) |
| 77-la-fin-des-temps.html | Saint Éphrem | `24-les-peres-d-orient.html#ouverture-s` (Éphrem le Syrien) |
| 74-le-mariage.html | Saint Jean Chrysostome | `24-les-peres-d-orient.html#ouverture-j` (Jean Chrysostome) |
| 91-les-principes-de-la-doctrine-sociale.html | Saint Jean Chrysostome | `24-les-peres-d-orient.html#ouverture-j` (Jean Chrysostome) |
| 70-l-eucharistie.html | Saint Cyrille d’Alexandrie | `24-les-peres-d-orient.html#ouverture-a` (Cyrille d’Alexandrie) |
| 63-qu-est-ce-que-la-liturgie.html | Denys l’Aréopagite | `24-les-peres-d-orient.html#ouverture-p` (Le Pseudo-Denys l’Aréopagite) |
| 45-le-dogme-christologique.html | Saint Maxime le Confesseur | `24-les-peres-d-orient.html#ouverture-m` (Maxime le Confesseur) |
| 19-les-actes-et-saint-paul.html | Saint Jean Damascène | `24-les-peres-d-orient.html#ouverture-d` (Jean Damascène) |
| 02-la-transmission-de-la-revelation.html | saint Hilaire de Poitiers | `25-les-peres-d-occident.html#ouverture-l` (Hilaire de Poitiers) |
| 64-la-messe.html | saint Ambroise | `25-les-peres-d-occident.html#ouverture-a` (Ambroise de Milan) |
| 91-les-principes-de-la-doctrine-sociale.html | Saint Ambroise de Milan | `25-les-peres-d-occident.html#ouverture-a` (Ambroise de Milan) |
| 67-les-sacrements-en-general.html | saint Jérôme | `25-les-peres-d-occident.html#ouverture-j` (Jérôme) |
| 12-interpreter-l-ecriture.html | saint Jérôme | `25-les-peres-d-occident.html#ouverture-j` (Jérôme) |
| 45-le-dogme-christologique.html | saint Léon le Grand | `25-les-peres-d-occident.html#ouverture-g` (Léon le Grand) |
| 65-le-temps-liturgique.html | Saint Pierre Chrysologue | `25-les-peres-d-occident.html#ouverture-p` (Pierre Chrysologue) |
| 04-la-foi.html | Boèce | `25-les-peres-d-occident.html#ouverture-b` (Boèce) |
| 71-la-penitence.html | Cassiodore | `25-les-peres-d-occident.html#ouverture-c` (Cassiodore) |
| 63-qu-est-ce-que-la-liturgie.html | saint Grégoire le Grand | `25-les-peres-d-occident.html#ouverture-r` (Grégoire le Grand) |
| 67-les-sacrements-en-general.html | Saint Isidore de Séville | `25-les-peres-d-occident.html#ouverture-i` (Isidore de Séville) |
| 15-les-livres-historiques.html | saint Bède le Vénérable | `25-les-peres-d-occident.html#ouverture-v` (Bède le Vénérable) |
| 19-les-actes-et-saint-paul.html | Augustin | `26-saint-augustin.html#ouverture-l` (La jeunesse et la conversion d’Augustin) |
| 02-la-transmission-de-la-revelation.html | Augustin | `26-saint-augustin.html#ouverture-l` (La jeunesse et la conversion d’Augustin) |
| 05-les-symboles-de-foi.html | évêque d’Hippone | `26-saint-augustin.html#ouverture-a` (Augustin, prêtre et évêque d’Hippone) |
| 01-la-revelation.html | *Confessions* | `26-saint-augustin.html#ouverture-c` (Les Confessions) |
| 04-la-foi.html | Augustin | `26-saint-augustin.html#ouverture-p` (Augustin philosophe) |
| 47-le-ministere-public.html | les manichéens | `26-saint-augustin.html#ouverture-m` (Augustin contre les manichéens) |
| 18-les-evangiles.html | les donatistes | `26-saint-augustin.html#ouverture-d` (Augustin contre les donatistes) |
| 52-la-grace.html | Pélage | `26-saint-augustin.html#ouverture-u` (Augustin contre Pélage) |
| 51-l-esprit-saint.html | De la Trinité | `26-saint-augustin.html#ouverture-t` (Le De Trinitate) |
| 93-les-domaines-de-la-vie-sociale.html | *La Cité de Dieu* | `26-saint-augustin.html#ouverture-i` (La Cité de Dieu) |
| 12-interpreter-l-ecriture.html | *De doctrina christiana* | `26-saint-augustin.html#ouverture-e` (Augustin exégète et prédicateur) |
| 31-la-reforme-et-le-concile-de-trente.html | ermites de saint Augustin | `26-saint-augustin.html#ouverture-r` (La règle et l’héritage d’Augustin) |
## Ce qui a été écarté

**Des liens provisoires vers ce bloc existent déjà (à traiter à part).** 42 liens « pas encore écrit » (`href="#sujet:augustin.…"`, `#sujet:premiers-peres.…`, `#sujet:peres-orient.…`, `#sujet:peres-occident.…`, `#sujet:peres.…`) visent déjà des cours du bloc : 16 dans 27, 9 dans 28, 7 dans 29, 2 dans 30, 1 dans 32, 2 dans 64 (Justin, Hippolyte), 1 dans 67 et 2 dans 68 (donatistes, Pélage), 2 dans 70 (gnosticisme, « Pères de l’Église »). Ils sont déjà dans un `<a>`, donc ce script ne les touche pas. Maintenant que le bloc existe, il faut sans doute leur donner leur vraie adresse : c’est un autre travail, à faire avec le même soin (`#sujet:peres.premiers`, `peres.grecs` et `peres.latins` ne correspondent pas un pour un à un cours). Pour éviter les doublons, ce script ne pose aucun lien vers ces cours-là dans ces fichiers. Les fichiers 27, 28, 29 et 30 ne reçoivent aucun lien nouveau, à cause du nombre de liens provisoires qu’ils portent déjà.

**Pour ne pas surcharger.** Une seule mention par cours cible, sauf les huit doubles. Les fichiers les plus riches en Pères (12, 18, 63, 70…) sont plafonnés à trois liens. Le reste des cours cités a donc été laissé de côté : par exemple Didachè dans 05 et 64, Ignace dans 19 et 67, Polycarpe dans 19, 50 et 68, Papias dans 02 et 43, Justin dans 18, 66 et 70, Origène dans 12 et 49, Basile dans 02, 03 et 65, Grégoire le Grand dans 12, 46, 47 et 70, Pélage dans 19, 45, 49 et 63, la *Cité de Dieu* dans 32, 77 et 91, le *De Trinitate* dans 01 et 21, la *Lettre à Diognète* dans 19 et 47, Cyrille de Jérusalem dans 05, 50 et 69, l’école d’Alexandrie dans 17 et l’école d’Antioche dans 51, le consentement unanime dans 12.

**Pour leur place.** Ont été écartés les noms dans des listes (« Athanase, Basile, Grégoire de Nazianze, Jean Chrysostome… » des repères de 02, tables de 18 et 45), dans des titres (`<h4>Origène</h4>` et `<h4>Bède le Vénérable</h4>` de 72, `<h4>Polycarpe et Anicet</h4>` de 66, titres de parties), dans les repères, cartes, définitions, mots clés, objectifs, exercices et corrigés, dans les citations entre guillemets, et dans les introductions de cours quand le corps de la leçon donnait une meilleure mention (Hermas dans 71, Papias dans 18).

**Les homonymes.** Écartés : l’apôtre Barnabé (Actes), Denys le Petit, Denys d’Alexandrie et Denys le Chartreux (ce n’est pas le Pseudo-Denys), le « Symbole dit d’Athanase », Basile d’Ancyre, Hilaire le laïc de Provence et le diacre Hilaire, le pape Pélage II, le cardinal Pélage et le diacre Pélage, le métropolite Isidore, Isidore de Milet et le Pseudo-Isidore, Athanase Miller, Athanase de Charette, Ambroise Gardeil, Ambroise Catharin, l’Ambrosiaster, Justin Welby, Hippolyte Gayraud, Jean-Hippolyte Mariéjol, l’« agnosticisme » (pour la gnose) et les « Confessions helvétiques ».

---
name: "phrases-a-retenir"
description: "Transformer n’importe quel sujet à retenir en phrases à mémoriser et à dire à voix haute. Forme classique : une définition, puis une phrase par grande partie, qui portent l’ossature complète du sujet, présentées dans une page HTML sombre affichée directement dans la conversation, où l’on coche celles à réécrire. Forme en une seule phrase, à la demande : tout le sujet ramassé en une phrase à mémoriser."
---

# Phrases à retenir

Cette skill sert à retenir un sujet grâce à des phrases faciles à réciter. Elle s’applique à tout ce qui est donné à retenir.

## Deux formes

La skill connaît deux formes. La forme classique, par défaut, donne une définition puis une phrase par grande partie, dans une page interactive où l’utilisateur choisit les phrases à garder. La forme en une seule phrase, choisie quand l’utilisateur demande une seule phrase, ramasse tout le sujet en une phrase à mémoriser, donnée directement dans la conversation.

## Affichée directement dans la conversation

La forme classique s’affiche directement dans la conversation, sous la forme d’une page HTML interactive, grâce à l’outil qui rend du HTML en ligne dans le fil de la discussion. La page apparaît là où l’utilisateur lit la réponse : il coche, écrit ses remarques et envoie son choix sans quitter la conversation, et son choix revient dans le fil comme un message. La page est le seul emplacement des phrases : la réponse tient tout entière en elle, sans texte autour.

## Connaître un sujet

Connaître un sujet, c’est le connaître par ses causes : savoir ce dont il est fait, ce qui fait de lui ce qu’il est, ce qui le produit ou le met en mouvement, et ce vers quoi il tend.

## La méthode

**La définition.** Le sujet est d’abord défini : ce qu’il est, en une phrase courte qui dit sa nature. Chacun de ses mots apporte ce que le nom du sujet ne contient pas encore.

**Les phrases détaillées.** Le sujet est découpé en un petit nombre de grandes parties. Ces parties couvrent ce qui vient au-delà de la définition : chacune apporte un aspect nouveau du sujet, et la nature du sujet reste portée par la définition seule. Ensemble, elles font connaître le sujet par ses causes. Chaque partie reçoit sa phrase, qui se dit d’une seule respiration. La phrase part de ce que nomme le titre de sa partie, et chacun de ses morceaux apprend quelque chose que ce nom seul ne dit pas. Chaque morceau de phrase, séparé par une virgule, correspond à une grande idée de la partie, dans son ordre naturel. Les morceaux des phrases d’une partie correspondent ainsi, un à un, à ses grandes idées. Un point-virgule marque un changement d’ensemble à l’intérieur d’une phrase. Le nombre de morceaux d’une phrase reste à la mesure du souffle, pour que la phrase garde l’allure d’une pensée qui avance ; une partie riche en grandes idées se répartit sur deux phrases.

Les parties servent à découper les phrases détaillées en morceaux digestes : elles apparaissent comme titres.

## Une seule phrase

La phrase unique porte le cœur du sujet. Elle part de sa nature et y joint les causes qui comptent le plus, assez pour que celui qui la récite tienne l’ossature du sujet. Les morceaux séparés par des virgules suivent les grandes idées dans l’ordre où la pensée les découvre, et un point-virgule marque le passage d’un ensemble à l’autre. Sa longueur reste celle d’une phrase qu’on dit d’un trait, en reprenant au plus son souffle au point-virgule. Quand le sujet est fourni sous forme de texte, la phrase en garde les idées maîtresses et les images fortes, et reprend le vocabulaire de l’auteur là où il est juste.

La phrase reçoit un titre court, qui nomme le sujet tel que la phrase le saisit et aide à la rappeler en mémoire.

Le titre et la phrase se donnent directement dans la conversation, sans texte autour : le titre en gras sur sa propre ligne, puis la phrase dessous. L’utilisateur les commente ou demande une retouche dans la conversation ; ils reviennent alors de la même manière, la phrase réécrite et le titre ajusté quand la phrase a changé de sens.

## La prose des phrases

Chaque phrase, dans les deux formes et à chaque tour, se lit comme écrite par une personne pour être dite à voix haute. Une fois rédigées, les phrases passent par la skill **humaniser** : l’IA la charge, l’applique aux phrases en mode intégré et garde la version finale de chaque phrase, avec tout ce qu’elle dit. L’oreille juge en dernier : la phrase lue à voix haute coule d’un seul mouvement.

Dans la forme classique, cette passe vient après la rédaction de toutes les phrases, et après la relecture d’une seule main quand des sous-agents ont rédigé, juste avant l’assemblage. Dans la forme en une seule phrase, elle vient juste avant que la phrase soit donnée. Seule la version réécrite est montrée.

## Le moteur et le contenu

La page se compose de deux parts. Le moteur, rangé dans le dossier `moteur` de cette skill, porte toute la mécanique et toute l’apparence : fond, polices intégrées, titres, cases à cocher, champ des remarques, bouton d’envoi, message renvoyé dans la conversation, masquage pour réciter, adaptation au téléphone. Le contenu est la seule part que l’IA rédige : un fichier court, écrit dans un balisage simple que le moteur sait afficher. Toute l’attention de l’IA va ainsi aux phrases, et la page garde d’un sujet à l’autre la même finition.

**Fabrication.** L’IA écrit le contenu dans un fichier, par exemple `contenu.html`, puis l’assemble avec le moteur par la commande :

```
python3 <dossier de la skill>/moteur/assembler.py contenu.html page.html
```

L’assemblage se fait avec Python seul. Le fichier produit est un fragment HTML complet (polices, style, page et script), prêt pour l’affichage en ligne. L’IA affiche ce fichier en entier dans le terminal et transmet son contenu, tel quel et caractère pour caractère, à l’outil d’affichage en ligne, qui le rend dans la conversation.

**Les polices.** La page appelle ses polices depuis Google Fonts : Inter pour les phrases, le nom du sujet et la phrase d’accueil, JetBrains Mono pour les titres de partie (graisse 500), les numéros, les étiquettes et le bouton (graisse 400). La page reste ainsi légère, quelques kilo-octets, et s’affiche vite à chaque tour. L’assemblage applique de lui-même la typographie française : apostrophes courbes, espaces insécables devant les deux-points, le point-virgule, le point d’interrogation, le point d’exclamation, et à l’intérieur des guillemets français. L’IA écrit donc ses textes avec des apostrophes droites et des espaces ordinaires.

## Format du contenu

Le contenu est un arbre de balises simples, chacune fermée par sa balise de fin.

**Racine.** `<phrases sujet="…">` enveloppe tout le contenu et donne le nom du sujet, qui s’affiche en tête de page. La page de choix est la forme par défaut ; l’attribut `mode="final"` donne la page finale.

**Définition.** `<definition>` contient la phrase de définition. Son titre s’affiche seul, « Définition », sans numéro.

**Partie.** `<partie titre="…">` contient la ou les phrases de la partie. Le moteur numérote les parties dans l’ordre (01, 02…). Quand une page ne présente qu’une partie des phrases, comme au tour des phrases réécrites, l’attribut `num="…"` garde à chaque partie le numéro qu’elle porte dans l’ensemble.

**Phrase.** `<phrase>` contient une phrase entière. L’italique s’écrit `<i>`.

Exemple de forme :

```html
<phrases sujet="Nom du sujet">
<definition>
<phrase>La phrase qui dit la nature du sujet.</phrase>
</definition>
<partie titre="Titre de la première partie">
<phrase>La phrase de la partie, morceau par morceau.</phrase>
</partie>
<partie titre="Titre de la deuxième partie">
<phrase>Première phrase d'une partie riche.</phrase>
<phrase>Seconde phrase de la même partie.</phrase>
</partie>
</phrases>
```

## Écriture à plusieurs mains

Les parties peuvent être confiées à des sous-agents qui rédigent en parallèle, chacun les phrases d’une ou plusieurs parties. Ils tournent sur le même modèle que l’IA principale. L’IA principale garde la charge de l’unité de l’ensemble, de la définition à la dernière phrase.

**Une consigne commune précède la rédaction.** L’IA principale la rédige dans un fichier que chaque sous-agent lit en entier avant d’écrire. Elle y pose la définition, le découpage en parties avec les grandes idées de chacune, la part de chacun, toute la méthode et le format du contenu dans lequel chaque part se livre, de sorte que les parts s’assemblent telles quelles dans le fichier de contenu.

**Une relecture d’une seule main suit la rédaction.** Avant l’assemblage, l’IA principale lit elle-même toutes les phrases, de la définition à la dernière partie, dans l’ordre où elles se disent. Elle leur donne une même voix et un même souffle. Elle place chaque idée dans la partie où elle sert le mieux, et récrit les morceaux qui redisent ce qu’une autre phrase porte déjà, en les remplaçant par une idée neuve. L’ensemble se dit alors comme la pensée d’un seul auteur, et chaque phrase garde sa pleine substance.

## Le choix des phrases

La page de choix porte en tête le nom du sujet et une phrase d’accueil qui annonce que l’on coche les phrases qui déplaisent, et que les phrases laissées sans coche sont gardées. Viennent ensuite toutes les phrases, en entier : d’abord la définition, puis les phrases détaillées, chacune sous le titre de sa partie. Un clic sur une phrase ou sur sa case la coche ou la décoche. Sous les phrases, le champ « Ce qui déplaît » reçoit les remarques de l’utilisateur.

Le bouton d’envoi suit l’état des coches : « Tout garder ↗ » tant qu’aucune phrase n’est cochée, « Réécrire les phrases cochées (n) ↗ » dès qu’une phrase l’est. Au clic, la page envoie dans la conversation un message rédigé en clair : le nom du sujet, les phrases à réécrire chacune avec le titre de sa partie, les remarques, puis les phrases gardées chacune avec le titre de sa partie. Quand aucune phrase n’est cochée, le message annonce que toutes les phrases présentées sont gardées.

Les phrases laissées sans coche sont gardées mot pour mot et mises de côté. Les phrases cochées sont réécrites à neuf, selon toute la méthode et en tenant compte des remarques de l’utilisateur, puis passent par la skill humaniser, comme décrit dans « La prose des phrases ».

Au tour suivant, une nouvelle page de choix, affichée de même dans la conversation, présente les seules phrases réécrites, chacune sous le titre et le numéro de sa partie. Le va-et-vient continue ainsi, sur les seules phrases encore à revoir, jusqu’à ce que l’utilisateur garde toutes les phrases présentées.

## La page finale

Quand toutes les phrases sont gardées, l’ensemble est redonné en entier dans la page finale, affichée dans la conversation : la définition, puis chaque phrase à sa place sous le titre de sa partie, dans l’ordre où elles se disent. Cette page sert à réciter. Le bouton « Masquer pour réciter » cache le texte de toutes les phrases et laisse visibles les titres ; chaque phrase masquée laisse une ligne en pointillés, et un clic sur elle la dévoile. Le même bouton, devenu « Tout afficher », rend tout le texte visible.

## L’aspect de la page

Le moteur donne à la page cet aspect, tout en blanc et en gris sur fond sombre, avec le rouge pour seule marque des phrases cochées.

**L’ambiance.** Un bloc au fond uni #0a0a0a, aux angles droits, avec 32px de marge intérieure en haut et en bas et 28px sur les côtés. Le texte courant est en #f2f2f2. Les phrases, le nom du sujet et la phrase d’accueil sont en Inter ; les tags, les numéros et le libellé des boutons sont en JetBrains Mono, graisse 400, et les titres de partie en JetBrains Mono, graisse 500. Aucune couleur d’accent : le blanc tient ce rôle, et le rouge #ef4444 marque seulement la croix des phrases cochées.

**L’en-tête.** Un tag monospace de 11px, en majuscules espacées de 0,12em, en #8a8a8a : « PHRASES À RETENIR » sur la page de choix, « VERSION FINALE » sur la page finale. Dessous, le nom du sujet en Inter 30px, poids 600, interligne 1,15, en #ffffff, puis la phrase d’accueil en Inter 15px, interligne 1,6, en #a3a3a3.

**Les titres de partie.** Chaque partie s’ouvre 36px sous la précédente. Son titre s’écrit en JetBrains Mono 12px, poids 500, en majuscules espacées de 0,12em, en blanc, précédé, pour les parties détaillées, de son numéro en monospace 11px dans un encadré blanc de 1px, avec 3px de marge en haut et en bas et 7px sur les côtés, à 10px du titre. La définition et le champ des remarques portent leur titre seul. Sous chaque titre court une ligne fine de 1px en blanc à 25 % d’opacité, sur toute la largeur, 12px sous le titre et 12px au-dessus des phrases ; c’est la seule ligne de la page.

**Les phrases.** Elles se posent directement sur le fond, en Inter 19px, interligne 1,55, en #f2f2f2, sans alinéa de première ligne, avec 8px d’espace au-dessus et en dessous. Sur la page de choix, une case carrée de 18px au filet blanc de 1,5px se place à gauche de chaque phrase, alignée sur sa première ligne, à 14px du texte ; au survol, elle se teinte de blanc à 15 %. Une phrase cochée reçoit une croix rouge #ef4444 dans sa case, dont le filet passe au même rouge, son texte passe en #8a8a8a, et un tag monospace de 10px, « À REVOIR », en blanc, s’affiche à sa droite.

**Le champ des remarques.** Il vient 44px après la dernière partie, sous son titre « Ce qui déplaît ». Le champ est un aplat gris #1c1c1c, sans bordure, au coin supérieur droit coupé en biais sur 14px, haut de 120px au départ et extensible en hauteur, avec 16px de marge intérieure en haut et en bas et 18px sur les côtés. Le texte tapé est dans la police d’interface de l’appareil, en 16px, en blanc, pour que tout caractère tapé s’affiche ; le texte d’invite, « Écris ici ce qui te gêne dans les phrases cochées… », est en #9a9a9a. L’aplat passe à #222222 au survol et à #262626 pendant la saisie.

**Le bouton.** Un aplat blanc, sans bordure, au coin supérieur droit coupé sur 10px, avec 11px de marge intérieure en haut et en bas et 20px sur les côtés ; son libellé est en monospace 13px, en noir. Au survol, l’aplat passe à #d4d4d4. Sur la page de choix, il se place à droite, 20px sous le champ ; après l’envoi, son libellé devient « Envoyé ». Sur la page finale, il se place à droite de l’en-tête. Une phrase masquée y laisse une ligne en pointillés de 1px, en blanc à 50 %, sur toute la largeur, à la hauteur de sa première ligne.

**À toutes les largeurs.** Sur un écran étroit, les marges latérales du bloc passent à 18px, les phrases à 17px, le bouton d’envoi occupe toute la largeur, et le bouton de la page finale passe sous le nom du sujet.
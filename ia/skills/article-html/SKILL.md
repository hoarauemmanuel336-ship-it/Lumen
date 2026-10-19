---
name: article-html
description: "Composer un article en une page HTML sombre, au format question-réponse : une question en titre, une réponse brève en tête, puis la réponse développée en parties, lisible par le novice comme par le lecteur confirmé. À utiliser dès qu'un article est demandé en HTML."
---

# Article HTML

## Ce que produit la skill

Un fichier HTML autonome qui contient un seul article. L'article répond à une question : la question sert de titre, la réponse occupe toute la page. Le fichier s'ouvre dans n'importe quel navigateur, sur ordinateur comme sur téléphone, et se suffit à lui-même (styles et script dans le même fichier, polices chargées depuis Google Fonts).

Le nom du fichier reprend le sujet de l'article, en minuscules, mots reliés par des tirets.

## Le lecteur

L'article s'adresse à deux lecteurs à la fois : le novice, qui découvre le sujet et parfois jusqu'à son existence, et le lecteur confirmé, qui vient approfondir.

L'écriture part de ce que le novice connaît déjà, puis monte pas à pas. Chaque terme propre au sujet est expliqué à l'endroit même où il apparaît pour la première fois, en une phrase claire glissée dans le texte ; la suite l'emploie ensuite librement. Le lecteur confirmé trouve sa part dans la précision, les nuances et les liens que la réponse établit d'une partie à l'autre.

Le ton est celui d'une personne qui explique de vive voix à quelqu'un qu'elle respecte : phrases claires, mots courants, exemples concrets, rythme vivant.

## La question

L'IA formule la question telle qu'un lecteur curieux la poserait : directe, en langage courant, terminée par un point d'interrogation. Quand la demande donne un sujet plutôt qu'une question, l'IA choisit la question qui mène au cœur de ce sujet.

## La réponse

La page se lit dans cet ordre.

**L'en-tête.** La question en grand, puis, juste dessous, la durée de lecture, calculée sur le texte réel à raison de 230 mots par minute et arrondie à la minute, puis un séparateur.

**En bref.** Un bloc, juste sous l'en-tête, qui répond à la question en quelques phrases. Le lecteur pressé repart avec l'essentiel ; le lecteur qui reste sait où la réponse le mène.

**Les parties.** La réponse développée, découpée en parties dont l'IA juge le nombre d'après le sujet. Chaque partie s'ouvre sur un tag numéroté, un intertitre et un séparateur. L'intertitre dit ce que la partie apporte à la réponse ; il prend la forme d'une question quand la partie répond à une question que le lecteur se pose à ce moment-là. Les parties s'enchaînent : chacune s'appuie sur ce que la précédente a établi.

**Les encadrés.** Au fil des parties, l'IA dispose de trois encadrés, qu'elle place là où ils servent le lecteur :
- la définition, pour un terme qui mérite plus qu'une phrase dans le texte ;
- la citation, pour un texte cité dont la lettre compte ;
- « À retenir », pour une idée sur laquelle la suite repose.

**Pour retenir.** La dernière partie, qui reprend la réponse en quelques phrases et la rattache à la question du titre.

L'article garde la longueur d'un article : il se lit d'une traite. L'IA règle cette longueur d'après ce que le sujet demande pour être compris et approfondi.

## L'ambiance visuelle

L'article traite un seul et même sujet : toute la page est en blanc, à diverses opacités, sur le noir du fond. Sa technique est celle d'une page de manuel : une colonne de lecture libre de tout cadre, des encadrés qui annoncent leur rôle par une étiquette en tête et se distinguent par un trait ou un filet, et un seul cadre de lecture, « À retenir », qui ressort d'autant.

### Page et colonne

- Fond de page : `#0a0a0a` uni.
- Colonne de lecture centrée, largeur maximale 720px.
- Marges latérales : 16px sur téléphone, 32px à partir de 720px de large. La page tient dans la largeur de l'écran à partir de 360px, avec un défilement uniquement vertical.
- Espacement vertical : 28px entre l'en-tête et « En bref », 56px avant chaque tag de partie, 26px au-dessus et au-dessous d'un encadré.
- Barre de progression de lecture : trait de 2px, blanc, fixé tout en haut de la fenêtre, qui s'allonge à mesure que le lecteur descend.

### Polices

Les polices se chargent depuis Google Fonts en une seule ligne.

- Question du titre : Cormorant Garamond 600, `clamp(34px, 7vw, 54px)`, interligne 1.12, blanc `#ffffff`.
- Durée de lecture : JetBrains Mono 400, 11px, majuscules, espacement des lettres 0.24em, `rgba(255,255,255,0.55)`, 14px sous le titre.
- Intertitres : Cormorant Garamond 600, `calc(21px * var(--z))`, interligne 1.2, majuscules, espacement des lettres 0.08em, blanc.
- Texte de lecture : Literata 400, `calc(20.5px * var(--z))`, interligne 1.5, couleur `rgba(255,255,255,0.82)`, justifié aux deux bords, coupure des mots en fin de ligne (`hyphens: auto`, page en `lang="fr"`), première ligne des paragraphes alignée sur les autres, 0.7em entre deux paragraphes. Le gras est blanc pur `#ffffff` en graisse 500, l'italique reste dans la couleur du texte.
- Étiquettes et tags : JetBrains Mono.
- Boutons de taille du texte : Inter 400.

### Tag numéroté, intertitre et séparateur

- Le tag et l'intertitre se tiennent sur une même ligne, alignés sur leur ligne de base, écart de 14px.
- Tag : numéro de la partie sur deux chiffres, JetBrains Mono 700, 12px, blanc, encadré d'un trait intérieur de 1px `rgba(255,255,255,0.7)`, rembourrage 3px 8px, petits coins coupés de 4px en haut à droite et en bas à gauche (`clip-path: polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))`). La partie « Pour retenir » porte un tiret cadratin à la place du numéro.
- Séparateur : trait de 1px, 18px sous l'intertitre et 22px au-dessus du texte, en dégradé blanc qui s'efface vers la droite : `linear-gradient(90deg, rgba(255,255,255,.7), rgba(255,255,255,.35) 25%, rgba(255,255,255,.12) 50%, rgba(255,255,255,.04) 75%, transparent)`. L'en-tête porte le même séparateur sous la durée de lecture.

### Étiquettes

Chaque bloc et chaque encadré porte en tête son étiquette (« EN BREF », « DÉFINITION », « CITATION », « À RETENIR »), 10px au-dessus de son texte : JetBrains Mono 700, 10px, majuscules, espacement des lettres 0.14em, blanc, rembourrage 3px 8px, encadrée d'un trait intérieur de 1px blanc, avec les mêmes petits coins coupés de 4px que le tag.

### En bref

Fond `rgba(255,255,255,0.05)`, trait plein de 2px blanc sur le bord gauche, rembourrage 18px sur téléphone et 20px 26px 18px à partir de 720px.

### Encadrés

- Définition : trait plein de 2px blanc sur le bord gauche, texte décalé de 20px ; l'étiquette est pleine, fond blanc et texte noir ; le texte s'ouvre sur le terme défini, en gras, suivi d'un deux-points.
- Citation : filet de 1px en pointillé `rgba(255,255,255,0.6)` sur le bord gauche, texte décalé de 20px, en italique, entre guillemets français ; la source suit, alignée à droite, en JetBrains Mono 11px, `rgba(255,255,255,0.55)`.
- À retenir : le cadre à double filet, fond noir absolu `#000000`, formé de trois traits intérieurs superposés (`box-shadow: inset 0 0 0 1px rgba(255,255,255,.8), inset 0 0 0 5px #0a0a0a, inset 0 0 0 5.5px rgba(255,255,255,.35)`), angles droits, rembourrage 18px 20px 17px sur téléphone et 20px 26px 19px à partir de 720px ; texte blanc pur en graisse 500.

### Pour retenir

La dernière partie suit la forme des autres : tag, intertitre « Pour retenir », séparateur, puis le texte, sur le fond de la page.

### Cartes côte à côte

Quand l'article présente des éléments parallèles en cartes côte à côte, chaque carte a un fond noir absolu `#000000`, un contour intérieur de 0.5px `rgba(255,255,255,0.2)`, un coin coupé de 12px en haut à droite et un rembourrage de 16px. La grille passe par un conteneur flexible qui va à la ligne (`flex-wrap: wrap`, écart de 16px), chaque carte en `flex: 1 1 240px` : les cartes de la dernière ligne s'élargissent ainsi pour remplir toute la ligne.

### Taille du texte

Le réglage se place tout en bas de l'article, 48px sous la dernière partie, centré sur une ligne : l'étiquette « Taille du texte », puis, 10px plus loin, trois boutons A−, A et A+, séparés de 6px.

- Étiquette : JetBrains Mono 400, 10px, majuscules, espacement des lettres 0.14em, `rgba(255,255,255,0.45)`.
- Boutons : largeur minimale 38px, rembourrage 7px 9px, fond transparent, contour intérieur de 0.5px `rgba(255,255,255,0.2)`, petit coin coupé de 4px en haut à droite (`clip-path: polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)`), les trois autres angles droits ; Inter 400, texte `rgba(255,255,255,0.7)`, à 11px pour A−, 13px pour A et 15px pour A+. Au survol, le texte passe au blanc pur avec une lueur blanche (`text-shadow: 0 0 8px rgba(255,255,255,.3)`) et le contour à `rgba(255,255,255,0.35)`. Sur téléphone, chaque bouton mesure 44px de côté, texte centré.
- La variable `--z` porte la taille, sur six crans : 0.85, 0.925, 1, 1.08, 1.16 et 1.25. La page s'ouvre au cran le plus ample, 1.25, qui est sa taille par défaut.
- A− descend d'un cran, A+ monte d'un cran, A revient à la taille par défaut. Le bouton qui arrive au bout de sa course s'éteint (opacité 0.3, inactif).
- Le texte de lecture, les intertitres et les encadrés suivent le réglage. Le choix du lecteur reste en mémoire dans son navigateur (lecture et écriture entourées d'un `try/catch`, la page s'ouvrant au cran le plus ample quand ce souvenir manque).

## Écriture à plusieurs mains

Quand l'IA confie la rédaction de parties à des sous-agents, ces sous-agents tournent sur le même modèle qu'elle. Une fois leurs textes reçus, l'IA relit elle-même l'article entier d'une seule main : elle unifie le ton, raccorde les parties pour que chacune s'appuie sur la précédente, règle les répétitions d'exemples ou de citations, et s'assure que chaque terme est expliqué à sa première apparition dans l'article assemblé.

## Relecture du contenu

L'article terminé, l'IA confie sa relecture à un seul agent, sur le même modèle qu'elle, qui relève les erreurs de fond : faits, dates, attributions, citations, raisonnements. L'IA principale apporte ensuite elle-même les corrections, puis livre le fichier.

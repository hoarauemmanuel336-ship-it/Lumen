---
name: "diagrammes-interactifs"
description: "Produire un widget HTML interactif d'apprentissage, sombre et dense, en fichier autonome : sections repliables, éléments qui déplient leur explication au clic, trois ampleurs et trois épaisseurs au choix, taille du texte réglable, mises en page standard et figures composées sur mesure d'après la forme propre de chaque sujet. À utiliser dès qu'un diagramme, une carte mentale, une vue d'ensemble interactive ou un widget d'exploration est demandé."
---

OBJECTIF ET CONTENU

Produire un widget HTML interactif d'apprentissage, livré comme fichier autonome, que le lecteur consulte seul. Le widget donne une vue d'ensemble structurée d'où le lecteur explore en profondeur : chaque élément contient son explication, rédigée à la fabrication, qui se déplie au clic et se referme d'un toucher sur son titre comme sur son texte. Il est riche et dense.

Rôle. Le diagramme sert à saisir un sujet d'un seul regard : ses parties, ce qui les relie, ce qui les oppose et comment elles s'enchaînent, ce qui le produit et ce vers quoi il tend. Le lecteur apprend avec l'IA, qui compose pour lui ce qu'il étudie, et le diagramme lui donne la carte du sujet : il la garde en tête pour situer chaque notion qu'il rencontre, et descend dans le détail là où il le choisit. Le widget enseigne à lui seul tout ce qu'il montre. Le fichier se transmet tel quel à quiconque veut apprendre.

Public. Le diagramme s'adresse en même temps au novice, qui ignore jusqu'à l'existence du sujet traité, et au lecteur confirmé, qui vient approfondir ce qu'il connaît déjà. Tout ce qui s'écrit dans le widget part donc de ce que le novice connaît déjà : le sujet se nomme en clair, chaque terme technique reçoit sa définition à l'endroit même où il paraît, en quelques mots dans la phrase qui l'introduit, et l'ordre des sections conduit le lecteur du connu vers le neuf. Le lecteur confirmé trouve sa part dans le même texte : la densité, la précision des distinctions et les explications qui ouvrent le fond du sujet. Une seule écriture sert les deux, la définition brève au passage laissant le développement continuer à son plein niveau. Les ampleurs et les épaisseurs servent la même double adresse : le centré et l'abrégé ouvrent au novice une porte nette sur le cœur du sujet, le complet et l'intégral donnent au lecteur confirmé toute l'étendue et tout le détail du terrain.

LE MOTEUR ET LE CONTENU

Le widget se compose de deux parts. Le moteur, rangé dans le dossier `moteur` de cette skill, porte toute la mécanique et toute l'apparence : fond, cartes à coin coupé, typographie et polices intégrées, sections repliables et leurs animations, dépli des explications, rangée des réglages, grilles, adaptation au téléphone, état retenu d'une venue à l'autre. Le contenu est la part que l'IA rédige : un fichier écrit dans un balisage simple que le moteur sait afficher, avec les figures qu'elle compose pour les mises en page particulières. Toute l'attention de l'IA va ainsi au sujet, et le widget garde d'un diagramme à l'autre la même finition.

Fabrication. L'IA écrit le contenu dans un fichier, par exemple `contenu.html`, puis l'assemble avec le moteur par la commande :

```
python3 <dossier de la skill>/moteur/assembler.py contenu.html <nom-du-diagramme>.html
```

Le fichier produit est le widget complet, autonome, prêt à être livré. Pour reprendre un diagramme déjà assemblé, l'IA en retire le contenu par `python3 <dossier de la skill>/moteur/assembler.py --extraire <diagramme>.html contenu.html`, le modifie, puis l'assemble de nouveau : le diagramme repart alors avec le moteur le plus récent. L'assemblage applique de lui-même la typographie française : espaces insécables devant les deux-points, le point-virgule, le point d'interrogation, le point d'exclamation, et à l'intérieur des guillemets français. L'IA écrit donc ses textes avec des espaces ordinaires.

Dès l'assemblage fait, le widget passe sous les yeux de l'IA : chaque mise en page particulière se photographie et se juge sur capture d'écran, selon la section MISE EN PAGE SOUS LES YEUX plus bas. Le widget se livre une fois toutes ces captures nettes.

L'ART D'EXPLIQUER UN ÉLÉMENT

La question du sujet. Avant le plan, l'IA formule la question centrale à laquelle le diagramme répond, puis les points où un novice bute et les idées fausses qu'il porte souvent. Le plan se bâtit pour traverser ces obstacles.

Connaître un sujet. Connaître un sujet, c'est le connaître par ses causes : savoir ce dont il est fait, ce qui fait de lui ce qu'il est, ce qui le produit ou le met en mouvement, et ce vers quoi il tend. La carte du sujet les embrasse toutes, et le diagramme les fait voir d'un seul regard. Ces causes disent quand la carte est complète ; les sections, elles, suivent les articulations propres au sujet, telles que le sujet les appelle. L'explication de la bannière s'ouvre sur la définition du sujet, une phrase courte qui dit sa nature, et chaque section apporte ensuite un aspect nouveau.

Le pourquoi autant que le quoi. Chaque notion reçoit sa raison d'être : ce qu'elle explique, ce qu'elle résout, ce qui manquerait sans elle. Un lecteur qui sait pourquoi retient bien mieux.

La première phrase dit l'essentiel. Le lecteur qui ne lit qu'elle repart avec l'idée juste.

Le lien avec le voisinage. Chaque explication situe son élément dans l'ensemble : elle dit ce qui le distingue de ses voisins et ce qui l'y relie.

Le choix de la forme. Quand plusieurs formes conviennent à une section, l'IA prend celle qui fait voir la structure réelle du sujet.

Toute la matière du sujet. Le plan suit d'abord la matière, et la forme vient la servir. Quand une figure ne porte qu'une part de ce que le sujet contient, le reste prend place dans une section voisine, de sorte que tout ce qui appartient au sujet trouve sa place dans le diagramme.

Des titres et des descriptions de carte qui enseignent déjà. Le lecteur qui ne déplie rien comprend le sujet d'un coup d'œil.

L'équilibre entre le dit et le déplié. La carte donne le repère, l'explication donne la compréhension, et chaque niveau apporte une matière neuve.

STRUCTURE DU WIDGET

Bannière. Le titre du sujet et un sous-titre bref, en monospace, qui le situe. Son explication expose la logique d'ensemble du sujet et s'ouvre sur sa définition.

Blocs de couleur. Un sujet simple et unifié reste entièrement neutre, en blanc. Un sujet structuré en grandes phases distinctes regroupe ses sections en blocs thématiques : chaque bloc reçoit une couleur vive et saturée, bien distincte de celle de ses voisins, et un intertitre qui dit à quel titre ses sections vont ensemble. L'intertitre se lit avant toute ouverture et transforme le changement de teinte en information. L'intertitre d'un bloc de plusieurs sections porte son explication, qui expose la logique d'ensemble de ce que le bloc rassemble. Un bloc d'une seule section garde son intertitre comme simple repère, et son explication vit sur la section, dont le chapeau porte aussi la logique d'ensemble du bloc : une seule explication pour un seul sujet.

Sections. Chaque section porte un titre en majuscules, précédé de son numéro, et une explication de titre qui dit de quoi parle la section et comment ses éléments s'articulent. Elle s'ouvre et se replie d'un clic ; son contenu prend l'une des mises en page décrites plus bas.

Sous-groupes. Dans une section en mise en page standard, des sous-groupes rassemblent les cartes qui vont ensemble, chacun avec un titre, une description brève en monospace et son explication.

Cartes. Chaque carte porte un titre, une description qui se lit au repos, puis son explication, dépliée au clic. Une référence ou un mot-clé qui accompagne le titre s'intègre à la description en prose. Les cartes posées côte à côte sur une même ligne portent un coin coupé ; une carte qui se tient seule sur sa ligne, au-dessus ou au-dessous d'une autre, a des angles droits. Le moteur applique cette règle de lui-même, d'après la place réelle de chaque carte à l'écran.

Réglages. Sous la bannière, l'ampleur et l'épaisseur se présentent côte à côte, chacune avec ses trois choix sur une ligne, l'ensemble centré sous la bannière. La taille du texte se règle tout en bas du diagramme, après la dernière section.

MISES EN PAGE DES SECTIONS

Choix de la mise en page. Pour chaque section, se demander : qu'est-ce qu'une personne non familière a besoin de connaître, dans quel ordre, sous quelle forme ? La forme découle de la fonction.

Standard séquentielle. Une colonne de cartes, pour des éléments ordonnés : récit, chronologie resserrée, étapes d'un raisonnement.

Standard parallèle. Une grille de cartes en plusieurs colonnes, pour des éléments indépendants : typologie, thèmes, classification. Le moteur donne aux cartes fermées d'une même ligne la même hauteur, celle de la plus haute d'entre elles, fait occuper toute la largeur à une carte dépliée et élargit les cartes restées seules sur une ligne. Le nombre de cartes suit ce que le sujet appelle.

Mises en page particulières. Au-delà des deux mises en page standard, chaque section dont la matière a une forme propre reçoit une figure que l'IA compose elle-même pour ce sujet. Elle part de la structure réelle de la matière, de ce que sont ses éléments et de la manière dont ils se rapportent les uns aux autres, et dessine la figure qui rend cette structure visible d'un seul regard. La forme naît du sujet : l'IA la juge et l'invente à chaque fois, en se demandant ce que la figure doit faire voir que des cartes ne montrent pas.

Une figure dessine le sujet sans cadre, à même la page : ses éléments portent leur nom écrit sur la figure, en libellés courts. Quand les rapports entre éléments portent eux-mêmes du sens, ils se dessinent aussi et se nomment le long de leur trait. Un élément qui fait figure de référence ou de cœur se distingue par la couleur pleine de la section. Chaque élément de la figure s'explore. Chaque élément, chaque nom d'ensemble et chaque rapport qui porte du sens se touche : il s'éclaire, les autres s'estompent, et son explication s'ouvre en pleine largeur sous la figure, précédée d'un repère bref quand l'élément en porte un (une heure, une date, un rang, une position) et de son titre, avec ses volets à déplier ; la page descend jusqu'à elle. Toucher un autre élément remplace l'explication par la sienne. Toucher l'explication, ou de nouveau l'élément, la referme, et la page revient à l'élément, qui s'illumine pour se laisser retrouver. Le lecteur parcourt ainsi la figure comme une carte : il garde la vue d'ensemble sous les yeux et entre dans chaque élément l'un après l'autre. Chaque élément de la figure est ainsi lui-même explorable : son explication s'ouvre sur l'essentiel et se déploie en volets, selon la règle posée sous EXPLICATIONS.

La figure est soignée comme une planche : proportions justes, traits fins, libellés lisibles, espace qui respire. Elle garde l'ambiance du widget et s'adapte au téléphone, où elle se redispose pour que chaque libellé reste lisible. Quand la matière d'une section dépasse ce qu'une figure porte avec netteté, elle se répartit en plusieurs sections.

AMPLEUR ET ÉPAISSEUR

Deux choix du lecteur. Le lecteur choisit l'ampleur, qui dit le terrain que le widget lui montre, et l'épaisseur, qui dit la profondeur à laquelle il le parcourt. Trois ampleurs, Centré, Élargi, Complet, et trois épaisseurs, Abrégé, Courant, Intégral, se combinent librement : le même widget offre ainsi neuf lectures. Le widget s'ouvre à l'ampleur élargie et à l'épaisseur intégrale.

Trois ampleurs. Avant d'écrire, l'IA dresse la carte du sujet : son cœur, puis les domaines qui l'entourent, tels qu'elle les discerne pour ce sujet. Elle en tire trois périmètres emboîtés, chacun défini par la question à laquelle il répond : l'ampleur centrée montre ce qu'il faut savoir pour pouvoir dire qu'on connaît le sujet, le sujet connu par ses causes propres ; l'ampleur élargie y ajoute ce qu'il faut pour situer le sujet dans son voisinage, ce qui le prépare, ce qui l'entoure et ce qui en découle directement ; l'ampleur complète y ajoute tout ce qu'un connaisseur du sujet juge digne d'y être rattaché, jusqu'aux domaines dont le lien reste éclairant. Ces trois questions servent de test : l'IA les pose à chaque section et à chaque élément pour fixer son ampleur. Le widget est rédigé sur la carte entière, et chaque ampleur en montre la part qui lui revient.

Trois épaisseurs. L'abrégé donne l'ossature du sujet et l'essentiel de chaque élément, le courant déploie le raisonnement, l'intégral porte le détail et les nuances. L'écriture se fait dans ce sens, du niveau 1 vers le niveau 3, chaque niveau s'insérant dans un texte qui se tenait déjà.

Pose des niveaux. Chaque élément porte son ampleur d'entrée dans l'attribut `a` et son épaisseur d'entrée dans l'attribut `n`, de valeur 2 ou 3 ; un élément sans attribut vaut 1 et paraît dans toutes les lectures. Un élément de niveau 2 paraît à partir de l'élargi ou du courant, un élément de niveau 3 dans le complet ou l'intégral seuls. L'ampleur se pose d'abord sur les sections entières, un domaine voisin formant le plus souvent ses propres sections ; elle se pose aussi, à l'intérieur d'une section centrale, sur tout élément ou tout paragraphe d'explication qui relie le cœur à un domaine voisin. L'épaisseur se pose surtout sur les paragraphes des explications, et aussi sur les éléments qui relèvent du détail. Une figure se lit entière dans chaque lecture : elle montre à chaque lecture les seuls éléments qui lui reviennent, numérotés sans trou quand elle les numérote, et son cœur paraît dans toutes. L'intertitre de bloc prend de lui-même les niveaux les plus bas de ses sections, et la numérotation des sections se suit sans trou dans chaque lecture.

Chaque lecture se tient seule. Le centré se lit comme un widget entier sur le cœur du sujet, et les ampleurs plus larges y ajoutent leurs éléments à leur place dans l'ordre de lecture. Chaque explication s'ouvre par un paragraphe de niveau 1 qui dit l'essentiel de son élément, si bien que tout élément rendu garde son explication dans l'abrégé ; le courant et l'intégral y ajoutent leurs paragraphes. Ce qu'une explication dit d'un élément d'une ampleur plus large se tient dans un paragraphe qui porte cette ampleur.

EXPLICATIONS

Rôle. Les explications sont le cœur du widget. Le diagramme porte en lui toute la connaissance du sujet : la carte d'ensemble se voit d'un coup d'œil, et chaque élément livre au clic ce qu'il y a à savoir sur lui. Le lecteur explore en dépliant ce qu'il veut approfondir, et le widget se suffit à lui-même.

Ce que transmet une explication. L'objectif premier est la compréhension du sujet : dégager la logique, les enjeux, la portée de l'élément. Comprendre suppose de connaître : l'explication transmet donc d'un seul tenant la matière et son intelligence, sous la forme que la nature de l'élément appelle. Un récit se raconte, un concept s'expose, une doctrine se déploie, un personnage se présente, une technique se décrit, un événement se situe. L'explication donne d'abord ce que le débutant a besoin d'apprendre, ce qu'est la chose, sa définition, sa distinction principale, puis conduit à ce qui en fait comprendre le sens. Sa longueur suit ce que l'élément appelle : quelques phrases pour un détail, plusieurs paragraphes pour une notion qui porte beaucoup.

Logique d'ensemble. Tout titre du widget qui nomme un sujet rassemblant plusieurs éléments, à quelque niveau qu'il se tienne, de la bannière aux noms d'ensemble d'une figure, reçoit une explication qui prend ce sujet comme un tout doté de son sens propre et en expose la logique d'ensemble : le sujet compris d'un seul tenant, dans sa nature, sa raison d'être, son mouvement du commencement jusqu'au terme, ce qu'il fait voir et ce qu'il change. Les éléments placés sous le titre y prennent leur place à l'intérieur de ce mouvement, et leurs propres explications les approfondissent. La carte, qui nomme un élément unique, reçoit la même exigence à sa mesure : son explication dégage la logique propre de ce qu'elle nomme.

Explication de relation. Dans une figure, un trait, une flèche ou un lien qui figure le rapport entre deux éléments porte une explication de relation : elle expose ce qui relie les deux termes, ce qui passe de l'un à l'autre, ce qui change de l'un à l'autre.

Explorer par volets. Le volet est propre aux mises en page particulières. Dans une figure, chaque élément touché est lui-même un sujet à explorer : son explication s'ouvre sur un paragraphe qui dit l'essentiel, puis se déploie en volets, autant que l'élément a d'aspects à faire découvrir, chacun titré d'après l'aspect qu'il développe, fermés au départ, que le lecteur déplie un à un et referme d'un toucher sur leur titre ou leur texte ; le lecteur entre ainsi dans l'élément et le parcourt comme il parcourt la figure. Chaque volet garde la lecture autonome de l'explication et porte une matière propre. Partout ailleurs, cartes, sous-groupes, sections, intertitres de bloc et bannière, l'explication se déplie d'un seul tenant : elle s'ouvre sur le paragraphe essentiel, puis se poursuit en paragraphes suivis.

Lecture autonome. Le lecteur ouvre les explications dans l'ordre qu'il choisit. Chacune nomme donc son sujet en toutes lettres et se comprend seule, tout en s'accordant avec le titre qui la gouverne. Les termes techniques y reçoivent leur définition à l'endroit où ils paraissent, selon la règle du public posée en tête.

Langue. Tous les textes du widget, explications comprises, sont rédigés dans la langue de l'utilisateur. Le contenu visible emploie virgules, parenthèses ou deux-points selon le contexte.

FORMAT DU CONTENU

Le contenu est un arbre de balises simples. Les titres et les descriptions s'écrivent en attributs, les explications en paragraphes HTML à l'intérieur d'une balise `<explication>`. Chaque balise se ferme par sa balise de fin.

Racine. `<diagramme titre="…" sous-titre="…">` enveloppe tout le contenu. Son premier enfant est l'`<explication>` de la bannière, puis viennent les blocs, ou directement les sections pour un diagramme neutre.

Bloc. `<bloc nom="…">` rassemble des sections de même couleur, avec son `<explication>` quand il en compte plusieurs. Le moteur attribue à chaque bloc une couleur de sa palette, dans l'ordre ; un attribut `couleur="#rrggbb"` fixe une autre teinte vive quand le sujet en appelle une.

Section. `<section cle="…" titre="…" mise="…">` contient son `<explication>` de titre puis son contenu. La clé est un mot court tiré du sujet de la section, unique dans le diagramme : l'état retenu nomme les sections par elle. L'attribut `mise` vaut `sequentielle`, valeur par défaut, ou `parallele`. Une section en mise en page particulière contient, après son explication, la `<libre>` qui porte sa figure.

Contenu d'une section standard. Des `<carte>` directement, ou des `<groupe titre="…" desc="…">` qui contiennent leur `<explication>` puis leurs cartes. Un groupe reçoit sa propre valeur `mise="parallele"` ou `mise="sequentielle"` quand il diffère de sa section.

Carte. `<carte titre="…" desc="…">` contient son `<explication>`.

Explications. À l'intérieur d'une `<explication>`, chaque paragraphe est un `<p>`, qui reçoit `a` et `n` selon sa lecture. Une explication longue qui appelle des étapes reçoit des intertitres internes en `<h4>`. Dans une `<libre>`, l'explication d'un élément s'ouvre sur son paragraphe essentiel, puis range chaque aspect dans un `<volet titre="…">`, qui contient ses paragraphes et reçoit lui aussi `a` et `n`. L'italique s'écrit `<i>`, le gras `<b>`. Les titres, descriptions et libellés en attribut acceptent aussi `<i>` et `<b>`.

Figure. `<libre>` contient la figure d'une mise en page particulière, écrite par l'IA en HTML, en SVG ou dans les deux, accompagnée de son propre `<style>`. Chaque élément à explorer porte l'attribut `depli`, dont la valeur est un mot court qui le nomme, unique dans la figure, ainsi que `titre="…"`, le titre complet qui ouvre son explication, et, au besoin, `repere="…"`, le repère bref écrit au-dessus du titre. L'attribut se pose sur l'élément entier, groupe SVG `<g>` comme bloc HTML, de sorte que tout ce qui le dessine, forme et libellé, se touche d'un seul tenant. Les explications s'écrivent après le dessin, dans la même `<libre>`, chacune dans une `<explication pour="…">` dont la valeur reprend celle de l'attribut `depli` de son élément ; le moteur les retire de la page et les ouvre sous la figure au toucher, avec l'éclairage, l'estompe, le défilement et le retour à l'élément. Les éléments de la figure prennent leur ampleur et leur épaisseur par les attributs `data-a` et `data-n`, de valeur 2 ou 3 : le moteur les montre et les cache de lui-même d'une lecture à l'autre, et la figure se compose de sorte qu'elle reste entière et équilibrée dans chaque lecture. La couleur de la section s'écrit `rgb(var(--acr,255,255,255))`, et ses nuances par l'alpha. La figure garde l'ambiance du widget : fond #0a0a0a qui transparaît, cartes en noir absolu #000 avec bordure hairline blanche à 0.2 d'alpha, coin coupé de 12px en haut à droite pour les cartes posées côte à côte et angles droits pour les cartes posées l'une sous l'autre, traits structurants de 1px en blanc atténué (0.12 à 0.4 d'alpha), Inter pour les titres et le texte de lecture, JetBrains Mono pour les libellés, explications justifiées sur toute la largeur de leur cadre, et tailles de texte écrites `calc(Npx * var(--dz,1.25))` pour suivre le réglage de taille. Les sélecteurs de son style commencent par une classe propre à la figure, de sorte que chaque figure garde son apparence pour elle.

Exemple de forme :

```html
<diagramme titre="Titre du sujet" sous-titre="ce qui le situe">
<explication>
<p>Définition du sujet, puis sa logique d'ensemble.</p>
<p n="2">Le raisonnement qui la déploie.</p>
</explication>
<bloc nom="Nom du premier bloc">
<explication><p>Ce que ce bloc rassemble.</p></explication>
<section cle="origines" titre="Titre de section" mise="parallele">
<explication><p>De quoi parle la section.</p></explication>
<groupe titre="Sous-groupe" desc="ce qu'il range">
<explication><p>La logique du sous-groupe.</p></explication>
<carte titre="Titre de carte" desc="Description lue au repos.">
<explication><p>L'essentiel.</p><p n="3">Le détail.</p></explication>
</carte>
</groupe>
</section>
<section cle="voisinage" titre="Un domaine voisin" a="2">
…
</section>
</bloc>
</diagramme>
```

ÉCRITURE À PLUSIEURS MAINS

Le contenu du widget peut être confié à des sous-agents qui rédigent en parallèle, chacun une part du diagramme. L'IA principale garde alors la charge de l'unité du diagramme, de la bannière au dernier élément.

Une consigne commune précède la rédaction. L'IA principale la rédige dans un fichier que chaque sous-agent lit en entier avant d'écrire. Elle y pose le plan d'ensemble du diagramme avec l'ampleur de chaque élément, la répartition de la matière entre les trois épaisseurs, la part de chacun, le public, le ton, les règles de fond et de forme, et le format du contenu dans lequel chaque part se livre, de sorte que les parts s'assemblent telles quelles dans le fichier de contenu.

Une relecture d'une seule main suit la rédaction. Avant l'assemblage, l'IA principale lit elle-même le contenu entier, dans l'ordre où le lecteur le découvre, de la bannière au dernier élément. Elle donne à tous les textes une même voix. Elle accorde à chaque exemple et à chaque citation une place principale, celle où ils servent le mieux, et les fait reparaître ailleurs quand ce nouvel endroit en tire un éclairage propre qui justifie pleinement leur retour. Elle récrit les explications qui redisent ce qu'une autre porte déjà, en les remplaçant par une matière neuve. Le diagramme se lit alors comme l'œuvre d'un seul auteur, et chaque explication garde sa lecture autonome et sa pleine substance.

MISE EN PAGE SOUS LES YEUX

Principe. Seule une capture d'écran montre ce que le lecteur verra d'une figure. Après chaque assemblage, l'IA principale photographie elle-même chaque section dont la mise en page est particulière, puis regarde chaque capture. Le travail confié à des sous-agents passe par la même vue : la vérification revient toujours à l'IA principale.

Prise des captures. L'IA ouvre le fichier assemblé dans un navigateur (Chromium avec Playwright, présent dans l'espace de travail, ou le navigateur intégré). Elle lit la structure de la page assemblée pour repérer les sections, ouvre chacune, la fait défiler jusqu'à l'écran et photographie la section seule, avec une résolution qui laisse lire les plus petits libellés. Chaque section se photographie à largeur de bureau puis à largeur de téléphone, au repos puis avec un élément déplié, de sorte que la figure et l'explication ouverte se voient toutes deux. Les figures changeant d'une lecture à l'autre, l'IA les photographie dans la lecture la plus resserrée et dans la plus fournie.

Lecture des captures. L'IA ouvre chaque image et la juge en lecteur : tout ce qui s'écrit se lit en entier, tout ce qui se dessine tient à sa place et se détache de ses voisins, et la figure paraît soignée du premier coup d'œil, au bureau comme sur téléphone. Une figure qui porte plus d'éléments que sa place n'en accueille se redécoupe en deux sections ou prend une mise en page plus large.

Reprise. L'IA corrige chaque défaut dans le contenu : libellés plus courts, figure redessinée, nombre d'éléments ajusté, mise en page mieux choisie. Elle assemble de nouveau et photographie encore la section, jusqu'à ce que la capture montre une mise en page nette. Un défaut dont la source se trouve dans le moteur est présenté à l'utilisateur avec sa capture, pour qu'il décide de la suite. Après la relecture du contenu qui clôt le travail, les sections que les corrections ont touchées repassent par la même vue. Le widget se livre quand toutes ses mises en page particulières ont une capture nette.

RELECTURE DU CONTENU

Une fois le diagramme assemblé, l'IA confie sa relecture à un seul agent, qui tourne sur le même modèle qu'elle. L'agent lit le contenu entier, de la bannière au dernier élément, dépliages et volets compris, et dresse la liste des erreurs de fond qu'il y trouve : faits, dates, noms, chiffres, citations et références inexactes, explications fausses ou imprécises, et ce qui manque au sujet. Il remet cette liste à l'IA principale, qui corrige elle-même le contenu, assemble de nouveau le diagramme et le livre.
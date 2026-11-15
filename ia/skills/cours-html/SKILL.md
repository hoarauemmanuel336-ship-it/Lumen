---
name: "cours-html"
description: "Composer un cours d'initiation en une page HTML sombre, découpée en pages, avec leçons, encadrés, exercices corrigés, autoévaluation, bilan, fiches et glossaire ; un fichier peut réunir plusieurs cours. À utiliser dès qu'un cours est demandé ou à ajouter dans un fichier existant."
---

# Cours HTML

OBJECTIF

Produire un cours complet sur le sujet demandé, livré en un fichier HTML autonome que le lecteur ouvre dans son navigateur, sur ordinateur comme sur téléphone. Un cours se distingue d'un livre : il découpe un savoir en unités claires, montre chacune par l'exemple, la fait pratiquer, puis la résume pour qu'elle reste. Le lecteur l'apprend, vérifie qu'il en saisit l'ensemble, puis le révise, page après page. Un même fichier peut réunir plusieurs cours, sur les grands ensembles d'un même sujet ou sur des sujets voisins, que le lecteur parcourt l'un après l'autre ou choisit depuis le sommaire ; chaque cours se construit dès le départ pour pouvoir en accueillir d'autres, comme le décrit PLUSIEURS COURS DANS UN FICHIER.

Le cours est la porte d'entrée d'un sujet : il fait passer le lecteur de la découverte à des fondations solides, sur lesquelles il bâtit ensuite toute étude plus poussée. Le lecteur apprend avec l'IA, qui compose pour lui ce qu'il étudie, et le cours lui donne la part active de cet apprentissage : pratiquer, vérifier ce qu'il sait, réviser. Il enseigne à lui seul tout ce qu'il annonce. Le fichier se transmet tel quel à quiconque veut apprendre.

PUBLIC

Le cours s'adresse en même temps au novice, qui découvre le sujet, et au lecteur confirmé, qui vient l'approfondir. Il part de ce que le novice connaît déjà : chaque terme technique reçoit sa définition à l'endroit même où il paraît, et chaque leçon s'appuie sur les précédentes. Le lecteur confirmé trouve sa part dans la précision des distinctions et dans les exercices les plus exigeants.

LE MOTEUR ET LE CONTENU

Le cours se compose de deux parts. Le moteur, rangé dans le dossier `moteur` de cette skill, porte toute la mécanique et toute l'apparence : fond sombre, polices intégrées, pages et navigation, barre haute et sommaire (un panneau qui s'ouvre sur le bord gauche et défile sur toute la hauteur de l'écran, que le cours soit ouvert seul ou posé dans une page hôte), couleurs des leçons, encadrés, dépli des réponses et des corrigés, mots clés, autoévaluation et progression, plan du cours, fiches de révision, glossaire, réglage de la taille du texte, adaptation au téléphone, impression, progression enregistrée dans le fichier et échanges avec la page hôte. Le contenu est la seule part que l'IA rédige : un fichier écrit dans un balisage simple, décrit sous FORMAT DU CONTENU, que le moteur sait afficher. Toute l'attention de l'IA va ainsi au savoir et à son explication, et chaque cours garde la même finition.

Fabrication. L'IA écrit le contenu dans un fichier, par exemple `contenu.html`, puis l'assemble avec le moteur par la commande :

```
python3 <dossier de la skill>/moteur/assembler.py contenu.html <nom-du-cours>.html
```

Le fichier produit est le cours complet, autonome, prêt à être livré. L'assemblage applique de lui-même la typographie française, décrite sous TYPOGRAPHIE FRANÇAISE : l'IA écrit donc ses textes avec des apostrophes droites et des espaces ordinaires. Il donne aussi à chaque cours sa lettre et à chaque affirmation « Je sais… » sa clé, et les écrit dans le contenu que porte le fichier.

Reprise d'un cours. Pour faire évoluer un cours assemblé ou pour y ajouter un cours, l'IA en retire le contenu par :

```
python3 <dossier de la skill>/moteur/assembler.py --extraire <cours>.html contenu.html
```

Le contenu extrait s'ouvre sur une balise `<progression>` qui porte la progression inscrite dans le fichier, les affirmations cochées par le lecteur, et chaque affirmation y garde sa clé. L'IA modifie le contenu, puis l'assemble de nouveau par la commande de fabrication : le cours repart avec le moteur le plus récent et avec toutes ses coches.

ARCHITECTURE DU COURS

Avant d'écrire, l'IA dresse la carte du sujet, qui le fait connaître par ses causes, et la découpe en leçons, dans l'ordre où l'on apprend le mieux : les fondements d'abord, puis le cœur du sujet, puis ses prolongements. Le nombre de leçons, de parties, d'encadrés et d'exercices suit ce que le sujet appelle. Le moteur donne à chaque leçon sa couleur d'accent.

Un sujet vaste se compose en plusieurs cours. Quand la carte du sujet fait paraître de grands ensembles, chacun doté de son unité propre, de sa question centrale et d'une matière qui remplit un cours entier, l'IA compose d'emblée un fichier qui réunit un cours par ensemble, selon PLUSIEURS COURS DANS UN FICHIER. Chaque cours garde ainsi une taille qui se parcourt, se vérifie et se révise d'un seul tenant, avec son propre bilan et ses propres fiches. Les cours se suivent dans l'ordre où l'on apprend le mieux, chacun s'appuyant sur ceux qui le précèdent. Quand le lecteur fournit un plan déjà organisé en grands ensembles, chaque ensemble devient un cours et ses subdivisions deviennent les leçons de ce cours ; l'IA garde ce découpage et donne à chaque leçon toute la matière que le plan lui assigne.

Le cours se compose de pages qui se suivent :

- la page d'ouverture : la bannière, avec sa note sur la progression, puis une introduction brève qui dit ce que couvre le cours et à qui il s'adresse, comment les leçons s'enchaînent et comment chaque leçon est construite ; puis le plan du cours et le code du cours ;
- une page par leçon ;
- la page de bilan : des exercices qui croisent plusieurs leçons ;
- la page de révision : les fiches de révision, puis le glossaire.

L'IA écrit l'introduction, les leçons et le bilan ; le moteur compose la bannière, la note, le plan, le code du cours, les fiches de révision et le glossaire à partir d'eux.

LA LEÇON

Chaque leçon suit le même chemin en trois temps.

Ouverture. L'en-tête porte le libellé « Leçon » et son numéro, puis le titre. Viennent ensuite deux listes côte à côte : les objectifs, chacun précédé d'une flèche dans la couleur de la leçon, et les prérequis, qui nomment les leçons et les notions sur lesquelles celle-ci s'appuie. Puis le bloc « Pour commencer » : une question ou une situation concrète, en grand et en blanc, suivie de quelques phrases qui montrent pourquoi le sujet compte. La première partie suit directement ce bloc ; le sommaire donne accès aux parties de chaque leçon.

Corps. La leçon avance par parties numérotées en chiffres romains, du simple au complexe, une idée à la fois. La trame de fond de chaque notion va de la définition à l'explication en langage simple, puis à l'exemple, aux remarques et à la vérification ; l'IA fait respirer cette trame selon l'idée, en la resserrant, en l'étoffant ou en changeant l'ordre quand l'idée se comprend mieux autrement, pour que le texte garde le mouvement d'une vraie explication. Les paragraphes sont courts et commencent au ras de la marge. Un tableau sert quand l'idée se compare ou se range en colonnes ; une grille de cartes sert quand plusieurs éléments de même rang se présentent ensemble.

Clôture. Quatre blocs ferment la leçon, chacun annoncé par un intertitre :

- L'essentiel : ce que le lecteur apprend par cœur de la leçon, en quelques phrases écrites pour être redites de tête ; la première dit, en une phrase courte, la nature de ce que la leçon enseigne, et les suivantes apportent chacune un aspect nouveau. Le corps de la leçon fait comprendre, L'essentiel donne ce qui se retient une fois la leçon comprise ;
- Mots clés : les termes de la leçon, en boutons ; un toucher affiche la définition du mot, tirée du glossaire, sous la rangée ;
- Exercices : des exercices de difficulté croissante, qui mènent de la restitution de la leçon à son application, puis à la réflexion personnelle ; chacun porte un nom court qui dit ce qu'il demande et son corrigé à déplier ;
- Autoévaluation : des affirmations « Je sais… » à cocher, une par objectif, avec un compteur et une barre de segments. Chaque affirmation nomme, sous son texte, l'exercice ou les exercices de la leçon qui la mettent à l'épreuve, par un lien vers eux. Une note brève, sous l'intertitre, invite le lecteur à cocher une affirmation une fois ces exercices réussis : la coche dit alors un savoir éprouvé. Chaque objectif de la leçon trouve ainsi au moins un exercice qui le vérifie.

L'ART D'EXPLIQUER

Le cœur du cours est son explication. Tout ce que décrit cette skill, pages, encadrés, progression, sert un texte qui fait comprendre ; l'IA consacre à ce texte le meilleur de son attention.

La question du sujet. Avant le plan, l'IA formule la question centrale à laquelle le cours répond, puis les points où un novice bute et les idées fausses qu'il porte souvent. Le plan se bâtit pour traverser ces obstacles.

Connaître un sujet. Connaître un sujet, c'est le connaître par ses causes : savoir ce dont il est fait, ce qui fait de lui ce qu'il est, ce qui le produit ou le met en mouvement, et ce vers quoi il tend. La carte du sujet les embrasse toutes, et le cours conduit le lecteur jusqu'à cette connaissance, chaque leçon faisant de même pour la notion qu'elle enseigne. Ces causes disent quand la carte est complète ; les leçons, elles, suivent les articulations propres au sujet, telles que le sujet les appelle. Chaque sujet porte ses causes à sa manière, et l'IA les cherche dans sa nature même : un savoir qui contemple les montre dans ce qui fonde et explique son objet, un savoir-faire dans la pratique elle-même, ce sur quoi elle s'exerce, ce qui la rend juste, la manière de la conduire et le but qu'elle sert. Le cours les dit dans la langue du sujet, si bien que le lecteur suit une explication naturelle dont la connaissance par les causes fait la profondeur.

Le pourquoi autant que le quoi. Chaque notion reçoit sa raison d'être : ce qu'elle explique, ce qu'elle résout, ce qui manquerait sans elle. Un lecteur qui sait pourquoi retient bien mieux.

Aller du concret à l'abstrait. Une idée se montre d'abord dans un cas, puis se formule en général, puis revient au concret dans un second cas qui en éclaire une autre face. Le lecteur voit ainsi la règle naître des faits et y retourner.

Choisir des exemples qui éclairent. Un bon exemple est simple, frappant et fidèle : il montre la notion sans bruit, il se retient, et il la montre telle qu'elle est vraiment. L'IA choisit pour chaque notion l'exemple qui en fait voir le trait essentiel, et, quand deux notions voisines se ressemblent, un couple d'exemples qui les fait voir côte à côte, là où elles se séparent.

Aller au-devant des confusions. L'IA se met à la place du novice et repère où il risque de se tromper : deux mots proches, une idée qui semble dire le contraire de l'intuition, un raccourci tentant. L'explication traite ces endroits de front, au moment où ils se présentent, en posant la bonne distinction avec clarté ; l'encadré Attention porte les confusions qui comptent le plus.

Donner envie. Le bloc « Pour commencer » ouvre une vraie question, celle que le lecteur se pose ou se posera dès qu'il regarde le sujet de près : une énigme, une situation où l'on hésite, un fait étonnant. La leçon y répond pas à pas, et sa dernière partie donne la réponse entière, que le lecteur sait désormais formuler par lui-même. L'essentiel reste ainsi tout entier aux phrases de mémoire, chacune complète hors de la leçon.

Des exercices qui font apprendre. Les exercices font travailler la leçon sous plusieurs angles : restituer, reconnaître, appliquer, comparer, expliquer avec ses propres mots, juger une situation nouvelle. L'IA choisit leurs formes d'après ce que le sujet demande de savoir faire, et chaque exercice demande au lecteur un vrai effort de pensée. Les exercices de fin de leçon font aussi revenir, de loin en loin, des notions des leçons précédentes, pour que le lecteur les rappelle à sa mémoire au moment où il avance. Certains exercices placent le lecteur devant les erreurs habituelles du novice, et leur corrigé les nomme : le lecteur les reconnaît ensuite d'un coup d'œil.

Des corrigés qui enseignent. Chaque corrigé montre le chemin autant que l'arrivée : il déroule le raisonnement qui mène à la réponse, nomme la notion de la leçon qui l'éclaire, et, quand une réponse voisine est tentante, dit en quoi elle diffère de la juste. Le lecteur qui s'est trompé comprend ainsi pourquoi ; celui qui a réussi consolide ce qu'il savait.

Comprendre, puis retenir. Le cours distingue ce qui se comprend de ce qui s'apprend par cœur. Le corps de la leçon explique, montre et fait raisonner ; L'essentiel ramasse ce savoir en phrases de mémoire. Chacune porte une seule idée, se tient seule et garde tout son sens hors de la leçon, nomme les choses par les mots clés de la leçon, et suit un rythme qui se dit d'un souffle à voix haute. Ensemble, elles portent l'ossature de la leçon : le lecteur qui les récite tient ce qu'il a compris et peut le redéployer.

Une idée à la fois, à la bonne densité. Chaque paragraphe porte une idée, et chaque phrase fait avancer l'explication. Le texte donne à chaque notion la place qu'elle demande : plus d'espace aux idées difficiles, un pas rapide sur ce qui va de soi. La voix est celle d'un maître qui parle à un élève qu'il estime : claire, précise, chaleureuse.

LE BILAN

Le bilan vérifie que le lecteur tient le cours dans son ensemble. Ses exercices mobilisent chacun plusieurs leçons à la fois : une question qui fait relier deux notions, une situation qui demande d'en combiner plusieurs, une réflexion qui embrasse le sujet entier. Ils vont du plus simple au plus exigeant, et chacun porte son corrigé à déplier, qui montre quelles leçons se rejoignent et comment.

La page s'ouvre sur un en-tête au libellé « Bilan », avec un titre, puis une note brève qui dit au lecteur de s'y essayer avant d'ouvrir les corrigés. Chaque exercice reprend le cadre des exercices de leçon ; sous son niveau, une rangée de tags nomme les leçons qu'il mobilise, chacun dans la couleur de sa leçon et menant à elle. La page de bilan, qui rassemble toutes les leçons, prend le blanc pour couleur, et son séparateur traverse les couleurs de toutes les leçons.

LE CODE DES ENCADRÉS

Chaque type de contenu garde toujours la même forme d'un bout à l'autre du cours, et la couleur suit la leçon. Le code suit un principe : le cadre signale un endroit où le lecteur agit, et ce qui se lit se tient librement sur le fond de la page. Les encadrés de lecture se distinguent donc par un trait, un filet ou une bande ; « À retenir » est le seul encadré de lecture qui porte un cadre, et il ressort d'autant. Chaque encadré porte une étiquette, posée en tête de l'encadré, au-dessus de son texte. La page d'ouverture du premier cours présente ce code dans une grille de cartes, que le moteur compose : chaque carte est l'encadré lui-même, dans sa forme complète, avec une ligne qui dit son usage.

- Définition : un trait plein dans la couleur sur le bord gauche ; le terme défini en gras dans la couleur, suivi de deux-points et de la définition. L'étiquette porte le seul mot « Définition » : le terme en gras qui ouvre le texte nomme déjà ce que l'encadré définit.
- Exemple : un filet en pointillé de la couleur sur le bord gauche, texte légèrement atténué : l'exemple se lit comme une parenthèse du texte.
- Attention : une bande hachurée sur le bord gauche, pour les confusions qui comptent le plus.
- À retenir : le cadre à double filet, texte blanc en graisse appuyée.
- Repère : un point d'appui qui situe la notion, qu'il soit une date, un texte, un auteur ou une œuvre, présenté en petite frise ; plusieurs repères se suivent sur la même frise. L'encadré paraît là où le sujet offre de tels points d'appui.
- Vérifie : il appelle une action et garde donc un cadre, en pointillé ; une question, puis le bouton « Voir la réponse ».

FIN DU COURS

Les fiches de révision reprennent, dans une grille de cartes, l'essentiel de chaque leçon : le moteur les compose à partir des blocs « L'essentiel », si bien qu'elles suivent toujours le texte des leçons. Elles réunissent ainsi tout ce que le cours donne à apprendre par cœur, et le lecteur s'en sert pour réciter le cours de tête. Chaque fiche porte le numéro et le titre de sa leçon, sous un filet dans sa couleur.

Le glossaire rassemble tous les mots clés du cours par ordre alphabétique, chacun avec une étiquette qui renvoie à la leçon où il est expliqué, dans la couleur de cette leçon. Le moteur le compose à partir des mots clés que chaque leçon définit ; les définitions du glossaire sont celles que les boutons des mots clés affichent. Un pied de page discret clôt le cours.

AMBIANCE VISUELLE

Le cours a une ambiance sombre et dense : fond sombre, noir absolu, tags monospace, une couleur vive par leçon, du froid vers le chaud. Sa technique est celle d'un manuel : une colonne de lecture libre de tout cadre, des encadrés qui annoncent leur rôle par une étiquette en tête, des cadres réservés à ce qui se fait, et une lecture page par page. Les cadres posés côte à côte sur une même ligne portent un coin coupé de 12px en haut à droite ; un cadre seul sur sa ligne, au-dessus ou au-dessous d'un autre, a des angles droits. Le moteur applique cette règle de lui-même, d'après la place réelle de chaque cadre à l'écran. Le texte de lecture se compose en Literata, justifié aux deux bords avec coupure des mots, les grands titres en Cormorant Garamond, l'ossature de la page (barre haute, sommaire, navigation) en EB Garamond et les étiquettes, tags et boutons en JetBrains Mono : le cours a l'allure d'un manuel imprimé servi par une interface. Le moteur porte toute cette apparence, avec ses mesures, ses animations et son adaptation au téléphone.

Le lecteur règle la taille du texte par les boutons A−, A et A+, dans la bannière et en tête du sommaire ; le cours s'ouvre au cran le plus ample, qui est sa taille par défaut. Le bouton Enregistrer se tient à leur droite, et la note de la bannière dit au lecteur comment sa progression se garde : d'elle-même dans ce navigateur, et dans le fichier par ce bouton.

PROGRESSION ENREGISTRÉE

Le cours garde l'avancement du lecteur, les affirmations « Je sais… » qu'il a cochées, dans le fichier lui-même, dans un bloc réservé de son en-tête que la page hôte et le bouton Enregistrer réécrivent ; il garde aussi la page atteinte, la position de lecture et la taille du texte dans le stockage du navigateur, ou auprès de la page hôte quand il est posé dans un cadre. Le fichier que le lecteur récupère porte ainsi toutes ses coches, et l'IA les retrouve dans la balise `<progression>` quand elle reprend le cours. Chaque affirmation porte une clé stable, que l'assemblage donne à l'affirmation nouvelle et que le contenu garde ensuite : c'est sous cette clé que la coche s'inscrit.

PLUSIEURS COURS DANS UN FICHIER

Un fichier de cours peut en accueillir d'autres. Il en réunit plusieurs dès sa composition quand le sujet demandé se divise en grands ensembles, comme le décrit ARCHITECTURE DU COURS : l'IA compose alors tous les cours du fichier en une fois, le premier portant les présentations communes, les suivants se composant comme des cours ajoutés. Quand le lecteur confie un fichier existant et demande un nouveau cours « dedans », l'IA ajoute ce cours au fichier, à la suite des cours déjà présents, et livre le fichier entier. Chaque cours ajouté est un cours complet, avec sa propre page d'ouverture, ses leçons, son bilan et sa page de révision, composés selon toutes les règles de cette skill.

Ajouter un cours à un fichier existant. L'IA retire le contenu du fichier par `--extraire`, comme le décrit LE MOTEUR ET LE CONTENU. Elle garde tel quel tout ce qu'il porte, la balise `<progression>`, les cours présents, leurs lettres et les clés de leurs affirmations, puis écrit le nouveau cours à la fin, juste avant la balise fermante `</fichier>`, et assemble le contenu ainsi complété. Le nouveau cours reçoit sa lettre et ses clés à l'assemblage, les cours déjà présents gardent toute la progression du lecteur, et le moteur met à jour de lui-même les surtitres, le plan, le sommaire et la navigation.

Ce que le moteur tient pour tout le fichier. Le fichier garde une seule progression, un seul réglage de taille et un seul état de lecture. Le titre de la page et le nom du fichier prennent le sujet commun des cours réunis. Le moteur reconnaît chaque cours et bâtit pour chacun sa page d'ouverture, son plan, sa progression générale, son bilan, ses fiches, son glossaire trié et sa navigation. Chaque cours reçoit une lettre courte : le premier garde la lettre l, chaque cours ajouté prend une lettre tirée de son titre ; les leçons se numérotent de 1 dans chaque cours et chaque cours forme son propre arc de couleurs, du froid vers le chaud. La bannière de chaque ouverture porte en surtitre la place du cours dans le fichier et le nombre de ses leçons ; le plan de chaque cours mène à l'ouverture de chacun des autres ; le sommaire présente un onglet par cours, et la navigation de pages passe d'un cours au suivant sans s'arrêter.

Les cours se répondent. Chaque cours se suit par lui-même : il rappelle d'une phrase, à leur premier emploi, les termes de base qu'un autre cours du fichier définit, et il garde ses encadrés Définition pour les termes qu'il apporte. Ses prérequis et son texte peuvent renvoyer aux leçons d'un autre cours par un lien vers leur identifiant, en nommant le cours, « leçon 3 du cours sur tel sujet ». L'ouverture d'un cours ajouté porte ce qui lui est propre : sa bannière, ce qu'il couvre, l'enchaînement de ses leçons et son plan. Elle dit en une phrase comment il répond aux autres cours du fichier, et, dans la même phrase ou la suivante, que ses leçons partagent la construction et le code des encadrés présentés dans l'ouverture du premier cours, avec un lien vers elle. Ces présentations communes se tiennent ainsi une seule fois dans le fichier, dans l'ouverture du premier cours.

Un cours ajouté apporte une matière neuve. Avant d'écrire, l'IA lit les cours déjà présents dans le fichier, leurs leçons, leurs exemples, leurs exercices et leur glossaire. Le nouveau cours prend appui sur ce qu'ils enseignent et le prolonge : ce qu'ils exposent déjà s'y rappelle d'une phrase avec un lien vers la leçon qui le développe, et ses leçons, ses exemples et ses exercices portent ce que le fichier apporte de neuf. Un mot clé déjà défini dans un cours précédent reparaît dans les mots clés d'une leçon par sa seule balise, et le moteur reprend sa définition.

MISE À JOUR D'UN COURS

Quand le lecteur confie un cours existant pour le faire évoluer, l'IA en retire le contenu par `--extraire`. Elle garde la balise `<progression>` telle quelle et garde la clé de chaque affirmation conservée, même reformulée ou déplacée ; une affirmation nouvelle s'écrit avec ses seuls attributs de contenu et reçoit sa clé à l'assemblage. Elle lit la progression pour connaître l'avancement du lecteur et fait évoluer le cours en conséquence : ce qu'il a acquis garde sa place, les leçons encore peu cochées peuvent s'éclaircir et s'enrichir d'exemples, et le bilan s'appuie sur ce qu'il sait déjà. Le cours réassemblé repart avec le moteur le plus récent.

Un cours composé avant le moteur se reprend en réécrivant son contenu dans le format décrit plus bas : l'IA y porte toutes ses leçons et tout son texte, donne à chaque affirmation la clé qu'elle portait dans l'ancien fichier, et ouvre le contenu sur une balise `<progression>` qui reprend le bloc de progression de l'ancien fichier. Le cours garde ainsi toutes les coches du lecteur. Ses affirmations « Je sais… » reçoivent le nom des exercices qui les mettent à l'épreuve, et l'introduction de sa page d'ouverture laisse à la note de la bannière la présentation de la progression.

TYPOGRAPHIE FRANÇAISE

Le texte suit la typographie française : apostrophe courbe ’, guillemets français « » avec espace fine insécable intérieure, espace fine insécable avant ; ! ?, espace insécable avant les deux-points. Virgules, parenthèses et deux-points assurent les incises. À l'intérieur d'une citation, les paroles rapportées prennent les guillemets anglais “ ”. L'assemblage pose de lui-même l'apostrophe courbe et les espaces ; l'IA écrit les guillemets.

FORMAT DU CONTENU

Le contenu est un arbre de balises simples. Les titres et les textes brefs s'écrivent en attributs, le texte suivi en paragraphes `<p>`. Chaque balise se ferme par sa balise de fin ; une balise vide peut s'écrire en forme courte, `<mot terme="…"/>`. Tout ce qui est mécanique se déduit du contenu : numéros des leçons, des parties en chiffres romains et des exercices, couleurs, identifiants, plan, compteurs, sommaire, fiches, glossaire, navigation, lettres des cours et clés des affirmations.

Racine. `<fichier sujet="…">` enveloppe tout le contenu ; le sujet donne le titre de la page et le nom proposé au fichier enregistré. Elle contient un ou plusieurs `<cours>`, dans l'ordre du lecteur. Un contenu repris par `--extraire` s'ouvre sur `<progression>…</progression>`, qui se garde tel quel.

Cours. `<cours titre="…" sous-titre="…">` contient son `<introduction>`, ses `<lecon>` puis son `<bilan>`. Le sous-titre, bref, situe le cours. L'assemblage ajoute l'attribut `lettre`, qui se garde ensuite.

Introduction. `<introduction>` contient les paragraphes de l'introduction de la page d'ouverture. La bannière, sa note, le plan du cours et, dans le premier cours, le code du cours viennent du moteur.

Leçon. `<lecon titre="…" desc="…">` : la description, d'une ligne, se lit dans la carte de la leçon au plan du cours. Une leçon contient, dans cet ordre :
- `<objectifs>` puis `<prerequis>`, chacun fait de `<li>` ;
- `<commencer question="…">`, avec ses paragraphes ;
- les `<partie titre="…">`, chacune avec son texte et ses encadrés ;
- `<essentiel>`, fait de `<li>`, une phrase par puce ;
- `<mots-cles>`, fait de `<mot terme="…">définition</mot>` ; la définition se tient dans la leçon qui explique le mot, et une leçon qui reprend un mot déjà défini l'écrit par sa seule balise, `<mot terme="…"/>` ;
- `<exercices>`, fait de `<exercice nom="…" niveau="1">` ; le niveau va de 1 à 3, la question s'écrit directement dans la balise, en texte ou en paragraphes, et le corrigé dans `<corrige>`, en dernier ;
- `<autoevaluation>`, fait de `<je-sais exercices="2 4">Je sais…</je-sais>`, où `exercices` nomme les numéros des exercices de la leçon qui mettent l'affirmation à l'épreuve ; l'assemblage ajoute l'attribut `cle`, qui se garde ensuite.

Une leçon reçoit l'attribut `couleur="#rrggbb"` quand le sujet appelle une teinte vive précise ; à défaut, le moteur tire les couleurs de sa palette. La balise `<autoevaluation>` accepte un attribut `note` qui remplace sa note par défaut quand le cours en appelle une autre.

Contenu d'une partie. Des paragraphes `<p>`, des listes `<ul>` ou `<ol>`, des intertitres internes `<h4>` et ces encadrés :
- `<definition terme="…">la définition</definition>` : le moteur pose le terme en gras dans la couleur, suivi de deux-points ;
- `<exemple>`, `<attention>`, `<retenir>` : leur texte, en paragraphes ou d'un seul tenant ;
- `<reperes>`, fait de `<repere titre="…">texte</repere>` ; le titre porte la date, le texte, l'auteur ou l'œuvre ;
- `<verifie>` : la question, puis `<reponse>` ;
- `<cartes>`, fait de `<carte titre="…">description</carte>` ; l'attribut `tag` remplace le numéro de la carte par un repère bref ;
- `<table>`, dont la première ligne porte les en-têtes en `<th>` ; sur téléphone, chaque cellule reprend le nom de sa colonne ;
- `<libre>`, la zone libre décrite plus bas.

Bilan. `<bilan titre="…">` contient, au besoin, un paragraphe qui remplace la note par défaut, puis ses `<exercice nom="…" niveau="…" lecons="1 3">`, où `lecons` nomme les numéros des leçons du cours que l'exercice mobilise.

Texte. L'italique s'écrit `<i>`, le gras `<b>`. Un lien interne s'écrit `<a href="#identifiant">`, et le moteur ouvre la page qui contient sa cible. Les identifiants se forment avec la lettre du cours, l pour le premier : `l3` pour la leçon 3, `l3-2` pour sa deuxième partie, `l3-ex2` pour son deuxième exercice, `ouverture-l`, `plan-l`, `code-l`, `bilan-l`, `revision-l`, `fiches-l` et `glossaire-l` pour les autres endroits du cours. La lettre d'un cours ajouté se lit dans le contenu après le premier assemblage ; l'IA qui compose plusieurs cours en une fois leur donne elle-même leur lettre par l'attribut `lettre`, une lettre minuscule tirée du titre, pour écrire ses liens d'un cours à l'autre.

Zone libre. `<libre>` contient du HTML écrit par l'IA, accompagné de son propre `<style>`, pour une figure sur mesure que le sujet appelle, au-delà des encadrés, des tableaux et des cartes. La zone garde l'ambiance du cours : fond #0a0a0a qui transparaît, cadres en noir absolu #000 avec une hairline blanche à .2 d'alpha, angles droits pour les cadres posés l'un sous l'autre, coin coupé de 12px en haut à droite pour les cadres posés côte à côte sur une même ligne, coin coupé de 4px en haut à droite et en bas à gauche réservé aux petits éléments, traits de 1px en blanc atténué entre .12 et .4 d'alpha, couleur de la leçon par `var(--a)` et ses transparences par `rgb(var(--r)/.5)`, Literata pour le texte de lecture (`var(--fg)`), JetBrains Mono pour les libellés en majuscules espacées, tailles de texte écrites `calc(Npx * var(--z,1.25))` pour suivre le réglage de taille, et une grille de cartes dont la dernière ligne s'élargit pour se remplir.

Contrôle de la zone libre. Une fois le cours assemblé, l'IA ouvre le fichier dans un navigateur dont elle dispose, se rend à la page de chaque zone libre et prend une capture de la zone sur une largeur d'ordinateur, puis sur une largeur de téléphone. Elle regarde chaque capture et juge si la figure se lit d'un coup d'œil, si tous ses éléments tiennent dans la largeur, si ses cadres, ses traits et ses textes suivent l'ambiance du cours et si la zone s'accorde avec le reste de la page. Elle ajuste le HTML et le style de la zone, assemble de nouveau le cours et reprend une capture, jusqu'à ce que la zone soit juste sur les deux largeurs. Quand aucun navigateur n'est à sa disposition, elle l'indique au lecteur dans sa réponse.

Exemple de forme :

```html
<fichier sujet="Sujet commun">
<cours titre="Titre du cours" sous-titre="ce qui le situe">
<introduction>
<p>Ce que couvre le cours, à qui il s'adresse, comment les leçons s'enchaînent et comment chaque leçon est construite, avec un lien vers le <a href="#code-l">code du cours</a>.</p>
</introduction>
<lecon titre="Titre de la leçon" desc="Une ligne pour le plan du cours.">
<objectifs><li>Premier objectif.</li><li>Second objectif.</li></objectifs>
<prerequis><li>Ce que la leçon suppose connu.</li></prerequis>
<commencer question="La question qui ouvre la leçon ?">
<p>Pourquoi elle compte.</p>
</commencer>
<partie titre="Titre de la partie">
<p>Le texte de l'explication.</p>
<definition terme="Terme">sa définition.</definition>
<exemple><p>Le cas qui montre la notion.</p></exemple>
<verifie>Une question.<reponse>Sa réponse.</reponse></verifie>
</partie>
<essentiel><li>Ce que la leçon enseigne, en une phrase.</li><li>Un aspect nouveau.</li></essentiel>
<mots-cles><mot terme="Terme">sa définition.</mot></mots-cles>
<exercices>
<exercice nom="Restituer" niveau="1">La question.
<corrige><p>Le raisonnement et la réponse.</p></corrige>
</exercice>
</exercices>
<autoevaluation>
<je-sais exercices="1">Je sais…</je-sais>
</autoevaluation>
</lecon>
<bilan titre="Titre du bilan">
<exercice nom="Relier" niveau="2" lecons="1 2">La question.
<corrige><p>Comment les leçons se rejoignent.</p></corrige>
</exercice>
</bilan>
</cours>
</fichier>
```

ÉCRITURE À PLUSIEURS MAINS

Les leçons peuvent être confiées à des sous-agents qui rédigent en parallèle, chacun une ou plusieurs leçons dans leur propre fichier, au format du contenu. L'IA principale garde alors la charge de l'unité du cours, de la page d'ouverture au glossaire.

Une consigne commune précède la rédaction. L'IA principale la rédige dans un fichier que chaque sous-agent lit en entier avant d'écrire. Elle y pose la carte du sujet et le plan complet du cours, ou de tous les cours quand le fichier en réunit plusieurs, les termes déjà définis par les autres cours du fichier avec la leçon qui les définit, la part de chacun, les objectifs et les prérequis de chaque leçon, le public, le ton, les principes de L'ART D'EXPLIQUER, le code des encadrés, les règles de fond et de forme, le format du contenu, les identifiants des liens et la forme sous laquelle chaque leçon se livre, de sorte que les leçons s'assemblent telles quelles dans le fichier de contenu.

Les termes de base se définissent une fois, dans la leçon où le lecteur les rencontre pour la première fois ; les leçons suivantes les emploient directement et nomment cette leçon dans leurs prérequis. Quand le fichier réunit plusieurs cours composés ensemble, la consigne commune attribue d'avance chaque terme de base, chaque notion partagée et chaque grand exemple à la leçon qui le porte, dans tout le fichier : chaque sous-agent sait ainsi ce que sa leçon apporte en propre et ce qu'elle rappelle d'une phrase en renvoyant à la leçon qui le développe.

Une relecture d'une seule main suit la rédaction. Avant l'assemblage, l'IA principale lit elle-même le cours entier, leçon après leçon, dans l'ordre du lecteur ; quand le fichier réunit plusieurs cours, elle lit de même tous les cours du fichier, du premier au dernier. Elle donne à tout le texte une même voix. Elle accorde chaque leçon à celles qui la précèdent, pour que chacune s'appuie sur ce qu'elles ont posé. Elle accorde à chaque exemple et à chaque citation une place principale dans l'ensemble du fichier, celle où ils servent le mieux, et les fait reparaître ailleurs quand ce nouvel endroit en tire un éclairage propre qui justifie pleinement leur retour. Elle récrit les passages et les exercices qui redisent ce qu'une autre leçon porte déjà, que cette leçon appartienne au même cours ou à un autre cours du fichier, en les remplaçant par une matière neuve ; un terme de base défini par un autre cours garde son rappel d'une phrase, qui permet au cours de se suivre par lui-même. Elle accorde les mots clés de toutes les leçons, chaque mot gardant la définition de la leçon qui l'explique. Elle compose ensuite elle-même le bilan de chaque cours, sur le cours relu, puisqu'il croise toutes ses leçons. Le cours se lit alors comme l'œuvre d'un seul auteur, et chaque leçon garde sa pleine substance.

RELECTURE DU CONTENU

Une fois le cours assemblé, l'IA confie sa relecture à un seul agent, qui tourne sur le même modèle qu'elle. L'agent lit le contenu entier, leçon après leçon dans l'ordre du lecteur, encadrés, exercices, corrigés, autoévaluation, bilan, fiches et glossaire compris, et dresse la liste des erreurs de fond qu'il y trouve : faits, dates, noms, chiffres, définitions, citations et références inexactes, explications fausses ou imprécises, corrigés et réponses qui ne correspondent pas à leur question, et ce qui manque au sujet. Il remet cette liste à l'IA principale, qui corrige elle-même le contenu, fait passer chaque passage récrit par la skill humaniser, en mode intégré, pour qu'il garde la voix du reste du cours, puis assemble de nouveau le cours et le livre.

MÉTHODE ET LIVRAISON

L'IA écrit le contenu, en un fichier ou en plusieurs fichiers de leçons qu'elle réunit dans l'ordre. Le contenu réuni passe ensuite par la skill **humaniser** : l'IA la charge et l'applique au fichier de contenu en mode fichier, sur toute la prose qu'elle a écrite, leçons, encadrés, exercices, corrigés, autoévaluation et bilan, pour que le cours se lise comme écrit par une personne ; le texte garde tout ce qu'il dit, ses balises et ses attributs de structure. Quand des sous-agents ont rédigé les leçons, ce passage suit la relecture d'une seule main. L'IA assemble ensuite le contenu par la commande de fabrication. Le cours se livre en un seul fichier HTML autonome, polices comprises, dont le nom reprend le titre du cours, ou le sujet commun quand le fichier réunit plusieurs cours. Quand le lecteur a confié un fichier existant, l'IA livre le fichier entier, réassemblé.
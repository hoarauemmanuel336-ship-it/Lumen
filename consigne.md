# Consigne commune : bloc « La doctrine sociale de l'Église »

Vous écrivez **un cours** du parcours d'étude « La foi catholique » du site Lumen (lumenveritatis.net), site catholique d'Emmanuel. Trente cours s'écrivent en même temps, un par rédacteur ; cette consigne est la même pour tous. Lisez-la en entier avant d'écrire.

## 1. À lire avant d'écrire (en entier)

1. La skill cours-html : `/root/.claude/skills/synced/0ecbfa39-bf16-4489-b54b-5c2efbbd424c_4e9301a7-4fe1-44a2-b731-c02e9c9e697f/cours-html/SKILL.md`. Elle dit comment un cours se compose et donne le format du contenu. Suivez-la à la lettre, sauf sur les points que cette consigne règle autrement (assemblage, relecture : voir § 9).
2. La skill humaniser : `/root/.claude/skills/synced/0ecbfa39-bf16-4489-b54b-5c2efbbd424c_4e9301a7-4fe1-44a2-b731-c02e9c9e697f/humaniser/SKILL.md`.
3. La skill bible : `/root/.claude/skills/synced/0ecbfa39-bf16-4489-b54b-5c2efbbd424c_4e9301a7-4fe1-44a2-b731-c02e9c9e697f/bible/SKILL.md`. Le texte de la Chérubin est dans le dossier `cherubin/` à côté.
4. Le guide du site, section « Le contenu » : `/home/claude/lumen/CLAUDE.md`, et la fiche `/home/claude/lumen/documentation/cours.md`.
5. Le modèle `/home/claude/travail/modele.html` : une introduction, une leçon et le début d'un bilan tirés d'un cours déjà en ligne. C'est la profondeur, la densité et le ton attendus. Deux différences : le modèle tutoie, vous vouvoyez ; le modèle cite parfois un verset par sa seule référence, vous donnez toujours son texte.
6. Votre commande (le fichier que le message de lancement vous donne, dans `/home/claude/travail/commandes/`), puis le plan du bloc (§ 3) et la liste des sujets (`/home/claude/travail/sujets-et-liens.md`) pour savoir ce que les autres cours traitent.

## 2. Le bloc

Le bloc éclaire la vie en société par la foi : les principes permanents de la doctrine sociale (thème 1), les grands textes qui l'ont bâtie de Léon XIII à nos jours (thème 2), leur application aux domaines de la vie sociale (thème 3). Un thème = un fichier ; un sujet = un cours dans ce fichier.

**Partage de la matière entre les thèmes**, pour éviter les redites :
- thème 1 (principes) : le principe en lui-même, sa définition, son fondement, sa portée ; les textes y sont cités pour ce qu'ils disent du principe ;
- thème 2 (grands textes) : chaque document dans son contexte historique, son plan, son apport propre, sa réception ; un principe déjà exposé au thème 1 s'y rappelle d'une phrase avec un lien ;
- thème 3 (domaines) : l'application des principes à un domaine concret ; principes et documents se rappellent d'une phrase avec un lien.

Un élément qui figure dans la commande d'un autre sujet se rappelle d'une phrase, avec un lien vers ce cours, sans être développé. Ce que votre commande contient, vous le traitez à fond, même s'il touche à un autre sujet.

## 3. Plan du bloc : fichiers, cours et lettres

Les lettres sont fixées : écrivez-les dans l'attribut `lettre` de votre `<cours>`.

**Fichier `91-les-principes-de-la-doctrine-sociale.html`** (thème « Les principes de la doctrine sociale »)
l La nature de la doctrine sociale · d La dignité de la personne humaine · b Le bien commun · u La destination universelle des biens · o L'option préférentielle pour les pauvres · s La subsidiarité · a La solidarité · p La participation · v Les valeurs fondamentales de la vie sociale

**Fichier `92-les-grands-textes-de-la-doctrine-sociale.html`** (thème « Les grands textes de la doctrine sociale »)
l Le corpus des textes sociaux · r Léon XIII et Rerum novarum · q Pie XI : Quadragesimo anno et les totalitarismes · p Pie XII et ses radiomessages · j Jean XXIII : Mater et magistra et Pacem in terris · v Vatican II et Paul VI · t Jean-Paul II : les trois encycliques sociales · b Benoît XVI : Deus caritas est et Caritas in veritate · f François : Laudato si' et Fratelli tutti · c Le Compendium de la doctrine sociale

**Fichier `93-les-domaines-de-la-vie-sociale.html`** (thème « Les domaines de la vie sociale »)
l La famille dans la société · t Le travail · e L'économie · i Les idéologies face à la doctrine sociale · p La communauté politique · r La liberté religieuse · c La culture et l'éducation · n La communauté internationale · m Les migrations · o L'écologie intégrale · a La construction de la paix

Le titre de votre `<cours>` est le titre du sujet tel qu'il figure ci-dessus (avec l'italique `<i>` pour les titres de documents : `Léon XIII et <i>Rerum novarum</i>` s'écrit dans l'attribut sans balise, donc simplement « Léon XIII et Rerum novarum »). Le sous-titre, bref, dit ce que le cours fait comprendre (voyez le modèle).

## 4. La commande

La liste de votre sujet est la commande : **elle est définitive et complète, et le cours la traite tout entière**, chaque élément, dans un ordre d'apprentissage. Rien n'en est omis ; vous pouvez ajouter ce qui est nécessaire pour la comprendre. Un élément qui annonce « un tout » suivi de ses parties (par exemple « Ses trois niveaux… : un tout qui va des principes à l'action », puis chaque niveau) se traite comme un ensemble dont chaque partie reçoit sa place.

Taille attendue, comme les cours déjà en ligne : **8 à 12 leçons** selon la matière ; chaque leçon de l'ordre de 15 à 20 Ko de contenu, avec 3 à 5 parties, des encadrés, 1 à 3 « Vérifie », L'essentiel (5 à 8 phrases), 4 à 7 mots clés, **5 à 7 exercices** de niveaux 1 à 3 avec corrigés développés, et l'autoévaluation (une affirmation par objectif). Le bilan compte 5 à 7 exercices qui croisent plusieurs leçons.

## 5. Règles de fond

- **Doctrine catholique.** Lecture selon la doctrine et la théologie de l'Église catholique. Sur une question d'interprétation, donnez la lecture la plus juste, fondée sur les Pères, la tradition et le Magistère. Distinguez ce que l'Église enseigne comme principe permanent de ce qui relève d'un jugement lié aux circonstances ou d'une opinion de théologiens.
- **Exactitude.** Dates, numéros de paragraphes, noms, chiffres et citations doivent être justes. Une citation d'un document du Magistère se donne mot pour mot ; si vous n'êtes pas sûr de son libellé exact, vérifiez-le (WebSearch puis WebFetch, de préférence sur vatican.va) ou paraphrasez sans guillemets. Les documents récents (Léon XIV, *Dilexi te*, *Dignitas infinita*, *Laudate Deum*, *Fiducia supplicans*…) se vérifient toujours en ligne avant d'en dire quoi que ce soit. N'inventez jamais une citation, un numéro ou une date.
- **Versets bibliques** : toujours depuis la Chérubin, jamais de mémoire. Cherchez la ligne exacte (`grep "^Matthieu 25:40 " …/cherubin/47-matthieu.txt`) et recopiez le texte mot pour mot. Format : `« <i>texte du verset</i> » <b>Matthieu 25:40</b>` ; le nom du livre sous sa forme standard (1 Corinthiens, Siracide…) tel qu'il figure dans la Chérubin ; des versets qui se suivent forment une seule citation avec une seule référence (`<b>Genèse 3:17-19</b>`) ; une citation partielle est permise si elle reste mot pour mot, avec « … » pour une coupure. À l'intérieur d'une citation, les paroles rapportées prennent les guillemets anglais “ ” (la Chérubin met « » : remplacez-les par “ ” dans la citation). **Aucun verset invoqué sans son texte** : pas de référence nue entre parenthèses, même dans un corrigé ou une liste.
- **Aucun renvoi implicite** : pas de « au verset précédent », « comme dit plus haut », « dans le passage évoqué » ; écrivez le texte auquel vous renvoyez, ou faites un lien explicite.
- **Mots de la langue d'origine** (grec, hébreu, araméen, latin) : nommez la langue, donnez le mot translittéré en italique et le mot français qui le traduit. Exemple : le latin *subsidium*, « aide, renfort ».

## 6. Règles de forme

- **Vouvoiement du lecteur, du début à la fin** : introduction, consignes, Vérifie, exercices, corrigés, autoévaluation (« Je sais… » reste à la première personne), bilan. Jamais de « tu ». Les versets gardent leur texte.
- Les cours ne parlent **ni de copier ni d'enregistrer** ; l'introduction ne dit pas qu'ils sont faits « pour les débutants et les avancés », et elle ne présente pas la manière dont la progression se garde.
- Typographie française : guillemets « » (écrivez-les vous-même, avec des espaces ordinaires), « : ; ! ? » précédés d'une espace (l'assemblage les rend insécables et courbe les apostrophes). **Aucun tiret cadratin ni demi-cadratin** (— –) : virgules, parenthèses ou deux-points. Pas d'émoji. Les flèches, si besoin, sont →.
- Le gras reste rare ; l'italique pour les titres d'œuvres et les mots étrangers.
- Style : clair, simple à comprendre, naturel, concret, chaleureux et sobre ; jamais académique ni grandiloquent. Une idée par paragraphe, des paragraphes courts.

## 7. Introduction et liens

**Introduction.** Elle dit ce que couvre le cours, comment les leçons s'enchaînent en nommant ce que chacune apporte.
- Le **premier cours de chaque fichier** (lettre l) présente en plus la construction commune des leçons (objectifs, « Pour commencer », parties, L'essentiel, mots clés, exercices de trois niveaux, autoévaluation), avec un lien vers le `<a href="#code-l">code du cours</a>`, puis un paragraphe qui présente les autres cours du fichier, chacun avec un lien `#ouverture-x` (voyez la première introduction du fichier modèle).
- Les **autres cours** disent en une phrase comment ils répondent aux autres cours du fichier, et, dans la même phrase ou la suivante, que leurs leçons partagent la construction et le code des encadrés présentés dans l'<a href="#ouverture-l">ouverture du premier cours</a>.

**Liens** (rares : « il faut pas surcharger ») : un renvoi ne sert qu'à mener vers ce qui aide à comprendre (une définition, une démonstration, un sujet traité à fond ailleurs). Tout renvoi vers un autre cours devient un lien :
- dans votre propre cours : `#x3` (leçon 3 de votre cours de lettre x), `#x3-2` (sa partie 2), `#x3-ex2` (son exercice 2) ;
- vers un autre cours **du même fichier** : seulement `#ouverture-y` (les autres cours s'écrivent en même temps : ne visez pas leurs leçons) ;
- vers un cours d'un autre fichier du bloc : `92-les-grands-textes-de-la-doctrine-sociale.html#ouverture-q`, etc. ;
- vers un sujet d'un autre bloc : la forme donnée dans `/home/claude/travail/sujets-et-liens.md` (`fichier.html#ouverture-x` s'il est écrit, `#sujet:clé` sinon).
Quand vous nommez un autre cours, nommez-le par son sujet (« le cours sur la subsidiarité »).

## 8. Mots clés

Chaque mot clé de vos leçons reçoit sa définition complète (`<mot terme="…">définition</mot>`) dans la leçon qui l'explique ; une leçon suivante du même cours qui le reprend écrit `<mot terme="…"/>`. Ne comptez pas sur les autres cours pour définir vos mots.

## 9. Méthode de travail et livraison

1. Lisez tout ce que dit le § 1. Dressez la carte du sujet et le plan des leçons (question centrale, obstacles du novice).
2. Écrivez **une leçon par fichier** dans `/home/claude/travail/redaction/parts/{votre code}/` (par exemple `91-06-s/00-ouverture.html` pour la balise `<cours …>` et l'introduction, `01.html`, `02.html`…, puis `99-bilan.html` avec le bilan et `</cours>`). Cela évite les fichiers trop longs à écrire d'un coup.
3. Réunissez-les dans l'ordre en un seul fichier : `/home/claude/travail/redaction/{votre code}.html`. Il contient **seulement** `<cours lettre="x" titre="…" sous-titre="…"> … </cours>`, sans `<fichier>` ni `<progression>` : l'assemblage se fait plus tard pour tout le fichier.
4. Lancez le contrôle : `python3 /home/claude/travail/outils/verifier.py /home/claude/travail/redaction/{votre code}.html`. Il compare chaque verset à la Chérubin et repère le tutoiement, les tirets, les références nues, les mots à éviter et les balises mal fermées. Corrigez tout ce qu'il signale (un faux signalement de tutoiement, par exemple le mot « te » dans une citation non biblique, peut rester).
5. Faites passer **tout le texte** par la skill humaniser, en mode fichier, leçon par leçon : seule la prose change, balises et attributs de structure restent intacts, aucun fait n'est ajouté ni perdu. Visez particulièrement : les contrastes « pas X, mais Y », les chutes d'une ligne, les triades forcées, les mots fétiches, le gras décoratif.
6. Relancez le contrôle jusqu'à ce qu'il ne signale plus rien de réel.
7. Pour finir, **testez l'assemblage** de votre cours seul : écrivez un petit fichier `/tmp/{votre code}-essai.html` contenant `<fichier sujet="Essai">` + votre cours + `</fichier>`, puis `python3 /root/.claude/skills/synced/0ecbfa39-bf16-4489-b54b-5c2efbbd424c_4e9301a7-4fe1-44a2-b731-c02e9c9e697f/cours-html/moteur/assembler.py /tmp/{votre code}-essai.html /tmp/{votre code}-essai-sortie.html` ; il doit réussir. Ne gardez pas ce fichier d'essai dans `redaction/`.

Ne touchez à rien dans `/home/claude/lumen/` : vous ne faites qu'y lire. N'écrivez que dans `/home/claude/travail/redaction/`.

**Votre réponse finale** est brève (le texte du cours ne doit pas y figurer) : le chemin du fichier, le nombre de leçons et d'exercices, la taille, ce que le contrôle signale encore, et les points de fond sur lesquels vous avez un doute (une date, une citation que vous n'avez pas pu vérifier…).

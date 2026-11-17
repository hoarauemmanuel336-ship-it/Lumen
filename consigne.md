# Consigne commune : bloc « La liturgie et les sacrements »

Vous écrivez **un cours** du parcours d'étude « La foi catholique » du site Lumen (lumenveritatis.net), site catholique d'Emmanuel. Cent un cours s'écrivent, par vagues, un par rédacteur ; cette consigne est la même pour tous. Lisez-la en entier avant d'écrire.

## 1. À lire avant d'écrire (en entier)

1. La skill cours-html : `/root/.claude/skills/synced/0ecbfa39-bf16-4489-b54b-5c2efbbd424c_4e9301a7-4fe1-44a2-b731-c02e9c9e697f/cours-html/SKILL.md`. Elle dit comment un cours se compose et donne le format du contenu. Suivez-la à la lettre, sauf sur les points que cette consigne règle autrement (assemblage, relecture : voir § 9).
2. La skill humaniser : `/root/.claude/skills/synced/0ecbfa39-bf16-4489-b54b-5c2efbbd424c_4e9301a7-4fe1-44a2-b731-c02e9c9e697f/humaniser/SKILL.md`.
3. La skill bible : `/root/.claude/skills/synced/0ecbfa39-bf16-4489-b54b-5c2efbbd424c_4e9301a7-4fe1-44a2-b731-c02e9c9e697f/bible/SKILL.md`. Le texte de la Chérubin est dans le dossier `cherubin/` à côté.
4. Le guide du site, section « Le contenu » : `/home/claude/lumen/CLAUDE.md`, et la fiche `/home/claude/lumen/documentation/cours.md`.
5. Le modèle `/home/claude/liturgie/modele.html` : une introduction, une leçon et le début d'un bilan tirés d'un cours déjà en ligne. C'est la profondeur, la densité et le ton attendus. Deux différences : le modèle tutoie, vous vouvoyez ; le modèle cite parfois un verset par sa seule référence, vous donnez toujours son texte.
6. Votre commande (le fichier que le message de lancement vous donne, dans `/home/claude/liturgie/commandes/`), puis le plan du bloc (§ 3) et la liste des sujets (`/home/claude/liturgie/sujets-et-liens.md`) pour savoir ce que les autres cours traitent.

## 2. Le bloc

Le bloc « La liturgie et les sacrements » montre comment l'Église célèbre ce qu'elle croit. Il va de la nature de la liturgie (thème « Qu'est-ce que la liturgie ») à la messe, au temps liturgique, aux rites, aux sacramentaux et à la piété, puis aux sacrements : leur doctrine générale, et chacun des sept. Un thème = un fichier ; un sujet = un cours dans ce fichier.

**Partage de la matière entre les thèmes**, pour éviter les redites :
- « Qu'est-ce que la liturgie » : la liturgie en général (sa nature, ses signes, ses lieux, ses objets, sa réforme) ; un sacrement particulier ne s'y développe pas ;
- « La messe » : la célébration elle-même, son histoire et son déroulement, partie par partie ; la doctrine du sacrifice, de la présence réelle et de la transsubstantiation appartient au thème « L'eucharistie » et s'y rappelle d'une phrase avec un lien ;
- « Le temps liturgique » : l'année et la journée liturgiques ; « Les rites, les sacramentaux et la piété » : la diversité des rites, les sacramentaux, les funérailles, la piété populaire ;
- « Les sacrements en général » : la doctrine commune à tous les sacrements (définition, signe, septénaire, matière et forme, ministre et intention, *ex opere operato*, caractère, nécessité) ; les thèmes de chaque sacrement l'appliquent sans la refaire et la rappellent d'une phrase avec un lien ;
- les thèmes de chaque sacrement (baptême, confirmation, eucharistie, pénitence, onction des malades, ordre, mariage) : ce qui est propre à ce sacrement.

Un élément qui figure dans la commande d'un autre sujet se rappelle d'une phrase, avec un lien vers ce cours, sans être développé. Ce que votre commande contient, vous le traitez à fond, même s'il touche à un autre sujet. Beaucoup de ces sujets touchent aussi des cours déjà écrits (Jésus-Christ, l'Esprit Saint et la grâce, les fins dernières, l'Écriture) : voyez la liste des sujets pour les lier quand cela aide vraiment.

## 3. Plan du bloc : fichiers, cours et lettres

Les lettres sont fixées : écrivez-les dans l'attribut `lettre` de votre `<cours>`.

**Fichier `63-qu-est-ce-que-la-liturgie.html`** (thème « Qu’est-ce que la liturgie »)
l Le mot et la notion de liturgie · u La liturgie, œuvre du Christ et de l’Église · m Le mystère pascal dans la liturgie · t La liturgie terrestre et la liturgie céleste · s Les signes et les symboles liturgiques · p Les postures et les gestes liturgiques · c Le chant et la musique sacrée · i Les lieux de la célébration · a L’architecture des églises et l’art sacré · o Les objets liturgiques · v Les vêtements liturgiques et les insignes · e Lex orandi, lex credendi · r Sacrosanctum concilium et la réforme liturgique · g Les livres liturgiques

**Fichier `64-la-messe.html`** (thème « La messe »)
l L’histoire de la messe · r Les rites d’ouverture · p La liturgie de la Parole · d La préparation des dons · e La prière eucharistique · m Les prières eucharistiques du Missel romain · c Les rites de communion · i Les rites de conclusion · a Les acteurs de la célébration · v Le Missel de Paul VI et l’usage du missel de 1962

**Fichier `65-le-temps-liturgique.html`** (thème « Le temps liturgique »)
l Le dimanche · a L’Avent · t Le temps de Noël · c Le Carême · s La Semaine sainte · p Le Triduum pascal · v La Vigile pascale · e Le temps pascal · o Le temps ordinaire · d Les degrés des célébrations et le sanctoral · u Les couleurs liturgiques · h La Liturgie des Heures · m Les éléments d’un office

**Fichier `66-les-rites-les-sacramentaux-et-la-piete.html`** (thème « Les rites, les sacramentaux et la piété »)
l Unité de la foi et diversité des rites · r Les rites latins · e Les Églises orientales catholiques · s Les sacramentaux · f Les funérailles chrétiennes · p La piété populaire

**Fichier `67-les-sacrements-en-general.html`** (thème « Les sacrements en général »)
l Le mot et la définition du sacrement · s Le signe efficace de la grâce · e Le septénaire sacramentel · m Matière et forme · i Le ministre et l’intention · o L’efficacité ex opere operato et les dispositions · c Le caractère sacramentel · n La nécessité des sacrements

**Fichier `68-le-bapteme.html`** (thème « Le baptême »)
l Préfigurations et institution du baptême · m Matière, forme et ministre du baptême · c La célébration du baptême · e Les effets du baptême · v La validité du baptême et la question du rebaptême · n La nécessité du baptême, baptême de désir et de sang · b Le baptême des enfants · s Le sort des enfants morts sans baptême

**Fichier `69-la-confirmation.html`** (thème « La confirmation »)
l L’institution de la confirmation · r Le rite de la confirmation et le saint chrême · e Les effets de la confirmation · m Le ministre et le sujet de la confirmation · i L’initiation chrétienne en Orient et en Occident

**Fichier `70-l-eucharistie.html`** (thème « L’eucharistie »)
l Les noms de l’eucharistie · f Les figures de l’eucharistie · d Le discours du pain de vie et l’institution · s Le sacrifice de la messe · p La présence réelle · t La transsubstantiation · c La communion eucharistique · e Le culte de l’eucharistie hors de la messe · u L’eucharistie fait l’Église · r Les erreurs sur l’eucharistie

**Fichier `71-la-penitence.html`** (thème « La pénitence »)
l Le pouvoir de remettre les péchés · h L’histoire de la pénitence · c La contrition · p La confession des péchés · s La satisfaction · a L’absolution et le ministre · e Les effets de la pénitence · i Les indulgences

**Fichier `72-l-onction-des-malades.html`** (thème « L’onction des malades »)
l Le fondement et l’histoire de l’onction des malades · s Le sujet, le ministre et le rite de l’onction · e Les effets de l’onction des malades · v Le viatique et les derniers sacrements

**Fichier `73-l-ordre.html`** (thème « L’ordre »)
l Le sacerdoce dans l’Ancien Testament et le sacerdoce du Christ · e L’épiscopat, plénitude du sacrement de l’ordre · p Le presbytérat · d Le diaconat · r Le rite et les effets de l’ordination · s Le sujet de l’ordination · c Le célibat sacerdotal · o La réservation de l’ordination aux hommes

**Fichier `74-le-mariage.html`** (thème « Le mariage »)
l Le mariage dans le dessein du Créateur · m Le mariage, sacrement · c Le consentement matrimonial · u L’unité du mariage · i L’indissolubilité du mariage · f Les fins du mariage · e La famille, Église domestique

Le titre de votre `<cours>` est le titre du sujet tel qu'il figure ci-dessus (sans balise dans l'attribut ; un titre latin comme « Lex orandi, lex credendi » s'écrit tel quel). Le sous-titre, bref, dit ce que le cours fait comprendre (voyez le modèle).

## 4. La commande

La liste de votre sujet est la commande : **elle est définitive et complète, et le cours la traite tout entière**, chaque élément, dans un ordre d'apprentissage. Rien n'en est omis ; vous pouvez ajouter ce qui est nécessaire pour la comprendre. Un élément qui annonce « un tout » suivi de ses parties (par exemple « Ses trois niveaux… : un tout qui va des principes à l'action », puis chaque niveau) se traite comme un ensemble dont chaque partie reçoit sa place.

Taille attendue, comme les cours déjà en ligne : **8 à 12 leçons** selon la matière ; chaque leçon de l'ordre de 15 à 20 Ko de contenu, avec 3 à 5 parties, des encadrés, 1 à 3 « Vérifie », L'essentiel (5 à 8 phrases), 4 à 7 mots clés, **5 à 7 exercices** de niveaux 1 à 3 avec corrigés développés, et l'autoévaluation (une affirmation par objectif). Le bilan compte 5 à 7 exercices qui croisent plusieurs leçons.

## 5. Règles de fond

- **Doctrine catholique.** Lecture selon la doctrine et la théologie de l'Église catholique. Sur une question d'interprétation, donnez la lecture la plus juste, fondée sur les Pères, la tradition et le Magistère. Distinguez ce que l'Église enseigne comme principe permanent de ce qui relève d'un jugement lié aux circonstances ou d'une opinion de théologiens.
- **Exactitude.** Dates, numéros de paragraphes, noms, chiffres et citations doivent être justes. Une citation d'un document du Magistère se donne mot pour mot ; si vous n'êtes pas sûr de son libellé exact, vérifiez-le (WebSearch puis WebFetch, de préférence sur vatican.va) ou paraphrasez sans guillemets. Les documents récents (par exemple tout texte de Léon XIV, de François ou les décisions récentes sur la liturgie, comme *Traditionis custodes* et ses suites) se vérifient toujours en ligne avant d'en dire quoi que ce soit. N'inventez jamais une citation, un numéro ou une date.
- **Versets bibliques** : toujours depuis la Chérubin, jamais de mémoire. Cherchez la ligne exacte (`grep "^Matthieu 25:40 " …/cherubin/47-matthieu.txt`) et recopiez le texte mot pour mot. Format : `« <i>texte du verset</i> » <b>Matthieu 25:40</b>` ; le nom du livre sous sa forme standard (1 Corinthiens, Siracide…) tel qu'il figure dans la Chérubin ; des versets qui se suivent forment une seule citation avec une seule référence (`<b>Genèse 3:17-19</b>`) ; une citation partielle est permise si elle reste mot pour mot, avec « … » pour une coupure. À l'intérieur d'une citation, les paroles rapportées prennent les guillemets anglais “ ” (la Chérubin met « » : remplacez-les par “ ” dans la citation). **Aucun verset invoqué sans son texte** : pas de référence nue entre parenthèses, même dans un corrigé ou une liste.
- **Pas d'annonce ni de rappel de place** : un cours n'annonce pas « comme le montrera la leçon 3 », « nous y reviendrons », « on le verra plus loin », et ne signale pas qu'un texte « a déjà été cité » ou « est présenté ailleurs ». Un passage dit ce qu'il a à dire ; s'il a besoin d'une notion exposée ailleurs, il fait un lien simple vers elle.
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
- vers un cours d'un autre fichier du bloc : `70-l-eucharistie.html#ouverture-p`, etc. ;
- vers un sujet d'un autre bloc : la forme donnée dans `/home/claude/liturgie/sujets-et-liens.md` (`fichier.html#ouverture-x` s'il est écrit, `#sujet:clé` sinon).
Quand vous nommez un autre cours, nommez-le par son sujet (« le cours sur la transsubstantiation »).

## 8. Mots clés

Chaque mot clé de vos leçons reçoit sa définition complète (`<mot terme="…">définition</mot>`) dans la leçon qui l'explique ; une leçon suivante du même cours qui le reprend écrit `<mot terme="…"/>`. Ne comptez pas sur les autres cours pour définir vos mots.

## 9. Méthode de travail et livraison

1. Lisez tout ce que dit le § 1. Dressez la carte du sujet et le plan des leçons (question centrale, obstacles du novice).
2. **Reprise.** Si votre dossier `parts/{votre code}/` contient déjà des fichiers (un rédacteur précédent a été interrompu), lisez-les d'abord : gardez les leçons complètes, refaites seulement la dernière si elle est inachevée, et continuez à partir de là. Écrivez aussi, dès que votre plan est fait, le fichier `parts/{votre code}/plan.md` (titres et contenu prévu de chaque leçon), et tenez-le à jour, pour qu'un autre rédacteur puisse reprendre le travail à l'identique.
3. Écrivez **une leçon par fichier**, et enregistrez chaque leçon dès qu'elle est finie (le travail est sauvegardé régulièrement : ce qui n'est pas encore écrit sur le disque serait perdu en cas d'interruption) dans `/home/claude/liturgie/redaction/parts/{votre code}/` (par exemple `68-03-c/00-ouverture.html` pour la balise `<cours …>` et l'introduction, `01.html`, `02.html`…, puis `99-bilan.html` avec le bilan et `</cours>`). Cela évite les fichiers trop longs à écrire d'un coup.
4. Réunissez-les dans l'ordre en un seul fichier : `/home/claude/liturgie/redaction/{votre code}.html`. Il contient **seulement** `<cours lettre="x" titre="…" sous-titre="…"> … </cours>`, sans `<fichier>` ni `<progression>` : l'assemblage se fait plus tard pour tout le fichier.
5. Lancez le contrôle : `python3 /home/claude/liturgie/outils/verifier.py /home/claude/liturgie/redaction/{votre code}.html`. Il compare chaque verset à la Chérubin et repère le tutoiement, les tirets, les références nues, les mots à éviter et les balises mal fermées. Corrigez tout ce qu'il signale (un faux signalement de tutoiement, par exemple le mot « te » dans une citation non biblique, peut rester).
6. Faites passer **tout le texte** par la skill humaniser, en mode fichier, leçon par leçon : seule la prose change, balises et attributs de structure restent intacts, aucun fait n'est ajouté ni perdu. Visez particulièrement : les contrastes « pas X, mais Y », les chutes d'une ligne, les triades forcées, les mots fétiches, le gras décoratif.
7. Relancez le contrôle jusqu'à ce qu'il ne signale plus rien de réel.
8. Pour finir, **testez l'assemblage** de votre cours seul : écrivez un petit fichier `/tmp/{votre code}-essai.html` contenant `<fichier sujet="Essai">` + votre cours + `</fichier>`, puis `python3 /root/.claude/skills/synced/0ecbfa39-bf16-4489-b54b-5c2efbbd424c_4e9301a7-4fe1-44a2-b731-c02e9c9e697f/cours-html/moteur/assembler.py /tmp/{votre code}-essai.html /tmp/{votre code}-essai-sortie.html` ; il doit réussir. Ne gardez pas ce fichier d'essai dans `redaction/`.

Ne touchez à rien dans `/home/claude/lumen/` : vous ne faites qu'y lire. N'écrivez que dans `/home/claude/liturgie/redaction/`.

**Vos points de doute** (une date, une citation que vous n'avez pas pu vérifier, une affirmation de mémoire) s'écrivent, avant de finir, dans le fichier `/home/claude/liturgie/doutes.md`, à la suite de ce qui s'y trouve, sous un titre `## {votre code}`, une ligne par point. Le relecteur les vérifiera.

**Votre rapport complet** (ce que vous avez fait, vos choix, ce qui reste incertain) s'écrit dans `/home/claude/liturgie/rapports/{votre code}-ecriture.md` : il est sauvegardé avec le travail.

**Votre réponse finale tient en cinq lignes au plus**, sans le texte du cours : le chemin du fichier, le nombre de leçons et d'exercices, ce que le contrôle signale encore.

## 10. Vérifier en ligne

La recherche web (WebSearch) est partagée par tous les rédacteurs et s'épuise vite. Quand elle ne répond plus, vérifiez en ouvrant directement les pages officielles avec WebFetch (vatican.va pour le Magistère, le Catéchisme et les textes conciliaires ; la Chérubin locale pour la Bible). Ce que vous ne pouvez pas vérifier se paraphrase sans guillemets ou se retire.

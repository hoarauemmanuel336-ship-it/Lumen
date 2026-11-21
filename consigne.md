# Consigne commune : bloc « Les Pères de l’Église »

Vous écrivez **un cours** du parcours d'étude « La foi catholique » du site Lumen (lumenveritatis.net), site catholique d'Emmanuel. Soixante cours s'écrivent, par vagues, un par rédacteur ; cette consigne est la même pour tous. Lisez-la en entier avant d'écrire.

## 1. À lire avant d'écrire (en entier)

1. La skill cours-html : `/root/.claude/skills/synced/0ecbfa39-bf16-4489-b54b-5c2efbbd424c_4e9301a7-4fe1-44a2-b731-c02e9c9e697f/cours-html/SKILL.md`. Elle dit comment un cours se compose et donne le format du contenu. Suivez-la à la lettre, sauf sur les points que cette consigne règle autrement (assemblage, relecture : voir § 9).
2. La skill humaniser : `/root/.claude/skills/synced/0ecbfa39-bf16-4489-b54b-5c2efbbd424c_4e9301a7-4fe1-44a2-b731-c02e9c9e697f/humaniser/SKILL.md`.
3. La skill bible : `/root/.claude/skills/synced/0ecbfa39-bf16-4489-b54b-5c2efbbd424c_4e9301a7-4fe1-44a2-b731-c02e9c9e697f/bible/SKILL.md`. Le texte de la Chérubin est dans le dossier `cherubin/` à côté.
4. Le guide du site, section « Le contenu » : `/home/claude/lumen/CLAUDE.md`, et la fiche `/home/claude/lumen/documentation/cours.md`.
5. Le modèle `/home/claude/peres/modele.html` : une introduction, une leçon et le début d'un bilan tirés d'un cours déjà en ligne. C'est la profondeur, la densité et le ton attendus. Deux différences : le modèle tutoie, vous vouvoyez ; le modèle cite parfois un verset par sa seule référence, vous donnez toujours son texte.
6. Votre commande (le fichier que le message de lancement vous donne, dans `/home/claude/peres/commandes/`), puis le plan du bloc (§ 3) et la liste des sujets (`/home/claude/peres/sujets-et-liens.md`) pour savoir ce que les autres cours traitent.

## 2. Le bloc

Le bloc « Les Pères de l’Église » présente les témoins de la foi des premiers siècles : ce qu'est la patristique et l'autorité des Pères, les premiers témoins (des Pères apostoliques à Hippolyte), les Pères d'Orient, les Pères d'Occident, et saint Augustin, qui a un thème à lui seul. Un thème = un fichier ; un sujet = un cours dans ce fichier.

**Ce qu'est un cours sur un Père ici.** Il fait connaître une personne et une pensée : la vie dans son contexte (lieu, époque, Église locale, controverses), les œuvres principales (titre, date ou époque, genre, contenu), les grands thèmes de l'enseignement, ce que ce Père a apporté à la foi de l'Église, et la manière dont l'Église l'a reçu (sainteté, titre de docteur, place dans la liturgie, usage par les conciles et le Magistère). Il fait entendre le Père lui-même par de courts extraits de ses œuvres, que le cours explique.

**Citer un Père.** Chaque extrait cité se vérifie sur le texte, avec sa référence précise (œuvre, livre, chapitre ou paragraphe ; par exemple *Contre les hérésies* III, 3, 2). Traduisez vous-même en français à partir du texte original (latin, grec) ou d'une traduction ancienne libre de droits (les traductions anglaises de newadvent.org, des traductions françaises du XIXe siècle) ; ne recopiez jamais une traduction française moderne (Sources chrétiennes, Bibliothèque augustinienne…). Gardez les extraits courts (une à quatre phrases), entre guillemets « », le titre de l'œuvre en italique, et faites-les suivre de leur explication. Une phrase célèbre dont vous ne retrouvez pas la source exacte, ou qui est attribuée à tort (cela arrive souvent : vérifiez), se signale comme telle ou se retire. Les dates de vie et de rédaction se donnent avec la prudence qu'elles demandent (« vers 107 », « entre 180 et 185 ») quand les spécialistes en discutent.

**Juger avec justesse.** Distinguez ce qu'un Père transmet de la foi commune, ce qui est son opinion propre (qui n'engage pas l'Église, même chez un saint docteur), et ce qui est une erreur qu'il a portée ou que l'Église a écartée ensuite (le millénarisme de certains, le montanisme de Tertullien, certaines thèses attribuées à Origène condamnées en 543 et 553, les formules d'avant Nicée sur le Fils, Augustin sur certains points de la grâce que l'Église n'a pas tous faits siens). Dites le jugement de l'Église quand elle en a porté un. Présentez les débats des historiens (authenticité d'un écrit, datation, attribution) honnêtement, avec les positions sérieuses.

**Partage de la matière avec les autres blocs**, pour éviter les redites :
- les événements (conciles, persécutions, schismes, Constantin, monachisme…) sont racontés dans le bloc « L’histoire de l’Église », déjà écrit : ici, ils se rappellent d'une phrase avec un lien, et le cours se concentre sur le Père, ses œuvres et sa pensée ;
- la doctrine elle-même (Trinité, christologie, grâce, sacrements, Écriture, Tradition) est exposée dans les blocs doctrinaux ; le cours montre ce que le Père en a dit et apporté, et renvoie d'un lien au cours de doctrine quand il aide (blocs écrits : « La Révélation et sa transmission », « L’Écriture sainte », « Jésus-Christ », « L’Esprit Saint et la grâce », « La liturgie et les sacrements », « Les fins dernières », « La doctrine sociale de l’Église », « L’histoire de l’Église » ; les autres se lient par `#sujet:clé`) ;
- dans ce bloc, chaque Père a son cours (et Augustin un thème entier) : un autre cours qui le croise le rappelle d'une phrase avec un lien, sans le refaire.

Un élément qui figure dans la commande d'un autre sujet se rappelle d'une phrase, avec un lien vers ce cours, sans être développé. Ce que votre commande contient, vous le traitez à fond, même s'il touche à un autre sujet. Voyez la liste des sujets pour lier les cours déjà écrits quand cela aide vraiment.

## 3. Plan du bloc : fichiers, cours et lettres

Les lettres sont fixées : écrivez-les dans l'attribut `lettre` de votre `<cours>`.

**Fichier `22-la-patristique.html`** (thème « La patristique »)
l Qu’est-ce qu’un Père de l’Église · p Pères, docteurs et écrivains ecclésiastiques · a L’autorité du consensus des Pères · e L’école d’Alexandrie · c L’école d’Antioche · f Les autres foyers de la patristique · g Les genres de la littérature patristique · r Les grandes collections et éditions des Pères

**Fichier `23-les-premiers-temoins.html`** (thème « Les premiers témoins »)
l La Didachè · c Clément de Rome · i Ignace d’Antioche · p Polycarpe de Smyrne · h Papias de Hiérapolis · a Le Pasteur d’Hermas · e L’Épître de Barnabé · d La Lettre à Diognète · g Les apologistes grecs du IIe siècle · j Justin martyr · n Le gnosticisme · r Irénée de Lyon · t Tertullien · y Cyprien de Carthage · o Les apologistes latins avant Nicée · m Clément d’Alexandrie · v Origène : vie et œuvres · s Origène : doctrine et controverses · b Hippolyte de Rome

**Fichier `24-les-peres-d-orient.html`** (thème « Les Pères d’Orient »)
l Athanase d’Alexandrie · e Eusèbe de Césarée · b Basile de Césarée · g Grégoire de Nazianze · n Grégoire de Nysse · c Cyrille de Jérusalem · s Éphrem le Syrien · j Jean Chrysostome · a Cyrille d’Alexandrie · p Le Pseudo-Denys l’Aréopagite · m Maxime le Confesseur · d Jean Damascène

**Fichier `25-les-peres-d-occident.html`** (thème « Les Pères d’Occident »)
l Hilaire de Poitiers · a Ambroise de Milan · j Jérôme · g Léon le Grand · p Pierre Chrysologue · b Boèce · c Cassiodore · r Grégoire le Grand · i Isidore de Séville · v Bède le Vénérable

**Fichier `26-saint-augustin.html`** (thème « Saint Augustin »)
l La jeunesse et la conversion d’Augustin · a Augustin, prêtre et évêque d’Hippone · c Les Confessions · p Augustin philosophe · m Augustin contre les manichéens · d Augustin contre les donatistes · u Augustin contre Pélage · t Le De Trinitate · i La Cité de Dieu · e Augustin exégète et prédicateur · r La règle et l’héritage d’Augustin

Le titre de votre `<cours>` est le titre du sujet tel qu'il figure ci-dessus (sans balise dans l'attribut). Le sous-titre, bref, dit ce que le cours fait comprendre (voyez le modèle).

## 4. La commande

La liste de votre sujet est la commande : **elle est définitive et complète, et le cours la traite tout entière**, chaque élément, dans un ordre d'apprentissage. Rien n'en est omis ; vous pouvez ajouter ce qui est nécessaire pour la comprendre. Un élément qui annonce « un tout » suivi de ses parties (par exemple « Ses trois niveaux… : un tout qui va des principes à l'action », puis chaque niveau) se traite comme un ensemble dont chaque partie reçoit sa place.

Taille attendue, comme les cours déjà en ligne : **8 à 12 leçons** selon la matière ; chaque leçon de l'ordre de 15 à 20 Ko de contenu, avec 3 à 5 parties, des encadrés, 1 à 3 « Vérifie », L'essentiel (5 à 8 phrases), 4 à 7 mots clés, **5 à 7 exercices** de niveaux 1 à 3 avec corrigés développés, et l'autoévaluation (une affirmation par objectif). Le bilan compte 5 à 7 exercices qui croisent plusieurs leçons.

## 5. Règles de fond

- **Doctrine catholique.** Lecture selon la doctrine et la théologie de l'Église catholique. Sur une question d'interprétation, donnez la lecture la plus juste, fondée sur les Pères, la tradition et le Magistère. Distinguez ce que l'Église enseigne comme principe permanent de ce qui relève d'un jugement lié aux circonstances ou d'une opinion de théologiens.
- **Exactitude.** Dates, numéros de paragraphes, noms, chiffres et citations doivent être justes. Une citation d'un document du Magistère se donne mot pour mot ; si vous n'êtes pas sûr de son libellé exact, vérifiez-le (WebSearch puis WebFetch, de préférence sur vatican.va) ou paraphrasez sans guillemets. Les faits récents (par exemple tout ce qui touche à Léon XIV, élu en 2025, à François ou aux événements des dernières années) se vérifient toujours en ligne avant d'en dire quoi que ce soit. Chaque date, chaque nom, chaque titre d'œuvre et chaque extrait d'un Père se vérifie ; quand les sources varient (une date « vers 107 », une attribution discutée), dites-le. N'inventez jamais une citation, un numéro ou une date.
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
- vers un cours d'un autre fichier du bloc : `23-les-premiers-temoins.html#ouverture-i`, etc. ;
- vers un sujet d'un autre bloc : la forme donnée dans `/home/claude/peres/sujets-et-liens.md` (`fichier.html#ouverture-x` s'il est écrit, `#sujet:clé` sinon).
Quand vous nommez un autre cours, nommez-le par son sujet (« le cours sur Ignace d’Antioche »).

## 8. Mots clés

Chaque mot clé de vos leçons reçoit sa définition complète (`<mot terme="…">définition</mot>`) dans la leçon qui l'explique ; une leçon suivante du même cours qui le reprend écrit `<mot terme="…"/>`. Ne comptez pas sur les autres cours pour définir vos mots.

## 9. Méthode de travail et livraison

1. Lisez tout ce que dit le § 1. Dressez la carte du sujet et le plan des leçons (question centrale, obstacles du novice).
2. **Reprise.** Si votre dossier `parts/{votre code}/` contient déjà des fichiers (un rédacteur précédent a été interrompu), lisez-les d'abord : gardez les leçons complètes, refaites seulement la dernière si elle est inachevée, et continuez à partir de là. Écrivez aussi, dès que votre plan est fait, le fichier `parts/{votre code}/plan.md` (titres et contenu prévu de chaque leçon), et tenez-le à jour, pour qu'un autre rédacteur puisse reprendre le travail à l'identique.
3. Écrivez **une leçon par fichier**, et enregistrez chaque leçon dès qu'elle est finie (le travail est sauvegardé régulièrement : ce qui n'est pas encore écrit sur le disque serait perdu en cas d'interruption) dans `/home/claude/peres/redaction/parts/{votre code}/` (par exemple `68-03-c/00-ouverture.html` pour la balise `<cours …>` et l'introduction, `01.html`, `02.html`…, puis `99-bilan.html` avec le bilan et `</cours>`). Cela évite les fichiers trop longs à écrire d'un coup.
4. Réunissez-les dans l'ordre en un seul fichier : `/home/claude/peres/redaction/{votre code}.html`. Il contient **seulement** `<cours lettre="x" titre="…" sous-titre="…"> … </cours>`, sans `<fichier>` ni `<progression>` : l'assemblage se fait plus tard pour tout le fichier.
5. Lancez le contrôle : `python3 /home/claude/peres/outils/verifier.py /home/claude/peres/redaction/{votre code}.html`. Il compare chaque verset à la Chérubin et repère le tutoiement, les tirets, les références nues, les mots à éviter et les balises mal fermées. Corrigez tout ce qu'il signale (un faux signalement de tutoiement, par exemple le mot « te » dans une citation non biblique, peut rester).
6. Faites passer **tout le texte** par la skill humaniser, en mode fichier, leçon par leçon : seule la prose change, balises et attributs de structure restent intacts, aucun fait n'est ajouté ni perdu. Visez particulièrement : les contrastes « pas X, mais Y », les chutes d'une ligne, les triades forcées, les mots fétiches, le gras décoratif.
7. Relancez le contrôle jusqu'à ce qu'il ne signale plus rien de réel.
8. Pour finir, **testez l'assemblage** de votre cours seul : écrivez un petit fichier `/tmp/{votre code}-essai.html` contenant `<fichier sujet="Essai">` + votre cours + `</fichier>`, puis `python3 /root/.claude/skills/synced/0ecbfa39-bf16-4489-b54b-5c2efbbd424c_4e9301a7-4fe1-44a2-b731-c02e9c9e697f/cours-html/moteur/assembler.py /tmp/{votre code}-essai.html /tmp/{votre code}-essai-sortie.html` ; il doit réussir. Ne gardez pas ce fichier d'essai dans `redaction/`.

Ne touchez à rien dans `/home/claude/lumen/` : vous ne faites qu'y lire. N'écrivez que dans `/home/claude/peres/redaction/`.

**Vos points de doute** (une date, une citation que vous n'avez pas pu vérifier, une affirmation de mémoire) s'écrivent, avant de finir, dans le fichier `/home/claude/peres/doutes.md`, à la suite de ce qui s'y trouve, sous un titre `## {votre code}`, une ligne par point. Le relecteur les vérifiera.

**Votre rapport complet** (ce que vous avez fait, vos choix, ce qui reste incertain) s'écrit dans `/home/claude/peres/rapports/{votre code}-ecriture.md` : il est sauvegardé avec le travail.

**Votre réponse finale tient en cinq lignes au plus**, sans le texte du cours : le chemin du fichier, le nombre de leçons et d'exercices, ce que le contrôle signale encore.

## 10. Vérifier en ligne

La recherche web (WebSearch) est partagée par tous les rédacteurs et s'épuise vite. Quand elle ne répond plus, vérifiez en ouvrant directement les pages officielles avec WebFetch (vatican.va pour le Magistère, le Catéchisme et les textes conciliaires ; newadvent.org pour la Catholic Encyclopedia et les œuvres des Pères en traduction anglaise (rubrique Fathers) ; thelatinlibrary.com et augustinus.it pour les textes latins (augustinus.it a toute l'œuvre d'Augustin en latin) ; papalencyclicals.net pour les textes des conciles et des papes ; la Chérubin locale pour la Bible). La Catholic Encyclopedia date de 1907-1914 : elle sert pour les faits anciens, pas pour l'état actuel de la recherche ni pour les chiffres discutés. Ce que vous ne pouvez pas vérifier se paraphrase sans guillemets ou se retire.

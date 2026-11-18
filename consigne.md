# Consigne commune : bloc « L’histoire de l’Église »

Vous écrivez **un cours** du parcours d'étude « La foi catholique » du site Lumen (lumenveritatis.net), site catholique d'Emmanuel. Soixante-treize cours s'écrivent, par vagues, un par rédacteur ; cette consigne est la même pour tous. Lisez-la en entier avant d'écrire.

## 1. À lire avant d'écrire (en entier)

1. La skill cours-html : `/root/.claude/skills/synced/0ecbfa39-bf16-4489-b54b-5c2efbbd424c_4e9301a7-4fe1-44a2-b731-c02e9c9e697f/cours-html/SKILL.md`. Elle dit comment un cours se compose et donne le format du contenu. Suivez-la à la lettre, sauf sur les points que cette consigne règle autrement (assemblage, relecture : voir § 9).
2. La skill humaniser : `/root/.claude/skills/synced/0ecbfa39-bf16-4489-b54b-5c2efbbd424c_4e9301a7-4fe1-44a2-b731-c02e9c9e697f/humaniser/SKILL.md`.
3. La skill bible : `/root/.claude/skills/synced/0ecbfa39-bf16-4489-b54b-5c2efbbd424c_4e9301a7-4fe1-44a2-b731-c02e9c9e697f/bible/SKILL.md`. Le texte de la Chérubin est dans le dossier `cherubin/` à côté.
4. Le guide du site, section « Le contenu » : `/home/claude/lumen/CLAUDE.md`, et la fiche `/home/claude/lumen/documentation/cours.md`.
5. Le modèle `/home/claude/histoire/modele.html` : une introduction, une leçon et le début d'un bilan tirés d'un cours déjà en ligne. C'est la profondeur, la densité et le ton attendus. Deux différences : le modèle tutoie, vous vouvoyez ; le modèle cite parfois un verset par sa seule référence, vous donnez toujours son texte.
6. Votre commande (le fichier que le message de lancement vous donne, dans `/home/claude/histoire/commandes/`), puis le plan du bloc (§ 3) et la liste des sujets (`/home/claude/histoire/sujets-et-liens.md`) pour savoir ce que les autres cours traitent.

## 2. Le bloc

Le bloc « L’histoire de l’Église » suit l’Église de la Pentecôte à nos jours : les premiers siècles, les conciles de l’Église indivise, le haut Moyen Âge, le Moyen Âge central et tardif, la Réforme et le concile de Trente, l’époque moderne, l’Église contemporaine. Il donne au dogme ses racines et son contexte : chaque définition est née à un moment de l’histoire, souvent en réponse à une erreur. Un thème = un fichier ; un sujet = un cours dans ce fichier.

**Ce qu'est un cours d'histoire ici.** Il raconte et il explique : les faits, les personnes, les dates, les causes et les conséquences, et ce que l'événement a changé pour la foi et la vie de l'Église. Il distingue toujours trois choses : les faits établis par les sources ; l'interprétation des historiens, quand elle est discutée (dites-le, et donnez les positions sérieuses) ; le jugement de l'Église, quand elle en a porté un (définition d'un concile, condamnation, canonisation, demande de pardon comme celle de Jean-Paul II le 12 mars 2000).

**Les sujets sensibles** (persécutions, croisades, Inquisition, guerres de religion, Révolution, Réforme, crise moderniste, réception de Vatican II) se traitent avec exactitude et sans parti pris : ni apologétique qui tait ce qui est mal, ni légende noire qui grossit les chiffres. Les chiffres (victimes, procès, condamnations) suivent les études sérieuses récentes, avec leur marge d'incertitude. Les autres confessions chrétiennes (orthodoxes, protestants, anglicans) sont présentées comme elles se comprennent elles-mêmes, puis jugées selon la doctrine catholique, avec le respect que demande le décret *Unitatis redintegratio*.

**Partage de la matière entre les thèmes et avec les autres blocs**, pour éviter les redites :
- la doctrine elle-même est exposée dans les blocs doctrinaux ; le cours d'histoire raconte comment elle a été définie et pourquoi, et renvoie d'un lien au cours de doctrine quand il existe : le dogme christologique et trinitaire des conciles (bloc « Jésus-Christ », déjà écrit, et « Dieu un et trine »), la grâce et la justification à Trente (bloc « L’Esprit Saint et la grâce », écrit), les sacrements à Trente et la réforme liturgique de Vatican II (bloc « La liturgie et les sacrements », écrit), *Rerum novarum* et les encycliques sociales (bloc « La doctrine sociale de l’Église », écrit), la Révélation à Vatican I et à Vatican II (bloc « La Révélation et sa transmission », écrit) ;
- les Pères comme auteurs et leur pensée appartiennent au bloc « Les Pères de l’Église » ; ici, ils paraissent comme acteurs de l’histoire ;
- dans ce bloc, chaque concile, pape, ordre ou événement a son cours : un autre cours qui le croise le rappelle d'une phrase avec un lien, sans le refaire.

Un élément qui figure dans la commande d'un autre sujet se rappelle d'une phrase, avec un lien vers ce cours, sans être développé. Ce que votre commande contient, vous le traitez à fond, même s'il touche à un autre sujet. Voyez la liste des sujets pour lier les cours déjà écrits quand cela aide vraiment.

## 3. Plan du bloc : fichiers, cours et lettres

Les lettres sont fixées : écrivez-les dans l'attribut `lettre` de votre `<cours>`.

**Fichier `27-l-eglise-des-premiers-siecles.html`** (thème « L’Église des premiers siècles »)
l La communauté de Jérusalem · a L’assemblée de Jérusalem · m La mission et l’expansion · p Les persécutions · r Les martyrs · o L’organisation des communautés · c Constantin et l’édit de Milan · t Théodose et l’Empire chrétien · n La naissance du monachisme

**Fichier `28-les-conciles-de-l-eglise-indivise.html`** (thème « Les conciles de l’Église indivise »)
l Qu’est-ce qu’un concile œcuménique · c Le concile de Nicée I (325) · i Le concile de Constantinople I (381) · e Le concile d’Éphèse (431) · o Le concile de Chalcédoine (451) · n Le concile de Constantinople II (553) · s Le concile de Constantinople III (680-681) · a Le concile de Nicée II (787)

**Fichier `29-le-haut-moyen-age.html`** (thème « Le haut Moyen Âge »)
l La fin de l’Empire d’Occident · c La conversion des peuples d’Occident · s La conversion des Slaves et des peuples du Nord · i L’islam et la chrétienté · p La papauté et les Francs · e Charlemagne et l’empire carolingien · m Le monachisme bénédictin et Cluny · h Le schisme de 1054

**Fichier `30-le-moyen-age-central-et-tardif.html`** (thème « Le Moyen Âge central et tardif »)
l La réforme grégorienne · p La papauté à son sommet : d’Innocent III à Boniface VIII · c Les croisades · s Cîteaux et saint Bernard · o Les ordres mendiants · u Les universités et la scolastique · h Les hérésies médiévales · m La mystique rhénane et flamande · i L’Inquisition médiévale · n Les conciles du Latran · v Les conciles de Lyon et de Vienne · a La papauté d’Avignon · g Le grand schisme d’Occident · e Le concile de Constance (1414-1418) · b Le concile de Bâle-Ferrare-Florence

**Fichier `31-la-reforme-et-le-concile-de-trente.html`** (thème « La Réforme et le concile de Trente »)
l Les causes de la Réforme · u Luther · z Zwingli · r La Réforme radicale · c Calvin · a L’anglicanisme · g Les guerres de religion · t Le concile de Trente : son déroulement · d Les décrets doctrinaux de Trente · e Les décrets de réforme de Trente et leur application · f La Réforme catholique · s Les saints de la Réforme catholique

**Fichier `32-l-eglise-a-l-epoque-moderne.html`** (thème « L’Église à l’époque moderne »)
l L’élan missionnaire · q La querelle des rites · j Le jansénisme · g Le gallicanisme et le joséphisme · u Les Lumières · r La Révolution française · x Le renouveau du XIXe siècle · p L’ultramontanisme et Pie IX · f La fin des États pontificaux · c Le concile Vatican I (1869-1870)

**Fichier `33-l-eglise-contemporaine.html`** (thème « L’Église contemporaine »)
l Léon XIII · s Saint Pie X · c La crise moderniste · b Benoît XV et Pie XI · p Pie XII · t Les théologiens du XXe siècle · v Le concile Vatican II : son déroulement · d Les seize documents de Vatican II · r La réception de Vatican II · a Les papes depuis le concile · e Le Catéchisme de l’Église catholique

Le titre de votre `<cours>` est le titre du sujet tel qu'il figure ci-dessus (sans balise dans l'attribut). Le sous-titre, bref, dit ce que le cours fait comprendre (voyez le modèle).

## 4. La commande

La liste de votre sujet est la commande : **elle est définitive et complète, et le cours la traite tout entière**, chaque élément, dans un ordre d'apprentissage. Rien n'en est omis ; vous pouvez ajouter ce qui est nécessaire pour la comprendre. Un élément qui annonce « un tout » suivi de ses parties (par exemple « Ses trois niveaux… : un tout qui va des principes à l'action », puis chaque niveau) se traite comme un ensemble dont chaque partie reçoit sa place.

Taille attendue, comme les cours déjà en ligne : **8 à 12 leçons** selon la matière ; chaque leçon de l'ordre de 15 à 20 Ko de contenu, avec 3 à 5 parties, des encadrés, 1 à 3 « Vérifie », L'essentiel (5 à 8 phrases), 4 à 7 mots clés, **5 à 7 exercices** de niveaux 1 à 3 avec corrigés développés, et l'autoévaluation (une affirmation par objectif). Le bilan compte 5 à 7 exercices qui croisent plusieurs leçons.

## 5. Règles de fond

- **Doctrine catholique.** Lecture selon la doctrine et la théologie de l'Église catholique. Sur une question d'interprétation, donnez la lecture la plus juste, fondée sur les Pères, la tradition et le Magistère. Distinguez ce que l'Église enseigne comme principe permanent de ce qui relève d'un jugement lié aux circonstances ou d'une opinion de théologiens.
- **Exactitude.** Dates, numéros de paragraphes, noms, chiffres et citations doivent être justes. Une citation d'un document du Magistère se donne mot pour mot ; si vous n'êtes pas sûr de son libellé exact, vérifiez-le (WebSearch puis WebFetch, de préférence sur vatican.va) ou paraphrasez sans guillemets. Les faits récents (par exemple tout ce qui touche à Léon XIV, élu en 2025, à François ou aux événements des dernières années) se vérifient toujours en ligne avant d'en dire quoi que ce soit. En histoire, chaque date, chaque nom, chaque chiffre se vérifie ; quand les sources varient (une date « vers 49 », un nombre de victimes), dites-le. N'inventez jamais une citation, un numéro ou une date.
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
- vers un cours d'un autre fichier du bloc : `28-les-conciles-de-l-eglise-indivise.html#ouverture-c`, etc. ;
- vers un sujet d'un autre bloc : la forme donnée dans `/home/claude/histoire/sujets-et-liens.md` (`fichier.html#ouverture-x` s'il est écrit, `#sujet:clé` sinon).
Quand vous nommez un autre cours, nommez-le par son sujet (« le cours sur le concile de Nicée »).

## 8. Mots clés

Chaque mot clé de vos leçons reçoit sa définition complète (`<mot terme="…">définition</mot>`) dans la leçon qui l'explique ; une leçon suivante du même cours qui le reprend écrit `<mot terme="…"/>`. Ne comptez pas sur les autres cours pour définir vos mots.

## 9. Méthode de travail et livraison

1. Lisez tout ce que dit le § 1. Dressez la carte du sujet et le plan des leçons (question centrale, obstacles du novice).
2. **Reprise.** Si votre dossier `parts/{votre code}/` contient déjà des fichiers (un rédacteur précédent a été interrompu), lisez-les d'abord : gardez les leçons complètes, refaites seulement la dernière si elle est inachevée, et continuez à partir de là. Écrivez aussi, dès que votre plan est fait, le fichier `parts/{votre code}/plan.md` (titres et contenu prévu de chaque leçon), et tenez-le à jour, pour qu'un autre rédacteur puisse reprendre le travail à l'identique.
3. Écrivez **une leçon par fichier**, et enregistrez chaque leçon dès qu'elle est finie (le travail est sauvegardé régulièrement : ce qui n'est pas encore écrit sur le disque serait perdu en cas d'interruption) dans `/home/claude/histoire/redaction/parts/{votre code}/` (par exemple `68-03-c/00-ouverture.html` pour la balise `<cours …>` et l'introduction, `01.html`, `02.html`…, puis `99-bilan.html` avec le bilan et `</cours>`). Cela évite les fichiers trop longs à écrire d'un coup.
4. Réunissez-les dans l'ordre en un seul fichier : `/home/claude/histoire/redaction/{votre code}.html`. Il contient **seulement** `<cours lettre="x" titre="…" sous-titre="…"> … </cours>`, sans `<fichier>` ni `<progression>` : l'assemblage se fait plus tard pour tout le fichier.
5. Lancez le contrôle : `python3 /home/claude/histoire/outils/verifier.py /home/claude/histoire/redaction/{votre code}.html`. Il compare chaque verset à la Chérubin et repère le tutoiement, les tirets, les références nues, les mots à éviter et les balises mal fermées. Corrigez tout ce qu'il signale (un faux signalement de tutoiement, par exemple le mot « te » dans une citation non biblique, peut rester).
6. Faites passer **tout le texte** par la skill humaniser, en mode fichier, leçon par leçon : seule la prose change, balises et attributs de structure restent intacts, aucun fait n'est ajouté ni perdu. Visez particulièrement : les contrastes « pas X, mais Y », les chutes d'une ligne, les triades forcées, les mots fétiches, le gras décoratif.
7. Relancez le contrôle jusqu'à ce qu'il ne signale plus rien de réel.
8. Pour finir, **testez l'assemblage** de votre cours seul : écrivez un petit fichier `/tmp/{votre code}-essai.html` contenant `<fichier sujet="Essai">` + votre cours + `</fichier>`, puis `python3 /root/.claude/skills/synced/0ecbfa39-bf16-4489-b54b-5c2efbbd424c_4e9301a7-4fe1-44a2-b731-c02e9c9e697f/cours-html/moteur/assembler.py /tmp/{votre code}-essai.html /tmp/{votre code}-essai-sortie.html` ; il doit réussir. Ne gardez pas ce fichier d'essai dans `redaction/`.

Ne touchez à rien dans `/home/claude/lumen/` : vous ne faites qu'y lire. N'écrivez que dans `/home/claude/histoire/redaction/`.

**Vos points de doute** (une date, une citation que vous n'avez pas pu vérifier, une affirmation de mémoire) s'écrivent, avant de finir, dans le fichier `/home/claude/histoire/doutes.md`, à la suite de ce qui s'y trouve, sous un titre `## {votre code}`, une ligne par point. Le relecteur les vérifiera.

**Votre rapport complet** (ce que vous avez fait, vos choix, ce qui reste incertain) s'écrit dans `/home/claude/histoire/rapports/{votre code}-ecriture.md` : il est sauvegardé avec le travail.

**Votre réponse finale tient en cinq lignes au plus**, sans le texte du cours : le chemin du fichier, le nombre de leçons et d'exercices, ce que le contrôle signale encore.

## 10. Vérifier en ligne

La recherche web (WebSearch) est partagée par tous les rédacteurs et s'épuise vite. Quand elle ne répond plus, vérifiez en ouvrant directement les pages officielles avec WebFetch (vatican.va pour le Magistère, le Catéchisme et les textes conciliaires ; newadvent.org pour la Catholic Encyclopedia, les Pères, Eusèbe et les canons des conciles ; papalencyclicals.net pour les textes des conciles et des papes ; la Chérubin locale pour la Bible). La Catholic Encyclopedia date de 1907-1914 : elle sert pour les faits anciens, pas pour l'état actuel de la recherche ni pour les chiffres discutés. Ce que vous ne pouvez pas vérifier se paraphrase sans guillemets ou se retire.

# Lumen — guide de travail pour l'IA

Ce fichier présente le projet à toute IA qui ouvre ce dépôt. Il se lit en entier avant de toucher à quoi que ce soit.

## Le projet

Lumen est le site personnel d'Emmanuel, en ligne sur **lumenveritatis.net**. Le site **s'ouvre au public** : tant qu'Emmanuel n'a pas retiré lui-même la porte à mot de passe, elle garde encore toutes les pages. La base de données donne tout à son compte Google et, à tout autre compte, son seul propre espace (ses notes, son Mémoriser, ses questions à l'IA…). Chacun peut supprimer son compte et tout ce qu'il contient (« Mon compte »), et une page dit, en langage simple, ce que le site garde de chacun (confidentialité et mentions légales) : toute modification qui change ce que le site garde d'un compte met à jour cette page et la suppression du compte dans le même mouvement. Le référencement dans les moteurs de recherche viendra plus tard, quand Emmanuel le demandera.

Emmanuel ne code pas. Il confie à l'IA tout le développement : elle lit, modifie, teste et dépose elle-même sur ce dépôt. Elle lui parle en langage courant, en français, sans noms de fonctions, de fichiers techniques ni extraits de code, sauf s'il en demande.

Les cinq pages du site :

- **Accueil** : la croix, la vie de l'Église au jour le jour et la **méditation du jour**, écrite par Claude, relue avec la skill humaniser et lue par la voix « Victoria » d'ElevenLabs ; elle paraît à minuit (heure de La Réunion), toujours avec sa voix, son texte suit la voix, et elle se réécoute et se télécharge pendant trente jours, puis s'efface du coffre. Emmanuel seul peut la mettre en pause (« Mon compte ») et voit pourquoi elle manque quand elle manque.
- **Bible** : ses deux traductions françaises, la **Chérubin** (équivalence dynamique, traduction par défaut) et la **Séraphin** (littérale). Notes, surlignages, signets, recherche de références.
- **Mémoriser** : apprendre des versets par séries à choix multiple, avec une couleur par verset (rouge, jaune, vert) qui est le jugement d'Emmanuel lui-même. Deux onglets, chacun sa série : les « Versets de base » (`contenu/memoriser.json`, une section par bloc du parcours, une catégorie par thème, chaque verset avec sa note « pourquoi l'apprendre », passée par la skill humaniser ; seulement les versets qui valent d'être sus par cœur, ce qui sert surtout à comprendre restant dans les cours ; un même verset peut revenir dans plusieurs blocs, car il partage sa progression d'une catégorie à l'autre, et la pertinence de l'ensemble se reverra quand tous les blocs seront faits ; ni modifiables ni supprimables) et « Mes versets ».
- **Articles** : ses articles, des pages HTML au format question-réponse faites dans Claude (skill article-html), en lecture seule, les mêmes pour tous : personne n'en ajoute ni n'en modifie sur le site. Rangés en catégories et sections d'après le catalogue `articles/articles.json`, ils s'ouvrent en plein écran comme un cours d'Étude.
- **Étude** : le parcours « La foi catholique », ouvert d'emblée en plein écran comme un article ouvert, dans un cadre isolé, avec sa mémoire de lecture synchronisée entre ses appareils ; chaque thème qui a son fichier de cours l'ouvre par « Ouvrir le cours ». La taille du texte vaut pour le parcours et tous ses cours.

## Où se trouve chaque chose

| Dossier | Contenu |
|---|---|
| `pages/` | Les pages, une par fichier HTML, chacune avec son propre script (l'accueil, Étude et Articles sont assemblées par la fabrication autour de `accueil.js`, `etude.js` et `articles.js`). |
| `habillage/` | L'apparence : `lumen-commun.css` (le socle), `commun.css` (ce qui vaut pour toutes les pages, fenêtres et menus compris), puis une feuille par page. |
| `commun/` | Le fonctionnement partagé entre plusieurs pages (choix d'un verset, versets cités, question à l'IA et ses outils, lecture du coffre R2, cadre isolé où s'ouvrent les cours d'Étude et les articles, suppression du compte). La fabrication pose dans chaque page les familles dont elle a besoin. |
| `articles/` | Le catalogue des articles (`articles.json`) : catégories, sections, et pour chaque article son fichier, sa question, le début de sa réponse et sa place. Les fichiers eux-mêmes vivent dans le coffre R2 et se servent à `/articles/`. |
| `contenu/` | Les deux Bibles (`bible.json` pour la Chérubin, `bible-seraphin.json` pour la Séraphin), la bibliothèque de départ de Mémoriser, les réglages d'apparence. |
| `parcours/` | Le parcours d'étude « La foi catholique » (fichier de la skill parcours-etude, laissé intact), `cours.json`, qui relie chaque sujet à son cours, et `cours-sommaire.json`, qui décrit les fichiers de cours (un par thème, skill cours-html). Les fichiers de cours eux-mêmes vivent dans le coffre R2 et se servent à `/parcours/cours/` ; la fabrication vérifie chaque lien contre le sommaire et pose dans l'en-tête de chaque thème relié le bouton « Ouvrir le cours ». |
| `racine/` | Les fichiers servis tels quels à la racine du site : panneau de la Bible ouvert depuis les autres pages, service workers (hors ligne), manifestes, icônes, polices, et la page de confidentialité et des mentions légales (`confidentialite.html`, page fixe). |
| `fabrication/` | Ce qui construit le site : `build-bi.js` assemble les pages, `publication.js` allège et contrôle le résultat. |
| `netlify/edge-functions/` | Le serveur : `porte.js` (le mot de passe du site), `ia.js` (le passage vers l'API Claude pour la conversation), `fichiers.js` (le passage vers le coffre R2), `meditation.js` (la méditation du jour servie à l'accueil) et `liturgie.js` (les lectures du jour). Les outils qu'ils partagent sont dans `netlify/serveur/`. |
| `netlify/functions/` | La fabrication de la méditation du jour : une horloge, chaque heure, et la fonction de fond qui la fait écrire et relire par Claude, puis lire par ElevenLabs. |
| `.github/` | Le robot du coffre R2 (`workflows/coffre.yml` et ses scripts dans `coffre/`). |
| `ia/` | Les règles d'écriture de l'IA du site : les instructions personnalisées d'Emmanuel (`ia/instructions.md`), les mêmes pour tous, et la copie de sa skill humaniser (`ia/humaniser.md`), pour la méditation du jour. |
| `documentation/` | Les fiches de référence : données, IA, règles de sécurité de la base, frais des services et réglages qui les plafonnent (`frais.md`). |

Le dossier `site/` est le site fabriqué. Il ne vit pas dans le dépôt : Netlify le refait à chaque dépôt.

## Fabriquer, essayer, déposer

- La fabrication se lance depuis la racine du dépôt avec `node fabrication/build-bi.js`. Elle écrit le site dans `site/` et se termine par un contrôle qui relit chaque page ; un défaut grave arrête la fabrication.
- Chaque modification s'essaie dans un navigateur sans tête (Playwright), page par page, en simulant le compte d'Emmanuel et la base de données : le vrai site est derrière la porte, et la base n'est accessible qu'à son compte.
- **Avant tout dépôt d'une modification visible, l'IA envoie des captures d'écran à Emmanuel et attend son accord** (« dépose-le »). Les captures montrent l'ordinateur et le téléphone quand la page change sur les deux.
- Le dépôt se fait sur la branche `main` ; Netlify reconstruit et met en ligne le site en une à deux minutes. Les messages de dépôt sont en français et disent ce qui change pour Emmanuel.
- Une fabrication du site identique avant et après prouve qu'un rangement de fichiers n'a rien changé au site.

## Façon de travailler avec Emmanuel

- L'IA change ce qu'il a demandé, et seulement cela : une retouche demandée pour un élément ou une page reste sur cet élément ou cette page.
- Quand il réfléchit à voix haute, l'IA répond et attend qu'il dise « fais-le » pour toucher au site.
- Ses données (versets, progression, notes, articles, ressources) passent avant tout. Une modification qui touche à la forme des données lit l'ancien format, le convertit sans rien perdre, et garde la progression intacte.

## Le langage visuel du site

- **Deux couleurs** : le noir (couleur principale) et la crème `#efe6cf` (l'accent). Aucune couleur vive. Le texte est blanc, à diverses opacités.
- **Polices**, un rôle chacune : Cormorant Garamond pour les grands titres, Literata pour le texte de lecture (Bible, articles), EB Garamond pour l'interface (barre, menus, boutons, étiquettes, sous-titres). Les fichiers des polices sont servis par le site lui-même (`racine/polices/`).
- **Boutons** : remplis de crème, texte noir. Plusieurs boutons côte à côte forment un seul bandeau crème arrondi, séparé par de petits traits ; chaque case réagit au survol comme un bouton seul. Deux choix d'égale importance ne s'affichent jamais en bouton crème à côté d'un simple mot.
- **Noms des boutons** : « + » devant ce qui crée (« + Nouvelle catégorie »), « ← Les … » pour revenir, une icône de poubelle seule pour mettre à la corbeille.
- **Rangement** : partout, la catégorie au premier niveau, puis des sections dedans. Toucher une catégorie ou une section ouvre sa propre page, avec un fil d'Ariane.
- **Les ⋯** sont en blanc bien allumé. Ils ouvrent un menu d'actions en forme de feuille : le nom de l'objet en tête, une croix pour fermer, une rangée par action avec son pictogramme dans un petit cadre à coin coupé ; l'action qui jette est en bas, sous un filet, en blanc comme les autres. Sur téléphone, la feuille monte du bas de l'écran.
- **Fenêtres** : panneau noir, filet fin, coin supérieur droit tranché en biais, titre en Cormorant souligné d'un séparateur qui s'éteint vers la droite.
- **Texte** : l'interligne serré de la Bible et des articles est voulu. Le texte de la Bible est justifié aux deux bords, sur téléphone aussi, prose comme vers.
- **Articles** : des rangées sans cadre, séparées par des filets, avec la question en titre et le début de la réponse dessous.

## Le contenu

Tout contenu écrit pour le site (articles, livres, diagrammes, cours) suit ces règles :

- lecture selon la doctrine et la théologie de l'Église catholique ;
- versets cités depuis les Bibles du site, en italique entre guillemets français, la référence en gras après, au format « Genèse 44:2-3 » ;
- un mot de la langue d'origine se présente avec sa langue, sa translittération en italique et le mot français qui le traduit ;
- typographie française : guillemets « », apostrophe courbe, espaces insécables avant « : ; ! ? » ;
- les articles s'adressent à la fois au novice, qui découvre le sujet, et au lecteur confirmé.

Les deux Bibles vivent dans `contenu/`. Une correction du texte se fait dans le fichier de la traduction concernée, et l'autre traduction s'aligne quand Emmanuel le demande. Il tient aussi une copie de ces deux Bibles dans sa skill « bible » : après une modification du texte, l'IA lui livre la skill mise à jour.

## L'IA dans le site

Pour les modèles de langage (LLM), le site n'utilise qu'Anthropic, par l'API Claude, en passant par `netlify/edge-functions/ia.js` pour la conversation et par `netlify/functions/meditation-fabrique.mjs` pour la méditation du jour. Pour la voix, il n'utilise qu'ElevenLabs. Ce passage demande à Google quel compte est connecté, puis relaie la réponse au fil de l'eau. Le compte d'Emmanuel passe par la clé du site ; tout autre compte n'a que la conversation, avec sa propre clé de l'API Anthropic, gardée sur son appareil et transmise sans être gardée (Emmanuel : « chacun sa clé »). La clé du site vit dans la variable `ANTHROPIC_API_KEY` de Netlify et nulle part ailleurs. Chaque usage reçoit le modèle au meilleur rapport qualité-prix pour la tâche demandée, choisi dans la gamme du moment : de nouveaux modèles sortent souvent, et le choix se refait quand ils paraissent. Le niveau de réflexion est toujours « moyen », pour tous les usages. C'est Emmanuel qui décide des usages à ajouter. La conversation avec l'IA s'ouvre sur toutes les pages (icône de la barre du haut) : recherche sur internet, réflexion, bibliothèque du compte, pièces jointes et une mémoire propre au site ; elle ne crée pas de pages, qui se font dans Claude. Le détail est dans `documentation/ia.md`.

**Les mêmes règles pour tous.** Les instructions personnalisées d'Emmanuel vivent aussi dans `ia/instructions.md`, à l'identique de ce qu'il a dans Claude : ce sont les règles d'écriture de l'IA du site. La conversation parle à la personne connectée, sans prénom ni portrait, Emmanuel compris (« je veux les mêmes instructions que tout le monde »). Le site ne garde qu'une skill : une copie de sa skill humaniser (`ia/humaniser.md`), par laquelle passe toujours la méditation du jour ; quand Emmanuel change cette skill, l'IA met la copie à jour. Quand Emmanuel change ses instructions, l'IA met `ia/instructions.md` à jour dans le même mouvement et le dépose. La mémoire de Claude n'entre pas sur le site : l'IA du site a sa propre mémoire (`meta/ia_memoire`), une par compte.

## Le coffre R2

Le coffre R2 de Cloudflare (bucket `lumen-ressources`, sans accès public) garde les fichiers lourds du site : les cours d'Étude (`cours/`), les articles (`articles/`) et la méditation du jour (`meditations/`, écrite par le site lui-même). Les anciennes pages et ressources y restent aussi, sans page pour les afficher : l'IA du site peut encore les lire, et seul le compte d'Emmanuel peut les télécharger. Après avoir fait ou refait des cours, l'IA met leur sommaire à jour (`node fabrication/cours-sommaire.js` suivi des fichiers) et les envoie par le robot avec l'espèce « cours ». Pour un article, elle l'inscrit au catalogue (`articles/articles.json`, dans le dépôt) et l'envoie par le robot avec l'espèce « article ». L'IA ne joint pas Cloudflare depuis son espace de travail : pour **déposer**, elle pousse une branche `envoi/…` ; pour **reprendre** un fichier afin de le modifier, une branche `demande/…`. Le robot GitHub fait le reste. Ces branches ne sont pas des dépôts du site : elles ne touchent pas `main`, mais un envoi change ce que voient les lecteurs, si bien qu'il passe, comme un dépôt, par l'accord d'Emmanuel. Le mode d'emploi est dans `documentation/donnees.md`.

## Les secrets

Aucun secret n'entre dans le dépôt. Le mot de passe du site (`LUMEN_MOT_DE_PASSE`), la clé de l'API (`ANTHROPIC_API_KEY`) et celle d'ElevenLabs (`ELEVENLABS_API_KEY`) vivent dans les variables d'environnement de Netlify ; les clés du coffre R2 (`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`) vivent dans celles de Netlify et dans les secrets du dépôt GitHub. La clé Firebase écrite dans les pages est une clé publique par nature : la protection des données vient des règles de sécurité de la base (`documentation/regles-firestore.txt`).

## Les commentaires dans le code

Les commentaires sont la mémoire du projet : ils disent pourquoi une chose est faite ainsi, pour qu'aucune IA ne « corrige » un choix voulu. L'IA les lit avant de modifier un passage.

- Chaque commentaire dit **ce qui est vrai maintenant et pourquoi**, au présent, en français, en quelques lignes. Les mots d'Emmanuel y restent entre guillemets quand ils protègent un choix (« l'interligne serré est voulu »).
- L'histoire (dates, « avant c'était… », récits de bugs) vit dans les messages de dépôt sur GitHub, pas dans le code.
- Quand l'IA change le code, elle met à jour le commentaire qui l'accompagne dans le même mouvement ; quand une chose disparaît, son commentaire disparaît avec elle. Un commentaire ne contredit jamais le code.
- Un commentaire qui répète ce que le code dit clairement n'a pas lieu d'être.

La fabrication retire les commentaires du site envoyé au navigateur.

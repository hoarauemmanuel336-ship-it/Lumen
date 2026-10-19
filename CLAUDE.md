# Lumen — guide de travail pour l'IA

Ce fichier présente le projet à toute IA qui ouvre ce dépôt. Il se lit en entier avant de toucher à quoi que ce soit.

## Le projet

Lumen est le site personnel d'Emmanuel, en ligne sur **lumenveritatis.net**. C'est un espace **privé** : une porte à mot de passe garde toutes les pages, et la base de données n'accepte que son compte Google. Le site ne s'adresse à aucun public et ne le fera pas : rien ne se publie, rien ne se partage, rien ne s'optimise pour les moteurs de recherche.

Emmanuel ne code pas. Il confie à l'IA tout le développement : elle lit, modifie, teste et dépose elle-même sur ce dépôt. Elle lui parle en langage courant, en français, sans noms de fonctions, de fichiers techniques ni extraits de code, sauf s'il en demande.

Les six pages du site :

- **Accueil** : la croix et l'accès aux autres pages.
- **Bible** : ses deux traductions françaises, la **Chérubin** (équivalence dynamique, traduction par défaut) et la **Séraphin** (littérale). Notes, surlignages, signets, commentaires bibliques affichés dans le texte, recherche de références.
- **Mémoriser** : apprendre des versets, des passages et des fiches par séries à choix multiple, avec une couleur par verset (rouge, jaune, vert) qui est le jugement d'Emmanuel lui-même.
- **Articles** : ses articles, des pages HTML au format question-réponse (faites avec sa skill article-html), rangés en catégories et sections, ouverts en plein écran.
- **Ressources** : livres, diagrammes, cours, parcours d'étude, images, PDF et liens, rangés de la même façon.
- **Commentaires** : l'atelier où il écrit les commentaires bibliques ; « Afficher dans la Bible » les fait paraître dans le texte.

## Où se trouve chaque chose

| Dossier | Contenu |
|---|---|
| `pages/` | Les six pages, une par fichier HTML, chacune avec son propre script. |
| `habillage/` | L'apparence : `lumen-commun.css` (le socle), `commun.css` (ce qui vaut pour toutes les pages, fenêtres et menus compris), puis une feuille par page. |
| `commun/` | Le fonctionnement partagé entre plusieurs pages (fenêtres et menus, rangement en catégories, éditeur des commentaires, choix d'un verset, IA, contrôle qualité, ménage des anciennes copies publiques). La fabrication pose dans chaque page les familles dont elle a besoin. |
| `contenu/` | Les deux Bibles (`bible.json` pour la Chérubin, `bible-seraphin.json` pour la Séraphin), la bibliothèque de départ de Mémoriser, les réglages d'apparence. |
| `racine/` | Les fichiers servis tels quels à la racine du site : panneau de la Bible ouvert depuis les autres pages, service workers (hors ligne), manifestes, icônes, polices. |
| `fabrication/` | Ce qui construit le site : `build-bi.js` assemble les pages, `publication.js` allège et contrôle le résultat. |
| `netlify/edge-functions/` | Le serveur : `porte.js` (le mot de passe du site) et `ia.js` (le seul passage vers l'API Claude). |
| `documentation/` | Les fiches de référence : données, IA, règles de sécurité de la base. |

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
- Ses données (versets, progression, notes, articles, ressources, commentaires) passent avant tout. Une modification qui touche à la forme des données lit l'ancien format, le convertit sans rien perdre, et garde la progression intacte.

## Le langage visuel du site

- **Deux couleurs** : le noir (couleur principale) et la crème `#efe6cf` (l'accent). Aucune couleur vive. Le texte est blanc, à diverses opacités.
- **Polices**, un rôle chacune : Cormorant Garamond pour les grands titres, Literata pour le texte de lecture (Bible, articles, commentaires), EB Garamond pour l'interface (barre, menus, boutons, étiquettes, sous-titres). Les fichiers des polices sont servis par le site lui-même (`racine/polices/`).
- **Boutons** : remplis de crème, texte noir. Plusieurs boutons côte à côte forment un seul bandeau crème arrondi, séparé par de petits traits ; chaque case réagit au survol comme un bouton seul. Deux choix d'égale importance ne s'affichent jamais en bouton crème à côté d'un simple mot.
- **Noms des boutons** : « + » devant ce qui crée (« + Nouvelle catégorie »), « ← Les … » pour revenir, une icône de poubelle seule pour mettre à la corbeille.
- **Rangement** : partout, la catégorie au premier niveau, puis des sections dedans. Toucher une catégorie ou une section ouvre sa propre page, avec un fil d'Ariane.
- **Les ⋯** sont en blanc bien allumé. Ils ouvrent un menu d'actions en forme de feuille : le nom de l'objet en tête, une croix pour fermer, une rangée par action avec son pictogramme dans un petit cadre à coin coupé ; l'action qui jette est en bas, sous un filet, en blanc comme les autres. Sur téléphone, la feuille monte du bas de l'écran.
- **Fenêtres** : panneau noir, filet fin, coin supérieur droit tranché en biais, titre en Cormorant souligné d'un séparateur qui s'éteint vers la droite.
- **Texte** : l'interligne serré de la Bible et des articles est voulu. Le texte de la Bible est justifié aux deux bords, sur téléphone aussi, prose comme vers.
- **Ressources** : des cartes à coin coupé, sans aperçu. **Articles** : des rangées sans cadre, séparées par des filets, avec la question en titre et le début de la réponse dessous.

## Le contenu

Tout contenu écrit pour le site (articles, livres, diagrammes, commentaires) suit ces règles :

- lecture selon la doctrine et la théologie de l'Église catholique ;
- versets cités depuis les Bibles du site, en italique entre guillemets français, la référence en gras après, au format « Genèse 44:2-3 » ;
- un mot de la langue d'origine se présente avec sa langue, sa translittération en italique et le mot français qui le traduit ;
- typographie française : guillemets « », apostrophe courbe, espaces insécables avant « : ; ! ? » ;
- les articles s'adressent à la fois au novice, qui découvre le sujet, et au lecteur confirmé.

Les deux Bibles vivent dans `contenu/`. Une correction du texte se fait dans le fichier de la traduction concernée, et l'autre traduction s'aligne quand Emmanuel le demande. Il tient aussi une copie de ces deux Bibles dans sa skill « bible » : après une modification du texte, l'IA lui livre la skill mise à jour.

## L'IA dans le site

Pour les modèles de langage (LLM), le site n'utilise qu'Anthropic, par l'API Claude, en passant par `netlify/edge-functions/ia.js`. Ce passage vérifie auprès de Google que la demande vient du compte d'Emmanuel, puis relaie la réponse au fil de l'eau. La clé vit dans la variable `ANTHROPIC_API_KEY` de Netlify et nulle part ailleurs. Chaque usage reçoit le modèle au meilleur rapport qualité-prix pour la tâche demandée, choisi dans la gamme du moment : de nouveaux modèles sortent souvent, et le choix se refait quand ils paraissent. C'est Emmanuel qui décide des usages à ajouter. Le détail est dans `documentation/ia.md`.

## Les secrets

Aucun secret n'entre dans le dépôt. Le mot de passe du site (`LUMEN_MOT_DE_PASSE`) et la clé de l'API (`ANTHROPIC_API_KEY`) vivent dans les variables d'environnement de Netlify. La clé Firebase écrite dans les pages est une clé publique par nature : la protection des données vient des règles de sécurité de la base (`documentation/regles-firestore.txt`).

## Les commentaires dans le code

Les commentaires sont la mémoire du projet : ils disent pourquoi une chose est faite ainsi, pour qu'aucune IA ne « corrige » un choix voulu. L'IA les lit avant de modifier un passage.

- Chaque commentaire dit **ce qui est vrai maintenant et pourquoi**, au présent, en français, en quelques lignes. Les mots d'Emmanuel y restent entre guillemets quand ils protègent un choix (« l'interligne serré est voulu »).
- L'histoire (dates, « avant c'était… », récits de bugs) vit dans les messages de dépôt sur GitHub, pas dans le code.
- Quand l'IA change le code, elle met à jour le commentaire qui l'accompagne dans le même mouvement ; quand une chose disparaît, son commentaire disparaît avec elle. Un commentaire ne contredit jamais le code.
- Un commentaire qui répète ce que le code dit clairement n'a pas lieu d'être.

La fabrication retire les commentaires du site envoyé au navigateur.

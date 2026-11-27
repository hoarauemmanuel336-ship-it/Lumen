# Rapport d'écriture : 59-05-s « Les images saintes » (lettre s)

Fichier livré : `/home/claude/eglise/redaction/59-05-s.html` (272 Ko de contenu ; parties dans `redaction/parts/59-05-s/`).

## Ce qui a été fait
- 12 leçons, 72 exercices de leçon (6 par leçon, niveaux 1 à 3) et un bilan de 6 exercices croisés : 78 exercices en tout. 100 citations bibliques, toutes tirées de la Chérubin et contrôlées par `verifier.py`.
- Chaque élément de la commande a sa place :
  1. L'interdit d'Exode 20:4-5 et ses deux raisons (idolâtrie, Dieu non représenté) ; numérotation du Décalogue.
  2. Les chérubins de l'arche, les images du Temple, le serpent de bronze (et Ézékias).
  3. L'Incarnation, fondement des images (Colossiens 1:15 ; CEC 1159-1161).
  4. Les premiers siècles et Grégoire le Grand (lettre à Serenus, l'image livre des illettrés).
  5. La crise iconoclaste à partir de 726-730 (grec *eikonoklastès*), Hiéreia, arguments iconoclastes.
  6. Saint Jean Damascène et ses *Discours*.
  7. Nicée II (787) : la définition, son autorité, sa réception en Occident.
  8. L'honneur passe au modèle (Basile, *Sur le Saint-Esprit* 18, 45), culte relatif, Thomas d'Aquin.
  9. La seconde crise (815-843), Théodore Studite, le triomphe de l'Orthodoxie.
  10. L'icône dans la tradition orientale, fenêtre ouverte sur le mystère.
  11. Les réformateurs du XVIe siècle et le décret de Trente (1563).
  12. L'art sacré selon *Sacrosanctum concilium*, chapitre VII.
- Ordre : la leçon sur Grégoire le Grand (599-600) est placée avant la crise byzantine, pour suivre la chronologie et pour que les leçons byzantines puissent s'y référer ; le reste suit l'ordre de la commande.
- Ajouts nécessaires pour comprendre : numérotation du Décalogue (accusation fréquente), Doura-Europos, art des catacombes, réserves anciennes (Elvire, Eusèbe, Épiphane), *Libri Carolini* et Francfort, Théodore Studite (argument de la circonscription), canons 1188-1189.
- Degrés d'autorité marqués : de foi (Nicée II : représentation du Christ, légitimité et nature de la vénération) ; usage approuvé (encens, lumières, baiser) ; discipline (nombre, place, style) ; opinion d'école (latrie relative chez Thomas) ; questions de convenance (images du Père et de la Trinité).
- Les réformateurs sont présentés en distinguant Luther de Karlstadt, Zwingli et Calvin, et les raisons réformées sont exposées dans leur forme la plus forte (principe régulateur, Jean 4:24, Heidelberg q. 98) avant la réponse catholique.
- Liens : vers les cours du même fichier par `#ouverture-d`, `#ouverture-r`, `#ouverture-i`, `#ouverture-l` ; vers d'autres blocs déjà écrits (36 Fils Image, 45 Chalcédoine, 24 Jean Damascène, 28 Nicée II, 31 Zwingli, Calvin, décrets de Trente, 63 SC et art sacré, 66 Églises orientales catholiques). `outils/liens.py` : 0 lien à revoir.
- Passage humaniser fait en mode fichier, sur les parties : contrastes « pas X, mais Y » non nécessaires reformulés, formules de clôture répétées (« La question du début reçoit sa réponse ») supprimées ou variées, quelques mots fétiches retirés (« en outre », « en réalité », « décisif », « frappant », « redoutable », « subtil »). Les contrastes qui corrigent une croyance réelle du lecteur (image et personne, vénération et adoration) sont gardés.

## Contrôles
- `verifier.py` : aucune erreur, sauf 20 signalements de tutoiement, tous faux : citations du commandement (« Tu ne te feras pas d'idole ») et paroles prêtées à des personnages (« Si tu peins le Christ… »).
- Assemblage d'essai (`/tmp/59-05-s-essai.html`) : réussi, 1 cours, 12 leçons.
- Pas de zone `<libre>` : aucun contrôle visuel nécessaire.

## Incertitudes
- La recherche web était épuisée dès le début. Vérifications faites par WebFetch, qui ne rend que des résumés et des citations courtes : CEC 1159-1162 et 2129-2132, SC 122-130, *Duodecimum saeculum*, Nicée II (Tanner), Trente XXV (Waterworth), Basile 18, 45, Thomas III q. 25 a. 3, lettres de Grégoire à Serenus, canons 1186-1189, Catholic Encyclopedia (Iconoclasme, Jean Damascène).
- Ce qui n'a pas pu être vérifié est paraphrasé sans guillemets. Les phrases latines de Grégoire, de Trente et d'Elvire, ainsi que la phrase grecque de Basile, sont données de mémoire. Détail de chaque point dans `doutes.md`, section 59-05-s.
- Chronologie de 843 : la Catholic Encyclopedia date la restauration de 842 ; le cours suit la date courante, le 11 mars 843, que donne aussi la commande.

# Écrire les cours du parcours

Cette fiche réunit ce qu'une IA doit savoir pour écrire, pour le site, les cours du parcours « La foi catholique ». Elle vient s'ajouter à la skill cours-html d'Emmanuel, qui dit comment un cours se compose, et aux règles de contenu du guide (`CLAUDE.md`, « Le contenu ») : doctrine catholique, versets de la Chérubin, mots de la langue d'origine, typographie française.

## La commande

- Le parcours compte dix-huit blocs, cent cinq thèmes et neuf cent trente sujets. **Un fichier de cours par thème**, qui réunit **un cours par sujet**, dans l'ordre du parcours.
- C'est Emmanuel qui choisit le bloc suivant ; les blocs s'écrivent donc dans le désordre.
- Pour chaque sujet, la liste « ce que tu y apprends » du parcours est la commande : elle est définitive et complète, et le cours la traite tout entière.
- Le texte de chaque cours passe par la skill humaniser.
- Les cours ne parlent ni de copier ni d'enregistrer (le site n'a pas ces boutons), et leurs introductions ne disent pas qu'ils sont faits « pour les débutants et les avancés ».

## Les renvois et les liens

Un renvoi ne sert qu'à mener vers ce qui aide à comprendre : une définition, une démonstration, un sujet traité à fond ailleurs. Les liens restent rares (Emmanuel : « il faut pas surcharger »). Tout renvoi vers un autre bloc devient un lien, posé au moment où le cours s'écrit :

- vers un endroit du même fichier : `#ancre` ;
- vers un autre fichier de cours déjà écrit : `fichier.html#ancre` (l'ancre `ouverture-{lettre}` ouvre un cours à son début) ;
- vers un sujet dont le cours n'est pas encore écrit : `#sujet:{clé du sujet}`, la clé étant celle du parcours (par exemple `revelation.dei-verbum`). Le site ouvre le cours dès qu'il existe et, en attendant, dit qu'il n'est pas encore écrit.

Quand un nouveau cours s'écrit, l'IA relit les cours déjà faits qui en parlent et y pose, en arrière, les liens qui manquaient ou qui attendaient ce cours.

## Les versets de base de Mémoriser

Chaque bloc écrit reçoit sa section dans `contenu/memoriser.json` : une catégorie par thème, avec seulement les versets qui valent d'être sus par cœur, chacun avec sa note « pourquoi l'apprendre », passée par la skill humaniser. Pas de nombre fixe par thème ; ce qui sert surtout à comprendre reste dans les cours. Un même verset peut revenir dans plusieurs blocs.

## Mettre un cours en ligne

1. Inscrire chaque sujet traité dans `parcours/cours.json` (clé du sujet → `fichier.html#ouverture-{lettre}`).
2. Refaire le sommaire avec `node fabrication/cours-sommaire.js` suivi des fichiers.
3. Envoyer les fichiers au coffre par le robot, espèce « cours » (mode d'emploi dans `donnees.md`).
4. Déposer `cours.json`, le sommaire et `memoriser.json` sur `main`.

Comme tout ce qui change ce que voient les lecteurs, l'envoi et le dépôt attendent le « dépose-le » d'Emmanuel ; un changement de contenu ne demande pas de captures d'écran.

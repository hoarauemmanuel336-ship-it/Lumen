# La méditation du jour écrite par Claude

La méditation du jour paraît à minuit, heure de La Réunion. Deux plumes peuvent l'écrire :

- **Claude, sur l'abonnement d'Emmanuel**, par une tâche programmée qui tourne chaque soir avant 22 h et prépare la méditation du lendemain (Emmanuel : « que ça soit toi qui le fasse au lieu de l'API ») ;
- **l'API Claude**, par la fabrique du site (`netlify/functions/meditation-fabrique.mjs`), qui prend le relais tout seul quand la méditation préparée manque : abonnement épuisé, tâche qui n'a pas tourné ou qui a échoué.

À 22 h, la fabrique cherche dans le coffre le fichier du lendemain. Quand la tâche l'y a rangé, elle le fait seulement lire par la voix ElevenLabs ; sinon, elle l'écrit elle-même par l'API, puis le fait lire. Une méditation paraît toujours avec sa voix.

## Ce que fait la tâche programmée

La tâche suit ces étapes, dans l'ordre. Elle travaille dans un clone du dépôt, sans rien changer à `main`, et agit seule : Emmanuel l'a autorisée à envoyer sa méditation au coffre sans attendre son accord.

1. **Le jour.** Elle calcule la date du lendemain à La Réunion (fuseau `Indian/Reunion`), au format AAAA-MM-JJ.

2. **Le journal.** Elle pousse une branche `demande/meditation-AAAA-MM-JJ` qui porte `demande/demande.json` :
   `{"espece": "meditation", "titres": ["journal", "reglages", "AAAA-MM-JJ"]}`.
   Le robot du coffre dépose sur la même branche, dans `recu/`, les fichiers trouvés et `recu/fiches.json`. La tâche attend son passage, une à trois minutes, en relisant la branche.
   - Si `reglages.json` dit `"pause": true`, les méditations sont en pause : la tâche supprime sa branche et s'arrête.
   - Si `reglages.json` donne au jour visé `"reprise"` ou `"prolonge"`, ce jour n'a pas de méditation à lui : la tâche supprime sa branche et s'arrête.
   - Si le fichier du lendemain est déjà là, la méditation existe : la tâche supprime sa branche et s'arrête.

3. **L'écriture.** La consigne est celle que suit l'API, à la lettre : la fonction `consigne()` de `netlify/functions/meditation-fabrique.mjs`, avec le journal reçu (titres et résumés des méditations parues), puis les règles d'écriture d'Emmanuel (`ia/instructions.md`). Le texte lu compte entre 3 000 et 4 000 signes. Chaque verset cité se prend mot pour mot dans la Chérubin (`contenu/bible.json`, ou la skill bible). La tâche écrit un brouillon `brouillon.json` :
   `{"date", "titre", "sujet", "resume", "texte_lu", "texte_ecrit"}`, avec les formes décrites dans la consigne (texte lu écrit comme il se prononce, avec ses indications de jeu entre crochets ; texte affiché avec *italique*, **gras** et paragraphes séparés par une ligne vide).

4. **Humaniser.** La tâche relit le brouillon avec la skill humaniser (`ia/humaniser.md`, la copie que garde le dépôt), en suivant la fonction `consigneRelecture()` de la fabrique : les deux textes restent le même texte, les versets restent mot pour mot.

5. **La mise en forme.** `node fabrication/meditation-prepare.js brouillon.json` donne au texte la typographie du site, vérifie la longueur, chaque citation contre la Chérubin et que le texte affiché dit mot pour mot ce que dit la voix, et écrit `envoi/AAAA-MM-JJ.json` et `envoi/envoi.json`. Une faute signalée se corrige dans le brouillon, puis la commande se relance.

6. **L'envoi.** La tâche pousse une branche `envoi/meditation-AAAA-MM-JJ` qui porte le dossier `envoi/`. Le robot range la méditation dans `meditations/` du coffre, puis supprime la branche. Il la refuse si le jour a déjà sa méditation : celle de l'API n'est jamais remplacée.

7. **Le ménage.** La tâche supprime sa branche `demande/…`.

## Ce qui reste à la fabrique du site

La voix, le moment où chaque mot est dit, l'entrée au journal, la parution à minuit, la pause et la reprise après pause, le ménage des méditations de plus de trente jours : tout cela reste à la fabrique et à l'horloge (`netlify/functions/`), quelle que soit la plume.

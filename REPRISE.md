# Reprendre le travail sur le bloc « La doctrine sociale de l'Église »

Ce dossier est la sauvegarde du travail en cours (branche GitHub `sauvegarde/doctrine-sociale` du dépôt Lumen, branche à part qui ne touche ni `main` ni le coffre). Si la séance s'est arrêtée (limite d'utilisation, coupure), une nouvelle séance reprend ainsi :

1. Cloner le dépôt Lumen, lire `CLAUDE.md` et `documentation/cours.md`.
2. Récupérer ce dossier : `git fetch --depth=1 origin sauvegarde/doctrine-sociale` puis `git --work-tree=/home/claude/travail checkout FETCH_HEAD -- .` (ou `git archive FETCH_HEAD | tar -x -C /home/claude/travail`).
3. Les chemins des skills cités dans `consigne.md` peuvent changer d'une séance à l'autre : les corriger si besoin (`/root/.claude/skills/synced/…`).
4. Pour chaque cours (`commandes/*.txt`, 30 en tout) :
   - `redaction/{code}.html` existe et le contrôle (`python3 outils/verifier.py`) passe → cours écrit ;
   - sinon, s'il existe `redaction/parts/{code}/`, relancer un rédacteur sur ce code : la consigne (§ 9, « Reprise ») lui dit de continuer à partir des leçons déjà écrites ;
   - sinon, lancer un rédacteur neuf avec le message : « Lisez d'abord en entier la consigne commune /home/claude/travail/consigne.md et suivez-la à la lettre. Vous écrivez le cours de code {code} (fichier {nn}, lettre {x}) : sa commande est /home/claude/travail/commandes/{code}.txt. Livrez /home/claude/travail/redaction/{code}.html. »
5. Ensuite : relecture de fond de chaque cours, assemblage des trois fichiers (`91-…`, `92-…`, `93-…`, plan dans `plan.json`), liens en arrière dans les anciens cours (pistes dans `contextes-anciens.txt`), versets de base de Mémoriser, puis préparation de la mise en ligne, qui attend le « dépose-le ».

Lancer la sauvegarde pendant le travail : `bash outils/sauvegarder.sh boucle 600`.

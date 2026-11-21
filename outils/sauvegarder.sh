#!/bin/bash
# Sauvegarde le dossier de travail des cours sur la branche GitHub
# « sauvegarde/peres » (branche à part, sans les fichiers du site :
# elle ne touche ni main, ni le coffre, ni ce que voient les lecteurs).
# Usage : bash sauvegarder.sh            (une fois)
#         bash sauvegarder.sh boucle 600 (toutes les 600 secondes)
REPO=/home/claude/lumen
TRAVAIL=/home/claude/peres
BRANCHE=sauvegarde/peres
une_fois() {
  cd "$TRAVAIL" || return
  G="git --git-dir=$REPO/.git --work-tree=$TRAVAIL"
  export GIT_INDEX_FILE=/tmp/sauvegarde-index
  rm -f "$GIT_INDEX_FILE"
  $G add -A -- . ':!captures' 2>/dev/null
  arbre=$($G write-tree)
  unset GIT_INDEX_FILE
  parent=$($G rev-parse -q --verify "refs/heads/$BRANCHE")
  if [ -n "$parent" ] && [ "$($G rev-parse "$parent^{tree}")" = "$arbre" ]; then
    echo "$(date +%H:%M) rien de nouveau"; return
  fi
  msg="Sauvegarde du travail sur les cours, $(date '+%d/%m %H:%M')"
  if [ -n "$parent" ]; then c=$($G commit-tree "$arbre" -p "$parent" -m "$msg"); else c=$($G commit-tree "$arbre" -m "$msg"); fi
  $G update-ref "refs/heads/$BRANCHE" "$c"
  $G -c push.negotiate=true push -q -f origin "refs/heads/$BRANCHE:refs/heads/$BRANCHE" 2>&1 | grep -v -i negotiat
  echo "$(date +%H:%M) sauvegardé ($(find "$TRAVAIL/redaction" -type f | wc -l) fichiers de rédaction)"
}
if [ "$1" = boucle ]; then
  while true; do une_fois; sleep "${2:-600}"; done
else
  une_fois
fi

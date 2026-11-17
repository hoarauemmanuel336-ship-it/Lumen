#!/bin/bash
# Assemble les trois fichiers de cours du bloc à partir des cours relus.
# Usage : bash assembler-bloc.sh [91|92|93 ...]
set -e
T=/home/claude/travail
MOTEUR=/root/.claude/skills/synced/0ecbfa39-bf16-4489-b54b-5c2efbbd424c_4e9301a7-4fe1-44a2-b731-c02e9c9e697f/cours-html/moteur/assembler.py
SORTIE=/home/claude/lumen/parcours/cours
declare -A NOM=( [91]=91-les-principes-de-la-doctrine-sociale.html [92]=92-les-grands-textes-de-la-doctrine-sociale.html [93]=93-les-domaines-de-la-vie-sociale.html )
declare -A SUJET=( [91]="Les principes de la doctrine sociale" [92]="Les grands textes de la doctrine sociale" [93]="Les domaines de la vie sociale" )
mkdir -p $T/assemblage
for n in ${@:-91 92 93}; do
  c=$T/assemblage/$n-contenu.html
  { echo "<fichier sujet=\"${SUJET[$n]}\">"; for f in $T/redaction/$n-*.html; do cat "$f"; echo; done; echo "</fichier>"; } > $c
  python3 $MOTEUR $c $SORTIE/${NOM[$n]}
done

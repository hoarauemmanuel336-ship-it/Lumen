#!/bin/bash
# Assemble les sept fichiers de cours du bloc à partir des cours relus.
# Usage : bash assembler-bloc.sh [63 64 ...]
set -e
T=/home/claude/histoire
MOTEUR=/root/.claude/skills/synced/0ecbfa39-bf16-4489-b54b-5c2efbbd424c_4e9301a7-4fe1-44a2-b731-c02e9c9e697f/cours-html/moteur/assembler.py
SORTIE=/home/claude/lumen/parcours/cours
mkdir -p $T/assemblage
for n in ${@:-27 28 29 30 31 32 33}; do
  nom=$(python3 -c "import json,sys;d=json.load(open('$T/themes.json'));print([k for k in d if k.startswith('$n-')][0])")
  sujet=$(python3 -c "import json,sys;d=json.load(open('$T/themes.json'));print(d['$nom'])")
  c=$T/assemblage/$n-contenu.html
  { echo "<fichier sujet=\"$sujet\">"; for f in $T/redaction/$n-*.html; do cat "$f"; echo; done; echo "</fichier>"; } > $c
  python3 $MOTEUR $c $SORTIE/$nom
done

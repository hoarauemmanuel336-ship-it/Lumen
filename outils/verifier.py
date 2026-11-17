#!/usr/bin/env python3
"""Contrôle d'un contenu de cours (format cours-html) pour le parcours Lumen.

Usage : python3 verifier.py contenu.html [autres.html ...]

Vérifie :
- chaque citation « <i>texte</i> » <b>Référence</b> contre la Chérubin (texte mot pour mot,
  coupures permises par « … » ; casse et ponctuation de bord tolérées) ;
- les références bibliques citées sans texte ((Matthieu 5:3) nu) ;
- le tutoiement résiduel ;
- les tirets cadratins / demi-cadratins ;
- les mots interdits (copier, enregistrer, débutants/avancés) ;
- l'équilibre des balises principales.
"""
import re, sys, os, glob, unicodedata

BIBLE = '/root/.claude/skills/synced/0ecbfa39-bf16-4489-b54b-5c2efbbd424c_4e9301a7-4fe1-44a2-b731-c02e9c9e697f/bible/cherubin'

def norm(s):
    s = unicodedata.normalize('NFC', s)
    s = re.sub(r'<[^>]+>', '', s)
    s = s.replace('’', "'").replace('ʼ', "'").replace(' ', ' ').replace(' ', ' ')
    for q in '“”«»"‘':
        s = s.replace(q, ' ')
    s = re.sub(r'\s+', ' ', s)
    s = re.sub(r' ([,.;:!?)])', r'\1', s)
    return s.strip().lower()

versets = {}
livres = set()
for f in sorted(glob.glob(os.path.join(BIBLE, '*.txt'))):
    for ligne in open(f, encoding='utf-8'):
        m = re.match(r'^(.+?) (\d+):(\d+) (.*)$', ligne.rstrip('\n'))
        if m and not ligne.startswith('##'):
            livre, ch, v, txt = m.group(1), int(m.group(2)), int(m.group(3)), m.group(4)
            versets[(livre, ch, v)] = txt
            livres.add(livre)

def texte_ref(ref):
    ref = ref.replace(' ', ' ').replace(' ', ' ').strip()
    m = re.match(r'^(.+?) (\d+):(\d+)(?:-(\d+)(?::(\d+))?)?$', ref)
    if not m:
        return None
    livre, ch, v1 = m.group(1), int(m.group(2)), int(m.group(3))
    if livre not in livres:
        return None
    if m.group(5):
        ch2, v2 = int(m.group(4)), int(m.group(5))
    elif m.group(4):
        ch2, v2 = ch, int(m.group(4))
    else:
        ch2, v2 = ch, v1
    out = []
    c, v = ch, v1
    while (c, v) <= (ch2, v2):
        if (livre, c, v) in versets:
            out.append(versets[(livre, c, v)])
            v += 1
        else:
            c, v = c + 1, 1
            if c > ch2 + 1:
                break
    return ' '.join(out) if out else None

BORD = ' .,;:!?"\'()…-–—'

def verifier(chemin):
    t = open(chemin, encoding='utf-8').read()
    pb = []
    def ligne(pos):
        return t.count('\n', 0, pos) + 1
    # citations
    n = 0
    for m in re.finditer(r'«\s*<i>(.*?)</i>\s*»\s*<b>([^<]+)</b>', t, re.S):
        n += 1
        cit, ref = m.group(1), m.group(2)
        src = texte_ref(ref)
        if src is None:
            pb.append((ligne(m.start()), 'RÉFÉRENCE INCONNUE', ref))
            continue
        ns = norm(src)
        for morceau in re.split(r'\[?…\]?|\.\.\.', cit):
            mo = norm(morceau).strip(BORD)
            if len(mo) < 2:
                continue
            if mo not in ns:
                pb.append((ligne(m.start()), 'TEXTE ≠ CHÉRUBIN', f'{ref} | cité : {norm(morceau)[:160]} | Chérubin : {src[:200]}'))
                break
    # <b>Ref</b> sans citation juste avant
    for m in re.finditer(r'<b>((?:[1-3] )?[A-ZÉÈ][a-zéèêëïîôûç\- ]+ \d+:\d+(?:-\d+(?::\d+)?)?)</b>', t):
        avant = t[max(0, m.start() - 12):m.start()]
        if '»' not in avant:
            pb.append((ligne(m.start()), 'RÉFÉRENCE EN GRAS SANS CITATION JUSTE AVANT', m.group(1)))
    # références nues entre parenthèses
    for m in re.finditer(r'\(((?:[1-3] )?[A-ZÉ][a-zéèêëïîôûç\-]+(?: [a-zéèê\-]+)? \d+:\d+(?:-\d+)?)[^)]*\)', t):
        livre = re.match(r'(.+?) \d', m.group(1)).group(1)
        if livre in livres:
            pb.append((ligne(m.start()), 'VERSET INVOQUÉ SANS SON TEXTE', m.group(0)[:80]))
    # tutoiement
    for m in re.finditer(r"(?<![\w’'-])(tu|toi|ton|ta|tes|te|t’|t')(?![\w-])", t, re.I):
        ctx = t[max(0, m.start() - 50):m.end() + 50].replace('\n', ' ')
        # exclure l'intérieur des citations bibliques en italique
        avant = t[:m.start()]
        if avant.rfind('<i>') > avant.rfind('</i>'):
            continue
        pb.append((ligne(m.start()), 'TUTOIEMENT ?', ctx))
    for m in re.finditer(r'[—–]', t):
        ctx = t[max(0, m.start() - 40):m.end() + 40].replace('\n', ' ')
        pb.append((ligne(m.start()), 'TIRET', ctx))
    for m in re.finditer(r"(?i)(comme le montrer|le montrera|nous y reviendr|on y reviendra|on le verra|nous le verrons|nous verrons|verra plus loin|déjà été cité|déjà cité|présenté ailleurs|comme on l.a vu)", t):
        pb.append((ligne(m.start()), 'ANNONCE OU RAPPEL DE PLACE', t[max(0, m.start() - 60):m.end() + 40].replace('\n', ' ')))
    for mot in ['copier', 'copiez', 'enregistrer', 'enregistrez', 'débutant', 'avancés']:
        for m in re.finditer(mot, t, re.I):
            pb.append((ligne(m.start()), 'MOT À ÉVITER', t[max(0, m.start() - 50):m.end() + 50].replace('\n', ' ')))
    for bal in ['cours', 'lecon', 'partie', 'exercice', 'corrige', 'verifie', 'reponse', 'definition', 'exemple', 'attention', 'retenir', 'essentiel', 'mots-cles', 'exercices', 'autoevaluation', 'bilan', 'introduction', 'commencer', 'objectifs', 'prerequis', 'table', 'cartes', 'reperes']:
        o = len(re.findall(r'<%s[\s>]' % bal, t))
        f = len(re.findall(r'</%s>' % bal, t))
        if o != f:
            pb.append((0, 'BALISES', f'<{bal}> ouvertes {o}, fermées {f}'))
    print(f'== {chemin} : {n} citations bibliques, {len(t)//1000} Ko, {len(re.findall("<lecon ", t))} leçons, {len(re.findall("<exercice ", t))} exercices')
    for p in pb:
        print(f'  ligne {p[0]} · {p[1]} · {p[2]}')
    if not pb:
        print('  aucun problème trouvé')
    return pb

if __name__ == '__main__':
    tot = 0
    for c in sys.argv[1:]:
        tot += len(verifier(c))
    sys.exit(1 if tot else 0)

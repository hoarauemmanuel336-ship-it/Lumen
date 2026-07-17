#!/usr/bin/env python3
# Verification for the EN-CHÉRUBIN era (Emmanuel's English translation).
# Checks, for each slug: FR refs exist in FR Chérubin + FR quotes match text;
# EN refs exist in EN Chérubin at the SAME number (identity, no versifDouay) +
# EN quotes match text; h2 parity FR/EN; HTML tag balance.
# Usage: python3 tools/verify_ch.py <slug> [<slug> ...]
import json, re, sys, unicodedata
FR = json.load(open('/root/lumen/content/bible.json'))
EN = json.load(open('/root/lumen/content/bible-en-cherubin.json'))
ART = {a['slug']: a for a in json.load(open('/root/lumen/content/articles.json'))}
def norm(s):
    s = unicodedata.normalize('NFD', s.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9]', '', s)
ALIAS = {'psalm':'psaumes','psalms':'psaumes','psaume':'psaumes','song of songs':'cantique-des-cantiques',
         'canticle':'cantique-des-cantiques','sirach':'ecclesiastique','ecclesiasticus':'ecclesiastique',
         'revelation':'apocalypse','acts':'actes','song of solomon':'cantique-des-cantiques'}
def idx(bib):
    L = {}
    for l in bib['livres']:
        L[norm(l['nom'])] = l['slug']; L[norm(l['slug'])] = l['slug']
    D = {d['slug']: {c['n']: {v['v']: v['t'] for v in c['versets']} for c in d['chapitres']} for d in bib['data']}
    return L, D
frL, frD = idx(FR); enL, enD = idx(EN)
def book(L, name):
    key = name.strip().lower()
    if key in ALIAS: return L.get(norm(ALIAS[key]))
    return L.get(norm(name))
def words(s):
    s = unicodedata.normalize('NFD', s.lower()); s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.findall(r'[a-z]+', s)
refre = re.compile(r'<span class="ref">([^<]+)</span>')
quotere = re.compile(r'<em>[«“]\s*([^<]*?)\s*[»”]</em>\s*<span class="ref">([^<]+)</span>')
parsere = re.compile(r'^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$')
def vtext(L, D, ref):
    pm = parsere.match(ref.strip())
    if not pm: return None
    bk, ch, v1, v2 = pm.group(1), int(pm.group(2)), int(pm.group(3)), pm.group(4)
    v2 = int(v2) if v2 else v1
    slug = book(L, bk)
    if not slug or slug not in D or ch not in D[slug]: return None
    out = [D[slug][ch][v] for v in range(v1, v2 + 1) if v in D[slug][ch]]
    return ' '.join(out) if out else None
def check(slug):
    a = ART.get(slug)
    if not a: print(f'{slug}: [article introuvable]'); return False
    probs = []
    for lang, key, L, D in [('FR', 'contenu_fr', frL, frD), ('EN', 'contenu_en', enL, enD)]:
        # ref existence
        for ref in refre.findall(a[key]):
            if vtext(L, D, ref) is None:
                probs.append((lang + '-ref-absente', ref))
        # quote conformity
        for m in quotere.finditer(a[key]):
            quote, ref = m.group(1), m.group(2).strip()
            vt = vtext(L, D, ref)
            if vt is None:
                continue  # already flagged above
            qw = [w for w in words(quote) if len(w) > 3]
            vw = set(words(vt))
            missing = [w for w in qw if w not in vw]
            ratio = 1 - (len(missing) / max(len(qw), 1))
            if ratio < 0.80:
                probs.append((lang + '-texte', f'{ref} {ratio:.0%} manque={missing[:6]}'))
    # h2 parity + balance
    hf = a['contenu_fr'].count('<h2>'); he = a['contenu_en'].count('<h2>')
    par = 'OK' if hf == he else f'MISMATCH {hf}/{he}'
    for tag in ['p', 'em', 'h2']:
        for k in ['contenu_fr', 'contenu_en']:
            o = a[k].count('<' + tag + '>'); c = a[k].count('</' + tag + '>')
            if o != c: probs.append((k + '-bal-' + tag, f'{o}/{c}'))
    ok = (len(probs) == 0 and hf == he)
    print(f'{slug}: h2 FR{hf}/EN{he} {par}; problems={len(probs)}')
    for p in probs: print('   ', p)
    return ok
allok = True
for s in sys.argv[1:]:
    allok &= check(s)
print('ALL OK (Chérubin FR+EN)' if allok else 'DEFECTS PRESENT')

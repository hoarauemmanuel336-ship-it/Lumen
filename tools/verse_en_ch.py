#!/usr/bin/env python3
# Pull EN CHÉRUBIN verse text (Emmanuel's English translation).
# SAME versification as the FR Chérubin (identity) — no Douay offset.
# Usage: python3 tools/verse_en_ch.py "Matthew 28:19" "Acts 15:28"
import json, sys, re, unicodedata
EN = json.load(open('/root/lumen/content/bible-en-cherubin.json'))
def norm(s):
    s = unicodedata.normalize('NFD', s.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9]', '', s)
ALIAS = {'psalm':'psaumes','psalms':'psaumes','song of songs':'cantique-des-cantiques',
         'canticle':'cantique-des-cantiques','sirach':'ecclesiastique','ecclesiasticus':'ecclesiastique',
         'revelation':'apocalypse','acts':'actes','song of solomon':'cantique-des-cantiques'}
livres = {}
for l in EN['livres']:
    livres[norm(l['nom'])] = l['slug']; livres[norm(l['slug'])] = l['slug']
data = {d['slug']: d for d in EN['data']}
def book(name):
    key = name.strip().lower()
    if key in ALIAS: return norm(ALIAS[key])
    return norm(name)
def get(bk, ch, vs):
    slug = livres.get(book(bk))
    if not slug: return f'[book not found: {bk}]'
    d = data.get(slug)
    if not d: return f'[data not found: {slug}]'
    for c in d['chapitres']:
        if c['n'] == ch:
            out = [f"{v['v']}. {v['t']}" for v in c['versets'] if vs[0] <= v['v'] <= vs[1]]
            return '\n'.join(out) if out else f'[verses {vs} not in ch {ch}]'
    return f'[chapter {ch} not found]'
for arg in sys.argv[1:]:
    m = re.match(r'^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$', arg)
    bk, ch, v1, v2 = m.group(1), int(m.group(2)), int(m.group(3)), m.group(4)
    v2 = int(v2) if v2 else v1
    print('### EN-CH', arg); print(get(bk, ch, (v1, v2)))

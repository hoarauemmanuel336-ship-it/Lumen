import json,sys,re,unicodedata
EN=json.load(open('/root/lumen/content/bible-en.json'))
def norm(s):
    s=unicodedata.normalize('NFD',s.lower())
    s=''.join(c for c in s if unicodedata.category(c)!='Mn')
    return re.sub(r'[^a-z0-9]','',s)
livres={}
for l in EN['livres']:
    livres[norm(l['nom'])]=l['slug']; livres[norm(l['slug'])]=l['slug']
data={d['slug']:d for d in EN['data']}
def get(book,ch,vs):
    slug=livres.get(norm(book))
    if not slug: return f'[book not found: {book}]'
    d=data.get(slug)
    if not d: return f'[data not found: {slug}]'
    for c in d['chapitres']:
        if c['n']==ch:
            out=[f"{v['v']}. {v['t']}" for v in c['versets'] if vs[0]<=v['v']<=vs[1]]
            return '\n'.join(out) if out else f'[verses {vs} not in ch {ch}]'
    return f'[chapter {ch} not found]'
for arg in sys.argv[1:]:
    m=re.match(r'^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$',arg)
    book,ch,v1,v2=m.group(1),int(m.group(2)),int(m.group(3)),m.group(4)
    v2=int(v2) if v2 else v1
    print('### EN',arg); print(get(book,ch,(v1,v2)))

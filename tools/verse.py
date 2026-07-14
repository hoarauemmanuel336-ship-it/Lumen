import json,sys,re,unicodedata
FR=json.load(open('/root/lumen/content/bible.json'))
EN=json.load(open('/root/lumen/content/bible-en.json'))
def norm(s):
    s=unicodedata.normalize('NFD',s.lower())
    s=''.join(c for c in s if unicodedata.category(c)!='Mn')
    return re.sub(r'[^a-z0-9]','',s)
def build(bib):
    livres={}
    for l in bib['livres']:
        livres[norm(l['nom'])]=l['slug']
        livres[norm(l['slug'])]=l['slug']
    data={d['slug']:d for d in bib['data']}
    return livres,data
frL,frD=build(FR)
enL,enD=build(EN)
def get(bib_l,bib_d,book,ch,vs):
    slug=bib_l.get(norm(book))
    if not slug: return f'[book not found: {book}]'
    d=bib_d.get(slug)
    if not d: return f'[data not found: {slug}]'
    for c in d['chapitres']:
        if c['n']==ch:
            out=[]
            for v in c['versets']:
                if vs[0]<=v['v']<=vs[1]:
                    out.append(f"{v['v']}. {v['t']}")
            return '\n'.join(out) if out else f'[verses {vs} not found in ch {ch}]'
    return f'[chapter {ch} not found]'
# args: book ch v1[-v2]  (FR)
def parse(arg):
    m=re.match(r'^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$',arg)
    book,ch,v1,v2=m.group(1),int(m.group(2)),int(m.group(3)),m.group(4)
    v2=int(v2) if v2 else v1
    return book,ch,(v1,v2)
for arg in sys.argv[1:]:
    book,ch,vs=parse(arg)
    print('### FR',arg)
    print(get(frL,frD,book,ch,vs))

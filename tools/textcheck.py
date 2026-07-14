import json,re,sys,unicodedata
FR=json.load(open('/root/lumen/content/bible.json'))
EN=json.load(open('/root/lumen/content/bible-en.json'))
ART=json.load(open('/root/lumen/content/articles.json'))
arts={a['slug']:a for a in ART}
exec(open('/home/claude/validate.py').read().split("refre=re.compile")[0])  # reuse idx, norm, versifDouay, EN_ALIAS/BK, enbook
# rebuild indices with text
def idx2(bib):
    L={}
    for l in bib['livres']:
        L[norm(l['nom'])]=l['slug']; L[norm(l['slug'])]=l['slug']
    D={d['slug']:{c['n']:{v['v']:v['t'] for v in c['versets']} for c in d['chapitres']} for d in bib['data']}
    return L,D
frL,frD=idx2(FR); enL,enD=idx2(EN)
def words(s):
    s=unicodedata.normalize('NFD',s.lower()); s=''.join(c for c in s if unicodedata.category(c)!='Mn')
    return re.findall(r'[a-z]+',s)
# find <em>«...»</em> <span>ref</span>  and  <em>“...”</em>
pat=re.compile(r'<em>[«“]\s*([^<]*?)\s*[»”]</em>\s*<span class="ref">([^<]+)</span>')
parsere=re.compile(r'^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$')
def verset_text(L,D,book,ch,v1,v2,lang):
    slug=L.get(norm(book))
    if not slug and lang=='fr': slug=L.get({'psaume':'psaumes'}.get(norm(book),''))
    if not slug and lang=='en': slug=L.get(enbook(book))
    if not slug: return None
    txts=[]
    for vv in range(v1,v2+1):
        if lang=='en':
            bk=EN_BK.get(book.lower(),book); dch,dv=versifDouay(bk,ch,vv)
        else:
            dch,dv=ch,vv
        t=D.get(slug,{}).get(dch,{}).get(dv)
        if t: txts.append(t)
    return ' '.join(txts)
def check(slug):
    a=arts[slug]; issues=0
    for lang,key,L,D in [('fr','contenu_fr',frL,frD),('en','contenu_en',enL,enD)]:
        for m in pat.finditer(a[key]):
            quote,ref=m.group(1),m.group(2).strip()
            pm=parsere.match(ref)
            if not pm: continue
            book,ch,v1,v2=pm.group(1),int(pm.group(2)),int(pm.group(3)),pm.group(4); v2=int(v2) if v2 else v1
            vt=verset_text(L,D,book,ch,v1,v2,lang)
            if vt is None: print(f'  [{lang}] {ref}: BOOK/VERSE NOT FOUND'); issues+=1; continue
            qw=[w for w in words(quote) if len(w)>3]
            vw=set(words(vt))
            missing=[w for w in qw if w not in vw]
            ratio = 1-(len(missing)/max(len(qw),1))
            if ratio<0.80:
                print(f'  [{lang}] {ref}: {ratio:.0%} match. MISSING={missing[:8]}')
                print(f'         quote: {quote[:90]}')
                print(f'         verse: {vt[:110]}')
                issues+=1
    print(f'{slug}: text-conformity issues={issues}')
for s in sys.argv[1:]: check(s)

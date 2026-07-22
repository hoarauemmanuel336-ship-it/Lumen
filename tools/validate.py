import json,re,sys,unicodedata
FR=json.load(open('/root/lumen/content/bible.json'))
EN=json.load(open('/root/lumen/content/bible-en.json'))
ART=json.load(open('/root/lumen/content/articles.json'))
arts={a['slug']:a for a in ART}
def norm(s):
    s=unicodedata.normalize('NFD',s.lower())
    s=''.join(c for c in s if unicodedata.category(c)!='Mn')
    return re.sub(r'[^a-z0-9]','',s)
def idx(bib):
    L={}
    for l in bib['livres']:
        L[norm(l['nom'])]=l['slug']; L[norm(l['slug'])]=l['slug']
    D={d['slug']:{c['n']:{v['v']:v['t'] for v in c['versets']} for c in d['chapitres']} for d in bib['data']}
    return L,D
frL,frD=idx(FR); enL,enD=idx(EN)
# EN book-name aliases (FR-master ref names as they appear in EN spans) -> normalized FR slug used in EN bible? EN bible uses same slug scheme as FR.
EN_ALIAS={'psalm':'psaumes','psalms':'psaumes','sirach':'ecclesiastique','ecclesiasticus':'ecclesiastique',
 'revelation':'apocalypse','song of songs':'cantique-des-cantiques','1 samuel':'1-samuel','2 samuel':'2-samuel'}
def enbook(name):
    n=name.strip()
    key=n.lower()
    if key in EN_ALIAS: return norm(EN_ALIAS[key])
    return norm(n)
def versifDouay(bk,ch,v):
    if bk in ('Psalm','Psalms'):
        if ch<=8: return ch,v
        if ch==9: return 9,v
        if ch==10: return 9,v+21
        if ch==11: return 10,v+1
        if ch<=113: return ch-1,v
        if ch==114: return 113,v
        if ch==115: return 113,v+8
        if ch==116: return (114,v) if v<=9 else (115,v)
        if ch<=146: return ch-1,v
        if ch==147: return (146,v) if v<=11 else (147,v)
        if ch==150 and v==6: return 150,5
        return ch,v
    if bk=='Joel':
        if ch==3: return 2,v+27
        if ch==4: return 3,v
    if bk=='Isaiah':
        if ch==8 and v==23: return 9,1
        if ch==9: return 9,v+1
        if ch==63 and v==19: return 64,1
        if ch==64: return 64,v+1
    if bk=='Zechariah' and ch==2: return (1,v+17) if v<=4 else (2,v-4)
    if bk=='Malachi' and ch==3 and v>=19: return 4,v-18
    if bk=='Numbers' and ch==17: return (16,v+35) if v<=15 else (17,v-15)
    if bk=='John' and ch==6 and v>=51: return 6,v+1
    if bk=='John' and ch==11 and v==57: return 11,56
    if bk=='Hosea' and ch==2: return (1,v+9) if v<=2 else (2,v-2)
    if bk=='Hosea' and ch==12: return (11,12) if v==1 else (12,v-1)
    if bk=='Haggai' and ch==2: return 2,v+1
    if bk=='Deuteronomy' and ch==29: return 29,v+1
    if bk=='Deuteronomy' and ch==5 and v>=18: return 5,v+3
    if bk=='Nahum' and ch==2: return (1,15) if v==1 else (2,v-1)
    if bk=='Micah':
        if ch==4 and v==14: return 5,1
        if ch==5: return 5,v+1
    if bk=='Matthew' and ch==17 and v>=15: return 17,v-1
    if bk=='Mark' and ch==9: return (8,39) if v==1 else (9,v-1)
    if bk=='Ecclesiastes':
        if ch==6 and v==12: return 7,1
        if ch==7: return 7,v+1
    if bk in ('Sirach','Ecclesiasticus'):
        if ch==10 and v in (12,13): return 10,v+2
    if bk=='3 John' and v==15: return ch,14
    if bk=='Judges' and ch==21 and v==25: return 21,24
    return ch,v
# EN span book name -> versifDouay bk token (English canonical used in build-bi switch)
EN_BK={'psalms':'Psalms','psalm':'Psalm','sirach':'Sirach','ecclesiasticus':'Ecclesiasticus','joel':'Joel','isaiah':'Isaiah',
 'zechariah':'Zechariah','malachi':'Malachi','numbers':'Numbers','john':'John','hosea':'Hosea','haggai':'Haggai',
 'deuteronomy':'Deuteronomy','nahum':'Nahum','micah':'Micah','matthew':'Matthew','mark':'Mark','ecclesiastes':'Ecclesiastes',
 '3 john':'3 John','judges':'Judges'}
refre=re.compile(r'<span class="ref">([^<]+)</span>')
parsere=re.compile(r'^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$')
def check(slug):
    a=arts[slug]; probs=[]
    # FR refs
    for m in refre.finditer(a['contenu_fr']):
        ref=m.group(1).strip()
        pm=parsere.match(ref)
        if not pm: probs.append(('FR-parse',ref)); continue
        book,ch,v1,v2=pm.group(1),int(pm.group(2)),int(pm.group(3)),pm.group(4)
        v2=int(v2) if v2 else v1
        slugb=frL.get(norm(book)) or frL.get({'psaume':'psaumes'}.get(norm(book),''))
        if not slugb: probs.append(('FR-book',ref)); continue
        for vv in range(v1,v2+1):
            if ch not in frD[slugb] or vv not in frD[slugb][ch]:
                probs.append(('FR-missing',f'{ref} @v{vv}'))
    # EN refs
    for m in refre.finditer(a['contenu_en']):
        ref=m.group(1).strip()
        pm=parsere.match(ref)
        if not pm: probs.append(('EN-parse',ref)); continue
        book,ch,v1,v2=pm.group(1),int(pm.group(2)),int(pm.group(3)),pm.group(4)
        v2=int(v2) if v2 else v1
        bk=EN_BK.get(book.lower(),book)  # canonical for versifDouay
        slugb=enL.get(enbook(book))
        if not slugb: probs.append(('EN-book',ref)); continue
        for vv in range(v1,v2+1):
            dch,dv=versifDouay(bk,ch,vv)
            if dch not in enD[slugb] or dv not in enD[slugb][dch]:
                probs.append(('EN-missing',f'{ref} @v{vv}->{dch}:{dv}'))
    # balance
    def bal(h,tag):
        return h.count('<'+tag+'>')+ (h.count('<'+tag+' ') if tag=='span' else 0) , h.count('</'+tag+'>')
    for tag in ['p','em','h2']:
        o=a['contenu_fr'].count('<'+tag+'>'); c=a['contenu_fr'].count('</'+tag+'>')
        if o!=c: probs.append(('FR-bal-'+tag,f'{o}/{c}'))
        o=a['contenu_en'].count('<'+tag+'>'); c=a['contenu_en'].count('</'+tag+'>')
        if o!=c: probs.append(('EN-bal-'+tag,f'{o}/{c}'))
    # span balance
    for lang in ['contenu_fr','contenu_en']:
        o=a[lang].count('<span'); c=a[lang].count('</span>')
        if o!=c: probs.append((lang+'-span',f'{o}/{c}'))
    # h2 parity
    hf=a['contenu_fr'].count('<h2>'); he=a['contenu_en'].count('<h2>')
    par = 'OK' if hf==he else f'MISMATCH {hf}/{he}'
    print(f'{slug}: h2 FR{hf}/EN{he} {par}; problems={len(probs)}')
    for p in probs: print('   ',p)
    return len(probs)==0 and hf==he
allok=True
for s in sys.argv[1:]:
    allok &= check(s)
print('ALL OK' if allok else 'DEFECTS PRESENT')

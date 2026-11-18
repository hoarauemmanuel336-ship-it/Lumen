def typo(s):
    s = re.sub(r' ([:;!?»])', '\u00a0\\1', s)
    return re.sub(r'« ', '«\u00a0', s)

def categories():
    out = []
    for cid, nom, vs in CATEGORIES:
        out.append({'id': cid, 'name': {'fr': nom}, 'bloc': BLOC, 'kind': 'v',
                    'verses': [{'id': ident(r), 'fr': {'ref': r, 'text': texte(r)}, 'note': typo(n)} for r, n in vs]})
    return out

if __name__ == '__main__':
    cats = categories()
    if len(sys.argv) > 1:
        p = sys.argv[1]
        d = json.load(open(p))
        ids = {c['id'] for c in cats}
        d['categories'] = [c for c in d['categories'] if c['id'] not in ids] + cats
        json.dump(d, open(p, 'w'), ensure_ascii=False, indent=1)
        open(p, 'a').write('\n')
        print('ajouté', sum(len(c['verses']) for c in cats), 'versets dans', len(cats), 'catégories')
    else:
        print(json.dumps(cats, ensure_ascii=False, indent=1)[:3000])

"""Wikimedia Commons, pour les images du saint ou de la fête du jour
(documentation/saints.md). Les machines de GitHub joignent Commons ;
l'espace de travail de Claude, non : c'est donc le robot qui cherche et
télécharge, et Claude qui regarde et choisit.
· candidates() : pour la demande « images-saint », les images trouvées par
  chaque recherche, réduites, dans recu/images/, et leur fiche dans
  recu/images.json.
· image() : pour l'envoi « saint », l'image choisie, à une taille de page,
  avec son auteur, sa licence et sa page sur Commons, lus chez Commons
  même (rien de ce qui est crédité ne vient de l'IA).
Seules entrent les images d'une licence libre (domaine public, CC0,
CC BY, CC BY-SA)."""
import html, json, os, re, sys, urllib.parse, urllib.request

API = 'https://commons.wikimedia.org/w/api.php'
AGENT = 'LumenVeritatis/1.0 (https://lumenveritatis.net; lumen974@outlook.com)'
LIBRES = re.compile(r'public domain|^pd|cc0|cc[ -]by', re.I)


def lit(url):
    r = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': AGENT}), timeout=60)
    return r.read()


def texte(v):
    """une valeur de Commons, souvent en HTML, en texte simple"""
    v = re.sub(r'<[^>]+>', ' ', str(v or ''))
    return re.sub(r'\s+', ' ', html.unescape(v)).strip()


def fiche(p):
    ii = (p.get('imageinfo') or [{}])[0]
    m = ii.get('extmetadata') or {}
    val = lambda k: texte((m.get(k) or {}).get('value', ''))
    return {
        'titre': p.get('title', ''),
        'mime': ii.get('mime', ''),
        'largeur': ii.get('width', 0), 'hauteur': ii.get('height', 0),
        'miniature': ii.get('thumburl', ''),
        'page': ii.get('descriptionurl', ''),
        'licence': val('LicenseShortName'),
        'auteur': val('Artist')[:200],
        'objet': val('ObjectName')[:200],
        'description': val('ImageDescription')[:500],
        'date': val('DateTimeOriginal')[:80],
        'categories': val('Categories')[:500],
    }


def interroge(params):
    q = dict(params, format='json', prop='imageinfo', iiprop='url|size|mime|extmetadata')
    d = json.loads(lit(API + '?' + urllib.parse.urlencode(q)))
    return list(((d.get('query') or {}).get('pages') or {}).values())


def libre(f):
    return bool(LIBRES.search(f['licence'])) and f['mime'] in ('image/jpeg', 'image/png')


def candidates(recherches, nombre):
    os.makedirs('recu/images', exist_ok=True)
    vues, liste = set(), []
    for r in recherches[:4]:
        pages = interroge({'generator': 'search', 'gsrnamespace': 6, 'gsrsearch': str(r) + ' filetype:bitmap',
                           'gsrlimit': min(max(nombre, 1), 20), 'iiurlwidth': 640})
        pages.sort(key=lambda p: p.get('index', 0))
        for p in pages:
            f = fiche(p)
            if f['titre'] in vues or not libre(f) or min(f['largeur'], f['hauteur']) < 400:
                continue
            vues.add(f['titre'])
            n = len(liste) + 1
            nom = f'{n:02d}' + ('.png' if f['mime'] == 'image/png' else '.jpg')
            try:
                open(os.path.join('recu/images', nom), 'wb').write(lit(f['miniature']))
            except Exception as e:
                print(f'Non téléchargée : {f["titre"]} ({e})')
                continue
            f['fichier'] = 'images/' + nom
            f['recherche'] = r
            liste.append(f)
    json.dump({'espece': 'images-saint', 'recherches': recherches, 'images': liste},
              open('recu/images.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'{len(liste)} images déposées dans recu/images/')


def image(titre, chemin_sans_ext):
    """télécharge l'image choisie, large de 1200 points au plus, et rend sa
    fiche de crédit, ou arrête l'envoi si elle n'est pas libre"""
    if not str(titre).startswith('File:'):
        sys.exit(f'« {titre} » : une image Commons se nomme « File:… ».')
    pages = interroge({'titles': titre, 'iiurlwidth': 1200})
    if not pages or 'missing' in pages[0]:
        sys.exit(f'« {titre} » : introuvable sur Commons.')
    f = fiche(pages[0])
    if not libre(f):
        sys.exit(f'« {titre} » : licence « {f["licence"]} », l’image n’est pas libre.')
    ext = '.png' if f['mime'] == 'image/png' else '.jpg'
    open(chemin_sans_ext + ext, 'wb').write(lit(f['miniature']))
    return ext, {'auteur': f['auteur'], 'licence': f['licence'], 'source': f['page'], 'titre': f['titre']}

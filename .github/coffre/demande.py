"""Le robot de reprise. Lit demande/demande.json et dépose dans recu/,
sur la même branche, les fichiers demandés, décompressés, avec
recu/fiches.json qui dit lesquels ont été trouvés.
· Cours d'Étude (espèce « cours ») : « titres » nomme un fichier ou un
  cours qu'il contient ; le sommaire du dépôt dit lequel.
· Articles (espèce « article ») : « titres » nomme un fichier ou une
  question ; le catalogue du dépôt (articles/articles.json) dit lequel."""
import gzip, json, os, sys
from coffre import recoit

demande = json.load(open('demande/demande.json', encoding='utf-8'))
espece = demande.get('espece', '')
if espece == 'cours':
    sommaire = json.load(open('parcours/cours-sommaire.json', encoding='utf-8'))
    dossier = 'cours'

    def cherche(tl):
        return [n for n in sommaire if n.casefold() == tl or n.casefold() == tl + '.html'] or \
               [n for n, s in sommaire.items() if any(tl in titre.casefold() for titre in s['cours'].values())]
elif espece == 'article':
    articles = json.load(open('articles/articles.json', encoding='utf-8')).get('articles', [])
    dossier = 'articles'

    def cherche(tl):
        return [a['fichier'] for a in articles if a['fichier'].casefold() in (tl, tl + '.html')] or \
               [a['fichier'] for a in articles if tl in a.get('question', '').casefold()]
else:
    sys.exit(f'Espèce inconnue : {espece} (« cours » ou « article »)')

os.makedirs('recu', exist_ok=True)
voulus, introuvables = [], []
for t in demande.get('titres') or []:
    noms = cherche(t.casefold().strip())
    if len(noms) == 1:
        voulus.append(noms[0])
    elif noms:
        introuvables.append(t + ' (plusieurs fichiers : ' + ' ; '.join(noms) + ')')
    else:
        introuvables.append(t)
for n in dict.fromkeys(voulus):
    p = os.path.join('recu', n)
    recoit(f'{dossier}/{n}', p)
    b = open(p, 'rb').read()
    if b[:2] == b'\x1f\x8b':  # un fichier rangé compressé redevient lisible
        open(p, 'wb').write(gzip.decompress(b))
    print(f'Reçu : recu/{n}')
json.dump({'espece': espece, 'fichiers': list(dict.fromkeys(voulus)), 'introuvables': introuvables},
          open('recu/fiches.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
if introuvables:
    print('Introuvables : ' + ' | '.join(introuvables))

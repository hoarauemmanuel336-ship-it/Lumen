"""Le robot de reprise. Lit demande/demande.json, retrouve les pages
demandées grâce à l'index du coffre (index/<espèce>.json, que la page
tient à jour), et les dépose dans recu/ sur la branche, avec
recu/fiches.json qui dit, pour chacune, son identifiant (à mettre dans
« remplace » au renvoi), son titre et son rangement.
Pour les cours d'Étude (espèce « cours »), « titres » nomme un fichier
ou un cours qu'il contient ; le sommaire du dépôt dit lequel."""
import json, os, sys, tempfile
from coffre import recoit, liste, ESPECES

demande = json.load(open('demande/demande.json', encoding='utf-8'))
espece = demande.get('espece', 'ressources')
if espece not in ESPECES and espece != 'cours':
    sys.exit(f'Espèce inconnue : {espece}')
if espece == 'cours':
    sommaire = json.load(open('parcours/cours-sommaire.json', encoding='utf-8'))
    os.makedirs('recu', exist_ok=True)
    voulus, introuvables = [], []
    for t in (demande.get('titres') or []) + (demande.get('ids') or []):
        tl = t.casefold().strip()
        noms = [n for n in sommaire if n.casefold() == tl or n.casefold() == tl + '.html'] or \
               [n for n, s in sommaire.items() if any(tl in titre.casefold() for titre in s['cours'].values())]
        if len(noms) == 1:
            voulus.append(noms[0])
        elif noms:
            introuvables.append(t + ' (plusieurs fichiers : ' + ' ; '.join(noms) + ')')
        else:
            introuvables.append(t)
    for n in dict.fromkeys(voulus):
        recoit(f'cours/{n}', os.path.join('recu', n))
        print(f'Reçu : recu/{n}')
    json.dump({'espece': 'cours', 'fichiers': list(dict.fromkeys(voulus)), 'introuvables': introuvables},
              open('recu/fiches.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    sys.exit(0)
R = ESPECES[espece]
with tempfile.TemporaryDirectory() as d:
    recoit(f'index/{espece}.json', os.path.join(d, 'index.json'))
    index = json.load(open(os.path.join(d, 'index.json'), encoding='utf-8')).get('elements', [])

voulus, introuvables = [], []
for i in demande.get('ids') or []:
    e = next((x for x in index if x['id'] == i), None)
    (voulus.append(e) if e else introuvables.append(i))
for t in demande.get('titres') or []:
    tl = t.casefold().strip()
    e = [x for x in index if x['titre'].casefold().strip() == tl] or [x for x in index if tl in x['titre'].casefold()]
    if len(e) == 1:
        voulus.append(e[0])
    elif e:
        introuvables.append(t + ' (plusieurs pages : ' + ' ; '.join(x['titre'] for x in e[:8]) + ')')
    else:
        introuvables.append(t)

os.makedirs('recu', exist_ok=True)
fiches = []
for e in voulus:
    if e['type'] == 'diagramme':
        l = sorted(liste(f"{R['code']}/{e['id']}/"), key=lambda o: o['date'])
        nom = e['id'] + '.html'
    else:
        l = sorted(liste(f"{R['medias']}/{e['media']}/"), key=lambda o: o['date']) if e.get('media') else []
        nom = e['id'] + '-' + (l[-1]['cle'].split('/')[-1] if l else 'fichier')
    if not l:
        introuvables.append(e['titre'] + ' (aucun fichier dans le coffre)')
        continue
    recoit(l[-1]['cle'], os.path.join('recu', nom))
    fiches.append(dict(e, fichier=nom))
    print(f"Reçu : {e['titre']} → recu/{nom}")

json.dump({'espece': espece, 'fiches': fiches, 'introuvables': introuvables},
          open('recu/fiches.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
if introuvables:
    print('Introuvables : ' + ' | '.join(introuvables))

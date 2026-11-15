"""Le robot d'envoi. Lit envoi/envoi.json, envoie chaque fichier du
dossier envoi/ dans le coffre (rangement arrivees/), puis écrit pour
chaque espèce une liste « à ranger » (a-ranger/<espèce>/<date>.json).
La page Ressources ou Articles la lit à sa prochaine ouverture et en
fait des fiches : seule la session d'Emmanuel écrit dans Firestore.
Les cours d'Étude (espèce « cours ») vont droit à leur place, cours/,
une fois vérifiés contre le sommaire que porte la branche
(parcours/cours-sommaire.json) : même empreinte, mêmes cours."""
import hashlib, json, mimetypes, os, re, sys, tempfile, time, unicodedata
from coffre import envoie, ESPECES

DOSSIER = 'envoi'


def nom_sur(n):
    n = unicodedata.normalize('NFD', n)
    n = ''.join(c for c in n if not unicodedata.combining(c))
    return re.sub(r'[^A-Za-z0-9._-]+', '-', n).strip('-')[-80:] or 'fichier'


def type_de(nom, mime):
    if re.search(r'\.html?$', nom, re.I):
        return 'diagramme'
    if mime.startswith('image/'):
        return 'image'
    if mime == 'application/pdf':
        return 'pdf'
    sys.exit(f'« {nom} » : seules les pages HTML, les images et les PDF se déposent.')


def cours_verifie(f, nom, sommaire):
    """un cours n'entre dans le coffre que s'il est celui que décrit le
    sommaire : même poids, même empreinte, et chaque cours annoncé présent"""
    if not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9._-]{0,120}\.html', nom):
        sys.exit(f'« {nom} » : nom de fichier de cours refusé (lettres, chiffres, points, tirets).')
    s = sommaire.get(nom)
    if not s:
        sys.exit(f'« {nom} » n’est pas au sommaire des cours : lancez fabrication/cours-sommaire.js.')
    octets = open(f, 'rb').read()
    if len(octets) != s['taille'] or hashlib.sha256(octets).hexdigest() != s['empreinte']:
        sys.exit(f'« {nom} » ne correspond pas au sommaire : refaites le sommaire avec ce fichier.')
    texte = octets.decode('utf-8')
    for lettre in s['cours']:
        if f'<cours lettre="{lettre}"' not in texte:
            sys.exit(f'« {nom} » : le cours « {lettre} » annoncé au sommaire manque.')


def main():
    chemin = os.path.join(DOSSIER, 'envoi.json')
    if not os.path.exists(chemin):
        sys.exit('envoi/envoi.json manque : le robot ne sait pas quoi envoyer.')
    demande = json.load(open(chemin, encoding='utf-8'))
    entrees = demande.get('entrees') or []
    if not entrees:
        sys.exit('envoi.json ne contient aucune entrée.')
    date = time.strftime('%Y%m%d-%H%M%S', time.gmtime()) + '-' + os.environ.get('GITHUB_RUN_ID', '0')
    listes = {}
    cours = [e for e in entrees if e.get('espece') == 'cours']
    if cours:
        sommaire = json.load(open('parcours/cours-sommaire.json', encoding='utf-8'))
        # tout se vérifie avant le premier envoi : un lot refusé n'entre pas à moitié
        for e in cours:
            nom = os.path.basename(e.get('fichier', ''))
            f = os.path.join(DOSSIER, e.get('fichier', ''))
            if not os.path.isfile(f):
                sys.exit(f'Fichier introuvable dans envoi/ : « {nom} »')
            cours_verifie(f, nom, sommaire)
        for e in cours:
            nom = os.path.basename(e['fichier'])
            envoie(os.path.join(DOSSIER, e['fichier']), f'cours/{nom}', 'text/html; charset=utf-8')
            print(f'Cours : {nom} → cours/{nom}')
    for i, e in enumerate(entrees):
        if e.get('espece') == 'cours':
            continue
        nom = e.get('fichier', '')
        f = os.path.join(DOSSIER, nom)
        if not nom or not os.path.isfile(f):
            sys.exit(f'Fichier introuvable dans envoi/ : « {nom} »')
        espece = e.get('espece', 'ressources')
        if espece not in ESPECES:
            sys.exit(f'Espèce inconnue pour « {nom} » : {espece}')
        mime = mimetypes.guess_type(nom)[0] or 'application/octet-stream'
        if re.search(r'\.html?$', nom, re.I):
            mime = 'text/html; charset=utf-8'
        type_ = type_de(nom, mime)
        cle = f'arrivees/{date}/{i:03d}-{nom_sur(nom)}'
        envoie(f, cle, mime)
        x = {'fichier': cle, 'type': type_, 'nom': nom, 'mime': mime.split(';')[0], 'taille': os.path.getsize(f)}
        for k in ('titre', 'marque', 'rubrique', 'remplace'):
            if e.get(k) not in (None, '', []):
                x[k] = e[k]
        listes.setdefault(espece, []).append(x)
        print(f'Envoyé : {nom} → {cle}')
    for espece, l in listes.items():
        with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False, encoding='utf-8') as t:
            json.dump({'cree': date, 'entrees': l}, t, ensure_ascii=False, indent=1)
        envoie(t.name, f'a-ranger/{espece}/{date}.json', 'application/json; charset=utf-8')
        print(f'Liste à ranger : a-ranger/{espece}/{date}.json ({len(l)} élément(s))')


main()

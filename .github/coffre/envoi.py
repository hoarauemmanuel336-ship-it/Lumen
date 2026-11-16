"""Le robot d'envoi. Lit envoi/envoi.json et range chaque fichier du
dossier envoi/ à sa place dans le coffre, compressé : le serveur du site
les sert tels quels au navigateur, deux à trois fois moins lourds (voir
netlify/edge-functions/fichiers.js).
· Les cours d'Étude (espèce « cours ») vont dans cours/, une fois vérifiés
  contre le sommaire que porte la branche (parcours/cours-sommaire.json) :
  même empreinte, mêmes cours.
· Les articles (espèce « article ») vont dans articles/, une fois vérifiés
  contre le catalogue que porte la branche (articles/articles.json) : le
  fichier y est inscrit.
Tout se vérifie avant le premier envoi : un lot refusé n'entre pas à
moitié."""
import gzip, hashlib, json, os, re, sys, tempfile
from coffre import envoie

DOSSIER = 'envoi'
NOM = r'[A-Za-z0-9][A-Za-z0-9._-]{0,120}\.html'


def cours_verifie(f, nom, sommaire):
    """un cours n'entre dans le coffre que s'il est celui que décrit le
    sommaire : même poids, même empreinte, et chaque cours annoncé présent"""
    if not re.fullmatch(NOM, nom):
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


def article_verifie(nom, catalogue):
    """un article n'entre dans le coffre que s'il est inscrit au catalogue"""
    if not re.fullmatch(NOM, nom):
        sys.exit(f'« {nom} » : nom de fichier d’article refusé (lettres, chiffres, points, tirets).')
    if not any(a.get('fichier') == nom for a in catalogue.get('articles', [])):
        sys.exit(f'« {nom} » n’est pas inscrit au catalogue des articles (articles/articles.json).')


def main():
    chemin = os.path.join(DOSSIER, 'envoi.json')
    if not os.path.exists(chemin):
        sys.exit('envoi/envoi.json manque : le robot ne sait pas quoi envoyer.')
    entrees = json.load(open(chemin, encoding='utf-8')).get('entrees') or []
    if not entrees:
        sys.exit('envoi.json ne contient aucune entrée.')
    sommaire = catalogue = None
    places = []
    for e in entrees:
        nom = os.path.basename(e.get('fichier', ''))
        f = os.path.join(DOSSIER, e.get('fichier', ''))
        if not nom or not os.path.isfile(f):
            sys.exit(f'Fichier introuvable dans envoi/ : « {nom} »')
        espece = e.get('espece')
        if espece == 'cours':
            sommaire = sommaire or json.load(open('parcours/cours-sommaire.json', encoding='utf-8'))
            cours_verifie(f, nom, sommaire)
            places.append((f, f'cours/{nom}'))
        elif espece == 'article':
            catalogue = catalogue or json.load(open('articles/articles.json', encoding='utf-8'))
            article_verifie(nom, catalogue)
            places.append((f, f'articles/{nom}'))
        else:
            sys.exit(f'Espèce inconnue pour « {nom} » : {espece} (« cours » ou « article »)')
    for f, cle in places:
        with tempfile.NamedTemporaryFile(suffix='.gz', delete=False) as t:
            t.write(gzip.compress(open(f, 'rb').read(), 9))
        envoie(t.name, cle, 'application/gzip')
        print(f'{os.path.basename(f)} → {cle} (compressé)')


main()

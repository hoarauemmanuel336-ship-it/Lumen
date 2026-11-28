"""Le robot d'envoi. Lit envoi/envoi.json et range chaque fichier du
dossier envoi/ à sa place dans le coffre, compressé : le serveur du site
les sert tels quels au navigateur, deux à trois fois moins lourds (voir
netlify/edge-functions/fichiers.js).
· Les cours d'Étude (espèce « cours ») vont dans cours/, une fois vérifiés
  contre le sommaire que porte la branche (parcours/cours-sommaire.json) :
  même empreinte, mêmes cours. Chacun est aussi découpé en morceaux, un
  par cours (« 17-les-prophetes.m.html », fabrication/cours-decoupe.js),
  rangés à côté de lui : Étude n'ouvre que le morceau du cours visé.
· Une entrée « decoupe », sans fichier, redécoupe tous les cours du
  sommaire déjà rangés dans le coffre (après un changement du découpage).
· Les articles (espèce « article ») vont dans articles/, une fois vérifiés
  contre le catalogue que porte la branche (articles/articles.json) : le
  fichier y est inscrit.
· La méditation du jour écrite par la tâche programmée de Claude (espèce
  « meditation ») va dans meditations/, telle quelle : un fichier
  AAAA-MM-JJ.json, pour aujourd'hui ou demain à La Réunion, avec son titre,
  son sujet, son résumé et ses deux textes. Elle n'entre que si le jour
  n'a pas déjà sa méditation (celle de l'API n'est jamais remplacée).
  Avec « prolonger », elle reste aussi le lendemain sur l'accueil, et ce
  lendemain n'a pas de méditation à lui (meditations/reglages.json). Un
  jour de reprise après pause qui reçoit sa méditation perd sa reprise.
  Avec « texte », seul le texte affiché d'une méditation déjà lue change.
  La fabrique du site la trouve et n'a plus qu'à la faire lire
  (documentation/meditation.md).
· Une entrée « meditation-efface », sans fichier, efface du coffre les
  méditations des jours qu'elle nomme (« jours »), leur voix et leurs
  essais compris, et les retire du journal : elle sert quand Emmanuel
  demande de supprimer des méditations parues.
· Une entrée « meditation-reglages », sans fichier, remet les méditations
  en route (« pause » : false) ou les met en pause, comme l'interrupteur de
  « Mon compte ».
Tout se vérifie avant le premier envoi : un lot refusé n'entre pas à
moitié."""
import datetime, glob, gzip, hashlib, json, os, re, subprocess, sys, tempfile
from coffre import efface, envoie, existe, recoit

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


def morceaux(f, nom):
    """les morceaux d'un fichier de cours, un par cours, prêts à ranger à
    côté de lui ; le découpage vérifie lui-même que chaque morceau porte son
    cours entier et toutes les affirmations « Je sais… » du thème"""
    d = tempfile.mkdtemp()
    a = os.path.join(d, nom)
    if os.path.abspath(f) != os.path.abspath(a):
        open(a, 'wb').write(open(f, 'rb').read())
    sortie = os.path.join(d, 'morceaux')
    r = subprocess.run(['node', 'fabrication/cours-decoupe.js', sortie, a], capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit(f'« {nom} » : le découpage a échoué.\n' + r.stderr)
    print(r.stdout.strip())
    return [(m, f'cours/{os.path.basename(m)}') for m in sorted(glob.glob(os.path.join(sortie, '*.html')))]


def redecoupe(sommaire):
    """tous les cours du sommaire déjà rangés dans le coffre, redécoupés"""
    places = []
    for nom, s in sommaire.items():
        if not existe(f'cours/{nom}'):
            print(f'{nom} : pas dans le coffre, laissé de côté')
            continue
        f = os.path.join(tempfile.mkdtemp(), nom)
        recoit(f'cours/{nom}', f)
        octets = open(f, 'rb').read()
        if octets[:2] == b'\x1f\x8b':
            octets = gzip.decompress(octets)
            open(f, 'wb').write(octets)
        if hashlib.sha256(octets).hexdigest() != s['empreinte']:
            sys.exit(f'« {nom} » : le fichier du coffre ne correspond pas au sommaire de la branche.')
        places += morceaux(f, nom)
    return places


def article_verifie(nom, catalogue):
    """un article n'entre dans le coffre que s'il est inscrit au catalogue"""
    if not re.fullmatch(NOM, nom):
        sys.exit(f'« {nom} » : nom de fichier d’article refusé (lettres, chiffres, points, tirets).')
    if not any(a.get('fichier') == nom for a in catalogue.get('articles', [])):
        sys.exit(f'« {nom} » n’est pas inscrit au catalogue des articles (articles/articles.json).')


def texte_corrige(f, nom):
    """« texte » corrige seulement le texte affiché d'une méditation déjà lue :
    la voix, sa durée et le moment de chaque mot restent ceux du coffre, et le
    texte lu ne change pas, si bien que la voix ne se paie pas une seconde fois"""
    if not re.fullmatch(r'\d{4}-\d{2}-\d{2}\.json', nom) or not existe(f'meditations/{nom}'):
        sys.exit(f'« {nom} » : il n’y a pas de méditation à corriger.')
    a = os.path.join(tempfile.mkdtemp(), nom)
    recoit(f'meditations/{nom}', a)
    ancien, d = json.load(open(a, encoding='utf-8')), json.load(open(f, encoding='utf-8'))
    for k in ('date', 'texteLu', 'audio', 'duree', 'voix'):
        if d.get(k) != ancien.get(k):
            sys.exit(f'« {nom} » : seul le texte affiché se corrige ainsi (« {k} » a changé).')
    if len(d.get('temps') or []) != len(str(d.get('texte', '')).split('\n\n')):
        sys.exit(f'« {nom} » : le moment de chaque mot ne suit pas le texte affiché.')


def meditation_verifiee(f, nom, remplacer=False, relire=False):
    """une méditation préparée n'entre que complète, pour aujourd'hui ou
    demain, et si le jour n'a pas déjà la sienne. « remplacer » corrige une
    méditation que la voix n'a pas encore lue. « relire » remplace même une
    méditation déjà lue, et la voix se paie alors une seconde fois : il ne
    sert que quand Emmanuel demande de refaire la méditation du jour"""
    m = re.fullmatch(r'(\d{4}-\d{2}-\d{2})\.json', nom)
    if not m:
        sys.exit(f'« {nom} » : une méditation se nomme AAAA-MM-JJ.json.')
    reunion = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=4))).date()
    if m.group(1) not in (reunion.isoformat(), (reunion + datetime.timedelta(days=1)).isoformat()):
        sys.exit(f'« {nom} » : la méditation doit être celle d’aujourd’hui ou de demain (La Réunion).')
    d = json.load(open(f, encoding='utf-8'))
    for k in ('titre', 'sujet', 'resume', 'texte', 'texteLu'):
        if not str(d.get(k, '')).strip():
            sys.exit(f'« {nom} » : il manque « {k} ».')
    if d.get('date') != m.group(1):
        sys.exit(f'« {nom} » : la date du fichier et celle de son contenu diffèrent.')
    if len(d['texteLu']) > 4300:
        sys.exit(f'« {nom} » : le texte lu dépasse 4 300 signes.')
    if existe(f'meditations/{nom}'):
        if not remplacer:
            sys.exit(f'« {nom} » : ce jour a déjà sa méditation, elle reste telle quelle.')
        a = os.path.join(tempfile.mkdtemp(), nom)
        recoit(f'meditations/{nom}', a)
        if json.load(open(a, encoding='utf-8')).get('audio') and not relire:
            sys.exit(f'« {nom} » : la voix a déjà lu cette méditation, elle reste telle quelle.')
    d['audio'] = False
    d['duree'] = 0
    json.dump(d, open(f, 'w', encoding='utf-8'), ensure_ascii=False)


def main():
    chemin = os.path.join(DOSSIER, 'envoi.json')
    if not os.path.exists(chemin):
        sys.exit('envoi/envoi.json manque : le robot ne sait pas quoi envoyer.')
    entrees = json.load(open(chemin, encoding='utf-8')).get('entrees') or []
    if not entrees:
        sys.exit('envoi.json ne contient aucune entrée.')
    sommaire = catalogue = prolonge = pause = None
    jours = []
    places = []
    effaces = []
    for e in entrees:
        if e.get('espece') == 'meditation-efface':
            for j in e.get('jours') or []:
                if not re.fullmatch(r'\d{4}-\d{2}-\d{2}', str(j)):
                    sys.exit(f'« {j} » : un jour s’écrit AAAA-MM-JJ.')
                effaces.append(j)
            continue
        if e.get('espece') == 'meditation-reglages':
            pause = bool(e.get('pause'))
            continue
        if e.get('espece') == 'decoupe':
            sommaire = sommaire or json.load(open('parcours/cours-sommaire.json', encoding='utf-8'))
            places += redecoupe(sommaire)
            continue
        nom = os.path.basename(e.get('fichier', ''))
        f = os.path.join(DOSSIER, e.get('fichier', ''))
        if not nom or not os.path.isfile(f):
            sys.exit(f'Fichier introuvable dans envoi/ : « {nom} »')
        espece = e.get('espece')
        if espece == 'cours':
            sommaire = sommaire or json.load(open('parcours/cours-sommaire.json', encoding='utf-8'))
            cours_verifie(f, nom, sommaire)
            places.append((f, f'cours/{nom}'))
            places += morceaux(f, nom)
        elif espece == 'article':
            catalogue = catalogue or json.load(open('articles/articles.json', encoding='utf-8'))
            article_verifie(nom, catalogue)
            places.append((f, f'articles/{nom}'))
        elif espece == 'meditation' and e.get('texte'):
            texte_corrige(f, nom)
            places.append((f, f'meditations/{nom}'))
        elif espece == 'meditation':
            meditation_verifiee(f, nom, bool(e.get('remplacer') or e.get('relire')), bool(e.get('relire')))
            places.append((f, f'meditations/{nom}'))
            jours.append(nom[:10])
            if e.get('prolonger'):
                prolonge = (datetime.date.fromisoformat(nom[:10]) + datetime.timedelta(days=1)).isoformat()
        else:
            sys.exit(f'Espèce inconnue pour « {nom} » : {espece} (« cours », « decoupe », « article » ou « meditation »)')
    for j in effaces:
        for cle in (f'meditations/{j}.json', f'meditations/{j}.mp3', f'meditations/essais/{j}.json'):
            if existe(cle):
                efface(cle)
                print(f'{cle} effacé')
    if effaces and existe('meditations/journal.json'):
        jl = os.path.join(tempfile.mkdtemp(), 'journal.json')
        recoit('meditations/journal.json', jl)
        journal = json.load(open(jl, encoding='utf-8'))
        journal['meditations'] = [m for m in journal.get('meditations', []) if m.get('date') not in effaces]
        json.dump(journal, open(jl, 'w', encoding='utf-8'), ensure_ascii=False)
        envoie(jl, 'meditations/journal.json', 'application/json')
        print('journal.json : ' + ', '.join(effaces) + ' retirés')
    if jours or pause is not None:
        # un jour de reprise après pause n'a pas de méditation à lui : si
        # Claude lui en donne une, la reprise de ce jour s'efface, sans quoi
        # la fabrique ne la ferait jamais lire. Avec « prolonger », la
        # méditation reste aussi le lendemain : ce jour-là n'a pas la sienne.
        r = os.path.join(tempfile.mkdtemp(), 'reglages.json')
        reglages = {}
        if existe('meditations/reglages.json'):
            recoit('meditations/reglages.json', r)
            reglages = json.load(open(r, encoding='utf-8'))
        avant = dict(reglages)
        if reglages.get('reprise') in jours:
            del reglages['reprise']
        if pause is not None:
            reglages['pause'] = pause
        if prolonge:
            reglages['prolonge'] = prolonge
        if reglages != avant:
            json.dump(reglages, open(r, 'w', encoding='utf-8'), ensure_ascii=False)
            places.append((r, 'meditations/reglages.json'))
    for f, cle in places:
        if cle.startswith('meditations/'):
            envoie(f, cle, 'application/json')
            print(f'{os.path.basename(f)} → {cle}')
            continue
        with tempfile.NamedTemporaryFile(suffix='.gz', delete=False) as t:
            t.write(gzip.compress(open(f, 'rb').read(), 9))
        envoie(t.name, cle, 'application/gzip')
        print(f'{os.path.basename(f)} → {cle} (compressé)')


main()

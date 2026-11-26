#!/usr/bin/env python3
"""Vérifie les liens des cours rédigés (redaction/*.html) contre le plan du bloc,
le parcours et les cours déjà en ligne."""
import re, json, glob, os, sys
T = '/home/claude/philo'
plan = json.load(open(f'{T}/plan.json'))
cj = json.load(open('/home/claude/lumen/parcours/cours.json'))
som = json.load(open('/home/claude/lumen/parcours/cours-sommaire.json'))
parc = open('/home/claude/lumen/parcours/la-foi-catholique.html').read()
cles = set(re.findall(r'<sujet cle="([^"]+)"', parc))
lettres = {f: {x for _, x in l} for f, l in plan.items()}
for f, v in som.items():
    lettres[f] = set(v['cours'].keys())
fich_par_num = {f[:2]: f for f in plan}

def lecons(t):
    """lettre -> (nb leçons, {leçon: nb parties}, {leçon: nb exercices})"""
    r = {}
    for c in re.finditer(r'<cours lettre="([a-z])".*?</cours>', t, re.S):
        ls = re.findall(r'<lecon .*?</lecon>', c.group(0), re.S)
        r[c.group(1)] = (len(ls), {i + 1: len(re.findall('<partie ', l)) for i, l in enumerate(ls)},
                         {i + 1: len(re.findall('<exercice ', l)) for i, l in enumerate(ls)})
    return r

pb = 0
fichiers = sys.argv[1:] or sorted(glob.glob(f'{T}/redaction/[0-9]*.html'))
for chemin in fichiers:
    code = os.path.basename(chemin)[:-5]
    num = code[:2]
    fichier = fich_par_num[num]
    t = open(chemin).read()
    moi = lecons(t)
    for m in re.finditer(r'href="([^"]*)"', t):
        h = m.group(1)
        err = None
        if h.startswith('#sujet:'):
            if h[7:] not in cles: err = 'clé de sujet inconnue'
            elif h[7:] in cj: err = f'sujet déjà écrit : utiliser {cj[h[7:]]}'
        elif h.startswith('#'):
            a = h[1:]
            mo = re.match(r'^(ouverture|plan|code|bilan|revision|fiches|glossaire)-([a-z])$', a)
            ml = re.match(r'^([a-z])(\d+)(?:-(ex)?(\d+))?$', a)
            if mo:
                if mo.group(2) not in lettres[fichier]: err = 'lettre inconnue dans ce fichier'
            elif ml:
                x, n = ml.group(1), int(ml.group(2))
                if x not in moi: err = 'leçon d’un autre cours du fichier : viser #ouverture-' + x
                else:
                    nb, parts, exs = moi[x]
                    if n > nb: err = f'leçon {n} inexistante ({nb} leçons)'
                    elif ml.group(4):
                        k = int(ml.group(4))
                        if ml.group(3) and k > exs[n]: err = 'exercice inexistant'
                        if not ml.group(3) and k > parts[n]: err = 'partie inexistante'
            else:
                err = 'ancre inconnue'
        else:
            mf = re.match(r'^([0-9][^#]*\.html)#(.+)$', h)
            if not mf: err = 'lien non reconnu'
            else:
                f2, a2 = mf.groups()
                if f2 not in lettres: err = 'fichier inconnu'
                else:
                    mo = re.match(r'^ouverture-([a-z])$', a2)
                    ml = re.match(r'^([a-z])\d+', a2)
                    x = (mo or ml).group(1) if (mo or ml) else None
                    if x not in lettres[f2]: err = 'lettre inconnue dans ' + f2
                    elif f2 in plan and not mo: err = 'leçon d’un cours du bloc en cours d’écriture : viser #ouverture-'
                    elif f2 == fichier: err = 'même fichier : écrire #' + a2
        if err:
            pb += 1
            print(f'{code} · {h} · {err}')
print('liens à revoir :', pb)

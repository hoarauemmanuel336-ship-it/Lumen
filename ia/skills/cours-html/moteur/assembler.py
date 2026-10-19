#!/usr/bin/env python3
"""Assemble un cours : moteur (gabarit, style, script, polices) + contenu.

Usage :
  python3 assembler.py contenu.html sortie.html
      assemble le contenu avec le moteur en un cours autonome ;
  python3 assembler.py --extraire cours.html contenu.html
      retire d'un cours déjà assemblé son contenu et sa progression, pour
      les reprendre puis réassembler le cours avec le moteur présent.

Au passage, l'assemblage :
  - convertit les balises du contenu écrites en forme courte <x ... /> ;
  - donne une lettre à chaque cours qui n'en porte pas (l pour le premier) ;
  - donne une clé stable à chaque affirmation « Je sais… » qui n'en porte pas,
    et l'écrit dans le contenu, si bien qu'une extraction la retrouve ;
  - remet dans le bloc lv-progression la progression portée par le contenu
    (balise <progression>), ou une progression neuve ;
  - applique la typographie française.
"""
import html, json, pathlib, re, sys, unicodedata

ICI = pathlib.Path(__file__).resolve().parent
BALISES = ('fichier|cours|introduction|lecon|objectifs|prerequis|commencer|partie|definition|exemple|'
           'attention|retenir|reperes|repere|verifie|reponse|cartes|carte|libre|essentiel|mots-cles|mot|'
           'exercices|exercice|corrige|autoevaluation|je-sais|bilan|progression')
ATTRS_TEXTE = r'\b(titre|sous-titre|desc|nom|sujet|question|terme|note)="([^"]*)"'
CLE_OK = re.compile(r'^[A-Za-z0-9._-]{1,80}$')
PROGRES = re.compile(r'(<script type="application/json" id="lv-progression">\n?)(.*?)(\n?</script>)', re.S)


# ── Typographie française ──────────────────────────────────────────────
def typo(texte):
    """Apostrophe courbe, espaces fines insécables devant ; ! ? et dans « »,
    espace insécable devant les deux-points."""
    if re.search(r'&#?\w+;', texte):
        return ''.join(m if re.fullmatch(r'&#?\w+;', m) else typo(m)
                       for m in re.split(r'(&#?\w+;)', texte))
    texte = re.sub(r"(?<=\w)'(?=\w)", '’', texte)
    texte = re.sub(r'[   ]*([;!?])', lambda m: ' ' + m.group(1), texte)
    texte = re.sub(r'(?<=\S)[   ]*:(?=\s|$)', ' :', texte)
    texte = re.sub(r'«[   ]*', '« ', texte)
    texte = re.sub(r'[   ]*»', ' »', texte)
    return texte


def typo_contenu(contenu):
    morceaux = re.split(r'(<[^>]*>)', contenu)
    a_part = False
    for i, m in enumerate(morceaux):
        if m.startswith('<'):
            bas = m.lower()
            if re.match(r'<(style|script|code|pre)\b', bas):
                a_part = True
            elif re.match(r'</(style|script|code|pre)\b', bas):
                a_part = False
            morceaux[i] = re.sub(ATTRS_TEXTE, lambda a: '%s="%s"' % (a.group(1), typo(a.group(2))), m)
        elif not a_part:
            morceaux[i] = typo(m)
    return ''.join(morceaux)


# ── Lettres des cours et clés des affirmations ─────────────────────────
def attr(balise, nom):
    m = re.search(r'\b%s="([^"]*)"' % re.escape(nom), balise)
    return html.unescape(m.group(1)) if m else None


def sans_accents(s):
    s = unicodedata.normalize('NFD', s or '')
    return ''.join(c for c in s if unicodedata.category(c) != 'Mn').lower()


def identifier(contenu):
    """Pose les lettres manquantes des cours et les clés manquantes des
    affirmations, sans jamais toucher à celles déjà écrites."""
    prises = set(x for x in re.findall(r'<cours\b[^>]*\blettre="([a-z])"', contenu))
    cles = set(re.findall(r'<je-sais\b[^>]*\bcle="([^"]*)"', contenu))
    etat = {'cours': 0, 'lettre': 'l', 'lecon': 0, 'rang': 0}

    def lettre_pour(titre, premier):
        if premier and 'l' not in prises:
            return 'l'
        mots = [m for m in re.findall(r'[a-z]+', sans_accents(titre))
                if m not in ('le', 'la', 'les', 'l', 'de', 'du', 'des', 'd', 'un', 'une', 'et', 'a', 'au', 'aux', 'en')]
        for c in ''.join(m[0] for m in mots) + ''.join(mots) + 'abcdefghijkmnopqrstuvwxyz':
            if 'a' <= c <= 'z' and c not in prises:
                return c
        return 'z'

    def pose(m):
        balise, nom = m.group(0), m.group(1)
        if nom == 'cours':
            etat['cours'] += 1
            etat['lecon'] = 0
            l = attr(balise, 'lettre')
            if not l:
                l = lettre_pour(attr(balise, 'titre') or '', etat['cours'] == 1)
                prises.add(l)
                balise = balise.replace('<cours', '<cours lettre="%s"' % l, 1)
            etat['lettre'] = l
        elif nom == 'lecon':
            etat['lecon'] += 1
            etat['rang'] = 0
        elif nom == 'je-sais':
            etat['rang'] += 1
            if not attr(balise, 'cle'):
                i = etat['rang']
                while True:
                    cle = '%s%02d.%d' % (etat['lettre'], etat['lecon'], i)
                    if cle not in cles:
                        break
                    i += 1
                cles.add(cle)
                balise = balise.replace('<je-sais', '<je-sais cle="%s"' % cle, 1)
        return balise

    return re.sub(r'<(cours|lecon|je-sais)\b[^>]*>', pose, contenu)


# ── Progression ────────────────────────────────────────────────────────
def progression_propre(texte):
    try:
        p = json.loads(texte)
    except (ValueError, TypeError):
        p = {}
    if not isinstance(p, dict):
        p = {}
    acquis = p.get('acquis') if isinstance(p.get('acquis'), dict) else {}
    acquis = {k: True for k, v in acquis.items() if v is True and CLE_OK.match(k)}
    try:
        maj = max(0, int(p.get('maj') or 0))
    except (ValueError, TypeError):
        maj = 0
    return {'maj': maj, 'acquis': acquis}


def bloc_progression(p):
    return json.dumps(p, ensure_ascii=False, indent=1).replace('<', '\\u003c')


# ── Assemblage ─────────────────────────────────────────────────────────
def assembler(source, sortie):
    contenu = pathlib.Path(source).read_text(encoding='utf-8')
    # Une balise du contenu écrite en forme courte <mot ... /> devient <mot ...></mot>.
    contenu = re.sub(r'<(%s)(\s[^<>]*?)?\s*/>' % BALISES,
                     lambda m: '<%s%s></%s>' % (m.group(1), m.group(2) or '', m.group(1)), contenu)
    # La progression portée par le contenu rejoint le bloc réservé de l'en-tête.
    p = {'maj': 0, 'acquis': {}}
    m = re.search(r'<progression>(.*?)</progression>\s*', contenu, re.S)
    if m:
        p = progression_propre(m.group(1))
        contenu = contenu[:m.start()] + contenu[m.end():]
    contenu = identifier(contenu.strip())
    contenu = typo_contenu(contenu)
    sujet = re.search(r'<fichier\b[^>]*\bsujet="([^"]*)"', contenu) or re.search(r'<cours\b[^>]*\btitre="([^"]*)"', contenu)
    titre = re.sub(r'<[^>]+>', '', html.unescape(sujet.group(1))) if sujet else 'Cours'
    morceaux = {
        'TITRE': html.escape(titre),
        'POLICES': (ICI / 'polices.css').read_text(encoding='utf-8'),
        'CSS': (ICI / 'moteur.css').read_text(encoding='utf-8'),
        'PROGRESSION': bloc_progression(p),
        'CONTENU': contenu,
        'JS': (ICI / 'moteur.js').read_text(encoding='utf-8'),
    }
    gabarit = (ICI / 'gabarit.html').read_text(encoding='utf-8')
    page = re.sub(r'\{\{(TITRE|POLICES|CSS|PROGRESSION|CONTENU|JS)\}\}', lambda m: morceaux[m.group(1)], gabarit)
    pathlib.Path(sortie).write_text(page, encoding='utf-8')
    n = len(re.findall(r'<cours\b', contenu))
    print('Cours assemblé : %s (%d cours, %d leçons, %d Ko)' % (
        sortie, n, len(re.findall(r'<lecon\b', contenu)), len(page.encode('utf-8')) // 1024))


def extraire(cours, sortie):
    page = pathlib.Path(cours).read_text(encoding='utf-8')
    m = re.search(r'<template id="contenu">\n?(.*?)\n?</template>', page, re.S)
    if not m:
        sys.exit('Ce fichier ne contient pas de contenu à extraire.')
    # Un cours enregistré depuis le navigateur écrit les espaces insécables en &nbsp; :
    # on les rend à leur forme d'origine.
    contenu = m.group(1).strip().replace('&nbsp;', '\u00a0')
    b = PROGRES.search(page)
    p = progression_propre(b.group(2) if b else '')
    texte = '<progression>%s</progression>\n%s\n' % (json.dumps(p, ensure_ascii=False), contenu)
    pathlib.Path(sortie).write_text(texte, encoding='utf-8')
    print('Contenu extrait : %s (%d affirmations acquises)' % (sortie, len(p['acquis'])))


if __name__ == '__main__':
    if len(sys.argv) == 4 and sys.argv[1] == '--extraire':
        extraire(sys.argv[2], sys.argv[3])
    elif len(sys.argv) == 3:
        assembler(sys.argv[1], sys.argv[2])
    else:
        sys.exit(__doc__)

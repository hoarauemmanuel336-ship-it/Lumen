#!/usr/bin/env python3
"""Assemble un parcours d'étude : moteur (gabarit, style, script) + contenu.

Usage :
  python3 assembler.py contenu.html sortie.html
      assemble le contenu avec le moteur en un parcours autonome ;
  python3 assembler.py --extraire parcours.html contenu.html
      retire d'un parcours déjà assemblé son contenu et sa progression,
      pour le reprendre puis le réassembler avec le moteur présent.

La progression (bloc <script type="application/json" id="lv-progression">)
voyage avec le contenu : --extraire l'écrit en tête du fichier de contenu,
l'assemblage l'en retire et la remet dans l'en-tête du parcours.
"""
import html, json, pathlib, re, sys

ICI = pathlib.Path(__file__).resolve().parent
BALISES = 'parcours|bloc|theme|sujet|explication'
ATTRS_TEXTE = r'(sujet|titre|sous-titre|desc|nom)="([^"]*)"'
BLOC_PROG = re.compile(r'<script\b[^>]*\bid=["\']lv-progression["\'][^>]*>(.*?)</script>\s*', re.S | re.I)
PROG_NEUVE = '{"maj":0,"sujets":{}}'


def typo(texte):
    """Typographie française : apostrophe courbe, espaces insécables devant : ; ! ? » et après «."""
    if re.search(r'&#?\w+;', texte):
        return ''.join(m if re.fullmatch(r'&#?\w+;', m) else typo(m) for m in re.split(r'(&#?\w+;)', texte))
    texte = texte.replace("'", '’')
    texte = re.sub(r'[   ]*([;!?])', lambda m: ' ' + m.group(1), texte)
    texte = re.sub(r'(?<=\S)[   ]*:(?=\s|$)', ' :', texte)
    texte = re.sub(r'«[   ]*', '« ', texte)
    texte = re.sub(r'[   ]*»', ' »', texte)
    return texte


def typo_contenu(contenu):
    morceaux = re.split(r'(<[^>]*>)', contenu)
    dans_code = False
    for i, m in enumerate(morceaux):
        if m.startswith('<'):
            bas = m.lower()
            if bas.startswith('<style') or bas.startswith('<script'):
                dans_code = True
            elif bas.startswith('</style') or bas.startswith('</script'):
                dans_code = False
            morceaux[i] = re.sub(ATTRS_TEXTE, lambda a: '%s="%s"' % (a.group(1), typo(a.group(2))), m)
        elif not dans_code:
            morceaux[i] = typo(m)
    return ''.join(morceaux)


def progression(texte):
    """Rend le bloc de progression sous sa forme de données, chevrons échappés."""
    try:
        p = json.loads(texte)
        assert isinstance(p, dict)
    except Exception:
        return PROG_NEUVE
    if 'sujets' not in p:
        p['sujets'] = {}
    return texte.strip().replace('<', '\\u003c')


def assembler(source, sortie):
    contenu = pathlib.Path(source).read_text(encoding='utf-8')
    prog = PROG_NEUVE
    m = BLOC_PROG.search(contenu)
    if m:
        prog = progression(m.group(1).strip())
        contenu = contenu[:m.start()] + contenu[m.end():]
    contenu = contenu.strip()
    # Une balise du contenu écrite en forme courte <sujet ... /> devient <sujet ...></sujet>.
    contenu = re.sub(r'<(%s)(\s[^<>]*?)?\s*/>' % BALISES,
                     lambda m: '<%s%s></%s>' % (m.group(1), m.group(2) or '', m.group(1)), contenu)
    contenu = typo_contenu(contenu)
    m = re.search(r'<parcours\b[^>]*\bsujet="([^"]*)"', contenu)
    titre = re.sub(r'<[^>]+>', '', html.unescape(m.group(1))) if m else 'Parcours'
    morceaux = {
        'TITRE': html.escape(titre, quote=False),
        'CSS': (ICI / 'polices.css').read_text(encoding='utf-8') + '\n' + (ICI / 'moteur.css').read_text(encoding='utf-8'),
        'PROGRESSION': prog,
        'CONTENU': contenu,
        'JS': (ICI / 'moteur.js').read_text(encoding='utf-8'),
    }
    gabarit = (ICI / 'gabarit.html').read_text(encoding='utf-8')
    page = re.sub(r'\{\{(TITRE|CSS|PROGRESSION|CONTENU|JS)\}\}', lambda m: morceaux[m.group(1)], gabarit)
    pathlib.Path(sortie).write_text(page, encoding='utf-8')
    print('Parcours assemblé : %s (%d Ko)' % (sortie, len(page.encode('utf-8')) // 1024))


def extraire(document, sortie):
    page = pathlib.Path(document).read_text(encoding='utf-8')
    m = re.search(r'<template id="contenu">\n?(.*?)\n?</template>', page, re.S)
    if not m:
        sys.exit('Ce fichier ne contient pas de contenu à extraire.')
    # un fichier réenregistré depuis le navigateur écrit l'espace insécable en entité
    contenu = m.group(1).strip().replace('&nbsp;', ' ')
    p = BLOC_PROG.search(page)
    prog = progression(p.group(1).strip()) if p else PROG_NEUVE
    texte = '<script type="application/json" id="lv-progression">\n%s\n</script>\n%s\n' % (prog, contenu)
    pathlib.Path(sortie).write_text(texte, encoding='utf-8')
    print('Contenu et progression extraits : %s' % sortie)


if __name__ == '__main__':
    if len(sys.argv) == 4 and sys.argv[1] == '--extraire':
        extraire(sys.argv[2], sys.argv[3])
    elif len(sys.argv) == 3:
        assembler(sys.argv[1], sys.argv[2])
    else:
        sys.exit(__doc__)

#!/usr/bin/env python3
"""Assemble un diagramme : moteur (gabarit, style, script, polices) + contenu.

Usage :
  python3 assembler.py contenu.html sortie.html
      assemble le contenu avec le moteur en un widget autonome ;
  python3 assembler.py --extraire diagramme.html contenu.html
      retire d'un widget déjà assemblé son contenu, pour le reprendre
      puis le réassembler avec le moteur présent.
"""
import html, pathlib, re, sys

ICI = pathlib.Path(__file__).resolve().parent
BALISES = 'diagramme|bloc|section|groupe|carte|libre|explication|volet'


ATTRS_TEXTE = r'(titre|sous-titre|desc|nom|repere)="([^"]*)"'


def typo(texte):
    """Typographie française : espaces insécables devant : ; ! ? » et après «."""
    if re.search(r'&#?\w+;', texte):
        return ''.join(m if re.fullmatch(r'&#?\w+;', m) else typo(m) for m in re.split(r'(&#?\w+;)', texte))
    texte = re.sub(r'[ \u00a0\u202f]*([;!?])', lambda m: '\u202f' + m.group(1), texte)
    texte = re.sub(r'(?<=\S)[ \u00a0\u202f]*:(?=\s|$)', '\u00a0:', texte)
    texte = re.sub(r'«[ \u00a0\u202f]*', '«\u00a0', texte)
    texte = re.sub(r'[ \u00a0\u202f]*»', '\u00a0»', texte)
    return texte


def typo_contenu(contenu):
    morceaux = re.split(r'(<[^>]*>)', contenu)
    dans_style = False
    for i, m in enumerate(morceaux):
        if m.startswith('<'):
            bas = m.lower()
            if bas.startswith('<style') or bas.startswith('<script'):
                dans_style = True
            elif bas.startswith('</style') or bas.startswith('</script'):
                dans_style = False
            morceaux[i] = re.sub(ATTRS_TEXTE, lambda a: '%s="%s"' % (a.group(1), typo(a.group(2))), m)
        elif not dans_style:
            morceaux[i] = typo(m)
    return ''.join(morceaux)


def assembler(source, sortie):
    contenu = pathlib.Path(source).read_text(encoding='utf-8')
    # Une balise du contenu écrite en forme courte <carte ... /> devient <carte ...></carte>.
    contenu = re.sub(r'<(%s)(\s[^<>]*?)?\s*/>' % BALISES,
                     lambda m: '<%s%s></%s>' % (m.group(1), m.group(2) or '', m.group(1)), contenu)
    contenu = typo_contenu(contenu)
    m = re.search(r'<diagramme\b[^>]*\btitre="([^"]*)"', contenu)
    titre = re.sub(r'<[^>]+>', '', html.unescape(m.group(1))) if m else 'Diagramme'
    morceaux = {
        'TITRE': html.escape(titre),
        'POLICES': (ICI / 'polices.css').read_text(encoding='utf-8'),
        'CSS': (ICI / 'moteur.css').read_text(encoding='utf-8'),
        'CONTENU': contenu,
        'JS': (ICI / 'moteur.js').read_text(encoding='utf-8'),
    }
    gabarit = (ICI / 'gabarit.html').read_text(encoding='utf-8')
    page = re.sub(r'\{\{(TITRE|POLICES|CSS|CONTENU|JS)\}\}', lambda m: morceaux[m.group(1)], gabarit)
    pathlib.Path(sortie).write_text(page, encoding='utf-8')
    print('Diagramme assemblé : %s (%d Ko)' % (sortie, len(page.encode('utf-8')) // 1024))


def extraire(widget, sortie):
    page = pathlib.Path(widget).read_text(encoding='utf-8')
    m = re.search(r'<template id="contenu">\n?(.*?)\n?</template>', page, re.S)
    if not m:
        sys.exit('Ce fichier ne contient pas de contenu à extraire.')
    pathlib.Path(sortie).write_text(m.group(1).strip() + '\n', encoding='utf-8')
    print('Contenu extrait : %s' % sortie)


if __name__ == '__main__':
    if len(sys.argv) == 4 and sys.argv[1] == '--extraire':
        extraire(sys.argv[2], sys.argv[3])
    elif len(sys.argv) == 3:
        assembler(sys.argv[1], sys.argv[2])
    else:
        sys.exit(__doc__)

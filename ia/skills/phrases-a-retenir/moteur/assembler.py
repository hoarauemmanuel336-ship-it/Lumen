#!/usr/bin/env python3
"""Assemble une page de phrases à retenir : moteur (gabarit, style, polices, script) + contenu.

Usage :
  python3 assembler.py contenu.html sortie.html
      assemble le contenu avec le moteur en un fragment HTML prêt à être
      affiché directement dans la conversation.

Les polices sont appelées depuis Google Fonts, ce qui garde la page légère
et rapide à afficher.
"""
import html, pathlib, re, sys

ICI = pathlib.Path(__file__).resolve().parent


def typo(texte):
    """Typographie française : espaces insécables devant : ; ! ? » et après «, apostrophe courbe."""
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
    for i, m in enumerate(morceaux):
        if m.startswith('<'):
            morceaux[i] = re.sub(r'(sujet|titre|accueil)="([^"]*)"',
                                 lambda a: '%s="%s"' % (a.group(1), typo(a.group(2))), m)
        else:
            morceaux[i] = typo(m)
    return ''.join(morceaux)


POLICES = ("@import url('https://fonts.googleapis.com/css2"
           "?family=Inter:wght@400;500;600"
           "&family=JetBrains+Mono:wght@400;500"
           "&display=block');")


def assembler(source, sortie):
    contenu = typo_contenu(pathlib.Path(source).read_text(encoding='utf-8').strip())
    m = re.search(r'<phrases\b[^>]*\bsujet="([^"]*)"', contenu)
    sujet = html.unescape(m.group(1)) if m else 'Phrases à retenir'
    mode = 'final' if re.search(r'<phrases\b[^>]*\bmode="final"', contenu) else 'choix'
    resume = ('Phrases à retenir sur « %s », version finale à réciter.' if mode == 'final'
              else 'Phrases à retenir sur « %s », à cocher pour les faire réécrire.') % sujet
    morceaux = {
        'POLICES': POLICES,
        'CSS': (ICI / 'moteur.css').read_text(encoding='utf-8').strip(),
        'MODE': mode,
        'RESUME': html.escape(resume),
        'CONTENU': contenu,
        'JS': (ICI / 'moteur.js').read_text(encoding='utf-8').strip(),
    }
    gabarit = (ICI / 'gabarit.html').read_text(encoding='utf-8')
    page = re.sub(r'\{\{(POLICES|CSS|MODE|RESUME|CONTENU|JS)\}\}', lambda m: morceaux[m.group(1)], gabarit)
    pathlib.Path(sortie).write_text(page, encoding='utf-8')
    print('Page assemblée : %s (%d Ko)' % (sortie, len(page.encode('utf-8')) // 1024))


if __name__ == '__main__':
    if len(sys.argv) == 3:
        assembler(sys.argv[1], sys.argv[2])
    else:
        sys.exit(__doc__)

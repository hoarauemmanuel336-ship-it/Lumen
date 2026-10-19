#!/usr/bin/env python3
"""Assemble un livre : moteur (gabarit, style, script, polices) + contenu.

Usage :
  python3 assembler.py contenu.html sortie.html
      assemble le contenu avec le moteur en un livre autonome ;
      une ligne <inclure fichier="chapitres/03-titre.html"/> du contenu
      est remplacée par le fichier nommé (chemin relatif au contenu) ;
  python3 assembler.py --extraire livre.html contenu.html
      retire d'un livre déjà assemblé son contenu, pour le reprendre
      puis le réassembler avec le moteur présent.
"""
import html, pathlib, re, sys

ICI = pathlib.Path(__file__).resolve().parent
BALISES = 'livre|partie|chapitre|chapo|intertitre|citation|inclure'
ATTRS_TEXTE = r'\b(titre|sous-titre|surtitre|bandeau|resume|etiquette|ref)="([^"]*)"'


def typo(texte):
    """Typographie française : espaces insécables devant : ; ! ? » et après «,
    apostrophe typographique."""
    if re.search(r'&#?\w+;', texte):
        return ''.join(m if re.fullmatch(r'&#?\w+;', m) else typo(m) for m in re.split(r'(&#?\w+;)', texte))
    texte = texte.replace("'", '’')
    texte = re.sub(r'[   ]*([;!?])', lambda m: ' ' + m.group(1), texte)
    texte = re.sub(r'(?<=\S)[   ]*:(?=\s|$)', ' :', texte)
    texte = re.sub(r'«[   ]*', '« ', texte)
    texte = re.sub(r'[   ]*»', ' »', texte)
    return texte


def typo_contenu(contenu):
    """Applique la typographie au texte et aux attributs de texte, jamais au
    code d'un bloc <style> ou <script>."""
    morceaux = re.split(r'(<[^>]*>)', contenu)
    dans_code = False
    for i, m in enumerate(morceaux):
        if m.startswith('<'):
            bas = m.lower()
            if bas.startswith('<style') or bas.startswith('<script'):
                dans_code = True
            elif bas.startswith('</style') or bas.startswith('</script'):
                dans_code = False
            elif not m.startswith('<!--'):
                morceaux[i] = re.sub(ATTRS_TEXTE, lambda a: '%s="%s"' % (a.group(1), typo(a.group(2))), m)
        elif not dans_code:
            morceaux[i] = typo(m)
    return ''.join(morceaux)


def inclure(contenu, dossier, pile=()):
    """Remplace chaque <inclure fichier="…"/> par le fichier nommé."""
    def remplace(m):
        chemin = (dossier / m.group(1)).resolve()
        if chemin in pile:
            sys.exit('Inclusion circulaire : %s' % chemin)
        texte = chemin.read_text(encoding='utf-8').strip()
        return inclure(texte, chemin.parent, pile + (chemin,))
    return re.sub(r'<inclure\s+fichier="([^"]+)"\s*/?>(?:\s*</inclure>)?', remplace, contenu)


def assembler(source, sortie):
    source = pathlib.Path(source)
    contenu = inclure(source.read_text(encoding='utf-8'), source.resolve().parent).strip()
    # Une balise du contenu écrite en forme courte <chapitre ... /> devient <chapitre ...></chapitre>.
    contenu = re.sub(r'<(%s)(\s[^<>]*?)?\s*/>' % BALISES,
                     lambda m: '<%s%s></%s>' % (m.group(1), m.group(2) or '', m.group(1)), contenu)
    contenu = typo_contenu(contenu)
    m = re.search(r'<livre\b[^>]*\btitre="([^"]*)"', contenu)
    titre = re.sub(r'<[^>]+>', '', html.unescape(m.group(1))) if m else 'Livre'
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
    mots = len([w for w in re.split(r'[\s  ]+', re.sub(r'<[^>]+>', ' ', contenu))
                if re.search(r'[0-9A-Za-zÀ-ÿ]', w)])
    print('Livre assemblé : %s (%d Ko, %d mots en lecture complète intégrale)'
          % (sortie, len(page.encode('utf-8')) // 1024, mots))


def extraire(livre, sortie):
    page = pathlib.Path(livre).read_text(encoding='utf-8')
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

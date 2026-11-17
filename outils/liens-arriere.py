#!/usr/bin/env python3
"""Pose, dans les cours déjà en ligne, les liens vers les cours du bloc
« La doctrine sociale de l'Église ». Modification directe du fichier
assemblé : seul le lien s'ajoute, rien d'autre ne change.
Chaque passage doit être trouvé une seule fois ; sinon rien n'est écrit."""
import sys
D = '/home/claude/lumen/parcours/cours/'
P = '91-les-principes-de-la-doctrine-sociale.html'
T = '92-les-grands-textes-de-la-doctrine-sociale.html'
S = '93-les-domaines-de-la-vie-sociale.html'
POSES = [
 ('03-l-autorite-de-l-enseignement.html',
  '<p>La doctrine sociale de l’Église offre le terrain le plus clair',
  f'<p>La <a href="{P}#ouverture-l">doctrine sociale de l’Église</a> offre le terrain le plus clair'),
 ('17-les-prophetes.html',
  'avec l’encyclique <i>Rerum novarum</i> du pape Léon XIII, qui répondait',
  f'avec l’encyclique <a href="{T}#ouverture-r"><i>Rerum novarum</i></a> du pape Léon XIII, qui répondait'),
 ('17-les-prophetes.html',
  'le <i>Compendium de la doctrine sociale de l’Église</i>. Il en dégage',
  f'le <a href="{T}#ouverture-c"><i>Compendium de la doctrine sociale de l’Église</i></a>. Il en dégage'),
 ('20-hebreux-les-epitres-catholiques-et-l-apocalypse.html',
  'dans l’encyclique Rerum novarum (1891), première grande encyclique sociale',
  f'dans l’encyclique <a href="{T}#ouverture-r">Rerum novarum</a> (1891), première grande encyclique sociale'),
 ('46-les-mysteres-de-l-enfance-et-de-la-vie-cachee.html',
  '<p><i>Laborem exercens</i> signifie « en exerçant le travail »',
  f'<p><a href="{T}#ouverture-t"><i>Laborem exercens</i></a> signifie « en exerçant le travail »'),
 ('04-la-foi.html',
  'a consacré à la liberté religieuse une déclaration, <i>Dignitatis humanae</i>, promulguée',
  f'a consacré à la <a href="{S}#ouverture-r">liberté religieuse</a> une déclaration, <i>Dignitatis humanae</i>, promulguée'),
 ('49-la-redemption.html',
  '<i>Dignitatis humanae</i> (1965) sur la liberté religieuse, répond non.',
  f'<i>Dignitatis humanae</i> (1965) sur la <a href="{S}#ouverture-r">liberté religieuse</a>, répond non.'),
 ('14-le-pentateuque.html',
  'dans l’encyclique <i>Laudato si\'</i> (2015, n. 67)',
  f'dans l’encyclique <a href="{S}#ouverture-o"><i>Laudato si\'</i></a> (2015, n. 67)'),
 ('19-les-actes-et-saint-paul.html',
  'qui enseigne que les biens de la terre sont destinés à tous les hommes, et que',
  f'qui enseigne que les <a href="{P}#ouverture-u">biens de la terre sont destinés à tous les hommes</a>, et que'),
 ('18-les-evangiles.html',
  'le fil de son encyclique <i>Fratelli tutti</i> de 2020',
  f'le fil de son encyclique <a href="{T}#ouverture-f"><i>Fratelli tutti</i></a> de 2020'),
 ('77-la-fin-des-temps.html',
  '<p>Pie XI publie l’encyclique <i>Divini Redemptoris</i>, « du divin Rédempteur »',
  f'<p>Pie XI publie l’encyclique <a href="{T}#ouverture-q"><i>Divini Redemptoris</i></a>, « du divin Rédempteur »'),
]
import re
def motif(s):
    out = ''
    for c in s:
        if c in '   ':
            out += r'[\s  ]*'
        elif c in "'’":
            out += "['’]"
        else:
            out += re.escape(c)
    return out
textes = {}
for f, avant, apres in POSES:
    t = textes.get(f) or open(D + f, encoding='utf-8').read()
    m = re.match(r'(.*)(<a href="[^"]+">)(.*?)</a>(.*)$', apres, re.S)
    A, lien, W, B = m.groups()
    assert A + W + B == avant, f
    trouves = list(re.finditer('(' + motif(A) + ')(' + motif(W) + ')(' + motif(B) + ')', t))
    if len(trouves) != 1:
        sys.exit(f'{f} : passage trouvé {len(trouves)} fois, rien n’est écrit\n  {avant}')
    x = trouves[0]
    textes[f] = t[:x.start()] + x.group(1) + lien + x.group(2) + '</a>' + x.group(3) + t[x.end():]
for f, t in textes.items():
    open(D + f, 'w', encoding='utf-8').write(t)
    print('lien posé :', f)

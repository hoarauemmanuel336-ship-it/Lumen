#!/usr/bin/env python3
"""Pose, dans les cours déjà en ligne, les liens vers les cours du bloc
« La liturgie et les sacrements ». Modification directe du fichier
assemblé : seul le lien s'ajoute, rien d'autre ne change.
Chaque passage doit être trouvé une seule fois ; sinon rien n'est écrit.
Usage : liens-arriere.py [--essai]"""
import sys, re
D = '/home/claude/lumen/parcours/cours/'
LIT = '63-qu-est-ce-que-la-liturgie.html'
MES = '64-la-messe.html'
TPS = '65-le-temps-liturgique.html'
RIT = '66-les-rites-les-sacramentaux-et-la-piete.html'
SAC = '67-les-sacrements-en-general.html'
BAP = '68-le-bapteme.html'
CON = '69-la-confirmation.html'
EUC = '70-l-eucharistie.html'
PEN = '71-la-penitence.html'
ONC = '72-l-onction-des-malades.html'
ORD = '73-l-ordre.html'
MAR = '74-le-mariage.html'

def L(f, a, w, b, cible):
    """passage = a + w + b ; le lien se pose sur w."""
    return (f, a, w, b, cible)

POSES = [
 L('05-les-symboles-de-foi.html', 'forger un mot nouveau pour désigner ce changement : la ', 'transsubstantiation', '. Le quatrième concile', f'{EUC}#ouverture-t'),
 L('45-le-dogme-christologique.html', 'que l’Église appelle ', 'transsubstantiation', ' (session XIII, chapitre 4)', f'{EUC}#ouverture-t'),
 L('19-les-actes-et-saint-paul.html', 'témoigne que l’Église primitive croyait à la ', 'présence réelle', ' du Christ dans l’eucharistie', f'{EUC}#ouverture-p'),
 L('48-la-passion.html', 'la communion sous les deux espèces en 1562, le ', 'sacrifice de la messe', ' le 17 septembre 1562', f'{EUC}#ouverture-s'),
 L('12-interpreter-l-ecriture.html', 'le ministère de lecteur et l’', 'indulgence', ' accordée à qui lit l’Écriture', f'{PEN}#ouverture-i'),
 L('17-les-prophetes.html', 'intelligence approfondie de l’unicité et de l’', 'indissolubilité du mariage', ' (Catéchisme', f'{MAR}#ouverture-i'),
 L('19-les-actes-et-saint-paul.html', 'Jésus l’avait cité pour fonder l’', 'indissolubilité du mariage', ' : « ', f'{MAR}#ouverture-i'),
 L('53-la-justification-et-le-merite.html', 'par un péché grave après leur baptême, le ', 'sacrement de pénitence', ' devient l’instrument du relèvement', f'{PEN}#ouverture-l'),
 L('52-la-grace.html', 'Le concile de Trente appelle le ', 'sacrement de pénitence', ' « la seconde planche', f'{PEN}#ouverture-l'),
 L('18-les-evangiles.html', 'on la lit si souvent dans la préparation au ', 'sacrement de pénitence', ' : le pécheur qui se confesse', f'{PEN}#ouverture-l'),
 L('49-la-redemption.html', 'qu’il appelle aussi ', 'sacrement de la réconciliation', ' : le Christ a confié aux apôtres', f'{PEN}#ouverture-l'),
 L('53-la-justification-et-le-merite.html', 'étudie la ', 'contrition et l’attrition', ', les deux formes du regret', f'{PEN}#ouverture-c'),
 L('46-les-mysteres-de-l-enfance-et-de-la-vie-cachee.html', 'Le concile Vatican II l’appelle une « ', 'Église domestique', ' » (<i>Lumen gentium</i> 11)', f'{MAR}#ouverture-e'),
 L('04-la-foi.html', 'Cette leçon montre que le ', 'baptême des enfants', ' est au contraire l’endroit', f'{BAP}#ouverture-b'),
 L('53-la-justification-et-le-merite.html', 'il reçoit la justification par le ', 'baptême de désir', '. Le concile affirme', f'{BAP}#ouverture-n'),
 L('46-les-mysteres-de-l-enfance-et-de-la-vie-cachee.html', 'Leur mort rejoint ce que l’Église appelle le ', 'baptême de sang', '.</p>', f'{BAP}#ouverture-n'),
 L('51-l-esprit-saint.html', 'Le Catéchisme voit dans ces textes l’origine du ', 'sacrement de la confirmation', ', qui achève la grâce du baptême', f'{CON}#ouverture-l'),
 L('05-les-symboles-de-foi.html', 'la purification après la mort, les ', 'sept sacrements', ', la primauté de Pierre', f'{SAC}#ouverture-e'),
 L('52-la-grace.html', 'ils la confèrent par l’acte accompli, en latin ', '<i>ex opere operato</i>', ' (session VII, canon 8)', f'{SAC}#ouverture-s'),
 L('03-l-autorite-de-l-enseignement.html', 'Jean-Paul II publie une lettre apostolique très brève, ', '<i>Ordinatio sacerdotalis</i>', ', pour répondre', f'{ORD}#ouverture-o'),
 L('03-l-autorite-de-l-enseignement.html', 'dans la lettre apostolique ', '<i>Apostolicae curae</i>', ' (1896), sur l’invalidité des ordinations anglicanes', f'{ORD}#ouverture-r'),
 L('19-les-actes-et-saint-paul.html', 'L’Église a vu dans les Sept l’origine du ', 'diaconat', '. Le mot « diacre »', f'{ORD}#ouverture-d'),
 L('75-la-mort-et-le-jugement-particulier.html', 'Elle donne au mourant l’Eucharistie comme ', 'viatique', ', mot latin', f'{ONC}#ouverture-v'),
 L('47-le-ministere-public.html', 'c’est le but des deux sacrements de guérison, la pénitence et l’', 'onction des malades', ' (Catéchisme', f'{ONC}#ouverture-l'),
 L('17-les-prophetes.html', 'La liturgie de l’Église les lit au cœur de l’année. Pendant la ', 'Semaine sainte', ', les quatre chants', f'{TPS}#ouverture-s'),
 L('48-la-passion.html', 'le soir ouvre le ', 'Triduum pascal', ', les trois jours', f'{TPS}#ouverture-p'),
 L('05-les-symboles-de-foi.html', 'et l’Église la reprend chaque année à la ', 'Vigile pascale', '.</p>', f'{TPS}#ouverture-v'),
 L('50-la-resurrection-et-la-gloire.html', 'comme une seule célébration, qui culmine dans la ', 'Vigile pascale', ' et ne se clôt', f'{TPS}#ouverture-v'),
 L('44-l-incarnation.html', 'l’« heureuse faute » que chante l’', '<i>Exsultet</i>', ' de la nuit de Pâques', f'{TPS}#ouverture-v'),
 L('46-les-mysteres-de-l-enfance-et-de-la-vie-cachee.html', 'gravite autour du 1er janvier et de l’Épiphanie, dans le ', 'temps de Noël', ', parce qu’elle prolonge', f'{TPS}#ouverture-t'),
 L('16-les-livres-sapientiaux-et-poetiques.html', 'chez saint Augustin et dans la ', 'Liturgie des Heures', '.</p>', f'{TPS}#ouverture-h'),
 L('12-interpreter-l-ecriture.html', 'La constitution du concile sur la liturgie, ', '<i>Sacrosanctum concilium</i>', ', publiée en 1963', f'{LIT}#ouverture-r'),
 L('20-hebreux-les-epitres-catholiques-et-l-apocalypse.html', 'L’Église appelle cette participation le ', 'sacerdoce commun des fidèles', '. Par le baptême', f'{LIT}#ouverture-u'),
 L('51-l-esprit-saint.html', 'pour qu’ils deviennent le corps et le sang du Christ. Cette prière s’appelle l’', 'épiclèse', '.', f'{MES}#ouverture-m'),
 L('45-le-dogme-christologique.html', 'pendant l’octave de la ', 'Fête-Dieu', ', la fête du Saint-Sacrement', f'{EUC}#ouverture-e'),
 L('76-le-ciel-le-purgatoire-et-l-enfer.html', 'quitte l’église, la liturgie des ', 'funérailles', ' chante l’antienne latine', f'{RIT}#ouverture-f'),
]

def motif(s):
    out = ''
    for c in s:
        if c in '   ':
            out += r'[\s  ]*'
        elif c in "'’":
            out += "['’]"
        else:
            out += re.escape(c)
    return out

essai = '--essai' in sys.argv
textes = {}
erreurs = 0
for f, A, W, B, cible in POSES:
    t = textes.get(f) or open(D + f, encoding='utf-8').read()
    trouves = list(re.finditer('(' + motif(A) + ')(' + motif(W) + ')(' + motif(B) + ')', t))
    if len(trouves) != 1:
        print(f'{f} : passage trouvé {len(trouves)} fois\n  {A}{W}{B}')
        erreurs += 1
        continue
    x = trouves[0]
    textes[f] = t[:x.start()] + x.group(1) + f'<a href="{cible}">' + x.group(2) + '</a>' + x.group(3) + t[x.end():]
if erreurs:
    sys.exit(f'{erreurs} passage(s) à revoir, rien n’est écrit')
if essai:
    print(f'{len(POSES)} passages trouvés, rien n’est écrit (essai)')
    sys.exit()
for f, t in textes.items():
    open(D + f, 'w', encoding='utf-8').write(t)
    print('liens posés :', f)

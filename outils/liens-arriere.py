#!/usr/bin/env python3
"""Pose, dans les cours déjà en ligne, les liens vers les cours du bloc
« Les Pères de l’Église ». Modification directe du fichier assemblé :
seul le lien s'ajoute, rien d'autre ne change.
Au plus un lien par cours cible et par fichier, sur la mention où le Père
ou l'œuvre est nommé comme auteur ou témoin.
Chaque passage doit être trouvé une seule fois ; sinon rien n'est écrit.
Usage : liens-arriere.py [--essai]"""
import sys, re
D = '/home/claude/lumen/parcours/cours/'
F = {22: '22-la-patristique.html', 23: '23-les-premiers-temoins.html', 24: '24-les-peres-d-orient.html',
     25: '25-les-peres-d-occident.html', 26: '26-saint-augustin.html'}
def L(f, a, w, b, code):
    """passage = a + w + b ; le lien se pose sur w, vers le cours de code « nn-ii-x »."""
    return (f, a, w, b, f'{F[int(code[:2])]}#ouverture-{code[-1]}')
POSES = [
 L('02-la-transmission-de-la-revelation.html', '<p>Le ', 'nom de père', ', dans l’Église, désigne d’abord celui qui engendre à la foi', '22-01-l'),
 L('44-l-incarnation.html', '<p>Les ', 'Pères de l’Église', ', ces écrivains chrétiens des premiers siècles dont l’Église reconnaît', '22-01-l'),
 L('03-l-autorite-de-l-enseignement.html', 'On les appelle des ', 'écrivains ecclésiastiques', ' : leur témoignage compte beaucoup', '22-02-p'),
 L('11-inspiration-verite-et-canon.html', 'Ce qui fait autorité, c’est ', 'l’accord unanime des Pères', ' sur une matière de foi, et non l’avis d’un seul', '22-03-a'),
 L('12-interpreter-l-ecriture.html', '<p>Quand on parle de ', 'l’école d’Alexandrie', ' en exégèse, on ne désigne pas seulement', '22-04-e'),
 L('16-les-livres-sapientiaux-et-poetiques.html', 'grand représentant de ', 'l’école d’Antioche', ' qui s’attachait au sens historique', '22-05-c'),
 L('05-les-symboles-de-foi.html', 'qu’on appelle les ', 'Pères cappadociens', ', clarifièrent le vocabulaire', '22-06-f'),
 L('33-l-eglise-contemporaine.html', 'c’est la ', 'catéchèse dite mystagogique', ', dont saint Cyrille de Jérusalem', '22-07-g'),
 L('32-l-eglise-a-l-epoque-moderne.html', 'En France, les ', 'bénédictins de la congrégation de Saint-Maur', ', les mauristes, éditent les Pères', '22-08-r'),
 L('50-la-resurrection-et-la-gloire.html', 'collection des Pères grecs réunie au XIXe siècle par ', 'l’abbé Migne', '.</p>', '22-08-r'),
 L('70-l-eucharistie.html', '<p>La ', '<i>Didachè</i>', ', petit manuel chrétien de la fin du Ier siècle', '23-01-l'),
 L('19-les-actes-et-saint-paul.html', 'Vers l’an 96, le pape ', 'saint Clément de Rome', ', dans sa lettre aux Corinthiens, écrit que les apôtres', '23-02-c'),
 L('50-la-resurrection-et-la-gloire.html', '<p>', 'Saint Ignace d’Antioche', ', évêque martyrisé à Rome vers 110', '23-03-i'),
 L('66-les-rites-les-sacramentaux-et-la-piete.html', '<p>', 'Saint Polycarpe', ', évêque de Smyrne et disciple de l’apôtre Jean, vint à Rome', '23-04-p'),
 L('18-les-evangiles.html', '<p>', 'Papias', ' était évêque de Hiérapolis, en Phrygie', '23-05-h'),
 L('71-la-penitence.html', '<p>', 'Hermas', ' est un chrétien de Rome.', '23-06-a'),
 L('65-le-temps-liturgique.html', '<p>La ', '<i>Lettre de Barnabé</i>', ', écrite au début du IIe siècle, fait dire à Dieu', '23-07-e'),
 L('93-les-domaines-de-la-vie-sociale.html', 'Un très ancien texte chrétien, la ', '<i>Lettre à Diognète</i>', ', écrite sans doute au IIe ou au IIIe siècle', '23-08-d'),
 L('11-inspiration-verite-et-canon.html', 'Au deuxième siècle, ', 'l’apologiste Athénagore', ' comparait les prophètes à une flûte', '23-09-g'),
 L('44-l-incarnation.html', 'à recevoir l’Évangile. ', 'Saint Justin', ', philosophe converti, martyr à Rome vers 165', '23-10-j'),
 L('18-les-evangiles.html', 'Irénée écrit pour réfuter ', 'la gnose', '. On appelle ainsi un ensemble de doctrines', '23-11-n'),
 L('01-la-revelation.html', '<p>', 'Saint Irénée de Lyon', ', évêque au II<sup>e</sup> siècle, a fait de cette pédagogie', '23-12-r'),
 L('75-la-mort-et-le-jugement-particulier.html', 'mais ils en ont beaucoup parlé. ', 'Saint Irénée de Lyon', ', vers 180, consacre le dernier livre', '23-12-r'),
 L('68-le-bapteme.html', 'Vers l’an 200, ', 'Tertullien', ', dans le premier traité chrétien consacré au baptême', '23-13-t'),
 L('48-la-passion.html', '<p>', 'Saint Cyprien', ', évêque de Carthage, mort martyr en 258, voit dans la tunique', '23-14-y'),
 L('63-qu-est-ce-que-la-liturgie.html', 'un dialogue écrit en latin par ', 'Minucius Felix', ' vers l’an 200', '23-15-o'),
 L('74-le-mariage.html', 'À la fin du siècle, ', 'Clément d’Alexandrie', ', maître de l’école chrétienne de cette ville', '23-16-m'),
 L('72-l-onction-des-malades.html', '<p>', 'Origène', ', théologien d’Alexandrie, prêche', '23-17-v'),
 L('76-le-ciel-le-purgatoire-et-l-enfer.html', 'à la suite de spéculations attribuées à ', 'Origène', ', avaient imaginé que les esprits', '23-18-s'),
 L('77-la-fin-des-temps.html', 'Irénée a eu un disciple, ', 'saint Hippolyte de Rome', ', qui vers l’an 200 consacra', '23-19-b'),
 L('16-les-livres-sapientiaux-et-poetiques.html', '', 'Saint Athanase d’Alexandrie', ' lui répondit, dans ses <i>Discours contre les ariens</i>', '24-01-l'),
 L('03-l-autorite-de-l-enseignement.html', 'que le Père. ', 'Saint Athanase', ', évêque d’Alexandrie, tint bon dans la foi définie', '24-01-l'),
 L('45-le-dogme-christologique.html', 'selon le témoignage d’', 'Eusèbe de Césarée', ', le premier historien de l’Église', '24-02-e'),
 L('71-la-penitence.html', '<p>', 'Saint Basile', ', évêque de Césarée de Cappadoce, mort en 379', '24-03-b'),
 L('44-l-incarnation.html', 'La raison en a été donnée par ', 'saint Grégoire de Nazianze', ' : ce que le Christ n’a pas pris', '24-04-g'),
 L('76-le-ciel-le-purgatoire-et-l-enfer.html', 'qu’il faut présenter comme telles. ', 'Saint Grégoire de Nysse', ', au IVe siècle, a médité l’idée d’un progrès sans fin', '24-05-n'),
 L('70-l-eucharistie.html', '<i>Catéchèses mystagogiques</i> attribuées à ', 'saint Cyrille de Jérusalem', ' et le traité de saint Ambroise', '24-06-c'),
 L('77-la-fin-des-temps.html', '<p>', 'Saint Éphrem', ', diacre et docteur de l’Église syrienne au IVe siècle', '24-07-s'),
 L('74-le-mariage.html', '<p>', 'Saint Jean Chrysostome', ', prêtre d’Antioche puis évêque de Constantinople, mort en 407', '24-08-j'),
 L('91-les-principes-de-la-doctrine-sociale.html', 'ont prêché dans le même sens. ', 'Saint Jean Chrysostome', ', prêtre à Antioche avant de devenir évêque', '24-08-j'),
 L('70-l-eucharistie.html', 'remplie de l’Esprit. ', 'Saint Cyrille d’Alexandrie', ', le grand docteur du concile d’Éphèse', '24-09-a'),
 L('63-qu-est-ce-que-la-liturgie.html', 'par un auteur chrétien qui écrivait sous le nom de ', 'Denys l’Aréopagite', ', pour désigner l’ordre sacré', '24-10-p'),
 L('45-le-dogme-christologique.html', 'l’expression du Pseudo-Denys ? ', 'Saint Maxime le Confesseur', ', le grand théologien de cette crise', '24-11-m'),
 L('19-les-actes-et-saint-paul.html', 'il est permis de le représenter. ', 'Saint Jean Damascène', ', au VIIIe siècle, défendait ainsi les images saintes', '24-12-d'),
 L('02-la-transmission-de-la-revelation.html', 'sur la divinité du Fils, ', 'saint Hilaire de Poitiers', ' remarquait que les oreilles du peuple', '25-01-l'),
 L('64-la-messe.html', 'En 386, ', 'saint Ambroise', ', évêque de Milan, écrit à sa sœur Marcelline', '25-02-a'),
 L('91-les-principes-de-la-doctrine-sociale.html', 'avec vigueur. ', 'Saint Ambroise de Milan', ', dans son traité sur Naboth', '25-02-a'),
 L('67-les-sacrements-en-general.html', 'À la fin du IVe siècle, ', 'saint Jérôme', ' entreprend de réviser la Bible latine', '25-03-j'),
 L('12-interpreter-l-ecriture.html', 'les Pères de l’Église, et ', 'saint Jérôme', ' le premier, qui apprit l’hébreu', '25-03-j'),
 L('45-le-dogme-christologique.html', 'Eutychès en appelle au pape ', 'saint Léon le Grand', ' et obtient l’appui de l’empereur', '25-04-g'),
 L('65-le-temps-liturgique.html', '<p>', 'Saint Pierre Chrysologue', ', évêque de Ravenne au Ve siècle, l’a dit dans un sermon', '25-05-p'),
 L('04-la-foi.html', 'Le philosophe romain ', 'Boèce', ', au début du sixième siècle, appelle personne', '25-06-b'),
 L('71-la-penitence.html', 'on l’attribue d’ordinaire à ', 'Cassiodore', ', au VIe siècle.', '25-07-c'),
 L('63-qu-est-ce-que-la-liturgie.html', 'vient du pape ', 'saint Grégoire le Grand', ', qui gouverna l’Église de 590 à 604', '25-08-r'),
 L('67-les-sacrements-en-general.html', 'garde longtemps un sens large. ', 'Saint Isidore de Séville', ', évêque mort en 636', '25-09-i'),
 L('15-les-livres-historiques.html', 'et le seul pendant des siècles, est ', 'saint Bède le Vénérable', ', moine anglais du VIIIe siècle', '25-10-v'),
 L('19-les-actes-et-saint-paul.html', 'Cet homme est ', 'Augustin', ', le futur évêque d’Hippone', '26-01-l'),
 L('02-la-transmission-de-la-revelation.html', 'Le jeune ', 'Augustin', ', avant sa conversion, trouvait l’Ancien Testament', '26-01-l'),
 L('05-les-symboles-de-foi.html', '<p>Augustin est ', 'évêque d’Hippone', ', en Afrique du Nord, depuis environ vingt-cinq ans', '26-02-a'),
 L('01-la-revelation.html', 'dans la phrase la plus citée de ses ', '<i>Confessions</i>', ', à la première page', '26-03-c'),
 L('04-la-foi.html', '<p>', 'Augustin', ' parlait d’expérience. Jeune, il avait cherché la vérité', '26-04-p'),
 L('47-le-ministere-public.html', 'à défendre le même verset contre ', 'les manichéens', ', qui reprenaient la thèse de Marcion', '26-05-m'),
 L('18-les-evangiles.html', 'sur cette parabole contre ', 'les donatistes', ', des chrétiens d’Afrique du Nord', '26-06-d'),
 L('52-la-grace.html', 'Au cinquième siècle, ', 'Pélage', ' réduisait la grâce à des secours extérieurs', '26-07-u'),
 L('51-l-esprit-saint.html', 'au mystère de la Trinité, son traité ', 'De la Trinité', '. Il y cherche', '26-08-t'),
 L('93-les-domaines-de-la-vie-sociale.html', 'Saint Augustin raconte, au début de ', '<i>La Cité de Dieu</i>', ', que lors du sac de Rome', '26-09-i'),
 L('12-interpreter-l-ecriture.html', 'C’est le ', '<i>De doctrina christiana</i>', ', qu’on traduit par', '26-10-e'),
 L('31-la-reforme-et-le-concile-de-trente.html', 'Les ', 'ermites de saint Augustin', ' d’Allemagne ont, eux aussi', '26-11-r'),
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

#!/usr/bin/env python3
"""Pose, dans les cours déjà en ligne, les liens vers les cours du bloc
« L’histoire de l’Église ». Modification directe du fichier assemblé :
seul le lien s'ajoute, rien d'autre ne change.
Chaque passage doit être trouvé une seule fois ; sinon rien n'est écrit.
Usage : liens-arriere.py [--essai]"""
import sys, re
D = '/home/claude/lumen/parcours/cours/'
F = {27: '27-l-eglise-des-premiers-siecles.html', 28: '28-les-conciles-de-l-eglise-indivise.html', 29: '29-le-haut-moyen-age.html',
     30: '30-le-moyen-age-central-et-tardif.html', 31: '31-la-reforme-et-le-concile-de-trente.html', 32: '32-l-eglise-a-l-epoque-moderne.html',
     33: '33-l-eglise-contemporaine.html'}
def L(f, a, w, b, code):
    """passage = a + w + b ; le lien se pose sur w, vers le cours de code « nn-ii-x »."""
    return (f, a, w, b, f'{F[int(code[:2])]}#ouverture-{code[-1]}')
POSES = [
 L('05-les-symboles-de-foi.html', 'Le texte grec du ', 'concile de Nicée', ', en 325, commençait par', '28-02-c'),
 L('05-les-symboles-de-foi.html', 'Quand d’autres nient la divinité de l’Esprit Saint, le ', 'concile de Constantinople', ' le confesse', '28-03-i'),
 L('45-le-dogme-christologique.html', 'l’Église l’appelle la communication des idiomes ; le ', 'concile d’Éphèse', ' l’a défendue.', '28-04-e'),
 L('45-le-dogme-christologique.html', 'la foi des Églises d’Orient qui n’ont pas reçu le ', 'concile de Chalcédoine', '. Les leçons 10 et 11', '28-05-o'),
 L('45-le-dogme-christologique.html', 'Les conciles œcuméniques suivants, ', 'Nicée II', ' en 787 et Constantinople IV', '28-08-a'),
 L('11-inspiration-verite-et-canon.html', 'la règle de la foi. Le ', 'concile de Trente', ', réuni pour répondre à la Réforme', '31-08-t'),
 L('52-la-grace.html', 'pour qu’elles soient accomplies (canon 18). Le ', 'concile de Trente', ', dans son décret sur la justification de 1547', '31-09-d'),
 L('03-l-autorite-de-l-enseignement.html', 'de la foi et de la communion.</definition> <p>Le ', 'concile Vatican I', ', en 1870, a défini cette primauté', '32-10-c'),
 L('01-la-revelation.html', 'Parler d’amitié paraît presque déplacé.</p> <p>Pourtant le ', 'concile Vatican II', ', au cœur de sa définition de la Révélation', '33-07-v'),
 L('53-la-justification-et-le-merite.html', 'citaient les mêmes versets de saint Paul. ', 'Luther', ' voyait dans Romains 3', '31-02-u'),
 L('11-inspiration-verite-et-canon.html', 'remit en cause la liste des livres. ', 'Martin Luther', ' et les réformateurs refusèrent', '31-02-u'),
 L('52-la-grace.html', 'le mot serf signifie « esclave ».</definition> <p>', 'Jean Calvin', ', réformateur français établi à Genève', '31-05-c'),
 L('70-l-eucharistie.html', 'au château de Marbourg, en Allemagne, Martin Luther et ', 'Ulrich Zwingli', ' se rencontrent', '31-03-z'),
 L('63-qu-est-ce-que-la-liturgie.html', 'Ces églises répondent à une crise : la ', 'Réforme protestante', ' avait vidé', '31-01-l'),
 L('65-le-temps-liturgique.html', 'La leçon 9 raconte comment la ', 'loi de Constantin', ', en 321, a fait du dimanche', '27-07-c'),
 L('05-les-symboles-de-foi.html', 'Son successeur en Orient, ', 'Théodose', ', est un général venu d’Espagne', '27-08-t'),
 L('20-hebreux-les-epitres-catholiques-et-l-apocalypse.html', 'selon le récit de son martyre, l’évêque ', 'Polycarpe de Smyrne', ', vers 155, déclara', '27-05-r'),
 L('66-les-rites-les-sacramentaux-et-la-piete.html', 'L’Égypte est aussi la patrie du ', 'monachisme', ' : les moines du désert', '27-09-n'),
 L('65-le-temps-liturgique.html', 'dans la vie monastique et dans l’hospitalité. La ', 'Règle de saint Benoît', ', au VIe siècle, demande', '29-07-m'),
 L('76-le-ciel-le-purgatoire-et-l-enfer.html', 'et il se fixe au Moyen Âge. Les ', 'moines de Cluny', ', qui ont fait de la prière pour les morts', '29-07-m'),
 L('66-les-rites-les-sacramentaux-et-la-piete.html', 'la séparation entre Rome et Constantinople, que l’on date souvent de ', '1054', ', a creusé l’écart', '29-08-h'),
 L('67-les-sacrements-en-general.html', 'séparée de Rome depuis la ', 'rupture de 1054', '. Saint Thomas d’Aquin', '29-08-h'),
 L('05-les-symboles-de-foi.html', 'et aussi, hélas, par la guerre, la ', 'croisade contre les albigeois', ' ouverte en 1209', '30-03-c'),
 L('04-la-foi.html', 'une copie de la lettre à Castelli est envoyée à l’', 'Inquisition romaine', '. Galilée sent le danger', '30-09-i'),
 L('12-interpreter-l-ecriture.html', 'La Commission biblique pontificale a été fondée par le pape ', 'Léon XIII', ' en 1902', '33-01-l'),
 L('91-les-principes-de-la-doctrine-sociale.html', 'Le 15 mai 1891, le pape ', 'Léon XIII', ' publie l’encyclique', '33-01-l'),
 L('63-qu-est-ce-que-la-liturgie.html', 'Les deux suivantes présentent le motu proprio de ', 'saint Pie X', ', <i>Tra le sollecitudini</i>', '33-02-s'),
 L('04-la-foi.html', 'par le courant qu’on a appelé le ', 'modernisme', ', que le pape Pie X a condamné', '33-03-c'),
 L('12-interpreter-l-ecriture.html', '<p>Sur ce dernier point, ', 'Pie XII', ' est net. En 1943', '33-05-p'),
 L('52-la-grace.html', 'puis l’usage qu’en a fait le ', 'jansénisme', ' pour nier qu’il existe', '32-03-j'),
 L('70-l-eucharistie.html', 'en France et dans une partie de l’Europe : le ', 'jansénisme', '. Né de l’œuvre', '32-03-j'),
 L('92-les-grands-textes-de-la-doctrine-sociale.html', 'une réponse chrétienne à l’esprit de la ', 'Révolution française', ' et restent longtemps', '32-06-r'),
 L('03-l-autorite-de-l-enseignement.html', 'en vue des mérites du Christ. En 1854, le pape ', 'Pie IX', ' définit l’Immaculée Conception', '32-08-p'),
 L('70-l-eucharistie.html', 'au XIe siècle, le pape ', 'Grégoire VII', ' lui a fait jurer en 1079', '30-01-l'),
 L('65-le-temps-liturgique.html', 'certains manuscrits la donnent au pape ', 'Innocent III', '. On la surnomme', '30-02-p'),
 L('03-l-autorite-de-l-enseignement.html', 'La théologie des écoles, qu’on appelle la ', 'scolastique', ', a connu son âge d’or', '30-06-u'),
 L('67-les-sacrements-en-general.html', 'ne purifiaient pas la conscience.</p> <p>Le ', 'concile de Florence', ', dans son décret pour les Arméniens', '30-15-b'),
 L('70-l-eucharistie.html', '« sous l’une et l’autre espèce ».</p> <p>Le ', 'concile de Constance', ', en 1415, répond par un décret', '30-14-e'),
 L('05-les-symboles-de-foi.html', 'C’est une unité de nombre. Le ', 'quatrième concile du Latran', ', en 1215, l’a rappelé', '30-10-n'),
 L('64-la-messe.html', 'Pépin fait adopter le chant romain dans son royaume.</p> <p>', 'Charlemagne', ' poursuit l’œuvre de son père', '29-06-e'),
 L('05-les-symboles-de-foi.html', '« l’univers visible et invisible » : quand les ', 'cathares', ' attribuent le monde matériel', '30-07-h'),
 L('46-les-mysteres-de-l-enfance-et-de-la-vie-cachee.html', '<partie titre="Les Exercices spirituels de saint Ignace"> <p>', 'Ignace de Loyola', ', gentilhomme basque', '31-12-s'),
 L('75-la-mort-et-le-jugement-particulier.html', 'le pape Jean XXII monte en chaire à ', 'Avignon', ' et soutient', '30-12-a'),
 L('03-l-autorite-de-l-enseignement.html', 'un courant de pensée né en France, le ', 'gallicanisme', ', avait cherché', '32-04-g'),
 L('93-les-domaines-de-la-vie-sociale.html', 'imposait une école sans religion et envahissait les ', 'États pontificaux', '. C’est ce progrès-là', '32-09-f'),
 L('66-les-rites-les-sacramentaux-et-la-piete.html', 'Les cisterciens, les chartreux, les prémontrés, puis les ', 'ordres mendiants', ', dominicains, franciscains et carmes', '30-05-o'),
 L('73-l-ordre.html', '<p>Quand ', 'Henri VIII', ' rompt avec Rome, en 1534', '31-06-a'),
 L('66-les-rites-les-sacramentaux-et-la-piete.html', 'en slavon au IXe siècle, grâce aux frères ', 'Cyrille et Méthode', ', puis en roumain', '29-03-s'),
 L('93-les-domaines-de-la-vie-sociale.html', 'copatrons de l’Europe en 1980. La ', 'querelle des rites chinois', ' montre la difficulté', '32-02-q'),
 L('04-la-foi.html', 'Le XIXe siècle hérite des ', 'Lumières', ' du siècle précédent', '32-05-u'),
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

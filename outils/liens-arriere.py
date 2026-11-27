#!/usr/bin/env python3
"""Pose, dans les cours déjà en ligne, les liens vers les cours du bloc
« La philosophie au service de la foi ». Modification directe du fichier
assemblé : seul le lien s'ajoute, rien d'autre ne change.
Au plus un lien par cours cible et par fichier, au plus trois liens par
fichier, sur la mention où la notion, le philosophe ou l'argument est
nommé et où le cours du bloc l'explique à fond.
Chaque passage doit être trouvé une seule fois ; sinon rien n'est écrit.
Usage : liens-arriere.py [--essai]"""
import sys, re
D = '/home/claude/lumen/parcours/cours/'
F = {6: '06-la-connaissance-et-la-logique.html', 7: '07-l-etre-et-ses-principes.html', 8: '08-la-personne-humaine.html',
     9: '09-dieu-connu-par-la-raison.html', 10: '10-les-philosophes-et-la-foi.html'}
def L(f, a, w, b, code):
    """passage = a + w + b ; le lien se pose sur w, vers le cours de code « nn-ii-x »."""
    return (f, a, w, b, f'{F[int(code[:2])]}#ouverture-{code[-1]}')
POSES = [
 L('01-la-revelation.html', "rassasié de comprendre. Saint Augustin en tirait ", "un chemin vers Dieu", " : les vérités immuables que l’esprit découvre", '09-04-v'),
 L('01-la-revelation.html', "par ses effets » : ce raisonnement s’appuie sur ", "le principe de causalité", ", et ce principe vaut au-delà des phénomènes ; il", '07-08-p'),
 L('01-la-revelation.html', "il n’y aurait rien à reprocher. Elle procède ", "par analogie", ", de la beauté et de la puissance des créatures à", '09-06-d'),
 L('02-la-transmission-de-la-revelation.html', ", « substance », pour dire la foi trinitaire ; ", "saint Thomas d’Aquin", " a mis la philosophie d’Aristote au service de la", '10-07-s'),
 L('03-l-autorite-de-l-enseignement.html', "Une conclusion théologique prend la forme d’un ", "syllogisme", ", ce raisonnement en trois propositions que la", '06-09-r'),
 L('03-l-autorite-de-l-enseignement.html', "Il y a pour maître ", "Francisco de Vitoria", ", qui renouvelle l’enseignement de la théologie.", '10-10-e'),
 L('03-l-autorite-de-l-enseignement.html', "saint Thomas. Dans toute réalité, elle distingue ", "la matière", ", ce dont la chose est faite, et la forme, ce qui", '07-03-m'),
 L('04-la-foi.html', "reprend un titre ancien : la philosophie comme ", "<i>ancilla theologiae</i>", ", mot latin qui signifie « servante de la", '06-01-l'),
 L('04-la-foi.html', "idées générales, par une opération qu’on appelle ", "l’abstraction", ". Puis, à partir des choses connues, elle remonte", '06-04-i'),
 L('04-la-foi.html', "Quand je pense ", "l’être, le vrai, le bien", ", je ne vois donc pas Dieu. Je forme, à partir", '07-09-t'),
 L('05-les-symboles-de-foi.html', "ces manières d’être, qu’on appelle des ", "accidents", ", changent, et il reste le même homme. Sa", '07-04-s'),
 L('05-les-symboles-de-foi.html', "une troisième voie, que l’Église a faite sienne. ", "L’âme est la forme du corps", " : elle n’habite pas le corps comme on habite une", '08-02-a'),
 L('12-interpreter-l-ecriture.html', "examen critique. Au XVIIIe siècle, le philosophe ", "Emmanuel Kant", " avait entrepris une critique de la raison, pour", '10-13-k'),
 L('16-les-livres-sapientiaux-et-poetiques.html', "a paru une défaite. L’Église y entend sa foi en ", "l’immortalité de l’âme", ", qu’elle enseigne : l’âme spirituelle de chaque", '08-08-s'),
 L('16-les-livres-sapientiaux-et-poetiques.html', "viennent de la philosophie grecque, de ", "Platon", " et des stoïciens : le livre est le seul de", '10-02-p'),
 L('19-les-actes-et-saint-paul.html', "de Dieu peut être démontrée, a proposé ", "cinq voies", " pour y parvenir, à partir du mouvement, de la", '09-02-c'),
 L('19-les-actes-et-saint-paul.html', "théologien protestant Karl Barth a rejeté toute ", "théologie naturelle", " : selon lui, l’homme pécheur ne peut rien savoir", '09-01-l'),
 L('20-hebreux-les-epitres-catholiques-et-l-apocalypse.html', "les esclaves. Les philosophes grecs, depuis ", "Aristote", ", traitaient de la bonne marche de la maison en", '10-03-a'),
 L('21-les-grands-themes-de-l-ecriture.html', "que l’expression « Parole de Dieu » s’emploie ", "de manière analogique", " : elle a plusieurs sens, différents mais liés", '07-11-o'),
 L('22-la-patristique.html', "mystérieux, Ammonius Saccas, qui n’a rien écrit. ", "Plotin", ", le fondateur du néoplatonisme, l’a écouté", '10-04-n'),
 L('22-la-patristique.html', "une école où il enseigne la foi chrétienne comme ", "la vraie philosophie", ". Il écrit en grec ses deux ", '10-05-c'),
 L('23-les-premiers-temoins.html', "la philosophie aide à défendre la foi contre les ", "sophismes", " et à la présenter avec rigueur. L’expression", '06-11-s'),
 L('23-les-premiers-temoins.html', "que celui de l’Église. L’Église enseigne, avec ", "le concile Vatican I", ", que l’homme peut connaître avec certitude", '09-07-p'),
 L('25-les-peres-d-occident.html', "Au XIe siècle, un moine du Bec, ", "Anselme", ", cherche à prouver l’existence de Dieu par la", '09-03-a'),
 L('26-saint-augustin.html', "il avait lu seul, et compris sans maître, les ", "<i>Catégories</i>", " d’Aristote, un traité difficile qui classe les", '07-05-d'),
 L('27-l-eglise-des-premiers-siecles.html', "pouvait être accusé d’athéisme, comme ", "Socrate", " l’avait été à Athènes. Ce qu’on reprochait à", '10-01-l'),
 L('29-le-haut-moyen-age.html', "de Sens condamne des propositions du philosophe ", "Pierre Abélard", ", à l’instigation de Bernard. Abélard part pour", '10-06-m'),
 L('31-la-reforme-et-le-concile-de-trente.html', "Le droit à la liberté religieuse se fonde sur ", "la dignité de la personne", " : la vérité doit être cherchée et reçue", '08-09-d'),
 L('32-l-eglise-a-l-epoque-moderne.html', "En décembre 1784, le philosophe prussien ", "Emmanuel Kant", " publie dans une revue de Berlin un court article", '10-13-k'),
 L('33-l-eglise-contemporaine.html', "doivent enseigner. La première affirme que ", "la puissance et l’acte", " divisent l’être, de sorte que tout ce qui est", '07-02-a'),
 L('33-l-eglise-contemporaine.html', "le Moyen Âge. Il propose une manière de penser, ", "un réalisme", " qui part des choses, accorde à la raison sa", '06-12-a'),
 L('33-l-eglise-contemporaine.html', "deux principes à la racine du modernisme : ", "l’agnosticisme", ", hérité de Kant, et l’immanence vitale, qui fait", '09-09-g'),
 L('43-jesus-dans-l-histoire-et-ses-titres.html', "<p>Le ", "déisme", " de Reimarus exclut la révélation et la", '10-12-i'),
 L('44-l-incarnation.html', "<p>", "Saint Bonaventure", ", franciscain, trace la voie moyenne qui fera", '10-08-b'),
 L('44-l-incarnation.html', "La philosophie appelle ", "cause finale", " ce en vue de quoi une chose est faite : la fin", '07-07-q'),
 L('45-le-dogme-christologique.html', "qui calque le grec : l’union s’est faite dans le ", "suppôt", ", le sujet concret qui existe et agit.", '07-10-n'),
 L('45-le-dogme-christologique.html', "Dans les créatures, ", "l’essence et l’être sont distincts", " : aucune créature n’existe par sa seule", '07-06-e'),
 L('45-le-dogme-christologique.html', "un nom à la puissance qui accomplit ce travail : ", "l’intellect agent", ". C’est la lumière propre de l’intelligence", '08-03-i'),
 L('46-les-mysteres-de-l-enfance-et-de-la-vie-cachee.html', "pense à ses distinctions, à ses définitions, à ", "ses preuves de l’existence de Dieu", ". On l’imagine moins en train de méditer les", '09-02-c'),
 L('46-les-mysteres-de-l-enfance-et-de-la-vie-cachee.html', "études théologiques, Léon XIII dans l’encyclique ", "Aeterni Patris", ", en 1879, et le concile Vatican II, qui demande", '10-15-o'),
 L('47-le-ministere-public.html', "<p>", "Une démonstration philosophique de l’existence de Dieu", " demande du temps, de la formation, une certaine", '09-01-l'),
 L('50-la-resurrection-et-la-gloire.html', "précision : l’âme raisonnable est par elle-même ", "la forme du corps humain", ", c’est-à-dire ce qui fait de cette matière un", '08-02-a'),
 L('50-la-resurrection-et-la-gloire.html', "les hommes par des signes sensibles, parce que ", "leur connaissance commence par les sens", ".</p>", '06-03-c'),
 L('51-l-esprit-saint.html', "Pour nous, la vérité est d’abord ", "l’accord d’une phrase avec les faits", " : il est vrai qu’il pleut s’il pleut. Saint Jean", '06-02-v'),
 L('51-l-esprit-saint.html', "agit : la raison et le désir, que Thomas appelle ", "l’appétit", ".</p>", '08-04-v'),
 L('52-la-grace.html', "l’harmonie intérieure par laquelle les sens et ", "les passions", " obéissaient à la raison, ce que la théologie", '08-06-o'),
 L('53-la-justification-et-le-merite.html', "au IVe siècle avant Jésus-Christ, a distingué ", "quatre sortes de causes", ", que les théologiens du Moyen Âge ont reprises.", '07-07-q'),
 L('53-la-justification-et-le-merite.html', "110, article 2). Ils la décrivent comme un ", "<b>habitus</b>", ", mot latin qui désigne une disposition stable,", '08-07-h'),
 L('63-qu-est-ce-que-la-liturgie.html', "On rapproche parfois cette doctrine de ", "la philosophie de Platon", ", pour qui les choses visibles sont des copies", '10-02-p'),
 L('64-la-messe.html', "une école où il enseigne la foi chrétienne comme ", "la vraie philosophie", ". Il meurt martyr vers 165, sous l’empereur Marc", '10-05-c'),
 L('67-les-sacrements-en-general.html', "de Jean Duns Scot (mort en 1308), puis par des ", "nominalistes", " comme Guillaume d’Ockham et Gabriel Biel. Saint", '10-09-g'),
 L('70-l-eucharistie.html', "sont les théories des écoles. Il ne définit ni ", "la notion aristotélicienne de substance", " dans tous ses détails, ni l’explication que", '07-04-s'),
 L('70-l-eucharistie.html', "leur sens dans un monde de relations humaines. ", "La phénoménologie", ", née au début du siècle et très lue après la", '10-16-r'),
 L('74-le-mariage.html', "allemand, converti en 1914, disciple du ", "phénoménologue", " Edmund Husserl. Adversaire résolu du nazisme, il", '10-16-r'),
 L('75-la-mort-et-le-jugement-particulier.html', "ce que tout le monde sait : un corps sans ce ", "principe de vie", " est un corps mort.", '08-01-l'),
 L('75-la-mort-et-le-jugement-particulier.html', "de comprendre les êtres vivants que l’on appelle ", "l’hylémorphisme", ", d’après deux mots grecs, ", '07-03-m'),
 L('76-le-ciel-le-purgatoire-et-l-enfer.html', "pas vivant comme un être qui commence et finit. ", "La voie d’éminence", " affirme enfin que ce qu’on dit de lui se trouve", '09-05-t'),
 L('76-le-ciel-le-purgatoire-et-l-enfer.html', "sur quelques dessins ; un autre la connaît par ", "sa démonstration", ". Tous deux connaissent la proposition tout", '06-10-d'),
 L('77-la-fin-des-temps.html', "Cullmann ouvre sur deux scènes. La première est ", "la mort de Socrate", ", telle que Platon la raconte dans le ", '10-01-l'),
 L('77-la-fin-des-temps.html', "Au début du XIXe siècle, ", "Hegel", " décrit l’histoire universelle comme le progrès", '10-14-x'),
 L('77-la-fin-des-temps.html', ", aux numéros 20 et 21, qui traitent de ", "l’athéisme moderne", ". Le numéro 677 conclut : le Royaume ne", '09-08-m'),
 L('91-les-principes-de-la-doctrine-sociale.html', "sorte de prison de l’âme. À l’époque moderne, ", "René Descartes", " a décrit l’homme comme une « chose qui pense »", '10-11-d'),
 L('92-les-grands-textes-de-la-doctrine-sociale.html', "l’injustice du système. En février 1848, ", "Karl Marx", " et Friedrich Engels publient le ", '10-14-x'),
 L('92-les-grands-textes-de-la-doctrine-sociale.html', "L’Église, rappelle Léon XIII, a toujours défendu ", "le libre arbitre", " contre ceux qui le niaient, des manichéens de", '08-05-b'),
 L('93-les-domaines-de-la-vie-sociale.html', "La liberté psychologique, appelée aussi ", "libre arbitre", ", est le pouvoir de la volonté de choisir entre", '08-05-b'),
 L('93-les-domaines-de-la-vie-sociale.html', "pas le pouvoir. Pour d’autres, dans la ligne des ", "théologiens espagnols du XVIe et du XVIIe siècle", " comme Francisco Suárez, Dieu confie l’autorité à", '10-10-e'),
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

#!/usr/bin/env python3
"""Versets de base de Mémoriser pour le bloc « La liturgie et les sacrements ».
Le texte de chaque verset est lu dans la Chérubin ; la note est écrite ici.
Un verset déjà présent dans un autre bloc garde exactement le même texte.
Les catégories se placent avant le bloc « Les fins dernières », dans l'ordre du parcours.
Usage : python3 memoriser-lit.py [chemin de memoriser.json à compléter]"""
import json, sys, re, unicodedata, glob

BIBLE = '/root/.claude/skills/synced/0ecbfa39-bf16-4489-b54b-5c2efbbd424c_4e9301a7-4fe1-44a2-b731-c02e9c9e697f/bible/cherubin'
BLOC = 'La liturgie et les sacrements'
AVANT = 'Les fins dernières'

versets = {}
for f in glob.glob(BIBLE + '/*.txt'):
    for l in open(f, encoding='utf-8'):
        m = re.match(r'^(.+? \d+:\d+) (.*)$', l.rstrip('\n'))
        if m and not l.startswith('##'):
            versets[m.group(1)] = m.group(2)

def texte(ref):
    m = re.match(r'^(.+?) (\d+):(\d+)(?:-(\d+))?$', ref)
    livre, ch, a, b = m.group(1), m.group(2), int(m.group(3)), int(m.group(4) or m.group(3))
    return ' '.join(versets[f'{livre} {ch}:{v}'] for v in range(a, b + 1))

def ident(ref):
    s = unicodedata.normalize('NFD', ref.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return 'base-' + re.sub(r'[^a-z0-9]+', '-', s).strip('-')

CATEGORIES = [
 ('base-liturgie', 'Qu’est-ce que la liturgie', [
  ('Jean 4:24', "Jésus le dit à la Samaritaine, qui demandait s’il fallait adorer sur le mont Garizim ou à Jérusalem. Le culte de la nouvelle Alliance ne dépend plus d’un lieu (Catéchisme 1179) : il se rend dans l’Esprit Saint et dans la vérité, qui est le Christ lui-même."),
  ('Hébreux 8:1-2', "Le Christ est appelé ici, en grec, *leitourgos* du sanctuaire, mot que la Chérubin rend par « au service du » sanctuaire ; c’est la famille du mot « liturgie ». Le vrai liturge est le Christ, qui célèbre dans le ciel, et la liturgie de l’Église sur la terre participe à la sienne (Catéchisme 1090)."),
  ('Psaumes 141:2', "La prière monte vers Dieu comme la fumée de l’encens. Les Églises d’Orient chantent ce psaume à chaque office du soir, pendant qu’on encense l’église : il dit ce qu’est la prière liturgique, une offrande."),
 ]),
 ('base-messe', 'La messe', [
  ('Malachie 1:11', "Le prophète annonce une offrande pure présentée au nom de Dieu en tout lieu. Le concile de Trente y voit l’annonce du sacrifice de la messe (session XXII, chapitre 1), et la troisième prière eucharistique en reprend l’image : « du levant au couchant du soleil »."),
  ('Actes 2:42', "Luc décrit la première communauté de Jérusalem. On y reconnaît déjà ce qui fait la messe : l’enseignement des apôtres, la communion fraternelle, la fraction du pain et les prières. Le Catéchisme cite ce verset pour montrer l’Église fidèle à l’eucharistie dès le commencement (n. 1342)."),
  ('1 Corinthiens 11:26', "Chaque messe annonce la mort du Seigneur et attend son retour. L’acclamation que le peuple dit après la consécration reprend ce verset : la mort du Christ annoncée, sa résurrection proclamée, sa venue dans la gloire attendue."),
 ]),
 ('base-temps-liturgique', 'Le temps liturgique', [
  ('Psaumes 118:24', "C’est le verset de Pâques. L’Église le chante le jour de Pâques et pendant toute l’octave, dans le graduel latin *Haec dies*, et il sert de refrain au psaume de la messe du jour de Pâques."),
  ('1 Corinthiens 5:7', "Le Christ est l’agneau de la vraie Pâque. L’antienne de communion du jour de Pâques reprend ce verset en latin, *Pascha nostrum immolatus est Christus*, et chaque fête pascale tourne autour de cette phrase."),
  ('Exode 12:14', "Dieu fait de la Pâque un mémorial, en hébreu *zikkaron*, que la Chérubin traduit par « mémorial ». Ce verset est lu chaque Jeudi saint à la messe en mémoire de la Cène, et l’eucharistie est le mémorial de la Pâque du Christ (Catéchisme 1363)."),
  ('Psaumes 119:164', "Saint Benoît s’appuie sur ce verset pour fixer sept offices de jour dans sa Règle (chapitre 16). C’est l’idée de la Liturgie des Heures : la louange revient à intervalles réguliers et sanctifie tout le cours du jour."),
 ]),
 ('base-rites', 'Les rites, les sacramentaux et la piété', [
  ('Nombres 6:24-26', "Dieu confie cette bénédiction à Aaron et à ses fils pour le peuple. L’Église la lit le 1er janvier, en la solennité de Marie, Mère de Dieu, et le Missel la propose parmi les bénédictions solennelles de la fin de la messe."),
  ('1 Timothée 4:4-5', "Paul répond à ceux qui interdisaient certains aliments : rien de ce que Dieu a créé n’est mauvais, et la parole de Dieu avec la prière en sanctifie l’usage. C’est la logique des bénédictions et des autres sacramentaux."),
  ('2 Maccabées 12:46', "Judas Maccabée fait offrir un sacrifice pour ses soldats morts au combat. L’Église y lit le témoignage biblique de la prière pour les défunts (Catéchisme 1032), que la liturgie des funérailles et chaque messe portent encore aujourd’hui."),
 ]),
 ('base-sacrements', 'Les sacrements en général', [
  ('Luc 8:46', "La femme malade touche le vêtement de Jésus, et une force sort de lui. Le Catéchisme décrit ainsi les sacrements : des « forces qui sortent » du Corps du Christ, toujours vivant et vivifiant (n. 1116)."),
  ('1 Corinthiens 4:1', "Paul se dit intendant des mystères de Dieu : il distribue ce qui ne lui appartient pas. C’est la place du ministre des sacrements, qui agit au nom du Christ et selon l’intention de l’Église."),
  ('2 Corinthiens 1:21-22', "Onction, sceau, Esprit donné en acompte : la tradition a lu ces images dans le baptême et la confirmation. Le sceau a donné l’idée du caractère, la marque que ces sacrements impriment pour toujours, si bien qu’on ne les reçoit qu’une fois (Catéchisme 1121 et 1296)."),
 ]),
 ('base-bapteme', 'Le baptême', [
  ('Matthieu 28:19-20', "Ce sont les derniers mots de Jésus dans l’Évangile de Matthieu. Ils donnent l’ordre de baptiser et la forme du sacrement, au nom de la Trinité, que le ministre reprend en disant : « Je te baptise au nom du Père, et du Fils, et du Saint-Esprit. »"),
  ('Jean 3:5', "Jésus le dit à Nicodème : renaître de l’eau et de l’Esprit est nécessaire pour entrer dans le règne de Dieu. L’Église fonde sur ce verset la nécessité du baptême pour le salut (Catéchisme 1257)."),
  ('Romains 6:3-4', "Paul explique ce que fait le baptême : le baptisé est enseveli avec le Christ dans sa mort et se relève avec lui pour une vie nouvelle. C’est pourquoi la Vigile pascale, la nuit où l’Église célèbre la mort et la résurrection du Christ, est le moment propre du baptême des adultes."),
  ('Actes 2:38', "Le jour de la Pentecôte, la foule demande à Pierre ce qu’il faut faire. Sa réponse contient déjà tout le baptême chrétien : la conversion, le baptême au nom de Jésus, le pardon des péchés et le don de l’Esprit."),
 ]),
 ('base-confirmation', 'La confirmation', [
  ('Actes 8:15-17', "Les Samaritains ont été baptisés ; Pierre et Jean viennent leur imposer les mains, et ils reçoivent l’Esprit Saint. Le Catéchisme voit dans ce geste l’origine du sacrement de la confirmation, qui achève la grâce du baptême (n. 1288)."),
  ('Actes 1:8', "Jésus promet à ses disciples la force de l’Esprit pour faire d’eux ses témoins. C’est l’effet propre de la confirmation : une force spéciale de l’Esprit Saint pour répandre et défendre la foi, en paroles et en actes (Catéchisme 1303)."),
 ]),
 ('base-eucharistie', 'L’eucharistie', [
  ('Jean 6:51', "Jésus se dit le pain vivant descendu du ciel et annonce qu’il donnera sa chair pour la vie du monde. Le pain de vie est sa personne même, livrée sur la croix et reçue dans la communion."),
  ('Jean 6:55-56', "« Vraiment une nourriture », « vraiment une boisson » : Jésus insiste. L’Église lit ici la présence réelle, et la communion qui fait demeurer le fidèle dans le Christ et le Christ en lui (Catéchisme 1391)."),
  ('1 Corinthiens 10:16-17', "Paul tire de la communion une conséquence pour l’Église : un seul pain, un seul corps. Saint Augustin disait aux nouveaux baptisés de recevoir ce qu’ils sont, le corps du Christ."),
  ('Matthieu 26:26-28', "Ce sont les paroles de l’institution chez Matthieu. Le prêtre les redit à chaque messe, et par elles le Christ rend présents son corps et son sang. Matthieu est le seul à ajouter « pour le pardon des péchés »."),
 ]),
 ('base-penitence', 'La pénitence', [
  ('Jean 20:22-23', "Le soir de Pâques, le Christ ressuscité souffle sur les apôtres et leur donne le pouvoir de remettre les péchés. Le concile de Trente y voit l’institution du sacrement de pénitence (session XIV, canon 3)."),
  ('Luc 15:18', "Le fils prodigue décide de rentrer et prépare son aveu. Le Catéchisme lit dans la parabole tout le chemin du sacrement : la conversion, le retour vers le Père, l’aveu, le pardon et la fête (n. 1439)."),
  ('1 Jean 1:9', "Jean promet le pardon à qui reconnaît ses péchés. Le Catéchisme cite ce verset pour dire que l’accueil de la miséricorde de Dieu exige l’aveu de nos fautes (n. 1847)."),
  ('Psaumes 51:3', "Ainsi commence le psaume que la tradition attribue à David après son péché. L’Église le prie chaque vendredi matin aux laudes, et il reste la grande prière de la pénitence."),
 ]),
 ('base-onction', 'L’onction des malades', [
  ('Jacques 5:14-15', "C’est le texte du sacrement des malades. On y trouve le ministre, les prêtres ; le geste, l’onction d’huile avec la prière ; les effets, le relèvement et le pardon. Le concile de Trente dit que Jacques a promulgué ce sacrement (session XIV)."),
  ('Marc 6:13', "Envoyés en mission, les Douze font des onctions d’huile aux malades. Le concile de Trente voit dans ce geste une première indication du sacrement que Jacques promulguera (session XIV)."),
 ]),
 ('base-ordre', 'L’ordre', [
  ('Luc 22:19', "« Faites cela en mémoire de moi. » Le concile de Trente enseigne que, par ces mots, le Christ a institué ses apôtres prêtres et leur a ordonné d’offrir son corps et son sang (session XXII, canon 2)."),
  ('Psaumes 110:4', "La lettre aux Hébreux applique ce serment au Christ : il est prêtre pour toujours, à la manière de Melchisédek, qui apporta le pain et le vin. Le prêtre ordonné participe à ce sacerdoce unique."),
  ('2 Timothée 1:6', "Paul rappelle à Timothée le don reçu par l’imposition de ses mains. Ce geste est resté le cœur de l’ordination, et Pie XII l’a déclaré matière du sacrement de l’ordre en 1947 (*Sacramentum ordinis*)."),
  ('Hébreux 5:1', "Ce verset dit ce qu’est un grand prêtre : pris d’entre les hommes, établi pour eux auprès de Dieu, pour offrir. Le Catéchisme le reprend pour parler du sacerdoce (n. 1539), que le Christ accomplit et auquel les prêtres participent."),
 ]),
 ('base-mariage', 'Le mariage', [
  ('Genèse 2:24', "Jésus cite ce verset quand on l’interroge sur le divorce : le mariage remonte au commencement, au dessein du Créateur. L’Église y lit l’unité des époux et leur fidélité."),
  ('Matthieu 19:6', "C’est la parole du Christ sur l’indissolubilité. Le lien du mariage est établi par Dieu lui-même, si bien que le mariage conclu et consommé entre baptisés ne peut jamais être dissous (Catéchisme 1640)."),
  ('Éphésiens 5:25', "Paul donne au mari la mesure de son amour : celle du Christ, qui se livre pour l’Église. Le mariage chrétien apprend aux époux à s’aimer de cet amour qui se donne."),
  ('Éphésiens 5:32', "« Mystère » traduit ici le grec *mystêrion*, que la Vulgate a rendu par *sacramentum*. L’amour des époux est le signe de l’union du Christ et de l’Église, et le concile de Trente y voit l’indication que le mariage est un sacrement (session XXIV)."),
 ]),
]

def typo(s):
    s = re.sub(r' ([:;!?»])', ' \\1', s)
    return re.sub(r'« ', '« ', s)

def categories(existants):
    out = []
    for cid, nom, vs in CATEGORIES:
        vv = []
        for r, n in vs:
            i = ident(r)
            vv.append({'id': i, 'fr': {'ref': r, 'text': existants.get(i) or texte(r)}, 'note': typo(n)})
        out.append({'id': cid, 'name': {'fr': nom}, 'bloc': BLOC, 'kind': 'v', 'verses': vv})
    return out

if __name__ == '__main__':
    p = sys.argv[1] if len(sys.argv) > 1 else None
    d = json.load(open(p)) if p else {'categories': []}
    ids = {cid for cid, _, _ in CATEGORIES}
    reste = [c for c in d['categories'] if c['id'] not in ids]
    existants = {v['id']: v['fr']['text'] for c in reste for v in c['verses']}
    cats = categories(existants)
    if not p:
        print(json.dumps(cats, ensure_ascii=False, indent=1)[:3000]); sys.exit()
    pos = next((k for k, c in enumerate(reste) if c.get('bloc') == AVANT), len(reste))
    d['categories'] = reste[:pos] + cats + reste[pos:]
    json.dump(d, open(p, 'w'), ensure_ascii=False, indent=1)
    open(p, 'a').write('\n')
    print('ajouté', sum(len(c['verses']) for c in cats), 'versets dans', len(cats), 'catégories')

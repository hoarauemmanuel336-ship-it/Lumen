#!/usr/bin/env python3
"""Versets de base de Mémoriser pour le bloc « La philosophie au service de la foi ».
Le texte de chaque verset est lu dans la Chérubin ; la note est écrite ici.
Un verset déjà présent dans un autre bloc garde exactement le même texte.
Les catégories se placent avant le bloc « L’Écriture sainte », dans l'ordre du parcours.
Usage : python3 memoriser-philo.py [chemin de memoriser.json à compléter]"""
import json, sys, re, unicodedata, glob

BIBLE = '/root/.claude/skills/synced/0ecbfa39-bf16-4489-b54b-5c2efbbd424c_4e9301a7-4fe1-44a2-b731-c02e9c9e697f/bible/cherubin'
BLOC = 'La philosophie au service de la foi'
AVANT = 'L’Écriture sainte'

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
 ('base-connaissance-logique', 'La connaissance et la logique', [
  ('1 Pierre 3:15', "Le mot que la Chérubin traduit ici par « raison » est en grec *logos*, d’où vient le mot « logique ». Rendre raison de sa foi, c’est en donner un compte ordonné à celui qui interroge, et répondre aux objections est l’un des trois services que saint Thomas attend de la philosophie."),
  ('1 Thessaloniciens 5:21', "Saint Paul résume en une ligne la méthode de qui cherche la vérité. Examiner, c’est refuser la précipitation et le préjugé ; retenir ce qui est bon, c’est ne pas se perdre dans le doute sans fin du sceptique, puisqu’on examine pour pouvoir retenir quelque chose."),
  ('Matthieu 5:37', "Le oui et le non de l’Évangile sont l’affirmation et la négation que la logique étudie dans le jugement. Jésus parle de la droiture de celui qui parle, et sa parole suppose qu’une affirmation a un sens net, dont on doit pouvoir répondre."),
  ('Jean 14:6', "Jésus dit de lui-même qu’il est la vérité, ce que ni la philosophie ni l’Ancien Testament ne pouvaient dire seuls. Il est le Verbe, l’expression parfaite du Père : la vérité que la raison cherche dans les choses a en lui sa source."),
  ('Éphésiens 4:14', "Le cardinal Ratzinger commentait ce passage dans l’homélie du 18 avril 2005, celle où il a parlé d’une « dictature du relativisme ». À la mesure du moi et de ses désirs, il opposait « une autre mesure : le Fils de Dieu, l’homme véritable »."),
 ]),
 ('base-etre-principes', 'L’être et ses principes', [
  ('Exode 3:14', "Saint Thomas tient « Celui qui est » pour le nom le plus propre de Dieu, parce qu’il ne désigne aucune forme particulière : il dit l’être même (*Somme de théologie* I, q. 13, a. 11). Étienne Gilson a appelé « métaphysique de l’Exode » cette rencontre entre la philosophie de l’être et le nom révélé à Moïse."),
  ('Malachie 3:6', "Dieu est « acte pur, sans mélange d’aucune puissance », écrit saint Thomas dans l’article où il cite ce verset pour montrer que Dieu est immuable (*Somme de théologie* I, q. 9, a. 1) : il n’a rien à acquérir ni à perdre. Sa fidélité à ses promesses repose sur cette immutabilité."),
  ('Genèse 1:31', "Tout ce qui est est bon en tant qu’il est : la raison retrouve dans ce refrain de la création la thèse du transcendantal « bon ». Aucune substance n’est donc mauvaise par nature, et le mal est un manque dans un être qui reste bon. Les dualistes, qui imaginent une matière mauvaise ou un principe du mal égal à Dieu, se heurtent à cette thèse."),
  ('Romains 11:36', "Ce verset rassemble trois des quatre causes. « De lui » dit la cause efficiente et « pour lui » la cause finale ; dans « par lui », on lit l’action de Dieu dans toutes les causes secondes, et les Pères y voyaient la cause exemplaire, le Verbe par qui tout a été fait."),
  ('Marc 10:18', "Jésus renvoie à Dieu seul l’homme qui l’appelle « bon maître ». Saint Thomas y lit une thèse de métaphysique, qu’il démontre : « Dieu seul est bon par son essence » (*Somme de théologie* I, q. 6, a. 3). Les créatures sont bonnes par participation, parce qu’elles reçoivent de lui leur être et leur perfection."),
 ]),
 ('base-personne-humaine', 'La personne humaine', [
  ('Genèse 2:7', "La poussière façonnée et le souffle de vie font ensemble « un être vivant », un seul homme. Le concile de Vienne l’a défini en 1312 dans la langue de la philosophie : l’âme raisonnable est par elle-même et essentiellement la forme du corps."),
  ('Genèse 1:27', "Saint Thomas place l’image de Dieu dans la nature intellectuelle de l’homme et en distingue trois degrés (*Somme de théologie* I, q. 93, a. 4). Le premier, l’aptitude naturelle à connaître et à aimer Dieu, se trouve en tout homme et ne se perd pas : il fonde la dignité de chaque personne."),
  ('Matthieu 10:28', "Ce verset suppose que l’âme survit à la mort du corps, puisqu’on peut tuer l’un sans tuer l’autre. Le concile de Latran V l’a cité en 1513 dans son décret sur l’immortalité de l’âme, et la raison le rejoint : aucune puissance créée ne peut défaire l’âme."),
  ('Siracide 15:14', "Le concile Vatican II reprend ce verset dans *Gaudium et spes* (n. 17) : Dieu a voulu laisser l’homme « à son propre conseil ». La philosophie explique comment cette maîtrise de ses actes est possible, par la raison qui juge et la volonté qui choisit."),
  ('Jean 8:34', "Saint Anselme s’appuie sur cette parole dans son dialogue *De la liberté du choix* : un pouvoir qui rend esclave quand on s’en sert ne peut pas être la liberté elle-même. Il définit donc la liberté comme le pouvoir de garder la droiture de la volonté pour elle-même."),
 ]),
 ('base-dieu-raison', 'Dieu connu par la raison', [
  ('Romains 1:20', "Saint Thomas cite ce verset pour montrer que l’existence de Dieu peut être démontrée (*Somme de théologie* I, q. 2, a. 2). Le premier concile du Vatican l’invoque dans *Dei Filius* (1870), juste après avoir enseigné que Dieu peut être connu avec certitude par la lumière naturelle de la raison, à partir des choses créées."),
  ('Sagesse 13:5', "Ce verset donne la règle du chemin qui monte du monde à Dieu. Le mot grec *analogôs*, « par analogie », veut dire « par proportion » : la créature est à Dieu comme l’effet à sa cause, et ce rapport permet de dire de lui quelque chose de vrai."),
  ('Psaumes 53:2', "Si l’insensé peut penser que Dieu n’existe pas, le contraire de « Dieu existe » peut se penser : saint Thomas en tire que l’existence de Dieu n’est pas évidente pour nous (*Somme de théologie* I, q. 2, a. 1). Saint Anselme fait de cet insensé l’interlocuteur de son argument, au chapitre 2 du *Proslogion*."),
  ('Actes 17:27', "Saint Paul dit aux Athéniens que Dieu a fait les peuples pour qu’ils le cherchent. Le verbe grec *psêlaphân*, « découvrir comme à tâtons », évoque un aveugle qui avance les mains en avant : la connaissance naturelle de Dieu est réelle, puisqu’on peut le trouver, et elle avance dans l’obscurité."),
  ('Isaïe 45:15', "La raison qui remonte jusqu’à la cause première sait aussi qu’elle ne peut pas dire ce que Dieu est en lui-même. Le prophète tient les deux ensemble, Dieu caché et Dieu connu comme le Sauveur d’Israël, et répond ainsi à l’agnostique, qui confond cette limite avec une ignorance totale."),
 ]),
 ('base-philosophes-foi', 'Les philosophes et la foi', [
  ('Colossiens 2:8', "C’est le seul passage du Nouveau Testament où paraît le mot « philosophie ». Clément d’Alexandrie l’expliquait vers l’an 200 : Paul ne vise pas toute philosophie, mais celle des épicuriens, « qui abolit la providence et divinise le plaisir », et toute doctrine qui honore les éléments au lieu de leur Créateur (*Stromates* I, 11)."),
  ('Actes 17:28', "Devant l’Aréopage, Paul cite le poète grec Aratos de Soles, dont les *Phénomènes* disaient de Zeus : « Nous sommes de sa race ». Il rapporte au vrai Dieu ce que les païens avaient entrevu, et ce discours donne, avec la mise en garde de Colossiens 2:8, le cadre de l’attitude chrétienne devant la philosophie."),
  ('Jean 1:9', "Pour saint Justin, philosophe converti mort martyr à Rome vers 165, ce Verbe, en grec *logos*, éclairait déjà la raison des Grecs. Ceux qui ont vécu avec le *logos* sont chrétiens, écrit-il, « comme chez les Grecs Socrate, Héraclite et leurs semblables » (*Première Apologie* 46, 3)."),
  ('Matthieu 23:10', "Saint Augustin s’appuie sur cette parole dans son dialogue *Le Maître* : les mots du professeur avertissent l’élève de regarder, et c’est le Christ, maître intérieur, qui enseigne. Saint Thomas reprend la question (*Questions disputées sur la vérité*, q. 11, a. 1), et saint Bonaventure commente ce verset dans son sermon *Le Christ, seul maître de tous*."),
  ('1 Corinthiens 1:24', "Le mot grec *philosophos*, « philosophe », veut dire « ami de la sagesse ». Si la sagesse est Dieu, raisonne saint Augustin, « le vrai philosophe est celui qui aime Dieu » (*La Cité de Dieu* VIII, 1) : le chrétien qui aime le Christ, sagesse de Dieu, accomplit ce que le mot promettait."),
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

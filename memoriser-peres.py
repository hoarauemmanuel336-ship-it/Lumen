#!/usr/bin/env python3
"""Versets de base de Mémoriser pour le bloc « Les Pères de l’Église ».
Le texte de chaque verset est lu dans la Chérubin ; la note est écrite ici.
Un verset déjà présent dans un autre bloc garde exactement le même texte.
Les catégories se placent avant le bloc « L’histoire de l’Église », dans l'ordre du parcours.
Usage : python3 memoriser-peres.py [chemin de memoriser.json à compléter]"""
import json, sys, re, unicodedata, glob

BIBLE = '/root/.claude/skills/synced/0ecbfa39-bf16-4489-b54b-5c2efbbd424c_4e9301a7-4fe1-44a2-b731-c02e9c9e697f/bible/cherubin'
BLOC = 'Les Pères de l’Église'
AVANT = 'L’histoire de l’Église'

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
 ('base-patristique', 'La patristique', [
  ('1 Corinthiens 4:15', "Paul se dit le père des Corinthiens, qu’il a engendrés à la foi par l’Évangile. Les premiers chrétiens ont donné ce nom à leurs maîtres pour la même raison : « Celui qui a été instruit par la parole d’un autre est appelé le fils de celui qui l’enseigne », écrit Irénée de Lyon (*Contre les hérésies* IV, 41, 2)."),
  ('Hébreux 13:7', "L’Église ne compte parmi les Pères que des maîtres à la doctrine sûre dont elle a reconnu la sainteté. Ce verset lie déjà les deux : la parole qu’ils ont annoncée, et leur vie menée jusqu’au bout, dont la foi est à imiter."),
  ('1 Timothée 6:20', "Vincent de Lérins commente longuement ce verset dans son *Commonitorium*, en 434 : le dépôt, dit-il, c’est ce qui t’a été confié, non ce que tu as inventé. Le même livre donne sa règle pour reconnaître la foi de l’Église : tenir ce qui a été cru partout, toujours et par tous."),
  ('2 Thessaloniciens 2:15', "Paul met sur le même rang ce qu’il a transmis de vive voix et ce qu’il a écrit. Jean Chrysostome en tire, dans ses homélies sur cette lettre, que les apôtres n’ont pas tout transmis par écrit et que la tradition de l’Église mérite aussi d’être crue."),
 ]),
 ('base-premiers-temoins', 'Les premiers témoins', [
  ('Malachie 1:11', "La *Didachè* applique cette prophétie à l’eucharistie du dimanche, le sacrifice pur offert en tout lieu (chapitre 14). Justin et Irénée de Lyon la lisent de la même façon."),
  ('Jean 6:54', "En route vers son martyre, Ignace d’Antioche appelle le pain rompu « remède d’immortalité, antidote pour ne pas mourir » (*Aux Éphésiens* 20, 2). Il rejoint cette promesse : la communion dépose déjà en nous le germe de la résurrection."),
  ('Philippiens 3:20', "La *Lettre à Diognète* dit des chrétiens qu’« ils passent leur vie sur la terre, mais ils sont citoyens du ciel » (5, 9), en écho direct à ce verset. Ils vivent dans leur ville comme tout le monde, en sachant que leur patrie est au ciel."),
  ('Éphésiens 1:10', "Irénée de Lyon tire de ce verset le mot central de sa théologie, la récapitulation. Le Christ reprend en lui toute l’histoire humaine depuis Adam, la refait dans l’obéissance pour la sauver et devient la tête de toute la création."),
  ('Éphésiens 4:4-6', "Saint Cyprien cite ce passage dans *L’Unité de l’Église catholique* (chapitre 4) : l’Église est une, comme sont uniques le Seigneur, la foi et le baptême. Le même traité dit qu’« on ne peut avoir Dieu pour Père si l’on n’a pas l’Église pour mère »."),
 ]),
 ('base-peres-orient', 'Les Pères d’Orient', [
  ('Jean 1:14', "Athanase d’Alexandrie consacre tout son traité *Sur l’Incarnation du Verbe* à ce mystère et le résume ainsi : « Lui s’est fait homme pour que nous soyons faits Dieu » (54, 3). Le Catéchisme de l’Église catholique reprend sa formule (n. 460)."),
  ('Hébreux 4:15', "Apollinaire refusait au Christ une intelligence humaine. Grégoire de Nazianze lui répond par une règle : « ce qui n’a pas été assumé n’a pas été guéri » (*Lettre* 101). Le Christ a pris l’homme tout entier, sauf le péché, comme le dit ce verset."),
  ('Philippiens 3:13-14', "Grégoire de Nysse reprend sans cesse le verbe grec de ce passage, *epekteinomai*, « se tendre en avant » : plus l’âme connaît Dieu, plus elle le désire, et elle ne cesse jamais d’avancer vers lui. Les historiens ont tiré de ce verbe le nom de sa doctrine, l’épectase."),
  ('Romains 6:4', "Cyrille de Jérusalem s’appuie sur ce verset dans sa deuxième catéchèse mystagogique, adressée aux nouveaux baptisés. Plongés trois fois dans l’eau, ils ont imité par un signe la mort et la mise au tombeau du Christ, et ce signe leur a donné vraiment le salut."),
  ('Matthieu 25:40', "Jean Chrysostome rapproche cette parole du jugement de « Ceci est mon corps » : le Christ qu’on honore à l’autel est le même qu’on sert dans le pauvre (*Homélies sur Matthieu* L, 4). Il ne veut pas qu’on l’honore à l’église avec des étoffes de soie pour le laisser dehors, nu et transi."),
  ('Matthieu 26:39', "Maxime le Confesseur consacre un opuscule entier à cette prière de Gethsémani. Il y montre deux volontés dans le Christ, la divine et l’humaine, et la volonté humaine qui s’accorde librement à celle du Père ; le concile de Constantinople III l’a défini en 681."),
 ]),
 ('base-peres-occident', 'Les Pères d’Occident', [
  ('Exode 3:14', "Hilaire de Poitiers raconte, au début de *La Trinité*, que ce verset l’a saisi d’admiration quand il cherchait encore Dieu : il y trouvait sur Dieu une parole d’une grande justesse. Le prologue de Jean l’a ensuite conduit à la foi au Christ."),
  ('2 Corinthiens 3:6', "Augustin raconte qu’il entendait souvent Ambroise répéter ce verset à son peuple, comme une règle (*Confessions* VI, 4, 6). En lisant l’Ancien Testament selon l’Esprit, l’évêque de Milan a levé les objections qui tenaient Augustin loin de l’Écriture."),
  ('Matthieu 22:29', "Jérôme rapproche cette parole de Jésus de celle de Paul sur le Christ, « puissance de Dieu et sagesse de Dieu ». Il en conclut : « ignorer les Écritures, c’est ignorer le Christ » (*Commentaire sur Isaïe*, prologue)."),
  ('2 Pierre 1:4', "Dans un sermon de Noël, Léon le Grand reprend ce verset : « Reconnais, ô chrétien, ta dignité ; devenu participant de la nature divine, ne retourne pas par une conduite indigne à ton ancienne bassesse » (*Sermon* 21, 3)."),
  ('Job 1:21', "Grégoire le Grand s’arrête longuement, dans ses *Morales sur Job*, sur ce premier mot de Job quand il a tout perdu. Celui qui a reçu ses biens comme un don, explique-t-il, peut les rendre sans se révolter."),
 ]),
 ('base-saint-augustin', 'Saint Augustin', [
  ('Romains 13:13-14', "Dans un jardin de Milan, en 386, Augustin entend une voix d’enfant chanter « Prends, lis », ouvre les lettres de Paul et tombe sur ces versets. « Je ne voulus pas lire davantage, et ce n’était pas nécessaire » (*Confessions* VIII, 12, 29)."),
  ('Psaumes 145:3', "Les *Confessions* s’ouvrent sur ce verset. Quelques lignes plus loin vient la phrase la plus connue d’Augustin : « tu nous as faits pour toi, et notre cœur est sans repos tant qu’il ne repose pas en toi » (I, 1, 1)."),
  ('Romains 5:5', "Contre Pélage, Augustin revient sans cesse à ce verset. La grâce est l’amour de Dieu répandu dans le cœur par l’Esprit Saint : par lui, l’homme aime le bien et fait par amour ce que la loi commandait du dehors (*L’Esprit et la lettre* 3, 5)."),
  ('1 Corinthiens 4:7', "Augustin dit que cette question de Paul l’a convaincu, en 396, que même le commencement de la foi est un don de Dieu. Il la cite sans cesse dans ses derniers écrits sur la grâce, comme *La Prédestination des saints*."),
  ('Psaumes 87:3', "Au début du livre XI de *La Cité de Dieu*, Augustin explique qu’il a pris ce nom dans l’Écriture, et d’abord dans ce psaume. La Jérusalem chantée par le psalmiste devient chez lui l’image de la cité céleste, en pèlerinage sur la terre au milieu de la cité terrestre."),
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

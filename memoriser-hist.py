#!/usr/bin/env python3
"""Versets de base de Mémoriser pour le bloc « L’histoire de l’Église ».
Le texte de chaque verset est lu dans la Chérubin ; la note est écrite ici.
Un verset déjà présent dans un autre bloc garde exactement le même texte.
Les catégories se placent avant le bloc « Jésus-Christ », dans l'ordre du parcours.
Usage : python3 memoriser-hist.py [chemin de memoriser.json à compléter]"""
import json, sys, re, unicodedata, glob

BIBLE = '/root/.claude/skills/synced/0ecbfa39-bf16-4489-b54b-5c2efbbd424c_4e9301a7-4fe1-44a2-b731-c02e9c9e697f/bible/cherubin'
BLOC = 'L’histoire de l’Église'
AVANT = 'Jésus-Christ'

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
 ('base-eglise-antique', 'L’Église des premiers siècles', [
  ('Actes 4:32', "Luc décrit la première communauté de Jérusalem, unie au point de mettre ses biens en commun. Ce portrait a nourri toute l’histoire de la vie religieuse : saint Augustin ouvre sa Règle en rappelant qu’on vit ensemble pour n’avoir qu’une âme et qu’un cœur tournés vers Dieu."),
  ('Actes 11:26', "C’est à Antioche, la grande ville de Syrie où des païens ont reçu l’Évangile, que les disciples sont appelés chrétiens pour la première fois. Le nom dit qui ils suivent : le Christ."),
  ('Actes 15:28', "La lettre de l’assemblée de Jérusalem, vers 48-49, n’impose pas la circoncision aux païens convertis. Sa formule, l’Esprit Saint et nous, dit comment l’Église décide : ses pasteurs réunis, assistés par l’Esprit. Les conciles s’en sont réclamés."),
  ('Jean 15:20', "Jésus annonce à ses disciples qu’ils seront persécutés comme lui. Jusqu’à la paix de 313, les martyrs ont vécu cette parole, et leur sang, disait Tertullien, est une semence de chrétiens."),
  ('Matthieu 19:21', "Saint Athanase raconte qu’Antoine, jeune encore, entendit ce verset lu à l’église et le prit pour lui : il vendit ses biens et partit vers le désert. C’est le point de départ du monachisme (Vie d’Antoine, chapitre 2)."),
 ]),
 ('base-conciles', 'Les conciles de l’Église indivise', [
  ('Jean 10:30', "Arius disait le Fils créé, inférieur au Père. Le concile de Nicée, en 325, lui a répondu en confessant le Fils « consubstantiel au Père », de même nature que lui, ce que ce verset dit déjà à sa manière."),
  ('Luc 1:43', "Élisabeth appelle Marie « la mère de mon Seigneur ». Contre Nestorius, le concile d’Éphèse, en 431, a défendu le titre que la tradition lit déjà dans ce cri : en grec *Theotokos*, « Mère de Dieu »."),
  ('Jean 1:14', "Le Verbe s’est fait chair : c’est ce mystère que le concile de Chalcédoine, en 451, a précisé. Le Christ est une seule personne en deux natures, vrai Dieu et vrai homme, sans confusion ni séparation."),
  ('Colossiens 1:15', "Le Christ est l’image visible du Dieu invisible. C’est l’argument central des défenseurs des icônes : depuis que Dieu s’est fait voir dans la chair, on peut le représenter. Le concile de Nicée II, en 787, en a approuvé la vénération."),
 ]),
 ('base-haut-moyen-age', 'Le haut Moyen Âge', [
  ('Romains 10:14-15', "Paul montre que la foi naît de la prédication, et la prédication de l’envoi. Les missionnaires du haut Moyen Âge ont été envoyés ainsi : Augustin de Cantorbéry et Boniface par Rome, Cyrille et Méthode par Constantinople."),
  ('Psaumes 119:164', "La Règle de saint Benoît s’appuie sur ce verset pour fixer les sept offices du jour (chapitre 16). Bénédictins et clunisiens ont fait de cette louange continue le cœur de leur vie."),
  ('Jean 17:21', "Jésus prie pour l’unité de ses disciples, pour que le monde croie. La séparation entre Rome et Constantinople, qu’on date souvent de 1054, blesse cette unité ; les excommunications de 1054 ont été levées le 7 décembre 1965 par Paul VI et le patriarche Athénagoras."),
 ]),
 ('base-moyen-age', 'Le Moyen Âge central et tardif', [
  ('Matthieu 16:18', "Les papes de la réforme grégorienne et du Moyen Âge fondent sur ce verset la primauté de l’évêque de Rome, successeur de Pierre. La frise de la coupole de Saint-Pierre de Rome le porte en latin."),
  ('Matthieu 10:9', "Vers 1208, saint François entend à la messe l’Évangile de l’envoi des disciples, sans or ni argent, et décide d’en vivre à la lettre. Les ordres mendiants naissent de ce choix de la pauvreté au service de la prédication."),
 ]),
 ('base-reforme', 'La Réforme et le concile de Trente', [
  ('Romains 1:17', "Luther dit avoir compris l’Évangile en méditant ce verset : la justice de Dieu est celle qu’il donne au croyant. Le concile de Trente reçoit la justification par la foi, d’une foi qui ne va pas sans l’espérance et la charité (session VI, chapitre 7)."),
  ('Jacques 2:24', "Luther doutait de la lettre de Jacques, qu’il appelait une « épître de paille ». Le concile de Trente cite ce verset pour enseigner que la justice reçue grandit par les bonnes œuvres (session VI, chapitre 10)."),
  ('Éphésiens 2:8-9', "Le concile de Trente enseigne que rien de ce qui précède la justification, ni la foi ni les œuvres, ne mérite cette grâce (session VI, chapitre 8). Catholiques et luthériens l’ont redit ensemble dans la Déclaration commune signée à Augsbourg le 31 octobre 1999."),
 ]),
 ('base-epoque-moderne', 'L’Église à l’époque moderne', [
  ('Marc 16:15', "De François Xavier en Asie aux missions d’Amérique, l’élan missionnaire de l’époque moderne obéit à cet envoi. En 1622, Grégoire XV crée la congrégation de la Propagande pour le coordonner."),
  ('Jean 21:17', "Le Christ ressuscité confie à Pierre tout son troupeau. Le concile Vatican I, en 1870, s’appuie sur ce passage pour la primauté de Pierre et de ses successeurs (*Pastor aeternus*, chapitre 1)."),
  ('Luc 22:32', "Dans *Pastor aeternus*, le concile Vatican I cite cette prière du Christ pour Pierre (chapitre 4) : il y fonde l’infaillibilité du pape quand il définit une doctrine de foi ou de mœurs pour toute l’Église."),
 ]),
 ('base-eglise-contemporaine', 'L’Église contemporaine', [
  ('Matthieu 16:3', "Jean XXIII reprend l’expression « signes des temps » en convoquant le concile en 1961, et *Gaudium et spes* demande à l’Église de les scruter et de les interpréter à la lumière de l’Évangile (n. 4)."),
  ('Hébreux 13:8', "*Gaudium et spes* cite ce verset (n. 10) : sous les changements du monde, le Christ demeure. Le grand jubilé de l’an 2000 l’a pris pour devise."),
  ('Éphésiens 4:5', "Le décret sur l’œcuménisme *Unitatis redintegratio*, en 1964, cite ce verset pour dire l’unité que le Christ veut pour son Église (n. 2)."),
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

#!/usr/bin/env python3
"""Versets de base de Mémoriser pour le bloc « La doctrine sociale de l'Église ».
Le texte de chaque verset est lu dans la Chérubin ; la note est écrite ici.
Usage : python3 memoriser-ds.py [chemin de memoriser.json à compléter]"""
import json, sys, re, unicodedata, glob

BIBLE = '/root/.claude/skills/synced/0ecbfa39-bf16-4489-b54b-5c2efbbd424c_4e9301a7-4fe1-44a2-b731-c02e9c9e697f/bible/cherubin'
BLOC = 'La doctrine sociale de l’Église'

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
 ('base-principes-sociaux', 'Les principes de la doctrine sociale', [
  ('Genèse 1:27', "Toute la doctrine sociale repose sur cette phrase : chaque personne est créée à l’image de Dieu, et sa dignité ne dépend ni de ses capacités ni de son utilité. Les institutions, l’économie et l’État existent pour la personne, jamais l’inverse."),
  ('Jérémie 29:7', "Dieu demande aux exilés de travailler au bien d’une ville païenne, parce que leur propre bien en dépend. C’est déjà l’idée du bien commun : le bien de chacun passe par les conditions qui permettent à tous de vivre bien."),
  ('Lévitique 25:23', "La terre appartient à Dieu, et l’homme n’y est qu’un hôte. C’est la racine biblique de la destination universelle des biens : la propriété privée est légitime, mais elle reste ordonnée à l’usage de tous (*Gaudium et spes* 69)."),
  ('Matthieu 25:40', "Le Christ se reconnaît dans les plus petits : ce qu’on fait pour eux, on le fait pour lui. L’option préférentielle pour les pauvres vient de là, et Benoît XVI la disait implicite dans la foi au Christ (Aparecida, 2007)."),
  ('Exode 18:22', "Jéthro conseille à Moïse de laisser les affaires courantes à des juges choisis dans le peuple et de garder pour lui les plus graves. C’est l’intuition de la subsidiarité : l’échelon supérieur ne retire pas aux plus proches ce qu’ils peuvent faire, il les aide à le faire."),
  ('Galates 6:2', "Porter les fardeaux les uns des autres, c’est la solidarité vécue au jour le jour. Jean-Paul II en fait une vertu : « la détermination ferme et persévérante de travailler pour le bien commun » (*Sollicitudo rei socialis* 38)."),
  ('Éphésiens 4:15', "Saint Paul unit la vérité et l’amour. Benoît XVI a tiré de ce verset le titre de son encyclique *Caritas in veritate* (2009), qui fait de la charité dans la vérité le principe de toute la doctrine sociale."),
 ]),
 ('base-encycliques', 'Les grands textes de la doctrine sociale', [
  ('Jacques 5:4', "Léon XIII cite ce verset dans *Rerum novarum* (1891) : frustrer l’ouvrier de son salaire est un crime qui crie vers le ciel. Le juste salaire est resté depuis un point constant de l’enseignement social des papes."),
  ('Isaïe 32:17', "Pie XII avait pris ce verset pour devise, en latin *Opus iustitiae pax*, « la paix, œuvre de la justice ». Jean-Paul II l’a prolongé dans *Sollicitudo rei socialis* 39 : *Opus solidaritatis pax*, la paix, fruit de la solidarité."),
  ('Genèse 1:28', "Jean-Paul II ouvre sa réflexion biblique sur le travail par ce verset (*Laborem exercens*) : en travaillant, l’homme accomplit l’ordre reçu de Dieu de soumettre la terre. François rappelle dans *Laudato si’* que cette domination n’autorise pas une exploitation sans limite."),
  ('Luc 10:37', "*Fratelli tutti* (2020) fait de la parabole du bon Samaritain la clé de toute l’encyclique. L’ordre de Jésus déplace la question : on ne demande plus qui est mon prochain, on se fait le prochain de celui qui souffre."),
  ('Matthieu 13:52', "Jean-Paul II applique cette parole à la doctrine sociale au début de *Centesimus annus* (1991) : elle garde ses principes et les éclaire devant les « choses nouvelles » de chaque époque. C’est la loi de tout le corpus, de *Rerum novarum* à nos jours."),
 ]),
 ('base-societe', 'Les domaines de la vie sociale', [
  ('Genèse 2:24', "La famille naît de l’union stable d’un homme et d’une femme. L’Église en fait la « cellule première et vitale de la société » (*Familiaris consortio* 42) : la société se construit à partir d’elle, et elle lui doit protection."),
  ('Genèse 2:15', "Dieu confie le jardin à l’homme pour le cultiver et le garder, avant toute faute : le travail fait partie de sa vocation. *Laudato si’* 67 lit dans ces deux verbes une relation de réciprocité responsable entre l’homme et la nature."),
  ('Matthieu 6:24', "Jésus présente l’argent comme un maître qui dispute à Dieu le cœur de l’homme. La doctrine sociale en tire que l’économie doit servir la personne, et François dénonce une « nouvelle idolâtrie de l’argent » (*Evangelii gaudium* 55)."),
  ('Matthieu 22:21', "Jésus distingue ce qui revient à César et ce qui revient à Dieu. L’Église en tire l’autonomie de la communauté politique et de l’Église, chacune dans son domaine (*Gaudium et spes* 76), et la limite de tout pouvoir humain."),
  ('Actes 5:29', "Devant le Sanhédrin qui leur défend de prêcher, Pierre et les apôtres posent la limite de toute autorité humaine. Le Catéchisme cite ce verset à propos du refus d’obéir à un ordre contraire à la loi de Dieu (n. 2242)."),
  ('Deutéronome 6:6-7', "Moïse confie aux parents la transmission de la foi, à la maison comme en chemin. L’Église enseigne que les parents sont les premiers et principaux éducateurs de leurs enfants (*Gravissimum educationis* 3), un droit que l’État doit respecter et soutenir."),
  ('Actes 17:26', "À Athènes, Paul affirme que tout le genre humain vient d’un seul homme. C’est le fondement de l’unité de la famille humaine, que le concile rappelle en ouvrant *Nostra aetate*, et de tout l’enseignement de l’Église sur la communauté des nations."),
  ('Lévitique 19:34', "La Loi demande d’aimer l’immigré comme soi-même, parce qu’Israël a été étranger en Égypte. La doctrine sociale y enracine le devoir d’accueil, que François résume en quatre verbes : accueillir, protéger, promouvoir, intégrer."),
  ('Luc 12:15', "La vie ne dépend pas de l’abondance des biens. *Laudato si’* présente la sobriété, vécue librement, comme une libération (n. 223) : elle délivre de la course à la consommation, qui épuise la terre et oublie les pauvres."),
  ('Isaïe 2:4', "Le prophète annonce le jour où les armes deviendront des outils de travail. Les papes s’en inspirent quand ils demandent le désarmement, et Paul VI le disait à l’ONU le 4 octobre 1965 : « Jamais plus la guerre ! »"),
 ]),
]

def typo(s):
    s = re.sub(r' ([:;!?»])', '\u00a0\\1', s)
    return re.sub(r'« ', '«\u00a0', s)

def categories():
    out = []
    for cid, nom, vs in CATEGORIES:
        out.append({'id': cid, 'name': {'fr': nom}, 'bloc': BLOC, 'kind': 'v',
                    'verses': [{'id': ident(r), 'fr': {'ref': r, 'text': texte(r)}, 'note': typo(n)} for r, n in vs]})
    return out

if __name__ == '__main__':
    cats = categories()
    if len(sys.argv) > 1:
        p = sys.argv[1]
        d = json.load(open(p))
        ids = {c['id'] for c in cats}
        d['categories'] = [c for c in d['categories'] if c['id'] not in ids] + cats
        json.dump(d, open(p, 'w'), ensure_ascii=False, indent=1)
        open(p, 'a').write('\n')
        print('ajouté', sum(len(c['verses']) for c in cats), 'versets dans', len(cats), 'catégories')
    else:
        print(json.dumps(cats, ensure_ascii=False, indent=1)[:3000])

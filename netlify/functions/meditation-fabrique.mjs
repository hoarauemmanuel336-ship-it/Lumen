/* ============================================================
   LUMEN — la fabrique de la méditation du jour
   Fonction de fond (quinze minutes), lancée chaque heure par l'horloge
   (meditation-horloge.mjs) tant que la méditation manque :
   1. elle s'arrête si Emmanuel a mis les méditations en pause ;
   2. elle lit les crédits ElevenLabs qui restent et en tire la longueur
      permise aujourd'hui ;
   3. Claude écrit la méditation, d'après le journal des méditations
      parues, pour varier : un sujet peut revenir avec un regard neuf,
      sans redire la même chose (« la règle ne doit pas être trop stricte ») ;
   4. Claude la relit avec la skill humaniser d'Emmanuel (« il faudra
      toujours faire passer un coup de /humaniser ») ;
   5. la voix « Victoria » d'ElevenLabs la lit, et donne le moment où
      chaque signe est dit : l'accueil fait suivre le texte à la voix ;
   6. tout se range dans le coffre (netlify/serveur/meditation.js), et
      la méditation paraît.
   Une méditation paraît toujours avec sa voix (« voix + texte, jamais
   que le texte ») : sans voix, rien ne paraît, et l'accueil le dit.
   Chaque étape faite reste faite : une voix qui a échoué se refait à
   l'heure suivante sans réécrire le texte. Chaque passage note où il
   en est dans etat.json, qu'Emmanuel voit sur l'accueil.
   ============================================================ */
import BIBLE from '../../contenu/bible.json' with { type: 'json' };
import { SAVOIR } from '../savoir/savoir.js';
import { demande } from '../serveur/r2.js';
import { DOSSIER, jourDe, lendemain, jourValide, litJson, ecritJson, jetonFabrique } from '../serveur/meditation.js';

/* Le modèle suit le choix du moment pour l'écriture du site ; le niveau
   de réflexion est « moyen », comme pour tous les usages du site
   (Emmanuel : « le niveau de réflexion doit toujours être sur Moyen »). */
const MODELE = 'claude-opus-5-5';
/* La voix et son modèle : Emmanuel a choisi « Victoria – Warm and calm »
   dans son compte ElevenLabs, et veut « toujours le meilleur modèle ». La
   voix se retrouve par son nom : son identifiant n'est écrit nulle part. */
const VOIX = 'Victoria';
const MODELE_VOIX = 'eleven_v4';
const ELEVEN = 'https://api.elevenlabs.io';
/* Longueur : l'IA choisit entre trois et quatre minutes selon le sujet
   (choix d'Emmanuel), soit 3 000 à 4 000 signes ; un signe lu coûte un
   crédit. Quand les crédits du mois sont comptés, la méditation
   raccourcit, jusqu'à 1 500 signes ; en dessous, elle attend des
   crédits. */
const SIGNES_MIN = 3000;
const SIGNES_MAX = 4000;
const SIGNES_PLANCHER = 1500;
/* Une panne imprévue se retente trois fois par jour, l'écriture comme la
   voix ; une pause, une clé absente ou des crédits épuisés ne comptent
   pas : la fabrique repart d'elle-même quand ils reviennent. */
const ESSAIS = 3;

const env = n => process.env[n] || '';

class Arret extends Error {
  constructor(raison, detail) { super(detail || raison); this.raison = raison; this.detail = detail || ''; }
}

/* ── LES VERSETS ── la Chérubin, lue ici même pour l'outil de l'IA */
const sansAccent = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const LIVRES = new Map();
for (const l of BIBLE.data) LIVRES.set(sansAccent(l.nom), l);
const ALIAS = { psaume: 'psaumes', ps: 'psaumes', actes: 'actes des apotres', ac: 'actes des apotres', qohelet: 'ecclesiaste', ecclesiastique: 'siracide', cantique: 'cantique des cantiques' };
function livre(nom) {
  const n = sansAccent(nom);
  return LIVRES.get(n) || LIVRES.get(ALIAS[n] || '') || null;
}
function versets(reference) {
  const m = String(reference).replace(/ /g, ' ').trim().match(/^(.+?)\s+(\d+)(?:\s*:\s*(\d+)(?:\s*-\s*(\d+))?)?$/);
  if (!m) return null;
  const l = livre(m[1]);
  if (!l) return null;
  const ch = (l.chapitres || []).find(c => c.n === +m[2]);
  if (!ch) return null;
  const de = m[3] ? +m[3] : 1, a = m[4] ? +m[4] : (m[3] ? +m[3] : Infinity);
  const vv = ch.versets.filter(v => v.v >= de && v.v <= a).slice(0, 60);
  if (!vv.length) return null;
  const fin = vv[vv.length - 1].v;
  return { reference: (l.nom === 'Psaumes' ? 'Psaume' : l.nom) + ' ' + ch.n + ':' + vv[0].v + (fin > vv[0].v ? '-' + fin : ''), texte: vv.map(v => v.t).join(' ') };
}
function lireVersets(entree) {
  const trouves = [], introuvables = [];
  for (const r of (Array.isArray(entree && entree.references) ? entree.references : []).slice(0, 40)) {
    const v = versets(r);
    if (v) trouves.push(v); else introuvables.push(String(r));
  }
  return { versets: trouves, introuvables };
}

const OUTIL_VERSETS = {
  name: 'lire_versets',
  description: 'Renvoie le texte exact de versets bibliques dans la Chérubin, la traduction du site. Les références s’écrivent au format « Jean 3:16 » ou « 1 Corinthiens 13:4-7 », avec les noms de livres en français sous leur forme standard.',
  input_schema: { type: 'object', properties: { references: { type: 'array', items: { type: 'string' } } }, required: ['references'] },
};
const OUTIL_RENDRE = {
  name: 'rendre_meditation',
  description: 'Rend la méditation achevée.',
  input_schema: {
    type: 'object',
    properties: {
      titre: { type: 'string', description: 'Le titre de la méditation, court.' },
      sujet: { type: 'string', description: 'Son sujet, en quelques mots.' },
      resume: { type: 'string', description: 'En une ou deux phrases, ce qu’elle dit, pour le journal.' },
      texte_lu: { type: 'string', description: 'Le texte que lit la voix.' },
      texte_ecrit: { type: 'string', description: 'Le même texte, à lire à l’écran.' },
    },
    required: ['titre', 'sujet', 'resume', 'texte_lu', 'texte_ecrit'],
  },
};
const OUTIL_RELU = {
  name: 'rendre_texte_relu',
  description: 'Rend la méditation relue.',
  input_schema: {
    type: 'object',
    properties: {
      titre: { type: 'string' },
      texte_lu: { type: 'string' },
      texte_ecrit: { type: 'string' },
    },
    required: ['titre', 'texte_lu', 'texte_ecrit'],
  },
};

const REGLES = () => SAVOIR.instructions
  ? '\n\n<instructions>\nLes règles d’écriture du site, les mêmes pour tous.\n\n' + SAVOIR.instructions + '\n</instructions>' : '';

function consigne(jour, journal, plafond) {
  const date = new Date(jour + 'T12:00:00Z').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const passees = (journal || []).slice(-400).map(m => '- ' + m.date + ' · ' + m.titre + ' · ' + m.resume).join('\n');
  const longueur = plafond >= SIGNES_MIN
    ? `Tu choisis la longueur que demande le sujet : texte_lu compte entre ${SIGNES_MIN.toLocaleString('fr-FR')} et ${plafond.toLocaleString('fr-FR')} signes, espaces et indications entre crochets comprises, soit trois à quatre minutes de voix.`
    : `texte_lu compte au plus ${plafond.toLocaleString('fr-FR')} signes, espaces et indications entre crochets comprises : la méditation est plus courte aujourd’hui.`;
  return `Tu écris la méditation du jour du site Lumen, un site d’étude de la foi catholique. Chaque nuit, à minuit, une nouvelle méditation paraît sur l’accueil : une voix de synthèse la lit, et son texte s’affiche pour qui veut le suivre ou le relire. Elle est la même pour tous. Elle paraîtra le ${date}.

Le sujet est libre : tout ce qui, dans la foi, l’Écriture, la vie de l’Église ou la vie de tous les jours, peut nourrir la prière de celui qui écoute. Tu le choisis toi-même. Le journal plus bas donne les méditations déjà parues, pour que tu varies : un sujet peut revenir, surtout s’il date un peu, à condition de l’aborder d’une façon nouvelle ; ce qui se répète, c’est redire la même chose de la même façon, ou reprendre un sujet que les toutes dernières méditations viennent de traiter.

Elle s’adresse à la fois à quelqu’un qui découvre la foi et à quelqu’un qui la vit depuis longtemps. Un terme de foi s’explique en quelques mots au moment où il apparaît, sans alourdir la phrase, et le fond garde assez de profondeur pour nourrir aussi le croyant confirmé.

Elle reste une méditation : elle nourrit la prière par l’Écriture et la vie de tous les jours, en langage simple, et laisse aux cours ce qui relève de l’étude.

Elle mêle la tenue d’une homélie et l’intériorité d’une méditation. Elle part d’un passage de l’Écriture qu’elle choisit elle-même, en dehors des lectures de la messe du jour et du lendemain (Emmanuel : « jamais sur les évangiles du jour »), qu’elle lit en entier puis commente pas à pas, à la lumière de la tradition de l’Église. Elle se termine en rassemblant ce qui a été médité en une parole nette, qui place l’auditeur devant ce que Dieu lui demande. Le sujet reste libre.

Le ton est grave et sobre, celui d’un prêtre qui prêche devant des adultes. Elle affirme ce que la foi enseigne avec netteté et laisse à la parole de Dieu tout son poids, ses exigences comprises quand le passage les porte. La consolation qu’elle donne vient de la vérité du texte, et non de la douceur des mots. La langue est précise et retenue, et les images restent celles de l’Écriture. Chaque phrase du commentaire apporte ce que le texte ne dit pas de lui-même : le sens d’un geste, le lien avec le reste de l’Écriture, ce que la parole demande à celui qui l’écoute. Ce qu’un verset dit clairement reste dans le verset. La langue va droit à ce qu’elle affirme et nomme les choses telles qu’elles sont. Un verset s’amène en peu de mots, qui ouvrent sur lui sans annoncer ce qu’il va dire. Tu vouvoies l’auditeur. Tu ouvres la méditation autrement que par une question. Elle avance au rythme de la voix : des phrases qui se disent bien, une idée à la fois.

Tout verset cité est d’abord lu avec l’outil lire_versets, puis cité mot pour mot d’après la Chérubin, en entier. Tu demandes en une fois tous les versets dont tu as besoin.

${longueur}

Tu rends la méditation avec l’outil rendre_meditation :
- titre : court ;
- sujet : en quelques mots ;
- resume : en une ou deux phrases, ce qu’elle dit ;
- texte_lu : le texte que lit la voix. Tout s’y écrit comme cela se prononce : nombres, dates et références en toutes lettres, une référence dite simplement dans la phrase (« saint Paul écrit aux Corinthiens »). Tu peux y poser, avec mesure, des indications de jeu en anglais entre crochets, qui guident la voix sans être lues, comme [softly] ou [pause]. Ni titre ni mise en forme : des paragraphes séparés par une ligne vide ;
- texte_ecrit : le même texte, pour l’écran, sans les indications entre crochets. Les versets s’y citent en italique entre guillemets français, la référence en gras après, au format **Jean 3:16** ; l’italique s’écrit *ainsi*, le gras **ainsi**. Des paragraphes séparés par une ligne vide, sans titre.

<journal>
${passees || '(aucune méditation n’a encore paru)'}
</journal>`;
}

function consigneRelecture(plafond) {
  return `Tu relis la méditation du jour du site Lumen avant qu’elle paraisse, avec la méthode de relecture ci-dessous (la skill humaniser), en mode intégré : tu rends seulement le texte final, avec l’outil rendre_texte_relu.

La méditation a deux formes du même texte : texte_lu, que lit une voix de synthèse, écrit comme il se prononce, avec ses indications de jeu entre crochets ; texte_ecrit, affiché à l’écran, avec sa mise en forme (*italique*, **gras**, paragraphes séparés par une ligne vide). Tu relis les deux, et elles restent le même texte, chacune dans sa forme. Les versets cités restent mot pour mot, avec leur référence ; les indications entre crochets restent dans texte_lu. Tu relis aussi le titre. Le texte suit les règles d’écriture plus bas, qui font la voix de l’auteur. texte_lu garde au plus ${plafond.toLocaleString('fr-FR')} signes.

<humaniser>
${SAVOIR.humaniser || ''}
</humaniser>` + REGLES();
}

/* ── CLAUDE ── */
async function claude(corps) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': env('ANTHROPIC_API_KEY'), 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify(Object.assign({ model: MODELE, max_tokens: 20000, thinking: { type: 'adaptive' }, output_config: { effort: 'medium' } }, corps)),
  }).catch(() => null);
  if (!r) throw new Error('Claude ne répond pas');
  const t = await r.text();
  if (!r.ok) {
    let m = '';
    try { m = JSON.parse(t).error.message || ''; } catch (_) { m = t.slice(0, 300); }
    if (/credit balance|billing|purchase credits/i.test(m)) throw new Arret('credits-claude');
    throw new Error('Claude ' + r.status + (m ? ' : ' + m : ''));
  }
  return JSON.parse(t);
}

/* un échange avec outils, jusqu'à ce que l'IA rende ce qu'on attend */
async function echange(system, tools, premier, nomRendu, verifie) {
  const messages = [{ role: 'user', content: premier }];
  for (let tour = 0; tour < 8; tour++) {
    const rep = await claude({ system: [{ type: 'text', text: system }], tools, messages });
    messages.push({ role: 'assistant', content: rep.content });
    const appels = rep.content.filter(b => b.type === 'tool_use');
    if (!appels.length) { messages.push({ role: 'user', content: 'Rends ton travail avec l’outil ' + nomRendu + '.' }); continue; }
    const resultats = [];
    let rendu = null;
    for (const b of appels) {
      if (b.name === 'lire_versets') {
        resultats.push({ type: 'tool_result', tool_use_id: b.id, content: JSON.stringify(lireVersets(b.input)) });
      } else if (b.name === nomRendu) {
        const faute = verifie(b.input || {});
        if (faute) resultats.push({ type: 'tool_result', tool_use_id: b.id, is_error: true, content: faute });
        else { rendu = b.input; resultats.push({ type: 'tool_result', tool_use_id: b.id, content: 'Reçu.' }); }
      } else {
        resultats.push({ type: 'tool_result', tool_use_id: b.id, is_error: true, content: 'Outil inconnu.' });
      }
    }
    if (rendu) return rendu;
    messages.push({ role: 'user', content: resultats });
  }
  throw new Error('l’IA n’a pas rendu la méditation');
}

function verifieTextes(champs, plafond) {
  return m => {
    const manque = champs.filter(k => !String(m[k] || '').trim());
    if (manque.length) return 'Il manque : ' + manque.join(', ') + '.';
    const n = String(m.texte_lu).length;
    if (n > plafond + 150) return `texte_lu compte ${n} signes, pour ${plafond} au plus : raccourcis-le, et texte_ecrit avec lui.`;
    return '';
  };
}

async function ecrisMeditation(jour, journal, plafond) {
  const brut = await echange(consigne(jour, journal, plafond) + REGLES(), [OUTIL_VERSETS, OUTIL_RENDRE],
    'Écris la méditation.', 'rendre_meditation', verifieTextes(['titre', 'sujet', 'resume', 'texte_lu', 'texte_ecrit'], plafond));
  const relu = await echange(consigneRelecture(plafond), [OUTIL_RELU],
    'Relis cette méditation.\n\n' + JSON.stringify({ titre: brut.titre, texte_lu: brut.texte_lu, texte_ecrit: brut.texte_ecrit }, null, 1),
    'rendre_texte_relu', verifieTextes(['titre', 'texte_lu', 'texte_ecrit'], plafond));
  return Object.assign({}, brut, relu);
}

/* La typographie française du texte affiché : apostrophe courbe, espaces
   insécables devant « : ; ! ? » et dans les guillemets. */
function typo(s) {
  return String(s)
    .replace(/'/g, '’')
    .replace(/[  ]*([:;!?»])/g, (x, p, i, tout) => (p === ':' && /\d$/.test(tout.slice(0, i)) && /^\d/.test(tout.slice(i + x.length))) ? x : ' ' + p)
    .replace(/«[  ]*/g, '« ')
    .replace(/ +/g, ' ');
}

/* ── ELEVENLABS ── */
async function eleven(chemin, options = {}) {
  return fetch(ELEVEN + chemin, Object.assign({}, options, { headers: Object.assign({ 'xi-api-key': env('ELEVENLABS_API_KEY') }, options.headers || {}) }));
}
/* Les crédits du mois : ce qui reste, les jours avant le renouvellement
   (aujourd'hui compris) et la part de chaque jour. */
async function credits() {
  const r = await eleven('/v1/user/subscription').catch(() => null);
  if (!r || !r.ok) return null;
  const s = await r.json();
  const reste = Math.max(0, (s.character_limit || 0) - (s.character_count || 0));
  const fin = (s.next_character_count_reset_unix || 0) * 1000;
  const jours = fin > Date.now() ? Math.max(1, Math.ceil((fin - Date.now()) / 864e5)) : 1;
  return { reste, jours, parJour: Math.floor(reste / jours), renouvellement: fin ? new Date(fin).toISOString().slice(0, 10) : '' };
}
async function voix() {
  for (const chemin of ['/v2/voices?page_size=100&search=' + encodeURIComponent(VOIX), '/v1/voices']) {
    const r = await eleven(chemin).catch(() => null);
    if (!r || !r.ok) continue;
    const d = await r.json();
    const v = (d.voices || []).find(x => sansAccent(x.name || '').startsWith(sansAccent(VOIX)));
    if (v) return v.voice_id;
  }
  throw new Arret('voix');
}
async function refus(r) {
  const t = (await r.text()).slice(0, 400);
  if (/quota|credits|insufficient/i.test(t)) throw new Arret('credits-eleven');
  if (r.status === 401) throw new Arret('cle-eleven', 'clé refusée');
  return 'ElevenLabs ' + r.status + ' : ' + t;
}
/* La voix, avec le moment où chaque signe est dit ; si ElevenLabs ne
   rend pas ces moments, la voix seule, et l'accueil les estime d'après
   la longueur du texte. */
async function lis(texte) {
  const id = await voix();
  const corps = JSON.stringify({ text: texte, model_id: MODELE_VOIX });
  const r = await eleven('/v1/text-to-speech/' + id + '/with-timestamps?output_format=mp3_44100_128', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: corps,
  }).catch(() => null);
  if (r && r.ok) {
    const d = await r.json();
    if (d && d.audio_base64) return { son: new Uint8Array(Buffer.from(d.audio_base64, 'base64')), alignement: d.alignment || d.normalized_alignment || null };
  } else if (r) await refus(r);
  const r2 = await eleven('/v1/text-to-speech/' + id + '?output_format=mp3_44100_128', {
    method: 'POST', headers: { 'content-type': 'application/json', accept: 'audio/mpeg' }, body: corps,
  }).catch(() => null);
  if (!r2) throw new Error('ElevenLabs ne répond pas');
  if (!r2.ok) throw new Error(await refus(r2));
  return { son: new Uint8Array(await r2.arrayBuffer()), alignement: null };
}

/* ── LE TEXTE QUI SUIT LA VOIX ──
   Pour chaque mot du texte affiché, le moment où la voix le dit. Le texte
   lu et le texte affiché ont les mêmes paragraphes ; dans un paragraphe,
   un mot affiché prend le moment du signe qui occupe la même place dans
   le paragraphe lu. Les mots se séparent aux espaces ordinaires et aux
   retours à la ligne, jamais aux espaces insécables : l'accueil découpe
   le texte de la même façon (pages/accueil.js). */
function paragraphes(t) {
  const out = [], re = /[^\n]+(?:\n(?![ \t]*\n)[^\n]*)*/g;
  let m;
  while ((m = re.exec(t))) {
    const brut = m[0], a = m.index + brut.length - brut.trimStart().length, texte = brut.trim();
    if (texte) out.push({ a, b: a + texte.length, texte });
  }
  return out;
}
function tempsDesMots(texteLu, texteAffiche, alignement, duree) {
  const n = texteLu.length || 1;
  const al = alignement && Array.isArray(alignement.character_start_times_seconds) && alignement.character_start_times_seconds.length ? alignement.character_start_times_seconds : null;
  const moment = i => al ? al[Math.max(0, Math.min(al.length - 1, Math.floor(i * al.length / n)))] : duree * i / n;
  const lus = paragraphes(texteLu), vus = paragraphes(texteAffiche);
  const total = texteAffiche.length || 1;
  return vus.map((p, k) => {
    const lu = lus.length === vus.length ? lus[k] : { a: Math.floor(p.a * n / total), b: Math.floor(p.b * n / total) };
    const mots = [], re = /[^ \t\r\n]+/g;
    let m;
    while ((m = re.exec(p.texte))) mots.push(Math.round(moment(lu.a + Math.floor(m.index / p.texte.length * (lu.b - lu.a))) * 100) / 100);
    return mots;
  });
}

/* ── LA FABRIQUE ── */
async function fabrique(jour, etat) {
  const reglages = (await litJson('reglages.json')) || {};
  if (reglages.pause) throw new Arret('pause');
  /* le jour d'une reprise après pause, seul le lendemain se prépare */
  if (reglages.reprise === jour) throw new Arret('reprise');
  /* un jour prolongé garde la méditation de la veille (meditation-horloge.mjs) */
  if (reglages.prolonge === jour) throw new Arret('reprise');
  let m = await litJson(jour + '.json');
  if (m && m.audio) return;
  if (!env('ELEVENLABS_API_KEY')) throw new Arret('cle-eleven');
  const essais = (await litJson('essais/' + jour + '.json')) || { texte: 0, voix: 0 };
  const c = await credits();
  /* sans lecture des crédits (clé sans le droit « User »), la longueur
     ordinaire ; la voix refusera d'elle-même si les crédits manquent */
  if (c) etat.credits = c;
  if (c && c.reste < SIGNES_PLANCHER) throw new Arret('credits-eleven');

  if (!m) {
    if (essais.texte >= ESSAIS) throw new Arret('erreur', essais.derniere || 'trois essais ont échoué');
    const plafond = c ? Math.min(SIGNES_MAX, Math.max(c.parJour, SIGNES_PLANCHER), c.reste) : SIGNES_MAX;
    const journal = (await litJson('journal.json')) || { meditations: [] };
    let r;
    try { r = await ecrisMeditation(jour, journal.meditations.filter(x => x.date < jour), plafond); }
    catch (e) {
      if (!(e instanceof Arret)) { essais.texte++; essais.derniere = String(e.message || e); await ecritJson('essais/' + jour + '.json', essais); }
      throw e;
    }
    m = {
      date: jour,
      titre: typo(r.titre.trim()),
      sujet: typo(r.sujet.trim()),
      resume: typo(r.resume.trim()),
      texte: typo(r.texte_ecrit.trim()),
      texteLu: r.texte_lu.trim(),
      audio: false,
      duree: 0,
      modele: MODELE,
    };
    await ecritJson(jour + '.json', m);
  }

  if (c && c.reste < m.texteLu.length) throw new Arret('credits-eleven');
  if (essais.voix >= ESSAIS) throw new Arret('erreur', essais.derniere || 'trois essais ont échoué');
  let lu;
  try { lu = await lis(m.texteLu); }
  catch (e) {
    if (!(e instanceof Arret)) { essais.voix++; essais.derniere = String(e.message || e); await ecritJson('essais/' + jour + '.json', essais); }
    throw e;
  }
  const r = await demande('PUT', DOSSIER + jour + '.mp3', { entetes: { 'content-type': 'audio/mpeg' }, corps: lu.son });
  if (!r.ok) throw new Error('coffre ' + r.status + ' (voix)');
  m.audio = true;
  /* 128 kbit/s : 16 000 octets par seconde */
  m.duree = Math.round(lu.son.length / 16000);
  m.temps = tempsDesMots(m.texteLu, m.texte, lu.alignement, m.duree);
  m.voix = VOIX + ' · ' + MODELE_VOIX;
  await ecritJson(jour + '.json', m);
  /* la méditation paraît : elle entre au journal */
  const journal = (await litJson('journal.json')) || { meditations: [] };
  journal.meditations = journal.meditations.filter(x => x.date !== jour)
    .concat([{ date: jour, titre: m.titre, sujet: m.sujet, resume: m.resume, duree: m.duree }])
    .sort((a, b) => a.date.localeCompare(b.date));
  await ecritJson('journal.json', journal);
  if (c) etat.credits = Object.assign({}, c, { reste: Math.max(0, c.reste - m.texteLu.length) });
}

export default async (req) => {
  const cleApi = env('ANTHROPIC_API_KEY');
  const c = await req.json().catch(() => ({}));
  const jour = c && c.jour;
  /* seule l'horloge met la fabrique en route, pour aujourd'hui ou demain */
  const auj = jourDe();
  if (!cleApi || !jourValide(jour) || (jour !== auj && jour !== lendemain(auj))) return;
  if ((req.headers.get('x-lumen-jeton') || '') !== await jetonFabrique(cleApi, jour)) return;
  const etat = { jour, quand: new Date().toISOString(), raison: 'ok' };
  try {
    await fabrique(jour, etat);
  } catch (e) {
    if (e instanceof Arret) { etat.raison = e.raison; if (e.detail) etat.detail = e.detail; }
    else { etat.raison = 'erreur'; etat.detail = String(e && e.message || e).slice(0, 300); }
  }
  console.log('Méditation du ' + jour + ' : ' + etat.raison + (etat.detail ? ' (' + etat.detail + ')' : ''));
  await ecritJson('etat.json', etat).catch(() => {});
};

export const config = { background: true, path: '/api/meditation-fabrique' };

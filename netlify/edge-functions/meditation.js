/* ============================================================
   LUMEN — la méditation du jour, servie à l'accueil
   · /api/meditation : la dernière méditation parue et la liste des
     trente derniers jours ;
   · /api/meditation/AAAA-MM-JJ : la méditation d'un jour ;
   · /api/meditation/AAAA-MM-JJ.mp3 : sa voix, lue par morceaux (le
     lecteur avance où l'on veut sans tout charger), ou téléchargée avec
     ?telecharger.
   · POST /api/meditation, pour le seul compte d'Emmanuel : où en est la
     fabrique (crédits, pause, panne), et la pause des méditations, qu'il
     règle dans « Mon compte ».
   Seuls les trente derniers jours se réécoutent (Emmanuel : « sur une
   période de 1 mois »), et seulement les méditations parues avec leur
   voix ; celle du lendemain, préparée la veille, reste cachée jusqu'à
   minuit. La méditation s'écrit chaque nuit dans
   netlify/functions/ ; son rangement est décrit dans
   netlify/serveur/meditation.js. La méditation se lit librement ; seul
   le compte d'Emmanuel la met en pause.
   ============================================================ */
import { demande } from '../serveur/r2.js';
import { estProprietaire } from '../serveur/compte.js';
import { DOSSIER, jourDe, jourValide, premierJourGarde, litJson, ecritJson } from '../serveur/meditation.js';

function json(corps, statut) {
  return new Response(JSON.stringify(corps), {
    status: statut || 200,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'private, no-cache' },
  });
}
const introuvable = () => json({ erreur: 'introuvable' }, 404);

/* ce que la page reçoit d'une méditation : ni le texte préparé pour la
   voix, ni le résumé destiné à l'IA */
function publique(m) {
  return { date: m.date, titre: m.titre, sujet: m.sujet, texte: m.texte, duree: m.duree || 0, temps: m.temps || null };
}

/* les réglages d'Emmanuel : ce que voit lui seul, et la pause */
async function reglages(req) {
  if (!(await estProprietaire(req))) return json({ proprio: false });
  const c = await req.json().catch(() => ({}));
  const r = (await litJson('reglages.json')) || {};
  if (c && c.action === 'pause') {
    /* remise en route après une pause : la méditation du jour n'est pas
       rattrapée, la suivante paraît à minuit (meditation-horloge.mjs) */
    if (r.pause && !c.pause) r.reprise = jourDe();
    r.pause = !!c.pause;
    await ecritJson('reglages.json', r);
  }
  return json({ proprio: true, pause: !!r.pause, reprise: r.reprise === jourDe(), etat: (await litJson('etat.json')) || null, aujourdhui: jourDe() });
}

async function voix(req, jour, url) {
  const entetes = {};
  for (const h of ['range', 'if-none-match', 'if-modified-since']) {
    const v = req.headers.get(h);
    if (v) entetes[h] = v;
  }
  const r = await demande(req.method === 'HEAD' ? 'HEAD' : 'GET', DOSSIER + jour + '.mp3', { entetes });
  if (r.status === 404) return new Response('Introuvable.', { status: 404 });
  const h = new Headers();
  for (const k of ['content-length', 'content-range', 'etag', 'last-modified']) {
    const v = r.headers.get(k);
    if (v) h.set(k, v);
  }
  h.set('content-type', 'audio/mpeg');
  h.set('accept-ranges', 'bytes');
  h.set('cache-control', 'private, max-age=2592000');
  h.set('x-content-type-options', 'nosniff');
  if (url.searchParams.has('telecharger')) {
    h.set('content-disposition', `attachment; filename="meditation-${jour}.mp3"; filename*=UTF-8''${encodeURIComponent('Méditation du ' + jour + '.mp3')}`);
  }
  return new Response(req.method === 'HEAD' ? null : r.body, { status: r.status, headers: h });
}

export default async (req) => {
  const url = new URL(req.url);
  if (req.method === 'POST' && url.pathname === '/api/meditation') {
    try { return await reglages(req); }
    catch (e) { return json({ erreur: 'coffre', message: 'Le coffre n’a pas répondu.' }, 502); }
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return new Response('Méthode non permise.', { status: 405 });
  const suite = url.pathname.replace(/^\/api\/meditation\/?/, '');
  const aujourdhui = jourDe(), premier = premierJourGarde(aujourdhui);
  const garde = j => jourValide(j) && j >= premier && j <= aujourdhui;
  try {
    if (!suite) {
      const [journal, r] = await Promise.all([litJson('journal.json'), litJson('reglages.json')]);
      const liste = ((journal && journal.meditations) || []).filter(m => garde(m.date)).sort((a, b) => b.date.localeCompare(a.date))
        .map(m => ({ date: m.date, titre: m.titre, sujet: m.sujet, duree: m.duree || 0 }));
      const derniere = liste.length ? await litJson(liste[0].date + '.json') : null;
      return json({ aujourdhui, liste, derniere: derniere && derniere.audio ? publique(derniere) : null, pause: !!(r && r.pause), reprise: !!(r && r.reprise === aujourdhui), prolonge: !!(r && r.prolonge === aujourdhui) });
    }
    const mp3 = suite.match(/^(\d{4}-\d{2}-\d{2})\.mp3$/);
    if (mp3) return garde(mp3[1]) ? await voix(req, mp3[1], url) : new Response('Introuvable.', { status: 404 });
    if (!garde(suite)) return introuvable();
    const m = await litJson(suite + '.json');
    return m && m.audio ? json(publique(m)) : introuvable();
  } catch (e) {
    return json({ erreur: 'coffre', message: 'Le coffre n’a pas répondu.' }, 502);
  }
};

export const config = { path: ['/api/meditation', '/api/meditation/*'] };

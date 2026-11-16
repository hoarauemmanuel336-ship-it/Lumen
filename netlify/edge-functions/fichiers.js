/* ============================================================
   LUMEN — le passage vers le coffre R2
   · /fichiers/<clé> sert un fichier du coffre (page, image, PDF…) au
     seul compte d'Emmanuel, avec les requêtes partielles : un audio ou
     une vidéo se lit et s'avance sans tout charger.
   · /api/fichiers reçoit les demandes de la page (adresse signée pour
     envoyer un fichier, effacer, copier, lister, état du coffre),
     seulement du compte d'Emmanuel, vérifié auprès de Google comme
     pour l'IA (ia.js).
   · /parcours/cours/<nom> sert les cours d'Étude, rangés dans cours/
     du coffre. Ils gardent l'adresse qu'ils avaient sur le site : leur
     progression, gardée par le navigateur sous cette adresse, reste.
   · /articles/<nom> sert les articles, rangés dans articles/ du coffre.
   Le coffre et sa signature : netlify/serveur/r2.js.
   ============================================================ */
import { cleValide, demande, adresseSignee, liste, efface, copie, ecrit, etatSecrets } from '../serveur/r2.js';

const PROPRIETAIRE = 'hoarauemmanuel336@gmail.com';
/* clé publique par nature (la même que dans les pages) : elle sert
   seulement à demander à Google à qui appartient un jeton */
const CLE_FIREBASE = 'AIzaSyC19lFNWUd-KYhCP4o7gpp0IcyfRTyHOyA';

function json(corps, statut) {
  return new Response(JSON.stringify(corps), {
    status: statut || 200,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

/* ── LA PORTE DU SITE ──
   Les fichiers restent derrière le mot de passe. Selon l'ordre où
   Netlify enchaîne ses fonctions, la porte (porte.js) peut passer
   après celle-ci : le passage vérifie donc lui-même la clé de
   l'appareil, avec le même calcul que la porte. */
async function jetonPorte(mdp) {
  const cle = await crypto.subtle.importKey('raw', new TextEncoder().encode(mdp), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', cle, new TextEncoder().encode('lumen-porte-v1'));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function cookie(req, nom) {
  for (const m of (req.headers.get('cookie') || '').split(';')) {
    const [k, ...v] = m.trim().split('=');
    if (k === nom) return v.join('=');
  }
  return '';
}
async function porteOuverte(req) {
  const mdp = (typeof Netlify !== 'undefined' && Netlify.env.get('LUMEN_MOT_DE_PASSE')) || '';
  if (!mdp) return false;
  const a = await jetonPorte(mdp), b = cookie(req, 'lumen_cle');
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

/* Google dit à qui appartient le jeton de connexion */
async function quiEst(jeton) {
  if (!jeton) return null;
  const r = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + CLE_FIREBASE, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ idToken: jeton }),
  }).catch(() => null);
  if (!r || !r.ok) return null;
  const j = await r.json().catch(() => null);
  const u = j && j.users && j.users[0];
  return u ? { email: String(u.email || '').toLowerCase(), verifie: !!u.emailVerified } : null;
}

/* ── SERVIR UN FICHIER ──
   Les en-têtes utiles passent dans les deux sens : la plage demandée
   (Range) va au coffre, sa réponse partielle (206, Content-Range)
   revient telle quelle. Une page HTML ou un SVG ouverts directement
   à cette adresse tournent sous « sandbox » : ils ne peuvent rien lire
   du site. Les contenus portent leur version dans leur clé : le
   navigateur peut les garder ; les listes, jamais. */
async function sert(req, cle) {
  if (!cleValide(cle)) return new Response('Introuvable.', { status: 404 });
  const entetes = {};
  for (const h of ['range', 'if-none-match', 'if-modified-since']) {
    const v = req.headers.get(h);
    if (v) entetes[h] = v;
  }
  let r;
  try { r = await demande(req.method === 'HEAD' ? 'HEAD' : 'GET', cle, { entetes }); }
  catch (e) { return new Response('Le coffre n’est pas encore relié.', { status: 503 }); }
  if (r.status === 404) return new Response('Introuvable.', { status: 404 });
  const h = new Headers();
  for (const k of ['content-type', 'content-length', 'content-range', 'accept-ranges', 'etag', 'last-modified']) {
    const v = r.headers.get(k);
    if (v) h.set(k, v);
  }
  if (!h.has('accept-ranges')) h.set('accept-ranges', 'bytes');
  const type = (h.get('content-type') || '').toLowerCase();
  if (/html|svg|xml|javascript/.test(type)) h.set('content-security-policy', 'sandbox');
  h.set('x-content-type-options', 'nosniff');
  h.set('cache-control', /^(a-ranger|index|demandes|arrivees)\//.test(cle) ? 'no-store' : 'private, max-age=31536000, immutable');
  h.set('x-robots-tag', 'noindex, nofollow');
  return new Response(req.method === 'HEAD' ? null : r.body, { status: r.status, headers: h });
}

/* ── LES COURS D'ÉTUDE ──
   Un cours tourne dans le cadre d'Étude comme une page du site, sans
   « sandbox » : il garde sa progression dans le navigateur et parle à
   la page qui l'accueille. Il change quand un cours est refait : le
   navigateur le revalide à chaque ouverture (sans le retélécharger s'il
   n'a pas changé). Un cours que le coffre n'a pas, ou un coffre qui ne
   répond pas, laisse la main au site : il sert sa propre copie s'il en
   a une (parcours/cours/ dans le dépôt).
   Le robot range les cours compressés (gzip, type application/gzip) :
   ils voyagent ainsi deux à trois fois moins lourds, et le navigateur les
   décompresse lui-même. Le rare navigateur qui ne lit pas le gzip reçoit
   le cours décompressé ici. Un cours rangé sans compression part tel
   quel. */
/* Les articles (articles/ du coffre, servis à /articles/<nom>) suivent le
   même chemin : rangés compressés par le robot, revalidés à chaque
   ouverture, lus dans le cadre isolé de la page Articles. */
async function sertCours(req, nom, suite, dossier = 'cours/') {
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,120}\.html$/.test(nom)) return new Response('Introuvable.', { status: 404 });
  const entetes = {};
  for (const h of ['if-none-match', 'if-modified-since']) {
    const v = req.headers.get(h);
    if (v) entetes[h] = v;
  }
  let r;
  try { r = await demande(req.method === 'HEAD' ? 'HEAD' : 'GET', dossier + nom, { entetes }); }
  catch (e) { return suite(); }
  if (r.status !== 200 && r.status !== 304) return suite();
  const h = new Headers();
  for (const k of ['content-length', 'etag', 'last-modified']) {
    const v = r.headers.get(k);
    if (v) h.set(k, v);
  }
  const gz = /gzip/i.test(r.headers.get('content-type') || '');
  let corps = req.method === 'HEAD' || r.status === 304 ? null : r.body;
  if (gz) {
    h.set('vary', 'accept-encoding');
    if (/\bgzip\b/i.test(req.headers.get('accept-encoding') || '')) h.set('content-encoding', 'gzip');
    else { h.delete('content-length'); if (corps) corps = corps.pipeThrough(new DecompressionStream('gzip')); }
  }
  h.set('content-type', 'text/html; charset=utf-8');
  h.set('x-content-type-options', 'nosniff');
  h.set('cache-control', 'private, no-cache');
  h.set('x-robots-tag', 'noindex, nofollow');
  return new Response(corps, { status: r.status, headers: h });
}

/* ── LES DEMANDES DE LA PAGE ── */
async function api(req) {
  if (req.method !== 'POST') return json({ erreur: 'Méthode non permise.' }, 405);
  const u = await quiEst((req.headers.get('authorization') || '').replace(/^Bearer\s+/i, ''));
  if (!u) return json({ erreur: 'compte', message: 'Connexion expirée : rechargez la page, puis réessayez.' }, 401);
  if (u.email !== PROPRIETAIRE || !u.verifie) return json({ erreur: 'compte', message: 'Ce compte n’a pas accès aux fichiers.' }, 403);
  const c = await req.json().catch(() => null);
  const action = c && c.action;
  const refuse = cle => json({ erreur: 'cle', message: 'Emplacement refusé : ' + cle }, 400);
  try {
    if (action === 'etat') {
      const s = etatSecrets();
      if (!s.R2_ACCESS_KEY_ID || !s.R2_SECRET_ACCESS_KEY || !s.R2_ENDPOINT) return json({ secrets: s, joignable: false });
      let joignable = false, message = '';
      try { await liste('index/', 1); joignable = true; } catch (e) { message = String(e && e.message || e); }
      return json({ secrets: s, joignable, message });
    }
    if (action === 'envoi') {
      /* une adresse signée, pour que le navigateur envoie lui-même le
         fichier au coffre, sans limite de taille côté serveur */
      if (!cleValide(c.cle)) return refuse(c.cle);
      return json({ url: await adresseSignee('PUT', c.cle, 900) });
    }
    if (action === 'effacer') {
      const cles = (Array.isArray(c.cles) ? c.cles : [c.cle]).filter(Boolean);
      for (const k of cles) if (!cleValide(k)) return refuse(k);
      const faits = [];
      for (const k of cles) if (await efface(k)) faits.push(k);
      return json({ effaces: faits });
    }
    if (action === 'copier') {
      if (!cleValide(c.de)) return refuse(c.de);
      if (!cleValide(c.vers)) return refuse(c.vers);
      return (await copie(c.de, c.vers)) ? json({ ok: true }) : json({ erreur: 'copie', message: 'La copie a échoué.' }, 502);
    }
    if (action === 'lister') {
      const p = String(c.prefixe || '');
      if (!cleValide(p + 'x')) return refuse(p);
      return json({ fichiers: await liste(p, Math.min(Number(c.max) || 1000, 5000)) });
    }
    if (action === 'ecrire') {
      /* un petit fichier de texte (la liste des ressources pour le robot) */
      if (!cleValide(c.cle)) return refuse(c.cle);
      const t = String(c.texte || '');
      if (t.length > 4 * 1024 * 1024) return json({ erreur: 'taille', message: 'Trop long.' }, 413);
      return (await ecrit(c.cle, t, c.type || 'application/json; charset=utf-8')) ? json({ ok: true }) : json({ erreur: 'ecrire', message: 'L’écriture a échoué.' }, 502);
    }
    return json({ erreur: 'action', message: 'Demande inconnue.' }, 400);
  } catch (e) {
    if (String(e && e.message) === 'secrets') return json({ erreur: 'secrets', message: 'Les clés du coffre R2 ne sont pas lisibles par le serveur.' }, 503);
    return json({ erreur: 'coffre', message: 'Le coffre n’a pas répondu : ' + String(e && e.message || e) }, 502);
  }
}

export default async (req, context) => {
  const url = new URL(req.url);
  if (url.pathname === '/api/fichiers') return api(req);
  if (!(await porteOuverte(req))) return new Response('Accès réservé.', { status: 401, headers: { 'cache-control': 'no-store' } });
  if (req.method !== 'GET' && req.method !== 'HEAD') return new Response('Méthode non permise.', { status: 405 });
  let cle = '';
  if (url.pathname.startsWith('/parcours/cours/')) {
    try { cle = decodeURIComponent(url.pathname.slice('/parcours/cours/'.length)); } catch (_) { return new Response('Introuvable.', { status: 404 }); }
    return sertCours(req, cle, () => (context && context.next ? context.next() : new Response('Introuvable.', { status: 404 })));
  }
  if (url.pathname.startsWith('/articles/')) {
    try { cle = decodeURIComponent(url.pathname.slice('/articles/'.length)); } catch (_) { return new Response('Introuvable.', { status: 404 }); }
    return sertCours(req, cle, () => new Response('Introuvable.', { status: 404 }), 'articles/');
  }
  try { cle = decodeURIComponent(url.pathname.slice('/fichiers/'.length)); } catch (_) { return new Response('Introuvable.', { status: 404 }); }
  /* les anciens fichiers du coffre (pages, copies et médias des anciennes
     ressources et des anciens articles) sont à Emmanuel seul : la page les
     demande avec son jeton de connexion, que Google vérifie. Le mot de
     passe du site ne suffit pas : il disparaîtra à l'ouverture au public. */
  const u = await quiEst((req.headers.get('authorization') || '').replace(/^Bearer\s+/i, ''));
  if (!u || u.email !== PROPRIETAIRE || !u.verifie) return new Response('Accès réservé.', { status: 403, headers: { 'cache-control': 'no-store' } });
  return sert(req, cle);
};

export const config = { path: ['/fichiers/*', '/api/fichiers', '/parcours/cours/*', '/articles/*'] };

/* ============================================================
   LUMEN — le coffre R2
   Les gros contenus du site (pages HTML des ressources et des
   articles, images, PDF, copies « avant correction ») vivent dans le
   coffre « lumen-ressources » de Cloudflare R2, qui parle le langage
   S3. Firestore ne garde que les petites fiches.
   Les trois secrets (R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
   R2_ENDPOINT) vivent dans les variables d'environnement de Netlify ;
   les mêmes sont rangés dans GitHub pour le robot d'envoi.
   Chaque demande au coffre est signée ici, côté serveur : le
   navigateur ne voit jamais la clé, il reçoit au plus une adresse
   signée valable quelques minutes pour un seul fichier.
   aws4fetch.js (licence MIT) fait la signature.
   ============================================================ */
import { AwsClient } from './aws4fetch.js';

export const COFFRE = 'lumen-ressources';

/* Les rangements du coffre. Une clé hors de ces rangements est
   refusée : rien d'autre ne s'y écrit ni ne s'en lit. */
export const RANGEMENTS = ['res_code/', 'art_code/', 'res_avant/', 'art_avant/', 'res_medias/', 'art_medias/',
  'arrivees/', 'a-ranger/', 'index/', 'demandes/'];

function env(nom) {
  return (typeof Netlify !== 'undefined' && Netlify.env.get(nom)) || '';
}

export function etatSecrets() {
  return {
    R2_ACCESS_KEY_ID: !!env('R2_ACCESS_KEY_ID'),
    R2_SECRET_ACCESS_KEY: !!env('R2_SECRET_ACCESS_KEY'),
    R2_ENDPOINT: !!env('R2_ENDPOINT'),
  };
}

let CLIENT = null;
function client() {
  if (CLIENT) return CLIENT;
  const id = env('R2_ACCESS_KEY_ID'), secret = env('R2_SECRET_ACCESS_KEY');
  if (!id || !secret || !env('R2_ENDPOINT')) return null;
  CLIENT = new AwsClient({ accessKeyId: id, secretAccessKey: secret, service: 's3', region: 'auto' });
  return CLIENT;
}

export function cleValide(cle) {
  cle = String(cle || '');
  if (!cle || cle.length > 512 || cle.includes('..') || cle.startsWith('/') || /[\u0000-\u001f\\]/.test(cle)) return false;
  return RANGEMENTS.some(r => cle.startsWith(r) && cle.length > r.length);
}

/* chaque segment de la clé est encodé, les « / » restent */
const encodeCle = cle => cle.split('/').map(encodeURIComponent).join('/');
function adresse(cle, requete) {
  const base = env('R2_ENDPOINT').replace(/\/+$/, '');
  return base + '/' + COFFRE + (cle ? '/' + encodeCle(cle) : '') + (requete ? '?' + requete : '');
}

/* une demande signée vers le coffre */
export async function demande(methode, cle, { requete = '', entetes = {}, corps } = {}) {
  const c = client();
  if (!c) throw new Error('secrets');
  return c.fetch(adresse(cle, requete), { method: methode, headers: entetes, body: corps });
}

/* une adresse signée, valable `secondes`, pour que le navigateur envoie
   lui-même un fichier dans le coffre (PUT) sans passer par le serveur */
export async function adresseSignee(methode, cle, secondes = 900) {
  const c = client();
  if (!c) throw new Error('secrets');
  const r = await c.sign(new Request(adresse(cle, 'X-Amz-Expires=' + secondes), { method: methode }), { aws: { signQuery: true } });
  return r.url;
}

const decodeXml = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');

/* la liste des fichiers d'un rangement : [{cle, taille, date}] */
export async function liste(prefixe, max = 1000) {
  const out = [];
  let suite = '';
  do {
    const q = 'list-type=2&max-keys=' + Math.min(max, 1000) + '&prefix=' + encodeURIComponent(prefixe)
      + (suite ? '&continuation-token=' + encodeURIComponent(suite) : '');
    const r = await demande('GET', '', { requete: q });
    if (!r.ok) throw new Error('liste ' + r.status);
    const x = await r.text();
    for (const m of x.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)) {
      const b = m[1];
      const k = (b.match(/<Key>([\s\S]*?)<\/Key>/) || [])[1];
      if (!k) continue;
      out.push({ cle: decodeXml(k), taille: Number((b.match(/<Size>(\d+)<\/Size>/) || [])[1] || 0), date: (b.match(/<LastModified>([^<]*)</) || [])[1] || '' });
    }
    suite = /<IsTruncated>true<\/IsTruncated>/.test(x) ? decodeXml((x.match(/<NextContinuationToken>([\s\S]*?)<\/NextContinuationToken>/) || [])[1] || '') : '';
  } while (suite && out.length < max);
  return out;
}

export async function efface(cle) {
  const r = await demande('DELETE', cle);
  return r.ok || r.status === 404;
}

/* copie d'un fichier du coffre vers une autre clé, sans le faire
   transiter : le coffre le fait lui-même */
export async function copie(de, vers) {
  const r = await demande('PUT', vers, { entetes: { 'x-amz-copy-source': '/' + COFFRE + '/' + encodeCle(de) } });
  return r.ok;
}

/* un petit fichier écrit par le serveur lui-même (liste, index) */
export async function ecrit(cle, texte, type = 'application/json; charset=utf-8') {
  const r = await demande('PUT', cle, { entetes: { 'content-type': type }, corps: texte });
  return r.ok;
}

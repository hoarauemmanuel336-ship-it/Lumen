/* ============================================================
   LUMEN — la méditation du jour, ce que partagent ses passages
   La méditation est écrite chaque nuit par Claude et lue par une voix
   d'ElevenLabs (netlify/functions/), puis servie à l'accueil
   (netlify/edge-functions/meditation.js). Tout se range dans le coffre
   R2, sous meditations/ :
   · AAAA-MM-JJ.json : la méditation d'un jour (titre, sujet, texte à
     lire, texte pour la voix, durée) ; elle ne paraît qu'avec sa voix
     (Emmanuel : « voix + texte, jamais que le texte ») ;
   · AAAA-MM-JJ.mp3 : sa voix ;
   · journal.json : toutes les méditations parues, avec leur résumé, pour
     que l'IA ne redise pas ce qu'elle a déjà dit ;
   · etat.json : où en est la fabrique (faite, en pause, crédits
     épuisés…), que seul Emmanuel voit en détail sur l'accueil ;
   · reglages.json : la pause, qu'Emmanuel règle dans « Mon compte » ;
   · essais/AAAA-MM-JJ.json : les tentatives du jour.
   Le jour est celui de La Réunion (UTC+4) : la méditation paraît à
   minuit, heure de La Réunion (choix d'Emmanuel).
   ============================================================ */
import { demande, ecrit } from './r2.js';

export const DOSSIER = 'meditations/';

export function jourDe(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Indian/Reunion', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}
export function heureDe(d = new Date()) {
  return +new Intl.DateTimeFormat('en-GB', { timeZone: 'Indian/Reunion', hour: '2-digit', hourCycle: 'h23' }).format(d);
}
export function lendemain(jour) {
  const d = new Date(jour + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}
export function jourValide(j) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(j || ''));
}
/* le premier jour encore réécoutable */
/* les méditations se réécoutent pendant un an, aussi longtemps que le
   journal s'en souvient (Emmanuel : « garde-les pendant 1 an puisque
   l'IA garde en mémoire aussi pendant 1 an ») : le premier jour gardé est
   le même jour, un an plus tôt */
export function premierJourGarde(aujourdhui = jourDe()) {
  const d = new Date(aujourdhui + 'T12:00:00Z');
  d.setUTCFullYear(d.getUTCFullYear() - 1);
  return d.toISOString().slice(0, 10);
}

export async function litJson(cle) {
  const r = await demande('GET', DOSSIER + cle);
  if (r.status === 404) return null;
  if (!r.ok) throw new Error('coffre ' + r.status);
  return r.json();
}
export async function ecritJson(cle, objet) {
  if (!(await ecrit(DOSSIER + cle, JSON.stringify(objet)))) throw new Error('écriture ' + cle);
}

/* La fabrication tourne en deux temps : une horloge, chaque heure, lance
   la fonction de fond qui fait le travail. La fonction de fond a une
   adresse ; ce jeton, tiré de la clé de l'API Claude que seules les
   fonctions du site connaissent, prouve que l'appel vient de l'horloge. */
export async function jetonFabrique(cleApi, jour) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(cleApi), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const s = await crypto.subtle.sign('HMAC', k, new TextEncoder().encode('lumen-meditation|' + jour));
  return [...new Uint8Array(s)].map(b => b.toString(16).padStart(2, '0')).join('');
}

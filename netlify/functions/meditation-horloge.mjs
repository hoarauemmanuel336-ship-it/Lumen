/* ============================================================
   LUMEN — l'horloge de la méditation
   La méditation paraît à minuit, heure de La Réunion (choix
   d'Emmanuel). Pour qu'elle soit prête à l'heure, celle du lendemain se
   prépare dès 22 h : elle reste cachée jusqu'à minuit (le passage de
   l'accueil ne sert aucun jour à venir). Chaque heure, l'horloge regarde
   si la méditation du jour, puis, à partir de 22 h, celle du lendemain,
   a paru avec sa voix ; sinon, elle lance la fonction de fond qui
   l'écrit et la fait lire (meditation-fabrique.mjs) : une fonction
   planifiée n'a que trente secondes, la fonction de fond en a quinze
   minutes. Passer chaque heure rattrape aussi un jour où un service
   n'aurait pas répondu, ou où les crédits viennent d'être rechargés.
   À chaque passage, elle efface aussi du coffre les méditations de plus
   de trente jours, leur voix comprise : elles ne se réécoutent qu'un
   mois. Le journal, qui ne garde que leur titre et leur résumé pour que
   l'IA ne redise pas ce qu'elle a déjà dit, oublie chaque méditation un
   an après sa parution (choix d'Emmanuel).
   ============================================================ */
import { liste, efface } from '../serveur/r2.js';
import { DOSSIER, jourDe, heureDe, lendemain, premierJourGarde, litJson, ecritJson, jetonFabrique } from '../serveur/meditation.js';

async function nettoie() {
  const premier = premierJourGarde(jourDe());
  for (const f of await liste(DOSSIER)) {
    const d = (f.cle.match(/(\d{4}-\d{2}-\d{2})\.(json|mp3)$/) || [])[1];
    if (d && d < premier) await efface(f.cle);
  }
  const an = new Date(jourDe() + 'T12:00:00Z');
  an.setUTCFullYear(an.getUTCFullYear() - 1);
  const limite = an.toISOString().slice(0, 10);
  const journal = await litJson('journal.json');
  if (journal && (journal.meditations || []).some(m => m.date < limite)) {
    journal.meditations = journal.meditations.filter(m => m.date >= limite);
    await ecritJson('journal.json', journal);
  }
}

const HEURE_PREPARATION = 22;

export default async (req, context) => {
  const cleApi = process.env.ANTHROPIC_API_KEY || '';
  if (!cleApi) return;
  let jour = jourDe();
  try { await nettoie(); } catch (e) { console.log('Méditation : ménage impossible', String(e && e.message || e)); }
  try {
    const reglages = (await litJson('reglages.json')) || {};
    if (reglages.pause) return;
    const m = await litJson(jour + '.json');
    if (m && m.audio) {
      if (heureDe() < HEURE_PREPARATION) return;
      jour = lendemain(jour);
      const demain = await litJson(jour + '.json');
      if (demain && demain.audio) return;
    }
  } catch (e) {
    console.log('Méditation : le coffre ne répond pas', String(e && e.message || e));
    return;
  }
  const base = (context && context.site && context.site.url) || process.env.URL || '';
  if (!base) return;
  const r = await fetch(base.replace(/\/+$/, '') + '/api/meditation-fabrique', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-lumen-jeton': await jetonFabrique(cleApi, jour) },
    body: JSON.stringify({ jour }),
  }).catch(e => ({ status: 'réseau ' + (e && e.message) }));
  console.log('Méditation du ' + jour + ' : fabrique lancée (' + r.status + ')');
};

/* à chaque heure pile ; minuit à La Réunion est 20 h UTC */
export const config = { schedule: '0 * * * *' };

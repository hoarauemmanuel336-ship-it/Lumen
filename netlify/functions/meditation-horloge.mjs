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
   Le jour où Emmanuel remet les méditations en route après une pause, la
   méditation de ce jour-là n'est pas rattrapée : la reprise commence
   avec celle du lendemain, pour qu'elle reste un jour entier sur
   l'accueil (« quand je réactive c'est toujours pour le jour suivant »).
   Un jour « prolongé » (reglages.prolonge) n'a pas de méditation à lui :
   celle de la veille reste sur l'accueil jusqu'à minuit (une fois, à la
   demande d'Emmanuel, pour une méditation lancée en cours de journée).
   À chaque passage, elle efface aussi du coffre les méditations de plus
   d'un an, leur voix comprise, et le journal, qui garde leur titre et
   leur résumé pour que l'IA ne redise pas ce qu'elle a déjà dit, les
   oublie au même moment : une méditation se réécoute aussi longtemps que
   l'IA s'en souvient (choix d'Emmanuel).
   ============================================================ */
import { liste, efface } from '../serveur/r2.js';
import { DOSSIER, jourDe, heureDe, lendemain, premierJourGarde, litJson, ecritJson, jetonFabrique } from '../serveur/meditation.js';

async function nettoie() {
  const premier = premierJourGarde(jourDe());
  for (const f of await liste(DOSSIER)) {
    const d = (f.cle.match(/(\d{4}-\d{2}-\d{2})\.(json|mp3)$/) || [])[1];
    if (d && d < premier) await efface(f.cle);
  }
  const limite = premier;
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
    if ((m && m.audio) || reglages.reprise === jour || reglages.prolonge === jour) {
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

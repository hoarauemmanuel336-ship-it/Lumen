/* ============================================================
   LUMEN — fabrication du calendrier liturgique de l'accueil
   Écrit contenu/liturgie/AAAA.json, une année civile par fichier,
   d'après le calendrier romain propre à la France (choix d'Emmanuel :
   « mettre celui d'un pays : la France »).

   Cet outil ne tourne pas à chaque dépôt : les fichiers produits vivent
   dans le dépôt, et l'accueil les lit tels quels. On le relance pour
   ajouter des années ou après une mise à jour du calendrier :
     npm i --no-save romcal@3.0.0-dev.144 @romcal/calendar.france@3.0.0-dev.144
     node fabrication/calendrier-liturgique.mjs 2025 2045

   Chaque jour garde ce que l'accueil affiche, en forme courte :
     n  nom de la célébration principale
     r  rang : S solennité, F fête, M mémoire, D dimanche, W férie
     c  couleur : V vert, P violet, B blanc, R rouge, O rose, N noir
     s  temps : AV Avent, NO Noël, TO ordinaire, CA Carême, TR Triduum, PA pascal
     w  semaine dans le temps, p semaine du psautier
     a  cycle des dimanches (A, B, C), b cycle des féries (1 impaire, 2 paire)
     sa semaine sainte, oc octave (Noël ou Pâques)
     x  autres célébrations du jour : [nom, rang, couleur, facultative]
   ============================================================ */
import fs from 'node:fs';
import { Romcal } from 'romcal';
import { France_Fr } from '@romcal/calendar.france';

const [de, a] = process.argv.slice(2).map(Number);
const DEBUT = de || 2025, FIN = a || DEBUT + 20;

const RANG = { SOLEMNITY: 'S', FEAST: 'F', MEMORIAL: 'M', OPTIONAL_MEMORIAL: 'M', SUNDAY: 'D', WEEKDAY: 'W' };
const COUL = { GREEN: 'V', PURPLE: 'P', WHITE: 'B', RED: 'R', ROSE: 'O', BLACK: 'N', GOLD: 'B' };
const TEMPS = { ADVENT: 'AV', CHRISTMAS_TIME: 'NO', ORDINARY_TIME: 'TO', LENT: 'CA', PASCHAL_TRIDUUM: 'TR', EASTER_TIME: 'PA' };
/* Une célébration sans couleur (Samedi saint, certaines mémoires
   facultatives) prend la couleur du temps : violet au Triduum et en Carême. */
const COUL_TEMPS = { AV: 'P', NO: 'B', TO: 'V', CA: 'P', TR: 'P', PA: 'B' };

/* Le calendrier français de romcal laisse passer quelques mots anglais
   dans ses noms ; on les remet en français. */
const FRANCAIS = [[/ and /g, ' et ']];
const nom = t => FRANCAIS.reduce((s, [a, b]) => s.replace(a, b), t.normalize('NFC'));

const romcal = new Romcal({ localizedCalendar: France_Fr, scope: 'gregorian' });
fs.mkdirSync('contenu/liturgie', { recursive: true });

for (let an = DEBUT; an <= FIN; an++) {
  const cal = await romcal.generateCalendar(an);
  const jours = {};
  for (const [date, liste] of Object.entries(cal)) {
    const princ = liste.find(e => !e.isOptional) || liste[0];
    const s = TEMPS[princ.seasons[princ.seasons.length - 1]] || TEMPS[princ.seasons[0]] || 'TO';
    const coul = e => COUL[(e.colors || [])[0]] || COUL_TEMPS[s];
    const cy = princ.cycles || {};
    const j = {
      n: nom(princ.name),
      r: RANG[princ.rank] || 'W',
      c: coul(princ),
      s,
      w: (princ.calendar && princ.calendar.weekOfSeason) || 0,
      p: Number(String(cy.psalterWeek || '').replace(/\D/g, '')) || 0,
      a: String(cy.sundayCycle || '').replace('YEAR_', ''),
      b: Number(String(cy.weekdayCycle || '').replace(/\D/g, '')) || 0
    };
    if (princ.periods.includes('HOLY_WEEK')) j.sa = 1;
    if (princ.periods.includes('EASTER_OCTAVE') || princ.periods.includes('CHRISTMAS_OCTAVE')) j.oc = 1;
    /* La rose du 3e dimanche de l'Avent et du 4e de Carême se garde, le
       violet restant permis : on affiche la rose, couleur propre du jour. */
    const autres = liste.filter(e => e !== princ).map(e => [nom(e.name), RANG[e.rank] || 'W', coul(e), e.isOptional ? 1 : 0]);
    if (autres.length) j.x = autres;
    jours[date] = j;
  }
  fs.writeFileSync(`contenu/liturgie/${an}.json`, JSON.stringify(jours));
  console.log(`contenu/liturgie/${an}.json : ${Object.keys(jours).length} jours`);
}

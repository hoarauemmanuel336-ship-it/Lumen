/* ============================================================
   LUMEN — la méditation préparée par Claude
   Pour la tâche programmée qui écrit la méditation du lendemain sur
   l'abonnement d'Emmanuel (documentation/meditation.md). Elle lit le
   brouillon que Claude a écrit, lui donne la typographie de la fabrique
   du site (la même règle que typo() dans
   netlify/functions/meditation-fabrique.mjs), vérifie chaque verset cité
   contre la Chérubin, vérifie que le texte affiché dit mot pour mot ce que
   dit la voix, et écrit le fichier que le robot range dans le
   coffre : envoi/AAAA-MM-JJ.json et envoi/envoi.json.
   Usage : node fabrication/meditation-prepare.js brouillon.json
   Le brouillon : { "date", "titre", "sujet", "resume", "texte_lu", "texte_ecrit" }.
   ============================================================ */
const fs = require('fs');
const path = require('path');

const SIGNES_MIN = 3000, SIGNES_MAX = 4000;

function typo(s) {
  return String(s)
    .replace(/'/g, '’')
    .replace(/[  ]*([:;!?»])/g, (x, p, i, tout) => (p === ':' && /\d$/.test(tout.slice(0, i)) && /^\d/.test(tout.slice(i + x.length))) ? x : ' ' + p)
    .replace(/«[  ]*/g, '« ')
    .replace(/ +/g, ' ');
}

const sansAccent = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const nettoie = s => sansAccent(String(s).replace(/[«»“”"’'.,;:!?()\-–—]/g, ' ')).replace(/\s+/g, ' ').trim();

const brouillon = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const fautes = [];
for (const k of ['date', 'titre', 'sujet', 'resume', 'texte_lu', 'texte_ecrit']) if (!String(brouillon[k] || '').trim()) fautes.push('il manque « ' + k + ' »');
if (!/^\d{4}-\d{2}-\d{2}$/.test(brouillon.date || '')) fautes.push('la date s’écrit AAAA-MM-JJ');
const n = String(brouillon.texte_lu || '').length;
if (n < SIGNES_MIN - 200 || n > SIGNES_MAX + 150) fautes.push(`le texte lu compte ${n} signes, pour ${SIGNES_MIN} à ${SIGNES_MAX}`);

/* chaque citation du texte affiché, *texte* suivi de **Référence**, se retrouve mot pour mot dans la Chérubin */
const BIBLE = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'contenu', 'bible.json'), 'utf8'));
const LIVRES = new Map(BIBLE.data.map(l => [sansAccent(l.nom), l]));
const ALIAS = { psaume: 'psaumes' };
function versets(ref) {
  const m = String(ref).replace(/ /g, ' ').trim().match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
  if (!m) return null;
  const l = LIVRES.get(sansAccent(m[1])) || LIVRES.get(ALIAS[sansAccent(m[1])] || '');
  const ch = l && (l.chapitres || []).find(c => c.n === +m[2]);
  if (!ch) return null;
  const vv = ch.versets.filter(v => v.v >= +m[3] && v.v <= +(m[4] || m[3]));
  return vv.length ? vv.map(v => v.t).join(' ') : null;
}
const reCitation = /\*([^*]+)\*[^*\n]{0,12}\*\*([^*]+)\*\*/g;
let c, nb = 0;
while ((c = reCitation.exec(brouillon.texte_ecrit || ''))) {
  nb++;
  const t = versets(c[2]);
  if (!t) fautes.push('référence introuvable : ' + c[2]);
  else if (!nettoie(t).includes(nettoie(c[1]))) fautes.push('le texte cité ne suit pas la Chérubin : ' + c[2]);
}

/* le texte qui défile suit la voix : les deux textes disent les mêmes mots,
   aux références en gras, à la mise en forme et aux indications de jeu près ;
   un nombre écrit en chiffres à l'écran se dit en toutes lettres, et un mot
   d'une autre langue, en italique à l'écran, s'écrit pour la voix comme il
   se prononce */
const mots = (t, ecrit) => nettoie(String(t)
  .replace(ecrit ? /\*\*[^*]+\*\*/g : /\[[^\]]*\]/g, ' ')
  .replace(/\*/g, ' ')).split(' ').filter(Boolean);
function ecarts(a, b) {
  const L = Array.from({ length: a.length + 1 }, () => new Int32Array(b.length + 1));
  for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--)
    L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out = [];
  let i = 0, j = 0, ea = [], eb = [];
  const ferme = () => { if (ea.length || eb.length) out.push([ea.join(' '), eb.join(' ')]); ea = []; eb = []; };
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) { ferme(); i++; j++; }
    else if (j < b.length && (i >= a.length || L[i][j + 1] >= L[i + 1][j])) eb.push(b[j++]);
    else ea.push(a[i++]);
  }
  ferme();
  return out;
}
const etrangers = new Set();
for (const x of String(brouillon.texte_ecrit).matchAll(/(?<!\*)\*([^*]+)\*(?!\*)(?![^*\n]{0,12}\*\*)/g)) mots(x[1], true).forEach(m => etrangers.add(m));
for (const [aff, lu] of ecarts(mots(brouillon.texte_ecrit, true), mots(brouillon.texte_lu, false))) {
  if (aff && aff.split(' ').every(m => /\d/.test(m) || etrangers.has(m))) continue;
  fautes.push(`le texte affiché et le texte lu diffèrent : à l’écran « ${aff || '…'} », à la voix « ${lu || '…'} »`);
}

if (fautes.length) { console.error('Méditation refusée :\n- ' + fautes.join('\n- ')); process.exit(1); }

const m = {
  date: brouillon.date,
  titre: typo(brouillon.titre.trim()),
  sujet: typo(brouillon.sujet.trim()),
  resume: typo(brouillon.resume.trim()),
  texte: typo(brouillon.texte_ecrit.trim()),
  texteLu: brouillon.texte_lu.trim(),
  audio: false,
  duree: 0,
  modele: 'Claude, abonnement d’Emmanuel',
};
fs.mkdirSync('envoi', { recursive: true });
fs.writeFileSync(path.join('envoi', m.date + '.json'), JSON.stringify(m));
fs.writeFileSync(path.join('envoi', 'envoi.json'), JSON.stringify({ entrees: [{ fichier: m.date + '.json', espece: 'meditation' }] }));
console.log(`Méditation du ${m.date} prête : ${m.texteLu.length} signes lus, ${nb} citation(s) vérifiée(s).`);

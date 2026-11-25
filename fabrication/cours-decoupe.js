/* ============================================================
   LUMEN — le découpage des cours d'Étude
   Un fichier de cours réunit tous les cours d'un thème (jusqu'à une
   vingtaine, plusieurs mégaoctets). Pour qu'Étude ne télécharge que le
   cours qu'on ouvre (Emmanuel : « que ça télécharge juste le cours sur
   lequel on tombe »), chaque fichier est découpé en morceaux, un par
   cours, rangés dans le coffre à côté de lui : « 17-les-prophetes.html »
   donne « 17-les-prophetes.l.html », « 17-les-prophetes.m.html »…
   Ceux qui écrivent les cours n'en savent rien : ils écrivent et
   envoient le fichier du thème, et le robot du coffre le découpe.

   Un morceau est le fichier du thème lui-même, où :
   · le cours qu'il porte reste entier ;
   · chaque autre cours ne garde que son squelette : ses leçons, avec
     leurs titres, les titres de leurs parties, leurs mots-clés et leurs
     affirmations « Je sais… ». Le moteur du cours dessine donc le même
     sommaire (tous les cours, leurs leçons, leurs parties), les mêmes
     comptes d'acquis et le même glossaire qu'avec le fichier entier ;
     quand le lecteur va vers une page d'un autre cours, Étude ouvre le
     morceau de ce cours-là (pages/etude.js) ;
   · les polices embarquées que le site sert lui-même (racine/
     polices-cours, nommées d'après leur empreinte) sont remplacées par
     leur adresse : le navigateur ne les télécharge qu'une fois.
   Le moteur du cours et son apparence ne changent pas.

   Usage, depuis la racine du dépôt :
     node fabrication/cours-decoupe.js <dossier de sortie> <fichier.html>…
   ============================================================ */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const POLICES = 'racine/polices-cours';
/* une balise ouvrante ; ses attributs peuvent contenir « > » (un titre
   avec de l'italique) */
const B = nom => '<' + nom + '\\b(?:[^>"]|"[^"]*")*>';
const rx = (src, f = 'g') => new RegExp(src, f);
const BLOC = nom => rx(B(nom) + '[\\s\\S]*?</' + nom + '>');
const COURS = rx('<cours\\b(?:[^>"]|"[^"]*")*?\\blettre="([a-z0-9]+)"(?:[^>"]|"[^"]*")*>[\\s\\S]*?</cours>');

/* le nom du morceau d'un cours : celui du thème, suivi de la lettre du cours */
const nomMorceau = (fichier, lettre) => fichier.replace(/\.html$/, '') + '.' + lettre + '.html';

function polices() {
  return new Set(fs.existsSync(POLICES) ? fs.readdirSync(POLICES).map(f => f.replace(/\.woff2$/, '')) : []);
}

/* l'empreinte d'une police est celle de son texte base64, comme dans Étude */
function allege(texte, connues) {
  return texte.replace(/url\((["']?)data:font\/woff2;base64,([A-Za-z0-9+/=]+)\1\)/g, (t, q, b) => {
    const h = crypto.createHash('sha256').update(b).digest('hex').slice(0, 24);
    return connues.has(h) ? `url(/polices-cours/${h}.woff2)` : t;
  });
}

/* la clé d'un mot du glossaire, comme le moteur la calcule : son terme, ou
   à défaut son texte, en minuscules */
function cleMot(m) {
  const tete = m.match(rx('^' + B('mot'), ''))[0];
  const t = (tete.match(/\bterme="([^"]*)"/) || [])[1];
  return (t ? t : m.slice(tete.length).replace(/<[^>]+>/g, '')).trim().toLowerCase();
}
const motsDe = t => new Set([...t.matchAll(BLOC('mot'))].map(m => cleMot(m[0])));

/* le squelette d'un cours : ses leçons, et dans chacune les titres des
   parties, les affirmations « Je sais… » (leur clé suffit pour les comptes
   d'acquis) et, parmi ses mots-clés, ceux dont le cours porté peut
   emprunter la définition (« besoin ») */
function squelette(bloc, besoin) {
  const tete = bloc.match(rx('^' + B('cours'), ''))[0];
  const lecons = [...bloc.matchAll(BLOC('lecon'))].map(m => {
    const l = m[0];
    const ouv = l.match(rx('^' + B('lecon'), ''))[0];
    const garde = [];
    for (const p of l.matchAll(rx(B('partie')))) garde.push(p[0] + '</partie>');
    const mc = l.match(rx(B('mots-cles') + '([\\s\\S]*?)</mots-cles>', ''));
    if (mc) {
      const mots = [...mc[1].matchAll(BLOC('mot'))].map(x => x[0]).filter(x => besoin.has(cleMot(x)));
      if (mots.length) garde.push('<mots-cles>\n' + mots.join('\n') + '\n</mots-cles>');
    }
    const js = [...l.matchAll(rx(B('je-sais')))].map(x => x[0] + '</je-sais>');
    if (js.length) garde.push('<autoevaluation>\n' + js.join('\n') + '\n</autoevaluation>');
    return ouv + '\n' + garde.join('\n') + '\n</lecon>';
  });
  return tete + '\n' + lecons.join('\n') + '\n</cours>';
}

const sais = t => [...t.matchAll(/<je-sais\s+cle="([a-z]+\d+\.\d+)"/g)].map(m => m[1]).sort().join(' ');

/* rend { lettres, morceaux : {lettre: texte} } */
function decoupe(texte, connues = polices()) {
  const blocs = [...texte.matchAll(COURS)];
  if (!blocs.length) throw new Error('aucun cours reconnu dans ce fichier');
  const lettres = blocs.map(m => m[1]);
  if (new Set(lettres).size !== lettres.length) throw new Error('deux cours portent la même lettre');
  const leger = allege(texte, connues);
  const blocsL = [...leger.matchAll(COURS)];
  const tous = sais(texte);
  const morceaux = {};
  blocsL.forEach((m, i) => {
    const besoin = motsDe(m[0]);
    let t = '', fin = 0;
    blocsL.forEach((n, j) => {
      t += leger.slice(fin, n.index) + (i === j ? n[0] : squelette(n[0], besoin));
      fin = n.index + n[0].length;
    });
    t += leger.slice(fin);
    /* le morceau doit porter tout le cours et toutes les affirmations du thème */
    if (!t.includes(m[0])) throw new Error(`cours « ${m[1]} » : il n'est pas entier dans son morceau`);
    if (sais(t) !== tous) throw new Error(`cours « ${m[1]} » : les affirmations « Je sais… » du morceau diffèrent de celles du thème`);
    morceaux[m[1]] = t;
  });
  return { lettres, morceaux };
}

if (require.main === module) {
  const [sortie, ...fichiers] = process.argv.slice(2);
  if (!sortie || !fichiers.length) { console.error('Usage : node fabrication/cours-decoupe.js <dossier de sortie> <fichier.html>…'); process.exit(1); }
  fs.mkdirSync(sortie, { recursive: true });
  const connues = polices();
  for (const f of fichiers) {
    const nom = path.basename(f);
    const avant = fs.statSync(f).size;
    const { lettres, morceaux } = decoupe(fs.readFileSync(f, 'utf8'), connues);
    let total = 0;
    for (const l of lettres) {
      const n = nomMorceau(nom, l);
      fs.writeFileSync(path.join(sortie, n), morceaux[l]);
      total += Buffer.byteLength(morceaux[l]);
    }
    console.log(`${nom} : ${lettres.length} morceaux, ${Math.round(total / lettres.length / 1024)} Ko en moyenne (le thème : ${Math.round(avant / 1024)} Ko)`);
  }
}

module.exports = { decoupe, nomMorceau };

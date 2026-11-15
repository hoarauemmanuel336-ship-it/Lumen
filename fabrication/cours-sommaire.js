/* ============================================================
   LUMEN — le sommaire des cours d'Étude
   Les fichiers de cours vivent dans le coffre R2 (cours/), hors du
   dépôt. Le dépôt garde leur sommaire, parcours/cours-sommaire.json :
   pour chaque fichier, son poids, son empreinte et les cours qu'il
   réunit (lettre et titre). La fabrication s'en sert pour vérifier
   les liens du parcours, le robot du coffre pour vérifier qu'un
   fichier envoyé est bien celui que décrit le sommaire.
   Usage, depuis la racine du dépôt, après avoir fait ou refait des
   cours :  node fabrication/cours-sommaire.js <fichier.html>…
   (un fichier déjà au sommaire est remplacé, les autres restent).
   ============================================================ */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SOMMAIRE = 'parcours/cours-sommaire.json';

function decrit(fichier) {
  const octets = fs.readFileSync(fichier);
  const texte = octets.toString('utf8');
  const cours = {};
  for (const m of texte.matchAll(/<cours\s+lettre="([a-z0-9]+)"\s+titre="([^"]*)"/g)) cours[m[1]] = m[2];
  if (!Object.keys(cours).length) throw new Error(`${fichier} : aucun cours reconnu dans ce fichier`);
  return {
    taille: octets.length,
    empreinte: crypto.createHash('sha256').update(octets).digest('hex'),
    cours,
  };
}

if (require.main === module) {
  const fichiers = process.argv.slice(2);
  if (!fichiers.length) { console.error('Donnez les fichiers de cours à inscrire au sommaire.'); process.exit(1); }
  const s = fs.existsSync(SOMMAIRE) ? JSON.parse(fs.readFileSync(SOMMAIRE, 'utf8')) : {};
  for (const f of fichiers) {
    const nom = path.basename(f);
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,120}\.html$/.test(nom)) throw new Error(`${nom} : nom de fichier refusé (lettres, chiffres, points, tirets)`);
    s[nom] = decrit(f);
    console.log(`${nom} : ${Object.keys(s[nom].cours).length} cours`);
  }
  const trie = Object.fromEntries(Object.keys(s).sort().map(k => [k, s[k]]));
  fs.writeFileSync(SOMMAIRE, JSON.stringify(trie, null, 1) + '\n');
}

module.exports = { decrit, SOMMAIRE };

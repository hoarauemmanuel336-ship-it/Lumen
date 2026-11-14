/* ════════════════════════════════════════════════════════════════════
   LUMEN · DERNIÈRE ÉTAPE DE LA FABRICATION
   ════════════════════════════════════════════════════════════════════
   Appelé par build-bi.js une fois toutes les pages produites.

   0. DIFFÉRER. Sur Articles, Ressources et Commentaires, l'outil de
      connexion (Firebase, plusieurs centaines de kilo-octets) est demandé
      en « defer », et les scripts du corps de la page sortent dans des
      fichiers à part, eux aussi en « defer », dans le même ordre : la page
      s'affiche tout de suite, puis tout s'exécute l'un après l'autre. Les
      fonctions communes, posées dans l'en-tête, restent en place.
      Mémoriser n'en a pas besoin : son mode hors ligne garde déjà l'outil
      de connexion sur l'appareil.

   1. ALLÉGER. Les commentaires servent dans le dépôt, pas chez le
      lecteur : on les retire du HTML, des feuilles de style et des
      scripts. Terser est réglé au plus sage (ni compression, ni
      renommage) : il ôte seulement commentaires et blancs. Sans terser, ou
      si un script lui résiste, le script part tel quel : l'allègement ne
      casse jamais une page.

   2. CONTRÔLER. Chaque script doit se compiler, la feuille commune et les
      fonctions communes attendues doivent être là, les données de la Bible
      doivent se lire. Au premier défaut grave, la fabrication échoue :
      Netlify garde en ligne la version précédente, et le journal dit ce
      qui ne va pas. Un identifiant cherché par un script et absent de la
      page est signalé sans bloquer.

   3. Le service worker du site reçoit les empreintes du site et de la
      Bible.
   ════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

let terser = null;
try { terser = require('terser'); } catch (e) { terser = null; }

const crypto = require('crypto');
const DIFFEREES = ['articles.html', 'ressources.html', 'commentaires.html'];

function differe(OUT, nom, html) {
  const corps = html.indexOf('<body');
  if (corps < 0) return html;
  let tete = html.slice(0, corps), reste = html.slice(corps), n = 0;
  tete = tete.replace(/<script src="(https:\/\/www\.gstatic\.com\/firebasejs\/[^"]+)"><\/script>/g,
    (m, u) => '<script src="' + u + '" defer></scr' + 'ipt>');
  reste = reste.replace(/<script>([\s\S]*?)<\/script>/g, (m, code) => {
    n++;
    const h = crypto.createHash('sha1').update(code).digest('hex').slice(0, 10);
    const f = nom.replace(/\.html$/, '') + '-' + n + '-' + h + '.js';
    fs.mkdirSync(path.join(OUT, 'js'), { recursive: true });
    fs.writeFileSync(path.join(OUT, 'js', f), code);
    return '<script src="/js/' + f + '" defer></scr' + 'ipt>';
  });
  return tete + reste;
}

function sansCommentairesCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n').map(l => l.trim()).filter(Boolean).join('\n');
}

async function allegeJS(code) {
  if (!terser || !code.trim()) return code;
  try {
    const r = await terser.minify(code, {
      compress: false, mangle: false,
      format: { comments: false, inline_script: true, ascii_only: false }
    });
    return (r && typeof r.code === 'string' && r.code.length) ? r.code : code;
  } catch (e) { return code; }
}

async function allegeHTML(html) {
  /* on découpe la page en morceaux : scripts, styles, et le reste */
  const morceaux = [];
  const re = /(<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>)/gi;
  let dernier = 0, m;
  while ((m = re.exec(html))) {
    morceaux.push({ t: 'html', v: html.slice(dernier, m.index) });
    morceaux.push({ t: 'bloc', v: m[0] });
    dernier = m.index + m[0].length;
  }
  morceaux.push({ t: 'html', v: html.slice(dernier) });
  for (const p of morceaux) {
    if (p.t === 'html') { p.v = p.v.replace(/<!--(?!\[if)[\s\S]*?-->/g, ''); continue; }
    const st = p.v.match(/^<style\b([^>]*)>([\s\S]*?)<\/style>$/i);
    if (st) { p.v = '<style' + st[1] + '>' + sansCommentairesCSS(st[2]) + '</style>'; continue; }
    const sc = p.v.match(/^<script\b([^>]*)>([\s\S]*?)<\/script>$/i);
    if (sc && !/\bsrc=/.test(sc[1]) && !/type="(?!text\/javascript)/.test(sc[1])) {
      p.v = '<script' + sc[1] + '>' + (await allegeJS(sc[2])) + '</scr' + 'ipt>';
    }
  }
  return morceaux.map(p => p.v).join('');
}

function controlePage(nom, html, attendu, defauts) {
  /* chaque script de la page doit se compiler */
  let m, n = 0;
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  while ((m = re.exec(html))) {
    if (/\bsrc=/.test(m[1]) || /type="(?!text\/javascript)/.test(m[1])) continue;
    n++;
    try { new vm.Script(m[2], { filename: nom + ' (script ' + n + ')' }); }
    catch (e) { defauts.push(nom + ' : script ' + n + ' illisible (' + e.message + ')'); }
  }
  const r3 = /<script src="\/(js\/[^"]+)"/g;
  while ((m = r3.exec(html))) {
    if (!fs.existsSync(path.join(controlePage.OUT, m[1]))) defauts.push(nom + ' : ' + m[1] + ' manquant');
  }
  if (html.indexOf('id="lumen-commun"') < 0) defauts.push(nom + ' : feuille commune absente');
  for (const fam of (attendu[nom] || [])) {
    if (html.indexOf('data-commun="' + fam + '"') < 0) defauts.push(nom + ' : fonctions communes « ' + fam + ' » absentes');
  }
}

/* Les identifiants cherchés par le script doivent exister dans la page,
   écrits dans le HTML ou fabriqués par le script. Relevé avant allègement,
   quand le code garde ses guillemets d'origine. Quelques absences sont
   voulues. */
const ABSENCES_VOULUES = {
  /* la Bible n'a pas d'onglet Bible : le script commun le cherche et passe */
  'bible.html': ['tog-bible'],
};
function controleIds(nom, html, alertes) {
  let m;
  const ids = new Set();
  const r2 = /(?:getElementById|\$)\(\s*'([A-Za-z][\w-]*)'\s*\)/g;
  while ((m = r2.exec(html))) ids.add(m[1]);
  for (const id of ids) {
    if ((ABSENCES_VOULUES[nom] || []).includes(id)) continue;
    if (html.indexOf('id="' + id + '"') < 0 && html.indexOf("id='" + id + "'") < 0 &&
        html.indexOf(".id='" + id + "'") < 0 && html.indexOf('.id="' + id + '"') < 0 &&
        html.indexOf("id=\\\"" + id) < 0 && html.indexOf('id="\'+') < 0) {
      alertes.push(nom + ' : identifiant « ' + id + ' » cherché mais introuvable dans la page');
    }
  }
}

module.exports = async function publication(OUT, attendu) {
  const pages = fs.readdirSync(OUT).filter(f => f.endsWith('.html'));

  const defauts = [], alertes = [];
  for (const f of pages) controleIds(f, fs.readFileSync(path.join(OUT, f), 'utf8'), alertes);

  /* 0. DIFFÉRER */
  for (const f of DIFFEREES) {
    const p = path.join(OUT, f);
    if (fs.existsSync(p)) fs.writeFileSync(p, differe(OUT, f, fs.readFileSync(p, 'utf8')));
  }

  /* 1. ALLÉGER */
  let avant = 0, apres = 0;
  for (const f of pages) {
    const p = path.join(OUT, f);
    const h = fs.readFileSync(p, 'utf8');
    const l = await allegeHTML(h);
    avant += h.length; apres += l.length;
    fs.writeFileSync(p, l);
  }
  const scriptsJS = ['lumen-app.js', 'bible-panneau.js', 'memoriser-sw.js']
    .concat(fs.existsSync(path.join(OUT, 'js')) ? fs.readdirSync(path.join(OUT, 'js')).map(f => 'js/' + f) : []);
  for (const f of scriptsJS) {
    const p = path.join(OUT, f);
    if (!fs.existsSync(p)) continue;
    const c = fs.readFileSync(p, 'utf8');
    const l = await allegeJS(c);
    avant += c.length; apres += l.length;
    fs.writeFileSync(p, l);
  }
  console.log('Allègement : ' + Math.round(avant / 1024) + ' Ko → ' + Math.round(apres / 1024) + ' Ko' + (terser ? '' : ' (terser absent : scripts laissés tels quels)'));

  /* 2. CONTRÔLER */
  controlePage.OUT = OUT;
  for (const f of ['index.html', 'bible.html', 'memoriser.html', 'articles.html', 'ressources.html', 'commentaires.html', 'etude.html', '404.html']) {
    if (!fs.existsSync(path.join(OUT, f))) defauts.push(f + ' : page absente');
  }
  for (const f of pages) controlePage(f, fs.readFileSync(path.join(OUT, f), 'utf8'), attendu || {}, defauts);
  for (const f of scriptsJS) {
    const p = path.join(OUT, f);
    if (!fs.existsSync(p)) continue;
    try { new vm.Script(fs.readFileSync(p, 'utf8'), { filename: f }); }
    catch (e) { defauts.push(f + ' : illisible (' + e.message + ')'); }
  }
  for (const d of ['bible-data', 'bible-data-seraphin']) {
    const p = path.join(OUT, d, 'index.json');
    if (!fs.existsSync(p)) { if (d === 'bible-data') defauts.push(d + '/index.json absent'); continue; }
    try { JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { defauts.push(d + '/index.json illisible'); }
  }
  /* 3. LE SERVICE WORKER DU SITE reçoit les empreintes du site et de la
     Bible : un changement de l'un ou de l'autre renouvelle le bon cache */
  if (fs.existsSync('racine/site-sw.js')) {
    const empreinte = (fichiers) => {
      const h = crypto.createHash('sha1');
      for (const f of fichiers) if (fs.existsSync(f)) h.update(f).update(fs.readFileSync(f));
      return h.digest('hex').slice(0, 12);
    };
    const tous = (d) => fs.existsSync(d) ? fs.readdirSync(d).sort().map(f => path.join(d, f)) : [];
    const bibleV = empreinte(tous(path.join(OUT, 'bible-data')).concat(tous(path.join(OUT, 'bible-data-seraphin'))));
    const siteV = empreinte(pages.map(f => path.join(OUT, f)).concat(scriptsJS.map(f => path.join(OUT, f))));
    const sw = fs.readFileSync('racine/site-sw.js', 'utf8');
    if (!/__SITE_V__/.test(sw) || !/__BIBLE_V__/.test(sw)) defauts.push('site-sw.js : marqueurs __SITE_V__ / __BIBLE_V__ absents');
    const final = await allegeJS(sw.replace(/__SITE_V__/g, siteV).replace(/__BIBLE_V__/g, bibleV));
    try { new vm.Script(final, { filename: 'site-sw.js' }); } catch (e) { defauts.push('site-sw.js : illisible (' + e.message + ')'); }
    fs.writeFileSync(path.join(OUT, 'site-sw.js'), final);
    console.log('Service worker du site : site ' + siteV + ', Bible ' + bibleV);
  }
  for (const a of alertes) console.warn('⚠ ' + a);
  if (defauts.length) {
    for (const d of defauts) console.error('✗ ' + d);
    throw new Error('Contrôle : ' + defauts.length + ' défaut(s), mise en ligne arrêtée (la version précédente reste en ligne)');
  }
  console.log('Contrôle : ' + pages.length + ' pages relues, aucun défaut' + (alertes.length ? ', ' + alertes.length + ' alerte(s)' : ''));
};

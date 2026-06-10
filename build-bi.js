/* ============================================================
   LUMEN — générateur bilingue (français + anglais)
   FR à la racine (/, /bibliotheque/, /a-propos/, /article/<slug-fr>/)
   EN sous /en/ (/en/, /en/library/, /en/about/, /en/article/<slug-en>/)
   Bouton de langue, balises hreflang, sitemap bilingue.
   CSS et apparence conservés à l'identique.
   ============================================================ */
const fs = require('fs');
const path = require('path');
const { SLUGS, THEMES_EN, UI_EN, ARTICLES_EN, NOUVEAUTES_EN } = require('./data-en.js');

const SRC = process.argv[2] || 'index__48_.html';
const OUT = process.argv[3] || 'site';
const DOMAINE = 'https://lumenveritatis.net';

const src = fs.readFileSync(SRC, 'utf8');
const css = src.slice(src.indexOf('<style>') + 7, src.indexOf('</style>')).replace(/—/g, '-');

const blockStart = src.indexOf('const THEMES');
const blockEnd = src.indexOf('const app');
const { THEMES, ARTICLES, NOUVEAUTES } = (new Function(src.slice(blockStart, blockEnd) + '; return {THEMES, ARTICLES, NOUVEAUTES};'))();

// Contenu éditable via l'admin : le journal des nouveautés est lu depuis content/ s'il existe
let NV_FR = NOUVEAUTES, NV_EN = NOUVEAUTES_EN;
if (fs.existsSync('content/nouveautes.json')) {
  const nv = JSON.parse(fs.readFileSync('content/nouveautes.json', 'utf8'));
  if (Array.isArray(nv.fr)) NV_FR = nv.fr;
  if (Array.isArray(nv.en)) NV_EN = nv.en;
  console.log('Journal lu depuis content/nouveautes.json');
}

// Contenu éditable via l'admin : chaque article est lu depuis content/articles/<slug>.json s'il existe
if (fs.existsSync('content/articles.json') || fs.existsSync('content/articles')) {

/* ── Lecture Firestore au build (publication des créations en ligne) ── */
const FS_BASE = 'https://firestore.googleapis.com/v1/projects/lumen-veritatis/databases/(default)/documents/';
function fsValeur(v) {
  if (v == null) return null;
  if (v.stringValue !== undefined) return v.stringValue;
  if (v.booleanValue !== undefined) return v.booleanValue;
  if (v.integerValue !== undefined) return Number(v.integerValue);
  if (v.doubleValue !== undefined) return v.doubleValue;
  if (v.nullValue !== undefined) return null;
  if (v.timestampValue !== undefined) return v.timestampValue;
  if (v.mapValue !== undefined) { const o = {}; const f = v.mapValue.fields || {}; for (const k in f) o[k] = fsValeur(f[k]); return o; }
  if (v.arrayValue !== undefined) return (v.arrayValue.values || []).map(fsValeur);
  return null;
}
function fsChamps(fields) { const o = {}; const f = fields || {}; for (const k in f) o[k] = fsValeur(f[k]); return o; }
function fsCurl(url) {
  const { execSync } = require('child_process');
  const brut = execSync('curl -s --max-time 12 "' + url + '"', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  return JSON.parse(brut);
}
function fsLireDoc(chemin) {
  try { const r = fsCurl(FS_BASE + chemin); return (r && r.fields) ? fsChamps(r.fields) : null; } catch (e) { return null; }
}
function fsLireCollection(nom) {
  try { const r = fsCurl(FS_BASE + nom + '?pageSize=300'); if (!r || r.error) return null; return (r.documents || []).map(d => ({ id: d.name.split('/').pop(), data: fsChamps(d.fields) })); } catch (e) { return null; }
}
const NV_LIGNE = fsLireDoc('config/nouveautes');
if (NV_LIGNE) {
  if (Array.isArray(NV_LIGNE.fr) && NV_LIGNE.fr.length) NV_FR = NV_LIGNE.fr;
  if (Array.isArray(NV_LIGNE.en) && NV_LIGNE.en.length) NV_EN = NV_LIGNE.en;
  if ((NV_LIGNE.fr && NV_LIGNE.fr.length) || (NV_LIGNE.en && NV_LIGNE.en.length)) console.log('Nouveautés : version en ligne (Firestore) utilisée');
}
  const parId = Object.create(null);
  for (const a of ARTICLES) parId[a.id] = a;
  let n = 0, crees = 0;
  // Source des articles : un fichier unique content/articles.json (tableau),
  // avec repli sur l'ancien dossier content/articles/ (un fichier par article).
  let docsArticles;
  if (fs.existsSync('content/articles.json')) {
    docsArticles = JSON.parse(fs.readFileSync('content/articles.json', 'utf8'));
  } else {
    docsArticles = fs.readdirSync('content/articles')
      .filter(f => f.endsWith('.json'))
      .map(f => { const d = JSON.parse(fs.readFileSync('content/articles/' + f, 'utf8')); if (!d.slug) d.slug = f.replace(/\.json$/, ''); return d; });
  }
  for (const d of docsArticles) {
    const slug = d.slug;
    const a = parId[slug];
    if (a) {
      if (d.titre_fr != null) a.titre = d.titre_fr;
      if (d.resume_fr != null) a.resume = d.resume_fr;
      if (d.contenu_fr != null) a.contenu = d.contenu_fr;
      if (d.theme) a.theme = d.theme;
      if (d.date) a.date = d.date;
      const e = ARTICLES_EN[slug] || (ARTICLES_EN[slug] = {});
      if (d.titre_en != null) e.titre = d.titre_en;
      if (d.resume_en != null) e.resume = d.resume_en;
      if (d.contenu_en != null) e.contenu = d.contenu_en;
    } else if (d.titre_fr != null && d.contenu_fr != null) {
      // Article nouveau : créé entièrement depuis content/articles/
      const neuf = { id: slug, titre: d.titre_fr, resume: d.resume_fr || '', contenu: d.contenu_fr, theme: d.theme || 'doctrine', date: d.date || '' };
      ARTICLES.push(neuf); parId[slug] = neuf;
      ARTICLES_EN[slug] = {
        titre: d.titre_en != null ? d.titre_en : d.titre_fr,
        resume: d.resume_en != null ? d.resume_en : (d.resume_fr || ''),
        contenu: d.contenu_en != null ? d.contenu_en : d.contenu_fr
      };
      crees++;
    }
    n++;
  }
  console.log('Articles lus (' + (fs.existsSync('content/articles.json') ? 'fichier unique' : 'dossier') + ') : ' + n + (crees ? (' (dont ' + crees + ' créé(s))') : ''));

  /* ── Publication en ligne : le build lit Firestore (lecture publique) ── */
  const enLigne = fsLireCollection('contenu');
  if (enLigne === null) console.log('Firestore non joignable au build : publication en ligne ignorée (normal hors Netlify).');
  else {
    let pubs = 0;
    for (const docX of enLigne) {
      const d = docX.data, slugX = docX.id;
      if (!d.cree || parId[slugX]) continue;
      if (d.titre_fr == null || d.contenu_fr == null) continue;
      const neuf = { id: slugX, titre: d.titre_fr, resume: d.resume_fr || '', contenu: d.contenu_fr, theme: d.theme || 'doctrine', date: d.date || '' };
      ARTICLES.push(neuf); parId[slugX] = neuf;
      ARTICLES_EN[slugX] = {
        titre: d.titre_en != null ? d.titre_en : d.titre_fr,
        resume: d.resume_en != null ? d.resume_en : (d.resume_fr || ''),
        contenu: d.contenu_en != null ? d.contenu_en : d.contenu_fr
      };
      pubs++;
    }
    if (pubs) console.log('Articles créés en ligne publiés en pages :', pubs);
  }
}

// Filet de sécurité : tout article français doit avoir une entrée anglaise.
// Si une traduction manque, on retombe sur le texte français plutôt que de planter le build.
for (const a of ARTICLES) {
  if (!ARTICLES_EN[a.id]) {
    ARTICLES_EN[a.id] = { titre: a.titre, resume: a.resume, contenu: a.contenu };
    console.warn('EN manquant, repli FR pour :', a.id);
  } else {
    const e = ARTICLES_EN[a.id];
    if (e.titre == null) e.titre = a.titre;
    if (e.resume == null) e.resume = a.resume;
    if (e.contenu == null) e.contenu = a.contenu;
  }
}

// Structure des thèmes éditable depuis content/themes.json (noms FR/EN, catégories, ordre des articles)
if (fs.existsSync('content/themes.json')) {
  const tj = JSON.parse(fs.readFileSync('content/themes.json', 'utf8')).themes;
  if (Array.isArray(tj)) {
    const refaits = tj.map(t => ({
      id: t.id, nom: t.nom_fr, desc: t.desc_fr,
      categories: (t.categories || []).map(c => ({
        id: c.id, nom: c.nom_fr,
        arts: (c.arts || []).map(x => typeof x === 'string' ? x : (x && x.slug) || '').filter(Boolean)
      }))
    }));
    THEMES.length = 0; THEMES.push(...refaits);
    for (const k of Object.keys(THEMES_EN)) delete THEMES_EN[k];
    for (const t of tj) {
      THEMES_EN[t.id] = {
        nom: t.nom_en, desc: t.desc_en,
        cats: Object.fromEntries((t.categories || []).map(c => [c.id, c.nom_en]))
      };
    }
    console.log('Thèmes lus depuis content/themes.json :', THEMES.length);
  }
}

// Apparence éditable : couleur d'accent (--or) depuis content/settings.json

/* — Poussière lumineuse en suspension (interactive) — */

let APPEARANCE_CSS = '';
if (fs.existsSync('content/settings.json')) {
  try {
    const st = JSON.parse(fs.readFileSync('content/settings.json', 'utf8'));
    const a = String(st.accent || '').trim();
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(a) && a.toLowerCase() !== '#efe3c0') {
      APPEARANCE_CSS = `:root{--or:${a}}`;
      console.log('Apparence : couleur d\'accent personnalisée', a);
    }
  } catch (e) { console.warn('settings.json illisible, accent par défaut'); }
}

/* ---- interface, par langue ---- */
const UI = {
  fr: {
    html: 'fr', oglocale: 'fr_FR',
    menu_home: 'Accueil', menu_library: 'Bibliothèque', menu_about: 'À propos', menu_memorise: 'Mémoriser',
    news_title: 'Nouveautés',
    home_intro: "Un lieu pour entrer dans l'intelligence de la foi catholique, des premiers pas jusqu'aux questions les plus profondes.",
    home_domains_label: 'Les domaines', home_explore: 'Explorer par thème',
    entry_one: 'entrée', entry_many: 'entrées',
    filter_all: 'Tout', context_library: 'La bibliothèque',
    lib_surtitle: 'La bibliothèque', lib_title: 'Les domaines',
    lib_expand: 'Tout déplier', lib_collapse: 'Tout replier',
    objections_label: 'Réponse aux objections',
    lib_empty: "Ce domaine n'a pas encore d'entrée. Les contenus s'ajoutent au fil du temps.",
    footer_verse: '« Le peuple qui marchait dans les ténèbres a vu une grande lumière ; sur ceux qui habitaient le pays de l\'ombre de la mort, une lumière a resplendi » <span class="ref-pied">Isaïe 9:1</span>',
    about_surtitle: 'Le projet', about_title: 'À propos de Lumen',
    about_p: [
      "Lumen est un lieu d'étude et de méditation autour de la foi catholique. Son but est simple : rendre la théologie accessible et fidèle à l'enseignement de l'Église, pour le débutant qui découvre comme pour le croyant qui veut approfondir.",
      "Chaque entrée s'appuie sur les Écritures, la tradition de l'Église et l'enseignement constant du Magistère.",
      "Le site est continuellement enrichi et mis à jour."
    ],
    notfound_title: 'Page introuvable', notfound_text: "Cette page n'existe pas.", notfound_back: "Revenir à l'accueil",
    site_desc_home: "Un lieu pour entrer dans l'intelligence de la foi catholique, des premiers pas jusqu'aux questions les plus profondes.",
    site_desc_library: "Toutes les entrées de Lumen, classées par domaine : doctrine, Écriture, sacrements, figures, histoire et philosophie.",
    site_desc_about: "Lumen, un lieu d'étude et de méditation autour de la foi catholique : rendre la théologie accessible et fidèle à l'enseignement de l'Église.",
    t_home: 'Lumen · Théologie catholique', t_library: 'Bibliothèque · Lumen', t_about: 'À propos · Lumen', t_404: 'Page introuvable · Lumen',
    search_placeholder: 'Rechercher dans Lumen…', search_hint: 'Tapez un mot pour parcourir les articles.', search_empty: 'Aucun résultat pour',
    memo_label:"L'outil", memo_title:'Mémoriser', memo_sub:'Apprends les versets par cœur et garde-les, à ton rythme.', memo_open:'Ouvrir Mémoriser', memo_start:'Commencer', memo_mastery:'de maîtrise', memo_acquired:'acquis', memo_learning:'en cours', memo_review:'à revoir', memo_signedout:'Connecte-toi pour suivre ta progression.',
    other_label: 'EN'
  },
  en: Object.assign({}, UI_EN, {
    oglocale: 'en', other_label: 'FR',
    news_title: "What's New",
    lib_surtitle: 'The library', lib_title: 'The domains',
    lib_expand: 'Expand all', lib_collapse: 'Collapse all',
    objections_label: 'Answering the objections',
    lib_empty: 'This domain has no entry yet. Content is added over time.',
    site_desc_home: UI_EN.home_intro,
    site_desc_library: 'All the entries of Lumen, arranged by domain: doctrine, Scripture, sacraments, figures, history and philosophy.',
    site_desc_about: 'Lumen, a place of study and meditation on the Catholic faith: making theology accessible and faithful to the teaching of the Church.',
    t_home: 'Lumen · Catholic Theology', t_library: 'Library · Lumen', t_about: 'About · Lumen', t_404: 'Page not found · Lumen',
    memo_label:'The tool', memo_title:'Memorise', memo_sub:'Learn the verses by heart and keep them, at your own pace.', memo_open:'Open Memorise', memo_start:'Start', memo_mastery:'mastery', memo_acquired:'learned', memo_learning:'in progress', memo_review:'to review', memo_signedout:'Sign in to track your progress.'
  })
};

/* ---- helpers de données par langue ---- */
const slugOf = (lang, frId) => lang === 'fr' ? frId : (SLUGS[frId] || frId);
const APOLOGIES = { 'la-communion-des-saints': 'l-intercession-des-saints', 'le-bapteme': 'le-bapteme-des-petits-enfants', 'marie': 'marie-mere-de-dieu', 'l-eucharistie': 'la-presence-reelle' };
const depouiller = h => (h || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const themeNom = (lang, id) => lang === 'fr' ? (THEMES.find(x => x.id === id) || {}).nom : THEMES_EN[id].nom;
const themeDesc = (lang, id) => lang === 'fr' ? (THEMES.find(x => x.id === id) || {}).desc : THEMES_EN[id].desc;
const catNom = (lang, themeId, catId) => {
  if (lang === 'fr') { const t = THEMES.find(x => x.id === themeId); const c = ((t || {}).categories || []).find(c => c.id === catId); return c ? c.nom : ''; }
  return (((THEMES_EN[themeId] || {}).cats) || {})[catId] || '';
};
const compteParTheme = id => ARTICLES.filter(a => a.theme === id).length;
const artTitre = (lang, a) => lang === 'fr' ? a.titre : ARTICLES_EN[a.id].titre;
const artResume = (lang, a) => lang === 'fr' ? a.resume : ARTICLES_EN[a.id].resume;
function resumeHtmlBI(txt, lang){
  if(txt.length<=195) return '<p>'+txt+'</p>';
  let cut=txt.lastIndexOf(' ',150); if(cut<100)cut=150;
  const court=txt.slice(0,cut).replace(/[\s,;:\u2013\u2014-]+$/,'');
  const more=lang==='fr'?'voir plus':'see more', less=lang==='fr'?'voir moins':'see less';
  return '<p class="resume r-trunc"><span class="r-court">'+court+'\u2026</span><span class="r-full" hidden>'+txt+'</span> <span class="voir-plus" role="button" tabindex="0" data-more="'+more+'" data-less="'+less+'">'+more+'</span></p>';
}
const artContenu = (lang, a) => lang === 'fr' ? a.contenu : ARTICLES_EN[a.id].contenu;

/* ---- chemin relatif d'un dossier vers une cible (chemins absolus) ---- */
function rel(fromDir, toPath) {
  const f = fromDir.split('/').filter(Boolean);
  const t = toPath.split('/').filter(Boolean);
  let i = 0; while (i < f.length && i < t.length && f[i] === t[i]) i++;
  let r = '../'.repeat(f.length - i) + t.slice(i).join('/');
  if (r === '') return './';
  if (toPath.endsWith('/') && !r.endsWith('/')) r += '/';
  return r;
}

/* ---- réécriture des liens internes (#/… → relatif depuis la page) ----
   base = préfixe pour remonter à la racine de la langue courante */
function reLink(html, base, lang) {
  const home = base === '' ? './' : base;
  const art = lang === 'fr' ? 'article/' : 'article/';
  return html
    .replace(/href="#\/article\/([a-z0-9\-]+)"/g, `href="${base}${art}$1/"`)
    .replace(/href="#\/(bibliotheque|library)\?theme=([a-z0-9\-]+)"/g, `href="${base}$1/?theme=$2"`)
    .replace(/href="#\/(bibliotheque|library)"/g, `href="${base}$1/"`)
    .replace(/href="#\/(a-propos|about)"/g, `href="${base}$1/"`)
    .replace(/href="#\/"/g, `href="${home}"`);
}

/* ---- polices + petite règle pour le bouton de langue ---- */
const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&display=swap" rel="stylesheet">`;

const FIREBASE_HEAD = `<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>`;


const ADMIN_JS = fs.existsSync('admin.js') ? fs.readFileSync('admin.js', 'utf8') : '';
function buildIndex(lang) {
  const baseI = lang === 'fr' ? '/' : '/en/';
  const artI = lang === 'fr' ? 'article/' : 'article/';
  const libI = lang === 'fr' ? 'bibliotheque/' : 'library/';
  const arts = ARTICLES.map(a => {
    const en = ARTICLES_EN[a.id] || {};
    return lang === 'fr'
      ? { id: a.id, titre: a.titre, resume: a.resume || '', theme: a.theme, u: baseI + artI + slugOf('fr', a.id) + '/' }
      : { id: a.id, titre: en.titre || a.titre, resume: en.resume || a.resume || '', theme: a.theme, u: baseI + artI + slugOf('en', a.id) + '/' };
  });
  const ths = THEMES.map(t => ({
    id: t.id,
    nom: themeNom(lang, t.id),
    desc: lang === 'fr' ? (t.desc || '') : (((THEMES_EN[t.id] || {}).desc) || t.desc || ''),
    cats: (t.categories || []).map(c => ({ id: c.id, nom: lang === 'fr' ? c.nom : ((((THEMES_EN[t.id] || {}).cats) || {})[c.id] || c.nom), arts: c.arts || [] }))
  }));
  const u = UI[lang] || {};
  const acc = {};
  ['home_domains_label','home_explore','memo_label','memo_title','memo_mastery','memo_acquired','memo_learning','memo_review','memo_start'].forEach(k => { if (u[k] != null) acc[k] = u[k]; });
  return { articles: arts, themes: ths, accueil: acc, urls: { biblio: baseI + libI, accueil: baseI, memoriser: '/memoriser.html' } };
}

const EXTRA_CSS = `
nav.menu a.lien-langue{font-size:13px;letter-spacing:.2em;opacity:.65}
nav.menu a.lien-langue:hover{opacity:1}
@media(max-width:720px){nav.menu a.lien-langue{opacity:1}}
.auth-icone{position:relative}
.auth-overlay{position:fixed;inset:0;z-index:200;background:rgba(8,8,8,.98);display:none;align-items:center;justify-content:center;padding:24px}
.auth-overlay.ouvert{display:flex}
.auth-modal{position:relative;width:100%;max-width:400px;background:var(--encre-2);border:1px solid var(--filet);padding:40px 34px}
.auth-fermer{position:absolute;top:16px;right:18px;cursor:pointer;color:var(--parchemin-att);font-size:22px;line-height:1;transition:color .3s}
.auth-fermer:hover{color:var(--parchemin)}
.auth-m-title{font-family:'Cormorant Garamond',serif;font-size:24px;text-align:center;margin-bottom:24px;color:var(--parchemin)}
.auth-m-tabs{display:flex;border-bottom:1px solid var(--filet-fort);margin-bottom:22px}
.auth-m-tab{flex:1;padding:9px;background:none;border:none;border-bottom:2px solid transparent;color:var(--parchemin-att);font-family:'Cormorant Garamond',serif;font-size:15px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;transition:color .25s,border-color .25s}
.auth-m-tab.on{color:var(--or);border-bottom-color:var(--or)}
.auth-modal input{width:100%;background:#161616;border:1px solid var(--filet-fort);color:var(--parchemin);font-family:'EB Garamond',serif;font-size:16px;padding:10px 13px;margin-bottom:12px;outline:none;border-radius:0}
.auth-modal input:focus{border-color:var(--or)}
.auth-modal input::placeholder{color:var(--parchemin-att)}
.auth-m-primary{display:block;width:100%;text-align:center;padding:12px;background:var(--or);color:var(--encre);border:none;font-family:'Cormorant Garamond',serif;font-size:15px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;margin-top:6px;transition:background .25s}
.auth-m-primary:hover{background:var(--or-pale)}
.auth-m-or{text-align:center;color:var(--parchemin-att);font-size:13px;margin:16px 0}
.auth-m-google{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;padding:10px;background:none;border:1px solid var(--filet-fort);color:var(--parchemin);font-family:'EB Garamond',serif;font-size:15px;cursor:pointer;transition:border-color .25s}
.auth-m-google:hover{border-color:var(--or)}
.auth-m-link{display:block;width:100%;text-align:center;background:none;border:none;color:var(--parchemin-att);font-size:14px;margin-top:16px;cursor:pointer;font-family:'EB Garamond',serif;transition:color .25s}
.auth-m-link:hover{color:var(--or)}
.auth-m-msg{font-size:14px;padding:8px 12px;margin-bottom:12px;display:none}
.auth-m-msg.err{display:block;background:rgba(154,59,59,.18);border:1px solid var(--pourpre);color:#eba0a0}
.auth-m-msg.ok{display:block;background:rgba(58,107,74,.18);border:1px solid #3a6b4a;color:#a0d4b2}
.auth-m-email{text-align:center;color:var(--parchemin-att);font-size:15px;margin-bottom:22px;word-break:break-all}
input[type="search"]::-webkit-search-cancel-button,input[type="search"]::-webkit-search-decoration{-webkit-appearance:none;appearance:none;display:none}
.auth-m-btn{display:block;width:100%;box-sizing:border-box;text-align:center;padding:13px 10px;border:1px solid var(--filet-fort);color:var(--parchemin);font-family:'Cormorant Garamond',serif;font-size:14px;letter-spacing:.18em;text-transform:uppercase;text-decoration:none;transition:border-color .3s,color .3s}
.auth-m-btn:hover{border-color:var(--or);color:var(--or-pale)}

/* ── Raffinements d'interface ── */
html{scroll-behavior:smooth}
body{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
::selection{background:rgba(231,224,207,.14);color:#fff}
h1,h2,h3{text-wrap:balance}
.lecture p{text-wrap:pretty}
.lecture a{color:var(--or,#efe3c0);text-decoration:underline;text-decoration-thickness:1px;text-decoration-color:rgba(231,224,207,.34);text-underline-offset:3px;transition:text-decoration-color .25s ease}
.lecture a:hover{text-decoration-color:var(--or,#efe3c0)}
*{scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.55) transparent}
::-webkit-scrollbar{width:10px;height:10px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,.55);background-clip:content-box;border:3px solid transparent;border-radius:99px}
::-webkit-scrollbar-thumb:hover{background:rgba(231,224,207,.6);background-clip:content-box;border:3px solid transparent}
:focus-visible{outline:1px solid rgba(231,224,207,.28);outline-offset:3px}
.article-lien{transition:transform .35s ease,border-color .35s ease,background .35s ease}
.article-lien:hover{transform:translateY(-2px)}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}.article-lien:hover{transform:none}}

/* — Outils d'article : copier, partager, navigation — */
.art-bar{display:flex;gap:26px;justify-content:center;margin:-10px 0 36px}
.art-btn{background:none;border:none;padding:4px 2px;display:inline-flex;align-items:center;justify-content:center;color:var(--parchemin);opacity:.4;font-size:15px;cursor:pointer;transition:opacity .3s,color .3s}
.art-btn:hover,.art-btn.ok{opacity:1;color:var(--or)}
.art-nav{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:72px}
.lecture .art-nav-l{text-decoration:none;display:block;border:1px solid var(--filet);padding:28px 30px;transition:background .35s,border-color .35s}
.lecture .art-nav-l:hover{background:var(--encre-2);border-color:var(--filet-fort)}
.art-nav-n{grid-column:2;text-align:right}
.art-nav-k{display:block;font-size:11.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--or);margin-bottom:8px}
.art-nav-t{font-family:'Cormorant Garamond',serif;font-size:21px;line-height:1.3;color:var(--parchemin);transition:color .3s}
.lecture .art-nav-l:hover .art-nav-t{color:var(--or-pale)}
@media(max-width:640px){.art-nav{grid-template-columns:1fr}.art-nav-n{grid-column:1;text-align:left}}
/* — Figures dans les articles — */
.lecture figure{margin:38px auto;text-align:center;max-width:100%}
.lecture figure img{max-width:100%;height:auto;border:1px solid var(--filet)}
.lecture figcaption{margin-top:12px;font-size:14.5px;font-style:italic;color:var(--parchemin-att)}
`;

function header(lang, type, base, otherRel, ctx) {
  const u = UI[lang];
  const journal = (lang === 'fr' ? NV_FR : NV_EN).map(function(g){return '<div class="nouv-groupe"><div class="nouv-date">'+g.d+'</div>'+g.items.map(function(t){return '<div class="nouv-ligne">'+t+'</div>';}).join('')+'</div>';}).join('');
  const journSrc = (lang === 'fr' ? NV_FR : NV_EN);
  const nsig = NV_FR.length + '|' + NV_FR.reduce(function(a,g){return a+g.items.length;},0);
  const home = base === '' ? './' : base;
  const cl = t => type === t ? ' class="actif"' : '';
  const lib = lang === 'fr' ? 'bibliotheque/' : 'library/';
  return `<header>
  <div class="barre">
    <a href="${home}" class="logo">Lumen</a>
    <button class="burger" id="burger" aria-label="Menu">☰</button>
    <nav class="menu" id="menu">
      <a href="${home}"${cl('home')}>${u.menu_home}</a>
      <a href="${base}${lib}"${cl('library')}>${u.menu_library}</a>
      <a href="${lang === 'en' ? '/en/bible.html' : '/bible.html'}">Bible</a>
      <a href="/memoriser.html">${u.menu_memorise}</a>
      <a href="${otherRel}" class="lien-langue" hreflang="${lang === 'fr' ? 'en' : 'fr'}">${u.other_label}</a>
      <span class="rech-loupe" id="rech-ouvrir" role="button" tabindex="0" aria-label="${u.menu_home === 'Home' ? 'Search' : 'Rechercher'}"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="10" cy="10" r="6.5"/><line x1="15" y1="15" x2="21" y2="21" stroke-linecap="round"/></svg><span class="ll-mob">${u.menu_home === 'Home' ? 'Search' : 'Rechercher'}</span></span>
      <span class="rech-loupe cloche" id="cloche-ouvrir" role="button" tabindex="0" aria-label="${u.news_title}" data-sig="${nsig}"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0" stroke-linecap="round"/></svg><span class="ll-mob">${u.news_title}</span><span class="cloche-point"></span></span>
      <span class="rech-loupe auth-icone" id="auth-ouvrir" role="button" tabindex="0" aria-label="${lang === 'fr' ? 'Compte' : 'Account'}"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="3.4"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0" stroke-linecap="round"/></svg><span class="ll-mob">${lang === 'fr' ? 'Compte' : 'Account'}</span></span>
    </nav>
    <div class="contexte-bar" id="contexte">${ctx || ''}</div>
  </div>
</header>
<div class="rech-overlay" id="rech-overlay">
  <div class="rech-boite">
    <div class="rech-haut">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="10" cy="10" r="6.5"/><line x1="15" y1="15" x2="21" y2="21" stroke-linecap="round"/></svg>
      <input type="search" id="rech-champ" placeholder="${u.search_placeholder}" autocomplete="off" spellcheck="false">
      <span class="rech-fermer" id="rech-fermer" role="button" tabindex="0" aria-label="${u.menu_home === 'Home' ? 'Close' : 'Fermer'}">\u2715</span>
    </div>
    <div class="rech-res" id="rech-res"></div>
  </div>
</div>
<div class="rech-overlay" id="nouv-overlay">
  <div class="rech-boite">
    <div class="rech-haut">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0" stroke-linecap="round"/></svg>
      <div class="nouv-titre-panneau">${u.news_title}</div>
      <span class="rech-fermer" id="nouv-fermer" role="button" tabindex="0" aria-label="${u.menu_home === 'Home' ? 'Close' : 'Fermer'}">✕</span>
    </div>
    <div class="nouv-liste" id="nouv-liste">${journal}</div>
  </div>
</div>
<div class="auth-overlay" id="auth-overlay">
  <div class="auth-modal">
    <span class="auth-fermer" id="auth-fermer" role="button" tabindex="0">✕</span>
    <div id="auth-out">
      <div class="auth-m-title">${lang === 'fr' ? 'Connexion' : 'Sign in'}</div>
      <div class="auth-m-tabs">
        <button class="auth-m-tab on" id="amt-si">${lang === 'fr' ? 'Connexion' : 'Sign in'}</button>
        <button class="auth-m-tab" id="amt-su">${lang === 'fr' ? 'Inscription' : 'Sign up'}</button>
      </div>
      <div class="auth-m-msg" id="auth-m-msg"></div>
      <input type="email" id="auth-email" placeholder="${lang === 'fr' ? 'Adresse e-mail' : 'Email address'}" autocomplete="email">
      <input type="password" id="auth-pw" placeholder="${lang === 'fr' ? 'Mot de passe' : 'Password'}" autocomplete="current-password">
      <input type="password" id="auth-cf" placeholder="${lang === 'fr' ? 'Confirmer le mot de passe' : 'Confirm password'}" autocomplete="new-password" style="display:none">
      <button class="auth-m-primary" id="auth-submit">${lang === 'fr' ? 'Se connecter' : 'Sign in'}</button>
      <div class="auth-m-or">${lang === 'fr' ? 'ou' : 'or'}</div>
      <button class="auth-m-google" id="auth-google"><svg width="17" height="17" viewBox="0 0 18 18"><path fill="#EA4335" d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.54-2.54C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.91 2.26C4.6 5.05 6.62 3.48 9 3.48z"/><path fill="#FBBC05" d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.1.83-.64 2.08-1.84 2.92l2.84 2.2c1.7-1.57 2.68-3.88 2.68-6.62z"/><path fill="#34A853" d="M3.88 10.78A5.54 5.54 0 0 1 3.58 9c0-.62.11-1.22.29-1.78L.96 4.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.92-2.26z"/><path fill="#4A90D9" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.84-2.2c-.76.53-1.78.9-3.12.9-2.38 0-4.4-1.57-5.12-3.74L.96 13.04C2.44 15.98 5.48 18 9 18z"/></svg>${lang === 'fr' ? 'Continuer avec Google' : 'Continue with Google'}</button>
      <button class="auth-m-link" id="auth-forgot">${lang === 'fr' ? 'Mot de passe oublié ?' : 'Forgot password?'}</button>
    </div>
    <div id="auth-in" style="display:none">
      <div class="auth-m-title">${lang === 'fr' ? 'Mon compte' : 'My account'}</div>
      <div class="auth-m-email" id="auth-in-email"></div>
      <a class="auth-m-btn" href="/bible.html#notes">${lang === 'fr' ? 'Mes notes' : 'My notes'}</a>
      <button class="auth-m-link" id="auth-logout">${lang === 'fr' ? 'Déconnexion' : 'Sign out'}</button>
    </div>
  </div>
</div>`;
}

function footer(lang) {
  return `<footer>
  <div class="marque">Lumen</div>
  <div class="verset-pied">${UI[lang].footer_verse}</div>
  <div class="copy" id="annee"></div>
</footer>`;
}

const COMMUN_JS = `document.getElementById('burger').addEventListener('click',function(){document.getElementById('menu').classList.toggle('ouvert');});
document.getElementById('annee').textContent='© '+new Date().getFullYear()+' Lumen';\n(function(){var b=document.getElementById('cloche-ouvrir'),ov=document.getElementById('nouv-overlay'),fe=document.getElementById('nouv-fermer');if(!b||!ov)return;var pt=b.querySelector('.cloche-point'),sig=b.getAttribute('data-sig')||'';function vu(){try{return localStorage.getItem('lumen_nouv_vu');}catch(e){return null;}}function maj(){if(pt)pt.style.display=(vu()===sig?'none':'block');}maj();function o(){ov.classList.add('ouvert');document.body.style.overflow='hidden';try{localStorage.setItem('lumen_nouv_vu',sig);}catch(e){}maj();}function f(){ov.classList.remove('ouvert');document.body.style.overflow='';}b.addEventListener('click',o);b.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();o();}});fe.addEventListener('click',f);ov.addEventListener('click',function(e){if(e.target===ov)f();});document.addEventListener('keydown',function(e){if(e.key==='Escape'&&ov.classList.contains('ouvert'))f();});})();
document.addEventListener('click',function(e){var vp=e.target.closest&&e.target.closest('.voir-plus');if(!vp)return;e.preventDefault();e.stopPropagation();var p=vp.closest('.r-trunc');if(!p)return;var c=p.querySelector('.r-court'),fl=p.querySelector('.r-full');if(fl.hasAttribute('hidden')){c.setAttribute('hidden','');fl.removeAttribute('hidden');vp.textContent=vp.dataset.less;}else{fl.setAttribute('hidden','');c.removeAttribute('hidden');vp.textContent=vp.dataset.more;}});
document.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&e.target.classList&&e.target.classList.contains('voir-plus')){e.preventDefault();e.target.click();}});
(function(){
  var L = document.querySelector('a.lien-langue');
  var cur = location.pathname.indexOf('/en/') === 0 ? 'en' : 'fr';
  var pref = null;
  try { pref = localStorage.getItem('lv_lang'); } catch(e) {}
  if (L && pref && pref !== cur) { location.replace(L.getAttribute('href')); return; }
  if (L) L.addEventListener('click', function(){ try { localStorage.setItem('lv_lang', cur === 'fr' ? 'en' : 'fr'); } catch(e) {} });
})();`;

const MEMO_JS = `(function(){
  var box=document.getElementById('memo-scores'); if(!box)return;
  if(typeof firebase==='undefined')return;
  var cfg={apiKey:"AIzaSyC19lFNWUd-KYhCP4o7gpp0IcyfRTyHOyA",authDomain:"lumen-veritatis.firebaseapp.com",projectId:"lumen-veritatis",storageBucket:"lumen-veritatis.firebasestorage.app",messagingSenderId:"195902823875",appId:"1:195902823875:web:a8be1f216a5ae1d945f176"};
  if(!firebase.apps.length)firebase.initializeApp(cfg);
  var auth=firebase.auth(), db=firebase.firestore();
  var FR=!(window.LUMEN&&window.LUMEN.lang==='en');
  var L={out:FR?'Connecte-toi pour suivre ta progression.':'Sign in to track your progress.',empty:FR?'Commence à mémoriser tes premiers versets.':'Start memorising your first verses.'};
  function note(t){var n=document.getElementById('memo-note');if(n)n.textContent=t;}
  function bar(r,a,v){var t=(r+a+v)||1,e;e=box.querySelector('#memo-bar .r');if(e)e.style.width=(r/t*100)+'%';e=box.querySelector('#memo-bar .a');if(e)e.style.width=(a/t*100)+'%';e=box.querySelector('#memo-bar .v');if(e)e.style.width=(v/t*100)+'%';}
  auth.onAuthStateChanged(function(u){
    if(!u){note(L.out);box.setAttribute('data-state','out');return;}
    db.doc('users/'+u.uid+'/meta/progress').get().then(function(s){
      var items=(s.exists&&s.data().items)?s.data().items:{};
      var r=0,a=0,v=0,sum=0,tot=0,id,b;
      for(id in items){if(!Object.prototype.hasOwnProperty.call(items,id))continue;b=(items[id]&&items[id].box)||0;tot++;sum+=b;if(b<=1)r++;else if(b<=3)a++;else v++;}
      if(!tot){note(L.empty);box.setAttribute('data-state','empty');return;}
      var pct=Math.round(sum/(5*tot)*100);
      var ep=document.getElementById('memo-pct');if(ep)ep.textContent=pct+(FR?String.fromCharCode(160)+'%':'%');
      var ev=document.getElementById('memo-v');if(ev)ev.textContent=v;
      var ea=document.getElementById('memo-a');if(ea)ea.textContent=a;
      var er=document.getElementById('memo-r');if(er)er.textContent=r;
      bar(r,a,v);
      box.setAttribute('data-state','ok');
    }).catch(function(){note(L.out);box.setAttribute('data-state','out');});
  });
})();`;

const AUTH_JS = `(function(){
  var cfg={apiKey:"AIzaSyC19lFNWUd-KYhCP4o7gpp0IcyfRTyHOyA",authDomain:"lumen-veritatis.firebaseapp.com",projectId:"lumen-veritatis",storageBucket:"lumen-veritatis.firebasestorage.app",messagingSenderId:"195902823875",appId:"1:195902823875:web:a8be1f216a5ae1d945f176"};
  if(typeof firebase==='undefined')return;
  if(!firebase.apps.length)firebase.initializeApp(cfg);
  var auth=firebase.auth();
  var FR=!(window.LUMEN&&window.LUMEN.lang==='en');
  function L(fr,en){return FR?fr:en;}
  var icone=document.getElementById('auth-ouvrir'),ov=document.getElementById('auth-overlay'),fe=document.getElementById('auth-fermer');
  if(!icone||!ov)return;
  var vOut=document.getElementById('auth-out'),vIn=document.getElementById('auth-in'),mode='si';
  function el(id){return document.getElementById(id);}
  function msg(txt,kind){var m=el('auth-m-msg');m.textContent=txt;m.className='auth-m-msg '+kind;}
  function clr(){var m=el('auth-m-msg');m.className='auth-m-msg';m.textContent='';}
  function setMode(x){mode=x;clr();
    el('amt-si').classList.toggle('on',x==='si');
    el('amt-su').classList.toggle('on',x==='su');
    el('auth-cf').style.display=(x==='su')?'block':'none';
    el('auth-pw').style.display=(x==='forgot')?'none':'block';
    el('auth-submit').textContent=(x==='si')?L('Se connecter','Sign in'):(x==='su')?L('Créer le compte','Create account'):L('Envoyer le lien','Send link');
    el('auth-forgot').textContent=(x==='forgot')?L('← Retour','← Back'):L('Mot de passe oublié ?','Forgot password?');
  }
  function open(){clr();
    if(auth.currentUser){vOut.style.display='none';vIn.style.display='block';el('auth-in-email').textContent=auth.currentUser.email||auth.currentUser.displayName||'';}
    else{vOut.style.display='block';vIn.style.display='none';setMode('si');}
    ov.classList.add('ouvert');document.body.style.overflow='hidden';}
  function close(){ov.classList.remove('ouvert');document.body.style.overflow='';}
  icone.addEventListener('click',open);
  icone.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
  fe.addEventListener('click',close);
  ov.addEventListener('click',function(e){if(e.target===ov)close();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&ov.classList.contains('ouvert'))close();});
  el('amt-si').addEventListener('click',function(){setMode('si');});
  el('amt-su').addEventListener('click',function(){setMode('su');});
  el('auth-forgot').addEventListener('click',function(){setMode(mode==='forgot'?'si':'forgot');});
  el('auth-submit').addEventListener('click',function(){
    var em=el('auth-email').value.trim(),pw=el('auth-pw').value,cf=el('auth-cf').value;clr();
    if(mode==='forgot'){auth.sendPasswordResetEmail(em).then(function(){msg(L('Lien envoyé. Vérifiez votre boîte mail.','Link sent. Check your inbox.'),'ok');}).catch(function(e){msg(e.message,'err');});return;}
    if(mode==='su'){if(pw!==cf){msg(L('Les mots de passe ne correspondent pas.','Passwords do not match.'),'err');return;}auth.createUserWithEmailAndPassword(em,pw).catch(function(e){msg(e.message,'err');});return;}
    auth.signInWithEmailAndPassword(em,pw).catch(function(e){msg(e.message,'err');});
  });
  ['auth-email','auth-pw','auth-cf'].forEach(function(id){var x=el(id);if(x)x.addEventListener('keydown',function(e){if(e.key==='Enter')el('auth-submit').click();});});
  el('auth-google').addEventListener('click',function(){auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).catch(function(e){msg(e.message,'err');});});
  el('auth-logout').addEventListener('click',function(){auth.signOut().then(close);});
  auth.onAuthStateChanged(function(u){icone.classList.toggle('connecte',!!u);if(ov.classList.contains('ouvert'))open();});
})();`;

const BIBLIO_JS = `(function(){
  function cascadeA(els){ els.forEach(function(el,i){ if(!el)return; var d=Math.min(i*40,640); el.style.animation='none'; void el.offsetHeight; el.style.animation='apparaitDom .45s cubic-bezier(.2,.7,.3,1) '+d+'ms both'; }); }
  function cascadeF(els,fin){ els.forEach(function(el){ if(el)el.style.animation='apparaitDomFerme .25s ease forwards'; }); setTimeout(fin,240); }
  function ouvrir(sec){ if(!sec||sec.classList.contains('ouvert'))return; sec.classList.add('ouvert'); var sep=sec.querySelector('.dom-sep'),corps=sec.querySelector('.dom-corps'); cascadeA([sep].concat([].slice.call(corps.children))); }
  function fermer(sec){ if(!sec||!sec.classList.contains('ouvert'))return; var sep=sec.querySelector('.dom-sep'),corps=sec.querySelector('.dom-corps'); cascadeF([sep].concat([].slice.call(corps.children)),function(){ sec.classList.remove('ouvert'); maj(); }); }
  function basculer(sec){ sec.classList.contains('ouvert')?fermer(sec):ouvrir(sec); maj(); }
  function ouvrirSous(s){ if(!s||s.classList.contains('ouvert'))return; s.classList.add('ouvert'); var corps=s.querySelector('.sous-corps'); cascadeA([].slice.call(corps.children)); }
  function fermerSous(s){ if(!s||!s.classList.contains('ouvert'))return; var corps=s.querySelector('.sous-corps'); cascadeF([].slice.call(corps.children),function(){ s.classList.remove('ouvert'); }); }
  function basculerSous(s){ s.classList.contains('ouvert')?fermerSous(s):ouvrirSous(s); }
  function tout(){ var secs=[].slice.call(document.querySelectorAll('.dom')); var ouverts=secs.filter(function(s){return s.classList.contains('ouvert');});
    if(ouverts.length){ ouverts.forEach(fermer); } else { secs.forEach(function(s,i){ setTimeout(function(){ouvrir(s);}, i*110); }); }
    setTimeout(maj,10); }
  function maj(){ var b=document.getElementById('basculerTout'); if(!b)return;
    var ouvert=[].slice.call(document.querySelectorAll('.dom')).some(function(s){return s.classList.contains('ouvert');});
    b.classList.toggle('actif-tout',ouvert); var l=b.querySelector('.bt-label'); if(l)l.textContent=ouvert?b.dataset.collapse:b.dataset.expand; }
  var b=document.getElementById('basculerTout');
  if(b){ b.addEventListener('click',tout); b.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){e.preventDefault();tout();} }); }
  document.querySelectorAll('.dom-tete').forEach(function(t){ t.addEventListener('click',function(){ basculer(t.closest('.dom')); }); });
  document.querySelectorAll('.sous-tete').forEach(function(st){ st.addEventListener('click',function(){ basculerSous(st.closest('.sous')); }); });
  var theme=new URLSearchParams(location.search).get('theme');
  if(theme){ var sec=document.querySelector('.dom[data-theme="'+theme+'"]'); if(sec){ ouvrir(sec); maj(); setTimeout(function(){ sec.scrollIntoView({behavior:'smooth',block:'start'}); },120); return; } }
  maj();
})();`;

const RECH_JS = `(function(){
  var ouvrir=document.getElementById('rech-ouvrir'),overlay=document.getElementById('rech-overlay'),
      champ=document.getElementById('rech-champ'),res=document.getElementById('rech-res'),fermer=document.getElementById('rech-fermer');
  if(!ouvrir||!overlay) return;
  var L=window.LUMEN||{base:'',lang:'fr',hint:'',empty:''};
  var index=null,charge=false,enCours=false;
  function norm(s){return s.toLowerCase().replace(/[àâä]/g,'a').replace(/[éèêë]/g,'e').replace(/[ïî]/g,'i').replace(/[ôö]/g,'o').replace(/[ùûü]/g,'u').replace(/ç/g,'c');}
  function lien(s){return L.base+'article/'+s+'/';}
  function surligne(texte,termes){
    var nt=norm(texte),marks=[];
    termes.forEach(function(t){var i=0,p;while((p=nt.indexOf(t,i))>=0){marks.push([p,p+t.length]);i=p+t.length;}});
    if(!marks.length) return texte;
    marks.sort(function(a,b){return a[0]-b[0];});
    var out='',cur=0;
    marks.forEach(function(m){if(m[0]<cur)return;out+=texte.slice(cur,m[0])+'<mark>'+texte.slice(m[0],m[1])+'</mark>';cur=m[1];});
    return out+texte.slice(cur);
  }
  function extrait(a,termes){
    var src=a.r+' '+a.x,n=norm(src),pos=-1;
    termes.forEach(function(t){var p=n.indexOf(t);if(p>=0&&(pos<0||p<pos))pos=p;});
    if(pos<0)pos=0;
    var deb=Math.max(0,pos-60),fin=Math.min(src.length,pos+120);
    return (deb>0?'… ':'')+surligne(src.slice(deb,fin),termes)+(fin<src.length?' …':'');
  }
  function chercher(q){
    var termes=norm(q).split(/\\s+/).filter(Boolean);
    if(!termes.length){res.innerHTML='<div class="rech-msg">'+L.hint+'</div>';return;}
    var out=[];
    index.forEach(function(a){
      if(window.LV_SUPP&&window.LV_SUPP.indexOf(a.s)>=0)return;
      if(!termes.every(function(t){return a._n.indexOf(t)>=0;}))return;
      var sc=0;termes.forEach(function(t){if(a._t.indexOf(t)>=0)sc+=5;if(a._r.indexOf(t)>=0)sc+=2;sc+=1;});
      out.push({a:a,sc:sc});
    });
    out.sort(function(x,y){return y.sc-x.sc;});
    if(!out.length){res.innerHTML='<div class="rech-msg">'+L.empty+' « '+q+' ».</div>';return;}
    res.innerHTML=out.slice(0,30).map(function(o){
      return '<a class="rech-item" href="'+lien(o.a.s)+'"><div class="rech-meta">'+o.a.th+'</div><div class="rech-titre">'+o.a.t+'</div><div class="rech-extrait">'+extrait(o.a,termes)+'</div></a>';
    }).join('');
  }
  function prep(){index=window.LUMEN_INDEX||[];index.forEach(function(a){a._n=norm(a.t+' '+a.r+' '+a.x);a._t=norm(a.t);a._r=norm(a.r);});charge=true;}
  function chargerPuis(cb){
    if(charge){cb();return;}
    if(enCours)return; enCours=true;
    var sc=document.createElement('script');sc.src=L.base+'recherche-'+L.lang+'.js';
    sc.onload=function(){prep();enCours=false;cb();};
    sc.onerror=function(){enCours=false;};
    document.body.appendChild(sc);
  }
  function ouvre(){overlay.classList.add('ouvert');document.body.style.overflow='hidden';if(!charge)res.innerHTML='<div class="rech-msg">'+L.hint+'</div>';setTimeout(function(){champ.focus();},40);chargerPuis(function(){chercher(champ.value);});}
  function ferme(){overlay.classList.remove('ouvert');document.body.style.overflow='';}
  ouvrir.addEventListener('click',ouvre);
  ouvrir.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();ouvre();}});
  fermer.addEventListener('click',ferme);
  fermer.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();ferme();}});
  overlay.addEventListener('click',function(e){if(e.target===overlay)ferme();});
  champ.addEventListener('input',function(){if(charge)chercher(champ.value);});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&overlay.classList.contains('ouvert'))ferme();});
})();`;

function page({ lang, type, title, description, frPath, enPath, base, otherRel, ctx, main, extraJS }) {
  const u = UI[lang];
  const hreflang = `<link rel="alternate" hreflang="fr" href="${DOMAINE}${frPath}">
<link rel="alternate" hreflang="en" href="${DOMAINE}${enPath}">
<link rel="alternate" hreflang="x-default" href="${DOMAINE}${frPath}">`;
  const url = DOMAINE + (lang === 'fr' ? frPath : enPath);
  return `<!DOCTYPE html>
<html lang="${u.html}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${url}">
${hreflang}
<meta property="og:type" content="${type === 'article' ? 'article' : 'website'}">
<meta property="og:locale" content="${u.oglocale}">
<meta property="og:site_name" content="Lumen">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${url}">
${FONTS}
${FIREBASE_HEAD}
<style>${css}${EXTRA_CSS}${APPEARANCE_CSS}</style>
</head>
<body>
${header(lang, type, base, otherRel, ctx)}
<main id="app">
${main}
</main>
${footer(lang)}
<script>
window.LUMEN={base:${JSON.stringify(base)},lang:${JSON.stringify(lang)},hint:${JSON.stringify(u.search_hint)},empty:${JSON.stringify(u.search_empty)}};
${COMMUN_JS}
${RECH_JS}
${AUTH_JS}
${MEMO_JS}
window.LV_INDEX=${JSON.stringify({fr: buildIndex('fr'), en: buildIndex('en')}).replace(/</g, '\\u003c')};
window.LV_NV=${JSON.stringify({fr: NV_FR, en: NV_EN}).replace(/</g, '\\u003c')};
${ADMIN_JS}
${extraJS || ''}
</script>
<script src="/bible-panneau.js" defer></script>
</body>
</html>`;
}

/* ---- vues ---- */
function mainAccueil(lang, base) {
  const u = UI[lang];
  const lib = lang === 'fr' ? 'bibliotheque/' : 'library/';
  const cartes = THEMES.map((t, i) => {
    const n = compteParTheme(t.id);
    return `
    <a class="domaine" data-theme="${t.id}" href="${base}${lib}?theme=${t.id}">
      <span class="d-num">${String(i + 1).padStart(2, '0')}</span>
      <h3>${themeNom(lang, t.id)}</h3>
      <p>${themeDesc(lang, t.id)}</p>
      <span class="compte">${n} ${n === 1 ? u.entry_one : u.entry_many}</span>
    </a>`;
  }).join('');
  return `<div class="vue">
    <section class="hero">
      <div class="croix" aria-hidden="true"></div>
    </section>
    <div class="titre-section">
      <span class="num" data-lv-txt="home_domains_label">${u.home_domains_label}</span>
      <h2 data-lv-txt="home_explore">${u.home_explore}</h2>
      <span class="trait"></span>
    </div>
    <section class="domaines">${cartes}</section>
    <div class="titre-section">
      <span class="num" data-lv-txt="memo_label">${u.memo_label}</span>
      <h2 data-lv-txt="memo_title">${u.memo_title}</h2>
      <span class="trait"></span>
    </div>
    <div class="memo-bloc">
      <div class="memo-droite" id="memo-scores" data-state="load">
        <div class="memo-pct"><span id="memo-pct"></span><i data-lv-txt="memo_mastery">${u.memo_mastery}</i></div>
        <div class="memo-bar" id="memo-bar"><i class="r"></i><i class="a"></i><i class="v"></i></div>
        <div class="memo-leg"><span><b id="memo-v"></b> <span data-lv-txt="memo_acquired">${u.memo_acquired}</span></span><span><b id="memo-a"></b> <span data-lv-txt="memo_learning">${u.memo_learning}</span></span><span><b id="memo-r"></b> <span data-lv-txt="memo_review">${u.memo_review}</span></span></div>
        <p class="memo-note" id="memo-note">${u.memo_signedout}</p>
      </div>
      <a class="memo-start" href="/memoriser.html?demarrer=1" data-lv-txt="memo_start">${u.memo_start}</a>
    </div>
    <div style="height:60px"></div>
  </div>`;
}

function mainBibliotheque(lang, base) {
  const u = UI[lang];
  const art = 'article/';
  const carte = a => `
        <a class="article-lien" data-card="${a.id}" href="${base}${art}${slugOf(lang, a.id)}/">
          <h3>${artTitre(lang, a)}</h3>
          ${resumeHtmlBI(artResume(lang, a), lang)}
        </a>`;
  const corpsDomaine = t => {
    const at = ARTICLES.filter(a => a.theme === t.id);
    const vide = `<div class="vide">${u.lib_empty}</div>`;
    if (!t.categories) {
      return at.map(carte).join('') || vide;
    }
    let html = '';
    const vus = new Set();
    for (const c of t.categories) {
      const arts = c.arts.map(id => at.find(a => a.id === id)).filter(Boolean);
      arts.forEach(a => vus.add(a.id));
      if (!arts.length) continue;
      if (c.nom) {
        html += `
      <div class="sous" data-cat="${c.id}">
        <div class="sous-tete">
          <span class="sous-puce" aria-hidden="true"></span>
          <span class="sous-nom">${catNom(lang, t.id, c.id)}</span>
          <span class="sous-chevron" aria-hidden="true">›</span>
        </div>
        <div class="sous-corps">${arts.map(carte).join('')}</div>
      </div>`;
      } else {
        html += arts.map(carte).join('');
      }
    }
    html += at.filter(a => !vus.has(a.id)).map(carte).join('');
    return html || vide;
  };
  const sections = THEMES.map((t, i) => {
    const n = compteParTheme(t.id);
    const num = String(i + 1).padStart(2, '0');
    const mot = lang === 'fr' ? (n <= 1 ? u.entry_one : u.entry_many) : (n === 1 ? u.entry_one : u.entry_many);
    return `
    <section class="dom" data-theme="${t.id}">
      <div class="dom-tete">
        <span class="dom-num">${num}</span>
        <h2 class="dom-nom">${themeNom(lang, t.id)}</h2>
        <span class="dom-compte">${n} ${mot}</span>
        <span class="dom-chevron" aria-hidden="true">›</span>
      </div>
      <div class="dom-sep"></div>
      <div class="dom-corps">${corpsDomaine(t)}</div>
    </section>`;
  }).join('');
  return `<div class="vue">
    <div style="height:38px"></div>
    <div class="domaines-liste">${sections}</div>
    <div style="height:60px"></div>
  </div>`;
}

function mainArticle(lang, a, base) {
  const apo = APOLOGIES[a.id];
  let objBloc = '';
  if (apo) {
    const ap = ARTICLES.find(x => x.id === apo);
    const href = `${base}article/${slugOf(lang, apo)}/`;
    objBloc = `<aside class="apologie">
      <div class="apologie-label">${UI[lang].objections_label}</div>
      <a class="apologie-lien" href="${href}">${artTitre(lang, ap)} →</a>
    </aside>`;
  }
  return `<div class="vue">
    <article class="lecture" data-article="${a.id}">
      <h1>${artTitre(lang, a)}</h1>
      ${reLink(artContenu(lang, a), base, lang)}
    </article>${objBloc}
    <script type="application/json" id="lv-art-src">${JSON.stringify({resume: artResume(lang, a), theme: a.theme, themes: THEMES.map(t => ({id: t.id, nom: themeNom(lang, t.id)}))}).replace(/</g, "\\u003c")}</script>
  </div>`;
}

function mainAPropos(lang) {
  const u = UI[lang];
  return `<div class="vue apropos-vue">
    <section class="bandeau-page">
      <div class="sur-titre">${u.about_surtitle}</div>
      <h1>${u.about_title}</h1>
    </section>
    <div class="apropos-corps">
    <div class="prose">
      ${u.about_p.map(p => `<p>${p}</p>`).join('\n      ')}
    </div>
    </div>
  </div>`;
}

function main404() {
  return `<div class="vue"><section class="bandeau-page"><h1>Page introuvable · Page not found</h1>
    <p class="desc">Cette page n'existe pas. <a href="/" style="color:var(--or)">Revenir à l'accueil</a>.<br>
    This page does not exist. <a href="/en/" style="color:var(--or)">Back to home</a>.</p></section></div>`;
}

/* ---- écriture ---- */
function ecrire(rel, contenu) {
  const dest = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, contenu, 'utf8');
}
fs.rmSync(OUT, { recursive: true, force: true });

const pairs = [];

function genPaire(spec) {
  // spec: type, frPath, enPath, frFile, enFile, titleKey, descKey, mainFn, ctxFn, extraJS
  pairs.push({ fr: spec.frPath, en: spec.enPath });
  ['fr', 'en'].forEach(lang => {
    const u = UI[lang];
    const pPath = lang === 'fr' ? spec.frPath : spec.enPath;
    const oPath = lang === 'fr' ? spec.enPath : spec.frPath;
    const dir = pPath.replace(/[^\/]*$/, '');              // dossier de la page
    const otherRel = rel(dir, oPath);
    const langRoot = lang === 'fr' ? '/' : '/en/';
    const depth = dir.slice(langRoot.length).split('/').filter(Boolean).length;
    const base = '../'.repeat(depth);
    ecrire(lang === 'fr' ? spec.frFile : spec.enFile, page({
      lang, type: spec.type,
      title: spec.title(lang), description: spec.desc(lang),
      frPath: spec.frPath, enPath: spec.enPath, base, otherRel,
      ctx: spec.ctx ? spec.ctx(lang, base) : '',
      main: spec.main(lang, base),
      extraJS: spec.extraJS
    }));
  });
}

// accueil
genPaire({
  type: 'home', frPath: '/', enPath: '/en/',
  frFile: 'index.html', enFile: 'en/index.html',
  title: l => UI[l].t_home, desc: l => UI[l].site_desc_home,
  main: (l, b) => mainAccueil(l, b)
});

// bibliothèque
genPaire({
  type: 'library', frPath: '/bibliotheque/', enPath: '/en/library/',
  frFile: 'bibliotheque/index.html', enFile: 'en/library/index.html',
  title: l => UI[l].t_library, desc: l => UI[l].site_desc_library,
  ctx: l => UI[l].context_library,
  main: (l, b) => mainBibliotheque(l, b),
  extraJS: BIBLIO_JS
});

// articles
ARTICLES.forEach(a => {
  const en = slugOf('en', a.id);
  genPaire({
    type: 'article',
    frPath: `/article/${a.id}/`, enPath: `/en/article/${en}/`,
    frFile: `article/${a.id}/index.html`, enFile: `en/article/${en}/index.html`,
    title: l => `${artTitre(l, a)} · Lumen`,
    desc: l => artResume(l, a),
    ctx: (l, b) => {
      const lib = l === 'fr' ? 'bibliotheque/' : 'library/';
      return `<a href="${b}${lib}?theme=${a.theme}">${themeNom(l, a.theme)}</a>`;
    },
    main: (l, b) => mainArticle(l, a, b)
  });
});

// 404 (racine, bilingue) — sans paire ni hreflang
ecrire('404.html', page({
  lang: 'fr', type: '', title: UI.fr.t_404, description: UI.fr.notfound_text,
  frPath: '/404.html', enPath: '/404.html', base: '', otherRel: '/en/',
  main: main404()
}));

// sitemap bilingue avec alternates
const sm = pairs.map(p => {
  const alt = `    <xhtml:link rel="alternate" hreflang="fr" href="${DOMAINE}${p.fr}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${DOMAINE}${p.en}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${DOMAINE}${p.fr}"/>`;
  return `  <url>
    <loc>${DOMAINE}${p.fr}</loc>
${alt}
  </url>
  <url>
    <loc>${DOMAINE}${p.en}</loc>
${alt}
  </url>`;
}).join('\n');
ecrire('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sm}
</urlset>`);

// robots.txt
ecrire('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${DOMAINE}/sitemap.xml\n`);

// redirections des articles fusionnés (ancien slug -> article d'accueil), FR et EN, 301
const REDIRECTS = [
  ['le-verbe', 'le-fils'],
  ['les-freres-de-jesus', 'la-virginite-perpetuelle-de-marie'],
  ['l-absolution', 'la-confession'],
  ['la-satisfaction', 'la-confession'],
  ['le-secret-de-la-confession', 'la-confession'],
  ['la-grace-sanctifiante', 'la-grace'],
  ['la-grace-actuelle', 'la-grace'],
];
const redLines = [];
REDIRECTS.forEach(([from, to]) => {
  redLines.push(`/article/${from}/  /article/${to}/  301`);
  if (SLUGS[from] && SLUGS[to]) redLines.push(`/en/article/${SLUGS[from]}/  /en/article/${SLUGS[to]}/  301`);
});
ecrire('_redirects', redLines.join('\n') + '\n');

// index de recherche (texte des articles), un par langue
const idxFR = ARTICLES.map(a => ({ s: a.id, t: a.titre, th: themeNom('fr', a.theme), r: a.resume, x: depouiller(a.contenu) }));
ecrire('recherche-fr.js', 'window.LUMEN_INDEX=' + JSON.stringify(idxFR) + ';');
const idxEN = ARTICLES.map(a => ({ s: slugOf('en', a.id), t: artTitre('en', a), th: themeNom('en', a.theme), r: artResume('en', a), x: depouiller((ARTICLES_EN[a.id] || {}).contenu) }));
ecrire('en/recherche-en.js', 'window.LUMEN_INDEX=' + JSON.stringify(idxEN) + ';');

// copie des pages autonomes (hors pipeline bilingue)
if (fs.existsSync('memoriser.html')) {
  let mh = fs.readFileSync('memoriser.html', 'utf8');
  {
    const reNews = /\/\*NEWS_START\*\/[\s\S]*?\/\*NEWS_END\*\//;
    if (reNews.test(mh)) { mh = mh.replace(reNews, '/*NEWS_START*/const NEWS={fr:' + JSON.stringify(NV_FR) + ',en:' + JSON.stringify(NV_EN) + '};/*NEWS_END*/'); console.log('Mémoriser : nouveautés synchronisées avec le site'); }
    let catsSrc = null, origineCats = '';
    const memLigne = fsLireDoc('config/memoriser');
    if (memLigne && Array.isArray(memLigne.categories) && memLigne.categories.length) { catsSrc = memLigne.categories; origineCats = 'en ligne'; }
    else if (fs.existsSync('content/memoriser.json')) { catsSrc = JSON.parse(fs.readFileSync('content/memoriser.json', 'utf8')).categories || []; origineCats = 'fichier'; }
    if (catsSrc) {
      const cats = catsSrc;
      const slug = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const vusC = new Set();
      for (const c of cats) {
        if (!c.id) { let b = slug(c.name && c.name.fr) || 'cat', id = b, k = 2; while (vusC.has(id)) id = b + '-' + (k++); c.id = id; }
        vusC.add(c.id);
        const vusV = new Set();
        for (const v of (c.verses || [])) {
          if (!v.id) { let b = slug(v.fr && v.fr.ref) || 'v', id = b, k = 2; while (vusV.has(id)) id = b + '-' + (k++); v.id = id; }
          vusV.add(v.id);
        }
      }
      const reMarq = /\/\*PRE_START\*\/[\s\S]*?\/\*PRE_END\*\//;
      if (reMarq.test(mh)) {
        mh = mh.replace(reMarq, '/*PRE_START*/const PRE=' + JSON.stringify(cats).replace(/</g, '\\u003c') + ';/*PRE_END*/');
        console.log('Mémoriser : versets de base injectés (' + cats.length + ' catégories, source ' + origineCats + ')');
      }
    }
  }
  if (APPEARANCE_CSS && mh.indexOf('</head>') >= 0) {
    mh = mh.replace('</head>', '<style>' + APPEARANCE_CSS + '</style></head>');
  }
  if (ADMIN_JS && mh.indexOf('</body>') >= 0) {
    const lvIdxAll = JSON.stringify({ fr: buildIndex('fr'), en: buildIndex('en') }).replace(/</g, '\\u003c');
    const lvNvAll = JSON.stringify({ fr: NV_FR, en: NV_EN }).replace(/</g, '\\u003c');
    mh = mh.replace('</body>', '<script>window.LV_INDEX=' + lvIdxAll + ';window.LV_NV=' + lvNvAll + ';</script><script>' + ADMIN_JS + '</script></body>');
  }
  mh = mh.replace('</body>', '<script src="/bible-panneau.js" defer><' + '/script></body>');
  fs.writeFileSync(`${OUT}/memoriser.html`, mh);
  console.log('Copié : memoriser.html');
}

// ── La Sainte Bible (Crampon 1923) : page de lecture + données par livre ──
if (fs.existsSync('bible.html')) {
  let bh = fs.readFileSync('bible.html', 'utf8');
  {
    const reNews = /\/\*NEWS_START\*\/[\s\S]*?\/\*NEWS_END\*\//;
    if (reNews.test(bh)) { bh = bh.replace(reNews, '/*NEWS_START*/const NEWS={fr:' + JSON.stringify(NV_FR) + ',en:' + JSON.stringify(NV_EN) + '};/*NEWS_END*/'); console.log('Bible : nouveautés synchronisées'); }
  }
  if (bh.indexOf('</body>') >= 0) {
    const lvIdxB = JSON.stringify({ fr: buildIndex('fr'), en: buildIndex('en') }).replace(/</g, '\\u003c');
    const lvNvB = JSON.stringify({ fr: NV_FR, en: NV_EN }).replace(/</g, '\\u003c');
    bh = bh.replace('</body>', '<script>window.LV_INDEX=' + lvIdxB + ';window.LV_NV=' + lvNvB + ';</script></body>');
  }
  if (APPEARANCE_CSS && bh.indexOf('</head>') >= 0) {
    bh = bh.replace('</head>', '<style>' + APPEARANCE_CSS + '</style></head>');
  }
  let bhFr = bh;
  if (ADMIN_JS && bhFr.indexOf('</body>') >= 0) bhFr = bhFr.replace('</body>', '<script>' + ADMIN_JS + '</script></body>');
  fs.writeFileSync(`${OUT}/bible.html`, bhFr);
  console.log('Copié : bible.html');

  // ── Version anglaise : mêmes slugs, texte Douay-Rheims, interface traduite ──
  {
    const TR = [
      ['<html lang="fr"', '<html lang="en"'],
      ['<a href="/">Accueil</a>', '<a href="/en/">Home</a>'],
      ['<a href="/bibliotheque/">Bibliothèque</a>', '<a href="/en/library/">Library</a>'],
      ['<a href="/bible.html" class="actif">Bible</a>', '<a href="/en/bible.html" class="actif">Bible</a>'],
      ['<a href="/memoriser.html">Mémoriser</a>', '<a href="/memoriser.html">Memorise</a>'],
      ['<a href="/en/bible.html" class="lien-langue" hreflang="en">EN</a>', '<a href="/bible.html" class="lien-langue" hreflang="fr">FR</a>'],
      ['aria-label="Rechercher"', 'aria-label="Search"'],
      ['>Rechercher<', '>Search<'],
      ['aria-label="Nouveautés"', 'aria-label="News"'],
      ['>Nouveautés<', '>News<'],
      ['aria-label="Compte"', 'aria-label="Account"'],
      ['>Compte<', '>Account<'],
      ['Traduction du chanoine Augustin Crampon · Édition 1923', 'Douay-Rheims translation · Challoner revision · 1899 edition'],
      ['La Sainte Bible', 'The Holy Bible'],
      ['>Chargement…<', '>Loading…<'],
      ['>Copier<', '>Copy<'],
      ['Aucune note pour le moment. S\\u00e9lectionnez des versets puis \\u00ab Prendre une note \\u00bb.', 'No notes yet. Select verses, then \\u201cTake a note\\u201d.'],
      ['>Prendre une note<', '>Take a note<'],
      ['>Tout effacer<', '>Clear all<'],
      ['>Mon compte<', '>My account<'],
      ['Mes notes ·', 'My notes ·'],
      ['>Mes notes<', '>My notes<'],
      ['>Déconnexion<', '>Sign out<'],
      ['Nouvelle catégorie', 'New category'],
      ['Nouvelle cat\\u00e9gorie', 'New category'],
      ['Nouvelle sous-section', 'New subsection'],
      ['>Enregistrer<', '>Save<'],
      ['>Annuler<', '>Cancel<'],
      ['>Catégorie<', '>Category<'],
      ['>Supprimer<', '>Delete<'],
      ['placeholder="Nom…"', 'placeholder="Name…"'],
      ['placeholder="Écrire la note…"', 'placeholder="Write the note…"'],
      ['placeholder="Référence ou article…"', 'placeholder="Reference or article…"'],
      ['placeholder="Adresse e-mail"', 'placeholder="Email address"'],
      ['placeholder="Confirmer le mot de passe"', 'placeholder="Confirm the password"'],
      ['placeholder="Mot de passe"', 'placeholder="Password"'],
      ['>Connexion<', '>Sign in<'],
      ['>Inscription<', '>Sign up<'],
      ['>Se connecter pour les retrouver partout<', '>Sign in to find them everywhere<'],
      ['>Se connecter<', '>Sign in<'],
      ['>ou<', '>or<'],
      ['>Continuer avec Google<', '>Continue with Google<'],
      ['>Mot de passe oublié ?<', '>Forgot password?<'],
      ["'Cr\\u00e9er le compte'", "'Create the account'"],
      ["'Envoyer le lien'", "'Send the link'"],
      ["'Cette adresse est d\\u00e9j\\u00e0 utilis\\u00e9e.'", "'This address is already in use.'"],
      ["'Mot de passe trop court (6 caract\\u00e8res minimum).'", "'Password too short (6 characters minimum).'"],
      ["'\\u00c9chec de la connexion.'", "'Sign-in failed.'"],
      ["'Lien de r\\u00e9initialisation envoy\\u00e9.'", "'Reset link sent.'"],
      ["'Les mots de passe ne correspondent pas.'", "'The passwords do not match.'"],
      ['Aller à : ', 'Go to: '],
      ['Référence biblique — Entrée pour ouvrir', 'Bible reference — Enter to open'],
      [' et sélectionner', ' and select'],
      ['Aucun résultat.', 'No results.'],
      ['Rien de nouveau pour le moment.', 'Nothing new for now.'],
      ['Copié \\u2713', 'Copied \\u2713'],
      ['>Non class\\u00e9e</option>', '>Uncategorised</option>'],
      ["'Modifier la note'", "'Edit the note'"],
      ["'Nouvelle note'", "'New note'"],
      ['>Nouvelle note<', '>New note<'],
      ['>Renommer<', '>Rename<'],
      ["'Renommer'", "'Rename'"],
      ['>Sous-section<', '>Subsection<'],
      ['>D\\u00e9placer<', '>Move<'],
      ['>Modifier<', '>Edit<'],
      ['placeholder="Rechercher dans les notes\\u2026"', 'placeholder="Search the notes\\u2026"'],
      ['Notes enregistr\\u00e9es sur cet appareil \\u00b7', 'Notes stored on this device \\u00b7'],
      ['Aucune note ne correspond.', 'No note matches.'],
      ['Non class\\u00e9es', 'Uncategorised'],
      ["'Supprimer \\u00ab '", "'Delete \\u201c'"],
      ["' \\u00bb ? Les notes redeviennent non class\\u00e9es.'", "'\\u201d? The notes become uncategorised.'"],
      ["'Ancien Testament'", "'Old Testament'"],
      ["'Nouveau Testament'", "'New Testament'"],
      ['Chargement\\u2026', 'Loading\\u2026'],
      ['Le texte n\\u2019a pas pu \\u00eatre charg\\u00e9.', 'The text could not be loaded.'],
      ['L\\u2019index de la Bible n\\u2019a pas pu \\u00eatre charg\\u00e9.', 'The Bible index could not be loaded.'],
      ["'fr-FR'", "'en-GB'"],
      ["var NVL = 'fr';", "var NVL = 'en';"],
      ['window.LV_INDEX.fr', 'window.LV_INDEX.en'],
      ['bible-data/', 'bible-data-en/'],
    ];
    let bhEn = bh;
    for (const pr of TR) bhEn = bhEn.split(pr[0]).join(pr[1]);
    if (UI.fr.footer_verse && UI.en.footer_verse) bhEn = bhEn.split(UI.fr.footer_verse).join(UI.en.footer_verse);
    bhEn = bhEn.replace(/Texte biblique :[\s\S]*?CC BY-NC-SA 3\.0<\/a>[^<]*/,
      'Biblical text: The Holy Bible, Douay-Rheims version (Challoner revision), 1899 American edition. The text is in the public domain.');
    bhEn = bhEn.replace(/<meta name="description" content="[^"]*">/,
      '<meta name="description" content="The Holy Bible, Douay-Rheims translation (Challoner revision). Online reading, Old and New Testament.">');
    if (ADMIN_JS && bhEn.indexOf('</body>') >= 0) bhEn = bhEn.replace('</body>', '<script>' + ADMIN_JS + '</script></body>');
    fs.mkdirSync(`${OUT}/en`, { recursive: true });
    fs.writeFileSync(`${OUT}/en/bible.html`, bhEn);
    console.log('Bible : version anglaise générée (en/bible.html)');
  }
  if (fs.existsSync('bible-panneau.js')) {
    fs.copyFileSync('bible-panneau.js', `${OUT}/bible-panneau.js`);
    console.log('Copié : bible-panneau.js');
  }
  // Chaque Bible est UN fichier source que le build redécoupe en un fichier
  // par livre + un index : FR (Crampon) → /bible-data/, EN (Douay-Rheims) → /bible-data-en/.
  const decoupeBible = (src, dossier) => {
    if (!fs.existsSync(src)) return false;
    fs.mkdirSync(`${OUT}/${dossier}`, { recursive: true });
    const bible = JSON.parse(fs.readFileSync(src, 'utf8'));
    fs.writeFileSync(`${OUT}/${dossier}/index.json`, JSON.stringify({ livres: bible.livres, groupes: bible.groupes }));
    let nb = 0;
    for (const livre of bible.data) {
      fs.writeFileSync(`${OUT}/${dossier}/${livre.slug}.json`, JSON.stringify(livre));
      nb++;
    }
    console.log('Bible (' + dossier + ') : ' + nb + ' livres + index');
    return true;
  };
  decoupeBible('content/bible-en.json', 'bible-data-en');
  if (!decoupeBible('content/bible.json', 'bible-data')) if (fs.existsSync('content/bible')) {
    // repli : ancien format (un fichier par livre déjà découpé)
    fs.mkdirSync(`${OUT}/bible-data`, { recursive: true });
    let nb = 0;
    for (const f of fs.readdirSync('content/bible')) {
      if (!f.endsWith('.json')) continue;
      fs.copyFileSync(`content/bible/${f}`, `${OUT}/bible-data/${f}`);
      nb++;
    }
    console.log('Bible : ' + nb + ' fichiers de données copiés (ancien format)');
  }
}


console.log('Site bilingue généré dans «', OUT, '»');
console.log('Paires de pages :', pairs.length, '→', pairs.length * 2, 'pages (FR + EN) + 404 + sitemap + robots');

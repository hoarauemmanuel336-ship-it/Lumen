/* ============================================================
   LUMEN — générateur bilingue (français + anglais)
   FR à la racine (/, /bibliotheque/, /a-propos/, /article/<slug-fr>/)
   EN sous /en/ (/en/, /en/library/, /en/about/, /en/article/<slug-en>/)
   Bouton de langue, balises hreflang, sitemap bilingue.
   CSS et apparence conservés à l'identique.
   ============================================================ */
const fs = require('fs');
const path = require('path');

const SRC = process.argv[2] || 'index__48_.html';
const OUT = process.argv[3] || 'site';
const DOMAINE = 'https://lumenveritatis.net';
/* Site monolingue : structures EN vides conservées pour la compatibilité interne. */
const SLUGS = {}, THEMES_EN = {}, ARTICLES_EN = {};

const src = fs.readFileSync(SRC, 'utf8');
const css = src.slice(src.indexOf('<style>') + 7, src.indexOf('</style>')).replace(/—/g, '-');

const blockStart = src.indexOf('const THEMES');
const blockEnd = src.indexOf('const app');
const { THEMES, ARTICLES } = (new Function(src.slice(blockStart, blockEnd) + '; return {THEMES, ARTICLES};'))();


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
    } else if (d.titre_fr != null && d.contenu_fr != null) {
      // Article nouveau : créé entièrement depuis content/articles/
      const neuf = { id: slug, titre: d.titre_fr, resume: d.resume_fr || '', contenu: d.contenu_fr, theme: d.theme || 'doctrine', date: d.date || '' };
      ARTICLES.push(neuf); parId[slug] = neuf;
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
      pubs++;
    }
    if (pubs) console.log('Articles créés en ligne publiés en pages :', pubs);
  }
}


// Structure des thèmes éditable depuis content/themes.json (noms FR/EN, catégories, ordre des articles)
if (fs.existsSync('content/themes.json')) {
  const tj = JSON.parse(fs.readFileSync('content/themes.json', 'utf8')).themes;
  if (Array.isArray(tj)) {
    // Un nœud est une CATÉGORIE (feuille) s'il porte « arts », sinon un GROUPE
    // (niveau intermédiaire, porte « noeuds »). Un thème utilise « groupes »
    // (arbre imbriqué) ou « categories » (liste plate, legacy) indifféremment.
    const enfants = n => n.noeuds || n.groupes || n.categories || [];
    const walkFR = (nodes, acc) => (nodes || []).map(n => {
      if (Array.isArray(n.arts)) {
        const c = { kind: 'cat', id: n.id, nom: n.nom_fr,
          arts: (n.arts || []).map(x => typeof x === 'string' ? x : (x && x.slug) || '').filter(Boolean) };
        acc.push({ id: c.id, nom: c.nom, arts: c.arts });
        return c;
      }
      return { kind: 'grp', id: n.id, nom: n.nom_fr, noeuds: walkFR(enfants(n), acc) };
    });
    const refaits = tj.map(t => {
      const acc = [];
      const tree = walkFR(t.groupes || t.categories || [], acc);
      return { id: t.id, nom: t.nom_fr, desc: t.desc_fr, categories: acc, tree };
    });
    THEMES.length = 0; THEMES.push(...refaits);
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
    search_placeholder: 'Rechercher dans Lumen…', search_hint: 'Tapez un mot pour parcourir les articles, ou une référence (Jean 3:16) pour ouvrir la Bible.', search_empty: 'Aucun résultat pour',
    memo_label:"L'outil", memo_title:'Mémoriser', memo_sub:'Apprenez les versets par cœur et gardez-les, à votre rythme.', memo_open:'Ouvrir Mémoriser', memo_start:'Commencer', memo_mastery:'de maîtrise', memo_acquired:'acquis', memo_learning:'en cours', memo_review:'à revoir', memo_signedout:'Connectez-vous pour suivre votre progression.',
    lect_label:"Le parcours", lect_title:'La lecture suivie', lect_lu:'articles lus', lect_signedout:'Connectez-vous pour suivre votre lecture.', lect_start:'Commencer la lecture',
  }
};

/* ---- helpers de données par langue ---- */
const slugOf = (lang, frId) => lang === 'fr' ? frId : (SLUGS[frId] || frId);
const APOLOGIES = { 'la-communion-des-saints': 'l-intercession-des-saints', 'le-bapteme': 'le-bapteme-des-petits-enfants', 'marie': 'marie-mere-de-dieu', 'l-eucharistie': 'la-presence-reelle', 'l-adoration-et-la-louange': 'pourquoi-dieu-demande-l-adoration' };
const depouiller = h => (h || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const themeNom = (lang, id) => lang === 'fr' ? (THEMES.find(x => x.id === id) || {}).nom : THEMES_EN[id].nom;
const themeDesc = (lang, id) => lang === 'fr' ? (THEMES.find(x => x.id === id) || {}).desc : THEMES_EN[id].desc;
const catNom = (lang, themeId, catId) => {
  if (lang === 'fr') { const t = THEMES.find(x => x.id === themeId); const c = ((t || {}).categories || []).find(c => c.id === catId); return c ? c.nom : ''; }
  return (((THEMES_EN[themeId] || {}).cats) || {})[catId] || '';
};
/* navigation au sein d'une catégorie : ordre donné par themes.json (c.arts) */
const NAV_CAT = {};
THEMES.forEach(t => (t.categories || []).forEach(c => (c.arts || []).forEach((id, i) => {
  NAV_CAT[id] = { theme: t.id, catId: c.id, prev: c.arts[i - 1] || null, next: c.arts[i + 1] || null };
})));
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

const FIREBASE_HEAD = `<script>
/* Firebase à la demande : chargé après le rendu (ou à la première interaction). */
window.lvFB=function(){if(window.__lvFBP)return window.__lvFBP;window.__lvFBP=new Promise(function(res){var u=['app','auth','firestore'].map(function(n){return 'https://www.gstatic.com/firebasejs/10.7.1/firebase-'+n+'-compat.js';});(function next(i){if(i>=u.length){try{document.dispatchEvent(new Event('lv-fb-ready'));}catch(_){}res();return;}var s=document.createElement('script');s.src=u[i];s.onload=function(){next(i+1);};s.onerror=function(){res();};document.head.appendChild(s);})(0);});return window.__lvFBP;};
(function(){var go=function(){window.lvFB();};window.addEventListener('load',function(){setTimeout(go,600);});['pointerdown','keydown'].forEach(function(ev){window.addEventListener(ev,go,{once:true,passive:true});});})();
</scr`+`ipt>`;


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

/* ==== BARRE ET PIED CANONIQUES (source unique, toutes surfaces) ==== */
const BARRE_CSS = `
@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}
  html{scroll-behavior:auto!important}
}

header{position:sticky;top:0;z-index:50;background:rgba(0,0,0,.82);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-bottom:1px solid rgba(231,224,207,.14)}
.barre{max-width:1080px;margin:0 auto;padding:20px 32px;display:grid;grid-template-columns:auto auto 1fr;align-items:center;gap:24px;height:auto;line-height:1.75}
.barre .logo{grid-column:1;grid-row:1;font-family:'Cormorant Garamond',serif;font-weight:500;font-size:26px;letter-spacing:.34em;text-transform:uppercase;color:var(--parchemin,#ffffff);padding-left:.34em;border-bottom:none;text-decoration:none}
.logo-h1{display:contents}
a:focus-visible,button:focus-visible,[role="button"]:focus-visible,[tabindex]:focus-visible,summary:focus-visible{outline:1px solid var(--or,#efe6cf);outline-offset:3px}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}html{scroll-behavior:auto!important}}
.burger{display:none;background:none;border:none;padding:0;margin:0;color:var(--parchemin,#ffffff);font-size:24px;cursor:pointer;line-height:1;-webkit-appearance:none;appearance:none}
nav.menu{display:flex;gap:30px;grid-column:3;grid-row:1;justify-self:end;align-items:center;margin-left:0}
nav.menu a{font-family:'Cormorant Garamond',serif;font-size:16px;letter-spacing:.12em;text-transform:uppercase;white-space:nowrap;color:var(--parchemin,#ffffff);padding:0 0 3px;border-bottom:1px solid transparent;transition:color .3s,border-color .3s;text-decoration:none;position:static}
nav.menu a:hover,nav.menu a.actif{color:var(--parchemin,#ffffff);border-color:var(--or,#efe6cf)}
.menu-act{background:none;border:none;padding:0 0 3px;margin:0;cursor:pointer;font-family:'Cormorant Garamond',serif;font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:var(--parchemin,#ffffff);opacity:.65;border-bottom:1px solid transparent;transition:opacity .3s,border-color .3s;-webkit-appearance:none;appearance:none}
.menu-act:hover{opacity:1;border-color:var(--or,#efe6cf)}
.rech-loupe{display:inline-flex;align-items:center;cursor:pointer;color:var(--parchemin,#ffffff);transition:color .3s;background:none;border:none;padding:0;outline:none}
.rech-loupe:hover{color:var(--or,#efe6cf)}
.rech-loupe:focus,.rech-loupe:focus-visible{outline:none}
.rech-loupe svg{display:block}
.ll-mob{display:none}
.menu-mail{font-family:'Cormorant Garamond',serif;font-size:13px;letter-spacing:.06em;color:rgba(255,255,255,.55);white-space:nowrap;max-width:180px;overflow:hidden;text-overflow:ellipsis}
.menu-mail:empty{display:none}
.user-btn{display:inline-flex;align-items:center;gap:8px;opacity:1;color:var(--parchemin,#ffffff)}
.user-btn .user-label{display:none}
footer{border-top:1px solid rgba(231,224,207,.14);margin-top:40px;padding:48px 32px 56px;text-align:center;background:none}
footer .marque{font-family:'Cormorant Garamond',serif;letter-spacing:.34em;text-transform:uppercase;font-size:18px;padding-left:.34em;color:var(--parchemin,#ffffff)}
footer .verset-pied{margin-top:18px;font-style:italic;color:rgba(255,255,255,.55);font-size:17px;max-width:640px;margin-left:auto;margin-right:auto;line-height:1.7}
footer .verset-pied .ref-pied{font-style:normal;font-weight:600;color:rgba(255,255,255,.55)}
footer .copy{margin-top:22px;font-size:13px;letter-spacing:.08em;color:rgba(255,255,255,.45);font-family:'Cormorant Garamond',serif}
@media(max-width:720px){
  .barre{padding:16px 20px;display:flex;justify-content:space-between}
  nav.menu{position:fixed;inset:62px 0 auto 0;flex-direction:column;gap:0;align-items:flex-start;background:rgba(0,0,0,.97);padding:10px 28px 18px;border-bottom:1px solid rgba(231,224,207,.14);transform:translateY(-130%);transition:transform .35s}
  nav.menu.ouvert{transform:none}
  nav.menu a{font-size:15px;padding:12px 0;width:100%;border-bottom:none}
  .burger{display:block}
  .rech-loupe{width:100%;justify-content:flex-start;gap:14px;padding:12px 0;border-bottom:none;font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:var(--parchemin,#ffffff)}
  .rech-loupe .ll-mob{display:inline}
  .menu-act{padding:12px 0;width:100%;text-align:left;font-size:15px;letter-spacing:.12em;opacity:1}
  .menu-mail{max-width:none;padding:12px 0 2px}
  .user-btn{padding:12px 0;width:100%;justify-content:flex-start}
}
`;
const SVG_LOUPE = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="10" cy="10" r="6.5"/><line x1="15" y1="15" x2="21" y2="21" stroke-linecap="round"/></svg>';
const SVG_CLOCHE = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0" stroke-linecap="round"/></svg>';
const SVG_COMPTE = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="3.4"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0" stroke-linecap="round"/></svg>';
function barreCanon(o) {
  const liens = o.liens.map(l => {
    const at = [];
    if (l.id) at.push(`id="${l.id}"`);
    if (l.href) at.push(`href="${l.href}"`);
    if (l.actif) at.push('class="actif"');
    return `<a ${at.join(' ')}>${l.label || ''}</a>`;
  }).join('\n      ');
  const lab = (txt, id) => `<span class="ll-mob"${id ? ` id="${id}"` : ''}>${txt}</span>`;
  const loupe = `<span class="rech-loupe" id="${o.loupe.id}" role="button" tabindex="0" aria-label="${o.loupe.label}">${SVG_LOUPE}${lab(o.loupe.label, o.loupe.labelId)}</span>`;
  const compte = o.compte.type === 'user'
    ? `<span class="menu-mail" id="${o.compte.mailId}"></span>\n      <button class="menu-act user-btn" id="${o.compte.btnId}" aria-label="${o.compte.label}" title="${o.compte.label}">${SVG_COMPTE}<span class="user-label" id="${o.compte.labelId}">${o.compte.label}</span></button>`
    : `<span class="rech-loupe auth-icone" id="${o.compte.id}" role="button" tabindex="0" aria-label="${o.compte.label}">${SVG_COMPTE}${lab(o.compte.label)}</span>`;
  return `<header>
  <div class="barre">
    ${o.h1 ? '<h1 class="logo-h1">' : ''}<a href="${o.home}" class="logo"${o.logoId ? ` id="${o.logoId}"` : ''}>Lumen</a>${o.h1 ? '</h1>' : ''}
    <button class="burger" id="${o.burgerId}" aria-label="Menu">\u2630</button>
    <nav class="menu" id="${o.menuId}">
      ${liens}
      ${loupe}
      ${compte}
    </nav>
  </div>
</header>`;
}
function piedCanon(o) {
  return `<footer${o.cls ? ` class="${o.cls}"` : ''}>
  <div class="marque">Lumen</div>
  <div class="verset-pied"${o.verseId ? ` id="${o.verseId}"` : ''}>${o.verse || ''}</div>
  <div class="copy" id="${o.copyId}"></div>
</footer>`;
}

const EXTRA_CSS = `${BARRE_CSS}
@keyframes lvVoile{from{opacity:0}to{opacity:1}}
@keyframes lvRise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.rech-overlay{animation:lvVoile .25s ease both}
.rech-boite{animation:lvRise .4s ease both}
.auth-overlay{animation:lvVoile .25s ease both}
.auth-modal{animation:lvRise .4s ease both}
#lect-suivant{animation:apparait .45s ease both}

body.mode-suivi .art-nav{display:none!important}
.lecture #lect-suivant{color:var(--encre,#000000)}

@page{margin:0}
@media print{
  body{padding:15mm 17mm}
  header,#lect-suivant,.prog-lect,.haut-page{display:none!important}
  article.lecture{padding-top:0}
  article.lecture::after{content:'lumenveritatis.net';display:block;text-align:center;margin-top:14mm;font-size:11pt;letter-spacing:.08em;color:#000}
}

.smr-lien{transition:color .25s,border-color .25s,background .25s,padding-left .3s}
.smr-lien:hover{color:var(--or,#efe6cf);background:rgba(231,224,207,.05);border-left-color:var(--or,#efe6cf);padding-left:22px}

.dom.fermant .dom-chevron{transform:rotate(0)}
.grp.fermant > .grp-tete .grp-chevron{transform:rotate(0)}
.sous.fermant > .sous-tete .sous-chevron{transform:rotate(0)}
.dom.fermant .dom-tete{position:static}

.lecture span.ref{cursor:pointer;padding:9px 5px;margin:-9px -5px}
article.lecture a.ref,article.lecture a.ref-src{border-bottom:none}
a.ref-src{color:var(--or,#efe6cf);white-space:nowrap}
article.lecture a.ref:hover,article.lecture a.ref-src:hover{border-bottom:1px solid rgba(239,230,207,.45)}
article.lecture>p.sans-lettrine::first-letter{float:none;font-size:inherit;font-weight:inherit;color:inherit;margin:0;font-family:inherit;line-height:inherit}
:focus-visible{outline:1px solid var(--or,#efe6cf);outline-offset:3px}

html{scroll-behavior:smooth}
.lecture h2{scroll-margin-top:84px}
.prog-lect{position:fixed;top:0;left:0;height:2px;width:0;background:var(--or,#efe6cf);z-index:1400;pointer-events:none}
.haut-page{position:fixed;right:18px;bottom:18px;width:42px;height:42px;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.82);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid var(--filet,rgba(231,224,207,.25));color:var(--or,#efe6cf);font-size:17px;cursor:pointer;opacity:0;pointer-events:none;transition:opacity .35s,border-color .3s;z-index:1100}
.haut-page.on{opacity:1;pointer-events:auto}
.haut-page:hover{border-color:var(--or,#efe6cf)}

.ctx-sep{opacity:.5;margin:0 7px}

.auth-icone{position:relative}
.auth-overlay{position:fixed;inset:0;z-index:200;background:rgba(8,8,8,.98);display:none;align-items:center;justify-content:center;padding:24px}
.auth-overlay.ouvert{display:flex}
.auth-modal{position:relative;width:100%;max-width:400px;background:var(--encre);border:1px solid var(--filet);padding:40px 34px}
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
.article-lien{transition:padding-left .3s ease,border-color .3s ease,background .3s ease}

/* — Outils d'article : copier, partager, navigation — */
.art-bar{display:flex;gap:26px;justify-content:center;margin:-10px 0 36px}
.art-btn{background:none;border:none;padding:4px 2px;display:inline-flex;align-items:center;justify-content:center;color:var(--parchemin);opacity:.4;font-size:15px;cursor:pointer;transition:opacity .3s,color .3s}
@media(max-width:720px){.art-bar{gap:14px}.art-btn{padding:11px 12px}}
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
  const home = base === '' ? './' : base;
  const cl = t => type === t ? ' class="actif"' : '';
  const lib = lang === 'fr' ? 'bibliotheque/' : 'library/';
  return `${barreCanon({
    home, logoId: null, h1: type === 'home', burgerId: 'burger', menuId: 'menu',
    liens: [
      { href: home, actif: type === 'home', label: u.menu_home },
      { href: base + lib, actif: type === 'library', label: u.menu_library },
      { href: '/bible.html', label: 'Bible' },
      { href: '/memoriser.html', label: u.menu_memorise }
    ],
    loupe: { id: 'rech-ouvrir', label: 'Rechercher' },
    compte: { type: 'icone', id: 'auth-ouvrir', label: 'Compte' }
  })}
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
      <div class="ttx-row"><span class="ttx-lab">${lang === 'fr' ? 'Taille du texte' : 'Text size'}</span><span class="ttx-btns"><button type="button" class="ttx-b" data-ttx="-1">A−</button><button type="button" class="ttx-b" data-ttx="0">A</button><button type="button" class="ttx-b" data-ttx="1">A+</button></span></div>
      <div class="tog-row"><span class="tog-lab">${lang === 'fr' ? 'Onglet Bible à gauche' : 'Bible tab on the left'}</span><span class="tog-sw" id="tog-bible" role="button" tabindex="0" aria-label="${lang === 'fr' ? 'Afficher ou masquer l’onglet Bible' : 'Show or hide the Bible tab'}"></span></div>
      <button class="auth-m-link" id="auth-logout">${lang === 'fr' ? 'Déconnexion' : 'Sign out'}</button>
    </div>
  </div>
</div>`;
}

function footer(lang) {
  return `${piedCanon({ verse: UI[lang].footer_verse, copyId: 'annee' })}`;
}

const COMMUN_JS = `document.getElementById('burger').addEventListener('click',function(){document.getElementById('menu').classList.toggle('ouvert');});
document.getElementById('annee').textContent='© '+new Date().getFullYear()+' Lumen';
document.addEventListener('click',function(e){var vp=e.target.closest&&e.target.closest('.voir-plus');if(!vp)return;e.preventDefault();e.stopPropagation();var p=vp.closest('.r-trunc');if(!p)return;var c=p.querySelector('.r-court'),fl=p.querySelector('.r-full');if(fl.hasAttribute('hidden')){c.setAttribute('hidden','');fl.removeAttribute('hidden');vp.textContent=vp.dataset.less;}else{fl.setAttribute('hidden','');c.removeAttribute('hidden');vp.textContent=vp.dataset.more;}});
document.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&e.target.classList&&e.target.classList.contains('voir-plus')){e.preventDefault();e.target.click();}});
`;

const MEMO_JS = `(function lvMemoBoot(){
  var box=document.getElementById('memo-scores'); if(!box)return;
  if(typeof firebase==='undefined'){document.addEventListener('lv-fb-ready',lvMemoBoot,{once:true});return;}
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

const LECT_JS = `(function lvLectBoot(){
  /* Lecture suivie : cycle INFINI et ALEATOIRE. Unite = la categorie (bloc
     d'articles gardant leur ordre propre) ; les blocs sont melanges au debut
     de chaque cycle. Doc users/{uid}/meta/lecture : { ordre:[ids], lus:[ids] }.
     L'article courant = premier de l'ordre non lu ; sa visite l'enregistre.
     Cycle complet -> nouveau melange, lus vides, sans intervention. */
  var box=document.getElementById('lect-etat');
  var estArticle=location.pathname.indexOf('/article/')>=0;
  var SUIVI=/[?&]suivi=1/.test(location.search);
  if(SUIVI&&estArticle)document.body.classList.add('mode-suivi');
  if(!box&&!estArticle)return;
  if(typeof firebase==='undefined'){document.addEventListener('lv-fb-ready',lvLectBoot,{once:true});return;}
  var cfg={apiKey:"AIzaSyC19lFNWUd-KYhCP4o7gpp0IcyfRTyHOyA",authDomain:"lumen-veritatis.firebaseapp.com",projectId:"lumen-veritatis",storageBucket:"lumen-veritatis.firebasestorage.app",messagingSenderId:"195902823875",appId:"1:195902823875:web:a8be1f216a5ae1d945f176"};
  if(!firebase.apps.length)firebase.initializeApp(cfg);
  var auth=firebase.auth(), db=firebase.firestore();
  var lang=(window.LUMEN&&window.LUMEN.lang)||(function(){try{return localStorage.getItem('lv_lang')||'fr';}catch(e){return 'fr';}})(), FR=lang!=='en';
  function idx(){var I=window.LV_INDEX;if(!I)return null;return I[lang]||I.fr;}
  var EXCL={cats:{},arts:{}}, UCUR=null, openG={}, openT={}, FOISG={};
  function blocs(){
    /* liste de blocs canoniques identifies : chaque categorie = un bloc ordonne
       {id:'theme:cat', nom, arts} ; les articles hors categorie d'un theme
       forment un bloc par theme ('th:<theme>'), le reste un bloc 'autres'. */
    var I=idx(); if(!I)return {bl:[],urls:{}};
    var parTheme={}, urls={}, bl=[], vus={};
    I.articles.forEach(function(a){(parTheme[a.theme]=parTheme[a.theme]||[]).push(a.id);urls[a.id]=a.u;});
    I.themes.forEach(function(t){
      (t.cats||[]).forEach(function(c){
        var b=[];(c.arts||[]).forEach(function(id){if(urls[id]&&!vus[id]){vus[id]=1;b.push(id);}});
        if(b.length)bl.push({id:t.id+':'+c.id,nom:c.nom||t.nom,arts:b});
      });
      var r=[];(parTheme[t.id]||[]).forEach(function(id){if(!vus[id]){vus[id]=1;r.push(id);}});
      if(r.length)bl.push({id:'th:'+t.id,nom:t.nom,arts:r});
    });
    var reste=[];I.articles.forEach(function(a){if(!vus[a.id]){vus[a.id]=1;reste.push(a.id);}});
    if(reste.length)bl.push({id:'autres',nom:FR?'Autres articles':'Other articles',arts:reste});
    return {bl:bl,urls:urls};
  }
  function blocsActifs(){
    /* exclusions par id : tout ce qui est nouveau (article ou categorie)
       entre dans le cycle par defaut */
    return blocs().bl.filter(function(b){return !EXCL.cats[b.id];}).map(function(b){
      return {id:b.id,nom:b.nom,arts:b.arts.filter(function(id){return !EXCL.arts[id];})};
    }).filter(function(b){return b.arts.length;});
  }
  function melange(){
    var b=blocsActifs(),i,j,t;
    for(i=b.length-1;i>0;i--){j=Math.floor(Math.random()*(i+1));t=b[i];b[i]=b[j];b[j]=t;}
    var ordre=[];b.forEach(function(x){ordre=ordre.concat(x.arts);});
    return ordre;
  }
  function melangeParmi(cands){
    /* tirage restreint : memes blocs de categories, seuls les articles de la
       strate candidate (map id->1) participent ; blocs melanges, articles en
       ordre canonique au sein du bloc */
    var b=blocsActifs().map(function(x){return {id:x.id,arts:x.arts.filter(function(id){return cands[id];})};}).filter(function(x){return x.arts.length;});
    var i,j,t;
    for(i=b.length-1;i>0;i--){j=Math.floor(Math.random()*(i+1));t=b[i];b[i]=b[j];b[j]=t;}
    var ordre=[];b.forEach(function(x){ordre=ordre.concat(x.arts);});
    return ordre;
  }
  /* ENREGISTREMENT FIABLE D'UNE LECTURE (correctif 2026-07-05 : des
     lectures se perdaient car l'ecriture Firestore, lancee a l'etoile de
     fin, mourait avec la page quand on cliquait « Continuer la lecture »).
     Trois pieces : (a) un journal local pose AVANT l'ecriture et efface a
     sa confirmation ; (b) un REJEU idempotent au chargement de la page
     suivante : l'article n'est recompte que s'il est ENCORE du au compteur
     (tete de file ou strate minimale), donc jamais de double comptage si
     l'ecriture etait finalement partie ; (c) le bouton suivant attend la
     confirmation d'ecriture avant de naviguer (garde-fou 4 s). */
  var PENDK='lv_lect_pend', ecrEnCours=null, REJPROM=null;
  function pendPose(id){try{localStorage.setItem(PENDK,JSON.stringify({a:id}));}catch(e){}}
  function pendLit(){try{return JSON.parse(localStorage.getItem(PENDK)||'null');}catch(e){return null;}}
  function pendEfface(){try{localStorage.removeItem(PENDK);}catch(e){}}
  function compteLecture(e,artId){
    return (e.cur===artId)||(e.tourNeuf&&!!e.permis[artId]&&(e.fois[artId]||0)===e.minG);
  }
  function enregistreLecture(u,e,artId){
    var fois2={},k;for(k in e.fois)fois2[k]=e.fois[k];
    fois2[artId]=(fois2[artId]||0)+1;
    var file2;
    if(e.tourNeuf||e.migration){
      file2=e.file.filter(function(id){return id!==artId;});
    }else{
      var t={};e.ajTete.forEach(function(id){t[id]=1;});
      var q={};e.ajQueue.forEach(function(id){q[id]=1;});
      file2=e.ajTete.filter(function(id){return id!==artId;})
        .concat(e.docOrdre.filter(function(id){return id!==artId&&!t[id]&&!q[id];}))
        .concat(e.ajQueue.filter(function(id){return id!==artId;}));
    }
    var tourN2=e.tourN;
    if(!file2.length){
      var minG2=null;
      Object.keys(e.permis).forEach(function(id){var f=fois2[id]||0;if(minG2===null||f<minG2)minG2=f;});
      var cands={};Object.keys(e.permis).forEach(function(id){if((fois2[id]||0)===minG2)cands[id]=1;});
      file2=melangeParmi(cands);
      tourN2=file2.length;
    }
    pendPose(artId);
    var prom=ref(u).set({fois:fois2,ordre:file2,tourN:tourN2,lus:firebase.firestore.FieldValue.delete(),pos:firebase.firestore.FieldValue.delete()},{merge:true})
      .then(function(){pendEfface();});
    ecrEnCours=prom.catch(function(){});
    return {prom:ecrEnCours,suivant:file2[0]||null};
  }
  var pendFait=false;
  function rejouePending(u){
    if(pendFait||!u)return; pendFait=true;
    var pd=pendLit(); if(!pd||!pd.a)return;
    REJPROM=ref(u).get().then(function(snap){
      var e=etat(snap);
      if(e.vide)return;
      if(compteLecture(e,pd.a)){return enregistreLecture(u,e,pd.a).prom;}
      pendEfface();
    }).catch(function(){});
  }
  function foisDe(d){
    /* compteur infini par article ; migration transparente de l'ancien
       modele (lus:[ids] -> fois[id]=1) */
    if(d.fois)return d.fois;
    var f={};(d.lus||[]).forEach(function(id){f[id]=1;});
    return f;
  }
  function ref(u){return db.doc('users/'+u.uid+'/meta/lecture');}
  function etat(snap){
    /* CONSULTATION PURE (regle etablie 2026-07-05) : aucun remelange ni
       purge ici, jamais. MODELE A COMPTEURS (2026-07-05, demande
       d'Emmanuel, sur le modele du Memoriseur) : fois[id] compte les
       lectures de chaque article, sans jamais s'effacer ; ordre est la
       FILE du tour courant (les restants a lire) ; chaque tour se tire
       parmi les articles au compteur MINIMAL, si bien qu'un article
       nouveau ou longtemps deselectionne passe toujours devant ceux
       deja lus davantage. */
    var d=(snap.exists&&snap.data())||{};
    EXCL={cats:{},arts:{}};
    (d.offCats||[]).forEach(function(id){EXCL.cats[id]=1;});
    (d.offArts||[]).forEach(function(id){EXCL.arts[id]=1;});
    var fois=foisDe(d), docOrdre=d.ordre||[];
    var migration=!d.fois&&!!(d.lus&&d.lus.length);
    var premier=!docOrdre.length&&!d.fois&&!(d.lus&&d.lus.length);
    var permis={};blocsActifs().forEach(function(b){b.arts.forEach(function(id){permis[id]=1;});});
    if(!Object.keys(permis).length)return {file:[],fois:fois,n:0,tourN:0,cur:null,vide:true,docOrdre:docOrdre,premier:premier,migration:migration,ajTete:[],ajQueue:[],tourNeuf:false,minG:0,permis:permis};
    /* file de base : ce que le doc dit, filtre aux permis ; en migration,
       l'ancien ordre contenait aussi les lus : on les retire */
    var fileBase;
    if(migration){
      var luM={};(d.lus||[]).forEach(function(id){luM[id]=1;});
      fileBase=docOrdre.filter(function(id){return permis[id]&&!luM[id];});
    }else{
      fileBase=docOrdre.filter(function(id){return permis[id];});
    }
    /* ajouts deterministes (ordre canonique des blocs) : un article permis
       hors file MOINS lu que la file passe en TETE ; au meme niveau, en
       queue (il integre le tour en cours) */
    var minFile=null,k;
    for(k=0;k<fileBase.length;k++){var f0=fois[fileBase[k]]||0;if(minFile===null||f0<minFile)minFile=f0;}
    var dansFile={};fileBase.forEach(function(id){dansFile[id]=1;});
    var ajTete=[],ajQueue=[];
    if(minFile!==null){
      blocsActifs().forEach(function(b){b.arts.forEach(function(id){
        if(dansFile[id])return;
        var f1=fois[id]||0;
        if(f1<minFile)ajTete.push(id); else if(f1===minFile)ajQueue.push(id);
      });});
    }
    var file=ajTete.concat(fileBase).concat(ajQueue);
    /* tour epuise (ou jamais commence) : le tour suivant se calcule
       LOCALEMENT (sans ecriture) sur la strate des moins lus */
    var minG=null;
    Object.keys(permis).forEach(function(id){var f2=fois[id]||0;if(minG===null||f2<minG)minG=f2;});
    var tourNeuf=false;
    if(!file.length){
      var cands={};Object.keys(permis).forEach(function(id){if((fois[id]||0)===minG)cands[id]=1;});
      file=melangeParmi(cands);
      tourNeuf=true;
    }
    var tourN=tourNeuf?file.length:(migration?docOrdre.filter(function(id){return permis[id];}).length:((d.tourN||fileBase.length)+ajTete.length+ajQueue.length));
    if(tourN<file.length)tourN=file.length;
    var n=tourN-file.length; if(n<0)n=0;
    return {file:file,fois:fois,n:n,tourN:tourN,cur:file[0]||null,vide:false,docOrdre:docOrdre,premier:premier,migration:migration,ajTete:ajTete,ajQueue:ajQueue,tourNeuf:tourNeuf,minG:minG||0,permis:permis};
  }
  function peint(u){
    var btn=document.getElementById('lect-start');
    if(!u){box.setAttribute('data-state','out');if(btn)btn.style.display='';return;}
    rejouePending(u);
    Promise.resolve(REJPROM).then(function(){return ref(u).get();}).then(function(snap){
      var e=etat(snap);
      if(e.vide){var x0=document.getElementById('lect-x');if(x0)x0.textContent='0 / 0';var s0=box.querySelector('#lect-bar .l');if(s0)s0.style.width='0%';if(btn)btn.style.display='none';box.setAttribute('data-state','ok');return;}
      /* la consultation n'ecrit jamais ; le tirage aleatoire d'un tour
         (premier demarrage ou tour epuise) est ANCRE au clic du bouton,
         pour que la page d'arrivee calcule le meme parcours */
      var p=blocs();
      var ex=document.getElementById('lect-x'); if(ex)ex.textContent=e.n+' / '+e.tourN;
      var seg=box.querySelector('#lect-bar .l'); if(seg)seg.style.width=(e.tourN?(e.n/e.tourN*100):0)+'%';
      if(btn&&e.cur!==null){
        var jamais=!Object.keys(e.fois).length;
        btn.textContent=jamais?(FR?'Commencer la lecture':'Start reading'):(FR?'Continuer la lecture':'Continue reading');
        btn.href=p.urls[e.cur]?p.urls[e.cur]+'?suivi=1':btn.getAttribute('href');
        if(e.premier||e.tourNeuf){
          btn.onclick=function(ev){
            ev.preventDefault();
            ref(u).set({ordre:e.file,tourN:e.file.length,fois:e.fois},{merge:true}).then(function(){
              var url=blocs().urls[e.cur];
              if(url)location.href=url+'?suivi=1'; else peint(u);
            }).catch(function(){});
          };
        }else{
          btn.onclick=null;
        }
        btn.style.display='';
      }
      box.setAttribute('data-state','ok');
    }).catch(function(){box.setAttribute('data-state','out');if(btn)btn.style.display='none';});
  }

  function boutonSuivant(url){
    if(!url)return;
    var zone=document.querySelector('article.lecture'); if(!zone)return;
    if(document.getElementById('lect-suivant'))return;
    var a=document.createElement('a');
    a.id='lect-suivant';a.className='memo-start';a.href=url+'?suivi=1';
    a.textContent=FR?'Continuer la lecture':'Continue reading';
    a.style.display='block';a.style.width='max-content';a.style.margin='44px auto 0';
    a.addEventListener('click',function(ev){
      /* ne pas tuer la page pendant que l'enregistrement de la lecture est
         en vol : on attend sa confirmation (au plus 4 s), puis on navigue */
      if(!ecrEnCours)return;
      ev.preventDefault();
      var dest=a.href;
      Promise.race([ecrEnCours,new Promise(function(r){setTimeout(r,4000);})]).then(function(){location.href=dest;});
    });
    zone.appendChild(a);
  }
  function marque(u){
    var I=idx(); if(!I)return;
    rejouePending(u);
    var art=null,i;
    for(i=0;i<I.articles.length;i++){if(I.articles[i].u===location.pathname){art=I.articles[i];break;}}
    if(!art)return;
    /* reprise de position (mode suivi) : le bloc de texte en cours de
       lecture est memorise (index independant de l'appareil) ; au retour
       sur le meme article, la page reprend a cet endroit ; la position
       est effacee quand l'article est termine */
    function blocsTexte(){
      var z=document.querySelector('article.lecture');
      if(!z)return [];
      return [].filter.call(z.querySelectorAll('p,h2,h3,li,blockquote'),function(n){
        return !(n.closest&&(n.closest('.art-bar')||n.closest('.art-nav')||n.closest('.smr-mob')||n.closest('.smr-cote')));
      });
    }
    var posFini=false;
    if(SUIVI){
      /* la position n'est memorisee QUE pour l'article courant du cycle :
         revenir (bouton retour) sur un article deja lu garde ?suivi=1 dans
         l'URL, et sans ce garde le defilement y ecraserait la position de
         l'article en cours.
         DOUBLE MEMOIRE (correctif reinitialisation) : Firestore porte la
         reprise inter-appareils, localStorage la survie a une fermeture
         brutale (l'ecriture reseau de pagehide n'a souvent pas le temps de
         partir, surtout sur iOS). L'ecriture Firestore est a echantillonnage
         TRAILING : c'est la DERNIERE position connue qui part toutes les 10s,
         jamais seulement la premiere d'une fenetre. Restauration : la plus
         avancee des deux memoires. */
      var LSK='lv_pos';
      function lsLit(){try{var v=JSON.parse(localStorage.getItem(LSK)||'null');return (v&&v.a===art.id)?v:null;}catch(e){return null;}}
      function lsEcrit(b){try{localStorage.setItem(LSK,JSON.stringify({a:art.id,b:b}));}catch(e){}}
      function lsEfface(){try{var v=JSON.parse(localStorage.getItem(LSK)||'null');if(v&&v.a===art.id)localStorage.removeItem(LSK);}catch(e){}}
      var estCourant=false;
      ref(u).get().then(function(snap){
        var d=(snap.exists&&snap.data())||{};
        estCourant=(etat(snap).cur===art.id);
        var b=-1;
        if(d.pos&&d.pos.a===art.id)b=d.pos.b;
        var loc=lsLit(); if(loc&&loc.b>b)b=loc.b;
        if(b>2){
          var bs=blocsTexte(), el=bs[Math.min(b,bs.length-1)];
          if(el)window.scrollTo({top:Math.max(0,el.offsetTop-90),behavior:'auto'});
        }
      }).catch(function(){});
      var dernierB=-1, dernierEcrit=-1, posTmr=null;
      function blocCourant(){
        var bs=blocsTexte(), y=window.scrollY+100, i;
        for(i=0;i<bs.length;i++){ if(bs[i].offsetTop+bs[i].offsetHeight>y) return i; }
        return bs.length?bs.length-1:0;
      }
      function fsEcrit(){
        if(posFini||!estCourant||dernierB<0||dernierB===dernierEcrit)return;
        dernierEcrit=dernierB;
        ref(u).set({pos:{a:art.id,b:dernierB}},{merge:true}).catch(function(){});
      }
      function sauvePos(force){
        if(posFini||!estCourant)return;
        dernierB=blocCourant();
        lsEcrit(dernierB);
        if(force){fsEcrit();return;}
        if(!posTmr)posTmr=setTimeout(function(){posTmr=null;fsEcrit();},10000);
      }
      window.addEventListener('scroll',function(){sauvePos(false);},{passive:true});
      document.addEventListener('visibilitychange',function(){
        if(document.visibilityState==='hidden')sauvePos(true);
      });
      window.addEventListener('pagehide',function(){sauvePos(true);});
      marque._lsEfface=lsEfface;
    }
    /* la lecture ne compte que menee a son terme : le marquage attend que
       la fin de l'article (etoile .fin-article) entre dans l'ecran ;
       quitter en cours de route ne marque rien, et la prochaine session
       ramene au MEME article */
    var fait=false;
    function accomplir(){
      if(fait)return; fait=true;
      /* attendre l'eventuel rejeu du journal local, puis lire l'etat frais */
      Promise.resolve(REJPROM).then(function(){return ref(u).get();}).then(function(snap){
        var e=etat(snap), p=blocs(), suivant=null;
        if(e.vide)return;
        /* l'article compte s'il est l'article courant du parcours, ou si un
           tour non encore ancre (tirage local) contient un article de la
           meme strate minimale : la lecture reelle prime sur le tirage */
        if(compteLecture(e,art.id)){
          posFini=true;
          if(marque._lsEfface)marque._lsEfface();
          suivant=enregistreLecture(u,e,art.id).suivant;
        }else{
          if(e.premier)ref(u).set({ordre:e.file,tourN:e.file.length,fois:e.fois},{merge:true});
          suivant=e.cur;
        }
        if(suivant&&SUIVI)boutonSuivant(p.urls[suivant]);
      }).catch(function(){});
    }

    var cible=document.querySelector('article.lecture .fin-article');
    if(cible&&'IntersectionObserver' in window){
      var io=new IntersectionObserver(function(es,ob){
        var vu=false; es.forEach(function(x){ if(x.isIntersecting)vu=true; });
        if(vu){ ob.disconnect(); accomplir(); }
      },{threshold:0});
      io.observe(cible);
    }else{
      accomplir();
    }
  }
  /* gestion : selectionner/deselectionner categories et articles du cycle,
     rendue dans #lect-gestion (page Memoriser), classes visuelles de la
     liste des versets reutilisees pour l'harmonie */
  var gHost=document.getElementById('lect-gestion');
  function rendGestion(){
    if(!gHost)return;
    if(!UCUR){gHost.innerHTML='';return;}
    var p=blocs(), I=idx();
    if(!I){gHost.innerHTML='';return;}
    var titres={}; I.articles.forEach(function(a){titres[a.id]=a.titre;});
    var nomsT={}; I.themes.forEach(function(t){nomsT[t.id]=t.nom;});
    /* regroupement par domaine, comme la bibliotheque : theme -> ses blocs
       (categories + eventuel bloc residuel du theme), 'autres' a la fin */
    var parT={}, bId;
    p.bl.forEach(function(b){
      var tid = b.id==='autres' ? 'autres' : (b.id.indexOf('th:')===0 ? b.id.slice(3) : b.id.split(':')[0]);
      (parT[tid]=parT[tid]||[]).push(b);
    });
    var ordreT=[]; I.themes.forEach(function(t){if(parT[t.id])ordreT.push(t.id);}); if(parT['autres'])ordreT.push('autres');
    var tousOff=p.bl.length&&p.bl.every(function(b){return EXCL.cats[b.id];});
    var h='<div class="lect-g-acts"><span class="mini-act" data-lg="tout">'+(tousOff?(FR?'Tout s\u00e9lectionner':'Select all'):(FR?'Tout d\u00e9s\u00e9lectionner':'Deselect all'))+'</span></div>';
    function nFois(id){var nf=FOISG[id]||0;return nf?'<span style="font-family:ui-monospace,monospace;font-size:11px;color:rgba(255,255,255,.4);margin-left:8px">\u00d7'+nf+'</span>':'';}
    function ligneArt(id){
      var offA=!!EXCL.arts[id];
      return '<div class="vrow'+(offA?' voff':'')+'"><span class="v-check'+(offA?'':' on')+'" data-lgv="'+id+'"></span><span class="vline"><span class="vtext">'+(titres[id]||id)+'</span>'+nFois(id)+'</span></div>';
    }
    ordreT.forEach(function(tid){
      var bls=parT[tid];
      var nomT= tid==='autres' ? (FR?'Autres articles':'Other articles') : (nomsT[tid]||tid);
      var totT=0, actT=0;
      bls.forEach(function(b){
        totT+=b.arts.length;
        if(!EXCL.cats[b.id])actT+=b.arts.filter(function(id){return !EXCL.arts[id];}).length;
      });
      var onT=bls.some(function(b){return !EXCL.cats[b.id];});
      var oT=!!openT[tid];
      h+='<div class="cat'+(onT?' sel':'')+(oT?' open':'')+'" data-lgt="'+tid+'">'
        +'<div class="cat-row"><span class="cat-check" data-lga="sel"></span>'
        +'<span class="cat-name" data-lga="exp">'+nomT+'</span>'
        +'<span class="cat-pct" data-lga="exp">'+actT+' / '+totT+'</span>'
        +'<span class="cat-chev" data-lga="exp">\u203a</span></div>'
        +'<div class="cat-body">';
      /* theme dont l'unique bloc est le residuel : articles directs */
      if(bls.length===1&&bls[0].id==='th:'+tid||tid==='autres'&&bls.length===1){
        h+=bls[0].arts.map(ligneArt).join('');
      }else{
        bls.forEach(function(b){
          var offC=!!EXCL.cats[b.id];
          var actifs=b.arts.filter(function(id){return !EXCL.arts[id];}).length;
          var open=!!openG[b.id];
          var nomB=(b.id==='th:'+tid)?(FR?'Autres articles':'Other articles'):b.nom;
          h+='<div class="cat lg-sous'+(offC?'':' sel')+(open?' open':'')+'" data-lgc="'+b.id+'">'
            +'<div class="cat-row"><span class="cat-check" data-lga="sel"></span>'
            +'<span class="cat-name" data-lga="exp">'+nomB+'</span>'
            +'<span class="cat-pct" data-lga="exp">'+(offC?0:actifs)+' / '+b.arts.length+'</span>'
            +'<span class="cat-chev" data-lga="exp">\u203a</span></div>'
            +'<div class="cat-body">'+b.arts.map(ligneArt).join('')+'</div></div>';
        });
      }
      h+='</div></div>';
    });
    gHost.innerHTML=h;
  }
  function sauveExcl(){
    if(!UCUR)return;
    ref(UCUR).set({offCats:Object.keys(EXCL.cats),offArts:Object.keys(EXCL.arts)},{merge:true}).then(function(){
      rendGestion();
      if(box)peint(UCUR);
    }).catch(function(){});
  }
  if(gHost){
    gHost.addEventListener('click',function(e){
      if(!UCUR)return;
      var tt=e.target.closest?e.target.closest('[data-lg="tout"]'):null;
      if(tt){
        var p=blocs(), tousOff=p.bl.length&&p.bl.every(function(b){return EXCL.cats[b.id];});
        EXCL.cats={};
        if(!tousOff)p.bl.forEach(function(b){EXCL.cats[b.id]=1;});
        sauveExcl(); return;
      }
      /* l'article d'abord : il peut vivre directement sous un domaine
         (theme sans categories), sans data-lgc au-dessus */
      var av=e.target.closest?e.target.closest('[data-lgv]'):null;
      if(av){var aid=av.getAttribute('data-lgv');EXCL.arts[aid]?delete EXCL.arts[aid]:EXCL.arts[aid]=1;sauveExcl();return;}
      var c=e.target.closest?e.target.closest('[data-lgc]'):null;
      if(c){
        var cid=c.getAttribute('data-lgc');
        var ac=e.target.closest('[data-lga]');
        if(ac){
          if(ac.getAttribute('data-lga')==='sel'){EXCL.cats[cid]?delete EXCL.cats[cid]:EXCL.cats[cid]=1;sauveExcl();}
          else{openG[cid]=!openG[cid];c.classList.toggle('open');}
        }
        return;
      }
      /* niveau domaine : case = tout le domaine, chevron/nom = depli */
      var t=e.target.closest?e.target.closest('[data-lgt]'):null;
      if(t){
        var tid=t.getAttribute('data-lgt');
        function tidDe(bid){return bid==='autres'?'autres':(bid.indexOf('th:')===0?bid.slice(3):bid.split(':')[0]);}
        var at=e.target.closest('[data-lga]');
        if(at){
          if(at.getAttribute('data-lga')==='sel'){
            var bls=blocs().bl.filter(function(b){return tidDe(b.id)===tid;});
            var onT=bls.some(function(b){return !EXCL.cats[b.id];});
            bls.forEach(function(b){ if(onT)EXCL.cats[b.id]=1; else delete EXCL.cats[b.id]; });
            sauveExcl();
          }else{openT[tid]=!openT[tid];t.classList.toggle('open');}
        }
      }
    });
  }
  function gestion(u){
    if(!gHost)return;
    if(!u){gHost.innerHTML='';return;}
    ref(u).get().then(function(snap){
      var d=(snap.exists&&snap.data())||{};
      EXCL={cats:{},arts:{}};
      (d.offCats||[]).forEach(function(id){EXCL.cats[id]=1;});
      (d.offArts||[]).forEach(function(id){EXCL.arts[id]=1;});
      FOISG=foisDe(d);
      rendGestion();
    }).catch(function(){});
  }
  var rz=document.getElementById('lect-reset');
  if(rz){
    rz.textContent=FR?'Réinitialiser la lecture suivie':'Reset continuous reading';
    rz.addEventListener('click',function(){
      if(!UCUR)return;
      if(!confirm(FR?'Réinitialiser la lecture suivie ? Tous les compteurs de lecture seront remis à zéro (les catégories désélectionnées le restent).':'Reset continuous reading? All reading counters will be cleared (deselected categories stay deselected).'))return;
      ref(UCUR).get().then(function(snap){
        var d=(snap.exists&&snap.data())||{};
        EXCL={cats:{},arts:{}};
        (d.offCats||[]).forEach(function(id){EXCL.cats[id]=1;});
        (d.offArts||[]).forEach(function(id){EXCL.arts[id]=1;});
        FOISG={};
        var tirage=melange();
        return ref(UCUR).set({fois:{},ordre:tirage,tourN:tirage.length,lus:firebase.firestore.FieldValue.delete(),pos:firebase.firestore.FieldValue.delete()},{merge:true});
      }).then(function(){ if(box)peint(UCUR); rendGestion(); }).catch(function(){});
    });
  }
  auth.onAuthStateChanged(function(u){
    UCUR=u||null;
    if(box)peint(u);
    else if(u&&estArticle)marque(u);
    gestion(u);
  });
})();`;

const SOMMAIRE_JS = `(function(){
  function init(){
    var art=document.querySelector('article.lecture');
    if(!art)return;
    var h2s=Array.prototype.slice.call(art.querySelectorAll('h2'));
    if(h2s.length<3)return;
    var FR=!(window.LUMEN&&window.LUMEN.lang==='en');
    var pris={};
    function slug(s){
      s=String(s).toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'section';
      var b=s,i=2;while(pris[s]){s=b+'-'+(i++);}pris[s]=1;return s;
    }
    h2s.forEach(function(h){ if(!h.id) h.id=slug(h.textContent); });
    function liens(){
      return h2s.map(function(h){
        return '<span class="smr-lien" data-cible="'+h.id+'">'+h.textContent.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</span>';
      }).join('');
    }
    var titre=FR?'Sommaire':'Contents';
    var cote=document.createElement('nav');
    cote.className='smr-cote';
    cote.innerHTML='<div class="smr-titre">'+titre+'</div><div class="smr-liste">'+liens()+'</div>';
    document.body.appendChild(cote);
    var mob=document.createElement('nav');
    mob.className='smr-mob';
    mob.innerHTML='<div class="smr-mob-tete" role="button" tabindex="0"><span>'+titre+'</span><span class="smr-mob-chev">\\u203a</span></div><div class="smr-mob-corps">'+liens()+'</div>';
    var h1=art.querySelector('h1');
    if(h1&&h1.nextSibling)art.insertBefore(mob,h1.nextSibling);else art.insertBefore(mob,art.firstChild);
    var tete=mob.querySelector('.smr-mob-tete');
    function bascule(){mob.classList.toggle('ouvert');}
    tete.addEventListener('click',bascule);
    tete.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();bascule();}});
    document.addEventListener('click',function(e){
      var l=e.target.closest?e.target.closest('.smr-lien'):null;
      if(!l)return;
      var h=document.getElementById(l.getAttribute('data-cible'));
      if(!h)return;
      h.scrollIntoView({behavior:'smooth',block:'start'});
      mob.classList.remove('ouvert');
    });
    function maj(){
      var y=window.scrollY+110,actif=h2s[0];
      for(var i=0;i<h2s.length;i++){if(h2s[i].offsetTop<=y)actif=h2s[i];else break;}
      cote.querySelectorAll('.smr-lien').forEach(function(l){
        l.classList.toggle('actif',l.getAttribute('data-cible')===actif.id);
      });
    }
    var att=false;
    window.addEventListener('scroll',function(){
      if(att)return;att=true;
      requestAnimationFrame(function(){maj();att=false;});
    },{passive:true});
    maj();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();`;

const AUTH_JS = `(function(){
  /* taille de lecture : appliquée au chargement, réglée depuis « Mon compte », sans dépendance */
  var TZ=[0.85,0.925,1,1.08,1.16,1.25];
  function tzCle(){try{return (window.matchMedia&&(matchMedia('(pointer:coarse)').matches||matchMedia('(max-width:720px)').matches))?'lv_taille_mobile':'lv_taille_pc';}catch(e){return 'lv_taille_pc';}}
  function tzLit(){var v=1;try{v=parseFloat(localStorage.getItem(tzCle())||localStorage.getItem('lv_taille'))||1;}catch(e){}return v;}
  function tzApplique(v){document.documentElement.style.setProperty('--lvz',v);}
  tzApplique(tzLit());
  document.addEventListener('click',function(e){
    var b=e.target.closest?e.target.closest('.ttx-b'):null;
    if(!b)return;
    var d=b.getAttribute('data-ttx'),v=tzLit();
    if(d==='0')v=1;
    else{var i=TZ.indexOf(v);if(i<0){i=2;}i+=(d==='1'?1:-1);i=Math.max(0,Math.min(TZ.length-1,i));v=TZ[i];}
    try{localStorage.setItem(tzCle(),String(v));}catch(e2){}
    tzApplique(v);
  });
})();
(function(){
  /* onglet Bible à gauche : préférence enregistrée par appareil (pc / mobile),
     appliquée par bible-panneau.js ; le resize déclenche l'application immédiate */
  function obCle(){try{return (window.matchMedia&&(matchMedia('(pointer:coarse)').matches||matchMedia('(max-width:720px)').matches))?'lv_onglet_bible_mobile':'lv_onglet_bible_pc';}catch(e){return 'lv_onglet_bible_pc';}}
  function obMasque(){try{return localStorage.getItem(obCle())==='0';}catch(e){return false;}}
  var sw=document.getElementById('tog-bible');
  function etat(){if(sw)sw.classList.toggle('on',!obMasque());}
  etat();
  window.addEventListener('resize',etat);
  if(sw){
    var bascule=function(){var m=obMasque();try{localStorage.setItem(obCle(),m?'1':'0');}catch(e){}etat();try{window.dispatchEvent(new Event('resize'));}catch(e2){}};
    sw.addEventListener('click',bascule);
    sw.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();bascule();}});
  }
})();
(function lvAuthBoot(){
  var cfg={apiKey:"AIzaSyC19lFNWUd-KYhCP4o7gpp0IcyfRTyHOyA",authDomain:"lumen-veritatis.firebaseapp.com",projectId:"lumen-veritatis",storageBucket:"lumen-veritatis.firebasestorage.app",messagingSenderId:"195902823875",appId:"1:195902823875:web:a8be1f216a5ae1d945f176"};
  if(typeof firebase==='undefined'){document.addEventListener('lv-fb-ready',lvAuthBoot,{once:true});return;}
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
  function cascadeA(els){ els.forEach(function(el,i){ if(!el)return; var d=Math.min(i*32,240); el.style.animation='none'; void el.offsetHeight; el.style.animation='apparaitDom .4s cubic-bezier(.2,.7,.3,1) '+d+'ms both'; var done=function(){ el.style.animation=''; el.removeEventListener('animationend',done); }; el.addEventListener('animationend',done); setTimeout(function(){ if(el.style.animation) el.style.animation=''; }, 900+d); }); }
  function cascadeF(els,fin){ els.forEach(function(el){ if(el)el.style.animation='apparaitDomFerme .2s ease forwards'; }); setTimeout(fin,190); }
  /* verrous anti-course : la fermeture est differee par le fondu (240ms) ;
     sans verrou, un second clic pendant ou juste apres le fondu rouvre ou
     laisse la section dans un etat incoherent */
  var toutTimers=[];
  function annuleTout(){ toutTimers.forEach(clearTimeout); toutTimers=[]; }
  function annuleFermeture(sec){ if(sec._ft){ clearTimeout(sec._ft); sec._ft=null; } sec.classList.remove('fermant'); }
  function ouvrir(sec){ if(!sec)return;
    if(sec.classList.contains('fermant')){ annuleFermeture(sec); }
    else if(sec.classList.contains('ouvert'))return;
    sec.classList.add('ouvert');
    var sep=sec.querySelector('.dom-sep'),corps=sec.querySelector('.dom-corps');
    cascadeA([sep].concat([].slice.call(corps.children))); }
  function fermer(sec){ if(!sec||!sec.classList.contains('ouvert')||sec.classList.contains('fermant'))return;
    sec.classList.add('fermant');
    var sep=sec.querySelector('.dom-sep'),corps=sec.querySelector('.dom-corps');
    var kids=[sep].concat([].slice.call(corps.children));
    cascadeF(kids,function(){});
    sec._ft=setTimeout(function(){ sec._ft=null; sec.classList.remove('ouvert'); sec.classList.remove('fermant'); kids.forEach(function(k){ if(k)k.style.animation=''; }); maj(); },190); }
  function basculer(sec){ annuleTout(); if(sec.classList.contains('fermant')||!sec.classList.contains('ouvert')) ouvrir(sec); else fermer(sec); maj(); }
  function ouvrirSous(s){ if(!s)return;
    if(s.classList.contains('fermant')){ annuleFermeture(s); }
    else if(s.classList.contains('ouvert'))return;
    s.classList.add('ouvert');
    var corps=s.querySelector('.sous-corps'); cascadeA([].slice.call(corps.children)); }
  function fermerSous(s){ if(!s||!s.classList.contains('ouvert')||s.classList.contains('fermant'))return;
    s.classList.add('fermant');
    var corps=s.querySelector('.sous-corps'); var kids=[].slice.call(corps.children);
    cascadeF(kids,function(){});
    s._ft=setTimeout(function(){ s._ft=null; s.classList.remove('ouvert'); s.classList.remove('fermant'); kids.forEach(function(k){ if(k)k.style.animation=''; }); },190); }
  function basculerSous(s){ annuleTout(); if(s.classList.contains('fermant')||!s.classList.contains('ouvert')) ouvrirSous(s); else fermerSous(s); }
  function corpsGrp(g){ return g.querySelector(':scope > .grp-corps'); }
  function ouvrirGrp(g){ if(!g)return;
    if(g.classList.contains('fermant')){ annuleFermeture(g); }
    else if(g.classList.contains('ouvert'))return;
    g.classList.add('ouvert');
    var corps=corpsGrp(g); if(corps) cascadeA([].slice.call(corps.children)); }
  function fermerGrp(g){ if(!g||!g.classList.contains('ouvert')||g.classList.contains('fermant'))return;
    g.classList.add('fermant');
    var corps=corpsGrp(g); var kids=corps?[].slice.call(corps.children):[]; if(corps) cascadeF(kids,function(){});
    g._ft=setTimeout(function(){ g._ft=null; g.classList.remove('ouvert'); g.classList.remove('fermant'); kids.forEach(function(k){ if(k)k.style.animation=''; }); },190); }
  function basculerGrp(g){ annuleTout(); if(g.classList.contains('fermant')||!g.classList.contains('ouvert')) ouvrirGrp(g); else fermerGrp(g); }
  function tout(){ annuleTout();
    var secs=[].slice.call(document.querySelectorAll('.dom'));
    var ouverts=secs.filter(function(s){return s.classList.contains('ouvert')&&!s.classList.contains('fermant');});
    if(ouverts.length){ ouverts.forEach(fermer); }
    else { secs.forEach(function(s,i){ toutTimers.push(setTimeout(function(){ouvrir(s);}, i*110)); }); }
    setTimeout(maj,10); }
  function maj(){ var b=document.getElementById('basculerTout'); if(!b)return;
    var ouvert=[].slice.call(document.querySelectorAll('.dom')).some(function(s){return s.classList.contains('ouvert');});
    b.classList.toggle('actif-tout',ouvert); var l=b.querySelector('.bt-label'); if(l)l.textContent=ouvert?b.dataset.collapse:b.dataset.expand; }
  var b=document.getElementById('basculerTout');
  if(b){ b.addEventListener('click',tout); b.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){e.preventDefault();tout();} }); }
  function majAria(){ document.querySelectorAll('.dom-tete,.grp-tete,.sous-tete').forEach(function(t){ var c=t.closest('.dom,.grp,.sous'); t.setAttribute('aria-expanded', c && c.classList.contains('ouvert') ? 'true':'false'); }); }
  /* Délégation : une seule écoute pour les têtes statiques ET créées à la volée
     (overrides admin) — évite la double liaison qui rouvrait/refermait (23/07). */
  document.addEventListener('click', function(e){
    var t = e.target.closest ? e.target.closest('.dom-tete,.grp-tete,.sous-tete') : null;
    if(!t) return;
    if(t.classList.contains('dom-tete')) basculer(t.closest('.dom'));
    else if(t.classList.contains('grp-tete')) basculerGrp(t.closest('.grp'));
    else basculerSous(t.closest('.sous'));
    setTimeout(majAria,10);
  });
  document.addEventListener('keydown', function(e){
    if(e.key!=='Enter'&&e.key!==' ') return;
    var t = e.target && e.target.closest ? e.target.closest('.dom-tete,.grp-tete,.sous-tete') : null;
    if(!t) return;
    e.preventDefault(); t.click();
  });
  function ouvrirAncetres(el,sec){ var a=el.parentNode; while(a&&a!==sec){ if(a.classList&&a.classList.contains('grp')) ouvrirGrp(a); a=a.parentNode; } }
  var theme=new URLSearchParams(location.search).get('theme');
  if(theme){ var sec=document.querySelector('.dom[data-theme="'+theme+'"]'); if(sec){ ouvrir(sec); maj();
    var cat=new URLSearchParams(location.search).get('cat'),
        grp=new URLSearchParams(location.search).get('grp'), cible=sec;
    if(cat){ var sc=sec.querySelector('.sous[data-cat="'+cat+'"]'); if(sc){ ouvrirAncetres(sc,sec); ouvrirSous(sc); cible=sc; } }
    else if(grp){ var gc=sec.querySelector('.grp[data-grp="'+grp+'"]'); if(gc){ ouvrirAncetres(gc,sec); ouvrirGrp(gc); cible=gc; } }
    setTimeout(function(){ cible.scrollIntoView({behavior:'smooth',block:'start'}); },140); return; } }
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
  /* références bibliques : « Jean 3:16 » ouvre la Bible depuis n'importe où.
     Même logique que la recherche de la page Bible (dico + alias + préfixe
     unique), sur la table LUMEN_BIBLE injectée dans recherche-<lang>.js */
  var BALIAS={'genese':['gn','gen'],'exode':['ex','exo'],'levitique':['lv','lev'],'nombres':['nb','nbr','num'],'deuteronome':['dt','deut'],'josue':['jos'],'juges':['jg','jug'],'ruth':['rt'],'1-samuel':['1s','1sam','1sm'],'2-samuel':['2s','2sam','2sm'],'1-rois':['1r','1roi'],'2-rois':['2r','2roi'],'1-chroniques':['1ch','1chr','1par'],'2-chroniques':['2ch','2chr','2par'],'esdras':['esd'],'nehemie':['ne','neh'],'tobie':['tb','tob'],'judith':['jdt'],'esther':['est'],'1-maccabees':['1m','1ma','1mac','1macc'],'2-maccabees':['2m','2ma','2mac','2macc'],'job':['jb'],'psaumes':['ps','psaume'],'proverbes':['pr','prv','prov'],'ecclesiaste':['qo','eccl','qohelet'],'cantique-des-cantiques':['ct','cant','cantique','cantiques'],'sagesse':['sg','sag'],'ecclesiastique':['si','sir','siracide','eccli','ecclesiastique'],'isaie':['is','isa','esaie'],'jeremie':['jr','jer'],'lamentations':['lm','lam'],'baruch':['ba','bar'],'ezechiel':['ez','eze'],'daniel':['dn','dan'],'osee':['os'],'joel':['jl'],'amos':['am'],'abdias':['ab','abd'],'jonas':['jon'],'michee':['mi','mich'],'nahum':['na','nah'],'habacuc':['ha','hab'],'sophonie':['so','soph'],'aggee':['ag','agg'],'zacharie':['za','zac'],'malachie':['ml','mal'],'matthieu':['mt','mat','matt'],'marc':['mc'],'luc':['lc'],'jean':['jn'],'actes':['ac','act'],'romains':['rm','rom'],'1-corinthiens':['1co','1cor'],'2-corinthiens':['2co','2cor'],'galates':['ga','gal'],'ephesiens':['ep','eph'],'philippiens':['ph','phil','php'],'colossiens':['col'],'1-thessaloniciens':['1th','1thes','1thess'],'2-thessaloniciens':['2th','2thes','2thess'],'1-timothee':['1tm','1tim'],'2-timothee':['2tm','2tim'],'tite':['tt','tit'],'philemon':['phm','phlm'],'hebreux':['he','heb'],'jacques':['jc','jac'],'1-pierre':['1p','1pi'],'2-pierre':['2p','2pi'],'1-jean':['1jn'],'2-jean':['2jn'],'3-jean':['3jn'],'jude':['jud'],'apocalypse':['ap','apc','apoc']};
  var BDICO=null;
  function bnorm(s){return String(s).toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/[^a-z0-9]+/g,'');}
  function bdico(){
    var B=window.LUMEN_BIBLE;
    if(BDICO||!B)return BDICO;
    BDICO={};
    var parSlug={};
    B.livres.forEach(function(l){BDICO[bnorm(l[0])]=l;BDICO[bnorm(l[1])]=l;parSlug[l[1]]=l;});
    Object.keys(BALIAS).forEach(function(sl){var l=parSlug[sl];if(l)BALIAS[sl].forEach(function(a){BDICO[bnorm(a)]=l;});});
    return BDICO;
  }
  function btrouve(tok){
    var D=bdico(); if(!D)return null;
    var t=bnorm(tok); if(!t)return null;
    if(D[t])return D[t];
    var arts=['les','le','la','l','the'];
    for(var i=0;i<arts.length;i++){if(t.indexOf(arts[i])===0){var t2=t.slice(arts[i].length);if(t2.length>=2&&D[t2])return D[t2];}}
    var c=[];window.LUMEN_BIBLE.livres.forEach(function(l){if(bnorm(l[0]).indexOf(t)===0)c.push(l);});
    return (c.length===1&&t.length>=2)?c[0]:null;
  }
  function brefParse(q){
    var B=window.LUMEN_BIBLE; if(!B)return null;
    var s=String(q||'').trim().toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/\\s+/g,' ').trim();
    var m=s.match(/^([1-4]?\\s*[a-z']+(?:[ -][a-z']+)*)(?:\\s+(\\d{1,3})(?:\\s*[:,.]\\s*(\\d{1,3})(?:\\s*[-\\u2013a]\\s*(\\d{1,3}))?)?)?$/);
    if(!m)return null;
    var l=btrouve(m[1]); if(!l)return null;
    var nch=l[2],ch=m[2]?parseInt(m[2],10):0,v1=m[3]?parseInt(m[3],10):0,v2=m[4]?parseInt(m[4],10):v1;
    if(ch&&nch===1&&!v1){v1=ch;v2=ch;ch=1;}
    if(ch&&ch>nch)return null;
    if(v2<v1){var tv=v1;v1=v2;v2=tv;}
    var lab=l[0]+(ch?' '+ch+(v1?':'+v1+(v2>v1?'-'+v2:''):''):'');
    var hch=ch,hv=v1;
    var hash=l[1]+(hch?'/'+hch+(hv?'/'+hv:''):'');
    return {lab:lab,href:B.base+'#'+hash};
  }
  function brefItem(q){
    var parts=String(q||'').split(/\\s*;\\s*|,(?=\\s*[1-4]?\\s*[a-zA-Z\\u00c0-\\u024f])/).map(function(x){return x.trim();}).filter(Boolean);
    var out='';
    parts.forEach(function(p){
      var br=brefParse(p);
      if(br)out+='<a class="rech-item" href="'+br.href+'"><div class="rech-meta">Bible</div><div class="rech-titre">'+br.lab+'</div><div class="rech-extrait">'+(L.lang==='en'?'Open in the Bible':'Ouvrir dans la Bible')+'</div></a>';
    });
    return out;
  }
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
  var kidx=-1;
  function kitems(){return res.querySelectorAll('.rech-item');}
  function kmaj(){var its=kitems();for(var i=0;i<its.length;i++)its[i].classList.toggle('kact',i===kidx);if(kidx>=0&&its[kidx]&&its[kidx].scrollIntoView)its[kidx].scrollIntoView({block:'nearest'});}
  function chercher(q){
    kidx=-1;
    var termes=norm(q).split(/\\s+/).filter(Boolean);
    if(!termes.length){res.innerHTML='<div class="rech-msg">'+L.hint+'</div>';return;}
    var bib=brefItem(q);
    var out=[];
    index.forEach(function(a){
      if(window.LV_SUPP&&window.LV_SUPP.indexOf(a.s)>=0)return;
      if(!termes.every(function(t){return a._n.indexOf(t)>=0;}))return;
      var sc=0;termes.forEach(function(t){if(a._t.indexOf(t)>=0)sc+=5;if(a._r.indexOf(t)>=0)sc+=2;sc+=1;});
      out.push({a:a,sc:sc});
    });
    out.sort(function(x,y){return y.sc-x.sc;});
    if(!out.length){res.innerHTML=bib||('<div class="rech-msg">'+L.empty+' « '+q+' ».</div>');return;}
    res.innerHTML=bib+out.slice(0,30).map(function(o){
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
  champ.addEventListener('keydown',function(e){
    var its=kitems();
    if(e.key==='ArrowDown'){e.preventDefault();if(!its.length)return;kidx=Math.min(its.length-1,kidx+1);kmaj();}
    else if(e.key==='ArrowUp'){e.preventDefault();if(!its.length)return;kidx=Math.max(-1,kidx-1);kmaj();}
    else if(e.key==='Enter'){var c=its[kidx>=0?kidx:0];if(c&&c.getAttribute('href')){e.preventDefault();location.href=c.getAttribute('href');}}
  });
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&overlay.classList.contains('ouvert'))ferme();});
})();`;

function page({ lang, type, title, description, frPath, enPath, base, otherRel, ctx, main, extraJS }) {
  const u = UI[lang];
  const hreflang = '';
  const url = DOMAINE + frPath;
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
<meta property="og:image" content="${DOMAINE}/icones/partage.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="apple-touch-icon" href="/icones/lumen-180.png">
<meta name="theme-color" content="#0a0a0a">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
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
</script>
<script src="/lumen-data.js?v=${DATA_V}"></script>
<script src="/lumen-app.js?v=${APP_V}"></script>${extraJS ? `
<script>${extraJS}</script>` : ''}
<script src="/bible-panneau.js?v=${PAN_V}" defer></script>
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
    <div class="titre-section">
      <span class="num" data-lv-txt="lect_label">${u.lect_label}</span>
      <h2 data-lv-txt="lect_title">${u.lect_title}</h2>
      <span class="trait"></span>
    </div>
    <div class="memo-bloc">
      <div class="memo-droite" id="lect-etat" data-state="load">
        <div class="memo-pct"><span id="lect-x"></span><i data-lv-txt="lect_lu">${u.lect_lu}</i></div>
        <div class="memo-bar" id="lect-bar"><i class="l"></i></div>
        <p class="memo-note" id="lect-note">${u.lect_signedout}</p>
      </div>
      <a class="memo-start" id="lect-start" href="/bibliotheque/" data-lv-txt="lect_start">${u.lect_start}</a>
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
  const grpNom = (t, node) => lang === 'fr' ? node.nom : ((((THEMES_EN[t.id] || {}).cats) || {})[node.id] || node.nom);
  const renderNoeuds = (nodes, at, vus, t) => {
    let html = '';
    for (const node of nodes) {
      if (node.kind === 'grp') {
        const inner = renderNoeuds(node.noeuds || [], at, vus, t);
        if (!inner.trim()) continue; // pas de groupe vide
        html += `
      <div class="grp" data-grp="${node.id}">
        <div class="grp-tete" role="button" tabindex="0" aria-expanded="false">
          <span class="grp-marque" aria-hidden="true"></span>
          <span class="grp-nom">${grpNom(t, node)}</span>
          <span class="grp-chevron" aria-hidden="true">›</span>
        </div>
        <div class="grp-corps">${inner}</div>
      </div>`;
      } else {
        const arts = node.arts.map(id => at.find(a => a.id === id)).filter(Boolean);
        arts.forEach(a => vus.add(a.id));
        if (!arts.length) continue;
        if (node.nom) {
          html += `
      <div class="sous" data-cat="${node.id}">
        <div class="sous-tete" role="button" tabindex="0" aria-expanded="false">
          <span class="sous-puce" aria-hidden="true"></span>
          <span class="sous-nom">${catNom(lang, t.id, node.id)}</span>
          <span class="sous-chevron" aria-hidden="true">›</span>
        </div>
        <div class="sous-corps">${arts.map(carte).join('')}</div>
      </div>`;
        } else {
          html += arts.map(carte).join('');
        }
      }
    }
    return html;
  };
  const corpsDomaine = t => {
    const at = ARTICLES.filter(a => a.theme === t.id);
    const vide = `<div class="vide">${u.lib_empty}</div>`;
    const tree = t.tree || (t.categories ? t.categories.map(c => ({ kind: 'cat', id: c.id, nom: c.nom, arts: c.arts })) : null);
    if (!tree) return at.map(carte).join('') || vide;
    const vus = new Set();
    let html = renderNoeuds(tree, at, vus, t);
    html += at.filter(a => !vus.has(a.id)).map(carte).join('');
    return html || vide;
  };
  const sections = THEMES.map((t, i) => {
    const n = compteParTheme(t.id);
    const num = String(i + 1).padStart(2, '0');
    const mot = lang === 'fr' ? (n <= 1 ? u.entry_one : u.entry_many) : (n === 1 ? u.entry_one : u.entry_many);
    return `
    <section class="dom" data-theme="${t.id}">
      <div class="dom-tete" role="button" tabindex="0" aria-expanded="false">
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

function slugAncre(t) {
  return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 's';
}
function prepAncres(html) {
  const secs = []; const vus = new Set();
  const out = html.replace(/<h2>([\s\S]*?)<\/h2>/g, (m, t) => {
    const txt = t.replace(/<[^>]+>/g, '').trim();
    let id = 'sec-' + slugAncre(txt); let k = 2;
    while (vus.has(id)) id = 'sec-' + slugAncre(txt) + '-' + (k++);
    vus.add(id); secs.push({ id, titre: txt });
    return `<h2 id="${id}">${t}</h2>`;
  });
  return { html: out, secs };
}

/* ── Références bibliques cliquables (22/07) : span.ref → a.ref quand la réf se
   résout, réfs sources entre parenthèses → a.ref-src, cible /bible.html#slug/ch/v ── */
const LVREF_T = {"genese":"genese","exode":"exode","levitique":"levitique","nombres":"nombres","deuteronome":"deuteronome","josue":"josue","juges":"juges","ruth":"ruth","1samuel":"1-samuel","2samuel":"2-samuel","1rois":"1-rois","2rois":"2-rois","1chroniques":"1-chroniques","2chroniques":"2-chroniques","esdras":"esdras","nehemie":"nehemie","tobie":"tobie","judith":"judith","esther":"esther","1maccabees":"1-maccabees","2maccabees":"2-maccabees","job":"job","psaumes":"psaumes","proverbes":"proverbes","ecclesiaste":"ecclesiaste","cantiquedescantiques":"cantique-des-cantiques","sagesse":"sagesse","siracide":"ecclesiastique","isaie":"isaie","jeremie":"jeremie","lamentations":"lamentations","baruch":"baruch","ezechiel":"ezechiel","daniel":"daniel","osee":"osee","joel":"joel","amos":"amos","abdias":"abdias","jonas":"jonas","michee":"michee","nahum":"nahum","habacuc":"habacuc","sophonie":"sophonie","aggee":"aggee","zacharie":"zacharie","malachie":"malachie","matthieu":"matthieu","marc":"marc","luc":"luc","jean":"jean","actes":"actes","romains":"romains","1corinthiens":"1-corinthiens","2corinthiens":"2-corinthiens","galates":"galates","ephesiens":"ephesiens","philippiens":"philippiens","colossiens":"colossiens","1thessaloniciens":"1-thessaloniciens","2thessaloniciens":"2-thessaloniciens","1timothee":"1-timothee","2timothee":"2-timothee","tite":"tite","philemon":"philemon","hebreux":"hebreux","jacques":"jacques","1pierre":"1-pierre","2pierre":"2-pierre","1jean":"1-jean","2jean":"2-jean","3jean":"3-jean","jude":"jude","apocalypse":"apocalypse","psaume":"psaumes","qohelet":"ecclesiaste","cantique":"cantique-des-cantiques","actesdesapotres":"actes","ecclesiastique":"ecclesiastique","apocalypsedejean":"apocalypse"};
const LVREF_NCH = {"juges":21,"2-maccabees":15,"psaumes":150,"matthieu":28,"ecclesiaste":12,"isaie":66,"jean":21,"genese":50,"exode":40,"levitique":27,"nombres":36,"michee":7,"ephesiens":6,"1-thessaloniciens":5,"sophonie":3,"tobie":14,"nehemie":13,"job":42,"ezechiel":48,"jeremie":52,"lamentations":5,"baruch":6,"daniel":14,"osee":14,"joel":4,"amos":9,"abdias":1,"jonas":4,"nahum":3,"habacuc":3,"aggee":2,"zacharie":14,"malachie":3,"marc":16,"luc":24,"actes":28,"romains":16,"1-corinthiens":16,"2-corinthiens":13,"galates":6,"philippiens":4,"colossiens":4,"2-thessaloniciens":3,"1-timothee":6,"2-timothee":4,"tite":3,"philemon":1,"hebreux":13,"jacques":5,"1-pierre":5,"2-pierre":3,"jude":1,"1-jean":5,"2-jean":1,"3-jean":1,"apocalypse":22,"deuteronome":34,"josue":24,"ruth":4,"1-samuel":31,"2-samuel":24,"1-rois":22,"2-rois":25,"1-chroniques":29,"2-chroniques":36,"esdras":10,"judith":16,"esther":16,"1-maccabees":16,"proverbes":31,"cantique-des-cantiques":8,"sagesse":19,"ecclesiastique":51};
const LVRX = new RegExp('((?:Cantique[ \\u00a0]des[ \\u00a0]cantiques|Apocalypse[ \\u00a0]de[ \\u00a0]Jean|1[ \\u00a0]Thessaloniciens|2[ \\u00a0]Thessaloniciens|Actes[ \\u00a0]des[ \\u00a0]Apôtres|Ecclésiastique|1[ \\u00a0]Corinthiens|2[ \\u00a0]Corinthiens|1[ \\u00a0]Chroniques|2[ \\u00a0]Chroniques|Lamentations|1[ \\u00a0]Maccabées|2[ \\u00a0]Maccabées|Deutéronome|Ecclésiaste|Philippiens|1[ \\u00a0]Timothée|2[ \\u00a0]Timothée|Apocalypse|Colossiens|Lévitique|Proverbes|Éphésiens|1[ \\u00a0]Pierre|1[ \\u00a0]Samuel|2[ \\u00a0]Pierre|2[ \\u00a0]Samuel|Cantique|Malachie|Matthieu|Philémon|Siracide|Sophonie|Zacharie|Ézéchiel|Galates|Habacuc|Hébreux|Jacques|Jérémie|Nombres|Néhémie|Psaumes|Qohélet|Romains|Sagesse|1[ \\u00a0]Jean|1[ \\u00a0]Rois|2[ \\u00a0]Jean|2[ \\u00a0]Rois|3[ \\u00a0]Jean|Abdias|Baruch|Daniel|Esdras|Esther|Genèse|Judith|Michée|Psaume|Actes|Aggée|Exode|Isaïe|Jonas|Josué|Juges|Nahum|Tobie|Amos|Jean|Joël|Jude|Marc|Osée|Ruth|Tite|Job|Luc)[ \u00a0](\\d{1,3})\\s*:\\s*(\\d{1,3})(?:\\s*[\\-\u2013]\\s*(\\d{1,3}))?)', 'gi');
function lvNrm(s) {
  s = String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return s.replace(/[^a-z0-9]/g, '');
}
function lvRefHref(txt) {
  const m = String(txt).trim().match(/^(.+?)[ \u00a0](\d{1,3})\s*:\s*(\d{1,3})(?:\s*[\-\u2013]\s*\d{1,3})?$/);
  if (!m) return null;
  const slug = LVREF_T[lvNrm(m[1])]; if (!slug) return null;
  const ch = parseInt(m[2], 10);
  if (LVREF_NCH[slug] && ch > LVREF_NCH[slug]) return null;
  return '/bible.html#' + slug + '/' + ch + '/' + parseInt(m[3], 10);
}
function lvLinkifyHTML(html) {
  html = html.replace(/<span class="ref">([^<]*)<\/span>/g, (m, t) => {
    const h = lvRefHref(t); return h ? `<a class="ref" href="${h}">${t}</a>` : m;
  });
  const parts = html.split(/(<[^>]+>)/);
  let inA = 0, inH = 0;
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (p.startsWith('<')) {
      if (/^<a[\s>]/i.test(p)) inA++;
      else if (/^<\/a>/i.test(p)) inA = Math.max(0, inA - 1);
      else if (/^<h1[\s>]/i.test(p)) inH++;
      else if (/^<\/h1>/i.test(p)) inH = Math.max(0, inH - 1);
      continue;
    }
    if (inA || inH || p.indexOf('(') < 0) continue;
    parts[i] = p.replace(/\(([^()]*)\)/g, (g, inner) => {
      LVRX.lastIndex = 0;
      if (!LVRX.test(inner)) return g;
      LVRX.lastIndex = 0;
      const in2 = inner.replace(LVRX, (mm) => {
        const h = lvRefHref(mm); return h ? `<a class="ref-src" href="${h}">${mm}</a>` : mm;
      });
      return '(' + in2 + ')';
    });
  }
  return parts.join('');
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
  const prep = prepAncres(lvLinkifyHTML(reLink(artContenu(lang, a), base, lang)).replace(/<span class="ref">/g, '<span class="ref" role="button" tabindex="0">'));
  return `<div class="vue">
    <article class="lecture" data-article="${a.id}">
      <h1>${artTitre(lang, a)}</h1>
      ${prep.html}
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
  return `<style>
    .quatre{text-align:center;padding:88px 24px 120px;max-width:640px;margin:0 auto}
    .quatre .croix{opacity:.55;width:58px;height:106px;margin-bottom:46px}
    .q-sur{font-family:'Cormorant Garamond',serif;font-size:12px;letter-spacing:.3em;text-transform:uppercase;color:var(--or);margin-bottom:24px}
    .quatre h1{font-family:'Cormorant Garamond',serif;font-weight:400;font-size:46px;letter-spacing:.02em;color:var(--parchemin);margin:0 0 6px}
    .q-en{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:19px;color:rgba(255,255,255,.5);margin:0 0 32px}
    .quatre .q-desc{font-size:16px;line-height:1.75;color:rgba(255,255,255,.6);margin:0 auto 44px;max-width:520px}
    .q-acts{display:flex;gap:28px;justify-content:center;align-items:center;flex-wrap:wrap}
    .q-btn{font-family:'Cormorant Garamond',serif;font-size:14px;letter-spacing:.12em;text-transform:uppercase;background:var(--or);color:var(--encre,#000);padding:13px 28px;text-decoration:none;transition:background .3s}
    .q-btn:hover{background:var(--or-pale)}
    .q-lien{font-family:'Cormorant Garamond',serif;font-size:12.5px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.6);text-decoration:none;padding-bottom:3px;border-bottom:1px solid transparent;transition:color .3s,border-color .3s}
    .q-lien:hover{color:#fff;border-color:var(--or)}
    @media(max-width:720px){.quatre{padding-top:56px}.quatre h1{font-size:36px}}
  </style>
  <div class="vue"><section class="quatre">
    <div class="croix" aria-hidden="true"></div>
    <div class="q-sur">Lumen Veritatis</div>
    <h1>Page introuvable</h1>
    <p class="q-en">Page not found</p>
    <p class="q-desc">Cette page n'existe pas. Cherchez un article ou une référence (Jean 3:16), ou revenez à l'accueil.<br>This page does not exist. Search for an article or a reference (John 3:16), or go back home.</p>
    <div class="q-acts">
      <a href="#" id="r404" class="q-btn">Rechercher · Search</a>
      <a href="/" class="q-lien">Revenir à l'accueil</a>
      <a href="/en/" class="q-lien">Back to home</a>
    </div>
    <script>document.addEventListener('click',function(e){var a=e.target.closest?e.target.closest('#r404'):null;if(a){e.preventDefault();var b=document.getElementById('rech-ouvrir');if(b)b.click();}});</script>
  </section></div>`;
}

/* ---- écriture ---- */
function ecrire(rel, contenu) {
  const dest = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, contenu, 'utf8');
}
fs.rmSync(OUT, { recursive: true, force: true });

const pairs = [];

/* ── Fichiers communs mis en cache : données et code partagés par toutes les pages.
   Versionnés par empreinte de contenu (?v=hash) pour un cache navigateur long :
   l'URL change quand le contenu change, sinon zéro re-téléchargement. ── */
const crypto = require('crypto');


const DATA_JS = 'window.LV_INDEX=' + JSON.stringify({ fr: buildIndex('fr') }).replace(/</g, '\\u003c')
  + ';';
const UX_JS = `
(function(){
  var FR=!(window.LUMEN&&window.LUMEN.lang==='en');
  /* progression de lecture, pages article seulement */
  var art=document.querySelector('article.lecture');
  if(art){
    var bar=document.createElement('div'); bar.className='prog-lect'; document.body.appendChild(bar);
    var tick=false;
    function majBar(){ tick=false; var r=art.getBoundingClientRect();
      var total=r.height-window.innerHeight;
      var fait=Math.min(Math.max(-r.top,0), Math.max(total,0));
      bar.style.width=(total>40 ? (fait/total*100) : 0)+'%'; }
    window.addEventListener('scroll',function(){ if(!tick){tick=true;requestAnimationFrame(majBar);} },{passive:true});
    window.addEventListener('resize',function(){ if(!tick){tick=true;requestAnimationFrame(majBar);} },{passive:true});
    majBar();
  }
  /* retour en haut, toutes pages */
  var h=document.createElement('span');
  h.className='haut-page'; h.setAttribute('role','button'); h.setAttribute('tabindex','0');
  h.setAttribute('aria-label',FR?'Revenir en haut de la page':'Back to top');
  h.textContent='\u2191';
  h.addEventListener('click',function(){ window.scrollTo({top:0,behavior:'smooth'}); });
  h.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){e.preventDefault();window.scrollTo({top:0,behavior:'smooth'});} });
  document.body.appendChild(h);
  var t2=false;
  function majHaut(){ t2=false; h.classList.toggle('on', window.scrollY>700); }
  window.addEventListener('scroll',function(){ if(!t2){t2=true;requestAnimationFrame(majHaut);} },{passive:true});
  majHaut();
})();`;
const APP_JS = [COMMUN_JS, RECH_JS, AUTH_JS, MEMO_JS, LECT_JS, SOMMAIRE_JS, ADMIN_JS, UX_JS].join('\n');
const DATA_V = crypto.createHash('md5').update(DATA_JS).digest('hex').slice(0, 8);
const APP_V = crypto.createHash('md5').update(APP_JS).digest('hex').slice(0, 8);
const PAN_V = fs.existsSync('bible-panneau.js') ? crypto.createHash('md5').update(fs.readFileSync('bible-panneau.js')).digest('hex').slice(0, 8) : '1';
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(`${OUT}/lumen-data.js`, DATA_JS);
fs.writeFileSync(`${OUT}/lumen-app.js`, APP_JS);
console.log(`Communs : lumen-data.js (${Math.round(DATA_JS.length / 1024)} Ko, v=${DATA_V}), lumen-app.js (${Math.round(APP_JS.length / 1024)} Ko, v=${APP_V})`);

function genPaire(spec) {
  // spec: type, frPath, enPath, frFile, enFile, titleKey, descKey, mainFn, ctxFn, extraJS
  pairs.push({ fr: spec.frPath, en: spec.enPath });
  ['fr'].forEach(lang => {
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
      extraJS: typeof spec.extraJS === 'function' ? spec.extraJS(lang) : spec.extraJS
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

    main: (l, b) => mainArticle(l, a, b)
  });
});

// 404 (racine, bilingue) — sans paire ni hreflang
ecrire('404.html', page({
  lang: 'fr', type: '', title: UI.fr.t_404, description: UI.fr.notfound_text,
  frPath: '/404.html', enPath: '/404.html', base: '/', otherRel: '/en/',
  main: main404()
}));

// sitemap bilingue avec alternates
const sm = pairs.map(p => {
  return `  <url>
    <loc>${DOMAINE}${p.fr}</loc>
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
});
ecrire('_redirects', redLines.join('\n') + '\n');

// index de recherche (texte des articles), un par langue
// + table des livres bibliques pour la recherche de références (Jean 3:16)
const tableBible = (src, base) => {
  try {
    const b = JSON.parse(fs.readFileSync(src, 'utf8'));
    return { base, livres: b.livres.map(l => [l.nom, l.slug, l.nch]) };
  } catch (e) { return null; }
};
const bibFR = tableBible('content/bible.json', '/bible.html');
const idxFR = ARTICLES.map(a => ({ s: a.id, t: a.titre, th: themeNom('fr', a.theme), r: a.resume, x: depouiller(a.contenu) }));
ecrire('recherche-fr.js', 'window.LUMEN_INDEX=' + JSON.stringify(idxFR) + ';' + (bibFR ? 'window.LUMEN_BIBLE=' + JSON.stringify(bibFR) + ';' : ''));

// copie des pages autonomes (hors pipeline bilingue)
if (fs.existsSync('memoriser.html')) {
  let mh = fs.readFileSync('memoriser.html', 'utf8');
  {
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
  {
    const hOld = mh.match(/<header>[\s\S]*?<\/header>/);
    const fOld = mh.match(/<footer[^>]*>[\s\S]*?<\/footer>/);
    if (!hOld || !fOld) throw new Error('memoriser.html : header ou footer introuvable');
    mh = mh.replace(hOld[0], barreCanon({
      home: '/', logoId: 'nav-logo', burgerId: 'nav-burger', menuId: 'site-nav',
      liens: [
        { id: 'nav-home', label: '' },
        { id: 'nav-lib', label: '' },
        { href: '/bible.html', label: 'Bible' },
        { id: 'nav-mem', href: '/memoriser.html', actif: true, label: '' }
      ],
      loupe: { id: 'rech-ouvrir', label: 'Rechercher', labelId: 'rech-link-label' },
      compte: { type: 'user', mailId: 'user-mail', btnId: 'logout-btn', labelId: 'logout-label', label: 'Déconnexion' }
    }));
    mh = mh.replace(fOld[0], piedCanon({ verseId: 'foot-verse', copyId: 'foot-copy' }));
    mh = mh.replace('</head>', '<style>' + BARRE_CSS + '</style></head>');
    console.log('Mémoriser : barre et pied canoniques injectés');
  }
  if (ADMIN_JS && mh.indexOf('</body>') >= 0) {
    mh = mh.replace('</body>', '<script src="/lumen-data.js?v=' + DATA_V + '"></script><script>' + ADMIN_JS + '</script><script>' + LECT_JS + '</script></body>');
  }
  mh = mh.replace('</body>', '<script src="/bible-panneau.js?v=' + PAN_V + '" defer><' + '/script></body>');
  fs.writeFileSync(`${OUT}/memoriser.html`, mh);
  console.log('Copié : memoriser.html');
}

// ── La Sainte Bible (traduction Chérubin) : page de lecture + données par livre ──
if (fs.existsSync('bible.html')) {
  let bh = fs.readFileSync('bible.html', 'utf8');
  if (bh.indexOf('</body>') >= 0) {
    bh = bh.replace('</body>', '<script src="/lumen-data.js?v=' + DATA_V + '"></script></body>');
  }
  if (APPEARANCE_CSS && bh.indexOf('</head>') >= 0) {
    bh = bh.replace('</head>', '<style>' + APPEARANCE_CSS + '</style></head>');
  }
  {
    const hOld = bh.match(/<header>[\s\S]*?<\/header>/);
    const fOld = bh.match(/<footer[^>]*>[\s\S]*?<\/footer>/);
    if (!hOld || !fOld) throw new Error('bible.html : header ou footer introuvable');
    bh = bh.replace(hOld[0], barreCanon({
      home: '/', logoId: null, burgerId: 'burger', menuId: 'menu',
      liens: [
        { href: '/', label: 'Accueil' },
        { href: '/bibliotheque/', label: 'Bibliothèque' },
        { href: '/bible.html', actif: true, label: 'Bible' },
        { href: '/memoriser.html', label: 'Mémoriser' }
      ],
      loupe: { id: 'brech-ouvrir', label: 'Rechercher' },
      compte: { type: 'icone', id: 'bcompte-ouvrir', label: 'Compte' }
    }));
    bh = bh.replace(fOld[0], piedCanon({ verse: UI.fr.footer_verse, copyId: 'bf-annee' }));
    bh = bh.replace('</head>', '<style>' + BARRE_CSS + '</style></head>');
    console.log('Bible : barre et pied canoniques injectés');
  }
  let bhFr = bh;
  if (ADMIN_JS && bhFr.indexOf('</body>') >= 0) bhFr = bhFr.replace('</body>', '<script>' + ADMIN_JS + '</script></body>');
  fs.writeFileSync(`${OUT}/bible.html`, bhFr);
  console.log('Copié : bible.html');

  if (fs.existsSync('bible-panneau.js')) {
    fs.copyFileSync('bible-panneau.js', `${OUT}/bible-panneau.js`);
    console.log('Copié : bible-panneau.js');
  }
  for (const f of ['memoriser-sw.js', 'memoriser-manifest.webmanifest', 'manifest.webmanifest']) {
    if (fs.existsSync(f)) fs.copyFileSync(f, `${OUT}/${f}`);
  }
  if (fs.existsSync('icones')) {
    fs.mkdirSync(`${OUT}/icones`, { recursive: true });
    for (const ic of fs.readdirSync('icones')) fs.copyFileSync(`icones/${ic}`, `${OUT}/icones/${ic}`);
  }
  console.log('Copié : memoriser-sw.js + manifests + icônes');
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
console.log('Pages générées :', pairs.length, '(FR) + 404 + sitemap + robots');

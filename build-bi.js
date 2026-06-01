/* ============================================================
   LUMEN — générateur bilingue (français + anglais)
   FR à la racine (/, /bibliotheque/, /a-propos/, /article/<slug-fr>/)
   EN sous /en/ (/en/, /en/library/, /en/about/, /en/article/<slug-en>/)
   Bouton de langue, balises hreflang, sitemap bilingue.
   CSS et apparence conservés à l'identique.
   ============================================================ */
const fs = require('fs');
const path = require('path');
const { SLUGS, THEMES_EN, UI_EN, ARTICLES_EN } = require('./data-en.js');

const SRC = process.argv[2] || 'index__48_.html';
const OUT = process.argv[3] || 'site';
const DOMAINE = 'https://lumenveritatis.net';

const src = fs.readFileSync(SRC, 'utf8');
const css = src.slice(src.indexOf('<style>') + 7, src.indexOf('</style>')).replace(/—/g, '-');

const blockStart = src.indexOf('const THEMES');
const blockEnd = src.indexOf('const app');
const { THEMES, ARTICLES } = (new Function(src.slice(blockStart, blockEnd) + '; return {THEMES, ARTICLES};'))();

/* ---- interface, par langue ---- */
const UI = {
  fr: {
    html: 'fr', oglocale: 'fr_FR',
    menu_home: 'Accueil', menu_library: 'Bibliothèque', menu_about: 'À propos',
    home_intro: "Un lieu pour entrer dans l'intelligence de la foi catholique, des premiers pas jusqu'aux questions les plus profondes.",
    home_domains_label: 'Les domaines', home_explore: 'Explorer par thème',
    entry_one: 'entrée', entry_many: 'entrées',
    filter_all: 'Tout', context_library: 'La bibliothèque',
    footer_verse: '« La lumière luit dans les ténèbres » (Jean 1:5)',
    about_surtitle: 'Le projet', about_title: 'À propos de Lumen',
    about_p: [
      "Lumen est un lieu d'étude et de méditation autour de la foi catholique. Son but est simple : rendre la théologie accessible, fidèle et vivante, pour le débutant qui découvre comme pour le croyant qui veut approfondir.",
      "Chaque entrée s'appuie sur les Écritures, la tradition de l'Église et l'enseignement constant du Magistère. La forme cherche la sobriété : que les vérités parlent d'elles-mêmes, sans bruit ni surcharge. Tout y tend vers une seule fin : <em>« Vous connaîtrez la vérité, et la vérité vous rendra libres. »</em> <span class=\"ref\">Jean 8:32</span>",
      "Le site grandit lentement, entrée après entrée. Ce qui s'y trouve n'épuise jamais son sujet : il ouvre une porte, et invite à aller plus loin."
    ],
    notfound_title: 'Page introuvable', notfound_text: "Cette page n'existe pas.", notfound_back: "Revenir à l'accueil",
    site_desc_home: "Un lieu pour entrer dans l'intelligence de la foi catholique, des premiers pas jusqu'aux questions les plus profondes.",
    site_desc_library: "Toutes les entrées de Lumen, classées par domaine : doctrine, Écriture, sacrements, figures, histoire et philosophie.",
    site_desc_about: "Lumen, un lieu d'étude et de méditation autour de la foi catholique : rendre la théologie accessible, fidèle et vivante.",
    t_home: 'Lumen · Théologie catholique', t_library: 'Bibliothèque · Lumen', t_about: 'À propos · Lumen', t_404: 'Page introuvable · Lumen',
    search_placeholder: 'Rechercher dans Lumen…', search_hint: 'Tapez un mot pour parcourir les articles.', search_empty: 'Aucun résultat pour',
    other_label: 'EN'
  },
  en: Object.assign({}, UI_EN, {
    oglocale: 'en', other_label: 'FR',
    site_desc_home: UI_EN.home_intro,
    site_desc_library: 'All the entries of Lumen, arranged by domain: doctrine, Scripture, sacraments, figures, history and philosophy.',
    site_desc_about: 'Lumen, a place of study and meditation on the Catholic faith: making theology accessible, faithful and alive.',
    t_home: 'Lumen · Catholic Theology', t_library: 'Library · Lumen', t_about: 'About · Lumen', t_404: 'Page not found · Lumen'
  })
};

/* ---- helpers de données par langue ---- */
const slugOf = (lang, frId) => lang === 'fr' ? frId : SLUGS[frId];
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

const EXTRA_CSS = `
nav.menu a.lien-langue{font-size:13px;letter-spacing:.2em;opacity:.65}
nav.menu a.lien-langue:hover{opacity:1}
@media(max-width:720px){nav.menu a.lien-langue{font-size:16px;letter-spacing:.12em;opacity:1}}
`;

function header(lang, type, base, otherRel, ctx) {
  const u = UI[lang];
  const home = base === '' ? './' : base;
  const cl = t => type === t ? ' class="actif"' : '';
  const lib = lang === 'fr' ? 'bibliotheque/' : 'library/';
  const abo = lang === 'fr' ? 'a-propos/' : 'about/';
  return `<header>
  <div class="barre">
    <a href="${home}" class="logo">Lumen</a>
    <button class="burger" id="burger" aria-label="Menu">☰</button>
    <nav class="menu" id="menu">
      <a href="${home}"${cl('home')}>${u.menu_home}</a>
      <a href="${base}${lib}"${cl('library')}>${u.menu_library}</a>
      <a href="${base}${abo}"${cl('about')}>${u.menu_about}</a>
      <a href="${otherRel}" class="lien-langue" hreflang="${lang === 'fr' ? 'en' : 'fr'}">${u.other_label}</a>
      <span class="rech-loupe" id="rech-ouvrir" role="button" tabindex="0" aria-label="${u.menu_home === 'Home' ? 'Search' : 'Rechercher'}"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="10" cy="10" r="6.5"/><line x1="15" y1="15" x2="21" y2="21" stroke-linecap="round"/></svg></span>
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
document.getElementById('annee').textContent='© '+new Date().getFullYear()+' Lumen';`;

const BIBLIO_JS = `(function(){
  var boutons=document.querySelectorAll('.filtre');
  var articles=document.querySelectorAll('.article-lien');
  var titres=document.querySelectorAll('.cat-titre');
  function appliquer(theme){
    boutons.forEach(function(b){b.classList.toggle('actif', b.dataset.theme===theme);});
    articles.forEach(function(a){a.style.display=(theme==='tous'||a.dataset.theme===theme)?'':'none';});
    titres.forEach(function(c){c.style.display=(theme!=='tous'&&c.dataset.theme===theme)?'':'none';});
  }
  boutons.forEach(function(b){b.addEventListener('click',function(){
    var t=b.dataset.theme;
    appliquer(t);
    history.replaceState(null,'', t==='tous'?'./':'./?theme='+t);
  });});
  var p=new URLSearchParams(location.search).get('theme');
  if(p) appliquer(p);
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
<style>${css}${EXTRA_CSS}</style>
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
${extraJS || ''}
</script>
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
    <a class="domaine" href="${base}${lib}?theme=${t.id}">
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
    <section class="intro">
      <p>${u.home_intro}</p>
    </section>
    <div class="titre-section">
      <span class="num">${u.home_domains_label}</span>
      <h2>${u.home_explore}</h2>
      <span class="trait"></span>
    </div>
    <section class="domaines">${cartes}</section>
    <div style="height:60px"></div>
  </div>`;
}

function mainBibliotheque(lang, base) {
  const u = UI[lang];
  const art = 'article/';
  const filtres = `<button class="filtre actif" data-theme="tous">${u.filter_all}</button>` +
    THEMES.map(t => `<button class="filtre" data-theme="${t.id}">${themeNom(lang, t.id)}</button>`).join('');
  const carte = a => `
    <a class="article-lien" data-theme="${a.theme}" href="${base}${art}${slugOf(lang, a.id)}/">
      <div class="meta">${themeNom(lang, a.theme)}</div>
      <h3>${artTitre(lang, a)}</h3>
      <p>${artResume(lang, a)}</p>
    </a>`;
  let corps = '';
  for (const t of THEMES) {
    const at = ARTICLES.filter(a => a.theme === t.id);
    if (t.categories) {
      const vus = new Set();
      for (const c of t.categories) {
        const arts = c.arts.map(id => at.find(a => a.id === id)).filter(Boolean);
        arts.forEach(a => vus.add(a.id));
        if (!arts.length) continue;
        if (c.nom) corps += `\n    <div class="cat-titre" data-theme="${t.id}" style="display:none">${catNom(lang, t.id, c.id)}</div>`;
        corps += arts.map(carte).join('');
      }
      corps += at.filter(a => !vus.has(a.id)).map(carte).join('');
    } else {
      corps += at.map(carte).join('');
    }
  }
  return `<div class="vue">
    <div class="filtres">${filtres}</div>
    <section class="liste">${corps}</section>
    <div style="height:60px"></div>
  </div>`;
}

function mainArticle(lang, a, base) {
  return `<div class="vue">
    <article class="lecture">
      <h1>${artTitre(lang, a)}</h1>
      ${reLink(artContenu(lang, a), base, lang)}
    </article>
  </div>`;
}

function mainAPropos(lang) {
  const u = UI[lang];
  return `<div class="vue">
    <section class="bandeau-page">
      <div class="sur-titre">${u.about_surtitle}</div>
      <h1>${u.about_title}</h1>
    </section>
    <div class="prose">
      ${u.about_p.map(p => `<p>${p}</p>`).join('\n      ')}
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

// à propos
genPaire({
  type: 'about', frPath: '/a-propos/', enPath: '/en/about/',
  frFile: 'a-propos/index.html', enFile: 'en/about/index.html',
  title: l => UI[l].t_about, desc: l => UI[l].site_desc_about,
  main: l => mainAPropos(l)
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

// index de recherche (texte des articles), un par langue
const idxFR = ARTICLES.map(a => ({ s: a.id, t: a.titre, th: themeNom('fr', a.theme), r: a.resume, x: depouiller(a.contenu) }));
ecrire('recherche-fr.js', 'window.LUMEN_INDEX=' + JSON.stringify(idxFR) + ';');
const idxEN = ARTICLES.map(a => ({ s: slugOf('en', a.id), t: artTitre('en', a), th: themeNom('en', a.theme), r: artResume('en', a), x: depouiller((ARTICLES_EN[a.id] || {}).contenu) }));
ecrire('en/recherche-en.js', 'window.LUMEN_INDEX=' + JSON.stringify(idxEN) + ';');

console.log('Site bilingue généré dans «', OUT, '»');
console.log('Paires de pages :', pairs.length, '→', pairs.length * 2, 'pages (FR + EN) + 404 + sitemap + robots');

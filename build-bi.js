/* ============================================================
   LUMEN — générateur du site
   Trois surfaces : l'accueil (/), la Sainte Bible (/bible.html)
   Mémoriser (/memoriser.html) et les Articles (/articles.html). Le CSS vient
   de index__48_.html.
   ============================================================ */
const fs = require('fs');
const path = require('path');

const SRC = process.argv[2] || 'index__48_.html';
const OUT = process.argv[3] || 'site';
const DOMAINE = 'https://lumenveritatis.net';
const src = fs.readFileSync(SRC, 'utf8');
const css = src.slice(src.indexOf('<style>') + 7, src.indexOf('</style>')).replace(/—/g, '-');


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
    menu_home: 'Accueil', menu_memorise: 'Mémoriser',
    bible_label: 'Le texte', bible_title: 'La Sainte Bible',
    bible_open: 'Ouvrir la Bible',
    footer_verse: '« Le peuple qui marchait dans les ténèbres a vu une grande lumière ; sur ceux qui habitaient le pays de l\'ombre de la mort, une lumière a resplendi » <span class="ref-pied">Isaïe 9:1</span>',
    notfound_title: 'Page introuvable', notfound_text: "Cette page n'existe pas.", notfound_back: "Revenir à l'accueil",
    site_desc_home: "La Sainte Bible en français et un outil pour apprendre les versets par cœur, à votre rythme.",
    t_home: 'Lumen · La Sainte Bible', t_404: 'Page introuvable · Lumen',
    search_placeholder: 'Une référence, par exemple Jean 3:16…', search_hint: 'Tapez une référence, par exemple Jean 3:16, pour l\u2019ouvrir dans la Bible.', search_empty: 'Aucune référence reconnue dans',
    memo_label:"L'outil", memo_title:'Mémoriser', memo_open:'Ouvrir Mémoriser', memo_start:'Commencer',
    art_label:'Les écrits', art_title:'Articles', art_open:'Ouvrir les articles', memo_mastery:'de maîtrise', memo_acquired:'acquis', memo_learning:'en cours', memo_review:'à revoir', memo_signedout:'Connectez-vous pour suivre votre progression.',
  }
};

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

/* ---- polices + petite règle pour le bouton de langue ---- */
const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&display=swap" rel="stylesheet">`;

const FIREBASE_HEAD = `<script>
/* Firebase à la demande : chargé après le rendu (ou à la première interaction). */
window.lvFB=function(){if(window.__lvFBP)return window.__lvFBP;window.__lvFBP=new Promise(function(res){var u=['app','auth','firestore'].map(function(n){return 'https://www.gstatic.com/firebasejs/10.7.1/firebase-'+n+'-compat.js';});(function next(i){if(i>=u.length){try{document.dispatchEvent(new Event('lv-fb-ready'));}catch(_){}res();return;}var s=document.createElement('script');s.src=u[i];s.onload=function(){next(i+1);};s.onerror=function(){res();};document.head.appendChild(s);})(0);});return window.__lvFBP;};
(function(){var go=function(){window.lvFB();};window.addEventListener('load',function(){setTimeout(go,600);});['pointerdown','keydown'].forEach(function(ev){window.addEventListener(ev,go,{once:true,passive:true});});})();
</scr`+`ipt>`;


/* ==== BARRE ET PIED CANONIQUES (source unique, toutes surfaces) ==== */
const BARRE_CSS = `
@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}
  html{scroll-behavior:auto!important}
}

header{position:sticky;top:0;z-index:50;background:rgba(0,0,0,.82);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-bottom:1px solid rgba(231,224,207,.14)}
.barre{max-width:1080px;margin:0 auto;padding:20px 32px;display:grid;grid-template-columns:auto auto 1fr;align-items:center;gap:24px;height:auto;line-height:1.75}
.barre .logo{grid-column:1;grid-row:1;font-family:'Cormorant Garamond',serif;font-weight:500;font-size:26px;letter-spacing:.34em;text-transform:uppercase;color:var(--parchemin,#ffffff);padding-left:.34em;border-bottom:none;text-decoration:none}
a:focus-visible,button:focus-visible,[role="button"]:focus-visible,[tabindex]:focus-visible,summary:focus-visible{outline:1px solid var(--or,#efe6cf);outline-offset:3px}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}html{scroll-behavior:auto!important}}
.burger{display:none;background:none;border:none;padding:0;margin:0;color:var(--parchemin,#ffffff);font-size:24px;cursor:pointer;line-height:1;-webkit-appearance:none;appearance:none}
nav.menu{display:flex;gap:30px;grid-column:3;grid-row:1;justify-self:end;align-items:center;margin-left:0}
nav.menu a{font-family:'Cormorant Garamond',serif;font-size:16px;letter-spacing:.12em;text-transform:uppercase;white-space:nowrap;color:var(--parchemin,#ffffff);padding:0 0 3px;border-bottom:1px solid transparent;transition:color .3s,border-color .3s;text-decoration:none;position:static}
nav.menu a:hover,nav.menu a.actif{color:var(--parchemin,#ffffff);border-color:var(--or,#efe6cf)}
.rech-loupe{display:inline-flex;align-items:center;cursor:pointer;color:var(--parchemin,#ffffff);transition:color .3s;background:none;border:none;padding:0;outline:none}
.rech-loupe:hover{color:var(--or,#efe6cf)}
.rech-loupe:focus,.rech-loupe:focus-visible{outline:none}
.rech-loupe svg{display:block}
.ll-mob{display:none}
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
}
`;
const SVG_LOUPE = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="10" cy="10" r="6.5"/><line x1="15" y1="15" x2="21" y2="21" stroke-linecap="round"/></svg>';
const SVG_CLOCHE = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0" stroke-linecap="round"/></svg>';
const SVG_COMPTE = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="3.4"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0" stroke-linecap="round"/></svg>';
const NAV_LIENS = [['/', 'Accueil'], ['/bible.html', 'Bible'], ['/memoriser.html', 'Mémoriser'], ['/articles.html', 'Articles']];
const VERSET_PIED = '« Le peuple qui marchait dans les ténèbres a vu une grande lumière ; sur ceux qui habitaient le pays de l\u2019ombre de la mort, une lumière a resplendi » <span class="ref-pied">Isaïe 9:1</span>';

/* Une seule barre, un seul pied. Aucun argument, donc aucune dérive possible :
   mêmes balises, mêmes identifiants, mêmes libellés sur l'accueil, la Bible,
   Mémoriser et la page 404. Chaque page se contente de brancher ses propres
   ouvertures sur les identifiants gelés « rech-ouvrir » et « auth-ouvrir ». */
function barreCanon() {
  return `<header>
  <div class="barre">
    <a href="/" class="logo">Lumen</a>
    <button class="burger" id="burger" aria-label="Menu">\u2630</button>
    <nav class="menu" id="menu">
      ${NAV_LIENS.map(l => `<a href="${l[0]}">${l[1]}</a>`).join('\n      ')}
      <span class="rech-loupe" id="rech-ouvrir" role="button" tabindex="0" aria-label="Rechercher">${SVG_LOUPE}<span class="ll-mob">Rechercher</span></span>
      <span class="rech-loupe auth-icone" id="auth-ouvrir" role="button" tabindex="0" aria-label="Compte">${SVG_COMPTE}<span class="ll-mob">Compte</span></span>
    </nav>
  </div>
</header>`;
}
function piedCanon() {
  return `<footer>
  <div class="marque">Lumen</div>
  <div class="verset-pied">${VERSET_PIED}</div>
  <div class="copy" id="annee"></div>
</footer>`;
}

/* Câblage canonique de la barre : le menu déroulant, l'année du pied et le
   lien actif. Injecté tel quel sur les quatre surfaces. */
const BARRE_JS = `(function(){
  var b=document.getElementById('burger'),m=document.getElementById('menu');
  if(b&&m){b.addEventListener('click',function(){m.classList.toggle('ouvert');});}
  var an=document.getElementById('annee');
  if(an)an.textContent='\u00a9 '+new Date().getFullYear()+' Lumen';
  var p=location.pathname.replace(/index\\.html$/,'')||'/';
  Array.prototype.forEach.call(document.querySelectorAll('nav.menu a'),function(a){
    var h=(a.getAttribute('href')||'').replace(/index\\.html$/,'');
    if(h===p)a.classList.add('actif');
  });
})();`;

const EXTRA_CSS = `${BARRE_CSS}
@keyframes lvVoile{from{opacity:0}to{opacity:1}}
@keyframes lvRise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.rech-overlay{animation:lvVoile .25s ease both}
.rech-boite{animation:lvRise .4s ease both}
.auth-overlay{animation:lvVoile .25s ease both}
.auth-modal{animation:lvRise .4s ease both}
@page{margin:0}
@media print{
  body{padding:15mm 17mm}
  header,.haut-page{display:none!important}
}

:focus-visible{outline:1px solid var(--or,#efe6cf);outline-offset:3px}

html{scroll-behavior:smooth}
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
::selection{background:var(--sel,rgba(239,230,207,.5));color:var(--encre,#000)}
h1,h2,h3{text-wrap:balance}
*{scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.55) transparent}
::-webkit-scrollbar{width:10px;height:10px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,.55);background-clip:content-box;border:3px solid transparent;border-radius:99px}
::-webkit-scrollbar-thumb:hover{background:rgba(231,224,207,.6);background-clip:content-box;border:3px solid transparent}
:focus-visible{outline:1px solid rgba(231,224,207,.28);outline-offset:3px}

/* — Titre de page réservé aux moteurs et aux lecteurs d'écran — */
.titre-cache{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
`;

function header(lang, type, base, otherRel, ctx) {
  const u = UI[lang];
  const home = base === '' ? './' : base;
  return `${barreCanon()}
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

function footer() {
  return piedCanon();
}

const MEMO_JS = `(function lvMemoBoot(){
  var box=document.getElementById('memo-scores'); if(!box)return;
  if(typeof firebase==='undefined'){document.addEventListener('lv-fb-ready',lvMemoBoot,{once:true});return;}
  var cfg={apiKey:"AIzaSyC19lFNWUd-KYhCP4o7gpp0IcyfRTyHOyA",authDomain:"lumen-veritatis.firebaseapp.com",projectId:"lumen-veritatis",storageBucket:"lumen-veritatis.firebasestorage.app",messagingSenderId:"195902823875",appId:"1:195902823875:web:a8be1f216a5ae1d945f176"};
  if(!firebase.apps.length)firebase.initializeApp(cfg);
  var auth=firebase.auth(), db=firebase.firestore();
  var FR=!(window.LUMEN&&window.LUMEN.lang==='en');
  var L={out:FR?'Connectez-vous pour suivre votre progression.':'Sign in to track your progress.',empty:FR?'Commencez par mémoriser vos premiers versets.':'Start memorising your first verses.'};
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

const RECH_JS = `(function(){
  var ouvrir=document.getElementById('rech-ouvrir'),overlay=document.getElementById('rech-overlay'),
      champ=document.getElementById('rech-champ'),res=document.getElementById('rech-res'),fermer=document.getElementById('rech-fermer');
  if(!ouvrir||!overlay) return;
  var L=window.LUMEN||{base:'',lang:'fr',hint:'',empty:''};
  var charge=false,enCours=false;
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
  var kidx=-1;
  function kitems(){return res.querySelectorAll('.rech-item');}
  function kmaj(){var its=kitems();for(var i=0;i<its.length;i++)its[i].classList.toggle('kact',i===kidx);if(kidx>=0&&its[kidx]&&its[kidx].scrollIntoView)its[kidx].scrollIntoView({block:'nearest'});}
  function chercher(q){
    kidx=-1;
    if(!String(q||'').trim()){res.innerHTML='<div class="rech-msg">'+L.hint+'</div>';return;}
    var bib=brefItem(q);
    res.innerHTML=bib||('<div class="rech-msg">'+L.empty+' « '+q+' ».</div>');
  }
  function prep(){charge=true;}
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
${footer()}
<script>
window.LUMEN={base:${JSON.stringify(base)},lang:${JSON.stringify(lang)},hint:${JSON.stringify(u.search_hint)},empty:${JSON.stringify(u.search_empty)}};
</script>
<script src="/lumen-app.js?v=${APP_V}"></script>${extraJS ? `
<script>${extraJS}</script>` : ''}
</body>
</html>`;
}

/* ---- vues ---- */
function mainAccueil(lang, base) {
  const u = UI[lang];
  return `<div class="vue">
    <h1 class="titre-cache">Lumen Veritatis</h1>
    <section class="hero">
      <div class="croix" aria-hidden="true"></div>
    </section>
    <div class="titre-section">
      <span class="num">${u.bible_label}</span>
      <h2>${u.bible_title}</h2>
      <span class="trait"></span>
    </div>
    <div class="memo-bloc">
      <a class="memo-start" href="/bible.html">${u.bible_open}</a>
    </div>
    <div class="titre-section">
      <span class="num">${u.memo_label}</span>
      <h2>${u.memo_title}</h2>
      <span class="trait"></span>
    </div>
    <div class="memo-bloc">
      <div class="memo-droite" id="memo-scores" data-state="load">
        <div class="memo-pct"><span id="memo-pct"></span><i>${u.memo_mastery}</i></div>
        <div class="memo-bar" id="memo-bar"><i class="r"></i><i class="a"></i><i class="v"></i></div>
        <div class="memo-leg"><span><b id="memo-v"></b> <span>${u.memo_acquired}</span></span><span><b id="memo-a"></b> <span>${u.memo_learning}</span></span><span><b id="memo-r"></b> <span>${u.memo_review}</span></span></div>
        <p class="memo-note" id="memo-note">${u.memo_signedout}</p>
      </div>
      <a class="memo-start" href="/memoriser.html?demarrer=1">${u.memo_start}</a>
    </div>
    <div class="titre-section">
      <span class="num">${u.art_label}</span>
      <h2>${u.art_title}</h2>
      <span class="trait"></span>
    </div>
    <div class="memo-bloc">
      <a class="memo-start" href="/articles.html">${u.art_open}</a>
    </div>
    <div style="height:60px"></div>
  </div>`;
}

function main404() {
  return `<style>
    .quatre{text-align:center;padding:88px 24px 120px;max-width:640px;margin:0 auto}
    .quatre .croix{opacity:.55;width:58px;height:106px;margin-bottom:46px}
    .quatre h1{font-family:'Cormorant Garamond',serif;font-weight:400;font-size:46px;letter-spacing:.02em;color:var(--parchemin);margin:0 0 26px}
    .quatre .q-desc{font-size:16px;line-height:1.75;color:rgba(255,255,255,.6);margin:0 auto 44px;max-width:520px}
    .q-lien{font-family:'Cormorant Garamond',serif;font-size:12.5px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.6);text-decoration:none;padding-bottom:3px;border-bottom:1px solid transparent;transition:color .3s,border-color .3s}
    .q-lien:hover{color:#fff;border-color:var(--or)}
    @media(max-width:720px){.quatre{padding-top:56px}.quatre h1{font-size:36px}}
  </style>
  <div class="vue"><section class="quatre">
    <div class="croix" aria-hidden="true"></div>
    <h1>Page introuvable</h1>
    <p class="q-desc">Cette page n\u2019existe pas.</p>
    <a href="/" class="q-lien">Revenir à l\u2019accueil</a>
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


const UX_JS = `
(function(){
  var FR=!(window.LUMEN&&window.LUMEN.lang==='en');
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
const APP_JS = [BARRE_JS, RECH_JS, AUTH_JS, MEMO_JS, UX_JS].join('\n');
const APP_V = crypto.createHash('md5').update(APP_JS).digest('hex').slice(0, 8);
const PAN_V = fs.existsSync('bible-panneau.js') ? crypto.createHash('md5').update(fs.readFileSync('bible-panneau.js')).digest('hex').slice(0, 8) : '1';
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(`${OUT}/lumen-app.js`, APP_JS);
console.log(`Communs : lumen-app.js (${Math.round(APP_JS.length / 1024)} Ko, v=${APP_V})`);

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

// 404 (racine, bilingue) — sans paire ni hreflang
ecrire('404.html', page({
  lang: 'fr', type: '', title: UI.fr.t_404, description: UI.fr.notfound_text,
  frPath: '/404.html', enPath: '/404.html', base: '/', otherRel: '/en/',
  main: main404()
}));

// sitemap bilingue avec alternates
/* Le sitemap liste toutes les surfaces publiques. Auparavant il ne portait que
   l'accueil, parce que « pairs » ne contient que les pages passées par
   genPaire ; la Bible, Mémoriser et les Articles en étaient absents. */
/* on regarde les fichiers SOURCE : à ce moment du build, les pages ne sont pas
   encore copiées dans le dossier de sortie */
const CHEMINS_PUBLICS = ['bible.html', 'memoriser.html', 'articles.html']
  .filter(f => fs.existsSync(f)).map(f => '/' + f);
const sm = pairs.map(p => p.fr).concat(CHEMINS_PUBLICS).map(u => {
  return `  <url>
    <loc>${DOMAINE}${u}</loc>
  </url>`;
}).join('\n');
ecrire('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sm}
</urlset>`);

// robots.txt
ecrire('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${DOMAINE}/sitemap.xml\n`);

// l'ancien contenu (bibliothèque et articles) retombe sur l'accueil, en 301
ecrire('_redirects', ['/bibliotheque/*  /  301', '/article/*  /  301', '/a-propos/*  /  301', '/en/*  /  301'].join('\n') + '\n');

// table des livres bibliques pour la recherche de références (Jean 3:16)
const tableBible = (src, base) => {
  try {
    const b = JSON.parse(fs.readFileSync(src, 'utf8'));
    return { base, livres: b.livres.map(l => [l.nom, l.slug, l.nch]) };
  } catch (e) { return null; }
};
const bibFR = tableBible('content/bible.json', '/bible.html');
ecrire('recherche-fr.js', bibFR ? 'window.LUMEN_BIBLE=' + JSON.stringify(bibFR) + ';' : '');

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
    mh = mh.replace(hOld[0], barreCanon());
    mh = mh.replace(fOld[0], piedCanon());
    mh = mh.replace('</head>', '<style>' + BARRE_CSS + '</style></head>');
    mh = mh.replace('</body>', '<script>' + BARRE_JS + '</scr' + 'ipt></body>');
    console.log('Mémoriser : barre et pied canoniques injectés');
  }
  mh = mh.replace('</body>', '<script src="/bible-panneau.js?v=' + PAN_V + '" defer><' + '/script></body>');
  fs.writeFileSync(`${OUT}/memoriser.html`, mh);
  console.log('Copié : memoriser.html');
}

// ── Articles : la page d'écriture et de lecture, même traitement que les autres ──
if (fs.existsSync('articles.html')) {
  let ah = fs.readFileSync('articles.html', 'utf8');
  if (APPEARANCE_CSS && ah.indexOf('</head>') >= 0) {
    ah = ah.replace('</head>', '<style>' + APPEARANCE_CSS + '</style></head>');
  }
  {
    const hOld = ah.match(/<header>[\s\S]*?<\/header>/);
    const fOld = ah.match(/<footer[^>]*>[\s\S]*?<\/footer>/);
    if (!hOld || !fOld) throw new Error('articles.html : header ou footer introuvable');
    ah = ah.replace(hOld[0], barreCanon());
    ah = ah.replace(fOld[0], piedCanon());
    ah = ah.replace('</head>', '<style>' + BARRE_CSS + '</style></head>');
    ah = ah.replace('</body>', '<script>' + BARRE_JS + '</scr' + 'ipt></body>');
    console.log('Articles : barre et pied canoniques injectés');
  }
  ah = ah.replace('</body>', '<script src="/bible-panneau.js?v=' + PAN_V + '" defer><' + '/script></body>');
  fs.writeFileSync(`${OUT}/articles.html`, ah);
  console.log('Copié : articles.html');
}

// ── La Sainte Bible (traduction Chérubin) : page de lecture + données par livre ──
if (fs.existsSync('bible.html')) {
  let bh = fs.readFileSync('bible.html', 'utf8');
  if (APPEARANCE_CSS && bh.indexOf('</head>') >= 0) {
    bh = bh.replace('</head>', '<style>' + APPEARANCE_CSS + '</style></head>');
  }
  {
    const hOld = bh.match(/<header>[\s\S]*?<\/header>/);
    const fOld = bh.match(/<footer[^>]*>[\s\S]*?<\/footer>/);
    if (!hOld || !fOld) throw new Error('bible.html : header ou footer introuvable');
    bh = bh.replace(hOld[0], barreCanon());
    bh = bh.replace(fOld[0], piedCanon());
    bh = bh.replace('</head>', '<style>' + BARRE_CSS + '</style></head>');
    bh = bh.replace('</body>', '<script>' + BARRE_JS + '</scr' + 'ipt></body>');
    console.log('Bible : barre et pied canoniques injectés');
  }
  fs.writeFileSync(`${OUT}/bible.html`, bh);
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

/* ════════ MISE EN PAGE POÉTIQUE ════════
   Une Bible imprimée ne coule pas les psaumes et les proverbes en un seul
   pavé : chaque verset y tient sa ligne, et la seconde moitié du verset,
   celle qui répond à la première, est mise en retrait. C'est le balancement
   de la poésie hébraïque, et c'est ce qui rend ces livres lisibles.
   Ici, la décision est prise À LA FABRICATION : le texte source n'est jamais
   modifié, on lui ajoute seulement deux indications par verset :
     p = 1        ce verset se lit en vers, donc en bloc à lui seul
     c = [i, …]   les endroits où couper : chaque i est l'indice de l'ESPACE
                  qui termine une ligne. L'espace reste dans la ligne qu'il
                  termine, si bien que la suite des caractères affichés est
                  rigoureusement celle du verset : les surlignages de
                  fragments, qui travaillent sur des positions, ne bougent pas.
   Ne jamais transformer c en un tableau de textes déjà découpés : ce sont les
   positions qui garantissent que rien ne se décale. */

/* Qui est en vers. true = le livre entier. Sinon une liste d'étendues
   [chapitre de départ, verset, chapitre d'arrivée, verset]. POESIE_SAUF
   retire des étendues d'un livre déclaré entièrement poétique : ce sont les
   pages de récit enchâssées dans un livre de poèmes. */
const POESIE = {
  /* Les livres poétiques et sapientiaux */
  'psaumes': true,
  'proverbes': true,
  'cantique-des-cantiques': true,
  'ecclesiaste': true,
  'sagesse': true,
  'ecclesiastique': true,                      // le Siracide
  'job': [[3, 1, 42, 6]],                      // le prologue et l'épilogue sont un récit

  /* Les poèmes enchâssés dans les livres du récit */
  'genese': [[3, 14, 3, 19], [4, 23, 4, 24], [9, 25, 9, 27], [25, 23, 25, 23],
             [27, 27, 27, 29], [27, 39, 27, 40], [49, 2, 49, 27]],  // sentence d'Éden, chant de Lamek, bénédictions
  'exode': [[15, 1, 15, 18], [15, 21, 15, 21]],                  // cantique de Moïse, chant de Miryam
  'nombres': [[6, 24, 6, 26], [10, 35, 10, 36], [21, 17, 21, 18], [21, 27, 21, 30],
              [23, 7, 23, 10], [23, 18, 23, 24], [24, 3, 24, 9], [24, 15, 24, 24]],  // bénédiction sacerdotale, oracles de Balaam
  'deuteronome': [[32, 1, 32, 43], [33, 2, 33, 29]],             // cantique et bénédictions
  'josue': [[10, 12, 10, 13]],
  'juges': [[5, 2, 5, 31], [14, 18, 14, 18], [15, 16, 15, 16]],  // cantique de Débora, devinettes de Samson
  'ruth': [[1, 16, 1, 17]],                                      // « où tu iras j'irai »
  '1-samuel': [[2, 1, 2, 10], [15, 22, 15, 23]],                 // cantique d'Anne
  '2-samuel': [[1, 19, 1, 27], [22, 2, 22, 51], [23, 1, 23, 7]], // élégie sur Saül, psaume de David
  '1-rois': [[8, 12, 8, 13], [12, 16, 12, 16]],
  '2-rois': [[19, 21, 19, 34]],                                  // l'oracle d'Isaïe sur Sennachérib
  '1-chroniques': [[16, 8, 16, 36]],
  'tobie': [[13, 1, 13, 18]],
  'judith': [[16, 1, 16, 17]],
  /* Le premier livre des Maccabées est un récit, mais il s'interrompt cinq
     fois pour chanter : deux complaintes sur Jérusalem, la lamentation de
     Mattathias, l'éloge de Judas et celui de Simon. */
  '1-maccabees': [[1, 25, 1, 28], [1, 36, 1, 40], [2, 7, 2, 13], [3, 3, 3, 9],
                  [3, 45, 3, 45], [14, 4, 14, 15]],

  /* Les prophètes : oracles en vers, récits en prose */
  'isaie': true,
  'jeremie': [[2, 1, 6, 30], [8, 4, 10, 25], [12, 1, 13, 27], [14, 1, 15, 21], [17, 1, 17, 18],
              [18, 13, 18, 17], [20, 7, 20, 18], [22, 6, 23, 40], [25, 30, 25, 38],
              [30, 1, 31, 40], [46, 1, 51, 58]],
  'lamentations': true,
  'baruch': [[3, 9, 5, 9]],
  'ezechiel': [[19, 1, 19, 14], [26, 17, 26, 18], [27, 3, 27, 36], [28, 12, 28, 19],
               [30, 2, 30, 19], [31, 2, 31, 18], [32, 2, 32, 32]],
  'daniel': [[2, 20, 2, 23], [3, 52, 3, 90], [4, 31, 4, 32], [6, 27, 6, 28],
             [7, 9, 7, 10], [7, 13, 7, 14]],                     // cantique des trois jeunes gens, visions
  'osee': [[2, 1, 2, 25], [4, 1, 14, 10]],
  'joel': true,
  'amos': true,
  'abdias': true,
  'jonas': [[2, 3, 2, 10]],                                      // le psaume dans le poisson
  'michee': true,
  'nahum': true,
  'habacuc': true,
  'sophonie': true,
  'zacharie': [[9, 1, 11, 3], [13, 7, 13, 9]],

  /* Le Nouveau Testament : béatitudes, cantiques et hymnes */
  'matthieu': [[5, 3, 5, 12]],
  'luc': [[1, 46, 1, 55], [1, 68, 1, 79], [2, 14, 2, 14], [2, 29, 2, 32]],  // Magnificat, Benedictus, Gloria, Nunc dimittis
  'jean': [[1, 1, 1, 18]],                                       // le prologue
  'romains': [[11, 33, 11, 36]],
  '1-corinthiens': [[13, 1, 13, 13]],                            // l'hymne à la charité
  'philippiens': [[2, 6, 2, 11]],
  'colossiens': [[1, 15, 1, 20]],
  'ephesiens': [[1, 3, 1, 14]],                                  // la bénédiction inaugurale
  '1-pierre': [[2, 21, 2, 25]],                                  // le serviteur souffrant
  '1-timothee': [[3, 16, 3, 16]],
  '2-timothee': [[2, 11, 2, 13]],
  'apocalypse': [[4, 11, 4, 11], [5, 9, 5, 13], [7, 15, 7, 17], [11, 17, 11, 18],
                 [12, 10, 12, 12], [15, 3, 15, 4], [19, 1, 19, 8]]
};
const POESIE_SAUF = {
  /* Isaïe : les chapitres de récit autour d'Ézéchias, et le cantique qu'ils
     enferment reste, lui, en vers (38, 9-20). */
  'isaie': [[7, 1, 7, 9], [20, 1, 20, 6], [36, 1, 38, 8], [38, 21, 39, 8]],
  'amos': [[7, 10, 7, 17]]                                       // Amos devant Amasias
};

/* ── DEUX RÉGIMES DE POÉSIE, ET ILS NE SE LISENT PAS PAREIL ──
   Une SENTENCE est un dicton qui se suffit à lui-même : le proverbe d'à côté
   ne le continue pas, il en dit un autre. Chacun doit donc être posé seul,
   entouré d'air, comme une perle sur un fil.
   Un POÈME SUIVI est tout le contraire : les versets s'enchaînent, un psaume
   ou un oracle est UNE seule coulée. Les espacer largement le hacherait en
   morceaux qui n'existent pas. Ses lignes se serrent, et l'air ne revient
   qu'aux titres de section, qui marquent les vraies articulations.
   Tout ce qui n'est pas listé ici est un poème suivi. */
const SENTENCES = {
  /* Les deux grands recueils de dictons de Salomon. Les chapitres 1 à 9 en
     sont exclus : ce sont des discours suivis, pas des dictons. De même
     30 (les nombres d'Agour) et 31 (la femme vaillante, acrostiche). */
  'proverbes': [[10, 1, 22, 16], [25, 1, 29, 27]],
  /* Le Siracide est un livre de sentences, sauf ses grands poèmes : l'éloge
     de la Sagesse, celui de la création, celui des Pères, et la prière
     finale. */
  'ecclesiastique': [[1, 1, 23, 27], [25, 1, 42, 14]]
};
function estSentence(slug, ch, v) {
  const t = SENTENCES[slug];
  return !!t && t.some(e => dansEtendue(e, ch, v));
}

const dansEtendue = (et, ch, v) => {
  const [c1, v1, c2, v2] = et;
  if (ch < c1 || ch > c2) return false;
  if (ch === c1 && v < v1) return false;
  if (ch === c2 && v > v2) return false;
  return true;
};
function estPoetique(slug, ch, v) {
  const p = POESIE[slug];
  if (!p) return false;
  const sauf = POESIE_SAUF[slug];
  if (sauf && sauf.some(e => dansEtendue(e, ch, v))) return false;
  if (p === true) return true;
  return p.some(e => dansEtendue(e, ch, v));
}

/* Où couper. On préfère la ponctuation la plus forte, et parmi elles celle
   qui tombe le plus près du milieu : c'est presque toujours la charnière du
   verset. Aucune ligne ne descend sous vingt-quatre caractères, pour ne pas
   laisser un lambeau tout seul. */
const POIDS = { ';': 3, ':': 2.5, '!': 2.2, '?': 2.2, '.': 2, ',': 1 };
function coupesVerset(t) {
  const n = t.length;
  if (n < 70) return null;
  const cand = [];
  const re = /[;:!?.,]\s/g;
  let m;
  while ((m = re.exec(t))) {
    const k = m.index + 1;                       // l'indice de l'espace
    if (k > 0 && k < n - 1) cand.push([k, POIDS[t[m.index]]]);
  }
  if (!cand.length) return null;
  const choisit = (a, b) => {
    const L = b - a;
    if (L < 70) return null;
    const ok = cand.filter(([k]) => k >= a + 24 && k <= b - 24);
    if (!ok.length) return null;
    const wmax = Math.max(...ok.map(x => x[1]));
    const forts = ok.filter(x => x[1] === wmax);
    let best = forts[0], d = Infinity;
    for (const f of forts) {
      const e = Math.abs((f[0] - a) / L - 0.5);
      if (e < d) { d = e; best = f; }
    }
    return best[0];
  };
  const c1 = choisit(0, n);
  if (c1 === null) return null;
  const out = [c1];
  /* une troisième ligne quand une moitié reste trop longue pour l'œil */
  for (const [a, b] of [[0, c1 + 1], [c1 + 1, n]]) {
    if (b - a > 92) { const k = choisit(a, b); if (k !== null) out.push(k); }
  }
  return out.sort((x, y) => x - y);
}
/* ── LES PARAGRAPHES DE LA PROSE ──
   Un chapitre de récit coulé d'un seul tenant est une muraille. On le
   respire en paragraphes, sans jamais rien affirmer sur le sens : la coupure
   ne tombe QU'APRÈS UNE PHRASE ACHEVÉE, et seulement quand le paragraphe a
   déjà de quoi tenir debout. Un verset qui ouvre un paragraphe porte br = 1.
   Un titre de section ouvre toujours un paragraphe, c'est le lecteur qui le
   voit, pas la donnée. */
/* Les paragraphes de prose : adoptés par Emmanuel le 26/08 après l'exemple
   de Genèse 1. L'interrupteur reste, il n'est plus qu'un témoin. */
const PARAGRAPHES = true;
const FIN_PHRASE = /[.!?…][»"'\u2019\u201d\)\]]*\s*$/;
function poseParagraphes(ch) {
  if (!PARAGRAPHES) return 0;
  let nb = 0, depuis = 0, signes = 0;
  const t = ch.titres ? ch.titres.reduce((m, x) => (x && x.titre && (m[x.v] = 1), m), {}) : {};
  for (const v of ch.versets) {
    if (v.p) { depuis = 0; signes = 0; continue; }   // les vers ne se groupent pas
    if (t[v.v]) { depuis = 0; signes = 0; }          // un titre ouvre déjà un paragraphe
    depuis++; signes += v.t.length;
    const acheve = FIN_PHRASE.test(v.t);
    const assez = depuis >= 3 && signes >= 420;
    const trop = depuis >= 7 || signes >= 900;
    if (acheve && (assez || trop)) { v.fin = 1; depuis = 0; signes = 0; nb++; }
  }
  /* fin = 1 marque le DERNIER verset d'un paragraphe : c'est plus sûr que de
     marquer le premier, car le rendu ferme alors le paragraphe et en rouvre
     un seulement s'il reste quelque chose. */
  return nb;
}
function posePoesie(livre) {
  let nb = 0;
  for (const ch of livre.chapitres) {
    if (POESIE[livre.slug]) {
      for (const v of ch.versets) {
        if (!estPoetique(livre.slug, ch.n, v.v)) continue;
        v.p = 1; nb++;
        if (estSentence(livre.slug, ch.n, v.v)) v.s = 1;
        const c = coupesVerset(v.t);
        if (c) v.c = c;
      }
    }
    poseParagraphes(ch);
  }
  return nb;
}

  // par livre + un index : FR (Crampon) → /bible-data/, EN (Douay-Rheims) → /bible-data-en/.
  const decoupeBible = (src, dossier) => {
    if (!fs.existsSync(src)) return false;
    fs.mkdirSync(`${OUT}/${dossier}`, { recursive: true });
    const bible = JSON.parse(fs.readFileSync(src, 'utf8'));
    fs.writeFileSync(`${OUT}/${dossier}/index.json`, JSON.stringify({ livres: bible.livres, groupes: bible.groupes }));
    let nb = 0;
    let poe = 0;
    for (const livre of bible.data) {
      poe += posePoesie(livre);
      fs.writeFileSync(`${OUT}/${dossier}/${livre.slug}.json`, JSON.stringify(livre));
      nb++;
    }
    console.log('Bible (' + dossier + ') : ' + nb + ' livres + index, ' + poe + ' versets en vers');
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


/* Garde-fou : la barre et le pied doivent être rigoureusement identiques
   sur les quatre surfaces. Le build échoue si l'un d'eux dérive. */
{
  const surfaces = ['index.html', 'bible.html', 'memoriser.html', 'articles.html', '404.html'];
  const ref = { h: null, f: null };
  let vues = 0;
  for (const f of surfaces) {
    const p = `${OUT}/${f}`;
    if (!fs.existsSync(p)) continue;
    vues++;
    const t = fs.readFileSync(p, 'utf8');
    const h = (t.match(/<header>[\s\S]*?<\/header>/) || [''])[0];
    const pied = (t.match(/<footer[^>]*>[\s\S]*?<\/footer>/) || [''])[0];
    if (ref.h === null) { ref.h = h; ref.f = pied; ref.nom = f; continue; }
    if (h !== ref.h) throw new Error('Barre du haut différente entre ' + ref.nom + ' et ' + f);
    if (pied !== ref.f) throw new Error('Barre du bas différente entre ' + ref.nom + ' et ' + f);
  }
  /* on annonce le nombre de surfaces RÉELLEMENT comparées : une page absente
     passerait sinon le garde-fou en silence */
  if (vues < surfaces.length) console.warn('⚠ Barres : ' + (surfaces.length - vues) + ' surface(s) absente(s) du dossier de sortie');
  console.log('Barres : identiques sur les ' + vues + ' surfaces');
}

console.log('Site bilingue généré dans «', OUT, '»');
console.log('Pages générées :', pairs.length, '(FR) + 404 + sitemap + robots');

/* ============================================================
   LUMEN : fabrication du site
   Fabrique l'accueil et la page 404 (leur CSS de base vient de
   pages/accueil.html), complète les autres pages (Bible, Mémoriser,
   Articles, Ressources, Commentaires) avec la barre, le pied et
   l'habillage communs, découpe les deux Bibles par livre, puis passe la
   main à publication.js.
   ============================================================ */
const fs = require('fs');
const path = require('path');

/* ── LES DOSSIERS DU DÉPÔT ──
   Ce fichier vit dans fabrication/ et travaille depuis la racine du dépôt,
   où il trouve pages/ (les pages), habillage/ (l'apparence), commun/ (le
   fonctionnement partagé), contenu/ (les Bibles et les réglages) et racine/
   (les fichiers servis tels quels à la racine du site). Le site fabriqué
   sort dans site/. */
process.chdir(path.join(__dirname, '..'));
const PAGES = 'pages/', RACINE = 'racine/', CONTENU = 'contenu/';

/* La page d'accueil est pages/accueil.html ; l'ancien nom de brouillon
   reste reconnu. */
const SRC = process.argv[2] || ['accueil.html', 'index__48_.html'].map(f => PAGES + f).find(f => fs.existsSync(f)) || PAGES + 'accueil.html';
const OUT = process.argv[3] || 'site';
const src = fs.readFileSync(SRC, 'utf8');
const css = src.slice(src.indexOf('<style>') + 7, src.indexOf('</style>')).replace(/—/g, '-');

/* ── FEUILLE COMMUNE ──
   lumen-commun.css est posée dans chaque page, après la feuille propre de la
   page et avant la couleur d'accent : ce qu'elle dit vaut partout à la fois. */
let COMMUN_CSS = '';
try { COMMUN_CSS = fs.readFileSync('habillage/lumen-commun.css', 'utf8'); } catch (e) { console.warn('lumen-commun.css absente'); }
const COMMUN_TAG = COMMUN_CSS ? '<style id="lumen-commun">' + COMMUN_CSS + '</style>' : '';
/* ── L'HABILLAGE ──
   habillage/commun.css pour ce qui se retrouve sur chaque page (barre,
   navigation, fenêtres, boutons, cartes, champs, pied), puis une feuille par
   page. Il est posé en dernier dans chaque page : il a le dernier mot sur
   l'apparence. La couleur d'accent (--or) vient de contenu/settings.json ;
   l'habillage en tire ses nuances. */
function habillage(nomPage) {
  let css = '';
  for (const f of ['habillage/commun.css', `habillage/${nomPage}.css`]) {
    if (fs.existsSync(f)) css += fs.readFileSync(f, 'utf8') + '\n';
  }
  return css ? '<style id="habillage">' + css + '</style>' : '';
}
/* Les polices sont servies par le site lui-même et déclarées dans
   habillage/commun.css. Chaque page précharge les deux fichiers dont elle a
   besoin tout de suite (lecture et interface, alphabet latin), pour que le
   texte paraisse dans sa police dès le premier affichage ; les liens vers
   Google Fonts sont retirés. */
const POLICES_PRECHARGE = ['literata-latin-normal', 'eb-garamond-latin-normal']
  .map(f => `<link rel="preload" href="/polices/${f}.woff2" as="font" type="font/woff2" crossorigin>`).join('\n');
const polices = h => h.replace(/<link[^>]*fonts\.(?:googleapis|gstatic)\.com[^>]*>\n?/g, '').replace('</head>', POLICES_PRECHARGE + '\n</head>');
/* ── FONCTIONNEMENT COMMUN ──
   Les fonctions partagées vivent dans commun/, un fichier par famille.
   Chaque page reçoit, avant son propre script, exactement les familles dont
   elle se sert, posées dans la page elle-même et non en fichiers à part :
   Mémoriser fonctionne hors ligne, et rien de plus n'est à mettre en cache. */
/* La conversation avec l'IA (question, ia-outils, assemblage, versets)
   vit sur toutes les pages : l'icône de la barre du haut l'ouvre partout.
   Elle lit et crée des pages dans le coffre R2, d'où « stockage » avec elle. */
const CONVERSATION = ['stockage', 'versets', 'assemblage', 'ia-outils', 'question'];
const COMMUN_JS_PAGES = {
  'articles.html': ['outils', 'rubriques', 'ia', 'qualite', 'menage', ...CONVERSATION, 'coffre'],
  'ressources.html': ['outils', 'rubriques', 'ia', 'qualite', 'menage', ...CONVERSATION, 'coffre', 'cadre'],
  'etude.html': [...CONVERSATION, 'cadre'],
  'bible.html': CONVERSATION,
  'commentaires.html': ['outils', 'editeur', 'choix-verset', ...CONVERSATION],
  'memoriser.html': ['choix-verset', ...CONVERSATION],
  'index.html': CONVERSATION,
};
function communJS(page) {
  return (COMMUN_JS_PAGES[page] || []).map(nom => {
    const f = `commun/${nom}.js`;
    if (!fs.existsSync(f)) throw new Error(`${f} manquant : la page ${page} en a besoin`);
    return '<script data-commun="' + nom + '">' + fs.readFileSync(f, 'utf8') + '</scr' + 'ipt>';
  }).join('');
}
/* ── LE SAVOIR DE L'IA DU SITE ──
   Les skills d'artefact d'Emmanuel (ia/skills/) et ses instructions
   personnalisées (ia/instructions.md) sont les mêmes que dans Claude :
   l'IA du site contrôle et corrige une page avec la skill qui l'a faite.
   La fabrication les écrit dans un module que lit le serveur de l'IA
   (netlify/edge-functions/ia.js) ; Netlify assemble ce serveur après la
   fabrication, il prend donc toujours la version du dépôt. Seul le texte
   des SKILL.md part à l'IA : les moteurs restent dans le dépôt, pour que
   chaque skill y soit complète. */
{
  const savoir = { instructions: '', skills: {} };
  try { savoir.instructions = fs.readFileSync('ia/instructions.md', 'utf8'); } catch (e) { console.warn('⚠ ia/instructions.md absent'); }
  if (fs.existsSync('ia/skills')) {
    for (const nom of fs.readdirSync('ia/skills').sort()) {
      const f = `ia/skills/${nom}/SKILL.md`;
      if (fs.existsSync(f)) savoir.skills[nom] = fs.readFileSync(f, 'utf8');
    }
  }
  fs.mkdirSync('netlify/savoir', { recursive: true });
  fs.writeFileSync('netlify/savoir/savoir.js',
    '/* Fichier écrit par la fabrication (fabrication/build-bi.js) à partir de ia/ : ne pas le modifier à la main. */\n'
    + 'export const SAVOIR = ' + JSON.stringify(savoir) + ';\n');
  console.log("Savoir de l'IA : instructions + " + Object.keys(savoir.skills).length + ' skills (' + Object.keys(savoir.skills).join(', ') + ')');
}

/* La couleur d'accent (--or) se règle dans contenu/settings.json. */
let APPEARANCE_CSS = '';
if (fs.existsSync(CONTENU + 'settings.json')) {
  try {
    const st = JSON.parse(fs.readFileSync(CONTENU + 'settings.json', 'utf8'));
    const a = String(st.accent || '').trim();
    /* #efe6cf est la couleur d'accent par défaut des pages : la remettre n'est pas une personnalisation */
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(a) && a.toLowerCase() !== '#efe6cf') {
      APPEARANCE_CSS = `:root{--or:${a};--or-pale:color-mix(in srgb,${a} 55%,#fff)}`;
      console.log('Apparence : couleur d\'accent personnalisée', a);
    }
  } catch (e) { console.warn('settings.json illisible, accent par défaut'); }
}

/* ---- textes de l'interface ---- */
const UI = {
  fr: {
    html: 'fr',
    notfound_text: "Cette page n'existe pas.",
    site_desc_home: "La Sainte Bible en français et un outil pour apprendre les versets par cœur, à votre rythme.",
    t_home: 'Lumen · La Sainte Bible', t_404: 'Page introuvable · Lumen',
    search_placeholder: 'Rechercher…', search_empty: 'Aucune référence reconnue dans',
  }
};

/* ---- préchargement des polices ---- */
const FONTS = POLICES_PRECHARGE;

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

a:focus-visible,button:focus-visible,[role="button"]:focus-visible,[tabindex]:focus-visible,summary:focus-visible{outline:1px solid var(--or,#efe6cf);outline-offset:3px}
.ll-mob{display:none}
footer{border-top:1px solid rgba(231,224,207,.14);margin-top:40px;padding:48px 32px 56px;text-align:center;background:none}
footer .marque{font-family:'Cormorant Garamond',serif;letter-spacing:.34em;text-transform:uppercase;font-size:18px;padding-left:.34em;color:var(--parchemin,#ffffff)}
footer .verset-pied{margin-top:18px;font-style:italic;color:rgba(255,255,255,.55);font-size:17px;max-width:640px;margin-left:auto;margin-right:auto;line-height:1.7}
footer .verset-pied .ref-pied{font-style:normal;font-weight:600;color:rgba(255,255,255,.55)}
footer .copy{margin-top:22px;font-size:13px;letter-spacing:.08em;color:rgba(255,255,255,.45);font-family:'Cormorant Garamond',serif}
@media(max-width:720px){
  /* une fenêtre sans champ à remplir (information, confirmation) se centre ;
     un formulaire reste en haut, où le clavier ne le recouvre pas */
  .overlay:not(:has(input,textarea,select))>.modal{margin-top:auto;margin-bottom:auto}
}

/* ── BARRE D'ONGLETS DU TÉLÉPHONE ──
   --lv-bas porte sa hauteur : les pages y calent ce qui se pose au bas de
   l'écran (barre de sélection de la Bible, bouton « haut de page »). Barre
   du haut rangée, celle du bas se range avec elle : l'écran entier revient
   à la lecture. */
:root{--lv-bas:0px}
.nav-bas{display:none}
@media(max-width:720px){
  :root{--lv-bas:calc(58px + env(safe-area-inset-bottom,0px))}
  html.barre-rangee,html.panneau{--lv-bas:0px}
  html.panneau .nav-bas{display:none!important}
  body{padding-bottom:var(--lv-bas)}
  .nav-bas{display:grid;grid-template-columns:repeat(6,1fr);position:fixed;left:0;right:0;bottom:0;z-index:55;height:var(--lv-bas);padding-bottom:env(safe-area-inset-bottom,0px);background:#000;border-top:1px solid rgba(231,224,207,.14)}
  html.barre-rangee .nav-bas{display:none}
  .nav-bas a{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-width:0;color:rgba(255,255,255,.62);text-decoration:none;font-family:'EB Garamond',Georgia,serif;font-size:12.5px;letter-spacing:.02em;line-height:1;transition:color .25s;-webkit-tap-highlight-color:transparent;position:relative}
  .nav-bas a svg{width:22px;height:22px;display:block}
  .nav-bas a.actif{color:var(--or,#efe6cf)}
  .nav-bas a.actif::before{content:'';position:absolute;top:-1px;left:22%;right:22%;height:1px;background:var(--or,#efe6cf)}
  /* l'onglet Bible à gauche reste sur téléphone : il ouvre la Bible
     par-dessus la page, sans quitter ce qu'on lit (Emmanuel) ; son réglage
     reste dans « Mon compte » */
}
`;
/* L'état de la barre est lu avant le premier affichage : sinon la barre
   apparaîtrait le temps d'une image, puis la page sauterait en la repliant.
   Sur l'accueil, la barre s'ouvre toujours dépliée (choix d'Emmanuel) : la
   préférence « rangée » vaut pour les autres pages, et l'accueil la laisse
   intacte. */
const BARRE_TETE = `<script>try{var ac=/^\\/(index\\.html)?$/.test(location.pathname);if(!ac&&localStorage.getItem('lv_barre')==='1')document.documentElement.classList.add('barre-rangee');}catch(e){}</scr`+`ipt>`;
const SVG_LOUPE = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="10" cy="10" r="6.5"/><line x1="15" y1="15" x2="21" y2="21" stroke-linecap="round"/></svg>';
const SVG_IA = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z"/><path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/></svg>';
const SVG_COMPTE = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="3.4"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0" stroke-linecap="round"/></svg>';
const NAV_LIENS = [['/', 'Accueil'], ['/bible.html', 'Bible'], ['/memoriser.html', 'Mémoriser'],
                   ['/articles.html', 'Articles'], ['/ressources.html', 'Ressources'], ['/etude.html', 'Étude']];
/* Les icônes de la barre du bas : un trait fin, comme la loupe et le compte. */
const SVGB = d => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
const NAV_BAS = [
  ['/', 'Accueil', SVGB('<path d="M12 3v18M7.5 8.5h9"/>')],
  ['/bible.html', 'Bible', SVGB('<path d="M12 6.5C10 5 7 4.6 4 5v13c3-.4 6 0 8 1.5 2-1.5 5-1.9 8-1.5V5c-3-.4-6 0-8 1.5z"/><path d="M12 6.5V19"/>')],
  ['/memoriser.html', 'Mémoriser', SVGB('<rect x="4.5" y="7.5" width="11.5" height="13" rx=".5"/><path d="M8 4.5h11.5v13"/>')],
  ['/articles.html', 'Articles', SVGB('<path d="M6.5 3.5h8l3 3v14h-11z"/><path d="M9.5 11h5M9.5 14.5h5M9.5 7.5h2.5"/>')],
  ['/ressources.html', 'Ressources', SVGB('<rect x="4.5" y="4.5" width="6.2" height="6.2"/><rect x="13.3" y="4.5" width="6.2" height="6.2"/><rect x="4.5" y="13.3" width="6.2" height="6.2"/><rect x="13.3" y="13.3" width="6.2" height="6.2"/>')],
  ['/etude.html', 'Étude', SVGB('<circle cx="5" cy="18.8" r="2.1"/><path d="M7.1 18.8h7.4a3.2 3.2 0 0 0 0-6.4h-5a3.2 3.2 0 0 1 0-6.4h6"/><path d="M16.5 3.2v5.6M16.5 3.2h4.3l-1.2 1.4 1.2 1.4h-4.3"/>')]
];
const VERSET_PIED = '« Le peuple qui marchait dans les ténèbres a vu une grande lumière ; sur ceux qui habitaient le pays de l\u2019ombre de la mort, une lumière a resplendi » <span class="ref-pied">Isaïe 9:1</span>';

/* Une seule barre, un seul pied, sans argument, donc sans dérive possible :
   mêmes balises, mêmes identifiants, mêmes libellés sur toutes les pages.
   Chaque page branche ses propres ouvertures sur les identifiants gelés
   « rech-ouvrir » et « auth-ouvrir ». */
function barreCanon() {
  return `<header>
  <div class="barre">
    <a href="/" class="logo">Lumen</a>
    <nav class="menu" id="menu">
      ${NAV_LIENS.map(l => `<a href="${l[0]}">${l[1]}</a>`).join('\n      ')}
      <span class="rech-loupe" id="rech-ouvrir" role="button" tabindex="0" aria-label="Rechercher" title="Rechercher">${SVG_LOUPE}<span class="ll-mob">Rechercher</span></span>
      <span class="rech-loupe ia-icone" id="ia-ouvrir" role="button" tabindex="0" aria-label="Parler avec l’IA" title="IA">${SVG_IA}<span class="ll-mob">IA</span></span>
      <span class="rech-loupe auth-icone" id="auth-ouvrir" role="button" tabindex="0" aria-label="Compte" title="Mon compte">${SVG_COMPTE}<span class="ll-mob">Compte</span></span>
    </nav>
  </div>
</header>
<nav class="nav-bas" id="nav-bas" aria-label="Navigation">
  ${NAV_BAS.map(l => `<a href="${l[0]}"${l[0] === '/bible.html' ? ' id="nav-bas-bible"' : ''}>${l[2]}<span>${l[1]}</span></a>`).join('\n  ')}
</nav>`;
}
function piedCanon() {
  /* le pied ne porte que le verset (choix d'Emmanuel) : ni « Lumen »,
     ni « © année Lumen » */
  return `<footer>
  <div class="verset-pied">${VERSET_PIED}</div>
</footer>`;
}

/* Câblage commun de la barre : champs de recherche qui s'agrandissent,
   service worker du site, poignée, lien actif, clavier. Il part dans
   lumen-app.js pour l'accueil et la 404, et tel quel dans les autres pages. */
const BARRE_JS = `(function(){
  /* ── LES CHAMPS DE RECHERCHE PASSENT À LA LIGNE ──
     Les champs de recherche et de référence sont des zones qui
     s'agrandissent vers le bas à mesure qu'on écrit : le début de ce qu'on
     tape reste visible, sans défilement de côté. Entrée lance la recherche,
     jamais un retour à la ligne. */
  (function(){
    function ligne(t){return t&&t.classList&&t.classList.contains('champ-ligne');}
    function ajuste(t){if(!ligne(t))return;t.style.height='auto';t.style.height=t.scrollHeight+'px';}
    document.addEventListener('input',function(e){var t=e.target;if(!ligne(t))return;
      if(/[\\r\\n]/.test(t.value)){var p=t.selectionStart;t.value=t.value.replace(/[\\r\\n]+/g,' ');try{t.setSelectionRange(p,p);}catch(_){}}
      ajuste(t);},true);
    document.addEventListener('keydown',function(e){var t=e.target;if(e.key!=='Enter'||!ligne(t))return;
      e.preventDefault();var f=t.form;if(f){if(f.requestSubmit)f.requestSubmit();else f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));}},true);
    document.addEventListener('focusin',function(e){ajuste(e.target);});
    var rz=0;window.addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(function(){[].forEach.call(document.querySelectorAll('.champ-ligne'),ajuste);},120);});
  })();
  /* le site se garde sur l'appareil (site-sw.js) ; Mémoriser a son propre
     service worker, limité à sa page, auquel on ne touche pas */
  try{if('serviceWorker' in navigator&&location.pathname.indexOf('/memoriser')!==0){
    window.addEventListener('load',function(){navigator.serviceWorker.register('/site-sw.js',{scope:'/',updateViaCache:'none'}).catch(function(){});});
  }}catch(e){}
  /* ── LA POIGNÉE ──
     Elle est fabriquée ici, une fois pour toutes : chaque page garde sa barre
     telle quelle et reçoit la poignée sans rien changer chez elle. */
  var tete=document.querySelector('header');
  if(tete&&!document.getElementById('barre-poignee')){
    var pg=document.createElement('button');
    pg.type='button'; pg.id='barre-poignee'; pg.className='barre-poignee';
    pg.innerHTML='<svg viewBox="0 0 30 9" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M7 6.2 15 2.4l8 3.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    /* juste après le titre ; faute de titre, au bout de la barre */
    var lg=tete.querySelector('.barre .logo');
    if(lg)lg.insertAdjacentElement('afterend',pg); else tete.appendChild(pg);
    var dit=function(){
      var rangee=document.documentElement.classList.contains('barre-rangee');
      pg.setAttribute('aria-expanded',rangee?'false':'true');
      var mot=rangee?'Afficher la barre':'Ranger la barre';
      pg.setAttribute('aria-label',mot); pg.title=mot;
    };
    dit();
    pg.addEventListener('click',function(){
      var rangee=document.documentElement.classList.toggle('barre-rangee');
      try{localStorage.setItem('lv_barre',rangee?'1':'0');}catch(e){}
      dit();
      /* la barre change de hauteur : les pages qui calent quelque chose
         dessous (titres de catégories, barre d'outils, cadres) remesurent */
      try{window.dispatchEvent(new Event('resize'));}catch(e){}
    });
  }
  var p=location.pathname.replace(/index\\.html$/,'')||'/';
  /* Barre du bas : « Bible » mène à la page Bible, comme les autres
     onglets ; le tiroir s'ouvre par l'onglet Bible du bord. */
  Array.prototype.forEach.call(document.querySelectorAll('nav.menu a, .nav-bas a'),function(a){
    var h=(a.getAttribute('href')||'').replace(/index\\.html$/,'');
    /* la page ouverte est soulignée, et annoncée aux lecteurs d'écran */
    if(h===p){a.classList.add('actif');a.setAttribute('aria-current','page');}
  });
  /* La loupe, le compte et la croix du panneau de compte sont des « boutons »
     pour le lecteur d'écran (role=button) : Entrée et Espace les activent,
     sur toutes les pages. Les pages branchent le clic ; le clavier se
     branche ici, une fois pour toutes. */
  document.addEventListener('keydown',function(e){
    if(e.key!=='Enter'&&e.key!==' ')return;
    var t=e.target; if(!t||!t.closest)return;
    var el=t.closest('#rech-ouvrir,#auth-ouvrir,#ia-ouvrir,#macct-x,.macct-btn[role=button]');
    if(!el||el.tagName==='BUTTON'||el.tagName==='A'||el.tagName==='INPUT'||el.tagName==='TEXTAREA')return;
    e.preventDefault(); el.click();
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

html{scroll-behavior:smooth}
.haut-page{position:fixed;right:18px;bottom:calc(18px + var(--lv-bas,0px));width:42px;height:42px;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.82);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid var(--filet,rgba(231,224,207,.25));color:var(--or,#efe6cf);font-size:17px;cursor:pointer;opacity:0;pointer-events:none;transition:opacity .35s,border-color .3s;z-index:1100}
.haut-page.on{opacity:1;pointer-events:auto}
.haut-page:hover{border-color:var(--or,#efe6cf)}

.auth-icone{position:relative}
.auth-overlay{position:fixed;inset:0;z-index:200;background:rgba(8,8,8,.98);display:none;align-items:center;justify-content:center;padding:24px}
.auth-overlay.ouvert{display:flex}
.auth-modal{position:relative;width:100%;max-width:400px;background:var(--encre);border:1px solid var(--filet);padding:40px 34px}
.auth-fermer{position:absolute;top:16px;right:18px;cursor:pointer;color:var(--parchemin-att);font-size:22px;line-height:1;transition:color .3s}
.auth-fermer:hover{color:var(--parchemin)}
.auth-m-title{font-family:'Cormorant Garamond',serif;font-size:24px;text-align:center;margin-bottom:24px;color:var(--parchemin)}
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
.auth-m-btn{display:block;width:100%;box-sizing:border-box;text-align:center;padding:13px 10px;margin-bottom:10px;border:1px solid var(--filet-fort);color:var(--parchemin);font-family:'Cormorant Garamond',serif;font-size:14px;letter-spacing:.18em;text-transform:uppercase;text-decoration:none;transition:border-color .3s,color .3s}
.auth-m-btn:hover{border-color:var(--or);color:var(--or-pale)}

/* ── Raffinements d'interface ── */
body{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
::selection{background:var(--sel,rgba(239,230,207,.5));color:var(--encre,#000)}
h1,h2,h3{text-wrap:balance}
*{scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.55) transparent}
::-webkit-scrollbar{width:10px;height:10px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,.55);background-clip:content-box;border:3px solid transparent;border-radius:99px}
::-webkit-scrollbar-thumb:hover{background:rgba(231,224,207,.6);background-clip:content-box;border:3px solid transparent}
:focus-visible{outline:1px solid rgba(231,224,207,.28);outline-offset:3px}

/* — Titre de page réservé aux lecteurs d'écran — */
.titre-cache{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
`;

function header(lang) {
  const u = UI[lang];
  return `${barreCanon()}
<div class="rech-overlay" id="rech-overlay">
  <div class="rech-boite">
    <div class="rech-haut">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="10" cy="10" r="6.5"/><line x1="15" y1="15" x2="21" y2="21" stroke-linecap="round"/></svg>
      <textarea id="rech-champ" class="champ-ligne" rows="1" placeholder="${u.search_placeholder}" autocomplete="off" spellcheck="false"></textarea>
      <span class="rech-fermer" id="rech-fermer" role="button" tabindex="0" aria-label="Fermer"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></span>
    </div>
    <div class="rech-res" id="rech-res"></div>
  </div>
</div>
<div class="auth-overlay" id="auth-overlay">
  <div class="auth-modal">
    <span class="auth-fermer" id="auth-fermer" role="button" tabindex="0" aria-label="Fermer"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></span>
    <div id="auth-out">
      <div class="auth-m-title">Connexion</div>
      <div class="auth-m-msg" id="auth-m-msg"></div>
      <input type="email" id="auth-email" placeholder="Adresse e-mail" autocomplete="email">
      <input type="password" id="auth-pw" placeholder="Mot de passe" autocomplete="current-password">
      <button class="auth-m-primary" id="auth-submit">Se connecter</button>
      <div class="auth-m-or">ou</div>
      <button class="auth-m-google" id="auth-google"><svg width="17" height="17" viewBox="0 0 18 18"><path fill="#EA4335" d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.54-2.54C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.91 2.26C4.6 5.05 6.62 3.48 9 3.48z"/><path fill="#FBBC05" d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.1.83-.64 2.08-1.84 2.92l2.84 2.2c1.7-1.57 2.68-3.88 2.68-6.62z"/><path fill="#34A853" d="M3.88 10.78A5.54 5.54 0 0 1 3.58 9c0-.62.11-1.22.29-1.78L.96 4.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.92-2.26z"/><path fill="#4A90D9" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.84-2.2c-.76.53-1.78.9-3.12.9-2.38 0-4.4-1.57-5.12-3.74L.96 13.04C2.44 15.98 5.48 18 9 18z"/></svg>Continuer avec Google</button>
      <button class="auth-m-link" id="auth-forgot">Mot de passe oublié ?</button>
    </div>
    <div id="auth-in" style="display:none">
      <div class="auth-m-title">Mon compte</div>
      <div class="auth-m-email" id="auth-in-email"></div>
      <div class="pile-btn">
      <a class="auth-m-btn" href="/bible.html#notes">Mes notes</a>
      <a class="auth-m-btn" href="/bible.html#signets">Mes signets</a>
      <a class="auth-m-btn" id="auth-m-coms" href="/commentaires.html" style="display:none">Mes commentaires</a>
      </div>
      <div class="ttx-row"><span class="ttx-lab">Taille du texte</span><span class="ttx-btns"><button type="button" class="ttx-b" data-ttx="-1">A−</button><button type="button" class="ttx-b" data-ttx="0">A</button><button type="button" class="ttx-b" data-ttx="1">A+</button></span></div>
      <div class="tog-row"><span class="tog-lab">Onglet Bible à gauche</span><span class="tog-sw" id="tog-bible" role="button" tabindex="0" aria-label="Afficher ou masquer l’onglet Bible"></span></div>
      <button class="auth-m-link" id="auth-logout">Déconnexion</button>
    </div>
  </div>
</div>`;
}

function footer() {
  return piedCanon();
}

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
  if(typeof firebase==='undefined'||!firebase.auth){document.addEventListener('lv-fb-ready',lvAuthBoot,{once:true});return;}
  if(!firebase.apps.length)firebase.initializeApp(cfg);
  var auth=firebase.auth();
  var icone=document.getElementById('auth-ouvrir'),ov=document.getElementById('auth-overlay'),fe=document.getElementById('auth-fermer');
  if(!icone||!ov)return;
  var vOut=document.getElementById('auth-out'),vIn=document.getElementById('auth-in'),mode='si';
  function el(id){return document.getElementById(id);}
  function msg(txt,kind){var m=el('auth-m-msg');m.textContent=txt;m.className='auth-m-msg '+kind;}
  function clr(){var m=el('auth-m-msg');m.className='auth-m-msg';m.textContent='';}
  function setMode(x){mode=x;clr();
    el('auth-pw').style.display=(x==='forgot')?'none':'block';
    el('auth-submit').textContent=(x==='si')?'Se connecter':'Envoyer le lien';
    el('auth-forgot').textContent=(x==='forgot')?'← Retour':'Mot de passe oublié ?';
  }
  function open(){clr();
    if(auth.currentUser){vOut.style.display='none';vIn.style.display='block';el('auth-in-email').textContent=auth.currentUser.email||auth.currentUser.displayName||'';
      /* l'auteur du site seulement : l'entrée vers ses commentaires bibliques */
      var lc=el('auth-m-coms');if(lc)lc.style.display=(String(auth.currentUser.email||'').toLowerCase()==='hoarauemmanuel336@gmail.com')?'':'none';}
    else{vOut.style.display='block';vIn.style.display='none';setMode('si');}
    ov.classList.add('ouvert');document.body.style.overflow='hidden';}
  function close(){ov.classList.remove('ouvert');document.body.style.overflow='';}
  icone.addEventListener('click',open);
  /* venu d'une autre page par « Se connecter » : la fenêtre s'ouvre
     d'elle-même, une fois connu l'état du compte */
  if(location.hash==='#connexion'){
    try{history.replaceState(null,'',location.pathname);}catch(_){}
    var vu=auth.onAuthStateChanged(function(u){vu();if(!u)open();});
  }
  icone.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
  fe.addEventListener('click',close);
  ov.addEventListener('click',function(e){if(e.target===ov)close();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&ov.classList.contains('ouvert'))close();});
  el('auth-forgot').addEventListener('click',function(){setMode(mode==='forgot'?'si':'forgot');});
  el('auth-submit').addEventListener('click',function(){
    var em=el('auth-email').value.trim(),pw=el('auth-pw').value;clr();
    if(mode==='forgot'){auth.sendPasswordResetEmail(em).then(function(){msg('Lien envoyé. Vérifiez votre boîte mail.','ok');}).catch(function(e){msg(e.message,'err');});return;}
    auth.signInWithEmailAndPassword(em,pw).catch(function(e){msg(e.message,'err');});
  });
  ['auth-email','auth-pw'].forEach(function(id){var x=el(id);if(x)x.addEventListener('keydown',function(e){if(e.key==='Enter')el('auth-submit').click();});});
  el('auth-google').addEventListener('click',function(){auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).catch(function(e){msg(e.message,'err');});});
  el('auth-logout').addEventListener('click',function(){auth.signOut().then(close);});
  auth.onAuthStateChanged(function(u){icone.classList.toggle('connecte',!!u);if(ov.classList.contains('ouvert'))open();});
})();`;

const RECH_JS = `(function(){
  var ouvrir=document.getElementById('rech-ouvrir'),overlay=document.getElementById('rech-overlay'),
      champ=document.getElementById('rech-champ'),res=document.getElementById('rech-res'),fermer=document.getElementById('rech-fermer');
  if(!ouvrir||!overlay) return;
  var L=window.LUMEN||{base:'',lang:'fr',empty:''};
  var charge=false,enCours=false;
  /* références bibliques : « Jean 3:16 » ouvre la Bible depuis n'importe où.
     Même logique que la recherche de la page Bible (dico + alias + préfixe
     unique), sur la table LUMEN_BIBLE injectée dans recherche-<lang>.js */
  var BALIAS={'genese':['gn','gen'],'exode':['ex','exo'],'levitique':['lv','lev'],'nombres':['nb','nbr','num'],'deuteronome':['dt','deut'],'josue':['jos'],'juges':['jg','jug'],'ruth':['rt'],'1-samuel':['1s','1sam','1sm'],'2-samuel':['2s','2sam','2sm'],'1-rois':['1r','1roi'],'2-rois':['2r','2roi'],'1-chroniques':['1ch','1chr','1par'],'2-chroniques':['2ch','2chr','2par'],'esdras':['esd'],'nehemie':['ne','neh'],'tobie':['tb','tob'],'judith':['jdt'],'esther':['est'],'1-maccabees':['1m','1ma','1mac','1macc'],'2-maccabees':['2m','2ma','2mac','2macc'],'job':['jb'],'psaumes':['ps','psaume'],'proverbes':['pr','prv','prov'],'ecclesiaste':['qo','eccl','qohelet'],'cantique-des-cantiques':['ct','cant','cantique','cantiques'],'sagesse':['sg','sag'],'ecclesiastique':['si','sir','siracide','eccli','ecclesiastique'],'isaie':['is','isa','esaie'],'jeremie':['jr','jer'],'lamentations':['lm','lam'],'baruch':['ba','bar'],'ezechiel':['ez','eze'],'daniel':['dn','dan'],'osee':['os'],'joel':['jl'],'amos':['am'],'abdias':['ab','abd'],'jonas':['jon'],'michee':['mi','mich'],'nahum':['na','nah'],'habacuc':['ha','hab'],'sophonie':['so','soph'],'aggee':['ag','agg'],'zacharie':['za','zac'],'malachie':['ml','mal'],'matthieu':['mt','mat','matt'],'marc':['mc'],'luc':['lc'],'jean':['jn'],'actes':['ac','act'],'romains':['rm','rom'],'1-corinthiens':['1co','1cor'],'2-corinthiens':['2co','2cor'],'galates':['ga','gal'],'ephesiens':['ep','eph'],'philippiens':['ph','phil','php'],'colossiens':['col'],'1-thessaloniciens':['1th','1thes','1thess'],'2-thessaloniciens':['2th','2thes','2thess'],'1-timothee':['1tm','1tim'],'2-timothee':['2tm','2tim'],'tite':['tt','tit'],'philemon':['phm','phlm'],'hebreux':['he','heb'],'jacques':['jc','jac'],'1-pierre':['1p','1pi'],'2-pierre':['2p','2pi'],'1-jean':['1jn'],'2-jean':['2jn'],'3-jean':['3jn'],'jude':['jud'],'apocalypse':['ap','apc','apoc']};
  /* mêmes noms additifs que le tiroir Bible (bible-panneau.js), pour que la
     recherche du site reconnaisse les mêmes références */
  (function(){var X={       'josue':['joshua','josh'],'juges':['judg','jdg'],       '1-samuel':['1samuel'],'2-samuel':['2samuel'],       '1-rois':['3rois','3r','3kings'],'2-rois':['4rois','4r','4kings'],       '1-chroniques':['1chronicles','1chron','1paralipomenes'],'2-chroniques':['2chronicles','2chron','2paralipomenes'],       'esdras':['ezra','1esdras'],'nehemie':['nehemiah','nehemias','2esdras','neemie'],'tobie':['tobit'],       'psaumes':['psalm','pss'],       'ecclesiaste':['qoheleth','coheleth','eccles'],       'cantique-des-cantiques':['songofsongs','songofsolomon','canticles','canticleofcanticles'],       'ecclesiastique':['sirach','bensira','sirac','ecclus'],       'sagesse':['wisdom','wis','sagessedesalomon','wisdomofsolomon'],       'isaie':['isaiah'],'jeremie':['jeremiah'],       'lamentations':['threnes','lamentationsdejeremie'],       'ezechiel':['ezekiel','ezek'],       'osee':['hosea','hos'],'abdias':['obadiah','obad'],'jonas':['jonah'],'michee':['micah','mic'],       'habacuc':['habakkuk'],'sophonie':['zephaniah','zeph'],'aggee':['haggai','hag'],       'zacharie':['zechariah','zech'],'malachie':['malachi'],       '1-maccabees':['1maccabees'],'2-maccabees':['2maccabees'],       'matthieu':['matthew'],'marc':['mk'],'luc':['lk'],'actes':['actsoftheapostles','actesdesapotres'],       '1-thessaloniciens':['1thessalonians'],'2-thessaloniciens':['2thessalonians'],       '1-timothee':['1timothy'],'2-timothee':['2timothy'],       'jacques':['jas'],'1-pierre':['1peter','1pet'],'2-pierre':['2peter','2pet'],       '1-jean':['1john'],'2-jean':['2john'],'3-jean':['3john'],       'apocalypse':['revelation','rev','revelations','apocalypsedejean']     };Object.keys(X).forEach(function(k){BALIAS[k]=(BALIAS[k]||[]).concat(X[k]);});})();
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
      if(br)out+='<a class="rech-item" href="'+br.href+'"><div class="rech-meta">Bible</div><div class="rech-titre">'+br.lab+'</div></a>';
    });
    return out;
  }
  var kidx=-1;
  function kitems(){return res.querySelectorAll('.rech-item');}
  function kmaj(){var its=kitems();for(var i=0;i<its.length;i++)its[i].classList.toggle('kact',i===kidx);if(kidx>=0&&its[kidx]&&its[kidx].scrollIntoView)its[kidx].scrollIntoView({block:'nearest'});}
  function chercher(q){
    kidx=-1;
    if(!String(q||'').trim()){res.innerHTML='';return;}
    var bib=brefItem(q);
    /* le texte tapé est échappé avant d'entrer dans la page */
    var qe=String(q).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});
    res.innerHTML=bib||('<div class="rech-msg">'+L.empty+' « '+qe+' ».</div>');
  }
  function prep(){charge=!!window.LUMEN_BIBLE;}
  var attentes=[];
  function chargerPuis(cb){
    if(charge){cb();return;}
    attentes.push(cb);
    if(enCours)return; enCours=true;
    var sc=document.createElement('script');sc.src=L.base+'recherche-'+L.lang+'.js';
    sc.onload=function(){prep();enCours=false;var f=attentes.splice(0);if(charge)f.forEach(function(g){g();});else res.innerHTML='<div class="rech-msg">La recherche est momentanément indisponible.</div>';};
    sc.onerror=function(){enCours=false;attentes.length=0;res.innerHTML='<div class="rech-msg">La recherche est momentanément indisponible.</div>';};
    document.body.appendChild(sc);
  }
  function ouvre(){overlay.classList.add('ouvert');document.body.style.overflow='hidden';if(!charge)res.innerHTML='';setTimeout(function(){champ.focus();},40);chargerPuis(function(){chercher(champ.value);});}
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

function page({ lang, title, description, base, main, hab = 'accueil', familles = 'index.html' }) {
  const u = UI[lang];
  /* site privé : aucune page n'est faite pour les moteurs de recherche */
  const robots = '\n<meta name="robots" content="noindex,nofollow">';
  return `<!DOCTYPE html>
<html lang="${u.html}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="dark">
<meta name="darkreader-lock"><style>html{color-scheme:dark}@media (prefers-color-scheme:dark){html{color-scheme:dark}}@media (prefers-color-scheme:light){html{color-scheme:dark}}</style>
<title>${title}</title>
<meta name="description" content="${description}">${robots}
<link rel="manifest" href="/manifest.webmanifest">
<link rel="apple-touch-icon" href="/icones/lumen-180.png">
<meta name="theme-color" content="#0a0a0a">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
${FONTS}
${FIREBASE_HEAD}
<style>${css}${EXTRA_CSS}</style>
${COMMUN_TAG}
<style>${APPEARANCE_CSS}</style>
${BARRE_TETE}
${habillage(hab)}
${communJS(familles)}
</head>
<body>
${header(lang)}
<main id="app">
${main}
</main>
${footer()}
<script>
window.LUMEN={base:${JSON.stringify(base)},lang:${JSON.stringify(lang)},empty:${JSON.stringify(u.search_empty)}};
</script>
<script src="/lumen-app.js?v=${APP_V}"></script>
<!-- L'onglet Bible au bord gauche, ici comme sur les autres pages : le
     réglage du compte promet de l'afficher partout. -->
<script src="/bible-panneau.js?v=${PAN_V}" defer></script>
</body>
</html>`;
}

/* ---- vues ---- */
function mainAccueil() {
  /* Accueil : la croix, puis « tout ce qui rythme la vie de l'Église »
     (choix d'Emmanuel), selon le calendrier de France. Le contenu est
     écrit par pages/accueil.js, d'après /liturgie/ et /api/liturgie. */
  const js = fs.readFileSync(PAGES + 'accueil.js', 'utf8');
  return `<div class="vue">
    <h1 class="titre-cache">Lumen Veritatis</h1>
    <section class="hero hero-lit">
      <div class="croix" aria-hidden="true"></div>
    </section>
    <div class="lit" id="lit" aria-live="polite"></div>
  </div>
  <script>${js}</script>`;
}

function main404() {
  return `<style>
    .quatre{text-align:center;padding:88px 24px 120px;max-width:640px;margin:0 auto}
    .quatre .croix{width:58px;height:106px;margin-bottom:46px}
    .quatre h1{font-family:'Cormorant Garamond',serif;font-weight:400;font-size:46px;letter-spacing:.02em;color:var(--parchemin);margin:0 0 26px}
    .quatre .q-desc{font-size:16px;line-height:1.75;color:rgba(255,255,255,.6);margin:0 auto 44px;max-width:520px}
    .q-lien{font-family:'Cormorant Garamond',serif;font-size:12.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--or);text-decoration:none;padding-bottom:3px;border-bottom:1px solid transparent;transition:color .3s,border-color .3s}
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

/* ── Fichiers communs mis en cache, versionnés par empreinte (?v=…) : l'adresse
   change quand le contenu change, sinon rien n'est retéléchargé. ── */
const crypto = require('crypto');


const UX_JS = `
(function(){
  /* retour en haut, toutes pages */
  var h=document.createElement('span');
  h.className='haut-page'; h.setAttribute('role','button'); h.setAttribute('tabindex','0');
  h.setAttribute('aria-label','Revenir en haut de la page');
  h.textContent='\u2191';
  h.addEventListener('click',function(){ window.scrollTo({top:0,behavior:'smooth'}); });
  h.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){e.preventDefault();window.scrollTo({top:0,behavior:'smooth'});} });
  document.body.appendChild(h);
  var t2=false;
  function majHaut(){ t2=false; h.classList.toggle('on', window.scrollY>700); }
  window.addEventListener('scroll',function(){ if(!t2){t2=true;requestAnimationFrame(majHaut);} },{passive:true});
  majHaut();
})();`;
const APP_JS = [BARRE_JS, RECH_JS, AUTH_JS, UX_JS].join('\n');
const APP_V = crypto.createHash('md5').update(APP_JS).digest('hex').slice(0, 8);
const PAN_V = fs.existsSync(RACINE + 'bible-panneau.js') ? crypto.createHash('md5').update(fs.readFileSync(RACINE + 'bible-panneau.js')).digest('hex').slice(0, 8) : '1';
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(`${OUT}/lumen-app.js`, APP_JS);
console.log(`Communs : lumen-app.js (${Math.round(APP_JS.length / 1024)} Ko, v=${APP_V})`);

function genPaire(spec) {
  // spec : frPath, frFile, title, desc, main
  pairs.push(spec.frPath);
  const lang = 'fr';
  const dir = spec.frPath.replace(/[^\/]*$/, '');              // dossier de la page
  const base = '../'.repeat(dir.split('/').filter(Boolean).length);
  ecrire(spec.frFile, page({
    lang, title: spec.title(lang), description: spec.desc(lang),
    base, main: spec.main()
  }));
}

// accueil
genPaire({
  frPath: '/', frFile: 'index.html',
  title: l => UI[l].t_home, desc: l => UI[l].site_desc_home,
  main: () => mainAccueil()
});

// 404, à la racine
ecrire('404.html', page({
  lang: 'fr', title: UI.fr.t_404, description: UI.fr.notfound_text,
  base: '/', main: main404()
}));

/* Étude : la page s'ouvre directement sur le parcours, en plein écran comme
   une ressource ouverte, avec le même cadre isolé et le même bandeau
   (retour, Bible, IA) ; pages/etude.js pose le cadre du parcours ou du
   cours ouvert, voir aussi habillage/etude.css. */
if (fs.existsSync('parcours/la-foi-catholique.html')) {
  const svg = (d, w = 1.6) => `<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  ecrire('etude.html', page({
    lang: 'fr', title: 'Étude · Lumen Veritatis', description: 'Parcours d’étude et cours.',
    base: '/', hab: 'etude', familles: 'etude.html',
    main: `<h1 class="titre-cache">Étude</h1>
  <div class="et-charge" id="et-charge"><span class="lv-roue" role="status" aria-label="Chargement"></span></div>
  <div class="res-plein-acts" id="et-acts">
    <button type="button" id="et-retour" class="res-plein-x" aria-label="Revenir">${svg('<path d="M19.5 12h-15M10.5 6l-6 6 6 6"/>')}</button>
    <button type="button" id="et-bible" class="res-plein-x res-plein-bible" aria-label="Ouvrir la Bible">${svg('<path d="M12 6.5C10.3 5.2 7.8 4.6 4 4.6v13.2c3.8 0 6.3.6 8 1.9 1.7-1.3 4.2-1.9 8-1.9V4.6c-3.8 0-6.3.6-8 1.9z"/><path d="M12 6.5v13.2"/>')}</button>
    <button type="button" id="et-ia" class="res-plein-x res-plein-bible res-plein-ia" aria-label="Poser une question à l’IA sur cette page" title="Question à l’IA">${svg('<path d="M10 3.5l1.6 4.4 4.4 1.6-4.4 1.6L10 15.5l-1.6-4.4L4 9.5l4.4-1.6zM18 13.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>', 1.5)}</button>
  </div>
  <script>document.body.classList.add('plein');</script>
  <script>${fs.readFileSync(PAGES + 'etude.js', 'utf8')}</script>`
  }));
}

// le calendrier liturgique de France, une année par fichier, lu par l'accueil
if (fs.existsSync(CONTENU + 'liturgie')) {
  fs.mkdirSync(`${OUT}/liturgie`, { recursive: true });
  for (const f of fs.readdirSync(CONTENU + 'liturgie')) fs.copyFileSync(CONTENU + `liturgie/${f}`, `${OUT}/liturgie/${f}`);
}

// robots.txt
/* Site privé : aucun moteur de recherche n'entre, et il n'y a pas de plan du site. */
ecrire('robots.txt', `User-agent: *\nDisallow: /\n`);

// les anciennes adresses (bibliothèque, article, à propos, /en/) retombent sur l'accueil, en 301
ecrire('_redirects', ['/bibliotheque/*  /  301', '/article/*  /  301', '/a-propos/*  /  301', '/en/*  /  301'].join('\n') + '\n');

// table des livres bibliques pour la recherche de références (Jean 3:16)
const tableBible = (src, base) => {
  try {
    const b = JSON.parse(fs.readFileSync(src, 'utf8'));
    return { base, livres: b.livres.map(l => [l.nom, l.slug, l.nch]) };
  } catch (e) { return null; }
};
const bibFR = tableBible(CONTENU + 'bible.json', '/bible.html');
/* sans bible.json, la recherche serait un fichier vide servi sans erreur :
   on préfère une fabrication qui échoue à un site qui répond « rien trouvé » */
if (!bibFR) throw new Error(CONTENU + 'bible.json illisible : recherche-fr.js serait vide');
ecrire('recherche-fr.js', 'window.LUMEN_BIBLE=' + JSON.stringify(bibFR) + ';');

// les pages écrites à la main, complétées puis copiées
/* Les pages copiées reçoivent la description et le manifeste qui leur
   manquent, sans dupliquer ce qu'une page porte déjà. */
function metaCopie(h, desc){
  const e = x => String(x).replace(/"/g, '&quot;');
  let m = '';
  if (!/name="description"/.test(h)) m += `<meta name="description" content="${e(desc)}">\n`;
  if (!/rel="manifest"/.test(h)) m += `<link rel="manifest" href="/manifest.webmanifest">\n`;
  return m ? injecteAvant(h, '</head>', m) : h;
}
/* ── INJECTER AVANT LA DERNIÈRE BALISE, PAS LA PREMIÈRE ──
   Une page peut écrire « </body> » dans une chaîne JavaScript (les cadres
   isolés) : viser la première occurrence poserait l'ajout dans cette chaîne.
   On vise la dernière, qui est la vraie, et l'on s'arrête si elle manque. */
function injecteAvant(s, balise, ajout){
  const i = s.lastIndexOf(balise);
  if (i < 0) throw new Error('ancre ' + balise + ' introuvable');
  return s.slice(0, i) + ajout + s.slice(i);
}
if (fs.existsSync(PAGES + 'memoriser.html')) {
  let mh = fs.readFileSync(PAGES + 'memoriser.html', 'utf8');
  /* La bibliothèque de départ vient de contenu/memoriser.json. Une liste
     vide ne remplace pas ce que la page embarque. */
  {
    let catsSrc = null;
    if (fs.existsSync(CONTENU + 'memoriser.json')) {
      const cf = JSON.parse(fs.readFileSync(CONTENU + 'memoriser.json', 'utf8')).categories;
      if (Array.isArray(cf) && cf.length) catsSrc = cf;
    }
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
        /* remplacement par fonction : une chaîne interpréterait les motifs « $& », « $' »… présents dans un verset */
        const preSrc = '/*PRE_START*/const PRE=' + JSON.stringify(cats).replace(/</g, '\\u003c') + ';/*PRE_END*/';
        mh = mh.replace(reMarq, () => preSrc);
        console.log('Mémoriser : versets de base injectés (' + cats.length + ' catégories)');
      }
    }
  }
  mh = injecteAvant(mh, '</head>', COMMUN_TAG);
  mh = injecteAvant(mh, '</head>', communJS('memoriser.html'));
  if (APPEARANCE_CSS && mh.indexOf('</head>') >= 0) {
    mh = injecteAvant(mh, '</head>', '<style>' + APPEARANCE_CSS + '</style>');
  }
  {
    const hOld = mh.match(/<header>[\s\S]*?<\/header>/);
    const fOld = mh.match(/<footer[^>]*>[\s\S]*?<\/footer>/);
    if (!hOld || !fOld) throw new Error('memoriser.html : header ou footer introuvable');
    mh = mh.replace(hOld[0], barreCanon());
    mh = mh.replace(fOld[0], piedCanon());
    mh = injecteAvant(mh, '</head>', '<style>' + BARRE_CSS + '</style>' + BARRE_TETE);
    mh = metaCopie(mh, 'Mémorisation de versets et de passages bibliques, par répétition espacée.');
    mh = injecteAvant(mh, '</body>', '<script>' + BARRE_JS + '</scr' + 'ipt>');
    console.log('Mémoriser : barre et pied canoniques injectés');
  }
  mh = injecteAvant(mh, '</body>', '<script src="/bible-panneau.js?v=' + PAN_V + '" defer><' + '/script>');
  mh = polices(injecteAvant(mh, '</head>', habillage('memoriser')));
  fs.writeFileSync(`${OUT}/memoriser.html`, mh);
  console.log('Copié : memoriser.html');
}

// ── Articles : la page d'écriture et de lecture, même traitement que les autres ──
if (fs.existsSync(PAGES + 'articles.html')) {
  let ah = fs.readFileSync(PAGES + 'articles.html', 'utf8');
  ah = injecteAvant(ah, '</head>', COMMUN_TAG);
  ah = injecteAvant(ah, '</head>', communJS('articles.html'));
  if (APPEARANCE_CSS && ah.indexOf('</head>') >= 0) {
    ah = injecteAvant(ah, '</head>', '<style>' + APPEARANCE_CSS + '</style>');
  }
  {
    const hOld = ah.match(/<header>[\s\S]*?<\/header>/);
    const fOld = ah.match(/<footer[^>]*>[\s\S]*?<\/footer>/);
    if (!hOld || !fOld) throw new Error('articles.html : header ou footer introuvable');
    ah = ah.replace(hOld[0], barreCanon());
    ah = ah.replace(fOld[0], piedCanon());
    ah = injecteAvant(ah, '</head>', '<style>' + BARRE_CSS + '</style>' + BARRE_TETE);
    ah = metaCopie(ah, 'Articles de théologie catholique, accessibles aux débutants.');
    ah = injecteAvant(ah, '</body>', '<script>' + BARRE_JS + '</scr' + 'ipt>');
    console.log('Articles : barre et pied canoniques injectés');
  }
  ah = injecteAvant(ah, '</body>', '<script src="/bible-panneau.js?v=' + PAN_V + '" defer><' + '/script>');
  ah = polices(injecteAvant(ah, '</head>', habillage('articles')));
  fs.writeFileSync(`${OUT}/articles.html`, ah);
  console.log('Copié : articles.html');
}

// ── Ressources : diagrammes, cartes, livres et liens, même traitement ──
if (fs.existsSync(PAGES + 'ressources.html')) {
  let rh = fs.readFileSync(PAGES + 'ressources.html', 'utf8');
  rh = injecteAvant(rh, '</head>', COMMUN_TAG);
  rh = injecteAvant(rh, '</head>', communJS('ressources.html'));
  if (APPEARANCE_CSS && rh.indexOf('</head>') >= 0) {
    rh = injecteAvant(rh, '</head>', '<style>' + APPEARANCE_CSS + '</style>');
  }
  {
    const hOld = rh.match(/<header>[\s\S]*?<\/header>/);
    const fOld = rh.match(/<footer[^>]*>[\s\S]*?<\/footer>/);
    if (!hOld || !fOld) throw new Error('ressources.html : header ou footer introuvable');
    rh = rh.replace(hOld[0], barreCanon());
    rh = rh.replace(fOld[0], piedCanon());
    rh = injecteAvant(rh, '</head>', '<style>' + BARRE_CSS + '</style>' + BARRE_TETE);
    rh = metaCopie(rh, 'Diagrammes, cartes, documents et liens pour étudier la foi catholique.');
    rh = injecteAvant(rh, '</body>', '<script>' + BARRE_JS + '</scr' + 'ipt>');
    console.log('Ressources : barre et pied canoniques injectés');
  }
  rh = injecteAvant(rh, '</body>', '<script src="/bible-panneau.js?v=' + PAN_V + '" defer><' + '/script>');
  rh = polices(injecteAvant(rh, '</head>', habillage('ressources')));
  fs.writeFileSync(`${OUT}/ressources.html`, rh);
  console.log('Copié : ressources.html');
}

// ── Commentaires bibliques : l'atelier où Emmanuel les écrit, hors menu (on y
//    entre par « Mon compte ») ; les commentaires se lisent dans la Bible.
//    Même barre, même pied, même panneau Bible que les autres pages. ──
if (fs.existsSync(PAGES + 'commentaires.html')) {
  let ch = fs.readFileSync(PAGES + 'commentaires.html', 'utf8');
  ch = injecteAvant(ch, '</head>', COMMUN_TAG);
  ch = injecteAvant(ch, '</head>', communJS('commentaires.html'));
  if (APPEARANCE_CSS && ch.indexOf('</head>') >= 0) {
    ch = injecteAvant(ch, '</head>', '<style>' + APPEARANCE_CSS + '</style>');
  }
  {
    const hOld = ch.match(/<header>[\s\S]*?<\/header>/);
    const fOld = ch.match(/<footer[^>]*>[\s\S]*?<\/footer>/);
    if (!hOld || !fOld) throw new Error('commentaires.html : header ou footer introuvable');
    ch = ch.replace(hOld[0], barreCanon());
    ch = ch.replace(fOld[0], piedCanon());
    ch = injecteAvant(ch, '</head>', '<style>' + BARRE_CSS + '</style>' + BARRE_TETE);
    ch = metaCopie(ch, 'Commentaires bibliques de Lumen Veritatis, à lire dans la Bible.');
    ch = injecteAvant(ch, '</body>', '<script>' + BARRE_JS + '</scr' + 'ipt>');
    console.log('Commentaires : barre et pied canoniques injectés');
  }
  ch = injecteAvant(ch, '</body>', '<script src="/bible-panneau.js?v=' + PAN_V + '" defer><' + '/script>');
  ch = polices(injecteAvant(ch, '</head>', habillage('commentaires')));
  fs.writeFileSync(`${OUT}/commentaires.html`, ch);
  console.log('Copié : commentaires.html');
}

// ── Fichiers communs à toutes les pages : panneau Bible, service worker, manifestes, icônes ──
// (hors de toute condition : chaque page les référence, ils doivent toujours être copiés)
if (fs.existsSync(RACINE + 'bible-panneau.js')) {
  fs.copyFileSync(RACINE + 'bible-panneau.js', `${OUT}/bible-panneau.js`);
  console.log('Copié : bible-panneau.js');
}
for (const f of ['memoriser-manifest.webmanifest', 'manifest.webmanifest']) {
  if (fs.existsSync(RACINE + f)) fs.copyFileSync(RACINE + f, `${OUT}/${f}`);
}
/* le service worker reçoit sa version du build : empreinte de la page, du
   panneau et de lui-même, pour qu'un changement de l'un renouvelle le cache */
if (fs.existsSync(RACINE + 'memoriser-sw.js')) {
  const swSrc = fs.readFileSync(RACINE + 'memoriser-sw.js', 'utf8');
  const SW_V = crypto.createHash('md5').update(swSrc + PAN_V + fs.readFileSync(`${OUT}/memoriser.html`, 'utf8')).digest('hex').slice(0, 8);
  if (!/__VERSION__/.test(swSrc) || !/__PAN_V__/.test(swSrc)) throw new Error('memoriser-sw.js : marqueurs __VERSION__ / __PAN_V__ absents');
  fs.writeFileSync(`${OUT}/memoriser-sw.js`, swSrc.replace(/__VERSION__/g, SW_V).replace(/__PAN_V__/g, PAN_V)   /* toutes les occurrences : la première est dans un commentaire */);
}
/* les polices, servies par le site lui-même */
if (fs.existsSync(RACINE + 'polices')) {
  fs.mkdirSync(`${OUT}/polices`, { recursive: true });
  for (const f of fs.readdirSync(RACINE + 'polices')) fs.copyFileSync(RACINE + `polices/${f}`, `${OUT}/polices/${f}`);
}
if (fs.existsSync(RACINE + 'icones')) {
  fs.mkdirSync(`${OUT}/icones`, { recursive: true });
  for (const ic of fs.readdirSync(RACINE + 'icones')) fs.copyFileSync(RACINE + `icones/${ic}`, `${OUT}/icones/${ic}`);
}
console.log('Copié : memoriser-sw.js + manifests + icônes');
/* les moteurs des skills, que la conversation avec l'IA assemble avec le
   contenu qu'elle écrit (commun/assemblage.js lit /ia-moteurs/<skill>/) */
for (const sk of ['livre-html', 'diagrammes-interactifs', 'cours-html', 'parcours-etude']) {
  const src = `ia/skills/${sk}/moteur`;
  if (!fs.existsSync(src)) continue;
  fs.mkdirSync(`${OUT}/ia-moteurs/${sk}`, { recursive: true });
  for (const f of ['gabarit.html', 'polices.css', 'moteur.css', 'moteur.js'])
    if (fs.existsSync(`${src}/${f}`)) fs.copyFileSync(`${src}/${f}`, `${OUT}/ia-moteurs/${sk}/${f}`);
}

/* ── Le parcours « La foi catholique » et ses cours ──
   parcours/ garde le parcours tel que la skill parcours-etude l'a produit,
   cours.json, qui relie la clé d'un sujet à son cours
   (fichier#ouverture-<lettre>), et cours-sommaire.json, qui décrit les
   fichiers de cours (un par thème, faits avec cours-html). Les fichiers
   eux-mêmes vivent dans le coffre R2 et se servent à /parcours/cours/
   (netlify/edge-functions/fichiers.js) : chaque lien se vérifie ici contre
   le sommaire, fichier et lettre du cours.
   Le fichier du parcours reste intact : c'est ici que chaque thème qui a
   son fichier de cours reçoit le bouton « Ouvrir le cours », dans son
   en-tête, visible sans déplier le thème (un bouton par thème, pas par
   sujet : « pas sur chaque leçon mais sur chaque bloc/cours »). Le moteur
   du parcours ne met pas la clé dans la page ; il affiche le numéro du
   thème, que la fabrication calcule d'après l'ordre des thèmes du
   contenu, comme le moteur. Dans Étude, le parcours tourne dans un cadre
   isolé : le bouton demande à la page d'ouvrir le cours (message
   lvCours, voir pages/etude.js) ; ouvert seul, il mène au fichier. */
if (fs.existsSync('parcours/la-foi-catholique.html')) {
  fs.mkdirSync(`${OUT}/parcours`, { recursive: true });
  /* une copie de cours gardée dans le dépôt est servie quand le coffre
     ne l'a pas (voir fichiers.js) */
  if (fs.existsSync('parcours/cours')) {
    fs.mkdirSync(`${OUT}/parcours/cours`, { recursive: true });
    for (const f of fs.readdirSync('parcours/cours')) fs.copyFileSync(`parcours/cours/${f}`, `${OUT}/parcours/cours/${f}`);
  }
  const liens = JSON.parse(fs.readFileSync('parcours/cours.json', 'utf8'));
  const sommaire = JSON.parse(fs.readFileSync('parcours/cours-sommaire.json', 'utf8'));
  let ph = fs.readFileSync('parcours/la-foi-catholique.html', 'utf8');
  const parTheme = {};
  let num = 0, trouves = 0;
  for (const th of ph.match(/<theme\b[\s\S]*?<\/theme>/g) || []) {
    num++;
    const fichiers = new Set();
    for (const s of th.match(/<sujet\b[^>]*\bcle="[^"]+"/g) || []) {
      const u = liens[s.match(/cle="([^"]+)"/)[1]];
      if (!u) continue;
      trouves++;
      const [fichier, ancre] = u.split('#');
      if (!sommaire[fichier]) throw new Error('parcours : fichier de cours absent du sommaire, ' + u);
      if (!sommaire[fichier].cours[(ancre || '').replace(/^ouverture-/, '')]) throw new Error('parcours : cours absent de son fichier, ' + u);
      fichiers.add(fichier);
    }
    if (fichiers.size > 1) throw new Error(`parcours : le thème ${num} renvoie à plusieurs fichiers de cours (${[...fichiers].join(', ')})`);
    if (fichiers.size) parTheme[String(num).padStart(2, '0')] = [...fichiers][0];
  }
  const absents = Object.keys(liens).length - trouves;
  if (absents) throw new Error(`parcours : ${absents} sujet(s) de cours.json introuvable(s) dans le parcours`);
  /* le bouton est une icône seule (Emmanuel : « au lieu de “ouvrir le
     cours” mets plutôt une icône »), un mortier de diplômé, dans un cadre
     fin à l'accent du thème ; son nom reste dit aux lecteurs d'écran et
     au survol */
  const icone = '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    + '<path d="M2.5 9.2 12 4.8l9.5 4.4L12 13.6z"/><path d="M6.5 11.1v4.6c1.6 1.4 3.4 2.1 5.5 2.1s3.9-.7 5.5-2.1v-4.6"/><path d="M21.5 9.2v5.3"/></svg>';
  const boutons = '<style>.lv-cours{flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;text-decoration:none;cursor:pointer;-webkit-tap-highlight-color:transparent;'
    + 'color:var(--a);box-shadow:inset 0 0 0 .5px var(--a);transition:background .25s,color .25s}'
    + '.lv-cours svg{display:block}'
    + '@media (hover:hover) and (pointer:fine){.lv-cours:hover{background:var(--a);color:#000}}'
    + '@media (max-width:640px){.lv-cours{width:44px;height:44px}}</style>'
    + '<script>(function(){var L=' + JSON.stringify(parTheme) + ',I=' + JSON.stringify(icone) + ';'
    + 'var cadre=(function(){try{return parent!==window}catch(e){return true}})();'
    + 'function pose(){document.querySelectorAll(".th").forEach(function(th){'
    + 'var h=th.querySelector(".th-h"),g=h&&h.querySelector(".tag"),v=h&&h.querySelector(".th-v");'
    + 'if(!h||!g||!v||h.querySelector(".lv-cours"))return;var u=L[g.textContent.trim()];if(!u)return;'
    + 'var a=document.createElement("a");a.className="lv-cours";a.href="cours/"+u;a.innerHTML=I;a.setAttribute("aria-label","Ouvrir le cours");a.title="Ouvrir le cours";'
    + 'a.addEventListener("click",function(e){e.stopPropagation();if(!cadre)return;e.preventDefault();'
    + 'try{parent.postMessage({lvCours:u},"*")}catch(x){}});'
    + 'a.addEventListener("keydown",function(e){e.stopPropagation()});'
    + 'h.insertBefore(a,v)})}'
    + 'if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(pose,0)});else setTimeout(pose,0)})();</scr' + 'ipt>';
  /* ── LE PARCOURS TEL QU'IL SERT SUR LE SITE ──
     Le fichier garde ce que la skill y a mis pour un usage hors du site.
     Sur le site, les cours sont déjà faits et la progression se garde
     d'elle-même (« ça ne servira pas pour le site ») : les boutons
     « Copier » disparaissent, et la présentation du parcours ne parle
     plus ni de copier pour l'IA, ni du bouton Enregistrer. */
  const sansCopie = ' Chaque sujet, chaque thème, chaque bloc, et le parcours entier depuis cette bannière, se copie d’un toucher pour être demandé à l’IA en livre (skill livre-html), en diagramme (skill diagrammes-interactifs), en cours (skill cours-html) ou en article.';
  const progression = /<p>La progression se garde d’elle-même dans le navigateur quand il le permet\.[\s\S]*?<\/p>/;
  if (!ph.includes(sansCopie) || !progression.test(ph)) throw new Error('parcours : la présentation a changé, revoir les retouches du site dans build-bi.js');
  ph = ph.replace(sansCopie, '').replace(progression, () => '<p>La progression se garde d’elle-même et se retrouve d’un appareil à l’autre.</p>');
  ph = injecteAvant(ph, '</body>', '<style>.cpw,.th-cp{display:none!important}</style>');
  ph = injecteAvant(ph, '</body>', boutons);
  fs.writeFileSync(`${OUT}/parcours/la-foi-catholique.html`, ph);
  console.log(`Parcours : ${Object.keys(parTheme).length} thèmes reliés à leur fichier de cours`);
}

// ── La Sainte Bible : page de lecture, puis données par livre des deux traductions ──
if (fs.existsSync(PAGES + 'bible.html')) {
  let bh = fs.readFileSync(PAGES + 'bible.html', 'utf8');
  bh = injecteAvant(bh, '</head>', COMMUN_TAG);
  bh = injecteAvant(bh, '</head>', communJS('bible.html'));
  if (APPEARANCE_CSS && bh.indexOf('</head>') >= 0) {
    bh = injecteAvant(bh, '</head>', '<style>' + APPEARANCE_CSS + '</style>');
  }
  {
    const hOld = bh.match(/<header>[\s\S]*?<\/header>/);
    const fOld = bh.match(/<footer[^>]*>[\s\S]*?<\/footer>/);
    if (!hOld || !fOld) throw new Error('bible.html : header ou footer introuvable');
    bh = bh.replace(hOld[0], barreCanon());
    bh = bh.replace(fOld[0], piedCanon());
    bh = injecteAvant(bh, '</head>', '<style>' + BARRE_CSS + '</style>' + BARRE_TETE);
    bh = metaCopie(bh, 'La Sainte Bible, traduction Chérubin. Lecture en ligne, Ancien et Nouveau Testament.');
    bh = injecteAvant(bh, '</body>', '<script>' + BARRE_JS + '</scr' + 'ipt>');
    console.log('Bible : barre et pied canoniques injectés');
  }
  bh = polices(injecteAvant(bh, '</head>', habillage('bible')));
  fs.writeFileSync(`${OUT}/bible.html`, bh);
  console.log('Copié : bible.html');

/* ════════ MISE EN PAGE POÉTIQUE ════════
   Comme dans une Bible imprimée, chaque verset poétique tient sa ligne, et
   sa seconde moitié, qui répond à la première, est mise en retrait : c'est
   le balancement de la poésie hébraïque. La décision se prend à la
   fabrication ; le texte reste intact, il reçoit seulement :
     p = 1        ce verset se lit en vers, en bloc à lui seul
     c = [i, …]   les endroits où couper : chaque i est l'indice de l'ESPACE
                  qui termine une ligne. L'espace reste dans sa ligne, si
                  bien que la suite des caractères affichés est celle du
                  verset : les surlignages de fragments, qui travaillent sur
                  des positions, ne bougent pas.
   c reste une liste de positions, jamais de textes découpés : ce sont les
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
   Une SENTENCE est un dicton qui se suffit à lui-même : chacune est posée
   seule, entourée d'air (s = 1).
   Un POÈME SUIVI est une seule coulée (un psaume, un oracle) : ses lignes se
   serrent, et l'air ne revient qu'aux titres de section.
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
  /* une vraie espace seulement : l'espace insécable qui suit « ? » ou « ! »
     annonce un guillemet fermant, et couper là rejetterait le « » » seul en
     tête de la ligne suivante */
  const re = /[;:!?.,] /g;
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
   Un chapitre de récit d'un seul tenant est une muraille : on le découpe en
   paragraphes, sans rien affirmer sur le sens. La coupure ne tombe qu'après
   une phrase achevée, et seulement quand le paragraphe a de quoi tenir
   debout. Un titre de section ouvre toujours un paragraphe ; c'est la page
   qui le montre, pas la donnée. Les paragraphes de prose sont voulus par
   Emmanuel ; l'interrupteur ci-dessous reste. */
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
/* ── LES VERSETS DE LA SEPTANTE ──
   Un verset que seule la Septante contient (1 Rois 2:35a, Proverbes 9:12a…)
   vit à la suite du verset hébreu qui le précède, précédé de son numéro entre
   deux « word joiner » (U+2060) : la page le dessine en petit numéro. En vers,
   il ouvre une nouvelle ligne : le texte porte alors un « \n » devant lui,
   comme les fins de vers de la Séraphin. Pour la Chérubin, ces « \n » sont
   convertis ici en coupes (vers) ou en simples espaces (prose), et chaque
   ligne reçoit ensuite ses propres coupes. */
function coupesParLignes(t) {
  const lignes = t.split('\n');
  let txt = '', out = [];
  lignes.forEach((l, i) => {
    if (i) { out.push(txt.length); txt += ' '; }
    const base = txt.length;
    const c = coupesVerset(l);
    if (c) c.forEach(k => out.push(base + k));
    txt += l;
  });
  return { t: txt, c: out.sort((x, y) => x - y) };
}
function posePoesie(livre) {
  let nb = 0;
  for (const ch of livre.chapitres) {
    for (const v of ch.versets) {
      const poe = POESIE[livre.slug] && estPoetique(livre.slug, ch.n, v.v);
      if (!poe) { if (v.t.indexOf('\n') >= 0) v.t = v.t.replace(/\n/g, ' '); continue; }
      v.p = 1; nb++;
      if (estSentence(livre.slug, ch.n, v.v)) v.s = 1;
      if (v.t.indexOf('\n') >= 0) { const r = coupesParLignes(v.t); v.t = r.t; if (r.c.length) v.c = r.c; continue; }
      const c = coupesVerset(v.t);
      if (c) v.c = c;
    }
    poseParagraphes(ch);
  }
  return nb;
}
/* ── LES VERS DE LA SÉRAPHIN ──
   La Séraphin (littérale) porte ses coupes dans son texte : un « \n » à
   chaque fin de vers, posé par le traducteur. On les convertit dans la
   notation de la Chérubin : le retour à la ligne devient l'espace qui
   termine la ligne, et sa position entre dans c. Le texte servi ne contient
   plus de « \n », et les positions (surlignages de fragments) marchent de la
   même façon des deux côtés. coupesVerset ne tourne pas sur ce texte : il
   inventerait des coupes que le traducteur n'a pas voulues.
   Sont en vers : les mêmes étendues que la Chérubin, plus tout verset qui
   porte un « \n » (oracles et psaumes cités au milieu d'un récit, comme
   Matthieu 2:6). */
function poseVersSeraphin(livre) {
  let nb = 0;
  for (const ch of livre.chapitres) {
    for (const v of ch.versets) {
      const coupes = [];
      if (v.t.indexOf('\n') >= 0) {
        const lignes = v.t.split('\n');
        let t = lignes[0];
        for (let i = 1; i < lignes.length; i++) {
          coupes.push(t.length);       // l'indice de l'espace qui va s'écrire
          t += ' ' + lignes[i];
        }
        v.t = t;
      }
      if (!coupes.length && !estPoetique(livre.slug, ch.n, v.v)) continue;
      v.p = 1; nb++;
      if (estSentence(livre.slug, ch.n, v.v)) v.s = 1;
      if (coupes.length) v.c = coupes;
    }
    poseParagraphes(ch);
  }
  return nb;
}

  // Chaque Bible est un seul fichier source, redécoupé en un fichier par livre
  // plus un index : la Chérubin dans /bible-data/, la Séraphin dans /bible-data-seraphin/.
  const decoupeBible = (src, dossier, pose) => {
    if (!fs.existsSync(src)) return false;
    fs.mkdirSync(`${OUT}/${dossier}`, { recursive: true });
    const bible = JSON.parse(fs.readFileSync(src, 'utf8'));
    fs.writeFileSync(`${OUT}/${dossier}/index.json`, JSON.stringify({ livres: bible.livres, groupes: bible.groupes }));
    let nb = 0;
    let poe = 0;
    for (const livre of bible.data) {
      poe += (pose || posePoesie)(livre);
      fs.writeFileSync(`${OUT}/${dossier}/${livre.slug}.json`, JSON.stringify(livre));
      nb++;
    }
    console.log('Bible (' + dossier + ') : ' + nb + ' livres + index, ' + poe + ' versets en vers');
    return true;
  };
  decoupeBible(CONTENU + 'bible.json', 'bible-data');
  /* ── LA SÉRAPHIN ──
     Même découpage par livre, même index, un dossier à elle. La page ne va
     la chercher que si le lecteur la demande. Son index est identique à
     celui de la Chérubin ; il est écrit quand même, pour que le dossier se
     suffise à lui-même. */
  {
    const src = [CONTENU + 'bible-seraphin.json', 'bible-seraphin.json'].find(p => fs.existsSync(p));
    if (src) decoupeBible(src, 'bible-data-seraphin', poseVersSeraphin);
    else console.warn('⚠ bible-seraphin.json absent : la page Bible n’ouvrira que la Chérubin');
  }
}


/* Garde-fou : la barre et le pied sont identiques sur toutes les pages. La
   fabrication échoue si l'un d'eux dérive. */
{
  const surfaces = ['index.html', 'bible.html', 'memoriser.html', 'articles.html', 'ressources.html', 'commentaires.html', 'etude.html', '404.html'];
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

console.log('Site généré dans «', OUT, '»');
console.log('Pages générées :', pairs.length, '+ 404 + robots');

/* Dernière étape : allègement puis contrôle des pages produites (voir
   publication.js). Au moindre défaut grave, la fabrication échoue et la
   version déjà en ligne reste en place. */
require('./publication.js')(OUT, COMMUN_JS_PAGES).catch(e => { console.error(e.message); process.exitCode = 1; });

/* ════════════════════════════════════════════════════════════════
   LUMEN VERITATIS — ADMINISTRATION
   Couche d'application (tous les visiteurs) + panneau d'administration
   (admin uniquement). Toute l'édition se fait dans le panneau ;
   les pages du site restent en lecture pure.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (typeof firebase === 'undefined') return;
  var FB = { apiKey: "AIzaSyC19lFNWUd-KYhCP4o7gpp0IcyfRTyHOyA", authDomain: "lumen-veritatis.firebaseapp.com", projectId: "lumen-veritatis", storageBucket: "lumen-veritatis.firebasestorage.app", messagingSenderId: "195902823875", appId: "1:195902823875:web:a8be1f216a5ae1d945f176" };
  if (!firebase.apps.length) firebase.initializeApp(FB);
  if (typeof firebase.firestore !== 'function') return;
  var db = firebase.firestore(), auth = firebase.auth();
  var ADMIN = 'hoarauemmanuel336@gmail.com';
  var lang = (window.LUMEN && window.LUMEN.lang) || localStorage.getItem('lm_lang') || 'fr';
  var FR = lang !== 'en';
  var IDX = (function () { var x = window.LV_INDEX; if (!x) return null; return x.articles ? x : (x[lang] || x.fr || null); })();

  function qsa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function T(fr, en) { return FR ? fr : en; }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  var artEl = document.querySelector('article.lecture[data-article]');
  var PAGE = artEl ? 'article'
    : qsa('.dom[data-theme]').length ? 'biblio'
    : (qsa('[data-lv-txt]').length || qsa('.domaine[data-theme]').length) ? 'accueil'
    : (document.getElementById('app') && typeof PRE !== 'undefined') ? 'memoriser'
    : 'autre';

  /* ════════ FEUILLE DE STYLE ════════ */
  var CSS = [
    ':root{--lvaL:var(--filet, rgba(231,224,207,.18));--lvaL2:var(--filet-fort, rgba(231,224,207,.5));--lvaG:var(--or,#efe6cf);--lvaT:var(--parchemin,#efeada);--lvaM:#9a958a;--lvaBG:var(--encre,#0a0908);--lvaBG2:var(--encre-2,#0d0c0a)}',
    '.auth-modal{border:1px solid var(--lvaL)!important;box-shadow:0 32px 90px rgba(0,0,0,.8)!important;position:relative}',
    '.auth-modal::before,.auth-modal::after{content:"";position:absolute;width:14px;height:14px;pointer-events:none}',
    '.auth-modal::before{top:-1px;left:-1px;border-top:1px solid var(--lvaL2);border-left:1px solid var(--lvaL2)}',
    '.auth-modal::after{bottom:-1px;right:-1px;border-bottom:1px solid var(--lvaL2);border-right:1px solid var(--lvaL2)}',
    '.lva-acc-sep{height:1px;background:linear-gradient(to right,transparent,var(--lvaL2),transparent);margin:22px 0 16px}',
    '.lva-acc-lab{font-family:"Cormorant Garamond",serif;font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:var(--lvaM);text-align:center;margin-bottom:12px}',
    '.lva-acc-btn{display:block;width:100%;text-align:center;background:none;border:1px solid var(--lvaL);color:var(--lvaT);font-family:"Cormorant Garamond",serif;font-size:14px;letter-spacing:.1em;text-transform:uppercase;padding:10px;margin-top:8px;cursor:pointer;transition:border-color .25s,color .25s}',
    '.lva-acc-btn:hover{border-color:var(--lvaG);color:#fff}',
    '#lva-dock{position:fixed;right:20px;bottom:20px;z-index:100040;font-family:"Cormorant Garamond",serif}',
    '#lva-dock-b{width:46px;height:46px;display:flex;align-items:center;justify-content:center;background:var(--lvaBG2);border:1px solid var(--lvaL);color:var(--lvaG);font-size:20px;cursor:pointer;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);box-shadow:0 10px 30px rgba(0,0,0,.5);transition:border-color .25s,box-shadow .25s;user-select:none}',
    '#lva-dock-b:hover{border-color:var(--lvaL2);box-shadow:0 12px 36px rgba(0,0,0,.65)}',
    '#lva-dock-m{position:absolute;right:0;bottom:56px;min-width:258px;background:var(--lvaBG);border:1px solid var(--lvaL);box-shadow:0 24px 70px rgba(0,0,0,.75);display:none}',
    '#lva-dock-m.on{display:block}',
    '.lva-dock-t{font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:var(--lvaM);padding:13px 16px 9px;border-bottom:1px solid var(--lvaL)}',
    '.lva-dock-i{display:block;width:100%;text-align:left;background:none;border:none;border-bottom:1px solid rgba(231,224,207,.08);color:var(--lvaT);font-family:"Cormorant Garamond",serif;font-size:15px;letter-spacing:.05em;padding:12px 16px;cursor:pointer;transition:background .2s,color .2s}',
    '.lva-dock-i:hover{background:rgba(231,224,207,.06);color:#fff}',
    '.lva-dock-i:last-child{border-bottom:none}',
    '.lva-dock-i small{display:block;font-family:"EB Garamond",serif;font-size:12.5px;color:var(--lvaM);letter-spacing:.02em;margin-top:2px}',
    'body.lva-dragging{cursor:grabbing!important;user-select:none}',
    'body.lva-dragging *{cursor:grabbing!important}',
    '.lva-ghost{opacity:.28;outline:1px dashed var(--lvaL2)!important;outline-offset:2px}',
    '.lva-grab{cursor:grab}',
    '.lva-grip{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;color:rgba(231,224,207,.5);cursor:grab;font-size:15px;user-select:none;flex:none;touch-action:none}',
    '.lva-grip:hover{color:var(--lvaG)}',
    '.lva-x{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;color:rgba(154,59,59,.85);border:1px solid rgba(154,59,59,.4);cursor:pointer;font-size:13px;flex:none;background:none;transition:border-color .2s,color .2s}',
    '.lva-x:hover{color:#d77;border-color:#9a3b3b}',
    '.lva-addcat{display:inline-block;margin:14px 0 6px;border:1px dashed var(--lvaL);color:var(--lvaM);font-family:"Cormorant Garamond",serif;font-size:13px;letter-spacing:.12em;text-transform:uppercase;padding:10px 18px;cursor:pointer;transition:color .2s,border-color .2s}',
    '.lva-addcat:hover{color:var(--lvaG);border-color:var(--lvaL2)}',
    '.lva-page{position:fixed;inset:0;z-index:100050;background:var(--lvaBG);overflow:auto;font-family:"EB Garamond",Georgia,serif;color:var(--lvaT)}',
    '.lva-wrap{max-width:1060px;margin:0 auto;padding:34px 26px 90px}',
    '.lva-head{display:flex;align-items:baseline;justify-content:space-between;gap:16px;border-bottom:1px solid var(--lvaL);padding-bottom:18px;margin-bottom:6px}',
    '.lva-h1{font-family:"Cormorant Garamond",serif;font-size:26px;letter-spacing:.2em;text-transform:uppercase;color:#fff;margin:0}',
    '.lva-h1 i{font-style:normal;color:var(--lvaG);margin-right:12px}',
    '.lva-close{font-family:"EB Garamond",serif;font-size:15px;color:var(--lvaM);background:none;border:1px solid var(--lvaL);padding:8px 16px;cursor:pointer;letter-spacing:.06em;transition:color .2s,border-color .2s}',
    '.lva-close:hover{color:#fff;border-color:var(--lvaL2)}',
    '.lva-tabs{display:flex;flex-wrap:wrap;border-bottom:1px solid var(--lvaL);margin-bottom:30px}',
    '.lva-tab{background:none;border:none;border-bottom:2px solid transparent;color:var(--lvaM);font-family:"Cormorant Garamond",serif;font-size:14px;letter-spacing:.14em;text-transform:uppercase;padding:13px 18px;cursor:pointer;transition:color .2s,border-color .2s}',
    '.lva-tab:hover{color:var(--lvaT)}',
    '.lva-tab.on{color:var(--lvaG);border-bottom-color:var(--lvaG)}',
    '.lva-sec-t{font-family:"Cormorant Garamond",serif;font-size:13px;letter-spacing:.22em;text-transform:uppercase;color:var(--lvaM);margin:28px 0 14px}',
    '.lva-note{font-size:14.5px;color:var(--lvaM);line-height:1.6;margin:6px 0 18px}',
    '.lva-in,.lva-ta{width:100%;box-sizing:border-box;background:var(--lvaBG2);color:var(--lvaT);border:1px solid var(--lvaL);font-family:"EB Garamond",serif;font-size:15.5px;padding:10px 12px;transition:border-color .2s}',
    '.lva-in:focus,.lva-ta:focus{border-color:var(--lvaL2);outline:none}',
    '.lva-ta{resize:vertical;line-height:1.55}',
    '.lva-lab{display:block;font-family:"Cormorant Garamond",serif;font-size:11.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--lvaM);margin:16px 0 6px}',
    '.lva-row2{display:grid;grid-template-columns:1fr 1fr;gap:14px}',
    '@media(max-width:640px){.lva-row2{grid-template-columns:1fr}}',
    '.lva-btn{display:inline-block;background:var(--lvaG);color:var(--lvaBG);border:none;font-family:"Cormorant Garamond",serif;font-size:14px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;padding:12px 26px;cursor:pointer;transition:background .2s}',
    '.lva-btn:hover{background:var(--or-pale,#f8f3e6)}',
    '.lva-btn2{display:inline-block;background:none;color:var(--lvaT);border:1px solid var(--lvaL);font-family:"Cormorant Garamond",serif;font-size:13.5px;letter-spacing:.1em;text-transform:uppercase;padding:11px 20px;cursor:pointer;transition:border-color .2s,color .2s}',
    '.lva-btn2:hover{border-color:var(--lvaL2);color:#fff}',
    '.lva-btn3{display:inline-block;background:none;color:#c98a8a;border:1px solid rgba(154,59,59,.45);font-family:"Cormorant Garamond",serif;font-size:13px;letter-spacing:.08em;text-transform:uppercase;padding:11px 18px;cursor:pointer;transition:border-color .2s,color .2s}',
    '.lva-btn3:hover{border-color:#9a3b3b;color:#e3a4a4}',
    '.lva-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:24px;align-items:center}',
    '.lva-stat{font-size:14px;color:var(--lvaM);min-height:18px}',
    '.lva-stick{position:sticky;bottom:0;background:var(--lvaBG);border-top:1px solid var(--lvaL);padding:14px 0;margin-top:30px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;z-index:5}',
    '.lva-color-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px 22px}',
    '.lva-color{display:flex;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid rgba(231,224,207,.08);padding:9px 2px}',
    '.lva-color span{font-size:15px}',
    '.lva-color input[type=color]{width:52px;height:30px;background:var(--lvaBG2);border:1px solid var(--lvaL);padding:1px;cursor:pointer}',
    '.lva-chip{display:inline-block;background:none;border:1px solid var(--lvaL);color:var(--lvaM);font-family:"Cormorant Garamond",serif;font-size:12.5px;letter-spacing:.1em;text-transform:uppercase;padding:8px 15px;cursor:pointer;margin:0 6px 8px 0;transition:all .2s}',
    '.lva-chip.on{background:var(--lvaG);color:var(--lvaBG);border-color:var(--lvaG)}',
    '.lva-chip:hover{border-color:var(--lvaL2)}',
    '.lva-mono{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12.5px;line-height:1.5;color:#cfc9bb}',
    '.lva-li{border:1px solid rgba(231,224,207,.12);border-bottom:none}',
    '.lva-li:last-of-type{border-bottom:1px solid rgba(231,224,207,.12)}',
    '.lva-li-h{display:flex;align-items:center;gap:14px;padding:13px 16px;cursor:pointer;transition:background .2s}',
    '.lva-li-h:hover{background:rgba(231,224,207,.04)}',
    '.lva-li-t{flex:1;font-size:16.5px;color:var(--lvaT)}',
    '.lva-li-b{font-family:"Cormorant Garamond",serif;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--lvaM);border:1px solid rgba(231,224,207,.15);padding:3px 9px;white-space:nowrap}',
    '.lva-li-dot{width:6px;height:6px;border-radius:50%;background:var(--lvaG);flex:none}',
    '.lva-li-body{display:none;padding:6px 16px 22px;border-top:1px solid rgba(231,224,207,.1)}',
    '.lva-li.on .lva-li-body{display:block}',
    '.lva-fmtbar{display:flex;gap:6px;margin:14px 0 10px;flex-wrap:wrap}',
    '.lva-fmt{min-width:42px;text-align:center;background:none;border:1px solid var(--lvaL);color:var(--lvaT);font-family:"Cormorant Garamond",serif;font-size:15px;padding:8px 10px;cursor:pointer;transition:all .2s}',
    '.lva-fmt:hover{border-color:var(--lvaL2);color:#fff}',
    '.lva-doc{background:var(--lvaBG2);border:1px solid var(--lvaL);padding:26px 30px;line-height:1.75;font-size:17px;color:var(--lvaT);min-height:260px;outline:none}',
    '.lva-doc:focus{border-color:var(--lvaL2)}',
    '.lva-doc h2{font-family:"Cormorant Garamond",serif;font-size:21px;letter-spacing:.12em;text-transform:uppercase;color:var(--lvaG);margin:30px 0 14px;font-weight:500}',
    '.lva-doc p{margin:0 0 16px}',
    '.lva-doc .ref{color:var(--lvaG);font-style:italic}',
    '.lva-doc blockquote{border-left:2px solid var(--lvaL2);margin:18px 0;padding:4px 0 4px 18px;color:var(--lvaM)}',
    '.lva-link{color:var(--lvaG);text-decoration:none;border-bottom:1px solid rgba(239,230,207,.3);font-size:13.5px;font-family:"EB Garamond",serif}',
    '.lva-link:hover{border-bottom-color:var(--lvaG)}',
    '.lva-cat{border:1px solid rgba(231,224,207,.14);margin-bottom:12px;background:rgba(255,255,255,.012)}',
    '.lva-cat-h{display:flex;align-items:center;gap:10px;padding:11px 12px;flex-wrap:wrap}',
    '.lva-cat-n{font-size:13px;color:var(--lvaM);white-space:nowrap;font-family:"Cormorant Garamond",serif;letter-spacing:.06em}',
    '.lva-chev{width:26px;height:26px;display:inline-flex;align-items:center;justify-content:center;color:var(--lvaM);cursor:pointer;font-family:ui-monospace,monospace;flex:none;transition:transform .25s,color .2s}',
    '.lva-chev:hover{color:var(--lvaG)}',
    '.lva-cat.on .lva-chev{transform:rotate(90deg)}',
    '.lva-cat-b{display:none;padding:4px 14px 16px;min-height:24px}',
    '.lva-cat.on .lva-cat-b{display:block}',
    '.lva-aut > .lva-cat-h .lva-aut-lab{font-family:"Cormorant Garamond",serif;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:var(--lvaM);flex:1}',
    '.lva-art{display:flex;align-items:center;gap:10px;border:1px solid rgba(231,224,207,.1);background:rgba(0,0,0,.3);padding:7px 10px;margin:6px 0;font-size:15.5px}',
    '.lva-art-t{flex:1;color:var(--lvaT)}',
    '.lva-bth{border-top:1px solid var(--lvaL);padding-top:6px;margin-top:36px}',
    '.lva-v{border-left:2px solid rgba(231,224,207,.18);padding:10px 0 10px 12px;margin:10px 0;background:rgba(0,0,0,.25)}',
    '.lva-v-h{display:flex;align-items:center;gap:8px;margin-bottom:8px}',
    '.lva-v-g{display:grid;grid-template-columns:170px 1fr;gap:8px;margin-bottom:6px}',
    '@media(max-width:560px){.lva-v-g{grid-template-columns:1fr}}',
    '.lva-toast{position:fixed;left:50%;bottom:30px;transform:translateX(-50%);z-index:100090;background:var(--lvaBG2);border:1px solid var(--lvaL2);color:var(--lvaT);font-family:"Cormorant Garamond",serif;font-size:14px;letter-spacing:.08em;padding:12px 26px;box-shadow:0 18px 50px rgba(0,0,0,.7);opacity:0;transition:opacity .35s;pointer-events:none}',
    '.lva-toast.on{opacity:1}',
    '.lva-mv{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;color:rgba(231,224,207,.55);border:1px solid var(--lvaL);cursor:pointer;font-size:13px;flex:none;background:none;transition:border-color .2s,color .2s}',
    '.lva-mv:hover{color:var(--lvaG);border-color:var(--lvaL2)}',
    '.lva-veil{position:fixed;inset:0;z-index:100110;background:rgba(0,0,0,.45)}',
    '.lva-pick{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:100120;background:var(--lvaBG);border:1px solid var(--lvaL2);min-width:280px;max-width:92vw;max-height:70vh;overflow:auto;box-shadow:0 28px 80px rgba(0,0,0,.75)}',
    '.lva-pick-t{font-family:"Cormorant Garamond",serif;font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:var(--lvaM);padding:14px 16px;border-bottom:1px solid var(--lvaL)}',
    '.lva-pick-g{font-family:"Cormorant Garamond",serif;font-size:11.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--lvaM);padding:12px 16px 4px}',
    '.lva-pick-i{display:block;width:100%;text-align:left;background:none;border:none;border-bottom:1px solid rgba(231,224,207,.07);color:var(--lvaT);font-family:"EB Garamond",serif;font-size:15px;padding:10px 16px;cursor:pointer;transition:background .2s}',
    '.lva-pick-i:hover{background:rgba(231,224,207,.06)}',
    '.lva-doc a{color:var(--lvaG);text-decoration:underline;text-underline-offset:3px}',
    '.lva-sec-chev{display:inline-block;margin-right:10px;color:var(--lvaM);font-size:15px;transition:transform .25s ease;vertical-align:middle}',
    '.lva-bth.dom-open > .lva-sec-t .lva-sec-chev{transform:rotate(90deg)}',
    '.lva-bth > .lva-row2,.lva-bth > .lva-bth-cats,.lva-bth > .lva-addcat{display:none}',
    '.lva-bth.dom-open > .lva-row2,.lva-bth.dom-open > .lva-bth-cats,.lva-bth.dom-open > .lva-addcat{display:block}'
  ].join('\n');
  var styleTag = el('style'); styleTag.id = 'lva-style'; styleTag.textContent = CSS;
  (document.head || document.documentElement).appendChild(styleTag);

  /* ════════ COUCHE D'APPLICATION (tous les visiteurs — inchangée) ════════ */
  var apNode = null;
  function apStyle() { if (!apNode) { apNode = el('style'); apNode.id = 'lv-apparence'; document.head.appendChild(apNode); } return apNode; }
  var AP_VARS = [['encre', '--encre'], ['encre2', '--encre-2'], ['parchemin', '--parchemin'], ['parchemin_att', '--parchemin-att'], ['or', '--or'], ['or_pale', '--or-pale'], ['pourpre', '--pourpre'], ['filet', '--filet'], ['filet_fort', '--filet-fort']];
  var TITRES_SEL = 'h1,h2,h3,h4,h5,h6,.marque,.dom-nom,.sous-nom,.titre-section h2,.domaine h3,.bandeau-page h1,.auth-m-title,.lecture h1';
  function applyApparence(d) {
    d = d || {}; var v = d.vars || {};
    AP_VARS.forEach(function (x) { if (v[x[0]]) document.documentElement.style.setProperty(x[1], v[x[0]]); else document.documentElement.style.removeProperty(x[1]); });
    if (v.filet_fort) document.documentElement.style.setProperty('--filet-f', v.filet_fort); else document.documentElement.style.removeProperty('--filet-f');
    if (v.encre2) document.documentElement.style.setProperty('--encre-3', v.encre2); else document.documentElement.style.removeProperty('--encre-3');
    if (d.fond) document.documentElement.style.setProperty('--encre', d.fond);
    if (d.texte) document.documentElement.style.setProperty('--parchemin', d.texte);
    if (d.accent) document.documentElement.style.setProperty('--or', d.accent);
    document.body.style.fontFamily = d.police_corps || d.police || '';
    document.body.style.fontSize = d.taille || '';
    if (d.image) { document.body.style.backgroundImage = 'url("' + d.image + '")'; document.body.style.backgroundSize = 'cover'; document.body.style.backgroundPosition = 'center'; document.body.style.backgroundAttachment = 'fixed'; }
    else document.body.style.backgroundImage = '';
    var x = '';
    if (d.police_titres) x += TITRES_SEL + '{font-family:' + d.police_titres + ' !important}';
    if (d.css) x += d.css;
    apStyle().textContent = x;
  }
  function resumeHtml(t) {
    if (t.length <= 195) return '<p>' + esc(t) + '</p>';
    var cut = t.lastIndexOf(' ', 150); if (cut < 100) cut = 150;
    var court = t.slice(0, cut).replace(/[\s,;:\u2013\u2014-]+$/, '');
    var more = T('voir plus', 'see more'), less = T('voir moins', 'see less');
    return '<p class="resume r-trunc"><span class="r-court">' + esc(court) + '\u2026</span><span class="r-full" hidden>' + esc(t) + '</span> <span class="voir-plus" role="button" tabindex="0" data-more="' + more + '" data-less="' + less + '">' + more + '</span></p>';
  }
  var contMap = null;
  function applyCards() {
    qsa('a.article-lien[data-card]').forEach(function (card) {
      var d = contMap && contMap[card.getAttribute('data-card')]; if (!d) return;
      var t = d['titre_' + lang]; if (typeof t === 'string' && t) { var h = card.querySelector('h3'); if (h) h.textContent = t; }
      var r = d['resume_' + lang]; if (typeof r === 'string' && r) { var p = card.querySelector('p'); if (p) p.outerHTML = resumeHtml(r); }
    });
  }
  function applyArticle(d) {
    if (!artEl || !d) return;
    var h1 = artEl.querySelector('h1');
    var t = d['titre_' + lang]; if (typeof t === 'string' && t && h1) h1.textContent = t;
    var b = d['contenu_' + lang];
    if (typeof b === 'string' && b) {
      Array.prototype.slice.call(artEl.children).forEach(function (k) { if (k !== h1) k.remove(); });
      if (h1) h1.insertAdjacentHTML('afterend', b); else artEl.innerHTML = b;
    }
  }
  function relocaliser() {
    if (!contMap) return;
    var parTheme = {}; qsa('.dom[data-theme]').forEach(function (d) { parTheme[d.getAttribute('data-theme')] = d; });
    qsa('a.article-lien[data-card]').forEach(function (card) {
      var d = contMap[card.getAttribute('data-card')]; if (!d || !d.theme) return;
      var cur = card.closest('.dom[data-theme]'); cur = cur ? cur.getAttribute('data-theme') : null;
      if (cur === d.theme) return;
      var dest = parTheme[d.theme]; if (!dest) return;
      var corps = dest.querySelector('.dom-corps'); if (corps) corps.appendChild(card);
    });
  }
  function creerSous(cid, nm) {
    var s = el('div', 'sous'); s.setAttribute('data-cat', cid);
    s.innerHTML = '<div class="sous-tete"><span class="sous-puce" aria-hidden="true"></span><span class="sous-nom"></span><span class="sous-chevron" aria-hidden="true">\u203A</span></div><div class="sous-corps"></div>';
    s.querySelector('.sous-nom').textContent = nm || '';
    s.querySelector('.sous-tete').addEventListener('click', function () { s.classList.toggle('ouvert'); });
    return s;
  }
  function applyThemes(d) {
    d = d || {}; var noms = d.noms || {}, struct = d.struct || {}, cats = d.cats || {}, ordre = d.ordre || {};
    qsa('.dom[data-theme]').forEach(function (dom) {
      var th = dom.getAttribute('data-theme');
      var nm = noms[th]; if (nm && nm['nom_' + lang]) { var h = dom.querySelector('.dom-nom'); if (h) h.textContent = nm['nom_' + lang]; }
      var corps = dom.querySelector('.dom-corps'); if (!corps) return;
      var st = struct[th];
      if (st) {
        var m = {}; qsa('a.article-lien[data-card]', corps).forEach(function (c) { var sl = c.getAttribute('data-card'); if (!m[sl]) m[sl] = c; else c.remove(); });
        var used = {}, exist = {};
        qsa('.sous[data-cat]', corps).forEach(function (s) { exist[s.getAttribute('data-cat')] = s; });
        (st.order || []).forEach(function (cid) {
          var sous = exist[cid]; delete exist[cid];
          var nmS = (st.names || {})[cid];
          if (!sous) sous = creerSous(cid, nmS && nmS['nom_' + lang]);
          else if (nmS && nmS['nom_' + lang]) { var sn = sous.querySelector('.sous-nom'); if (sn) sn.textContent = nmS['nom_' + lang]; }
          corps.appendChild(sous);
          var sc = sous.querySelector('.sous-corps');
          ((st.arts || {})[cid] || []).forEach(function (sl) { if (m[sl] && !used[sl]) { sc.appendChild(m[sl]); used[sl] = 1; } });
        });
        Object.keys(exist).forEach(function (cid) { exist[cid].remove(); });
        (((st.arts || {})['__autres']) || []).forEach(function (sl) { if (m[sl] && !used[sl]) { corps.appendChild(m[sl]); used[sl] = 1; } });
        Object.keys(m).forEach(function (sl) { if (!used[sl]) corps.appendChild(m[sl]); });
      } else {
        qsa('.sous[data-cat]', dom).forEach(function (sous) {
          var k = th + '::' + sous.getAttribute('data-cat');
          if (cats[k] && cats[k]['nom_' + lang]) { var sn = sous.querySelector('.sous-nom'); if (sn) sn.textContent = cats[k]['nom_' + lang]; }
          var ord = ordre[k], sc = sous.querySelector('.sous-corps');
          if (ord && ord.length && sc) ord.forEach(function (sl) { var c = sc.querySelector('a[data-card="' + sl + '"]'); if (c) sc.appendChild(c); });
        });
      }
    });
    qsa('.domaine[data-theme]').forEach(function (a) {
      var nm = noms[a.getAttribute('data-theme')]; if (!nm) return;
      if (nm['nom_' + lang]) { var h = a.querySelector('h3'); if (h) h.textContent = nm['nom_' + lang]; }
      if (nm['desc_' + lang]) { var p = a.querySelector('p'); if (p) p.textContent = nm['desc_' + lang]; }
    });
  }
  function applyAccueil(d) {
    d = d || {};
    qsa('[data-lv-txt]').forEach(function (e) {
      var o = d[e.getAttribute('data-lv-txt')];
      if (o && typeof o['t_' + lang] === 'string' && o['t_' + lang]) e.textContent = o['t_' + lang];
    });
  }
  function ouvrirLecture(slug) {
    var d = contMap && contMap[slug]; if (!d) return;
    var ov = el('div', 'lva-page'); ov.style.zIndex = '100060';
    var w = el('div', 'lva-wrap');
    var close = el('button', 'lva-close'); close.type = 'button'; close.textContent = T('Fermer', 'Close');
    close.style.cssText = 'float:right;margin:0 0 16px 16px';
    close.addEventListener('click', function () { ov.remove(); try { history.replaceState(null, '', location.pathname); } catch (_) {} });
    w.appendChild(close);
    var art = el('article', 'lecture');
    var h1 = el('h1'); h1.textContent = d['titre_' + lang] || d.titre_fr || ''; art.appendChild(h1);
    h1.insertAdjacentHTML('afterend', d['contenu_' + lang] || d.contenu_fr || '<p></p>');
    w.appendChild(art); ov.appendChild(w);
    document.body.appendChild(ov);
  }
  function cartesCreees() {
    if (!contMap) return;
    var parTheme = {}; qsa('.dom[data-theme]').forEach(function (d) { parTheme[d.getAttribute('data-theme')] = d; });
    Object.keys(contMap).forEach(function (slug) {
      var d = contMap[slug]; if (!d || !d.cree) return;
      if (document.querySelector('a.article-lien[data-card="' + slug + '"]')) return;
      var dest = parTheme[d.theme]; if (!dest) { var ks = Object.keys(parTheme); dest = ks.length ? parTheme[ks[0]] : null; }
      if (!dest) return;
      var corps = dest.querySelector('.dom-corps'); if (!corps) return;
      var a = el('a', 'article-lien'); a.setAttribute('data-card', slug); a.href = '?lire=' + slug;
      var h = el('h3'); h.textContent = d['titre_' + lang] || d.titre_fr || slug; a.appendChild(h);
      a.insertAdjacentHTML('beforeend', resumeHtml(d['resume_' + lang] || d.resume_fr || ''));
      a.addEventListener('click', function (e) { e.preventDefault(); ouvrirLecture(slug); });
      corps.appendChild(a);
    });
  }
  function gdoc(p) { return db.doc(p).get().then(function (s) { return s.exists ? s.data() : null; }).catch(function () { return null; }); }
  gdoc('config/apparence').then(function (d) { if (d) applyApparence(d); });
  if (PAGE === 'article') db.collection('contenu').doc(artEl.getAttribute('data-article')).get().then(function (s) { if (s.exists) applyArticle(s.data()); }).catch(function () {});
  if (PAGE === 'biblio') {
    Promise.all([gdoc('config/themes'), db.collection('contenu').get().catch(function () { return null; })]).then(function (r) {
      contMap = {}; if (r[1]) r[1].forEach(function (d) { contMap[d.id] = d.data(); });
      cartesCreees(); relocaliser(); applyThemes(r[0]); applyCards();
      var mL = location.search.match(/[?&]lire=([a-z0-9-]+)/); if (mL && contMap[mL[1]]) ouvrirLecture(mL[1]);
    });
  }
  if (PAGE === 'accueil') Promise.all([gdoc('config/themes'), gdoc('config/accueil')]).then(function (r) { applyThemes(r[0]); applyAccueil(r[1]); });

  /* ════════ NOYAU ADMIN : TOAST, GLISSER (corrigé), ANNULER ════════ */
  var isAdmin = false, dock = null, dirty = false, UNDO = [];
  function markDirty() { dirty = true; }
  var toastEl = null, toastTimer = null;
  function toast(msg) {
    if (!toastEl) { toastEl = el('div', 'lva-toast'); document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('on');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove('on'); }, 2600);
  }
  /* Moteur de glisser au pointeur.
     Corrections de fond : écouteurs sur window (pas de setPointerCapture,
     qui se perd quand l'élément change de parent), drag natif neutralisé,
     défilement automatique continu pendant le geste. */
  function dragify(handle, item, o) {
    handle.style.touchAction = 'none'; handle.classList.add('lva-grab');
    item.setAttribute('draggable', 'false');
    item.addEventListener('dragstart', function (e) { e.preventDefault(); });
    handle.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (e.target.isContentEditable) return;
      if (e.target.closest && e.target.closest('.lva-x,.lva-chev,input,select,textarea,button')) return;
      e.preventDefault();
      var sx = e.clientX, sy = e.clientY, started = false, clone = null, dx = 0, dy = 0, lastEv = e, timer = null;
      var orig = { p: item.parentNode, n: item.nextSibling };
      function begin() {
        started = true;
        var r = item.getBoundingClientRect(); dx = sx - r.left; dy = sy - r.top;
        clone = item.cloneNode(true);
        clone.style.cssText = 'position:fixed;left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px;margin:0;z-index:100100;pointer-events:none;opacity:.94;box-shadow:0 22px 60px rgba(0,0,0,.75);background:#0b0a08;overflow:hidden;box-sizing:border-box';
        document.body.appendChild(clone);
        item.classList.add('lva-ghost'); document.body.classList.add('lva-dragging');
        timer = setInterval(defile, 50);
      }
      function defile() {
        var ev = lastEv; if (!ev || !started) return;
        var scr = o.scroller && o.scroller();
        if (scr) {
          var sb = scr.getBoundingClientRect();
          if (ev.clientY < sb.top + 85) scr.scrollTop -= 18;
          else if (ev.clientY > sb.bottom - 85) scr.scrollTop += 18;
          else return;
        } else {
          if (ev.clientY < 85) window.scrollBy(0, -18);
          else if (ev.clientY > innerHeight - 85) window.scrollBy(0, 18);
          else return;
        }
        placer(ev);
      }
      function placer(ev) {
        var cs = o.containers(), tgt = null;
        for (var i = 0; i < cs.length; i++) { var b = cs[i].getBoundingClientRect(); if (ev.clientX >= b.left - 12 && ev.clientX <= b.right + 12 && ev.clientY >= b.top - 10 && ev.clientY <= b.bottom + 10) { tgt = cs[i]; break; } }
        if (!tgt) return;
        var its = o.items(tgt).filter(function (x) { return x !== item; }), ref = null;
        for (var j = 0; j < its.length; j++) { var rb = its[j].getBoundingClientRect(); if (ev.clientY < rb.top + rb.height / 2) { ref = its[j]; break; } }
        if (!ref && o.beforeRef) ref = o.beforeRef(tgt);
        if (item.parentNode !== tgt || item.nextSibling !== ref) { if (ref) tgt.insertBefore(item, ref); else tgt.appendChild(item); }
      }
      function mv(ev) {
        lastEv = ev;
        if (!started) { if (Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) < 6) return; begin(); }
        if (ev.cancelable) ev.preventDefault();
        clone.style.left = (ev.clientX - dx) + 'px'; clone.style.top = (ev.clientY - dy) + 'px';
        placer(ev);
      }
      function up() {
        window.removeEventListener('pointermove', mv);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
        if (timer) clearInterval(timer);
        if (started) {
          if (clone) clone.remove();
          item.classList.remove('lva-ghost'); document.body.classList.remove('lva-dragging');
          if (item.parentNode !== orig.p || item.nextSibling !== orig.n) {
            UNDO.push(function () { if (orig.n && orig.n.parentNode === orig.p) orig.p.insertBefore(item, orig.n); else orig.p.appendChild(item); if (o.onMoved) o.onMoved(); });
            markDirty(); if (o.onMoved) o.onMoved();
          }
        }
      }
      window.addEventListener('pointermove', mv, { passive: false });
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
    });
  }
  function doUndo() { var f = UNDO.pop(); if (f) { try { f(); } catch (_) {} toast(T('Action annulée', 'Action undone')); } else toast(T('Rien à annuler', 'Nothing to undo')); }
  document.addEventListener('keydown', function (e) {
    if (!isAdmin || !UNDO.length) return;
    if (!(e.ctrlKey || e.metaKey) || (e.key !== 'z' && e.key !== 'Z')) return;
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    e.preventDefault(); doUndo();
  }, true);
  function slugifie(x) { return String(x || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
  function choisir(titre, groupes) {
    var veil = el('div', 'lva-veil'), pick = el('div', 'lva-pick');
    function fermer() { veil.remove(); pick.remove(); }
    veil.addEventListener('click', fermer);
    pick.appendChild(el('div', 'lva-pick-t', esc(titre)));
    groupes.forEach(function (g) {
      if (g.g) pick.appendChild(el('div', 'lva-pick-g', esc(g.g)));
      g.items.forEach(function (it) {
        var b = el('button', 'lva-pick-i'); b.type = 'button'; b.textContent = it.label;
        b.addEventListener('click', function () { fermer(); it.fn(); });
        pick.appendChild(b);
      });
    });
    document.body.appendChild(veil); document.body.appendChild(pick);
  }
  function editeurTexte() {
    var bar = el('div', 'lva-fmtbar');
    var doc = el('div', 'lva-doc'); doc.contentEditable = 'true';
    function fmtBtn(htmlLbl, title, fn) {
      var b = el('button', 'lva-fmt'); b.type = 'button'; b.innerHTML = htmlLbl; b.title = title;
      b.addEventListener('mousedown', function (e) { e.preventDefault(); });
      b.addEventListener('click', function () { doc.focus(); fn(); markDirty(); });
      bar.appendChild(b);
    }
    function ex(cmd, val) { try { document.execCommand(cmd, false, val || null); } catch (_) {} }
    fmtBtn('\u00B6', T('Paragraphe', 'Paragraph'), function () { ex('formatBlock', '<p>'); });
    fmtBtn('T', T('Intertitre', 'Heading'), function () { ex('formatBlock', '<h2>'); });
    fmtBtn('<i>I</i>', T('Italique', 'Italic'), function () { ex('italic'); });
    fmtBtn('<b>G</b>', T('Gras', 'Bold'), function () { ex('bold'); });
    fmtBtn('\u2020', T('Référence biblique (poser / retirer)', 'Scripture reference (set / remove)'), function () {
      var s = window.getSelection();
      var nd = s.anchorNode, base = nd && (nd.nodeType === 1 ? nd : nd.parentNode);
      var refEl = base && base.closest ? base.closest('span.ref') : null;
      if (refEl && doc.contains(refEl)) {
        while (refEl.firstChild) refEl.parentNode.insertBefore(refEl.firstChild, refEl);
        refEl.remove(); return;
      }
      if (!s.rangeCount || s.isCollapsed) { toast(T('Sélectionne d\u2019abord la référence', 'Select the reference first')); return; }
      var r = s.getRangeAt(0), span = el('span', 'ref');
      try { r.surroundContents(span); } catch (_) { ex('insertHTML', '<span class="ref">' + esc(s.toString()) + '</span>'); }
    });
    fmtBtn('\u2197', T('Lien (poser / retirer)', 'Link (set / remove)'), function () {
      var s = window.getSelection();
      var nd = s.anchorNode, base = nd && (nd.nodeType === 1 ? nd : nd.parentNode);
      var aEl = base && base.closest ? base.closest('a') : null;
      if (aEl && doc.contains(aEl)) {
        while (aEl.firstChild) aEl.parentNode.insertBefore(aEl.firstChild, aEl);
        aEl.remove(); return;
      }
      if (!s.rangeCount || s.isCollapsed) { toast(T('Sélectionne d\u2019abord le texte du lien', 'Select the link text first')); return; }
      var url = prompt(T('Adresse du lien (ex. /article/le-doigt-de-dieu/ ou https://\u2026)', 'Link address (e.g. /article/slug/ or https://\u2026)'), '');
      if (!url || !url.trim()) return;
      ex('createLink', url.trim());
    });
    return { bar: bar, doc: doc };
  }
  function memDeplacer(row) {
    var catEl = row.closest('.lva-cat'); var host = catEl ? catEl.parentNode : document;
    var items = [];
    qsa(':scope > .lva-cat', host).forEach(function (b) {
      if (b === catEl) return;
      var c = b.__c || {}, nm0 = c.name || {};
      var nom = (lang === 'fr' ? (nm0.fr || nm0.en) : (nm0.en || nm0.fr)) || '';
      if (!nom) { var i0 = b.querySelector('input'); if (i0 && i0.value.trim()) nom = i0.value.trim(); }
      if (!nom) nom = T('(sans nom)', '(unnamed)');
      items.push({ label: nom, fn: function () {
        var par = row.parentNode, nx = row.nextSibling;
        var body = b.querySelector('.lva-cat-b');
        if (!body.children.length && b.__fill) b.__fill();
        b.classList.add('on');
        var ref = body.querySelector(':scope > .lva-addcat');
        if (ref) body.insertBefore(row, ref); else body.appendChild(row);
        UNDO.push(function () { if (nx && nx.parentNode === par) par.insertBefore(row, nx); else par.appendChild(row); });
        markDirty();
        qsa('.lva-cat', host).forEach(function (bb) { if (bb.__majCnt) bb.__majCnt(); });
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } });
    });
    choisir(T('Déplacer le verset dans…', 'Move the verse to…'), [{ g: null, items: items }]);
  }

  /* ════════ PANNEAU CENTRAL ════════ */
  var hub = null, hubBody = null, hubTabs = {}, hubCache = {}, hubOpt = null;
  function openHub(tab, opt) { if (!hub) buildHub(); hubOpt = opt || null; hub.style.display = 'block'; selectTab(tab || 'accueil'); }
  function closeHub() { if (hub) hub.style.display = 'none'; UNDO = []; }
  function buildHub() {
    hub = el('div', 'lva-page'); hub.style.display = 'none';
    var w = el('div', 'lva-wrap'); hub.appendChild(w);
    var head = el('div', 'lva-head');
    head.appendChild(el('h1', 'lva-h1', '<i>\u2726</i>Administration'));
    var close = el('button', 'lva-close'); close.type = 'button'; close.textContent = T('Fermer', 'Close');
    close.addEventListener('click', function () {
      if (dirty && !confirm(T('Des modifications ne sont pas enregistrées. Fermer quand même ?', 'Unsaved changes. Close anyway?'))) return;
      dirty = false; closeHub();
    });
    head.appendChild(close);
    w.appendChild(head);
    var tabs = el('div', 'lva-tabs'); w.appendChild(tabs);
    hubBody = el('div'); w.appendChild(hubBody);
    [['accueil', T('Accueil', 'Home')], ['biblio', T('Bibliothèque', 'Library')], ['articles', T('Articles', 'Articles')], ['memoriser', 'Mémoriser'], ['apparence', T('Apparence', 'Appearance')], ['exporter', T('Exporter', 'Export')]].forEach(function (t) {
      var b = el('button', 'lva-tab'); b.type = 'button'; b.textContent = t[1];
      b.addEventListener('click', function () {
        if (dirty && !confirm(T('Des modifications ne sont pas enregistrées. Changer d\u2019onglet quand même ?', 'Unsaved changes. Switch tab anyway?'))) return;
        dirty = false; hubOpt = null; selectTab(t[0]);
      });
      tabs.appendChild(b); hubTabs[t[0]] = b;
    });
    document.body.appendChild(hub);
  }
  function selectTab(id) {
    Object.keys(hubTabs).forEach(function (k) { hubTabs[k].classList.toggle('on', k === id); });
    hubBody.innerHTML = ''; UNDO = [];
    var fns = { articles: tabArticles, biblio: tabBiblio, apparence: tabApparence, accueil: tabAccueil, memoriser: tabMemoriser, exporter: tabExport };
    fns[id]();
  }

  /* — onglet Articles : titre, résumé, domaine ET texte complet, sans code — */
  function tabArticles() {
    if (!IDX || !IDX.articles) { hubBody.appendChild(el('div', 'lva-note', T('Index indisponible sur cette page.', 'Index unavailable on this page.'))); return; }
    hubBody.appendChild(el('div', 'lva-note', T('Tous les articles, en un seul endroit. Le texte se modifie ici aussi, mis en forme, sans aucun code.', 'All articles in one place. The body is edited here too, formatted, without any code.')));
    var search = el('input', 'lva-in'); search.placeholder = T('Rechercher un article…', 'Search an article…'); search.style.margin = '0 0 16px';
    hubBody.appendChild(search);
    var btnNew = el('button', 'lva-btn2'); btnNew.type = 'button'; btnNew.textContent = T('+ Nouvel article', '+ New article'); btnNew.style.margin = '0 0 14px';
    hubBody.appendChild(btnNew);
    var zoneNew = el('div', 'lva-li on'); zoneNew.style.display = 'none';
    var zh = el('div', 'lva-li-h'); zh.appendChild(el('span', 'lva-li-t', esc(T('Nouvel article', 'New article')))); zoneNew.appendChild(zh);
    var zbody = el('div', 'lva-li-body'); zoneNew.appendChild(zbody);
    hubBody.appendChild(zoneNew);
    var zfait = false;
    btnNew.addEventListener('click', function () {
      zoneNew.style.display = (zoneNew.style.display === 'none') ? '' : 'none';
      if (zfait || zoneNew.style.display === 'none') return; zfait = true;
      remplirCreation(zbody);
    });
    function remplirCreation(body) {
      body.appendChild(el('label', 'lva-lab', T('Titre', 'Title')));
      var iT = el('input', 'lva-in'); body.appendChild(iT);
      body.appendChild(el('label', 'lva-lab', T('Résumé (vignette de la bibliothèque)', 'Summary (library card)')));
      var iR = el('textarea', 'lva-ta'); iR.rows = 3; body.appendChild(iR);
      body.appendChild(el('label', 'lva-lab', T('Domaine', 'Domain')));
      var sel = el('select', 'lva-in'); sel.style.cursor = 'pointer';
      (IDX.themes || []).forEach(function (t) { var op = el('option'); op.value = t.id; op.textContent = t.nom; sel.appendChild(op); });
      body.appendChild(sel);
      body.appendChild(el('label', 'lva-lab', T('Texte de l\u2019article', 'Article body')));
      var ed = editeurTexte(); var doc = ed.doc; doc.innerHTML = '<p></p>';
      body.appendChild(ed.bar); body.appendChild(doc);
      var act = el('div', 'lva-actions');
      var sv = el('button', 'lva-btn'); sv.type = 'button'; sv.textContent = T('Créer l\u2019article', 'Create the article');
      var st = el('span', 'lva-stat');
      act.appendChild(sv); act.appendChild(st); body.appendChild(act);
      body.appendChild(el('div', 'lva-note', T('L\u2019article apparaît aussitôt dans la bibliothèque et s\u2019ouvre en lecture sur place. Il deviendra une page complète du site, avec sa traduction anglaise, à la prochaine intégration des fichiers.', 'The article appears in the library immediately and opens in place. It becomes a full site page, with its translation, at the next file integration.')));
      [iT, iR].forEach(function (x) { x.addEventListener('input', markDirty); });
      sel.addEventListener('change', markDirty); doc.addEventListener('input', markDirty);
      sv.addEventListener('click', function () {
        var titre = iT.value.trim();
        if (!titre) { st.textContent = T('Donne d\u2019abord un titre.', 'Give it a title first.'); return; }
        var basId = slugifie(titre) || 'article';
        var pris = {}; (IDX.articles || []).forEach(function (a) { pris[a.id] = 1; });
        Object.keys(hubCache.contenu || {}).forEach(function (k) { pris[k] = 1; });
        var id = basId, k = 2; while (pris[id]) id = basId + '-' + (k++);
        var txt = doc.innerHTML.trim(), res = iR.value.trim();
        var d = { cree: true, theme: sel.value, titre_fr: titre, titre_en: titre, resume_fr: res, resume_en: res, contenu_fr: txt, contenu_en: txt };
        st.textContent = T('Création…', 'Creating…');
        db.collection('contenu').doc(id).set(d).then(function () {
          hubCache.contenu = hubCache.contenu || {}; hubCache.contenu[id] = d;
          dirty = false; st.textContent = T('Créé — visible dans la bibliothèque.', 'Created — visible in the library.');
          iT.value = ''; iR.value = ''; doc.innerHTML = '<p></p>';
          rendre();
        }).catch(function (e2) { st.textContent = T('Erreur : ', 'Error: ') + e2.message; });
      });
    }
    var list = el('div'); hubBody.appendChild(list);
    var thById = {}; (IDX.themes || []).forEach(function (t) { thById[t.id] = t.nom; });
    var voulu = hubOpt && hubOpt.slug; hubOpt = null;
    function rendre() {
      list.innerHTML = '';
      var q = (search.value || '').toLowerCase();
      var ov = hubCache.contenu || {};
      var connus = {}; IDX.articles.forEach(function (a) { connus[a.id] = 1; });
      var tous = IDX.articles.slice();
      Object.keys(ov).forEach(function (id) {
        var dd = ov[id]; if (!dd || !dd.cree || connus[id]) return;
        tous.push({ id: id, titre: dd['titre_' + lang] || dd.titre_fr || id, resume: dd['resume_' + lang] || '', theme: dd.theme || 'doctrine', u: ((IDX.urls && IDX.urls.biblio) || '/bibliotheque/') + '?lire=' + id, cree: true });
      });
      tous.forEach(function (a) {
        var o = ov[a.id] || {};
        var titre = o['titre_' + lang] || a.titre;
        if (q && (titre + ' ' + a.id).toLowerCase().indexOf(q) < 0) return;
        var li = el('div', 'lva-li'); li.__slug = a.id;
        var h = el('div', 'lva-li-h');
        if (ov[a.id]) { var dot = el('span', 'lva-li-dot'); dot.title = T('Modifié en ligne', 'Edited online'); h.appendChild(dot); }
        var tEl = el('span', 'lva-li-t'); tEl.textContent = titre; h.appendChild(tEl);
        var badge = el('span', 'lva-li-b'); badge.textContent = thById[o.theme || a.theme] || a.theme; h.appendChild(badge);
        if (a.cree) { var nb = el('span', 'lva-li-b'); nb.textContent = T('créé en ligne', 'created online'); nb.style.color = 'var(--lvaG)'; h.appendChild(nb); }
        li.appendChild(h);
        var body = el('div', 'lva-li-body'); li.appendChild(body);
        var filled = false;
        h.addEventListener('click', function () {
          if (li.classList.contains('on')) { li.classList.remove('on'); return; }
          if (dirty && !confirm(T('Des modifications ne sont pas enregistrées sur un autre article. Continuer ?', 'Unsaved changes on another article. Continue?'))) return;
          dirty = false;
          qsa('.lva-li.on', list).forEach(function (x) { x.classList.remove('on'); });
          li.classList.add('on');
          if (!filled) { filled = true; remplir(a, body, tEl, badge, thById); }
        });
        list.appendChild(li);
      });
      if (!list.children.length) list.appendChild(el('div', 'lva-note', T('Aucun article ne correspond.', 'No article matches.')));
      if (voulu) {
        var cible = null; qsa('.lva-li', list).forEach(function (x) { if (x.__slug === voulu) cible = x; });
        voulu = null;
        if (cible) { cible.querySelector('.lva-li-h').click(); setTimeout(function () { cible.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60); }
      }
    }
    function remplir(a, body, tEl, badge, thById) {
      body.appendChild(el('label', 'lva-lab', T('Titre', 'Title')));
      var iT = el('input', 'lva-in'); body.appendChild(iT);
      body.appendChild(el('label', 'lva-lab', T('Résumé (vignette de la bibliothèque)', 'Summary (library card)')));
      var iR = el('textarea', 'lva-ta'); iR.rows = 3; body.appendChild(iR);
      var rowMeta = el('div', 'lva-row2');
      var cD = el('div'); cD.appendChild(el('label', 'lva-lab', T('Domaine', 'Domain')));
      var sel = el('select', 'lva-in'); sel.style.cursor = 'pointer';
      (IDX.themes || []).forEach(function (t) { var op = el('option'); op.value = t.id; op.textContent = t.nom; sel.appendChild(op); });
      cD.appendChild(sel); rowMeta.appendChild(cD);
      var cV = el('div'); cV.appendChild(el('label', 'lva-lab', T('Page publique', 'Public page')));
      var voir = el('a', 'lva-link'); voir.textContent = T('Voir l\u2019article \u2197', 'View the article \u2197'); voir.href = a.u; voir.target = '_blank';
      cV.appendChild(voir); rowMeta.appendChild(cV);
      body.appendChild(rowMeta);
      body.appendChild(el('label', 'lva-lab', T('Texte de l\u2019article', 'Article body')));
      var ed = editeurTexte(); var doc = ed.doc;
      doc.innerHTML = '<p style="color:#9a958a">' + T('Chargement du texte…', 'Loading the text…') + '</p>';
      body.appendChild(ed.bar); body.appendChild(doc);
      var act = el('div', 'lva-actions');
      var sv = el('button', 'lva-btn'); sv.type = 'button'; sv.textContent = T('Enregistrer', 'Save');
      var st = el('span', 'lva-stat');
      act.appendChild(sv); act.appendChild(st); body.appendChild(act);
      iT.addEventListener('input', markDirty); iR.addEventListener('input', markDirty);
      sel.addEventListener('change', markDirty); doc.addEventListener('input', markDirty);
      /* préremplissage : override Firestore, sinon page publiée */
      db.collection('contenu').doc(a.id).get().then(function (s) {
        var o = s.exists ? s.data() : {};
        iT.value = o['titre_' + lang] || a.titre;
        iR.value = (typeof o['resume_' + lang] === 'string') ? o['resume_' + lang] : (a.resume || '');
        sel.value = o.theme || a.theme;
        var b = o['contenu_' + lang];
        if (typeof b === 'string' && b) { doc.innerHTML = b; return; }
        return fetch(a.u).then(function (r) { return r.text(); }).then(function (html) {
          var d = new DOMParser().parseFromString(html, 'text/html');
          var art = d.querySelector('article.lecture');
          if (!art) { doc.innerHTML = '<p></p>'; return; }
          var h1 = art.querySelector('h1'); if (h1) h1.remove();
          doc.innerHTML = art.innerHTML.trim() || '<p></p>';
        });
      }).catch(function () { doc.innerHTML = '<p></p>'; });
      sv.addEventListener('click', function () {
        var d = {};
        d['titre_' + lang] = iT.value.trim();
        d['resume_' + lang] = iR.value.trim();
        d['contenu_' + lang] = doc.innerHTML.trim();
        d.theme = sel.value;
        st.textContent = T('Enregistrement…', 'Saving…');
        db.collection('contenu').doc(a.id).set(d, { merge: true }).then(function () {
          hubCache.contenu = hubCache.contenu || {};
          hubCache.contenu[a.id] = Object.assign(hubCache.contenu[a.id] || {}, d);
          tEl.textContent = d['titre_' + lang] || a.titre;
          badge.textContent = thById[d.theme] || d.theme;
          dirty = false;
          st.textContent = T('Enregistré — visible par tous.', 'Saved — visible to everyone.');
        }).catch(function (e) { st.textContent = T('Erreur : ', 'Error: ') + e.message; });
      });
    }
    search.addEventListener('input', rendre);
    rendre();
    if (!hubCache.contenu) db.collection('contenu').get().then(function (qs) { hubCache.contenu = {}; qs.forEach(function (d) { hubCache.contenu[d.id] = d.data(); }); rendre(); }).catch(function () {});
  }

  /* — onglet Bibliothèque : domaines, catégories et rangement, tout en glisser — */
  function tabBiblio() {
    if (!IDX || !IDX.themes) { hubBody.appendChild(el('div', 'lva-note', T('Index indisponible.', 'Index unavailable.'))); return; }
    hubBody.appendChild(el('div', 'lva-note', T('Toute l\u2019organisation de la bibliothèque : noms et descriptions des domaines, catégories (glisser ☰ pour les ranger, même d\u2019un domaine à l\u2019autre), articles (glisser ⋮⋮ entre les catégories). Rien n\u2019est public avant Enregistrer.', 'The whole library organisation: domain names, categories (drag ☰), articles (drag ⋮⋮ between categories). Nothing is public before you save.')));
    var host = el('div'); hubBody.appendChild(host);
    var titreById = {};
    (IDX.articles || []).forEach(function (a) { titreById[a.id] = a.titre; });

    function rowArt(slug, ovTitres) {
      var r = el('div', 'lva-art'); r.__slug = slug;
      var g = el('span', 'lva-grip'); g.textContent = '\u22EE\u22EE'; g.style.fontSize = '11px'; r.appendChild(g);
      var t = el('span', 'lva-art-t'); t.textContent = (ovTitres[slug] || titreById[slug] || slug); r.appendChild(t);
      var mv = el('span', 'lva-mv'); mv.textContent = '\u21C4'; mv.title = T('Déplacer dans…', 'Move to…');
      mv.addEventListener('click', function (e) { e.stopPropagation(); deplacerArticle(r); });
      r.appendChild(mv);
      dragify(g, r, {
        containers: function () { return qsa('.lva-cat.on > .lva-cat-b', host); },
        items: function (c) { return qsa(':scope > .lva-art', c); },
        scroller: function () { return hub; },
        onMoved: majCnts
      });
      return r;
    }
    function majCnts() {
      qsa('.lva-cat', host).forEach(function (b) {
        var n = b.querySelector('.lva-cat-n'); if (n) n.textContent = qsa('.lva-art', b).length + T(' articles', ' articles');
      });
    }
    function blocCat(sec, cid, nom, slugs, ovTitres, aut) {
      var b = el('div', 'lva-cat' + (aut ? ' lva-aut' : '')); b.__cid = cid; b.__aut = !!aut;
      var h = el('div', 'lva-cat-h');
      var grip = el('span', 'lva-grip'); grip.textContent = '\u2630'; h.appendChild(grip);
      var chev = el('span', 'lva-chev'); chev.textContent = '\u203A'; h.appendChild(chev);
      if (aut) {
        var lab = el('span', 'lva-aut-lab'); lab.textContent = T('Sans catégorie', 'Uncategorized'); h.appendChild(lab);
        grip.style.visibility = 'hidden';
      } else {
        var iN = el('input', 'lva-in lva-cat-nom'); iN.value = nom || ''; iN.placeholder = T('Nom de la catégorie', 'Category name');
        iN.style.flex = '1'; iN.style.minWidth = '160px'; iN.style.width = 'auto';
        iN.addEventListener('input', markDirty); h.appendChild(iN);
      }
      var cnt = el('span', 'lva-cat-n'); h.appendChild(cnt);
      if (!aut) {
        var x = el('span', 'lva-x'); x.textContent = '\u2715'; x.title = T('Supprimer (articles \u2192 Sans catégorie)', 'Delete (articles \u2192 Uncategorized)');
        x.addEventListener('click', function () {
          if (!confirm(T('Supprimer cette catégorie ? Ses articles passent en « Sans catégorie ».', 'Delete this category? Its articles move to Uncategorized.'))) return;
          var auto = sec.querySelector('.lva-aut > .lva-cat-b');
          var par = b.parentNode, nx = b.nextSibling;
          var rows = qsa('.lva-art', b);
          rows.forEach(function (r) { auto.appendChild(r); });
          b.remove(); markDirty(); majCnts();
          UNDO.push(function () { if (nx && nx.parentNode === par) par.insertBefore(b, nx); else par.appendChild(b); var cb = b.querySelector('.lva-cat-b'); rows.forEach(function (r) { cb.appendChild(r); }); majCnts(); });
        });
        h.appendChild(x);
      }
      b.appendChild(h);
      var body = el('div', 'lva-cat-b'); b.appendChild(body);
      slugs.forEach(function (sl) { body.appendChild(rowArt(sl, ovTitres)); });
      chev.addEventListener('click', function () { b.classList.toggle('on'); });
      if (!aut) {
        dragify(grip, b, {
          containers: function () { return qsa('.lva-bth-cats', host); },
          items: function (c) { return qsa(':scope > .lva-cat:not(.lva-aut)', c); },
          beforeRef: function (c) { return c.querySelector(':scope > .lva-aut'); },
          scroller: function () { return hub; },
          onMoved: majCnts
        });
      }
      return b;
    }

    Promise.all([gdoc('config/themes'), db.collection('contenu').get().catch(function () { return null; })]).then(function (r) {
      var ov = r[0] || {}, noms = ov.noms || {}, struct = ov.struct || {};
      var ovTheme = {}, ovTitres = {}, creesB = [];
      if (r[1]) r[1].forEach(function (d) { var x = d.data(); if (x.theme) ovTheme[d.id] = x.theme; if (x['titre_' + lang]) ovTitres[d.id] = x['titre_' + lang]; if (x.cree) creesB.push(d.id); });
      var connusB = {}; (IDX.articles || []).forEach(function (a) { connusB[a.id] = 1; });
      var tousArts = (IDX.articles || []).slice();
      creesB.forEach(function (id) { if (!connusB[id]) { tousArts.push({ id: id, theme: ovTheme[id] || 'doctrine' }); if (!titreById[id]) titreById[id] = ovTitres[id] || id; } });
      var assigne = {}; tousArts.forEach(function (a) { assigne[a.id] = ovTheme[a.id] || a.theme; });
      var assigneInitial = Object.assign({}, assigne);
      function deplacerArticle(row) {
        var secs = qsa(':scope > *', host).filter(function (x) { return x.querySelector && x.querySelector('.lva-cat'); });
        var groupes = [];
        secs.forEach(function (sec, ix) {
          var tNom = (IDX.themes && IDX.themes[ix]) ? IDX.themes[ix].nom : '';
          var items = [];
          qsa('.lva-cat', sec).forEach(function (b) {
            if (row.parentNode && b.contains(row)) return;
            var nEl = b.querySelector('.lva-cat-nom');
            var label = b.__aut ? T('Sans catégorie', 'Uncategorized') : ((((nEl && nEl.value) || '').trim()) || T('(sans nom)', '(unnamed)'));
            items.push({ label: label, fn: function () {
              var par = row.parentNode, nx = row.nextSibling;
              b.classList.add('on');
              var corps = b.querySelector('.lva-cat-b'); if (!corps) return;
              corps.appendChild(row);
              UNDO.push(function () { if (nx && nx.parentNode === par) par.insertBefore(row, nx); else if (par) par.appendChild(row); majCnts(); });
              markDirty(); majCnts();
              row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } });
          });
          if (items.length) groupes.push({ g: tNom, items: items });
        });
        choisir(T('Déplacer l\u2019article dans…', 'Move the article to…'), groupes);
      }

      IDX.themes.forEach(function (t) {
        var sec = el('div', 'lva-bth'); sec.__th = t.id;
        sec.appendChild(el('div', 'lva-sec-t', esc(t.nom)));
        var rN = el('div', 'lva-row2');
        var c1 = el('div'); c1.appendChild(el('label', 'lva-lab', T('Nom du domaine', 'Domain name')));
        var iN = el('input', 'lva-in lva-bth-nom'); iN.value = (noms[t.id] && noms[t.id]['nom_' + lang]) || t.nom; iN.addEventListener('input', markDirty); c1.appendChild(iN);
        var c2 = el('div'); c2.appendChild(el('label', 'lva-lab', T('Description (accueil)', 'Description (home)')));
        var iD = el('textarea', 'lva-ta lva-bth-desc'); iD.rows = 2; iD.value = (noms[t.id] && noms[t.id]['desc_' + lang]) || t.desc || ''; iD.addEventListener('input', markDirty); c2.appendChild(iD);
        rN.appendChild(c1); rN.appendChild(c2); sec.appendChild(rN);
        sec.__nom = iN; sec.__desc = iD;

        var liste = el('div', 'lva-bth-cats'); liste.style.marginTop = '16px'; sec.appendChild(liste);
        var st = struct[t.id];
        var place = {}; /* slugs déjà rangés dans ce domaine */
        function garde(sl) { return assigne[sl] === t.id && !place[sl] && (place[sl] = 1); }
        if (st && st.order) {
          st.order.forEach(function (cid) {
            var nm = ((st.names || {})[cid] || {})['nom_' + lang] || cid;
            var slugs = (((st.arts || {})[cid]) || []).filter(garde);
            liste.appendChild(blocCat(sec, cid, nm, slugs, ovTitres, false));
          });
        } else {
          (t.cats || []).forEach(function (c) {
            liste.appendChild(blocCat(sec, c.id, c.nom, (c.arts || []).filter(garde), ovTitres, false));
          });
        }
        var autres = ((st && st.arts && st.arts['__autres']) || []).filter(garde);
        tousArts.forEach(function (a) { if (assigne[a.id] === t.id && !place[a.id]) { place[a.id] = 1; autres.push(a.id); } });
        liste.appendChild(blocCat(sec, '__autres', '', autres, ovTitres, true));

        var add = el('span', 'lva-addcat'); add.textContent = T('+ Nouvelle catégorie', '+ New category');
        add.addEventListener('click', function () {
          var bN = blocCat(sec, '', '', [], ovTitres, false);
          bN.classList.add('on');
          liste.insertBefore(bN, liste.querySelector(':scope > .lva-aut'));
          var iN = bN.querySelector('.lva-cat-nom'); if (iN) iN.focus();
          markDirty(); majCnts();
          UNDO.push(function () { bN.remove(); });
        });
        sec.appendChild(add);
        host.appendChild(sec);
      });
      majCnts();

      var stick = el('div', 'lva-stick');
      var sv = el('button', 'lva-btn'); sv.type = 'button'; sv.textContent = T('Enregistrer', 'Save');
      var und = el('button', 'lva-btn2'); und.type = 'button'; und.textContent = '\u21B6 ' + T('Annuler', 'Undo'); und.title = 'Ctrl+Z';
      und.addEventListener('click', doUndo);
      var st2 = el('span', 'lva-stat');
      stick.appendChild(sv); stick.appendChild(und); stick.appendChild(st2);
      hubBody.appendChild(stick);
      sv.addEventListener('click', function () {
        var d = { noms: {}, struct: {} }, finals = {}, idsPris = {};
        qsa('.lva-bth', host).forEach(function (sec) {
          var th = sec.__th;
          d.noms[th] = {}; d.noms[th]['nom_' + lang] = sec.__nom.value.trim(); d.noms[th]['desc_' + lang] = sec.__desc.value.trim();
          var stt = { order: [], names: {}, arts: {} };
          qsa(':scope .lva-cat', sec).forEach(function (b) {
            var slugs = qsa('.lva-art', b).map(function (r) { finals[r.__slug] = th; return r.__slug; });
            if (b.__aut) { stt.arts['__autres'] = slugs; return; }
            if (!b.__cid) { var nEl0 = b.querySelector('.lva-cat-nom'); var basC = slugifie(nEl0 ? nEl0.value : '') || 'cat', idC = basC, kC = 2; while (idsPris[idC]) idC = basC + '-' + (kC++); b.__cid = idC; }
            idsPris[b.__cid] = 1;
            stt.order.push(b.__cid);
            var nEl = b.querySelector('.lva-cat-nom');
            var o = {}; o['nom_' + lang] = nEl ? nEl.value.trim() : b.__cid; stt.names[b.__cid] = o;
            stt.arts[b.__cid] = slugs;
          });
          d.struct[th] = stt;
        });
        st2.textContent = T('Enregistrement…', 'Saving…');
        var batch = db.batch();
        Object.keys(finals).forEach(function (sl) { if (finals[sl] !== assigneInitial[sl]) batch.set(db.collection('contenu').doc(sl), { theme: finals[sl] }, { merge: true }); });
        batch.set(db.doc('config/themes'), d, { merge: true });
        batch.commit().then(function () {
          Object.assign(assigneInitial, finals); dirty = false;
          st2.textContent = T('Enregistré — visible par tous.', 'Saved — visible to everyone.');
        }).catch(function (e) { st2.textContent = T('Erreur : ', 'Error: ') + e.message; });
      });
    });
  }

  /* — onglet Apparence — */
  function tabApparence() {
    hubBody.appendChild(el('div', 'lva-note', T('Toute l\u2019apparence du site, appliquée partout d\u2019un coup. Chaque réglage se prévisualise en direct ; rien n\u2019est public avant Enregistrer.', 'The whole site\u2019s appearance at once. Everything previews live; nothing is public before you save.')));
    var COUL = [
      ['encre', T('Fond du site', 'Site background'), '#000000'],
      ['encre2', T('Fond secondaire', 'Secondary background'), '#0b0b0b'],
      ['parchemin', T('Texte', 'Text'), '#ffffff'],
      ['parchemin_att', T('Texte atténué', 'Muted text'), '#ffffff'],
      ['or', T('Accent', 'Accent'), '#efe6cf'],
      ['or_pale', T('Accent clair', 'Light accent'), '#f8f3e6'],
      ['pourpre', T('Accent liturgique', 'Liturgical accent'), '#9a3b3b']
    ];
    var champs = {};
    hubBody.appendChild(el('div', 'lva-sec-t', T('Couleurs', 'Colours')));
    var grid = el('div', 'lva-color-g'); hubBody.appendChild(grid);
    COUL.forEach(function (x) {
      var r = el('div', 'lva-color'); r.appendChild(el('span', null, esc(x[1])));
      var i = el('input'); i.type = 'color'; i.value = x[2]; r.appendChild(i); grid.appendChild(r);
      champs[x[0]] = i;
    });
    hubBody.appendChild(el('div', 'lva-sec-t', T('Filets (traits fins)', 'Hairlines')));
    var r2 = el('div', 'lva-row2');
    var c1 = el('div'); c1.appendChild(el('label', 'lva-lab', T('Filets', 'Hairlines')));
    var iF1 = el('input', 'lva-in'); iF1.placeholder = 'rgba(231,224,207,.14)'; c1.appendChild(iF1);
    var c2 = el('div'); c2.appendChild(el('label', 'lva-lab', T('Filets renforcés', 'Strong hairlines')));
    var iF2 = el('input', 'lva-in'); iF2.placeholder = 'rgba(231,224,207,.28)'; c2.appendChild(iF2);
    r2.appendChild(c1); r2.appendChild(c2); hubBody.appendChild(r2);
    hubBody.appendChild(el('div', 'lva-sec-t', T('Typographie', 'Typography')));
    var r3 = el('div', 'lva-row2');
    var c3 = el('div'); c3.appendChild(el('label', 'lva-lab', T('Police du corps', 'Body font')));
    var iPC = el('input', 'lva-in'); iPC.placeholder = "'EB Garamond', serif"; c3.appendChild(iPC);
    var c4 = el('div'); c4.appendChild(el('label', 'lva-lab', T('Police des titres', 'Heading font')));
    var iPT = el('input', 'lva-in'); iPT.placeholder = "'Cormorant Garamond', serif"; c4.appendChild(iPT);
    r3.appendChild(c3); r3.appendChild(c4); hubBody.appendChild(r3);
    hubBody.appendChild(el('label', 'lva-lab', T('Taille du texte', 'Text size')));
    var iTa = el('input', 'lva-in'); iTa.placeholder = '23px'; iTa.style.maxWidth = '180px'; hubBody.appendChild(iTa);
    hubBody.appendChild(el('label', 'lva-lab', T('Image de fond (lien)', 'Background image (URL)')));
    var iIm = el('input', 'lva-in'); iIm.placeholder = 'https://\u2026'; hubBody.appendChild(iIm);
    var det = el('details'); det.style.marginTop = '24px';
    var sum = el('summary', 'lva-sec-t'); sum.style.cursor = 'pointer'; sum.style.margin = '0 0 10px'; sum.textContent = T('Réglages experts (CSS avancé, facultatif)', 'Expert settings (advanced CSS, optional)');
    det.appendChild(sum);
    det.appendChild(el('div', 'lva-note', T('Des règles de style brutes pour les ajustements que les réglages simples ne couvrent pas. Décris-moi l\u2019effet voulu et je te donne la ligne à coller.', 'Raw style rules for adjustments the simple settings don\u2019t cover.')));
    var iCss = el('textarea', 'lva-ta lva-mono'); iCss.rows = 5; det.appendChild(iCss);
    hubBody.appendChild(det);
    var act = el('div', 'lva-actions');
    var sv = el('button', 'lva-btn'); sv.type = 'button'; sv.textContent = T('Enregistrer', 'Save');
    var rs = el('button', 'lva-btn3'); rs.type = 'button'; rs.textContent = T('Réinitialiser', 'Reset');
    var st = el('span', 'lva-stat');
    act.appendChild(sv); act.appendChild(rs); act.appendChild(st); hubBody.appendChild(act);
    function valeurs() {
      var v = {}; COUL.forEach(function (x) { v[x[0]] = champs[x[0]].value; });
      if (iF1.value.trim()) v.filet = iF1.value.trim();
      if (iF2.value.trim()) v.filet_fort = iF2.value.trim();
      return { vars: v, police_corps: iPC.value.trim(), police_titres: iPT.value.trim(), taille: iTa.value.trim(), image: iIm.value.trim(), css: iCss.value };
    }
    function prefill(d) {
      d = d || {}; var v = d.vars || {};
      COUL.forEach(function (x) {
        var val = v[x[0]] || (x[0] === 'encre' && d.fond) || (x[0] === 'parchemin' && d.texte) || (x[0] === 'or' && d.accent) || x[2];
        champs[x[0]].value = /^#[0-9a-f]{6}$/i.test(val) ? val : x[2];
      });
      iF1.value = v.filet || ''; iF2.value = v.filet_fort || '';
      iPC.value = d.police_corps || d.police || ''; iPT.value = d.police_titres || '';
      iTa.value = d.taille || ''; iIm.value = d.image || ''; iCss.value = d.css || '';
    }
    hubBody.addEventListener('input', function (e) { if (e.target === iCss || e.target.type === 'color' || e.target.tagName === 'INPUT') applyApparence(valeurs()); });
    sv.addEventListener('click', function () {
      var d = valeurs(); st.textContent = T('Enregistrement…', 'Saving…');
      db.doc('config/apparence').set(d).then(function () { applyApparence(d); dirty = false; st.textContent = T('Enregistré. Visible par tous, sur tout le site.', 'Saved. Visible to everyone, site-wide.'); })
        .catch(function (e) { st.textContent = T('Erreur : ', 'Error: ') + e.message; });
    });
    rs.addEventListener('click', function () {
      if (!confirm(T('Revenir à l\u2019apparence d\u2019origine du site ?', 'Reset the site to its original appearance?'))) return;
      db.doc('config/apparence').delete().then(function () { applyApparence({}); prefill({}); dirty = false; st.textContent = T('Réinitialisé.', 'Reset.'); })
        .catch(function (e) { st.textContent = T('Erreur : ', 'Error: ') + e.message; });
    });
    gdoc('config/apparence').then(prefill);
  }

  /* — onglet Accueil — */
  function tabAccueil() {
    var KEYS = [
      ['home_domains_label', T('Petit label de la section domaines', 'Domains small label')],
      ['home_explore', T('Titre « Explorer par thème »', '"Explore by theme" title')],
      ['memo_label', T('Petit label du bloc Mémoriser', 'Memorise small label')],
      ['memo_title', T('Titre du bloc Mémoriser', 'Memorise block title')],
      ['memo_mastery', T('Mention « de maîtrise »', '"mastery" label')],
      ['memo_acquired', T('Légende : acquis', 'Legend: acquired')],
      ['memo_learning', T('Légende : en cours', 'Legend: learning')],
      ['memo_review', T('Légende : à revoir', 'Legend: to review')],
      ['memo_start', T('Bouton « Commencer »', '"Start" button')]
    ];
    hubBody.appendChild(el('div', 'lva-note', T('Les textes de la page d\u2019accueil. Les noms et descriptions des domaines, eux, sont dans l\u2019onglet Bibliothèque.', 'The home page texts. Domain names and descriptions live in the Library tab.')));
    var defs = (IDX && IDX.accueil) || {};
    var fields = {};
    KEYS.forEach(function (k) {
      hubBody.appendChild(el('label', 'lva-lab', k[1]));
      var i = el('input', 'lva-in'); i.placeholder = defs[k[0]] || ''; i.addEventListener('input', markDirty); hubBody.appendChild(i);
      fields[k[0]] = i;
    });
    var act = el('div', 'lva-actions');
    var sv = el('button', 'lva-btn'); sv.type = 'button'; sv.textContent = T('Enregistrer', 'Save');
    var st = el('span', 'lva-stat');
    act.appendChild(sv); act.appendChild(st); hubBody.appendChild(act);
    gdoc('config/accueil').then(function (d) {
      d = d || {};
      KEYS.forEach(function (k) { var o = d[k[0]]; if (o && typeof o['t_' + lang] === 'string') fields[k[0]].value = o['t_' + lang]; });
    });
    sv.addEventListener('click', function () {
      var d = {};
      KEYS.forEach(function (k) { var val = fields[k[0]].value.trim(); if (val) { d[k[0]] = {}; d[k[0]]['t_' + lang] = val; } });
      st.textContent = T('Enregistrement…', 'Saving…');
      db.doc('config/accueil').set(d, { merge: true }).then(function () { dirty = false; st.textContent = T('Enregistré.', 'Saved.'); applyAccueil(d); })
        .catch(function (e) { st.textContent = T('Erreur : ', 'Error: ') + e.message; });
    });
  }

  /* — onglet Mémoriser — */
  function tabMemoriser() {
    hubBody.appendChild(el('div', 'lva-note', T('Les versets de base, communs à tous les comptes : catégories et versets s\u2019y créent, s\u2019y écrivent et s\u2019y glissent, dans leur éditeur dédié.', 'The base verses, shared by all accounts, in their dedicated editor.')));
    var go = el('button', 'lva-btn2'); go.type = 'button'; go.textContent = T('Ouvrir l\u2019éditeur des versets \u2192', 'Open the verses editor \u2192');
    go.addEventListener('click', function () { closeHub(); openMem(); });
    hubBody.appendChild(go);
  }

  /* — onglet Exporter — */
  function tabExport() {
    hubBody.appendChild(el('div', 'lva-note', T('L\u2019historique de tes modifications en ligne. Par défaut, seules les nouveautés depuis ton dernier envoi s\u2019affichent : copie-les ou télécharge-les pour me les transmettre, puis « Marquer comme transmis » fait repartir l\u2019historique de zéro. Rien n\u2019est effacé du site : toutes tes modifications restent en place.', 'The history of your online changes. By default, only what changed since your last handoff is shown: copy or download it, then \u201cMark as handed off\u201d resets the history. Nothing is erased from the site.')));
    var modes = [['depuis', T('Depuis le dernier envoi', 'Since last handoff')], ['tout', T('Tout l\u2019état en ligne', 'Everything online')]];
    var scopes = [['tout', T('Tout', 'All')], ['apparence', T('Apparence', 'Appearance')], ['themes', T('Bibliothèque', 'Library')], ['accueil', T('Accueil', 'Home')], ['memoriser', 'Mémoriser'], ['contenu', T('Articles', 'Articles')]];
    var mode = 'depuis', scope = 'tout', data = null, prevH = {}, curH = {};
    var rowM = el('div'); rowM.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin:0 0 8px'; hubBody.appendChild(rowM);
    var rowS = el('div'); rowS.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin:0 0 14px'; hubBody.appendChild(rowS);
    var chipsM = {}, chipsS = {};
    modes.forEach(function (m) { var c = el('button', 'lva-chip'); c.type = 'button'; c.textContent = m[1]; c.addEventListener('click', function () { mode = m[0]; maj(); }); rowM.appendChild(c); chipsM[m[0]] = c; });
    scopes.forEach(function (sc) { var c = el('button', 'lva-chip'); c.type = 'button'; c.textContent = sc[1]; c.addEventListener('click', function () { scope = sc[0]; maj(); }); rowS.appendChild(c); chipsS[sc[0]] = c; });
    var ta = el('textarea', 'lva-ta'); ta.rows = 16; ta.readOnly = true; ta.style.fontFamily = 'ui-monospace,Menlo,Consolas,monospace'; ta.style.fontSize = '12px'; hubBody.appendChild(ta);
    var act = el('div', 'lva-actions');
    var cp = el('button', 'lva-btn'); cp.type = 'button'; cp.textContent = T('Copier', 'Copy');
    var dl = el('button', 'lva-btn2'); dl.type = 'button'; dl.textContent = T('Télécharger', 'Download');
    var mk = el('button', 'lva-btn2'); mk.type = 'button'; mk.textContent = T('Marquer comme transmis', 'Mark as handed off');
    var st = el('span', 'lva-stat');
    act.appendChild(cp); act.appendChild(dl); act.appendChild(mk); act.appendChild(st); hubBody.appendChild(act);
    var pub = el('button', 'lva-btn2'); pub.type = 'button'; pub.textContent = T('Publier le site', 'Publish the site');
    pub.title = T('Reconstruit le site : les articles et versets créés en ligne deviennent des pages et la base des fichiers. Maj+clic pour changer l\u2019adresse du déclencheur.', 'Rebuilds the site. Shift+click to change the hook URL.');
    act.appendChild(pub);
    pub.addEventListener('click', function (ev) {
      var hk = '';
      try { hk = localStorage.getItem('lv_hook') || ''; } catch (_) {}
      if (!hk || ev.shiftKey) {
        hk = (prompt(T('Colle l\u2019adresse du « build hook » Netlify (Site configuration \u2192 Build & deploy \u2192 Build hooks \u2192 Add build hook). Elle sera retenue sur cet appareil.', 'Paste the Netlify build hook URL (Site configuration \u2192 Build & deploy \u2192 Build hooks).'), hk) || '').trim();
        if (!hk) return;
        if (hk.indexOf('https://api.netlify.com/build_hooks/') !== 0) { st.textContent = T('Adresse invalide : elle doit commencer par https://api.netlify.com/build_hooks/', 'Invalid URL: it must start with https://api.netlify.com/build_hooks/'); return; }
        try { localStorage.setItem('lv_hook', hk); } catch (_) {}
      }
      st.textContent = T('Publication lancée…', 'Publishing…');
      fetch(hk, { method: 'POST', mode: 'no-cors', body: '' }).then(function () {
        st.textContent = T('Publication lancée — le site se reconstruit (2 à 3 minutes), puis recharge la page.', 'Publishing started — the site rebuilds (2–3 min), then reload.');
      }).catch(function () { st.textContent = T('Impossible de joindre Netlify.', 'Could not reach Netlify.'); });
    });
    var det = el('details'); det.style.marginTop = '28px';
    var sum = el('summary'); sum.textContent = T('Avancé', 'Advanced');
    sum.style.cssText = 'cursor:pointer;color:var(--lvaM);letter-spacing:.14em;text-transform:uppercase;font-size:12px;margin:0 0 10px';
    det.appendChild(sum);
    det.appendChild(el('div', 'lva-note', T('Tout effacer en ligne remet le site exactement tel que ses fichiers le définissent, en supprimant toutes les modifications faites depuis le panneau. À n\u2019utiliser que d\u2019un commun accord, après intégration des changements dans les fichiers.', 'Clearing everything online resets the site to what its files define. Only by mutual agreement, after the changes were integrated into the files.')));
    var clr = el('button', 'lva-btn2'); clr.type = 'button'; clr.textContent = T('Tout effacer en ligne…', 'Clear everything online…');
    clr.style.borderColor = 'rgba(199,93,82,.55)'; clr.style.color = '#c75d52';
    det.appendChild(clr); hubBody.appendChild(det);
    function hash(x) { var h = 5381, i; for (i = 0; i < x.length; i++) { h = ((h << 5) + h + x.charCodeAt(i)) | 0; } return (h >>> 0).toString(36); }
    function rassembler() {
      return Promise.all([gdoc('config/apparence'), gdoc('config/themes'), gdoc('config/accueil'), gdoc('config/memoriser'), db.collection('contenu').get().catch(function () { return null; }), gdoc('config/transmis')])
        .then(function (r) {
          var o = { apparence: r[0], themes: r[1], accueil: r[2], memoriser: r[3], contenu: {} };
          if (r[4]) r[4].forEach(function (d) { o.contenu[d.id] = d.data(); });
          prevH = (r[5] && r[5].hashes) || {};
          curH = {};
          ['apparence', 'themes', 'accueil', 'memoriser'].forEach(function (k) { if (o[k]) curH['config/' + k] = hash(JSON.stringify(o[k])); });
          Object.keys(o.contenu).forEach(function (sl) { curH['contenu/' + sl] = hash(JSON.stringify(o.contenu[sl])); });
          return o;
        });
    }
    function change(pth) { return curH[pth] != null && curH[pth] !== prevH[pth]; }
    function payload() {
      if (!data) return null;
      var o = {}, vide = true;
      ['apparence', 'themes', 'accueil', 'memoriser'].forEach(function (k) {
        if (scope !== 'tout' && scope !== k) return;
        if (!data[k]) return;
        if (mode === 'depuis' && !change('config/' + k)) return;
        o[k] = data[k]; vide = false;
      });
      if (scope === 'tout' || scope === 'contenu') {
        var c = {};
        Object.keys(data.contenu || {}).forEach(function (sl) {
          if (mode === 'depuis' && !change('contenu/' + sl)) return;
          c[sl] = data.contenu[sl]; vide = false;
        });
        if (Object.keys(c).length) o.contenu = c;
      }
      return vide ? null : o;
    }
    function maj() {
      Object.keys(chipsM).forEach(function (k) { chipsM[k].classList.toggle('on', k === mode); });
      Object.keys(chipsS).forEach(function (k) { chipsS[k].classList.toggle('on', k === scope); });
      if (!data) { ta.value = T('Lecture…', 'Reading…'); return; }
      var pl = payload();
      ta.value = pl ? JSON.stringify(pl, null, 2) : (mode === 'depuis' ? T('Aucun changement depuis le dernier envoi.', 'No changes since the last handoff.') : T('Aucune modification en ligne.', 'Nothing online.'));
    }
    maj();
    rassembler().then(function (o) { data = o; maj(); });
    cp.addEventListener('click', function () {
      ta.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (_) {}
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(ta.value).then(function () { st.textContent = T('Copié.', 'Copied.'); }).catch(function () { st.textContent = ok ? T('Copié.', 'Copied.') : T('Sélectionne et copie à la main.', 'Select and copy manually.'); });
      else st.textContent = ok ? T('Copié.', 'Copied.') : T('Sélectionne et copie à la main.', 'Select and copy manually.');
    });
    dl.addEventListener('click', function () {
      var blob = new Blob([ta.value], { type: 'application/json' }); var a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'lumen-' + mode + '-' + scope + '-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 800);
      st.textContent = T('Téléchargé.', 'Downloaded.');
    });
    mk.addEventListener('click', function () {
      if (!confirm(T('Marquer tout l\u2019état actuel comme transmis ? Le prochain export ne montrera que ce qui changera ensuite. Rien n\u2019est effacé.', 'Mark the current state as handed off? The next export only shows what changes afterwards. Nothing is erased.'))) return;
      st.textContent = T('Enregistrement…', 'Saving…');
      db.doc('config/transmis').set({ hashes: curH, date: new Date().toISOString() }).then(function () {
        prevH = JSON.parse(JSON.stringify(curH)); maj(); st.textContent = T('Marqué — l\u2019historique repart de zéro.', 'Marked — history starts fresh.');
      }).catch(function (e2) { st.textContent = T('Erreur : ', 'Error: ') + e2.message; });
    });
    clr.addEventListener('click', function () {
      if (!confirm(T('Effacer TOUTES les modifications en ligne ? Le site reviendra à ce que définissent ses fichiers. Cette action est définitive.', 'Clear ALL online changes? The site reverts to what its files define.'))) return;
      st.textContent = T('Effacement…', 'Clearing…');
      rassembler().then(function (o) {
        var b = db.batch();
        ['apparence', 'themes', 'accueil', 'memoriser'].forEach(function (k) { if (o[k]) b.delete(db.doc('config/' + k)); });
        Object.keys(o.contenu || {}).forEach(function (sl) { b.delete(db.collection('contenu').doc(sl)); });
        b.delete(db.doc('config/transmis'));
        return b.commit();
      }).then(function () { st.textContent = T('Tout est effacé. Recharge la page.', 'All cleared. Reload the page.'); })
        .catch(function (e2) { st.textContent = T('Erreur : ', 'Error: ') + e2.message; });
    });
  }

  /* ════════ ÉDITEUR MÉMORISER (pleine page) ════════ */
  var memPage = null, memW = null;
  function memSlug(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
  function memEnsureIds(cats) {
    var cs = {};
    cats.forEach(function (c) {
      if (!c.id) { var b = memSlug(c.name && c.name.fr) || 'cat', id = b, k = 2; while (cs[id]) id = b + '-' + (k++); c.id = id; }
      cs[c.id] = 1; var vs = {};
      (c.verses || []).forEach(function (v) { if (!v.id) { var b2 = memSlug(v.fr && v.fr.ref) || 'v', id2 = b2, k2 = 2; while (vs[id2]) id2 = b2 + '-' + (k2++); v.id = id2; } vs[v.id] = 1; });
    });
  }
  function memClean(cats) {
    return cats.map(function (c) {
      return { id: c.id, name: { fr: (c.name || {}).fr || '', en: (c.name || {}).en || '' },
        verses: (c.verses || []).map(function (v) { return { id: v.id, fr: { text: (v.fr || {}).text || '', ref: (v.fr || {}).ref || '' }, en: { text: (v.en || {}).text || '', ref: (v.en || {}).ref || '' } }; }) };
    });
  }
  function memIn(parent, val, ph) { var i = el('input', 'lva-in'); i.type = 'text'; i.value = val || ''; i.placeholder = ph || ''; parent.appendChild(i); return i; }
  function openMem() {
    if (typeof PRE === 'undefined') { location.href = ((IDX && IDX.urls && IDX.urls.memoriser) || '/memoriser.html') + '?edition=1'; return; }
    if (memPage) { memPage.remove(); memPage = null; }
    UNDO = [];
    memW = JSON.parse(JSON.stringify(PRE));
    memPage = el('div', 'lva-page');
    var w = el('div', 'lva-wrap'); memPage.appendChild(w);
    var head = el('div', 'lva-head');
    head.appendChild(el('h1', 'lva-h1', '<i>\u2726</i>' + T('Versets de base', 'Base verses')));
    var close = el('button', 'lva-close'); close.type = 'button'; close.textContent = T('Fermer', 'Close');
    close.addEventListener('click', function () { if (dirty && !confirm(T('Fermer sans enregistrer ?', 'Close without saving?'))) return; memPage.remove(); memPage = null; dirty = false; UNDO = []; });
    head.appendChild(close); w.appendChild(head);
    w.appendChild(el('div', 'lva-note', T('La base commune à tous les comptes. Glisse les versets (⋮⋮) et les catégories (☰) pour les ranger ; tout s\u2019écrit directement dans les champs. Rien n\u2019est public avant Enregistrer.', 'The base shared by all accounts. Drag verses and categories; type directly in the fields.')));
    var search = el('input', 'lva-in'); search.type = 'text'; search.placeholder = T('Rechercher une catégorie ou une référence…', 'Search a category or a reference…'); search.style.marginBottom = '18px';
    w.appendChild(search);
    var host = el('div'); w.appendChild(host);
    var addC = el('span', 'lva-addcat'); addC.textContent = T('+ Nouvelle catégorie', '+ New category');
    addC.addEventListener('click', function () { var c = { id: '', name: { fr: '', en: '' }, verses: [], __open: true }; memW.push(c); host.appendChild(memCatBlock(c, host)); markDirty(); });
    w.appendChild(addC);
    var stick = el('div', 'lva-stick');
    var save = el('button', 'lva-btn'); save.type = 'button'; save.textContent = T('Enregistrer', 'Save');
    var und = el('button', 'lva-btn2'); und.type = 'button'; und.textContent = '\u21B6 ' + T('Annuler', 'Undo'); und.title = 'Ctrl+Z';
    und.addEventListener('click', doUndo);
    var stat = el('span', 'lva-stat');
    stick.appendChild(save); stick.appendChild(und); stick.appendChild(stat); w.appendChild(stick);
    save.addEventListener('click', function () {
      memSync(host);
      memEnsureIds(memW); var clean = memClean(memW);
      stat.textContent = T('Enregistrement…', 'Saving…');
      db.doc('config/memoriser').set({ categories: clean }).then(function () {
        PRE.length = 0; clean.forEach(function (c) { PRE.push(JSON.parse(JSON.stringify(c))); });
        if (typeof renderCats === 'function') { try { renderCats(); } catch (_) {} }
        dirty = false; stat.textContent = T('Enregistré. Base commune mise à jour.', 'Saved. Shared base updated.');
      }).catch(function (e) { stat.textContent = T('Erreur : ', 'Error: ') + e.message; });
    });
    search.addEventListener('input', function () {
      var q = search.value.toLowerCase();
      qsa('.lva-cat', host).forEach(function (b) {
        if (!q) { b.style.display = ''; return; }
        var c = b.__c, hit = ((c.name.fr || '') + ' ' + (c.name.en || '')).toLowerCase().indexOf(q) >= 0
          || (c.verses || []).some(function (v) { return (((v.fr || {}).ref || '') + ' ' + ((v.en || {}).ref || '')).toLowerCase().indexOf(q) >= 0; });
        b.style.display = hit ? '' : 'none';
      });
    });
    memW.forEach(function (c) { host.appendChild(memCatBlock(c, host)); });
    document.body.appendChild(memPage);
  }
  function memSync(host) {
    memW = qsa(':scope > .lva-cat', host).map(function (b) {
      var c = b.__c;
      var body = b.querySelector('.lva-cat-b');
      if (body && body.children.length) c.verses = qsa('.lva-v', body).map(function (r) { return r.__v; });
      return c;
    });
  }
  function memCatBlock(c, host) {
    c.name = c.name || { fr: '', en: '' }; c.verses = c.verses || [];
    var block = el('div', 'lva-cat' + (c.__open ? ' on' : '')); block.__c = c;
    var h = el('div', 'lva-cat-h');
    var grip = el('span', 'lva-grip'); grip.textContent = '\u2630'; h.appendChild(grip);
    var chev = el('span', 'lva-chev'); chev.textContent = '\u203A'; h.appendChild(chev);
    var nf = memIn(h, c.name.fr, 'Nom FR'); nf.style.flex = '1'; nf.style.minWidth = '130px'; nf.style.width = 'auto';
    var ne = memIn(h, c.name.en, 'Name EN'); ne.style.flex = '1'; ne.style.minWidth = '130px'; ne.style.width = 'auto';
    var cnt = el('span', 'lva-cat-n'); h.appendChild(cnt);
    var x = el('span', 'lva-x'); x.textContent = '\u2715'; x.title = T('Supprimer la catégorie', 'Delete category'); h.appendChild(x);
    block.appendChild(h);
    var body = el('div', 'lva-cat-b'); block.appendChild(body);
    function majCnt() { cnt.textContent = (body.children.length ? qsa('.lva-v', body).length : c.verses.length) + T(' versets', ' verses'); }
    nf.addEventListener('input', function () { c.name.fr = nf.value; markDirty(); });
    ne.addEventListener('input', function () { c.name.en = ne.value; markDirty(); });
    chev.addEventListener('click', function () { block.classList.toggle('on'); if (block.classList.contains('on') && !body.children.length) fill(); });
    x.addEventListener('click', function () { if (!confirm(T('Supprimer cette catégorie et ses versets ?', 'Delete this category and its verses?'))) return; block.remove(); markDirty(); });
    function verseRow(v) {
      v.fr = v.fr || { text: '', ref: '' }; v.en = v.en || { text: '', ref: '' };
      var r = el('div', 'lva-v'); r.__v = v;
      var vh = el('div', 'lva-v-h');
      var vg = el('span', 'lva-grip'); vg.textContent = '\u22EE\u22EE'; vg.style.fontSize = '11px'; vh.appendChild(vg);
      var vm = el('span', 'lva-mv'); vm.textContent = '\u21C4'; vm.title = T('Déplacer dans…', 'Move to…'); vm.style.marginLeft = 'auto';
      vm.addEventListener('click', function () { memDeplacer(r); });
      vh.appendChild(vm);
      var vx = el('span', 'lva-x'); vx.textContent = '\u2715'; vh.appendChild(vx);
      r.appendChild(vh);
      var g1 = el('div', 'lva-v-g');
      var rf = memIn(g1, v.fr.ref, T('Référence FR', 'Ref FR')); var tf = memIn(g1, v.fr.text, T('Texte FR', 'Text FR'));
      r.appendChild(g1);
      var g2 = el('div', 'lva-v-g');
      var re = memIn(g2, v.en.ref, 'Reference EN'); var te = memIn(g2, v.en.text, 'Text EN');
      r.appendChild(g2);
      rf.addEventListener('input', function () { v.fr.ref = rf.value; markDirty(); });
      tf.addEventListener('input', function () { v.fr.text = tf.value; markDirty(); });
      re.addEventListener('input', function () { v.en.ref = re.value; markDirty(); });
      te.addEventListener('input', function () { v.en.text = te.value; markDirty(); });
      vx.addEventListener('click', function () { r.remove(); majCnt(); markDirty(); });
      dragify(vg, r, {
        containers: function () { return qsa('.lva-cat.on > .lva-cat-b', host); },
        items: function (cb) { return qsa(':scope > .lva-v', cb); },
        beforeRef: function (cb) { return cb.querySelector(':scope > .lva-addcat'); },
        scroller: function () { return memPage; },
        onMoved: function () {
          qsa('.lva-cat', host).forEach(function (b) {
            var cc = b.querySelector('.lva-cat-n'), bb = b.querySelector('.lva-cat-b');
            if (cc && bb && bb.children.length) cc.textContent = qsa('.lva-v', bb).length + T(' versets', ' verses');
          });
        }
      });
      return r;
    }
    function fill() {
      body.innerHTML = '';
      c.verses.forEach(function (v) { body.appendChild(verseRow(v)); });
      var addV = el('span', 'lva-addcat'); addV.textContent = T('+ Ajouter un verset', '+ Add a verse');
      addV.addEventListener('click', function () { var v = { id: '', fr: { text: '', ref: '' }, en: { text: '', ref: '' } }; body.insertBefore(verseRow(v), addV); majCnt(); markDirty(); });
      body.appendChild(addV);
      majCnt();
    }
    block.__fill = fill; block.__majCnt = majCnt; block.__c = c;
    if (c.__open) fill(); else majCnt();
    dragify(grip, block, {
      containers: function () { return [host]; },
      items: function (hh) { return qsa(':scope > .lva-cat', hh); },
      scroller: function () { return memPage; }
    });
    return block;
  }

  /* ════════ DOCK, COMPTE, DÉMARRAGE ════════ */
  var KEY_OFF = 'lv_outils_off';
  function outilsOff() { try { return localStorage.getItem(KEY_OFF) === '1'; } catch (_) { return false; } }
  function setOutils(off) { try { localStorage.setItem(KEY_OFF, off ? '1' : '0'); } catch (_) {} majDock(); majCompte(); }
  function pageAction() {
    if (PAGE === 'article') return T('Modifier cet article', 'Edit this article');
    if (PAGE === 'biblio') return T('Organiser la bibliothèque', 'Organise the library');
    if (PAGE === 'accueil') return T('Modifier les textes de l\u2019accueil', 'Edit the home texts');
    if (PAGE === 'memoriser') return T('Modifier les versets de base', 'Edit the base verses');
    return null;
  }
  function pageEnter() {
    if (PAGE === 'article') openHub('articles', { slug: artEl.getAttribute('data-article') });
    else if (PAGE === 'biblio') openHub('biblio');
    else if (PAGE === 'accueil') openHub('accueil');
    else if (PAGE === 'memoriser') openMem();
    else openHub();
  }
  function buildDock() {
    if (dock) return;
    dock = el('div'); dock.id = 'lva-dock';
    var b = el('div'); b.id = 'lva-dock-b'; b.textContent = '\u2726'; b.title = 'Administration';
    var m = el('div'); m.id = 'lva-dock-m';
    m.appendChild(el('div', 'lva-dock-t', 'Administration'));
    var act = pageAction();
    if (act) {
      var i1 = el('button', 'lva-dock-i'); i1.type = 'button';
      i1.innerHTML = esc(act) + '<small>' + T('Dans le panneau, prêt à l\u2019emploi', 'In the panel, ready to use') + '</small>';
      i1.addEventListener('click', function () { m.classList.remove('on'); pageEnter(); });
      m.appendChild(i1);
    }
    var i2 = el('button', 'lva-dock-i'); i2.type = 'button';
    i2.innerHTML = T('Panneau d\u2019administration', 'Administration panel') + '<small>' + T('Tout le site : articles, bibliothèque, apparence, export', 'Whole site: articles, library, appearance, export') + '</small>';
    i2.addEventListener('click', function () { m.classList.remove('on'); openHub(); });
    m.appendChild(i2);
    var i3 = el('button', 'lva-dock-i'); i3.type = 'button';
    i3.innerHTML = T('Masquer les outils', 'Hide the tools') + '<small>' + T('Réactivables depuis « Mon compte »', 'Re-enable from "My account"') + '</small>';
    i3.addEventListener('click', function () { m.classList.remove('on'); setOutils(true); toast(T('Outils masqués — réactive-les depuis « Mon compte »', 'Tools hidden — re-enable from "My account"')); });
    m.appendChild(i3);
    b.addEventListener('click', function () { m.classList.toggle('on'); });
    document.addEventListener('click', function (e) { if (dock && !dock.contains(e.target)) m.classList.remove('on'); });
    dock.appendChild(m); dock.appendChild(b);
    document.body.appendChild(dock);
    majDock();
  }
  function majDock() { if (dock) dock.style.display = (isAdmin && !outilsOff()) ? 'block' : 'none'; }
  function majCompte() {
    var host = document.getElementById('auth-in');
    var ex = document.getElementById('lva-acc');
    if (!host || !isAdmin) { if (ex) ex.remove(); return; }
    if (!ex) {
      ex = el('div'); ex.id = 'lva-acc';
      ex.appendChild(el('div', 'lva-acc-sep'));
      ex.appendChild(el('div', 'lva-acc-lab', 'Administration'));
      var b1 = el('button', 'lva-acc-btn'); b1.type = 'button';
      b1.textContent = T('Panneau d\u2019administration', 'Administration panel');
      b1.addEventListener('click', function () {
        var ov = document.getElementById('auth-overlay');
        if (ov) ov.classList.remove('ouvert');
        document.body.style.overflow = '';
        openHub();
      });
      ex.appendChild(b1);
      var b2 = el('button', 'lva-acc-btn'); b2.type = 'button'; b2.id = 'lva-acc-tools';
      b2.addEventListener('click', function () { setOutils(!outilsOff()); });
      ex.appendChild(b2);
      var lo = document.getElementById('auth-logout');
      if (lo && lo.parentNode === host) host.insertBefore(ex, lo); else host.appendChild(ex);
    }
    var bt = document.getElementById('lva-acc-tools');
    if (bt) bt.textContent = outilsOff() ? T('Afficher les outils d\u2019édition', 'Show editing tools') : T('Masquer les outils d\u2019édition', 'Hide editing tools');
  }

  auth.onAuthStateChanged(function (u) {
    isAdmin = !!(u && ((u.email || '').toLowerCase() === ADMIN));
    if (isAdmin) { buildDock(); autoOuvrir(); }
    majCompte(); majDock();
  });

  var autoDone = false;
  function autoOuvrir() {
    if (autoDone) return; autoDone = true;
    var q = location.search || '';
    if (/[?&]outils=1/.test(q)) setOutils(false);
    if (/[?&]edition=1/.test(q)) {
      try { history.replaceState(null, '', location.pathname + location.hash); } catch (_) {}
      setTimeout(pageEnter, 400);
    }
  }
})();

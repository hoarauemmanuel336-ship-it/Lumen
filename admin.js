/* ════════════════════════════════════════════════════════════════
   LUMEN VERITATIS — ADMINISTRATION
   Un seul fichier : couche d'application des modifications (tous les
   visiteurs) + outils d'administration (admin uniquement).
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
    ':root{--lvaL:rgba(231,224,207,.22);--lvaL2:rgba(231,224,207,.5);--lvaG:#efe6cf;--lvaT:#efeada;--lvaM:#9a958a}',
    '.auth-modal{border:1px solid var(--lvaL)!important;box-shadow:0 32px 90px rgba(0,0,0,.8)!important;position:relative}',
    '.auth-modal::before,.auth-modal::after{content:"";position:absolute;width:14px;height:14px;pointer-events:none}',
    '.auth-modal::before{top:-1px;left:-1px;border-top:1px solid var(--lvaL2);border-left:1px solid var(--lvaL2)}',
    '.auth-modal::after{bottom:-1px;right:-1px;border-bottom:1px solid var(--lvaL2);border-right:1px solid var(--lvaL2)}',
    '.lva-acc-sep{height:1px;background:linear-gradient(to right,transparent,var(--lvaL2),transparent);margin:22px 0 16px}',
    '.lva-acc-lab{font-family:"Cormorant Garamond",serif;font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:var(--lvaM);text-align:center;margin-bottom:12px}',
    '.lva-acc-btn{display:block;width:100%;text-align:center;background:none;border:1px solid var(--lvaL);color:var(--lvaT);font-family:"Cormorant Garamond",serif;font-size:14px;letter-spacing:.1em;text-transform:uppercase;padding:10px;margin-top:8px;cursor:pointer;transition:border-color .25s,color .25s}',
    '.lva-acc-btn:hover{border-color:var(--lvaG);color:#fff}',
    '#lva-dock{position:fixed;right:20px;bottom:20px;z-index:100040;font-family:"Cormorant Garamond",serif}',
    '#lva-dock-b{width:46px;height:46px;display:flex;align-items:center;justify-content:center;background:rgba(10,9,7,.88);border:1px solid var(--lvaL);color:var(--lvaG);font-size:20px;cursor:pointer;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);box-shadow:0 10px 30px rgba(0,0,0,.5);transition:border-color .25s,box-shadow .25s;user-select:none}',
    '#lva-dock-b:hover{border-color:var(--lvaL2);box-shadow:0 12px 36px rgba(0,0,0,.65)}',
    '#lva-dock-m{position:absolute;right:0;bottom:56px;min-width:258px;background:#0b0a08;border:1px solid var(--lvaL);box-shadow:0 24px 70px rgba(0,0,0,.75);display:none}',
    '#lva-dock-m.on{display:block}',
    '.lva-dock-t{font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:var(--lvaM);padding:13px 16px 9px;border-bottom:1px solid var(--lvaL)}',
    '.lva-dock-i{display:block;width:100%;text-align:left;background:none;border:none;border-bottom:1px solid rgba(231,224,207,.08);color:var(--lvaT);font-family:"Cormorant Garamond",serif;font-size:15px;letter-spacing:.05em;padding:12px 16px;cursor:pointer;transition:background .2s,color .2s}',
    '.lva-dock-i:hover{background:rgba(231,224,207,.06);color:#fff}',
    '.lva-dock-i:last-child{border-bottom:none}',
    '.lva-dock-i small{display:block;font-family:"EB Garamond",serif;font-size:12.5px;color:var(--lvaM);letter-spacing:.02em;margin-top:2px}',
    '#lva-bar{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:100020;display:flex;align-items:center;background:rgba(10,9,7,.92);border:1px solid var(--lvaL);box-shadow:0 18px 60px rgba(0,0,0,.7);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);max-width:calc(100vw - 28px);flex-wrap:wrap;justify-content:center}',
    '.lva-bar-lab{font-family:"Cormorant Garamond",serif;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--lvaM);padding:0 16px;border-right:1px solid var(--lvaL);white-space:nowrap}',
    '.lva-bar-b{background:none;border:none;border-right:1px solid rgba(231,224,207,.12);color:var(--lvaT);font-family:"Cormorant Garamond",serif;font-size:14px;letter-spacing:.08em;padding:13px 16px;cursor:pointer;transition:background .2s,color .2s;white-space:nowrap}',
    '.lva-bar-b:hover{background:rgba(231,224,207,.07);color:#fff}',
    '.lva-bar-b.lva-prim{background:var(--lvaG);color:#0b0a08;font-weight:600;letter-spacing:.1em;text-transform:uppercase}',
    '.lva-bar-b.lva-prim:hover{background:#f8f3e6;color:#000}',
    '.lva-bar-b.lva-fmt{font-size:15px;min-width:44px;text-align:center}',
    'body.lva-editing{padding-bottom:96px}',
    'body.lva-editing [contenteditable="true"]{outline:1px dashed rgba(231,224,207,.35);outline-offset:4px}',
    'body.lva-editing [contenteditable="true"]:hover{outline-color:rgba(231,224,207,.6)}',
    'body.lva-editing [contenteditable="true"]:focus{outline:1px solid rgba(231,224,207,.75)}',
    '.lva-meta{border:1px solid var(--lvaL);padding:16px 18px;margin:22px 0 30px;font-family:"EB Garamond",serif}',
    '.lva-meta-lab{font-family:"Cormorant Garamond",serif;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--lvaM);margin:0 0 7px}',
    '.lva-meta-resume{font-size:.85em;line-height:1.55;color:var(--lvaT);min-height:1.4em}',
    '.lva-meta-row{margin-top:16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}',
    '.lva-sel{background:#070605;color:var(--lvaT);border:1px solid var(--lvaL);font-family:"EB Garamond",serif;font-size:15px;padding:8px 10px;cursor:pointer}',
    '.lva-sel:focus{border-color:var(--lvaL2);outline:none}',
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
    '.lva-page{position:fixed;inset:0;z-index:100050;background:rgba(7,6,4,.985);overflow:auto;font-family:"EB Garamond",Georgia,serif;color:var(--lvaT)}',
    '.lva-wrap{max-width:1060px;margin:0 auto;padding:34px 26px 120px}',
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
    '.lva-in,.lva-ta{width:100%;box-sizing:border-box;background:#070605;color:var(--lvaT);border:1px solid var(--lvaL);font-family:"EB Garamond",serif;font-size:15.5px;padding:10px 12px;transition:border-color .2s}',
    '.lva-in:focus,.lva-ta:focus{border-color:var(--lvaL2);outline:none}',
    '.lva-ta{resize:vertical;line-height:1.55}',
    '.lva-lab{display:block;font-family:"Cormorant Garamond",serif;font-size:11.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--lvaM);margin:16px 0 6px}',
    '.lva-row2{display:grid;grid-template-columns:1fr 1fr;gap:14px}',
    '@media(max-width:640px){.lva-row2{grid-template-columns:1fr}}',
    '.lva-btn{display:inline-block;background:var(--lvaG);color:#0b0a08;border:none;font-family:"Cormorant Garamond",serif;font-size:14px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;padding:12px 26px;cursor:pointer;transition:background .2s}',
    '.lva-btn:hover{background:#f8f3e6}',
    '.lva-btn2{display:inline-block;background:none;color:var(--lvaT);border:1px solid var(--lvaL);font-family:"Cormorant Garamond",serif;font-size:13.5px;letter-spacing:.1em;text-transform:uppercase;padding:11px 20px;cursor:pointer;transition:border-color .2s,color .2s}',
    '.lva-btn2:hover{border-color:var(--lvaL2);color:#fff}',
    '.lva-btn3{display:inline-block;background:none;color:#c98a8a;border:1px solid rgba(154,59,59,.45);font-family:"Cormorant Garamond",serif;font-size:13px;letter-spacing:.08em;text-transform:uppercase;padding:11px 18px;cursor:pointer;transition:border-color .2s,color .2s}',
    '.lva-btn3:hover{border-color:#9a3b3b;color:#e3a4a4}',
    '.lva-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:24px;align-items:center}',
    '.lva-stat{font-size:14px;color:var(--lvaM);min-height:18px;margin-top:14px}',
    '.lva-color-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px 22px}',
    '.lva-color{display:flex;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid rgba(231,224,207,.08);padding:9px 2px}',
    '.lva-color span{font-size:15px}',
    '.lva-color input[type=color]{width:52px;height:30px;background:#070605;border:1px solid var(--lvaL);padding:1px;cursor:pointer}',
    '.lva-chip{display:inline-block;background:none;border:1px solid var(--lvaL);color:var(--lvaM);font-family:"Cormorant Garamond",serif;font-size:12.5px;letter-spacing:.1em;text-transform:uppercase;padding:8px 15px;cursor:pointer;margin:0 6px 8px 0;transition:all .2s}',
    '.lva-chip.on{background:var(--lvaG);color:#0b0a08;border-color:var(--lvaG)}',
    '.lva-chip:hover{border-color:var(--lvaL2)}',
    '.lva-mono{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12.5px;line-height:1.5;color:#cfc9bb}',
    '.lva-li{border:1px solid rgba(231,224,207,.12);border-bottom:none}',
    '.lva-li:last-of-type{border-bottom:1px solid rgba(231,224,207,.12)}',
    '.lva-li-h{display:flex;align-items:center;gap:14px;padding:13px 16px;cursor:pointer;transition:background .2s}',
    '.lva-li-h:hover{background:rgba(231,224,207,.04)}',
    '.lva-li-t{flex:1;font-size:16.5px;color:var(--lvaT)}',
    '.lva-li-b{font-family:"Cormorant Garamond",serif;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--lvaM);border:1px solid rgba(231,224,207,.15);padding:3px 9px;white-space:nowrap}',
    '.lva-li-dot{width:6px;height:6px;border-radius:50%;background:var(--lvaG);flex:none}',
    '.lva-li-body{display:none;padding:6px 16px 20px;border-top:1px solid rgba(231,224,207,.1)}',
    '.lva-li.on .lva-li-body{display:block}',
    '.lva-cat{border:1px solid rgba(231,224,207,.14);margin-bottom:12px;background:rgba(255,255,255,.012)}',
    '.lva-cat-h{display:flex;align-items:center;gap:10px;padding:11px 12px;flex-wrap:wrap}',
    '.lva-cat-n{font-size:13px;color:var(--lvaM);white-space:nowrap;font-family:"Cormorant Garamond",serif;letter-spacing:.06em}',
    '.lva-chev{width:26px;height:26px;display:inline-flex;align-items:center;justify-content:center;color:var(--lvaM);cursor:pointer;font-family:ui-monospace,monospace;flex:none;transition:transform .25s,color .2s}',
    '.lva-chev:hover{color:var(--lvaG)}',
    '.lva-cat.on .lva-chev{transform:rotate(90deg)}',
    '.lva-cat-b{display:none;padding:4px 14px 16px}',
    '.lva-cat.on .lva-cat-b{display:block}',
    '.lva-v{border-left:2px solid rgba(231,224,207,.18);padding:10px 0 10px 12px;margin:10px 0;background:rgba(0,0,0,.25)}',
    '.lva-v-h{display:flex;align-items:center;gap:8px;margin-bottom:8px}',
    '.lva-v-g{display:grid;grid-template-columns:170px 1fr;gap:8px;margin-bottom:6px}',
    '@media(max-width:560px){.lva-v-g{grid-template-columns:1fr}}',
    '.lva-toast{position:fixed;left:50%;bottom:86px;transform:translateX(-50%);z-index:100090;background:#0b0a08;border:1px solid var(--lvaL2);color:var(--lvaT);font-family:"Cormorant Garamond",serif;font-size:14px;letter-spacing:.08em;padding:12px 26px;box-shadow:0 18px 50px rgba(0,0,0,.7);opacity:0;transition:opacity .35s;pointer-events:none}',
    '.lva-toast.on{opacity:1}'
  ].join('\n');
  var styleTag = el('style'); styleTag.id = 'lva-style'; styleTag.textContent = CSS;
  (document.head || document.documentElement).appendChild(styleTag);

  /* ════════ COUCHE D'APPLICATION (tous les visiteurs) ════════ */
  var apNode = null;
  function apStyle() { if (!apNode) { apNode = el('style'); apNode.id = 'lv-apparence'; document.head.appendChild(apNode); } return apNode; }
  var AP_VARS = [['encre', '--encre'], ['encre2', '--encre-2'], ['parchemin', '--parchemin'], ['parchemin_att', '--parchemin-att'], ['or', '--or'], ['or_pale', '--or-pale'], ['pourpre', '--pourpre'], ['filet', '--filet'], ['filet_fort', '--filet-fort']];
  var TITRES_SEL = 'h1,h2,h3,h4,h5,h6,.marque,.dom-nom,.sous-nom,.titre-section h2,.domaine h3,.bandeau-page h1,.auth-m-title,.lecture h1';
  function applyApparence(d) {
    d = d || {}; var v = d.vars || {};
    AP_VARS.forEach(function (x) { if (v[x[0]]) document.documentElement.style.setProperty(x[1], v[x[0]]); else document.documentElement.style.removeProperty(x[1]); });
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
  var artState = { resume: '', theme: '' };
  function applyCards() {
    qsa('a.article-lien[data-card]').forEach(function (card) {
      var d = contMap && contMap[card.getAttribute('data-card')]; if (!d) return;
      var t = d['titre_' + lang]; if (typeof t === 'string' && t) { var h = card.querySelector('h3'); if (h) h.textContent = t; }
      var r = d['resume_' + lang]; if (typeof r === 'string' && r) { var p = card.querySelector('p'); if (p) p.outerHTML = resumeHtml(r); }
    });
  }
  function applyArticle(d) {
    if (!artEl) return;
    var h1 = artEl.querySelector('h1');
    var ix = ((IDX && IDX.articles) || []).filter(function (a) { return a.id === artEl.getAttribute('data-article'); })[0] || {};
    artState.resume = (d && typeof d['resume_' + lang] === 'string') ? d['resume_' + lang] : (ix.resume || '');
    artState.theme = (d && d.theme) || ix.theme || '';
    if (!d) return;
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
    s.querySelector('.sous-tete').addEventListener('click', function () { if (document.body.classList.contains('lva-editing')) return; s.classList.toggle('ouvert'); });
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
  function gdoc(p) { return db.doc(p).get().then(function (s) { return s.exists ? s.data() : null; }).catch(function () { return null; }); }
  gdoc('config/apparence').then(function (d) { if (d) applyApparence(d); });
  if (PAGE === 'article') db.collection('contenu').doc(artEl.getAttribute('data-article')).get().then(function (s) { applyArticle(s.exists ? s.data() : null); }).catch(function () { applyArticle(null); });
  if (PAGE === 'biblio') {
    Promise.all([gdoc('config/themes'), db.collection('contenu').get().catch(function () { return null; })]).then(function (r) {
      contMap = {}; if (r[1]) r[1].forEach(function (d) { contMap[d.id] = d.data(); });
      relocaliser(); applyThemes(r[0]); applyCards();
    });
  }
  if (PAGE === 'accueil') Promise.all([gdoc('config/themes'), gdoc('config/accueil')]).then(function (r) { applyThemes(r[0]); applyAccueil(r[1]); });

  /* ════════ ÉTAT ADMIN, TOAST, GLISSER, BARRE ════════ */
  var isAdmin = false, dock = null, editMode = null, dirty = false, UNDO = [];
  function markDirty() { dirty = true; }
  var toastEl = null, toastTimer = null;
  function toast(msg) {
    if (!toastEl) { toastEl = el('div', 'lva-toast'); document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('on');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove('on'); }, 2600);
  }
  function dragify(handle, item, o) {
    handle.style.touchAction = 'none'; handle.classList.add('lva-grab');
    handle.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      if (e.target.isContentEditable) return;
      if (e.target.closest && e.target.closest('.lva-x,.lva-chev,input,select,textarea,button')) return;
      e.preventDefault();
      var sx = e.clientX, sy = e.clientY, started = false, clone = null, dx = 0, dy = 0;
      var orig = { p: item.parentNode, n: item.nextSibling };
      try { handle.setPointerCapture(e.pointerId); } catch (_) {}
      function mv(ev) {
        if (!started) {
          if (Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) < 7) return;
          started = true;
          var r = item.getBoundingClientRect(); dx = sx - r.left; dy = sy - r.top;
          clone = item.cloneNode(true);
          clone.style.cssText = 'position:fixed;left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px;margin:0;z-index:100100;pointer-events:none;opacity:.93;box-shadow:0 22px 60px rgba(0,0,0,.75);background:#0b0a08;overflow:hidden';
          document.body.appendChild(clone);
          item.classList.add('lva-ghost'); document.body.classList.add('lva-dragging');
        }
        clone.style.left = (ev.clientX - dx) + 'px'; clone.style.top = (ev.clientY - dy) + 'px';
        if (ev.clientY < 80) window.scrollBy(0, -16); else if (ev.clientY > innerHeight - 80) window.scrollBy(0, 16);
        var scr = o.scroller && o.scroller();
        if (scr) { var sb = scr.getBoundingClientRect(); if (ev.clientY < sb.top + 70) scr.scrollTop -= 16; else if (ev.clientY > sb.bottom - 70) scr.scrollTop += 16; }
        var cs = o.containers(), tgt = null;
        for (var i = 0; i < cs.length; i++) { var b = cs[i].getBoundingClientRect(); if (ev.clientX >= b.left - 10 && ev.clientX <= b.right + 10 && ev.clientY >= b.top - 8 && ev.clientY <= b.bottom + 8) { tgt = cs[i]; break; } }
        if (!tgt) return;
        var its = o.items(tgt).filter(function (x) { return x !== item; }), ref = null;
        for (var j = 0; j < its.length; j++) { var rb = its[j].getBoundingClientRect(); if (ev.clientY < rb.top + rb.height / 2) { ref = its[j]; break; } }
        if (!ref && o.beforeRef) ref = o.beforeRef(tgt);
        if (item.parentNode !== tgt || item.nextSibling !== ref) { if (ref) tgt.insertBefore(item, ref); else tgt.appendChild(item); }
      }
      function up() {
        handle.removeEventListener('pointermove', mv);
        handle.removeEventListener('pointerup', up);
        handle.removeEventListener('pointercancel', up);
        if (started) {
          if (clone) clone.remove();
          item.classList.remove('lva-ghost'); document.body.classList.remove('lva-dragging');
          if (item.parentNode !== orig.p || item.nextSibling !== orig.n) {
            UNDO.push(function () { if (orig.n && orig.n.parentNode === orig.p) orig.p.insertBefore(item, orig.n); else orig.p.appendChild(item); });
            markDirty(); if (o.onMoved) o.onMoved(item);
          }
          var block = function (ev) { ev.preventDefault(); ev.stopPropagation(); item.removeEventListener('click', block, true); };
          item.addEventListener('click', block, true);
          setTimeout(function () { item.removeEventListener('click', block, true); }, 320);
        }
      }
      handle.addEventListener('pointermove', mv);
      handle.addEventListener('pointerup', up);
      handle.addEventListener('pointercancel', up);
    });
  }
  function doUndo() { var f = UNDO.pop(); if (f) { try { f(); } catch (_) {} toast(T('Action annulée', 'Action undone')); } else toast(T('Rien à annuler', 'Nothing to undo')); }
  function keyUndo(e) { if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) { e.preventDefault(); doUndo(); } }
  var barEl = null;
  function showBar(label, buttons) {
    hideBar();
    barEl = el('div'); barEl.id = 'lva-bar';
    var l = el('span', 'lva-bar-lab'); l.textContent = label; barEl.appendChild(l);
    buttons.forEach(function (b) {
      var x = el('button', 'lva-bar-b' + (b.prim ? ' lva-prim' : '') + (b.fmt ? ' lva-fmt' : ''));
      x.type = 'button'; x.innerHTML = b.html; if (b.title) x.title = b.title;
      x.addEventListener('click', b.fn); barEl.appendChild(x);
    });
    document.body.appendChild(barEl);
  }
  function hideBar() { if (barEl) { barEl.remove(); barEl = null; } }

  /* ════════ ÉDITION SUR PAGE : ARTICLE ════════ */
  var artChrome = null;
  function fmt(cmd, val) { try { document.execCommand(cmd, false, val || null); } catch (_) {} markDirty(); }
  function wrapRef() {
    var s = window.getSelection(); if (!s.rangeCount || s.isCollapsed) { toast(T('Sélectionne d\u2019abord la référence', 'Select the reference first')); return; }
    var r = s.getRangeAt(0), span = el('span', 'ref');
    try { r.surroundContents(span); } catch (_) { fmt('insertHTML', '<span class="ref">' + esc(s.toString()) + '</span>'); }
    markDirty();
  }
  function enterArticle() {
    if (editMode) return; editMode = 'article'; dirty = false;
    document.body.classList.add('lva-editing');
    var h1 = artEl.querySelector('h1');
    artEl.setAttribute('contenteditable', 'true');
    artEl.addEventListener('input', markDirty);
    artChrome = el('div', 'lva-meta');
    artChrome.setAttribute('contenteditable', 'false');
    var lab1 = el('div', 'lva-meta-lab'); lab1.textContent = T('Résumé — affiché sur la vignette de la bibliothèque', 'Summary — shown on the library card');
    var rz = el('div', 'lva-meta-resume'); rz.setAttribute('contenteditable', 'true'); rz.textContent = artState.resume || '';
    rz.addEventListener('input', markDirty);
    var row = el('div', 'lva-meta-row');
    var lab2 = el('span', 'lva-meta-lab'); lab2.style.margin = '0'; lab2.textContent = T('Domaine', 'Domain');
    var sel = el('select', 'lva-sel');
    ((IDX && IDX.themes) || []).forEach(function (t) { var o = el('option'); o.value = t.id; o.textContent = t.nom; sel.appendChild(o); });
    if (artState.theme) sel.value = artState.theme;
    sel.addEventListener('change', markDirty);
    row.appendChild(lab2); row.appendChild(sel);
    artChrome.appendChild(lab1); artChrome.appendChild(rz); artChrome.appendChild(row);
    if (h1) h1.insertAdjacentElement('afterend', artChrome); else artEl.insertBefore(artChrome, artEl.firstChild);
    showBar(T('Édition de l\u2019article', 'Editing article'), [
      { html: '\u00B6', fmt: 1, title: T('Paragraphe', 'Paragraph'), fn: function () { fmt('formatBlock', '<p>'); } },
      { html: 'T', fmt: 1, title: T('Intertitre', 'Heading'), fn: function () { fmt('formatBlock', '<h2>'); } },
      { html: '<i>I</i>', fmt: 1, title: T('Italique', 'Italic'), fn: function () { fmt('italic'); } },
      { html: '<b>G</b>', fmt: 1, title: T('Gras', 'Bold'), fn: function () { fmt('bold'); } },
      { html: '\u2020', fmt: 1, title: T('Référence biblique', 'Scripture reference'), fn: wrapRef },
      { html: T('Enregistrer', 'Save'), prim: 1, fn: function () { saveArticle(rz, sel); } },
      { html: T('Quitter', 'Leave'), fn: quitArticle }
    ]);
    toast(T('Clique dans le texte et écris directement', 'Click in the text and type directly'));
  }
  function teardownArticle() {
    document.body.classList.remove('lva-editing');
    artEl.removeAttribute('contenteditable');
    artEl.removeEventListener('input', markDirty);
    if (artChrome) { artChrome.remove(); artChrome = null; }
    hideBar(); editMode = null;
  }
  function quitArticle() {
    if (dirty && !confirm(T('Quitter sans enregistrer ? Les changements de cette page seront perdus.', 'Leave without saving? Changes on this page will be lost.'))) return;
    if (dirty) location.reload(); else teardownArticle();
  }
  function saveArticle(rz, sel) {
    var h1 = artEl.querySelector('h1');
    var clone = artEl.cloneNode(true);
    var ch1 = clone.querySelector('h1'); if (ch1) ch1.remove();
    var cm = clone.querySelector('.lva-meta'); if (cm) cm.remove();
    qsa('[contenteditable]', clone).forEach(function (n) { n.removeAttribute('contenteditable'); });
    clone.removeAttribute('contenteditable');
    var data = {};
    data['titre_' + lang] = h1 ? h1.textContent.trim() : '';
    data['resume_' + lang] = rz.textContent.trim();
    data['contenu_' + lang] = clone.innerHTML.trim();
    data.theme = sel.value || artState.theme || '';
    toast(T('Enregistrement…', 'Saving…'));
    db.collection('contenu').doc(artEl.getAttribute('data-article')).set(data, { merge: true }).then(function () {
      artState.resume = data['resume_' + lang]; artState.theme = data.theme; dirty = false;
      teardownArticle(); toast(T('Enregistré — visible par tous', 'Saved — visible to everyone'));
    }).catch(function (e) { toast(T('Erreur : ', 'Error: ') + e.message); });
  }

  /* ════════ ÉDITION SUR PAGE : BIBLIOTHÈQUE ════════ */
  function stopEv(e) { e.stopPropagation(); }
  function bodiesBiblio() { return qsa('.dom[data-theme] .sous-corps'); }
  function cardsIn(c) { return qsa(':scope > a.article-lien[data-card]', c); }
  function preventNav(e) { if (editMode) e.preventDefault(); }
  function enterBiblio() {
    if (editMode) return; editMode = 'biblio'; dirty = false; UNDO = [];
    document.body.classList.add('lva-editing');
    document.addEventListener('keydown', keyUndo, true);
    qsa('.dom[data-theme]').forEach(function (dom) {
      dom.classList.add('ouvert');
      var h = dom.querySelector('.dom-nom');
      if (h) { h.setAttribute('contenteditable', 'true'); h.addEventListener('mousedown', stopEv); h.addEventListener('click', stopEv); h.addEventListener('input', markDirty); }
      var corps = dom.querySelector('.dom-corps'); if (!corps) return;
      var bare = qsa(':scope > a.article-lien[data-card]', corps);
      var autres = corps.querySelector(':scope > .sous.lva-autres');
      if (!autres) {
        autres = creerSous('__autres', T('Sans catégorie', 'Uncategorized'));
        autres.classList.add('lva-autres', 'ouvert');
        var an = autres.querySelector('.sous-nom'); if (an) an.style.opacity = '.55';
        corps.appendChild(autres);
      }
      bare.forEach(function (c) { autres.querySelector('.sous-corps').appendChild(c); });
      var add = el('span', 'lva-addcat'); add.textContent = T('+ Nouvelle catégorie', '+ New category');
      add.addEventListener('click', function () {
        var nom = prompt(T('Nom de la catégorie :', 'Category name:'), ''); if (!nom) return;
        var base = nom.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'cat';
        var id = base, k = 2, ex = {}; qsa('.sous[data-cat]', corps).forEach(function (s) { ex[s.getAttribute('data-cat')] = 1; });
        while (ex[id]) id = base + '-' + (k++);
        var s = creerSous(id, nom); s.classList.add('ouvert');
        corps.insertBefore(s, add); decorerSous(dom, s); markDirty();
        UNDO.push(function () { s.remove(); });
      });
      corps.insertBefore(add, autres);
      qsa(':scope > .sous', corps).forEach(function (s) { decorerSous(dom, s); });
    });
    qsa('.dom[data-theme] a.article-lien[data-card]').forEach(function (card) {
      card.addEventListener('click', preventNav, true);
      dragify(card, card, { containers: bodiesBiblio, items: cardsIn });
    });
    showBar(T('Organisation de la bibliothèque', 'Organising the library'), [
      { html: '\u21B6 ' + T('Annuler', 'Undo'), title: 'Ctrl+Z', fn: doUndo },
      { html: T('Enregistrer', 'Save'), prim: 1, fn: saveBiblio },
      { html: T('Quitter', 'Leave'), fn: quitBiblio }
    ]);
    toast(T('Glisse les cartes ; clique un nom pour l\u2019écrire', 'Drag the cards; click a name to type'));
  }
  function decorerSous(dom, sous) {
    sous.classList.add('ouvert');
    var tete = sous.querySelector('.sous-tete'); if (!tete || tete.querySelector('.lva-grip')) return;
    var sn = sous.querySelector('.sous-nom');
    var autres = sous.classList.contains('lva-autres');
    if (sn && !autres) { sn.setAttribute('contenteditable', 'true'); sn.addEventListener('mousedown', stopEv); sn.addEventListener('click', stopEv); sn.addEventListener('input', markDirty); }
    var grip = el('span', 'lva-grip'); grip.textContent = '\u2630'; grip.title = T('Glisser la catégorie', 'Drag the category');
    tete.insertBefore(grip, tete.firstChild);
    if (!autres) {
      var x = el('span', 'lva-x'); x.textContent = '\u2715'; x.title = T('Supprimer la catégorie', 'Delete the category');
      x.addEventListener('click', function (e) {
        e.stopPropagation();
        if (!confirm(T('Supprimer cette catégorie ? Ses articles passent en « Sans catégorie ».', 'Delete this category? Its articles move to Uncategorized.'))) return;
        var corps = dom.querySelector('.dom-corps'), auto = corps.querySelector('.lva-autres .sous-corps');
        var par = sous.parentNode, nx = sous.nextSibling, sc = sous.querySelector('.sous-corps');
        var moved = qsa('a.article-lien[data-card]', sous);
        moved.forEach(function (c) { auto.appendChild(c); });
        sous.remove(); markDirty();
        UNDO.push(function () { if (nx && nx.parentNode === par) par.insertBefore(sous, nx); else par.appendChild(sous); moved.forEach(function (c) { sc.appendChild(c); }); });
      });
      tete.appendChild(x);
      dragify(grip, sous, {
        containers: function () { return qsa('.dom[data-theme] .dom-corps'); },
        items: function (c) { return qsa(':scope > .sous:not(.lva-autres)', c); },
        beforeRef: function (c) { return c.querySelector(':scope > .lva-addcat') || c.querySelector(':scope > .sous.lva-autres'); }
      });
    } else { grip.style.visibility = 'hidden'; }
  }
  function quitBiblio() {
    if (dirty) { if (confirm(T('Quitter sans enregistrer ? La page sera rechargée telle qu\u2019avant.', 'Leave without saving? The page will reload as before.'))) location.reload(); return; }
    location.reload();
  }
  function saveBiblio() {
    var d = { noms: {}, struct: {} };
    qsa('.dom[data-theme]').forEach(function (dom) {
      var th = dom.getAttribute('data-theme');
      var h = dom.querySelector('.dom-nom'); if (h) { d.noms[th] = d.noms[th] || {}; d.noms[th]['nom_' + lang] = h.textContent.trim(); }
      var st = { order: [], names: {}, arts: {} };
      qsa(':scope > .dom-corps > .sous', dom).forEach(function (sous) {
        var slugs = qsa('a.article-lien[data-card]', sous).map(function (c) { return c.getAttribute('data-card'); });
        if (sous.classList.contains('lva-autres')) { st.arts['__autres'] = slugs; return; }
        var cid = sous.getAttribute('data-cat');
        st.order.push(cid);
        var o = {}; o['nom_' + lang] = (sous.querySelector('.sous-nom') || { textContent: '' }).textContent.trim();
        st.names[cid] = o; st.arts[cid] = slugs;
      });
      d.struct[th] = st;
    });
    toast(T('Enregistrement…', 'Saving…'));
    db.doc('config/themes').set(d, { merge: true }).then(function () { dirty = false; toast(T('Enregistré — visible par tous', 'Saved — visible to everyone')); })
      .catch(function (e) { toast(T('Erreur : ', 'Error: ') + e.message); });
  }

  /* ════════ ÉDITION SUR PAGE : ACCUEIL ════════ */
  function preventNavCap(e) { if (editMode) { e.preventDefault(); e.stopPropagation(); } }
  function enterAccueil() {
    if (editMode) return; editMode = 'accueil'; dirty = false;
    document.body.classList.add('lva-editing');
    qsa('[data-lv-txt]').forEach(function (e) { e.setAttribute('contenteditable', 'true'); e.addEventListener('click', preventNavCap, true); e.addEventListener('input', markDirty); });
    qsa('.domaine[data-theme]').forEach(function (a) {
      ['h3', 'p'].forEach(function (t) { var e = a.querySelector(t); if (e) { e.setAttribute('contenteditable', 'true'); e.addEventListener('input', markDirty); } });
      a.addEventListener('click', preventNavCap, true);
    });
    showBar(T('Textes de l\u2019accueil', 'Home page texts'), [
      { html: T('Enregistrer', 'Save'), prim: 1, fn: saveAccueil },
      { html: T('Quitter', 'Leave'), fn: quitAccueil }
    ]);
    toast(T('Clique un texte et écris directement', 'Click a text and type directly'));
  }
  function teardownAccueil() {
    document.body.classList.remove('lva-editing');
    qsa('[data-lv-txt]').forEach(function (e) { e.removeAttribute('contenteditable'); e.removeEventListener('click', preventNavCap, true); });
    qsa('.domaine[data-theme]').forEach(function (a) {
      ['h3', 'p'].forEach(function (t) { var e = a.querySelector(t); if (e) e.removeAttribute('contenteditable'); });
      a.removeEventListener('click', preventNavCap, true);
    });
    hideBar(); editMode = null;
  }
  function quitAccueil() {
    if (dirty && !confirm(T('Quitter sans enregistrer ?', 'Leave without saving?'))) return;
    if (dirty) location.reload(); else teardownAccueil();
  }
  function saveAccueil() {
    var dAcc = {}, dTh = { noms: {} };
    qsa('[data-lv-txt]').forEach(function (e) { var k = e.getAttribute('data-lv-txt'); dAcc[k] = dAcc[k] || {}; dAcc[k]['t_' + lang] = e.textContent.trim(); });
    qsa('.domaine[data-theme]').forEach(function (a) {
      var th = a.getAttribute('data-theme'); dTh.noms[th] = dTh.noms[th] || {};
      var h = a.querySelector('h3'); if (h) dTh.noms[th]['nom_' + lang] = h.textContent.trim();
      var p = a.querySelector('p'); if (p) dTh.noms[th]['desc_' + lang] = p.textContent.trim();
    });
    toast(T('Enregistrement…', 'Saving…'));
    Promise.all([db.doc('config/accueil').set(dAcc, { merge: true }), db.doc('config/themes').set(dTh, { merge: true })])
      .then(function () { dirty = false; teardownAccueil(); toast(T('Enregistré — visible par tous', 'Saved — visible to everyone')); })
      .catch(function (e) { toast(T('Erreur : ', 'Error: ') + e.message); });
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
    memW = JSON.parse(JSON.stringify(PRE));
    memPage = el('div', 'lva-page');
    var w = el('div', 'lva-wrap'); memPage.appendChild(w);
    var head = el('div', 'lva-head');
    head.appendChild(el('h1', 'lva-h1', '<i>\u2726</i>' + T('Versets de base', 'Base verses')));
    var close = el('button', 'lva-close'); close.type = 'button'; close.textContent = T('Fermer', 'Close');
    close.addEventListener('click', function () { if (dirty && !confirm(T('Fermer sans enregistrer ?', 'Close without saving?'))) return; memPage.remove(); memPage = null; dirty = false; });
    head.appendChild(close); w.appendChild(head);
    w.appendChild(el('div', 'lva-note', T('La base commune à tous les comptes. Glisse les versets et les catégories pour les ranger ; tout s\u2019écrit directement dans les champs.', 'The base shared by all accounts. Drag verses and categories to arrange them; type directly in the fields.')));
    var search = el('input', 'lva-in'); search.type = 'text'; search.placeholder = T('Rechercher une catégorie ou une référence…', 'Search a category or a reference…'); search.style.marginBottom = '18px';
    w.appendChild(search);
    var host = el('div'); w.appendChild(host);
    var addC = el('span', 'lva-addcat'); addC.textContent = T('+ Nouvelle catégorie', '+ New category');
    addC.addEventListener('click', function () { var c = { id: '', name: { fr: '', en: '' }, verses: [], __open: true }; memW.push(c); host.appendChild(memCatBlock(c, host)); markDirty(); });
    w.appendChild(addC);
    var act = el('div', 'lva-actions');
    var save = el('button', 'lva-btn'); save.type = 'button'; save.textContent = T('Enregistrer', 'Save');
    var stat = el('span', 'lva-stat'); stat.style.marginTop = '0';
    act.appendChild(save); act.appendChild(stat); w.appendChild(act);
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
      var vx = el('span', 'lva-x'); vx.textContent = '\u2715'; vx.style.marginLeft = 'auto'; vh.appendChild(vx);
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
        containers: function () { return qsa('.lva-cat.on .lva-cat-b', host).filter(function (bb) { return bb.children.length; }); },
        items: function (cb) { return qsa(':scope > .lva-v', cb); },
        beforeRef: function (cb) { return cb.querySelector(':scope > .lva-addcat'); },
        scroller: function () { return memPage; }
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
    if (c.__open) fill(); else majCnt();
    dragify(grip, block, {
      containers: function () { return [host]; },
      items: function (hh) { return qsa(':scope > .lva-cat', hh); },
      scroller: function () { return memPage; }
    });
    return block;
  }

  /* ════════ PANNEAU CENTRAL ════════ */
  var hub = null, hubBody = null, hubTabs = {}, hubCache = {};
  function openHub(tab) { if (!hub) buildHub(); hub.style.display = 'block'; selectTab(tab || 'articles'); }
  function closeHub() { if (hub) hub.style.display = 'none'; }
  function buildHub() {
    hub = el('div', 'lva-page'); hub.style.display = 'none';
    var w = el('div', 'lva-wrap'); hub.appendChild(w);
    var head = el('div', 'lva-head');
    head.appendChild(el('h1', 'lva-h1', '<i>\u2726</i>Administration'));
    var close = el('button', 'lva-close'); close.type = 'button'; close.textContent = T('Fermer', 'Close');
    close.addEventListener('click', closeHub); head.appendChild(close);
    w.appendChild(head);
    var tabs = el('div', 'lva-tabs'); w.appendChild(tabs);
    hubBody = el('div'); w.appendChild(hubBody);
    [['articles', T('Articles', 'Articles')], ['themes', T('Thèmes', 'Themes')], ['apparence', T('Apparence', 'Appearance')], ['accueil', T('Accueil', 'Home')], ['memoriser', 'Mémoriser'], ['exporter', T('Exporter', 'Export')]].forEach(function (t) {
      var b = el('button', 'lva-tab'); b.type = 'button'; b.textContent = t[1];
      b.addEventListener('click', function () { selectTab(t[0]); });
      tabs.appendChild(b); hubTabs[t[0]] = b;
    });
    document.body.appendChild(hub);
  }
  function selectTab(id) {
    Object.keys(hubTabs).forEach(function (k) { hubTabs[k].classList.toggle('on', k === id); });
    hubBody.innerHTML = '';
    var fns = { articles: tabArticles, themes: tabThemes, apparence: tabApparence, accueil: tabAccueil, memoriser: tabMemoriser, exporter: tabExport };
    fns[id]();
  }
  function urlEdition(u) { return u + (u.indexOf('?') >= 0 ? '&' : '?') + 'edition=1'; }

  function tabArticles() {
    if (!IDX || !IDX.articles) { hubBody.appendChild(el('div', 'lva-note', T('Index indisponible sur cette page.', 'Index unavailable on this page.'))); return; }
    hubBody.appendChild(el('div', 'lva-note', T('Tous les articles du site, en un seul endroit. Le titre, le résumé et le domaine se modifient ici ; le texte de l\u2019article se modifie sur sa page, directement.', 'All the site\u2019s articles in one place. Title, summary and domain are edited here; the body is edited on its page, directly.')));
    var search = el('input', 'lva-in'); search.placeholder = T('Rechercher un article…', 'Search an article…'); search.style.margin = '0 0 16px';
    hubBody.appendChild(search);
    var list = el('div'); hubBody.appendChild(list);
    var thById = {}; ((IDX && IDX.themes) || []).forEach(function (t) { thById[t.id] = t.nom; });
    function rendre() {
      list.innerHTML = '';
      var q = (search.value || '').toLowerCase();
      var ov = hubCache.contenu || {};
      IDX.articles.forEach(function (a) {
        var o = ov[a.id] || {};
        var titre = o['titre_' + lang] || a.titre;
        if (q && (titre + ' ' + a.id).toLowerCase().indexOf(q) < 0) return;
        var theme = o.theme || a.theme;
        var li = el('div', 'lva-li');
        var h = el('div', 'lva-li-h');
        if (ov[a.id]) { var dot = el('span', 'lva-li-dot'); dot.title = T('Modifié en ligne', 'Edited online'); h.appendChild(dot); }
        var tEl = el('span', 'lva-li-t'); tEl.textContent = titre; h.appendChild(tEl);
        var badge = el('span', 'lva-li-b'); badge.textContent = thById[theme] || theme; h.appendChild(badge);
        li.appendChild(h);
        var body = el('div', 'lva-li-body'); li.appendChild(body);
        var filled = false;
        h.addEventListener('click', function () {
          li.classList.toggle('on');
          if (!li.classList.contains('on') || filled) return; filled = true;
          body.appendChild(el('label', 'lva-lab', T('Titre', 'Title')));
          var iT = el('input', 'lva-in'); iT.value = titre; body.appendChild(iT);
          body.appendChild(el('label', 'lva-lab', T('Résumé (vignette de la bibliothèque)', 'Summary (library card)')));
          var iR = el('textarea', 'lva-ta'); iR.rows = 3; iR.value = (typeof o['resume_' + lang] === 'string') ? o['resume_' + lang] : (a.resume || ''); body.appendChild(iR);
          body.appendChild(el('label', 'lva-lab', T('Domaine', 'Domain')));
          var sel = el('select', 'lva-sel');
          ((IDX && IDX.themes) || []).forEach(function (t) { var op = el('option'); op.value = t.id; op.textContent = t.nom; sel.appendChild(op); });
          sel.value = theme; body.appendChild(sel);
          var act = el('div', 'lva-actions');
          var sv = el('button', 'lva-btn'); sv.type = 'button'; sv.textContent = T('Enregistrer', 'Save');
          var go = el('button', 'lva-btn2'); go.type = 'button'; go.textContent = T('Modifier le texte sur la page \u2192', 'Edit the body on the page \u2192');
          var st = el('span', 'lva-stat'); st.style.marginTop = '0';
          act.appendChild(sv); act.appendChild(go); act.appendChild(st); body.appendChild(act);
          sv.addEventListener('click', function () {
            var d = {}; d['titre_' + lang] = iT.value.trim(); d['resume_' + lang] = iR.value.trim(); d.theme = sel.value;
            st.textContent = T('Enregistrement…', 'Saving…');
            db.collection('contenu').doc(a.id).set(d, { merge: true }).then(function () {
              hubCache.contenu = hubCache.contenu || {};
              hubCache.contenu[a.id] = Object.assign(hubCache.contenu[a.id] || {}, d);
              tEl.textContent = d['titre_' + lang] || a.titre;
              badge.textContent = thById[d.theme] || d.theme;
              st.textContent = T('Enregistré.', 'Saved.');
            }).catch(function (e) { st.textContent = T('Erreur : ', 'Error: ') + e.message; });
          });
          go.addEventListener('click', function () { location.href = urlEdition(a.u); });
        });
        list.appendChild(li);
      });
      if (!list.children.length) list.appendChild(el('div', 'lva-note', T('Aucun article ne correspond.', 'No article matches.')));
    }
    search.addEventListener('input', rendre);
    rendre();
    if (!hubCache.contenu) db.collection('contenu').get().then(function (qs) { hubCache.contenu = {}; qs.forEach(function (d) { hubCache.contenu[d.id] = d.data(); }); rendre(); }).catch(function () {});
  }

  function tabThemes() {
    hubBody.appendChild(el('div', 'lva-note', T('Les noms et descriptions des domaines se modifient ici. L\u2019organisation (catégories, ordre, rangement des articles) se fait sur la page Bibliothèque, en glissant.', 'Domain names and descriptions are edited here. Organisation happens on the Library page, by dragging.')));
    var go = el('button', 'lva-btn2'); go.type = 'button'; go.textContent = T('Organiser la bibliothèque \u2192', 'Organise the library \u2192');
    go.addEventListener('click', function () {
      if (PAGE === 'biblio') { closeHub(); enterBiblio(); }
      else location.href = urlEdition((IDX && IDX.urls && IDX.urls.biblio) || '/bibliotheque/');
    });
    hubBody.appendChild(go);
    var host = el('div'); hubBody.appendChild(host);
    gdoc('config/themes').then(function (ov) {
      var noms = (ov && ov.noms) || {};
      ((IDX && IDX.themes) || []).forEach(function (t) {
        host.appendChild(el('div', 'lva-sec-t', esc(t.nom)));
        var r = el('div', 'lva-row2');
        var c1 = el('div'); c1.appendChild(el('label', 'lva-lab', T('Nom', 'Name')));
        var iN = el('input', 'lva-in lva-th-f'); iN.value = (noms[t.id] && noms[t.id]['nom_' + lang]) || t.nom; c1.appendChild(iN);
        var c2 = el('div'); c2.appendChild(el('label', 'lva-lab', T('Description (accueil)', 'Description (home)')));
        var iD = el('textarea', 'lva-ta lva-th-f'); iD.rows = 2; iD.value = (noms[t.id] && noms[t.id]['desc_' + lang]) || t.desc || ''; c2.appendChild(iD);
        r.appendChild(c1); r.appendChild(c2); host.appendChild(r);
        iN.__th = t.id; iN.__k = 'nom'; iD.__th = t.id; iD.__k = 'desc';
      });
      var act = el('div', 'lva-actions');
      var sv = el('button', 'lva-btn'); sv.type = 'button'; sv.textContent = T('Enregistrer les noms', 'Save names');
      var st = el('span', 'lva-stat'); st.style.marginTop = '0';
      act.appendChild(sv); act.appendChild(st); host.appendChild(act);
      sv.addEventListener('click', function () {
        var d = { noms: {} };
        qsa('.lva-th-f', host).forEach(function (f) { d.noms[f.__th] = d.noms[f.__th] || {}; d.noms[f.__th][f.__k + '_' + lang] = f.value.trim(); });
        st.textContent = T('Enregistrement…', 'Saving…');
        db.doc('config/themes').set(d, { merge: true }).then(function () { st.textContent = T('Enregistré.', 'Saved.'); applyThemes(d); })
          .catch(function (e) { st.textContent = T('Erreur : ', 'Error: ') + e.message; });
      });
    });
  }

  function tabApparence() {
    hubBody.appendChild(el('div', 'lva-note', T('Toute l\u2019apparence du site, appliquée partout d\u2019un coup. Chaque réglage se prévisualise en direct sur la page derrière ; rien n\u2019est public avant Enregistrer.', 'The whole site\u2019s appearance at once. Everything previews live; nothing is public before you save.')));
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
    var st = el('span', 'lva-stat'); st.style.marginTop = '0';
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
    hubBody.addEventListener('input', function () { applyApparence(valeurs()); });
    sv.addEventListener('click', function () {
      var d = valeurs(); st.textContent = T('Enregistrement…', 'Saving…');
      db.doc('config/apparence').set(d).then(function () { applyApparence(d); st.textContent = T('Enregistré. Visible par tous, sur tout le site.', 'Saved. Visible to everyone, site-wide.'); })
        .catch(function (e) { st.textContent = T('Erreur : ', 'Error: ') + e.message; });
    });
    rs.addEventListener('click', function () {
      if (!confirm(T('Revenir à l\u2019apparence d\u2019origine du site ?', 'Reset the site to its original appearance?'))) return;
      db.doc('config/apparence').delete().then(function () { applyApparence({}); prefill({}); st.textContent = T('Réinitialisé.', 'Reset.'); })
        .catch(function (e) { st.textContent = T('Erreur : ', 'Error: ') + e.message; });
    });
    gdoc('config/apparence').then(prefill);
  }

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
    hubBody.appendChild(el('div', 'lva-note', T('Les textes de la page d\u2019accueil. Tu peux aussi les modifier directement sur la page elle-même (✦ \u2192 Modifier les textes de l\u2019accueil).', 'The home page texts. You can also edit them directly on the page itself.')));
    var defs = (IDX && IDX.accueil) || {};
    var fields = {};
    KEYS.forEach(function (k) {
      hubBody.appendChild(el('label', 'lva-lab', k[1]));
      var i = el('input', 'lva-in'); i.placeholder = defs[k[0]] || ''; hubBody.appendChild(i);
      fields[k[0]] = i;
    });
    var act = el('div', 'lva-actions');
    var sv = el('button', 'lva-btn'); sv.type = 'button'; sv.textContent = T('Enregistrer', 'Save');
    var st = el('span', 'lva-stat'); st.style.marginTop = '0';
    act.appendChild(sv); act.appendChild(st); hubBody.appendChild(act);
    gdoc('config/accueil').then(function (d) {
      d = d || {};
      KEYS.forEach(function (k) { var o = d[k[0]]; if (o && typeof o['t_' + lang] === 'string') fields[k[0]].value = o['t_' + lang]; });
    });
    sv.addEventListener('click', function () {
      var d = {};
      KEYS.forEach(function (k) { var val = fields[k[0]].value.trim(); if (val) { d[k[0]] = {}; d[k[0]]['t_' + lang] = val; } });
      st.textContent = T('Enregistrement…', 'Saving…');
      db.doc('config/accueil').set(d, { merge: true }).then(function () { st.textContent = T('Enregistré.', 'Saved.'); applyAccueil(d); })
        .catch(function (e) { st.textContent = T('Erreur : ', 'Error: ') + e.message; });
    });
  }

  function tabMemoriser() {
    hubBody.appendChild(el('div', 'lva-note', T('Les versets de base, communs à tous les comptes : catégories et versets s\u2019y créent, s\u2019y écrivent et s\u2019y glissent.', 'The base verses, shared by all accounts.')));
    var go = el('button', 'lva-btn2'); go.type = 'button'; go.textContent = T('Ouvrir l\u2019éditeur des versets \u2192', 'Open the verses editor \u2192');
    go.addEventListener('click', function () { closeHub(); openMem(); });
    hubBody.appendChild(go);
  }

  function tabExport() {
    hubBody.appendChild(el('div', 'lva-note', T('Tout ce que tu as modifié en ligne, à copier ou télécharger pour que je le reporte dans les fichiers et le traduise. « Tout », ou chaque partie séparément.', 'Everything you changed online, to copy or download.')));
    var scopes = [['tout', T('Tout', 'All')], ['apparence', T('Apparence', 'Appearance')], ['themes', T('Thèmes', 'Themes')], ['accueil', T('Accueil', 'Home')], ['memoriser', 'Mémoriser'], ['contenu', T('Articles', 'Articles')]];
    var scope = 'tout', data = null, chips = {};
    var chipRow = el('div'); chipRow.style.margin = '0 0 14px'; hubBody.appendChild(chipRow);
    scopes.forEach(function (s) {
      var c = el('button', 'lva-chip'); c.type = 'button'; c.textContent = s[1];
      c.addEventListener('click', function () { scope = s[0]; maj(); });
      chipRow.appendChild(c); chips[s[0]] = c;
    });
    var ta = el('textarea', 'lva-ta lva-mono'); ta.rows = 16; ta.readOnly = true; hubBody.appendChild(ta);
    var act = el('div', 'lva-actions');
    var cp = el('button', 'lva-btn'); cp.type = 'button'; cp.textContent = T('Copier', 'Copy');
    var dl = el('button', 'lva-btn2'); dl.type = 'button'; dl.textContent = T('Télécharger', 'Download');
    var clr = el('button', 'lva-btn3'); clr.type = 'button'; clr.textContent = T('Effacer en ligne…', 'Clear online…');
    var st = el('span', 'lva-stat'); st.style.marginTop = '0';
    act.appendChild(cp); act.appendChild(dl); act.appendChild(clr); act.appendChild(st); hubBody.appendChild(act);
    function sous() {
      if (!data) return {};
      if (scope === 'tout') return data;
      if (scope === 'contenu') return { contenu: data.contenu };
      var o = {}; o[scope] = data[scope]; return o;
    }
    function maj() {
      Object.keys(chips).forEach(function (k) { chips[k].classList.toggle('on', k === scope); });
      ta.value = data ? JSON.stringify(sous(), null, 2) : T('Lecture…', 'Reading…');
    }
    function rassembler() {
      return Promise.all([gdoc('config/apparence'), gdoc('config/themes'), gdoc('config/accueil'), gdoc('config/memoriser'), db.collection('contenu').get().catch(function () { return null; })])
        .then(function (r) {
          var o = { apparence: r[0], themes: r[1], accueil: r[2], memoriser: r[3], contenu: {} };
          if (r[4]) r[4].forEach(function (d) { o.contenu[d.id] = d.data(); });
          return o;
        });
    }
    maj();
    rassembler().then(function (o) { data = o; maj(); });
    cp.addEventListener('click', function () {
      ta.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (_) {}
      if (navigator.clipboard) navigator.clipboard.writeText(ta.value).then(function () { st.textContent = T('Copié.', 'Copied.'); }).catch(function () { st.textContent = ok ? T('Copié.', 'Copied.') : T('Sélectionne et copie à la main.', 'Select and copy manually.'); });
      else st.textContent = ok ? T('Copié.', 'Copied.') : T('Sélectionne et copie à la main.', 'Select and copy manually.');
    });
    dl.addEventListener('click', function () {
      var blob = new Blob([ta.value], { type: 'application/json' }); var a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'lumen-' + scope + '-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 800);
      st.textContent = T('Téléchargé.', 'Downloaded.');
    });
    clr.addEventListener('click', function () {
      if (!confirm(T('Effacer TOUTES tes modifications en ligne ? À ne faire qu\u2019APRÈS leur intégration dans les fichiers et le redéploiement du site.', 'Clear ALL your online changes? Only after merge into files and redeploy.'))) return;
      st.textContent = T('Effacement…', 'Clearing…');
      rassembler().then(function (o) {
        var b = db.batch();
        ['apparence', 'themes', 'accueil', 'memoriser'].forEach(function (k) { if (o[k]) b.delete(db.doc('config/' + k)); });
        Object.keys(o.contenu || {}).forEach(function (sl) { b.delete(db.collection('contenu').doc(sl)); });
        return b.commit();
      }).then(function () { st.textContent = T('Tout effacé en ligne. Recharge la page.', 'All cleared online. Reload the page.'); })
        .catch(function (e) { st.textContent = T('Erreur : ', 'Error: ') + e.message; });
    });
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
    if (PAGE === 'article') enterArticle();
    else if (PAGE === 'biblio') enterBiblio();
    else if (PAGE === 'accueil') enterAccueil();
    else if (PAGE === 'memoriser') openMem();
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
      i1.innerHTML = esc(act) + '<small>' + T('Édition directe, sur la page', 'Direct, on-page editing') + '</small>';
      i1.addEventListener('click', function () { m.classList.remove('on'); pageEnter(); });
      m.appendChild(i1);
    }
    var i2 = el('button', 'lva-dock-i'); i2.type = 'button';
    i2.innerHTML = T('Panneau d\u2019administration', 'Administration panel') + '<small>' + T('Tout le site : articles, thèmes, apparence, export', 'Whole site: articles, themes, appearance, export') + '</small>';
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
    if (isAdmin) { buildDock(); autoEdit(); }
    majCompte(); majDock();
  });

  var autoDone = false;
  function autoEdit() {
    if (autoDone) return; autoDone = true;
    var q = location.search || '';
    if (/[?&]outils=1/.test(q)) setOutils(false);
    if (/[?&]edition=1/.test(q)) {
      try { history.replaceState(null, '', location.pathname + location.hash); } catch (_) {}
      setTimeout(pageEnter, 400);
    }
  }
})();

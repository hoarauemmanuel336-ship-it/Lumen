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
    '.lva-stat{font-size:14px;color:var(--lvaM);min-height:18px}',
    '.lva-stick{position:sticky;bottom:0;background:rgba(7,6,4,.97);border-top:1px solid var(--lvaL);padding:14px 0;margin-top:30px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;z-index:5}',
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
    '.lva-li-body{display:none;padding:6px 16px 22px;border-top:1px solid rgba(231,224,207,.1)}',
    '.lva-li.on .lva-li-body{display:block}',
    '.lva-fmtbar{display:flex;gap:6px;margin:14px 0 10px;flex-wrap:wrap}',
    '.lva-fmt{min-width:42px;text-align:center;background:none;border:1px solid var(--lvaL);color:var(--lvaT);font-family:"Cormorant Garamond",serif;font-size:15px;padding:8px 10px;cursor:pointer;transition:all .2s}',
    '.lva-fmt:hover{border-color:var(--lvaL2);color:#fff}',
    '.lva-doc{background:#070605;border:1px solid var(--lvaL);padding:26px 30px;line-height:1.75;font-size:17px;color:var(--lvaT);min-height:260px;outline:none}',
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
    '.lva-toast{position:fixed;left:50%;bottom:30px;transform:translateX(-50%);z-index:100090;background:#0b0a08;border:1px solid var(--lvaL2);color:var(--lvaT);font-family:"Cormorant Garamond",serif;font-size:14px;letter-spacing:.08em;padding:12px 26px;box-shadow:0 18px 50px rgba(0,0,0,.7);opacity:0;transition:opacity .35s;pointer-events:none}',
    '.lva-toast.on{opacity:1}'
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
  function gdoc(p) { return db.doc(p).get().then(function (s) { return s.exists ? s.data() : null; }).catch(function () { return null; }); }
  gdoc('config/apparence').then(function (d) { if (d) applyApparence(d); });
  if (PAGE === 'article') db.collection('contenu').doc(artEl.getAttribute('data-article')).get().then(function (s) { if (s.exists) applyArticle(s.data()); }).catch(function () {});
  if (PAGE === 'biblio') {
    Promise.all([gdoc('config/themes'), db.collection('contenu').get().catch(function () { return null; })]).then(function (r) {
      contMap = {}; if (r[1]) r[1].forEach(function (d) { contMap[d.id] = d.data(); });
      relocaliser(); applyThemes(r[0]); applyCards();
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

  /* ════════ PANNEAU CENTRAL ════════ */
  var hub = null, hubBody = null, hubTabs = {}, hubCache = {}, hubOpt = null;
  function openHub(tab, opt) { if (!hub) buildHub(); hubOpt = opt || null; hub.style.display = 'block'; selectTab(tab || 'articles'); }
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
    [['articles', T('Articles', 'Articles')], ['biblio', T('Bibliothèque', 'Library')], ['apparence', T('Apparence', 'Appearance')], ['accueil', T('Accueil', 'Home')], ['memoriser', 'Mémoriser'], ['exporter', T('Exporter', 'Export')]].forEach(function (t) {
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
    var list = el('div'); hubBody.appendChild(list);
    var thById = {}; (IDX.themes || []).forEach(function (t) { thById[t.id] = t.nom; });
    var voulu = hubOpt && hubOpt.slug; hubOpt = null;
    function rendre() {
      list.innerHTML = '';
      var q = (search.value || '').toLowerCase();
      var ov = hubCache.contenu || {};
      IDX.articles.forEach(function (a) {
        var o = ov[a.id] || {};
        var titre = o['titre_' + lang] || a.titre;
        if (q && (titre + ' ' + a.id).toLowerCase().indexOf(q) < 0) return;
        var li = el('div', 'lva-li'); li.__slug = a.id;
        var h = el('div', 'lva-li-h');
        if (ov[a.id]) { var dot = el('span', 'lva-li-dot'); dot.title = T('Modifié en ligne', 'Edited online'); h.appendChild(dot); }
        var tEl = el('span', 'lva-li-t'); tEl.textContent = titre; h.appendChild(tEl);
        var badge = el('span', 'lva-li-b'); badge.textContent = thById[o.theme || a.theme] || a.theme; h.appendChild(badge);
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
      var bar = el('div', 'lva-fmtbar');
      var doc = el('div', 'lva-doc'); doc.contentEditable = 'true';
      doc.innerHTML = '<p style="color:#9a958a">' + T('Chargement du texte…', 'Loading the text…') + '</p>';
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
      fmtBtn('\u2020', T('Référence biblique (sur la sélection)', 'Scripture reference (on selection)'), function () {
        var s = window.getSelection();
        if (!s.rangeCount || s.isCollapsed) { toast(T('Sélectionne d\u2019abord la référence', 'Select the reference first')); return; }
        var r = s.getRangeAt(0), span = el('span', 'ref');
        try { r.surroundContents(span); } catch (_) { ex('insertHTML', '<span class="ref">' + esc(s.toString()) + '</span>'); }
      });
      body.appendChild(bar); body.appendChild(doc);
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
      var b = el('div', 'lva-cat on' + (aut ? ' lva-aut' : '')); b.__cid = cid; b.__aut = !!aut;
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
      var ovTheme = {}, ovTitres = {};
      if (r[1]) r[1].forEach(function (d) { var x = d.data(); if (x.theme) ovTheme[d.id] = x.theme; if (x['titre_' + lang]) ovTitres[d.id] = x['titre_' + lang]; });
      var assigne = {}; (IDX.articles || []).forEach(function (a) { assigne[a.id] = ovTheme[a.id] || a.theme; });
      var assigneInitial = Object.assign({}, assigne);

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
        (IDX.articles || []).forEach(function (a) { if (assigne[a.id] === t.id && !place[a.id]) { place[a.id] = 1; autres.push(a.id); } });
        liste.appendChild(blocCat(sec, '__autres', '', autres, ovTitres, true));

        var add = el('span', 'lva-addcat'); add.textContent = T('+ Nouvelle catégorie', '+ New category');
        add.addEventListener('click', function () {
          var nm = prompt(T('Nom de la catégorie :', 'Category name:'), ''); if (!nm) return;
          var base = nm.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'cat';
          var id = base, k = 2, ex = {}; qsa('.lva-cat', host).forEach(function (bb) { ex[bb.__cid] = 1; });
          while (ex[id]) id = base + '-' + (k++);
          var bN = blocCat(sec, id, nm, [], ovTitres, false);
          liste.insertBefore(bN, liste.querySelector(':scope > .lva-aut'));
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
        var d = { noms: {}, struct: {} }, finals = {};
        qsa('.lva-bth', host).forEach(function (sec) {
          var th = sec.__th;
          d.noms[th] = {}; d.noms[th]['nom_' + lang] = sec.__nom.value.trim(); d.noms[th]['desc_' + lang] = sec.__desc.value.trim();
          var stt = { order: [], names: {}, arts: {} };
          qsa(':scope .lva-cat', sec).forEach(function (b) {
            var slugs = qsa('.lva-art', b).map(function (r) { finals[r.__slug] = th; return r.__slug; });
            if (b.__aut) { stt.arts['__autres'] = slugs; return; }
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
    hubBody.appendChild(el('div', 'lva-note', T('Tout ce que tu as modifié en ligne, à copier ou télécharger pour que je le reporte dans les fichiers et le traduise. « Tout », ou chaque partie séparément.', 'Everything you changed online, to copy or download.')));
    var scopes = [['tout', T('Tout', 'All')], ['apparence', T('Apparence', 'Appearance')], ['themes', T('Bibliothèque', 'Library')], ['accueil', T('Accueil', 'Home')], ['memoriser', 'Mémoriser'], ['contenu', T('Articles', 'Articles')]];
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
    var st = el('span', 'lva-stat');
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

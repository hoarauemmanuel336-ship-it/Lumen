(function () {
  if (typeof firebase === 'undefined') return;
  var cfg = { apiKey: "AIzaSyC19lFNWUd-KYhCP4o7gpp0IcyfRTyHOyA", authDomain: "lumen-veritatis.firebaseapp.com", projectId: "lumen-veritatis", storageBucket: "lumen-veritatis.firebasestorage.app", messagingSenderId: "195902823875", appId: "1:195902823875:web:a8be1f216a5ae1d945f176" };
  if (!firebase.apps.length) firebase.initializeApp(cfg);
  if (typeof firebase.firestore !== 'function') return;
  var db = firebase.firestore(), auth = firebase.auth();
  var ADMIN = 'hoarauemmanuel336@gmail.com';
  var lang = (window.LUMEN && window.LUMEN.lang) || 'fr';
  var FR = lang !== 'en';
  var DOC = db.doc('config/themes');
  var AUTRES = '__autres';
  var AUTRES_LBL = FR ? 'Sans catégorie' : 'Uncategorized';

  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  var domsLib = qsa('.dom[data-theme]');
  var domsAcc = qsa('.domaine[data-theme]');
  if (!domsLib.length && !domsAcc.length) return;

  function slug(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }

  // ───────── APPLIQUER (tous les visiteurs) ─────────
  Promise.all([DOC.get(), db.collection('contenu').get().catch(function () { return null; })]).then(function (res) {
    var cfg = res[0], cont = res[1];
    if (cont) { var ov = {}; cont.forEach(function (d) { var t = d.data().theme; if (t) ov[d.id] = t; }); relocaliser(ov); }
    if (cfg.exists) appliquer(cfg.data());
  }).catch(function () {});

  function relocaliser(ov) {
    if (!domsLib.length) return;
    var parTheme = {}; domsLib.forEach(function (dom) { parTheme[dom.getAttribute('data-theme')] = dom; });
    qsa('a.article-lien[data-card]').forEach(function (card) {
      var sl = card.getAttribute('data-card'), cible = ov[sl]; if (!cible) return;
      var cur = card.closest('.dom[data-theme]'); cur = cur ? cur.getAttribute('data-theme') : null;
      if (cur === cible) return;
      var dest = parTheme[cible]; if (!dest) return;
      var corps = dest.querySelector('.dom-corps'); if (corps) corps.appendChild(card);
    });
  }

  function appliquer(d) {
    var noms = d.noms || {}, struct = d.struct || {}, cats = d.cats || {}, ordre = d.ordre || {};
    domsLib.forEach(function (dom) {
      var th = dom.getAttribute('data-theme');
      var nm = noms[th]; if (nm && nm['nom_' + lang]) { var h = dom.querySelector('.dom-nom'); if (h) h.textContent = nm['nom_' + lang]; }
      if (struct[th]) rendreStruct(dom, struct[th]);
      else appliquerAncien(dom, th, cats, ordre); // compat versions précédentes (noms cat + ordre)
    });
    domsAcc.forEach(function (a) {
      var th = a.getAttribute('data-theme'); var nm = noms[th]; if (!nm) return;
      if (nm['nom_' + lang]) { var h = a.querySelector('h3'); if (h) h.textContent = nm['nom_' + lang]; }
      if (nm['desc_' + lang]) { var p = a.querySelector('p'); if (p) p.textContent = nm['desc_' + lang]; }
    });
  }

  function appliquerAncien(dom, th, cats, ordre) {
    qsa('.sous[data-cat]', dom).forEach(function (sous) {
      var k = th + '::' + sous.getAttribute('data-cat');
      if (cats[k] && cats[k]['nom_' + lang]) { var sn = sous.querySelector('.sous-nom'); if (sn) sn.textContent = cats[k]['nom_' + lang]; }
      var ord = ordre[k], corps = sous.querySelector('.sous-corps');
      if (ord && ord.length && corps) ord.forEach(function (sl) { var c = corps.querySelector('a[data-card="' + sl + '"]'); if (c) corps.appendChild(c); });
    });
  }

  function cartesDe(corps) { var m = {}; qsa('a.article-lien[data-card]', corps).forEach(function (c) { var sl = c.getAttribute('data-card'); if (!m[sl]) m[sl] = c; else c.remove(); }); return m; }

  function creerSous(cid, nm) {
    var s = document.createElement('div'); s.className = 'sous'; s.setAttribute('data-cat', cid);
    s.innerHTML = '<div class="sous-tete"><span class="sous-puce" aria-hidden="true"></span><span class="sous-nom"></span><span class="sous-chevron" aria-hidden="true">\u203A</span></div><div class="sous-corps"></div>';
    s.querySelector('.sous-nom').textContent = nm || '';
    s.querySelector('.sous-tete').addEventListener('click', function () { s.classList.toggle('ouvert'); });
    return s;
  }

  function rendreStruct(dom, st) {
    var corps = dom.querySelector('.dom-corps'); if (!corps) return;
    var order = st.order || [], names = st.names || {}, arts = st.arts || {};
    var cards = cartesDe(corps), used = {};
    var existing = {}; qsa('.sous[data-cat]', corps).forEach(function (s) { existing[s.getAttribute('data-cat')] = s; });
    order.forEach(function (cid) {
      var sous = existing[cid]; delete existing[cid];
      if (!sous) sous = creerSous(cid, names[cid] && names[cid]['nom_' + lang]);
      else if (names[cid] && names[cid]['nom_' + lang]) { var sn = sous.querySelector('.sous-nom'); if (sn) sn.textContent = names[cid]['nom_' + lang]; }
      corps.appendChild(sous);
      var sc = sous.querySelector('.sous-corps');
      (arts[cid] || []).forEach(function (sl) { if (cards[sl] && !used[sl]) { sc.appendChild(cards[sl]); used[sl] = 1; } });
    });
    Object.keys(existing).forEach(function (cid) { existing[cid].remove(); }); // catégories supprimées
    (arts[AUTRES] || []).forEach(function (sl) { if (cards[sl] && !used[sl]) { corps.appendChild(cards[sl]); used[sl] = 1; } });
    Object.keys(cards).forEach(function (sl) { if (!used[sl]) { corps.appendChild(cards[sl]); used[sl] = 1; } });
  }

  // ───────── ÉDITION (admin) ─────────
  var built = false, edit = false;
  auth.onAuthStateChanged(function (u) {
    var isAdmin = u && ((u.email || '').toLowerCase() === ADMIN);
    var btn = document.getElementById('lv-th-btn');
    if (!isAdmin) { if (btn) btn.style.display = 'none'; return; }
    if (built) { if (btn) btn.style.display = 'flex'; return; }
    construire();
  });

  function stop(e) { e.stopPropagation(); }
  function ctrlBtn(parent, txt, col, fn) {
    var b = document.createElement('span');
    b.textContent = txt; b.style.cssText = 'background:#000;color:' + (col || '#efe6cf') + ';border:1px solid #555;min-width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;font-family:sans-serif;font-size:13px;padding:0 4px';
    b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); fn(); });
    parent.appendChild(b); return b;
  }

  function bareCards(corps) { return Array.prototype.slice.call(corps.children).filter(function (n) { return n.classList && n.classList.contains('article-lien'); }); }

  function wrapAutres(dom) {
    var corps = dom.querySelector('.dom-corps');
    var bares = bareCards(corps); if (!bares.length && corps.querySelector('.lv-autres')) return;
    var box = corps.querySelector('.lv-autres');
    if (!box) { box = creerSous(AUTRES, AUTRES_LBL); box.classList.add('lv-autres'); box.classList.add('ouvert'); corps.appendChild(box); }
    var sc = box.querySelector('.sous-corps'); bares.forEach(function (c) { sc.appendChild(c); });
  }
  function unwrapAutres(dom) {
    var corps = dom.querySelector('.dom-corps'); var box = corps.querySelector('.lv-autres'); if (!box) return;
    qsa('a.article-lien[data-card]', box).forEach(function (c) { corps.appendChild(c); }); box.remove();
  }

  function catsList(dom) { // [{id,nom}] catégories réelles + autres
    var out = qsa('.sous[data-cat]', dom.querySelector('.dom-corps')).filter(function (s) { return !s.classList.contains('lv-autres'); })
      .map(function (s) { return { id: s.getAttribute('data-cat'), nom: (s.querySelector('.sous-nom') || {}).textContent || s.getAttribute('data-cat') }; });
    out.push({ id: AUTRES, nom: AUTRES_LBL }); return out;
  }
  function corpsDe(dom, cid) {
    if (cid === AUTRES) { var b = dom.querySelector('.dom-corps .lv-autres'); return b ? b.querySelector('.sous-corps') : null; }
    var s = dom.querySelector('.dom-corps .sous[data-cat="' + cid + '"]'); return s ? s.querySelector('.sous-corps') : null;
  }

  function decorer(dom) {
    var corps = dom.querySelector('.dom-corps');
    // catégories
    qsa('.sous[data-cat]', corps).forEach(function (sous) {
      sous.classList.add('ouvert');
      var sn = sous.querySelector('.sous-nom');
      var autres = sous.classList.contains('lv-autres');
      if (sn && !autres) { sn.contentEditable = 'true'; sn.style.outline = '1px dashed rgba(239,230,207,.6)'; sn.style.outlineOffset = '3px'; sn.addEventListener('mousedown', stop); sn.addEventListener('click', stop); }
      var tete = sous.querySelector('.sous-tete');
      var ctrl = document.createElement('span'); ctrl.className = 'lv-cat-ctrl'; ctrl.style.cssText = 'display:inline-flex;gap:4px;margin-left:auto';
      ctrl.addEventListener('mousedown', stop);
      if (!autres) {
        ctrlBtn(ctrl, '\u2191', '#efe6cf', function () { var p = sous.previousElementSibling; if (p && p.classList.contains('sous') && !p.classList.contains('lv-autres')) corps.insertBefore(sous, p); });
        ctrlBtn(ctrl, '\u2193', '#efe6cf', function () { var n = sous.nextElementSibling; if (n && n.classList.contains('sous') && !n.classList.contains('lv-autres')) corps.insertBefore(n, sous); });
        ctrlBtn(ctrl, '\u2715', '#9a3b3b', function () {
          if (!confirm(FR ? 'Supprimer cette catégorie ? Ses articles passent en « Sans catégorie ».' : 'Delete this category? Its articles move to Uncategorized.')) return;
          wrapAutres(dom); var auto = corpsDe(dom, AUTRES);
          qsa('a.article-lien[data-card]', sous).forEach(function (c) { if (auto) auto.appendChild(c); });
          sous.remove(); redecorer(dom);
        });
      } else { var lab = document.createElement('span'); lab.textContent = FR ? '(déposez ici les articles sans catégorie)' : '(drop uncategorized articles here)'; lab.style.cssText = 'font-family:sans-serif;font-size:11px;color:#777;margin-left:auto'; ctrl.appendChild(lab); }
      tete.appendChild(ctrl);
    });
    // bouton nouvelle catégorie
    var add = document.createElement('div'); add.className = 'lv-add-cat';
    add.style.cssText = 'margin:10px 0;background:#000;color:#cfc9bb;border:1px dashed #555;padding:9px 14px;font-family:sans-serif;font-size:13px;cursor:pointer;display:inline-block';
    add.textContent = FR ? '+ Nouvelle catégorie' : '+ New category';
    add.addEventListener('click', function () {
      var nom = prompt(FR ? 'Nom de la catégorie :' : 'Category name:', ''); if (nom === null) return;
      var base = slug(nom) || 'cat', id = base, k = 2, ex = {}; qsa('.sous[data-cat]', corps).forEach(function (s) { ex[s.getAttribute('data-cat')] = 1; }); while (ex[id]) id = base + '-' + (k++);
      var s = creerSous(id, nom); s.classList.add('ouvert');
      var autres = corps.querySelector('.lv-autres'); if (autres) corps.insertBefore(s, autres); else corps.appendChild(s);
      redecorer(dom);
    });
    var autresBox = corps.querySelector('.lv-autres'); if (autresBox) corps.insertBefore(add, autresBox); else corps.appendChild(add);
    // cartes
    var liste = catsList(dom);
    qsa('a.article-lien[data-card]', corps).forEach(function (card) {
      if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
      var box = document.createElement('span'); box.className = 'lv-card-ctrl'; box.style.cssText = 'position:absolute;top:6px;right:6px;display:flex;gap:4px;z-index:5;align-items:center';
      box.addEventListener('click', stop); box.addEventListener('mousedown', stop);
      ctrlBtn(box, '\u2191', '#efe6cf', function () { var p = card.previousElementSibling; if (p && p.classList.contains('article-lien')) card.parentNode.insertBefore(card, p); });
      ctrlBtn(box, '\u2193', '#efe6cf', function () { var n = card.nextElementSibling; if (n && n.classList.contains('article-lien')) card.parentNode.insertBefore(n, card); });
      var sel = document.createElement('select'); sel.style.cssText = 'background:#000;color:#efe6cf;border:1px solid #555;font-family:sans-serif;font-size:12px;max-width:150px;cursor:pointer';
      var cur = card.closest('.sous'); var curId = cur ? cur.getAttribute('data-cat') : AUTRES;
      liste.forEach(function (c) { var o = document.createElement('option'); o.value = c.id; o.textContent = (FR ? 'Déplacer → ' : 'Move → ') + c.nom; if (c.id === curId) o.selected = true; sel.appendChild(o); });
      sel.addEventListener('mousedown', stop); sel.addEventListener('click', stop);
      sel.addEventListener('change', function () { var dest = corpsDe(dom, sel.value); if (dest) dest.appendChild(card); });
      box.appendChild(sel); card.appendChild(box);
    });
  }

  function nettoyer(dom) {
    qsa('.lv-cat-ctrl,.lv-card-ctrl,.lv-add-cat', dom).forEach(function (n) { n.remove(); });
    qsa('.sous-nom', dom).forEach(function (sn) { sn.contentEditable = 'false'; sn.style.outline = ''; sn.style.outlineOffset = ''; sn.removeEventListener('mousedown', stop); sn.removeEventListener('click', stop); });
  }
  function redecorer(dom) { nettoyer(dom); decorer(dom); }

  function entrer() {
    domsLib.forEach(function (dom) {
      var h = dom.querySelector('.dom-nom'); if (h) { h.contentEditable = 'true'; h.style.outline = '1px dashed rgba(239,230,207,.6)'; h.style.outlineOffset = '3px'; h.addEventListener('mousedown', stop); h.addEventListener('click', stop); }
      wrapAutres(dom); decorer(dom);
    });
    domsAcc.forEach(function (a) { ['h3', 'p'].forEach(function (t) { var e = a.querySelector(t); if (e) { e.contentEditable = 'true'; e.style.outline = '1px dashed rgba(239,230,207,.6)'; e.style.outlineOffset = '3px'; e.addEventListener('click', function (ev) { ev.preventDefault(); ev.stopPropagation(); }); } }); });
  }
  function quitter() {
    domsLib.forEach(function (dom) {
      var h = dom.querySelector('.dom-nom'); if (h) { h.contentEditable = 'false'; h.style.outline = ''; h.removeEventListener('mousedown', stop); h.removeEventListener('click', stop); }
      nettoyer(dom); unwrapAutres(dom);
    });
    domsAcc.forEach(function (a) { ['h3', 'p'].forEach(function (t) { var e = a.querySelector(t); if (e) { e.contentEditable = 'false'; e.style.outline = ''; } }); });
  }

  function serialiser() {
    var d = { noms: {}, struct: {} };
    domsLib.forEach(function (dom) {
      var th = dom.getAttribute('data-theme'); var corps = dom.querySelector('.dom-corps');
      var h = dom.querySelector('.dom-nom'); if (h) { d.noms[th] = d.noms[th] || {}; d.noms[th]['nom_' + lang] = h.textContent.trim(); }
      var st = { order: [], names: {}, arts: {} };
      qsa('.sous[data-cat]', corps).forEach(function (sous) {
        var cid = sous.getAttribute('data-cat');
        var slugs = qsa('a.article-lien[data-card]', sous).map(function (c) { return c.getAttribute('data-card'); });
        if (sous.classList.contains('lv-autres')) { st.arts[AUTRES] = slugs; return; }
        st.order.push(cid);
        st.names[cid] = { ['nom_' + lang]: (sous.querySelector('.sous-nom') || {}).textContent.trim() };
        st.arts[cid] = slugs;
      });
      d.struct[th] = st;
    });
    domsAcc.forEach(function (a) {
      var th = a.getAttribute('data-theme'); d.noms[th] = d.noms[th] || {};
      var h = a.querySelector('h3'); if (h) d.noms[th]['nom_' + lang] = h.textContent.trim();
      var p = a.querySelector('p'); if (p) d.noms[th]['desc_' + lang] = p.textContent.trim();
    });
    return d;
  }

  function construire() {
    built = true;
    var btn = document.createElement('div'); btn.id = 'lv-th-btn';
    btn.style.cssText = 'position:fixed;right:18px;bottom:110px;z-index:99999;background:#111;color:#efe6cf;border:1px solid #555;padding:10px 16px;font-family:sans-serif;font-size:13px;letter-spacing:.08em;cursor:pointer;display:flex;align-items:center;gap:8px;text-transform:uppercase';
    btn.textContent = FR ? 'Éditer les thèmes' : 'Edit themes'; document.body.appendChild(btn);
    var bar = document.createElement('div'); bar.style.cssText = 'position:fixed;right:18px;bottom:152px;z-index:99999;display:none;gap:8px;flex-direction:column;width:240px';
    var stat = document.createElement('div'); stat.style.cssText = 'font-family:sans-serif;font-size:12px;color:#cfc9bb;background:#0c0c0c;border:1px solid #555;padding:8px 10px;line-height:1.4'; stat.textContent = FR ? 'Noms : clique pour écrire. ↑↓ réordonnent. La liste déroulante déplace un article.' : 'Names: click to type. ↑↓ reorder. The dropdown moves an article.';
    var save = document.createElement('span'); save.style.cssText = 'text-align:center;background:#efe6cf;color:#000;padding:11px;font-family:sans-serif;font-size:13px;letter-spacing:.06em;cursor:pointer;text-transform:uppercase'; save.textContent = FR ? 'Enregistrer' : 'Save';
    bar.appendChild(stat); bar.appendChild(save); document.body.appendChild(bar);

    btn.addEventListener('click', function () {
      edit = !edit;
      btn.textContent = edit ? (FR ? 'Quitter l\'édition' : 'Exit editing') : (FR ? 'Éditer les thèmes' : 'Edit themes');
      bar.style.display = edit ? 'flex' : 'none';
      if (edit) entrer(); else quitter();
    });
    save.addEventListener('click', function () {
      var d = serialiser(); stat.textContent = FR ? 'Enregistrement…' : 'Saving…';
      DOC.set(d, { merge: true }).then(function () { stat.textContent = FR ? 'Enregistré. Visible par tous.' : 'Saved. Visible to everyone.'; })
        .catch(function (e) { stat.textContent = (FR ? 'Erreur : ' : 'Error: ') + e.message; });
    });
  }
})();

(function () {
  if (typeof firebase === 'undefined') return;
  if (typeof firebase.firestore !== 'function') return;
  var db = firebase.firestore(), auth = firebase.auth();
  var ADMIN = 'hoarauemmanuel336@gmail.com';
  var DOC = db.doc('config/memoriser');
  var FR = (localStorage.getItem('lm_lang') || 'fr') !== 'en';
  function P() { return (typeof PRE !== 'undefined') ? PRE : null; }

  function slug(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
  function ensureIds(cats) {
    var cs = {};
    cats.forEach(function (c) {
      if (!c.id) { var b = slug(c.name && c.name.fr) || 'cat', id = b, k = 2; while (cs[id]) id = b + '-' + (k++); c.id = id; }
      cs[c.id] = 1; var vs = {};
      (c.verses || []).forEach(function (v) {
        if (!v.id) { var b = slug(v.fr && v.fr.ref) || 'v', id = b, k = 2; while (vs[id]) id = b + '-' + (k++); v.id = id; }
        vs[v.id] = 1;
      });
    });
  }
  function nettoie(cats) {
    return cats.map(function (c) {
      return { id: c.id, name: { fr: (c.name || {}).fr || '', en: (c.name || {}).en || '' },
        verses: (c.verses || []).map(function (v) { return { id: v.id, fr: { text: (v.fr || {}).text || '', ref: (v.fr || {}).ref || '' }, en: { text: (v.en || {}).text || '', ref: (v.en || {}).ref || '' } }; }) };
    });
  }

  var built = false, W = null;
  auth.onAuthStateChanged(function (u) {
    var isAdmin = u && ((u.email || '').toLowerCase() === ADMIN);
    var btn = document.getElementById('lv-mem-btn');
    if (!isAdmin) { if (btn) btn.style.display = 'none'; return; }
    if (built) { if (btn) btn.style.display = 'flex'; return; }
    construire();
  });

  function css(e, s) { e.style.cssText = s; }
  function mk(tag, parent, s) { var e = document.createElement(tag); if (s) css(e, s); if (parent) parent.appendChild(e); return e; }
  function inp(parent, val, ph, w) { var i = mk('input', parent, 'background:#000;color:#fff;border:1px solid #333;padding:7px;font-family:sans-serif;font-size:13px;' + (w || 'flex:1;min-width:120px')); i.type = 'text'; i.value = val || ''; i.placeholder = ph || ''; return i; }
  function btnEl(parent, txt, col) { var b = mk('span', parent, 'background:#000;color:' + (col || '#efe6cf') + ';border:1px solid #555;min-width:26px;height:26px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;font-family:sans-serif;font-size:13px;padding:0 5px'); b.textContent = txt; return b; }

  function construire() {
    built = true;
    var btn = mk('div', document.body, 'position:fixed;right:18px;bottom:64px;z-index:99999;background:#111;color:#efe6cf;border:1px solid #555;padding:10px 16px;font-family:sans-serif;font-size:13px;letter-spacing:.08em;cursor:pointer;display:flex;align-items:center;gap:8px;text-transform:uppercase');
    btn.id = 'lv-mem-btn'; btn.textContent = FR ? 'Éditer les versets de base' : 'Edit base verses';

    var ov = mk('div', document.body, 'position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.82);display:none;padding:20px;overflow:auto'); ov.id = 'lv-mem-ov';
    var panel = mk('div', ov, 'max-width:880px;margin:0 auto;background:#0c0c0c;border:1px solid #555;padding:20px');
    mk('div', panel, 'font-family:sans-serif;font-size:14px;letter-spacing:.1em;color:#fff;text-transform:uppercase;margin:0 0 4px').textContent = FR ? 'Versets de base (partagés)' : 'Base verses (shared)';
    mk('div', panel, 'font-family:sans-serif;font-size:12px;color:#9a9a9a;margin:0 0 14px').textContent = FR ? 'Base commune à tous les comptes. ↑↓ réordonnent ; « Déplacer → » change un verset de catégorie. Ne touche pas aux identifiants existants.' : 'Shared base for all accounts. ↑↓ reorder; "Move →" changes a verse\u2019s category. Do not change existing identifiers.';
    var host = mk('div', panel, '');
    var addCat = mk('span', panel, 'display:inline-block;margin:12px 0;background:#000;color:#cfc9bb;border:1px dashed #555;padding:9px 14px;font-family:sans-serif;font-size:13px;cursor:pointer'); addCat.textContent = FR ? '+ Ajouter une catégorie' : '+ Add a category';
    var stat = mk('div', panel, 'font-family:sans-serif;font-size:12px;color:#9a9a9a;min-height:16px;margin:8px 0');
    var row = mk('div', panel, 'display:flex;gap:8px;position:sticky;bottom:0;background:#0c0c0c;padding-top:10px');
    var save = mk('span', row, 'flex:1;text-align:center;background:#efe6cf;color:#000;padding:12px;font-family:sans-serif;font-size:13px;letter-spacing:.06em;cursor:pointer;text-transform:uppercase'); save.textContent = FR ? 'Enregistrer' : 'Save';
    var ferme = mk('span', row, 'text-align:center;background:#000;color:#cfc9bb;border:1px solid #444;padding:12px 16px;font-family:sans-serif;font-size:13px;cursor:pointer'); ferme.textContent = FR ? 'Fermer' : 'Close';

    function swap(arr, i, j) { var t = arr[i]; arr[i] = arr[j]; arr[j] = t; }

    function rendre() {
      host.innerHTML = '';
      W.forEach(function (c) {
        c.name = c.name || { fr: '', en: '' }; c.verses = c.verses || [];
        var block = mk('div', host, 'border:1px solid #2a2a2a;margin:0 0 10px');
        var head = mk('div', block, 'display:flex;gap:6px;align-items:center;padding:10px;background:#111;flex-wrap:wrap');
        var tog = mk('span', head, 'cursor:pointer;color:#efe6cf;font-family:monospace;width:18px'); tog.textContent = c.__open ? '▾' : '▸';
        var up = btnEl(head, '↑'); var dn = btnEl(head, '↓');
        var nf = inp(head, c.name.fr, 'Nom FR', 'flex:1;min-width:120px'); var ne = inp(head, c.name.en, 'Name EN', 'flex:1;min-width:120px');
        var cnt = mk('span', head, 'font-family:sans-serif;font-size:12px;color:#777;white-space:nowrap'); cnt.textContent = c.verses.length + (FR ? ' versets' : ' verses');
        var delC = btnEl(head, FR ? 'Suppr.' : 'Del', '#9a3b3b'); css(delC, delC.style.cssText + ';min-width:auto;padding:0 9px;font-size:12px');
        nf.oninput = function () { c.name.fr = nf.value; }; ne.oninput = function () { c.name.en = ne.value; };
        up.onclick = function () { var i = W.indexOf(c); if (i > 0) { swap(W, i, i - 1); rendre(); } };
        dn.onclick = function () { var i = W.indexOf(c); if (i < W.length - 1) { swap(W, i, i + 1); rendre(); } };
        delC.onclick = function () { if (confirm(FR ? 'Supprimer cette catégorie et ses versets ?' : 'Delete this category and its verses?')) { var i = W.indexOf(c); if (i >= 0) { W.splice(i, 1); rendre(); } } };
        var body = mk('div', block, 'padding:10px;' + (c.__open ? '' : 'display:none'));
        function fillBody() {
          body.innerHTML = '';
          c.verses.forEach(function (v) {
            v.fr = v.fr || { text: '', ref: '' }; v.en = v.en || { text: '', ref: '' };
            var r = mk('div', body, 'border-left:2px solid #333;padding:8px 0 8px 10px;margin:8px 0');
            var bar = mk('div', r, 'display:flex;gap:6px;align-items:center;margin-bottom:5px;flex-wrap:wrap');
            var vu = btnEl(bar, '↑'); var vd = btnEl(bar, '↓');
            var mv = mk('select', bar, 'background:#000;color:#efe6cf;border:1px solid #555;font-family:sans-serif;font-size:12px;cursor:pointer;max-width:200px');
            var o0 = mk('option', mv, ''); o0.value = ''; o0.textContent = FR ? 'Déplacer →' : 'Move →';
            W.forEach(function (tc) { if (tc !== c) { var o = mk('option', mv, ''); o.value = W.indexOf(tc); o.textContent = (tc.name.fr || tc.name.en || '(?)'); } });
            var del = btnEl(bar, '✕', '#9a3b3b'); css(del, del.style.cssText + ';margin-left:auto');
            var l1 = mk('div', r, 'display:flex;gap:6px;margin-bottom:5px;flex-wrap:wrap');
            var rf = inp(l1, v.fr.ref, 'Réf. FR', 'width:150px'); var tf = inp(l1, v.fr.text, 'Texte FR');
            var l2 = mk('div', r, 'display:flex;gap:6px;flex-wrap:wrap');
            var re = inp(l2, v.en.ref, 'Ref EN', 'width:150px'); var te = inp(l2, v.en.text, 'Text EN');
            rf.oninput = function () { v.fr.ref = rf.value; }; tf.oninput = function () { v.fr.text = tf.value; };
            re.oninput = function () { v.en.ref = re.value; }; te.oninput = function () { v.en.text = te.value; };
            vu.onclick = function () { var i = c.verses.indexOf(v); if (i > 0) { swap(c.verses, i, i - 1); fillBody(); } };
            vd.onclick = function () { var i = c.verses.indexOf(v); if (i < c.verses.length - 1) { swap(c.verses, i, i + 1); fillBody(); } };
            del.onclick = function () { var i = c.verses.indexOf(v); if (i >= 0) { c.verses.splice(i, 1); fillBody(); cnt.textContent = c.verses.length + (FR ? ' versets' : ' verses'); } };
            mv.onchange = function () { if (mv.value === '') return; var tc = W[+mv.value]; if (!tc) return; var i = c.verses.indexOf(v); if (i >= 0) c.verses.splice(i, 1); tc.verses = tc.verses || []; tc.verses.push(v); c.__open = true; tc.__open = true; rendre(); };
          });
          var addV = mk('span', body, 'display:inline-block;margin-top:8px;background:#000;color:#cfc9bb;border:1px solid #444;padding:8px 12px;cursor:pointer;font-family:sans-serif;font-size:13px'); addV.textContent = FR ? '+ Ajouter un verset' : '+ Add a verse';
          addV.onclick = function () { c.verses.push({ id: '', fr: { text: '', ref: '' }, en: { text: '', ref: '' } }); fillBody(); cnt.textContent = c.verses.length + (FR ? ' versets' : ' verses'); };
        }
        if (c.__open) fillBody();
        tog.onclick = function () { c.__open = !c.__open; tog.textContent = c.__open ? '▾' : '▸'; body.style.display = c.__open ? 'block' : 'none'; if (c.__open && !body.children.length) fillBody(); };
      });
    }

    btn.addEventListener('click', function () { W = JSON.parse(JSON.stringify(P() || [])); rendre(); stat.textContent = ''; ov.style.display = 'block'; });
    ferme.addEventListener('click', function () { ov.style.display = 'none'; });
    addCat.addEventListener('click', function () { W.push({ id: '', name: { fr: '', en: '' }, verses: [], __open: true }); rendre(); });
    save.addEventListener('click', function () {
      ensureIds(W); var clean = nettoie(W);
      stat.textContent = FR ? 'Enregistrement…' : 'Saving…';
      DOC.set({ categories: clean }).then(function () {
        var p = P(); if (p) { p.length = 0; clean.forEach(function (c) { p.push(JSON.parse(JSON.stringify(c))); }); }
        if (typeof renderCats === 'function') { try { renderCats(); } catch (e) {} }
        stat.textContent = FR ? 'Enregistré. Base commune mise à jour.' : 'Saved. Shared base updated.';
      }).catch(function (e) { stat.textContent = (FR ? 'Erreur : ' : 'Error: ') + e.message; });
    });
  }
})();

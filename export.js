(function () {
  if (typeof firebase === 'undefined') return;
  var cfg = { apiKey: "AIzaSyC19lFNWUd-KYhCP4o7gpp0IcyfRTyHOyA", authDomain: "lumen-veritatis.firebaseapp.com", projectId: "lumen-veritatis", storageBucket: "lumen-veritatis.firebasestorage.app", messagingSenderId: "195902823875", appId: "1:195902823875:web:a8be1f216a5ae1d945f176" };
  if (!firebase.apps.length) firebase.initializeApp(cfg);
  if (typeof firebase.firestore !== 'function') return;
  var db = firebase.firestore(), auth = firebase.auth();
  var ADMIN = 'hoarauemmanuel336@gmail.com';
  var FR = ((window.LUMEN && window.LUMEN.lang) || (localStorage.getItem('lm_lang')) || 'fr') !== 'en';

  var built = false;
  auth.onAuthStateChanged(function (u) {
    var isAdmin = u && ((u.email || '').toLowerCase() === ADMIN);
    var btn = document.getElementById('lv-exp-btn');
    if (!isAdmin) { if (btn) btn.style.display = 'none'; return; }
    if (built) { if (btn) btn.style.display = 'flex'; return; }
    construire();
  });

  function css(e, s) { e.style.cssText = s; }
  function mk(t, p, s) { var e = document.createElement(t); if (s) css(e, s); if (p) p.appendChild(e); return e; }

  function rassembler() {
    return Promise.all([
      db.doc('config/apparence').get().catch(function () { return null; }),
      db.doc('config/themes').get().catch(function () { return null; }),
      db.doc('config/accueil').get().catch(function () { return null; }),
      db.doc('config/memoriser').get().catch(function () { return null; }),
      db.collection('contenu').get().catch(function () { return null; })
    ]).then(function (r) {
      var out = { exporte_le: new Date().toISOString(), apparence: null, themes: null, accueil: null, memoriser: null, contenu: {} };
      if (r[0] && r[0].exists) out.apparence = r[0].data();
      if (r[1] && r[1].exists) out.themes = r[1].data();
      if (r[2] && r[2].exists) out.accueil = r[2].data();
      if (r[3] && r[3].exists) out.memoriser = r[3].data();
      if (r[4]) r[4].forEach(function (d) { out.contenu[d.id] = d.data(); });
      return out;
    });
  }

  function construire() {
    built = true;
    var btn = mk('div', document.body, 'position:fixed;right:18px;bottom:156px;z-index:99999;background:#111;color:#efe6cf;border:1px solid #555;padding:10px 16px;font-family:sans-serif;font-size:13px;letter-spacing:.08em;cursor:pointer;display:flex;align-items:center;gap:8px;text-transform:uppercase');
    btn.id = 'lv-exp-btn'; btn.textContent = FR ? 'Exporter mes modifications' : 'Export my changes';

    var ov = mk('div', document.body, 'position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.82);display:none;padding:24px;overflow:auto');
    var p = mk('div', ov, 'max-width:820px;margin:0 auto;background:#0c0c0c;border:1px solid #555;padding:22px');
    mk('div', p, 'font-family:sans-serif;font-size:14px;letter-spacing:.1em;color:#fff;text-transform:uppercase;margin:0 0 4px').textContent = FR ? 'Mes modifications en ligne' : 'My online changes';
    mk('div', p, 'font-family:sans-serif;font-size:12px;color:#9a9a9a;margin:0 0 12px;line-height:1.5').textContent = FR ? 'Tout ce que tu as modifié en direct (apparence, thèmes, textes d\u2019accueil, base Mémoriser, articles). Copie ou télécharge ce contenu et donne-le-moi : je le reporte dans les fichiers et je traduis.' : 'Everything you changed live. Copy or download it and hand it over for reconciliation and translation.';
    var ta = mk('textarea', p, 'width:100%;box-sizing:border-box;background:#000;color:#cfc9bb;border:1px solid #333;padding:10px;font-family:monospace;font-size:12px;min-height:300px;line-height:1.45'); ta.readOnly = true;
    var stat = mk('div', p, 'font-family:sans-serif;font-size:12px;color:#9a9a9a;min-height:16px;margin:10px 0');
    var row = mk('div', p, 'display:flex;gap:8px;flex-wrap:wrap');
    var copier = mk('span', row, 'flex:1;min-width:140px;text-align:center;background:#efe6cf;color:#000;padding:12px;font-family:sans-serif;font-size:13px;letter-spacing:.06em;cursor:pointer;text-transform:uppercase'); copier.textContent = FR ? 'Copier' : 'Copy';
    var tele = mk('span', row, 'text-align:center;background:#000;color:#cfc9bb;border:1px solid #444;padding:12px 16px;font-family:sans-serif;font-size:13px;cursor:pointer'); tele.textContent = FR ? 'Télécharger' : 'Download';
    var ferme = mk('span', row, 'text-align:center;background:#000;color:#cfc9bb;border:1px solid #444;padding:12px 16px;font-family:sans-serif;font-size:13px;cursor:pointer'); ferme.textContent = FR ? 'Fermer' : 'Close';
    var effacer = mk('span', row, 'text-align:center;background:#000;color:#9a3b3b;border:1px solid #5a2b2b;padding:12px 16px;font-family:sans-serif;font-size:13px;cursor:pointer'); effacer.textContent = FR ? 'Effacer en ligne…' : 'Clear online…';

    btn.addEventListener('click', function () {
      ov.style.display = 'block'; ta.value = FR ? 'Lecture…' : 'Reading…'; stat.textContent = '';
      rassembler().then(function (o) { ta.value = JSON.stringify(o, null, 2); }).catch(function (e) { ta.value = (FR ? 'Erreur : ' : 'Error: ') + e.message; });
    });
    ferme.addEventListener('click', function () { ov.style.display = 'none'; });
    ov.addEventListener('click', function (e) { if (e.target === ov) ov.style.display = 'none'; });
    copier.addEventListener('click', function () {
      ta.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
      if (navigator.clipboard) { navigator.clipboard.writeText(ta.value).then(function () { stat.textContent = FR ? 'Copié.' : 'Copied.'; }).catch(function () { stat.textContent = ok ? (FR ? 'Copié.' : 'Copied.') : (FR ? 'Sélectionne et copie manuellement.' : 'Select and copy manually.'); }); }
      else stat.textContent = ok ? (FR ? 'Copié.' : 'Copied.') : (FR ? 'Sélectionne et copie manuellement.' : 'Select and copy manually.');
    });
    tele.addEventListener('click', function () {
      var blob = new Blob([ta.value], { type: 'application/json' }); var a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'lumen-modifications-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      stat.textContent = FR ? 'Téléchargé.' : 'Downloaded.';
    });
    effacer.addEventListener('click', function () {
      if (!confirm(FR ? 'Effacer TOUTES tes modifications en ligne ? À ne faire qu\u2019APRÈS les avoir intégrées dans les fichiers et redéployées. Le site reviendra alors aux fichiers.' : 'Clear ALL your online changes? Only after they are merged into the files and redeployed.')) return;
      stat.textContent = FR ? 'Effacement…' : 'Clearing…';
      rassembler().then(function (o) {
        var batch = db.batch();
        ['apparence', 'themes', 'accueil', 'memoriser'].forEach(function (k) { if (o[k]) batch.delete(db.doc('config/' + k)); });
        Object.keys(o.contenu || {}).forEach(function (slug) { batch.delete(db.collection('contenu').doc(slug)); });
        return batch.commit();
      }).then(function () { stat.textContent = FR ? 'Tout effacé en ligne. Recharge la page.' : 'All cleared online. Reload the page.'; })
        .catch(function (e) { stat.textContent = (FR ? 'Erreur : ' : 'Error: ') + e.message; });
    });
  }
})();

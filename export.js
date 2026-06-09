(function () {
  if (typeof firebase === 'undefined') return;
  var cfg = { apiKey: "AIzaSyC19lFNWUd-KYhCP4o7gpp0IcyfRTyHOyA", authDomain: "lumen-veritatis.firebaseapp.com", projectId: "lumen-veritatis", storageBucket: "lumen-veritatis.firebasestorage.app", messagingSenderId: "195902823875", appId: "1:195902823875:web:a8be1f216a5ae1d945f176" };
  if (!firebase.apps.length) firebase.initializeApp(cfg);
  if (typeof firebase.firestore !== 'function') return;
  var db = firebase.firestore(), auth = firebase.auth();
  var ADMIN = 'hoarauemmanuel336@gmail.com';
  var FR = ((window.LUMEN && window.LUMEN.lang) || localStorage.getItem('lm_lang') || 'fr') !== 'en';

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
      var o = { apparence: (r[0] && r[0].exists) ? r[0].data() : null, themes: (r[1] && r[1].exists) ? r[1].data() : null, accueil: (r[2] && r[2].exists) ? r[2].data() : null, memoriser: (r[3] && r[3].exists) ? r[3].data() : null, contenu: {} };
      if (r[4]) r[4].forEach(function (d) { o.contenu[d.id] = d.data(); });
      return o;
    });
  }

  function construire() {
    built = true;
    var btn = mk('div', document.body, 'position:fixed;right:18px;bottom:156px;z-index:99999;background:#111;color:#efe6cf;border:1px solid #555;padding:10px 16px;font-family:sans-serif;font-size:13px;letter-spacing:.08em;cursor:pointer;display:flex;align-items:center;gap:8px;text-transform:uppercase');
    btn.id = 'lv-exp-btn'; btn.textContent = FR ? 'Exporter mes modifications' : 'Export my changes';
    var ov = mk('div', document.body, 'position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.82);display:none;padding:24px;overflow:auto'); ov.id = 'lv-exp-ov';
    var p = mk('div', ov, 'max-width:820px;margin:0 auto;background:#0c0c0c;border:1px solid #555;padding:22px');
    mk('div', p, 'font-family:sans-serif;font-size:14px;letter-spacing:.1em;color:#fff;text-transform:uppercase;margin:0 0 4px').textContent = FR ? 'Mes modifications en ligne' : 'My online changes';
    mk('div', p, 'font-family:sans-serif;font-size:12px;color:#9a9a9a;margin:0 0 12px;line-height:1.5').textContent = FR ? 'Choisis ce que tu veux exporter : tout, ou une partie. Copie ou télécharge, puis donne-le-moi pour que je le reporte et le traduise.' : 'Choose what to export: all, or one part. Copy or download it for reconciliation and translation.';

    var data = null, scope = 'tout';
    var SCOPES = [['tout', FR ? 'Tout' : 'All'], ['apparence', FR ? 'Apparence' : 'Appearance'], ['themes', FR ? 'Thèmes' : 'Themes'], ['accueil', FR ? 'Accueil' : 'Home'], ['memoriser', 'Mémoriser'], ['contenu', FR ? 'Articles' : 'Articles']];
    var chips = mk('div', p, 'display:flex;flex-wrap:wrap;gap:6px;margin:0 0 12px');
    var chipEls = {};
    function sousData(sc) {
      if (!data) return {};
      if (sc === 'tout') return data;
      if (sc === 'contenu') return { contenu: data.contenu };
      var o = {}; o[sc] = data[sc]; return o;
    }
    function maj() {
      Object.keys(chipEls).forEach(function (k) { chipEls[k].style.background = (k === scope) ? '#efe6cf' : '#000'; chipEls[k].style.color = (k === scope) ? '#000' : '#cfc9bb'; });
      ta.value = data ? JSON.stringify(sousData(scope), null, 2) : (FR ? 'Lecture…' : 'Reading…');
    }
    SCOPES.forEach(function (s) {
      var c = mk('span', chips, 'background:#000;color:#cfc9bb;border:1px solid #444;padding:7px 12px;font-family:sans-serif;font-size:12px;letter-spacing:.04em;cursor:pointer'); c.textContent = s[1];
      c.addEventListener('click', function () { scope = s[0]; maj(); });
      chipEls[s[0]] = c;
    });
    var ta = mk('textarea', p, 'width:100%;box-sizing:border-box;background:#000;color:#cfc9bb;border:1px solid #333;padding:10px;font-family:monospace;font-size:12px;min-height:280px;line-height:1.45'); ta.readOnly = true;
    var stat = mk('div', p, 'font-family:sans-serif;font-size:12px;color:#9a9a9a;min-height:16px;margin:10px 0');
    var row = mk('div', p, 'display:flex;gap:8px;flex-wrap:wrap');
    var copier = mk('span', row, 'flex:1;min-width:130px;text-align:center;background:#efe6cf;color:#000;padding:12px;font-family:sans-serif;font-size:13px;letter-spacing:.06em;cursor:pointer;text-transform:uppercase'); copier.textContent = FR ? 'Copier' : 'Copy';
    var tele = mk('span', row, 'text-align:center;background:#000;color:#cfc9bb;border:1px solid #444;padding:12px 16px;font-family:sans-serif;font-size:13px;cursor:pointer'); tele.textContent = FR ? 'Télécharger' : 'Download';
    var ferme = mk('span', row, 'text-align:center;background:#000;color:#cfc9bb;border:1px solid #444;padding:12px 16px;font-family:sans-serif;font-size:13px;cursor:pointer'); ferme.textContent = FR ? 'Fermer' : 'Close';
    var effacer = mk('span', row, 'text-align:center;background:#000;color:#9a3b3b;border:1px solid #5a2b2b;padding:12px 16px;font-family:sans-serif;font-size:13px;cursor:pointer'); effacer.textContent = FR ? 'Effacer en ligne…' : 'Clear online…';

    btn.addEventListener('click', function () { ov.style.display = 'block'; stat.textContent = ''; data = null; scope = 'tout'; maj(); rassembler().then(function (o) { data = o; maj(); }).catch(function (e) { ta.value = (FR ? 'Erreur : ' : 'Error: ') + e.message; }); });
    ferme.addEventListener('click', function () { ov.style.display = 'none'; });
    ov.addEventListener('click', function (e) { if (e.target === ov) ov.style.display = 'none'; });
    copier.addEventListener('click', function () {
      ta.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
      if (navigator.clipboard) navigator.clipboard.writeText(ta.value).then(function () { stat.textContent = FR ? 'Copié.' : 'Copied.'; }).catch(function () { stat.textContent = ok ? (FR ? 'Copié.' : 'Copied.') : (FR ? 'Sélectionne et copie à la main.' : 'Select and copy manually.'); });
      else stat.textContent = ok ? (FR ? 'Copié.' : 'Copied.') : (FR ? 'Sélectionne et copie à la main.' : 'Select and copy manually.');
    });
    tele.addEventListener('click', function () {
      var blob = new Blob([ta.value], { type: 'application/json' }); var a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'lumen-' + scope + '-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000); stat.textContent = FR ? 'Téléchargé.' : 'Downloaded.';
    });
    effacer.addEventListener('click', function () {
      if (!confirm(FR ? 'Effacer TOUTES tes modifications en ligne ? À ne faire qu\u2019APRÈS intégration dans les fichiers et redéploiement.' : 'Clear ALL your online changes? Only after merge into files and redeploy.')) return;
      stat.textContent = FR ? 'Effacement…' : 'Clearing…';
      rassembler().then(function (o) { var b = db.batch(); ['apparence', 'themes', 'accueil', 'memoriser'].forEach(function (k) { if (o[k]) b.delete(db.doc('config/' + k)); }); Object.keys(o.contenu || {}).forEach(function (sl) { b.delete(db.collection('contenu').doc(sl)); }); return b.commit(); })
        .then(function () { stat.textContent = FR ? 'Tout effacé. Recharge la page.' : 'All cleared. Reload the page.'; }).catch(function (e) { stat.textContent = (FR ? 'Erreur : ' : 'Error: ') + e.message; });
    });
  }
})();

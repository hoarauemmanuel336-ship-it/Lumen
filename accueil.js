(function () {
  if (typeof firebase === 'undefined') return;
  var cfg = { apiKey: "AIzaSyC19lFNWUd-KYhCP4o7gpp0IcyfRTyHOyA", authDomain: "lumen-veritatis.firebaseapp.com", projectId: "lumen-veritatis", storageBucket: "lumen-veritatis.firebasestorage.app", messagingSenderId: "195902823875", appId: "1:195902823875:web:a8be1f216a5ae1d945f176" };
  if (!firebase.apps.length) firebase.initializeApp(cfg);
  if (typeof firebase.firestore !== 'function') return;
  var db = firebase.firestore(), auth = firebase.auth();
  var ADMIN = 'hoarauemmanuel336@gmail.com';
  var lang = (window.LUMEN && window.LUMEN.lang) || 'fr';
  var FR = lang !== 'en';
  var DOC = db.doc('config/accueil');
  var els = document.querySelectorAll('[data-lv-txt]');
  if (!els.length) return;
  var K = 't_' + lang;

  // Appliquer (tous les visiteurs)
  DOC.get().then(function (s) {
    if (!s.exists) return; var d = s.data();
    Array.prototype.forEach.call(els, function (el) {
      var o = d[el.getAttribute('data-lv-txt')];
      if (o && typeof o[K] === 'string' && o[K]) el.textContent = o[K];
    });
  }).catch(function () {});

  // Mode édition admin
  var built = false, edit = false;
  auth.onAuthStateChanged(function (u) {
    var isAdmin = u && ((u.email || '').toLowerCase() === ADMIN);
    var btn = document.getElementById('lv-acc-btn');
    if (!isAdmin) { if (btn) btn.style.display = 'none'; return; }
    if (built) { if (btn) btn.style.display = 'flex'; return; }
    construire();
  });

  function noNav(e) { if (edit) { e.preventDefault(); e.stopPropagation(); } }

  function construire() {
    built = true;
    var btn = document.createElement('div'); btn.id = 'lv-acc-btn';
    btn.style.cssText = 'position:fixed;right:18px;bottom:64px;z-index:99999;background:#111;color:#efe6cf;border:1px solid #555;padding:10px 16px;font-family:sans-serif;font-size:13px;letter-spacing:.08em;cursor:pointer;display:flex;align-items:center;gap:8px;text-transform:uppercase';
    btn.textContent = FR ? 'Éditer les textes' : 'Edit texts';
    document.body.appendChild(btn);

    var bar = document.createElement('div');
    bar.style.cssText = 'position:fixed;right:18px;bottom:106px;z-index:99999;display:none;gap:8px;flex-direction:column;width:220px';
    var stat = document.createElement('div'); stat.style.cssText = 'font-family:sans-serif;font-size:12px;color:#cfc9bb;background:#0c0c0c;border:1px solid #555;padding:8px 10px'; stat.textContent = FR ? 'Clique un texte pour le changer.' : 'Click a text to change it.';
    var save = document.createElement('span'); save.style.cssText = 'text-align:center;background:#efe6cf;color:#000;padding:11px;font-family:sans-serif;font-size:13px;letter-spacing:.06em;cursor:pointer;text-transform:uppercase'; save.textContent = FR ? 'Enregistrer' : 'Save';
    bar.appendChild(stat); bar.appendChild(save); document.body.appendChild(bar);

    btn.addEventListener('click', function () {
      edit = !edit;
      btn.textContent = edit ? (FR ? 'Quitter l\'édition' : 'Exit editing') : (FR ? 'Éditer les textes' : 'Edit texts');
      bar.style.display = edit ? 'flex' : 'none';
      Array.prototype.forEach.call(els, function (el) {
        el.contentEditable = edit ? 'true' : 'false';
        el.style.outline = edit ? '1px dashed rgba(239,230,207,.6)' : '';
        el.style.outlineOffset = edit ? '3px' : '';
        if (edit) el.addEventListener('click', noNav); else el.removeEventListener('click', noNav);
      });
    });

    save.addEventListener('click', function () {
      var d = {};
      Array.prototype.forEach.call(els, function (el) {
        var k = el.getAttribute('data-lv-txt'); d[k] = {}; d[k][K] = el.textContent.trim();
      });
      stat.textContent = FR ? 'Enregistrement…' : 'Saving…';
      DOC.set(d, { merge: true }).then(function () { stat.textContent = FR ? 'Enregistré. Visible par tous.' : 'Saved. Visible to everyone.'; })
        .catch(function (e) { stat.textContent = (FR ? 'Erreur : ' : 'Error: ') + e.message; });
    });
  }
})();

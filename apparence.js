(function () {
  if (typeof firebase === 'undefined') return;
  var cfg = { apiKey: "AIzaSyC19lFNWUd-KYhCP4o7gpp0IcyfRTyHOyA", authDomain: "lumen-veritatis.firebaseapp.com", projectId: "lumen-veritatis", storageBucket: "lumen-veritatis.firebasestorage.app", messagingSenderId: "195902823875", appId: "1:195902823875:web:a8be1f216a5ae1d945f176" };
  if (!firebase.apps.length) firebase.initializeApp(cfg);
  if (typeof firebase.firestore !== 'function') return;
  var db = firebase.firestore(), auth = firebase.auth();
  var ADMIN = 'hoarauemmanuel336@gmail.com';
  var DOC = db.doc('config/apparence');
  var DEF = { fond: '', texte: '', accent: '', police: '', taille: '', image: '', cssLibre: '' };
  var cur = Object.assign({}, DEF);
  var FR = !(window.LUMEN && window.LUMEN.lang === 'en');

  function styleEl() {
    var s = document.getElementById('lv-apparence');
    if (!s) { s = document.createElement('style'); s.id = 'lv-apparence'; document.head.appendChild(s); }
    return s;
  }
  function appliquer(a) {
    var css = '', root = [];
    if (a.fond) { root.push('--encre:' + a.fond); root.push('--encre-2:' + a.fond); }
    if (a.texte) { root.push('--parchemin:' + a.texte); root.push('--parchemin-att:' + a.texte); }
    if (a.accent) { root.push('--or:' + a.accent); root.push('--or-pale:' + a.accent); }
    if (root.length) css += ':root{' + root.join(';') + '}';
    var b = [];
    if (a.fond) b.push('background-color:' + a.fond);
    if (a.texte) b.push('color:' + a.texte);
    if (a.police) b.push('font-family:' + a.police);
    if (a.taille) b.push('font-size:' + a.taille);
    if (a.image) { b.push('background-image:url("' + String(a.image).replace(/["\\]/g, '') + '")'); b.push('background-size:cover'); b.push('background-position:center'); b.push('background-attachment:fixed'); }
    if (b.length) css += 'body{' + b.join(';') + '}';
    if (a.cssLibre) css += '\n' + a.cssLibre;
    styleEl().textContent = css;
  }

  // 1) Appliquer l'apparence enregistrée, pour tous les visiteurs
  DOC.get().then(function (s) { if (s.exists) { cur = Object.assign({}, DEF, s.data()); appliquer(cur); } }).catch(function () {});

  // 2) Panneau d'édition, réservé au compte administrateur
  var built = false;
  auth.onAuthStateChanged(function (u) {
    var isAdmin = u && ((u.email || '').toLowerCase() === ADMIN);
    var btn = document.getElementById('lv-app-btn');
    if (!isAdmin) { if (btn) btn.style.display = 'none'; var p = document.getElementById('lv-app-panel'); if (p) p.style.display = 'none'; return; }
    if (built) { if (btn) btn.style.display = 'flex'; return; }
    construire();
  });

  function css(el, s) { el.style.cssText = s; }
  function mk(tag, parent, s) { var e = document.createElement(tag); if (s) css(e, s); if (parent) parent.appendChild(e); return e; }

  function ligne(parent, label) {
    var w = mk('div', parent, 'margin:0 0 12px');
    var l = mk('label', w, 'display:block;font-size:12px;letter-spacing:.04em;color:#cfc9bb;margin:0 0 5px;font-family:sans-serif');
    l.textContent = label;
    return w;
  }
  function couleur(parent, label, key, fallback) {
    var w = ligne(parent, label);
    var i = mk('input', w, 'width:100%;height:34px;border:1px solid #333;background:#000;border-radius:0;padding:2px;cursor:pointer');
    i.type = 'color';
    i.value = cur[key] || fallback;
    i.addEventListener('input', function () { cur[key] = i.value; appliquer(cur); });
    return i;
  }
  function texte(parent, label, key, ph, multi) {
    var w = ligne(parent, label);
    var i = mk(multi ? 'textarea' : 'input', w, 'width:100%;box-sizing:border-box;background:#000;color:#fff;border:1px solid #333;padding:8px;font-family:' + (multi ? 'monospace' : 'sans-serif') + ';font-size:13px' + (multi ? ';min-height:90px;resize:vertical' : ''));
    if (!multi) i.type = 'text';
    i.placeholder = ph || '';
    i.value = cur[key] || '';
    i.addEventListener('input', function () { cur[key] = i.value; appliquer(cur); });
    return i;
  }

  function construire() {
    built = true;
    var btn = mk('div', document.body, 'position:fixed;right:18px;bottom:18px;z-index:99999;background:#111;color:#efe6cf;border:1px solid #555;padding:10px 16px;font-family:sans-serif;font-size:13px;letter-spacing:.08em;cursor:pointer;display:flex;align-items:center;gap:8px;text-transform:uppercase');
    btn.id = 'lv-app-btn'; btn.textContent = FR ? 'Apparence' : 'Appearance';

    var p = mk('div', document.body, 'position:fixed;right:18px;bottom:64px;z-index:99999;width:320px;max-width:calc(100vw - 36px);max-height:78vh;overflow:auto;background:#0c0c0c;border:1px solid #555;padding:18px;display:none;box-shadow:0 10px 40px rgba(0,0,0,.6)');
    p.id = 'lv-app-panel';
    var titre = mk('div', p, 'font-family:sans-serif;font-size:14px;letter-spacing:.1em;color:#fff;text-transform:uppercase;margin:0 0 16px');
    titre.textContent = FR ? 'Apparence du site' : 'Site appearance';

    couleur(p, FR ? 'Arrière-plan' : 'Background', 'fond', '#000000');
    couleur(p, FR ? 'Texte' : 'Text', 'texte', '#ffffff');
    couleur(p, FR ? 'Accent' : 'Accent', 'accent', '#efe6cf');
    texte(p, FR ? 'Police (ex. Georgia, serif)' : 'Font (e.g. Georgia, serif)', 'police', "EB Garamond, Georgia, serif");
    texte(p, FR ? 'Taille du texte (ex. 23px)' : 'Text size (e.g. 23px)', 'taille', '23px');
    texte(p, FR ? 'Image d\'arrière-plan (lien)' : 'Background image (URL)', 'image', 'https://...');
    texte(p, FR ? 'CSS avancé (facultatif)' : 'Advanced CSS (optional)', 'cssLibre', '', true);

    var stat = mk('div', p, 'font-family:sans-serif;font-size:12px;color:#9a9a9a;min-height:16px;margin:4px 0 10px');

    var row = mk('div', p, 'display:flex;gap:8px');
    var save = mk('span', row, 'flex:1;text-align:center;background:#efe6cf;color:#000;padding:11px;font-family:sans-serif;font-size:13px;letter-spacing:.06em;cursor:pointer;text-transform:uppercase');
    save.textContent = FR ? 'Enregistrer' : 'Save';
    var reset = mk('span', row, 'text-align:center;background:#000;color:#cfc9bb;border:1px solid #444;padding:11px 14px;font-family:sans-serif;font-size:13px;cursor:pointer');
    reset.textContent = FR ? 'Réinitialiser' : 'Reset';

    btn.addEventListener('click', function () { p.style.display = p.style.display === 'none' ? 'block' : 'none'; });

    save.addEventListener('click', function () {
      stat.textContent = FR ? 'Enregistrement…' : 'Saving…';
      DOC.set(cur).then(function () { stat.textContent = FR ? 'Enregistré. Visible par tous.' : 'Saved. Visible to everyone.'; })
        .catch(function (e) { stat.textContent = (FR ? 'Erreur : ' : 'Error: ') + e.message; });
    });
    reset.addEventListener('click', function () {
      cur = Object.assign({}, DEF); appliquer(cur);
      var ins = p.querySelectorAll('input,textarea');
      for (var k = 0; k < ins.length; k++) { if (ins[k].type === 'color') { var dv = { 0: '#000000', 1: '#ffffff', 2: '#efe6cf' }[k]; ins[k].value = dv || '#000000'; } else ins[k].value = ''; }
      stat.textContent = FR ? 'Réinitialisation…' : 'Resetting…';
      DOC.delete().then(function () { stat.textContent = FR ? 'Revenu au style d\'origine.' : 'Back to original style.'; })
        .catch(function (e) { stat.textContent = (FR ? 'Erreur : ' : 'Error: ') + e.message; });
    });
  }
})();

(function () {
  if (typeof firebase === 'undefined') return;
  var cfg = { apiKey: "AIzaSyC19lFNWUd-KYhCP4o7gpp0IcyfRTyHOyA", authDomain: "lumen-veritatis.firebaseapp.com", projectId: "lumen-veritatis", storageBucket: "lumen-veritatis.firebasestorage.app", messagingSenderId: "195902823875", appId: "1:195902823875:web:a8be1f216a5ae1d945f176" };
  if (!firebase.apps.length) firebase.initializeApp(cfg);
  if (typeof firebase.firestore !== 'function') return;
  var db = firebase.firestore(), auth = firebase.auth();
  var ADMIN = 'hoarauemmanuel336@gmail.com';
  var FR = ((window.LUMEN && window.LUMEN.lang) || localStorage.getItem('lm_lang') || 'fr') !== 'en';
  var DOC = db.doc('config/apparence');

  var COUL = [
    ['encre', '--encre', FR ? 'Fond' : 'Background', '#000000'],
    ['encre2', '--encre-2', FR ? 'Fond secondaire' : 'Secondary background', '#0b0b0b'],
    ['parchemin', '--parchemin', FR ? 'Texte' : 'Text', '#ffffff'],
    ['parchemin_att', '--parchemin-att', FR ? 'Texte atténué' : 'Muted text', '#ffffff'],
    ['or', '--or', FR ? 'Accent' : 'Accent', '#efe6cf'],
    ['or_pale', '--or-pale', FR ? 'Accent clair' : 'Light accent', '#f8f3e6'],
    ['pourpre', '--pourpre', FR ? 'Accent liturgique' : 'Liturgical accent', '#9a3b3b']
  ];
  var FILETS = [
    ['filet', '--filet', FR ? 'Filets' : 'Hairlines', 'rgba(231,224,207,.14)'],
    ['filet_fort', '--filet-fort', FR ? 'Filets renforcés' : 'Strong hairlines', 'rgba(231,224,207,.28)']
  ];
  var TITRES = "h1,h2,h3,h4,h5,h6,.marque,.dom-nom,.sous-nom,.titre-section h2,.domaine h3,.bandeau-page .sur-titre,.bandeau-page h1,.auth-m-title,.nouv-titre-panneau,.lecture h1";

  function styleNode() { var s = document.getElementById('lv-apparence'); if (!s) { s = document.createElement('style'); s.id = 'lv-apparence'; document.head.appendChild(s); } return s; }

  function appliquer(d) {
    d = d || {}; var v = d.vars || {};
    COUL.concat(FILETS).forEach(function (x) { if (v[x[0]]) document.documentElement.style.setProperty(x[1], v[x[0]]); });
    if (d.fond) document.documentElement.style.setProperty('--encre', d.fond);
    if (d.texte) document.documentElement.style.setProperty('--parchemin', d.texte);
    if (d.accent) document.documentElement.style.setProperty('--or', d.accent);
    document.body.style.fontFamily = d.police_corps || d.police || '';
    document.body.style.fontSize = d.taille || '';
    if (d.image) { document.body.style.backgroundImage = 'url("' + d.image + '")'; document.body.style.backgroundSize = 'cover'; document.body.style.backgroundPosition = 'center'; document.body.style.backgroundAttachment = 'fixed'; }
    else { document.body.style.backgroundImage = ''; }
    var extra = '';
    if (d.police_titres) extra += TITRES + '{font-family:' + d.police_titres + ' !important}';
    if (d.css) extra += d.css;
    styleNode().textContent = extra;
  }
  DOC.get().then(function (s) { if (s.exists) appliquer(s.data()); }).catch(function () {});

  var built = false;
  auth.onAuthStateChanged(function (u) {
    var isAdmin = u && ((u.email || '').toLowerCase() === ADMIN);
    var btn = document.getElementById('lv-app-btn');
    if (!isAdmin) { if (btn) btn.style.display = 'none'; var p = document.getElementById('lv-app-panel'); if (p) p.style.display = 'none'; return; }
    if (built) { if (btn) btn.style.display = 'flex'; return; }
    construire();
  });

  function css(e, s) { e.style.cssText = s; }
  function mk(t, p, s) { var e = document.createElement(t); if (s) css(e, s); if (p) p.appendChild(e); return e; }

  function construire() {
    built = true;
    var btn = mk('div', document.body, 'position:fixed;right:18px;bottom:18px;z-index:99999;background:#111;color:#efe6cf;border:1px solid #555;padding:10px 16px;font-family:sans-serif;font-size:13px;letter-spacing:.08em;cursor:pointer;display:flex;align-items:center;gap:8px;text-transform:uppercase');
    btn.id = 'lv-app-btn'; btn.textContent = FR ? 'Apparence' : 'Appearance';
    var p = mk('div', document.body, 'position:fixed;right:18px;bottom:64px;z-index:100002;width:340px;max-width:calc(100vw - 36px);max-height:80vh;overflow:auto;background:#0c0c0c;border:1px solid #555;padding:18px;display:none;box-shadow:0 10px 40px rgba(0,0,0,.6)');
    p.id = 'lv-app-panel';
    mk('div', p, 'font-family:sans-serif;font-size:14px;letter-spacing:.1em;color:#fff;text-transform:uppercase;margin:0 0 12px').textContent = FR ? 'Apparence du site' : 'Site appearance';

    var champs = {};
    function titre(txt) { mk('div', p, 'font-family:sans-serif;font-size:11px;letter-spacing:.12em;color:#8a8a8a;text-transform:uppercase;margin:14px 0 8px').textContent = txt; }
    function ligne(label) { var r = mk('div', p, 'display:flex;align-items:center;justify-content:space-between;gap:10px;margin:7px 0'); mk('label', r, 'font-family:sans-serif;font-size:13px;color:#cfc9bb').textContent = label; return r; }
    function couleur(keyDef) { var r = ligne(keyDef[2]); var i = mk('input', r, 'width:54px;height:28px;background:#000;border:1px solid #333;cursor:pointer;padding:1px'); i.type = 'color'; champs[keyDef[0]] = i; return i; }
    function texte(label, ph, w) { var r = ligne(label); var i = mk('input', r, 'flex:1;min-width:0;background:#000;color:#fff;border:1px solid #333;padding:8px;font-family:sans-serif;font-size:13px'); i.type = 'text'; if (ph) i.placeholder = ph; if (w) i.style.flex = '0 0 ' + w; return i; }

    titre(FR ? 'Couleurs' : 'Colours');
    COUL.forEach(function (x) { couleur(x); });
    titre(FR ? 'Filets (accepte rgba)' : 'Hairlines (rgba allowed)');
    var filetInputs = {};
    FILETS.forEach(function (x) { filetInputs[x[0]] = texte(x[2], x[3]); });
    titre(FR ? 'Polices et taille' : 'Fonts and size');
    var iCorps = texte(FR ? 'Police du corps' : 'Body font', 'EB Garamond, serif');
    var iTitres = texte(FR ? 'Police des titres' : 'Heading font', 'Cormorant Garamond, serif');
    var iTaille = texte(FR ? 'Taille du texte' : 'Text size', '23px');
    titre(FR ? 'Fond et avancé' : 'Background and advanced');
    var iImage = texte(FR ? 'Image de fond (lien)' : 'Background image (URL)', 'https://…');
    mk('label', p, 'display:block;font-family:sans-serif;font-size:13px;color:#cfc9bb;margin:8px 0 5px').textContent = FR ? 'CSS avancé (facultatif)' : 'Advanced CSS (optional)';
    var iCss = mk('textarea', p, 'width:100%;box-sizing:border-box;background:#000;color:#fff;border:1px solid #333;padding:9px;font-family:monospace;font-size:12px;min-height:90px;resize:vertical');

    function valeurs() {
      var v = {}; COUL.forEach(function (x) { v[x[0]] = champs[x[0]].value; });
      FILETS.forEach(function (x) { if (filetInputs[x[0]].value.trim()) v[x[0]] = filetInputs[x[0]].value.trim(); });
      return { vars: v, police_corps: iCorps.value.trim(), police_titres: iTitres.value.trim(), taille: iTaille.value.trim(), image: iImage.value.trim(), css: iCss.value };
    }
    function prefill(d) {
      d = d || {}; var v = d.vars || {};
      COUL.forEach(function (x) { var val = v[x[0]] || (x[0] === 'encre' && d.fond) || (x[0] === 'parchemin' && d.texte) || (x[0] === 'or' && d.accent) || x[3]; champs[x[0]].value = /^#([0-9a-f]{6})$/i.test(val) ? val : x[3]; });
      FILETS.forEach(function (x) { filetInputs[x[0]].value = v[x[0]] || ''; });
      iCorps.value = d.police_corps || d.police || ''; iTitres.value = d.police_titres || ''; iTaille.value = d.taille || ''; iImage.value = d.image || ''; iCss.value = d.css || '';
    }

    var stat = mk('div', p, 'font-family:sans-serif;font-size:12px;color:#9a9a9a;min-height:16px;margin:12px 0 8px');
    var row = mk('div', p, 'display:flex;gap:8px');
    var save = mk('span', row, 'flex:1;text-align:center;background:#efe6cf;color:#000;padding:11px;font-family:sans-serif;font-size:13px;letter-spacing:.06em;cursor:pointer;text-transform:uppercase'); save.textContent = FR ? 'Enregistrer' : 'Save';
    var reset = mk('span', row, 'text-align:center;background:#000;color:#cfc9bb;border:1px solid #444;padding:11px 14px;font-family:sans-serif;font-size:13px;cursor:pointer'); reset.textContent = FR ? 'Réinitialiser' : 'Reset';

    function apercu() { appliquer(valeurs()); }
    p.addEventListener('input', apercu);
    btn.addEventListener('click', function () { if (p.style.display === 'block') { p.style.display = 'none'; return; } DOC.get().then(function (s) { prefill(s.exists ? s.data() : {}); }).catch(function () { prefill({}); }); p.style.display = 'block'; });
    save.addEventListener('click', function () { var d = valeurs(); appliquer(d); stat.textContent = FR ? 'Enregistrement…' : 'Saving…'; DOC.set(d).then(function () { stat.textContent = FR ? 'Enregistré. Visible par tous.' : 'Saved. Visible to everyone.'; }).catch(function (e) { stat.textContent = (FR ? 'Erreur : ' : 'Error: ') + e.message; }); });
    reset.addEventListener('click', function () { if (!confirm(FR ? 'Revenir à l\u2019apparence d\u2019origine ?' : 'Reset appearance to default?')) return; DOC.delete().then(function () { COUL.concat(FILETS).forEach(function (x) { document.documentElement.style.removeProperty(x[1]); }); document.body.style.fontFamily = ''; document.body.style.fontSize = ''; document.body.style.backgroundImage = ''; styleNode().textContent = ''; prefill({}); stat.textContent = FR ? 'Réinitialisé.' : 'Reset.'; }).catch(function (e) { stat.textContent = (FR ? 'Erreur : ' : 'Error: ') + e.message; }); });
  }
})();

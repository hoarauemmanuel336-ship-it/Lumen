(function () {
  if (typeof firebase === 'undefined') return;
  var cfg = { apiKey: "AIzaSyC19lFNWUd-KYhCP4o7gpp0IcyfRTyHOyA", authDomain: "lumen-veritatis.firebaseapp.com", projectId: "lumen-veritatis", storageBucket: "lumen-veritatis.firebasestorage.app", messagingSenderId: "195902823875", appId: "1:195902823875:web:a8be1f216a5ae1d945f176" };
  if (!firebase.apps.length) firebase.initializeApp(cfg);
  if (typeof firebase.firestore !== 'function') return;
  var db = firebase.firestore(), auth = firebase.auth();
  var ADMIN = 'hoarauemmanuel336@gmail.com';
  var lang = (window.LUMEN && window.LUMEN.lang) || 'fr';
  var FR = lang !== 'en';
  var COL = db.collection('contenu');

  // Rend un résumé tronqué comme le build (resumeHtmlBI)
  function resumeHtml(txt) {
    if (txt.length <= 195) return '<p>' + txt + '</p>';
    var cut = txt.lastIndexOf(' ', 150); if (cut < 100) cut = 150;
    var court = txt.slice(0, cut).replace(/[\s,;:\u2013\u2014-]+$/, '');
    var more = FR ? 'voir plus' : 'see more', less = FR ? 'voir moins' : 'see less';
    return '<p class="resume r-trunc"><span class="r-court">' + court + '\u2026</span><span class="r-full" hidden>' + txt + '</span> <span class="voir-plus" role="button" tabindex="0" data-more="' + more + '" data-less="' + less + '">' + more + '</span></p>';
  }

  // 1) VIGNETTES : refléter titre et résumé édités (toute page qui en contient)
  var cards = document.querySelectorAll('a.article-lien[data-card]');
  if (cards.length) {
    COL.get().then(function (qs) {
      var map = {}; qs.forEach(function (d) { map[d.id] = d.data(); });
      Array.prototype.forEach.call(cards, function (card) {
        var d = map[card.getAttribute('data-card')]; if (!d) return;
        var t = d['titre_' + lang]; if (typeof t === 'string' && t) { var h = card.querySelector('h3'); if (h) h.textContent = t; }
        var r = d['resume_' + lang]; if (typeof r === 'string' && r) { var p = card.querySelector('p'); if (p) p.outerHTML = resumeHtml(r); }
      });
    }).catch(function () {});
  }

  // 2) PAGE D'ARTICLE : appliquer l'override + éditeur admin
  var art = document.querySelector('article.lecture[data-article]');
  if (!art) return;
  var slug = art.getAttribute('data-article');
  var DOC = COL.doc(slug);
  var h1 = art.querySelector('h1');
  var srcEl = document.getElementById('lv-art-src');
  var src = {}; try { src = srcEl ? JSON.parse(srcEl.textContent) : {}; } catch (e) {}

  function corpsActuel() { var c = art.cloneNode(true); var hh = c.querySelector('h1'); if (hh) hh.remove(); return c.innerHTML.trim(); }
  function poserTitre(t) { if (h1) h1.textContent = t; }
  function poserCorps(html) {
    var kids = Array.prototype.slice.call(art.children);
    for (var i = 0; i < kids.length; i++) { if (kids[i] !== h1) kids[i].remove(); }
    if (h1) h1.insertAdjacentHTML('afterend', html); else art.innerHTML = html;
  }
  var resumeCourant = (typeof src.resume === 'string') ? src.resume : '';
  var themeCourant = (typeof src.theme === 'string') ? src.theme : '';
  var themesListe = Array.isArray(src.themes) ? src.themes : [];

  DOC.get().then(function (s) {
    if (!s.exists) return; var d = s.data();
    var t = d['titre_' + lang], b = d['contenu_' + lang], r = d['resume_' + lang];
    if (typeof t === 'string' && t) poserTitre(t);
    if (typeof b === 'string' && b) poserCorps(b);
    if (typeof r === 'string') resumeCourant = r;
    if (typeof d['theme'] === 'string' && d['theme']) themeCourant = d['theme'];
  }).catch(function () {});

  var built = false;
  auth.onAuthStateChanged(function (u) {
    var isAdmin = u && ((u.email || '').toLowerCase() === ADMIN);
    var btn = document.getElementById('lv-ed-btn');
    if (!isAdmin) { if (btn) btn.style.display = 'none'; return; }
    if (built) { if (btn) btn.style.display = 'flex'; return; }
    construire();
  });

  function css(e, s) { e.style.cssText = s; }
  function mk(tag, parent, s) { var e = document.createElement(tag); if (s) css(e, s); if (parent) parent.appendChild(e); return e; }

  function construire() {
    built = true;
    var btn = mk('div', document.body, 'position:fixed;right:18px;bottom:64px;z-index:99999;background:#111;color:#efe6cf;border:1px solid #555;padding:10px 16px;font-family:sans-serif;font-size:13px;letter-spacing:.08em;cursor:pointer;display:flex;align-items:center;gap:8px;text-transform:uppercase');
    btn.id = 'lv-ed-btn'; btn.textContent = FR ? 'Éditer le texte' : 'Edit text';

    var ov = mk('div', document.body, 'position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.78);display:none;padding:24px;overflow:auto'); ov.id = 'lv-ed-ov';
    var p = mk('div', ov, 'max-width:780px;margin:0 auto;background:#0c0c0c;border:1px solid #555;padding:22px');
    var titre = mk('div', p, 'font-family:sans-serif;font-size:14px;letter-spacing:.1em;color:#fff;text-transform:uppercase;margin:0 0 4px');
    titre.textContent = (FR ? 'Éditer l\'article' : 'Edit article') + ' (' + (FR ? 'français' : 'English') + ')';
    var sous = mk('div', p, 'font-family:sans-serif;font-size:12px;color:#9a9a9a;margin:0 0 8px');
    sous.textContent = FR ? 'Tu modifies la langue de la page. Le corps est en HTML : change les mots, garde les balises.' : 'You edit the language of this page. The body is HTML: change the words, keep the tags.';

    function champ(label, multi, h) {
      var l = mk('label', p, 'display:block;font-size:12px;letter-spacing:.04em;color:#cfc9bb;margin:14px 0 5px;font-family:sans-serif'); l.textContent = label;
      var i = mk(multi ? 'textarea' : 'input', p, 'width:100%;box-sizing:border-box;background:#000;color:#fff;border:1px solid #333;padding:10px;font-family:' + (multi ? 'monospace' : 'sans-serif') + ';font-size:14px' + (multi ? ';min-height:' + (h || 340) + 'px;resize:vertical;line-height:1.5' : ''));
      if (!multi) i.type = 'text'; return i;
    }
    var iTitre = champ(FR ? 'Titre' : 'Title', false);
    var lTh = mk('label', p, 'display:block;font-size:12px;letter-spacing:.04em;color:#cfc9bb;margin:14px 0 5px;font-family:sans-serif'); lTh.textContent = FR ? 'Thème (domaine)' : 'Theme (domain)';
    var iTheme = mk('select', p, 'width:100%;box-sizing:border-box;background:#000;color:#fff;border:1px solid #333;padding:10px;font-family:sans-serif;font-size:14px');
    themesListe.forEach(function (t) { var o = document.createElement('option'); o.value = t.id; o.textContent = t.nom || t.id; iTheme.appendChild(o); });
    if (!themesListe.length) { lTh.style.display = 'none'; iTheme.style.display = 'none'; }
    var iResume = champ(FR ? 'Résumé (apparaît dans la bibliothèque)' : 'Summary (shown in the library)', true, 90);
    var iCorps = champ(FR ? 'Corps de l\'article (HTML)' : 'Article body (HTML)', true, 340);

    var stat = mk('div', p, 'font-family:sans-serif;font-size:12px;color:#9a9a9a;min-height:16px;margin:12px 0');
    var row = mk('div', p, 'display:flex;gap:8px');
    var save = mk('span', row, 'flex:1;text-align:center;background:#efe6cf;color:#000;padding:12px;font-family:sans-serif;font-size:13px;letter-spacing:.06em;cursor:pointer;text-transform:uppercase'); save.textContent = FR ? 'Enregistrer' : 'Save';
    var apercu = mk('span', row, 'text-align:center;background:#000;color:#cfc9bb;border:1px solid #444;padding:12px 16px;font-family:sans-serif;font-size:13px;cursor:pointer'); apercu.textContent = FR ? 'Aperçu' : 'Preview';
    var ferme = mk('span', row, 'text-align:center;background:#000;color:#cfc9bb;border:1px solid #444;padding:12px 16px;font-family:sans-serif;font-size:13px;cursor:pointer'); ferme.textContent = FR ? 'Fermer' : 'Close';

    function remplir() { iTitre.value = h1 ? h1.textContent : ''; iResume.value = resumeCourant || ''; iCorps.value = corpsActuel(); if (themesListe.length) iTheme.value = themeCourant || themesListe[0].id; }
    btn.addEventListener('click', function () { remplir(); ov.style.display = 'block'; });
    ferme.addEventListener('click', function () { ov.style.display = 'none'; });
    ov.addEventListener('click', function (e) { if (e.target === ov) ov.style.display = 'none'; });
    apercu.addEventListener('click', function () { poserTitre(iTitre.value); poserCorps(iCorps.value); resumeCourant = iResume.value; stat.textContent = FR ? 'Aperçu appliqué (non enregistré).' : 'Preview applied (not saved).'; });
    save.addEventListener('click', function () {
      var data = {}; data['titre_' + lang] = iTitre.value; data['resume_' + lang] = iResume.value; data['contenu_' + lang] = iCorps.value; if (iTheme && iTheme.value) { data['theme'] = iTheme.value; themeCourant = iTheme.value; }
      stat.textContent = FR ? 'Enregistrement…' : 'Saving…';
      DOC.set(data, { merge: true }).then(function () {
        poserTitre(iTitre.value); poserCorps(iCorps.value); resumeCourant = iResume.value;
        stat.textContent = FR ? 'Enregistré. Visible par tous.' : 'Saved. Visible to everyone.';
      }).catch(function (e) { stat.textContent = (FR ? 'Erreur : ' : 'Error: ') + e.message; });
    });
  }
})();

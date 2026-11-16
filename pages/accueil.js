/* ============================================================
   LUMEN — l'accueil : la croix et la vie de l'Église au jour le jour
   Emmanuel a voulu sur l'accueil « tout ce qui rythme la vie de
   l'Église », d'après le calendrier de France, et la méditation du jour.

   D'où vient chaque chose :
   · le calendrier (temps, semaine, célébration, couleur, cycles,
     psautier, dates à venir) se lit dans /liturgie/AAAA.json, fabriqué
     d'avance par fabrication/calendrier-liturgique.mjs : rien ne dépend
     d'un service extérieur, et tout marche hors ligne ;
   · les lectures de la messe viennent de l'AELF par /api/liturgie, en
     références seulement : un toucher les ouvre dans la Bible du site
     (le tiroir de la Bible, dans la traduction choisie) ;
   · l'obligation, le jeûne et l'abstinence suivent les règles de
     l'Église en France ; l'heure (office, Angélus) suit l'horloge de
     l'appareil.
   ============================================================ */
(function () {
  'use strict';
  var Z = document.getElementById('lit');
  if (!Z) return;

  var NB = ' ';
  var TEMPS = { AV: 'Avent', NO: 'Temps de Noël', TO: 'Temps ordinaire', CA: 'Carême', TR: 'Triduum pascal', PA: 'Temps pascal' };
  var RANG = { S: 'Solennité', F: 'Fête', M: 'Mémoire', D: 'Dimanche', W: 'Férie' };
  var COUL = { V: 'Vert', P: 'Violet', B: 'Blanc', R: 'Rouge', O: 'Rose', N: 'Noir' };
  /* Couleur de chaque temps sur la frise de l'année. */
  var COUL_TEMPS = { AV: 'P', NO: 'B', TO: 'V', CA: 'P', TR: 'R', PA: 'B' };
  var ANNEES = {};

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function deux(n) { return (n < 10 ? '0' : '') + n; }
  function cle(d) { return d.getFullYear() + '-' + deux(d.getMonth() + 1) + '-' + deux(d.getDate()); }
  function plus(d, n) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); return x; }
  function jour(d) { var a = ANNEES[d.getFullYear()]; return a ? a[cle(d)] : null; }
  function ordinal(n) { return n === 1 ? '1re' : n + 'e'; }
  function ord(n) { return n === 1 ? '1<sup>re</sup>' : n + '<sup>e</sup>'; }
  function typo(s) { return String(s).replace(/ - /g, ', ').replace(/ ([:;!?»])/g, NB + '$1').replace(/« /g, '«' + NB); }
  var fmtLong = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  var fmtCourt = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function pastille(c) { return '<span class="lit-coul lit-c-' + c + '" aria-hidden="true"></span>'; }

  function charge(an) {
    if (ANNEES[an]) return Promise.resolve();
    return fetch('/liturgie/' + an + '.json').then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    }).then(function (d) { ANNEES[an] = d; }).catch(function () { ANNEES[an] = null; });
  }

  /* ───────── Ce que dit le temps ───────── */
  function dansLeTemps(j) {
    if (j.s === 'TR') return 'Triduum pascal';
    if (j.sa) return 'Carême, semaine sainte';
    if (j.oc && j.s === 'PA') return 'Temps pascal, octave de Pâques';
    if (j.oc && j.s === 'NO') return 'Temps de Noël, octave de la Nativité';
    if (j.s === 'NO') return 'Temps de Noël';
    if (j.s === 'CA' && !j.w) return 'Carême, jours après les Cendres';
    return TEMPS[j.s] + (j.w ? ', ' + ord(j.w) + ' semaine' : '');
  }
  function rangDe(nom, r, fac) {
    if (/^Commémoration/.test(nom)) return '';
    if (fac) return 'Mémoire facultative';
    return RANG[r] || '';
  }

  /* ───────── Règles de l'Église en France ─────────
     Fêtes d'obligation en France : les dimanches, l'Ascension,
     l'Assomption, la Toussaint et Noël. Jeûne et abstinence le mercredi
     des Cendres et le Vendredi saint ; abstinence les vendredis de
     Carême ; les autres vendredis sont jours de pénitence, sauf quand une
     solennité tombe ce jour-là. */
  function obligation(d, j) {
    if (!j) return false;
    if (d.getDay() === 0) return true;
    return /^Ascension|^Assomption|^Tous les Saints|^Nativité du Seigneur/.test(j.n);
  }
  function viePratique(d, j) {
    var l = [];
    if (obligation(d, j)) l.push(d.getDay() === 0 && !/^Nativité|^Assomption|^Tous les Saints/.test(j.n)
      ? 'Messe dominicale, jour d’obligation'
      : 'Fête d’obligation : participation à la messe');
    if (/^Mercredi des Cendres/.test(j.n) || /^Vendredi Saint/.test(j.n)) l.push('Jeûne et abstinence');
    else if (d.getDay() === 5 && j.r !== 'S') l.push(j.s === 'CA' ? 'Vendredi de Carême : abstinence' : 'Vendredi : jour de pénitence');
    var dem = plus(d, 1), jd = jour(dem);
    if (jd && obligation(dem, jd) && dem.getDay() !== 0) l.push('Demain, fête d’obligation : ' + jd.n + ' (messe possible dès ce soir)');
    if (!l.length) l.push('Ni obligation, ni jeûne, ni abstinence');
    return l;
  }

  /* ───────── L'heure ───────── */
  function heure(j) {
    var h = new Date().getHours(), office;
    if (h >= 5 && h < 9) office = 'Laudes';
    else if (h >= 9 && h < 12) office = 'Tierce';
    else if (h >= 12 && h < 15) office = 'Sexte';
    else if (h >= 15 && h < 17) office = 'None';
    else if (h >= 17 && h < 20) office = 'Vêpres';
    else office = 'Complies';
    /* Au temps pascal, la Reine du ciel (Regina Caeli) remplace l'Angélus. */
    var priere = j && j.s === 'PA' ? 'Reine du ciel' : 'Angélus';
    var proch = h < 6 ? '6' + NB + 'h' : h < 12 ? 'midi' : h < 18 ? '18' + NB + 'h' : 'demain, 6' + NB + 'h';
    return [
      ['Office du moment', office],
      [priere, 'matin, midi et soir · prochain' + NB + ': ' + proch]
    ];
  }

  /* ───────── L'année liturgique ───────── */
  function estAvent1(j) { return j && j.s === 'AV' && j.w === 1 && j.r === 'D'; }
  function bornesAnnee(d) {
    var deb = d, i;
    for (i = 0; i < 400 && !estAvent1(jour(deb)); i++) deb = plus(deb, -1);
    var fin = plus(d, 1);
    for (i = 0; i < 400 && !estAvent1(jour(fin)); i++) fin = plus(fin, 1);
    if (!jour(deb) || !jour(fin)) return null;
    return { deb: deb, fin: fin };
  }
  function frise(d) {
    var b = bornesAnnee(d);
    if (!b) return '';
    var total = Math.round((b.fin - b.deb) / 864e5), segs = [], cur = null, x = b.deb, i;
    for (i = 0; i < total; i++, x = plus(x, 1)) {
      var j = jour(x), s = j ? j.s : 'TO';
      if (!cur || cur.s !== s) { cur = { s: s, n: 0, i: i }; segs.push(cur); }
      cur.n++;
    }
    var pos = Math.round((d - b.deb) / 864e5);
    var h = '<div class="lit-frise">';
    h += '<div class="lit-bande" role="img" aria-label="L’année liturgique, du premier dimanche de l’Avent au suivant">';
    segs.forEach(function (s) {
      h += '<span class="lit-seg lit-c-' + COUL_TEMPS[s.s] + '" style="left:' + (s.i / total * 100) + '%;width:' + (s.n / total * 100) + '%"></span>';
    });
    h += '<span class="lit-ici" style="left:' + ((pos + .5) / total * 100) + '%"></span></div>';
    /* Sous la frise, la date où chaque temps commence, posée à la jonction
       des couleurs par un mince trait, Triduum compris. Les dates se
       répartissent sur trois hauteurs à tour de rôle : le Triduum ne dure
       que trois jours, et sa date tombe juste avant celle du Temps pascal,
       si bien que deux hauteurs ne suffisent pas à les tenir à l'écart
       l'une de l'autre et de leurs voisines, même sur téléphone. */
    var jm = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }), rang = 0;
    h += '<div class="lit-dates">';
    segs.forEach(function (s) {
      var r = rang++ % 3, dd = plus(b.deb, s.i);
      /* le Triduum s'ouvre le Jeudi saint au soir, la veille du premier jour
         qu'il colore : sa date est celle du Jeudi saint */
      if (s.s === 'TR') { var jv = jour(plus(dd, -1)); if (jv && /^Jeudi Saint/.test(jv.n)) dd = plus(dd, -1); }
      h += '<span class="lit-d' + (r ? ' lit-d' + (r + 1) : '') + '" style="left:' + (s.i / total * 100) + '%">' + esc(jm.format(dd)) + '</span>';
    });
    h += '</div>';
    var LEGENDE = [['P', 'Avent, Carême'], ['B', 'Noël, Temps pascal'], ['V', 'Temps ordinaire'], ['R', 'Triduum pascal']];
    h += '<ul class="lit-legende">';
    LEGENDE.forEach(function (l) { h += '<li><span class="lit-coul lit-c-' + l[0] + '" aria-hidden="true"></span>' + l[1] + '</li>'; });
    /* le trait blanc posé sur la frise marque le jour présent : la légende le nomme */
    h += '<li><span class="lit-ici-leg" aria-hidden="true"></span>Aujourd’hui</li>';
    h += '</ul></div>';
    return h;
  }

  /* ───────── Les grandes dates à venir ───────── */
  function marquant(j) {
    if (!j) return false;
    if (j.r === 'S') return true;
    if (estAvent1(j)) return true;
    if (/^Mercredi des Cendres|Rameaux|^Jeudi Saint|^Vendredi Saint/.test(j.n)) return true;
    return j.r === 'F' && /Seigneur|Christ|Croix|Sainte Famille|Latran/.test(j.n);
  }
  function aVenir(d) {
    var l = [], x = plus(d, 1);
    for (var i = 1; i <= 400 && l.length < 8; i++, x = plus(x, 1)) {
      var j = jour(x);
      if (marquant(j)) l.push({ d: x, j: j, n: i });
    }
    return l;
  }

  /* ───────── Les lectures ───────── */
  var LIV = {
    Gn: 'Genèse', Ex: 'Exode', Lv: 'Lévitique', Nb: 'Nombres', Dt: 'Deutéronome', Jos: 'Josué', Jg: 'Juges', Rt: 'Ruth',
    '1S': '1 Samuel', '2S': '2 Samuel', '1R': '1 Rois', '2R': '2 Rois', '1Ch': '1 Chroniques', '2Ch': '2 Chroniques',
    Esd: 'Esdras', Ne: 'Néhémie', Tb: 'Tobie', Jdt: 'Judith', Est: 'Esther', '1M': '1 Maccabées', '2M': '2 Maccabées',
    Jb: 'Job', Ps: 'Psaumes', Pr: 'Proverbes', Qo: 'Ecclésiaste', Ct: 'Cantique des cantiques', Sg: 'Sagesse', Si: 'Siracide',
    Is: 'Isaïe', Jr: 'Jérémie', Lm: 'Lamentations', Ba: 'Baruch', Ez: 'Ézéchiel', Dn: 'Daniel', Os: 'Osée', Jl: 'Joël',
    Am: 'Amos', Ab: 'Abdias', Jon: 'Jonas', Mi: 'Michée', Na: 'Nahum', Ha: 'Habacuc', So: 'Sophonie', Ag: 'Aggée',
    Za: 'Zacharie', Ml: 'Malachie', Mt: 'Matthieu', Mc: 'Marc', Lc: 'Luc', Jn: 'Jean', Ac: 'Actes', Rm: 'Romains',
    '1Co': '1 Corinthiens', '2Co': '2 Corinthiens', Ga: 'Galates', Ep: 'Éphésiens', Ph: 'Philippiens', Col: 'Colossiens',
    '1Th': '1 Thessaloniciens', '2Th': '2 Thessaloniciens', '1Tm': '1 Timothée', '2Tm': '2 Timothée', Tt: 'Tite',
    Phm: 'Philémon', He: 'Hébreux', 'Hé': 'Hébreux', Jc: 'Jacques', '1P': '1 Pierre', '2P': '2 Pierre', '1Jn': '1 Jean',
    '2Jn': '2 Jean', '3Jn': '3 Jean', Jude: 'Jude', Jud: 'Jude', Ap: 'Apocalypse'
  };
  /* L'AELF écrit « Dn 12, 1-3 » ; le site écrit « Daniel 12:1-3 ». Les
     psaumes de l'AELF portent la numérotation liturgique suivie de
     l'hébraïque entre parenthèses, « Ps 15 (16) » : la Bible du site suit
     l'hébraïque. Le lien ouvre le passage d'un seul tenant, du premier au
     dernier verset du premier chapitre cité. */
  function convRef(type, ref) {
    var s = String(ref || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
    if (/^psaume/.test(type) && /^\d/.test(s)) s = 'Ps ' + s;
    var m = s.match(/^([1-3]?\s?[A-Za-zÀ-ÿ]+)\.?\s+(\d.*)$/);
    if (!m) return null;
    var ab = m[1].replace(/\s/g, ''), nom = LIV[ab];
    if (!nom) return null;
    var reste = m[2];
    if (ab === 'Ps') reste = reste.replace(/^(\d+)\s*\((\d+)\)/, '$2');
    var aff = reste
      .replace(/;\s*(\d+)\s*,\s*/g, '; $1:')
      .replace(/(\s[–-]\s*)(\d+)\s*,\s*(\d+)/g, '$1$2:$3')
      .replace(/^(\d+)\s*,\s*/, '$1:')
      .replace(/\.(?=\d)/g, ', ')
      .replace(/ ;/g, NB + ';');
    var ch = parseInt(reste, 10), lien = nom + ' ' + ch;
    var vv = reste.replace(/^\d+\s*,?\s*/, '').split(/;|\s[–-]\s/)[0].match(/\d+/g);
    if (vv && vv.length) lien += ':' + vv[0] + (vv.length > 1 && +vv[vv.length - 1] > +vv[0] ? '-' + vv[vv.length - 1] : '');
    return { aff: (ab === 'Ps' ? 'Psaume' : nom) + ' ' + aff, lien: lien };
  }
  function nomLecture(t) {
    var m = t.match(/^lecture_(\d+)/);
    if (m) return m[1] === '1' ? 'Première lecture' : m[1] === '2' ? 'Deuxième lecture' : ordinal(+m[1]) + ' lecture';
    if (/^psaume/.test(t)) return 'Psaume';
    if (/^cantique/.test(t)) return 'Cantique';
    if (/^evangile/.test(t)) return 'Évangile';
    if (/^epitre/.test(t)) return 'Épître';
    return '';
  }
  function lectures(d) {
    var z = Z.querySelector('.lit-lect');
    if (!z) return;
    var k = cle(d), memo = null;
    try { memo = JSON.parse(localStorage.getItem('lv_liturgie') || 'null'); } catch (_) {}
    if (memo && memo.date === k) { montreLectures(z, memo); return; }
    z.innerHTML = '<span class="lv-roue petite" role="status" aria-label="Chargement"></span>';
    fetch('/api/liturgie?date=' + k).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    }).then(function (dd) {
      if (!dd || !dd.lectures || !dd.lectures.length) throw new Error('vide');
      try { localStorage.setItem('lv_liturgie', JSON.stringify(dd)); } catch (_) {}
      montreLectures(z, dd);
    }).catch(function () {
      z.innerHTML = '<p class="lit-doux">Les lectures n’ont pas pu être chargées.</p>';
    });
  }
  function montreLectures(z, dd) {
    var h = '';
    dd.lectures.forEach(function (l) {
      var nom = nomLecture(l.type), r = convRef(l.type, l.ref);
      if (!nom) return;
      h += '<div class="lit-ligne"><span class="lit-mot">' + nom + '</span>';
      h += r ? '<button type="button" class="lit-ref" data-ref="' + esc(r.lien) + '">' + esc(r.aff) + '</button>'
             : '<span class="lit-val">' + esc(l.ref) + '</span>';
      h += '</div>';
    });
    z.innerHTML = h || '<p class="lit-doux">Les lectures n’ont pas pu être chargées.</p>';
  }
  /* Un toucher sur une référence l'ouvre dans le tiroir de la Bible : le
     tiroir écoute les références écrites dans les pages (span.ref) ; on lui
     en tend une, le temps du clic. */
  Z.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.lit-ref') : null;
    if (!b) return;
    var s = document.createElement('span');
    s.className = 'ref';
    s.textContent = b.getAttribute('data-ref');
    s.style.display = 'none';
    document.body.appendChild(s);
    s.click();
    document.body.removeChild(s);
  });

  /* ───────── La méditation du jour ─────────
     Écrite chaque nuit par Claude et lue par une voix d'ElevenLabs
     (netlify/functions/), servie par /api/meditation ; elle paraît à
     minuit, toujours avec sa voix. L'accueil montre celle du jour : son
     titre, sa voix (écouter, avancer, télécharger) et son texte, qui
     suit la voix. Quand elle manque (pause, crédits
     épuisés), une phrase le dit à tous ; Emmanuel seul voit en plus
     pourquoi, et quoi faire, d'après ce que le serveur lui répond
     (lumen-app.js, « lv-med-proprio »). « Les méditations précédentes »
     ouvre la liste des trente derniers jours ; un toucher sur l'une la
     pose ici à la place de celle du jour, l'icône à sa droite la
     télécharge. */
  var MED = { liste: [], aujourdhui: '', jour: '', pause: false };
  var IC_JOUER = '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/></svg>';
  var IC_PAUSE = '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M7 4.5h3.6v15H7zM13.4 4.5H17v15h-3.6z" fill="currentColor"/></svg>';
  var IC_TELE = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M7 10.5l5 5 5-5M5 19.5h14"/></svg>';
  var IC_X = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var fmtJour = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  function dateDe(k) { var p = k.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function minutes(s) { s = Math.max(0, Math.round(s || 0)); return Math.floor(s / 60) + ':' + deux(s % 60); }
  /* ── le texte qui suit la voix ──
     Le texte arrive en paragraphes, avec *italique* et **gras**, et, pour
     chaque mot, le moment où la voix le dit (netlify/functions/
     meditation-fabrique.mjs, qui découpe paragraphes et mots exactement
     comme ici : les mots aux espaces ordinaires, jamais aux insécables).
     Pendant l'écoute, le texte défile de lui-même d'un mouvement continu,
     ligne après ligne, à la vitesse de la voix, sans à-coups : sa place
     est calculée à chaque image entre le début d'une ligne et celui de la
     suivante. Les mots déjà dits s'allument en fondu. Un toucher sur un
     mot y fait aller la voix ; à l'arrêt, le texte se fait défiler à la
     main. */
  function paragraphesMed(t) {
    var out = [], re = /[^\n]+(?:\n(?![ \t]*\n)[^\n]*)*/g, m;
    while ((m = re.exec(String(t || '')))) { var p = m[0].trim(); if (p) out.push(p); }
    return out;
  }
  function texteSuivi(m) {
    var ps = paragraphesMed(m.texte), temps = m.temps && m.temps.length === ps.length ? m.temps : null;
    var total = 0, avant = 0, it = false, gr = false, h = '';
    ps.forEach(function (p) { total += p.length + 1; });
    ps.forEach(function (p, k) {
      var re = /[^ \t\r\n]+/g, w, i = 0, mots = [];
      while ((w = re.exec(p))) {
        var s = w[0], tm = temps && temps[k] && temps[k][i] != null ? temps[k][i] : (m.duree || 0) * (avant + w.index) / (total || 1);
        /* un mot prend le style en cours à sa première lettre ; ** et *
           ouvrent ou ferment le gras et l'italique là où ils sont */
        var cls = null, mot = '';
        for (var j = 0; j < s.length;) {
          if (s.substr(j, 2) === '**') { gr = !gr; j += 2; continue; }
          if (s.charAt(j) === '*') { it = !it; j++; continue; }
          if (cls === null) cls = 'mw' + (it ? ' it' : '') + (gr ? ' gr' : '');
          mot += s.charAt(j++);
        }
        if (!mot) { i++; continue; }
        mots.push('<span class="' + cls + '" data-t="' + (Math.round(tm * 100) / 100) + '">' + esc(mot) + '</span>');
        i++;
      }
      avant += p.length + 1;
      h += '<p>' + mots.join(' ') + '</p>';
    });
    return h;
  }
  function suivi(z, a) {
    var boite = z.querySelector('.med-texte'), defil = boite.querySelector('.med-defil');
    var mots = [].slice.call(boite.querySelectorAll('.mw'));
    var T = mots.map(function (w) { return +w.getAttribute('data-t') || 0; });
    var lignes = [], dits = 0, image = 0, mesuree = false, y = 0;
    /* les lignes du texte, avec le moment où la voix commence chacune */
    function mesure() {
      lignes = [];
      var der = null;
      for (var i = 0; i < mots.length; i++) {
        var h = mots[i].offsetTop;
        if (der === null || Math.abs(h - der) > 4) { lignes.push({ t: T[i], y: h }); der = h; }
      }
      mesuree = true;
    }
    function hauteur(t) {
      if (!lignes.length) return 0;
      if (t <= lignes[0].t) return lignes[0].y;
      for (var i = 0; i < lignes.length - 1; i++) {
        var l = lignes[i], s = lignes[i + 1];
        if (t < s.t) return l.y + (s.y - l.y) * Math.max(0, Math.min(1, (t - l.t) / Math.max(0.05, s.t - l.t)));
      }
      return lignes[lignes.length - 1].y;
    }
    function allume(t) {
      while (dits < mots.length && T[dits] <= t) mots[dits++].classList.add('dit');
      while (dits > 0 && T[dits - 1] > t) mots[--dits].classList.remove('dit');
    }
    /* pendant l'écoute, le texte glisse d'un mouvement continu (au
       sous-pixel près) ; à l'arrêt, il redevient une fenêtre qu'on fait
       défiler soi-même, à l'endroit où la voix s'est arrêtée */
    function cible() {
      if (!mesuree) mesure();
      var max = Math.max(0, boite.scrollHeight - boite.clientHeight);
      return Math.max(0, Math.min(max, hauteur(a.currentTime || 0) - boite.clientHeight * 0.36));
    }
    function image1() {
      var c = cible();
      y = Math.abs(c - y) > 30 ? y + (c - y) * 0.12 : c;
      defil.style.transform = 'translate3d(0,' + (-y).toFixed(2) + 'px,0)';
      allume(a.currentTime || 0);
      image = requestAnimationFrame(image1);
    }
    function joue() {
      cancelAnimationFrame(image);
      y = boite.scrollTop;
      boite.scrollTop = 0;
      boite.classList.add('suit', 'joue');
      defil.style.transform = 'translate3d(0,' + (-y) + 'px,0)';
      image = requestAnimationFrame(image1);
    }
    function arrete() {
      cancelAnimationFrame(image);
      if (!boite.classList.contains('joue')) return;
      boite.classList.remove('joue');
      defil.style.transform = '';
      boite.scrollTop = Math.round(y);
    }
    a.addEventListener('play', joue);
    a.addEventListener('pause', arrete);
    a.addEventListener('ended', arrete);
    a.addEventListener('seeked', function () { allume(a.currentTime || 0); if (a.paused && boite.classList.contains('suit')) { y = cible(); boite.scrollTop = Math.round(y); } });
    boite.addEventListener('click', function (e) {
      var w = e.target.closest ? e.target.closest('.mw') : null;
      if (!w) return;
      try { a.currentTime = +w.getAttribute('data-t') || 0; } catch (_) {}
      if (a.paused) a.play().catch(function () {});
    });
    /* une fenêtre qui change de largeur, ou la taille du texte réglée dans
       « Mon compte », déplace les lignes : elles se remesurent */
    window.addEventListener('resize', function () { mesuree = false; });
    if (window.ResizeObserver) new ResizeObserver(function () { mesuree = false; }).observe(defil);
  }

  function zoneMed() { return Z.querySelector('.lit-medit'); }
  /* « Les méditations précédentes » se tient sous l'intitulé du bloc, à
     l'écart du texte qui défile, pour ne pas le gêner */
  function lienAvant(montre) {
    var b = Z.querySelector('.med-avant');
    if (b) b.hidden = !montre;
  }

  function meditation() {
    var z = zoneMed();
    if (!z) return;
    z.innerHTML = '<span class="lv-roue petite" role="status" aria-label="Chargement"></span>';
    fetch('/api/meditation', { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    }).then(function (d) {
      MED.liste = d.liste || [];
      MED.aujourdhui = d.aujourdhui || cle(new Date());
      MED.pause = !!d.pause;
      MED.reprise = !!d.reprise;
      if (d.derniere && d.derniere.date === MED.aujourdhui) { montreMed(d.derniere); return; }
      var h = '<p class="lit-doux">' + (MED.pause ? 'Les méditations sont en pause.'
        : MED.reprise ? 'Les méditations reprennent : la prochaine paraîtra à minuit.'
        : MED.liste.length ? 'La méditation du jour n’a pas encore paru.' : 'La première méditation paraîtra à minuit.') + '</p>';
      MED.jour = '';
      z.innerHTML = h;
      lienAvant(MED.liste.length > 0);
      proprio();
    }).catch(function () {
      z.innerHTML = '<p class="lit-doux">La méditation n’a pas pu être chargée.</p>';
    });
  }

  function montreMed(m) {
    var z = zoneMed();
    if (!z) return;
    MED.jour = m.date;
    var duJour = m.date === MED.aujourdhui;
    var h = '<h3 class="med-titre">' + esc(m.titre) + '</h3>';
    var src = '/api/meditation/' + m.date + '.mp3';
      h += '<div class="med-lecteur">'
        + '<div class="med-btns">'
        + '<button type="button" class="med-b med-jouer" aria-label="Écouter">' + IC_JOUER + '<span>Écouter</span></button>'
        + '<a class="med-b med-tele" href="' + src + '?telecharger" download="meditation-' + m.date + '.mp3" aria-label="Télécharger l’audio">' + IC_TELE + '<span>Télécharger</span></a>'
        + '</div>'
        + '<div class="med-piste"><span class="med-t med-ici">0:00</span>'
        + '<input type="range" class="med-barre" min="0" max="' + (m.duree || 0) + '" step="1" value="0" aria-label="Avancer dans la méditation">'
        + '<span class="med-t med-tout">' + minutes(m.duree) + '</span></div>'
        + '<audio class="med-audio" preload="none" src="' + src + '"></audio>'
        + '</div>';
    h += '<div class="med-texte"><div class="med-defil">' + texteSuivi(m) + '</div></div>';
    z.innerHTML = h;
    branche(z, m);
    suivi(z, z.querySelector('.med-audio'));
    lienAvant(MED.liste.length > 1 || !duJour);
    proprio();
  }

  /* ── ce que voit Emmanuel seul ──
     Sous la méditation, une note dit pourquoi elle manque et quoi faire,
     ou prévient quand les crédits ElevenLabs deviennent justes. */
  var fmtNb = new Intl.NumberFormat('fr-FR');
  function proprio() {
    var z = zoneMed(), d = window.LV_MED_PROPRIO;
    if (!z) return;
    var vieille = z.querySelector('.med-proprio');
    if (vieille) vieille.parentNode.removeChild(vieille);
    if (!d || !d.proprio) return;
    var e = d.etat || {}, c = e.credits || null, auj = d.aujourdhui || MED.aujourdhui, t = '';
    var dateRen = c && c.renouvellement ? fmtJour.format(dateDe(c.renouvellement)) : '';
    var demain = e.jour && e.jour > auj ? 'Méditation de demain' + NB + ': ' : '';
    if (d.pause) t = 'Vous les remettez en route dans «' + NB + 'Mon compte' + NB + '», à la ligne «' + NB + 'Méditation du jour' + NB + '».';
    else if (e.jour && e.jour >= auj && e.raison && e.raison !== 'ok' && e.raison !== 'reprise') {
      if (e.raison === 'credits-eleven') t = 'Crédits ElevenLabs épuisés' + (c ? NB + ': il en reste ' + fmtNb.format(c.reste) : '') + '. La méditation paraîtra dans l’heure qui suit l’ajout de crédits' + (dateRen ? ', ou au renouvellement du ' + dateRen : '') + '.';
      else if (e.raison === 'credits-claude') t = 'Crédits de l’API Claude épuisés. La méditation paraîtra dans l’heure qui suit leur recharge, sur platform.claude.com.';
      else if (e.raison === 'cle-eleven') t = e.detail ? 'ElevenLabs refuse la clé réglée dans Netlify.' : 'La clé ElevenLabs n’est pas encore réglée dans Netlify (variable ELEVENLABS_API_KEY).';
      else if (e.raison === 'voix') t = 'La voix «' + NB + 'Victoria' + NB + '» est introuvable dans le compte ElevenLabs.';
      else if (e.raison === 'erreur') t = 'La méditation n’a pas pu se faire' + (e.detail ? NB + ': ' + e.detail : '') + '. Elle se retente chaque heure, trois fois par jour au plus.';
      t = demain + t;
    }
    else if (c && c.parJour < 3000) t = 'Crédits ElevenLabs justes' + NB + ': il en reste ' + fmtNb.format(c.reste) + (dateRen ? ' jusqu’au renouvellement du ' + dateRen : '') + '. Les méditations raccourcissent un peu d’ici là.';
    if (!t) return;
    var n = document.createElement('div');
    n.className = 'med-proprio';
    n.innerHTML = '<span class="med-proprio-l">Visible par vous seul</span><p>' + esc(t) + '</p>';
    z.appendChild(n);
  }
  window.addEventListener('lv-med-proprio', function (ev) {
    var d = ev.detail;
    /* la pause vient d'être changée : la phrase que voient tous suit */
    if (d && d.proprio && (!!d.pause !== !!MED.pause || !!d.reprise !== !!MED.reprise) && !(Z.querySelector('.med-audio') && !Z.querySelector('.med-audio').paused)) { meditation(); return; }
    proprio();
  });

  function branche(z, m) {
    var a = z.querySelector('.med-audio'), b = z.querySelector('.med-jouer'), barre = z.querySelector('.med-barre');
    var ici = z.querySelector('.med-ici'), tout = z.querySelector('.med-tout'), glisse = false;
    function etat() {
      var joue = !a.paused && !a.ended;
      b.innerHTML = (joue ? IC_PAUSE : IC_JOUER) + '<span>' + (joue ? 'Pause' : 'Écouter') + '</span>';
      b.setAttribute('aria-label', joue ? 'Pause' : 'Écouter');
    }
    function remplit() { barre.style.setProperty('--med-p', (barre.max > 0 ? barre.value / barre.max * 100 : 0) + '%'); }
    b.addEventListener('click', function () {
      if (a.paused || a.ended) {
        if ('mediaSession' in navigator && window.MediaMetadata) {
          try { navigator.mediaSession.metadata = new MediaMetadata({ title: m.titre, artist: 'Méditation du jour', album: 'Lumen' }); } catch (_) {}
        }
        a.play().catch(function () {});
      } else a.pause();
    });
    a.addEventListener('play', etat);
    a.addEventListener('pause', etat);
    a.addEventListener('ended', etat);
    a.addEventListener('loadedmetadata', function () {
      if (isFinite(a.duration) && a.duration > 0) { barre.max = Math.round(a.duration); tout.textContent = minutes(a.duration); remplit(); }
    });
    a.addEventListener('timeupdate', function () {
      if (glisse) return;
      barre.value = Math.round(a.currentTime);
      ici.textContent = minutes(a.currentTime);
      remplit();
    });
    barre.addEventListener('input', function () { glisse = true; ici.textContent = minutes(barre.value); remplit(); });
    barre.addEventListener('change', function () {
      glisse = false;
      try { a.currentTime = +barre.value; } catch (_) {}
      if (a.paused && a.preload === 'none') a.preload = 'metadata';
    });
    remplit();
  }

  /* ── la fenêtre des méditations précédentes ── */
  function fenetre() {
    var f = document.querySelector('.med-fen');
    if (f) return f;
    f = document.createElement('div');
    f.className = 'overlay feuille med-fen';
    f.setAttribute('role', 'dialog');
    f.setAttribute('aria-modal', 'true');
    f.setAttribute('aria-labelledby', 'med-fen-t');
    f.innerHTML = '<div class="modal"><h2 class="modal-titre" id="med-fen-t">Les méditations précédentes</h2>'
      + '<button type="button" class="feuille-x" aria-label="Fermer">' + IC_X + '</button>'
      + '<div id="choix-liste" class="med-liste"></div></div>';
    document.body.appendChild(f);
    f.addEventListener('click', function (e) {
      if (e.target === f || (e.target.closest && e.target.closest('.feuille-x'))) { ferme(); return; }
      var r = e.target.closest ? e.target.closest('.choix') : null;
      if (!r) return;
      ferme();
      choisit(r.getAttribute('data-jour'));
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && f.classList.contains('on')) ferme(); });
    return f;
  }
  var fmtCourtJour = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  function ouvre() {
    var f = fenetre(), h = '';
    MED.liste.forEach(function (x) {
      var quand = x.date === MED.aujourdhui ? 'aujourd’hui' : fmtCourtJour.format(dateDe(x.date));
      h += '<div class="med-rang"><button type="button" class="choix' + (x.date === MED.jour ? ' med-ici-l' : '') + '" data-jour="' + esc(x.date) + '">'
        + '<span class="cx-ic">' + IC_JOUER + '</span>'
        + '<span class="med-l">' + esc(x.titre)
        + '<small>' + esc(quand) + (x.duree ? ' · ' + minutes(x.duree) : '') + '</small></span></button>'
        + '<a class="med-dl" href="/api/meditation/' + esc(x.date) + '.mp3?telecharger" download="meditation-' + esc(x.date) + '.mp3" aria-label="Télécharger «' + NB + esc(x.titre) + NB + '»">' + IC_TELE + '</a></div>';
    });
    f.querySelector('.med-liste').innerHTML = h;
    f.classList.add('on');
    document.documentElement.style.overflow = 'hidden';
    var x = f.querySelector('.feuille-x');
    if (x) x.focus();
  }
  function ferme() {
    var f = document.querySelector('.med-fen');
    if (f) f.classList.remove('on');
    document.documentElement.style.overflow = '';
  }
  function choisit(jour) {
    if (!jour || jour === MED.jour) return;
    var z = zoneMed();
    if (!z) return;
    var a = z.querySelector('.med-audio');
    if (a) a.pause();
    z.innerHTML = '<span class="lv-roue petite" role="status" aria-label="Chargement"></span>';
    fetch('/api/meditation/' + jour, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    }).then(montreMed).catch(function () {
      z.innerHTML = '<p class="lit-doux">Cette méditation n’a pas pu être chargée.</p>';
    });
  }
  Z.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.med-lien') : null;
    if (!b) return;
    if (b.classList.contains('med-avant')) ouvre();
  });

  /* ───────── L'affichage ───────── */
  function ligne(mot, val) { return '<div class="lit-ligne"><span class="lit-mot">' + mot + '</span><span class="lit-val">' + val + '</span></div>'; }
  function bloc(titre, corps, id) {
    return '<section class="lit-bloc"><h2 class="lit-titre">' + titre + '</h2><div class="lit-corps' + (id ? ' ' + id : '') + '">' + corps + '</div></section>';
  }

  function affiche() {
    var d = new Date(); d = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    var j = jour(d);
    if (!j) { Z.innerHTML = ''; return; }
    var h = '<div class="lit-tete">';
    h += '<p class="lit-date">' + esc(cap(fmtLong.format(d))) + '</p>';
    h += '<h2 class="lit-fete">' + esc(typo(j.n)) + '</h2>';
    var rg = rangDe(j.n, j.r, 0);
    h += '<p class="lit-meta">' + (rg ? '<span>' + rg + '</span>' : '') + '<span class="lit-m-c">' + pastille(j.c) + COUL[j.c] + '</span><span>' + dansLeTemps(j) + '</span></p>';
    (j.x || []).forEach(function (x) {
      h += '<p class="lit-aussi">' + pastille(x[2]) + '<span class="lit-aussi-r">' + (rangDe(x[0], x[1], x[3]) || 'Aussi') + NB + ':</span> ' + esc(typo(x[0])) + '</p>';
    });
    h += '</div>';

    h += '<section class="lit-bloc"><div class="med-tete"><h2 class="lit-titre">Méditation du jour</h2>'
      + '<button type="button" class="med-lien med-avant" hidden>Les méditations précédentes</button></div>'
      + '<div class="lit-corps lit-medit"></div></section>';
    h += bloc('Lectures de la messe', '', 'lit-lect');
    h += bloc('Aujourd’hui dans l’Église', viePratique(d, j).map(function (t) { return '<p class="lit-pt">' + esc(typo(t)) + '</p>'; }).join(''));
    h += bloc('Prière des heures', heure(j).map(function (x) { return ligne(x[0], x[1]); }).join('') +
      (j.p ? ligne('Psautier', ord(j.p) + ' semaine') : ''), 'lit-heure');
    h += bloc('Année liturgique',
      ligne('Dimanches', 'année ' + esc(j.a)) +
      ligne('Semaine', 'année ' + (j.b === 2 ? 'paire' : 'impaire')) +
      frise(d));
    h += bloc('À venir', aVenir(d).map(function (v) {
      return '<div class="lit-av">' + pastille(v.j.c) + '<span class="lit-av-d">' + esc(fmtCourt.format(v.d)) + '</span><span class="lit-av-n">' + esc(typo(v.j.n)) +
        '</span><span class="lit-av-q">' + (v.n === 1 ? 'demain' : 'dans ' + v.n + NB + 'jours') + '</span></div>';
    }).join(''));
    Z.innerHTML = h;
    Z.setAttribute('data-jour', cle(d));
    lectures(d);
    meditation();
  }

  function demarre() {
    var an = new Date().getFullYear();
    Promise.all([charge(an - 1), charge(an), charge(an + 1)]).then(affiche);
  }
  demarre();
  /* L'heure se tient à jour ; à minuit, tout l'accueil passe au jour
     suivant, sauf pendant qu'une méditation se fait entendre : il attend
     qu'elle s'arrête. */
  setInterval(function () {
    var son = Z.querySelector('.med-audio');
    if (Z.getAttribute('data-jour') !== cle(new Date()) && !(son && !son.paused)) { demarre(); return; }
    var z = Z.querySelector('.lit-heure'), j = jour(new Date());
    if (z && j) {
      var lignes = z.querySelectorAll('.lit-ligne'), hh = heure(j);
      for (var i = 0; i < hh.length && i < lignes.length; i++) lignes[i].querySelector('.lit-val').textContent = hh[i][1];
    }
  }, 60000);
})();

/* ============================================================
   LUMEN — l'accueil : la croix et la vie de l'Église au jour le jour
   Emmanuel a voulu sur l'accueil « tout ce qui rythme la vie de
   l'Église », d'après le calendrier de France.

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
       des couleurs par un mince trait ; les dates alternent sur deux
       hauteurs pour ne pas se chevaucher. Le Triduum, trop court, n'a pas
       la sienne : la légende le nomme. */
    var jm = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }), rang = 0;
    h += '<div class="lit-dates">';
    segs.forEach(function (s) {
      if (s.s === 'TR') return;
      h += '<span class="lit-d' + (rang++ % 2 ? ' lit-d2' : '') + '" style="left:' + (s.i / total * 100) + '%">' + esc(jm.format(plus(b.deb, s.i))) + '</span>';
    });
    h += '</div>';
    var LEGENDE = [['P', 'Avent, Carême'], ['B', 'Noël, Temps pascal'], ['V', 'Temps ordinaire'], ['R', 'Triduum pascal']];
    h += '<ul class="lit-legende">';
    LEGENDE.forEach(function (l) { h += '<li><span class="lit-coul lit-c-' + l[0] + '" aria-hidden="true"></span>' + l[1] + '</li>'; });
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
  }

  function demarre() {
    var an = new Date().getFullYear();
    Promise.all([charge(an - 1), charge(an), charge(an + 1)]).then(affiche);
  }
  demarre();
  /* L'heure se tient à jour ; à minuit, tout l'accueil passe au jour suivant. */
  setInterval(function () {
    if (Z.getAttribute('data-jour') !== cle(new Date())) { demarre(); return; }
    var z = Z.querySelector('.lit-heure'), j = jour(new Date());
    if (z && j) {
      var lignes = z.querySelectorAll('.lit-ligne'), hh = heure(j);
      for (var i = 0; i < hh.length && i < lignes.length; i++) lignes[i].querySelector('.lit-val').textContent = hh[i][1];
    }
  }, 60000);
})();

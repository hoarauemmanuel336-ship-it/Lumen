/* Lumen Veritatis — panneau biblique latéral (traduction Chérubin).
   Onglet discret au bord gauche, panneau coulissant par-dessus la page.

   IL N'Y A PLUS QU'UNE SEULE BIBLE. Ce fichier contenait autrefois sa propre
   lecture : sa mise en page, sa navigation, ses chapitres. C'était une seconde
   Bible, forcément en retard sur la vraie, et il lui manquait tout ce qui fait
   la page : la sélection de versets, le surlignage au verset et au fragment,
   les notes et leurs catégories, la recherche, le compte et la synchronisation,
   la taille de texte, la mise en page de la poésie. Le panneau affiche
   désormais la page « bible.html » elle-même, dans son mode panneau, où seuls
   la barre du site et le pied sont retirés. Tout ce qu'on gagne sur la page,
   on le gagne ici le jour même, sans rien recopier.

   Ce qui reste ici : l'onglet, le tiroir, le champ de référence, les puces
   quand un texte en cite plusieurs, et le petit analyseur de références que
   « Mémoriser » utilise aussi (window.LVBible). */
(function(){
  'use strict';
  if (document.getElementById('bp-tab')) return;
  if (location.pathname === '/bible.html' || location.pathname === '/en/bible.html') return;
  var BP_EN = location.pathname.indexOf('/en/') === 0;
  var BP_DATA = BP_EN ? '/bible-data-en/' : '/bible-data/';
  var BP_PAGE = BP_EN ? '/en/bible.html' : '/bible.html';
  var BP_T = BP_EN ? {
    bible: 'The Holy Bible', ouvrir: 'Open the Bible', page: 'Full page',
    ph: 'Reference: Matthew 7:6-8', aller: 'Go', fermer: 'Close', rech: 'Search', compte: 'Account',
    inconnue: 'Not recognised.', errBible: 'The Bible could not be loaded.'
  } : {
    bible: 'La Sainte Bible', ouvrir: 'Ouvrir la Bible', page: 'Pleine page',
    ph: 'R\u00e9f\u00e9rence : Matthieu 7:6-8', aller: 'Aller', fermer: 'Fermer', rech: 'Rechercher', compte: 'Mon compte',
    inconnue: 'Non reconnue.', errBible: 'La Bible n\u2019a pas pu \u00eatre charg\u00e9e.'
  };

  /* ───────── Styles ───────── */
  var css = ''
  + '#bp-tab{position:fixed;left:0;top:50%;transform:translateY(-50%);z-index:105;writing-mode:vertical-rl;'
  + 'font-size:11px;letter-spacing:.25em;text-transform:uppercase;font-family:inherit;'
  + 'color:var(--pa,rgba(255,255,255,.6));background:#000;border:1px solid var(--filet,rgba(231,224,207,.14));border-left:none;'
  + 'padding:16px 7px;cursor:pointer;user-select:none;transition:color .3s,border-color .35s,box-shadow .4s}'
  + '#bp-tab:hover{color:var(--or-pale,#f8f3e6);border-color:var(--or,#efe6cf);background:var(--surv,rgba(239,230,207,.06))}'
  + '#bp-tab.bp-tab-masque{display:none!important}'
  + '#bp-voile{position:fixed;inset:0;z-index:108;background:rgba(0,0,0,.55);display:none}'
  + '#bp-voile.on{display:block}'
  /* Le tiroir est plus large qu'avant : il porte maintenant la vraie page, avec
     sa barre de sélection et ses menus, qui ont besoin de place pour respirer. */
  + '#bp-pan{position:fixed;left:0;top:0;bottom:0;width:min(640px,100vw);z-index:110;background:#000;'
  + 'border-right:1px solid var(--filet,rgba(231,224,207,.14));display:flex;flex-direction:column;'
  + 'transform:translateX(-103%);transition:transform .35s cubic-bezier(.25,.7,.3,1)}'
  + '#bp-pan.on{transform:none}'
  + '.bp-tete{display:flex;align-items:center;gap:14px;padding:14px 18px;border-bottom:1px solid var(--filet,rgba(231,224,207,.14))}'
  + '.bp-titre{font-size:11px;letter-spacing:.26em;text-transform:uppercase;color:var(--or,#efe6cf)}'
  + '.bp-icone{display:inline-flex;align-items:center;color:var(--pa,rgba(255,255,255,.6));cursor:pointer;padding:2px;transition:color .3s}'
  + '.bp-icone:hover{color:var(--or-pale,#f8f3e6)}'
  + '.bp-icone:first-of-type{margin-left:auto}'
  + '.bp-page{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--pa,rgba(255,255,255,.6));text-decoration:none;transition:color .3s}'
  + '.bp-page:hover{color:var(--or-pale,#f8f3e6)}'
  + '.bp-fermer{font-size:15px;color:var(--pa,rgba(255,255,255,.6));cursor:pointer;padding:2px 6px;transition:color .3s}'
  + '.bp-fermer:hover{color:var(--or-pale,#f8f3e6)}'
  + '.bp-refrow{display:flex;align-items:center;gap:12px;padding:12px 18px;border-bottom:1px solid var(--filet,rgba(231,224,207,.14))}'
  + '.bp-ref{flex:1;min-width:0;background:none;border:none;border-bottom:1px solid rgba(231,224,207,.18);padding:4px 2px;'
  + 'font-size:15px;font-family:inherit;color:var(--parchemin,#ffffff);outline:none;transition:border-color .3s}'
  + '.bp-ref::placeholder{color:var(--parchemin-att,rgba(255,255,255,.45));font-style:italic}'
  + '.bp-ref:focus{border-color:var(--filet-fort,rgba(231,224,207,.3))}'
  + '.bp-aller{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--pa,rgba(255,255,255,.6));cursor:pointer;padding:4px 2px;transition:color .3s}'
  + '.bp-aller:hover{color:var(--or-pale,#f8f3e6)}'
  + '.bp-err{font-size:12px;font-style:italic;color:var(--parchemin-att,rgba(255,255,255,.45))}'
  + '.bp-chips{display:none;flex-wrap:wrap;gap:8px;padding:10px 18px;border-bottom:1px solid var(--filet,rgba(231,224,207,.14))}'
  + '.bp-chips.on{display:flex}'
  + '.bp-chip{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--filet,rgba(231,224,207,.14));padding:4px 10px;font-size:13.5px;color:var(--parchemin,#ffffff);cursor:pointer;transition:border-color .35s,box-shadow .4s}'
  + '.bp-chip:hover{border-color:var(--or,#efe6cf);background:var(--surv,rgba(239,230,207,.06))}'
  + '.bp-chip .bp-x{font-size:12px;color:var(--pa,rgba(255,255,255,.6));transition:color .3s;padding:0 1px}'
  + '.bp-chip .bp-x:hover{color:var(--or-pale,#f8f3e6)}'
  + '.bp-corps{flex:1;position:relative;min-height:0}'
  + '#bp-cadre{position:absolute;inset:0;width:100%;height:100%;border:0;background:#000}'
  + '.bp-charge{text-align:center;font-style:italic;color:var(--parchemin-att,rgba(255,255,255,.45));padding:40px 18px;font-family:var(--serif,Georgia,serif)}'
  + '#bp-pan :focus{outline:none}#bp-tab:focus{outline:none}'
  + '#bp-pan :focus-visible{outline:1px solid rgba(198,164,92,.8);outline-offset:3px}'
  + '#bp-tab:focus,#bp-tab:focus-visible{outline:none}'
  + '#bp-pan .bp-refrow :focus,#bp-pan .bp-refrow :focus-visible{outline:none}'
  + 'span.ref{cursor:pointer}'
  + 'span.ref:hover{text-decoration:underline;text-underline-offset:3px}'
  + '@media print{#bp-tab,#bp-pan,#bp-voile{display:none!important}}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  /* ───────── Structure ───────── */
  var tab = document.createElement('div');
  tab.id = 'bp-tab';
  tab.setAttribute('role', 'button');
  tab.setAttribute('tabindex', '0');
  tab.setAttribute('aria-label', BP_T.ouvrir);
  tab.textContent = 'Bible';
  var voile = document.createElement('div');
  voile.id = 'bp-voile';
  var pan = document.createElement('div');
  pan.id = 'bp-pan';
  pan.innerHTML = ''
    + '<div class="bp-tete">'
    + '  <span class="bp-titre">' + BP_T.bible + '</span>'
    /* La recherche et le compte vivent normalement dans la barre du site, que
       le tiroir retire. On les remet ici : ce ne sont pas des copies, ils
       actionnent les vrais boutons de la page à l'intérieur du cadre. */
    + '  <span class="bp-icone" id="bp-rech" role="button" tabindex="0" aria-label="' + BP_T.rech + '" title="' + BP_T.rech + '">'
    + '    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="10" cy="10" r="6.5"/><line x1="15" y1="15" x2="21" y2="21" stroke-linecap="round"/></svg></span>'
    + '  <span class="bp-icone" id="bp-compte" role="button" tabindex="0" aria-label="' + BP_T.compte + '" title="' + BP_T.compte + '">'
    + '    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="3.4"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0" stroke-linecap="round"/></svg></span>'
    + '  <a class="bp-page" href="' + BP_PAGE + '">' + BP_T.page + '</a>'
    + '  <span class="bp-fermer" id="bp-fermer" role="button" tabindex="0" aria-label="' + BP_T.fermer + '">\u2715</span>'
    + '</div>'
    + '<div class="bp-refrow">'
    + '  <input class="bp-ref" id="bp-ref" type="text" placeholder="' + BP_T.ph + '" autocomplete="off" spellcheck="false">'
    + '  <span class="bp-aller" id="bp-aller" role="button" tabindex="0">' + BP_T.aller + '</span>'
    + '  <span class="bp-err" id="bp-err"></span>'
    + '</div>'
    + '<div class="bp-chips" id="bp-chips"></div>'
    + '<div class="bp-corps" id="bp-corps"></div>';
  document.body.appendChild(tab);
  document.body.appendChild(voile);
  document.body.appendChild(pan);
  /* masquage de l'onglet, réglé depuis « Mon compte », par appareil */
  function obCle(){try{return (window.matchMedia&&(matchMedia('(pointer:coarse)').matches||matchMedia('(max-width:720px)').matches))?'lv_onglet_bible_mobile':'lv_onglet_bible_pc';}catch(e){return 'lv_onglet_bible_pc';}}
  function obApplique(){try{tab.classList.toggle('bp-tab-masque',localStorage.getItem(obCle())==='0');}catch(e){}}
  obApplique();
  window.addEventListener('storage',obApplique);
  window.addEventListener('resize',obApplique);
  var corps = document.getElementById('bp-corps');

  /* ───────── Données ───────── */
  var IDX = null, CACHE = {}, pend = null;
  function charge(u, restant){
    var n = (restant == null) ? 3 : restant;
    return fetch(u).then(function(r){
      if (!r.ok) throw new Error(u);
      return r.json();
    }).catch(function(e){
      if (n <= 1) throw e;
      return new Promise(function(ok){ setTimeout(ok, (4 - n) * 700); })
        .then(function(){ return charge(u, n - 1); });
    });
  }
  function livreData(slug){
    if (CACHE[slug]) return Promise.resolve(CACHE[slug]);
    return charge(BP_DATA + slug + '.json').then(function(d){ CACHE[slug] = d; return d; });
  }
  function infoLivre(slug){
    for (var i = 0; i < IDX.livres.length; i++) if (IDX.livres[i].slug === slug) return IDX.livres[i];
    return null;
  }
  function esc(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  /* ───────── Références ───────── */
  var ALIAS = {
    'genese':['gn','gen'],'exode':['ex','exo'],'levitique':['lv','lev'],'nombres':['nb','nbr','num'],'deuteronome':['dt','deut'],
    'josue':['jos'],'juges':['jg','jug'],'ruth':['rt'],
    '1-samuel':['1s','1sam','1sm'],'2-samuel':['2s','2sam','2sm'],'1-rois':['1r','1roi'],'2-rois':['2r','2roi'],
    '1-chroniques':['1ch','1chr','1par'],'2-chroniques':['2ch','2chr','2par'],'esdras':['esd'],'nehemie':['ne','neh'],
    'tobie':['tb','tob'],'judith':['jdt'],'esther':['est'],'1-maccabees':['1m','1ma','1mac','1macc'],'2-maccabees':['2m','2ma','2mac','2macc'],
    'job':['jb'],'psaumes':['ps','psaume'],'proverbes':['pr','prv','prov'],'ecclesiaste':['qo','eccl','qohelet'],
    'cantique-des-cantiques':['ct','cant','cantique','cantiques'],'sagesse':['sg','sag'],'ecclesiastique':['si','sir','siracide','eccli','ecclesiastique'],
    'isaie':['is','isa','esaie'],'jeremie':['jr','jer'],'lamentations':['lm','lam'],'baruch':['ba','bar'],'ezechiel':['ez','eze'],'daniel':['dn','dan'],
    'osee':['os'],'joel':['jl'],'amos':['am'],'abdias':['ab','abd'],'jonas':['jon'],'michee':['mi','mich'],'nahum':['na','nah'],
    'habacuc':['ha','hab'],'sophonie':['so','soph'],'aggee':['ag','agg'],'zacharie':['za','zac'],'malachie':['ml','mal'],
    'matthieu':['mt','mat','matt'],'marc':['mc'],'luc':['lc'],'jean':['jn'],'actes':['ac','act'],
    'romains':['rm','rom'],'1-corinthiens':['1co','1cor'],'2-corinthiens':['2co','2cor'],'galates':['ga','gal'],
    'ephesiens':['ep','eph'],'philippiens':['ph','phil','php'],'colossiens':['col'],
    '1-thessaloniciens':['1th','1thes','1thess'],'2-thessaloniciens':['2th','2thes','2thess'],
    '1-timothee':['1tm','1tim'],'2-timothee':['2tm','2tim'],'tite':['tt','tit'],'philemon':['phm','phlm'],'hebreux':['he','heb'],
    'jacques':['jc','jac'],'1-pierre':['1p','1pi'],'2-pierre':['2p','2pi'],'1-jean':['1jn'],'2-jean':['2jn'],'3-jean':['3jn'],
    'jude':['jud'],'apocalypse':['ap','apc','apoc']
  };
  /* noms alternatifs selon les traditions et noms anglais, additifs */
  (function(){
    var X = {
      'josue':['joshua','josh'],'juges':['judg','jdg'],
      '1-samuel':['1samuel'],'2-samuel':['2samuel'],
      '1-rois':['3rois','3r','3kings'],'2-rois':['4rois','4r','4kings'],
      '1-chroniques':['1chronicles','1chron','1paralipomenes'],'2-chroniques':['2chronicles','2chron','2paralipomenes'],
      'esdras':['ezra','1esdras'],'nehemie':['nehemiah','nehemias','2esdras','neemie'],'tobie':['tobit'],
      'psaumes':['psalm','pss'],
      'ecclesiaste':['qoheleth','coheleth','eccles'],
      'cantique-des-cantiques':['songofsongs','songofsolomon','canticles','canticleofcanticles'],
      'ecclesiastique':['sirach','bensira','sirac','ecclus'],
      'sagesse':['wisdom','wis','sagessedesalomon','wisdomofsolomon'],
      'isaie':['isaiah'],'jeremie':['jeremiah'],
      'lamentations':['threnes','lamentationsdejeremie'],
      'ezechiel':['ezekiel','ezek'],
      'osee':['hosea','hos'],'abdias':['obadiah','obad'],'jonas':['jonah'],'michee':['micah','mic'],
      'habacuc':['habakkuk'],'sophonie':['zephaniah','zeph'],'aggee':['haggai','hag'],
      'zacharie':['zechariah','zech'],'malachie':['malachi'],
      '1-maccabees':['1maccabees'],'2-maccabees':['2maccabees'],
      'matthieu':['matthew'],'marc':['mk'],'luc':['lk'],'actes':['actsoftheapostles','actesdesapotres'],
      '1-thessaloniciens':['1thessalonians'],'2-thessaloniciens':['2thessalonians'],
      '1-timothee':['1timothy'],'2-timothee':['2timothy'],
      'jacques':['jas'],'1-pierre':['1peter','1pet'],'2-pierre':['2peter','2pet'],
      '1-jean':['1john'],'2-jean':['2john'],'3-jean':['3john'],
      'apocalypse':['revelation','rev','revelations','apocalypsedejean']
    };
    Object.keys(X).forEach(function(k){ ALIAS[k] = (ALIAS[k] || []).concat(X[k]); });
  })();
  var DICO = null;
  function norm(s){
    return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '');
  }
  function construitDico(){
    DICO = {};
    IDX.livres.forEach(function(l){
      DICO[norm(l.nom)] = l.slug;
      DICO[norm(l.slug)] = l.slug;
      (ALIAS[l.slug] || []).forEach(function(a){ DICO[norm(a)] = l.slug; });
    });
  }
  function trouveLivre(token){
    if (!DICO || !IDX) return null;      // l'index n'est pas encore là : on ne devine pas
    var t = norm(token);
    if (!t) return null;
    if (DICO[t]) return DICO[t];
    var arts = ['les','le','la','l','the'];
    for (var ai = 0; ai < arts.length; ai++) {
      if (t.indexOf(arts[ai]) === 0) {
        var t2 = t.slice(arts[ai].length);
        if (t2.length >= 2 && DICO[t2]) return DICO[t2];
      }
    }
    var cands = [];
    IDX.livres.forEach(function(l){ if (norm(l.nom).indexOf(t) === 0) cands.push(l.slug); });
    return (cands.length === 1 && t.length >= 2) ? cands[0] : null;
  }
  function parseRef(txt){
    var s = String(txt || '').trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
    if (!s) return null;
    var m = s.match(/^([1-4]?\s*[a-z']+(?:[ -][a-z']+)*)(?:\s+(\d{1,3})(?:\s*[:,.]\s*(\d{1,3})(?:\s*[-\u2013a]\s*(\d{1,3}))?)?)?$/);
    if (!m) return null;
    var slug = trouveLivre(m[1]);
    if (!slug) return null;
    var inf = infoLivre(slug);
    var ch = m[2] ? parseInt(m[2], 10) : 0;
    var v1 = m[3] ? parseInt(m[3], 10) : 0;
    var v2 = m[4] ? parseInt(m[4], 10) : v1;
    if (ch && inf.nch === 1 && !v1) { v1 = ch; v2 = ch; ch = 1; }
    /* les références des articles portent la numérotation catholique moderne ;
       la bible EN du site (Douay) a la sienne : conversion vers le fichier */
    if (ch && BP_EN && window.LV_VERSIF && window.LV_VERSIF.douay) {
      var cv1 = window.LV_VERSIF.douay(inf.nom, ch, v1 || 1);
      var cv2 = v2 ? window.LV_VERSIF.douay(inf.nom, ch, v2) : cv1;
      ch = cv1.ch;
      if (v1) { v1 = cv1.v; v2 = cv2.v; }
    }
    if (ch && ch > inf.nch) return null;
    if (v2 < v1) { var t2 = v1; v1 = v2; v2 = t2; }
    return { slug: slug, ch: ch, v1: v1, v2: v2 };
  }

  /* ───────── La page Bible elle-même, dans le tiroir ─────────
     Un seul cadre, créé au premier ouvrage et jamais détruit : la page garde
     ainsi sa position, ses notes ouvertes et son compte connecté d'une
     ouverture à l'autre. Même origine, donc on lui parle simplement en
     changeant son adresse interne, comme on cliquerait un lien. */
  var cadre = null;
  function sauveCoin(h){ try { localStorage.setItem('lv_bp_coin', h || ''); } catch(_){} }
  function litCoin(){ try { return localStorage.getItem('lv_bp_coin') || ''; } catch(_){ return ''; } }

  function faitCadre(depart){
    if (cadre) return cadre;
    cadre = document.createElement('iframe');
    cadre.id = 'bp-cadre';
    cadre.setAttribute('title', BP_T.bible);
    cadre.src = BP_PAGE + '?p=1' + (depart || '');
    corps.appendChild(cadre);
    cadre.addEventListener('load', function(){
      /* on retient la dernière position lue, pour rouvrir là où on s'était
         arrêté, exactement comme le faisait l'ancien panneau */
      try {
        cadre.contentWindow.addEventListener('hashchange', function(){
          sauveCoin(cadre.contentWindow.location.hash || '');
        });
        sauveCoin(cadre.contentWindow.location.hash || '');
      } catch(_){}
    });
    return cadre;
  }
  /* Poser une adresse dans le cadre. Tant qu'il n'existe pas, on le crée
     directement au bon endroit : une seule charge, pas deux. */
  function va(hash){
    if (!cadre) { faitCadre(hash || ''); return; }
    try {
      if (cadre.contentWindow.location.hash === hash) cadre.contentWindow.location.reload();
      else cadre.contentWindow.location.hash = hash;
    } catch(_){ cadre.src = BP_PAGE + '?p=1' + hash; }
    sauveCoin(hash);
  }
  function hashDe(r){
    if (!r) return '';
    return '#' + r.slug + (r.ch ? '/' + r.ch + (r.v1 ? '/' + r.v1 : '') : '');
  }

  /* ───────── Puces, quand un texte cite plusieurs références ───────── */
  function decoupeRefs(txt){
    return String(txt || '').split(/\s*;\s*|,(?=\s*[1-4]?\s*[a-zA-Z\u00c0-\u024f])/)
      .map(function(x){ return x.trim(); }).filter(Boolean);
  }
  function etiquetteRef(r){
    var inf = infoLivre(r.slug);
    var t = inf ? inf.nom : r.slug;
    if (r.slug === 'psaumes' && r.ch) t = (BP_EN ? 'Psalm' : 'Psaume');
    if (r.ch) t += ' ' + r.ch;
    if (r.v1) { t += ':' + r.v1; if (r.v2 > r.v1) t += '-' + r.v2; }
    return t;
  }
  var MULTI = [];
  function majChips(){
    var z = document.getElementById('bp-chips');
    if (!z) return;
    if (!MULTI.length) { z.classList.remove('on'); z.innerHTML = ''; return; }
    var h = '';
    MULTI.forEach(function(r, i){
      h += '<span class="bp-chip" data-bi="' + i + '">' + esc(etiquetteRef(r)) + '<span class="bp-x" data-bx="' + i + '">\u2715</span></span>';
    });
    z.innerHTML = h;
    z.classList.add('on');
  }
  document.addEventListener('click', function(e){
    var x = e.target.closest ? e.target.closest('#bp-chips .bp-x') : null;
    if (x) { MULTI.splice(parseInt(x.getAttribute('data-bx'), 10), 1); majChips(); return; }
    var c = e.target.closest ? e.target.closest('#bp-chips .bp-chip') : null;
    if (c) va(hashDe(MULTI[parseInt(c.getAttribute('data-bi'), 10)]));
  });

  /* ───────── Champ de référence ───────── */
  /* Le champ de référence a besoin du dictionnaire des noms de livres. Sans
     cette attente, taper une référence avant que l'index ne soit là faisait
     lire un dictionnaire encore vide, et la page tombait en erreur. */
  function vaRef(){ assureIdx().then(vaRefVrai).catch(function(){
    document.getElementById('bp-err').textContent = BP_T.errBible;
  }); }
  function vaRefVrai(){
    var champ = document.getElementById('bp-ref');
    var err = document.getElementById('bp-err');
    var morceaux = decoupeRefs(champ.value);
    var refs = [];
    for (var i = 0; i < morceaux.length; i++) { var p = parseRef(morceaux[i]); if (p) refs.push(p); }
    if (!refs.length) { err.textContent = champ.value.trim() ? BP_T.inconnue : ''; return; }
    err.textContent = '';
    champ.value = '';
    if (refs.length > 1) {
      refs.forEach(function(r){
        var deja = MULTI.some(function(m){ return m.slug === r.slug && m.ch === r.ch && m.v1 === r.v1 && m.v2 === r.v2; });
        if (!deja) MULTI.push(r);
      });
      majChips();
    }
    va(hashDe(refs[0]));
  }
  /* Actionner un bouton de la page, à l'intérieur du cadre. Rien n'est
     reconstruit : c'est le bouton d'origine qui reçoit le clic, donc la
     recherche et le compte sont exactement ceux de la page Bible. */
  function dansCadre(id){
    if (!cadre) { faitCadre(litCoin()); }
    var essais = 0;
    (function tente(){
      try {
        var el = cadre.contentDocument && cadre.contentDocument.getElementById(id);
        if (el) { el.click(); return; }
      } catch(_){}
      if (essais++ < 40) setTimeout(tente, 120);
    })();
  }
  function icone(id, cible){
    var el = document.getElementById(id);
    el.addEventListener('click', function(){ dansCadre(cible); });
    el.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); dansCadre(cible); }
    });
  }
  icone('bp-rech', 'rech-ouvrir');
  icone('bp-compte', 'auth-ouvrir');
  document.getElementById('bp-aller').addEventListener('click', vaRef);
  document.getElementById('bp-ref').addEventListener('keydown', function(e){
    if (e.key === 'Enter') vaRef();
  });

  /* ───────── Ouverture / fermeture ───────── */
  function assureIdx(){
    if (IDX) return Promise.resolve();
    return charge(BP_DATA + 'index.json').then(function(d){
      IDX = d;
      construitDico();
    });
  }
  function montre(){ voile.classList.add('on'); pan.classList.add('on'); }
  function ouvre(){
    montre();
    faitCadre(litCoin());
    assureIdx().catch(function(){});     // pour le champ de référence
  }
  function ferme(){
    voile.classList.remove('on');
    pan.classList.remove('on');
  }
  function ouvreSurRef(txt){
    var propre = String(txt || '').replace(/\u00a0/g, ' ').trim();
    montre();
    assureIdx().then(function(){
      var refs = decoupeRefs(propre).map(parseRef).filter(Boolean);
      if (!refs.length) { faitCadre(litCoin()); return; }
      if (refs.length > 1) {
        refs.forEach(function(r){
          var deja = MULTI.some(function(m){ return m.slug === r.slug && m.ch === r.ch && m.v1 === r.v1 && m.v2 === r.v2; });
          if (!deja) MULTI.push(r);
        });
        majChips();
      }
      va(hashDe(refs[0]));
    }).catch(function(){
      if (!cadre) corps.innerHTML = '<div class="bp-charge">' + BP_T.errBible + '</div>';
    });
  }
  document.addEventListener('click', function(e){
    var ref = e.target.closest ? e.target.closest('span.ref') : null;
    if (!ref || pan.contains(ref)) return;
    ouvreSurRef(ref.textContent);
  });
  document.addEventListener('keydown', function(e){
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var ref = e.target.closest ? e.target.closest('span.ref') : null;
    if (!ref || pan.contains(ref)) return;
    e.preventDefault();
    ouvreSurRef(ref.textContent);
  });
  tab.addEventListener('click', function(){
    if (pan.classList.contains('on')) ferme(); else ouvre();
  });
  tab.addEventListener('keydown', function(e){
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tab.click(); }
  });
  document.getElementById('bp-fermer').addEventListener('click', ferme);
  voile.addEventListener('click', ferme);
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && pan.classList.contains('on')) ferme();
  });

  /* ───────── Petite porte ouverte sur la Bible ─────────
     « Mémoriser » a besoin de lire les livres et d'analyser une référence.
     Plutôt qu'une troisième copie de parseRef et des alias, le panneau
     expose ce qu'il sait déjà faire. */
  window.LVBible = {
    pret: assureIdx,
    index: function(){ return IDX; },
    livre: livreData,
    info: infoLivre,
    ref: parseRef,
    refs: decoupeRefs,
    etiquette: etiquetteRef,
    ouvreSurRef: ouvreSurRef
  };
})();

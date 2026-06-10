/* Lumen Veritatis — panneau biblique latéral (Crampon 1923).
   Module autonome : onglet discret au bord gauche, panneau coulissant
   par-dessus la page, lecture sans quitter la page. */
(function(){
  'use strict';
  if (document.getElementById('bp-tab')) return;
  if (location.pathname === '/bible.html') return;

  /* ───────── Styles ───────── */
  var css = ''
  + '#bp-tab{position:fixed;left:0;top:50%;transform:translateY(-50%);z-index:105;writing-mode:vertical-rl;'
  + 'font-size:11px;letter-spacing:.25em;text-transform:uppercase;font-family:inherit;'
  + 'color:var(--pa,rgba(242,236,221,.62));background:#000;border:1px solid var(--filet,rgba(241,228,194,.5));border-left:none;'
  + 'padding:16px 7px;cursor:pointer;user-select:none;transition:color .3s,border-color .35s,box-shadow .4s}'
  + '#bp-tab:hover{color:var(--or-pale,#faf4e3);border-color:var(--filet-fort,rgba(241,228,194,.92));box-shadow:0 0 22px rgba(241,228,194,.1)}'
  + '#bp-voile{position:fixed;inset:0;z-index:108;background:rgba(0,0,0,.55);display:none}'
  + '#bp-voile.on{display:block}'
  + '#bp-pan{position:fixed;left:0;top:0;bottom:0;width:min(520px,100vw);z-index:110;background:#000;'
  + 'border-right:1px solid var(--filet,rgba(241,228,194,.5));display:flex;flex-direction:column;'
  + 'transform:translateX(-103%);transition:transform .35s cubic-bezier(.25,.7,.3,1)}'
  + '#bp-pan.on{transform:none}'
  + '.bp-tete{display:flex;align-items:center;gap:14px;padding:14px 18px;border-bottom:1px solid var(--filet,rgba(241,228,194,.5))}'
  + '.bp-titre{font-size:11px;letter-spacing:.26em;text-transform:uppercase;color:var(--or,#efe3c0)}'
  + '.bp-page{margin-left:auto;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--pa,rgba(242,236,221,.62));text-decoration:none;transition:color .3s}'
  + '.bp-page:hover{color:var(--or-pale,#faf4e3)}'
  + '.bp-fermer{font-size:15px;color:var(--pa,rgba(242,236,221,.62));cursor:pointer;padding:2px 6px;transition:color .3s}'
  + '.bp-fermer:hover{color:var(--or-pale,#faf4e3)}'
  + '.bp-refrow{display:flex;align-items:center;gap:12px;padding:12px 18px;border-bottom:1px solid var(--filet,rgba(241,228,194,.5))}'
  + '.bp-ref{flex:1;min-width:0;background:none;border:none;border-bottom:1px solid rgba(241,228,194,.3);padding:4px 2px;'
  + 'font-size:15px;font-family:inherit;color:var(--parchemin,#f2ecdd);outline:none;transition:border-color .3s}'
  + '.bp-ref::placeholder{color:var(--parchemin-att,#a39b87);font-style:italic}'
  + '.bp-ref:focus{border-color:var(--filet-fort,rgba(241,228,194,.92))}'
  + '.bp-aller{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--pa,rgba(242,236,221,.62));cursor:pointer;padding:4px 2px;transition:color .3s}'
  + '.bp-aller:hover{color:var(--or-pale,#faf4e3)}'
  + '.bp-err{font-size:12px;font-style:italic;color:var(--parchemin-att,#a39b87)}'
  + '.bp-corps{flex:1;overflow-y:auto;padding:18px 18px 34px;font-family:var(--serif,Georgia,serif);'
  + 'scrollbar-color:rgba(241,228,194,.55) #000}'
  + '.bp-corps::-webkit-scrollbar{width:8px}'
  + '.bp-corps::-webkit-scrollbar-track{background:#000}'
  + '.bp-corps::-webkit-scrollbar-thumb{background:rgba(241,228,194,.55)}'
  + '.bp-corps::-webkit-scrollbar-thumb:hover{background:rgba(241,228,194,.8)}'
  + '.bp-test{font-size:10.5px;letter-spacing:.28em;text-transform:uppercase;color:var(--or,#efe3c0);text-align:center;margin:26px 0 2px}'
  + '.bp-test:first-child{margin-top:4px}'
  + '.bp-grp{font-family:var(--display,serif);font-style:italic;font-size:19px;color:var(--pa,rgba(242,236,221,.62));text-align:center;margin:18px 0 10px}'
  + '.bp-livres{display:grid;grid-template-columns:1fr 1fr;gap:0 22px}'
  + '@media(max-width:430px){.bp-livres{grid-template-columns:1fr}}'
  + '.bp-livre{display:flex;justify-content:space-between;align-items:baseline;gap:8px;padding:7px 2px;'
  + 'border-bottom:1px solid rgba(241,228,194,.16);cursor:pointer;font-size:15.5px;color:var(--parchemin,#f2ecdd);transition:border-color .3s}'
  + '.bp-livre .n2{font-size:11px;color:var(--parchemin-att,#a39b87);white-space:nowrap}'
  + '.bp-livre:hover{border-color:var(--filet-fort,rgba(241,228,194,.92))}'
  + '.bp-livre:hover .n1{color:var(--or-pale,#faf4e3)}'
  + '.bp-fil{font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--parchemin-att,#a39b87);text-align:center;margin:2px 0 12px}'
  + '.bp-fil span{color:var(--pa,rgba(242,236,221,.62));cursor:pointer;transition:color .3s}'
  + '.bp-fil span:hover{color:var(--or-pale,#faf4e3)}'
  + '.bp-livre-titre{font-family:var(--display,serif);font-weight:400;font-size:26px;color:var(--parchemin,#f2ecdd);text-align:center;margin:0 0 14px}'
  + '.bp-chaps{display:grid;grid-template-columns:repeat(auto-fill,minmax(44px,1fr));gap:8px}'
  + '.bp-chap{display:flex;align-items:center;justify-content:center;height:40px;border:1px solid var(--filet,rgba(241,228,194,.5));'
  + 'font-size:14px;color:var(--pa,rgba(242,236,221,.62));cursor:pointer;transition:border-color .35s,color .3s,box-shadow .4s}'
  + '.bp-chap:hover{border-color:var(--filet-fort,rgba(241,228,194,.92));color:var(--or-pale,#faf4e3);box-shadow:0 0 16px rgba(241,228,194,.08)}'
  + '.bp-ch-titre{font-family:var(--display,serif);font-weight:400;font-size:24px;color:var(--parchemin,#f2ecdd);text-align:center;margin:0}'
  + '.bp-vulg{font-size:12px;font-style:italic;color:var(--parchemin-att,#a39b87);text-align:center;margin-top:4px}'
  + '.bp-section{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--or,#efe3c0);text-align:center;margin-top:14px}'
  + '.bp-ps-titre{font-style:italic;font-size:15.5px;color:var(--pa,rgba(242,236,221,.62));text-align:center;margin-top:14px}'
  + '.bp-sep{width:38px;height:1px;background:linear-gradient(90deg,transparent,var(--filet-f,rgba(241,228,194,.7)),transparent);margin:18px auto 20px}'
  + '.bp-texte{text-align:justify;hyphens:auto;font-size:17px;line-height:1.72;color:var(--parchemin,#f2ecdd)}'
  + '.bp-texte sup{font-size:11px;color:var(--or,#efe3c0);line-height:0;margin-right:4px}'
  + '.bp-v{scroll-margin-top:30px}'
  + '.bp-v.cible{background:rgba(241,228,194,.1);box-shadow:0 0 0 4px rgba(241,228,194,.1)}'
  + '.bp-nav{display:flex;justify-content:space-between;gap:10px;margin-top:26px;padding-top:16px;border-top:1px solid rgba(241,228,194,.25)}'
  + '.bp-nav span{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--pa,rgba(242,236,221,.62));cursor:pointer;transition:color .3s}'
  + '.bp-nav span:hover{color:var(--or-pale,#faf4e3)}'
  + '.bp-nav .vide{visibility:hidden}'
  + '.bp-charge{text-align:center;font-style:italic;color:var(--parchemin-att,#a39b87);padding:40px 0}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  /* ───────── Structure ───────── */
  var tab = document.createElement('div');
  tab.id = 'bp-tab';
  tab.setAttribute('role', 'button');
  tab.setAttribute('tabindex', '0');
  tab.setAttribute('aria-label', 'Ouvrir la Bible');
  tab.textContent = 'Bible';
  var voile = document.createElement('div');
  voile.id = 'bp-voile';
  var pan = document.createElement('div');
  pan.id = 'bp-pan';
  pan.innerHTML = ''
    + '<div class="bp-tete">'
    + '  <span class="bp-titre">La Sainte Bible</span>'
    + '  <a class="bp-page" href="/bible.html">Ouvrir la page</a>'
    + '  <span class="bp-fermer" id="bp-fermer" role="button" tabindex="0" aria-label="Fermer">\u2715</span>'
    + '</div>'
    + '<div class="bp-refrow">'
    + '  <input class="bp-ref" id="bp-ref" type="text" placeholder="R\u00e9f\u00e9rence : Matthieu 7:6-8" autocomplete="off" spellcheck="false">'
    + '  <span class="bp-aller" id="bp-aller" role="button" tabindex="0">Aller</span>'
    + '  <span class="bp-err" id="bp-err"></span>'
    + '</div>'
    + '<div class="bp-corps" id="bp-corps"><div class="bp-charge">Chargement\u2026</div></div>';
  document.body.appendChild(tab);
  document.body.appendChild(voile);
  document.body.appendChild(pan);
  var corps = document.getElementById('bp-corps');

  /* ───────── Données ───────── */
  var IDX = null, CACHE = {}, pend = null;
  function charge(u){
    return fetch(u).then(function(r){ if (!r.ok) throw new Error(u); return r.json(); });
  }
  function livreData(slug){
    if (CACHE[slug]) return Promise.resolve(CACHE[slug]);
    return charge('/bible-data/' + slug + '.json').then(function(d){ CACHE[slug] = d; return d; });
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
    'cantique-des-cantiques':['ct','cant','cantique','cantiques'],'sagesse':['sg','sag'],'ecclesiastique':['si','sir','siracide','eccli'],
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
    var t = norm(token);
    if (!t) return null;
    if (DICO[t]) return DICO[t];
    var cands = [];
    IDX.livres.forEach(function(l){ if (norm(l.nom).indexOf(t) === 0) cands.push(l.slug); });
    return (cands.length === 1 && t.length >= 2) ? cands[0] : null;
  }
  function parseRef(txt){
    var s = String(txt || '').trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
    if (!s) return null;
    var m = s.match(/^([1-3]?\s*[a-z']+(?:[ -][a-z']+)*)(?:\s+(\d{1,3})(?:\s*[:,.]\s*(\d{1,3})(?:\s*[-\u2013a]\s*(\d{1,3}))?)?)?$/);
    if (!m) return null;
    var slug = trouveLivre(m[1]);
    if (!slug) return null;
    var inf = infoLivre(slug);
    var ch = m[2] ? parseInt(m[2], 10) : 0;
    var v1 = m[3] ? parseInt(m[3], 10) : 0;
    var v2 = m[4] ? parseInt(m[4], 10) : v1;
    if (ch && inf.nch === 1 && !v1) { v1 = ch; v2 = ch; ch = 1; }
    if (ch && ch > inf.nch) return null;
    if (v2 < v1) { var t2 = v1; v1 = v2; v2 = t2; }
    return { slug: slug, ch: ch, v1: v1, v2: v2 };
  }

  /* ───────── État (dernière position retenue) ───────── */
  function sauveEtat(e){ try { localStorage.setItem('lv_bp_etat', JSON.stringify(e)); } catch(_){} }
  function litEtat(){
    try { return JSON.parse(localStorage.getItem('lv_bp_etat') || 'null'); } catch(_){ return null; }
  }

  /* ───────── Vues ───────── */
  function rendLivres(){
    sauveEtat({ v: 'livres' });
    var h = '', tc = '';
    IDX.groupes.forEach(function(g){
      if (g.test !== tc) {
        tc = g.test;
        h += '<div class="bp-test">' + (g.test === 'AT' ? 'Ancien Testament' : 'Nouveau Testament') + '</div>';
      }
      h += '<div class="bp-grp">' + esc(g.nom) + '</div><div class="bp-livres">';
      IDX.livres.forEach(function(l){
        if (l.groupe !== g.nom) return;
        h += '<div class="bp-livre" data-bp="livre" data-slug="' + l.slug + '">'
           + '<span class="n1">' + esc(l.nom) + '</span><span class="n2">' + l.nch + '</span></div>';
      });
      h += '</div>';
    });
    corps.innerHTML = h;
    corps.scrollTop = 0;
  }
  function rendChaps(slug){
    var inf = infoLivre(slug);
    if (!inf) return rendLivres();
    if (inf.nch === 1) return rendLect(slug, 1, 0);
    sauveEtat({ v: 'chap', slug: slug });
    var h = '<div class="bp-fil"><span data-bp="livres">La Sainte Bible</span></div>'
          + '<div class="bp-livre-titre">' + esc(inf.nom) + '</div><div class="bp-chaps">';
    for (var i = 1; i <= inf.nch; i++) h += '<div class="bp-chap" data-bp="chap" data-slug="' + slug + '" data-n="' + i + '">' + i + '</div>';
    h += '</div>';
    corps.innerHTML = h;
    corps.scrollTop = 0;
  }
  function rendLect(slug, n, vCible){
    var inf = infoLivre(slug);
    if (!inf) return rendLivres();
    sauveEtat({ v: 'lect', slug: slug, n: n });
    corps.innerHTML = '<div class="bp-charge">Chargement\u2026</div>';
    livreData(slug).then(function(d){
      var ch = null;
      for (var i = 0; i < d.chapitres.length; i++) if (d.chapitres[i].n === n) { ch = d.chapitres[i]; break; }
      if (!ch) return rendChaps(slug);
      var ps = (slug === 'psaumes');
      var nomCh = ps ? 'Psaume ' + n : esc(inf.nom) + (inf.nch > 1 ? ' ' + n : '');
      var h = '<div class="bp-fil"><span data-bp="livres">La Sainte Bible</span> \u00b7 '
            + '<span data-bp="livre" data-slug="' + slug + '">' + esc(inf.nom) + '</span></div>'
            + '<div class="bp-ch-titre">' + nomCh + '</div>';
      if (ch.vulg) h += '<div class="bp-vulg">Vulgate : ' + esc(ch.vulg) + '</div>';
      if (ch.titre) h += ps ? '<div class="bp-ps-titre">' + esc(ch.titre) + '</div>'
                            : '<div class="bp-section">' + esc(ch.titre) + '</div>';
      h += '<div class="bp-sep"></div><div class="bp-texte">';
      ch.versets.forEach(function(v){
        h += '<span class="bp-v" data-v="' + v.v + '"><sup>' + v.v + '</sup>' + esc(v.t) + '</span> ';
      });
      h += '</div><div class="bp-nav">';
      h += (n > 1) ? '<span data-bp="chap" data-slug="' + slug + '" data-n="' + (n - 1) + '">\u2190 ' + (ps ? 'Ps ' + (n - 1) : 'Ch. ' + (n - 1)) + '</span>' : '<span class="vide">\u00b7</span>';
      h += '<span data-bp="livre" data-slug="' + slug + '">' + (inf.nch > 1 ? 'Chapitres' : esc(inf.nom)) + '</span>';
      h += (n < inf.nch) ? '<span data-bp="chap" data-slug="' + slug + '" data-n="' + (n + 1) + '">' + (ps ? 'Ps ' + (n + 1) : 'Ch. ' + (n + 1)) + ' \u2192</span>' : '<span class="vide">\u00b7</span>';
      h += '</div>';
      corps.innerHTML = h;
      corps.scrollTop = 0;
      var aSurligner = (pend && pend.slug === slug && pend.ch === n) ? pend : (vCible ? { v1: vCible, v2: vCible } : null);
      pend = null;
      if (aSurligner && aSurligner.v1) {
        var premier = null;
        corps.querySelectorAll('.bp-v').forEach(function(sp){
          var v = parseInt(sp.dataset.v, 10);
          if (v >= aSurligner.v1 && v <= aSurligner.v2) {
            sp.classList.add('cible');
            if (!premier) premier = sp;
          }
        });
        if (premier) premier.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }).catch(function(){
      corps.innerHTML = '<div class="bp-charge">Le texte n\u2019a pas pu \u00eatre charg\u00e9.</div>';
    });
  }

  corps.addEventListener('click', function(e){
    var el = e.target.closest('[data-bp]');
    if (!el) return;
    var a = el.dataset.bp;
    if (a === 'livres') rendLivres();
    else if (a === 'livre') rendChaps(el.dataset.slug);
    else if (a === 'chap') rendLect(el.dataset.slug, parseInt(el.dataset.n, 10), 0);
  });

  /* ───────── Champ de référence ───────── */
  function vaRef(){
    var champ = document.getElementById('bp-ref');
    var err = document.getElementById('bp-err');
    var r = parseRef(champ.value);
    if (!r) { err.textContent = champ.value.trim() ? 'Non reconnue.' : ''; return; }
    err.textContent = '';
    champ.value = '';
    if (!r.ch) { rendChaps(r.slug); return; }
    if (r.v1) pend = r;
    rendLect(r.slug, r.ch, 0);
  }
  document.getElementById('bp-aller').addEventListener('click', vaRef);
  document.getElementById('bp-ref').addEventListener('keydown', function(e){
    if (e.key === 'Enter') vaRef();
  });

  /* ───────── Ouverture / fermeture ───────── */
  function assureIdx(){
    if (IDX) return Promise.resolve();
    return charge('/bible-data/index.json').then(function(d){
      IDX = d;
      construitDico();
    });
  }
  function restaure(){
    var e = litEtat();
    if (e && e.v === 'lect' && infoLivre(e.slug)) rendLect(e.slug, e.n, 0);
    else if (e && e.v === 'chap' && infoLivre(e.slug)) rendChaps(e.slug);
    else rendLivres();
  }
  var dejaRendu = false;
  function ouvre(){
    voile.classList.add('on');
    pan.classList.add('on');
    assureIdx().then(function(){
      if (!dejaRendu) { restaure(); dejaRendu = true; }
    }).catch(function(){
      corps.innerHTML = '<div class="bp-charge">La Bible n\u2019a pas pu \u00eatre charg\u00e9e.</div>';
    });
  }
  function ferme(){
    voile.classList.remove('on');
    pan.classList.remove('on');
  }
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
})();

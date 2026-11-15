/* ══════════════════════════════════════════════════════════════════════
   MOTEUR DES PARCOURS D'ÉTUDE : SCRIPT
   0. Copie de la source du fichier, avant toute construction.
   1. Construction : lit le contenu (<template id="contenu">) et bâtit la page.
   2. Comportement : thèmes, explications, états des sujets, copie, taille.
   3. Progression : bloc lv-progression, stockage local (clé 'parcours-etude:'
      + sujet), page hôte (lvEtat, lvEtatVoulu, lvProgression), enregistrement.
   ══════════════════════════════════════════════════════════════════════ */
(function(){
'use strict';
/* ══ 0. COPIE DE LA SOURCE : le fichier tel qu'il a été livré ══ */
var COPIE='<!DOCTYPE html>\n'+document.documentElement.outerHTML;

var D=document,R=D.documentElement,W=D.getElementById('w');
var RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
var E_IN='cubic-bezier(.2,.7,.3,1)',E_OUT='cubic-bezier(.4,0,1,1)';
var CRANS=[.9,1,1.1,1.2,1.3],Z0=1.3;
/* teintes vives rangées du froid vers le chaud */
var PAL=['#8f6bff','#3d8bff','#1fc8e8','#22e0a0','#b8e62e','#ffc21f','#ff8a2a','#ff4567'];
var ETATS=['a-faire','en-cours','termine','a-revoir'];
var LIB={'a-faire':'À faire','en-cours':'En cours','termine':'Terminé','a-revoir':'À revoir'};
var CADRE=(function(){try{return parent!==window}catch(e){return true}})();
function ms(n){return RM?0.01:n}

/* ══ Typographie française (texte copié) ══ */
function typo(t){
  return t.replace(/'/g,'’')
    .replace(/[   ]*([;!?])/g,' $1')
    .replace(/(\S)[   ]*:(?=\s|$)/g,'$1 :')
    .replace(/«[   ]*/g,'« ').replace(/[   ]*»/g,' »')}

/* ══ 1. CONSTRUCTION ══ */
var SRC=D.getElementById('contenu').content.querySelector('parcours');
function el(tag,cls,html){var e=D.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e}
function kids(s,nom){return [].filter.call(s.children,function(c){return c.localName===nom})}
function txt(h){var t=el('div',null,h||'');return t.textContent.replace(/\s+/g,' ').trim()}
function slug(s){return (s||'parcours').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)||'parcours'}
function rgb(h){h=(h||'').trim().replace('#','');if(h.length===3)h=h.replace(/(.)/g,'$1$1');
  var n=parseInt(h,16);if(isNaN(n)||h.length!==6)return '255 255 255';return [(n>>16)&255,(n>>8)&255,n&255].join(' ')}
function teinte(e,c){e.style.setProperty('--a',c);e.style.setProperty('--r',rgb(c))}
function deux(n){return (n<10?'0':'')+n}
function bouton(cls,lib){var b=el('button',cls,lib);b.type='button';return b}
/* panneau d'explication tiré de l'<explication> enfant direct de s */
function panneau(s,cls){
  var x=kids(s,'explication')[0];if(!x)return null;
  var w=el('div','xw'+(cls?' '+cls:'')),r=el('div','xr'),i=el('div','xin'),p=el('div','xpl');
  while(x.firstChild)p.appendChild(x.firstChild);
  i.appendChild(p);r.appendChild(i);w.appendChild(r);return w}

var TITRE=SRC.getAttribute('sujet')||SRC.getAttribute('titre')||'Parcours';
var ID=slug(txt(TITRE));
var CLE_LOCALE='parcours-etude:'+ID;
var DEPLIS={};      // clé stable → élément qui porte le dépli
var THEMES=[],SUJETS={},BLOCS=[];

/* flèche globale */
var GLB=el('span','glb','→');GLB.tabIndex=0;GLB.setAttribute('role','button');GLB.setAttribute('aria-label','Tout ouvrir ou tout replier');
W.appendChild(GLB);

/* bannière */
var BNR=el('div','bnr');BNR.setAttribute('role','button');BNR.tabIndex=0;
['tl','tr','bl','br'].forEach(function(k){BNR.appendChild(el('span','bcn '+k))});
BNR.appendChild(el('h1','bnr-t',TITRE));
var blocsSrc=kids(SRC,'bloc'),nbTh=0;
blocsSrc.forEach(function(b){nbTh+=kids(b,'theme').length});
BNR.appendChild(el('div','bnr-s',SRC.getAttribute('sous-titre')||('Plan d’étude en '+nbTh+' grands thèmes')));
var bx=panneau(SRC);
if(!bx){bx=el('div','xw');bx.innerHTML='<div class="xr"><div class="xin"><div class="xpl"></div></div></div>'}
var bcw=el('div','cpw'),BCP=bouton('cp','Copier le parcours');BCP._copie=function(){return texteParcours()};bcw.appendChild(BCP);bx.querySelector('.xin').appendChild(bcw);
BNR.appendChild(bx);BNR._xw=bx;DEPLIS.b=BNR;
W.appendChild(BNR);

/* barres de progression et bouton d'enregistrement */
var PRG=el('div','prg');W.appendChild(PRG);
var ENR=null;
if(!CADRE){var ew=el('div','enr-w');ENR=bouton('enr');ENR.innerHTML='<span class="pt-e"></span><span class="enr-l">Enregistrer</span>';ew.appendChild(ENR);W.appendChild(ew)}

/* blocs, thèmes, sujets */
var num=0,TOT=0;blocsSrc.forEach(function(bs){TOT+=kids(bs,'theme').length});if(TOT>24)PRG.classList.add('dense');
blocsSrc.forEach(function(bs,ib){
  var nom=bs.getAttribute('nom')||'',coul=bs.getAttribute('couleur');
  if(!coul){var n=blocsSrc.length;coul=PAL[n<2?1:Math.round(ib*(PAL.length-1)/(n-1))]}
  var ths=kids(bs,'theme'),mul=ths.length>1;
  var B={nom:nom,themes:[]};BLOCS.push(B);
  var bh=el('div','bh'),bk='bl:'+slug(txt(nom));teinte(bh,coul);
  bh.appendChild(el('span','bh-n',nom));bh.appendChild(el('span','bh-l'));W.appendChild(bh);
  var bp=mul?panneau(bs,'bp'):null;
  if(mul){bh.classList.add('mul');bh.setAttribute('role','button');bh.tabIndex=0;
    if(!bp){bp=el('div','xw bp');bp.innerHTML='<div class="xr"><div class="xin"><div class="xpl"></div></div></div>'}
    teinte(bp,coul);var cw=el('div','cpw'),cb=bouton('cp','Copier le bloc');cb._copie=function(){return texteBloc(B)};
    cw.appendChild(cb);bp.querySelector('.xin').appendChild(cw);W.appendChild(bp);bh._xw=bp;DEPLIS[bk]=bh}
  else{var seul=kids(bs,'explication')[0];if(seul&&ths[0]&&!kids(ths[0],'explication').length)ths[0].insertBefore(seul,ths[0].firstChild)}
  ths.forEach(function(ts,it){
    num++;var tt=ts.getAttribute('titre')||'',tk=ts.getAttribute('cle')||slug(txt(tt));
    var T={num:num,titre:tt,cle:tk,sujets:[],couleur:coul};B.themes.push(T);THEMES.push(T);
    var th=el('div','th');teinte(th,coul);T.el=th;th._T=T;
    var h=el('div','th-h');h.setAttribute('role','button');h.tabIndex=0;
    h.appendChild(el('span','tag',deux(num)));
    var t=el('div','th-t',tt);h.appendChild(t);
    var x=panneau(ts,'th-x');
    if(x){var p=el('span','th-p','+');p.setAttribute('role','button');p.tabIndex=0;p.setAttribute('aria-label','Explication du thème');t.appendChild(p);th._xw=x;DEPLIS['th:'+tk]=th}
    h.appendChild(el('span','th-v','›'));th.appendChild(h);if(x)th.appendChild(x);
    var sep=el('div','th-sep');th.appendChild(sep);
    var c=el('div','th-c'),ci=el('div','th-ci'),cp=el('div','th-cp'),cbt=bouton('cp','Copier le thème');
    cbt._copie=function(){return texteTheme(T)};cp.appendChild(cbt);ci.appendChild(cp);
    var rail=el('div','rail'),rt=el('span','rail-t'),rf=el('span','rail-f');rail.appendChild(rt);rail.appendChild(rf);
    kids(ts,'sujet').forEach(function(ss,is){
      var st=ss.getAttribute('titre')||'',k=ss.getAttribute('cle')||(tk+'.'+(is+1));
      k=k.replace(/[^A-Za-z0-9._-]/g,'-').slice(0,80);
      var S={cle:k,titre:st,theme:T,points:[],etat:'a-faire'};
      var cw=el('div','cw'),pt=el('span','pt'),cb=el('div','cb'),ch=el('div','ch'),ct=el('div','ct');
      cw.appendChild(pt);ct.setAttribute('role','button');ct.tabIndex=0;
      ct.appendChild(el('div','ct-t','<span class="code">'+deux(num)+'.'+(is+1)+'</span>'+st));
      var ds=ss.getAttribute('desc');if(ds)ct.appendChild(el('div','ct-d',ds));
      var sel=el('div','sel');ETATS.forEach(function(e){var b=bouton('',LIB[e]);b.setAttribute('data-e',e);sel.appendChild(b)});
      ch.appendChild(ct);ch.appendChild(sel);cb.appendChild(ch);
      var xw=el('div','xw'),xr=el('div','xr'),xi=el('div','xin');
      xi.appendChild(el('div','xsep'));xi.appendChild(el('div','cx-h','Ce que tu y apprends'));
      var ul=el('ul','pts');
      kids(ss,'p').forEach(function(pp){ul.appendChild(el('li',null,pp.innerHTML));S.points.push(txt(pp.innerHTML))});
      xi.appendChild(ul);var w2=el('div','cpw'),bs2=bouton('cp','Copier le sujet');bs2._copie=function(){return texteSujet(S)};
      w2.appendChild(bs2);xi.appendChild(w2);xr.appendChild(xi);xw.appendChild(xr);cb.appendChild(xw);cw.appendChild(cb);
      cw._xw=xw;cw._S=S;S.el=cw;S.pt=pt;DEPLIS['s:'+k]=cw;
      rail.appendChild(cw);T.sujets.push(S);SUJETS[k]=S});
    ci.appendChild(rail);c.appendChild(ci);th.appendChild(c);W.appendChild(th);
    T.c=c;T.ci=ci;T.sep=sep;T.rail=rail;T.rt=rt;T.rf=rf;T.cp=cp;T.cpBtn=cbt;
    /* segment de barre */
    var sg=el('div','seg'+(it===0?' deb':'')),br=el('div','bar'),pl=el('span','pl'),hc=el('span','hc');teinte(sg,coul);
    br.appendChild(pl);br.appendChild(hc);sg.appendChild(br);sg.appendChild(el('div','num',deux(num)));PRG.appendChild(sg);
    T.pl=pl;T.hc=hc});
});

/* pied : taille du texte */
var PIED=el('div','pied');PIED.appendChild(el('span','pied-l','Taille du texte'));
[['-1','A−'],['0','A'],['1','A+']].forEach(function(a){var b=bouton('tz',a[1]);b.setAttribute('data-tz',a[0]);PIED.appendChild(b)});
W.appendChild(PIED);

/* textes copiés */
function texteSujet(S){return txt(S.titre)+'\n\n'+S.points.map(function(p){return '· '+p}).join('\n')}
function texteTheme(T){return txt(T.titre)+'\n\n'+T.sujets.map(texteSujet).join('\n\n')}
function texteBloc(B){return txt(B.nom).toUpperCase()+'\n\n'+B.themes.map(texteTheme).join('\n\n\n')}
function texteParcours(){return txt(TITRE).toUpperCase()+'\n\n'+BLOCS.map(texteBloc).join('\n\n\n\n')}

/* ══ 2. COMPORTEMENT ══ */

/* ── dépli d'une explication ── */
function deplier(o,on,net){
  var w=o._xw;if(!w)return;var i=w.querySelector('.xin');
  if(o._xa){o._xa.cancel();o._xa=null}
  o.classList.toggle('xo',on);w.classList.toggle('on',on);
  if(net||RM)return;
  o._xa=on?i.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:350,easing:E_IN})
          :i.animate([{opacity:1},{opacity:0}],{duration:200,easing:E_OUT,fill:'forwards'});
  if(on){var a=o._xa;a.onfinish=function(){if(o._xa===a)o._xa=null}}}

/* ── ouverture et repli d'un thème ── */
var REG=[];
function annule(T){
  (T.anims||[]).forEach(function(a){a.cancel()});T.anims=[];
  clearTimeout(T.filet);if(T.fin){T.c.removeEventListener('transitionend',T.fin);T.fin=null}}
/* délais d'une cascade : intervalles réduits dans une même proportion
   quand le dernier départ dépasserait le plafond, avec un plancher */
function delais(iv,cap,plancher){
  var S=iv.reduce(function(a,v){return a+v},0),f=S>cap?cap/S:1,t=0;
  return iv.map(function(v,i){t+=i?Math.max(plancher,v*f):v*f;return t})}
function suite(n,premier,pas){var iv=[0];for(var i=1;i<n;i++)iv.push(i===1?premier:pas);return iv}
function finMouvement(T,tok,quand){
  var tr=new Promise(function(res){
    T.fin=function(e){if(e.target===T.c&&e.propertyName==='grid-template-rows')res()};
    T.c.addEventListener('transitionend',T.fin);T.filet=setTimeout(res,RM?0:700)});
  Promise.all([tr].concat(T.anims.map(function(a){return a.finished.catch(function(){})}))).then(function(){
    if(T.tok!==tok)return;annule(T);quand()})}
function elementsCascade(T){return [T.sep,T.rt,T.rf,T.cp].concat(T.sujets.map(function(s){return s.el}))}
function ouvrir(T,on,cascade){
  var th=T.el;annule(T);var tok=T.tok=(T.tok||0)+1;
  if(on){
    th.classList.add('dp','op');T.ci.style.visibility='visible';T.ci.style.overflow='hidden';
    var els=elementsCascade(T),
        ds=delais(suite(els.length,80,40),600,12);
    T.anims=RM?[]:els.map(function(e,i){return e.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],
      {duration:450,delay:ds[i],easing:E_IN,fill:'both'})});
    finMouvement(T,tok,function(){T.ci.style.overflow='visible';rail(T)});
  }else{
    /* l'en-tête figé en haut : la page se cale d'abord sur le haut du thème */
    var r=th.getBoundingClientRect();
    if(th.classList.contains('op')&&r.top<0)window.scrollTo({top:Math.round(r.top+(window.pageYOffset||0)),behavior:'instant'});
    th.classList.remove('dp');T.ci.style.visibility='visible';T.ci.style.overflow='hidden';
    var el2=elementsCascade(T).reverse(),dr=delais(suite(el2.length,15,15),150,0);
    T.anims=RM?[]:el2.map(function(e,i){return e.animate([{opacity:1,transform:'none'},{opacity:0,transform:'translateY(-6px)'}],
      {duration:250,delay:dr[i],easing:E_OUT,fill:'both'})});
    finMouvement(T,tok,function(){th.classList.remove('op');T.ci.style.visibility='hidden';T.ci.style.overflow='hidden';rail(T)});
  }
  if(!cascade)fleche()}
function fleche(){GLB.classList.toggle('up',THEMES.some(function(T){return T.el.classList.contains('dp')}))}
function cascadeGlobale(){
  REG.forEach(clearTimeout);REG=[];
  var ouverts=THEMES.filter(function(T){return T.el.classList.contains('dp')}),
      liste=ouverts.length?ouverts.reverse():THEMES.slice(),on=!ouverts.length,
      d=on?delais(suite(liste.length,120,120),1000,0):delais(suite(liste.length,60,60),500,0);
  GLB.classList.toggle('up',on);
  liste.forEach(function(T,i){function go(){ouvrir(T,on,true);envoyer()}
    if(i===0||RM)go();else REG.push(setTimeout(go,d[i]))})}

/* ── rail de progression d'un thème ── */
function rail(T){
  var n=0;while(n<T.sujets.length&&T.sujets[n].etat==='termine')n++;
  var h=0,H=T.rail.offsetHeight-16-26;
  if(n===T.sujets.length&&n)h=H;
  else if(n){var s=T.sujets[n-1];h=s.el.offsetTop+s.pt.offsetTop+5.5-16}
  T.rf.style.height=Math.max(0,h)+'px'}
function rails(){THEMES.forEach(rail)}
function barres(){THEMES.forEach(function(T){
  var n=T.sujets.length||1,f=0,m=0;
  T.sujets.forEach(function(s){if(s.etat==='termine')f++;else if(s.etat!=='a-faire')m++});
  T.pl.style.width=(f/n*100)+'%';T.hc.style.left=(f/n*100)+'%';T.hc.style.width=(m/n*100)+'%'})}

/* ── état d'un sujet ── */
function poseEtat(S,e){
  S.etat=e;S.el.setAttribute('data-e',e);
  [].forEach.call(S.el.querySelectorAll('.sel button'),function(b){b.classList.toggle('on',b.getAttribute('data-e')===e)})}
function pulsation(S){
  if(RM)return;var c=S.theme.couleur,r=rgb(c);
  S.pt.animate([{transform:'scale(1)'},{transform:'scale(1.45)',offset:.33},{transform:'scale(1)'}],{duration:650,easing:E_IN});
  var a=el('span','anneau');S.el.appendChild(a);
  a.animate([{boxShadow:'0 0 0 4px rgb('+r+' / .7)'},{boxShadow:'0 0 0 16px rgb('+r+' / 0)'}],{duration:650,easing:E_IN}).onfinish=function(){a.remove()}}

/* ── taille du texte ── */
var Z=Z0;
function poseZ(z){Z=CRANS.indexOf(z)<0?Z0:z;R.style.setProperty('--z',Z);
  [].forEach.call(PIED.querySelectorAll('.tz'),function(b){var d=b.getAttribute('data-tz');
    b.classList.toggle('bout',(d==='-1'&&Z===CRANS[0])||(d==='1'&&Z===CRANS[CRANS.length-1]))})}

/* ── copie ── */
function copier(b){
  var t=typo(b._copie());
  function ok(){b._lib=b._lib||b.textContent;b.textContent='Copié';b.classList.add('ok');clearTimeout(b._t);
    b._t=setTimeout(function(){b.textContent=b._lib;b.classList.remove('ok')},1600)}
  function repli(){var a=el('textarea');a.value=t;a.setAttribute('readonly','');a.style.cssText='position:fixed;top:0;left:0;opacity:0';
    D.body.appendChild(a);a.select();try{D.execCommand('copy')}catch(e){}a.remove();ok()}
  try{navigator.clipboard.writeText(t).then(ok,repli)}catch(e){repli()}}

/* ══ 3. PROGRESSION ══ */
var BLOC=D.getElementById('lv-progression');
function propre(p){var s={},src=p&&p.sujets&&typeof p.sujets==='object'?p.sujets:{};
  Object.keys(src).forEach(function(k){if(/^[\w.-]{1,80}$/.test(k)&&ETATS.indexOf(src[k])>0)s[k]=src[k]});
  return {maj:Math.max(0,+(p&&p.maj)||0),sujets:s}}
var INSCRIT=(function(){try{return propre(JSON.parse(BLOC.textContent))}catch(e){return {maj:0,sujets:{}}}})();
var MAJ=0;
function sujetsPresents(){var s={};Object.keys(SUJETS).forEach(function(k){if(SUJETS[k].etat!=='a-faire')s[k]=SUJETS[k].etat});return s}
function etat(){
  var d=[];Object.keys(DEPLIS).forEach(function(k){if(DEPLIS[k].classList.contains('xo'))d.push(k)});
  return {maj:MAJ,sujets:sujetsPresents(),ouverts:THEMES.filter(function(T){return T.el.classList.contains('dp')}).map(function(T){return T.cle}),deplies:d,z:Z}}
function envoyer(){var e=etat();
  try{localStorage.setItem(CLE_LOCALE,JSON.stringify(e))}catch(x){}
  if(CADRE){try{parent.postMessage({lvEtat:e},'*')}catch(x){}}}
function envoyerProgression(){
  if(CADRE){try{parent.postMessage({lvProgression:{maj:MAJ,sujets:sujetsPresents()}},'*')}catch(x){}}
  pointEnr()}
function pointEnr(){if(ENR)ENR.classList.toggle('sale',MAJ!==INSCRIT.maj)}
function memes(a,b){var ka=Object.keys(a),kb=Object.keys(b);return ka.length===kb.length&&ka.every(function(k){return a[k]===b[k]})}

/* pose d'un état d'un coup, sans transition */
function appliquer(e){
  e=e||{};R.classList.add('net');
  var p=propre(e);if(INSCRIT.maj>=p.maj)p=INSCRIT;
  MAJ=p.maj;Object.keys(SUJETS).forEach(function(k){poseEtat(SUJETS[k],p.sujets[k]||'a-faire')});
  var ouv=Array.isArray(e.ouverts)?e.ouverts:[];
  THEMES.forEach(function(T){annule(T);T.tok=(T.tok||0)+1;var on=ouv.indexOf(T.cle)>=0;
    T.el.classList.toggle('dp',on);T.el.classList.toggle('op',on);
    T.ci.style.visibility=on?'visible':'hidden';T.ci.style.overflow=on?'visible':'hidden'});
  var dep=Array.isArray(e.deplies)?e.deplies:[];
  Object.keys(DEPLIS).forEach(function(k){deplier(DEPLIS[k],dep.indexOf(k)>=0,true)});
  poseZ(typeof e.z==='number'?e.z:Z0);barres();fleche();
  requestAnimationFrame(function(){requestAnimationFrame(function(){R.classList.remove('net');rails()})});
  if(MAJ!==INSCRIT.maj||!memes(p.sujets,INSCRIT.sujets)){if(!DIT){DIT=true;envoyerProgression()}}else pointEnr()}
var DIT=false;

/* reprise : le bloc inscrit et le stockage local */
var LOCAL=null;try{LOCAL=JSON.parse(localStorage.getItem(CLE_LOCALE)||'null')}catch(x){}
appliquer(LOCAL);

/* ── enregistrement du fichier ── */
function fichierAJour(){
  var j=JSON.stringify({maj:MAJ,sujets:sujetsPresents()}).replace(/</g,'\\u003c');
  return COPIE.replace(/(<script\b[^>]*\bid=["']lv-progression["'][^>]*>)[\s\S]*?(<\/script>)/i,function(m,a,b){return a+'\n'+j+'\n'+b})}
function nomFichier(){var n='';try{n=decodeURIComponent(location.pathname.split('/').pop()||'')}catch(e){}
  return /\.html$/i.test(n)?n:ID+'.html'}
var BASE='parcours-etude-'+ID;
function idb(mode,fn){return new Promise(function(res){try{var q=indexedDB.open(BASE,1);
  q.onupgradeneeded=function(){q.result.createObjectStore('h')};
  q.onsuccess=function(){try{var tx=q.result.transaction('h',mode),r=fn(tx.objectStore('h'));
    tx.oncomplete=function(){res(r&&r.result)};tx.onerror=function(){res(null)}}catch(e){res(null)}};
  q.onerror=function(){res(null)}}catch(e){res(null)}})}
function litHandle(){return idb('readonly',function(s){return s.get('fichier')})}
function gardeHandle(h){return idb('readwrite',function(s){s.put(h,'fichier')})}
function ecrit(h,txt){return h.createWritable().then(function(w){return w.write(txt).then(function(){return w.close()})})}
function enregistre(){
  var src=fichierAJour(),blob=new Blob([src],{type:'text/html;charset=utf-8'});
  function fait(){COPIE=src;INSCRIT={maj:MAJ,sujets:sujetsPresents()};pointEnr();
    ENR.classList.add('ok');var l=ENR.querySelector('.enr-l');l.textContent='Enregistré';clearTimeout(ENR._t);
    ENR._t=setTimeout(function(){ENR.classList.remove('ok');l.textContent='Enregistrer'},1600)}
  if(window.showSaveFilePicker){
    function choisir(){return window.showSaveFilePicker({suggestedName:nomFichier(),
        types:[{description:'Parcours HTML',accept:{'text/html':['.html']}}]})
      .then(function(h){return ecrit(h,blob).then(function(){gardeHandle(h);fait()})},function(){})}
    litHandle().then(function(h){
      if(!h)return choisir();
      return Promise.resolve(h.queryPermission({mode:'readwrite'})).then(function(p){
        return p==='granted'?p:h.requestPermission({mode:'readwrite'})})
      .then(function(p){if(p!=='granted')throw 0;return ecrit(h,blob).then(fait)})
      .catch(function(){return choisir()})});
  }else{
    var u=URL.createObjectURL(blob),a=el('a');a.href=u;a.download=nomFichier();a.style.display='none';
    D.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},1000);fait()}}

/* ── gestes ── */
var GESTE=false;
D.addEventListener('pointerdown',function(){GESTE=true},true);
D.addEventListener('keydown',function(){GESTE=true},true);
W.addEventListener('click',function(ev){
  var t=ev.target;if(t&&t.nodeType!==1)t=t.parentElement;if(!t)return;
  var b;
  if((b=t.closest('.cp'))){copier(b);return}
  if(t.closest('.enr')){enregistre();return}
  if((b=t.closest('.tz'))){var d=+b.getAttribute('data-tz'),i=CRANS.indexOf(Z);
    poseZ(d===0?Z0:CRANS[Math.max(0,Math.min(CRANS.length-1,i+d))]);requestAnimationFrame(rails);envoyer();return}
  if((b=t.closest('.sel button'))){var cw=b.closest('.cw'),S=cw._S,e=b.getAttribute('data-e');if(e===S.etat)return;
    poseEtat(S,e);MAJ=Date.now();if(e==='termine')pulsation(S);barres();rail(S.theme);envoyerProgression();envoyer();return}
  if(t.closest('.xw'))return;          // le contenu déplié garde ses clics
  if(t===GLB){cascadeGlobale();return}
  if(t.closest('.th-p')){var th=t.closest('.th');deplier(th,!th.classList.contains('xo'));envoyer();return}
  if((b=t.closest('.th-h'))){var T=b.parentNode._T;ouvrir(T,!T.el.classList.contains('dp'));envoyer();return}
  if((b=t.closest('.ct'))){var c=b.closest('.cw');deplier(c,!c.classList.contains('xo'));envoyer();return}
  if((b=t.closest('.bh.mul'))||(b=t.closest('.bnr'))){deplier(b,!b.classList.contains('xo'));envoyer();return}
});
W.addEventListener('keydown',function(e){
  if((e.key==='Enter'||e.key===' ')&&e.target.getAttribute&&e.target.getAttribute('role')==='button'){e.preventDefault();e.target.click()}});
D.addEventListener('touchstart',function(){},{passive:true});
D.addEventListener('visibilitychange',function(){if(D.visibilityState==='hidden')envoyer()});
addEventListener('pagehide',envoyer);
/* un mot du titre plus long que la bannière : le titre se resserre jusqu'à tenir */
function ajusteTitre(){var t=BNR.querySelector('.bnr-t'),r=D.createRange();t.style.fontSize='';
  var cs=getComputedStyle(t),fs=parseFloat(cs.fontSize),place=t.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
  function large(){r.selectNodeContents(t);return Math.max.apply(null,[0].concat([].map.call(r.getClientRects(),function(c){return c.width})))}
  while(large()>place+1&&fs>14){fs-=1;t.style.fontSize=fs+'px'}}
ajusteTitre();
addEventListener('resize',function(){requestAnimationFrame(function(){ajusteTitre();rails()})});
if(window.ResizeObserver){var ro=new ResizeObserver(function(){rails()});THEMES.forEach(function(T){ro.observe(T.rail)})}

/* ── page hôte : l'état gardé par la page ── */
addEventListener('message',function(ev){
  if(ev.source!==parent)return;var d=ev.data;
  if(d&&typeof d==='object'&&d.lvEtat&&!GESTE)appliquer(d.lvEtat)});
if(CADRE){try{parent.postMessage({lvEtatVoulu:1},'*')}catch(x){}}
})();

/* coin coupé selon la disposition : un cadre posé à côté d'un autre sur la même ligne porte le coin coupé (classe cote),
   un cadre seul sur sa ligne, au-dessus ou au-dessous d'un autre, a des angles droits (classe seul) */
(function(){
var SEL='.cb';
function coins(){var C=[].slice.call(document.querySelectorAll(SEL)),R=C.map(function(c){return c.getBoundingClientRect()});
  C.forEach(function(c,i){var a=R[i];if(a.width===0)return;
    var cote=R.some(function(r,j){return j!==i&&r.width>0&&r.top<a.bottom-4&&a.top<r.bottom-4&&(r.right<=a.left+1||r.left>=a.right-1)});
    c.classList.toggle('cote',cote);c.classList.toggle('seul',!cote)})}
function bientot(){[0,120,400,800].forEach(function(t){setTimeout(coins,t)})}
bientot();addEventListener('load',bientot);addEventListener('resize',bientot);document.addEventListener('click',bientot);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(bientot);
})();

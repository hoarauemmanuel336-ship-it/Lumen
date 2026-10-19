/* ══════════════════════════════════════════════════════════════════════
   MOTEUR DES DIAGRAMMES INTERACTIFS : SCRIPT
   1. Construction : lit le contenu (<template id="contenu">) et bâtit le widget.
   2. Comportement : sections, explications, grilles, lectures,
      taille du texte, état retenu (clé 'diag-etat-' + identifiant).
   ══════════════════════════════════════════════════════════════════════ */
(function(){
'use strict';
var D=document,B=D.body,R=D.documentElement,W=D.getElementById('w');
var RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
var E_IN='cubic-bezier(.2,.7,.3,1)',E_OUT='cubic-bezier(.4,0,1,1)';
var TZ=[.85,.925,1,1.08,1.16,1.25];
var PAL=['#ff3b5c','#3d9bff','#ffb020','#2ee59d','#b46bff','#ff7a2f','#20d4e6','#ff4fd8'];

/* ══ 1. CONSTRUCTION ══ */
var T=D.getElementById('contenu'),SRC=T.content.querySelector('diagramme');
function el(tag,cls,html){var e=D.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e}
function kids(s,nom){return [].filter.call(s.children,function(c){return !nom||c.localName===nom})}
function niv(s,d){['a','n'].forEach(function(k){var v=s.getAttribute(k);if(v==='2'||v==='3')d.setAttribute('data-'+k,v)})}
function nivTout(c){niv(c,c);c.removeAttribute('a');c.removeAttribute('n');
  [].forEach.call(c.querySelectorAll('[a],[n]'),function(e){niv(e,e);e.removeAttribute('a');e.removeAttribute('n')})}
function txt(html){var t=el('div',null,html||'');return t.textContent.replace(/\s+/g,' ').trim()}
function rgb(h){h=(h||'').trim().replace('#','');if(h.length===3)h=h.replace(/(.)/g,'$1$1');
  var n=parseInt(h,16);if(isNaN(n)||h.length!==6)return '255,255,255';return [(n>>16)&255,(n>>8)&255,n&255].join(',')}
function slug(s){return (s||'diagramme').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)||'diagramme'}

/* panneau d'explication tiré de l'<explication> enfant direct de s */
function panneau(s,sepCarte){
  var x=kids(s,'explication')[0],w=el('div','xw'),r=el('div','xr'),i=el('div','xin'),p=el('div','xpl');
  if(sepCarte)i.appendChild(el('div','xsep'));
  if(x){while(x.firstChild){var c=x.firstChild;if(c.nodeType===1)nivTout(c);p.appendChild(c)}x.remove()}
  volets(p);i.appendChild(p);r.appendChild(i);w.appendChild(r);return {w:w,vide:!x}}
/* volets : une <volet titre> d'explication devient un volet qui se déplie */
function volets(p){[].forEach.call(p.querySelectorAll('volet'),function(v){var d=el('div','sx'),c=el('div','sx-c'),i=el('div');
  ['data-a','data-n'].forEach(function(k){if(v.hasAttribute(k))d.setAttribute(k,v.getAttribute(k))});
  while(v.firstChild)i.appendChild(v.firstChild);c.appendChild(i);d.appendChild(el('div','sx-t',v.getAttribute('titre')||''));d.appendChild(c);v.replaceWith(d)})}
function depl(d,w,cls){d.classList.add('dep');d._xw=w;d._xc=cls||'xo'}

function carte(s){
  var c=el('div','crd'),b=el('div','crd-b'),t=s.getAttribute('titre')||'',ds=s.getAttribute('desc');
  b.appendChild(el('div','crd-t',t));if(ds)b.appendChild(el('div','crd-d',ds));
  var x=panneau(s,true);b.appendChild(x.w);c.appendChild(b);
  c.setAttribute('data-name',txt(t));niv(s,c);if(!x.vide)depl(c,x.w);return c}
function grille(par){return el('div','grd'+(par?' par':''))}
function groupe(s,par){
  var m=s.getAttribute('mise');if(m)par=(m==='parallele');
  var w=el('div','sgr'),h=el('div','sg hx'),t=el('div','sg-t'),ti=s.getAttribute('titre')||'',d=s.getAttribute('desc');
  niv(s,w);t.appendChild(el('span','sg-p'));t.appendChild(el('span','sg-n',ti));if(d)t.appendChild(el('span','sg-s',d));
  h.appendChild(t);var x=panneau(s);h.appendChild(x.w);if(!x.vide)depl(h,x.w);h.setAttribute('data-name',txt(ti));
  w.appendChild(h);var g=grille(par);kids(s,'carte').forEach(function(k){g.appendChild(carte(k))});w.appendChild(g);return w}
/* figure composée par l'IA : chaque élément [depli] ouvre son explication sous la figure */
function contenuX(x){var p=el('div','xpl');if(x){while(x.firstChild){var c=x.firstChild;if(c.nodeType===1)nivTout(c);p.appendChild(c)}x.remove()}volets(p);return p}
function libre(s){
  var l=el('div','lib'),pan=el('div','fpan'),pr=el('div','fpan-r');niv(s,l);pan.appendChild(pr);
  while(s.firstChild)l.appendChild(s.firstChild);
  var X={};[].forEach.call(l.querySelectorAll('explication[pour]'),function(x){X[x.getAttribute('pour')]=x});
  l._els=[].slice.call(l.querySelectorAll('[depli]'));l._pan=pan;l._pr=pr;l._sel=null;
  l._els.forEach(function(d){
    var x=X[d.getAttribute('depli')]||[].filter.call(d.children,function(c){return c.localName==='explication'})[0];
    d._fx=contenuX(x||null);d._ft=d.getAttribute('titre')||txt(d.textContent);d._fk=d.getAttribute('repere')||'';
    d.classList.add('fel');if(!d.hasAttribute('tabindex'))d.setAttribute('tabindex','0');d.setAttribute('role','button')});
  [].forEach.call(l.querySelectorAll('explication'),function(x){x.remove()});
  l.appendChild(pan);return l}
function visEl(e){return !!e&&e.getClientRects().length>0}
function montrerFig(l,d){
  var pan=l._pan,pr=l._pr,av=l._sel;
  if(av)av.classList.remove('on');
  if(!d||av===d){l._sel=null;pan.classList.remove('on');l.classList.remove('dim');return}
  l._sel=d;d.classList.add('on');l.classList.add('dim');
  pr.innerHTML='';var inn=el('div','fpan-in');
  if(d._fk)inn.appendChild(el('div','fpan-k',d._fk));inn.appendChild(el('div','fpan-t',d._ft));inn.appendChild(d._fx);
  pr.appendChild(inn);pan.classList.add('on');
  if(!RM)inn.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:350,easing:E_IN});
  setTimeout(function(){voir(pan)},RM?0:60)}
function retourFig(l){var d=l._sel;if(!d)return;montrerFig(l,null);var b=voir(d,true);pulser(d,b?450:0)}
function majFigs(){[].forEach.call(W.querySelectorAll('.lib'),function(l){if(l._sel&&!visEl(l._sel))montrerFig(l,null)})}
/* défilement doux, seulement quand la cible sort de l'écran */
function voir(e,centre){
  var r=e.getBoundingClientRect(),vh=window.innerHeight,y=null;
  if(centre){if(r.top<70||r.bottom>vh-30)y=window.pageYOffset+r.top-(vh-r.height)/2}
  else if(r.top<70)y=window.pageYOffset+r.top-80;
  else if(r.bottom>vh-30)y=window.pageYOffset+Math.min(r.top-80,r.bottom-(vh-40));
  if(y!==null)window.scrollTo({top:Math.max(0,y),behavior:RM?'auto':'smooth'});
  return y!==null}
function pulser(e,delai){setTimeout(function(){e.classList.remove('pls');void e.getBoundingClientRect();e.classList.add('pls');
  setTimeout(function(){e.classList.remove('pls')},1900)},delai||0)}
function standard(s,cnt,par){
  var g=null;
  kids(s).forEach(function(c){var n=c.localName;
    if(n==='carte'){if(!g){g=grille(par);cnt.appendChild(g)}g.appendChild(carte(c))}
    else if(n==='groupe'){g=null;cnt.appendChild(groupe(c,par))}
    else if(n==='libre'){g=null;cnt.appendChild(libre(c))}})}
var nSec=0;
function section(s,coul){
  var sec=el('section','sec'),t=s.getAttribute('titre')||'';
  sec.setAttribute('data-cle',s.getAttribute('cle')||('section-'+(++nSec)));niv(s,sec);
  if(coul){sec.classList.add('col');sec.style.setProperty('--acr',rgb(coul))}
  var h=el('div','sch'),st=el('span','sct');h.setAttribute('data-tog','');
  h.appendChild(el('span','tag'));st.appendChild(el('span','sct-t',t));
  var x=panneau(s);
  if(!x.vide){var g=el('span','sgn','<span>+</span>');g.setAttribute('role','button');g.setAttribute('aria-label','Explication du titre');st.appendChild(g)}
  h.appendChild(st);h.appendChild(el('span','chv','›'));h.appendChild(el('div','sep'));sec.appendChild(h);
  x.w.classList.add('sxw');sec.appendChild(x.w);sec._xw=x.w;sec._xc='sxo';sec.setAttribute('data-name',txt(t));
  var env=el('div','env'),rep=el('div','rep'),cnt=el('div','cnt');rep.appendChild(cnt);env.appendChild(rep);sec.appendChild(env);
  sec._env=env;sec._rep=rep;sec._cnt=cnt;sec._an=[];
  var m=(s.getAttribute('mise')||'sequentielle').toLowerCase();
  standard(s,cnt,m==='parallele');
  return sec}

var titre=SRC.getAttribute('titre')||'',sous=SRC.getAttribute('sous-titre')||'';
var GLB=el('span','glb','→');GLB.tabIndex=0;GLB.setAttribute('role','button');GLB.setAttribute('aria-label','Tout ouvrir ou tout replier');W.appendChild(GLB);
var BN=el('div','bnr hx');['tl','tr','bl','br'].forEach(function(k){BN.appendChild(el('span','bcn bcn-'+k))});
BN.appendChild(el('div','bnr-tit',titre));if(sous)BN.appendChild(el('div','bnr-sst',sous));
(function(){var x=panneau(SRC);BN.appendChild(x.w);if(!x.vide)depl(BN,x.w)})();
BN.setAttribute('data-name',txt(titre));W.appendChild(BN);
function bouton(cls,attr,v,lib){return '<button type="button" class="'+cls+'" '+attr+'="'+v+'">'+lib+'</button>'}
var RG=el('div','rgl');
RG.innerHTML='<div class="rgg"><span class="rgl-l">Ampleur</span><span class="lec-s">'+bouton('lec','data-amp',1,'Centré')+bouton('lec','data-amp',2,'Élargi')+bouton('lec','data-amp',3,'Complet')+'</span></div>'
 +'<div class="rgg"><span class="rgl-l">Épaisseur</span><span class="lec-s">'+bouton('lec','data-v',1,'Abrégé')+bouton('lec','data-v',2,'Courant')+bouton('lec','data-v',3,'Intégral')+'</span></div>';
W.appendChild(RG);
var nb=0;
kids(SRC).forEach(function(c){
  if(c.localName==='bloc'){
    var coul=c.getAttribute('couleur')||PAL[nb%PAL.length],secs=kids(c,'section'),h=el('div','blk hx'),t=el('div','blk-t'),nm=c.getAttribute('nom')||'',am=3,nm2=3;nb++;
    t.appendChild(el('span','blk-n',nm));t.appendChild(el('span','blk-f'));h.appendChild(t);h.setAttribute('data-name',txt(nm));
    secs.forEach(function(s){am=Math.min(am,+(s.getAttribute('a')||1));nm2=Math.min(nm2,+(s.getAttribute('n')||1))});
    if(am>1)h.setAttribute('data-a',am);if(nm2>1)h.setAttribute('data-n',nm2);
    if(secs.length>1){var x=panneau(c);h.appendChild(x.w);if(!x.vide)depl(h,x.w)}
    W.appendChild(h);secs.forEach(function(s){W.appendChild(section(s,coul))})}
  else if(c.localName==='section')W.appendChild(section(c,null))});
var RB=el('div','rgl rgl-bas');RB.innerHTML='<div class="rgg"><span class="rgl-l">Taille du texte</span><span class="tzr-s">'+bouton('tzr','data-tz',-1,'A−')+bouton('tzr','data-tz',0,'A')+bouton('tzr','data-tz',1,'A+')+'</span></div>';W.appendChild(RB);
T.remove();
if(!D.title)D.title=txt(titre);

/* ══ 2. COMPORTEMENT ══ */
var SECS=[].slice.call(W.querySelectorAll('.sec'));
var CLE='diag-etat-'+slug(txt(titre));
var CADRE=(function(){try{return parent!==window}catch(e){return true}})();
var amp=2,ep=3,tzi=TZ.length-1,GESTE=false,G_CIBLE=null,REG=[];
function vis(e){return !!e&&e.offsetParent!==null}
function rendues(){return SECS.filter(vis)}
function estOuv(s){return s.classList.contains('dpl')}

/* ── Hauteur animée : fin réelle de la transition ── */
function finTransition(sec){
  return new Promise(function(res){
    if(RM){res();return}
    var env=sec._env,fini=false,to;
    function f(e){if(e&&e.target!==env)return;if(fini)return;fini=true;env.removeEventListener('transitionend',f);clearTimeout(to);sec._off=null;res()}
    env.addEventListener('transitionend',f);to=setTimeout(f,560);
    sec._off=function(){fini=true;env.removeEventListener('transitionend',f);clearTimeout(to)}})}

/* ── Verrou ── */
function stop(sec){
  (sec._an||[]).forEach(function(a){a.cancel()});sec._an=[];
  if(sec._to){clearTimeout(sec._to);sec._to=0}
  if(sec._off){sec._off();sec._off=null}
  sec._tok=(sec._tok||0)+1}

/* ── Éléments animés d'une section, avec leur intervalle nominal ── */
function elements(sec){
  var L=[];function add(e,g){if(vis(e))L.push({e:e,g:g})}
  kids(sec._cnt).forEach(function(k){var c=k.classList;
    if(c.contains('grd'))kids(k).forEach(function(x){add(x,40)});
    else if(c.contains('sgr')){if(!vis(k))return;add(k.firstChild,80);kids(k.lastChild).forEach(function(x){add(x,40)})}
    else add(k,40)});
  return L}
function delais(gaps,plafond,plancher){
  var tot=gaps.reduce(function(a,b){return a+b},0),f=tot>plafond?plafond/tot:1,d=0;
  return gaps.map(function(g){d+=Math.max(plancher,g*f);return d})}
var K_IN=[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}];
var K_OUT=[{opacity:1,transform:'none'},{opacity:0,transform:'translateY(-6px)'}];

function ouvrir(sec){
  stop(sec);var tok=sec._tok,rep=sec._rep,sep=sec.querySelector('.sep');
  sec.classList.add('dpl','ouv');rep.style.visibility='visible';rep.style.overflow='hidden';
  rangerSec(sec);
  var L=elements(sec),an=[];
  var gaps=L.map(function(x,i){return i===0?80:x.g});
  var ds=RM?gaps.map(function(){return 0}):delais(gaps,600,12);
  var o={duration:RM?.01:450,easing:E_IN,fill:'both'};
  an.push(sep.animate(K_IN,Object.assign({},o,{delay:0})));
  L.forEach(function(x,i){an.push(x.e.animate(K_IN,Object.assign({},o,{delay:ds[i]})))});
  sec._an=an;
  Promise.all(an.map(function(a){return a.finished}).concat([finTransition(sec)])).then(function(){
    if(sec._tok!==tok)return;rep.style.overflow='';an.forEach(function(a){a.cancel()});sec._an=[]},function(){})}

function caler(sec){if(!sec)return;var r=sec.getBoundingClientRect();if(r.top<0&&r.bottom>0)window.scrollTo(0,(window.pageYOffset||0)+r.top)}
function fermer(sec,sansCalage){
  stop(sec);var tok=sec._tok,rep=sec._rep,sep=sec.querySelector('.sep');
  if(!sansCalage)caler(sec);
  rep.style.visibility='visible';rep.style.overflow='hidden';
  var L=elements(sec).reverse(),an=[];
  var gaps=L.map(function(x,i){return i===0?0:(x.g===80?30:15)});gaps.push(15);
  var ds=RM?gaps.map(function(){return 0}):delais(gaps,150,0);
  var o={duration:RM?.01:250,easing:E_OUT,fill:'both'};
  L.forEach(function(x,i){an.push(x.e.animate(K_OUT,Object.assign({},o,{delay:ds[i]})))});
  an.push(sep.animate([{opacity:1},{opacity:0}],Object.assign({},o,{delay:ds[ds.length-1]})));
  sec.classList.remove('dpl');sec._an=an;
  Promise.all(an.map(function(a){return a.finished}).concat([finTransition(sec)])).then(function(){
    if(sec._tok!==tok)return;sec.classList.remove('ouv');rep.style.visibility='hidden';rep.style.overflow='';
    an.forEach(function(a){a.cancel()});sec._an=[];majFleche()},function(){})}

function basculer(sec){G_CIBLE=null;if(estOuv(sec))fermer(sec);else ouvrir(sec);majFleche();sauver()}
function majFleche(){var up=G_CIBLE!==null?G_CIBLE:rendues().some(estOuv);GLB.classList.toggle('up',up)}

/* ── Flèche globale : cascade ── */
function globale(){
  REG.forEach(clearTimeout);REG=[];
  var S=rendues(),O=S.filter(estOuv),ferme=O.length>0,L=ferme?O.slice().reverse():S.slice(),n=L.length;
  var pas=(RM||n<2)?0:(ferme?Math.min(60,500/(n-1)):Math.min(120,1000/(n-1)));
  if(ferme)caler(O.filter(function(s){var r=s.getBoundingClientRect();return r.top<0&&r.bottom>0})[0]);
  var fin=SECS.filter(function(s){return ferme?(estOuv(s)&&L.indexOf(s)<0):(estOuv(s)||L.indexOf(s)>=0)});
  sauver(fin.map(function(s){return s.dataset.cle}));
  if(!n){G_CIBLE=null;majFleche();return}
  G_CIBLE=!ferme;majFleche();
  L.forEach(function(s,i){
    function go(){s._to=0;if(ferme)fermer(s,true);else ouvrir(s);if(i===n-1){G_CIBLE=null;majFleche()}}
    if(i===0||pas===0)go();else{var t=setTimeout(go,i*pas);REG.push(t);s._to=t}})}

/* ── Dépli d'une explication ── */
function deplier(d){
  var cls=d._xc,w=d._xw;if(!w)return;
  var on=!d.classList.contains(cls),g=(d.classList.contains('crd')&&d.parentNode.classList.contains('par'))?d.parentNode:null;
  var avant=g?releve(g):null;
  clearTimeout(d._rt);
  if(g&&!on)d.classList.add('rpl');
  d.classList.toggle(cls,on);w.classList.toggle('on',on);
  var t=w.firstChild.firstChild;
  if(d._xa){d._xa.cancel();d._xa=null}
  if(!RM)d._xa=on?t.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:350,easing:E_IN})
               :t.animate([{opacity:1},{opacity:0}],{duration:200,easing:E_OUT,fill:'forwards'});
  if(g){if(on){d.classList.remove('rpl');ranger(g,avant,d)}
    else d._rt=setTimeout(function(){var av=releve(g);d.classList.remove('rpl');ranger(g,av,d)},RM?0:260)}
}

/* ── Grilles parallèles : hauteur égale par ligne, ligne pleine, FLIP ── */
function pgcd(a,b){return b?pgcd(b,a%b):a}
function cols(g){var s=getComputedStyle(g).gridTemplateColumns;return (s&&s!=='none')?s.split(' ').filter(Boolean).length:1}
function releve(g){
  var m=new Map();kids(g).forEach(function(c){if(!vis(c))return;var r=c.getBoundingClientRect(),b=c.firstChild.getBoundingClientRect();m.set(c,{x:r.left,y:r.top,w:b.width,h:b.height})});
  (g._fl||[]).forEach(function(a){a.cancel()});g._fl=[];return m}
function ranger(g,avant,focus){
  var C=kids(g).filter(vis);if(!C.length)return;
  C.forEach(function(c){c.style.gridColumn='';c.firstChild.style.minHeight=''});
  g.style.gridTemplateColumns='';
  var n=cols(g),L=1,q,row=[],plein=function(c){return c.classList.contains('xo')||c.classList.contains('rpl')};
  for(q=2;q<=n;q++)L=L*q/pgcd(L,q);
  function flush(){row.forEach(function(c){c.style.gridColumn='span '+(n*L/row.length)});row=[]}
  if(n>1){
    g.style.gridTemplateColumns='repeat('+(n*L)+',minmax(0,1fr))';
    C.forEach(function(c){if(plein(c)){flush();c.style.gridColumn='1/-1'}else{row.push(c);if(row.length===n)flush()}});flush();
    g.style.alignItems='start';var lg=new Map();
    C.forEach(function(c){if(plein(c))return;var b=c.firstChild,x=b.querySelector('.xw'),y=Math.round(c.offsetTop),h=b.offsetHeight-(x?x.offsetHeight:0);lg.set(y,Math.max(lg.get(y)||0,h))});
    C.forEach(function(c){if(!plein(c))c.firstChild.style.minHeight=lg.get(Math.round(c.offsetTop))+'px'});g.style.alignItems=''}
  if(avant&&!RM){g._fl=g._fl||[];
    C.forEach(function(c){var o=avant.get(c);if(!o)return;var r=c.getBoundingClientRect(),b=c.firstChild.getBoundingClientRect(),dx=o.x-r.left,dy=o.y-r.top;
      if(Math.abs(dx)>.5||Math.abs(dy)>.5)g._fl.push(c.animate([{transform:'translate('+dx+'px,'+dy+'px)'},{transform:'none'}],{duration:340,easing:E_IN}));
      var dw=Math.abs(o.w-b.width)>.5,dh=c!==focus&&Math.abs(o.h-b.height)>.5;
      if(dw||dh){var k0={overflow:'hidden'},k1={overflow:'hidden'};
        if(dw){k0.width=o.w+'px';k1.width=b.width+'px'}if(dh){k0.height=o.h+'px';k1.height=b.height+'px'}
        g._fl.push(c.firstChild.animate([k0,k1],{duration:340,easing:E_IN}))}})}}
function rangerSec(root){[].forEach.call(root.querySelectorAll('.grd.par'),function(g){ranger(g)})}

function retracer(){rangerSec(W)}

/* ── Lectures et taille du texte ── */
function lecture(a,v){
  amp=a;ep=v;B.classList.remove('a1','a2','a3','v1','v2','v3');B.classList.add('a'+a,'v'+v);
  [].forEach.call(RG.querySelectorAll('[data-amp]'),function(b){b.classList.toggle('act',+b.dataset.amp===a)});
  [].forEach.call(RG.querySelectorAll('[data-v]'),function(b){b.classList.toggle('act',+b.dataset.v===v)});
  retracer();majFigs();majFleche()}
function taille(i){
  tzi=i;R.style.setProperty('--dz',TZ[i]);
  W.querySelector('[data-tz="-1"]').classList.toggle('bout',i===0);
  W.querySelector('[data-tz="1"]').classList.toggle('bout',i===TZ.length-1);
  retracer()}

/* ── État retenu ── */
function etat(liste){return {v:1,ampleur:amp,epaisseur:ep,taille:TZ[tzi],ouvertes:liste||SECS.filter(estOuv).map(function(s){return s.dataset.cle})}}
function sauver(liste){
  var e=etat(liste);
  try{localStorage.setItem(CLE,JSON.stringify(e))}catch(x){}
  if(CADRE){try{parent.postMessage({lvEtat:e},'*')}catch(x){}}}
function appliquer(e){
  if(!e||typeof e!=='object')return;
  var a=[1,2,3].indexOf(e.ampleur)>=0?e.ampleur:2,v=[1,2,3].indexOf(e.epaisseur)>=0?e.epaisseur:3,ti=TZ.indexOf(e.taille);
  if(ti<0)ti=TZ.length-1;
  var ou=Array.isArray(e.ouvertes)?e.ouvertes:[];
  B.classList.add('nt');
  SECS.forEach(function(s){stop(s);var o=ou.indexOf(s.dataset.cle)>=0;
    s.classList.toggle('dpl',o);s.classList.toggle('ouv',o);s._rep.style.visibility=o?'visible':'hidden';s._rep.style.overflow=''});
  G_CIBLE=null;tzi=ti;R.style.setProperty('--dz',TZ[ti]);
  W.querySelector('[data-tz="-1"]').classList.toggle('bout',ti===0);
  W.querySelector('[data-tz="1"]').classList.toggle('bout',ti===TZ.length-1);
  lecture(a,v);
  void B.offsetHeight;B.classList.remove('nt')}

/* ── Gestes ── */
W.addEventListener('click',function(e){
  var t=e.target;if(t&&t.nodeType!==1)t=t.parentElement;if(!t)return;
  var b=t.closest('[data-amp]');if(b){GESTE=true;lecture(+b.dataset.amp,ep);sauver();return}
  b=t.closest('[data-v]');if(b){GESTE=true;lecture(amp,+b.dataset.v);sauver();return}
  b=t.closest('[data-tz]');if(b){GESTE=true;var d=+b.dataset.tz;taille(d===0?TZ.length-1:Math.max(0,Math.min(TZ.length-1,tzi+d)));sauver();return}
  if(t.closest('.glb')){GESTE=true;globale();return}
  var fp=t.closest('.fpan-in');if(fp){if(window.getSelection&&String(window.getSelection()))return;retourFig(fp.closest('.lib'));return}
  var fe=t.closest('.fel');if(fe&&W.contains(fe)){montrerFig(fe.closest('.lib'),fe);return}
  var xi=t.closest('.xin');if(xi){if(window.getSelection&&String(window.getSelection()))return;var dx=xi.parentElement;while(dx&&W.contains(dx)&&!(dx._xw&&dx._xw.contains(xi)))dx=dx.parentElement;if(dx&&dx._xw)deplier(dx);return}
  var s=t.closest('.sgn');if(s){deplier(s.closest('.sec'));return}
  var h=t.closest('.sch');if(h){GESTE=true;basculer(h.parentNode);return}
  var dp=t.closest('.dep');if(dp&&W.contains(dp))deplier(dp)});
W.addEventListener('keydown',function(e){
  if((e.key==='Enter'||e.key===' ')&&e.target===GLB){e.preventDefault();GESTE=true;globale()}
  var fk=e.target.closest&&e.target.closest('.fel');if(fk&&(e.key==='Enter'||e.key===' ')){e.preventDefault();montrerFig(fk.closest('.lib'),fk)}});
D.addEventListener('touchstart',function(){},{passive:true});

var lw=window.innerWidth,lh=window.innerHeight,rt;
window.addEventListener('resize',function(){
  var w=window.innerWidth,h=window.innerHeight;
  if(w===lw&&Math.abs(h-lh)<150)return;lw=w;lh=h;clearTimeout(rt);rt=setTimeout(retracer,120)});
D.addEventListener('visibilitychange',function(){if(D.visibilityState==='hidden')sauver()});
window.addEventListener('pagehide',function(){sauver()});

/* ── Démarrage ── */
var ST=D.createElement('style');ST.textContent='body.nt *,body.nt *::before,body.nt *::after{transition:none !important}';D.head.appendChild(ST);
var ETAT=null;try{ETAT=JSON.parse(localStorage.getItem(CLE))}catch(x){}
lecture(2,3);taille(TZ.length-1);
if(ETAT)appliquer(ETAT);
window.addEventListener('message',function(ev){
  if(ev.source!==parent)return;var d=ev.data;
  if(d&&typeof d==='object'&&d.lvEtat&&!GESTE){ETAT=d.lvEtat;appliquer(ETAT)}});
if(CADRE){try{parent.postMessage({lvEtatVoulu:1},'*')}catch(x){}}
[150,500,1200].forEach(function(t){setTimeout(function(){if(GESTE)return;if(ETAT)appliquer(ETAT);else retracer()},t)});
if(D.fonts&&D.fonts.ready)D.fonts.ready.then(function(){retracer()});

/* volets : un toucher sur le titre ou le texte ouvre ou referme le volet seul */
D.addEventListener('click',function(e){var t=e.target;if(t&&t.nodeType!==1)t=t.parentElement;var s=t&&t.closest&&t.closest('.sx');if(!s)return;
  e.stopPropagation();e.preventDefault();s.classList.toggle('on')},true);

/* coin coupé : une carte qui partage sa ligne avec une autre le garde, une carte seule sur sa ligne prend des angles droits */
function coins(){var C=[].slice.call(W.querySelectorAll('.crd')),Rc=C.map(function(c){return c.getBoundingClientRect()});
  C.forEach(function(c,i){var a=Rc[i],b=c.querySelector('.crd-b');if(!b||a.width===0)return;
    var cote=Rc.some(function(r,j){return j!==i&&r.width>0&&r.top<a.bottom-4&&a.top<r.bottom-4&&(r.right<=a.left+1||r.left>=a.right-1)});
    b.classList.toggle('droit',!cote)})}
function coinsBientot(){[0,120,400,800].forEach(function(t){setTimeout(coins,t)})}
coinsBientot();window.addEventListener('load',coinsBientot);window.addEventListener('resize',coinsBientot);D.addEventListener('click',coinsBientot);
})();

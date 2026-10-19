/* ══════════════════════════════════════════════════════════════════════
   MOTEUR DES LIVRES : SCRIPT
   1. Construction : lit le contenu (<template id="contenu">), bâtit la
      couverture, les séparateurs de partie, les chapitres et le sommaire.
   2. Pagination : 330 mots par page, chaque section ouvre une page, une
      pagination propre à chacune des neuf lectures (clé ampleur+épaisseur).
   3. Lecture : ampleur, épaisseur, taille du texte, sommaire, champ de page,
      barre de progression, suivi de la section en cours.
   4. État retenu : stockage local ('livre-etat-' + identifiant) et page
      hôte par messages {lvEtat} / {lvEtatVoulu}.
   Les positions sont mises en cache et relues par recherche dichotomique :
   le défilement reste fluide sur un livre de plusieurs centaines de pages.
   ══════════════════════════════════════════════════════════════════════ */
(function(){
'use strict';
var D=document,B=D.body,R=D.documentElement;
var T=D.getElementById('contenu'),L=T&&T.content.querySelector('livre');
if(!L)return;
var TZ=[.85,.925,1,1.08,1.16,1.25],TZD=TZ[TZ.length-1];
var LIMITE=330,HAUT=120;
var CLES=['11','12','13','21','22','23','31','32','33'];
var PAL=['#ff4d6d','#3fa7ff','#ffb627','#35e0a1','#b77bff','#ff7f3f','#22d3ee','#ff5bd6'];
var NEUTRE='#f2f2f2';
var CADRE=(function(){try{return parent!==window}catch(e){return true}})();
var DOUX=!matchMedia('(prefers-reduced-motion:reduce)').matches;

/* ── outils ── */
function el(tag,cls,html){var e=D.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e}
function kids(s){return [].filter.call(s.children,function(){return true})}
function lv(s,k){var v=s.getAttribute(k)||s.getAttribute('data-'+k);return v==='2'?2:v==='3'?3:1}
function pose(e,a,n){if(a>1)e.setAttribute('data-a',a);if(n>1)e.setAttribute('data-n',n)}
function slug(s){return (s||'livre').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
  .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)||'livre'}
function texte(h){var t=el('div',null,h||'');return t.textContent.replace(/\s+/g,' ').trim()}
var MOT=/[0-9A-Za-z\u00c0-\u00ff]/;
function mots(t){var n=0,w=t.split(/[\s\u00a0\u202f]+/);for(var i=0;i<w.length;i++)if(MOT.test(w[i]))n++;return n}
function pad(n){return n<10?'0'+n:''+n}

/* nombres et rangs en toutes lettres */
var U=['zéro','un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix','onze','douze','treize',
  'quatorze','quinze','seize','dix-sept','dix-huit','dix-neuf'];
var DIZ=['','dix','vingt','trente','quarante','cinquante','soixante'];
function lettres(n){
  if(n<20)return U[n];
  if(n<100){var d=Math.floor(n/10),u=n%10;
    if(d===7)return n===71?'soixante et onze':'soixante-'+U[n-60];
    if(d===8)return u?'quatre-vingt-'+U[u]:'quatre-vingts';
    if(d===9)return 'quatre-vingt-'+U[n-80];
    return DIZ[d]+(u===0?'':u===1?' et un':'-'+U[u])}
  if(n<1000){var c=Math.floor(n/100),r=n%100;
    return (c>1?U[c]+' cent':'cent')+(r?' '+lettres(r):(c>1?'s':''))}
  return String(n)}
function rang(n){
  if(n===1)return 'Première';
  var w=lettres(n).replace(/(vingts|cents)$/,function(m){return m.slice(0,-1)});
  if(/cinq$/.test(w))w+='u';else if(/neuf$/.test(w))w=w.slice(0,-1)+'v';else if(/e$/.test(w))w=w.slice(0,-1);
  w+='ième';return w.charAt(0).toUpperCase()+w.slice(1)}

/* ══ 1. CONSTRUCTION ══ */
var MAIN=D.getElementById('lecture'),UL=D.getElementById('toc-liste'),TOC=D.getElementById('toc');
var TITRE=L.getAttribute('titre')||'Livre';
var CLE='livre-etat-'+slug(texte(TITRE));
D.getElementById('surtitre').innerHTML=L.getAttribute('surtitre')||'Un livre';
D.getElementById('titre').innerHTML=TITRE;
var st=L.getAttribute('sous-titre');
if(st)D.getElementById('soustitre').innerHTML=st;else D.getElementById('soustitre').remove();
var bd=L.getAttribute('bandeau');
D.getElementById('brand').innerHTML='<b>'+texte(TITRE)+'</b>'+(bd?'\u2002\u00b7\u2002'+texte(bd):'');

var SECS=[];          /* sections dans l'ordre : {el,id,a,n,blocs,li,num,part,lab,kick} */
var nch=0,npt=0,couleurs=[];

/* un bloc du texte : élément rendu, mots, niveaux, porteur d'un numéro de page */
function bloc(e,a,n,porteur){return {el:e,mots:mots(e.textContent),a:a,n:n,porteur:porteur}}

function citation(s){
  var f=el('figure','verset'),ref=s.getAttribute('ref');
  var ps=kids(s).filter(function(c){return c.localName==='p'});
  if(!ps.length){var p=D.createElement('p');while(s.firstChild)p.appendChild(s.firstChild);ps=[p]}
  ps.forEach(function(p,i){
    var v=el('p','v');while(p.firstChild)v.appendChild(p.firstChild);
    var t=v.textContent.trim();
    if(i===0&&t.charAt(0)!=='\u00ab')v.insertBefore(D.createTextNode('\u00ab\u00a0'),v.firstChild);
    if(i===ps.length-1&&t.charAt(t.length-1)!=='\u00bb'&&!/\u00bb[.!?\u2026]?$/.test(t))v.appendChild(D.createTextNode('\u00a0\u00bb'));
    f.appendChild(v)});
  if(ref)f.appendChild(el('p','ref',ref));
  return f}

function chapitre(s,part){
  var lab=s.getAttribute('etiquette'),pa=part?part.a:1,pn=part?part.n:1;
  var a=Math.max(lv(s,'a'),pa),n=Math.max(lv(s,'n'),pn);
  var sec=el('section','chap');sec.id='ch'+(++nch);
  var acc=part?part.couleur:NEUTRE;sec.style.setProperty('--a',acc);
  pose(sec,a,n);
  var cn=el('p','chap-num');if(lab)cn.innerHTML=lab;sec.appendChild(cn);
  var h=el('h2',null,s.getAttribute('titre')||'');sec.appendChild(h);
  var blocs=[bloc(h,1,1,true)];
  kids(s).forEach(function(c){
    if(c.localName==='libre')return;
    var nm=c.localName,ba=lv(c,'a'),bn=lv(c,'n'),e,porteur=true;
    if(nm==='p'){e=c;c.removeAttribute('a');c.removeAttribute('n')}
    else if(nm==='chapo'){e=el('p','lede');while(c.firstChild)e.appendChild(c.firstChild)}
    else if(nm==='intertitre'){e=el('h3');while(c.firstChild)e.appendChild(c.firstChild)}
    else if(nm==='citation'){e=citation(c);porteur=false}
    else{e=c;porteur=false;c.removeAttribute('a');c.removeAttribute('n')}
    pose(e,ba,bn);sec.appendChild(e);blocs.push(bloc(e,ba,bn,porteur))});
  MAIN.appendChild(sec);
  var li=el('li',lab?'toc-front':'toc-chap');li.setAttribute('data-id',sec.id);li.style.setProperty('--a',acc);pose(li,a,n);
  var an=el('a');an.href='#'+sec.id;
  var tn=null;if(!lab){tn=el('span','tn');an.appendChild(tn)}
  an.appendChild(el('span',null,s.getAttribute('titre')||''));
  var tp=el('span','tp');an.appendChild(tp);li.appendChild(an);UL.appendChild(li);
  var o={el:sec,id:sec.id,a:a,n:n,blocs:blocs,li:li,tp:tp,tn:tn,num:!lab,lab:cn,acc:acc};
  SECS.push(o);return o}

function partie(s){
  var k=npt++,c=s.getAttribute('couleur')||PAL[k%PAL.length];couleurs.push(c);
  var part={couleur:c,a:lv(s,'a'),n:lv(s,'n')};
  var sec=el('section','partsep');sec.id='p'+(k+1);sec.style.setProperty('--a',c);
  var kick=el('p','part-kicker'),h=el('h2','part-title',s.getAttribute('titre')||'');
  sec.appendChild(kick);sec.appendChild(h);sec.appendChild(el('div','sep'));
  var blocs=[bloc(h,1,1,true)],rs=s.getAttribute('resume');
  if(rs){var pb=el('p','part-blurb',rs);sec.appendChild(pb);blocs.push(bloc(pb,1,1,true))}
  MAIN.appendChild(sec);
  var li=el('li','toc-part');li.style.setProperty('--a',c);
  var an=el('a');an.href='#'+sec.id;an.appendChild(el('span',null,s.getAttribute('titre')||''));
  var tp=el('span','tp');an.appendChild(tp);li.appendChild(an);UL.appendChild(li);
  var o={el:sec,id:sec.id,a:3,n:3,blocs:blocs,li:li,tp:tp,num:false,kick:kick,acc:c,partie:true};
  SECS.push(o);
  var ch=kids(s).filter(function(x){return x.localName==='chapitre'}).map(function(x){return chapitre(x,part)});
  /* le séparateur paraît dès que l'un de ses chapitres paraît */
  if(ch.length){o.a=Math.min.apply(null,ch.map(function(x){return x.a}));o.n=Math.min.apply(null,ch.map(function(x){return x.n}))}
  else{o.a=part.a;o.n=part.n}
  pose(sec,o.a,o.n);pose(li,o.a,o.n)}

kids(L).forEach(function(c){
  if(c.localName==='partie')partie(c);
  else if(c.localName==='chapitre')chapitre(c,null)});
D.getElementById('filet').style.background=couleurs.length
  ?'linear-gradient(90deg,'+couleurs.join(',')+(couleurs.length===1?','+couleurs[0]+' 40%':'')+',transparent)'
  :'linear-gradient(90deg,'+NEUTRE+',transparent)';
T.remove();

/* ══ 2. PAGINATION : une passe par lecture, sur les blocs qu'elle retient ══ */
var PAG={},TOT={};
CLES.forEach(function(k){
  var A=+k[0],V=+k[1],marques=[],depart={},page=0;
  SECS.forEach(function(s){
    if(s.a>A||s.n>V)return;
    page++;depart[s.id]=page;
    var compte=0,report=false,premier=true;
    s.blocs.forEach(function(b){
      if(b.a>A||b.n>V)return;
      if(premier){marques.push([b.el,page]);premier=false;compte=b.mots;return}
      if(b.porteur&&(report||(compte&&compte+b.mots>LIMITE))){page++;compte=0;report=false;marques.push([b.el,page])}
      else if(!b.porteur&&compte+b.mots>LIMITE)report=true;
      compte+=b.mots});
  });
  PAG[k]={marques:marques,depart:depart};TOT[k]=page});

/* ══ 3. LECTURE ══ */
var btn=D.getElementById('tocbtn'),mask=D.querySelector('.tocmask'),bar=D.querySelector('.bar i'),
    pgin=D.getElementById('pgin'),pgtot=D.getElementById('pgtot');
var amp='2',niv='3',tz=TZD,pgs=[],nbpg=0;
var vis=[],visTop=[],pgTop=[],blocsVis=[],courant=-1;
function wide(){return innerWidth>980}
function cle(){return amp+niv}

/* sommaire */
function sync(){
  var hid=wide()?B.classList.contains('tochid'):!B.classList.contains('tocopen');
  btn.setAttribute('aria-expanded',hid?'false':'true')}
function ferme(){B.classList.remove('tocopen');sync()}
btn.addEventListener('click',function(){
  if(wide())B.classList.toggle('tochid');else B.classList.toggle('tocopen');
  sync();ditEtat();setTimeout(mesure,320)});
mask.addEventListener('click',ferme);
TOC.addEventListener('click',function(e){if(e.target.closest('a')&&!wide())ferme()});

/* mesures mises en cache : sommet de chaque section et de chaque numéro de page */
function haut(e){return e.getBoundingClientRect().top+scrollY}
function mesure(){
  visTop=vis.map(function(s){return haut(s.el)});
  pgTop=pgs.map(haut);
  courant=-1;onScroll()}
function dernier(tops,y){var lo=0,hi=tops.length-1,r=-1;
  while(lo<=hi){var m=(lo+hi)>>1;if(tops[m]<=y){r=m;lo=m+1}else hi=m-1}return r}

/* repère de lecture : le bloc qui passe sous la barre haute, et la part de lui déjà lue */
function repere(){
  var lo=0,hi=blocsVis.length-1,r=-1;
  while(lo<=hi){var m=(lo+hi)>>1,bb=blocsVis[m].getBoundingClientRect();
    if(bb.bottom>60){r=m;hi=m-1}else lo=m+1}
  if(r<0)return null;
  var e=blocsVis[r],rc=e.getBoundingClientRect();
  return {el:e,f:rc.height?(60-rc.top)/rc.height:0}}
function ramene(p){
  if(!p)return false;
  if(p.el.offsetParent===null)return false;
  var rc=p.el.getBoundingClientRect();
  scrollTo(0,Math.max(0,scrollY+rc.top+Math.max(0,p.f)*rc.height-60));return true}

function vue(a,v,garder){
  var place=garder?repere():null,ancre=garder?section():'';
  amp=String(a);niv=String(v);
  var A=+amp,V=+niv,k=cle(),i=(A-1)*3+(V-1);
  B.classList.remove('a1','a2','a3','v1','v2','v3');B.classList.add('a'+amp,'v'+niv);
  [].forEach.call(D.querySelectorAll('.vers span[data-amp]'),function(sp){
    var x=sp.getAttribute('data-amp');sp.classList.toggle('on',x===amp);sp.querySelector('b').textContent=TOT[x+niv]+' p.'});
  [].forEach.call(D.querySelectorAll('.vers span[data-v]'),function(sp){
    var x=sp.getAttribute('data-v');sp.classList.toggle('on',x===niv);sp.querySelector('b').textContent=TOT[amp+x]+' p.'});
  /* numéros de chapitre et rangs de partie, comptés dans la lecture choisie */
  var nc=0,np=0;vis=[];blocsVis=[];
  SECS.forEach(function(s){
    var ok=s.a<=A&&s.n<=V,d=PAG[k].depart[s.id];
    s.tp.textContent=d?d:'';
    if(!ok)return;
    vis.push(s);
    s.blocs.forEach(function(b){if(b.a<=A&&b.n<=V)blocsVis.push(b.el)});
    if(s.partie){np++;s.kick.textContent=rang(np)+' partie'}
    else if(s.num){nc++;s.lab.textContent='Chapitre '+lettres(nc);if(s.tn)s.tn.textContent=pad(nc)}});
  /* marqueurs de page de la lecture active */
  [].forEach.call(MAIN.querySelectorAll('.pg'),function(p){p.remove()});
  pgs=PAG[k].marques.map(function(m){
    var s=el('span','pg pg'+k+' on');s.id='pg'+k+'-'+m[1];s.setAttribute('data-pg',m[1]);s.textContent=m[1];
    m[0].insertBefore(s,m[0].firstChild);return s});
  nbpg=TOT[k];pgtot.textContent=nbpg;
  if(garder&&!ramene(place)&&ancre){
    /* la section en cours a quitté la lecture : on va à la plus proche qui la précède */
    var j=0;while(j<SECS.length&&SECS[j].id!==ancre)j++;
    while(j>0&&(j>=SECS.length||SECS[j].el.offsetParent===null))j--;
    if(SECS[j])SECS[j].el.scrollIntoView({block:'start'})}
  mesure()}
function choix(sp){
  if(sp.hasAttribute('data-amp'))vue(sp.getAttribute('data-amp'),niv,true);
  else vue(amp,sp.getAttribute('data-v'),true);
  ditEtat()}
D.addEventListener('click',function(e){var sp=e.target.closest&&e.target.closest('.vers span');if(sp)choix(sp)});
D.addEventListener('keydown',function(e){
  if(e.key!=='Enter'&&e.key!==' ')return;
  var sp=e.target.closest&&e.target.closest('.vers span');if(sp){e.preventDefault();choix(sp)}});

/* taille du texte : le facteur --lvz, la place du lecteur gardée */
function taille(v,garder){
  var place=garder?repere():null;
  tz=v;R.style.setProperty('--lvz',v);
  var i=TZ.indexOf(v);
  [].forEach.call(D.querySelectorAll('[data-tz]'),function(t){
    var d=t.getAttribute('data-tz');t.classList.toggle('bout',(d==='-1'&&i===0)||(d==='1'&&i===TZ.length-1))});
  if(place)ramene(place)}
D.addEventListener('click',function(e){
  var t=e.target.closest?e.target.closest('[data-tz]'):null;if(!t)return;
  var d=t.getAttribute('data-tz'),v=TZD;
  if(d!=='0'){var i=TZ.indexOf(tz);if(i<0)i=TZ.length-1;i=Math.max(0,Math.min(TZ.length-1,i+(d==='1'?1:-1)));v=TZ[i]}
  taille(v,true);mesure();ditEtat()});

/* aller à une page : dans un cadre qui ne défile pas, la page hôte porte la lecture */
function amene(e,doux){
  if(CADRE&&R.scrollHeight<=innerHeight+1){
    try{parent.postMessage({lvAncre:Math.round(haut(e)-70)},'*')}catch(x){}return}
  e.scrollIntoView({block:'start',behavior:doux&&DOUX?'smooth':'auto'})}
function aller(n){
  n=Math.max(1,Math.min(nbpg,parseInt(n,10)||1));
  var e=D.getElementById('pg'+cle()+'-'+n);
  if(e){amene(e,true);e.classList.add('hit');setTimeout(function(){e.classList.remove('hit')},1500);if(!wide())ferme()}
  return n}
pgin.addEventListener('focus',function(){pgin.select()});
pgin.addEventListener('keydown',function(e){
  if(e.key==='Enter'){e.preventDefault();pgin.value=aller(pgin.value);pgin.blur()}
  if(e.key==='Escape')pgin.blur()});
pgin.addEventListener('change',function(){pgin.value=aller(pgin.value)});
pgin.addEventListener('blur',function(){onScroll()});

/* défilement : progression, section en cours, page en cours */
var rafS=0;
function onScroll(){
  var h=R.scrollHeight-innerHeight,y=scrollY+HAUT;
  bar.style.width=(h>0?Math.min(100,scrollY/h*100):0)+'%';
  var c=dernier(visTop,y),s=vis[c<0?0:c];
  if(s&&c!==courant){
    courant=c;
    /* le sommaire met en valeur le chapitre en cours (ou celui qui précède un séparateur) */
    var j=Math.max(c,0);while(j>0&&vis[j].partie)j--;
    var on=vis[j]&&!vis[j].partie?vis[j].li:null;
    SECS.forEach(function(x){x.li.classList.toggle('on',x.li===on)});
    R.style.setProperty('--acur',s.acc);
    if(on&&wide()&&!B.classList.contains('tochid')){
      var r=on.getBoundingClientRect(),t=TOC.getBoundingClientRect();
      if(r.top<t.top+40||r.bottom>t.bottom-40)TOC.scrollTop+=(r.top+r.height/2)-(t.top+t.height/2)}}
  if(nbpg&&D.activeElement!==pgin){
    var p=dernier(pgTop,y),v=String(p<0?1:pgs[p].getAttribute('data-pg'));
    if(pgin.value!==v)pgin.value=v}}
function section(){var c=dernier(visTop,scrollY+HAUT);return c<0?'':vis[c].id}
function pageCourante(){var p=dernier(pgTop,scrollY+HAUT);return p<0?1:+pgs[p].getAttribute('data-pg')}

/* ══ 4. ÉTAT RETENU ══ */
var etatPlan=0,reprises=[],touche=false;
function etat(){return {v:1,ampleur:amp,epaisseur:niv,taille:tz,
  sommaire:B.classList.contains('tochid')?1:0,section:section(),page:pageCourante()}}
function ditEtat(){
  clearTimeout(etatPlan);etatPlan=0;var e=etat();
  try{localStorage.setItem(CLE,JSON.stringify(e))}catch(x){}
  if(CADRE){try{parent.postMessage({lvEtat:e},'*')}catch(x){}}}
function planEtat(){if(etatPlan)return;etatPlan=setTimeout(ditEtat,250)}
function poseEtat(e,sansPlace){
  if(!e||e.v!==1)return;
  taille(TZ.indexOf(e.taille)<0?TZD:e.taille,false);
  vue(/^[123]$/.test(e.ampleur)?e.ampleur:amp,/^[123]$/.test(e.epaisseur)?e.epaisseur:niv,false);
  B.classList.toggle('tochid',e.sommaire===1);sync();
  if(!sansPlace){
    var s=e.section&&D.getElementById(e.section),pe=e.page&&D.getElementById('pg'+cle()+'-'+e.page);
    if(pe&&s&&pe.closest('section')===s)pe.scrollIntoView({block:'start'});
    else if(s&&s.offsetParent!==null)s.scrollIntoView({block:'start'})}
  mesure()}
function arrete(){reprises.forEach(clearTimeout);reprises=[]}
function reprend(e){
  arrete();poseEtat(e);
  reprises=[150,500,1200].map(function(t){return setTimeout(function(){poseEtat(e)},t)})}
function cloture(){touche=true;arrete()}
['wheel','touchstart','keydown','pointerdown'].forEach(function(n){addEventListener(n,cloture,{passive:true,once:true})});
addEventListener('message',function(ev){
  var d=ev.data;if(ev.source===parent&&CADRE&&!touche&&d&&d.lvEtat)reprend(d.lvEtat)});

/* adresse citable : #pg33-42 ouvre la page 42 de la lecture complète intégrale */
function adresse(){
  var m=/^#pg([123])([123])-(\d+)$/.exec(location.hash||'');if(!m)return false;
  vue(m[1],m[2],false);var n=aller(m[3]);pgin.value=n;return true}

var garde=null;try{garde=JSON.parse(localStorage.getItem(CLE)||'null')}catch(x){}
taille(TZD,false);
vue(amp,niv,false);
sync();
if(/^#pg/.test(location.hash||'')){
  if(garde)poseEtat(garde,true);
  adresse();
  [150,500,1200].forEach(function(t){reprises.push(setTimeout(function(){mesure();adresse()},t))})}
else if(garde)reprend(garde);
if(CADRE){try{parent.postMessage({lvEtatVoulu:1},'*')}catch(x){}}
addEventListener('hashchange',function(){if(adresse())ditEtat()});
addEventListener('visibilitychange',function(){if(D.visibilityState==='hidden')ditEtat()});
addEventListener('pagehide',ditEtat);
addEventListener('scroll',function(){
  if(!rafS)rafS=requestAnimationFrame(function(){rafS=0;onScroll()});planEtat()},{passive:true});
var rafM=0;function planMesure(){if(!rafM)rafM=requestAnimationFrame(function(){rafM=0;mesure()})}
addEventListener('resize',function(){sync();planMesure()});
if(window.ResizeObserver)new ResizeObserver(planMesure).observe(MAIN);
if(D.fonts&&D.fonts.ready)D.fonts.ready.then(planMesure);
mesure();
})();

/* coin coupé selon la disposition : un cadre posé à côté d'un autre sur la même ligne porte le coin coupé (classe cote),
   un cadre seul sur sa ligne, au-dessus ou au-dessous d'un autre, a des angles droits (classe seul) */
(function(){
var SEL='figure.verset';
function coins(){var C=[].slice.call(document.querySelectorAll(SEL)),R=C.map(function(c){return c.getBoundingClientRect()});
  C.forEach(function(c,i){var a=R[i];if(a.width===0)return;
    var cote=R.some(function(r,j){return j!==i&&r.width>0&&r.top<a.bottom-4&&a.top<r.bottom-4&&(r.right<=a.left+1||r.left>=a.right-1)});
    c.classList.toggle('cote',cote);c.classList.toggle('seul',!cote)})}
function bientot(){[0,120,400,800].forEach(function(t){setTimeout(coins,t)})}
bientot();addEventListener('load',bientot);addEventListener('resize',bientot);document.addEventListener('click',bientot);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(bientot);
})();

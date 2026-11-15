/* ══════════════════════════════════════════════════════════════════════
   MOTEUR DES COURS : SCRIPT
   0. Copie de la source, avant tout geste (pour le bouton Enregistrer).
   1. Construction : lit le contenu (gabarit « contenu ») et bâtit les
      pages de chaque cours, la barre haute et le sommaire.
   2. Comportement : pages, dépli, mots clés, autoévaluation, progression,
      taille du texte, état retenu (clé 'cours-html:' + sujet), messages
      vers la page hôte, enregistrement du fichier à jour.
   ══════════════════════════════════════════════════════════════════════ */
(function(){
'use strict';
var D=document,R=D.documentElement,W=D.getElementById('w');

/* ══ 0. LA SOURCE TELLE QU'ELLE A ÉTÉ LIVRÉE ══ */
var SOURCE='<!DOCTYPE html>\n'+R.outerHTML;

var CADRE=(function(){try{return window.parent!==window}catch(e){return true}})();
var RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
var E_IN='cubic-bezier(.2,.7,.3,1)',E_OUT='cubic-bezier(.4,0,1,1)';
var TZ=[.85,.925,1,1.08,1.16,1.25],TZ0=5;
/* couleurs des leçons, du froid vers le chaud */
var PAL=['#7a5cff','#4d7dff','#3da8ff','#1fd0ea','#22e0b0','#3ee87a','#b4e83a','#ffd23a','#ffaa22','#ff7a2f','#ff4d4d','#ff3b6e'];
if(CADRE)R.classList.add('cadre');

/* ── outils ── */
function el(tag,cls,html){var e=D.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e}
function kids(n,nom){return [].filter.call(n.children,function(c){return !nom||c.localName===nom})}
function un(n,nom){return kids(n,nom)[0]||null}
function at(n,a){return n&&n.getAttribute(a)||''}
function txt(h){var t=el('div',null,h||'');return t.textContent.replace(/\s+/g,' ').trim()}
function rgb(h){h=(h||'').trim().replace('#','');if(h.length===3)h=h.replace(/(.)/g,'$1$1');
  var n=parseInt(h,16);if(isNaN(n)||h.length!==6)return '255 255 255';return [(n>>16)&255,(n>>8)&255,n&255].join(' ')}
function teinte(e,hex){e.style.setProperty('--a',hex);e.style.setProperty('--r',rgb(hex))}
function deux(n){return (n<10?'0':'')+n}
function romain(n){var v=[[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']],s='';v.forEach(function(p){while(n>=p[0]){s+=p[1];n-=p[0]}});return s}
function slug(s){return (s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)}
var UNITES=['zéro','une','deux','trois','quatre','cinq','six','sept','huit','neuf','dix','onze','douze','treize','quatorze','quinze','seize','dix-sept','dix-huit','dix-neuf'];
var DIZ={2:'vingt',3:'trente',4:'quarante',5:'cinquante',6:'soixante'};
function lettres(n){if(n<20)return UNITES[n];var d=Math.floor(n/10),u=n%10;
  if(d<7&&DIZ[d])return DIZ[d]+(u===1?' et une':u?'-'+UNITES[u]:'');return String(n)}
function lecons(n){return lettres(n)+(n>1?' leçons':' leçon')}
function anim(e,k,o){if(!e||!e.animate)return null;o=o||{};if(RM){o.duration=.01;o.delay=0}
  var a=e.animate(k,o);a.onfinish=function(){a.cancel()};return a}
function couleurs(n){var r=[],i;for(i=0;i<n;i++)r.push(n>PAL.length?PAL[i%PAL.length]:PAL[n<2?0:Math.round(i*(PAL.length-1)/(n-1))]);return r}
var CHECK='<svg viewBox="0 0 18 18" aria-hidden="true"><path d="M4.2 9.4l3.1 3.1 6.5-7"/></svg>';

/* ══ 1. CONSTRUCTION ══ */
var T=D.getElementById('contenu').content;
var F=T.querySelector('fichier');
var SRC=[].slice.call(T.querySelectorAll('cours'));
var SUJET=at(F,'sujet')||at(SRC[0],'titre')||'Cours';
var CLE='cours-html:'+(slug(at(SRC[0],'titre'))||'cours');
var COURS=[],PAGES=[],CODE=null;

/* un bloc de texte : les paragraphes restent, le texte nu devient paragraphe */
function bloc(n,dst){
  var aBloc=[].some.call(n.childNodes,function(c){return c.nodeType===1&&/^(p|ul|ol|table|h4|div|blockquote)$/.test(c.localName)});
  if(aBloc){while(n.firstChild)dst.appendChild(n.firstChild)}
  else{var p=el('p');while(n.firstChild)p.appendChild(n.firstChild);if(p.textContent.trim()||p.children.length)dst.appendChild(p)}
  return dst}
function etiquette(nom,g){var l=el('div','lab cc',nom);l.setAttribute('data-g',g);return l}
function depli(cont,lib,lib2,cls){
  var b=el('button','btr cc',lib),dp=el('div','dp'+(cls?' '+cls:'')),r=el('div'),i=el('div','dpi rpn');
  b.type='button';b.setAttribute('aria-expanded','false');
  if(cont)bloc(cont,i);r.appendChild(i);dp.appendChild(r);
  b._dp=dp;b._lib=[lib,lib2];return {b:b,dp:dp}}
function tableau(t){
  var tb=el('table','tb'),w=el('div','tbw'),noms=[];
  var rows=[].slice.call(t.querySelectorAll('tr'));
  if(!rows.length)return w;
  var h=rows[0];if([].every.call(h.children,function(c){return c.localName==='th'})){
    noms=[].map.call(h.children,function(c){return c.textContent.trim()});
    var th=el('thead');th.appendChild(h);tb.appendChild(th);rows.shift()}
  var bd=el('tbody');rows.forEach(function(r){[].forEach.call(r.children,function(c,i){c.setAttribute('data-l',noms[i]||'')});bd.appendChild(r)});
  tb.appendChild(bd);w.appendChild(tb);return w}

/* le corps d'une partie : texte libre et encadrés */
function corps(n,dst,C){
  [].slice.call(n.childNodes).forEach(function(c){
    if(c.nodeType!==1){if(c.nodeType===3&&c.textContent.trim()){var p=el('p');p.appendChild(c);dst.appendChild(p)}else if(c.nodeType===3)dst.appendChild(c);return}
    var k=c.localName,b;
    if(k==='definition'){b=el('div','bx def');b.appendChild(etiquette('Définition','■'));
      var tm=at(c,'terme');bloc(c,b);
      if(tm){var p0=b.querySelector('p')||b.appendChild(el('p'));var s=el('b','terme',tm);p0.insertBefore(D.createTextNode(' : '),p0.firstChild);p0.insertBefore(s,p0.firstChild)}
      dst.appendChild(b)}
    else if(k==='exemple'){b=el('div','bx ex');b.appendChild(etiquette('Exemple','◆'));dst.appendChild(bloc(c,b))}
    else if(k==='attention'){b=el('div','bx att');b.appendChild(etiquette('Attention','▲'));dst.appendChild(bloc(c,b))}
    else if(k==='retenir'){b=el('div','bx ret');b.appendChild(etiquette('À retenir','●'));dst.appendChild(bloc(c,b))}
    else if(k==='reperes'){var rs=kids(c,'repere');b=el('div','bx rep');b.appendChild(etiquette(rs.length>1?'Repères':'Repère','◇'));
      var f=el('div','frise');rs.forEach(function(r){var it=el('div','rp');it.appendChild(el('span','rp-t',at(r,'titre')));
        var x=el('div','rp-x');while(r.firstChild)x.appendChild(r.firstChild);it.appendChild(x);f.appendChild(it)});
      b.appendChild(f);dst.appendChild(b)}
    else if(k==='verifie'){b=el('div','bx ver');b.appendChild(etiquette('Vérifie','○'));
      var rep=un(c,'reponse');if(rep)rep.remove();var q=el('div','qst');bloc(c,q);b.appendChild(q);
      var d=depli(rep,'Voir la réponse','Masquer la réponse');b.appendChild(d.b);b.appendChild(d.dp);dst.appendChild(b)}
    else if(k==='cartes'){var g=el('div','grille g250 cartes'),i=0;
      kids(c,'carte').forEach(function(k2){i++;var cl=el('div','cl');cl.appendChild(el('span','tag',at(k2,'tag')||deux(i)));
        cl.appendChild(el('div','cl-t',at(k2,'titre')));var ds=el('div','cl-d');while(k2.firstChild)ds.appendChild(k2.firstChild);
        if(ds.textContent.trim())cl.appendChild(ds);g.appendChild(cl)});dst.appendChild(g)}
    else if(k==='table'){dst.appendChild(tableau(c))}
    else if(k==='libre'){b=el('div','libre');while(c.firstChild)b.appendChild(c.firstChild);dst.appendChild(b)}
    else dst.appendChild(c)})
  return dst}

function intertitre(nom,id){var t=el('div','it',nom);if(id)t.id=id;return t}
function note(t){return el('div','it-n',t)}
function exercice(x,id,num,col,C){
  var e=el('div','exo');e.id=id;var h=el('div','exo-h');
  h.appendChild(el('span','exo-n','Exercice '+num));
  var nv=+at(x,'niveau')||1,ni=el('span','niv');ni.setAttribute('aria-label','Difficulté '+nv+' sur 3');
  for(var i=1;i<=3;i++)ni.appendChild(el('i',i<=nv?'on':''));h.appendChild(ni);
  if(at(x,'nom'))h.appendChild(el('span','exo-nom',at(x,'nom')));e.appendChild(h);
  if(C&&at(x,'lecons')){var tg=el('div','exo-tags');at(x,'lecons').split(/[\s,;]+/).forEach(function(s){var L=C.lecons[(+s)-1];if(!L)return;
      var a=el('a','',' Leçon '+deux(L.n));a.href='#'+L.id;a.style.setProperty('--c',L.col);tg.appendChild(a)});e.appendChild(tg)}
  var cor=un(x,'corrige');if(cor)cor.remove();var q=el('div','qst');bloc(x,q);e.appendChild(q);
  var d=depli(cor,'Voir le corrigé','Masquer le corrigé');e.appendChild(d.b);e.appendChild(d.dp);return e}

function page(C,type,id,col){var s=el('section','pg '+type);s.id=id;s.setAttribute('data-cours',C.L);teinte(s,col);
  s.style.setProperty('--arc',C.arc);s.style.setProperty('--arcx',C.arcx);W.appendChild(s);return s}
function tete(p,lib,tag,titre,arc){var h=el('header','ph'),l=el('div','ph-l');
  if(arc)l.appendChild(el('span','carre'));l.appendChild(el('span',null,lib));if(tag)l.appendChild(el('span','tag',tag));h.appendChild(l);
  h.appendChild(el('h2','ph-t',titre));h.appendChild(el('div','sep'+(arc?' arc':'')));p.appendChild(h)}
function reglage(){var r=el('div','rgl'),z=el('div','tz');
  [['-1','A−','Texte plus petit'],['0','A','Taille par défaut'],['1','A+','Texte plus grand']].forEach(function(b){var x=el('button','cc',b[1]);x.type='button';x.setAttribute('data-tz',b[0]);x.setAttribute('aria-label',b[2]);z.appendChild(x)});
  r.appendChild(z);var s=el('button','sv cc','<span class="pt"></span><span class="sv-l">Enregistrer</span>');s.type='button';r.appendChild(s);return r}

/* ── chaque cours ── */
SRC.forEach(function(S,ci){
  var C={i:ci,L:at(S,'lettre')||'l',titre:at(S,'titre'),sst:at(S,'sous-titre'),src:S,lecons:[],gl:{},pages:[]};
  var LS=kids(S,'lecon'),cols=couleurs(LS.length);
  C.arc='linear-gradient(90deg,'+(cols.length>1?cols.join(','):cols[0]+','+cols[0])+')';
  C.arcx='linear-gradient(90deg,transparent,'+cols.join(',')+',transparent)';
  LS.forEach(function(Ls,li){C.lecons.push({n:li+1,id:C.L+(li+1),titre:at(Ls,'titre'),desc:at(Ls,'desc'),col:at(Ls,'couleur')||cols[li],src:Ls,js:[],parts:[],ess:[],mots:[]})});
  /* le glossaire du cours : chaque mot garde la définition de la leçon qui l'explique */
  C.lecons.forEach(function(L){var mc=un(L.src,'mots-cles');if(!mc)return;
    kids(mc,'mot').forEach(function(m){var t=at(m,'terme')||m.textContent.trim(),k=t.toLowerCase();
      if(m.innerHTML.trim()&&!C.gl[k])C.gl[k]={terme:t,def:m.innerHTML.trim(),L:L};L.mots.push(k)})});
  COURS.push(C)});
var NC=COURS.length;
/* un mot sans définition dans son cours la reprend d'un cours précédent du fichier */
function defMot(C,k){if(C.gl[k])return C.gl[k];for(var i=0;i<NC;i++)if(COURS[i].gl[k])return COURS[i].gl[k];return null}

COURS.forEach(function(C){
  var S=C.src,n=C.lecons.length;
  /* ── page d'ouverture ── */
  var P=page(C,'ouv','ouverture-'+C.L,'#ffffff');
  var bn=el('header','bnr');['tl','tr','bl','br'].forEach(function(k){bn.appendChild(el('span','bcn '+k))});
  bn.appendChild(el('div','bnr-sur',(NC>1?'Cours '+(C.i+1)+' sur '+NC:'Cours d’initiation')+' · '+lecons(n)));
  bn.appendChild(el('h1','bnr-tit',C.titre));if(C.sst)bn.appendChild(el('div','bnr-sst',C.sst));
  bn.appendChild(el('div','bnr-fil'));bn.appendChild(reglage());
  bn.appendChild(el('div','bnr-note','La progression se garde d’elle-même dans ce navigateur, et dans le fichier par le bouton Enregistrer.'));
  P.appendChild(bn);
  var intro=un(S,'introduction');if(intro){var iw=el('div','intro col');corps(intro,iw,C);P.appendChild(iw)}
  P.appendChild(intertitre('Plan du cours','plan-'+C.L));
  var pg=el('div','pgen'),pb=el('div','pgen-b');C.pgen=pb;pg.appendChild(pb);C.cptG=el('span','cpt');pg.appendChild(C.cptG);P.appendChild(pg);
  var gr=el('div','grille');C.lecons.forEach(function(L){
    var a=el('a','pc');a.href='#'+L.id;teinte(a,L.col);a.appendChild(el('span','tag',deux(L.n)));
    a.appendChild(el('div','pc-t',L.titre));if(L.desc)a.appendChild(el('div','pc-d',L.desc));
    var pp=el('div','pc-p'),sg=el('div','segs');pp.appendChild(sg);var cc=el('span','pc-c');pp.appendChild(cc);pp.appendChild(el('span','acq','✓ Acquise'));
    a.appendChild(pp);L.carte=a;L.segP=sg;L.cptP=cc;gr.appendChild(a)});
  var fin=el('div','pc plein pc-fin');
  fin.innerHTML='<a href="#bilan-'+C.L+'"><span class="pc-l"><span class="carre"></span>Pour finir</span><span class="pc-t">Bilan</span></a>'
    +'<a href="#revision-'+C.L+'"><span class="pc-l">Pour réviser</span><span class="pc-t">Fiches et glossaire</span></a>';
  gr.appendChild(fin);
  COURS.forEach(function(O){if(O===C)return;var a=el('a','pc plein pc-aut');a.href='#ouverture-'+O.L;
    var d=el('div');d.appendChild(el('span','pc-l','Cours '+(O.i+1)+' · l’autre cours'));d.appendChild(el('span','pc-t',O.titre));
    if(O.sst)d.appendChild(el('span','pc-d',O.sst));a.appendChild(d);a.appendChild(el('span','fl','→'));gr.appendChild(a)});
  P.appendChild(gr);
  if(C.i===0)codeDuCours(P,C);
  C.pages.push({el:P,type:'ouv',lab:'Ouverture',titre:'Ouverture',col:'#ffffff'});

  /* ── leçons ── */
  C.lecons.forEach(function(L){
    var Q=page(C,'lec',L.id,L.col),s=L.src;L.page=Q;
    tete(Q,'Leçon',deux(L.n),L.titre);
    var o=el('div','ouvl'),ob=un(s,'objectifs'),pr=un(s,'prerequis');
    function liste(n2,cls,lib){var d=el('div',cls);d.appendChild(el('div','ouvl-l',lib));var u=el('ul');
      if(n2)[].slice.call(n2.children).forEach(function(li){var x=el('li');while(li.firstChild)x.appendChild(li.firstChild);u.appendChild(x)});
      d.appendChild(u);return d}
    o.appendChild(liste(ob,'obj','Objectifs'));o.appendChild(liste(pr,'pre','Prérequis'));Q.appendChild(o);
    var cm=un(s,'commencer');if(cm){var b=el('div','cmc');b.appendChild(etiquette('Pour commencer','→'));
      if(at(cm,'question'))b.appendChild(el('div','cmc-q',at(cm,'question')));bloc(cm,b);Q.appendChild(b)}
    kids(s,'partie').forEach(function(pt,k){var id=L.id+'-'+(k+1),h=el('div','pt-h'),r=el('div','pt-r');h.id=id;
      r.appendChild(el('span','tag',romain(k+1)));r.appendChild(el('h3','pt-t',at(pt,'titre')));h.appendChild(r);Q.appendChild(h);
      Q.appendChild(corps(pt,el('div','col'),C));L.parts.push({id:id,titre:at(pt,'titre'),n:k+1})});
    /* clôture */
    var es=un(s,'essentiel');if(es){Q.appendChild(intertitre('L’essentiel'));var e=el('div','ess col'),u=el('ul');
      kids(es).forEach(function(x){var li=el('li');while(x.firstChild)li.appendChild(x.firstChild);u.appendChild(li);L.ess.push(li.innerHTML)});
      e.appendChild(u);Q.appendChild(e)}
    if(L.mots.length){Q.appendChild(intertitre('Mots clés'));var m=el('div','mots col');
      L.mots.forEach(function(k){var g=defMot(C,k);var bt=el('button','mc cc',g?g.terme:k);bt.type='button';bt._k=k;bt._C=C;m.appendChild(bt)});
      var w2=el('div','col');w2.appendChild(m);var dp=el('div','dp mdef'),r2=el('div'),i2=el('div','dpi');r2.appendChild(i2);dp.appendChild(r2);w2.appendChild(dp);m._dp=dp;Q.appendChild(w2)}
    var ex=un(s,'exercices');if(ex){Q.appendChild(intertitre('Exercices'));var xw=el('div','col');
      kids(ex,'exercice').forEach(function(x,k){xw.appendChild(exercice(x,L.id+'-ex'+(k+1),k+1,L.col))});Q.appendChild(xw)}
    var ae=un(s,'autoevaluation');if(ae){Q.appendChild(intertitre('Autoévaluation'));
      Q.appendChild(note(at(ae,'note')||'Cocher une affirmation une fois réussis les exercices qu’elle nomme : la coche dit alors un savoir éprouvé.'));
      var aw=el('div','col'),hd=el('div','ae-h'),sg=el('div','segs');hd.appendChild(sg);L.cptA=el('span','cpt');hd.appendChild(L.cptA);aw.appendChild(hd);L.segA=sg;
      kids(ae,'je-sais').forEach(function(j){var cle=at(j,'cle'),x=el('div','js');x.setAttribute('role','checkbox');x.setAttribute('aria-checked','false');x.tabIndex=0;x._cle=cle;x._L=L;
        var cw=el('div','cbw'),cb=el('span','cb',CHECK);cw.appendChild(cb);cw.appendChild(el('span','cbr'));x.appendChild(cw);
        var t=el('div');var tx=el('div','js-t');while(j.firstChild)tx.appendChild(j.firstChild);t.appendChild(tx);
        var nums=at(j,'exercices').split(/[\s,;]+/).filter(Boolean);
        if(nums.length){var xl=el('span','exl');nums.forEach(function(nm,ii){if(ii)xl.appendChild(D.createTextNode(' · '));var a=el('a',null,'Exercice '+nm);a.href='#'+L.id+'-ex'+nm;xl.appendChild(a)});t.appendChild(xl)}
        x.appendChild(t);aw.appendChild(x);L.js.push(x)});
      Q.appendChild(aw)}
    C.pages.push({el:Q,type:'lec',lab:'Leçon '+deux(L.n)+' · '+txt(L.titre),titre:txt(L.titre),col:L.col,L:L})});
  C.lecons.forEach(function(L){[L.segP,L.segA].forEach(function(sg){if(!sg)return;sg.innerHTML='';L.js.forEach(function(){sg.appendChild(el('span'))})});
    if(L.js.length){var t=el('span');t.style.flexGrow=L.js.length;teinte(t,L.col);t.appendChild(el('i'));C.pgen.appendChild(t);L.tron=t}});

  /* ── bilan ── */
  var bs=un(S,'bilan'),B=page(C,'bil','bilan-'+C.L,'#ffffff');
  tete(B,'Bilan','',at(bs,'titre')||'Bilan du cours',true);
  var bw=el('div','col');
  var bn2=bs?kids(bs,'p'):[];if(bn2.length){var nb=el('div','it-n');bn2.forEach(function(p){nb.appendChild(p)});B.appendChild(nb)}
  else B.appendChild(note('Chaque exercice croise plusieurs leçons. S’y essayer avant d’ouvrir son corrigé : l’effort de chercher fait l’essentiel du travail.'));
  if(bs)kids(bs,'exercice').forEach(function(x,k){bw.appendChild(exercice(x,'bilan-'+C.L+'-ex'+(k+1),k+1,'#ffffff',C))});
  B.appendChild(bw);
  C.pages.push({el:B,type:'bil',lab:'Bilan',titre:at(bs,'titre')?txt(at(bs,'titre')):'Bilan',col:'#ffffff',arc:1});

  /* ── révision : fiches et glossaire ── */
  var V=page(C,'rev','revision-'+C.L,'#ffffff');
  tete(V,'Révision','','Fiches et glossaire');
  V.appendChild(intertitre('Fiches de révision','fiches-'+C.L));
  V.appendChild(note('Chaque fiche reprend l’essentiel de sa leçon.'));
  var fg=el('div','grille g280');C.lecons.forEach(function(L){var f=el('div','fiche');teinte(f,L.col);
    var h=el('a','fiche-h');h.href='#'+L.id;h.appendChild(el('span','tag',deux(L.n)));h.appendChild(el('span','fiche-t',L.titre));f.appendChild(h);
    var u=el('ul');L.ess.forEach(function(x){u.appendChild(el('li',null,x))});f.appendChild(u);fg.appendChild(f)});
  V.appendChild(fg);
  V.appendChild(intertitre('Glossaire','glossaire-'+C.L));
  var go=el('div','glo col');Object.keys(C.gl).map(function(k){return C.gl[k]}).sort(function(a,b){return a.terme.localeCompare(b.terme,'fr',{sensitivity:'base'})})
    .forEach(function(g){var e=el('div','gl');e.id='gl-'+C.L+'-'+slug(g.terme);teinte(e,g.L.col);var h=el('div','gl-h');h.appendChild(el('span','gl-m',g.terme));
      var a=el('a','cc','Leçon '+deux(g.L.n));a.href='#'+g.L.id;h.appendChild(a);e.appendChild(h);e.appendChild(el('div','gl-d',g.def));go.appendChild(e)});
  V.appendChild(go);
  V.appendChild(el('div','pied',txt(C.titre)+' · '+(NC>1?'fin du cours '+(C.i+1)+' sur '+NC:'fin du cours')));
  C.pages.push({el:V,type:'rev',lab:'Révision',titre:'Fiches et glossaire',col:'#ffffff'});
  C.pages.forEach(function(p,k){p.C=C;p.k=k;p.id=p.el.id;p.i=PAGES.length;PAGES.push(p)})});

/* ── le code du cours, présenté dans l'ouverture du premier cours ── */
function codeDuCours(P,C){
  P.appendChild(intertitre('Code du cours','code-'+C.L));
  P.appendChild(note('Chaque type de contenu garde la même forme d’un bout à l’autre du cours, dans la couleur de sa leçon. Le cadre signale un endroit où l’on agit.'));
  var cols=C.lecons.map(function(L){return L.col});if(!cols.length)cols=['#ffffff'];
  var g=el('div','grille g250 code');
  var M=[
    ['definition','<definition terme="Terme">le sens exact d’un mot, posé là où il paraît pour la première fois.</definition>','Pose le sens d’un mot nouveau.'],
    ['exemple','<exemple>Un cas concret, qui montre la notion à l’œuvre.</exemple>','Montre la notion dans un cas.'],
    ['attention','<attention>Une confusion fréquente, et la distinction juste qui la dissipe.</attention>','Prévient une erreur courante.'],
    ['retenir','<retenir>L’idée à garder, dite en une phrase.</retenir>','Fixe ce qui compte le plus.'],
    ['reperes','<reperes><repere titre="Repère">Un point d’appui qui situe la notion.</repere></reperes>','Situe la notion.'],
    ['verifie','<verifie>Une question, pour s’assurer d’avoir compris.<reponse>La réponse se déplie ici.</reponse></verifie>','Fait vérifier sur-le-champ.']];
  M.forEach(function(m,k){var d=el('div','code-c');teinte(d,cols[k%cols.length]);var t=el('div',null,m[1]);corps(t,d,C);
    var u=el('div','it-n',m[2]);u.style.marginTop='-14px';d.appendChild(u);g.appendChild(d)});
  P.appendChild(g)}

/* ── navigation de pages ── */
PAGES.forEach(function(p,i){
  var nv=el('nav','nv');
  function lien(q,cls,lib){var a=el('a',cls);if(!q){a.classList.add('cache');a.innerHTML='<span class="nv-l">'+lib+'</span><span class="nv-t">·</span>';a.setAttribute('aria-hidden','true');a.tabIndex=-1;return a}
    a.href='#'+q.id;a.style.setProperty('--c',q.col);if(q.arc)a.style.setProperty('--arc',q.C.arc);
    a.innerHTML='<span class="nv-l">'+lib+'</span>';
    var t=el('span','nv-t');if(q.arc){var c=el('span','carre');c.style.marginRight='8px';c.style.verticalAlign='1px';t.appendChild(c)}
    t.appendChild(D.createTextNode((q.C!==p.C?txt(q.C.titre)+' · ':'')+q.titre));a.appendChild(t);return a}
  nv.appendChild(lien(PAGES[i-1],'prec','← <span class="nv-pg">Page </span>précédente'));
  nv.appendChild(el('span','nv-n',deux(p.k+1)+' / '+deux(p.C.pages.length)));
  nv.appendChild(lien(PAGES[i+1],'suiv','<span class="nv-pg">Page </span>suivante →'));
  p.el.appendChild(nv)});

/* ── barre haute ── */
var BAR=el('header');BAR.id='barre';
BAR.innerHTML='<div class="bh"><span class="bh-cours"></span><span class="bh-page"></span><button type="button" class="bh-som" aria-label="Ouvrir le sommaire">Sommaire<span class="pt"></span></button></div><div class="bh-prog"><i></i></div>';
W.parentNode.insertBefore(BAR,W);
var BHC=BAR.querySelector('.bh-cours'),BHP=BAR.querySelector('.bh-page'),BHI=BAR.querySelector('.bh-prog i');

/* ── sommaire ── */
var VO=el('div');VO.id='voile';var SO=el('aside');SO.id='som';SO.setAttribute('aria-label','Sommaire');
var sh=el('div','som-h','<span>Sommaire</span>');var sx=el('button','som-x','×');sx.type='button';sx.setAttribute('aria-label','Fermer le sommaire');sh.appendChild(sx);SO.appendChild(sh);
SO.appendChild(reglage());
var SC=el('div','som-c','<span>Progression</span>');var SCT=el('span','cpt');SC.appendChild(SCT);SO.appendChild(SC);
var ONGS=null;
if(NC>1){ONGS=el('div','ongs');COURS.forEach(function(C){var o=el('button','ong cc');o.type='button';o._C=C;
  o.innerHTML='<span class="ong-l">Cours '+(C.i+1)+'</span><span class="ong-t">'+C.titre+'</span>';C.cptO=el('span','ong-c');o.appendChild(C.cptO);C.ong=o;ONGS.appendChild(o)});SO.appendChild(ONGS)}
COURS.forEach(function(C){var l=el('nav','sl');C.sl=l;l.hidden=true;
  function e(href,cls,html,pi){var a=el('a','se'+(cls?' '+cls:''),html);a.href='#'+href;if(pi!=null)a._pi=pi;l.appendChild(a);return a}
  e('ouverture-'+C.L,'sx','<span class="se-t">Ouverture</span>',C.pages[0].el.id);
  C.lecons.forEach(function(L){var a=e(L.id,'','',L.id);teinte(a,L.col);a.appendChild(el('span','tag',deux(L.n)));a.appendChild(el('span','se-t',L.titre));
    L.cptS=el('span','se-c');a.appendChild(L.cptS);L.se=a;
    L.parts.forEach(function(p){var s=e(p.id,'sp','<span class="rn">'+romain(p.n)+'</span><span class="se-t">'+p.titre+'</span>');teinte(s,L.col)})});
  var b=e('bilan-'+C.L,'sx','',('bilan-'+C.L));b.style.setProperty('--arc',C.arc);b.innerHTML='<span class="carre"></span><span class="se-t">Bilan</span>';
  e('fiches-'+C.L,'sx','<span class="se-t">Fiches de révision</span>','revision-'+C.L);
  e('glossaire-'+C.L,'sx','<span class="se-t">Glossaire</span>');
  SO.appendChild(l)});
W.parentNode.appendChild(VO);W.parentNode.appendChild(SO);

/* ══ 2. COMPORTEMENT ══ */
var ACQ={},MAJ=0,CUR=-1,GESTE=false,ZI=TZ0,VUE=0,COURS_SOM=null,ANIMS=[],NOUVEAUX={};
var BLOC=(function(){try{var p=JSON.parse(D.getElementById('lv-progression').textContent||'{}');
  return {maj:+p.maj||0,acquis:propre(p.acquis)}}catch(e){return {maj:0,acquis:{}}}})();
var INSCRIT={maj:BLOC.maj,acquis:copie(BLOC.acquis)};
function propre(a){var r={};if(a&&typeof a==='object')Object.keys(a).forEach(function(k){if(a[k]===true&&/^[\w.-]{1,80}$/.test(k))r[k]=true});return r}
function copie(a){var r={};Object.keys(a).forEach(function(k){r[k]=true});return r}
function memes(a,b){var x=Object.keys(a).sort().join('|'),y=Object.keys(b).sort().join('|');return x===y}

/* ── comptes et barres ── */
function compte(e,t){if(!e||e._t===t)return;var avant=e._t;e._t=t;
  if(avant==null||R.classList.contains('inst')||RM){e.innerHTML=t;return}
  var a=anim(e,[{opacity:1},{opacity:0}],{duration:120,easing:E_OUT,fill:'forwards'});
  setTimeout(function(){e.innerHTML=t;if(a)a.cancel();anim(e,[{opacity:0},{opacity:1}],{duration:180,easing:E_IN})},RM?0:120)}
function segs(sg,n){if(!sg)return;var k=0;[].forEach.call(sg.children,function(s,i){var on=i<n;if(s.classList.contains('on')!==on){s.style.setProperty('--d',(k++*30)+'ms');s.classList.toggle('on',on)}})}
function majVue(){
  var tot=0,ok=0;
  COURS.forEach(function(C){var ct=0,co=0;
    C.lecons.forEach(function(L){var n=L.js.length,o=0;L.js.forEach(function(j){var on=!!ACQ[j._cle];if(on)o++;
        if(j.classList.contains('on')!==on){j.classList.toggle('on',on);j.setAttribute('aria-checked',on?'true':'false')}});
      L.o=o;segs(L.segP,o);segs(L.segA,o);compte(L.cptP,o+' / '+n+' acquis');compte(L.cptA,o+' / '+n);
      var fini=n>0&&o===n;if(L.carte)L.carte.classList.toggle('fini',fini);
      if(L.cptS){var t=fini?'✓':(n?o+'/'+n:'');if(L.cptS._t!==t){L.cptS._t=t;L.cptS.textContent=t;L.cptS.classList.toggle('ok',fini)}}
      if(L.tron)L.tron.firstChild.style.width=(n?o/n*100:0)+'%';ct+=n;co+=o});
    compte(C.cptG,co+' / '+ct+' acquis');if(C.cptO)compte(C.cptO,co+' / '+ct);tot+=ct;ok+=co});
  compte(SCT,ok+' / '+tot+' acquis');
  R.classList.toggle('sale',!CADRE&&!memes(ACQ,INSCRIT.acquis))}

/* ── taille du texte ── */
function taille(i,garder){i=Math.max(0,Math.min(TZ.length-1,i));var p=garder?posLecture():null;ZI=i;R.style.setProperty('--z',TZ[i]);
  [].forEach.call(D.querySelectorAll('.tz button'),function(b){var v=b.getAttribute('data-tz');b.classList.toggle('bout',(v==='-1'&&i===0)||(v==='1'&&i===TZ.length-1))});
  if(p!=null&&!CADRE)poserLecture(p)}

/* ── défilement : ouvert seul, la fenêtre défile ; posé dans un cadre, la page hôte ── */
function libre(){return !CADRE||R.scrollHeight>innerHeight+1}
function hautBarre(){return BAR.offsetHeight||52}
function haut(e){return e.getBoundingClientRect().top+(window.pageYOffset||0)}
function vers(y){y=Math.max(0,Math.round(y));
  if(libre())window.scrollTo(0,y);else{try{parent.postMessage({lvAncre:y},'*')}catch(e){}}}
function scrollY(){return libre()?(window.pageYOffset||0):VUE}
function posLecture(){var p=PAGES[CUR];if(!p)return 0;var t=haut(p.el)-hautBarre(),h=p.el.offsetHeight||1;return Math.max(0,Math.min(1,(scrollY()-t)/h))}
function poserLecture(f){var p=PAGES[CUR];if(!p)return;if(f<=0){window.scrollTo(0,0);return}window.scrollTo(0,haut(p.el)-hautBarre()+f*p.el.offsetHeight)}
function progres(){var p=PAGES[CUR];if(!p)return;var t=haut(p.el)-hautBarre(),h=p.el.offsetHeight,vh=libre()?innerHeight:Math.min(innerHeight,(screen.availHeight||800)-120);
  var f=h>vh?(scrollY()-t)/(h-vh):1;f=Math.max(0,Math.min(1,f));BHI.style.width=((p.k+f)/p.C.pages.length*100)+'%'}

/* ── pages ── */
function idxDe(e){while(e&&!(e.classList&&e.classList.contains('pg')))e=e.parentElement;if(!e)return -1;for(var i=0;i<PAGES.length;i++)if(PAGES[i].el===e)return i;return -1}
function entete(p){
  BHC.textContent=txt(p.C.titre);
  BHP.innerHTML='';if(p.arc){var c=el('span','carre');BHP.appendChild(c)}BHP.appendChild(el('span',null,p.lab));
  [BAR,BHP].forEach(function(e){teinte(e,p.col);e.style.setProperty('--arc',p.C.arc)});
  BHI.style.background=p.arc?p.C.arc:'';
  [].forEach.call(SO.querySelectorAll('.se'),function(a){var on=a.getAttribute('href')==='#'+p.id;a.classList.toggle('on',on)})}
function montrer(i,cible,instant){
  var p=PAGES[i];if(!p)return;var q=PAGES[CUR];
  ANIMS.forEach(function(a){try{a.cancel()}catch(e){}});ANIMS=[];
  function entrer(){
    if(q&&q!==p)q.el.classList.remove('on');p.el.classList.add('on');CUR=i;entete(p);
    if(!instant){if(cible&&cible!==p.el)vers(haut(cible)-hautBarre()-16);else vers(0);
      try{history.replaceState(null,'','#'+(cible&&cible.id?cible.id:p.id))}catch(e){}
      var k=[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}];
      var a=anim(p.el,k,{duration:380,easing:E_IN});if(a)ANIMS.push(a);
      [].slice.call(p.el.children,0,3).forEach(function(c,j){var b=anim(c,k,{duration:380,delay:50*(j+1),easing:E_IN,fill:'backwards'});if(b)ANIMS.push(b)});
      if(p.type==='ouv')accueillir()}
    progres();envoyer()}
  if(q&&q!==p&&!instant&&!RM){var s=anim(q.el,[{opacity:1},{opacity:0}],{duration:150,easing:E_OUT,fill:'forwards'});
    if(s){ANIMS.push(s);s.onfinish=function(){entrer();s.cancel()};return}}
  entrer()}
function aller(id,instant){var e=id&&D.getElementById(id);if(!e)return false;var i=idxDe(e);if(i<0)return false;
  var p=PAGES[i];if(i===CUR&&!instant){if(e!==p.el)vers(haut(e)-hautBarre()-16);else vers(0);try{history.replaceState(null,'','#'+id)}catch(x){}return true}
  montrer(i,e===p.el?null:e,instant);return true}
/* l'étiquette « Acquise » d'une leçon qui vient de l'être entre la prochaine fois qu'elle paraît */
function accueillir(){Object.keys(NOUVEAUX).forEach(function(id){var L=NOUVEAUX[id];
  [L.carte&&L.carte.querySelector('.acq'),SO.classList.contains('on')?L.cptS:null].forEach(function(e){if(e&&e.offsetParent)anim(e,[{opacity:0,transform:'scale(.85)'},{opacity:1,transform:'none'}],{duration:320,easing:E_IN})})});
  if(PAGES[CUR]&&PAGES[CUR].type==='ouv'||SO.classList.contains('on'))NOUVEAUX={}}

/* ── sommaire ── */
function ongletSom(C,cascade){COURS_SOM=C;COURS.forEach(function(O){O.sl.hidden=O!==C;if(O.ong){O.ong.classList.toggle('on',O===C);O.ong.setAttribute('aria-pressed',O===C?'true':'false')}});
  if(cascade){var es=C.sl.querySelectorAll('.se'),n=es.length,pas=n>1?Math.min(25,300/(n-1)):0;
    [].forEach.call(es,function(e,j){anim(e,[{opacity:0,transform:'translateX(-12px)'},{opacity:1,transform:'none'}],{duration:300,delay:j*pas,easing:E_IN,fill:'backwards'})})}}
/* Dans un cadre qui défile lui-même, le sommaire et son voile se posent sur la page, à la hauteur de l'écran, et la suivent
   quand elle défile : un panneau fixe dans un cadre défilé se dessine mal sur iPhone (le haut de sa liste reste noir). */
function placerSom(){var v=[SO,VO];
  if(CADRE&&!libre()){var hs=Math.max(320,Math.min(innerHeight,(screen.availHeight||800)-120)),ts=Math.max(0,Math.min(VUE,innerHeight-hs));
    v.forEach(function(e){e.style.position=''});SO.style.top=ts+'px';SO.style.bottom='auto';SO.style.height=Math.min(hs,innerHeight)+'px';
    VO.style.top=VO.style.bottom=VO.style.height=''}
  else if(CADRE){v.forEach(function(e){e.style.position='absolute';e.style.top=(window.pageYOffset||0)+'px';e.style.bottom='auto';e.style.height=innerHeight+'px'})}
  else v.forEach(function(e){e.style.position=e.style.top=e.style.bottom=e.style.height=''})}
function ouvrirSom(){var p=PAGES[CUR];
  placerSom();
  SO.classList.add('on');VO.classList.add('on');ongletSom(p?p.C:COURS[0],true);accueillir();
  var a=SO.querySelector('.sl:not([hidden]) .se.on');if(a&&a.scrollIntoView)a.scrollIntoView({block:'nearest'})}
function fermerSom(){SO.classList.remove('on');VO.classList.remove('on')}

/* ── dépli ── */
function basculer(b){var o=!b._dp.classList.contains('o');b._dp.classList.toggle('o',o);b.classList.toggle('o',o);b.textContent=b._lib[o?1:0];b.setAttribute('aria-expanded',o?'true':'false')}
function motCle(b){var m=b.parentNode,dp=m._dp,i=dp.querySelector('.dpi'),act=m.querySelector('.mc.o');
  function remplir(){var g=defMot(b._C,b._k);i.innerHTML='';var t=el('b',null,g?g.terme:b.textContent);i.appendChild(t);i.appendChild(D.createTextNode(' : '));
    var s=el('span',null,g?g.def:'');i.appendChild(s)}
  if(act===b){b.classList.remove('o');dp.classList.remove('o');return}
  if(act){act.classList.remove('o');b.classList.add('o');var a=anim(i,[{opacity:1},{opacity:0}],{duration:120,easing:E_OUT,fill:'forwards'});
    setTimeout(function(){remplir();if(a)a.cancel();anim(i,[{opacity:0},{opacity:1}],{duration:180,easing:E_IN})},RM?0:120);return}
  remplir();b.classList.add('o');dp.classList.add('o')}

/* ── cocher une affirmation ── */
function cocher(j){var L=j._L,on=!ACQ[j._cle],avant=L.o===L.js.length&&L.js.length>0;
  if(on)ACQ[j._cle]=true;else delete ACQ[j._cle];MAJ=Date.now();GESTE=true;majVue();
  if(on&&!RM){var cb=j.querySelector('.cb'),rg=j.querySelector('.cbr'),c='rgb('+rgb(L.col)+' / ';
    anim(cb,[{transform:'scale(1)'},{transform:'scale(1.18)',offset:.33},{transform:'scale(1)'}],{duration:520,easing:E_IN});
    anim(rg,[{boxShadow:'0 0 0 0 '+c+'.6)'},{boxShadow:'0 0 0 10px '+c+'0)'}],{duration:520,easing:E_IN})}
  var fini=L.o===L.js.length&&L.js.length>0;
  if(fini&&!avant){NOUVEAUX[L.id]=L;if(L.segA&&!RM){var c2='rgb('+rgb(L.col)+' / ';anim(L.segA,[{filter:'drop-shadow(0 0 0 '+c2+'0))'},{filter:'drop-shadow(0 0 10px '+c2+'.6))'},{filter:'drop-shadow(0 0 0 '+c2+'0))'}],{duration:900,easing:E_IN})}}
  envoyer();if(CADRE){try{parent.postMessage({lvProgression:{maj:MAJ,acquis:copie(ACQ)}},'*')}catch(e){}}}

/* ── état : stockage local et page hôte ── */
function etat(){var p=PAGES[CUR];return {v:1,maj:MAJ,acquis:copie(ACQ),page:p?p.id:'',pos:posLecture(),taille:TZ[ZI]}}
function envoyer(){var e=etat();try{localStorage.setItem(CLE,JSON.stringify(e))}catch(x){}
  if(CADRE){try{parent.postMessage({lvEtat:e},'*')}catch(x){}}}
var rafPos=0;function planPos(){if(rafPos)return;rafPos=requestAnimationFrame(function(){rafPos=0;progres();if(CUR>=0)envoyer()})}
function appliquer(e,cible){
  R.classList.add('inst');
  var b=BLOC;if(e&&+e.maj>b.maj){ACQ=propre(e.acquis);MAJ=+e.maj}else{ACQ=copie(b.acquis);MAJ=b.maj}
  var z=e&&TZ.indexOf(+e.taille);taille(z>=0&&e?z:TZ0);
  var ok=false,parCible=false;if(cible)ok=parCible=aller(cible,true);
  if(!ok&&e&&e.page&&D.getElementById(e.page))ok=aller(e.page,true);
  if(!ok)montrer(CUR>=0?CUR:0,null,true);
  majVue();
  requestAnimationFrame(function(){requestAnimationFrame(function(){R.classList.remove('inst')})});
  return parCible}

/* ── enregistrer le fichier à jour ── */
var RX=new RegExp('(<script type="application/json" id="lv-'+'progression">)([\\s\\S]*?)(<\\/'+'script>)');
function composer(){var j=JSON.stringify({maj:MAJ,acquis:copie(ACQ)},null,1).replace(/</g,'\\u003c');
  return SOURCE.replace(RX,function(m,a,b,c){return a+'\n'+j+'\n'+c})}
function nomFichier(){var n='';try{n=decodeURIComponent(location.pathname.split('/').pop()||'')}catch(e){}
  if(/\.html?$/i.test(n))return n;return (SUJET.replace(/<[^>]+>/g,'').replace(/[\\\/:*?"<>|]+/g,' ').replace(/\s+/g,' ').trim()||'cours')+'.html'}
var DBN='cours-html'+(slug(SUJET)?':'+slug(SUJET):'');
function base(){return new Promise(function(ok,ko){var r=indexedDB.open(DBN,1);r.onupgradeneeded=function(){r.result.createObjectStore('h')};r.onsuccess=function(){ok(r.result)};r.onerror=function(){ko(r.error)}})}
function lireH(){return base().then(function(db){return new Promise(function(ok){var q=db.transaction('h').objectStore('h').get('fichier');q.onsuccess=function(){ok(q.result||null)};q.onerror=function(){ok(null)}})}).catch(function(){return null})}
function garderH(h){return base().then(function(db){db.transaction('h','readwrite').objectStore('h').put(h,'fichier')}).catch(function(){})}
function ecrire(h,blob){return h.createWritable().then(function(w){return w.write(blob).then(function(){return w.close()})})}
function inscrit(){INSCRIT={maj:MAJ,acquis:copie(ACQ)};SOURCE=composer();majVue();
  [].forEach.call(D.querySelectorAll('.sv'),function(b){b.classList.add('fait');b.querySelector('.sv-l').textContent='Enregistré';
    setTimeout(function(){b.classList.remove('fait');b.querySelector('.sv-l').textContent='Enregistrer'},1600)})}
var ENR=false;
function enregistrer(){if(ENR)return;ENR=true;var blob=new Blob([composer()],{type:'text/html;charset=utf-8'});
  function finir(){ENR=false}
  if(window.showSaveFilePicker){
    lireH().then(function(h){
      if(!h)return null;
      return h.queryPermission({mode:'readwrite'}).then(function(p){return p==='granted'?p:h.requestPermission({mode:'readwrite'})})
        .then(function(p){if(p!=='granted')return null;return ecrire(h,blob).then(function(){return true})}).catch(function(){return null})})
    .then(function(fait){if(fait){inscrit();return}
      return window.showSaveFilePicker({suggestedName:nomFichier(),types:[{description:'Page HTML',accept:{'text/html':['.html']}}]})
        .then(function(h){return ecrire(h,blob).then(function(){garderH(h);inscrit()})},function(){})})
    .then(finir,finir);return}
  var u=URL.createObjectURL(blob),a=el('a');a.href=u;a.download=nomFichier();a.style.display='none';D.body.appendChild(a);a.click();a.remove();
  setTimeout(function(){URL.revokeObjectURL(u)},1000);inscrit();finir()}

/* ── écouteurs ── */
D.addEventListener('click',function(e){
  var t=e.target;if(!t.closest)return;
  var x=t.closest('.exl a');
  if(x){e.preventDefault();e.stopPropagation();var id=x.getAttribute('href').slice(1);GESTE=true;aller(id);var ex=D.getElementById(id);
    if(ex){var bt=ex.querySelector('.btr');ex.classList.remove('vu');void ex.offsetWidth;if(!RM)ex.classList.add('vu')}return}
  var j=t.closest('.js');if(j){cocher(j);return}
  var a=t.closest('a[href^="#"]');
  if(a&&!e.defaultPrevented&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.button){var id2=decodeURIComponent(a.getAttribute('href').slice(1));
    if(D.getElementById(id2)&&idxDe(D.getElementById(id2))>=0){e.preventDefault();GESTE=true;if(SO.contains(a))fermerSom();aller(id2)}return}
  var b=t.closest('button');if(!b)return;
  if(b.classList.contains('btr')){basculer(b);return}
  if(b.classList.contains('mc')){motCle(b);return}
  if(b.hasAttribute('data-tz')){GESTE=true;var v=+b.getAttribute('data-tz');taille(v===0?TZ0:ZI+v,true);envoyer();return}
  if(b.classList.contains('sv')){enregistrer();return}
  if(b.classList.contains('bh-som')){ouvrirSom();return}
  if(b.classList.contains('som-x')){fermerSom();return}
  if(b.classList.contains('ong')){var C=b._C;ongletSom(C,true);
    /* un autre cours mène droit à son ouverture, et le sommaire reste ouvert */
    if(!PAGES[CUR]||PAGES[CUR].C!==C){GESTE=true;aller(C.pages[0].el.id)}return}});
/* Le voile ferme le sommaire dès que le doigt ou la souris s'y pose : sur iPhone, dans un cadre qui défile, un toucher
   y devient parfois le début d'un défilement et le clic n'arrive jamais. Rien ne défile sous lui tant qu'il est là. */
VO.addEventListener('pointerdown',function(e){if(e.button)return;e.preventDefault();fermerSom()});
VO.addEventListener('click',fermerSom);
VO.addEventListener('touchmove',function(e){e.preventDefault()},{passive:false});
VO.addEventListener('wheel',function(e){e.preventDefault()},{passive:false});
D.addEventListener('keydown',function(e){
  if(e.key==='Escape'&&SO.classList.contains('on')){fermerSom();return}
  var t=e.target;if(t&&t.classList&&t.classList.contains('js')&&(e.key===' '||e.key==='Enter')){e.preventDefault();cocher(t);return}
  if(e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||SO.classList.contains('on'))return;
  if(t&&/^(input|textarea|select)$/i.test(t.tagName||''))return;
  if(e.key==='ArrowRight'&&CUR<PAGES.length-1){GESTE=true;montrer(CUR+1)}
  else if(e.key==='ArrowLeft'&&CUR>0){GESTE=true;montrer(CUR-1)}});
D.addEventListener('touchstart',function(){},{passive:true});
window.addEventListener('scroll',function(){planPos();if(CADRE&&SO.classList.contains('on'))placerSom()},{passive:true});
window.addEventListener('resize',function(){planPos();if(SO.classList.contains('on'))placerSom()});
['wheel','touchmove'].forEach(function(k){window.addEventListener(k,function(){GESTE=true},{passive:true})});
D.addEventListener('visibilitychange',function(){if(D.visibilityState==='hidden')envoyer()});
window.addEventListener('pagehide',envoyer);
window.addEventListener('hashchange',function(){var id='';try{id=decodeURIComponent(location.hash.slice(1))}catch(x){}if(id){GESTE=true;aller(id)}});
window.addEventListener('message',function(e){if(e.source!==window.parent)return;var d=e.data;if(!d||typeof d!=='object')return;
  if(d.lvVue&&typeof d.lvVue.haut==='number'){VUE=d.lvVue.haut;planPos();return}
  if(d.lvEtat&&typeof d.lvEtat==='object'&&!GESTE){appliquer(d.lvEtat,null);accorder()}});

/* ══ REPRISE ══ */
var LOC=null;try{LOC=JSON.parse(localStorage.getItem(CLE)||'null')}catch(x){}
var CIBLE='';try{CIBLE=decodeURIComponent((location.hash||'').slice(1))}catch(x){}
var aCible=appliquer(LOC,CIBLE);
if(!CADRE)requestAnimationFrame(function(){var c=aCible&&D.getElementById(CIBLE);
  if(c&&idxDe(c)>=0&&c!==PAGES[CUR].el)vers(haut(c)-hautBarre()-16);else if(!aCible&&LOC&&+LOC.pos>0)poserLecture(+LOC.pos);else window.scrollTo(0,0)});
var ACCORDE=false;
function accorder(){if(ACCORDE||memes(ACQ,BLOC.acquis))return;
  if(CADRE){ACCORDE=true;try{parent.postMessage({lvProgression:{maj:MAJ||Date.now(),acquis:copie(ACQ)}},'*')}catch(e){}}}
accorder();majVue();
if(CADRE){try{parent.postMessage({lvEtatVoulu:1},'*')}catch(x){}}
if(D.fonts&&D.fonts.ready)D.fonts.ready.then(function(){progres()});
})();

/* coin coupé selon la disposition : un cadre posé à côté d'un autre sur la même ligne porte le coin coupé (classe cote),
   un cadre seul sur sa ligne, au-dessus ou au-dessous d'un autre, a des angles droits (classe seul) */
(function(){
var SEL='.pc,.exo,.js,.ong,.bx';
/* seuls les cadres visibles comptent ; rangés de haut en bas, chacun ne se compare qu'aux cadres qui commencent avant
   sa fin, si bien que le calcul reste rapide quel que soit leur nombre */
function coins(){var V=[];
  [].forEach.call(document.querySelectorAll(SEL),function(c){var a=c.getBoundingClientRect();
    if(a.width===0||a.height===0)return;V.push({c:c,a:a,cote:false})});
  V.sort(function(x,y){return x.a.top-y.a.top});
  for(var i=0;i<V.length;i++){var a=V[i].a;
    for(var j=i+1;j<V.length&&V[j].a.top<a.bottom-4;j++){var r=V[j].a;
      if(a.top<r.bottom-4&&(r.right<=a.left+1||r.left>=a.right-1)){V[i].cote=true;V[j].cote=true}}}
  V.forEach(function(v){v.c.classList.toggle('cote',v.cote);v.c.classList.toggle('seul',!v.cote)})}
function bientot(){[0,120,400,800].forEach(function(t){setTimeout(coins,t)})}
bientot();addEventListener('load',bientot);addEventListener('resize',bientot);document.addEventListener('click',bientot);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(bientot);
})();

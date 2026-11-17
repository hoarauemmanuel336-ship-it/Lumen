/* ═══════════ ÉTUDE ═══════════
   La page s'ouvre directement sur le parcours, en plein écran, sans la
   barre du site, et se lit « tout pareil » qu'un article ouvert : cadre
   isolé (commun/cadre.js), bandeau crème en bas à gauche (retour, Bible,
   question à l'IA), replié derrière trois points, mémoire de lecture.
   Le parcours vient du site (/parcours/), chaque cours du coffre R2
   (/parcours/cours/, voir netlify/edge-functions/fichiers.js). « Ouvrir le
   cours », sur chaque thème du parcours, ouvre le fichier de cours du
   thème ; le retour ramène au parcours, et du parcours à la page d'où l'on
   venait (l'accueil quand on est arrivé directement ici). Échap fait de
   même, sauf quand la Bible ou l'IA est ouverte. */
(function(){
  const PARCOURS='/parcours/la-foi-catholique.html';
  const acts=document.getElementById('et-acts');
  if(!acts)return;
  /* ── LE CERCLE DE CHARGEMENT ──
     Le cercle crème du site tourne au milieu de l'écran noir tant que le
     parcours ou le cours n'est pas dessiné : à l'arrivée sur la page, et à
     chaque cours ouvert. Il s'efface en fondu quand le cadre a fini de
     construire sa page. */
  const attente=document.getElementById('et-charge');
  const attend=()=>{ if(attente)attente.classList.remove('fini'); };
  const finAttente=o=>{
    if(!attente||OUVERT!==o)return;
    requestAnimationFrame(()=>requestAnimationFrame(()=>setTimeout(()=>{ if(OUVERT===o)attente.classList.add('fini'); },120)));
  };

  /* ── LA MÉMOIRE DE LECTURE ──
     Pour le parcours et pour chaque fichier de cours, l'état du contenu (page atteinte, sections ouvertes, réglages),
     la place de lecture et la progression vivent dans le stockage de
     l'appareil et dans l'espace du compte (users/…/etude_lecture/…),
     chaque valeur avec son heure ; à l'ouverture, la plus récente
     l'emporte. L'écriture vers le compte est groupée et part aussitôt
     quand la page se cache ou se quitte.
     La copie de l'appareil est rangée sous le compte connecté, et à part
     pour qui n'est pas connecté : sur un navigateur partagé, chacun garde
     sa progression et sa place de lecture, sans reprendre celles d'un
     autre. */
  const LECT={att:{},minuteur:0,uid:''};
  const cleL=(q,id)=>'lv_etu_'+(LECT.uid?LECT.uid+'_':'v_')+q+'_'+id;
  const lLit=(q,id)=>{try{return localStorage.getItem(cleL(q,id));}catch(_){return null;}};
  const lMaj=(q,id)=>parseInt(lLit(q+'maj',id)||'0',10)||0;
  function lPose(q,id,val,maj){
    try{localStorage.setItem(cleL(q,id),val);localStorage.setItem(cleL(q+'maj',id),String(maj));}catch(_){}
  }
  /* Les copies gardées avant ce rangement, sans compte, appartiennent au
     seul qui se servait alors du site, Emmanuel : le premier compte qui se
     connecte sur l'appareil les reprend, puis elles s'effacent. */
  function reprendAnciennes(uid){
    try{
      const re=/^lv_etu_((?:etat|pos|prog|taille|blocs|dernier)(?:maj)?_.+)$/, cles=[];
      for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(re.test(k))cles.push(k);}
      cles.forEach(k=>{
        const n='lv_etu_'+uid+'_'+re.exec(k)[1];
        if(localStorage.getItem(n)===null)localStorage.setItem(n,localStorage.getItem(k));
        localStorage.removeItem(k);
      });
    }catch(_){}
  }
  const lecDoc=id=>firebase.firestore().doc('users/'+LECT.uid+'/etude_lecture/'+id);
  function garde(q,id,val){
    const t=Date.now();
    lPose(q,id,val,t);
    if(!LECT.uid)return;
    const a=LECT.att[id]||(LECT.att[id]={});
    a[q]=val; a[q+'Maj']=t;
    clearTimeout(LECT.minuteur);
    LECT.minuteur=setTimeout(pousse,1500);
  }
  function pousse(){
    clearTimeout(LECT.minuteur); LECT.minuteur=0;
    if(!LECT.uid)return;
    const att=LECT.att; LECT.att={};
    Object.keys(att).forEach(id=>{ lecDoc(id).set(att[id],{merge:true}).catch(()=>{}); });
  }
  document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden')pousse(); });
  window.addEventListener('pagehide',pousse);
  const compte=(typeof qaCompte==='function'?qaCompte():Promise.resolve(null))
    .then(u=>{ if(u){reprendAnciennes(u.uid); LECT.uid=u.uid; pousse();} return u; }).catch(()=>null);
  function rapatrie(ids){
    const lu=compte.then(u=>{
      if(!u)return;
      return Promise.all(ids.map(id=>lecDoc(id).get().then(sn=>{
        if(!sn.exists)return;
        const d=sn.data()||{};
        ['etat','pos','prog','taille','blocs','dernier'].forEach(q=>{
          const m=+d[q+'Maj']||0;
          if(typeof d[q]==='string'&&m>lMaj(q,id))lPose(q,id,d[q],m);
        });
      }).catch(()=>{})));
    });
    /* hors ligne, on n'attend pas plus de deux secondes et demie */
    return Promise.race([lu,new Promise(r=>setTimeout(r,2500))]);
  }
  const litJson=(q,id)=>{try{return JSON.parse(lLit(q,id)||'null');}catch(_){return null;}};

  /* ── LA TAILLE DU TEXTE EST LA MÊME PARTOUT ──
     (Emmanuel : « que ça s'applique à tous les cours du parcours, et même
     sur le parcours lui-même ») Le réglage se garde une fois, sous
     « _reglages », compté en crans depuis le plus grand : chaque moteur
     s'ouvre à son plus grand cran, et A− descend d'un cran. Les crans sont
     ceux des moteurs de cours-html et de parcours-etude. Le parcours, fait
     de grands titres plutôt que de longs textes, se tient trois crans plus
     bas que les cours : au plus grand cran des cours, il est à sa taille
     normale (Emmanuel : « la page est trop zoomée »). */
  const CRANS_COURS=[.85,.925,1,1.08,1.16,1.25], CRANS_PARCOURS=[.9,1,1.1,1.2,1.3];
  const DECALAGE_PARCOURS=3, ZOOM_PARCOURS=.85;
  /* ── LA BARRE DE PROGRESSION DU PARCOURS, PAR BLOC ──
     Le moteur du parcours dessine une case par thème (cent cinq) : au
     début, on ne voit que ce qui reste (Emmanuel : « il y a tellement de
     choses que c'est un peu décourageant »). Le site la remplace, dans le
     cadre, par une case par bloc, qui se remplit au fil des sujets de tous
     ses thèmes, comme les cases du moteur, dont elle reprend l'apparence.
     Un sujet qui a son cours y compte pour la part de ses affirmations
     « Je sais… » cochées, si bien que la case avance un peu à chaque
     séance (Emmanuel : un bloc demandait des mois avant d'avancer, « soyons
     réaliste ») ; Étude envoie ces parts (message lvSais). Un sujet sans
     cours compte plein quand il est terminé, hachuré quand il est en cours
     ou à revoir. Sous chaque case, le numéro du premier thème du bloc. Le
     fichier du parcours reste tel quel. */
  const BARRE_BLOCS='<style>#w .prg:not(.lv-blocs){display:none}</style><scr'+'ipt>(function(){'
    +'var S={},maj=function(){};'
    +'window.addEventListener("message",function(ev){var d=ev.data;if(ev.source===parent&&d&&d.lvSais&&typeof d.lvSais==="object"){S=d.lvSais;maj();}});'
    +'function bati(){var W=document.getElementById("w"),P=W&&W.querySelector(".prg");'
    +'if(!P||!W.querySelector(".bh .bh-n")||W.querySelector(".lv-blocs"))return !!(W&&W.querySelector(".lv-blocs"));'
    +'var bl=[],b=null,n=0;'
    +'[].forEach.call(W.children,function(e){'
    +'if(e.classList.contains("bh")){b={a:e.style.getPropertyValue("--a"),r:e.style.getPropertyValue("--r"),nom:(e.querySelector(".bh-n")||e).textContent,premier:n+1,cw:[]};bl.push(b);}'
    +'else if(b&&e.classList.contains("th")){n++;b.cw=b.cw.concat([].slice.call(e.querySelectorAll(".cw")));}});'
    +'var N=document.createElement("div");N.className="prg lv-blocs";'
    +'bl.forEach(function(B){var s=document.createElement("div");s.className="seg";s.title=B.nom;'
    +'s.style.setProperty("--a",B.a);s.style.setProperty("--r",B.r);'
    +'s.innerHTML="<div class=\\"bar\\"><span class=\\"pl\\"></span><span class=\\"hc\\"></span></div><div class=\\"num\\">"+(B.premier<10?"0":"")+B.premier+"</div>";'
    +'B.pl=s.querySelector(".pl");B.hc=s.querySelector(".hc");N.appendChild(s);});'
    +'P.parentNode.insertBefore(N,P.nextSibling);'
    +'maj=function(){bl.forEach(function(B){var t=B.cw.length||1,f=0,m=0;'
    +'B.cw.forEach(function(c){var k=c._S&&c._S.cle,s=k&&S[k],e=c.getAttribute("data-e");'
    +'if(s&&s[1]>0)f+=Math.min(1,s[0]/s[1]);else if(e==="termine")f++;else if(e&&e!=="a-faire")m++;});'
    +'B.pl.style.width=(f/t*100)+"%";B.hc.style.left=(f/t*100)+"%";B.hc.style.width=(m/t*100)+"%";});};'
    +'maj();new MutationObserver(maj).observe(W,{subtree:true,attributes:true,attributeFilter:["data-e"]});return true;}'
    +'if(!bati()){var o=new MutationObserver(function(){if(bati())o.disconnect();});o.observe(document.documentElement,{childList:true,subtree:true});}'
    +'})();</scr'+'ipt>';
  /* ── LES BLOCS DU PARCOURS SE REPLIENT ──
     Le parcours s'ouvre blocs repliés : on voit d'un coup d'œil les dix-huit
     blocs, et on déplie celui qu'on veut (Emmanuel : « c'est mieux pour la
     navigation »). Le site redessine donc, dans le cadre, l'en-tête de chaque
     bloc en grand titre (numéro du bloc, nom, nombre de thèmes, chevron) ;
     un clic l'ouvre ou le ferme ; la flèche, elle, ouvre le bloc et
     déplie tous ses thèmes d'un coup, et un second clic replie tout ; le
     « + » garde son rôle et déplie l'explication du bloc. Les blocs ouverts sont gardés comme la place de
     lecture (message lvBlocs, valeur « blocs ») et rendus avant elle
     (lvBlocsOuverts), pour que la place retombe au même endroit. Un lien ou
     un saut vers un thème ouvre d'abord son bloc ; la flèche « tout ouvrir ou
     tout replier » du parcours ouvre ou replie aussi tous les blocs. Au-dessus des blocs, « Reprendre »
     rouvre le dernier cours ouvert (message lvReprise, voir reprise). Le script passe en tête du
     document, avant le moteur du parcours, pour entendre ces messages le
     premier. Le fichier du parcours reste tel quel. */
  const REPLI_BLOCS='<scr'+'ipt>'+String.raw`(function(){
var OUV={},PRET=false,REP=null;
var css='#w .bh.lv-b{display:flex;align-items:center;gap:16px;margin:0;padding:22px 12px 22px 12px;border-top:1px solid rgba(255,255,255,.09);cursor:pointer;-webkit-user-select:none;user-select:none}'
+'#w .bh.lv-b.lv-premier{margin-top:36px}'
+'#w .bh.lv-b:hover{background:rgb(var(--r) / .07)}'
+'#w .bh.lv-b .bh-l{display:none}'
+'#w .lv-bn{flex:none;font:700 12px/1 "JetBrains Mono",monospace;letter-spacing:.08em;color:var(--a);border:1px solid var(--a);padding:5px 8px}'
+'#w .lv-bt{flex:1;min-width:0;display:block}'
+'#w .bh.lv-b .bh-n{display:inline;font:700 30px/1.2 Inter,"Helvetica Neue",Arial,sans-serif;letter-spacing:0;text-transform:none;color:#fff}'
+'#w .lv-bp{display:inline-block;margin-left:8px;vertical-align:.35em;font:400 15px/1 "JetBrains Mono",monospace;color:rgba(255,255,255,.4);padding:2px 4px;cursor:pointer}'
+'#w .lv-bp:hover{color:var(--a)}'
+'#w .lv-bc{flex:none;font:700 11px/1 "JetBrains Mono",monospace;letter-spacing:.12em;color:rgba(255,255,255,.45);text-transform:uppercase}'
+'#w .lv-bv{flex:none;font:400 24px/1 "JetBrains Mono",monospace;color:rgba(255,255,255,.6);transition:transform .35s cubic-bezier(.2,.7,.3,1);padding:10px 12px;margin:-10px -6px -10px 0}'
+'#w .lv-bv:hover{color:var(--a)}'
+'#w .bh.lv-b.lv-o .lv-bv{transform:rotate(90deg);color:var(--a)}'
+'#w .bh.lv-b.lv-o{border-top-color:rgb(var(--r) / .6);background:rgb(var(--r) / .13)}'
+'#w .bh.lv-b.lv-o:hover{background:rgb(var(--r) / .18)}'
+'#w .bh.lv-b.lv-o .bh-n{color:var(--a)}'
+'#w .lv-dans{margin-left:30px;padding-left:16px;border-left:1px solid rgb(var(--r) / .35)}'
+'#w .lv-dans.lv-dt{margin-bottom:0;padding-bottom:22px}'
+'#w .lv-dt{margin-bottom:22px}'
+'#w .lv-cache{display:none!important}'
+'#w .lv-fin{border-top:1px solid rgba(255,255,255,.09);margin-bottom:28px}'
+'#w .lv-rep{display:flex;align-items:center;gap:16px;margin:28px 0 0;padding:16px 20px;border:1px solid rgba(255,255,255,.2);background:#000;cursor:pointer;text-decoration:none;color:#fff}'
+'#w .lv-rep:hover{border-color:rgba(255,255,255,.4);background:rgba(255,255,255,.04)}'
+'#w .lv-rep[hidden]{display:none}'
+'#w .lv-rep-l{flex:none;font:700 11px/1 "JetBrains Mono",monospace;letter-spacing:.14em;color:rgba(255,255,255,.5);text-transform:uppercase}'
+'#w .lv-rep-t{flex:1;min-width:0;font:600 20px/1.3 Inter,"Helvetica Neue",Arial,sans-serif}'
+'#w .lv-rep-v{flex:none;font:400 22px/1 "JetBrains Mono",monospace;color:rgba(255,255,255,.6)}'
+'@media (max-width:640px){#w .lv-rep{flex-wrap:wrap;gap:8px 12px;padding:14px 16px}#w .lv-rep-l{flex-basis:100%}#w .lv-rep-t{font-size:18px}#w .lv-dans{margin-left:14px;padding-left:10px}#w .bh.lv-b{gap:12px;padding:18px 6px}#w .bh.lv-b .bh-n{font-size:23px}#w .lv-bc{display:none}}';
var st=document.createElement('style');st.textContent=css;(document.head||document.documentElement).appendChild(st);
function blocs(){var W=document.querySelector('#w');if(!W)return [];var L=[],b=null;
function range(e){if(e.classList.contains('bh')){b={h:e,c:[]};L.push(b);}else if(e.classList.contains('lv-env'))[].forEach.call(e.children,range);else if(b&&(e.classList.contains('th')||(e.classList.contains('xw')&&e.classList.contains('bp'))))b.c.push(e);}
[].forEach.call(W.children,range);return L;}
/* le bloc se déroule et se replie comme une section des diagrammes : son contenu, glissé le temps du geste dans une enveloppe, passe de zéro à sa hauteur en 0,4 s (ralenti en fin de course) et se replie en 0,3 s */
var ANIM=null;
function deballe(w){if(!w.parentNode)return;while(w.firstChild)w.parentNode.insertBefore(w.firstChild,w);w.remove();}
function finit(){if(!ANIM)return;var a=ANIM;ANIM=null;try{a.an.cancel();}catch(_){}deballe(a.w);applique();}
function anime(b,ouvre){finit();if(!b||!b.c.length||!b.c[0].animate)return;
try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;}catch(_){}
var w=document.createElement('div');w.className='lv-env';w.style.overflow='hidden';b.c[0].parentNode.insertBefore(w,b.c[0]);
b.c.forEach(function(e){w.appendChild(e);e.classList.remove('lv-cache');});
var H=w.scrollHeight;
var an=w.animate(ouvre?[{height:'0px'},{height:H+'px'}]:[{height:H+'px'},{height:'0px'}],{duration:ouvre?400:300,easing:ouvre?'cubic-bezier(.2,.7,.3,1)':'cubic-bezier(.4,0,1,1)'});
ANIM={w:w,an:an};
an.onfinish=function(){if(!ANIM||ANIM.an!==an)return;ANIM=null;deballe(w);applique();};}
function applique(){blocs().forEach(function(b,i){var o=!!OUV[i];b.h.classList.toggle('lv-o',o);b.h.setAttribute('aria-expanded',o?'true':'false');b.c.forEach(function(e,k){e.classList.toggle('lv-cache',!o);e.classList.add('lv-dans');e.classList.toggle('lv-dt',k===b.c.length-1);});});}
function envoie(){var l=[];for(var k in OUV)if(OUV[k])l.push(+k);try{parent.postMessage({lvBlocs:l},'*');}catch(_){}}
function prepare(){var L=blocs();if(!L.length||!document.querySelector('#w .th'))return false;
L.forEach(function(b,i){var h=b.h;if(h.classList.contains('lv-b'))return;h.classList.add('lv-b');if(i===0)h.classList.add('lv-premier');
var n=h.querySelector('.bh-n'),nb=b.c.filter(function(e){return e.classList.contains('th');}).length;
var tag=document.createElement('span');tag.className='lv-bn';tag.textContent=(i<9?'0':'')+(i+1);h.insertBefore(tag,h.firstChild);
var t=document.createElement('span');t.className='lv-bt';h.insertBefore(t,n);t.appendChild(n);
if(b.c.some(function(e){return e.classList.contains('bp');})){var p=document.createElement('span');p.className='lv-bp';p.textContent='+';p.setAttribute('role','button');p.setAttribute('aria-label','Explication du bloc');t.appendChild(p);}
var c=document.createElement('span');c.className='lv-bc';c.textContent=nb+(nb>1?' thèmes':' thème');h.appendChild(c);
var v=document.createElement('span');v.className='lv-bv';v.textContent='›';h.appendChild(v);});
var dern=L[L.length-1],z=dern.c[dern.c.length-1];
if(z&&!document.querySelector('#w .lv-fin')){var f=document.createElement('div');f.className='lv-fin';z.parentNode.insertBefore(f,z.nextSibling);}
if(!document.querySelector('#w .lv-rep')){var R=document.createElement('a');R.className='lv-rep';R.href='#';R.hidden=true;R.innerHTML='<span class="lv-rep-l">Reprendre</span><span class="lv-rep-t"></span><span class="lv-rep-v">→</span>';L[0].h.parentNode.insertBefore(R,L[0].h);R.addEventListener('click',function(ev){ev.preventDefault();ev.stopPropagation();if(REP)try{parent.postMessage({lvCours:REP.f},'*');}catch(_){}},true);}
PRET=true;applique();montreReprise();return true;}
function montreReprise(){var R=document.querySelector('#w .lv-rep');if(!R)return;R.hidden=!REP;if(REP)R.querySelector('.lv-rep-t').textContent=REP.t;}
function ouvreVers(el){if(!el)return;var L=blocs(),ch=false;L.forEach(function(b,i){if(b.h===el||b.c.some(function(c){return c===el||c.contains(el);})){if(!OUV[i]){OUV[i]=true;ch=true;}}});if(ch){applique();envoie();}}
/* un clic sur l'en-tête d'un bloc l'ouvre ou le ferme ; le + garde son rôle : déplier l'explication du bloc */
document.addEventListener('click',function(ev){var h=ev.target.closest&&ev.target.closest('#w .bh.lv-b');if(!h)return;
if(ev.target.closest('.lv-bp')){var L=blocs();for(var i=0;i<L.length;i++)if(L[i].h===h&&!OUV[i]){OUV[i]=true;applique();envoie();}return;}
ev.stopPropagation();ev.preventDefault();finit();var L2=blocs(),fl=!!ev.target.closest('.lv-bv'),cible=-1,avant=false;for(var j=0;j<L2.length;j++)if(L2[j].h===h){cible=j;avant=!!OUV[j];
if(fl){var ths=L2[j].c.filter(function(e){return e.classList.contains('th');}),tous=OUV[j]&&ths.every(function(t){return t.classList.contains('op');});
if(tous){ths.forEach(function(t){var x=t.querySelector('.th-h');if(x&&t.classList.contains('op'))x.click();});OUV[j]=false;}
else{OUV[j]=true;applique();ths.forEach(function(t){var x=t.querySelector('.th-h');if(x&&!t.classList.contains('op'))x.click();});}}
else OUV[j]=!OUV[j];}
applique();if(cible>=0&&!!OUV[cible]!==avant)anime(L2[cible],!!OUV[cible]);envoie();},true);
document.addEventListener('keydown',function(ev){if(ev.key!=='Enter'&&ev.key!==' ')return;var h=ev.target.closest&&ev.target.closest('#w .bh.lv-b');if(!h||ev.target.closest('.lv-bp'))return;ev.stopPropagation();ev.preventDefault();h.click();},true);
/* la flèche « tout ouvrir ou tout replier » du parcours ouvre ou replie aussi tous les blocs */
function tout(ev){var b=ev.target.closest&&ev.target.closest('#w .glb');if(!b)return;if(ev.type==='keydown'&&ev.key!=='Enter'&&ev.key!==' ')return;finit();var ouvrir=!b.classList.contains('up');blocs().forEach(function(x,i){OUV[i]=ouvrir;});applique();envoie();}
document.addEventListener('click',tout,true);document.addEventListener('keydown',tout,true);
/* un lien interne vers un thème ou un sujet ouvre d'abord son bloc */
document.addEventListener('click',function(ev){var a=ev.target.closest&&ev.target.closest('a[href^="#"]');if(!a)return;try{ouvreVers(document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1))));}catch(_){}},true);
window.addEventListener('message',function(ev){var d=ev.data;if(ev.source!==parent||!d||typeof d!=='object')return;
if(Array.isArray(d.lvBlocsOuverts)){OUV={};d.lvBlocsOuverts.forEach(function(i){if(typeof i==='number')OUV[i]=true;});if(PRET)applique();}
if(typeof d.lvVa==='string'){ouvreVers(document.getElementById(d.lvVa));}
if('lvReprise' in d){var x=d.lvReprise;REP=x&&typeof x.f==='string'&&typeof x.t==='string'?{f:x.f,t:x.t}:null;montreReprise();}});
if(!prepare()){var o=new MutationObserver(function(){if(prepare())o.disconnect();});o.observe(document.documentElement,{childList:true,subtree:true});}
})();`+'</scr'+'ipt>';
  function rangDe(e,genre){
    if(!e||typeof e!=='object')return -1;
    const l=genre==='parcours'?CRANS_PARCOURS:CRANS_COURS, v=genre==='parcours'?e.z:e.taille;
    const i=l.indexOf(+v); if(i<0)return -1;
    return genre==='parcours'?Math.max(0,l.length-1-i-DECALAGE_PARCOURS):l.length-1-i;
  }
  function poseRang(e,genre,r){
    const l=genre==='parcours'?CRANS_PARCOURS:CRANS_COURS;
    const v=l[Math.max(0,l.length-1-r-(genre==='parcours'?DECALAGE_PARCOURS:0))];
    if(genre==='parcours')e.z=v; else e.taille=v;
    return e;
  }

  /* ── CE QUE LE NAVIGATEUR GARDAIT AVANT ──
     Le parcours et les cours s'ouvraient à l'adresse du site, et leur
     moteur gardait leur état dans le stockage de l'appareil, sous sa clé
     propre. Le cadre isolé n'a plus ce stockage : tant que la page n'a
     rien gardé pour un contenu, elle lui rend cet état d'avant, pour que
     la progression et la place de lecture restent. */
  const slug=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60);
  function decode(s){const t=document.createElement('textarea');t.innerHTML=s;return t.value;}
  function cleAncienne(o){
    if(o.genre==='parcours'){const m=/<parcours\b[^>]*\bsujet="([^"]*)"/.exec(o.code);return 'parcours-etude:'+(slug(decode(m?m[1]:''))||'parcours');}
    const m=/<cours\b[^>]*\btitre="([^"]*)"/.exec(o.code);
    return 'cours-html:'+(slug(decode(m?m[1]:''))||'cours');
  }
  function etatPour(o){
    let e=litJson('etat',o.id);
    if(!e){try{e=JSON.parse(localStorage.getItem(cleAncienne(o))||'null');}catch(_){e=null;}}
    /* sans réglage gardé, le plus grand cran des cours : le parcours, lui,
       s'ouvre alors à sa taille normale */
    const lu=parseInt(lLit('taille','_reglages')||'',10), r=lu>=0?lu:0;
    e=e&&typeof e==='object'?e:{};poseRang(e,o.genre,r);
    return e;
  }

  /* ── LA PROGRESSION DANS LE FICHIER ──
     La progression (sujets d'un parcours, « Je sais… » d'un cours) se pose dans le bloc lv-progression du fichier
     au moment de l'ouvrir. Ici elle est gardée par la page, avec l'état :
     les fichiers eux-mêmes ne changent pas. */
  const PROG_BLOC=/<script\b[^>]*\bid=["']lv-progression["'][^>]*>[\s\S]*?<\/script>/i;
  const PROG_ETATS=['en-cours','termine','a-revoir'];
  function progressionPropre(p){
    const q={maj:Math.max(0,Math.round(+(p&&p.maj)||Date.now()))};
    if(p&&p.sujets&&typeof p.sujets==='object'){
      const s={};Object.keys(p.sujets).forEach(k=>{ if(/^[\w.-]{1,80}$/.test(k)&&PROG_ETATS.indexOf(p.sujets[k])>=0)s[k]=p.sujets[k]; });
      q.sujets=s;
    }
    if(p&&p.acquis&&typeof p.acquis==='object'){
      const a={};Object.keys(p.acquis).forEach(k=>{ if(/^[\w.-]{1,80}$/.test(k)&&p.acquis[k]===true)a[k]=true; });
      q.acquis=a;
    }
    return q;
  }
  function poseProgression(code,p){
    if(!p)return code;
    const bloc='<script type="application/json" id="lv-progression">\n'+JSON.stringify(p,null,1).replace(/</g,'\\u003c')+'\n<\/script>';
    if(PROG_BLOC.test(code))return code.replace(PROG_BLOC,()=>bloc);
    const i=code.search(/<\/head>/i);
    return i>=0?code.slice(0,i)+bloc+'\n'+code.slice(i):bloc+'\n'+code;
  }

  /* ── LE CONTENU OUVERT ── */
  let OUVERT=null;   // {id, genre, fichier, titre, code, f}
  const enCours=()=>!!(OUVERT&&OUVERT.genre==='cours');
  function fichierDuLien(){
    const m=/^#c\/(.+)$/.exec(location.hash||'');
    if(!m)return '';
    try{const n=decodeURIComponent(m[1]);return /^[A-Za-z0-9][A-Za-z0-9._-]{0,120}\.html$/.test(n)?n:'';}catch(_){return '';}
  }
  /* Un coffre qui ne répond pas ne laisse pas tourner le cercle sans fin :
     au bout de vingt-cinq secondes, le contenu dit qu'il n'a pas pu être
     ouvert. */
  async function chargeUneFois(adresse){
    const arret=new AbortController(), minuteur=setTimeout(()=>arret.abort(),25000);
    try{
      const r=await fetch(adresse,{credentials:'same-origin',cache:'no-cache',signal:arret.signal});
      if(!r.ok)throw new Error('code '+r.status);
      return await r.text();
    }finally{clearTimeout(minuteur);}
  }
  /* Une demande qui échoue (le rechargement de la page peut en couper une
     au vol) est refaite une fois, une seconde plus tard, avant de dire que
     le contenu n'a pas pu être ouvert. */
  async function charge(adresse){
    try{ return await chargeUneFois(adresse); }
    catch(e){ await new Promise(r=>setTimeout(r,1000)); return chargeUneFois(adresse); }
  }
  /* ── UN COURS S'OUVRE VITE ──
     Un cours est un gros fichier (plusieurs mégaoctets). Deux choses
     l'allègent, sans rien changer à ce qu'on voit :
     · ses polices : chaque cours embarque les mêmes fichiers de polices ;
       ceux que le site garde à l'identique (racine/polices-cours, nommés
       d'après leur empreinte) sont remplacés par leur adresse, que le
       navigateur ne télécharge qu'une fois. Une police inconnue reste dans
       le cours.
     · l'appareil garde le cours ainsi allégé, sous l'empreinte que lui
       donne son sommaire (parcours/cours-sommaire.json) : tant que le cours
       n'a pas été refait, il s'ouvre sans rien télécharger ; refait, son
       empreinte change et il est repris au coffre. L'appareil garde les
       vingt derniers cours ouverts. */
  const CACHE_COURS='lv-cours', GARDES_COURS=20;
  async function empreinte(t){
    const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));
    return Array.from(new Uint8Array(d),x=>x.toString(16).padStart(2,'0')).join('').slice(0,24);
  }
  async function allege(code){
    const re=/url\((["']?)data:font\/woff2;base64,([A-Za-z0-9+\/=]+)\1\)/g, connues=new Map();
    const vues=new Set(); let m;
    while((m=re.exec(code)))vues.add(m[2]);
    for(const b of vues){const h=await empreinte(b);if(POLICES_COURS.indexOf(h)>=0)connues.set(b,h);}
    if(!connues.size)return code;
    return code.replace(re,(t,q,b)=>connues.has(b)?'url('+location.origin+'/polices-cours/'+connues.get(b)+'.woff2)':t);
  }
  async function chargeCours(fichier,adresse){
    const e=(typeof EMPREINTES_COURS==='object'&&EMPREINTES_COURS[fichier])||'';
    const cle=location.origin+'/__cours/'+encodeURIComponent(fichier)+'?e='+e;
    let boite=null;
    try{ if(e&&window.caches){boite=await caches.open(CACHE_COURS);const r=await boite.match(cle);if(r)return await r.text();} }catch(_){boite=null;}
    let code=await charge(adresse);
    try{ code=await allege(code); }catch(_){}
    if(boite){
      try{
        const cles=await boite.keys(), dossier=location.origin+'/__cours/'+encodeURIComponent(fichier)+'?';
        for(const k of cles)if(k.url.indexOf(dossier)===0)await boite.delete(k);
        await boite.put(cle,new Response(code,{headers:{'content-type':'text/html; charset=utf-8'}}));
        const reste=(await boite.keys()).filter(k=>k.url.indexOf(dossier)!==0);
        for(let i=0;i<reste.length-(GARDES_COURS-1);i++)await boite.delete(reste[i]);
      }catch(_){}
    }
    return code;
  }
  /* ── LE PARCOURS RESTE EN MÉMOIRE ──
     Le parcours est long à construire (plus de neuf cents sujets). Quand un
     cours s'ouvre, son cadre n'est donc pas jeté : il reste dans la page,
     masqué sous le cours, et la flèche de retour le fait reparaître aussitôt,
     à sa place, avec ses thèmes dépliés. Un cours, lui, est jeté en le
     quittant. */
  let PARC=null;
  function ferme(){
    if(!OUVERT)return;
    pousse();
    if(OUVERT.genre==='parcours'&&OUVERT.f&&OUVERT.rendu){PARC=OUVERT;PARC.f.style.visibility='hidden';PARC.f.setAttribute('aria-hidden','true');}
    else{try{OUVERT.f.remove();}catch(_){}}
    OUVERT=null;
  }
  /* ── REPRENDRE ──
     En tête du parcours, « Reprendre » rouvre le dernier cours ouvert, à la
     place où on l'avait laissé (la place de lecture de chaque cours est
     déjà gardée). Le dernier cours se garde avec la taille du texte
     (« _reglages »), donc d'un appareil à l'autre ; un cours qui n'est plus
     au sommaire ne se propose pas. */
  function reprise(){
    const d=litJson('dernier','_reglages');
    if(!d||typeof d.f!=='string'||typeof d.t!=='string')return null;
    if(typeof EMPREINTES_COURS==='object'&&!EMPREINTES_COURS[d.f])return null;
    return {f:d.f,t:d.t};
  }
  function reprendParcours(){
    const o=PARC; PARC=null;
    if(!o||!o.f||!o.f.isConnected)return false;
    OUVERT=o;
    o.f.style.visibility=''; o.f.removeAttribute('aria-hidden');
    finAttente(o);
    /* la progression des cours a pu changer pendant qu'on y était */
    try{o.f.contentWindow.postMessage({lvReprise:reprise(),lvAuto:etatsDesCours(),lvSais:saisDesCours()},'*');}catch(_){}
    return true;
  }
  async function montre(ancre){
    const fichier=fichierDuLien();
    const o=fichier?{id:'c_'+fichier.replace(/\.html$/,''),genre:'cours',fichier,adresse:'/parcours/cours/'+encodeURIComponent(fichier)}
                   :{id:'parcours',genre:'parcours',adresse:PARCOURS};
    if(OUVERT&&OUVERT.id===o.id){ if(ancre&&OUVERT.f)va(OUVERT,ancre); return; }
    ferme();
    if(o.genre==='parcours'&&reprendParcours())return;
    o.ancre=ancre||'';
    OUVERT=o;
    attend();
    /* le parcours tire l'état de ses sujets de la progression de tous les cours */
    const pret=rapatrie(o.genre==='parcours'?[o.id,'_reglages',...idsCours()]:[o.id,'_reglages']);
    let code='';
    try{ code=await (o.genre==='cours'?chargeCours(o.fichier,o.adresse):charge(o.adresse)); }
    catch(e){
      if(OUVERT!==o)return;
      console.warn('étude',e);
      /* le message dit la raison en petit, et « Réessayer » rouvre le
         contenu (message lvRecharge) */
      const raison=String(e&&e.name==='AbortError'?'délai dépassé':(e&&e.message)||'réseau').replace(/[<>&"]/g,'');
      code='<div style="font-family:Georgia,serif;color:#fff;padding:48px 24px;text-align:center"><p style="opacity:.8;margin:0 0 20px">Ce contenu n’a pas pu être ouvert. Vérifiez la connexion, puis réessayez.</p>'
        +'<button type="button" onclick="parent.postMessage({lvRecharge:1},\'*\')" style="font:500 16px/1 \'EB Garamond\',Georgia,serif;background:#efe6cf;color:#000;border:0;border-radius:999px;padding:10px 22px;cursor:pointer">Réessayer</button>'
        +'<p style="opacity:.35;font-size:12px;margin:18px 0 0">('+raison+')</p></div>';
    }
    if(OUVERT!==o)return;
    /* le compte connu, la copie de l'appareil est la sienne */
    await pret;
    if(OUVERT!==o)return;
    o.code=code;
    const t=/<title>([^<]*)<\/title>/i.exec(code);
    o.titre=t?decode(t[1]).trim():(o.genre==='parcours'?'La foi catholique':'Cours');
    /* le dernier cours ouvert, pour « Reprendre » en tête du parcours */
    if(o.genre==='cours'&&/<cours\b/.test(o.code))garde('dernier','_reglages',JSON.stringify({f:o.fichier,t:o.titre}));
    const f=document.createElement('iframe');
    f.className='res-plein';
    f.setAttribute('sandbox','allow-scripts');
    f.setAttribute('allow','clipboard-write *');
    f.setAttribute('referrerpolicy','no-referrer');
    f.setAttribute('title',o.titre);
    o.f=f;
    /* l'état avant la place : les sections reprennent leur ouverture,
       puis la place de lecture tombe sur la page ainsi constituée */
    /* le contenu s'affiche aussitôt ; son état et sa place lui sont rendus
       dès que celui des autres appareils est arrivé (deux secondes et
       demie au plus) */
    const rends=()=>pret.then(()=>{
      if(OUVERT!==o)return;
      envoieEtat(o);
      /* ouvert par un lien d'un autre cours : on va à l'endroit visé plutôt
         qu'à la place gardée */
      if(o.genre==='parcours'){try{f.contentWindow.postMessage({lvBlocsOuverts:litJson('blocs',o.id)||[],lvReprise:reprise(),lvAuto:etatsDesCours(),lvSais:saisDesCours()},'*');}catch(_){}}
      if(o.ancre)va(o,o.ancre);
      else{
        const pi=Object.assign({y:0},litJson('pos',o.id)||{});
        try{f.contentWindow.postMessage({lvRevoir:Math.max(0,Math.round(pi.y||0)),lvRevoirInfo:pi},'*');}catch(_){}
      }
      o.rendu=true;
    });
    /* Le contenu se déclare prêt (lvEtatVoulu) : c'est seulement alors que
       son état lui est rendu et que ce qu'il envoie est gardé. Le chargement
       du cadre ne suffit pas : certains navigateurs (Safari sur iPhone) en
       annoncent un premier, à blanc, avant le contenu, et l'état de départ du
       contenu (ouverture du cours, sections fermées) écraserait la reprise.
       Un contenu qui ne se déclare pas (une page sans moteur) suit le
       chargement. */
    o.rends=()=>{rends();setTimeout(rends,300);setTimeout(rends,1000);};
    f.addEventListener('load',()=>{finAttente(o);if(code.indexOf('lvEtatVoulu')<0)o.rends();});
    /* le document du cadre est écrit avant que le cadre entre dans la page :
       un cadre posé vide se charge d'abord à blanc, et ce premier
       chargement passerait pour le sien. L'état gardé serait alors tenu pour
       rendu trop tôt, et l'état de naissance du contenu (première page,
       sections fermées) l'écraserait. */
    /* le parcours se montre un peu dézoomé, toute la page ensemble, textes,
       cadres et marges : sa mise en page est pensée pour un écran plus
       grand (Emmanuel : « la page est trop zoomée ») */
    let doc=pageCadre(poseProgression(code,litJson('prog',o.id)));
    if(o.genre==='parcours'){
      doc=doc.replace('<head>',()=>'<head><style>html{zoom:'+ZOOM_PARCOURS+'}</style>'+REPLI_BLOCS);
      const k=doc.lastIndexOf('</body>');
      doc=k<0?doc+BARRE_BLOCS:doc.slice(0,k)+BARRE_BLOCS+doc.slice(k);
    }
    f.srcdoc=doc;
    /* le cadre se glisse sous le cercle de chargement, qui le couvre jusqu'au bout */
    acts.parentNode.insertBefore(f,attente||acts);
  }
  /* ── L'ÉTAT DES SUJETS QUI ONT LEUR COURS ──
     Un sujet dont le cours existe prend son état de l'autoévaluation de ce
     cours : aucune affirmation « Je sais… » cochée, à faire ; une partie,
     en cours ; toutes, terminé. Chaque clé d'affirmation commence par la
     lettre de son cours, et le sommaire des cours (SAIS_COURS, posé par la
     fabrication) dit combien chaque cours en compte. */
  const fichiersCours=()=>[...new Set(Object.values(typeof LIENS_COURS==='object'&&LIENS_COURS||{}).map(u=>String(u).split('#')[0]))];
  const idsCours=()=>fichiersCours().map(n=>'c_'+n.replace(/\.html$/,''));
  function etatsDesCours(){
    const m={}, s=saisDesCours();
    Object.keys(s).forEach(cle=>{const [f,tot]=s[cle];m[cle]=!f?'a-faire':(tot&&f>=tot?'termine':'en-cours');});
    return m;
  }
  /* pour chaque sujet qui a son cours : [affirmations cochées, affirmations du cours] */
  function saisDesCours(){
    const m={}, faits={};
    fichiersCours().forEach(n=>{
      const p=litJson('prog','c_'+n.replace(/\.html$/,''));
      const a=p&&p.acquis&&typeof p.acquis==='object'?p.acquis:{}, c={};
      Object.keys(a).forEach(k=>{const x=/^([a-z]+)\d+\.\d+$/.exec(k);if(a[k]&&x)c[x[1]]=(c[x[1]]||0)+1;});
      faits[n]=c;
    });
    Object.keys(LIENS_COURS||{}).forEach(cle=>{
      const [n,an]=String(LIENS_COURS[cle]).split('#'), l=(an||'').replace(/^ouverture-/,'');
      const tot=((typeof SAIS_COURS==='object'&&SAIS_COURS[n])||{})[l]||0, f=Math.min(tot,(faits[n]||{})[l]||0);
      m[cle]=[f,tot];
    });
    return m;
  }
  function va(o,ancre){
    try{o.f.contentWindow.postMessage({lvVa:ancre},'*');}catch(_){}
  }
  function envoieEtat(o){
    const e=etatPour(o);
    if(!e)return;
    try{o.f.contentWindow.postMessage({lvEtat:e},'*');}catch(_){}
  }

  /* ── LES MESSAGES DU CADRE ── */
  function copie(t){
    try{ if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).catch(()=>vieille(t));return;} }catch(_){}
    vieille(t);
  }
  function vieille(t){
    try{const z=document.createElement('textarea');z.value=t;z.setAttribute('readonly','');
      z.style.cssText='position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;font-size:16px';
      document.body.appendChild(z);z.select();document.execCommand('copy');document.body.removeChild(z);}catch(_){}
  }
  window.addEventListener('message',ev=>{
    const o=OUVERT, d=ev.data;
    if(!o||!o.f||ev.source!==o.f.contentWindow||!d||typeof d!=='object')return;
    if(d.lvRecharge){ ferme(); if(PARC===o){try{o.f.remove();}catch(_){} PARC=null;} montre(); return; }
    if(typeof d.lvSujet==='string'){ ouvreSujet(d.lvSujet); return; }
    if(typeof d.lvCours==='string'){ ouvreCours(d.lvCours,typeof d.lvCoursAncre==='string'?d.lvCoursAncre:''); return; }
    if('lvSel' in d){ if(typeof qaSelectionCadre==='function')qaSelectionCadre(d.lvSel,o.f,o.titre,o.genre==='cours'?'un cours':'un parcours',o.code,null); return; }
    if(typeof d.lvPos==='number'){
      if(o.rendu){const info=d.lvPosInfo&&typeof d.lvPosInfo==='object'?d.lvPosInfo:{y:d.lvPos};info.y=Math.max(0,Math.round(info.y||0));garde('pos',o.id,JSON.stringify(info));}
      return;
    }
    if(typeof d.lvEtat!=='undefined'&&d.lvEtat!==null){
      /* tant que l'état gardé n'a pas été rendu, ce que le cadre envoie
         n'est que son état de naissance */
      if(!o.rendu)return;
      garde('etat',o.id,JSON.stringify(d.lvEtat));
      const r=rangDe(d.lvEtat,o.genre);
      if(r>=0&&String(r)!==lLit('taille','_reglages'))garde('taille','_reglages',String(r));
      return;
    }
    if(d.lvEtatVoulu){ envoieEtat(o); if(!o.voulu){o.voulu=true;o.rends&&o.rends();} return; }
    if(Array.isArray(d.lvBlocs)){ garde('blocs',o.id,JSON.stringify(d.lvBlocs.filter(i=>Number.isInteger(i)&&i>=0&&i<100))); return; }
    if(d.lvProgression&&typeof d.lvProgression==='object'){ garde('prog',o.id,JSON.stringify(progressionPropre(d.lvProgression))); return; }
    if(typeof d.lvCopie==='string')copie(d.lvCopie);
  });

  /* ── ALLER ET VENIR ──
     Ouvrir un cours ajoute un pas à l'historique : le retour du téléphone
     ramène au parcours, comme le bouton de retour. Un lien d'un cours vers
     un autre fichier de cours ouvre celui-ci à l'endroit visé, et le retour
     ramène au premier cours, à la place où l'on en était. */
  function ouvreCours(n,ancre){
    if(!/^[A-Za-z0-9][A-Za-z0-9._-]{0,120}\.html$/.test(n))return;
    if(!/^[A-Za-z0-9_-]{0,80}$/.test(ancre||''))ancre='';
    if(OUVERT&&OUVERT.fichier===n){ if(ancre)va(OUVERT,ancre); return; }
    history.pushState({etude:'cours'},'','#c/'+encodeURIComponent(n));
    montre(ancre);
  }
  /* ── LES LIENS EN ATTENTE ──
     Un cours peut renvoyer à un sujet du parcours avant que son cours soit
     écrit. Le lien se résout ici, d'après les liens du parcours vers les
     cours (parcours/cours.json, posé par la fabrication) : il s'ouvre dès
     que le cours existe, et en attendant un mot bref le dit. */
  function ouvreSujet(cle){
    const u=(typeof LIENS_COURS==='object'&&LIENS_COURS)?LIENS_COURS[cle]:'';
    if(u){const [n,a]=String(u).split('#');ouvreCours(n,a||'');return;}
    avis('Ce cours n’est pas encore écrit.');
  }
  let avisMin=0;
  function avis(t){
    let e=document.getElementById('et-avis');
    if(!e){e=document.createElement('div');e.id='et-avis';e.className='et-avis';e.setAttribute('role','status');document.body.appendChild(e);}
    e.textContent=t;void e.offsetWidth;e.classList.add('vu');
    clearTimeout(avisMin);avisMin=setTimeout(()=>e.classList.remove('vu'),2600);
  }
  window.addEventListener('popstate',()=>montre());
  function retour(){
    if(enCours()){
      if(history.state&&history.state.etude==='cours'){history.back();return;}
      history.replaceState(null,'',location.pathname+location.search);
      montre();return;
    }
    pousse();
    let r='';try{r=new URL(document.referrer).origin;}catch(e){}
    if(r===location.origin&&history.length>1)history.back();else location.href='/';
  }
  document.getElementById('et-retour').onclick=retour;
  document.getElementById('et-bible').onclick=function(){
    if(window.LVBible&&typeof window.LVBible.bascule==='function')window.LVBible.bascule();
  };
  document.getElementById('et-ia').onclick=function(){
    if(typeof qaReprend!=='function'||!OUVERT)return;
    qaReprend({texte:'',contexte:'',source:OUVERT.titre||'',espece:enCours()?'un cours':'un parcours',ref:null},OUVERT.code||'');
  };
  /* le bandeau se tient replié derrière trois points (commun/cadre.js) */
  lvRepliBandeau(acts);
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&!document.querySelector('#bp-pan.on')&&!document.documentElement.classList.contains('qa-ouvert'))retour();
  });
  montre();
})();

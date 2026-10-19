/* ════════════════════════════════════════════════════════════════════
   LUMEN · FONCTIONNEMENT COMMUN : QUESTION À L'IA
   Pages : Articles, Ressources, Bible.
   Emmanuel : « quand on sélectionne un texte avec la souris dans un
   article, une ressource ou dans la Bible, ajoute un bouton pour poser
   une question à l'IA ».

   Un texte sélectionné fait paraître le bouton « Demander à l'IA ». Il
   ouvre un panneau : le passage en tête, puis la conversation, la
   question en bas. On peut poser d'autres questions à la suite ; une
   nouvelle sélection ouvre une nouvelle conversation. Rien n'est gardé
   une fois le panneau refermé.

   Dans Articles et Ressources, la page tourne dans un cadre isolé qui
   n'a aucun accès au site : le cadre dit seulement ce qui y est
   sélectionné (QA_CADRE, ajouté à chaque page encadrée), et c'est la
   page du site qui montre le bouton. Dans la Bible, le bouton prend
   place dans le petit menu qui paraît sur un texte sélectionné.

   La réponse passe par /api/ia (tâche « question »). Pour citer un
   verset, l'IA demande son texte exact ; la page le lit dans les deux
   Bibles du site (commun/versets.js) et le lui rend.
   ════════════════════════════════════════════════════════════════════ */

/* ── CE QUE LE CADRE DIT DE SA SÉLECTION ──
   Le texte choisi, le passage qui l'entoure (le bloc assez long pour
   donner le contexte), et sa place dans le cadre, pour poser le bouton
   juste à côté. Une sélection vide se dit aussi : le bouton disparaît. */
const QA_CADRE='<scr'+'ipt>(function(){var t=0;'
  +'function envoie(){var s=getSelection(),x=s?String(s).replace(/\\s+/g," ").trim():"";'
  +'if(x.length<2||!s.rangeCount){parent.postMessage({lvSel:null},"*");return;}'
  +'var r=s.getRangeAt(0),b=r.getBoundingClientRect(),n=r.commonAncestorContainer;'
  +'if(n.nodeType!==1)n=n.parentNode;var c=n;'
  +'while(c&&c.parentNode&&c!==document.body&&(c.textContent||"").length<1500)c=c.parentNode;'
  +'var k=(c&&c.textContent||"").replace(/\\s+/g," ").trim();'
  +'if(k.length>6000){var i=k.indexOf(x.slice(0,40)),d=Math.max(0,i-2500);k=k.slice(d,d+6000);}'
  +'parent.postMessage({lvSel:{texte:x.slice(0,4000),contexte:k,haut:b.top,bas:b.bottom,gauche:b.left,droite:b.right}},"*");}'
  +'function plan(){clearTimeout(t);t=setTimeout(envoie,160);}'
  +'document.addEventListener("selectionchange",plan);addEventListener("scroll",plan,true);'
  +'})();</scr'+'ipt>';

const qaEsc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const QA_IC_IA='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z"/><path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/></svg>';

/* ── LE BOUTON ──
   Posé au-dessus de la sélection ; sur un écran tactile, en dessous,
   pour laisser la place au menu du téléphone. */
let QA_SEL=null, QA_BOUTON=null;
function qaBouton(){
  if(QA_BOUTON)return QA_BOUTON;
  const b=document.createElement('button');
  b.type='button'; b.id='qa-bouton'; b.className='qa-bouton';
  b.innerHTML=QA_IC_IA+'<span>Demander à l’IA</span>';
  /* le bouton ne prend pas la main : la sélection reste visible */
  b.addEventListener('mousedown',e=>e.preventDefault());
  b.onclick=()=>{const s=QA_SEL;qaCacheBouton();if(s)qaOuvre(s.passage);};
  document.body.appendChild(b);
  QA_BOUTON=b;
  return b;
}
function qaCacheBouton(){QA_SEL=null;if(QA_BOUTON)QA_BOUTON.classList.remove('on');}
function qaPoseBouton(){
  if(!QA_SEL)return;
  const b=qaBouton(), s=QA_SEL;
  let r=s.rect;
  if(s.cadre){
    const c=s.cadre.getBoundingClientRect();
    if(!c.width&&!c.height){qaCacheBouton();return;}
    r={haut:c.top+s.rect.haut,bas:c.top+s.rect.bas,gauche:c.left+s.rect.gauche,droite:c.left+s.rect.droite};
  }
  b.classList.add('on');
  const w=b.offsetWidth, h=b.offsetHeight, vw=document.documentElement.clientWidth, vh=window.innerHeight;
  const tactile=window.matchMedia&&matchMedia('(pointer:coarse)').matches;
  let x=(r.gauche+r.droite)/2-w/2;
  x=Math.max(10,Math.min(x,vw-w-10));
  let y=tactile?r.bas+14:r.haut-h-10;
  if(y<10)y=r.bas+10;
  if(y+h>vh-10)y=Math.max(10,r.haut-h-10);
  b.style.left=Math.round(x)+'px'; b.style.top=Math.round(y)+'px';
}
window.addEventListener('scroll',()=>{if(QA_SEL&&QA_SEL.cadre)qaPoseBouton();},true);
window.addEventListener('resize',()=>{if(QA_SEL)qaPoseBouton();});

/* Articles et Ressources : la page reçoit la sélection d'un cadre.
   source : le titre de l'élément ouvert. */
function qaSelectionCadre(sel,cadre,source,espece){
  if(!sel||!sel.texte){qaCacheBouton();return;}
  QA_SEL={cadre,rect:sel,passage:{texte:sel.texte,contexte:sel.contexte||'',source:source||'',espece:espece||''}};
  qaPoseBouton();
}

/* ── L'APPEL ──
   La réponse arrive au fil de l'eau. Quand l'IA demande des versets, la
   page les lit dans les Bibles du site, les lui rend, et la réponse
   reprend. */
async function qaFlux(messages,surTexte){
  const u=window.firebase&&firebase.auth&&firebase.auth().currentUser;
  if(!u)throw new Error('Connectez-vous pour poser une question à l’IA.');
  const jeton=await u.getIdToken();
  const r=await fetch('/api/ia',{method:'POST',headers:{'content-type':'application/json','authorization':'Bearer '+jeton},body:JSON.stringify({tache:'question',donnees:{messages}})});
  const type=r.headers.get('content-type')||'';
  if(!r.ok||type.indexOf('event-stream')<0){
    let m='';
    try{const j=await r.json();m=j.message||'';}catch(_){}
    throw new Error(m||('L’IA n’a pas répondu (erreur '+r.status+').'));
  }
  const lect=r.body.getReader(), dec=new TextDecoder();
  const blocs=[]; let tampon='', fin='', erreur='';
  const traite=bloc=>{
    const ligne=bloc.split('\n').find(l=>l.startsWith('data:'));
    if(!ligne)return;
    let ev; try{ev=JSON.parse(ligne.slice(5).trim());}catch(_){return;}
    if(ev.type==='content_block_start'){
      const c=ev.content_block||{};
      blocs[ev.index]=c.type==='tool_use'?{type:'tool_use',id:c.id,name:c.name,json:''}:{type:'text',text:''};
    }else if(ev.type==='content_block_delta'&&ev.delta){
      const b=blocs[ev.index]; if(!b)return;
      if(ev.delta.type==='text_delta'){b.text+=ev.delta.text;surTexte(ev.delta.text);}
      else if(ev.delta.type==='input_json_delta')b.json+=ev.delta.partial_json||'';
    }
    else if(ev.type==='message_delta'&&ev.delta&&ev.delta.stop_reason)fin=ev.delta.stop_reason;
    else if(ev.type==='error')erreur=(ev.error&&ev.error.message)||'erreur';
  };
  for(;;){
    const {value,done}=await lect.read();
    if(done)break;
    tampon+=dec.decode(value,{stream:true});
    let k;
    while((k=tampon.indexOf('\n\n'))>=0){traite(tampon.slice(0,k));tampon=tampon.slice(k+2);}
  }
  if(tampon.trim())traite(tampon);
  if(erreur)throw new Error('L’IA s’est interrompue : '+erreur);
  const contenu=blocs.filter(Boolean).map(b=>{
    if(b.type==='text')return {type:'text',text:b.text};
    let input={}; try{input=JSON.parse(b.json||'{}');}catch(_){}
    return {type:'tool_use',id:b.id,name:b.name,input};
  }).filter(b=>b.type!=='text'||b.text);
  return {contenu,fin};
}

async function qaOutil(b){
  if(b.name!=='lire_versets')return 'Outil inconnu.';
  const demandes=(b.input&&Array.isArray(b.input.references)?b.input.references:[]).slice(0,40).map(String);
  try{
    const versets=[], introuvables=[];
    for(const d of demandes){
      const refs=await lvReferences(d,5);
      if(!refs.length){introuvables.push(d);continue;}
      versets.push(...await lvLitRefs(refs));
    }
    return JSON.stringify({versets,introuvables});
  }catch(_){return 'Les versets n’ont pas pu être lus.';}
}

/* ── LE TEXTE DE LA RÉPONSE ──
   Paragraphes, listes, gras et italique : ce que la consigne permet. */
function qaRendu(t){
  const enligne=s=>qaEsc(s).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g,'$1<em>$2</em>');
  return String(t).trim().split(/\n{2,}/).map(bloc=>{
    const lignes=bloc.split('\n');
    if(lignes.every(l=>/^\s*[-•]\s+/.test(l)))
      return '<ul>'+lignes.map(l=>'<li>'+enligne(l.replace(/^\s*[-•]\s+/,''))+'</li>').join('')+'</ul>';
    return '<p>'+lignes.map(enligne).join('<br>')+'</p>';
  }).join('');
}

/* ── LE PANNEAU ── */
let QA_MSGS=[], QA_PASSAGE=null, QA_ATTENTE=false, QA_TOUR=0;
function qaPanneau(){
  let p=document.getElementById('qa-panneau');
  if(p)return p;
  p=document.createElement('aside');
  p.id='qa-panneau'; p.className='qa-panneau';
  p.setAttribute('role','dialog'); p.setAttribute('aria-label','Question à l’IA');
  p.innerHTML='<div class="qa-tete"><span class="qa-label">'+QA_IC_IA+'Question à l’IA</span>'
    +'<button type="button" class="qa-x" aria-label="Fermer"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>'
    +'<div class="qa-fil" id="qa-fil"></div>'
    +'<form class="qa-saisie" id="qa-saisie"><textarea id="qa-champ" rows="1" placeholder="Votre question sur ce passage…"></textarea>'
    +'<button type="submit" class="qa-envoi" id="qa-envoi" aria-label="Envoyer"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg></button></form>';
  document.body.appendChild(p);
  p.querySelector('.qa-x').onclick=qaFerme;
  const champ=p.querySelector('#qa-champ');
  const hauteur=()=>{champ.style.height='auto';champ.style.height=Math.min(champ.scrollHeight,160)+'px';};
  champ.addEventListener('input',hauteur);
  champ.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();qaEnvoie();}});
  p.querySelector('#qa-saisie').addEventListener('submit',e=>{e.preventDefault();qaEnvoie();});
  return p;
}
function qaFerme(){
  const p=document.getElementById('qa-panneau');
  if(p)p.classList.remove('on');
  document.documentElement.classList.remove('qa-ouvert');
  QA_TOUR++;
}
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&document.querySelector('#qa-panneau.on')){e.stopImmediatePropagation();qaFerme();}
},true);
/* un clic ailleurs que sur le bouton le retire (la sélection de la page
   elle-même, hors cadre, se gère par la Bible) */
document.addEventListener('mousedown',e=>{if(QA_BOUTON&&!e.target.closest('#qa-bouton'))qaCacheBouton();},true);

async function qaOuvre(passage){
  const p=qaPanneau();
  QA_PASSAGE=passage; QA_MSGS=[]; QA_ATTENTE=false; QA_TOUR++;
  let source=passage.source||'';
  if(passage.bible){
    try{
      const L=await lvLivres(), b=passage.bible;
      source=L.nom(b.slug)+' '+b.ch+':'+b.v1+(b.v2>b.v1?'-'+b.v2:'');
    }catch(_){}
  }
  passage.etiquette=source+(passage.traduction?'  ·  '+passage.traduction:'');
  $qa('qa-fil').innerHTML='<blockquote class="qa-passage"><p>'+qaEsc(passage.texte)+'</p>'
    +(passage.etiquette?'<cite>'+qaEsc(passage.etiquette)+'</cite>':'')+'</blockquote>';
  p.classList.add('on');
  document.documentElement.classList.add('qa-ouvert');
  const champ=$qa('qa-champ');
  champ.value=''; champ.style.height='auto';
  setTimeout(()=>champ.focus(),60);
}
const $qa=id=>document.getElementById(id);

async function qaEnvoie(){
  const champ=$qa('qa-champ'), q=champ.value.trim();
  if(!q||QA_ATTENTE||!QA_PASSAGE)return;
  champ.value=''; champ.style.height='auto';
  QA_ATTENTE=true; $qa('qa-envoi').disabled=true;
  const tour=QA_TOUR, fil=$qa('qa-fil');
  const qd=document.createElement('div'); qd.className='qa-q'; qd.textContent=q; fil.appendChild(qd);
  const rd=document.createElement('div'); rd.className='qa-r'; rd.innerHTML='<span class="qa-roue" aria-label="Réponse en cours"></span>'; fil.appendChild(rd);
  qd.scrollIntoView({block:'start',behavior:'smooth'});
  let contenu=q;
  if(!QA_MSGS.length){
    const P=QA_PASSAGE;
    contenu='Passage sélectionné'+(P.etiquette?' ('+P.etiquette+')':'')+(P.espece?', dans '+P.espece:'')+' :\n« '+P.texte+' »'
      +(P.contexte&&P.contexte!==P.texte?'\n\nLe texte autour du passage :\n'+P.contexte:'')
      +'\n\nQuestion : '+q;
  }
  const avant=QA_MSGS.length;
  QA_MSGS.push({role:'user',content:contenu});
  let texte='';
  const montre=()=>{if(tour===QA_TOUR)rd.innerHTML=qaRendu(texte)+(QA_ATTENTE?'<span class="qa-roue" aria-hidden="true"></span>':'');};
  try{
    for(let n=0;n<5;n++){
      const {contenu:c,fin}=await qaFlux(QA_MSGS,d=>{texte+=d;montre();});
      if(tour!==QA_TOUR)return;
      if(!c.length)break;
      QA_MSGS.push({role:'assistant',content:c});
      if(fin!=='tool_use')break;
      const outils=c.filter(b=>b.type==='tool_use');
      const res=await Promise.all(outils.map(async b=>({type:'tool_result',tool_use_id:b.id,content:await qaOutil(b)})));
      if(tour!==QA_TOUR)return;
      QA_MSGS.push({role:'user',content:res});
      if(texte&&!/\n$/.test(texte))texte+='\n\n';
    }
    if(!texte.trim())texte='L’IA n’a rien répondu. Reformulez la question, puis réessayez.';
  }catch(e){
    console.warn('question',e);
    if(tour!==QA_TOUR)return;
    /* la question ratée sort de la conversation : la suivante repart
       d'un échange complet */
    QA_MSGS.length=avant;
    texte=(texte?texte+'\n\n':'')+(e&&e.message?e.message:'La question n’a pas pu partir.');
    rd.classList.add('erreur');
  }finally{
    if(tour===QA_TOUR){QA_ATTENTE=false;$qa('qa-envoi').disabled=false;montre();champ.focus();}
  }
}

window.LVQuestion={ouvre:qaOuvre};

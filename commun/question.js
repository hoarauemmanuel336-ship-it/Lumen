/* ════════════════════════════════════════════════════════════════════
   LUMEN · FONCTIONNEMENT COMMUN : QUESTION À L'IA
   Pages : Articles, Ressources, Bible.
   Emmanuel : « quand on sélectionne un texte avec la souris dans un
   article, une ressource ou dans la Bible, ajoute un bouton pour poser
   une question à l'IA ».

   Un texte sélectionné fait paraître un petit bandeau de deux icônes :
   copier le texte, et demander à l'IA. La seconde ouvre un salon de
   discussion (Emmanuel : « ça doit être un salon de chat, on doit pouvoir
   lui répondre aussi ») : le passage en tête, puis les messages, ceux
   d'Emmanuel en bulles à droite, ceux de l'IA en texte de lecture à
   gauche, chacun avec son bouton copier ; le champ du bas sert à lui
   répondre. Une nouvelle sélection ouvre une nouvelle discussion.

   Chaque conversation est gardée dans le compte (users/…/questions)
   après chaque réponse (Emmanuel : « sinon après une question on ferme
   par inadvertance et c'est perdu »). « Mes questions », dans le panneau
   et dans « Mon compte », les rouvre, et on peut les continuer. Une
   poubelle, dans la liste et dans la conversation ouverte, en met une à
   la corbeille ; « Choisir », en tête de la liste, en met plusieurs ou
   toutes. La corbeille, au bout de la liste, les remet ou les supprime
   pour de bon.

   Dans Articles et Ressources, la page tourne dans un cadre isolé qui
   n'a aucun accès au site : le cadre dit seulement ce qui y est
   sélectionné (QA_CADRE, ajouté à chaque page encadrée), et c'est la
   page du site qui montre le bandeau. Dans la Bible, les deux icônes
   prennent place dans le petit menu qui paraît sur un texte sélectionné,
   collées au bouton « Retirer ».

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
const QA_IC_COPIE='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><rect x="8.5" y="8.5" width="11" height="11" rx="1"/><path d="M15.5 8.5V5.5a1 1 0 0 0-1-1h-9a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3"/></svg>';
const QA_IC_FAIT='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const QA_IC_MES='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4.5v3h3"/><path d="M12 8.5V12l2.5 2"/></svg>';
const QA_IC_JETER='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 7h15M9.5 7V5.2c0-.4.3-.7.7-.7h3.6c.4 0 .7.3.7.7V7M6.5 7l.9 11.6c.1.8.7 1.4 1.5 1.4h6.2c.8 0 1.4-.6 1.5-1.4L17.5 7M10.2 10.5v6M13.8 10.5v6"/></svg>';
const QA_IC_REMET='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 7.5L4.5 12 9 16.5"/><path d="M4.5 12h10a5 5 0 0 1 0 10h-2"/></svg>';
const QA_IC_IA='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z"/><path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/></svg>';

/* ── LE BANDEAU ──
   Deux icônes collées dans un bandeau crème, comme les boutons du site :
   copier le texte, demander à l'IA. Posé au-dessus de la sélection ; sur
   un écran tactile, en dessous, pour laisser la place au menu du
   téléphone. */
let QA_SEL=null, QA_BOUTON=null;
function qaBouton(){
  if(QA_BOUTON)return QA_BOUTON;
  const b=document.createElement('div');
  b.id='qa-bouton'; b.className='qa-bouton';
  b.innerHTML='<button type="button" class="qa-b" data-qa="copie" aria-label="Copier le texte" title="Copier le texte">'+QA_IC_COPIE+'</button>'
    +'<button type="button" class="qa-b" data-qa="ia" aria-label="Demander à l’IA" title="Demander à l’IA">'+QA_IC_IA+'</button>';
  /* le bandeau ne prend pas la main : la sélection reste visible */
  b.addEventListener('mousedown',e=>e.preventDefault());
  b.querySelector('[data-qa="ia"]').onclick=()=>{const s=QA_SEL;qaCacheBouton();if(s)qaOuvre(s.passage);};
  const c=b.querySelector('[data-qa="copie"]');
  c.onclick=()=>{
    if(!QA_SEL)return;
    qaCopie(QA_SEL.passage.texte);
    c.innerHTML=QA_IC_FAIT;
    setTimeout(()=>{c.innerHTML=QA_IC_COPIE;qaCacheBouton();},900);
  };
  document.body.appendChild(b);
  QA_BOUTON=b;
  return b;
}
/* la copie passe par le presse-papiers du navigateur, sinon par une zone
   de texte cachée */
function qaCopie(t){
  const vieux=()=>{
    const z=document.createElement('textarea');
    z.value=t; z.setAttribute('readonly',''); z.style.position='fixed'; z.style.opacity='0';
    document.body.appendChild(z); z.select();
    try{document.execCommand('copy');}catch(_){}
    z.remove();
  };
  try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).catch(vieux);return;}}catch(_){}
  vieux();
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

/* ── LE COMPTE ──
   Dans la Bible, le service de connexion se charge à la demande, et le
   compte se reconnaît un instant après : on attend l'un et l'autre avant
   de dire qu'il faut se connecter. */
async function qaCompte(){
  if(window.lvFB){try{await window.lvFB();}catch(_){}}
  for(let i=0;i<30&&!(window.firebase&&firebase.apps&&firebase.apps.length);i++)await new Promise(r=>setTimeout(r,100));
  if(!(window.firebase&&firebase.auth&&firebase.apps&&firebase.apps.length))return null;
  const a=firebase.auth();
  if(a.currentUser)return a.currentUser;
  return new Promise(res=>{
    let off=null;
    const t=setTimeout(()=>{if(off)off();res(null);},5000);
    off=a.onAuthStateChanged(u=>{if(!u)return;clearTimeout(t);if(off)off();res(u);});
  });
}

/* ── L'APPEL ──
   La réponse arrive au fil de l'eau. Quand l'IA demande des versets, la
   page les lit dans les Bibles du site, les lui rend, et la réponse
   reprend. */
async function qaFlux(messages,surTexte){
  const u=await qaCompte();
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

/* un message d'Emmanuel : l'espace tapé avant « ? ! : ; » et autour des
   guillemets devient insécable, pour que le signe ne parte pas seul à la
   ligne dans la bulle */
const qaBulle=s=>qaEsc(s).replace(/ ([?!:;»])/g,'\u00a0$1').replace(/« /g,'«\u00a0');
/* un message de l'IA : son texte, puis le bouton qui le copie */
function qaMsgIA(t){
  return '<div class="qa-r">'+qaRendu(t)+'</div>'
    +'<button type="button" class="qa-copie-r" aria-label="Copier la réponse" title="Copier la réponse">'+QA_IC_COPIE+'</button>';
}
document.addEventListener('click',e=>{
  const c=e.target.closest&&e.target.closest('.qa-cite');
  if(c){const o=c.classList.toggle('ouvert');c.setAttribute('aria-expanded',o?'true':'false');return;}
  const b=e.target.closest&&e.target.closest('.qa-copie-r'); if(!b)return;
  const r=b.previousElementSibling; if(!r)return;
  qaCopie(r.innerText.trim());
  b.innerHTML=QA_IC_FAIT; setTimeout(()=>{b.innerHTML=QA_IC_COPIE;},1400);
});
/* le champ invite à poser la question, puis à répondre */
const qaInvite=()=>{const c=$qa('qa-champ');if(c)c.placeholder=QA_VU.length?'Répondre à l’IA…':'Votre question sur ce passage…';};

/* ── LE PANNEAU ── */
let QA_MSGS=[], QA_VU=[], QA_ID='', QA_PASSAGE=null, QA_ATTENTE=false, QA_TOUR=0;
function qaPanneau(){
  let p=document.getElementById('qa-panneau');
  if(p)return p;
  p=document.createElement('aside');
  p.id='qa-panneau'; p.className='qa-panneau';
  p.setAttribute('role','dialog'); p.setAttribute('aria-label','Question à l’IA');
  p.innerHTML='<div class="qa-tete"><span class="qa-label" id="qa-label">'+QA_IC_IA+'<span>Question à l’IA</span></span>'
    +'<span class="qa-outils"><button type="button" class="qa-x" id="qa-jeter" aria-label="Supprimer cette conversation" title="Supprimer cette conversation">'+QA_IC_JETER+'</button>'
    +'<button type="button" class="qa-x" id="qa-mes" aria-label="Mes questions" title="Mes questions">'+QA_IC_MES+'</button>'
    +'<button type="button" class="qa-x" id="qa-ferme" aria-label="Fermer"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></span></div>'
    +'<div class="qa-fil" id="qa-fil"></div>'
    +'<form class="qa-saisie" id="qa-saisie"><textarea id="qa-champ" rows="1" placeholder="Votre question sur ce passage…"></textarea>'
    +'<button type="submit" class="qa-envoi" id="qa-envoi" aria-label="Envoyer"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg></button></form>'
    +'<div class="qa-choix" id="qa-choix"><div class="qa-conf-b"><button type="button" id="qa-ch-tout">Tout choisir</button>'
    +'<button type="button" id="qa-ch-remet">Remettre</button>'
    +'<button type="button" id="qa-ch-jeter" aria-label="Supprimer les conversations choisies" title="Supprimer">'+QA_IC_JETER+'<span id="qa-ch-n"></span></button>'
    +'<button type="button" id="qa-ch-fin" aria-label="Terminer" title="Terminer"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div></div>'
    +'<div class="qa-conf" id="qa-conf"><p id="qa-conf-txt"></p><div class="qa-conf-b"><button type="button" id="qa-conf-non">Annuler</button><button type="button" id="qa-conf-oui" aria-label="Supprimer" title="Supprimer">'+QA_IC_JETER+'</button></div></div>';
  document.body.appendChild(p);
  p.querySelector('#qa-ferme').onclick=qaFerme;
  p.querySelector('#qa-ch-fin').onclick=()=>{QA_CHOIX=false;QA_PRIS=new Set();qaRendListe();qaMajChoix();};
  p.querySelector('#qa-ch-tout').onclick=()=>{
    QA_PRIS=QA_PRIS.size===QA_LISTE.length?new Set():new Set(QA_LISTE.map(c=>c.id));
    qaRendListe(); qaMajChoix();
  };
  p.querySelector('#qa-ch-jeter').onclick=async()=>{
    const ids=[...QA_PRIS]; if(!ids.length)return;
    if(QA_VUE==='corbeille')qaEffaceDemande(ids);else qaCorbeilleDemande(ids);
  };
  p.querySelector('#qa-ch-remet').onclick=()=>{const ids=[...QA_PRIS];if(ids.length)qaRemet(ids);};
  p.querySelector('#qa-jeter').onclick=async()=>{
    if(!QA_ID)return;
    const id=QA_ID;
    if(!await qaConfirme('Mettre cette conversation à la corbeille ? Vous pourrez la rétablir.'))return;
    if(await qaMarque([id],new Date().toISOString())){QA_ID='';QA_PASSAGE=null;QA_MSGS=[];QA_VU=[];qaListe();}
  };
  p.querySelector('#qa-mes').onclick=()=>{if(p.classList.contains('liste')&&QA_PASSAGE)qaMontreConv();else qaListe();};
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
  QA_PASSAGE=passage; QA_MSGS=[]; QA_VU=[]; QA_ID=''; QA_ATTENTE=false; QA_TOUR++;
  let source=passage.source||'';
  if(passage.bible){
    try{
      const L=await lvLivres(), b=passage.bible;
      source=L.nom(b.slug)+' '+b.ch+':'+b.v1+(b.v2>b.v1?'-'+b.v2:'');
    }catch(_){}
  }
  passage.etiquette=source+(passage.traduction?'  ·  '+passage.traduction:'');
  qaMontreConv();
  p.classList.add('on');
  document.documentElement.classList.add('qa-ouvert');
  setTimeout(()=>$qa('qa-champ').focus(),60);
}

/* la conversation en cours : le passage, puis les questions et réponses */
function qaMontreConv(){
  const p=qaPanneau();
  p.classList.remove('liste');
  QA_CHOIX=false; qaMajChoix();
  $qa('qa-label').lastChild.textContent='Question à l’IA';
  $qa('qa-jeter').style.display=QA_ID?'':'none';
  const P=QA_PASSAGE||{texte:''};
  /* le passage surligné ouvre la discussion comme une note du salon,
     distincte des messages, coupée à trois lignes ; la toucher la déplie */
  let h='<button type="button" class="qa-cite" aria-expanded="false" title="Voir tout le passage">'
    +'<span class="qa-cite-src">'+qaEsc(P.etiquette||'Passage')+'</span>'
    +'<span class="qa-cite-corps"><span class="qa-cite-txt">'+qaEsc(P.texte)+'</span><span class="qa-cite-plus" aria-hidden="true"><i>…</i></span></span></button>';
  QA_VU.forEach(x=>{h+='<div class="qa-q">'+qaBulle(x.q)+'</div>'+qaMsgIA(x.r);});
  $qa('qa-fil').innerHTML=h;
  qaInvite();
  /* les « … » ne paraissent que si le passage dépasse ses trois lignes */
  requestAnimationFrame(()=>document.querySelectorAll('#qa-fil .qa-cite').forEach(c=>{
    const t=c.querySelector('.qa-cite-txt');
    c.classList.toggle('coupe',t.scrollHeight>t.clientHeight+2);
  }));
  $qa('qa-fil').scrollTop=$qa('qa-fil').scrollHeight;
  const champ=$qa('qa-champ'); champ.value=''; champ.style.height='auto';
}

/* ── MES QUESTIONS ──
   Les conversations gardées, de la plus récente à la plus ancienne :
   le passage, la première question, la date. Toucher une conversation la
   rouvre ; on peut la continuer. */
async function qaCol(){
  const u=await qaCompte();
  if(!u||!firebase.firestore)return null;
  return firebase.firestore().collection('users/'+u.uid+'/questions');
}
/* QA_TOUS : toutes les conversations gardées ; QA_LISTE : celles que la
   vue montre, « Mes questions » ou la corbeille */
let QA_TOUS=[], QA_LISTE=[], QA_VUE='liste', QA_CHOIX=false, QA_PRIS=new Set();
async function qaListe(vue){
  const p=qaPanneau();
  QA_VUE=vue==='corbeille'?'corbeille':'liste';
  p.classList.add('liste','on');
  document.documentElement.classList.add('qa-ouvert');
  $qa('qa-jeter').style.display='none';
  QA_CHOIX=false; QA_PRIS=new Set(); qaMajChoix();
  const fil=$qa('qa-fil');
  fil.innerHTML='<span class="qa-roue" aria-label="Chargement"></span>';
  const col=await qaCol();
  if(!col){fil.innerHTML='<p class="qa-vide">Connectez-vous pour retrouver vos questions.</p>';return;}
  let l=[];
  try{const r=await col.orderBy('maj','desc').limit(300).get();r.forEach(d=>l.push(Object.assign({id:d.id},d.data())));}
  catch(e){console.warn('questions',e);fil.innerHTML='<p class="qa-vide">Les questions n’ont pas pu être chargées.</p>';return;}
  if(!p.classList.contains('liste'))return;
  l.sort((a,b)=>String(b.maj||'').localeCompare(String(a.maj||'')));
  /* une conversation à la corbeille depuis plus de trente jours part pour
     de bon (le même délai que les autres corbeilles du site) */
  const limite=Date.now()-30*864e5;
  for(const c of l.filter(c=>{const t=Date.parse(c.jete||'');return isFinite(t)&&t<limite;})){
    try{await col.doc(c.id).delete();c.efface=true;}catch(e){console.warn('corbeille des questions',e);}
  }
  l=l.filter(c=>!c.efface);
  QA_TOUS=l;
  qaRendListe();
}

/* la vue : en tête, l'accès à la corbeille (ou le retour aux questions)
   et « Choisir » ; en mode choix, chaque rangée se coche d'un toucher et
   le bas du panneau porte « Tout choisir », « Remettre » (corbeille), la
   poubelle et « Terminer » */
function qaRendListe(){
  const fil=$qa('qa-fil'), corb=QA_VUE==='corbeille';
  QA_LISTE=QA_TOUS.filter(c=>corb?!!c.jete:!c.jete);
  const nCorb=QA_TOUS.filter(c=>c.jete).length;
  $qa('qa-label').lastChild.textContent=corb?'Corbeille':'Mes questions';
  QA_PRIS.forEach(id=>{if(!QA_LISTE.some(c=>c.id===id))QA_PRIS.delete(id);});
  if(!QA_LISTE.length){QA_CHOIX=false;QA_PRIS=new Set();}
  const date=iso=>{const d=new Date(iso);return isNaN(d)?'':d.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});};
  let h='';
  if(!QA_CHOIX){
    h+='<div class="qa-l-barre">'
      +(corb?'<button type="button" class="qa-l-lien" id="qa-vers-liste">← Mes questions</button>'
            :(nCorb?'<button type="button" class="qa-l-lien" id="qa-vers-corb">'+QA_IC_JETER+'<span>Corbeille</span><span class="qa-l-n">'+nCorb+'</span></button>':'<span></span>'))
      +(QA_LISTE.length?'<button type="button" class="qa-l-choisir" id="qa-choisir">Choisir</button>':'')
      +'</div>';
  }
  if(!QA_LISTE.length)h+='<p class="qa-vide">'+(corb?'La corbeille est vide.':'Aucune question pour l’instant.')+'</p>';
  h+=QA_LISTE.map((c,i)=>'<div class="qa-ligne'+(QA_CHOIX?' qa-en-choix':'')+(QA_PRIS.has(c.id)?' qa-pris':'')+(corb?' qa-jetee':'')+'" data-qi="'+i+'">'
    +'<div class="qa-l-txt"'+((QA_CHOIX||!corb)?' role="'+(QA_CHOIX?'checkbox':'button')+'" tabindex="0"':'')+(QA_CHOIX?' aria-checked="'+QA_PRIS.has(c.id)+'"':'')+'>'
    +'<span class="qa-l-q">'+qaEsc((c.vu&&c.vu[0]&&c.vu[0].q)||'')+'</span>'
    +'<span class="qa-l-p">« '+qaEsc(String((c.passage&&c.passage.texte)||'').slice(0,140))+' »</span>'
    +'<span class="qa-l-d">'+qaEsc(((c.passage&&c.passage.etiquette)?c.passage.etiquette+'  ·  ':'')+date(corb?c.jete:c.maj))+'</span>'
    +'</div>'
    +(QA_CHOIX?'<span class="qa-l-coche" aria-hidden="true">✓</span>'
      :(corb?'<button type="button" class="qa-x qa-l-remet" aria-label="Remettre dans Mes questions" title="Remettre">'+QA_IC_REMET+'</button>'
            +'<button type="button" class="qa-x qa-l-jeter" aria-label="Supprimer définitivement" title="Supprimer définitivement">'+QA_IC_JETER+'</button>'
            :'<button type="button" class="qa-x qa-l-jeter" aria-label="Mettre à la corbeille" title="Mettre à la corbeille">'+QA_IC_JETER+'</button>'))
    +'</div>').join('');
  fil.innerHTML=h;
  fil.scrollTop=0;
  const lien=(id,f)=>{const b=$qa(id);if(b)b.onclick=f;};
  lien('qa-choisir',()=>{QA_CHOIX=true;QA_PRIS=new Set();qaRendListe();qaMajChoix();});
  lien('qa-vers-corb',()=>{QA_VUE='corbeille';QA_CHOIX=false;QA_PRIS=new Set();qaRendListe();qaMajChoix();});
  lien('qa-vers-liste',()=>{QA_VUE='liste';QA_CHOIX=false;QA_PRIS=new Set();qaRendListe();qaMajChoix();});
  fil.querySelectorAll('[data-qi]').forEach(ligne=>{
    const c=QA_LISTE[+ligne.dataset.qi], t=ligne.querySelector('.qa-l-txt');
    const touche=()=>{
      if(QA_CHOIX){
        if(QA_PRIS.has(c.id))QA_PRIS.delete(c.id);else QA_PRIS.add(c.id);
        ligne.classList.toggle('qa-pris',QA_PRIS.has(c.id));
        t.setAttribute('aria-checked',QA_PRIS.has(c.id));
        qaMajChoix();
        return;
      }
      if(corb)return;
      QA_TOUR++; QA_ATTENTE=false; $qa('qa-envoi').disabled=false;
      QA_ID=c.id; QA_PASSAGE=c.passage||{texte:''}; QA_MSGS=Array.isArray(c.msgs)?c.msgs:[]; QA_VU=Array.isArray(c.vu)?c.vu:[];
      qaMontreConv();
    };
    t.onclick=touche;
    t.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();touche();}};
    const j=ligne.querySelector('.qa-l-jeter');
    if(j)j.onclick=()=>corb?qaEffaceDemande([c.id]):qaCorbeilleDemande([c.id]);
    const r=ligne.querySelector('.qa-l-remet');
    if(r)r.onclick=()=>qaRemet([c.id]);
  });
}

function qaMajChoix(){
  const z=$qa('qa-choix'); if(!z)return;
  z.classList.toggle('on',QA_CHOIX);
  const n=QA_PRIS.size;
  $qa('qa-ch-jeter').disabled=!n;
  $qa('qa-ch-remet').disabled=!n;
  $qa('qa-ch-remet').style.display=QA_VUE==='corbeille'?'':'none';
  $qa('qa-ch-jeter').setAttribute('aria-label',QA_VUE==='corbeille'?'Supprimer définitivement':'Mettre à la corbeille');
  $qa('qa-ch-n').textContent=n?String(n):'';
  $qa('qa-ch-tout').textContent=(QA_LISTE.length&&n===QA_LISTE.length)?'Aucun':'Tout choisir';
}

/* ── LA CORBEILLE ──
   Comme pour les articles et les ressources : une conversation supprimée
   part d'abord à la corbeille, d'où on la remet ; la poubelle de la
   corbeille la supprime pour de bon. Au bout de trente jours, elle part
   d'elle-même. La
   confirmation se fait dans le panneau lui-même, en bas. */
function qaConfirme(txt){
  const z=$qa('qa-conf');
  $qa('qa-conf-txt').textContent=txt;
  z.classList.add('on');
  return new Promise(res=>{
    const fin=v=>{z.classList.remove('on');res(v);};
    $qa('qa-conf-non').onclick=()=>fin(false);
    $qa('qa-conf-oui').onclick=()=>fin(true);
  });
}
const qaCombien=(ids,tout)=>ids.length===tout?(ids.length>1?'toutes les conversations':'la conversation'):(ids.length>1?'ces '+ids.length+' conversations':'cette conversation');
async function qaCorbeilleDemande(ids){
  if(!await qaConfirme('Mettre '+qaCombien(ids,QA_LISTE.length)+' à la corbeille ? Vous pourrez '+(ids.length>1?'les':'la')+' rétablir.'))return;
  await qaMarque(ids,new Date().toISOString());
  if(ids.indexOf(QA_ID)>=0){QA_ID='';QA_PASSAGE=null;QA_MSGS=[];QA_VU=[];}
  QA_CHOIX=false; QA_PRIS=new Set(); qaRendListe(); qaMajChoix();
}
async function qaRemet(ids){
  await qaMarque(ids,'');
  QA_CHOIX=false; QA_PRIS=new Set(); qaRendListe(); qaMajChoix();
}
async function qaEffaceDemande(ids){
  const n=QA_TOUS.filter(c=>c.jete).length;
  if(!await qaConfirme('Supprimer définitivement '+qaCombien(ids,n)+' ?'))return;
  const col=await qaCol(); if(!col)return;
  const faits=[];
  for(const id of ids){try{await col.doc(id).delete();faits.push(id);}catch(e){console.warn('question supprimée',e);}}
  QA_TOUS=QA_TOUS.filter(c=>faits.indexOf(c.id)<0);
  QA_CHOIX=false; QA_PRIS=new Set(); qaRendListe(); qaMajChoix();
}
/* jete : la date de mise à la corbeille, ou vide quand elle en revient */
async function qaMarque(ids,jete){
  const col=await qaCol(); if(!col)return false;
  let ok=true;
  for(const id of ids){
    try{
      await col.doc(id).set({jete},{merge:true});
      const c=QA_TOUS.find(x=>x.id===id); if(c)c.jete=jete;
    }catch(e){console.warn('corbeille des questions',e);ok=false;}
  }
  return ok;
}

/* la conversation part dans le compte après chaque réponse */
async function qaGarde(){
  if(!QA_VU.length)return;
  const col=await qaCol(); if(!col)return;
  const maintenant=new Date().toISOString();
  const doc=JSON.parse(JSON.stringify({
    maj:maintenant,
    passage:{texte:QA_PASSAGE.texte||'',contexte:QA_PASSAGE.contexte||'',etiquette:QA_PASSAGE.etiquette||'',espece:QA_PASSAGE.espece||''},
    msgs:QA_MSGS, vu:QA_VU
  }));
  try{
    if(!QA_ID){doc.quand=maintenant;const r=col.doc();QA_ID=r.id;await r.set(doc);}
    else await col.doc(QA_ID).set(doc,{merge:true});
  }catch(e){console.warn('question gardée',e);}
}

/* « Mes questions » dans « Mon compte », à côté de « Mes notes » */
function qaPoseCompte(){
  document.querySelectorAll('.pile-btn').forEach(pile=>{
    if(pile.querySelector('.qa-compte'))return;
    const modele=pile.firstElementChild; if(!modele)return;
    const b=document.createElement('span');
    b.className=modele.className.split(' ')[0]+' qa-compte';
    b.setAttribute('role','button'); b.tabIndex=0; b.textContent='Mes questions';
    const va=()=>{
      const ov=pile.closest('.auth-ov,.auth-overlay,#bacct-voile');
      if(ov){ov.classList.remove('ouvert');ov.classList.remove('on');}
      qaListe();
    };
    b.onclick=va; b.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();va();}};
    pile.appendChild(b);
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',qaPoseCompte);else qaPoseCompte();

const $qa=id=>document.getElementById(id);

async function qaEnvoie(){
  const champ=$qa('qa-champ'), q=champ.value.trim();
  if(!q||QA_ATTENTE||!QA_PASSAGE)return;
  champ.value=''; champ.style.height='auto';
  QA_ATTENTE=true; $qa('qa-envoi').disabled=true;
  const tour=QA_TOUR, fil=$qa('qa-fil');
  const qd=document.createElement('div'); qd.className='qa-q'; qd.innerHTML=qaBulle(q); fil.appendChild(qd);
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
  let texte='', ok=false;
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
    else{QA_VU.push({q,r:texte});qaGarde();qaInvite();ok=true;}
  }catch(e){
    console.warn('question',e);
    if(tour!==QA_TOUR)return;
    /* la question ratée sort de la conversation : la suivante repart
       d'un échange complet */
    QA_MSGS.length=avant;
    texte=(texte?texte+'\n\n':'')+(e&&e.message?e.message:'La question n’a pas pu partir.');
    rd.classList.add('erreur');
  }finally{
    if(tour===QA_TOUR){
      QA_ATTENTE=false;$qa('qa-envoi').disabled=false;montre();
      if(ok)rd.insertAdjacentHTML('afterend','<button type="button" class="qa-copie-r" aria-label="Copier la réponse" title="Copier la réponse">'+QA_IC_COPIE+'</button>');
      champ.focus();
    }
  }
}

window.LVQuestion={ouvre:qaOuvre,copie:qaCopie,icones:{copie:QA_IC_COPIE,fait:QA_IC_FAIT,ia:QA_IC_IA}};

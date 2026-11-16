/* ════════════════════════════════════════════════════════════════════
   LUMEN · FONCTIONNEMENT COMMUN : LA CONVERSATION AVEC L'IA
   Pages : toutes.
   Emmanuel : « quand on sélectionne un texte avec la souris dans un
   article, une ressource ou dans la Bible, ajoute un bouton pour poser
   une question à l'IA », puis « quelque chose d'aussi abouti que Claude
   sur tous les aspects ».

   Trois façons d'ouvrir une conversation : un texte sélectionné fait
   paraître un petit bandeau (copier, demander à l'IA) ; le bouton de
   l'IA, dans le bandeau d'un article ouvert ou d'Étude, interroge
   toute la page ; l'icône de l'IA, dans la barre du haut de chaque page,
   ouvre une conversation libre (ou reprend celle qui est en cours).

   Le panneau est un salon de discussion (« ça doit être un salon de chat,
   on doit pouvoir lui répondre aussi ») : le passage en tête quand il y
   en a un, puis les messages, ceux d'Emmanuel en bulles à droite, ceux de
   l'IA en texte de lecture à gauche. On peut joindre une image ou un PDF,
   arrêter une réponse en cours, relancer la dernière, modifier une
   question (la conversation repart de là). La réponse montre, repliés,
   la réflexion de l'IA et ce qu'elle a fait (recherches, lectures), puis
   ses sources prises sur internet et les pages qu'elle a créées.

   Chaque conversation est gardée dans le compte (users/…/questions)
   après chaque réponse (Emmanuel : « sinon après une question on ferme
   par inadvertance et c'est perdu »). « Mes questions », dans le panneau
   et dans « Mon compte », les rouvre, les cherche, et on peut les
   continuer. Une poubelle en met une à la corbeille ; « Choisir » en met
   plusieurs ou toutes. La corbeille, au bout de la liste, les remet ou
   les supprime pour de bon. « Mémoire » montre et corrige ce que l'IA
   retient de la personne connectée (commun/ia-outils.js).

   Dans Articles et Étude, la page tourne dans un cadre isolé qui
   n'a aucun accès au site : le cadre dit seulement ce qui y est
   sélectionné (QA_CADRE, ajouté à chaque page encadrée), et c'est la
   page du site qui montre le bandeau. Dans la Bible, les deux icônes
   prennent place dans le petit menu qui paraît sur un texte sélectionné,
   collées au bouton « Retirer ».

   La réponse passe par /api/ia (tâche « question »). Les outils du site
   (versets, bibliothèque, mémoire, création de pages…) s'exécutent dans
   la page : commun/versets.js et commun/ia-outils.js.
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
  b.querySelector('[data-qa="ia"]').onclick=()=>{const s=QA_SEL;qaCacheBouton();if(s)qaOuvre(s.passage,s.code);};
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

/* Articles et Étude : la page reçoit la sélection d'un cadre.
   source : le titre de l'élément ouvert ; code : la page entière, dont
   l'IA reçoit tout le texte (voir qaTexteDe) ; ref : où la page est
   rangée dans le compte, pour la relire quand la conversation est
   reprise depuis « Mes questions ». */
function qaSelectionCadre(sel,cadre,source,espece,code,ref){
  if(!sel||!sel.texte){qaCacheBouton();return;}
  QA_SEL={cadre,rect:sel,passage:{texte:sel.texte,contexte:sel.contexte||'',source:source||'',espece:espece||'',ref:ref||null},code:code||''};
  qaPoseBouton();
}

/* ── TOUT LE TEXTE DE LA PAGE ──
   Un cours ou un livre est découpé en pages, et la sélection ne montre
   que celle qui est ouverte : l'IA reçoit donc, avec le passage, tout le
   texte lisible de l'article ou du cours (Emmanuel, après une
   réponse qui ne voyait que le plan d'un cours). Ni code, ni polices, ni
   images : les mots seuls, titres à la ligne. Le contenu rangé dans un
   modèle de page ou dans des données compte aussi. La conversation
   gardée dans le compte ne retient que l'endroit où la page est rangée :
   reprise depuis « Mes questions », elle relit la page telle qu'elle est
   alors, et l'IA en reçoit de nouveau tout le texte (Emmanuel : « je ne
   veux pas de cette limite »). */
const QA_DOC_MAX=600000;
function qaTexteDe(html){
  try{
    const d=new DOMParser().parseFromString(String(html||''),'text/html');
    const extra=[];
    d.querySelectorAll('script[type="application/json"]').forEach(s=>extra.push(s.textContent));
    d.querySelectorAll('template').forEach(t=>{const x=document.createElement('div');x.appendChild(t.content.cloneNode(true));t.replaceWith(x);});
    d.querySelectorAll('script,style,noscript,svg,link,meta').forEach(e=>e.remove());
    const BLOC=/^(H[1-6]|P|LI|DT|DD|TR|BLOCKQUOTE|FIGCAPTION|SECTION|ARTICLE|HEADER|FOOTER|DIV|BR)$/;
    const morceaux=[], w=d.createTreeWalker(d.body||d.documentElement,NodeFilter.SHOW_TEXT);
    let n;
    while((n=w.nextNode())){
      const x=n.nodeValue.replace(/\s+/g,' ').trim(); if(!x)continue;
      const e=n.parentElement;
      morceaux.push((e&&BLOC.test(e.tagName)&&e.firstChild===n?'\n':' ')+x);
    }
    let t=morceaux.join('').replace(/ *\n */g,'\n').replace(/\n{2,}/g,'\n').trim();
    if(extra.length)t+='\n\n'+extra.join('\n');
    return t.slice(0,QA_DOC_MAX);
  }catch(_){return '';}
}
let QA_DOC='', QA_DOC_PRET=Promise.resolve('');
/* relit une page dans le compte, contenu découpé en tranches compris */
async function qaCodeDe(ref){
  if(!ref||!ref.id||(ref.col!=='res_code'&&ref.col!=='art_code'))return '';
  const u=await qaCompte(); if(!u||!firebase.firestore)return '';
  const col=firebase.firestore().collection('users/'+u.uid+'/'+ref.col);
  return (await lvContenuLit(col,ref.id))||'';
}
/* le texte de la page : déjà en main, ou relu d'après sa place */
function qaPrepareDoc(code,ref){
  QA_DOC='';
  QA_DOC_PRET=(code?Promise.resolve(code):qaCodeDe(ref)).then(c=>qaTexteDe(c)).catch(e=>{console.warn('texte de la page',e);return '';});
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

const QA_IC_NOUVEAU='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
const QA_IC_TROMBONE='<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11.5l-7.8 7.8a5 5 0 0 1-7.1-7.1l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4l7.8-7.8"/></svg>';
const QA_IC_STOP='<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor"/></svg>';
const QA_IC_ENVOI='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>';
const QA_IC_RELANCE='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5v3.5H16"/></svg>';
const QA_IC_MODIF='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 19.5l1-4L15.8 5.2a1.8 1.8 0 0 1 2.5 0l.5.5a1.8 1.8 0 0 1 0 2.5L8.5 18.5z"/><path d="M14 7l3 3"/></svg>';
const QA_IC_MEMOIRE='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4.5h10a1 1 0 0 1 1 1v15l-6-3.5-6 3.5v-15a1 1 0 0 1 1-1z"/></svg>';
const QA_IC_CLE='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="12" r="3.5"/><path d="M11.5 12h9M17.5 12v3M20.5 12v2"/></svg>';
const QA_IC_PDF='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 3.5h8l3 3v14h-11z"/><path d="M14.5 3.5v3h3"/></svg>';
const QA_IC_PAGE='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 3.5h8l3 3v14h-11z"/><path d="M9.5 11h5M9.5 14.5h5"/></svg>';

/* ── L'APPEL ──
   La réponse arrive au fil de l'eau. Chaque bloc de la réponse est gardé
   tel qu'il arrive (réflexion et sa signature, texte et ses sources,
   recherches sur internet), parce que l'IA doit les relire à l'identique
   au message suivant. sur(…) dit à la page ce qui arrive : du texte, de
   la réflexion, une recherche lancée. */
let QA_CTRL=null;
/* ── CHACUN SA CLÉ ──
   Un compte autre que celui d'Emmanuel parle à l'IA avec sa propre clé de
   l'API Anthropic (Emmanuel : « chacun sa clé »). Elle vit sur l'appareil
   seulement et part avec chaque question ; le serveur la transmet à
   Anthropic sans la garder. Le compte d'Emmanuel n'en a pas besoin : le
   serveur se sert de celle du site. L'entrée « Ma clé » paraît dès qu'une
   clé est enregistrée, ou que le serveur en a demandé une. */
const QA_CLE='lv_cle_anthropic', QA_CLE_DEMANDEE='lv_cle_demandee';
const qaCle=()=>{try{return localStorage.getItem(QA_CLE)||'';}catch(_){return '';}};
const qaCleVisible=()=>{try{return !!(qaCle()||localStorage.getItem(QA_CLE_DEMANDEE));}catch(_){return false;}};
async function qaFlux(messages,sur){
  const u=await qaCompte();
  if(!u)throw new Error('Connectez-vous pour parler avec l’IA.');
  const jeton=await u.getIdToken();
  let memoire='';
  try{memoire=lvIaMemoireTexte(await lvIaMemoire());}catch(_){}
  const r=await fetch('/api/ia',{method:'POST',signal:QA_CTRL?QA_CTRL.signal:undefined,
    headers:Object.assign({'content-type':'application/json','authorization':'Bearer '+jeton},qaCle()?{'x-lumen-cle':qaCle()}:{}),
    body:JSON.stringify({tache:'question',donnees:{messages:await qaPourEnvoi(messages),document:QA_DOC,memoire}})});
  const type=r.headers.get('content-type')||'';
  if(!r.ok||type.indexOf('event-stream')<0){
    let m='';
    try{const j=await r.json();m=j.message||'';if(j.erreur==='cle-perso'){try{localStorage.setItem(QA_CLE_DEMANDEE,'1');}catch(_){}}}catch(_){}
    if(r.status===413)m='Le message est trop lourd : retirez une pièce jointe, puis réessayez.';
    throw new Error(m||('L’IA n’a pas répondu (erreur '+r.status+').'));
  }
  const lect=r.body.getReader(), dec=new TextDecoder();
  const blocs=[]; let tampon='', fin='', erreur='';
  const traite=bloc=>{
    const ligne=bloc.split('\n').find(l=>l.startsWith('data:'));
    if(!ligne)return;
    let ev; try{ev=JSON.parse(ligne.slice(5).trim());}catch(_){return;}
    if(ev.type==='content_block_start'){
      const c=JSON.parse(JSON.stringify(ev.content_block||{}));
      if(c.type==='text'){c.text=c.text||'';}
      else if(c.type==='compaction'){c.content=c.content||'';sur.resume&&sur.resume();}
      else if(c.type==='thinking'){c.thinking=c.thinking||'';c.signature=c.signature||'';}
      else if(c.type==='tool_use'||c.type==='server_tool_use'){c.json='';}
      blocs[ev.index]=c;
      if(c.type==='server_tool_use')sur.outil&&sur.outil(c);
      if(c.type==='web_search_tool_result'||c.type==='web_fetch_tool_result')sur.resultat&&sur.resultat(c);
    }else if(ev.type==='content_block_delta'&&ev.delta){
      const b=blocs[ev.index]; if(!b)return;
      const d=ev.delta;
      if(d.type==='text_delta'){b.text+=d.text;sur.texte&&sur.texte(d.text);}
      else if(d.type==='thinking_delta'){b.thinking+=d.thinking||'';sur.pensee&&sur.pensee(d.thinking||'');}
      else if(d.type==='signature_delta'){b.signature=(b.signature||'')+(d.signature||'');}
      else if(d.type==='compaction_delta'){b.content=(b.content||'')+(d.content||'');}
      else if(d.type==='input_json_delta'){b.json+=d.partial_json||'';}
      else if(d.type==='citations_delta'&&d.citation){(b.citations=b.citations||[]).push(d.citation);}
    }else if(ev.type==='content_block_stop'){
      const b=blocs[ev.index];
      if(b&&b.type==='server_tool_use'){if(b.json){try{b.input=JSON.parse(b.json);}catch(_){b.input={};}}sur.outilPret&&sur.outilPret(b);}
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
    if(b.type==='tool_use'||b.type==='server_tool_use'){
      let input=b.input||{}; if(b.json){try{input=JSON.parse(b.json);}catch(_){input={};}}
      const o={type:b.type,id:b.id,name:b.name,input};
      return o;
    }
    if(b.type==='text'){const o={type:'text',text:b.text};if(b.citations&&b.citations.length)o.citations=b.citations;return o;}
    if(b.type==='thinking')return {type:'thinking',thinking:b.thinking,signature:b.signature};
    if(b.type==='compaction')return {type:'compaction',content:b.content||''};
    return b;
  }).filter(b=>b.type!=='text'||b.text);
  return {contenu,fin};
}
/* ce qui part à l'IA : les pièces jointes reprennent leurs données (une
   conversation rouverte ne les a plus en mémoire), et les marques
   propres au site (_lv, _nom) sont retirées. Une requête ne dépasse pas
   ce que l'API accepte : en partant des plus récentes, les pièces
   passent tant qu'elles tiennent dans vingt mégaoctets ; les plus
   anciennes laissent à leur place une mention de leur nom. */
const QA_PIECES_BUDGET=20*1024*1024;
async function qaPourEnvoi(msgs){
  /* après un résumé des échanges anciens, l'IA n'a besoin que du résumé
     et de ce qui le suit : la conversation part à partir du message qui
     le porte (la page garde tout, pour l'affichage et pour modifier une
     question) */
  for(let i=msgs.length-1;i>0;i--){
    const m=msgs[i];
    if(m.role==='assistant'&&Array.isArray(m.content)&&m.content.some(b=>b&&b.type==='compaction')){msgs=msgs.slice(i);break;}
  }
  let reste=QA_PIECES_BUDGET;
  const out=new Array(msgs.length);
  for(let i=msgs.length-1;i>=0;i--){
    const m=msgs[i];
    if(typeof m.content==='string'){out[i]=m;continue;}
    const blocs=[];
    for(const b of m.content){
      if(!b||!b._lv){blocs.push(b);continue;}
      let data=b.source&&b.source.data;
      if(!data){try{data=await lvIaPieceLit(b._lv);}catch(_){data='';}}
      if(data&&data.length<=reste){
        reste-=data.length;
        blocs.push({type:b.type,source:{type:'base64',media_type:b.source.media_type,data}});
      }else blocs.push({type:'text',text:'[Pièce jointe : '+(b._nom||'fichier')+(data?', déjà vue plus haut dans la conversation]':', introuvable]')});
    }
    out[i]={role:m.role,content:blocs};
  }
  return out;
}

/* l'outil demandé par l'IA : les versets ici, le reste dans
   commun/ia-outils.js */
async function qaOutil(b,avance){
  if(b.name==='lire_versets'){
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
  const r=typeof lvIaOutil==='function'?await lvIaOutil(b,avance):null;
  return r===null?'Outil inconnu.':JSON.stringify(r);
}
/* ce que fait l'IA, en clair, pendant qu'elle le fait */
function qaEtape(b){
  const e=b.input||{};
  switch(b.name){
    case 'lire_versets':return 'Lecture des versets : '+(e.references||[]).slice(0,6).join(', ')+((e.references||[]).length>6?'…':'');
    case 'chercher_bibliotheque':return e.requete?'Recherche dans votre bibliothèque : « '+e.requete+' »':'Liste de votre bibliothèque';
    case 'lire_element':return 'Lecture d’un élément de votre bibliothèque';
    case 'chercher_conversations':return 'Recherche dans vos conversations : « '+(e.requete||'')+' »';
    case 'memoire':return e.action==='ajouter'?'Mémoire : « '+(e.texte||'')+' »':e.action==='supprimer'?'Mémoire : ligne retirée':'Mémoire mise à jour';
    case 'web_search':return 'Recherche sur internet : « '+(e.query||'')+' »';
    case 'web_fetch':return 'Lecture de '+String(e.url||'').replace(/^https?:\/\//,'').slice(0,60);
    default:return 'Outil : '+b.name;
  }
}

/* ── LE TEXTE DE LA RÉPONSE ──
   Le rendu complet vit dans commun/ia-outils.js (titres, listes,
   tableaux, citations, liens). */
const qaRendu=t=>lvIaRendu(t);

/* un message d'Emmanuel : l'espace tapé avant « ? ! : ; » et autour des
   guillemets devient insécable, pour que le signe ne parte pas seul à la
   ligne dans la bulle */
const qaBulle=s=>qaEsc(s).replace(/ ([?!:;»])/g,' $1').replace(/« /g,'« ');
/* ses pièces jointes, au-dessus de la bulle */
function qaPiecesHtml(pieces){
  if(!pieces||!pieces.length)return '';
  return '<div class="qa-pieces-m">'+pieces.map(p=>/^image\//.test(p.media)
    ?'<span class="qa-piece-m" data-piece="'+qaEsc(p.id)+'" data-media="'+qaEsc(p.media)+'"><img alt="'+qaEsc(p.nom||'Image jointe')+'"></span>'
    :'<span class="qa-piece-m qa-piece-doc">'+QA_IC_PDF+'<span>'+qaEsc(p.nom||'Document')+'</span></span>').join('')+'</div>';
}
/* les vignettes des images jointes se lisent dans le compte, à la demande */
function qaVignettes(racine){
  (racine||document).querySelectorAll('.qa-piece-m[data-piece]').forEach(async el=>{
    const im=el.querySelector('img'); if(!im||im.src)return;
    try{const d=await lvIaPieceLit(el.dataset.piece);if(d)im.src='data:'+el.dataset.media+';base64,'+d;}catch(_){}
  });
}
function qaQuestionHtml(x,i){
  return '<div class="qa-q-bloc" data-vi="'+i+'">'+qaPiecesHtml(x.pieces)
    +'<div class="qa-q">'+qaBulle(x.q)+'</div>'
    +'<button type="button" class="qa-modif" aria-label="Modifier cette question" title="Modifier">'+QA_IC_MODIF+'</button></div>';
}
/* la réflexion et ce qu'a fait l'IA, repliés au-dessus de sa réponse */
function qaDetailsHtml(x,enCours){
  const etapes=x.etapes||[], pensee=(x.pensee||'').trim();
  if(!etapes.length&&!pensee)return '';
  const titre=enCours?(etapes.length?etapes[etapes.length-1]:'Réflexion…')
    :(pensee?'Réflexion':'')+(etapes.length?(pensee?' · ':'')+(etapes.length===1?etapes[0]:etapes.length+' étapes'):'');
  return '<details class="qa-det"'+(x.ouvert?' open':'')+'><summary>'+(enCours?'<span class="qa-roue" aria-hidden="true"></span>':'')+'<span>'+qaEsc(titre)+'</span></summary>'
    +'<div class="qa-det-corps">'+(pensee?'<div class="qa-pensee">'+lvIaRendu(pensee)+'</div>':'')
    +(etapes.length?'<ul class="qa-etapes">'+etapes.map(e=>'<li>'+qaEsc(e)+'</li>').join('')+'</ul>':'')+'</div></details>';
}
function qaSourcesHtml(x){
  let h='';
  if(x.pages&&x.pages.length)h+='<div class="qa-pages-crees">'+x.pages.map(p=>'<a class="qa-page-cree" href="'+qaEsc(p.lien)+'">'+QA_IC_PAGE+'<span><b>'+qaEsc(p.titre)+'</b><i>'+qaEsc(({livre:'Livre créé',diagramme:'Diagramme créé',cours:'Cours créé',parcours:'Parcours créé'})[p.marque]||(p.espece==='article'?'Article créé':'Ressource créée'))+' · ouvrir</i></span></a>').join('')+'</div>';
  if(x.sources&&x.sources.length)h+='<div class="qa-sources"><span class="qa-sources-t">Sources</span>'+x.sources.map((s,i)=>'<a href="'+qaEsc(s.url)+'" target="_blank" rel="noopener"><span>'+(i+1)+'</span>'+qaEsc(s.titre||s.url.replace(/^https?:\/\//,''))+'</a>').join('')+'</div>';
  return h;
}
/* un message de l'IA : ses détails, son texte, ses sources, puis ses
   boutons (copier ; relancer pour la dernière réponse) */
function qaMsgIA(x,dernier){
  return '<div class="qa-r">'+qaDetailsHtml(x,false)+qaRendu(x.r)+qaSourcesHtml(x)+'</div>'
    +'<div class="qa-r-acts"><button type="button" class="qa-copie-r" aria-label="Copier la réponse" title="Copier la réponse">'+QA_IC_COPIE+'</button>'
    +(dernier?'<button type="button" class="qa-relance" aria-label="Relancer la réponse" title="Relancer">'+QA_IC_RELANCE+'</button>':'')+'</div>';
}
document.addEventListener('click',e=>{
  const c=e.target.closest&&e.target.closest('.qa-cite');
  if(c){const o=c.classList.toggle('ouvert');c.setAttribute('aria-expanded',o?'true':'false');return;}
  const pc=e.target.closest&&e.target.closest('.qa-page-cree');
  if(pc){
    /* la page créée s'ouvre ; sur la même page du site, il faut la relire
       pour qu'elle connaisse le nouvel élément */
    const u=new URL(pc.getAttribute('href'),location.href);
    if(u.pathname===location.pathname){e.preventDefault();location.hash=u.hash;location.reload();}
    return;
  }
  const b=e.target.closest&&e.target.closest('.qa-copie-r'); if(!b)return;
  const r=b.closest('.qa-r-acts').previousElementSibling; if(!r)return;
  const copie=r.cloneNode(true); copie.querySelectorAll('.qa-det,.qa-sources,.qa-pages-crees').forEach(x=>x.remove());
  qaCopie(copie.innerText.trim());
  b.innerHTML=QA_IC_FAIT; setTimeout(()=>{b.innerHTML=QA_IC_COPIE;},1400);
});
/* le champ invite à poser la question, puis à répondre */
const qaInvite=()=>{const c=$qa('qa-champ');if(!c)return;c.placeholder=QA_VU.length?'Répondre à l’IA…':(QA_PASSAGE&&QA_PASSAGE.libre?'Écrivez à l’IA…':(QA_PASSAGE&&!QA_PASSAGE.texte?'Votre question sur cette page…':'Votre question sur ce passage…'));};

/* ── LE PANNEAU ── */
let QA_MSGS=[], QA_VU=[], QA_ID='', QA_PASSAGE=null, QA_ATTENTE=false, QA_TOUR=0, QA_PIECES=[], QA_MODIF=-1;
/* la question et la réponse en cours, gardées quand le salon se redessine */
let QA_EN_COURS=null;
function qaPanneau(){
  let p=document.getElementById('qa-panneau');
  if(p)return p;
  p=document.createElement('aside');
  p.id='qa-panneau'; p.className='qa-panneau';
  p.setAttribute('role','dialog'); p.setAttribute('aria-label','Conversation avec l’IA');
  p.innerHTML='<div class="qa-tete"><span class="qa-label" id="qa-label">'+QA_IC_IA+'<span>IA</span></span>'
    +'<span class="qa-outils"><button type="button" class="qa-x" id="qa-nouveau" aria-label="Nouvelle conversation" title="Nouvelle conversation">'+QA_IC_NOUVEAU+'</button>'
    +'<button type="button" class="qa-x" id="qa-jeter" aria-label="Supprimer cette conversation" title="Supprimer cette conversation">'+QA_IC_JETER+'</button>'
    +'<button type="button" class="qa-x" id="qa-mes" aria-label="Mes questions" title="Mes questions">'+QA_IC_MES+'</button>'
    +'<button type="button" class="qa-x" id="qa-ferme" aria-label="Fermer"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></span></div>'
    +'<div class="qa-fil" id="qa-fil"></div>'
    +'<form class="qa-saisie" id="qa-saisie"><div class="qa-modif-bandeau" id="qa-modif-b"><span>Modifier la question : la conversation repartira de là.</span><button type="button" class="qa-x" id="qa-modif-x" aria-label="Annuler la modification"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>'
    +'<div class="qa-pieces" id="qa-pieces"></div>'
    +'<div class="qa-saisie-l"><button type="button" class="qa-joindre" id="qa-joindre" aria-label="Joindre une image ou un PDF" title="Joindre une image ou un PDF">'+QA_IC_TROMBONE+'</button>'
    +'<input type="file" id="qa-fichier" accept="image/png,image/jpeg,image/gif,image/webp,application/pdf" multiple hidden>'
    +'<textarea id="qa-champ" rows="1" placeholder="Votre question sur ce passage…"></textarea>'
    +'<button type="submit" class="qa-envoi" id="qa-envoi" aria-label="Envoyer">'+QA_IC_ENVOI+'</button></div></form>'
    +'<div class="qa-choix" id="qa-choix"><div class="qa-conf-b"><button type="button" id="qa-ch-tout">Tout choisir</button>'
    +'<button type="button" id="qa-ch-remet">Remettre</button>'
    +'<button type="button" id="qa-ch-jeter" aria-label="Supprimer les conversations choisies" title="Supprimer">'+QA_IC_JETER+'<span id="qa-ch-n"></span></button>'
    +'<button type="button" id="qa-ch-fin" aria-label="Terminer" title="Terminer"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div></div>'
    +'<div class="qa-conf" id="qa-conf"><p id="qa-conf-txt"></p><div class="qa-conf-b"><button type="button" id="qa-conf-non">Annuler</button><button type="button" id="qa-conf-oui" aria-label="Supprimer" title="Supprimer">'+QA_IC_JETER+'</button></div></div>';
  document.body.appendChild(p);
  p.querySelector('#qa-ferme').onclick=qaFerme;
  p.querySelector('#qa-nouveau').onclick=()=>qaLibre(true);
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
    if(await qaMarque([id],new Date().toISOString())){if(QA_ID===id){if(QA_ATTENTE)qaArrete();QA_TOUR++;QA_EN_COURS=null;QA_ID='';QA_PASSAGE=null;QA_MSGS=[];QA_VU=[];}qaListe();}
  };
  p.querySelector('#qa-mes').onclick=()=>{if(p.classList.contains('liste')&&QA_PASSAGE)qaMontreConv();else qaListe();};
  const champ=p.querySelector('#qa-champ');
  const hauteur=()=>{champ.style.height='auto';champ.style.height=Math.min(champ.scrollHeight,160)+'px';};
  champ.addEventListener('input',hauteur);
  champ.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!(window.matchMedia&&matchMedia('(pointer:coarse)').matches)){e.preventDefault();qaEnvoie();}});
  /* une image collée dans le champ se joint comme un fichier */
  champ.addEventListener('paste',e=>{
    const fs=[...((e.clipboardData&&e.clipboardData.files)||[])].filter(f=>/^image\//.test(f.type));
    if(fs.length){e.preventDefault();qaJoint(fs);}
  });
  p.querySelector('#qa-saisie').addEventListener('submit',e=>{e.preventDefault();if(QA_ATTENTE)qaArrete();else qaEnvoie();});
  p.querySelector('#qa-joindre').onclick=()=>{const f=$qa('qa-fichier');f.value='';f.click();};
  p.querySelector('#qa-fichier').onchange=e=>qaJoint([...e.target.files]);
  p.querySelector('#qa-modif-x').onclick=()=>qaModifFin();
  /* glisser un fichier sur le panneau le joint aussi */
  p.addEventListener('dragover',e=>{if(e.dataTransfer&&[...e.dataTransfer.types].includes('Files')){e.preventDefault();p.classList.add('survol');}});
  p.addEventListener('dragleave',e=>{if(e.target===p)p.classList.remove('survol');});
  p.addEventListener('drop',e=>{p.classList.remove('survol');if(e.dataTransfer&&e.dataTransfer.files.length){e.preventDefault();qaJoint([...e.dataTransfer.files]);}});
  /* modifier une question ; relancer la dernière réponse */
  p.addEventListener('click',e=>{
    const m=e.target.closest('.qa-modif'); if(m){const bl=m.closest('.qa-q-bloc');if(bl)qaModifDebut(+bl.dataset.vi);return;}
    const r=e.target.closest('.qa-relance'); if(r){qaRelance();return;}
  });
  return p;
}
function qaFerme(){
  const p=document.getElementById('qa-panneau');
  if(p)p.classList.remove('on');
  document.documentElement.classList.remove('qa-ouvert');
  /* une réponse en cours continue et se garde : on la retrouve en
     rouvrant le panneau */
}
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&document.querySelector('#qa-panneau.on')){e.stopImmediatePropagation();qaFerme();}
},true);
/* un clic ailleurs que sur le bouton le retire (la sélection de la page
   elle-même, hors cadre, se gère par la Bible) */
document.addEventListener('mousedown',e=>{if(QA_BOUTON&&!e.target.closest('#qa-bouton'))qaCacheBouton();},true);

function qaMontre(){
  const p=qaPanneau();
  p.classList.add('on');
  document.documentElement.classList.add('qa-ouvert');
  setTimeout(()=>{const c=$qa('qa-champ');if(c&&!p.classList.contains('liste'))c.focus();},60);
}
function qaRemiseAZero(){
  /* une réponse en cours se garde avec ce qui est déjà écrit, comme si
     on l'avait arrêtée, avant de passer à autre chose */
  if(QA_ATTENTE&&QA_EN_COURS){
    const e=QA_EN_COURS, x=e.x;
    if(x&&typeof x.i==='number'){
      QA_MSGS.length=x.i+1;
      if(x.r.trim()){
        QA_MSGS.push({role:'assistant',content:[{type:'text',text:x.r.trim()}]});
        x.r=x.r.trim()+'\n\n*(Réponse arrêtée.)*';
        QA_VU.push(x); qaGarde();
      }else QA_MSGS.length=x.i;
    }
  }
  if(QA_ATTENTE)qaArrete();
  QA_EN_COURS=null;
  QA_MSGS=[]; QA_VU=[]; QA_ID=''; QA_ATTENTE=false; QA_TOUR++; QA_PIECES=[]; QA_MODIF=-1;
  qaMajEnvoi(); qaRendPieces(); qaModifFin(true);
}
/* le bouton de l'IA d'une page ouverte (article, cours) : rangé puis
   rappelé, le panneau retombe sur ce qu'on a quitté, tant qu'on n'a pas
   entamé une conversation sur une autre page (Emmanuel) */
function qaReprend(passage,code){
  const r=QA_PASSAGE&&QA_PASSAGE.ref, n=passage&&passage.ref;
  if(document.getElementById('qa-panneau')&&r&&n&&r.col===n.col&&r.id===n.id){qaMontre();return;}
  qaOuvre(passage,code);
}
async function qaOuvre(passage,code){
  qaPanneau();
  qaRemiseAZero();
  qaPrepareDoc(code,passage&&passage.ref);
  QA_PASSAGE=passage;
  let source=passage.source||'';
  if(passage.bible){
    try{
      const L=await lvLivres(), b=passage.bible;
      source=L.nom(b.slug)+' '+b.ch+':'+b.v1+(b.v2>b.v1?'-'+b.v2:'');
    }catch(_){}
  }
  passage.etiquette=source+(passage.traduction?'  ·  '+passage.traduction:'');
  qaMontreConv(true);
  qaMontre();
}
/* une conversation libre, sans passage ni page ; l'icône de la barre
   rouvre le panneau tel qu'on l'a laissé (conversation, « Mes questions »
   ou mémoire), comme le veut Emmanuel */
function qaLibre(neuve){
  qaPanneau();
  if(!neuve&&QA_PASSAGE){qaMontre();return;}
  if(neuve||!QA_PASSAGE){
    qaRemiseAZero(); qaPrepareDoc('',null);
    QA_PASSAGE={texte:'',libre:true,etiquette:''};
    qaMontreConv(true);
  }else qaMontreConv();
  qaMontre();
}

/* la conversation en cours : le passage, puis les questions et réponses */
function qaMontreConv(vider){
  const p=qaPanneau();
  p.classList.remove('liste','memoire');
  QA_CHOIX=false; qaMajChoix();
  $qa('qa-label').lastChild.textContent='IA';
  $qa('qa-jeter').style.display=QA_ID?'':'none';
  const P=QA_PASSAGE||{texte:'',libre:true};
  /* le passage surligné ouvre la discussion comme une note du salon,
     distincte des messages, coupée à trois lignes ; la toucher la déplie.
     Une question sur toute la page dit « Toute la page » ; une
     conversation libre n'a pas de note. */
  let h='';
  if(!P.libre)h+='<button type="button" class="qa-cite" aria-expanded="false" title="Voir tout le passage">'
    +'<span class="qa-cite-src">'+qaEsc(P.etiquette||'Passage')+'</span>'
    +'<span class="qa-cite-corps"><span class="qa-cite-txt">'+qaEsc(P.texte||'Toute la page')+'</span><span class="qa-cite-plus" aria-hidden="true"><i>…</i></span></span></button>';
  else if(!QA_VU.length)h+='<p class="qa-accueil">Posez une question, demandez un livre, un diagramme ou un cours, ou cherchez dans votre bibliothèque.</p>';
  QA_VU.forEach((x,i)=>{h+=qaQuestionHtml(x,i)+qaMsgIA(x,i===QA_VU.length-1);});
  $qa('qa-fil').innerHTML=h;
  if(QA_ATTENTE&&QA_EN_COURS){const a=$qa('qa-fil').querySelector('.qa-accueil');if(a)a.remove();$qa('qa-fil').append(QA_EN_COURS.qd,QA_EN_COURS.rd);}
  qaVignettes($qa('qa-fil'));
  qaInvite();
  /* les « … » ne paraissent que si le passage dépasse ses trois lignes */
  requestAnimationFrame(()=>document.querySelectorAll('#qa-fil .qa-cite').forEach(c=>{
    const t=c.querySelector('.qa-cite-txt');
    c.classList.toggle('coupe',t.scrollHeight>t.clientHeight+2);
  }));
  $qa('qa-fil').scrollTop=$qa('qa-fil').scrollHeight;
  if(vider){const champ=$qa('qa-champ');champ.value='';champ.style.height='auto';}
}

/* ── LES PIÈCES JOINTES ──
   Images (PNG, JPEG, GIF, WebP) et PDF, quatre mégaoctets et demi au plus
   chacune ; elles partent avec le message suivant. */
async function qaJoint(fichiers){
  for(const f of fichiers){
    const ok=/^image\/(png|jpeg|gif|webp)$/.test(f.type)||f.type==='application/pdf';
    if(!ok){qaAlerte('Seules les images et les PDF se joignent.');continue;}
    if(f.size>LV_IA_PIECE_MAX){qaAlerte('« '+f.name+' » dépasse 4,5 Mo.');continue;}
    if(QA_PIECES.length>=5){qaAlerte('Cinq pièces au plus par message.');break;}
    try{const data=await lvIaLitFichier(f);QA_PIECES.push({media:f.type,data,nom:f.name});}
    catch(_){qaAlerte('« '+f.name+' » n’a pas pu être lu.');}
  }
  qaRendPieces();
}
function qaRendPieces(){
  const z=$qa('qa-pieces'); if(!z)return;
  z.innerHTML=QA_PIECES.map((p,i)=>'<span class="qa-piece">'+(/^image\//.test(p.media)?'<img src="data:'+p.media+';base64,'+p.data+'" alt="">':QA_IC_PDF)
    +'<span class="qa-piece-nom">'+qaEsc(p.nom)+'</span><button type="button" class="qa-piece-x" data-pi="'+i+'" aria-label="Retirer">×</button></span>').join('');
  z.querySelectorAll('.qa-piece-x').forEach(b=>b.onclick=()=>{QA_PIECES.splice(+b.dataset.pi,1);qaRendPieces();});
}
/* un mot bref au-dessus du champ, qui s'efface de lui-même */
function qaAlerte(t){
  const z=$qa('qa-pieces'); if(!z)return;
  const s=document.createElement('span'); s.className='qa-alerte'; s.textContent=t; z.appendChild(s);
  setTimeout(()=>s.remove(),4000);
}

/* ── MODIFIER UNE QUESTION ──
   Le texte revient dans le champ ; à l'envoi, la conversation repart de
   cette question, ce qui suivait est remplacé. */
function qaModifDebut(i){
  if(QA_ATTENTE||!QA_VU[i])return;
  QA_MODIF=i;
  const champ=$qa('qa-champ'); champ.value=QA_VU[i].q; champ.dispatchEvent(new Event('input'));
  $qa('qa-modif-b').classList.add('on');
  champ.focus();
}
function qaModifFin(silence){
  QA_MODIF=-1;
  const b=$qa('qa-modif-b'); if(b)b.classList.remove('on');
  if(!silence){const c=$qa('qa-champ');if(c){c.value='';c.style.height='auto';}}
}
/* la conversation revient à l'état d'avant la question i */
const qaVraieQuestion=m=>m&&m.role==='user'&&(typeof m.content==='string'||(Array.isArray(m.content)&&!m.content.some(b=>b&&b.type==='tool_result')));
function qaCoupe(i){
  const x=QA_VU[i]; if(!x)return null;
  /* les conversations plus anciennes ne notent pas où commence chaque
     question : on compte les vraies questions dans les messages */
  let k=typeof x.i==='number'?x.i:-1;
  if(k<0){let n=-1;for(let j=0;j<QA_MSGS.length;j++){if(qaVraieQuestion(QA_MSGS[j])&&++n===i){k=j;break;}}}
  if(k>=0)QA_MSGS.length=k;
  const pieces=x.pieces||[];
  QA_VU.length=i;
  return pieces;
}
async function qaRelance(){
  if(QA_ATTENTE||!QA_VU.length)return;
  const i=QA_VU.length-1, q=QA_VU[i].q;
  const pieces=qaCoupe(i);
  qaMontreConv();
  await qaEnvoie({q,pieces});
}

/* ── MES QUESTIONS ──
   Les conversations gardées, de la plus récente à la plus ancienne :
   la première question, le passage, la date. Toucher une conversation la
   rouvre ; on peut la continuer. Un champ, en tête, les cherche. */
async function qaCol(){
  const u=await qaCompte();
  if(!u||!firebase.firestore)return null;
  return firebase.firestore().collection('users/'+u.uid+'/questions');
}
/* QA_TOUS : toutes les conversations gardées ; QA_LISTE : celles que la
   vue montre, « Mes questions » ou la corbeille, filtrées par la recherche */
let QA_TOUS=[], QA_LISTE=[], QA_VUE='liste', QA_CHOIX=false, QA_PRIS=new Set(), QA_CHERCHE='';
async function qaListe(vue){
  const p=qaPanneau();
  QA_VUE=vue==='corbeille'?'corbeille':'liste';
  p.classList.remove('memoire');
  p.classList.add('liste');
  qaMontre();
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
    try{await qaEfface(col,c);c.efface=true;}catch(e){console.warn('corbeille des questions',e);}
  }
  l=l.filter(c=>!c.efface);
  QA_TOUS=l;
  qaRendListe();
}
const qaPlie=s=>String(s||'').normalize('NFD').replace(/\p{Mn}/gu,'').toLowerCase();
function qaCorrespond(c,q){
  if(!q)return true;
  const t=qaPlie([(c.passage&&c.passage.texte)||'',(c.passage&&c.passage.etiquette)||'',...(Array.isArray(c.vu)?c.vu.map(x=>x.q+' '+x.r):[])].join(' '));
  return qaPlie(q).split(/\s+/).filter(Boolean).every(m=>t.indexOf(m)>=0);
}

/* la vue : en tête, l'accès à la corbeille (ou le retour aux questions),
   la mémoire, « Choisir » et le champ de recherche ; en mode choix,
   chaque rangée se coche d'un toucher et le bas du panneau porte « Tout
   choisir », « Remettre » (corbeille), la poubelle et « Terminer » */
function qaRendListe(){
  const fil=$qa('qa-fil'), corb=QA_VUE==='corbeille';
  QA_LISTE=QA_TOUS.filter(c=>(corb?!!c.jete:!c.jete)&&qaCorrespond(c,QA_CHERCHE));
  const nCorb=QA_TOUS.filter(c=>c.jete).length;
  $qa('qa-label').lastChild.textContent=corb?'Corbeille':'Mes questions';
  QA_PRIS.forEach(id=>{if(!QA_LISTE.some(c=>c.id===id))QA_PRIS.delete(id);});
  if(!QA_LISTE.length){QA_CHOIX=false;QA_PRIS=new Set();}
  const date=iso=>{const d=new Date(iso);return isNaN(d)?'':d.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});};
  let h='';
  if(!QA_CHOIX){
    h+='<div class="qa-l-barre">'
      +(corb?'<button type="button" class="qa-l-lien" id="qa-vers-liste">← Mes questions</button>'
            :'<span class="qa-l-gauche">'+(nCorb?'<button type="button" class="qa-l-lien" id="qa-vers-corb">'+QA_IC_JETER+'<span>Corbeille</span><span class="qa-l-n">'+nCorb+'</span></button>':'')
              +'<button type="button" class="qa-l-lien" id="qa-vers-mem">'+QA_IC_MEMOIRE+'<span>Mémoire</span></button>'
              +(qaCleVisible()?'<button type="button" class="qa-l-lien" id="qa-vers-cle">'+QA_IC_CLE+'<span>Ma clé</span></button>':'')+'</span>')
      +(QA_LISTE.length?'<button type="button" class="qa-l-choisir" id="qa-choisir">Choisir</button>':'')
      +'</div>'
      +'<input type="search" class="qa-l-cherche" id="qa-cherche" placeholder="Chercher dans '+(corb?'la corbeille':'vos questions')+'…" value="'+qaEsc(QA_CHERCHE)+'">';
  }
  if(!QA_LISTE.length)h+='<p class="qa-vide">'+(QA_CHERCHE?'Rien ne correspond.':(corb?'La corbeille est vide.':'Aucune question pour l’instant.'))+'</p>';
  h+=QA_LISTE.map((c,i)=>'<div class="qa-ligne'+(QA_CHOIX?' qa-en-choix':'')+(QA_PRIS.has(c.id)?' qa-pris':'')+(corb?' qa-jetee':'')+'" data-qi="'+i+'">'
    +'<div class="qa-l-txt"'+((QA_CHOIX||!corb)?' role="'+(QA_CHOIX?'checkbox':'button')+'" tabindex="0"':'')+(QA_CHOIX?' aria-checked="'+QA_PRIS.has(c.id)+'"':'')+'>'
    +'<span class="qa-l-q">'+qaEsc((c.vu&&c.vu[0]&&c.vu[0].q)||'')+'</span>'
    +'<span class="qa-l-p">'+(c.passage&&c.passage.texte?'« '+qaEsc(String(c.passage.texte).slice(0,140))+' »':(c.passage&&c.passage.libre?'Conversation libre':'Toute la page'))+'</span>'
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
  lien('qa-vers-corb',()=>{QA_VUE='corbeille';QA_CHOIX=false;QA_PRIS=new Set();QA_CHERCHE='';qaRendListe();qaMajChoix();});
  lien('qa-vers-liste',()=>{QA_VUE='liste';QA_CHOIX=false;QA_PRIS=new Set();QA_CHERCHE='';qaRendListe();qaMajChoix();});
  lien('qa-vers-mem',()=>qaMemoireVue());
  lien('qa-vers-cle',()=>qaCleVue());
  const ch=$qa('qa-cherche');
  if(ch)ch.oninput=()=>{
    QA_CHERCHE=ch.value; const pos=ch.selectionStart;
    qaRendListe();
    const n=$qa('qa-cherche'); if(n){n.focus();try{n.setSelectionRange(pos,pos);}catch(_){}}
  };
  fil.querySelectorAll('[data-qi]').forEach(ligne=>{
    const c=QA_LISTE[+ligne.dataset.qi], t=ligne.querySelector('.qa-l-txt');
    const touche=async()=>{
      if(QA_CHOIX){
        if(QA_PRIS.has(c.id))QA_PRIS.delete(c.id);else QA_PRIS.add(c.id);
        ligne.classList.toggle('qa-pris',QA_PRIS.has(c.id));
        t.setAttribute('aria-checked',QA_PRIS.has(c.id));
        qaMajChoix();
        return;
      }
      if(corb)return;
      qaRemiseAZero();
      const tour=QA_TOUR;
      QA_ID=c.id; QA_PASSAGE=c.passage||{texte:''}; qaPrepareDoc('',QA_PASSAGE.ref);
      QA_VU=Array.isArray(c.vu)?c.vu:[];
      QA_MSGS=Array.isArray(c.msgs)?c.msgs:[];
      if(!Array.isArray(c.msgs)&&c.msgsN){
        /* une longue conversation est gardée en tranches : ses messages, et
           ses questions et réponses complètes */
        let lu=null;
        try{lu=JSON.parse(await lvIaLitGros((await qaCol()).doc(c.id).collection('msgs').doc('m'),'d')||'null');}
        catch(e){console.warn('conversation',e);}
        if(tour!==QA_TOUR)return;
        if(Array.isArray(lu))QA_MSGS=lu;
        else if(lu){QA_MSGS=Array.isArray(lu.msgs)?lu.msgs:[];if(Array.isArray(lu.vu))QA_VU=lu.vu;}
        else QA_MSGS=[];
      }
      qaMontreConv(true);
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

/* ── LA MÉMOIRE ──
   Ce que l'IA retient d'Emmanuel, une ligne par chose. Il la lit, la
   corrige, retire ou ajoute une ligne, puis l'enregistre. */
async function qaMemoireVue(){
  const p=qaPanneau();
  p.classList.add('liste','memoire');
  qaMontre();
  $qa('qa-jeter').style.display='none';
  QA_CHOIX=false; qaMajChoix();
  $qa('qa-label').lastChild.textContent='Mémoire';
  const fil=$qa('qa-fil');
  fil.innerHTML='<span class="qa-roue" aria-label="Chargement"></span>';
  let l=[];
  try{LV_IA_MEMOIRE=null;l=await lvIaMemoire();}catch(e){fil.innerHTML='<p class="qa-vide">'+qaEsc(e.message||'La mémoire n’a pas pu être lue.')+'</p>';return;}
  fil.innerHTML='<div class="qa-l-barre"><button type="button" class="qa-l-lien" id="qa-mem-retour">← Mes questions</button></div>'
    +'<p class="qa-mem-aide">Ce que l’IA du site retient de vous d’une conversation à l’autre, une ligne par chose.</p>'
    +'<textarea class="qa-mem" id="qa-mem" spellcheck="true" placeholder="La mémoire est vide pour l’instant.">'+qaEsc(l.join('\n'))+'</textarea>'
    +'<div class="qa-mem-acts"><span class="qa-mem-etat" id="qa-mem-etat"></span><button type="button" class="qa-mem-b" id="qa-mem-enr">Enregistrer</button></div>';
  $qa('qa-mem-retour').onclick=()=>qaListe();
  const z=$qa('qa-mem'), et=$qa('qa-mem-etat');
  const h=()=>{z.style.height='auto';z.style.height=Math.max(220,z.scrollHeight+4)+'px';};
  z.addEventListener('input',()=>{h();et.textContent='';});
  requestAnimationFrame(h);
  $qa('qa-mem-enr').onclick=async()=>{
    try{const n=await lvIaMemoireEcrit(z.value.split('\n'));z.value=n.join('\n');h();et.textContent='Enregistré';}
    catch(e){et.textContent='Non enregistré';console.warn('mémoire',e);}
  };
}

/* la clé de l'API : un champ masqué, enregistré sur l'appareil ; vide, il
   retire la clé */
function qaCleVue(){
  const p=qaPanneau();
  p.classList.add('liste','memoire');
  qaMontre();
  $qa('qa-jeter').style.display='none';
  QA_CHOIX=false; qaMajChoix();
  $qa('qa-label').lastChild.textContent='Ma clé';
  const fil=$qa('qa-fil');
  fil.innerHTML='<div class="qa-l-barre"><button type="button" class="qa-l-lien" id="qa-cle-retour">← Mes questions</button></div>'
    +'<p class="qa-mem-aide">Pour parler avec l’IA du site, collez ici votre clé de l’API Anthropic (elle commence par « sk-ant- »). Elle reste sur cet appareil : le site la transmet à Anthropic à chaque question, sans la garder. Laissez le champ vide pour la retirer.</p>'
    +'<input type="password" class="qa-cle" id="qa-cle" autocomplete="off" spellcheck="false" placeholder="sk-ant-…" value="'+qaEsc(qaCle())+'">'
    +'<div class="qa-mem-acts"><span class="qa-mem-etat" id="qa-cle-etat"></span><button type="button" class="qa-mem-b" id="qa-cle-enr">Enregistrer</button></div>';
  $qa('qa-cle-retour').onclick=()=>qaListe();
  const z=$qa('qa-cle'), et=$qa('qa-cle-etat');
  z.addEventListener('input',()=>{et.textContent='';});
  $qa('qa-cle-enr').onclick=()=>{
    const v=z.value.trim();
    if(v&&!/^sk-ant-/.test(v)){et.textContent='Ce n’est pas une clé de l’API Anthropic';return;}
    try{if(v)localStorage.setItem(QA_CLE,v);else localStorage.removeItem(QA_CLE);et.textContent=v?'Enregistrée sur cet appareil':'Clé retirée';}
    catch(_){et.textContent='Non enregistrée';}
  };
}

/* ── LA CORBEILLE ──
   Comme pour les articles : une conversation supprimée
   part d'abord à la corbeille, d'où on la remet ; la poubelle de la
   corbeille la supprime pour de bon. Au bout de trente jours, elle part
   d'elle-même. La confirmation se fait dans le panneau lui-même, en bas. */
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
  if(ids.indexOf(QA_ID)>=0){if(QA_ATTENTE)qaArrete();QA_TOUR++;QA_EN_COURS=null;QA_ID='';QA_PASSAGE=null;QA_MSGS=[];QA_VU=[];}
  QA_CHOIX=false; QA_PRIS=new Set(); qaRendListe(); qaMajChoix();
}
async function qaRemet(ids){
  await qaMarque(ids,'');
  QA_CHOIX=false; QA_PRIS=new Set(); qaRendListe(); qaMajChoix();
}
/* une conversation supprimée emporte ses tranches et ses pièces jointes */
async function qaEfface(col,c){
  try{const m=await col.doc(c.id).collection('msgs').doc('m').get();if(m.exists){const d=m.data()||{};for(let k=0;k<(d.n||0);k++)await col.doc(c.id).collection('msgs').doc('m').collection('tranches').doc(d.gen+'_'+k).delete().catch(()=>{});await col.doc(c.id).collection('msgs').doc('m').delete();}}catch(_){}
  try{
    const u=await qaCompte(), db=firebase.firestore();
    for(const x of (Array.isArray(c.vu)?c.vu:[]))for(const p of (x.pieces||[])){
      const r=db.doc('users/'+u.uid+'/qa_pieces/'+p.id);
      const d=await r.get(); if(d.exists){const m=d.data()||{};for(let k=0;k<(m.n||0);k++)await r.collection('tranches').doc(m.gen+'_'+k).delete().catch(()=>{});await r.delete();}
    }
  }catch(_){}
  await col.doc(c.id).delete();
}
async function qaEffaceDemande(ids){
  const n=QA_TOUS.filter(c=>c.jete).length;
  if(!await qaConfirme('Supprimer définitivement '+qaCombien(ids,n)+' ?'))return;
  const col=await qaCol(); if(!col)return;
  const faits=[];
  for(const id of ids){try{await qaEfface(col,QA_TOUS.find(c=>c.id===id)||{id});faits.push(id);}catch(e){console.warn('question supprimée',e);}}
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

/* ── LA CONVERSATION GARDÉE ──
   Après chaque réponse. Les pièces jointes n'y laissent que leur
   identifiant (elles vivent dans qa_pieces). Ce que l'IA relit (la
   réflexion signée, les résultats de recherche) peut peser lourd : au-delà
   de 700 000 octets, les messages partent en tranches sous la
   conversation. */
function qaSansPieces(msgs){
  return msgs.map(m=>typeof m.content==='string'?m:{role:m.role,content:m.content.map(b=>b&&b._lv?Object.assign({},b,{source:Object.assign({},b.source,{data:''})}):b)});
}
async function qaGarde(){
  if(!QA_VU.length)return;
  /* l'état se lit tout de suite : la conversation peut changer pendant
     l'envoi */
  if(!QA_ID)QA_ID='q'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);
  const id=QA_ID, P=QA_PASSAGE||{texte:''}, msgs=qaSansPieces(QA_MSGS);
  const vu=QA_VU.map(x=>{const y=Object.assign({},x);delete y.ouvert;return y;});
  const col=await qaCol(); if(!col)return;
  const maintenant=new Date().toISOString();
  const passage={texte:P.texte||'',contexte:P.contexte||'',etiquette:P.etiquette||'',espece:P.espece||'',ref:P.ref||null,libre:!!P.libre};
  const doc=JSON.parse(JSON.stringify({maj:maintenant,passage,vu,msgs}));
  /* au-delà de 900 000 octets pour toute la fiche, les messages et les
     questions et réponses complètes partent en tranches ; la fiche garde
     un résumé de chaque échange pour la liste et la recherche */
  const gros=new Blob([JSON.stringify(doc)]).size>900000;
  try{
    const ref=col.doc(id);
    const d=await ref.get().catch(()=>null);
    if(!d||!d.exists)doc.quand=maintenant;
    if(gros){
      await lvIaEcritGros(ref.collection('msgs').doc('m'),'d',JSON.stringify({msgs:doc.msgs,vu:doc.vu}));
      doc.vu=doc.vu.map(x=>({q:String(x.q||'').slice(0,500),r:String(x.r||'').slice(0,1500)}));
      doc.msgs=firebase.firestore.FieldValue.delete(); doc.msgsN=true;
    }else doc.msgsN=firebase.firestore.FieldValue.delete();
    await ref.set(doc,{merge:true});
    const p=$qa('qa-panneau');
    if(QA_ID===id&&p&&!p.classList.contains('liste'))$qa('qa-jeter').style.display='';
  }catch(e){console.warn('conversation gardée',e);}
}

/* Tout ce qui touche l'IA (« Mes questions », sa mémoire) vit dans le
   panneau de l'IA, pas dans « Mon compte » (choix d'Emmanuel) : l'icône
   « Mes questions » est dans la tête du panneau, la mémoire au haut de
   la liste des questions. */
/* l'icône de l'IA dans la barre du haut : la conversation en cours, ou
   une conversation libre */
function qaBranchebarre(){
  const b=document.getElementById('ia-ouvrir');
  if(b&&!b.dataset.qa){b.dataset.qa='1';b.addEventListener('click',()=>qaLibre(false));}
}
const qaPret=()=>{qaBranchebarre();};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',qaPret);else qaPret();

const $qa=id=>document.getElementById(id);

/* ── ENVOYER ──
   La question (et ses pièces jointes) part ; la réponse arrive. Tant que
   l'IA demande un outil du site, la page l'exécute et lui rend le
   résultat ; quand Anthropic met une longue recherche en pause, la
   demande repart telle quelle. */
function qaMajEnvoi(){
  const b=$qa('qa-envoi'); if(!b)return;
  b.innerHTML=QA_ATTENTE?QA_IC_STOP:QA_IC_ENVOI;
  b.setAttribute('aria-label',QA_ATTENTE?'Arrêter la réponse':'Envoyer');
  b.title=QA_ATTENTE?'Arrêter':'';
  b.classList.toggle('arret',QA_ATTENTE);
}
function qaArrete(){if(QA_CTRL)QA_CTRL.abort();}

async function qaEnvoie(reprise){
  const champ=$qa('qa-champ');
  const q=reprise?reprise.q:champ.value.trim();
  if(!q||QA_ATTENTE||!QA_PASSAGE)return;
  /* une question modifiée : la conversation repart d'elle */
  let pieces=reprise?(reprise.pieces||[]).slice():[];
  if(!reprise&&QA_MODIF>=0){pieces=(qaCoupe(QA_MODIF)||[]).slice();qaModifFin(true);qaMontreConv();}
  const neuves=reprise?[]:QA_PIECES.splice(0);
  if(!reprise){champ.value=''; champ.style.height='auto'; qaRendPieces();}
  QA_ATTENTE=true; QA_CTRL=new AbortController(); qaMajEnvoi();
  const tour=QA_TOUR, fil=$qa('qa-fil');
  const acc=fil.querySelector('.qa-accueil'); if(acc)acc.remove();
  const x={q,r:'',etapes:[],pensee:'',sources:[],pages:[],pieces:[]};
  const qd=document.createElement('div'); fil.appendChild(qd);
  const rd=document.createElement('div'); rd.className='qa-r'; rd.innerHTML='<span class="qa-roue" aria-label="Réponse en cours"></span>'; fil.appendChild(rd);
  const montreQ=()=>{
    qd.className='qa-q-bloc en-cours';
    qd.innerHTML=qaPiecesHtml(pieces.concat(neuves.map(p=>({media:p.media,nom:p.nom}))))+'<div class="qa-q">'+qaBulle(q)+'</div>';
    /* les pièces déjà gardées se lisent dans le compte ; les neuves sont en main */
    const els=qd.querySelectorAll('.qa-piece-m');
    neuves.forEach((p,k)=>{const el=els[pieces.length+k];const im=el&&el.querySelector('img');if(im)im.src='data:'+p.media+';base64,'+p.data;});
    qaVignettes(qd);
  };
  montreQ();
  QA_EN_COURS={qd,rd,x};
  qd.scrollIntoView({block:'start',behavior:'smooth'});
  const avant=QA_MSGS.length;
  try{
    /* les pièces neuves se gardent dans le compte ; celles d'une question
       relancée se relisent */
    for(const p of neuves){const id=await lvIaPieceGarde(p.media,p.data,p.nom);pieces.push({id,media:p.media,nom:p.nom});}
    x.pieces=pieces;
    const blocsPieces=[];
    for(const p of pieces){
      const data=await lvIaPieceLit(p.id);
      blocsPieces.push({type:/^image\//.test(p.media)?'image':'document',source:{type:'base64',media_type:p.media,data},_lv:p.id,_nom:p.nom});
    }
    let texte=q;
    if(!QA_MSGS.length){
      const P=QA_PASSAGE;
      texte=P.libre?q:P.texte
        ?'Passage sélectionné'+(P.etiquette?' ('+P.etiquette+')':'')+(P.espece?', dans '+P.espece:'')+' :\n« '+P.texte+' »'
          +(P.contexte&&P.contexte!==P.texte?'\n\nLe texte autour du passage :\n'+P.contexte:'')
          +'\n\nQuestion : '+q
        :'Question sur toute la page'+(P.etiquette?' « '+P.etiquette+' »':'')+(P.espece?', '+P.espece:'')+', sans passage sélectionné.\n\nQuestion : '+q;
    }
    QA_DOC=await QA_DOC_PRET;
    if(tour!==QA_TOUR)return;
    x.i=QA_MSGS.length;
    QA_MSGS.push({role:'user',content:blocsPieces.length?blocsPieces.concat([{type:'text',text:texte}]):texte});
  }catch(e){
    console.warn('pièces',e);
    if(tour===QA_TOUR){QA_ATTENTE=false;QA_EN_COURS=null;qaMajEnvoi();rd.classList.add('erreur');rd.innerHTML=qaRendu(e.message||'Le message n’a pas pu partir.');}
    return;
  }
  let enPensee=false, rendu=0;
  const montre=()=>{
    if(tour!==QA_TOUR)return;
    rendu=0;
    rd.innerHTML=qaDetailsHtml(Object.assign({},x,{ouvert:rd.querySelector('.qa-det[open]')!=null}),QA_ATTENTE&&(!x.r||enPensee))+qaRendu(x.r)+qaSourcesHtml(x)+(QA_ATTENTE?'<span class="qa-roue" aria-hidden="true"></span>':'');
  };
  /* un rendu par image au plus : un long texte qui arrive vite ne fige pas la page */
  const planMontre=()=>{if(!rendu){rendu=requestAnimationFrame(montre);}};
  const etape=t=>{x.etapes.push(t);planMontre();};
  const sources=new Map();
  const ajouteSources=bl=>{
    (bl.citations||[]).forEach(c=>{if(c&&c.url&&!sources.has(c.url))sources.set(c.url,{url:c.url,titre:c.title||''});});
  };
  let ok=false;
  try{
    for(let n=0;n<24;n++){
      const {contenu:c,fin}=await qaFlux(QA_MSGS,{
        texte:d=>{enPensee=false;x.r+=d;planMontre();},
        pensee:d=>{enPensee=true;x.pensee+=d;planMontre();},
        outil:()=>{},
        resume:()=>etape('Conversation longue : les échanges anciens sont résumés pour continuer'),
        outilPret:b=>etape(qaEtape(b)),
        resultat:b=>{
          /* une lecture de page web : sa source s'ajoute ; une recherche :
             les pages citées s'ajouteront par les citations */
          if(b.type==='web_fetch_tool_result'&&b.content&&b.content.url&&!sources.has(b.content.url))sources.set(b.content.url,{url:b.content.url,titre:(b.content.content&&b.content.content.title)||''});
        }
      });
      if(tour!==QA_TOUR)return;
      c.filter(b=>b.type==='text').forEach(ajouteSources);
      x.sources=[...sources.values()].slice(0,12);
      if(!c.length)break;
      QA_MSGS.push({role:'assistant',content:c});
      if(fin==='pause_turn'){continue;}
      const outils=c.filter(b=>b.type==='tool_use');
      if(fin!=='tool_use'){
        /* une réponse coupée au milieu d'un appel d'outil (trop longue) :
           l'outil reçoit une erreur, et l'IA reprend en plus court, une
           fois ; sinon la conversation ne pourrait plus continuer */
        if(outils.length){
          QA_MSGS.push({role:'user',content:outils.map(b=>({type:'tool_result',tool_use_id:b.id,is_error:true,content:'L’appel a été coupé avant la fin : la réponse dépassait la longueur maximale. Recommence en plus court (par exemple en moins de chapitres ou de parties).'}))});
          if(!x.coupe){x.coupe=true;etape('Réponse trop longue, reprise en plus court');continue;}
          QA_MSGS.push({role:'assistant',content:[{type:'text',text:'(La réponse a dépassé deux fois la longueur maximale.)'}]});
        }
        if(fin==='max_tokens')x.r+=(x.r?'\n\n':'')+'*(La réponse a atteint sa longueur maximale.)*';
        break;
      }
      const res=[];
      for(const b of outils){
        etape(qaEtape(b));
        const out=await qaOutil(b,t=>{x.etapes[x.etapes.length-1]=qaEtape(b)+' · '+t;planMontre();});
        res.push({type:'tool_result',tool_use_id:b.id,content:out});
      }
      if(tour!==QA_TOUR)return;
      QA_MSGS.push({role:'user',content:res});
      if(x.r&&!/\n$/.test(x.r))x.r+='\n\n';
    }
    if(!x.r.trim()&&!x.pages.length){x.r='L’IA n’a rien répondu. Reformulez la question, puis réessayez.';QA_MSGS.length=avant;rd.classList.add('erreur');}
    else ok=true;
  }catch(e){
    if(tour!==QA_TOUR)return;
    const arret=e&&e.name==='AbortError';
    if(arret&&x.r.trim()){
      /* une réponse arrêtée en route garde ce qui était écrit : l'IA le
         relira tel quel au message suivant */
      QA_MSGS.length=avant+1;
      QA_MSGS.push({role:'assistant',content:[{type:'text',text:x.r.trim()}]});
      x.r=x.r.trim()+'\n\n*(Réponse arrêtée.)*';
      ok=true;
    }else{
      console.warn('question',e);
      /* la question ratée sort de la conversation : la suivante repart
         d'un échange complet */
      QA_MSGS.length=avant;
      x.r=(x.r?x.r+'\n\n':'')+(arret?'Réponse arrêtée.':(e&&e.message?e.message:'La question n’a pas pu partir.'));
      rd.classList.add('erreur');
    }
  }finally{
    if(tour===QA_TOUR){
      QA_ATTENTE=false; QA_CTRL=null; QA_EN_COURS=null; qaMajEnvoi();
      if(ok){
        QA_VU.push(x); qaGarde(); qaInvite();
        /* la conversation se redessine : la question prend son bouton
           « modifier », la réponse ses boutons ; la précédente perd
           « relancer » */
        if(!$qa('qa-panneau').classList.contains('liste')){const haut=fil.scrollTop; qaMontreConv(); fil.scrollTop=haut;}
      }else{if(rendu)cancelAnimationFrame(rendu);montre();}
      if(!(window.matchMedia&&matchMedia('(pointer:coarse)').matches))champ.focus();
    }
  }
}

window.LVQuestion={ouvre:qaOuvre,libre:qaLibre,copie:qaCopie,icones:{copie:QA_IC_COPIE,fait:QA_IC_FAIT,ia:QA_IC_IA}};

/* ════════════════════════════════════════════════════════════════════
   LUMEN · FONCTIONNEMENT COMMUN : EDITEUR
   Pages : Commentaires.
   L'éditeur de blocs (texte, verset, image, code), les images déposées et le sélecteur de passage biblique.
   La fabrication pose ce fichier dans chaque page concernée, avant le script
   de la page : une correction faite ici vaut pour toutes.
   ════════════════════════════════════════════════════════════════════ */

/* (lvChoix : voir commun/outils.js, posé par le build) */
function propre(html){
  const doc=new DOMParser().parseFromString('<div>'+html+'</div>','text/html');
  const src=doc.body.firstChild, out=document.createElement('div');
  (function marche(de,vers){
    de.childNodes.forEach(n=>{
      if(n.nodeType===3){vers.appendChild(document.createTextNode(n.nodeValue.replace(/\u200B/g,'')));return;}
      if(n.nodeType!==1)return;
      const t=BALISES[n.tagName];
      if(!t){
        marche(n,vers);
        /* un élément de bloc (paragraphe, titre, ligne de liste…) se termine
           par un retour à la ligne, sinon les paragraphes collés se soudent */
        if(/^(P|DIV|LI|H[1-6]|BLOCKQUOTE|TR|PRE|SECTION|ARTICLE)$/.test(n.tagName)&&n.nextSibling&&vers.lastChild){
          const dern=vers.lastChild;
          if(!(dern.nodeType===1&&dern.tagName==='BR'))vers.appendChild(document.createElement('br'));
        }
        return;
      }
      if(t==='br'){vers.appendChild(document.createElement('br'));return;}
      if(t==='span'&&!n.classList.contains('ref')){marche(n,vers);return;}
      const el=document.createElement(t);
      if(t==='a'){
        const h=n.getAttribute('href')||'';
        if(!/^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(h)){marche(n,vers);return;}
        el.setAttribute('href',h); el.setAttribute('rel','noopener');
        if(/^https?:/i.test(h))el.setAttribute('target','_blank');
      }
      if(t==='span'){el.className='ref';el.setAttribute('role','button');el.setAttribute('tabindex','0');}
      marche(n,el); vers.appendChild(el);
    });
  })(src,out);
  alignGauche(out);
  return out.innerHTML.replace(/\s+$/,'');
}

/* ── LE TEXTE RESTE COLLÉ À GAUCHE ──
   Un texte collé apporte ses retraits et retours à la ligne, que le
   navigateur garde en espaces insécables : le début des lignes part à
   droite. On retire tout blanc en début et en fin de ligne, et l'on ramène
   une suite de blancs à un seul, en gardant l'espace insécable devant
   : ; ? ! ». Le texte repasse ici à l'affichage : les articles déjà écrits
   en profitent aussi. */
function alignGauche(racine){
  const w=document.createTreeWalker(racine,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
  let debut=true, dernierTexte=null, n;
  const finLigne=()=>{ if(dernierTexte)dernierTexte.nodeValue=dernierTexte.nodeValue.replace(/[\s\u00a0]+$/,''); dernierTexte=null; };
  while((n=w.nextNode())){
    if(n.nodeType===1){ if(n.tagName==='BR'){ finLigne(); debut=true; } continue; }
    let v=n.nodeValue.replace(/[ \t\r\n\f]+/g,' ');
    v=v.replace(/[ \u00a0\u2002-\u200a\u202f\u3000]{2,}(?=([:;?!»])?)/g,(m,p)=>p?'\u00a0':' ');
    if(debut){ v=v.replace(/^[\s\u00a0\u2002-\u200a\u202f\u3000]+/,''); if(v)debut=false; }
    n.nodeValue=v;
    if(v)dernierTexte=n;
  }
  finLigne();
}

function blocNeuf(cle){
  const k=cleBloc();
  if(cle==='verset')return{t:'verset',txt:'',ref:'',k:k};
  if(cle==='sep')return{t:'sep',k:k};
  if(cle==='image')return{t:'image',media:'',mime:'',leg:'',k:k};
  if(cle==='html')return{t:'html',code:'',haut:0,k:k};
  return{t:cle||'p',h:'',k:k};
}

function poseCles(a){ (a&&a.blocs||[]).forEach(b=>{ if(b&&!b.k)b.k=cleBloc(); }); }

function texteBrut(a){
  return (a.blocs||[]).map(b=>{
    if(b.t==='verset')return (b.txt||'')+' '+(b.ref||'');
    if(b.t==='sep')return '';
    return String(b.h||'').replace(/<[^>]+>/g,' ');
  }).join(' ').replace(/\s+/g,' ').trim();
}

async function envoieImage(f,i){
  if(!f)return;
  if(!/^image\//.test(f.type)){lvInfo('Ce fichier n’est pas une image.');return;}
  if(f.size>IMG_MAX){lvInfo('Cette image dépasse 20 Mo. Choisissez-en une plus légère.');return;}
  const cible=S.art, ancre=S.art?S.art.blocs[i]:null;
  if(!cible||!ancre)return;
  if(!ancre.k)ancre.k=cleBloc();
  const cle=ancre.k;
  /* le bloc est retrouvé par sa clé à chaque fois : son rang et son élément
     peuvent changer pendant l'envoi */
  const rang=()=>(S.art===cible?S.art.blocs.findIndex(b=>b&&b.k===cle):-1);
  const dis=(m,h)=>{const j=rang();if(j<0)return;const bloc=$('ed-corps').querySelector('.bloc[data-i="'+j+'"]');const place=bloc&&bloc.querySelector('.im-place');if(place){if(h)place.innerHTML=m;else place.textContent=m;}};
  dis('<span class="lv-roue petite" role="status" aria-label="Lecture du fichier"></span>',true);
  let url;
  try{url=await litFichier(f);}catch(e){dis('Choisir une image');lvInfo('La lecture du fichier a échoué.');return;}
  const virgule=url.indexOf(','), b64=url.slice(virgule+1);
  const id='m'+Date.now()+Math.floor(Math.random()*1000);
  const parts=[];
  for(let k=0;k<b64.length;k+=TRANCHE)parts.push(b64.slice(k,k+TRANCHE));
  try{
    /* la tête d'abord : si l'envoi casse en route, effaceMedia saura quoi
       retirer, sinon les tranches resteraient introuvables et perdues */
    await mcol().doc(id).set({mime:f.type,n:parts.length,taille:f.size,complet:false,cree:new Date().toISOString()});
    for(let k=0;k<parts.length;k++){
      dis('<span class="lv-roue petite" role="status" aria-label="Envoi en cours"></span> '+Math.round((k+1)/parts.length*100)+' %',true);
      await mcol().doc(id).collection('tranches').doc(String(k)).set({d:parts[k]});
    }
    await mcol().doc(id).set({mime:f.type,n:parts.length,taille:f.size,complet:true,cree:new Date().toISOString()});
  }catch(e){dis('Choisir une image');lvInfo('L’envoi a échoué. Réessayez.');console.warn('envoi',e);effaceMedia(id);return;}
  CACHE.set(id,url);
  /* l'envoi est long : l'article a pu être quitté ou le bloc déplacé.
     L'image ne se pose que si la cible est toujours celle qu'on visait. */
  if(S.art!==cible||rang()<0){effaceMedia(id);return;}
  litEditeur();
  const j=rang();
  if(j<0){effaceMedia(id);return;}
  const vieux=(S.art.blocs[j]||{}).media;
  S.art.blocs[j]={t:'image',media:id,mime:f.type,leg:(S.art.blocs[j]||{}).leg||'',k:cle};
  if(vieux&&vieux!==id){effaceMedia(vieux);if(S.art.publie)effaceMediaPublic(vieux);}
  rendEditeur(); marqueSale(); enregistre(true);
}

async function chargeMedia(id){
  if(CACHE.has(id))return CACHE.get(id);
  const meta=await mcol().doc(id).get();
  if(!meta.exists)throw new Error('média introuvable');
  const m=meta.data(), bouts=[];
  for(let k=0;k<(m.n||0);k++){
    const t=await mcol().doc(id).collection('tranches').doc(String(k)).get();
    bouts.push(t.exists?(t.data().d||''):'');
  }
  const url='data:'+(m.mime||'image/jpeg')+';base64,'+bouts.join('');
  CACHE.set(id,url);
  return url;
}

function poseImage(img,id){
  if(!img)return;
  chargeMedia(id).then(u=>{img.src=u;}).catch(()=>{
    const f=img.parentNode; if(!f)return;
    const d=document.createElement('div'); d.className='im-etat'; d.textContent='Image introuvable';
    f.replaceChild(d,img);
  });
}

async function effaceMedia(id){
  if(!id)return;
  try{
    const meta=await mcol().doc(id).get();
    const n=meta.exists?(meta.data().n||0):0;
    for(let k=0;k<n;k++)await mcol().doc(id).collection('tranches').doc(String(k)).delete();
    await mcol().doc(id).delete();
    CACHE.delete(id);
  }catch(e){console.warn('effacement média',e);}
}

function copieVieille(txt){
  try{
    const z=document.createElement('textarea');
    z.value=txt; z.readOnly=false; z.contentEditable='true';
    z.style.cssText='position:fixed;top:0;left:-9999px;width:1px;height:1px;font-size:16px;opacity:0';
    document.body.appendChild(z);
    const r=document.createRange(); r.selectNodeContents(z);
    const s=window.getSelection(); s.removeAllRanges(); s.addRange(r);
    z.setSelectionRange(0,999999);
    document.execCommand('copy');
    s.removeAllRanges(); document.body.removeChild(z);
    return true;
  }catch(e){return false;}
}

/* Le bouton de l'éditeur dit l'état courant. Le site est privé : « publier »
   un commentaire, c'est le faire paraître dans la Bible, et le bouton le dit
   ainsi (« Afficher dans la Bible » / « Retirer de la Bible »). */
function majEtatEditeur(){
  const b=document.getElementById('b-etat'); if(!b||!S.art)return;
  b.textContent=S.art.publie?'Retirer de la Bible':'Afficher dans la Bible';
  b.classList.toggle('publie',!!S.art.publie);
}

async function copieMediaPublic(id){
  if(!id)return;
  const meta=await mcol().doc(id).get();
  if(!meta.exists)return;
  const m=meta.data(), n=m.n||0;
  /* un média ne change jamais sous le même identifiant : s'il est déjà
     copié, complet, il n'est pas recopié (sinon chaque enregistrement
     automatique renverrait toutes les images, tranche par tranche) */
  try{const pub=await pmed().doc(id).get();if(pub.exists&&(pub.data().n||0)===n&&n>0)return;}catch(e){}
  for(let k=0;k<n;k++){
    const t=await mcol().doc(id).collection('tranches').doc(String(k)).get();
    await pmed().doc(id).collection('tranches').doc(String(k)).set({d:t.exists?(t.data().d||''):''});
  }
  await pmed().doc(id).set({mime:m.mime||'image/jpeg',n:n});
}

async function effaceMediaPublic(id){
  if(!id)return;
  try{
    const meta=await pmed().doc(id).get();
    const n=meta.exists?(meta.data().n||0):0;
    for(let k=0;k<n;k++)await pmed().doc(id).collection('tranches').doc(String(k)).delete();
    await pmed().doc(id).delete();
  }catch(e){console.warn('média public',e);}
}

function elementBloc(b,i){
  const d=document.createElement('div');
  d.className='bloc b-'+b.t; d.dataset.i=i;
  let inner='<span class="bl-poignee" data-menu="'+i+'" role="button" tabindex="0" aria-label="Ce bloc">⋯</span>';
  if(b.t==='sep'){
    inner+='<div class="trait-sep"></div>';
  }else if(b.t==='verset'){
    inner+='<div class="v-ligne"><span class="zone v-txt" contenteditable="true" data-champ="txt" data-vide="Texte du verset">'+propre(b.txt||'')+'</span>'
      +'<span class="zone v-ref" contenteditable="true" data-champ="ref" data-vide="Référence">'+esc(b.ref||'')+'</span></div>';
  }else if(b.t==='image'){
    inner+='<figure>'
      +(b.media?'<img data-media="'+esc(b.media)+'" alt="">':'<div class="im-place" data-choisir="'+i+'">Choisir une image</div>')
      +'<figcaption class="zone" contenteditable="true" data-champ="leg" data-vide="Légende (facultative)">'+propre(b.leg||'')+'</figcaption></figure>';
  }else if(b.t==='html'){
    inner+=(b.code
      ? '<iframe data-html="'+i+'" style="height:'+(Math.max(40,Math.min(40000,Number(b.haut)||320)))+'px" sandbox="allow-scripts" referrerpolicy="no-referrer" title="Bloc interactif"></iframe>'
      : '<div class="im-place" data-code="'+i+'">Coller le code</div>');
  }else{
    inner+='<div class="zone" contenteditable="true" data-champ="h" data-vide="'+esc(typeDe(b.t).vide)+'">'+propre(b.h||'')+'</div>';
  }
  d.innerHTML=inner;
  if(b.t==='image'&&b.media)poseImage(d.querySelector('img'),b.media);
  if(b.t==='html'&&b.code)poseCadre(d.querySelector('iframe'),b.code);
  return d;
}

function ouvre(id){
  const a=S.liste.find(x=>x.id===id); if(!a)return;
  S.art=JSON.parse(JSON.stringify(a)); S.sale=false; poseCles(S.art);
  $('etat-enr').textContent='';
  rendEditeur(); majEtatEditeur(); vue('edit');
}

// ════════ MISE EN FORME ════════
function zoneActive(){
  const s=getSelection(); if(!s||!s.anchorNode)return null;
  let n=s.anchorNode; if(n.nodeType===3)n=n.parentNode;
  return n.closest?n.closest('.zone'):null;
}

function applique(cmd){
  const z=zoneActive(); if(!z){lvInfo('Placez d’abord le curseur dans un texte.');return;}
  document.execCommand(cmd,false,null);
  z.focus(); marqueSale(); majOutils();
}

function majOutils(){
  try{
    $('o-gras').classList.toggle('on',document.queryCommandState('bold'));
    $('o-ital').classList.toggle('on',document.queryCommandState('italic'));
  }catch(e){}
}

/* Après un renvoi posé, une marque invisible se place juste après lui, le
   curseur derrière : la suite s'écrit en texte ordinaire au lieu d'entrer
   dans le renvoi et de prendre sa couleur. La marque part au nettoyage, elle
   n'est jamais enregistrée. */
function sortApres(el){
  try{
    const s=getSelection(); if(!s)return;
    const t=document.createTextNode('\u200B');
    if(el.parentNode)el.parentNode.insertBefore(t,el.nextSibling);
    const r=document.createRange(); r.setStart(t,1); r.collapse(true);
    s.removeAllRanges(); s.addRange(r);
  }catch(_){}
}

function insere(el){
  const s=getSelection(); if(!s.rangeCount)return;
  const r=s.getRangeAt(0); r.deleteContents(); r.insertNode(el);
  r.setStartAfter(el); r.collapse(true); s.removeAllRanges(); s.addRange(r);
  marqueSale();
}

/* Ouvrir une modale déplace le curseur dans son champ : on met la sélection de
   côté avant, on la remet après, sinon la commande s'applique à rien. */
function gardeSelection(){
  const s=getSelection();
  return (s&&s.rangeCount)?s.getRangeAt(0).cloneRange():null;
}

function rendSelection(z,r){
  if(!z)return; z.focus();
  if(!r)return;
  try{const s=getSelection();s.removeAllRanges();s.addRange(r);}catch(_){}
}

async function poseLien(){
  const z=zoneActive(); if(!z){lvInfo('Sélectionnez d’abord le texte à lier.');return;}
  const s=getSelection(); const txt=s.toString(); const garde=gardeSelection();
  const url=await lvSaisie('Adresse du lien','','','https://');
  if(!url||!url.trim())return;
  rendSelection(z,garde);
  if(txt){document.execCommand('createLink',false,url.trim());}
  else{
    const a=document.createElement('a'); a.href=url.trim(); a.textContent=url.trim();
    insere(a);
  }
  marqueSale();
}

/* La référence se choisit dans la Bible, elle ne se tape pas au clavier :
   le renvoi posé est toujours un vrai passage. La barre de recherche du
   sélecteur accepte quand même une référence écrite, pour aller vite. */
function poseRef(){
  const z=zoneActive(); if(!z){lvInfo('Placez d’abord le curseur dans un texte.');return;}
  const s=getSelection();
  bibOuvre({quoi:'ref',zone:z,garde:gardeSelection(),depart:s.toString().trim(),
            chapOk:true,titre:'Choisir la référence'});
}

async function menuBloc(i){
  const a=S.art; if(!a)return;
  const entrees=[];
  if(a.blocs[i].t==='verset')entrees.push({cle:'bib',nom:'Prendre le verset dans la Bible'});
  if(a.blocs[i].t==='image')entrees.push({cle:'img',nom:a.blocs[i].media?'Remplacer l’image':'Choisir une image'});
  if(a.blocs[i].t==='html')entrees.push({cle:'code',nom:a.blocs[i].code?'Modifier le code':'Coller le code'});
  TYPES.forEach(t=>{ if(t.cle!==a.blocs[i].t) entrees.push({cle:'t:'+t.cle,nom:t.nom,note:'changer'}); });
  entrees.push({cle:'apres',nom:'Ajouter un bloc dessous'});
  if(i>0)entrees.push({cle:'haut',nom:'Monter'});
  if(i<a.blocs.length-1)entrees.push({cle:'bas',nom:'Descendre'});
  if(a.blocs.length>1)entrees.push({cle:'suppr',nom:'Supprimer ce bloc',danger:true});
  const c=await lvChoix('Ce bloc',entrees);
  if(!c)return;
  if(c==='bib'){
    /* on relit d'abord l'écran : ce qui vient d'être tapé ne doit pas se
       perdre pendant qu'on feuillette */
    litEditeur();
    const b=S.art.blocs[i]; if(!b)return;
    if(!b.k)b.k=cleBloc();
    bibOuvre({quoi:'verset',cle:b.k,depart:b.ref||'',titre:'Choisir le verset'});
    return;
  }
  if(c==='img'){choisirImage(i);return;}
  if(c==='code'){await editeCode(i);return;}
  litEditeur();
  if(c==='suppr'&&a.blocs[i]&&a.blocs[i].t==='image'&&a.blocs[i].media){effaceMedia(a.blocs[i].media);if(a.publie)effaceMediaPublic(a.blocs[i].media);}
  if(c.indexOf('t:')===0){
    const nt=c.slice(2), anc=a.blocs[i];
    if(anc.t==='image'&&anc.media&&nt!=='image'){effaceMedia(anc.media);if(a.publie)effaceMediaPublic(anc.media);}
    const nb=blocNeuf(nt);
    if(nt!=='sep'&&nt!=='verset'&&anc.t!=='sep')nb.h=anc.t==='verset'?(anc.txt||''):(anc.h||'');
    if(nt==='verset'&&anc.t!=='sep'&&anc.t!=='verset')nb.txt=anc.h||'';
    a.blocs[i]=nb;
  }
  else if(c==='apres')a.blocs.splice(i+1,0,blocNeuf('p'));
  else if(c==='haut'){const x=a.blocs[i];a.blocs[i]=a.blocs[i-1];a.blocs[i-1]=x;}
  else if(c==='bas'){const x=a.blocs[i];a.blocs[i]=a.blocs[i+1];a.blocs[i+1]=x;}
  else if(c==='suppr')a.blocs.splice(i,1);
  rendEditeur(); marqueSale();
  const cible=$('ed-corps').querySelectorAll('.bloc')[c==='apres'?i+1:Math.min(i,a.blocs.length-1)];
  const z=cible&&cible.querySelector('.zone'); if(z)z.focus();
}

function choisirImage(i){
  CIBLE_IMG=i;
  const f=$('f-image'); f.value=''; f.click();
}

async function editeCode(i){
  const a=S.art; if(!a)return;
  const code=await lvCode(a.blocs[i].code||'');
  if(code===null)return;
  litEditeur();
  S.art.blocs[i]={t:'html',code:code,haut:S.art.blocs[i].haut||0,k:S.art.blocs[i].k||cleBloc()};
  rendEditeur(); marqueSale();
}

function lvCode(valeur){
  $('code-champ').value=valeur||'';
  $('m-code').classList.add('on');
  setTimeout(()=>$('code-champ').focus(),60);
  return new Promise(r=>{_cres=r;});
}

function codeFin(v){$('m-code').classList.remove('on');const f=_cres;_cres=null;if(f)f(v);}

async function ajouteBloc(){
  const a=S.art; if(!a)return;
  const c=await lvChoix('Ajouter un bloc',TYPES.map(t=>({cle:t.cle,nom:t.nom})));
  if(!c)return;
  litEditeur(); a.blocs.push(blocNeuf(c)); rendEditeur(); marqueSale();
  const blocs=$('ed-corps').querySelectorAll('.bloc');
  const z=blocs[blocs.length-1].querySelector('.zone'); if(z)z.focus();
}

function bibOuvre(cible){
  const api=bibApi();
  if(!api){lvInfo('La Bible n’est pas encore prête. Réessayez dans un instant.');return;}
  BIB_CIBLE=cible||{quoi:'ref'};
  $('mbib-titre').textContent=BIB_CIBLE.titre||'Choisir un verset';
  $('m-bib').classList.add('on');
  $('mbib-corps').innerHTML='<div class="lv-attente lv-attente-courte"><span class="lv-roue" role="status" aria-label="Chargement"></span></div>';
  $('mbib-apercu').innerHTML=''; bibMajBoutons();
  api.pret().then(()=>{
    /* on ouvre sur la référence déjà en place, quand il y en a une */
    let d=null; try{d=BIB_CIBLE.depart?api.ref(BIB_CIBLE.depart):null;}catch(e){d=null;}
    if(d&&d.ch)return bibVersets(d.slug,d.ch,d.v1,d.v2);
    if(d)return bibChaps(d.slug);
    if(B.slug&&B.ch)return bibVersets(B.slug,B.ch);
    bibLivres();
  }).catch(()=>{$('mbib-corps').innerHTML='<div class="mbib-charge">La Bible n’a pas pu être chargée. Fermez et réessayez.</div>';});
}

function bibFerme(){$('m-bib').classList.remove('on');BIB_CIBLE=null;}

function bibFil(){
  const api=bibApi(); let h='<span data-b="livres">La Sainte Bible</span>';
  if(B.slug){const i=api.info(B.slug); if(i){h+=' · <span data-b="livre" data-slug="'+esc(B.slug)+'">'+esc(i.nom)+'</span>'; if(B.ch)h+=' · <span>'+(B.slug==='psaumes'?'Psaume ':'Ch. ')+B.ch+'</span>';}}
  $('mbib-fil').innerHTML=h;
}

function bibLivres(){
  const IDX=bibApi().index(); B.slug=null;B.ch=0;B.versets=[];bibRaz();
  let h='',tc='';
  IDX.groupes.forEach(g=>{
    if(g.test!==tc){tc=g.test;h+='<div class="mbib-test">'+(g.test==='AT'?'Ancien Testament':'Nouveau Testament')+'</div>';}
    h+='<div class="mbib-grp">'+esc(g.nom)+'</div>';
    IDX.livres.forEach(l=>{if(l.groupe!==g.nom)return;
      h+='<div class="mbib-livre" data-b="livre" data-slug="'+esc(l.slug)+'"><span>'+esc(l.nom)+'</span><span class="mbib-n">'+l.nch+'</span></div>';});
  });
  $('mbib-corps').innerHTML=h; $('mbib-corps').scrollTop=0; bibFil(); bibApercu();
}

function bibChaps(slug){
  const api=bibApi(), inf=api.info(slug); if(!inf)return bibLivres();
  if(inf.nch===1)return bibVersets(slug,1);
  B.slug=slug;B.ch=0;B.versets=[];bibRaz();
  let h='<div class="mbib-chaps">';
  for(let i=1;i<=inf.nch;i++)h+='<div class="mbib-chap" data-b="chap" data-slug="'+esc(slug)+'" data-n="'+i+'">'+i+'</div>';
  $('mbib-corps').innerHTML=h+'</div>'; $('mbib-corps').scrollTop=0; bibFil(); bibApercu();
}

function bibVersets(slug,ch,v1,v2){
  const api=bibApi(); B.slug=slug;B.ch=ch;bibRaz();
  $('mbib-corps').innerHTML='<div class="lv-attente lv-attente-courte"><span class="lv-roue" role="status" aria-label="Chargement"></span></div>'; bibFil();
  api.livre(slug).then(d=>{
    let c=null; for(let i=0;i<d.chapitres.length;i++)if(d.chapitres[i].n===ch){c=d.chapitres[i];break;}
    if(!c)return bibChaps(slug);
    B.versets=c.versets;
    if(v1){B.v1=v1;B.v2=v2||v1;}
    let h='';
    c.versets.forEach(v=>{h+='<div class="mbib-v" data-b="v" data-v="'+v.v+'"><span class="mbib-vn">'+v.v+'</span><span>'+esc(v.t)+'</span></div>';});
    $('mbib-corps').innerHTML=h; bibMarque(); bibAmene(B.v1); bibApercu();
  }).catch(()=>{$('mbib-corps').innerHTML='<div class="mbib-charge">Le texte n’a pas pu être chargé.</div>';});
}

function bibNomLivre(){
  const api=bibApi(), inf=api?api.info(B.slug):null;
  return (B.slug==='psaumes')?'Psaume':(inf?inf.nom:B.slug);
}

/* Un livre d'un seul chapitre s'écrit « Jude 3 », jamais « Jude 1:3 ». */
function bibUnSeulCh(){
  const api=bibApi(), inf=api?api.info(B.slug):null;
  return !!(inf&&inf.nch===1);
}

function bibResultat(){
  bibMots();
  if(!B.mots.length)return null;
  let a=0,b=B.mots.length-1;
  if(B.wa!==null){a=B.wa;b=(B.wb===null?B.wa:B.wb);}
  const part=B.mots.slice(a,b+1);
  if(!part.length)return null;
  const va=part[0].v, vb=part[part.length-1].v;
  const tete=bibUnSeulCh()?(bibNomLivre()+' '):(bibNomLivre()+' '+B.ch+':');
  return {texte:part.map(x=>x.m).join(' '),ref:tete+va+(vb>va?'-'+vb:''),a:a,b:b};
}

/* Le chapitre entier : un article renvoie parfois à « Matthieu 5 » sans viser
   un verset. Réservé au renvoi dans le texte (chapOk). */
function bibChapRef(){
  if(!B.slug||!B.ch)return null;
  return bibUnSeulCh()?bibNomLivre():(bibNomLivre()+' '+B.ch);
}

/* « Le verset entier » n'a de sens que sur un passage choisi, et seulement
   pour un renvoi dans le texte : un bloc de verset prend déjà les deux, et la
   référence d'un commentaire ne veut que la référence. */
function bibMajBoutons(){
  const b=$('mbib-texte'); if(!b)return;
  const on=!!(BIB_CIBLE&&BIB_CIBLE.quoi==='ref'&&bibResultat());
  b.style.display=on?'':'none';
  $('mbib-ok').textContent=on?'La référence':'Utiliser';
}

function bibApercu(){
  bibMajBoutons();
  const z=$('mbib-apercu'), r=bibResultat();
  if(!r){
    const ch=(BIB_CIBLE&&BIB_CIBLE.chapOk)?bibChapRef():null;
    if(ch){
      z.classList.remove('vide');
      z.innerHTML='<div class="mbib-tete"><span class="mbib-ref">'+esc(ch)+'</span></div>'
        +'<div class="mbib-mot-vide">Touchez un verset pour préciser, ou validez pour renvoyer au chapitre entier.</div>';
      return;
    }
    z.innerHTML='';z.classList.add('vide');return;
  }
  z.classList.remove('vide');
  let h='<div class="mbib-tete"><span class="mbib-ref">'+esc(r.ref)+'</span>';
  if(B.wa!==null)h+='<span class="mbib-tout" id="mbib-tout" role="button" tabindex="0">Tout le passage</span>';
  h+='</div><div class="mbib-mots'+(B.wa===null?' tout':'')+'" id="mbib-mots">';
  B.mots.forEach((x,i)=>{
    const on=i>=r.a&&i<=r.b, bout=(i===r.a||i===r.b)&&B.wa!==null;
    h+='<span class="mbib-mot'+(on?' on':'')+(bout?' bout':'')+'" data-m="'+i+'">'+esc(x.m)+'</span> ';
  });
  z.innerHTML=h+'</div>';
}

function bibVaRef(){
  const api=bibApi(), champ=$('i-mbib'), v=champ.value.trim();
  if(!v)return;
  let r=null; try{r=api.ref(v);}catch(e){r=null;}
  if(!r){champ.value='';champ.placeholder='Référence non reconnue';return;}
  champ.value='';champ.placeholder='Référence : Jean 3:16';
  if(!r.ch)return bibChaps(r.slug);
  bibVersets(r.slug,r.ch,r.v1,r.v2);
}

/* Ce qui précède le curseur dans la zone : sert à savoir s'il faut une espace
   avant ce qu'on insère. */
function besoinEspace(z){
  try{
    if(!z)return false;
    const s=getSelection(); if(!s.rangeCount)return false;
    const r=s.getRangeAt(0).cloneRange(); r.setStart(z,0);
    const t=r.toString();
    return !!t&&!/\s$/.test(t);
  }catch(e){return false;}
}

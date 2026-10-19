/* ════════════════════════════════════════════════════════════════════
   LUMEN · FONCTIONNEMENT COMMUN : CONTRÔLE QUALITÉ
   Pages : Articles, Ressources.
   Emmanuel : « je veux que tu ajoutes un bouton de contrôle de qualité
   pour les ressources et articles ».

   Le contrôle part du ⋯ d'un article ou d'une ressource HTML. L'IA
   (tâche « controler » de /api/ia) relit la page entière : le fond, les
   citations de l'Écriture, la forme, le fonctionnement. Elle rend un
   constat, classé du plus grave au plus léger ; elle ne corrige rien,
   Emmanuel choisit ensuite ce qui se corrige.

   Pour que les citations se vérifient sur le texte exact, la page
   repère chaque référence biblique citée (« Jean 3:16 », « 1 Corinthiens
   13:4-7 ») et joint les versets correspondants des deux Bibles du site.

   Pendant que l'IA travaille, rien n'attend à l'écran : la carte de
   l'élément montre que le travail avance.

   Le dernier rapport de chaque élément est gardé dans le compte
   (art_qc ou res_qc) : rouvrir le contrôle le montre aussitôt, sans
   relancer l'IA.

   Emmanuel : « il faut surtout qu'elle puisse corriger l'artefact ».
   « Corriger » fait corriger par l'IA les points cochés du rapport, et
   la page corrigée s'enregistre aussitôt ; la version d'avant reste
   gardée pour y revenir.
   ════════════════════════════════════════════════════════════════════ */

const qcCol=espece=>db.collection('users/'+S.uid+'/'+(espece==='articles'?'art_qc':'res_qc'));
let QC_EN_COURS='';
/* l'élément que l'écran du contrôle montre en ce moment */
let QC_VU='';
let QC_ESPECE='';

const QC_GRAVITES=[
  {cle:'grave',nom:'Grave'},
  {cle:'a_revoir',nom:'À revoir'},
  {cle:'mineur',nom:'Mineur'}
];
const QC_DOMAINES={fond:'Fond',ecriture:'Écriture',forme:'Forme',fonctionnement:'Fonctionnement'};

/* ── LES RÉFÉRENCES BIBLIQUES DE LA PAGE ──
   Les noms de livres viennent de l'index de la Bible du site. Les noms
   longs passent avant les courts, pour que « 1 Jean 3:1 » ne soit pas lu
   « Jean 3:1 ». « Psaume » au singulier vaut « Psaumes ». */
let QC_LIVRES=null;
async function qcLivres(){
  if(QC_LIVRES)return QC_LIVRES;
  const r=await fetch('/bible-data/index.json');
  if(!r.ok)throw new Error('index');
  const idx=await r.json();
  const noms=[];
  (idx.livres||[]).forEach(l=>{
    noms.push({nom:l.nom,slug:l.slug,affiche:l.nom});
    if(l.slug==='psaumes')noms.push({nom:'Psaume',slug:l.slug,affiche:'Psaume'});
  });
  noms.sort((a,b)=>b.nom.length-a.nom.length);
  const blanc='[\\s\\u00a0\\u202f]+';
  const motif=noms.map(n=>n.nom.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/ /g,blanc)).join('|');
  QC_LIVRES={
    re:new RegExp('(?<![\\p{L}\\d])('+motif+')'+blanc+'(\\d{1,3})[:.](\\d{1,3})(?:[\\-\\u2010-\\u2013](\\d{1,3}))?','gu'),
    slug:nom=>{const k=nom.replace(/[\s\u00a0\u202f]+/g,' ');const n=noms.find(x=>x.nom===k);return n?n.slug:'';}
  };
  return QC_LIVRES;
}

function qcTexte(html){
  try{
    const d=new DOMParser().parseFromString(html,'text/html');
    return (d.documentElement&&d.documentElement.textContent)||'';
  }catch(_){return html;}
}

async function qcVersets(html){
  let L;
  try{L=await qcLivres();}catch(_){return [];}
  const texte=qcTexte(html), vus=new Map();
  L.re.lastIndex=0;
  let m;
  while((m=L.re.exec(texte))&&vus.size<300){
    const slug=L.slug(m[1]); if(!slug)continue;
    const ch=+m[2], v1=+m[3], v2=m[4]?Math.max(+m[4],v1):v1;
    if(v2-v1>40)continue;
    const nom=m[1].replace(/[\s\u00a0\u202f]+/g,' ');
    const ref=nom+' '+ch+':'+v1+(v2>v1?'-'+v2:'');
    if(!vus.has(ref))vus.set(ref,{ref,slug,ch,v1,v2});
  }
  const refs=[...vus.values()];
  if(!refs.length)return [];
  const livres=new Map();
  const charge=async(dossier,slug)=>{
    const k=dossier+slug;
    if(!livres.has(k))livres.set(k,fetch('/'+dossier+'/'+slug+'.json').then(r=>r.ok?r.json():null).catch(()=>null));
    return livres.get(k);
  };
  const lit=(livre,r)=>{
    const c=livre&&(livre.chapitres||[]).find(x=>x.n===r.ch);
    if(!c)return '';
    return (c.versets||[]).filter(v=>v.v>=r.v1&&v.v<=r.v2).map(v=>(r.v2>r.v1?v.v+' ':'')+String(v.t||'')).join(' ');
  };
  return Promise.all(refs.map(async r=>{
    const [c,s]=await Promise.all([charge('bible-data',r.slug),charge('bible-data-seraphin',r.slug)]);
    return {ref:r.ref,cherubin:lit(c,r),seraphin:lit(s,r)};
  }));
}

/* la marque (livre, diagramme, cours…) dit au serveur quelle skill a
   fait la page */
function qcMarque(a){try{return marqueDe(a)||'';}catch(_){return '';}}

/* ── L'ÉTAT SUR LA CARTE ──
   Pendant le travail de l'IA, aucune fenêtre n'attend à l'écran : un
   petit cercle de chargement tourne sur la carte de l'élément, puis la
   carte dit « Rapport prêt ». On continue à lire ou ranger pendant ce temps. */
const QC_ETATS=new Map();
function qcEtat(id,mot){
  if(mot)QC_ETATS.set(id,mot);else QC_ETATS.delete(id);
  qcPoseEtats();
}
let QC_POSE=0;
function qcPoseEtats(){
  document.querySelectorAll('.qc-etat').forEach(e=>{
    const c=e.closest('[data-rid2]');
    if(!c||!QC_ETATS.has(c.dataset.rid2))e.remove();
  });
  QC_ETATS.forEach((mot,id)=>{
    const c=document.querySelector('[data-rid2="'+CSS.escape(id)+'"]'); if(!c)return;
    const pied=c.querySelector('.ct-pied,.art-pied'); if(!pied)return;
    let e=pied.querySelector('.qc-etat');
    if(!e){e=document.createElement('span');e.className='qc-etat';pied.appendChild(e);}
    /* pendant le travail, le cercle de chargement plutôt qu'une phrase
       (Emmanuel : « le truc de chargement connu, le cercle ») ;
       « Rapport prêt » reste écrit */
    const vif=/cours/.test(mot);
    e.classList.toggle('vif',vif);
    e.textContent=vif?'':mot;
    if(vif)e.setAttribute('aria-label',mot);else e.removeAttribute('aria-label');
  });
}
/* la liste se redessine souvent : l'état revient sur la nouvelle carte */
new MutationObserver(()=>{
  if(!QC_ETATS.size||QC_POSE)return;
  QC_POSE=requestAnimationFrame(()=>{QC_POSE=0;qcPoseEtats();});
}).observe(document.documentElement,{childList:true,subtree:true});

/* ── L'ÉCRAN DU CONTRÔLE ──
   Un écran entier, comme une page : le titre de l'élément, le bilan, puis
   la liste des problèmes en rangées séparées par des filets. Une rangée
   se déplie pour montrer le passage en cause et la correction proposée ;
   la coche à droite dit si le point part à la correction. En bas, un seul
   bouton : « Corriger ». */
let QC_FILTRE='tout', QC_OUVERTS=new Set(), QC_RETENUS=new Set();

function qcOuvre(){$('m-qc').classList.add('on');document.documentElement.classList.add('qc-ouvert');}
function qcFerme(){$('m-qc').classList.remove('on');document.documentElement.classList.remove('qc-ouvert');}

function qcTete(a,r){
  QC_VU=a.id;
  $('qc-ferme').textContent=QC_ESPECE==='articles'?'← Les articles':'← Les ressources';
  $('qc-label').textContent='Contrôle qualité'+(r&&r.quand?'  ·  '+dateFr(r.quand):'');
  $('qc-titre').textContent=a.titre||'Sans titre';
  $('qc-outils').style.display=r?'':'none';
}

/* pendant le travail : le titre, un trait qui court, deux mots */
function qcAttente(a,mot){
  qcTete(a,null);
  $('qc-corps').innerHTML='<div class="qc-court" aria-hidden="true"></div><p class="qc-attente">'+esc(mot)+'</p>';
  $('qc-bas').style.display='none';
}

function qcMajCorrige(r){
  const n=QC_RETENUS.size, b=$('qc-corrige');
  b.textContent=n?('Corriger '+n+(n>1?' points':' point')):'Aucun point coché';
  b.disabled=!n||!!QC_EN_COURS;
  if(QC_EN_COURS===QC_VU&&QC_VU){b.textContent='Correction en cours…';b.disabled=true;}
  $('qc-bas').style.display=r&&r.points&&r.points.length&&!(r.points.length===((r.corrige&&r.corrige.faits)||[]).length)?'':'none';
}

function qcRend(a,r,espece){
  QC_ESPECE=espece;
  qcTete(a,r);
  $('qc-corrige').onclick=()=>qcCorrige(a,r,espece);
  /* les actions secondaires passent par le ⋯, comme partout sur le site */
  $('qc-outils').onclick=async()=>{
    const c=await lvChoix('Contrôle qualité',[
      {cle:'qc_copie',nom:'Copier le rapport',icone:'cite'},
      ...(r.avant?[{cle:'qc_avant',nom:'Revenir à la version d’avant',icone:'retour'}]:[])
    ]);
    if(c==='qc_copie')copiePresse(qcTexteRapport(a,r));
    else if(c==='qc_avant')qcRevient(a,r,espece);
  };
  if(QC_ETATS.get(a.id)==='Rapport prêt')qcEtat(a.id,'');

  const maj=a.maj||a.cree||'', c=r.corrige||null;
  const pts=Array.isArray(r.points)?r.points:[];
  const faits=new Set(c?c.faits||[]:[]), ecartes=new Set(r.ecartes||[]);
  const manques=new Map(((c&&c.manques)||[]).map(m=>[m.point,m.raison]));
  QC_RETENUS=new Set(pts.map((_,i)=>i).filter(i=>!faits.has(i)&&!ecartes.has(i)));

  let h='';
  if(c)h+='<p class="qc-etat-page">Corrigée le '+esc(dateFr(c.quand))+' : '+faits.size+(faits.size>1?' points corrigés':' point corrigé')+(manques.size?', '+manques.size+' laissé'+(manques.size>1?'s':''):'')+'.'+(c.maj!==maj?' La page a été modifiée depuis.':'')+'</p>';
  else if((r.maj||'')!==maj)h+='<p class="qc-etat-page">La page a été modifiée depuis ce contrôle.</p>';
  h+='<p class="qc-bilan">'+esc(r.bilan||'')+'</p>';

  if(!pts.length){h+='<p class="qc-rien">Aucun problème relevé.</p>';}
  else{
    const nb=k=>pts.filter(p=>p.gravite===k).length;
    if(QC_FILTRE!=='tout'&&!nb(QC_FILTRE))QC_FILTRE='tout';
    h+='<div class="qc-filtres" role="tablist">'
      +[{cle:'tout',nom:'Tout',n:pts.length},...QC_GRAVITES.map(g=>({cle:g.cle,nom:g.nom,n:nb(g.cle)}))].filter(f=>f.n)
        .map(f=>'<button type="button" role="tab" class="qc-f'+(QC_FILTRE===f.cle?' on':'')+'" data-qcf="'+f.cle+'" aria-selected="'+(QC_FILTRE===f.cle)+'">'+f.nom+'<span>'+f.n+'</span></button>').join('')
      +'</div><div class="qc-liste">';
    const ordre=QC_GRAVITES.map(g=>g.cle);
    pts.map((p,i)=>({p,i})).filter(x=>QC_FILTRE==='tout'||x.p.gravite===QC_FILTRE)
      .sort((x,y)=>(faits.has(x.i)-faits.has(y.i))||(ordre.indexOf(x.p.gravite)-ordre.indexOf(y.p.gravite))||(x.i-y.i))
      .forEach(({p,i})=>{
        const fait=faits.has(i), ouvert=QC_OUVERTS.has(i), g=QC_GRAVITES.find(x=>x.cle===p.gravite)||QC_GRAVITES[1];
        h+='<div class="qc-ligne g-'+p.gravite+(fait?' fait':'')+(ouvert?' ouvert':'')+(QC_RETENUS.has(i)?' retenu':'')+'" data-qc="'+i+'">'
          +'<button type="button" class="qc-tete" aria-expanded="'+ouvert+'">'
            +'<span class="qc-marque" aria-hidden="true"></span>'
            +'<span class="qc-txt"><span class="qc-ou">'+esc(g.nom)+'  ·  '+esc(QC_DOMAINES[p.domaine]||'')+(p.endroit?'  ·  '+esc(p.endroit):'')+'</span>'
            +'<span class="qc-constat">'+esc(p.constat||'')+'</span></span>'
          +'</button>'
          +(fait?'<span class="qc-fait">Corrigé</span>'
                :'<button type="button" class="qc-coche" aria-pressed="'+QC_RETENUS.has(i)+'" aria-label="À corriger" title="À corriger">✓</button>')
          +'<div class="qc-detail">'
            +(p.extrait?'<p class="qc-extrait">« '+esc(p.extrait)+' »</p>':'')
            +(p.correction?'<p class="qc-corr">→ '+esc(p.correction)+'</p>':'')
            +(manques.has(i)?'<p class="qc-laisse">Laissé à la dernière correction : '+esc(String(manques.get(i)).replace(/^./,x=>x.toLowerCase()))+'</p>':'')
          +'</div>'
          +'</div>';
      });
    h+='</div>';
  }
  const corps=$('qc-corps');
  corps.innerHTML=h;
  corps.querySelectorAll('[data-qcf]').forEach(b=>b.onclick=()=>{QC_FILTRE=b.dataset.qcf;qcRend(a,r,espece);});
  corps.querySelectorAll('.qc-ligne').forEach(l=>{
    const i=+l.dataset.qc;
    l.querySelector('.qc-tete').onclick=()=>{
      if(QC_OUVERTS.has(i))QC_OUVERTS.delete(i);else QC_OUVERTS.add(i);
      l.classList.toggle('ouvert',QC_OUVERTS.has(i));
      l.querySelector('.qc-tete').setAttribute('aria-expanded',QC_OUVERTS.has(i));
    };
    const k=l.querySelector('.qc-coche');
    if(k)k.onclick=()=>{
      if(QC_RETENUS.has(i))QC_RETENUS.delete(i);else QC_RETENUS.add(i);
      l.classList.toggle('retenu',QC_RETENUS.has(i));
      k.setAttribute('aria-pressed',QC_RETENUS.has(i));
      qcMajCorrige(r);
    };
  });
  qcMajCorrige(r);
}

/* le rapport en texte simple, pour le coller ailleurs (à Claude, avec le
   fichier, pour faire corriger la page) */
function qcTexteRapport(a,r){
  const l=['Contrôle qualité : '+(a.titre||'Sans titre')+(r.quand?' ('+dateFr(r.quand)+')':''),'',r.bilan||''];
  const pts=Array.isArray(r.points)?r.points:[];
  if(!pts.length)l.push('','Aucun problème relevé.');
  QC_GRAVITES.forEach(g=>{
    const p=pts.filter(x=>x.gravite===g.cle);
    if(!p.length)return;
    l.push('',g.nom.toUpperCase()+' ('+p.length+')');
    p.forEach((x,i)=>{
      l.push('',(i+1)+'. '+(QC_DOMAINES[x.domaine]||'')+(x.endroit?' · '+x.endroit:''));
      if(x.extrait)l.push('   « '+x.extrait+' »');
      l.push('   '+(x.constat||''));
      if(x.correction)l.push('   → '+x.correction);
    });
  });
  return l.join('\n');
}

/* ── LE CONTRÔLE ──
   Le ⋯ appelle controleQualite : un rapport déjà fait s'affiche ; sinon
   le contrôle part et la carte le dit. */
async function controleQualite(a,espece){
  if(!a)return;
  QC_ESPECE=espece;
  QC_FILTRE='tout'; QC_OUVERTS=new Set();
  if(QC_EN_COURS===a.id&&QC_ETATS.get(a.id)==='Contrôle en cours'){qcAttente(a,'Relecture en cours');qcOuvre();return;}
  let r=null;
  try{const d=await qcCol(espece).doc(a.id).get();if(d.exists)r=d.data();}catch(_){}
  if(r){qcRend(a,r,espece);qcOuvre();}
  else qcLance(a,espece);
}

/* la fin d'un travail : l'écran se met à jour s'il montre cet élément ;
   sinon la carte dit que le rapport est prêt */
function qcFini(a,r,espece){
  if(QC_VU===a.id&&$('m-qc').classList.contains('on')){qcEtat(a.id,'');qcRend(a,r,espece);}
  else qcEtat(a.id,'Rapport prêt');
}

async function qcLance(a,espece){
  if(QC_EN_COURS){
    if(QC_EN_COURS!==a.id)lvInfo('Un travail de l’IA est déjà en cours. Attendez qu’il se termine, puis relancez celui-ci.');
    return;
  }
  QC_EN_COURS=a.id;
  qcEtat(a.id,'Contrôle en cours');
  if(QC_VU===a.id&&$('m-qc').classList.contains('on')){qcAttente(a,'Relecture en cours');}
  try{
    await contenuDe(a);
    const html=typeof a.code==='string'?a.code:'';
    if(!html.trim())throw new Error('Cette page est vide : il n’y a rien à contrôler.');
    const versets=await qcVersets(html);
    const res=await lvIA('controler',{
      espece,
      titre:a.titre||'',
      marque:(typeof iaType==='function'?iaType(a):''),
      marqueCle:qcMarque(a),
      html,
      versets
    });
    const r={
      quand:new Date().toISOString(),
      maj:a.maj||a.cree||'',
      bilan:String(res.bilan||'').trim(),
      points:(Array.isArray(res.points)?res.points:[]).map(p=>({
        gravite:['grave','a_revoir','mineur'].indexOf(p.gravite)>=0?p.gravite:'a_revoir',
        domaine:QC_DOMAINES[p.domaine]?p.domaine:'fond',
        endroit:String(p.endroit||''),extrait:String(p.extrait||''),
        constat:String(p.constat||''),correction:String(p.correction||'')
      }))
    };
    try{await qcCol(espece).doc(a.id).set(r);}catch(e){console.warn('qc enregistrement',e);}
    QC_EN_COURS='';
    qcFini(a,r,espece);
  }catch(e){
    console.warn('qc',e);
    QC_EN_COURS='';
    qcEtat(a.id,'');
    if(QC_VU===a.id)qcFerme();
    lvInfo(e&&e.message?e.message:'Le contrôle qualité a échoué.');
  }finally{
    QC_EN_COURS='';
  }
}

/* ── CORRIGER ──
   L'IA rend des remplacements (un passage exact de la page, ce qui le
   remplace). La page applique ceux dont le passage s'y trouve une seule
   fois, et dit ce qui n'a pas pu l'être. Avant d'écrire, la version
   d'avant est gardée (art_avant ou res_avant) : « Version d'avant » la
   remet. La correction s'enregistre aussitôt, sans validation, comme le
   rangement par l'IA. */
const qcAvantCol=espece=>db.collection('users/'+S.uid+'/'+(espece==='articles'?'art_avant':'res_avant'));

function qcApplique(code,mods){
  const faits=new Set(), rates=new Map();
  mods.forEach(m=>{
    const ancien=String(m.ancien||''), nouveau=String(m.nouveau||'');
    const k=+m.point-1;
    if(!ancien||ancien===nouveau)return;
    const i=code.indexOf(ancien);
    if(i<0){rates.set(k,'le passage à remplacer n’a pas été retrouvé dans la page.');return;}
    if(code.indexOf(ancien,i+1)>=0){rates.set(k,'le passage à remplacer revient plusieurs fois dans la page.');return;}
    code=code.slice(0,i)+nouveau+code.slice(i+ancien.length);
    faits.add(k);
  });
  return {code,faits,rates};
}

async function qcEcrit(a,code){
  a.maj=new Date().toISOString();
  a.code=code;
  const champs={maj:a.maj,codeTaille:octets(code)};
  a.codeTaille=champs.codeTaille;
  if(typeof extraitDuCode==='function'){a.extrait=extraitDuCode(code);champs.extrait=a.extrait;}
  if(typeof devineMarque==='function'){a.marqueDevinee=devineMarque(a)||'';champs.marqueDevinee=a.marqueDevinee;}
  await ecritCode(ccol(),a.id,code,lot=>lot.update(acol().doc(a.id),champs));
  CODES.set(a.id,code);
  try{rendLister();}catch(_){}
}

async function qcCorrige(a,r,espece){
  if(QC_EN_COURS)return;
  const choisis=[...QC_RETENUS].sort((x,y)=>x-y);
  if(!choisis.length)return;
  QC_EN_COURS=a.id;
  qcEtat(a.id,'Correction en cours');
  qcMajCorrige(r);
  try{
    await contenuDe(a);
    const html=typeof a.code==='string'?a.code:'';
    if(!html.trim())throw new Error('Cette page est vide : il n’y a rien à corriger.');
    const versets=await qcVersets(html);
    const res=await lvIA('corriger',{
      espece, titre:a.titre||'', html, versets, marqueCle:qcMarque(a),
      points:choisis.map(i=>r.points[i])
    });
    /* les numéros de l'IA désignent les points envoyés : on les ramène à
       leur place dans le rapport */
    const vers=n=>choisis[n-1];
    const mods=(Array.isArray(res.modifications)?res.modifications:[]).filter(m=>vers(+m.point)!==undefined)
      .map(m=>({point:vers(+m.point)+1,ancien:m.ancien,nouveau:m.nouveau}));
    const {code,faits,rates}=qcApplique(html,mods);
    const manques=[];
    (Array.isArray(res.laisses)?res.laisses:[]).forEach(l=>{const k=vers(+l.point);if(k!==undefined&&!faits.has(k))manques.push({point:k,raison:String(l.raison||'')});});
    rates.forEach((raison,k)=>{if(!faits.has(k)&&!manques.some(m=>m.point===k))manques.push({point:k,raison});});
    choisis.forEach(k=>{if(!faits.has(k)&&!manques.some(m=>m.point===k))manques.push({point:k,raison:'l’IA n’a proposé aucun changement pour ce point.'});});
    if(faits.size){
      await ecritCode(qcAvantCol(espece),a.id,html);
      await qcEcrit(a,code);
    }
    const avant=r.corrige?r.corrige.faits||[]:[];
    r.corrige={quand:new Date().toISOString(),maj:a.maj||a.cree||'',faits:[...new Set([...avant,...faits])],manques,resume:String(res.resume||'').trim()};
    if(faits.size)r.avant=true;
    /* les points décochés le restent au prochain affichage */
    r.ecartes=r.points.map((_,i)=>i).filter(i=>!QC_RETENUS.has(i)&&!r.corrige.faits.includes(i));
    try{await qcCol(espece).doc(a.id).set(r);}catch(e){console.warn('qc enregistrement',e);}
    QC_EN_COURS='';
    qcFini(a,r,espece);
  }catch(e){
    console.warn('qc correction',e);
    QC_EN_COURS='';
    qcEtat(a.id,'');
    if(QC_VU===a.id&&$('m-qc').classList.contains('on'))qcRend(a,r,espece);
    lvInfo(e&&e.message?e.message:'La correction a échoué.');
  }finally{
    QC_EN_COURS='';
  }
}

async function qcRevient(a,r,espece){
  if(QC_EN_COURS)return;
  if(!await lvConfirm('Remettre la page telle qu’elle était avant la correction par l’IA ?'))return;
  try{
    const ancien=await litCode(qcAvantCol(espece),a.id);
    if(ancien===null)throw new Error('La version d’avant n’a pas été retrouvée.');
    await qcEcrit(a,ancien);
    await effaceCode(qcAvantCol(espece),a.id).catch(()=>{});
    delete r.avant; delete r.corrige;
    r.maj=a.maj;
    try{await qcCol(espece).doc(a.id).set(r);}catch(_){}
    qcRend(a,r,espece);
  }catch(e){
    console.warn('qc retour',e);
    lvInfo(e&&e.message?e.message:'Le retour à la version d’avant a échoué. Vérifiez la connexion, puis réessayez.');
  }
}

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

   Le dernier rapport de chaque élément est gardé dans le compte
   (art_qc ou res_qc) : rouvrir le contrôle le montre aussitôt, sans
   relancer l'IA. « Refaire le contrôle » le remplace.

   Emmanuel : « il faut surtout qu'elle puisse corriger l'artefact ».
   « Corriger » fait corriger par l'IA les points cochés du rapport, et
   la page corrigée s'enregistre aussitôt ; la version d'avant reste
   gardée pour y revenir.
   ════════════════════════════════════════════════════════════════════ */

const qcCol=espece=>db.collection('users/'+S.uid+'/'+(espece==='articles'?'art_qc':'res_qc'));
let QC_EN_COURS='';
/* l'élément que la fenêtre montre en ce moment */
let QC_VU='';

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

/* ── LA FENÊTRE ── */
function qcOuvre(){$('m-qc').classList.add('on');}
function qcFerme(){$('m-qc').classList.remove('on');}
function qcBoutons(rapport){
  $('qc-outils').style.display=rapport?'':'none';
  $('qc-refait').style.display=rapport?'':'none';
  $('qc-corrige').style.display=rapport&&rapport.points&&rapport.points.length?'':'none';
}

function qcAttente(a,mot){
  QC_VU=a.id;
  $('qc-sous').textContent=a.titre||'Sans titre';
  $('qc-corps').innerHTML='<p class="qc-attente">'+esc(mot)+'</p>';
  qcBoutons(null);
}

/* ── LES POINTS RETENUS ──
   Chaque problème se coche ou se décoche d'un toucher : seuls les points
   cochés partent à la correction. Tous sont cochés d'emblée, sauf ceux
   déjà corrigés. */
let QC_RETENUS=new Set();
function qcMajCorrige(){
  const n=QC_RETENUS.size;
  $('qc-corrige').textContent=n?'Corriger ('+n+')':'Corriger';
  $('qc-corrige').disabled=!n;
}

function qcRend(a,r,espece){
  QC_VU=a.id;
  $('qc-refait').onclick=()=>qcLance(a,espece);
  $('qc-corrige').onclick=()=>qcCorrige(a,r,espece);
  $('qc-copie').textContent='Copier le rapport';
  $('qc-copie').onclick=()=>{
    copiePresse(qcTexteRapport(a,r));
    $('qc-copie').textContent='Copié';
    setTimeout(()=>{$('qc-copie').textContent='Copier le rapport';},1600);
  };
  $('qc-retour').style.display=r.avant?'':'none';
  $('qc-retour').onclick=()=>qcRevient(a,r,espece);
  const date=dateFr(r.quand);
  const maj=a.maj||a.cree||'';
  const c=r.corrige||null;
  $('qc-sous').textContent=(a.titre||'Sans titre')+(date?'  ·  '+date:'');
  const pts=Array.isArray(r.points)?r.points:[];
  const faits=new Set(c?c.faits||[]:[]);
  const ecartes=new Set(r.ecartes||[]);
  QC_RETENUS=new Set(pts.map((_,i)=>i).filter(i=>!faits.has(i)&&!ecartes.has(i)));
  let h='';
  if(c){
    h+='<div class="qc-avis"><p>Corrigée le '+esc(dateFr(c.quand))+' : '+faits.size+(faits.size>1?' points corrigés.':' point corrigé.')
      +(c.resume?' '+esc(c.resume):'')+'</p>';
    (c.manques||[]).forEach(m=>{
      const p=pts[m.point]||{};
      h+='<p class="qc-manque">Non corrigé, '+esc((p.endroit||'un point').replace(/^./,x=>x.toLowerCase()))+' : '+esc(m.raison.replace(/^./,x=>x.toLowerCase()))+'</p>';
    });
    if(c.maj!==maj)h+='<p>La page a encore été modifiée depuis.</p>';
    h+='</div>';
  }else if((r.maj||'')!==maj)h+='<p class="qc-avis">La page a été modifiée depuis ce contrôle.</p>';
  h+='<p class="qc-bilan">'+esc(r.bilan||'')+'</p>';
  if(!pts.length)h+='<p class="qc-rien">Aucun problème relevé.</p>';
  else h+='<p class="qc-aide">Les points cochés partent à la correction ; touchez un point pour le cocher ou le décocher.</p>';
  QC_GRAVITES.forEach(g=>{
    const l=pts.map((p,i)=>({p,i})).filter(x=>x.p.gravite===g.cle);
    if(!l.length)return;
    h+='<section class="qc-groupe qc-'+g.cle+'"><h3 class="qc-g">'+g.nom+'<span>'+l.length+'</span></h3>';
    l.forEach(({p,i})=>{
      const fait=faits.has(i);
      h+='<div class="qc-point'+(fait?' fait':'')+(QC_RETENUS.has(i)?' on':'')+'" data-qc="'+i+'" role="checkbox" tabindex="0" aria-checked="'+QC_RETENUS.has(i)+'">'
        +'<b class="qc-coche" aria-hidden="true"></b>'
        +'<div class="qc-ou">'+esc(QC_DOMAINES[p.domaine]||'')+(p.endroit?'  ·  '+esc(p.endroit):'')+(fait?'  ·  corrigé':'')+'</div>'
        +(p.extrait?'<div class="qc-extrait">« '+esc(p.extrait)+' »</div>':'')
        +'<div class="qc-constat">'+esc(p.constat||'')+'</div>'
        +(p.correction?'<div class="qc-corr">→ '+esc(p.correction)+'</div>':'')
        +'</div>';
    });
    h+='</section>';
  });
  const corps=$('qc-corps');
  corps.innerHTML=h;
  corps.scrollTop=0;
  corps.querySelectorAll('[data-qc]').forEach(d=>{
    const bascule=()=>{
      const i=+d.getAttribute('data-qc');
      if(QC_RETENUS.has(i))QC_RETENUS.delete(i);else QC_RETENUS.add(i);
      d.classList.toggle('on',QC_RETENUS.has(i));
      d.setAttribute('aria-checked',QC_RETENUS.has(i));
      qcMajCorrige();
    };
    d.onclick=bascule;
    d.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();bascule();}};
  });
  qcBoutons(r);
  qcMajCorrige();
}

/* ── CORRIGER ──
   L'IA rend des remplacements (un passage exact de la page, ce qui le
   remplace). La page applique ceux dont le passage s'y trouve une seule
   fois, et dit ce qui n'a pas pu l'être. Avant d'écrire, la version
   d'avant est gardée (art_avant ou res_avant) : « Revenir à la version
   d'avant » la remet. La correction s'enregistre aussitôt, sans
   validation, comme le rangement par l'IA. */
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
  const dit=t=>{if(QC_VU===a.id)$('qc-corps').innerHTML='<p class="qc-attente">'+esc(t)+'</p>';};
  qcAttente(a,'Lecture de la page…');
  try{
    await contenuDe(a);
    const html=typeof a.code==='string'?a.code:'';
    if(!html.trim())throw new Error('Cette page est vide : il n’y a rien à corriger.');
    const versets=await qcVersets(html);
    dit('L’IA corrige '+choisis.length+(choisis.length>1?' points':' point')+'. Cela peut prendre quelques minutes ; vous pouvez fermer cette fenêtre, la correction continue.');
    const res=await lvIA('corriger',{
      espece, titre:a.titre||'', html, versets, marqueCle:qcMarque(a),
      points:choisis.map(i=>r.points[i])
    },n=>dit('L’IA écrit ses corrections… '+Math.round(n/100)/10+' k signes reçus.'));
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
      dit('Enregistrement de la page corrigée…');
      await ecritCode(qcAvantCol(espece),a.id,html);
      await qcEcrit(a,code);
    }
    const avant=r.corrige?r.corrige.faits||[]:[];
    r.corrige={quand:new Date().toISOString(),maj:a.maj||a.cree||'',faits:[...new Set([...avant,...faits])],manques,resume:String(res.resume||'').trim()};
    if(faits.size)r.avant=true;
    /* les points décochés le restent au prochain affichage */
    r.ecartes=r.points.map((_,i)=>i).filter(i=>!QC_RETENUS.has(i)&&!r.corrige.faits.includes(i));
    try{await qcCol(espece).doc(a.id).set(r);}catch(e){console.warn('qc enregistrement',e);}
    qcRend(a,r,espece);
    qcOuvre();
  }catch(e){
    console.warn('qc correction',e);
    if(QC_VU===a.id)qcRend(a,r,espece);
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
    lvInfo('La version d’avant la correction est revenue.');
  }catch(e){
    console.warn('qc retour',e);
    lvInfo(e&&e.message?e.message:'Le retour à la version d’avant a échoué. Vérifiez la connexion, puis réessayez.');
  }
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
   le contrôle part aussitôt. */
async function controleQualite(a,espece){
  if(!a)return;
  if(QC_EN_COURS===a.id){qcOuvre();return;}
  qcAttente(a,'Lecture du dernier contrôle…');
  qcOuvre();
  let r=null;
  try{const d=await qcCol(espece).doc(a.id).get();if(d.exists)r=d.data();}catch(_){}
  if(QC_VU!==a.id)return;
  if(r)qcRend(a,r,espece);
  else qcLance(a,espece);
}

async function qcLance(a,espece){
  if(QC_EN_COURS){
    if(QC_EN_COURS!==a.id)lvInfo('Un contrôle est déjà en cours. Attendez qu’il se termine, puis relancez celui-ci.');
    return;
  }
  QC_EN_COURS=a.id;
  const dit=t=>{if(QC_VU===a.id)$('qc-corps').innerHTML='<p class="qc-attente">'+esc(t)+'</p>';};
  qcAttente(a,'Lecture de la page…');
  qcOuvre();
  try{
    await contenuDe(a);
    const html=typeof a.code==='string'?a.code:'';
    if(!html.trim())throw new Error('Cette page est vide : il n’y a rien à contrôler.');
    dit('Recherche des versets cités dans les deux Bibles du site…');
    const versets=await qcVersets(html);
    dit('L’IA relit la page'+(versets.length?' et vérifie '+versets.length+(versets.length>1?' références bibliques':' référence biblique'):'')+'. Cela peut prendre quelques minutes ; vous pouvez fermer cette fenêtre, le contrôle continue.');
    const res=await lvIA('controler',{
      espece,
      titre:a.titre||'',
      marque:(typeof iaType==='function'?iaType(a):''),
      marqueCle:qcMarque(a),
      html,
      versets
    },n=>dit('L’IA écrit son rapport… '+Math.round(n/100)/10+' k signes reçus.'));
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
    qcRend(a,r,espece);
    qcOuvre();
  }catch(e){
    console.warn('qc',e);
    if(QC_VU===a.id)qcFerme();
    lvInfo(e&&e.message?e.message:'Le contrôle qualité a échoué.');
  }finally{
    QC_EN_COURS='';
  }
}

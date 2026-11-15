/* ════════════════════════════════════════════════════════════════════
   LE COFFRE R2 DANS RESSOURCES ET ARTICLES
   Trois travaux, lancés une fois la liste et le rangement lus :
   · les arrivées : ce que Claude a déposé par le robot d'envoi
     (.github/workflows/coffre.yml) attend dans le coffre, avec une liste
     « à ranger » ; la page en fait des fiches, puisque seule la session
     d'Emmanuel peut écrire dans Firestore ;
   · l'index : la liste des éléments (identifiant, titre, rangement),
     écrite dans le coffre pour que le robot retrouve une page quand
     Claude la demande par son titre ;
   · le déménagement : les contenus encore rangés dans Firestore passent
     dans le coffre, sont vérifiés, puis libèrent la place sur l'accord
     d'Emmanuel (bandeau en tête de la liste).
   La page fournit S, acol(), ccol(), mcol(), saveRubs(), rendLister().
   ════════════════════════════════════════════════════════════════════ */
const LV_COFFRE={
  ressources:{fiches:'ressources',code:'res_code',avant:'res_avant',medias:'res_medias',qc:'res_qc',mot:'ressource'},
  articles:{fiches:'art_pages',code:'art_code',avant:'art_avant',medias:'art_medias',qc:'art_qc',mot:'article'}
};
let LV_COFFRE_FAIT=false;
function lvCoffreDemarre(espece){
  if(LV_COFFRE_FAIT||!S.uid||!S.auteur)return;
  LV_COFFRE_FAIT=true;
  const E=LV_COFFRE[espece];
  (async()=>{
    /* un coffre injoignable se dit en clair dans le bandeau : sans cela,
       une variable secrète absente de Netlify passerait inaperçue */
    try{
      const e=await lvR2Api('etat',{});
      if(!e.joignable){
        const manque=Object.keys(e.secrets||{}).filter(k=>!e.secrets[k]);
        lvBandeauDit(manque.length?'Le coffre R2 est injoignable : le serveur du site ne lit pas '+manque.join(', ')+' dans les variables de Netlify.':'Le coffre R2 ne répond pas ('+String(e.message||'raison inconnue').slice(0,160)+').');
        return;
      }
    }catch(err){ lvBandeauDit('Le coffre R2 ne répond pas. Rechargez la page plus tard.'); console.warn('coffre',err); return; }
    try{ await lvArrivees(espece,E); }catch(e){ console.warn('arrivées',e); }
    try{ await lvIndexEcrit(espece); }catch(e){ console.warn('index',e); }
    try{ await lvDemenagementEtat(espece,E); }catch(e){ console.warn('déménagement',e); }
  })();
}
const lvCol=n=>firebase.firestore().collection('users/'+S.uid+'/'+n);
const lvMaintenant=()=>new Date().toISOString();

/* ── LE RANGEMENT PAR SON CHEMIN ──
   Une arrivée dit où elle se range par des noms (« Bible › Genèse ») ;
   les rubriques qui manquent sont créées, cinq niveaux au plus. */
function lvRubParChemin(chemin){
  let parent='';
  const noms=(Array.isArray(chemin)?chemin:[]).map(x=>String(x||'').trim()).filter(Boolean).slice(0,5);
  let cree=false;
  noms.forEach((nom,k)=>{
    let r=S.rubs.find(x=>(x.parent||'')===parent&&String(x.nom).toLowerCase()===nom.toLowerCase());
    if(!r){r={id:'r'+Date.now()+k+Math.floor(Math.random()*1000),nom,parent};S.rubs.push(r);cree=true;}
    parent=r.id;
  });
  return {rub:parent,cree};
}
function lvCheminDe(id){
  const b=[];let r=S.rubs.find(x=>x.id===id),g=0;
  while(r&&g++<6){b.unshift(r.nom);r=r.parent?S.rubs.find(x=>x.id===r.parent):null;}
  return b;
}

/* ── LES ARRIVÉES ── */
async function lvArrivees(espece,E){
  const listes=(await lvR2Liste('a-ranger/'+espece+'/')).filter(f=>/\.json$/.test(f.cle)).sort((a,b)=>a.cle.localeCompare(b.cle));
  let change=false, rubsChangees=false;
  for(const l of listes){
    let m;
    try{ m=JSON.parse(await lvR2Texte(l.cle)); }catch(e){ console.warn('liste à ranger illisible',l.cle,e); continue; }
    const entrees=Array.isArray(m.entrees)?m.entrees:[];
    const restent=[];
    for(let i=0;i<entrees.length;i++){
      try{ const r=await lvArrivee(espece,E,entrees[i]); if(r.rubs)rubsChangees=true; change=true; }
      catch(e){ console.warn('arrivée',entrees[i]&&entrees[i].fichier,e); restent.push(entrees[i]); }
    }
    if(restent.length)await lvR2Ecrit(l.cle,JSON.stringify(Object.assign({},m,{entrees:restent}),null,1));
    else await lvR2Efface([l.cle]);
    const faits=entrees.filter(x=>restent.indexOf(x)<0).map(x=>x.fichier).filter(Boolean);
    if(faits.length)await lvR2Efface(faits).catch(e=>console.warn('arrivées à effacer',e));
  }
  if(rubsChangees)saveRubs();
  if(change){
    const n=listes.length;
    try{ rendLister(); }catch(_){}
    if(n)lvInfo('De nouveaux éléments déposés par Claude ont été rangés.');
  }
}
async function lvArrivee(espece,E,x){
  const type=['diagramme','image','pdf'].includes(x.type)?x.type:'diagramme';
  const quand=lvMaintenant();
  const src=String(x.fichier||''); if(!src)throw new Error('fichier manquant');
  const ancienne=x.remplace?(S.liste.concat(S.jetees||[]).find(a=>a.id===x.remplace)||null):null;
  if(x.remplace&&!ancienne)throw new Error('élément à remplacer introuvable : '+x.remplace);
  let html='';
  if(type==='diagramme')html=await lvR2Texte(src);
  /* sans titre donné, une page prend celui qu'elle porte */
  if(!x.titre&&!ancienne&&html&&typeof lvIaTitreHtml==='function')x.titre=lvIaTitreHtml(html)||'';
  const id=ancienne?ancienne.id:('s'+Date.now()+Math.floor(Math.random()*1000));
  let rub=ancienne?ancienne.rub||'':'', rubs=false;
  if(Array.isArray(x.rubrique)&&x.rubrique.length){const r=lvRubParChemin(x.rubrique);rub=r.rub;rubs=r.cree;}
  const champs={maj:quand};
  if(x.titre)champs.titre=String(x.titre);
  if(x.marque!==undefined&&espece==='ressources'){champs.marque=String(x.marque||'');champs.marqueIA=false;}
  if(Array.isArray(x.rubrique)&&x.rubrique.length)champs.rub=rub;
  if(type==='diagramme'){
    const colC=lvCol(E.code);
    if(ancienne){
      /* la version d'avant est gardée, comme pour une correction faite sur
         le site : « Revenir à la version d'avant » la remet */
      await lvGardeAvant(E,id);
    }
    const v=lvR2Gen(), cle=E.code+'/'+id+'/'+v+'.html';
    await lvR2Copie(src,cle);
    let vieux=null; try{const d=await colC.doc(id).get();if(d.exists)vieux=d.data()||null;}catch(_){}
    champs.codeTaille=lvR2Octets(html);
    if(espece==='articles'&&typeof lvIaEnBref==='function')champs.extrait=lvIaEnBref(html);
    const lot=firebase.firestore().batch();
    lot.set(colC.doc(id),{r2:cle,taille:champs.codeTaille,v});
    if(ancienne)lot.update(lvCol(E.fiches).doc(id),champs);
    else lot.set(lvCol(E.fiches).doc(id),Object.assign({titre:'Sans titre',type:'diagramme',desc:'',rub,media:'',mime:'',taille:0,nom:'',vign:'',url:'',cree:quand,marque:'',marqueIA:false,marqueDevinee:''},champs));
    await lot.commit();
    if(vieux){
      if(vieux.r2&&vieux.r2!==cle)await lvR2Efface(vieux.r2).catch(()=>{});
      if(vieux.n)await lvContenuTranchesEfface(colC,id,vieux);
    }
    if(ancienne)await lvMarqueAvant(E,id,quand);
    if(typeof CODES!=='undefined')CODES.delete(id);
    const a=S.liste.find(y=>y.id===id); if(a)delete a.code;
  }else{
    const colM=lvCol(E.medias);
    const mid='m'+Date.now()+Math.floor(Math.random()*1000);
    const nom=String(x.nom||src.split('/').pop()||'fichier');
    const cle=E.medias+'/'+mid+'/'+lvR2Nom(nom);
    await lvR2Copie(src,cle);
    await colM.doc(mid).set({r2:cle,mime:x.mime||'application/octet-stream',taille:Number(x.taille)||0,nom,complet:true,cree:quand});
    Object.assign(champs,{type,media:mid,mime:x.mime||'',taille:Number(x.taille)||0,nom});
    if(ancienne){
      await lvCol(E.fiches).doc(id).update(champs);
      if(ancienne.media&&ancienne.media!==mid)await lvMediaEfface(colM,ancienne.media).catch(()=>{});
    }else{
      await lvCol(E.fiches).doc(id).set(Object.assign({titre:nom.replace(/\.[^.]+$/,''),desc:'',rub,vign:'',url:'',cree:quand,marque:type==='image'?'image':'',marqueIA:false,marqueDevinee:'',codeTaille:0},champs));
    }
  }
  return {id,rubs};
}
/* la version actuelle devient la copie d'avant (la précédente copie
   d'avant s'efface) */
async function lvGardeAvant(E,id){
  const colC=lvCol(E.code), colA=lvCol(E.avant);
  const d=await colC.doc(id).get(); if(!d.exists)return;
  const m=d.data()||{};
  let ancienne=null; try{const a=await colA.doc(id).get();if(a.exists)ancienne=a.data()||null;}catch(_){}
  const v=lvR2Gen(), cle=E.avant+'/'+id+'/'+v+'.html';
  let taille=m.taille||0;
  if(m.r2)await lvR2Copie(m.r2,cle);
  else{ const t=await lvContenuLit(colC,id); if(t===null)return; taille=lvR2Octets(t); await lvR2Envoie(cle,t,'text/html;charset=utf-8'); }
  await colA.doc(id).set({r2:cle,taille,v});
  if(ancienne){
    if(ancienne.r2)await lvR2Efface(ancienne.r2).catch(()=>{});
    if(ancienne.n)await lvContenuTranchesEfface(colA,id,ancienne);
  }
}
/* le contrôle qualité de l'élément sait qu'une version d'avant existe :
   son ⋯ propose d'y revenir */
async function lvMarqueAvant(E,id,quand){
  const ref=lvCol(E.qc).doc(id);
  const d=await ref.get();
  if(d.exists)await ref.set({avant:true},{merge:true});
  else await ref.set({quand,maj:quand,points:[],avant:true,bilan:'Nouvelle version déposée par Claude le '+new Date(quand).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})+'. La version d’avant est gardée : le ⋯ propose d’y revenir.'});
}

/* ── L'INDEX POUR LE ROBOT ── */
async function lvIndexEcrit(espece){
  const elements=S.liste.map(a=>({id:a.id,titre:a.titre||'',chemin:lvCheminDe(a.rub),type:a.type||'diagramme',marque:a.marque||'',media:a.media||'',maj:a.maj||a.cree||''}))
    .sort((a,b)=>a.id.localeCompare(b.id));
  const texte=JSON.stringify({espece,elements},null,1);
  const k='lv-coffre-index-'+espece;
  try{ if(localStorage.getItem(k)===texte)return; }catch(_){}
  await lvR2Ecrit('index/'+espece+'.json',texte);
  try{ localStorage.setItem(k,texte); }catch(_){}
}
let LV_INDEX_MIN=0;
/* après un enregistrement, l'index se réécrit quelques secondes plus tard */
function lvIndexPlus(espece){
  clearTimeout(LV_INDEX_MIN);
  LV_INDEX_MIN=setTimeout(()=>lvIndexEcrit(espece).catch(e=>console.warn('index',e)),4000);
}

/* ── LE DÉMÉNAGEMENT ──
   Un contenu à déménager est une fiche sans r2 (contenu ou tranches dans
   Firestore). Il part dans le coffre, est relu et comparé, puis la fiche
   reçoit r2 et « verifie » en gardant l'original. Libérer la place
   retire ensuite les originaux des fiches vérifiées. */
async function lvDemenagementInventaire(E){
  const out={aDeplacer:[],aLiberer:[]};
  for(const n of [E.code,E.avant,E.medias]){
    const sn=await lvCol(n).get();
    sn.forEach(d=>{
      const m=d.data()||{};
      const ancien=typeof m.code==='string'||!!m.n;
      if(!m.r2&&ancien)out.aDeplacer.push({col:n,id:d.id,m});
      else if(m.r2&&m.verifie&&ancien)out.aLiberer.push({col:n,id:d.id,m});
    });
  }
  return out;
}
function lvBandeau(){ return document.getElementById('coffre-bandeau'); }
function lvBandeauDit(html,bouton,action){
  const b=lvBandeau(); if(!b)return;
  if(!html){b.hidden=true;b.innerHTML='';return;}
  b.hidden=false;
  b.innerHTML='<p>'+html+'</p>'+(bouton?'<button type="button" class="res-rouvrir">'+bouton+'</button>':'');
  const k=b.querySelector('button'); if(k)k.onclick=action;
}
const lvPluriel=(n,un,plus)=>n+' '+(n>1?plus:un);
async function lvDemenagementEtat(espece,E){
  const inv=await lvDemenagementInventaire(E);
  if(inv.aDeplacer.length){
    const n=inv.aDeplacer.length, pl=n>1;
    lvBandeauDit(n+(pl?' contenus sont encore rangés':' contenu est encore rangé')+' dans Firestore. Le déménagement '+(pl?'les copie':'le copie')+' dans le coffre R2 et vérifie chaque copie ; '+(pl?'les originaux restent':'l’original reste')+' en place.',
      'Déménager',()=>lvDemenage(espece,E));
  }else if(inv.aLiberer.length){
    lvBandeauDit('Tout est dans le coffre R2, et chaque copie a été vérifiée. Les originaux occupent encore '+lvPoidsDe(inv.aLiberer)+' dans Firestore.',
      'Libérer la place',()=>lvLibere(espece,E));
  }else lvBandeauDit('');
}
const lvPoidsDe=l=>{const o=l.reduce((s,x)=>s+(Number(x.m.taille)||(typeof x.m.code==='string'?lvR2Octets(x.m.code):0)),0);return o<1048576?Math.max(1,Math.round(o/1024))+' Ko':(o/1048576).toFixed(1).replace('.',',')+' Mo';};
async function lvSha(buf){ return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',buf))).map(x=>x.toString(16).padStart(2,'0')).join(''); }
async function lvDemenage(espece,E){
  const inv=await lvDemenagementInventaire(E);
  const l=inv.aDeplacer; let faits=0, rates=0;
  const roue='<span class="lv-roue petite" role="status" aria-label="Déménagement en cours"></span> ';
  for(const x of l){
    lvBandeauDit(roue+'Déménagement : '+(faits+rates+1)+' sur '+l.length+'…');
    try{
      const col=lvCol(x.col);
      const v=lvR2Gen();
      if(x.col===E.medias){
        /* un fichier joint : ses tranches en base64 redeviennent le fichier */
        const url=await lvMediaAdresse(col,x.id);
        const blob=await (await fetch(url)).blob();
        const mime=x.m.mime||blob.type||'application/octet-stream';
        const ext=(mime.split('/')[1]||'bin').replace(/[^a-z0-9]/g,'').slice(0,5);
        const cle=x.col+'/'+x.id+'/fichier.'+ext;
        await lvR2Envoie(cle,blob,mime);
        const lu=await fetch(lvR2Adresse(cle),{credentials:'same-origin',cache:'no-store'});
        if(!lu.ok)throw new Error('relecture '+lu.status);
        if(await lvSha(await lu.arrayBuffer())!==await lvSha(await blob.arrayBuffer()))throw new Error('copie différente');
        await col.doc(x.id).set({r2:cle,verifie:true,taille:blob.size},{merge:true});
      }else{
        const t=await lvContenuLit(col,x.id);
        if(t===null)throw new Error('contenu introuvable');
        const cle=x.col+'/'+x.id+'/'+v+'.html';
        await lvR2Envoie(cle,t,'text/html;charset=utf-8');
        const lu=await fetch(lvR2Adresse(cle),{credentials:'same-origin',cache:'no-store'});
        if(!lu.ok||(await lu.text())!==t)throw new Error('copie différente');
        /* l'original reste dans la fiche (code ou tranches) jusqu'à
           « Libérer la place » ; r2 passe devant à la lecture */
        await col.doc(x.id).set({r2:cle,v,verifie:true,taille:lvR2Octets(t)},{merge:true});
      }
      faits++;
    }catch(e){ console.warn('déménagement',x.col,x.id,e); rates++; }
  }
  if(typeof CODES!=='undefined')CODES.clear();
  if(rates)lvInfo(lvPluriel(rates,'contenu n’a','contenus n’ont')+' pas pu être déménagé'+(rates>1?'s':'')+'. Ils restent dans Firestore ; relancez le déménagement plus tard.');
  await lvDemenagementEtat(espece,E);
}
async function lvLibere(espece,E){
  const inv=await lvDemenagementInventaire(E);
  const l=inv.aLiberer;
  if(!l.length)return lvDemenagementEtat(espece,E);
  if(!await lvConfirm('Retirer de Firestore les originaux de '+lvPluriel(l.length,'contenu','contenus')+' ? Leur copie vérifiée reste dans le coffre R2.'))return;
  const FV=firebase.firestore.FieldValue;
  let n=0;
  for(const x of l){
    lvBandeauDit('<span class="lv-roue petite" role="status" aria-label="Libération en cours"></span> Libération : '+(++n)+' sur '+l.length+'…');
    try{
      const col=lvCol(x.col);
      if(x.col===E.medias){
        for(let k=0;k<(x.m.n||0);k++)await col.doc(x.id).collection('tranches').doc(String(k)).delete();
        await col.doc(x.id).update({n:FV.delete()});
      }else{
        if(x.m.n)await lvContenuTranchesEfface(col,x.id,x.m);
        await col.doc(x.id).update({code:FV.delete(),n:FV.delete(),gen:FV.delete()});
      }
    }catch(e){ console.warn('libération',x.col,x.id,e); }
  }
  await lvDemenagementEtat(espece,E);
}

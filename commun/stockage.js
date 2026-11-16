/* ════════════════════════════════════════════════════════════════════
   LE COFFRE R2, CÔTÉ PAGE
   Les gros contenus (pages HTML des ressources et des articles, images,
   PDF, copies « avant correction ») vivent dans le coffre R2 de
   Cloudflare ; Firestore n'en garde qu'une petite fiche qui dit où ils
   sont. La fiche d'un contenu vaut {r2, taille, v} : r2 est la clé du
   fichier dans le coffre, v sa version. Chaque nouvelle version
   s'écrit sous une clé neuve, la fiche bascule d'un seul coup, puis
   l'ancienne version s'efface : la fiche ne désigne jamais un fichier à
   moitié envoyé, et le navigateur peut garder une version en cache.
   Une fiche plus ancienne porte encore son contenu dans Firestore
   ({code}, ou des tranches {n, gen}) : elle se lit toujours, et le
   déménagement (commun/demenagement.js) la fait passer dans le coffre.
   Lecture : /fichiers/<clé>, réservée au compte d'Emmanuel (jeton de
   connexion joint à la demande).
   Écriture : /api/fichiers donne une adresse signée, valable quelques
   minutes, et le navigateur envoie lui-même le fichier au coffre.
   Le serveur : netlify/edge-functions/fichiers.js.
   ════════════════════════════════════════════════════════════════════ */
const LV_R2_FICH_MAX=2*1024*1024*1024;   // un fichier déposé : deux gigaoctets au plus
const LV_R2_CODE_MAX=300*1024*1024;      // une page HTML : trois cents mégaoctets au plus

function lvR2Adresse(cle){ return '/fichiers/'+String(cle).split('/').map(encodeURIComponent).join('/'); }

async function lvR2Api(action,donnees){
  const u=firebase.auth().currentUser;
  if(!u)throw new Error('Connexion expirée : rechargez la page.');
  const jeton=await u.getIdToken();
  const r=await fetch('/api/fichiers',{method:'POST',headers:{'content-type':'application/json','authorization':'Bearer '+jeton},body:JSON.stringify(Object.assign({action},donnees||{}))});
  let j=null; try{j=await r.json();}catch(_){}
  if(!r.ok||!j||j.erreur)throw new Error((j&&j.message)||('Le coffre n’a pas répondu ('+r.status+').'));
  return j;
}

/* envoie un fichier (Blob, File ou texte) sous la clé donnée ;
   progres(fraction) suit l'envoi */
async function lvR2Envoie(cle,corps,type,progres){
  const {url}=await lvR2Api('envoi',{cle});
  const blob=corps instanceof Blob?corps:new Blob([corps],{type:type||'text/html;charset=utf-8'});
  await new Promise((ok,ko)=>{
    const x=new XMLHttpRequest();
    x.open('PUT',url);
    x.setRequestHeader('content-type',type||blob.type||'application/octet-stream');
    if(progres&&x.upload)x.upload.onprogress=e=>{if(e.lengthComputable)progres(e.loaded/e.total);};
    x.onload=()=>x.status>=200&&x.status<300?ok():ko(new Error('Le coffre a refusé l’envoi ('+x.status+').'));
    x.onerror=()=>ko(new Error('L’envoi au coffre a échoué.'));
    x.send(blob);
  });
}
/* les fichiers du coffre ne se lisent qu'avec le jeton de connexion du
   compte d'Emmanuel (netlify/edge-functions/fichiers.js) */
async function lvR2Texte(cle){
  const u=window.firebase&&firebase.auth&&firebase.auth().currentUser;
  const r=await fetch(lvR2Adresse(cle),{credentials:'same-origin',headers:u?{authorization:'Bearer '+await u.getIdToken()}:{}});
  if(!r.ok)throw new Error('Fichier introuvable dans le coffre ('+r.status+').');
  return r.text();
}
async function lvR2Efface(cles){
  cles=(Array.isArray(cles)?cles:[cles]).filter(Boolean);
  if(cles.length)await lvR2Api('effacer',{cles});
}
async function lvR2Copie(de,vers){ await lvR2Api('copier',{de,vers}); }
async function lvR2Liste(prefixe){ return (await lvR2Api('lister',{prefixe})).fichiers||[]; }
async function lvR2Ecrit(cle,texte){ await lvR2Api('ecrire',{cle,texte}); }

const lvR2Gen=()=>Date.now().toString(36)+Math.floor(Math.random()*1296).toString(36);
const lvR2Octets=t=>new Blob([t]).size;
/* un nom de fichier sûr dans une clé */
const lvR2Nom=n=>String(n||'fichier').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^A-Za-z0-9._-]+/g,'-').replace(/^-+|-+$/g,'').slice(-80)||'fichier';

/* ── LES CONTENUS (pages HTML et copies d'avant) ──
   col : la collection Firestore des fiches de contenu (res_code,
   art_code, res_avant, art_avant). La clé dans le coffre reprend son nom. */
async function lvContenuLit(col,id){
  const d=await col.doc(id).get();
  if(!d.exists)return null;
  const m=d.data()||{};
  if(m.r2)return lvR2Texte(m.r2);
  if(typeof m.code==='string')return m.code;
  const n=m.n||0,g=m.gen||'';
  if(!n)return '';
  const ts=await Promise.all(Array.from({length:n},(_,k)=>col.doc(id).collection('tranches').doc(g+'_'+k).get()));
  return ts.map(t=>{ if(!t.exists)throw new Error('tranche manquante'); return String((t.data()||{}).d||''); }).join('');
}
async function lvContenuTranchesEfface(col,id,m){
  const n=(m&&m.n)||0,g=(m&&m.gen)||'';
  for(let k=0;k<n;k++)await col.doc(id).collection('tranches').doc(g+'_'+k).delete().catch(()=>{});
}
/* écrit une nouvelle version ; avecFiche(lot) ajoute au même envoi ce
   qui doit basculer en même temps (la fiche de la ressource) */
async function lvContenuEcrit(col,id,code,avecFiche){
  if(lvR2Octets(code)>LV_R2_CODE_MAX)throw new Error('Cette page dépasse 300 Mo.');
  let ancien=null;
  try{const d=await col.doc(id).get();if(d.exists)ancien=d.data()||null;}catch(_){}
  const gen=lvR2Gen(), cle=col.id+'/'+id+'/'+gen+'.html';
  await lvR2Envoie(cle,code,'text/html;charset=utf-8');
  const lot=col.firestore.batch();
  lot.set(col.doc(id),{r2:cle,taille:lvR2Octets(code),v:gen});
  if(avecFiche)avecFiche(lot);
  try{ await lot.commit(); }
  catch(e){ lvR2Efface(cle).catch(()=>{}); throw e; }
  if(ancien){
    if(ancien.r2&&ancien.r2!==cle)await lvR2Efface(ancien.r2).catch(e=>console.warn('ancienne version',e));
    if(ancien.n)await lvContenuTranchesEfface(col,id,ancien);
  }
}
async function lvContenuEfface(col,id){
  let m=null;
  try{const d=await col.doc(id).get();if(d.exists)m=d.data()||null;}catch(_){}
  if(m&&m.r2)await lvR2Efface(m.r2).catch(e=>console.warn('effacement',e));
  if(m&&m.n)await lvContenuTranchesEfface(col,id,m);
  await col.doc(id).delete();
}

/* ── LES FICHIERS JOINTS (images, PDF) ──
   La fiche vaut {r2, mime, taille, nom, complet, cree} ; une fiche plus
   ancienne garde ses tranches en base64 ({n}). */
async function lvMediaEnvoie(col,f,mime,progres){
  if(f.size>LV_R2_FICH_MAX)throw new Error('Ce fichier dépasse 2 Go.');
  const id='m'+Date.now()+Math.floor(Math.random()*1000);
  const cle=col.id+'/'+id+'/'+lvR2Nom(f.name);
  await lvR2Envoie(cle,f,mime,progres);
  try{ await col.doc(id).set({r2:cle,mime,taille:f.size,nom:f.name||'',complet:true,cree:new Date().toISOString()}); }
  catch(e){ lvR2Efface(cle).catch(()=>{}); throw e; }
  return id;
}
/* l'adresse d'un fichier joint : /fichiers/… dans le coffre, ou, pour
   une fiche plus ancienne, une adresse « data: » refaite de ses tranches */
async function lvMediaAdresse(col,id){
  const meta=await col.doc(id).get();
  if(!meta.exists)throw new Error('fichier introuvable');
  const m=meta.data()||{};
  if(m.r2)return lvR2Adresse(m.r2);
  const bouts=[];
  for(let k=0;k<(m.n||0);k++){
    const t=await col.doc(id).collection('tranches').doc(String(k)).get();
    bouts.push(t.exists?(t.data().d||''):'');
  }
  return 'data:'+(m.mime||'application/octet-stream')+';base64,'+bouts.join('');
}
async function lvMediaEfface(col,id){
  if(!id)return;
  const meta=await col.doc(id).get();
  const m=meta.exists?(meta.data()||{}):{};
  if(m.r2)await lvR2Efface(m.r2).catch(e=>console.warn('effacement',e));
  for(let k=0;k<(m.n||0);k++)await col.doc(id).collection('tranches').doc(String(k)).delete();
  await col.doc(id).delete();
}

/* ════════════════════════════════════════════════════════════════════
   LUMEN · FONCTIONNEMENT COMMUN : IA
   Pages : Articles, Ressources.
   Ranger avec l'IA (Emmanuel : « je veux que l'IA puisse ranger les
   ressources et articles »).

   L'IA reçoit le rangement actuel et la liste des éléments (titre,
   description, endroit), puis rend un rangement complet : elle peut
   créer, renommer, fusionner, déplacer et supprimer catégories et
   sections, et déplacer tout élément (choix d'Emmanuel). Le rangement
   s'applique aussitôt, sans validation. Le rangement d'avant est
   gardé dans le compte : « Revenir au rangement d'avant » le remet.
   Tout part du bouton « Organiser ».

   La demande passe par /api/ia (netlify/edge-functions/ia.js), qui
   garde la clé et vérifie le compte.
   ════════════════════════════════════════════════════════════════════ */

/* l'appel : la réponse arrive au fil de l'eau, et la page en recolle le
   texte ; « avance » reçoit le nombre de signes déjà reçus */
async function lvIA(tache,donnees,avance){
  const u=auth.currentUser;
  if(!u)throw new Error('Connectez-vous pour utiliser l’IA.');
  const jeton=await u.getIdToken();
  const r=await fetch('/api/ia',{method:'POST',headers:{'content-type':'application/json','authorization':'Bearer '+jeton},body:JSON.stringify({tache,donnees})});
  const type=r.headers.get('content-type')||'';
  if(!r.ok||type.indexOf('event-stream')<0){
    let m='';
    try{const j=await r.json();m=j.message||'';if(j.erreur==='cle')m='La clé de l’API Claude n’est pas encore réglée dans Netlify.';}catch(_){}
    if(!m&&r.status===401)m='La porte du site a refusé la demande : rechargez la page.';
    throw new Error(m||('L’IA n’a pas répondu (erreur '+r.status+').'));
  }
  const lect=r.body.getReader(), dec=new TextDecoder();
  let tampon='', texte='', fin='', erreur='';
  const traite=bloc=>{
    const ligne=bloc.split('\n').find(l=>l.startsWith('data:'));
    if(!ligne)return;
    let ev; try{ev=JSON.parse(ligne.slice(5).trim());}catch(_){return;}
    if(ev.type==='content_block_delta'&&ev.delta&&ev.delta.type==='text_delta'){texte+=ev.delta.text;if(avance)avance(texte.length);}
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
  if(fin==='refusal')throw new Error('L’IA a refusé cette demande.');
  if(fin==='max_tokens')throw new Error('La réponse de l’IA était trop longue et s’est arrêtée avant la fin.');
  try{return JSON.parse(texte);}catch(_){throw new Error('La réponse de l’IA est illisible. Réessayez.');}
}

/* ── RANGER ── */
const iaAvant=()=>db.doc(rdoc().path+'_ia_avant');
let IA_EN_COURS=false;

function iaDescription(a){
  if(typeof a.extrait==='string'&&a.extrait.trim())return a.extrait.trim();
  if(typeof a.desc==='string'&&a.desc.trim())return a.desc.trim().slice(0,300);
  return '';
}
function iaType(a){
  try{const m=marqueDe(a);if(m&&MARQUES[m])return MARQUES[m].nom;}catch(_){}
  return '';
}

/* le plan de l'IA devient un rangement sûr : ids neufs pour les
   rubriques nouvelles, parents connus, aucune boucle, profondeur
   tenue, chaque élément placé une fois */
function iaPlan(plan){
  const anciens=new Set(S.rubs.map(r=>r.id));
  const ids=new Map(), rubs=[];
  let n=0;
  (plan.rubriques||[]).forEach(r=>{
    const brut=String(r.id||'');
    if(!brut||ids.has(brut))return;
    const id=anciens.has(brut)?brut:('r'+Date.now().toString(36)+(n++));
    ids.set(brut,id);
    rubs.push({id,nom:String(r.nom||'').trim()||'Sans nom',parent:String(r.parent||'')});
  });
  rubs.forEach(r=>{r.parent=ids.get(r.parent)||'';});
  const par=new Map(rubs.map(r=>[r.id,r]));
  const prof=r=>{let d=1,x=r,vus=new Set([r.id]);while(x.parent){const p=par.get(x.parent);if(!p||vus.has(p.id))return Infinity;vus.add(p.id);x=p;d++;}return d;};
  rubs.forEach(r=>{if(prof(r)>RUB_MAX)r.parent='';});
  const ou=new Map(), rang=new Map(), compte=new Map();
  (plan.placements||[]).forEach(p=>{
    const id=String(p.id||''); if(!id||ou.has(id))return;
    const rid=ids.get(String(p.rub||''))||'';
    ou.set(id,rid);
    const k=compte.get(rid)||0; rang.set(id,k); compte.set(rid,k+1);
  });
  return {rubs,ou,rang};
}

async function iaApplique(rubs,ou,rang){
  /* le rangement d'avant, gardé pour pouvoir y revenir */
  await iaAvant().set({
    quand:new Date().toISOString(),
    rubs:S.rubs,
    elements:S.liste.map(a=>({id:a.id,rub:a.rub||'',ordre:(typeof a.ordre==='number'&&isFinite(a.ordre))?a.ordre:null}))
  });
  S.rubs=rubs;
  const valide=id=>!!(id&&rubs.some(r=>r.id===id));
  const changes=[];
  S.liste.forEach(a=>{
    const rub=ou.has(a.id)?ou.get(a.id):(valide(a.rub)?a.rub:'');
    const ordre=rang.has(a.id)?rang.get(a.id):null;
    if((a.rub||'')!==rub||(a.ordre??null)!==ordre){a.rub=rub;a.ordre=ordre;changes.push(a);}
  });
  saveRubs();
  for(let i=0;i<changes.length;i+=400){
    const lot=db.batch();
    changes.slice(i,i+400).forEach(a=>lot.set(acol().doc(a.id),{rub:a.rub,ordre:a.ordre},{merge:true}));
    await lot.commit();
  }
  return changes.length;
}

/* ── LE BOUTON « ORGANISER » ──
   Pas de bouton à part pour l'IA (Emmanuel : « mets une option quand on
   clique sur Organiser »). Hors du mode Organiser, le bouton ouvre un
   choix : organiser à la main (glisser-déposer), ranger avec l'IA, et,
   quand l'IA a déjà rangé, revenir au rangement d'avant. Dans le mode, il
   le referme. */
async function organiser(espece){
  if(S.organise){basculeOrganise(false);return;}
  if(IA_EN_COURS)return;
  let avant=null;
  try{const d=await iaAvant().get();if(d.exists)avant=d.data();}catch(_){}
  const c=await lvChoix('Organiser',[
    {cle:'main',nom:'Organiser à la main',note:'glisser-déposer'},
    {cle:'ia_go',nom:'Ranger avec l’IA',note:S.liste.length+(S.liste.length>1?' éléments':' élément')},
    ...(avant?[{cle:'ia_retour',nom:'Revenir au rangement d’avant',note:dateFr(avant.quand)}]:[])
  ]);
  if(c==='main')basculeOrganise(true);
  else if(c==='ia_go')rangerIA(espece);
  else if(c==='ia_retour')iaRetour(avant);
}

async function rangerIA(espece){
  if(IA_EN_COURS)return;
  if(!RUBS_LUES){lvInfo('Le rangement n’est pas encore chargé. Réessayez dans un instant.');return;}
  const mot=espece==='articles'?'les articles':'les ressources';
  if(!S.liste.length){lvInfo('Il n’y a rien à ranger pour l’instant.');return;}

  IA_EN_COURS=true;
  const b=$('b-organiser'), m=$('mot-liste'), libelle=b?b.textContent:'';
  if(b){b.textContent='L’IA range…';b.disabled=true;}
  const dit=t=>{if(m)m.textContent=t;};
  dit('L’IA lit '+mot+' et prépare un nouveau rangement. Cela peut prendre une minute ou deux.');
  try{
    const plan=await lvIA('ranger',{
      espece,
      rubriques:S.rubs.map(r=>({id:r.id,nom:r.nom,parent:r.parent||''})),
      elements:S.liste.map(a=>({id:a.id,titre:a.titre||'',description:iaDescription(a),type:iaType(a),rubrique_actuelle:rubValide(a.rub)?a.rub:''}))
    },n=>dit('L’IA écrit le nouveau rangement… '+Math.round(n/100)/10+' k signes reçus.'));
    const {rubs,ou,rang}=iaPlan(plan);
    dit('Rangement en cours…');
    const nb=await iaApplique(rubs,ou,rang);
    dit('');
    try{vaVers('');}catch(_){rendLister();}
    lvInfo((String(plan.resume||'').trim()||'Le rangement est fait.')+' '+nb+(nb>1?' éléments ont changé de place.':' élément a changé de place.')+' Pour revenir en arrière : « Organiser », puis « Revenir au rangement d’avant ».');
  }catch(e){
    console.warn('ia',e); dit('');
    lvInfo(e&&e.message?e.message:'Le rangement par l’IA a échoué.');
  }finally{
    IA_EN_COURS=false;
    if(b){b.textContent=libelle;b.disabled=false;}
  }
}

async function iaRetour(avant){
  if(!avant||!Array.isArray(avant.rubs))return;
  try{
    S.rubs=avant.rubs;
    const prec=new Map((avant.elements||[]).map(e=>[e.id,e]));
    const changes=[];
    S.liste.forEach(a=>{
      const e=prec.get(a.id); if(!e)return;
      a.rub=e.rub||''; a.ordre=(typeof e.ordre==='number')?e.ordre:null; changes.push(a);
    });
    saveRubs();
    for(let i=0;i<changes.length;i+=400){
      const lot=db.batch();
      changes.slice(i,i+400).forEach(a=>lot.set(acol().doc(a.id),{rub:a.rub,ordre:a.ordre},{merge:true}));
      await lot.commit();
    }
    await iaAvant().delete().catch(()=>{});
    try{vaVers('');}catch(_){rendLister();}
    lvInfo('Le rangement d’avant est revenu.');
  }catch(e){console.warn('ia retour',e);lvInfo('Le retour au rangement d’avant a échoué. Vérifiez la connexion, puis réessayez.');}
}

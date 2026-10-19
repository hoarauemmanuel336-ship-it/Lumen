/* ════════════════════════════════════════════════════════════════════
   LUMEN · FONCTIONNEMENT COMMUN : MÉNAGE DES COPIES PUBLIQUES
   Pages : Articles, Ressources.

   Le site est privé (19/10, Emmanuel : « je ne compte plus le rendre
   public », puis « retire tout ça, copie et trad anglaise »). Quand un
   article ou une ressource était publié, le site en recopiait la fiche,
   le contenu et le fichier dans un espace public de la base. Ces copies
   ne servent plus : au premier passage de l'auteur sur Articles ou
   Ressources, elles sont effacées, une fois pour toutes, et un drapeau
   dans le compte dit que c'est fait.

   Les commentaires bibliques ne sont pas touchés : leur copie publique
   est celle que la Bible lit pour les afficher, et leurs images restent
   en place, même quand un ancien article se servait de la même.
   ════════════════════════════════════════════════════════════════════ */

/* toutes les valeurs « media » d'un objet, à n'importe quelle profondeur */
function mgMedias(x,out){
  out=out||new Set();
  if(Array.isArray(x))x.forEach(y=>mgMedias(y,out));
  else if(x&&typeof x==='object')Object.keys(x).forEach(k=>{
    if(k==='media'&&typeof x[k]==='string'&&x[k])out.add(x[k]);
    else mgMedias(x[k],out);
  });
  return out;
}

/* un fichier découpé en tranches numérotées 0, 1, 2… */
async function mgFichier(col,id){
  const ref=db.collection(col).doc(id);
  const d=await ref.get().catch(()=>null);
  const n=(d&&d.exists&&(d.data()||{}).n)||0;
  for(let k=0;k<n;k++)await ref.collection('tranches').doc(String(k)).delete().catch(()=>{});
  await ref.delete().catch(()=>{});
}

/* un contenu découpé en tranches de génération (gen_0, gen_1…) */
async function mgContenu(d){
  const m=d.data()||{};
  const n=m.n||0, g=m.gen||'';
  for(let k=0;k<n;k++)await d.ref.collection('tranches').doc(g+'_'+k).delete().catch(()=>{});
  await d.ref.delete().catch(()=>{});
}

async function menagePublic(){
  if(!S.auteur||!S.uid)return;
  const drapeau=db.doc('users/'+S.uid+'/meta/menage_public');
  try{const d=await drapeau.get();if(d.exists)return;}catch(_){return;}

  const lis=async nom=>{try{return (await db.collection(nom).get()).docs;}catch(_){return [];}};

  /* les images des anciens articles, épargnées si un commentaire s'en sert */
  const vieux=await lis('public_articles');
  const deArticles=mgMedias(vieux.map(d=>d.data()));
  const deCommentaires=mgMedias((await lis('public_commentaires')).map(d=>d.data()));

  /* les fiches publiques */
  for(const nom of ['public_ressources','public_art_pages','public_articles']){
    const docs=nom==='public_articles'?vieux:await lis(nom);
    for(const d of docs)await d.ref.delete().catch(()=>{});
  }
  /* les contenus publics (livres, diagrammes, articles en page HTML) */
  for(const nom of ['public_res_code','public_art_code']){
    for(const d of await lis(nom))await mgContenu(d);
  }
  /* les fichiers publics des ressources et des articles */
  for(const nom of ['public_res_medias','public_art_medias']){
    for(const d of await lis(nom))await mgFichier(nom,d.id);
  }
  for(const id of deArticles)if(!deCommentaires.has(id))await mgFichier('public_medias',id);
  /* l'arbre des catégories, déposé autrefois pour les visiteurs */
  for(const chemin of ['config/res_rubriques','config/art_rubriques'])await db.doc(chemin).delete().catch(()=>{});

  /* l'ancien état « publié » des fiches privées */
  const FV=firebase.firestore.FieldValue;
  for(const nom of ['ressources','art_pages']){
    const docs=(await lis('users/'+S.uid+'/'+nom)).filter(d=>'publie' in (d.data()||{}));
    for(let i=0;i<docs.length;i+=400){
      const lot=db.batch();
      docs.slice(i,i+400).forEach(d=>lot.update(d.ref,{publie:FV.delete()}));
      await lot.commit().catch(e=>console.warn('ménage',e));
    }
  }

  await drapeau.set({fait:new Date().toISOString()});
}

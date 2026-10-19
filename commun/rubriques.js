/* ════════════════════════════════════════════════════════════════════
   LUMEN · FONCTIONNEMENT COMMUN : RUBRIQUES
   Pages : Articles, Ressources.
   Le rangement en catégories et sections : validité, parenté, profondeur, chemin affiché.
   La fabrication pose ce fichier dans chaque page concernée, avant le script
   de la page : une correction faite ici vaut pour toutes.
   ════════════════════════════════════════════════════════════════════ */

function rubValide(id){return !!(id&&rubDe(id));}

/* une rubrique dont le parent a disparu remonte au premier niveau : sans cela
   elle deviendrait invisible, avec tous ses articles */
function enfants(pid){return S.rubs.filter(r=>(rubValide(r.parent)?r.parent:'')===(pid||''));}

function niveau(id){let n=1,r=rubDe(id),g=0;while(r&&r.parent&&rubDe(r.parent)&&g++<6){n++;r=rubDe(r.parent);}return n;}

function chemin(id){
  const bouts=[]; let r=rubDe(id), garde=0;
  while(r&&garde++<6){bouts.unshift(r.nom);r=r.parent?rubDe(r.parent):null;}
  return bouts.join(' › ');
}

function descendance(id,vus){
  vus=vus||{};
  if(!id||vus[id])return [];
  vus[id]=1;
  const out=[id];
  enfants(id).forEach(e=>out.push(...descendance(e.id,vus)));
  return out;
}

/* ── LA CORBEILLE SE VIDE D'ELLE-MÊME ──
   Emmanuel : « pour les corbeilles du site, mets un délai avant une
   suppression automatique ». Ce qui est à la corbeille depuis plus de
   trente jours part pour de bon, éléments comme catégories. Le ménage se
   fait une fois par visite, quand la liste et le rangement sont lus.
   Le même délai vaut pour les corbeilles de Mémoriser et des questions à
   l'IA. */
const CORBEILLE_JOURS=30;
let PURGE_FAITE=false;
function lvPlanPurge(){
  if(PURGE_FAITE||!LISTE_LUE||!RUBS_LUES||LISTE_ERR||RUBS_ERR||!S.uid)return;
  PURGE_FAITE=true;
  setTimeout(lvPurgeCorbeille,2500);
}
async function lvPurgeCorbeille(){
  const limite=Date.now()-CORBEILLE_JOURS*864e5;
  const vieux=d=>{const t=Date.parse(d||'');return isFinite(t)&&t<limite;};
  try{
    for(const a of S.jetees.filter(a=>vieux(a.suppr)))await detruitRessource(a);
    const racines=S.corb.filter(x=>(!x.racine||x.racine===x.id)&&vieux(x.suppr)).map(x=>x.id);
    if(racines.length){
      S.corb=S.corb.filter(x=>racines.indexOf(x.racine||x.id)<0);
      saveRubs();
    }
  }catch(e){console.warn('corbeille, ménage',e);}
  try{rendCorbeille();majCorbBouton();}catch(_){}
}

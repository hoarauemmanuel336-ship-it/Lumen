/* ════════════════════════════════════════════════════════════════════
   LUMEN · FONCTIONNEMENT COMMUN : RUBRIQUES
   Pages : Articles, Ressources.
   Le rangement en domaines et sections : validité, parenté, profondeur, chemin affiché.

   Ces fonctions étaient recopiées à l'identique dans chacune de ces pages
   (26/09). Elles vivent maintenant ici, une seule fois : le build les pose
   dans chaque page concernée, avant le script de la page, et toute
   correction faite ici vaut pour toutes ces pages à la fois.
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

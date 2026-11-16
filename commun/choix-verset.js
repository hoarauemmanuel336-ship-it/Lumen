/* ════════════════════════════════════════════════════════════════════
   LUMEN · FONCTIONNEMENT COMMUN : CHOIX-VERSET
   Pages : Mémoriser.
   Le choix d'un verset dans la Bible : chargement du texte, marquage des mots, sélection au doigt.
   La fabrication pose ce fichier dans chaque page concernée, avant le script
   de la page : une correction faite ici vaut pour toutes.
   ════════════════════════════════════════════════════════════════════ */

function bibApi(){return window.LVBible||null;}

function bibRaz(){B.v1=0;B.v2=0;B.wa=null;B.wb=null;B.mots=[];}

function bibAmene(v){
  const z=$('mbib-corps');
  if(!v){z.scrollTop=0;return;}
  const el=z.querySelector('.mbib-v[data-v="'+v+'"]');
  if(!el){z.scrollTop=0;return;}
  z.scrollTop=Math.max(0,z.scrollTop+el.getBoundingClientRect().top-z.getBoundingClientRect().top-14);
}

function bibMarque(){
  $('mbib-corps').querySelectorAll('.mbib-v').forEach(el=>{
    const v=+el.dataset.v; el.classList.toggle('on',B.v1>0&&v>=B.v1&&v<=B.v2);
  });
}

function bibTapVerset(v){
  if(!B.v1){B.v1=B.v2=v;}
  else if(v===B.v1&&v===B.v2){B.v1=B.v2=0;}
  else if(v<B.v1){B.v1=v;}
  else if(v>B.v2){B.v2=v;}
  else {B.v1=B.v2=v;}
  B.wa=null;B.wb=null; bibMarque(); bibApercu();
}

function bibMots(){
  B.mots=[];
  if(!B.v1)return;
  B.versets.forEach(v=>{ if(v.v<B.v1||v.v>B.v2)return;
    String(v.t).split(/\s+/).forEach(m=>{ if(m)B.mots.push({m:m,v:v.v}); }); });
}

function bibTapMot(i){
  if(B.wa===null||B.wb!==null){B.wa=i;B.wb=null;}
  else {B.wb=i; if(B.wb<B.wa){const t=B.wa;B.wa=B.wb;B.wb=t;}}
  bibApercu();
}

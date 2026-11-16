/* ════════════════════════════════════════════════════════════════════
   LUMEN · FONCTIONNEMENT COMMUN : VERSETS
   Pages : toutes (avec la conversation).
   Repérer les références bibliques dans un texte (« Jean 3:16 »,
   « 1 Corinthiens 13:4-7 ») et lire les versets dans les deux Bibles du
   site, la Chérubin et la Séraphin. L'IA s'en sert pour vérifier ou
   citer l'Écriture d'après le texte exact du site.
   La fabrication pose ce fichier dans chaque page concernée, avant le
   script de la page.
   ════════════════════════════════════════════════════════════════════ */

/* Les noms de livres viennent de l'index de la Bible du site. Les noms
   longs passent avant les courts, pour que « 1 Jean 3:1 » ne soit pas lu
   « Jean 3:1 ». « Psaume » au singulier vaut « Psaumes ». */
let LV_LIVRES=null;
async function lvLivres(){
  if(LV_LIVRES)return LV_LIVRES;
  const r=await fetch('/bible-data/index.json');
  if(!r.ok)throw new Error('index');
  const idx=await r.json();
  const noms=[];
  (idx.livres||[]).forEach(l=>{
    noms.push({nom:l.nom,slug:l.slug});
    if(l.slug==='psaumes')noms.push({nom:'Psaume',slug:l.slug});
  });
  noms.sort((a,b)=>b.nom.length-a.nom.length);
  const blanc='[\\s\\u00a0\\u202f]+';
  const motif=noms.map(n=>n.nom.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/ /g,blanc)).join('|');
  LV_LIVRES={
    re:()=>new RegExp('(?<![\\p{L}\\d])('+motif+')'+blanc+'(\\d{1,3})[:.](\\d{1,3})(?:[\\-\\u2010-\\u2013](\\d{1,3}))?','gu'),
    slug:nom=>{const k=nom.replace(/[\s\u00a0\u202f]+/g,' ');const n=noms.find(x=>x.nom===k);return n?n.slug:'';},
    nom:slug=>{const l=(idx.livres||[]).find(x=>x.slug===slug);return l?l.nom:slug;}
  };
  return LV_LIVRES;
}

/* le texte lisible d'une page HTML */
function lvTexteDe(html){
  try{
    const d=new DOMParser().parseFromString(html,'text/html');
    return (d.documentElement&&d.documentElement.textContent)||'';
  }catch(_){return html;}
}

/* les références trouvées dans un texte, sans doublon */
async function lvReferences(texte,max){
  const L=await lvLivres(), re=L.re(), vus=new Map();
  let m;
  while((m=re.exec(texte))&&vus.size<(max||300)){
    const slug=L.slug(m[1]); if(!slug)continue;
    const ch=+m[2], v1=+m[3], v2=m[4]?Math.max(+m[4],v1):v1;
    if(v2-v1>40)continue;
    const nom=m[1].replace(/[\s\u00a0\u202f]+/g,' ');
    const ref=nom+' '+ch+':'+v1+(v2>v1?'-'+v2:'');
    if(!vus.has(ref))vus.set(ref,{ref,slug,ch,v1,v2});
  }
  return [...vus.values()];
}

/* le texte des références dans les deux Bibles du site */
const LV_LIVRES_LUS=new Map();
function lvLivre(dossier,slug){
  const k=dossier+slug;
  if(!LV_LIVRES_LUS.has(k))LV_LIVRES_LUS.set(k,fetch('/'+dossier+'/'+slug+'.json').then(r=>r.ok?r.json():null).catch(()=>null));
  return LV_LIVRES_LUS.get(k);
}
async function lvLitRefs(refs){
  const lit=(livre,r)=>{
    const c=livre&&(livre.chapitres||[]).find(x=>x.n===r.ch);
    if(!c)return '';
    return (c.versets||[]).filter(v=>v.v>=r.v1&&v.v<=r.v2).map(v=>(r.v2>r.v1?v.v+' ':'')+String(v.t||'')).join(' ');
  };
  return Promise.all(refs.map(async r=>{
    const [c,s]=await Promise.all([lvLivre('bible-data',r.slug),lvLivre('bible-data-seraphin',r.slug)]);
    return {ref:r.ref,cherubin:lit(c,r),seraphin:lit(s,r)};
  }));
}

/* toutes les références qu'une page HTML cite, avec leur texte */
async function lvVersetsCites(html){
  try{return await lvLitRefs(await lvReferences(lvTexteDe(html),300));}catch(_){return [];}
}

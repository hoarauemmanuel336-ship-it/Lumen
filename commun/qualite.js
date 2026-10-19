/* ════════════════════════════════════════════════════════════════════
   LUMEN · FONCTIONNEMENT COMMUN : CONTRÔLE QUALITÉ
   Pages : Articles, Ressources.
   Emmanuel : « je veux que tu ajoutes un bouton de contrôle de qualité
   pour les ressources et articles ».

   Le contrôle part du ⋯ d'un article ou d'une ressource HTML. L'IA
   (tâche « controler » de /api/ia) relit la page entière : le fond, les
   citations de l'Écriture, la forme, le fonctionnement. Elle rend un
   constat, classé du plus grave au plus léger ; elle ne corrige rien,
   Emmanuel décide ensuite.

   Pour que les citations se vérifient sur le texte exact, la page
   repère chaque référence biblique citée (« Jean 3:16 », « 1 Corinthiens
   13:4-7 ») et joint les versets correspondants des deux Bibles du site.

   Le dernier rapport de chaque élément est gardé dans le compte
   (art_qc ou res_qc) : rouvrir le contrôle le montre aussitôt, sans
   relancer l'IA. « Refaire le contrôle » le remplace.
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

/* ── LA FENÊTRE ── */
function qcOuvre(){$('m-qc').classList.add('on');}
function qcFerme(){$('m-qc').classList.remove('on');}
function qcBoutons(rapport){
  $('qc-copie').style.display=rapport?'':'none';
  $('qc-refait').style.display=rapport?'':'none';
}

function qcAttente(a,mot){
  QC_VU=a.id;
  $('qc-sous').textContent=a.titre||'Sans titre';
  $('qc-corps').innerHTML='<p class="qc-attente">'+esc(mot)+'</p>';
  qcBoutons(null);
}

function qcRend(a,r,espece){
  QC_VU=a.id;
  $('qc-refait').onclick=()=>qcLance(a,espece);
  $('qc-copie').textContent='Copier le rapport';
  $('qc-copie').onclick=()=>{
    copiePresse(qcTexteRapport(a,r));
    $('qc-copie').textContent='Copié';
    setTimeout(()=>{$('qc-copie').textContent='Copier le rapport';},1600);
  };
  const date=dateFr(r.quand);
  const change=(r.maj||'')!==(a.maj||a.cree||'');
  $('qc-sous').textContent=(a.titre||'Sans titre')+(date?'  ·  '+date:'');
  const pts=Array.isArray(r.points)?r.points:[];
  let h='';
  if(change)h+='<p class="qc-avis">La page a été modifiée depuis ce contrôle.</p>';
  h+='<p class="qc-bilan">'+esc(r.bilan||'')+'</p>';
  if(!pts.length)h+='<p class="qc-rien">Aucun problème relevé.</p>';
  QC_GRAVITES.forEach(g=>{
    const l=pts.filter(p=>p.gravite===g.cle);
    if(!l.length)return;
    h+='<section class="qc-groupe qc-'+g.cle+'"><h3 class="qc-g">'+g.nom+'<span>'+l.length+'</span></h3>';
    l.forEach(p=>{
      h+='<div class="qc-point">'
        +'<div class="qc-ou">'+esc(QC_DOMAINES[p.domaine]||'')+(p.endroit?'  ·  '+esc(p.endroit):'')+'</div>'
        +(p.extrait?'<div class="qc-extrait">« '+esc(p.extrait)+' »</div>':'')
        +'<div class="qc-constat">'+esc(p.constat||'')+'</div>'
        +(p.correction?'<div class="qc-corr">→ '+esc(p.correction)+'</div>':'')
        +'</div>';
    });
    h+='</section>';
  });
  $('qc-corps').innerHTML=h;
  $('qc-corps').scrollTop=0;
  qcBoutons(r);
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

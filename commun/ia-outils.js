/* ════════════════════════════════════════════════════════════════════
   LUMEN · FONCTIONNEMENT COMMUN : LES OUTILS DE LA CONVERSATION
   Pages : toutes (avec commun/question.js).
   Emmanuel : « quelque chose d'aussi abouti que Claude sur tous les
   aspects », et « l'IA doit avoir la mémoire, juste pas synchronisée
   avec Claude ».
   Ce que la page fait pour l'IA pendant une conversation, avec les
   données d'Emmanuel :
   - la bibliothèque : chercher et lire dans les articles, les
     ressources, les commentaires bibliques et les notes de la Bible ;
   - les conversations passées (« Mes questions ») ;
   - la mémoire propre au site (users/…/meta/ia_memoire), distincte de
     celle de Claude ;
   - les skills, lues dans le serveur ;
   - la création d'un livre, d'un diagramme, d'un cours, d'un parcours ou
     d'un article, assemblé ici (commun/assemblage.js) et enregistré dans
     Ressources ou Articles ;
   - les pièces jointes (images, PDF), gardées dans le compte ;
   - le rendu du texte de l'IA (titres, listes, tableaux, citations).
   ════════════════════════════════════════════════════════════════════ */

/* ── LA BASE ──
   Le compte et la base, attendus comme le fait la question (qaCompte). */
async function lvIaBase(){
  const u=await qaCompte();
  if(!u||!firebase.firestore)throw new Error('Connectez-vous pour que l’IA lise vos données.');
  return {db:firebase.firestore(),uid:u.uid,u};
}

/* ── LES GROS CONTENUS EN TRANCHES ──
   Comme partout sur le site : une fiche Firestore ne dépasse pas un
   mégaoctet. Sous ce poids, le contenu tient dans sa fiche ({code} ou
   {d}) ; au-delà, il part en tranches sous la fiche, qui garde leur
   nombre et leur génération. */
const LV_IA_SEUL=900000, LV_IA_TRANCHE=300000;
const lvIaOctets=t=>new Blob([t]).size;
function lvIaDecoupe(t){
  const parts=[];let i=0;
  while(i<t.length){
    let j=Math.min(i+LV_IA_TRANCHE,t.length);
    if(j<t.length){const c=t.charCodeAt(j-1);if(c>=0xD800&&c<=0xDBFF)j--;}
    parts.push(t.slice(i,j));i=j;
  }
  return parts;
}
async function lvIaEcritGros(ref,champ,texte,autres){
  let ancien=null;
  try{const d=await ref.get();if(d.exists)ancien=d.data()||null;}catch(_){}
  const fiche=Object.assign({},autres||{});
  if(lvIaOctets(texte)<=LV_IA_SEUL){fiche[champ]=texte;}
  else{
    const parts=lvIaDecoupe(texte),gen=Date.now().toString(36);
    for(let k=0;k<parts.length;k++)await ref.collection('tranches').doc(gen+'_'+k).set({d:parts[k]});
    fiche.n=parts.length; fiche.gen=gen; fiche.taille=lvIaOctets(texte);
  }
  await ref.set(fiche);
  if(ancien&&ancien.n){
    for(let k=0;k<ancien.n;k++)await ref.collection('tranches').doc(ancien.gen+'_'+k).delete().catch(()=>{});
  }
}
async function lvIaLitGros(ref,champ){
  const d=await ref.get(); if(!d.exists)return null;
  const m=d.data()||{};
  if(typeof m[champ]==='string')return m[champ];
  const n=m.n||0,g=m.gen||''; if(!n)return '';
  const ts=await Promise.all(Array.from({length:n},(_,k)=>ref.collection('tranches').doc(g+'_'+k).get()));
  return ts.map(t=>String((t.exists&&t.data()||{}).d||'')).join('');
}

/* ════════════════════════════════════════════════════════════════════
   LA BIBLIOTHÈQUE
   Les fiches (titres, descriptions) se lisent d'un coup. Le texte de
   chaque page HTML se tire une fois de son code (qaTexteDe), puis se
   garde dans users/…/ia_textes avec la date de la page : une page
   changée depuis se relit, les autres non. La première recherche lit
   donc toute la bibliothèque ; les suivantes vont vite.
   ════════════════════════════════════════════════════════════════════ */
const LV_IA_ESPECES={
  article:{fiches:'art_pages',code:'art_code',page:'/articles.html',nom:'article'},
  ressource:{fiches:'ressources',code:'res_code',page:'/ressources.html',nom:'ressource'}
};
let LV_IA_BIBLIO=null, LV_IA_BIBLIO_T=0;
const LV_IA_TEXTES=new Map();
function lvIaNet(t){return String(t||'').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();}
/* tout le texte d'un objet (les blocs d'un commentaire, une note) */
function lvIaTextes(v,out){
  out=out||[];
  if(typeof v==='string'){if(v.trim()&&!/^data:/.test(v)&&v.length<200000)out.push(lvIaNet(v));}
  else if(Array.isArray(v))v.forEach(x=>lvIaTextes(x,out));
  else if(v&&typeof v==='object')Object.keys(v).forEach(k=>{if(!/^(id|cree|maj|d|m|media|mime|vign|refs|livres|publie|k|c)$/.test(k))lvIaTextes(v[k],out);});
  return out;
}
async function lvIaBibliotheque(){
  if(LV_IA_BIBLIO&&Date.now()-LV_IA_BIBLIO_T<120000)return LV_IA_BIBLIO;
  const {db,uid}=await lvIaBase();
  const col=n=>db.collection('users/'+uid+'/'+n);
  const lire=async n=>{try{const r=await col(n).get();const l=[];r.forEach(d=>l.push(Object.assign({id:d.id},d.data())));return l;}catch(e){console.warn('bibliothèque',n,e);return [];}};
  const rubs=async n=>{try{const d=await db.doc('users/'+uid+'/meta/'+n).get();return (d.exists&&d.data().list)||[];}catch(_){return [];}};
  const [arts,res,coms,notes,ra,rr]=await Promise.all([lire('art_pages'),lire('ressources'),lire('commentaires'),lire('bibleNotes'),rubs('art_rubriques'),rubs('res_rubriques')]);
  const chemin=(rl,id)=>{const b=[];let r=rl.find(x=>x.id===id),g=0;while(r&&g++<6){b.unshift(r.nom);r=r.parent?rl.find(x=>x.id===r.parent):null;}return b.join(' › ');};
  const el=[];
  arts.filter(a=>!a.suppr).forEach(a=>el.push({espece:'article',id:a.id,titre:a.titre||'Sans titre',desc:a.extrait||a.desc||'',ou:chemin(ra,a.rub),maj:a.maj||a.cree||'',html:(a.type||'diagramme')==='diagramme',fiche:a}));
  res.filter(a=>!a.suppr).forEach(a=>el.push({espece:'ressource',id:a.id,titre:a.titre||'Sans titre',desc:a.desc||'',ou:chemin(rr,a.rub),maj:a.maj||a.cree||'',
    sorte:(a.type||'diagramme')==='diagramme'?(a.marque&&a.marque!=='aucune'?a.marque:(a.marqueDevinee||'page')):a.type,url:a.url||'',html:(a.type||'diagramme')==='diagramme',fiche:a}));
  coms.filter(a=>!a.suppr).forEach(a=>el.push({espece:'commentaire',id:a.id,titre:a.titre||a.ref||'Commentaire',desc:a.ref||'',maj:a.maj||a.cree||'',texte:lvIaTextes(a.blocs||[]).join('\n')}));
  notes.filter(n=>!/^lv-/.test(n.id)&&(n.t||n.ti)).forEach(n=>el.push({espece:'note',id:n.id,titre:n.ti||'Note',desc:(Array.isArray(n.refs)?n.refs.map(r=>typeof r==='string'?r:(r&&(r.ref||r.l)||'')).filter(Boolean).join(', '):''),maj:n.m||n.d||'',texte:lvIaNet(n.t||'')}));
  LV_IA_BIBLIO=el; LV_IA_BIBLIO_T=Date.now();
  return el;
}
/* le texte d'une page HTML de la bibliothèque, tiré une fois puis gardé */
async function lvIaTexteElement(e){
  if(e.texte!=null)return e.texte;
  if(!e.html)return '';
  const cle=(e.espece==='article'?'a_':'r_')+e.id;
  if(LV_IA_TEXTES.has(cle)&&LV_IA_TEXTES.get(cle).maj===e.maj)return LV_IA_TEXTES.get(cle).t;
  const {db,uid}=await lvIaBase();
  const ref=db.doc('users/'+uid+'/ia_textes/'+cle);
  try{
    const d=await ref.get();
    if(d.exists&&d.data().maj===e.maj){const t=String(d.data().t||'');LV_IA_TEXTES.set(cle,{maj:e.maj,t});return t;}
  }catch(_){}
  let code=typeof e.fiche.code==='string'?e.fiche.code:'';
  if(!code){try{code=await qaCodeDe({col:LV_IA_ESPECES[e.espece].code,id:e.id});}catch(err){console.warn('texte',err);}}
  const t=qaTexteDe(code).slice(0,250000);
  LV_IA_TEXTES.set(cle,{maj:e.maj,t});
  try{await ref.set({t,maj:e.maj,titre:e.titre});}catch(err){console.warn('texte gardé',err);}
  return t;
}
const lvIaPlie=s=>String(s||'').normalize('NFD').replace(/\p{Mn}/gu,'').toLowerCase();
const LV_IA_VIDES=new Set('les des une est que qui dans pour par sur avec sans aux ses son sa leur leurs plus moins tout tous toute toutes mon mes ton tes notre nos votre vos elle elles ils lui eux nous vous quoi dont comme mais donc car puis cette ces cet entre vers chez etre avoir fait faire pas'.split(' '));
function lvIaMots(q){
  return [...new Set(lvIaPlie(q).split(/[^\p{L}\p{N}]+/u).filter(m=>m.length>=3&&!LV_IA_VIDES.has(m)))];
}
function lvIaCompte(texte,mot){let n=0,i=0;while((i=texte.indexOf(mot,i))>=0){n++;i+=mot.length;if(n>50)break;}return n;}
function lvIaExtraits(texte,mots,max){
  const plie=lvIaPlie(texte), out=[], pris=[];
  for(const m of mots){
    let i=plie.indexOf(m);
    while(i>=0&&out.length<max){
      if(!pris.some(p=>Math.abs(p-i)<400)){
        pris.push(i);
        const d=Math.max(0,i-220), f=Math.min(texte.length,i+280);
        out.push((d>0?'… ':'')+texte.slice(d,f).replace(/\s+/g,' ').trim()+(f<texte.length?' …':''));
        break;
      }
      i=plie.indexOf(m,i+m.length);
    }
    if(out.length>=max)break;
  }
  return out;
}
async function lvIaChercher(requete,ou,avance){
  const tout=await lvIaBibliotheque();
  const filtre={articles:'article',ressources:'ressource',commentaires:'commentaire',notes:'note'}[ou]||'';
  const liste=filtre?tout.filter(e=>e.espece===filtre):tout;
  const decrit=e=>({espece:e.espece,id:e.id,titre:e.titre,sorte:e.sorte||undefined,rangement:e.ou||undefined,description:e.desc?e.desc.slice(0,300):undefined,date:String(e.maj||'').slice(0,10),lien:e.url||undefined});
  const mots=lvIaMots(requete);
  if(!mots.length)return {nombre:liste.length,elements:liste.map(decrit)};
  /* les textes des pages se lisent quatre à la fois */
  const html=liste.filter(e=>e.html);
  let i=0,faits=0;
  const ouvrier=async()=>{while(i<html.length){const e=html[i++];try{await lvIaTexteElement(e);}catch(_){}faits++;if(avance)avance(faits,html.length);}};
  await Promise.all([ouvrier(),ouvrier(),ouvrier(),ouvrier()]);
  const notes=[];
  for(const e of liste){
    const titre=lvIaPlie(e.titre), desc=lvIaPlie(e.desc);
    const texte=e.html?(LV_IA_TEXTES.get((e.espece==='article'?'a_':'r_')+e.id)||{}).t||'':(e.texte||'');
    const plie=lvIaPlie(texte);
    let score=0, trouves=0;
    for(const m of mots){
      const a=lvIaCompte(titre,m)*12+lvIaCompte(desc,m)*4+Math.min(lvIaCompte(plie,m),25);
      if(a)trouves++;
      score+=a;
    }
    if(!score)continue;
    score*=trouves/mots.length+.2;
    notes.push({e,score,texte});
  }
  notes.sort((a,b)=>b.score-a.score);
  return {mots,nombre:notes.length,elements:notes.slice(0,10).map(n=>Object.assign(decrit(n.e),{extraits:lvIaExtraits(n.texte||n.e.desc||'',mots,3)}))};
}
async function lvIaLireElement(espece,id,debut){
  const tout=await lvIaBibliotheque();
  const e=tout.find(x=>x.espece===espece&&x.id===id);
  if(!e)return {erreur:'Élément introuvable dans la bibliothèque.'};
  const texte=await lvIaTexteElement(e);
  const d=Math.max(0,+debut||0), MORCEAU=120000;
  return {espece,id,titre:e.titre,rangement:e.ou||undefined,description:e.desc||undefined,longueur:texte.length,debut:d,
    suite:d+MORCEAU<texte.length?d+MORCEAU:undefined,texte:texte.slice(d,d+MORCEAU)||(e.html?'':e.desc||'')};
}

/* ── LES CONVERSATIONS PASSÉES ── */
async function lvIaChercherConversations(requete){
  const {db,uid}=await lvIaBase();
  const l=[];
  try{const r=await db.collection('users/'+uid+'/questions').orderBy('maj','desc').limit(300).get();r.forEach(d=>l.push(Object.assign({id:d.id},d.data())));}
  catch(e){return {erreur:'Les conversations n’ont pas pu être lues.'};}
  const mots=lvIaMots(requete);
  const res=[];
  for(const c of l){
    if(c.jete||c.id===QA_ID)continue;
    const vu=Array.isArray(c.vu)?c.vu:[];
    const texte=[(c.passage&&c.passage.texte)||'',...vu.map(x=>'Emmanuel : '+x.q+'\nIA : '+x.r)].join('\n\n');
    const plie=lvIaPlie(texte);
    const score=mots.reduce((s,m)=>s+Math.min(lvIaCompte(plie,m),20),0);
    if(mots.length&&!score)continue;
    res.push({score,date:String(c.maj||'').slice(0,10),premiere_question:(vu[0]&&vu[0].q)||'',passage:(c.passage&&c.passage.etiquette)||undefined,extraits:lvIaExtraits(texte,mots,4)});
  }
  res.sort((a,b)=>b.score-a.score);
  return {nombre:res.length,conversations:res.slice(0,8).map(r=>{delete r.score;return r;})};
}

/* ════════════════════════════════════════════════════════════════════
   LA MÉMOIRE
   Une liste de lignes, dans users/…/meta/ia_memoire. L'IA la reçoit à
   chaque message et la tient à jour par l'outil « memoire » ; Emmanuel
   la lit et la corrige dans « Mémoire », depuis « Mes questions » ou
   « Mon compte ». Elle n'a aucun lien avec la mémoire de Claude.
   ════════════════════════════════════════════════════════════════════ */
let LV_IA_MEMOIRE=null;
async function lvIaMemoire(){
  if(LV_IA_MEMOIRE)return LV_IA_MEMOIRE;
  const {db,uid}=await lvIaBase();
  try{const d=await db.doc('users/'+uid+'/meta/ia_memoire').get();LV_IA_MEMOIRE=(d.exists&&Array.isArray(d.data().lignes))?d.data().lignes.map(String):[];}
  catch(e){console.warn('mémoire',e);LV_IA_MEMOIRE=[];}
  return LV_IA_MEMOIRE;
}
async function lvIaMemoireEcrit(lignes){
  const {db,uid}=await lvIaBase();
  const net=lignes.map(l=>String(l).replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,400);
  await db.doc('users/'+uid+'/meta/ia_memoire').set({lignes:net,maj:new Date().toISOString()});
  LV_IA_MEMOIRE=net;
  return net;
}
const lvIaMemoireTexte=l=>(l||[]).map(x=>'- '+x).join('\n');
async function lvIaOutilMemoire(e){
  const l=(await lvIaMemoire()).slice();
  const t=String(e.texte||'').trim(), anc=String(e.ancien||'').trim();
  const trouve=()=>{let i=l.indexOf(anc);if(i<0)i=l.findIndex(x=>lvIaPlie(x)===lvIaPlie(anc));return i;};
  if(e.action==='ajouter'){if(!t)return {erreur:'Rien à ajouter.'};l.push(t);}
  else if(e.action==='remplacer'){const i=trouve();if(i<0)return {erreur:'Ligne introuvable.',memoire:lvIaMemoireTexte(l)};l[i]=t;}
  else if(e.action==='supprimer'){const i=trouve();if(i<0)return {erreur:'Ligne introuvable.',memoire:lvIaMemoireTexte(l)};l.splice(i,1);}
  else return {erreur:'Action inconnue.'};
  const net=await lvIaMemoireEcrit(l);
  return {ok:true,memoire:lvIaMemoireTexte(net)};
}

/* ── LES SKILLS ──
   Leur texte vit dans le serveur (le même que dans Claude) ; la page le
   demande à /api/ia, sans appel à l'IA. */
async function lvIaSkill(nom){
  const {u}=await lvIaBase();
  const r=await fetch('/api/ia',{method:'POST',headers:{'content-type':'application/json','authorization':'Bearer '+await u.getIdToken()},body:JSON.stringify({tache:'skill',donnees:{nom}})});
  const j=await r.json().catch(()=>({}));
  if(!r.ok)return {erreur:j.message||'Skill introuvable.'};
  return {nom,instructions:j.texte};
}

/* ════════════════════════════════════════════════════════════════════
   CRÉER UNE PAGE
   L'IA écrit le contenu avec la skill ; la page l'assemble avec le moteur
   de la skill (commun/assemblage.js, les mêmes octets que l'assembleur de
   Claude) et l'enregistre comme le ferait l'éditeur : la fiche dans
   ressources (ou art_pages), le code dans res_code (ou art_code), au
   premier niveau du rangement. La marque vient de la skill.
   ════════════════════════════════════════════════════════════════════ */
const LV_IA_MARQUE={'livre-html':'livre','diagrammes-interactifs':'diagramme','cours-html':'cours','parcours-etude':'parcours'};
function lvIaTitreHtml(html){
  try{const d=new DOMParser().parseFromString(html,'text/html');const h=d.querySelector('h1'),t=d.querySelector('title');return lvIaNet((h&&h.textContent)||(t&&t.textContent)||'');}catch(_){return '';}
}
/* le bloc « En bref » d'un article, qui paraît dans la liste sous la question */
function lvIaEnBref(html){
  try{
    const d=new DOMParser().parseFromString(html,'text/html');
    const lab=[...d.body.querySelectorAll('*')].find(e=>!e.children.length&&/^en bref$/i.test(lvIaNet(e.textContent)));
    if(!lab)return '';
    let bloc=lab.parentElement;
    while(bloc&&bloc!==d.body&&lvIaNet(bloc.textContent).length<=lvIaNet(lab.textContent).length+3)bloc=bloc.parentElement;
    if(!bloc||bloc===d.body)return '';
    lab.remove();
    return lvIaNet(bloc.textContent).slice(0,600);
  }catch(_){return '';}
}
async function lvIaCreerPage(e,avance){
  const skill=String(e.skill||''), contenu=String(e.contenu||'');
  if(!contenu.trim())return {erreur:'Le contenu est vide.'};
  const {db,uid}=await lvIaBase();
  let html, titre, espece;
  if(skill==='article-html'){
    html=contenu; titre=lvIaTitreHtml(html)||'Article'; espece='article';
  }else if(LV_IA_MARQUE[skill]){
    if(avance)avance('Assemblage de la page');
    try{const r=await lvAssemble(skill,contenu);html=r.html;titre=r.titre;}
    catch(err){return {erreur:'L’assemblage a échoué : '+(err&&err.message||err)};}
    espece='ressource';
    /* le nom de la fiche : l'attribut « titre » lui-même de la balise
       principale, jamais « sous-titre » (l'assembleur, lui, garde sa
       propre règle pour le titre de la page) */
    const m=/<(?:livre|diagramme)\b[^>]*?(?<![\w-])titre="([^"]*)"/.exec(contenu);
    if(m&&m[1].trim())titre=lvIaNet(lvAsDeschappe(m[1]));
  }else return {erreur:'Skill inconnue.'};
  if(lvIaOctets(html)>LV_R2_CODE_MAX)return {erreur:'La page dépasse 300 Mo.'};
  if(avance)avance('Enregistrement sur le site');
  const id='s'+Date.now(), maj=new Date().toISOString();
  const E=LV_IA_ESPECES[espece];
  const fiche={titre,type:'diagramme',desc:String(e.description||'').slice(0,600),rub:'',media:'',mime:'',taille:0,nom:'',vign:'',url:'',cree:maj,maj,
    marque:espece==='ressource'?LV_IA_MARQUE[skill]:'',codeTaille:lvIaOctets(html),marqueDevinee:''};
  if(espece==='ressource')fiche.marqueIA=true;
  else fiche.extrait=lvIaEnBref(html);
  try{
    /* la page part dans le coffre R2, sa fiche et celle de l'élément
       basculent ensemble (commun/stockage.js) */
    await lvContenuEcrit(db.collection('users/'+uid+'/'+E.code),id,html,lot=>lot.set(db.doc('users/'+uid+'/'+E.fiches+'/'+id),fiche));
  }catch(err){console.warn('création',err);return {erreur:'L’enregistrement sur le site a échoué.'};}
  LV_IA_BIBLIO=null;
  return {ok:true,espece,id,titre,marque:fiche.marque||undefined,lien:E.page+'#r/'+id,rangement:'premier niveau de '+(espece==='article'?'Articles':'Ressources')+', à ranger ensuite'};
}

/* ════════════════════════════════════════════════════════════════════
   LES PIÈCES JOINTES
   Une image ou un PDF joint à un message part à l'IA dans le message, et
   se garde dans users/…/qa_pieces (en tranches au-delà d'un mégaoctet) :
   la conversation gardée n'en retient que l'identifiant, et la pièce se
   relit quand on la reprend.
   ════════════════════════════════════════════════════════════════════ */
const LV_IA_PIECE_MAX=4.5*1024*1024;
const LV_IA_PIECES=new Map();
async function lvIaPieceGarde(media,data,nom){
  const {db,uid}=await lvIaBase();
  const id='p'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
  await lvIaEcritGros(db.doc('users/'+uid+'/qa_pieces/'+id),'d',data,{media,nom:nom||''});
  LV_IA_PIECES.set(id,data);
  return id;
}
async function lvIaPieceLit(id){
  if(LV_IA_PIECES.has(id))return LV_IA_PIECES.get(id);
  const {db,uid}=await lvIaBase();
  const d=await lvIaLitGros(db.doc('users/'+uid+'/qa_pieces/'+id),'d');
  if(d)LV_IA_PIECES.set(id,d);
  return d||'';
}
function lvIaLitFichier(f){
  return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).replace(/^data:[^,]*,/,''));r.onerror=()=>rej(r.error);r.readAsDataURL(f);});
}

/* ════════════════════════════════════════════════════════════════════
   LE TEXTE DE L'IA
   Ce que la consigne lui permet : paragraphes, titres, listes simples et
   numérotées, citations, tableaux, code, gras, italique, liens.
   ════════════════════════════════════════════════════════════════════ */
function lvIaEnLigne(s){
  const codes=[];
  s=String(s).replace(/`([^`]+)`/g,(_,c)=>{codes.push(c);return '\u0000'+(codes.length-1)+'\u0000';});
  s=qaEsc(s)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/(^|[\s(])(https?:\/\/[^\s<)]+[^\s<).,;:!?»])/g,'$1<a href="$2" target="_blank" rel="noopener">$2</a>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/(^|[^*\w])\*(?!\s)(.+?)\*(?!\*)/g,'$1<em>$2</em>');
  return s.replace(/\u0000(\d+)\u0000/g,(_,i)=>'<code>'+qaEsc(codes[+i])+'</code>');
}
function lvIaRendu(t){
  const L=String(t||'').replace(/\r/g,'').split('\n');
  const out=[]; let i=0;
  const vide=l=>!l.trim();
  const estListe=l=>/^\s*([-•*]|\d+[.)])\s+/.test(l);
  const estTable=l=>/^\s*\|.*\|\s*$/.test(l);
  while(i<L.length){
    const l=L[i];
    if(vide(l)){i++;continue;}
    let m;
    if(/^\s*```/.test(l)){
      const bloc=[];i++;
      while(i<L.length&&!/^\s*```/.test(L[i]))bloc.push(L[i++]);
      i++; out.push('<pre><code>'+qaEsc(bloc.join('\n'))+'</code></pre>'); continue;
    }
    if((m=/^\s*(#{1,4})\s+(.*)$/.exec(l))){const n=Math.min(4,m[1].length+1);out.push('<h'+n+'>'+lvIaEnLigne(m[2].replace(/\s*#+\s*$/,''))+'</h'+n+'>');i++;continue;}
    if(/^\s*([-*_])\s*\1\s*\1[\s\-*_]*$/.test(l)){out.push('<hr>');i++;continue;}
    if(/^\s*>/.test(l)){
      const bloc=[];
      while(i<L.length&&/^\s*>/.test(L[i]))bloc.push(L[i++].replace(/^\s*>\s?/,''));
      out.push('<blockquote>'+lvIaRendu(bloc.join('\n'))+'</blockquote>'); continue;
    }
    if(estTable(l)&&i+1<L.length&&/^\s*\|?\s*:?-{2,}/.test(L[i+1])){
      const cases=x=>x.trim().replace(/^\|/,'').replace(/\|$/,'').split('|').map(c=>c.trim());
      const tete=cases(l); i+=2; const rangs=[];
      while(i<L.length&&estTable(L[i]))rangs.push(cases(L[i++]));
      out.push('<div class="qa-table"><table><thead><tr>'+tete.map(c=>'<th>'+lvIaEnLigne(c)+'</th>').join('')+'</tr></thead><tbody>'
        +rangs.map(r=>'<tr>'+r.map(c=>'<td>'+lvIaEnLigne(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>');
      continue;
    }
    if(estListe(l)){
      const num=/^\s*\d+[.)]/.test(l), items=[];
      while(i<L.length&&(estListe(L[i])||(!vide(L[i])&&/^\s{2,}\S/.test(L[i])&&items.length))){
        const x=L[i];
        if(estListe(x)&&!/^\s{2,}/.test(x))items.push({t:x.replace(/^\s*([-•*]|\d+[.)])\s+/,''),sous:[]});
        else if(estListe(x))items[items.length-1].sous.push(x.replace(/^\s*([-•*]|\d+[.)])\s+/,''));
        else items[items.length-1].t+=' '+x.trim();
        i++;
        if(i<L.length&&vide(L[i])&&i+1<L.length&&estListe(L[i+1])&&/^\s*\d+[.)]/.test(L[i+1])===num)i++;
      }
      const tag=num?'ol':'ul';
      out.push('<'+tag+'>'+items.map(it=>'<li>'+lvIaEnLigne(it.t)+(it.sous.length?'<ul>'+it.sous.map(s=>'<li>'+lvIaEnLigne(s)+'</li>').join('')+'</ul>':'')+'</li>').join('')+'</'+tag+'>');
      continue;
    }
    const bloc=[];
    while(i<L.length&&!vide(L[i])&&!estListe(L[i])&&!/^\s*(#{1,4}\s|>|```)/.test(L[i])&&!(estTable(L[i])&&i+1<L.length&&/^\s*\|?\s*:?-{2,}/.test(L[i+1])))bloc.push(L[i++]);
    if(!bloc.length){bloc.push(L[i++]);}
    out.push('<p>'+bloc.map(lvIaEnLigne).join('<br>')+'</p>');
  }
  return out.join('');
}

/* ── L'OUTIL DEMANDÉ, EXÉCUTÉ ──
   avance(mot) dit sur la réponse ce qui se fait pendant ce temps. */
async function lvIaOutil(b,avance){
  const e=b.input||{};
  try{
    let r;
    switch(b.name){
      case 'chercher_bibliotheque':
        r=await lvIaChercher(String(e.requete||''),e.ou,(n,t)=>avance&&t>3&&avance('Lecture de la bibliothèque ('+n+' sur '+t+')'));break;
      case 'lire_element': r=await lvIaLireElement(String(e.espece||''),String(e.id||''),e.debut);break;
      case 'chercher_conversations': r=await lvIaChercherConversations(String(e.requete||''));break;
      case 'memoire': r=await lvIaOutilMemoire(e);break;
      case 'lire_skill': r=await lvIaSkill(String(e.nom||''));break;
      case 'creer_page': r=await lvIaCreerPage(e,avance);break;
      default: return null;
    }
    return r;
  }catch(err){console.warn('outil',b.name,err);return {erreur:(err&&err.message)||'L’outil a échoué.'};}
}

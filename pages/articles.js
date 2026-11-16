/* ═══════════ ARTICLES ═══════════
   Une page en lecture seule, la même pour tous (Emmanuel : « comme
   Étude, quelque chose que moi seul peux mettre ») : les articles se font
   dans Claude, l'IA les dépose dans le coffre R2 (articles/, servis à
   /articles/<fichier>) et les inscrit au catalogue du dépôt
   (articles/articles.json), que la fabrication pose dans la page
   (ARTICLES). Personne n'en ajoute, n'en modifie ni n'en supprime ici.

   Le rangement suit celui du site : les catégories, puis les sections
   dedans ; une catégorie ou une section ouvre sa propre page, avec le fil
   d'Ariane. Les articles sont des rangées sans cadre, la question en titre
   et le début de la réponse dessous. Un article s'ouvre en plein écran,
   dans le même cadre isolé qu'Étude (commun/cadre.js), avec le même
   bandeau (retour, Bible, question à l'IA) ; la place de lecture se garde
   sur l'appareil. L'adresse dit où l'on est : #c/<catégorie>[/<section>]
   pour une rubrique, #a/<fichier> pour un article ouvert. */
(function(){
  const C=(typeof ARTICLES==='object'&&ARTICLES)||{};
  const CATS=Array.isArray(C.categories)?C.categories:[], ARTS=Array.isArray(C.articles)?C.articles:[];
  const $=id=>document.getElementById(id);
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const liste=$('liste'), fil=$('fil'), titre=$('titre-liste'), acts=$('et-acts'), attente=$('et-charge');
  if(!liste||!acts)return;

  const catDe=id=>CATS.find(c=>c.id===id)||null;
  const secDe=(c,id)=>c&&Array.isArray(c.sections)?c.sections.find(s=>s.id===id)||null:null;
  const artDe=f=>ARTS.find(a=>a.fichier===f)||null;
  const nomValide=n=>/^[A-Za-z0-9][A-Za-z0-9._-]{0,120}\.html$/.test(n);

  /* ── OÙ L'ON EST ── */
  function lieu(){
    const h=location.hash||'';
    let m=/^#a\/(.+)$/.exec(h);
    if(m){try{const f=decodeURIComponent(m[1]);if(nomValide(f)&&artDe(f))return {article:f};}catch(_){}}
    m=/^#c\/([^/]+)(?:\/([^/]+))?$/.exec(h);
    if(m){
      let ci='',si='';try{ci=decodeURIComponent(m[1]);si=m[2]?decodeURIComponent(m[2]):'';}catch(_){}
      const c=catDe(ci);
      if(c)return {cat:c,sec:si?secDe(c,si):null};
    }
    return {};
  }
  const lienCat=c=>'#c/'+encodeURIComponent(c.id);
  const lienSec=(c,s)=>lienCat(c)+'/'+encodeURIComponent(s.id);

  /* ── LA LISTE ── */
  function rangeeRub(nom,n,lien){
    const d=document.createElement('div');
    d.className='rub rub-1';
    d.innerHTML='<div class="rub-tete" role="button" tabindex="0"><span class="rub-nom">'+esc(nom)+'</span>'
      +'<span class="rub-n">'+n+'</span><span class="rub-chev">›</span></div>';
    const t=d.firstChild;
    t.onclick=()=>{location.hash=lien;};
    t.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();location.hash=lien;}};
    return d;
  }
  function rangeeArt(a){
    const d=document.createElement('div');
    d.className='art-ligne';
    d.innerHTML='<button class="art-item" type="button"><div class="art-titre">'+esc(a.question||'')+'</div>'
      +(a.extrait?'<div class="art-extrait">'+esc(a.extrait)+'</div>':'')+'</button>';
    d.firstChild.onclick=()=>{location.hash='#a/'+encodeURIComponent(a.fichier);};
    return d;
  }
  function majFil(chemin){
    /* le fil aligne le chemin jusqu'à l'endroit où l'on est ; l'endroit
       lui-même devient le grand titre */
    let h='';
    if(chemin.length){
      h='<span data-va="">Articles</span>';
      chemin.slice(0,-1).forEach(x=>{h+='<i>›</i><span data-va="'+esc(x.lien)+'">'+esc(x.nom)+'</span>';});
    }
    fil.innerHTML=h;
    fil.querySelectorAll('span[data-va]').forEach(s=>{s.onclick=()=>{location.hash=s.getAttribute('data-va');};});
    titre.textContent=chemin.length?chemin[chemin.length-1].nom:'Articles';
  }
  function vide(t,suite){
    const d=document.createElement('div');d.className='lv-vide';
    d.innerHTML='<span class="lv-vide-t">'+esc(t)+'</span>'+(suite?esc(suite):'');
    return d;
  }
  function rendListe(l){
    liste.innerHTML='';
    if(!l.cat){
      majFil([]);
      if(!ARTS.length){liste.appendChild(vide('Aucun article pour l’instant.','Les articles paraîtront ici dès qu’ils seront publiés.'));return;}
      CATS.forEach(c=>liste.appendChild(rangeeRub(c.nom,ARTS.filter(a=>a.categorie===c.id).length,lienCat(c))));
      return;
    }
    const c=l.cat;
    if(!l.sec){
      majFil([{nom:c.nom,lien:lienCat(c)}]);
      (c.sections||[]).forEach(s=>liste.appendChild(rangeeRub(s.nom,ARTS.filter(a=>a.categorie===c.id&&a.section===s.id).length,lienSec(c,s))));
      const sans=ARTS.filter(a=>a.categorie===c.id&&!a.section);
      sans.forEach(a=>liste.appendChild(rangeeArt(a)));
      if(!liste.children.length)liste.appendChild(vide('Rien dans cette catégorie pour l’instant.'));
      return;
    }
    const s=l.sec;
    majFil([{nom:c.nom,lien:lienCat(c)},{nom:s.nom,lien:lienSec(c,s)}]);
    const ls=ARTS.filter(a=>a.categorie===c.id&&a.section===s.id);
    ls.forEach(a=>liste.appendChild(rangeeArt(a)));
    if(!ls.length)liste.appendChild(vide('Rien dans cette section pour l’instant.'));
  }

  /* ── L'ARTICLE OUVERT ──
     Le fichier vient du coffre ; il tourne dans un cadre isolé, en plein
     écran, sous le cercle de chargement qui s'efface quand la page est
     dessinée. La place de lecture se garde sur l'appareil, par fichier. */
  let OUVERT=null;   // {fichier, titre, code, f}
  const posCle=f=>'lv_art_pos_'+f;
  function ferme(){
    if(!OUVERT)return;
    try{OUVERT.f&&OUVERT.f.remove();}catch(_){}
    OUVERT=null;
    document.body.classList.remove('plein');
    acts.hidden=true;
    if(attente)attente.classList.add('fini');
  }
  async function ouvre(fichier){
    if(OUVERT&&OUVERT.fichier===fichier)return;
    ferme();
    const a=artDe(fichier);
    const o={fichier,titre:(a&&a.question)||'Article'};
    OUVERT=o;
    document.body.classList.add('plein');
    acts.hidden=false;
    if(attente)attente.classList.remove('fini');
    let code='';
    try{
      const r=await fetch('/articles/'+encodeURIComponent(fichier),{credentials:'same-origin'});
      if(!r.ok)throw new Error(String(r.status));
      code=await r.text();
    }catch(e){
      if(OUVERT!==o)return;
      console.warn('article',e);
      code='<div style="font-family:Georgia,serif;color:#fff;padding:48px 24px;text-align:center;opacity:.8">Cet article n’a pas pu être ouvert. Vérifiez la connexion, puis réessayez.</div>';
    }
    if(OUVERT!==o)return;
    o.code=code;
    const f=document.createElement('iframe');
    f.className='res-plein';
    f.setAttribute('sandbox','allow-scripts');
    f.setAttribute('allow','clipboard-write *');
    f.setAttribute('referrerpolicy','no-referrer');
    f.setAttribute('title',o.titre);
    o.f=f;
    f.addEventListener('load',()=>{
      if(OUVERT!==o)return;
      let pi=null;try{pi=JSON.parse(localStorage.getItem(posCle(fichier))||'null');}catch(_){}
      if(pi&&typeof pi.y==='number'){try{f.contentWindow.postMessage({lvRevoir:Math.max(0,Math.round(pi.y)),lvRevoirInfo:pi},'*');}catch(_){}}
      o.rendu=true;
      requestAnimationFrame(()=>requestAnimationFrame(()=>setTimeout(()=>{if(OUVERT===o&&attente)attente.classList.add('fini');},120)));
    });
    f.srcdoc=pageCadre(code);
    acts.parentNode.insertBefore(f,attente||acts);
  }

  /* ── LES MESSAGES DU CADRE ── */
  function copie(t){
    try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).catch(()=>vieille(t));return;}}catch(_){}
    vieille(t);
  }
  function vieille(t){
    try{const z=document.createElement('textarea');z.value=t;z.setAttribute('readonly','');
      z.style.cssText='position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;font-size:16px';
      document.body.appendChild(z);z.select();document.execCommand('copy');document.body.removeChild(z);}catch(_){}
  }
  window.addEventListener('message',ev=>{
    const o=OUVERT, d=ev.data;
    if(!o||!o.f||ev.source!==o.f.contentWindow||!d||typeof d!=='object')return;
    if('lvSel' in d){if(typeof qaSelectionCadre==='function')qaSelectionCadre(d.lvSel,o.f,o.titre,'un article',o.code,null);return;}
    if(typeof d.lvPos==='number'){
      if(o.rendu){const info=d.lvPosInfo&&typeof d.lvPosInfo==='object'?d.lvPosInfo:{y:d.lvPos};info.y=Math.max(0,Math.round(info.y||0));
        try{localStorage.setItem(posCle(o.fichier),JSON.stringify(info));}catch(_){}}
      return;
    }
    if(typeof d.lvCopie==='string')copie(d.lvCopie);
  });

  /* ── ALLER ET VENIR ──
     Ouvrir un article ajoute un pas à l'historique : le retour (bouton,
     téléphone, Échap) ramène à la rubrique d'où l'on venait. */
  /* un article ouvert directement par son adresse revient à la liste des
     catégories : il n'y a pas de rubrique derrière lui dans l'historique */
  let vuListe=false;
  function rend(){
    const l=lieu();
    if(l.article){ouvre(l.article);return;}
    ferme();
    vuListe=true;
    rendListe(l);
  }
  window.addEventListener('hashchange',rend);
  function retour(){
    if(!OUVERT)return;
    if(vuListe){history.back();return;}
    location.hash='';
  }
  $('et-retour').onclick=retour;
  $('et-bible').onclick=function(){
    if(window.LVBible&&typeof window.LVBible.bascule==='function')window.LVBible.bascule();
  };
  $('et-ia').onclick=function(){
    if(typeof qaReprend!=='function'||!OUVERT)return;
    qaReprend({texte:'',contexte:'',source:OUVERT.titre||'',espece:'un article',ref:null},OUVERT.code||'');
  };
  lvRepliBandeau(acts);
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&OUVERT&&!document.querySelector('#bp-pan.on')&&!document.documentElement.classList.contains('qa-ouvert'))retour();
  });
  rend();
})();

/* ════════════════════════════════════════════════════════════════════
   LUMEN · FONCTIONNEMENT COMMUN : OUTILS
   Pages : Articles, Ressources, Commentaires.
   Le menu d'actions, les fenêtres de choix, de saisie et de confirmation, la copie, les dates, la lecture de fichier, les cadres isolés et le suivi de la lecture.
   La fabrication pose ce fichier dans chaque page concernée, avant le script
   de la page : une correction faite ici vaut pour toutes.
   ════════════════════════════════════════════════════════════════════ */

function lvConfirm(txt,danger){
  $('conf-titre').textContent='Confirmer'; $('conf-txt').textContent=txt;
  $('conf-oui').textContent=danger?'Supprimer':'Confirmer';
  $('m-conf').classList.add('on');
  return new Promise(r=>{_res=r;});
}

function confFin(v){$('m-conf').classList.remove('on');const f=_res;_res=null;if(f)f(v);}

function lvInfo(txt){$('info-txt').textContent=txt;$('m-info').classList.add('on');}

function lvSaisie(titre,aide,valeur,marque){
  $('sai-titre').textContent=titre; $('sai-aide').textContent=aide||'';
  $('sai-aide').style.display=aide?'':'none';
  $('sai-champ').value=valeur||''; $('sai-champ').placeholder=marque||'';
  $('m-saisie').classList.add('on');
  setTimeout(()=>$('sai-champ').focus(),60);
  return new Promise(r=>{_sres=r;});
}

function saiFin(v){$('m-saisie').classList.remove('on');const f=_sres;_sres=null;if(f)f(v);}

/* ── LE MENU D'ACTIONS ──
   Une feuille : le nom de l'objet en tête, une croix pour refermer, puis
   une rangée par action, son pictogramme devant, sa précision (un nom de
   fichier, un état, un endroit) à droite. L'action qui jette est mise à
   part, en bas. Sur téléphone, la feuille monte du bas de l'écran.
   Une entrée peut porter niv (retrait dans un arbre), off (visible mais
   impossible), fort (une création), danger (ce qui jette ou supprime). */
const CHOIX_IC={
  modif:'<path d="M4.5 19.5h3.6L18.6 9a2.1 2.1 0 0 0-3-3L5.1 16.5z"/><path d="M13.8 7.8l2.9 2.9"/>',
  tel:'<path d="M12 4.5v10.5M7.5 10.5l4.5 4.5 4.5-4.5M5 19.5h14"/>',
  publier:'<circle cx="12" cy="12" r="8.2"/><path d="M3.8 12h16.4M12 3.8c2.4 2.4 2.4 14 0 16.4M12 3.8c-2.4 2.4-2.4 14 0 16.4"/>',
  ranger:'<path d="M3.5 7.2c0-.9.7-1.7 1.7-1.7h4.1l1.9 2.1h7.6c.9 0 1.7.8 1.7 1.7v8.5c0 .9-.8 1.7-1.7 1.7H5.2c-1 0-1.7-.8-1.7-1.7z"/><path d="M9.5 13.5h5.5M12.8 11.2l2.3 2.3-2.3 2.3"/>',
  sous:'<path d="M3.5 7.2c0-.9.7-1.7 1.7-1.7h4.1l1.9 2.1h7.6c.9 0 1.7.8 1.7 1.7v8.5c0 .9-.8 1.7-1.7 1.7H5.2c-1 0-1.7-.8-1.7-1.7z"/><path d="M12 10.5v6M9 13.5h6"/>',
  renom:'<path d="M4.5 7V5.5h10V7M9.5 5.5v13M7.5 18.5h4"/><path d="M15 12.5h5M17.5 12.5v6"/>',
  jeter:'<path d="M4.5 7h15M9.5 7V5.2c0-.4.3-.7.7-.7h3.6c.4 0 .7.3.7.7V7M6.5 7l.9 11.6c.1.8.7 1.4 1.5 1.4h6.2c.8 0 1.4-.6 1.5-1.4L17.5 7M10.2 10.5v6M13.8 10.5v6"/>',
  garder:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  ouvrir:'<path d="M13.5 4.5h6v6M19.5 4.5l-8 8"/><path d="M17.5 13.5v5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1h5"/>',
  haut:'<path d="M12 19V5.5M6.5 11l5.5-5.5 5.5 5.5"/>',
  bas:'<path d="M12 5v13.5M6.5 13l5.5 5.5 5.5-5.5"/>',
  ajout:'<path d="M12 5v14M5 12h14"/>',
  p:'<path d="M5 7h14M5 11h14M5 15h14M5 19h9"/>',
  titre:'<path d="M6 5v14M18 5v14M6 12h12"/>',
  cite:'<path d="M5 6.5v11M9 8h10M9 12h10M9 16h6"/>',
  verset:'<path d="M12 6.5C10.3 5.2 7.8 4.6 4 4.6v13.2c3.8 0 6.3.6 8 1.9 1.7-1.3 4.2-1.9 8-1.9V4.6c-3.8 0-6.3.6-8 1.9z"/><path d="M12 6.5v13.2"/>',
  image:'<rect x="3.5" y="5" width="17" height="14" rx="1"/><path d="M3.5 16l4.8-4.8 4 4 3-3 5.2 5.2"/><circle cx="8.6" cy="9.3" r="1.4"/>',
  code:'<path d="M9 7.5L4.5 12 9 16.5M15 7.5l4.5 4.5-4.5 4.5"/>',
  sep:'<path d="M4.5 12h15"/><circle cx="12" cy="12" r=".6"/>',
  main:'<path d="M12 3.5v17M3.5 12h17M9.5 6L12 3.5 14.5 6M9.5 18l2.5 2.5 2.5-2.5M6 9.5L3.5 12 6 14.5M18 9.5l2.5 2.5-2.5 2.5"/>',
  ia:'<path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z"/><path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
  retour:'<path d="M9 7.5L4.5 12 9 16.5"/><path d="M4.5 12h10a5 5 0 0 1 0 10h-2"/>'
};
function choixIcone(e){
  const c=e.cle;
  if(e.icone)return e.icone;
  if(c==='etat')return 'publier';
  if(e.danger||c==='avec')return 'jeter';
  const m={modif:'modif',tel:'tel',ranger:'ranger',deplacer:'ranger',sous:'sous',neuve:'sous',renom:'renom',sans:'garder',
    ouvrir:'ouvrir',haut:'haut',bas:'bas',apres:'ajout',p:'p',h2:'titre',h3:'titre',cite:'cite',verset:'verset',bib:'verset',
    image:'image',img:'image',html:'code',code:'code',sep:'sep',ia_go:'ia',ia_retour:'retour',main:'main'};
  return m[c]||'';
}
const svgChoix=k=>'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+CHOIX_IC[k]+'</svg>';
function lvChoix(titre,entrees){
  const ov=$('m-choix'), boite=ov.querySelector('.modal');
  ov.classList.add('feuille');
  /* la croix : posée une fois, dans la tête de la feuille */
  let x=$('choix-x');
  if(!x){
    x=document.createElement('button'); x.type='button'; x.id='choix-x'; x.className='feuille-x';
    x.setAttribute('aria-label','Fermer');
    x.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    boite.insertBefore(x,boite.firstChild);
  }
  $('choix-titre').textContent=titre;
  const h=$('choix-liste'); h.innerHTML='';
  const ics=entrees.map(choixIcone), avecIc=ics.some(Boolean);
  h.classList.toggle('sans-ic',!avecIc);
  return new Promise(res=>{
    entrees.forEach((e,i)=>{
      const d=document.createElement('div');
      d.className='choix'+(e.danger?' del':'')+(e.off?' off':'')+(e.fort?' fort':'');
      /* niv : le rangement se lit en retrait, comme un sommaire */
      if(e.niv)d.style.setProperty('--niv',e.niv);
      const ic=ics[i];
      d.innerHTML=(avecIc?'<b class="cx-ic">'+(ic?svgChoix(ic):'')+'</b>':'')
        +(e.niv?'<b class="cx-arbre">›</b>':'')
        +'<span>'+esc(e.nom)+'</span>'+(e.note?'<i>'+esc(e.note)+'</i>':'');
      d.setAttribute('role','button'); d.tabIndex=e.off?-1:0;
      d.onclick=()=>{if(e.off)return;CHOIX_FIN=null;ov.classList.remove('on');res(e.cle);};
      d.onkeydown=ev=>{
        if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();d.click();return;}
        /* les flèches passent d'une rangée à l'autre */
        if(ev.key==='ArrowDown'||ev.key==='ArrowUp'){
          ev.preventDefault();
          const l=[...h.querySelectorAll('.choix:not(.off)')], k=l.indexOf(d);
          const v=l[(k+(ev.key==='ArrowDown'?1:-1)+l.length)%l.length]; if(v)v.focus();
        }
      };
      h.appendChild(d);
    });
    ov.classList.add('on');
    /* le clavier entre dans le menu sur la première entrée */
    setTimeout(()=>{const p=h.querySelector('.choix:not(.off)');if(p)p.focus({preventScroll:true});},40);
    /* Échap, la croix et le clic hors de la feuille ferment aussi : la
       promesse doit se résoudre dans tous les cas */
    CHOIX_FIN=()=>{ov.classList.remove('on');res(null);};
    $('choix-annul').onclick=CHOIX_FIN;
    x.onclick=CHOIX_FIN;
  });
}

function choixFin(){const f=CHOIX_FIN;CHOIX_FIN=null;if(f)f();else $('m-choix').classList.remove('on');}

function litFichier(f){
  return new Promise((res,rej)=>{
    const r=new FileReader();
    r.onload=()=>res(String(r.result));
    r.onerror=()=>rej(r.error);
    r.readAsDataURL(f);
  });
}

function poseCadre(f,code){ if(f)f.srcdoc=pageCadre(code); }

function copiePresse(txt){
  try{
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(txt).catch(()=>copieVieille(txt));
      return;
    }
  }catch(e){}
  copieVieille(txt);
}

function hautLecture(){
  const b=document.querySelector('header');
  if(!b)return 0;
  const p=getComputedStyle(b).position;
  if(p!=='sticky'&&p!=='fixed')return 0;
  return Math.max(0,b.getBoundingClientRect().bottom);
}

function suitVue(){
  if(vuePrevue)return;
  vuePrevue=requestAnimationFrame(diffuseVue);
}

// ════════ LISTE ════════
function dateFr(iso){
  if(!iso)return '';
  const d=new Date(iso); if(isNaN(d))return '';
  return d.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});
}

/* Un commentaire affiché dans la Bible puis modifié est remis dans sa copie
   publique : sinon la Bible garde l'ancienne version sans que rien ne le dise. */
async function rafraichitPublic(a){
  if(!a||!a.publie)return true;
  try{await metEnLigne(a);return true;}catch(e){console.warn('rafraîchissement public',e);return false;}
}

function autoHauteur(el){el.style.height='auto';el.style.height=el.scrollHeight+'px';}

function marqueSale(){
  S.sale=true; S.gen=(S.gen||0)+1; $('etat-enr').textContent='Modifié'; $('etat-enr').classList.remove('vu');
  clearTimeout(S.minute); S.minute=setTimeout(enregistre,1600);
}

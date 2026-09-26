/* ════════════════════════════════════════════════════════════════════
   LUMEN · FONCTIONNEMENT COMMUN : OUTILS
   Pages : Articles, Ressources, Commentaires.
   Les fenêtres de choix, de saisie et de confirmation, la copie, les dates, la lecture de fichier, les cadres isolés et le suivi de la lecture.

   Ces fonctions étaient recopiées à l'identique dans chacune de ces pages
   (26/09). Elles vivent maintenant ici, une seule fois : le build les pose
   dans chaque page concernée, avant le script de la page, et toute
   correction faite ici vaut pour toutes ces pages à la fois.
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

/* Un article publié puis modifié doit être remis en ligne, sinon les lecteurs
   gardent l'ancienne version sans que rien ne le dise. */
async function rafraichitPublic(a){
  if(!a||!a.publie)return true;
  try{await metEnLigne(a);return true;}catch(e){console.warn('rafraîchissement public',e);return false;}
}

function autoHauteur(el){el.style.height='auto';el.style.height=el.scrollHeight+'px';}

function marqueSale(){
  S.sale=true; S.gen=(S.gen||0)+1; $('etat-enr').textContent='Modifié'; $('etat-enr').classList.remove('vu');
  clearTimeout(S.minute); S.minute=setTimeout(enregistre,1600);
}

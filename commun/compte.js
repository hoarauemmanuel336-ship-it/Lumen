/* ═════════════════════════════════════════════════════════════════
   LE COMPTE : LE SUPPRIMER
   Toute personne qui a un compte peut le supprimer, avec tout ce qu'il
   contient : un lien « Supprimer mon compte » se pose sous
   « Déconnexion », dans « Mon compte », sur chaque page. Il ouvre une
   fenêtre qui dit ce qui sera effacé, demande de confirmer son identité
   (le mot de passe, ou Google), puis efface :
   · tout l'espace du compte dans la base (users/<uid>/…), collection par
     collection, avec leurs tranches et leurs messages ;
   · ce que l'appareil gardait pour ce compte (Étude, Bible) ;
   · le compte lui-même, chez Firebase.
   Un second lien mène à la page de confidentialité et des mentions légales.
   Le compte d'Emmanuel ne voit pas le lien de suppression : le serveur le reconnaît
   (/api/meditation, qui répond « proprio ») et effacer son compte
   effacerait le site entier de ses données.
   ═════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  /* toutes les collections d'un espace de compte, anciennes comprises
     (documentation/donnees.md) */
  var COLS=['bibleNotes','categories','meta','etude_lecture','questions','qa_pieces','ia_textes',
    'art_pages','ressources','articles','res_code','art_code','commentaires','medias'];
  var IC_X='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var lien=null,fen=null,enCours=false;

  function auth(){return window.firebase&&firebase.apps&&firebase.apps.length&&firebase.auth?firebase.auth():null;}

  /* le lien, sous « Déconnexion », de la même forme que lui */
  function poseLien(){
    var deco=document.getElementById('auth-logout');
    if(!deco||lien)return;
    lien=document.createElement(deco.tagName==='BUTTON'?'button':'span');
    if(lien.tagName==='BUTTON')lien.type='button';else{lien.setAttribute('role','button');lien.tabIndex=0;}
    lien.className=deco.className+' lv-suppr-lien';
    lien.textContent='Supprimer mon compte';
    lien.hidden=true;
    deco.parentNode.insertBefore(lien,deco.nextSibling);
    lien.addEventListener('click',ouvre);
    lien.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();ouvre();}});
  }
  /* il paraît pour tout compte connecté sauf celui d'Emmanuel ; la réponse
     du serveur est gardée le temps de la visite. Un compte à l'adresse non
     confirmée n'a rien dans la base (les règles le lui interdisent) : il
     n'a que son compte à supprimer. */
  function verifie(u){
    if(!lien)return;
    if(!u){lien.hidden=true;return;}
    if(!u.emailVerified){lien.hidden=false;return;}
    var cle='lv_proprio_'+u.uid,vu=null;
    try{vu=sessionStorage.getItem(cle);}catch(_){}
    if(vu!==null){lien.hidden=vu==='1';return;}
    u.getIdToken().then(function(j){
      return fetch('/api/meditation',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+j},body:'{"action":"etat"}'});
    }).then(function(r){return r.ok?r.json():null;}).then(function(d){
      if(!d)return;
      try{sessionStorage.setItem(cle,d.proprio?'1':'0');}catch(_){}
      lien.hidden=!!d.proprio;
    }).catch(function(){});
  }

  /* ── la fenêtre ── */
  function fenetre(){
    if(fen)return fen;
    fen=document.createElement('div');
    fen.className='overlay lv-suppr';
    fen.setAttribute('role','dialog');fen.setAttribute('aria-modal','true');fen.setAttribute('aria-labelledby','lv-suppr-t');
    fen.innerHTML='<div class="modal">'
      +'<button type="button" class="feuille-x lv-suppr-x" aria-label="Fermer">'+IC_X+'</button>'
      +'<h2 class="modal-titre" id="lv-suppr-t">Supprimer mon compte</h2>'
      +'<p class="modal-txt">Votre compte et tout ce qu’il contient seront effacés pour toujours : les notes, surlignages et signets de la Bible, vos versets et leur progression dans Mémoriser, votre progression dans Étude, vos conversations avec l’IA et sa mémoire. Cela ne peut pas être annulé.</p>'
      +'<p class="modal-txt lv-suppr-id"></p>'
      +'<input class="champ lv-suppr-mdp" type="password" autocomplete="current-password" placeholder="Votre mot de passe" aria-label="Votre mot de passe">'
      +'<p class="lv-suppr-msg" role="status"></p>'
      +'<div class="modal-btns"><button type="button" class="m-annul lv-suppr-non">Annuler</button><button type="button" class="m-ok lv-suppr-oui">Supprimer</button></div>'
      +'</div>';
    document.body.appendChild(fen);
    fen.addEventListener('click',function(e){
      if(enCours)return;
      if(e.target===fen||(e.target.closest&&e.target.closest('.lv-suppr-x,.lv-suppr-non')))ferme();
      else if(e.target.closest&&e.target.closest('.lv-suppr-oui'))supprime();
    });
    fen.querySelector('.lv-suppr-mdp').addEventListener('keydown',function(e){if(e.key==='Enter')supprime();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&fen.classList.contains('on')&&!enCours)ferme();});
    return fen;
  }
  function parMotDePasse(u){return (u.providerData||[]).some(function(p){return p&&p.providerId==='password';});}
  function msg(t){fen.querySelector('.lv-suppr-msg').textContent=t||'';}
  function ouvre(){
    var a=auth(),u=a&&a.currentUser;
    if(!u)return;
    fenetre();
    var mdp=parMotDePasse(u);
    fen.querySelector('.lv-suppr-mdp').style.display=mdp?'':'none';
    fen.querySelector('.lv-suppr-mdp').value='';
    fen.querySelector('.lv-suppr-id').textContent=mdp
      ?'Pour confirmer, entrez le mot de passe de '+(u.email||'votre compte')+'.'
      :'Pour confirmer, Google vous demandera de vous reconnecter.';
    msg('');
    fen.classList.add('on');
    document.documentElement.style.overflow='hidden';
    setTimeout(function(){(mdp?fen.querySelector('.lv-suppr-mdp'):fen.querySelector('.lv-suppr-non')).focus();},50);
  }
  function ferme(){
    if(!fen)return;
    fen.classList.remove('on');
    document.documentElement.style.overflow='';
  }

  /* ── l'effacement ── */
  function videCollection(col,profond){
    return col.get().then(function(sn){
      return Promise.all(sn.docs.map(function(d){
        var sous=profond?Promise.all([videCollection(d.ref.collection('tranches'),false),videCollection(d.ref.collection('msgs'),true)]):Promise.resolve();
        return sous.then(function(){return d.ref.delete();});
      }));
    });
  }
  function effaceDonnees(uid){
    var base=firebase.firestore().collection('users').doc(uid);
    return Promise.all(COLS.map(function(c){return videCollection(base.collection(c),true);}))
      .then(function(){return base.delete().catch(function(){});});
  }
  function effaceAppareil(uid){
    try{
      var k=[],i;
      for(i=0;i<localStorage.length;i++){
        var c=localStorage.key(i);
        if(c.indexOf('lv_etu_'+uid+'_')===0||(c.indexOf('lv_bible_')===0&&localStorage.getItem('lv_bible_uid')===uid))k.push(c);
      }
      k.forEach(function(c){localStorage.removeItem(c);});
      sessionStorage.removeItem('lv_proprio_'+uid);
    }catch(_){}
  }
  function reconnecte(u){
    if(parMotDePasse(u)){
      var pw=fen.querySelector('.lv-suppr-mdp').value;
      if(!pw)return Promise.reject({code:'mdp-vide'});
      return u.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(u.email,pw));
    }
    return u.reauthenticateWithPopup(new firebase.auth.GoogleAuthProvider());
  }
  function supprime(){
    var a=auth(),u=a&&a.currentUser;
    if(!u||enCours)return;
    enCours=true;fen.classList.add('attente');msg('Vérification…');
    var uid=u.uid;
    /* La copie de l'appareil part d'abord, puis la base est vidée deux fois :
       une page ouverte (Bible, Mémoriser) qui écoute la base pourrait y
       renvoyer, entre-temps, ce qu'elle gardait en mémoire. */
    reconnecte(u).then(function(){
      msg('Effacement de vos données…');
      effaceAppareil(uid);
      if(!u.emailVerified)return null;
      return effaceDonnees(uid)
        .then(function(){return new Promise(function(r){setTimeout(r,1500);});})
        .then(function(){return effaceDonnees(uid);});
    }).then(function(){
      return u.delete();
    }).then(function(){
      enCours=false;
      fen.querySelector('.modal').innerHTML='<h2 class="modal-titre">Compte supprimé</h2><p class="modal-txt">Votre compte et vos données ont été effacés.</p>';
      setTimeout(function(){location.href='/';},2200);
    }).catch(function(e){
      enCours=false;fen.classList.remove('attente');
      var c=(e&&e.code)||'';
      msg(c==='mdp-vide'?'Entrez votre mot de passe pour confirmer.'
        :c==='auth/wrong-password'||c==='auth/invalid-credential'?'Mot de passe incorrect.'
        :c==='auth/popup-closed-by-user'||c==='auth/cancelled-popup-request'?'La confirmation avec Google a été interrompue.'
        :c==='auth/user-mismatch'?'Ce n’est pas le même compte Google.'
        :'La suppression n’a pas pu se faire. Réessayez dans un instant.');
    });
  }

  /* la base se charge après la page, et chaque page l'initialise à sa
     façon : on attend qu'elle soit prête */
  /* le lien vers la page de confidentialité et des mentions légales
     (racine/confidentialite.html) : sous « Créer un compte », pour qu'on la
     lise avant d'en créer un, et en bas de « Mon compte » */
  function poseConfid(){
    ['auth-creer','ab-creer','b-creer','auth-logout'].forEach(function(id){
      var ref=document.getElementById(id);
      if(!ref||ref.getAttribute('data-confid'))return;
      ref.setAttribute('data-confid','1');
      if(id==='auth-logout'&&lien)ref=lien;
      var a=document.createElement('a');
      a.className='lv-confid';a.href='/confidentialite.html';
      a.textContent='Confidentialité et mentions légales';
      ref.parentNode.insertBefore(a,ref.nextSibling);
    });
  }
  function demarre(n){
    poseLien();
    poseConfid();
    var a=auth();
    if(a){a.onAuthStateChanged(verifie);return;}
    if((n||0)<120)setTimeout(function(){demarre((n||0)+1);},300);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){demarre(0);});else demarre(0);
})();

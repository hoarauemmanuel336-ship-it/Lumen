/* ═══════════ ÉTUDE ═══════════
   La page s'ouvre directement sur le parcours, en plein écran, sans la
   barre du site : comme une ressource ouverte dans Ressources (« ça doit
   être tout comme Ressources »). Le même bandeau crème flotte en bas à
   gauche : le retour, la Bible, la question à l'IA sur la page ouverte.
   Le parcours vient du site même (/parcours/) : sa progression et celle des
   cours restent dans ce navigateur. « Ouvrir le cours » change la page du
   cadre ; le retour ramène alors au parcours, et du parcours à la page
   d'où l'on venait (l'accueil quand on est arrivé directement ici). Échap
   fait de même, sauf quand la Bible ou l'IA est ouverte. */
(function(){
  var f=document.getElementById('et-cadre');
  if(!f)return;
  function chemin(){try{return f.contentWindow.location.pathname;}catch(e){return '';}}
  function surCours(){return /\/parcours\/cours\//.test(chemin());}
  function retour(){
    if(surCours()){try{f.contentWindow.history.back();return;}catch(e){}}
    var r='';try{r=new URL(document.referrer).origin;}catch(e){}
    if(r===location.origin&&history.length>1)history.back();else location.href='/';
  }
  document.getElementById('et-retour').onclick=retour;
  document.getElementById('et-bible').onclick=function(){
    if(window.LVBible&&typeof window.LVBible.bascule==='function')window.LVBible.bascule();
  };
  document.getElementById('et-ia').onclick=function(){
    if(typeof qaReprend!=='function')return;
    var d=null;try{d=f.contentDocument;}catch(e){}
    var titre=(d&&d.title)||'La foi catholique';
    qaReprend({texte:'',contexte:'',source:titre,espece:surCours()?'un cours':'un parcours',ref:null},
      d?'<!DOCTYPE html>\n'+d.documentElement.outerHTML:'');
  };
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&!document.querySelector('#bp-pan.on')&&!document.documentElement.classList.contains('qa-ouvert'))retour();
  });
})();

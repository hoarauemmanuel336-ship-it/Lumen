/* ════════════════════════════════════════════════════════════════════
   LE CADRE ISOLÉ, PARTAGÉ PAR RESSOURCES ET ÉTUDE
   Une page (ressource, parcours, cours) tourne dans un cadre isolé :
   sandbox sans allow-same-origin, donc elle ne peut lire ni les comptes,
   ni les données, ni le reste de la page. Elle parle à la page par
   messages, et la page les écoute. pageCadre(code) écrit le document du
   cadre : le contenu, plus ce qui fait la lecture du site (ascenseur,
   éléments collants, place de lecture, liens internes, copies). Étude
   s'en sert pour que le parcours et ses cours se lisent « tout pareil »
   que dans Ressources.
   ════════════════════════════════════════════════════════════════════ */
function pageCadre(code){
  return '<!doctype html><html lang="fr"><head><meta charset="utf-8">'
    +'<meta name="viewport" content="width=device-width,initial-scale=1">'
    +'<style>html,body{margin:0;padding:0;background:#000;color:#fff;'
    +'font-family:Georgia,serif}*{box-sizing:border-box}'
    /* ── L'ASCENSEUR DU CADRE PORTE L'ACCENT DU SITE ──
       La feuille de style du site n'atteint pas le document du cadre : on lui
       pose les mêmes règles qu'aux pages (filet mince à l'accent, fond
       transparent) et un color-scheme sombre pour ce que le navigateur
       dessine de lui-même. */
    +'html{color-scheme:dark}'
    +'*{scrollbar-width:thin;scrollbar-color:rgba(239,230,207,.35) transparent}'
    +'::-webkit-scrollbar{width:10px;height:10px}'
    +'::-webkit-scrollbar-track{background:transparent}'
    +'::-webkit-scrollbar-thumb{background:rgba(239,230,207,.35);background-clip:content-box;border:3px solid transparent;border-radius:99px}'
    +'::-webkit-scrollbar-thumb:hover{background:rgba(239,230,207,.6);background-clip:content-box;border:3px solid transparent}'
    /* le texte reste sélectionnable au doigt : sur mobile, la copie par
       appui long reste possible */
    +'body{-webkit-user-select:text;user-select:text;-webkit-touch-callout:default}'
    /* L'ascenseur est fermé d'office : il se rouvre dès que le contenu
       dépasse l'écran (voir plus bas). Ouvert pour un écart de quelques
       pixels, il volerait sous Windows quinze pixels de largeur. */
    +'html{overflow:hidden}'
    /* Le contenu est enfermé dans une boîte mesurable. display:flow-root
       retient les marges de ses enfants : sans cela la boîte serait mesurée
       trop courte et le bas du contenu coupé. */
    +'#lv-mesure{display:flow-root}</style></he'+'ad><body>'
    +'<div id="lv-mesure">'+code+'</div>'
    /* le cadre dit ce qui y est sélectionné : « Demander à l'IA »
       (commun/question.js) */
    +(typeof QA_CADRE==='string'?QA_CADRE:'')
    +'<scr'+'ipt>(function(){'
    /* ── LA HAUTEUR EST CELLE DU DERNIER PIXEL VISIBLE ──
       Ni la hauteur de la page du cadre (elle ne descend jamais sous celle
       du cadre, donc ne ferait que grandir), ni la boîte du contenu (une
       marge basse y compterait comme une bande noire). La mesure descend
       l'arbre des éléments et retient le bord bas le plus loin. Elle emporte
       la limite de ce qu'on voit : un élément qui coupe ce qui dépasse (une
       section repliée) devient la nouvelle limite pour ses descendants, et un
       sous-arbre masqué sort du compte. Le chiffre retenu est le dernier
       pixel vu. */
    +'var w=document.getElementById("lv-mesure"),dernier=-1;'
    +'function scrute(e,coupe){var cs=getComputedStyle(e);'
    +'if(cs.display==="none"||cs.visibility==="hidden")return 0;'
    +'var r=e.getBoundingClientRect(),b=Math.min(r.bottom,coupe),m=0,i,v,k;'
    +'if(r.width||r.height)m=b;'
    +'if(cs.overflowY!=="visible"&&r.bottom<coupe)coupe=r.bottom;'
    +'k=e.children;for(i=0;i<k.length;i++){v=scrute(k[i],coupe);if(v>m)m=v;}'
    +'return m;}'
    +'function bas(){var m=0,k=w.children,i,v,c=1/0;'
    +'for(i=0;i<k.length;i++){v=scrute(k[i],c);if(v>m)m=v;}'
    +'return m+(window.pageYOffset||0);}'
    +'function h(){if(!w)return;var n=Math.ceil(bas());'
    +'if(n<=0)n=Math.ceil(Math.max(w.getBoundingClientRect().height,w.scrollHeight));'
    /* Le recensement des éléments collants est demandé à chaque mesure, même
       sans changement de hauteur : une barre de sélection qui apparaît décale
       l'accroche des titres sans rien changer à la hauteur. */
    +'planRecense();'
    +'if(n===dernier)return;dernier=n;'
    /* La boîte est taillée à cette hauteur : sans cela une marge basse rendrait
       la page du cadre défilable de quelques pixels, et le contenu glisserait
       sous le doigt sans raison visible. */
    +'w.style.height=n+"px";'
    /* ── QUI DÉFILE, ET QUAND ──
       Le cadre fait l'écran : quand le contenu le dépasse, c'est lui qui
       défile. Il le voit seul en comparant la hauteur mesurée à celle de sa
       fenêtre. */
    +'document.documentElement.style.overflow=(n>window.innerHeight+1)?"auto":"hidden";}'
    /* ── CE QUI COLLE EN HAUT SUIT LA LECTURE ──
       Le cadre recense ses éléments « collants » ; celui qui est passé
       au-dessus du haut de l'écran glisse jusque-là par une translation
       (fluide, sans refaire la mise en page), sans sortir de son bloc. */
    +'var vueHaut=0,collants=[],attente=0;'
    /* Chaque recensement remet à zéro les translations qu'il a posées avant de
       refaire sa liste : un titre qui ne colle plus (section repliée)
       retrouve sa place au lieu de rester figé plus bas. */
    +'function recense(){var j;for(j=0;j<collants.length;j++){'
    +'collants[j].e.style.transform="";collants[j].d=0;}'
    +'collants=[];var l=w.getElementsByTagName("*"),i,cs,t;'
    +'for(i=0;i<l.length;i++){cs=getComputedStyle(l[i]);'
    +'if(cs.position==="sticky"){t=parseFloat(cs.top);'
    +'if(t===t)collants.push({e:l[i],t:t,d:0});}}'
    +'colle();}'
    /* Le recensement se refait après chaque ouverture ou repli de section. Le
       délai laisse l'animation finir et ramène une cascade de mesures à un
       seul parcours. */
    +'function planRecense(){clearTimeout(attente);attente=setTimeout(recense,180);}'
    /* La position naturelle se retrouve en retirant la translation déjà posée :
       une translation ne change rien à la mise en page, le bloc parent garde
       donc sa vraie boîte et sert de butée basse. */
    +'function colle(){var i,s,e,p,r,pr,nat,d,max;'
    +'for(i=0;i<collants.length;i++){s=collants[i];e=s.e;p=e.parentElement;'
    +'if(!p)continue;r=e.getBoundingClientRect();nat=r.top-s.d;'
    +'pr=p.getBoundingClientRect();d=vueHaut+s.t-nat;if(d<0)d=0;'
    +'max=pr.bottom-nat-r.height;if(max<0)max=0;if(d>max)d=max;'
    +'if(d!==s.d){s.d=d;e.style.transform=d?("translateY("+d+"px)"):"";}}}'
    /* ── LA PLACE OÙ L'ON EN ÉTAIT ──
       En plein écran, le cadre défile : lui seul sait où le lecteur s'est
       arrêté. Il le dit à la page, qui le garde et le lui rend à la
       réouverture. Plusieurs tentatives, car le contenu s'installe (polices,
       images, sections) après les premières images. */
    /* ── LA PLACE SE RETROUVE SUR UN AUTRE ÉCRAN (Emmanuel : « harmonise ça
       entre mobile et pc ») ──
       Un nombre de pixels ne vaut que pour une même largeur d'écran. Le cadre
       retient donc aussi un repère : l'élément qui passe vers le tiers de
       l'écran (hors barres collantes), désigné par son chemin dans le
       contenu, et la fraction de lui-même qui s'y trouve. Même largeur : le
       chiffre sert tel quel ; autre largeur : on ramène le repère au même
       endroit de l'écran. */
    +'var posVoulue=-1,posInfo=null,posDit=0;'
    +'function chemin(e){var p=[];while(e&&e!==w){var q=e.parentElement;if(!q)return null;p.unshift(Array.prototype.indexOf.call(q.children,e));e=q;}return e===w?p:null;}'
    +'function suit(p){var e=w,i;for(i=0;i<p.length;i++){e=e.children[p[i]];if(!e)return null;}return e;}'
    +'function colleDedans(e){while(e&&e!==w){var s=getComputedStyle(e).position;if(s==="sticky"||s==="fixed")return true;e=e.parentElement;}return false;}'
    +'function repere(){var H=window.innerHeight,X=window.innerWidth/2,f=[.3,.45,.6,.2],i,y,e,r,p;'
    +'for(i=0;i<f.length;i++){y=H*f[i];e=document.elementFromPoint(X,y);'
    +'if(!e||e===w||!w.contains(e)||colleDedans(e))continue;'
    +'r=e.getBoundingClientRect();if(r.height<1)continue;p=chemin(e);if(!p)continue;'
    +'return {p:p,f:(y-r.top)/r.height,v:f[i]};}return null;}'
    +'function ditPos(){posDit=0;var y=Math.round(window.pageYOffset||document.documentElement.scrollTop||0),a=null;'
    +'try{a=repere();}catch(e){}'
    +'try{parent.postMessage({lvPos:y,lvPosInfo:{y:y,l:window.innerWidth,h:document.documentElement.scrollHeight,a:a}},"*");}catch(e){}}'
    +'function planPos(){if(posDit)return;posDit=setTimeout(ditPos,220);}'
    +'window.addEventListener("scroll",planPos,{passive:true});'
    /* ── LE GESTE DU LECTEUR CLÔT LA REPRISE ──
       La place est reposée plusieurs fois, le temps que le contenu s'installe.
       Le premier geste du lecteur (molette, doigt, clavier) y met fin : c'est
       lui qui mène, sans être ramené en arrière. */
    +'var posGeste=0;'
    +'function siGeste(){posGeste=1;}'
    +'window.addEventListener("wheel",siGeste,{passive:true});'
    +'window.addEventListener("touchstart",siGeste,{passive:true});'
    +'window.addEventListener("keydown",siGeste);'
    +'function cible(){var i=posInfo;if(!i||!(i.l>0)||Math.abs(i.l-window.innerWidth)<=2)return posVoulue;'
    +'if(i.a&&i.a.p){var e=suit(i.a.p);if(e){var r=e.getBoundingClientRect();'
    +'if(r.height>0)return (window.pageYOffset||0)+r.top+i.a.f*r.height-i.a.v*window.innerHeight;}}'
    +'if(i.h>0)return i.y/i.h*document.documentElement.scrollHeight;return posVoulue;}'
    +'function reposeToi(){if(posGeste||posVoulue<0)return;var m=Math.max(0,document.documentElement.scrollHeight-window.innerHeight);'
    +'window.scrollTo(0,Math.max(0,Math.min(Math.round(cible()),m)));}'
    +'window.addEventListener("message",function(e){var d=e.data;if(!d)return;'
    +'if(typeof d.lvRevoir==="number"){posVoulue=d.lvRevoir;posInfo=d.lvRevoirInfo||null;reposeToi();'
    +'setTimeout(reposeToi,150);setTimeout(reposeToi,500);setTimeout(reposeToi,1200);}'
    +'});'
    /* ── LES LIENS INTERNES DU CONTENU RESTENT CHEZ LUI ──
       Le cadre est écrit par srcdoc : son adresse de base est celle de la
       page, si bien qu'un lien « #ch13 » chargerait ressources.html dans le
       cadre à la place du contenu. Ces liens sont donc pris au clic : on
       cherche la cible dans le contenu et on l'amène en haut. Si le cadre
       défile, c'est lui qui bouge ; sinon il demande à la page de porter la
       lecture à la bonne hauteur. */
    +'document.addEventListener("click",function(e){'
    +'if(e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;'
    +'var a=e.target&&e.target.closest?e.target.closest("a"):null;if(!a)return;'
    +'var h=a.getAttribute("href")||"";if(h.charAt(0)!=="#"||h.length<2)return;'
    +'var id=decodeURIComponent(h.slice(1));'
    +'var c=document.getElementById(id)||document.getElementsByName(id)[0];if(!c)return;'
    +'e.preventDefault();'
    +'var libre=document.documentElement.scrollHeight>window.innerHeight+1;'
    +'if(libre){c.scrollIntoView({block:"start"});}'
    +'else{try{parent.postMessage({lvAncre:Math.round(c.getBoundingClientRect().top+(window.pageYOffset||0))},"*");}catch(e2){}}'
    +'},false);'
    +'window.addEventListener("load",function(){h();recense();});'
    /* la fenêtre du cadre change de taille au passage en plein écran comme à
       la rotation de l'appareil : on remesure, et le défilement se rouvre ou
       se referme selon ce que le contenu demande */
    +'window.addEventListener("resize",function(){h();planRecense();});'
    +'setTimeout(h,120);setTimeout(h,600);setTimeout(recense,700);'
    /* ── QUI SURVEILLE QUOI ──
       La boîte est fermée à la hauteur mesurée et ne bouge plus : on surveille
       donc les éléments qu'elle contient, eux qui grandissent et rétrécissent. */
    +'if(window.ResizeObserver){var ro=new ResizeObserver(h),k;'
    +'for(k=0;k<w.children.length;k++)ro.observe(w.children[k]);'
    +'if(!w.children.length)ro.observe(w);}'
    /* ── LA COPIE PASSE PAR LA PAGE ──
       En bac à sable sans allow-same-origin, le cadre est d'origine opaque :
       le navigateur lui refuse le presse-papier sans le dire. On intercepte
       l'appel et la page, qui en a le droit, fait le travail. La tentative
       directe est gardée : là où elle passe, elle passe. */
    +'function relais(t){try{parent.postMessage({lvCopie:String(t)},"*");}catch(e){}}'
    /* ── LA COPIE SE FAIT SUR PLACE, DANS LE GESTE, ET PAR LA PAGE ──
       Le relais arrive par message, donc après le geste : certains navigateurs
       (Brave) refusent alors le presse-papier à la page. On copie donc aussi
       ici même, pendant le clic, par la vieille commande de copie, qui n'a
       besoin que du geste.
       Les deux sont tentées à chaque fois : la vieille commande répond
       « réussi » même quand l'écriture a été bloquée dans un cadre en bac à
       sable, sa réponse ne peut donc pas décider du relais. Deux écritures du
       même texte ne coûtent rien. */
    /* ── OÙ SE POSE LE CHAMP DE COPIE ──
       À la hauteur du doigt : sélectionner un champ l'amène à l'écran, et un
       champ posé ailleurs ferait sauter la lecture à chaque copie. Le focus
       est demandé sans défilement. */
    +'var lvY=0;'
    +'function lvPose(e){var y=e&&e.pageY;if(typeof y==="number"&&y>=0)lvY=y;}'
    +'document.addEventListener("pointerdown",lvPose,true);'
    +'document.addEventListener("click",lvPose,true);'
    +'function surPlace(t){try{var z=document.createElement("textarea");z.value=String(t);'
    +'z.setAttribute("readonly","");'
    /* rendu mais invisible (masqué, rien ne serait sélectionnable) ; 16px,
       sinon iOS zoome de lui-même à la sélection */
    +'z.style.cssText="position:absolute;left:0;width:1px;height:1px;padding:0;border:0;font-size:16px;opacity:0";'
    +'z.style.top=Math.max(0,lvY-8)+"px";'
    +'document.body.appendChild(z);var ok=false;'
    +'try{try{z.focus({preventScroll:true});}catch(e2){z.focus();}'
    +'if(z.setSelectionRange)z.setSelectionRange(0,999999);'
    +'var s=window.getSelection(),r=document.createRange();r.selectNodeContents(z);'
    +'s.removeAllRanges();s.addRange(r);ok=document.execCommand("copy");'
    +'s.removeAllRanges();}catch(e){}'
    +'document.body.removeChild(z);return ok;}catch(e){return false;}}'
    +'try{var nat=(navigator.clipboard&&navigator.clipboard.writeText)?navigator.clipboard.writeText.bind(navigator.clipboard):null;'
    +'Object.defineProperty(navigator,"clipboard",{configurable:true,value:{'
    +'writeText:function(t){var v=String(t);surPlace(v);relais(v);'
    +'if(nat)return nat(v).catch(function(){return undefined;});return Promise.resolve();},'
    +'readText:function(){return Promise.reject(new Error("indisponible"));}}});}catch(e){}'
    +'})();</scr'+'ipt>'
    /* Balise fermante coupée en deux : la fabrication injecte son script sur
       la première balise de fermeture du corps qu'elle trouve dans le
       fichier, et tomberait sinon au milieu de cette chaîne. Elle reste
       coupée, et cette balise ne s'écrit en clair nulle part avant la vraie,
       en fin de page, commentaires compris. */
    +'</bo'+'dy></html>';
}

/* ════════════════════════════════════════════════════════════════════
   LUMEN · FONCTIONNEMENT COMMUN : ASSEMBLAGE DES PAGES DES SKILLS
   Quatre skills d'Emmanuel (livre-html, diagrammes-interactifs,
   cours-html, parcours-etude) font écrire à l'IA un simple « contenu »,
   puis un assembleur Python le pose dans leur moteur (gabarit, style,
   script, polices) pour donner une page autonome.
   Ce fichier refait ce même assemblage dans le navigateur, pour que le
   site fabrique une page à partir d'un contenu sans passer par Python :
   balises courtes déployées, typographie française, progression remise
   dans l'en-tête, titre tiré du contenu.
   Il suit l'assembleur de chaque skill caractère pour caractère : une
   même entrée donne la même page, octet pour octet. Toute retouche d'un
   assembleur Python se reporte ici dans le même mouvement.
   Les fichiers du moteur viennent de /ia-moteurs/<skill>/, copie des
   dossiers « moteur » de ia/skills/.
   La fermeture d'un script et l'ouverture d'un commentaire HTML
   s'écrivent ici en morceaux ou échappées : ce fichier est posé tel quel
   dans une balise script des pages, que le navigateur lirait sinon de
   travers.
   L'inclusion de fichiers (<inclure fichier="…"/>) n'a pas cours ici :
   le contenu arrive déjà complet, en une seule chaîne.
   ════════════════════════════════════════════════════════════════════ */

/* ── LES CLASSES DE CARACTÈRES DE PYTHON ──
   Python lit \w, \s et \b selon Unicode, JavaScript selon l'ASCII : les
   classes s'écrivent donc ici en clair. \s de Python compte aussi les
   séparateurs \x1c à \x1f et \x85, et ignore ﻿. */
const LV_AS_W='[\\p{L}\\p{N}_]';
const LV_AS_S='[\\t\\n\\v\\f\\r\\x1c-\\x20\\x85\\xa0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000]';
const LV_AS_NS='[^\\t\\n\\v\\f\\r\\x1c-\\x20\\x85\\xa0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000]';
/* \b devant un mot (« \btitre ») et après un mot (« <livre\b ») */
const LV_AS_DEBUT='(?<!'+LV_AS_W+')';
const LV_AS_FIN='(?!'+LV_AS_W+')';
const lvAsRe=(motif,drapeaux)=>new RegExp(motif,'u'+(drapeaux||''));

/* str.strip() de Python, avec ses propres blancs */
function lvAsStrip(s){
  return s.replace(lvAsRe('^'+LV_AS_S+'+'),'').replace(lvAsRe(LV_AS_S+'+$'),'');
}

/* html.escape de Python : & < > toujours, " et ' quand quote est vrai */
function lvAsEchappe(s,quote){
  s=s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  if(quote)s=s.replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
  return s;
}

/* ── html.unescape DE PYTHON ──
   Les références numériques suivent les tables de Python (Windows-1252
   pour 0x80 à 0x9f, caractères interdits retirés). Les références
   nommées passent par le navigateur, qui tient la même table HTML5 et
   la même règle du plus long nom reconnu ; seule la suite de lettres et
   de chiffres lui est confiée, le reste revient tel quel. */
const LV_AS_REMPLACES={0:'�',13:'\r',128:'€',129:'\x81',130:'‚',131:'ƒ',132:'„',133:'…',134:'†',135:'‡',136:'ˆ',137:'‰',138:'Š',139:'‹',140:'Œ',141:'\x8d',142:'Ž',143:'\x8f',144:'\x90',145:'‘',146:'’',147:'“',148:'”',149:'•',150:'–',151:'—',152:'˜',153:'™',154:'š',155:'›',156:'œ',157:'\x9d',158:'ž',159:'Ÿ'};
function lvAsInterdit(n){
  return (n>=0x1&&n<=0x8)||n===0xb||(n>=0xe&&n<=0x1f)||(n>=0x7f&&n<=0x9f)||
    (n>=0xfdd0&&n<=0xfdef)||(n&0xfffe)===0xfffe;
}
let LV_AS_ZONE=null;
function lvAsNomme(ref){
  if(!LV_AS_ZONE)LV_AS_ZONE=document.createElement('textarea');
  LV_AS_ZONE.innerHTML=ref;
  return LV_AS_ZONE.value;
}
function lvAsDeschappe(s){
  if(s.indexOf('&')<0)return s;
  return s.replace(/&(#[0-9]+;?|#[xX][0-9a-fA-F]+;?|[^\t\n\f <&#;]{1,32};?)/g,(tout,r)=>{
    if(r[0]==='#'){
      const hexa=r[1]==='x'||r[1]==='X';
      const n=parseInt(r.slice(hexa?2:1).replace(/;$/,''),hexa?16:10);
      if(Object.prototype.hasOwnProperty.call(LV_AS_REMPLACES,n))return LV_AS_REMPLACES[n];
      if((n>=0xd800&&n<=0xdfff)||n>0x10ffff)return '�';
      if(lvAsInterdit(n))return '';
      return String.fromCodePoint(n);
    }
    /* aucun nom de la table n'a moins de deux lettres */
    const m=/^[A-Za-z0-9]+;?/.exec(r);
    if(!m||m[0].replace(/;$/,'').length<2)return tout;
    return lvAsNomme('&'+m[0])+r.slice(m[0].length);
  });
}

/* ── LA TYPOGRAPHIE FRANÇAISE ──
   Chaque skill a la sienne : l'apostrophe partout (livre, parcours),
   entre deux lettres seulement (cours) ou jamais (diagramme) ; l'espace
   des guillemets est insécable, ou fine insécable pour le cours. Les
   entités HTML déjà écrites (&amp;, &#8217;…) restent intactes : le
   texte se traite entre elles, morceau par morceau. */
const LV_AS_ENTITE=lvAsRe('(&#?'+LV_AS_W+'+;)');
function lvAsTypographe(apostrophe,guillemet){
  const blancs='[ \\u00a0\\u202f]*';
  const ponct=lvAsRe(blancs+'([;!?])','g');
  const deuxPoints=lvAsRe('(?<='+LV_AS_NS+')'+blancs+':(?='+LV_AS_S+'|$)','g');
  const ouvre=lvAsRe('«'+blancs,'g');
  const ferme=lvAsRe(blancs+'»','g');
  const apos=lvAsRe('(?<='+LV_AS_W+")'(?="+LV_AS_W+')','g');
  const typo=texte=>{
    if(LV_AS_ENTITE.test(texte))
      return texte.split(LV_AS_ENTITE).map((m,i)=>i%2?m:typo(m)).join('');
    if(apostrophe==='tout')texte=texte.replace(/'/g,'’');
    else if(apostrophe==='mot')texte=texte.replace(apos,'’');
    texte=texte.replace(ponct,(_,p)=>' '+p);
    texte=texte.replace(deuxPoints,' :');
    texte=texte.replace(ouvre,'«'+guillemet);
    texte=texte.replace(ferme,guillemet+'»');
    return texte;
  };
  return typo;
}

/* Le texte et les attributs de texte reçoivent la typographie, jamais le
   code d'un bloc <style> ou <script> (ni <code> et <pre> pour le cours).
   Le livre laisse aussi les commentaires HTML tels quels. */
function lvAsTypoContenu(contenu,R){
  const morceaux=contenu.split(/(<[^>]*>)/);
  let aPart=false;
  for(let i=0;i<morceaux.length;i++){
    const m=morceaux[i];
    if(m.startsWith('<')){
      const bas=m.toLowerCase();
      let attrs=true;
      if(R.code_ouvre(bas)){aPart=true;attrs=R.attrs_sur_code;}
      else if(R.code_ferme(bas)){aPart=false;attrs=R.attrs_sur_code;}
      else if(R.sans_commentaires&&m.startsWith('<!'+'--'))attrs=false;
      if(attrs)morceaux[i]=m.replace(R.attrs,(_,nom,val)=>nom+'="'+R.typo(val)+'"');
    }else if(!aPart){
      morceaux[i]=R.typo(m);
    }
  }
  return morceaux.join('');
}

/* <carte ... /> devient <carte ...></carte> pour les balises de la skill */
function lvAsDeploie(contenu,balises){
  const re=lvAsRe('<('+balises+')('+LV_AS_S+'[^<>]*?)?'+LV_AS_S+'*/>','g');
  return contenu.replace(re,(_,nom,attrs)=>'<'+nom+(attrs||'')+'></'+nom+'>');
}

/* le titre de la page : l'attribut lu, entités rendues, balises ôtées */
function lvAsTitre(contenu,motifs,defaut){
  for(const motif of motifs){
    const m=lvAsRe(motif).exec(contenu);
    if(m)return lvAsDeschappe(m[1]).replace(/<[^>]+>/g,'');
  }
  return defaut;
}

/* ── LES QUATRE SKILLS ── */
const lvAsDebutCode=bas=>bas.startsWith('<style')||bas.startsWith('<script');
const lvAsFinCode=bas=>bas.startsWith('</style')||bas.startsWith('</scr'+'ipt');
const LV_AS_CODE_OUVRE=lvAsRe('^<(style|script|code|pre)'+LV_AS_FIN);
const LV_AS_CODE_FERME=lvAsRe('^</(style|script|code|pre)'+LV_AS_FIN);
const LV_AS_SKILLS={
  'livre-html':{
    balises:'livre|partie|chapitre|chapo|intertitre|citation|inclure',
    typo:lvAsTypographe('tout',' '),
    attrs:lvAsRe(LV_AS_DEBUT+'(titre|sous-titre|surtitre|bandeau|resume|etiquette|ref)="([^"]*)"','g'),
    code_ouvre:lvAsDebutCode, code_ferme:lvAsFinCode, attrs_sur_code:false, sans_commentaires:true,
    titres:['<livre'+LV_AS_FIN+'[^>]*'+LV_AS_DEBUT+'titre="([^"]*)"'], defaut:'Livre',
    cles:['TITRE','POLICES','CSS','CONTENU','JS'], guillemets_titre:true
  },
  'diagrammes-interactifs':{
    balises:'diagramme|bloc|section|groupe|carte|libre|explication|volet',
    typo:lvAsTypographe('aucune',' '),
    /* sans \b dans l'assembleur du diagramme : data-titre="…" compte aussi */
    attrs:lvAsRe('(titre|sous-titre|desc|nom|repere)="([^"]*)"','g'),
    code_ouvre:lvAsDebutCode, code_ferme:lvAsFinCode, attrs_sur_code:true, sans_commentaires:false,
    titres:['<diagramme'+LV_AS_FIN+'[^>]*'+LV_AS_DEBUT+'titre="([^"]*)"'], defaut:'Diagramme',
    cles:['TITRE','POLICES','CSS','CONTENU','JS'], guillemets_titre:true
  },
  'cours-html':{
    balises:'fichier|cours|introduction|lecon|objectifs|prerequis|commencer|partie|definition|exemple|'+
      'attention|retenir|reperes|repere|verifie|reponse|cartes|carte|libre|essentiel|mots-cles|mot|'+
      'exercices|exercice|corrige|autoevaluation|je-sais|bilan|progression',
    typo:lvAsTypographe('mot',' '),
    attrs:lvAsRe(LV_AS_DEBUT+'(titre|sous-titre|desc|nom|sujet|question|terme|note)="([^"]*)"','g'),
    code_ouvre:bas=>LV_AS_CODE_OUVRE.test(bas),
    code_ferme:bas=>LV_AS_CODE_FERME.test(bas),
    attrs_sur_code:true, sans_commentaires:false,
    titres:['<fichier'+LV_AS_FIN+'[^>]*'+LV_AS_DEBUT+'sujet="([^"]*)"','<cours'+LV_AS_FIN+'[^>]*'+LV_AS_DEBUT+'titre="([^"]*)"'],
    defaut:'Cours',
    cles:['TITRE','POLICES','CSS','PROGRESSION','CONTENU','JS'], guillemets_titre:true
  },
  'parcours-etude':{
    balises:'parcours|bloc|theme|sujet|explication',
    typo:lvAsTypographe('tout',' '),
    attrs:lvAsRe('(sujet|titre|sous-titre|desc|nom)="([^"]*)"','g'),
    code_ouvre:lvAsDebutCode, code_ferme:lvAsFinCode, attrs_sur_code:true, sans_commentaires:false,
    titres:['<parcours'+LV_AS_FIN+'[^>]*'+LV_AS_DEBUT+'sujet="([^"]*)"'], defaut:'Parcours',
    /* le parcours n'a pas de {{POLICES}} : les polices précèdent le style */
    cles:['TITRE','CSS','PROGRESSION','CONTENU','JS'], guillemets_titre:false
  }
};

/* ── LES FICHIERS DU MOTEUR ──
   Lus une fois par visite. Les fins de ligne sont ramenées à \n, comme
   Python les lit. */
const LV_AS_MOTEURS=new Map();
function lvAsMoteur(skill,nom){
  const k=skill+'/'+nom;
  if(!LV_AS_MOTEURS.has(k)){
    const p=fetch('/ia-moteurs/'+k).then(r=>{
      if(!r.ok)throw new Error('Moteur introuvable : '+k);
      return r.text();
    }).then(t=>t.replace(/\r\n?/g,'\n'));
    p.catch(()=>LV_AS_MOTEURS.delete(k));
    LV_AS_MOTEURS.set(k,p);
  }
  return LV_AS_MOTEURS.get(k);
}

/* ── LECTURE DU JSON À LA MANIÈRE DE PYTHON ──
   La progression se lit comme json.loads la lit : NaN et Infinity
   admis, entiers exacts, clés gardées dans leur ordre d'écriture (un
   objet JavaScript rangerait d'abord les clés numériques). Chaque valeur
   garde sa sorte : o objet, a liste, s texte, i entier, f décimal,
   b booléen, n null. */
function lvAsJson(texte){
  if(texte.startsWith('﻿'))throw new Error('json');
  let i=0;
  const blanc=()=>{while(i<texte.length&&' \t\n\r'.includes(texte[i]))i++;};
  const faute=()=>{throw new Error('json');};
  const chaine=()=>{
    const m=/^"(?:[^"\\\x00-\x1f]|\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4}))*"/.exec(texte.slice(i));
    if(!m)faute();
    i+=m[0].length;
    return JSON.parse(m[0]);
  };
  const valeur=()=>{
    const c=texte[i];
    if(c==='{'){
      i++;blanc();
      const m=new Map();
      if(texte[i]==='}'){i++;return {t:'o',v:m};}
      for(;;){
        if(texte[i]!=='"')faute();
        const cle=chaine();blanc();
        if(texte[i]!==':')faute();
        i++;blanc();
        m.set(cle,valeur());blanc();
        if(texte[i]==='}'){i++;return {t:'o',v:m};}
        if(texte[i]!==',')faute();
        i++;blanc();
      }
    }
    if(c==='['){
      i++;blanc();
      const l=[];
      if(texte[i]===']'){i++;return {t:'a',v:l};}
      for(;;){
        l.push(valeur());blanc();
        if(texte[i]===']'){i++;return {t:'a',v:l};}
        if(texte[i]!==',')faute();
        i++;blanc();
      }
    }
    if(c==='"')return {t:'s',v:chaine()};
    const mots=[['null',{t:'n'}],['true',{t:'b',v:true}],['false',{t:'b',v:false}],
      ['NaN',{t:'f',v:NaN}],['Infinity',{t:'f',v:Infinity}],['-Infinity',{t:'f',v:-Infinity}]];
    for(const [mot,v] of mots)if(texte.startsWith(mot,i)){i+=mot.length;return v;}
    const n=/^(-?(?:0|[1-9][0-9]*))(\.[0-9]+)?([eE][-+]?[0-9]+)?/.exec(texte.slice(i));
    if(!n)faute();
    i+=n[0].length;
    return (n[2]||n[3])?{t:'f',v:Number(n[0])}:{t:'i',v:BigInt(n[1])};
  };
  blanc();
  const v=valeur();
  blanc();
  if(i<texte.length)faute();
  return v;
}

/* int() de Python sur la valeur de « maj » ; null quand Python lève
   ValueError ou TypeError, ce qui la ramène à 0 */
function lvAsEntier(v){
  if(v.t==='i')return v.v;
  if(v.t==='b')return v.v?1n:0n;
  if(v.t==='f'){
    if(Number.isNaN(v.v))return null;
    if(!Number.isFinite(v.v))throw new Error('Progression illisible : « maj » est infini.');
    return BigInt(Math.trunc(v.v));
  }
  if(v.t==='s'){
    const s=lvAsStrip(v.v);
    if(!/^[+-]?[0-9]+(?:_[0-9]+)*$/.test(s))return null;
    return BigInt(s.replace(/_/g,''));
  }
  return null;
}
const lvAsVide=v=>!v||v.t==='n'||(v.t==='b'&&!v.v)||((v.t==='i'||v.t==='f')&&v.v==0)||
  ((v.t==='s'||v.t==='a')&&!v.v.length)||(v.t==='o'&&!v.v.size);

/* ── LA PROGRESSION DU COURS ──
   Seuls « maj » (un entier positif) et les clés acquises valides
   passent ; le bloc s'écrit comme json.dumps(indent=1), chevrons
   échappés pour ne pas fermer le <script> qui le porte. */
function lvAsProgressionCours(texte){
  let p=null;
  try{p=lvAsJson(texte);}catch(_){p=null;}
  const champs=p&&p.t==='o'?p.v:new Map();
  const acquis=[];
  const a=champs.get('acquis');
  if(a&&a.t==='o')a.v.forEach((v,k)=>{
    if(v.t==='b'&&v.v===true&&/^[A-Za-z0-9._-]{1,80}\n?$/.test(k))acquis.push(k);
  });
  const brut=champs.get('maj');
  let maj=lvAsVide(brut)?0n:lvAsEntier(brut);
  if(maj===null||maj<0n)maj=0n;
  return {maj,acquis};
}
function lvAsBlocCours(p){
  const acq=p.acquis.length
    ?'{\n'+p.acquis.map(k=>'  "'+k.replace(/\n/g,'\\n')+'": true').join(',\n')+'\n }'
    :'{}';
  return ('{\n "maj": '+p.maj.toString()+',\n "acquis": '+acq+'\n}').replace(/</g,'\\u003c');
}

/* ── LETTRES DES COURS ET CLÉS DES AFFIRMATIONS ──
   Les lettres manquantes des cours et les clés manquantes des « Je
   sais… » se posent dans le contenu ; celles déjà écrites restent. */
function lvAsAttr(balise,nom){
  const m=lvAsRe(LV_AS_DEBUT+nom+'="([^"]*)"').exec(balise);
  return m?lvAsDeschappe(m[1]):null;
}
const lvAsSansAccents=s=>(s||'').normalize('NFD').replace(/\p{Mn}/gu,'').toLowerCase();
function lvAsIdentifie(contenu){
  const prises=new Set([...contenu.matchAll(lvAsRe('<cours'+LV_AS_FIN+'[^>]*'+LV_AS_DEBUT+'lettre="([a-z])"','g'))].map(m=>m[1]));
  const cles=new Set([...contenu.matchAll(lvAsRe('<je-sais'+LV_AS_FIN+'[^>]*'+LV_AS_DEBUT+'cle="([^"]*)"','g'))].map(m=>m[1]));
  const etat={cours:0,lettre:'l',lecon:0,rang:0};
  const vides=['le','la','les','l','de','du','des','d','un','une','et','a','au','aux','en'];
  const lettrePour=(titre,premier)=>{
    if(premier&&!prises.has('l'))return 'l';
    const mots=(lvAsSansAccents(titre).match(/[a-z]+/g)||[]).filter(m=>!vides.includes(m));
    for(const c of mots.map(m=>m[0]).join('')+mots.join('')+'abcdefghijkmnopqrstuvwxyz')
      if(c>='a'&&c<='z'&&!prises.has(c))return c;
    return 'z';
  };
  return contenu.replace(lvAsRe('<(cours|lecon|je-sais)'+LV_AS_FIN+'[^>]*>','g'),(balise,nom)=>{
    if(nom==='cours'){
      etat.cours++;
      etat.lecon=0;
      let l=lvAsAttr(balise,'lettre');
      if(!l){
        l=lettrePour(lvAsAttr(balise,'titre')||'',etat.cours===1);
        prises.add(l);
        balise=balise.replace('<cours',()=>'<cours lettre="'+l+'"');
      }
      etat.lettre=l;
    }else if(nom==='lecon'){
      etat.lecon++;
      etat.rang=0;
    }else{
      etat.rang++;
      if(!lvAsAttr(balise,'cle')){
        let i=etat.rang, cle;
        for(;;){
          cle=etat.lettre+String(etat.lecon).padStart(2,'0')+'.'+i;
          if(!cles.has(cle))break;
          i++;
        }
        cles.add(cle);
        balise=balise.replace('<je-sais',()=>'<je-sais cle="'+cle+'"');
      }
    }
    return balise;
  });
}

/* ── LA PROGRESSION DU PARCOURS ──
   Gardée telle qu'écrite quand c'est un objet JSON, neuve sinon. */
const LV_AS_PROG_NEUVE='{"maj":0,"sujets":{}}';
function lvAsProgressionParcours(texte){
  try{
    const p=lvAsJson(texte);
    if(p.t!=='o')return LV_AS_PROG_NEUVE;
  }catch(_){return LV_AS_PROG_NEUVE;}
  return lvAsStrip(texte).replace(/</g,'\\u003c');
}

/* ── L'ASSEMBLAGE ──
   skill : 'livre-html', 'diagrammes-interactifs', 'cours-html' ou
   'parcours-etude' ; contenu : le texte écrit par l'IA.
   Rend {html, titre} : la page autonome et son titre en texte simple. */
async function lvAssemble(skill,contenu){
  const R=LV_AS_SKILLS[skill];
  if(!R)throw new Error('Skill inconnue : '+skill);
  if(typeof contenu!=='string')throw new Error('Contenu absent.');
  const [gabarit,polices,css,js]=await Promise.all(
    ['gabarit.html','polices.css','moteur.css','moteur.js'].map(f=>lvAsMoteur(skill,f)));
  contenu=contenu.replace(/\r\n?/g,'\n');
  let progression='';

  if(skill==='livre-html'){
    contenu=lvAsDeploie(lvAsStrip(contenu),R.balises);
  }else if(skill==='diagrammes-interactifs'){
    contenu=lvAsDeploie(contenu,R.balises);
  }else if(skill==='cours-html'){
    contenu=lvAsDeploie(contenu,R.balises);
    /* la progression portée par le contenu rejoint le bloc de l'en-tête */
    let p={maj:0n,acquis:[]};
    const m=lvAsRe('<progression>([\\s\\S]*?)</progression>'+LV_AS_S+'*').exec(contenu);
    if(m){
      p=lvAsProgressionCours(m[1]);
      contenu=contenu.slice(0,m.index)+contenu.slice(m.index+m[0].length);
    }
    progression=lvAsBlocCours(p);
    contenu=lvAsIdentifie(lvAsStrip(contenu));
  }else{
    progression=LV_AS_PROG_NEUVE;
    const m=lvAsRe('<script'+LV_AS_FIN+'[^>]*'+LV_AS_DEBUT+'id=["\']lv-progression["\'][^>]*>([\\s\\S]*?)<\\/script>'+LV_AS_S+'*','i').exec(contenu);
    if(m){
      progression=lvAsProgressionParcours(lvAsStrip(m[1]));
      contenu=contenu.slice(0,m.index)+contenu.slice(m.index+m[0].length);
    }
    contenu=lvAsDeploie(lvAsStrip(contenu),R.balises);
  }

  contenu=lvAsTypoContenu(contenu,R);
  const titre=lvAsTitre(contenu,R.titres,R.defaut);
  const morceaux={
    TITRE:lvAsEchappe(titre,R.guillemets_titre),
    POLICES:polices,
    CSS:skill==='parcours-etude'?polices+'\n'+css:css,
    PROGRESSION:progression,
    CONTENU:contenu,
    JS:js
  };
  const html=gabarit.replace(new RegExp('\\{\\{('+R.cles.join('|')+')\\}\\}','g'),(_,k)=>morceaux[k]);
  return {html,titre};
}

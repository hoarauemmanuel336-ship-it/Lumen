(function(){
const R=document.getElementById('pr'),T=document.getElementById('pr-contenu').content,P=T.querySelector('phrases');
const final=R.classList.contains('final');
const sujet=P.getAttribute('sujet')||'';
const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
const coche='<svg width="11" height="11" viewBox="0 0 12 12"><path d="M2.5 2.5l7 7M9.5 2.5l-7 7" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="square"/></svg>';
const ent=el('div','entete'),g=el('div');
g.append(el('div','tag mono',final?'VERSION FINALE':'PHRASES À RETENIR'),el('div','sujet',sujet));
if(!final)g.append(el('p','accueil',P.getAttribute('accueil')||'Coche les phrases qui te déplaisent ; celles que tu laisses sans coche sont gardées telles quelles.'));
ent.append(g);R.append(ent);
const liste=[];let n=0;
P.querySelectorAll(':scope > partie, :scope > definition').forEach(p=>{
 const def=p.tagName.toLowerCase()==='definition';
 const titre=p.getAttribute('titre')||(def?'Définition':'');
 let num='';if(!def){n++;num=p.getAttribute('num')||String(n).padStart(2,'0')}
 const b=el('div','part'),h=el('div','head');
 if(num)h.append(el('span','num mono',num));
 h.append(el('span','ttl',titre));b.append(h);
 p.querySelectorAll('phrase').forEach(s=>{
  const d=el('div','ph');
  if(!final)d.append(el('div','box',coche));
  d.append(el('p','txt',s.innerHTML));
  if(!final)d.append(el('span','rv mono','À REVOIR'));
  liste.push({d,titre,texte:s.textContent.trim()});b.append(d);
 });
 R.append(b);
});
if(final){
 const bw=el('div','bw'),bt=el('div','btn mono','Masquer pour réciter');bw.style.marginTop='0';bw.append(bt);ent.append(bw);
 bt.addEventListener('click',()=>{const c=R.classList.toggle('cache');liste.forEach(x=>x.d.classList.remove('vu'));bt.textContent=c?'Tout afficher':'Masquer pour réciter'});
 liste.forEach(x=>x.d.addEventListener('click',()=>{if(R.classList.contains('cache'))x.d.classList.toggle('vu')}));
 return;
}
const rem=el('div','part rem'),hr=el('div','head');hr.append(el('span','ttl','Ce qui déplaît'));
const ta=el('textarea');ta.placeholder='Écris ici ce qui te gêne dans les phrases cochées…';rem.append(hr,ta);R.append(rem);
const bw=el('div','bw'),bt=el('div','btn mono choix-btn','Tout garder ↗');bw.append(bt);R.append(bw);
const maj=()=>{const k=liste.filter(x=>x.d.classList.contains('on')).length;bt.textContent=k?'Réécrire les phrases cochées ('+k+') ↗':'Tout garder ↗'};
liste.forEach(x=>x.d.addEventListener('click',()=>{x.d.classList.toggle('on');maj()}));
bt.addEventListener('click',()=>{
 const on=liste.filter(x=>x.d.classList.contains('on')),off=liste.filter(x=>!x.d.classList.contains('on'));
 const f=l=>l.map(x=>x.titre+' : '+x.texte).join('\n');
 let m='Phrases à retenir, « '+sujet+' »\n\n';
 if(!on.length)m+='Toutes les phrases présentées sont gardées.';
 else m+='À réécrire :\n'+f(on)+'\n\nRemarques : '+(ta.value.trim()||'aucune')+'\n\nGardées :\n'+(off.length?f(off):'aucune');
 if(typeof sendPrompt==='function')sendPrompt(m);
 bt.textContent='Envoyé';
});
})();

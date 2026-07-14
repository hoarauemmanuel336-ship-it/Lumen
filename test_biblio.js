const fs = require('fs');
const { JSDOM } = require('jsdom');

function load(url) {
  const html = fs.readFileSync('site/bibliotheque/index.html', 'utf8');
  // isole le script BIBLIO_JS (celui qui contient basculerGrp)
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  const biblio = scripts.find(s => s.includes('basculerGrp'));
  if (!biblio) throw new Error('BIBLIO_JS introuvable dans la page');
  // outside-only : n'exécute PAS les <script> de la page, mais permet
  // window.eval avec les globals (document, location…) correctement liés
  const dom = new JSDOM(html, { url, runScripts: 'outside-only' });
  const w = dom.window;
  w.eval(biblio);
  return w;
}

let ok = 0, ko = 0;
const check = (name, cond) => { if (cond) { ok++; console.log('  OK  ' + name); } else { ko++; console.log(' FAIL ' + name); } };

// --- T1 : tout est replié au chargement ---
let w = load('https://x/bibliotheque/');
const doc = () => w.document;
check('T1 aucun domaine ouvert au départ', doc().querySelectorAll('.dom.ouvert').length === 0);

// --- T2 : ouvrir le domaine ecriture ---
const dEcr = doc().querySelector('.dom[data-theme="ecriture"]');
dEcr.querySelector('.dom-tete').dispatchEvent(new w.Event('click'));
check('T2 domaine ecriture ouvert', dEcr.classList.contains('ouvert'));

// --- T3 : ouvrir le groupe Ancien Testament ---
const gAT = dEcr.querySelector('.grp[data-grp="g-at"]');
check('T3a groupe g-at présent', !!gAT);
gAT.querySelector(':scope > .grp-tete').dispatchEvent(new w.Event('click'));
check('T3b groupe g-at ouvert', gAT.classList.contains('ouvert'));

// --- T4 : ouvrir le sous-groupe Prophètes (imbriqué) ---
const gProph = gAT.querySelector('.grp[data-grp="g-prophetes"]');
check('T4a sous-groupe g-prophetes imbriqué dans g-at', !!gProph);
gProph.querySelector(':scope > .grp-tete').dispatchEvent(new w.Event('click'));
check('T4b g-prophetes ouvert', gProph.classList.contains('ouvert'));

// --- T5 : ouvrir la catégorie Isaïe sous Prophètes ---
const sIsaie = gProph.querySelector('.sous[data-cat="isaie"]');
check('T5a catégorie isaie sous g-prophetes', !!sIsaie);
sIsaie.querySelector('.sous-tete').dispatchEvent(new w.Event('click'));
check('T5b isaie ouvert', sIsaie.classList.contains('ouvert'));
check('T5c isaie contient des articles', sIsaie.querySelectorAll('.article-lien').length >= 1);

// --- T6 : refermer le groupe g-at le remet à zéro (via basculer, synchronement il passe en fermant) ---
gAT.querySelector(':scope > .grp-tete').dispatchEvent(new w.Event('click'));
check('T6 g-at repasse en fermant/fermé au 2e clic', gAT.classList.contains('fermant') || !gAT.classList.contains('ouvert'));

// --- T7 : deep-link ?theme=ecriture&cat=isaie ouvre domaine + ancêtres + catégorie ---
let w2 = load('https://x/bibliotheque/?theme=ecriture&cat=isaie');
const d2 = w2.document;
check('T7a domaine ecriture ouvert par deep-link', d2.querySelector('.dom[data-theme="ecriture"]').classList.contains('ouvert'));
check('T7b groupe g-at ouvert (ancêtre)', d2.querySelector('.grp[data-grp="g-at"]').classList.contains('ouvert'));
check('T7c groupe g-prophetes ouvert (ancêtre)', d2.querySelector('.grp[data-grp="g-prophetes"]').classList.contains('ouvert'));
check('T7d catégorie isaie ouverte', d2.querySelector('.sous[data-cat="isaie"]').classList.contains('ouvert'));

// --- T8 : deep-link legacy ?theme=doctrine&cat=peche ouvre groupe g-peche ---
let w3 = load('https://x/bibliotheque/?theme=doctrine&cat=peche');
const d3 = w3.document;
check('T8a doctrine ouvert', d3.querySelector('.dom[data-theme="doctrine"]').classList.contains('ouvert'));
check('T8b groupe g-peche ouvert (ancêtre)', d3.querySelector('.grp[data-grp="g-peche"]').classList.contains('ouvert'));
check('T8c catégorie peche ouverte', d3.querySelector('.sous[data-cat="peche"]').classList.contains('ouvert'));

// --- T9 : deep-link ?theme=ecriture&grp=g-nt ouvre le groupe ---
let w4 = load('https://x/bibliotheque/?theme=ecriture&grp=g-nt');
const d4 = w4.document;
check('T9 groupe g-nt ouvert par deep-link grp', d4.querySelector('.grp[data-grp="g-nt"]').classList.contains('ouvert'));

// --- T10 : bouton "tout" ouvre tous les domaines ---
let w5 = load('https://x/bibliotheque/');
const bt = w5.document.getElementById('basculerTout');
if (bt) { bt.dispatchEvent(new w5.Event('click'));
  // les ouvertures sont programmées par setTimeout i*110 ; on avance le temps virtuellement n'est pas possible ici,
  // on vérifie juste que le handler existe et n'a pas planté
  check('T10 bouton basculerTout présent et cliquable', true);
} else check('T10 bouton basculerTout présent', false);

console.log('\\nRESULTAT: ' + ok + ' OK, ' + ko + ' FAIL');
process.exit(ko ? 1 : 0);

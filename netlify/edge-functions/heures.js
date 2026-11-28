/* ============================================================
   LUMEN — la Liturgie des Heures du jour
   Sert à la page « Liturgie des Heures » (racine/heures.html) le texte
   d'un office du jour : office des lectures, laudes, tierce, sexte, none,
   vêpres ou complies. La source est l'AELF (Association épiscopale
   liturgique pour les pays francophones), zone « france », dans sa
   traduction officielle ; la page le dit et renvoie vers aelf.org.

   L'office arrive déjà mis en ordre : une suite de parties, chacune avec
   son nom (« Hymne », « Psaume 91 », « Oraison »…), sa référence et son
   texte, nettoyé par netlify/serveur/aelf.js.
   ============================================================ */

import { propre, texte } from '../serveur/aelf.js';

const SOURCE = 'https://api.aelf.org/v1/';
const OFFICES = ['lectures', 'laudes', 'tierce', 'sexte', 'none', 'vepres', 'complies'];

function json(corps, statut, cache) {
  return new Response(JSON.stringify(corps), {
    status: statut,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': cache ? 'public, max-age=21600' : 'no-store'
    }
  });
}

/* « CANTIQUE de Moïse (Dt 32) » devient « Cantique de Moïse (Dt 32) »,
   « NUÉE DE FEU » devient « Nuée de feu » */
function adoucit(s) {
  const t = texte(s);
  /* un titre tout en capitales passe en minuscules, sa première lettre exceptée */
  if (t && t === t.toUpperCase() && /[A-ZÀ-Ü]/.test(t)) return t.charAt(0) + t.slice(1).toLowerCase();
  return t.replace(/\b([A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ]{3,})\b/g, m => m.charAt(0) + m.slice(1).toLowerCase());
}

const NOTRE_PERE = '<p>Notre Père, qui es aux cieux,<br>que ton nom soit sanctifié,<br>que ton règne vienne,<br>que ta volonté soit faite sur la terre comme au ciel.<br>'
  + 'Donne-nous aujourd’hui notre pain de ce jour.<br>Pardonne-nous nos offenses,<br>comme nous pardonnons aussi à ceux qui nous ont offensés.<br>'
  + 'Et ne nous laisse pas entrer en tentation<br>mais délivre-nous du Mal.<br>Amen.</p>';

/* ───────── Les parties de l'office, dans l'ordre de l'AELF ───────── */
function nomPsaume(ref) {
  const r = adoucit(ref);
  if (!r) return 'Psaume';
  return /^\d/.test(r) ? 'Psaume ' + r : r;
}
function parties(o) {
  const l = [];
  const met = (nom, html, ref, sous) => {
    const t = propre(html);
    if (t) l.push({ nom, ref: ref ? texte(ref) : '', sous: sous ? adoucit(sous) : '', texte: t, sorte: 'texte' });
  };
  const antienne = html => {
    const t = propre(html);
    if (t) l.push({ nom: 'Antienne', texte: t, sorte: 'antienne' });
  };
  for (const [cle, v] of Object.entries(o || {})) {
    if (v == null || v === '' || (Array.isArray(v) && !v.length)) continue;
    if (/^antienne/.test(cle)) { antienne(v); continue; }
    if (/^psaume/.test(cle) && typeof v === 'object') {
      met(cle === 'psaume_invitatoire' ? 'Psaume invitatoire' : nomPsaume(v.reference), v.texte, cle === 'psaume_invitatoire' ? 'Psaume ' + texte(v.reference) : '');
      continue;
    }
    switch (cle) {
      case 'introduction': met('Introduction', v); break;
      case 'hymne': met('Hymne', v.texte, '', v.titre); break;
      case 'hymne_mariale': met('Antienne mariale', v.texte, '', v.titre); break;
      case 'verset_psaume': met('Verset', v); break;
      case 'lecture': met('Lecture', v.texte, v.reference, v.titre); break;
      case 'repons_lecture':
      case 'repons_patristique':
      case 'repons': met('Répons', v); break;
      case 'titre_patristique': break;
      case 'texte_patristique': met('Lecture patristique', v, '', o.titre_patristique); break;
      case 'te_deum': met('Te Deum', typeof v === 'object' && !Array.isArray(v) ? v.texte : v); break;
      case 'pericope': met('Parole de Dieu', v.texte, v.reference); break;
      case 'cantique_zacharie':
      case 'cantique_mariale':
      case 'cantique_symeon': met(adoucit(v.titre) || 'Cantique', v.texte, v.reference); break;
      case 'intercession': met('Intercession', v); break;
      /* l'AELF n'en donne que le nom : la prière se dit en entier */
      case 'notre_pere': met('Notre Père', NOTRE_PERE); break;
      case 'oraison': met('Oraison', v); break;
      case 'benediction': met('Bénédiction', v); break;
      default:
        if (typeof v === 'string') met(cle.charAt(0).toUpperCase() + cle.slice(1).replace(/_/g, ' '), v);
        else if (v && v.texte) met(adoucit(v.titre) || cle.charAt(0).toUpperCase() + cle.slice(1).replace(/_/g, ' '), v.texte, v.reference);
    }
  }
  return l;
}

export default async (req) => {
  const u = new URL(req.url);
  const date = u.searchParams.get('date') || '';
  const office = u.searchParams.get('office') || '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ erreur: 'date' }, 400);
  if (!OFFICES.includes(office)) return json({ erreur: 'office' }, 400);
  try {
    const r = await fetch(SOURCE + office + '/' + date + '/france', { headers: { accept: 'application/json' } });
    if (!r.ok) return json({ erreur: 'source', statut: r.status }, 502);
    const d = await r.json();
    const inf = d.informations || {};
    const l = parties(d[office]);
    if (!l.length) return json({ erreur: 'vide' }, 502);
    return json({
      date,
      office,
      info: {
        fete: texte(inf.fete || inf.jour_liturgique_nom || ''),
        couleur: texte(inf.couleur || ''),
        semaine: texte(inf.semaine || '')
      },
      parties: l
    }, 200, true);
  } catch (e) {
    return json({ erreur: 'reseau' }, 502);
  }
};

export const config = { path: '/api/heures' };

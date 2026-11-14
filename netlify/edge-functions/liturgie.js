/* ============================================================
   LUMEN — la liturgie du jour, pour l'accueil
   L'accueil calcule lui-même le calendrier (contenu/liturgie/) ; ce
   passage lui apporte ce qu'aucun calcul ne donne : les lectures de la
   messe du jour en France, et l'intitulé officiel de la célébration.
   La source est l'AELF (Association épiscopale liturgique pour les pays
   francophones), zone « france ».

   Seules les références des lectures sont transmises, jamais leur texte :
   l'accueil les ouvre dans la Bible du site, Chérubin ou Séraphin.
   La porte (porte.js) garde ce passage comme le reste du site.
   ============================================================ */

const SOURCE = 'https://api.aelf.org/v1/messes/';

function json(corps, statut, cache) {
  return new Response(JSON.stringify(corps), {
    status: statut,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': cache ? 'private, max-age=21600' : 'no-store'
    }
  });
}

/* Le jour de messe principal : la « messe du jour » quand une fête en a
   plusieurs (veille, nuit, aurore, jour), sinon la première. */
function messeDuJour(messes) {
  if (!Array.isArray(messes) || !messes.length) return null;
  return messes.find(m => /du jour/i.test(m.nom || '')) || messes[0];
}

export default async (req) => {
  const date = new URL(req.url).searchParams.get('date') || '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ erreur: 'date' }, 400);
  try {
    const r = await fetch(SOURCE + date + '/france', { headers: { accept: 'application/json' } });
    if (!r.ok) return json({ erreur: 'source', statut: r.status }, 502);
    const d = await r.json();
    const inf = d.informations || {};
    const messe = messeDuJour(d.messes);
    const lectures = messe && Array.isArray(messe.lectures)
      ? messe.lectures.map(l => ({ type: String(l.type || ''), ref: String(l.ref || '') })).filter(l => l.ref)
      : [];
    return json({
      date,
      info: {
        fete: inf.fete || inf.jour_liturgique_nom || '',
        degre: inf.degre || '',
        couleur: inf.couleur || '',
        semaine: inf.semaine || ''
      },
      messe: messe ? String(messe.nom || '') : '',
      lectures
    }, 200, true);
  } catch (e) {
    return json({ erreur: 'reseau' }, 502);
  }
};

export const config = { path: '/api/liturgie' };

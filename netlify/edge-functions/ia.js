/* ============================================================
   LUMEN — l'IA (19/10)
   La seule porte du site vers l'IA d'Anthropic. Elle garde la clé
   de l'API Claude hors des pages : la clé vit dans la variable
   ANTHROPIC_API_KEY, réglée dans Netlify (Site configuration →
   Environment variables), et n'est jamais envoyée au navigateur.

   Avant chaque demande, la fonction vérifie auprès de Google que la
   demande vient bien du compte d'Emmanuel, connecté et vérifié. Tout
   autre compte, ou une demande sans compte, est refusé : personne
   d'autre ne peut se servir de l'IA ni dépenser le crédit.

   Chaque tâche a son modèle, choisi pour ce qu'elle demande :
   - ranger (Articles, Ressources) : Claude Sonnet 5.5. Réorganiser
     toute une bibliothèque demande du jugement ; Sonnet le fait
     presque aussi finement qu'Opus, plus vite et pour moitié prix
     (choix du 19/10, au meilleur rapport qualité-prix).

   La réponse de l'IA est relayée telle quelle, au fil de l'eau : la
   page la lit à mesure qu'elle arrive, et un long rangement ne bute
   sur aucun délai d'attente.
   ============================================================ */

const PROPRIETAIRE = 'hoarauemmanuel336@gmail.com';
/* la clé PUBLIQUE de Firebase, celle qui figure déjà dans les pages :
   elle sert seulement à demander à Google qui est connecté */
const CLE_FIREBASE = 'AIzaSyC19lFNWUd-KYhCP4o7gpp0IcyfRTyHOyA';

const MODELES = {
  ranger: 'claude-sonnet-5-5',
};

function json(corps, statut) {
  return new Response(JSON.stringify(corps), {
    status: statut,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

/* Google dit à qui appartient le jeton de connexion, et s'il est
   encore valable */
async function quiEst(jeton) {
  if (!jeton) return null;
  const r = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + CLE_FIREBASE, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ idToken: jeton }),
  }).catch(() => null);
  if (!r || !r.ok) return null;
  const j = await r.json().catch(() => null);
  const u = j && j.users && j.users[0];
  return u ? { email: String(u.email || '').toLowerCase(), verifie: !!u.emailVerified } : null;
}

/* ── RANGER ──
   L'IA reçoit le rangement actuel (catégories et sections) et la
   liste des éléments (titre, description, endroit actuel), et rend
   le nouveau rangement complet. */
const SCHEMA_RANGER = {
  type: 'object',
  properties: {
    rubriques: {
      type: 'array',
      items: {
        type: 'object',
        properties: { id: { type: 'string' }, nom: { type: 'string' }, parent: { type: 'string' } },
        required: ['id', 'nom', 'parent'],
        additionalProperties: false,
      },
    },
    placements: {
      type: 'array',
      items: {
        type: 'object',
        properties: { id: { type: 'string' }, rub: { type: 'string' } },
        required: ['id', 'rub'],
        additionalProperties: false,
      },
    },
    resume: { type: 'string' },
  },
  required: ['rubriques', 'placements', 'resume'],
  additionalProperties: false,
};

function consigneRanger(espece) {
  const quoi = espece === 'articles'
    ? 'des articles au format question-réponse : chacun porte une question en titre et une réponse brève en description'
    : 'des ressources d’étude : livres, diagrammes, cours, parcours d’étude, cartes, images, documents et liens';
  return `Tu ranges la bibliothèque personnelle d’étude d’un catholique. Elle contient ${quoi}. Les sujets relèvent surtout de l’Écriture, de la théologie, de la liturgie, de l’histoire de l’Église et de la philosophie, lues selon la tradition catholique.

Tu reçois le rangement actuel et la liste des éléments. Tu rends le rangement complet que tu juges le meilleur : tu peux garder, renommer, fusionner, déplacer et supprimer les catégories et sections existantes, et en créer de nouvelles.

Forme du rangement :
- Le premier niveau, ce sont les catégories : de grands domaines, peu nombreux, qui se comprennent d’un coup d’œil. En dessous viennent les sections, puis des sous-sections quand un domaine est assez fourni pour le demander. La profondeur va jusqu’à cinq niveaux, catégorie comprise ; un rangement simple se lit mieux qu’un rangement profond.
- Chaque catégorie ou section contient au moins un élément, directement ou dans ses sections.
- Les noms sont courts, en français, avec une majuscule au premier mot et aux noms propres seulement, et la typographie française (apostrophe courbe, espaces avant « : ; ! ? »).
- L’ordre suit la logique du sujet : l’ordre des livres de la Bible, la chronologie, ou le chemin qui va des fondements vers les approfondissements.

Ce que tu rends :
- rubriques : la liste complète des catégories et sections du nouveau rangement. Une rubrique que tu gardes ou renommes conserve son id. Une rubrique nouvelle reçoit un id de ta main, de la forme n1, n2, n3… Le parent d’une catégorie est la chaîne vide ; celui d’une section est l’id de la rubrique qui la contient. L’ordre de la liste donne l’ordre d’affichage entre rubriques sœurs.
- placements : chaque élément, une fois et une seule, avec l’id de la rubrique où il va (la chaîne vide pour le laisser hors de tout rangement, ce qui reste exceptionnel). L’ordre des placements donne l’ordre d’affichage des éléments à l’intérieur d’une même rubrique.
- resume : une ou deux phrases en français qui disent au lecteur comment la bibliothèque est désormais organisée.`;
}

async function demandeRanger(donnees) {
  const espece = donnees && donnees.espece === 'articles' ? 'articles' : 'ressources';
  const etat = {
    rubriques: (donnees.rubriques || []).map(r => ({ id: String(r.id), nom: String(r.nom || ''), parent: String(r.parent || '') })),
    elements: (donnees.elements || []).map(e => ({
      id: String(e.id), titre: String(e.titre || ''), description: String(e.description || ''),
      type: String(e.type || ''), rubrique_actuelle: String(e.rubrique_actuelle || ''),
    })),
  };
  return {
    model: MODELES.ranger,
    max_tokens: 64000,
    stream: true,
    system: consigneRanger(espece),
    messages: [{ role: 'user', content: 'Voici la bibliothèque à ranger :\n\n' + JSON.stringify(etat) }],
    output_config: { format: { type: 'json_schema', schema: SCHEMA_RANGER } },
  };
}

const TACHES = { ranger: demandeRanger };

export default async (request) => {
  if (request.method !== 'POST') return json({ erreur: 'Méthode non permise.' }, 405);

  const cle = (typeof Netlify !== 'undefined' && Netlify.env.get('ANTHROPIC_API_KEY')) || '';
  if (!cle) return json({ erreur: 'cle', message: 'La clé de l’API Claude n’est pas encore réglée dans Netlify.' }, 503);

  const jeton = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const u = await quiEst(jeton);
  if (!u) return json({ erreur: 'compte', message: 'Connexion expirée : rechargez la page, puis réessayez.' }, 401);
  if (u.email !== PROPRIETAIRE || !u.verifie) return json({ erreur: 'compte', message: 'Ce compte n’a pas accès à l’IA.' }, 403);

  const corps = await request.json().catch(() => null);
  const tache = corps && TACHES[corps.tache];
  if (!tache) return json({ erreur: 'tache', message: 'Tâche inconnue.' }, 400);

  const demande = await tache(corps.donnees || {});
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': cle,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify(demande),
  }).catch(() => null);
  if (!r) return json({ erreur: 'reseau', message: 'Le service de l’IA ne répond pas. Réessayez dans un instant.' }, 502);
  if (!r.ok) {
    const t = await r.text().catch(() => '');
    let m = '';
    try { m = JSON.parse(t).error.message; } catch (_) { m = t.slice(0, 300); }
    return json({ erreur: 'api', statut: r.status, message: m }, 502);
  }
  /* le fil de la réponse, relayé tel quel */
  return new Response(r.body, {
    status: 200,
    headers: { 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-store' },
  });
};

export const config = { path: '/api/ia' };

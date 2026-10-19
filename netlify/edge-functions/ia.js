/* ============================================================
   LUMEN — l'IA
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
     presque aussi finement qu'Opus, plus vite et pour moitié prix :
     le meilleur rapport qualité-prix pour cette tâche.
   - controler (le contrôle qualité d'un article ou d'une ressource) :
     Claude Opus 5.5, avec réflexion. Relire le fond d'un contenu
     (doctrine, citations, exactitude) est un travail exigeant, où une
     erreur manquée coûte plus cher que la relecture ; Opus le fait au
     niveau voulu pour deux fois moins que Fable.
   - corriger (la correction d'une page d'après son contrôle qualité) :
     Claude Opus 5.5, avec réflexion. Corriger sans abîmer le reste de
     la page demande la même finesse que la relecture.

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
  controler: 'claude-opus-5-5',
  corriger: 'claude-opus-5-5',
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

/* ── CONTRÔLER ──
   Le contrôle qualité d'une page HTML (article ou ressource). L'IA
   reçoit la page entière, telle qu'elle est enregistrée, et le texte
   des deux Bibles du site pour chaque référence que la page cite. Elle
   rend un constat : elle ne corrige rien, Emmanuel décide ensuite. */
const SCHEMA_CONTROLER = {
  type: 'object',
  properties: {
    bilan: { type: 'string' },
    points: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          gravite: { type: 'string', enum: ['grave', 'a_revoir', 'mineur'] },
          domaine: { type: 'string', enum: ['fond', 'ecriture', 'forme', 'fonctionnement'] },
          endroit: { type: 'string' },
          extrait: { type: 'string' },
          constat: { type: 'string' },
          correction: { type: 'string' },
        },
        required: ['gravite', 'domaine', 'endroit', 'extrait', 'constat', 'correction'],
        additionalProperties: false,
      },
    },
  },
  required: ['bilan', 'points'],
  additionalProperties: false,
};

function consigneControler(espece, marque) {
  const quoi = espece === 'articles'
    ? 'un article au format question-réponse : une question en titre, une réponse brève en tête qui répond vraiment à la question, puis la réponse développée en parties. Il s’adresse à la fois au novice, qui découvre le sujet, et au lecteur confirmé qui veut approfondir'
    : 'une ressource d’étude' + (marque ? ' (' + marque.toLowerCase() + ')' : '') + ', écrite pour qu’Emmanuel apprenne seul, sans autre source';
  return `Tu fais le contrôle qualité d’une page HTML de la bibliothèque personnelle d’étude d’Emmanuel, un catholique. Cette page est ${quoi}. Emmanuel ne code pas : il lira ton rapport en langage courant, puis décidera lui-même de ce qu’il fait corriger. Tu ne réécris pas la page, tu en dresses le constat.

Tu reçois la page entière, telle qu’elle est enregistrée, puis le texte des deux Bibles du site (la Chérubin, traduction par défaut, et la Séraphin, littérale) pour chaque référence que la page cite.

Ce que tu examines :

1. Le fond. L’exactitude des faits, des dates, des noms et des attributions. La conformité à la doctrine et à la théologie de l’Église catholique, appuyée sur les Pères, la Tradition et le Magistère. La cohérence interne : une partie s’accorde avec les autres, ce qui est annoncé est tenu. Chaque terme technique est expliqué au moment où il apparaît.

2. L’Écriture. Chaque citation biblique se compare au texte de référence fourni : les mots, le livre, le chapitre, les versets. Une citation reprend la Chérubin ou la Séraphin ; quand elle s’écarte des deux, tu le signales. Le verset dit bien ce que la page lui fait dire, lu dans son contexte. Le format attendu : le texte en italique entre guillemets français, la référence en gras juste après, au format « Genèse 44:2-3 », les versets qui se suivent réunis en une seule citation. Un mot de la langue d’origine (hébreu, grec, araméen, latin) se présente avec sa langue, sa translittération en italique et le mot français qui le traduit dans le passage ; tu vérifies que le sens donné est juste. Pour une référence absente des textes fournis, tu t’appuies sur ta connaissance et tu le précises.

3. La forme. L’orthographe, la grammaire, les accords. La typographie française : guillemets « », apostrophe courbe, espaces insécables avant « : ; ! ? ». La clarté de l’expression. L’apparence telle que le code la dessine : lisibilité, éléments qui se chevauchent ou débordent, tenue sur téléphone, unité de la mise en page.

4. Le fonctionnement. Ce que fait le code de la page : boutons, sections qui se déplient, réglages, sommaire, liens internes, progression. Tu signales ce qui ne marcherait pas, ce qui renvoie à une partie absente, et ce qui empêcherait la page de s’afficher. Tu le dis en mots simples, sans noms de fonctions ni extraits de code.

Ce que tu rends :
- bilan : deux à quatre phrases sur l’état général de la page, ses qualités comme ses faiblesses, et ce qui presse le plus.
- points : chaque problème trouvé, du plus grave au plus léger.
  · gravite : « grave » pour une erreur de fond, une affirmation contraire à la doctrine, une citation fausse ou mal attribuée, une partie de la page qui ne fonctionne pas ; « a_revoir » pour une imprécision, une explication qui manque, une incohérence, une citation mal présentée ; « mineur » pour une faute d’orthographe ou de typographie, une tournure maladroite.
  · domaine : fond, ecriture, forme ou fonctionnement.
  · endroit : où se trouve le problème, pour qu’Emmanuel le retrouve d’un coup d’œil (la partie, le titre de la section, l’élément de la page).
  · extrait : le passage fautif, cité mot pour mot et brièvement ; la chaîne vide quand le problème ne tient pas dans une citation.
  · constat : ce qui ne va pas et pourquoi, en une ou deux phrases simples.
  · correction : ce qu’il faudrait mettre à la place, ou ce qu’il faudrait faire.

Tu rapportes chaque problème réel une fois, en regroupant les fautes répétées du même genre en un seul point qui dit où elles reviennent. Quand tu doutes, tu le dis dans le constat (« à vérifier »). Une page sans défaut reçoit une liste vide et un bilan qui le dit. Tout est en français, avec la typographie française.`;
}

async function demandeControler(donnees) {
  const espece = donnees && donnees.espece === 'articles' ? 'articles' : 'ressources';
  const marque = String(donnees.marque || '');
  const versets = (donnees.versets || []).slice(0, 300).map(v => ({
    reference: String(v.ref || ''), cherubin: String(v.cherubin || ''), seraphin: String(v.seraphin || ''),
  }));
  const html = String(donnees.html || '');
  return {
    model: MODELES.controler,
    max_tokens: 48000,
    stream: true,
    thinking: { type: 'adaptive' },
    system: consigneControler(espece, marque),
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: 'Titre : ' + String(donnees.titre || 'Sans titre') + '\n\nLa page à contrôler :\n\n' + html },
        { type: 'text', text: 'Les textes de référence des versets cités (' + versets.length + ') :\n\n' + JSON.stringify(versets) },
      ],
    }],
    output_config: { effort: 'high', format: { type: 'json_schema', schema: SCHEMA_CONTROLER } },
  };
}

/* ── CORRIGER ──
   L'IA reçoit la page, les problèmes du contrôle qu'Emmanuel a retenus
   et les versets cités. Elle ne réécrit pas la page entière (un livre
   dépasserait ce qu'elle peut rendre d'un coup) : elle rend une liste de
   remplacements, chacun un passage exact de la page et ce qui le
   remplace. La page les applique elle-même. */
const SCHEMA_CORRIGER = {
  type: 'object',
  properties: {
    modifications: {
      type: 'array',
      items: {
        type: 'object',
        properties: { point: { type: 'integer' }, ancien: { type: 'string' }, nouveau: { type: 'string' } },
        required: ['point', 'ancien', 'nouveau'],
        additionalProperties: false,
      },
    },
    laisses: {
      type: 'array',
      items: {
        type: 'object',
        properties: { point: { type: 'integer' }, raison: { type: 'string' } },
        required: ['point', 'raison'],
        additionalProperties: false,
      },
    },
    resume: { type: 'string' },
  },
  required: ['modifications', 'laisses', 'resume'],
  additionalProperties: false,
};

const CONSIGNE_CORRIGER = `Tu corriges une page HTML de la bibliothèque personnelle d’étude d’Emmanuel, un catholique, d’après le contrôle qualité qui vient d’en être fait. Tu reçois le code source de la page, les problèmes qu’Emmanuel a retenus (numérotés), et le texte des deux Bibles du site (la Chérubin, traduction par défaut, et la Séraphin, littérale) pour chaque référence que la page cite.

Tu rends tes corrections sous forme de remplacements :
- ancien : un passage copié du code source caractère pour caractère, balises, entités, espaces et espaces insécables compris, tel qu’il figure dans la page. Il est assez long pour n’apparaître qu’une seule fois dans la page.
- nouveau : ce qui le remplace, dans le même code, avec le même balisage et les mêmes classes que le reste de la page.
- point : le numéro du problème que ce remplacement corrige.

Un problème peut demander plusieurs remplacements : une faute répétée reçoit un remplacement par endroit. Tu changes ce que chaque problème demande et rien d’autre ; tout le reste de la page reste tel quel. Une correction s’accorde avec le reste de la page : même ton, même mise en forme, même structure.

Les règles du contenu : lecture selon la doctrine et la théologie de l’Église catholique ; une citation biblique reprend le texte fourni, de la Chérubin, ou de la Séraphin quand la page cite déjà la Séraphin à cet endroit, en italique entre guillemets français, la référence en gras après, au format « Genèse 44:2-3 » ; un mot de la langue d’origine se présente avec sa langue, sa translittération en italique et le mot français qui le traduit ; typographie française (guillemets « », apostrophe courbe, espaces insécables avant « : ; ! ? ») ; un terme technique s’explique au moment où il apparaît.

Quand un problème retenu te paraît faux après réflexion, ou impossible à corriger sans qu’Emmanuel tranche, tu le mets dans laisses avec sa raison, en une phrase simple. resume dit en une ou deux phrases ce qui a été corrigé, en français.`;

async function demandeCorriger(donnees) {
  const points = (donnees.points || []).slice(0, 200).map((p, i) => ({
    numero: i + 1, gravite: String(p.gravite || ''), domaine: String(p.domaine || ''), endroit: String(p.endroit || ''),
    extrait: String(p.extrait || ''), constat: String(p.constat || ''), correction: String(p.correction || ''),
  }));
  const versets = (donnees.versets || []).slice(0, 300).map(v => ({
    reference: String(v.ref || ''), cherubin: String(v.cherubin || ''), seraphin: String(v.seraphin || ''),
  }));
  return {
    model: MODELES.corriger,
    max_tokens: 64000,
    stream: true,
    thinking: { type: 'adaptive' },
    system: CONSIGNE_CORRIGER,
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: 'Titre : ' + String(donnees.titre || 'Sans titre') + '\n\nLe code source de la page :\n\n' + String(donnees.html || '') },
        { type: 'text', text: 'Les problèmes à corriger :\n\n' + JSON.stringify(points) },
        { type: 'text', text: 'Les textes de référence des versets cités (' + versets.length + ') :\n\n' + JSON.stringify(versets) },
      ],
    }],
    output_config: { effort: 'high', format: { type: 'json_schema', schema: SCHEMA_CORRIGER } },
  };
}

const TACHES = { ranger: demandeRanger, controler: demandeControler, corriger: demandeCorriger };

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

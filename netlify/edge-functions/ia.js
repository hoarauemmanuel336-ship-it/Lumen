/* ============================================================
   LUMEN — l'IA
   La seule porte du site vers l'IA d'Anthropic. Elle garde la clé
   de l'API Claude hors des pages : la clé vit dans la variable
   ANTHROPIC_API_KEY, réglée dans Netlify (Site configuration →
   Environment variables), et n'est jamais envoyée au navigateur.

   Avant chaque demande, la fonction demande à Google quel compte est
   connecté, et s'il est vérifié. Une demande sans compte est refusée.

   CHACUN SA CLÉ (Emmanuel : « chacun sa clé »). Le compte d'Emmanuel
   passe par la clé du site. Tout autre compte parle à l'IA avec sa propre
   clé de l'API Anthropic : elle vit sur son appareil, arrive avec chaque
   demande dans l'en-tête x-lumen-cle, et la fonction la transmet à
   Anthropic sans la garder ni l'écrire nulle part. Personne ne dépense
   donc le crédit d'Emmanuel.

   Le seul usage est la conversation (question : sur un passage, sur
   toute une page, ou libre) : Claude Opus 5.5, avec réflexion, recherche
   sur internet et les outils du site. Une réponse de doctrine ou
   d'exégèse doit être juste avant tout : c'est le travail du plus grand
   modèle.

   La réponse de l'IA est relayée telle quelle, au fil de l'eau : le fil
   s'ouvre dès la demande reçue, la page lit la réponse à mesure qu'elle
   arrive, et une longue attente ne bute sur aucun délai de Netlify.
   ============================================================ */

import { SAVOIR } from '../savoir/savoir.js';

const PROPRIETAIRE = 'hoarauemmanuel336@gmail.com';
/* la clé PUBLIQUE de Firebase, celle qui figure déjà dans les pages :
   elle sert seulement à demander à Google qui est connecté */
const CLE_FIREBASE = 'AIzaSyC19lFNWUd-KYhCP4o7gpp0IcyfRTyHOyA';

const MODELES = {
  question: 'claude-opus-5-5',
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

/* ── LA CONVERSATION AVEC L'IA ──
   Emmanuel : « quelque chose d'aussi abouti que Claude sur tous les
   aspects ». Une conversation part d'un passage sélectionné, de toute une
   page, ou de rien (le bouton de la barre du haut). La page envoie toute
   la conversation ; le serveur y ajoute la consigne, les règles d'écriture
   du site, la mémoire propre au site, le texte de la page d'où vient la
   question, et les outils. Consigne et règles sont les mêmes pour tous,
   Emmanuel compris (« je veux les mêmes instructions que tout le monde ») :
   l'IA parle à la personne connectée, sans prénom ni portrait.
   Deux sortes d'outils :
   - ceux d'Anthropic, qui tournent chez Anthropic : la recherche sur
     internet et la lecture d'une page web ;
   - ceux du site, que la page exécute elle-même avec les données du
     compte connecté (commun/ia-outils.js) : les versets des deux Bibles, la
     bibliothèque (articles, ressources, notes de la Bible),
     les conversations passées et la mémoire. L'IA du site ne crée pas de
     pages : livres, diagrammes, cours, parcours et articles se font dans
     Claude.
   La réflexion est celle du modèle (adaptative) ; son résumé s'affiche
   replié au-dessus de la réponse, comme dans Claude. Son niveau est
   écrit en toutes lettres à « moyen » pour tous les usages du site
   (Emmanuel : « le niveau de réflexion doit toujours être sur Moyen »),
   pour qu'il ne change pas avec le réglage par défaut d'un nouveau modèle. */
const OUTIL_VERSETS = {
  name: 'lire_versets',
  description: 'Renvoie le texte exact de versets bibliques dans les deux traductions du site : la Chérubin (traduction par défaut) et la Séraphin (littérale). Les références s’écrivent au format « Jean 3:16 » ou « 1 Corinthiens 13:4-7 », avec les noms de livres en français sous leur forme standard.',
  input_schema: {
    type: 'object',
    properties: { references: { type: 'array', items: { type: 'string' } } },
    required: ['references'],
  },
};
const OUTILS_SITE = [
  OUTIL_VERSETS,
  {
    name: 'chercher_bibliotheque',
    description: 'Cherche dans la bibliothèque de la personne sur le site : ses articles, ses ressources (livres, diagrammes, cours, parcours d’étude, images, PDF, liens) et ses notes de la Bible. La recherche porte sur les titres, les descriptions et tout le texte des pages. Rend les éléments les plus pertinents avec leur identifiant et des extraits. Une requête vide rend la liste de tout ce que contient la bibliothèque (titres seulement).',
    input_schema: {
      type: 'object',
      properties: {
        requete: { type: 'string', description: 'Les mots cherchés, en français.' },
        ou: { type: 'string', enum: ['tout', 'articles', 'ressources', 'notes'], description: 'Où chercher ; « tout » par défaut.' },
      },
      required: ['requete'],
    },
  },
  {
    name: 'lire_element',
    description: 'Lit tout le texte d’un élément de la bibliothèque de la personne, d’après l’espèce et l’identifiant rendus par chercher_bibliotheque. Un texte très long se lit par morceaux : « debut » dit à partir de quel signe reprendre.',
    input_schema: {
      type: 'object',
      properties: {
        espece: { type: 'string', enum: ['article', 'ressource', 'note'] },
        id: { type: 'string' },
        debut: { type: 'integer', description: 'Le signe d’où partir (0 par défaut).' },
      },
      required: ['espece', 'id'],
    },
  },
  {
    name: 'chercher_conversations',
    description: 'Cherche dans les conversations passées de la personne avec l’IA du site (« Mes questions ») : rend les conversations qui parlent de ce qui est cherché, avec leur date, leur première question et des extraits.',
    input_schema: {
      type: 'object',
      properties: { requete: { type: 'string' } },
      required: ['requete'],
    },
  },
  {
    name: 'memoire',
    description: 'Tient la mémoire de l’IA du site : ce qu’il est utile de savoir de la personne d’une conversation à l’autre. « ajouter » pose une ligne ; « remplacer » change une ligne existante (ancien = son texte exact) ; « supprimer » retire une ligne (ancien = son texte exact). Rend la mémoire telle qu’elle est après le changement.',
    input_schema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['ajouter', 'remplacer', 'supprimer'] },
        texte: { type: 'string', description: 'La ligne à poser (ajouter, remplacer).' },
        ancien: { type: 'string', description: 'La ligne existante visée (remplacer, supprimer).' },
      },
      required: ['action'],
    },
  },
];
const OUTILS_ANTHROPIC = [
  { type: 'web_search_20250305', name: 'web_search', max_uses: 8 },
  { type: 'web_fetch_20250910', name: 'web_fetch', max_uses: 8, max_content_tokens: 40000, citations: { enabled: true } },
];

function consigneConversation() {
  const jour = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Indian/Reunion' });
  return `Tu es l’IA du site Lumen, un site d’étude de la foi catholique : la Bible, des cours, des articles. La personne qui te parle est connectée à son compte ; elle t’écrit dans un salon de discussion, ouvert depuis n’importe quelle page du site. Nous sommes le ${jour}.

C’est une conversation : la personne peut te répondre, demander une précision, contester, ou passer à autre chose. Tu reprends le fil de l’échange à chaque message.

D’où vient la question. Elle peut partir d’un passage sélectionné dans un article, un cours ou la Bible du site ; d’une page entière interrogée sans rien sélectionner ; ou de rien, quand la conversation s’ouvre librement. Quand tu reçois tout le texte de la page d’où part la question, tu t’en sers : ce que la page dit ailleurs, dans une autre partie ou une autre leçon, fait partie de ce que tu sais d’elle.

Tu réponds à ce qu’on te dit, directement. La réponse est claire pour le novice comme pour le lecteur confirmé : un terme technique s’explique au moment où il apparaît. Elle reste aussi courte que la question le permet ; une question qui demande de l’ampleur reçoit de l’ampleur.

Tes outils :
- lire_versets : pour citer un verset, tu lis d’abord son texte exact, puis tu le cites d’après la Chérubin, ou d’après la Séraphin quand le passage sélectionné vient de la Séraphin. Tu demandes en une fois tous les versets dont tu as besoin.
- chercher_bibliotheque et lire_element : la bibliothèque de la personne sur le site (articles, ressources, notes de la Bible). Quand elle parle de ce qu’elle a, de ce qu’elle a étudié ou de « mon livre », « mon cours », « mes notes », tu cherches avant de répondre.
- chercher_conversations : vos conversations passées sur le site, quand elle fait allusion à ce que vous avez déjà dit.
- web_search et web_fetch : internet, pour ce qui est récent ou pour vérifier un document précis (un texte du magistère, une source). Les sources citées s’affichent sous ta réponse.
- memoire : ta mémoire propre au site (voir plus bas).

Tu ne crées pas de pages sur le site. Quand on te demande un livre, un diagramme, un cours, un parcours d’étude ou un article, tu dis en une phrase qu’ils se font dans Claude.

La mémoire. Elle t’est donnée plus bas, telle qu’elle est. Tu y poses ce qui servira dans une autre conversation : qui est la personne, ce qu’elle étudie ou a étudié, ses projets, ses préférences sur tes réponses, quand elle te les dit. Tu n’y poses ni ce qu’elle a dit en passant, ni tes propres conclusions, ni ce qui se retrouve dans sa bibliothèque. Quand elle te demande de retenir ou d’oublier quelque chose, tu le fais. Tu t’en sers quand elle change ta réponse, sans dire que tu la consultes.

Mise en forme : des paragraphes courts ; **gras** pour le très important, *italique* pour les citations et les mots étrangers ; des listes avec « - » ou « 1. » quand le contenu s’y prête ; des titres « ## » seulement pour une longue réponse en plusieurs parties ; un tableau quand une comparaison s’y prête ; « > » pour une longue citation.`;
}

/* ── LES LONGUES CONVERSATIONS ──
   Comme dans Claude, aucune limite en nombre de messages : toute la
   conversation part à l'IA. Quand elle approche de la limite de ce que
   l'IA peut lire d'un coup, l'API résume elle-même les échanges les plus
   anciens (la « compaction ») et la conversation continue ; le résumé
   revient dans la réponse, et la page le renvoie ensuite à la place de
   ce qu'il résume. Le seuil laisse de la place au texte de la page, à la
   consigne et à la réponse dans la fenêtre d'un million de tokens. */
const COMPACTION_SEUIL = 600000;
const CONSIGNE_RESUME = `Résume la conversation qui précède entre la personne et l’IA du site, pour que l’échange continue sans rien perdre d’utile. Écris en français. Garde : le passage ou la page d’où part la conversation, avec sa référence ; chaque question posée et ce qui y a été répondu, avec les explications, les distinctions et les conclusions établies ; les versets cités avec leur référence ; les sources trouvées sur internet avec leur adresse ; les éléments de sa bibliothèque consultés, avec leur identifiant ; les pages créées, avec leur titre et leur lien ; ses demandes, ses préférences et ses corrections exprimées dans l’échange ; ce qui reste en cours ou promis. Le résumé suit l’ordre de la conversation.`;
const BLOCS_PERMIS = new Set(['text', 'image', 'document', 'tool_use', 'tool_result', 'thinking', 'redacted_thinking',
  'server_tool_use', 'web_search_tool_result', 'web_fetch_tool_result', 'compaction']);
function demandeQuestion(donnees) {
  const roles = new Set(['user', 'assistant']);
  let messages = (Array.isArray(donnees.messages) ? donnees.messages : [])
    .filter(m => m && roles.has(m.role))
    .map(m => ({
      role: m.role,
      content: typeof m.content === 'string' ? m.content
        : (Array.isArray(m.content) ? m.content.filter(b => b && BLOCS_PERMIS.has(b.type)) : ''),
    }));
  /* la conversation jusqu'au dernier message se garde en cache : les
     tours d'outils et le message suivant la relisent à moindre coût */
  const dernier = messages[messages.length - 1];
  if (dernier && dernier.role === 'user') {
    const blocs = typeof dernier.content === 'string' ? [{ type: 'text', text: dernier.content }] : dernier.content.slice();
    if (blocs.length) {
      blocs[blocs.length - 1] = Object.assign({}, blocs[blocs.length - 1], { cache_control: { type: 'ephemeral' } });
      messages = messages.slice(0, -1).concat([{ role: 'user', content: blocs }]);
    }
  }
  /* la consigne et les instructions ne changent pas d'un message à
     l'autre : elles se gardent en cache, comme le texte de la page */
  const system = [{ type: 'text', text: consigneConversation() + (SAVOIR.instructions
    ? '\n\n<instructions>\nLes règles d’écriture du site, les mêmes pour tous.\n\n' + SAVOIR.instructions + '\n</instructions>'
    : ''), cache_control: { type: 'ephemeral' } }];
  const doc = String(donnees.document || '').slice(0, 600000);
  if (doc.trim()) system.push({ type: 'text', text: '<document>\nTout le texte de l’article ou de la ressource d’où vient la question, toutes ses pages et parties comprises, même celles qui ne sont pas à l’écran.\n\n' + doc + '\n</document>', cache_control: { type: 'ephemeral' } });
  const memoire = String(donnees.memoire || '').slice(0, 20000);
  system.push({ type: 'text', text: '<memoire>\n' + (memoire.trim() || '(vide pour l’instant)') + '\n</memoire>' });
  return {
    model: MODELES.question,
    max_tokens: 64000,
    stream: true,
    thinking: { type: 'adaptive', display: 'summarized' },
    output_config: { effort: 'medium' },
    system,
    tools: OUTILS_SITE.concat(OUTILS_ANTHROPIC),
    messages,
    context_management: { edits: [{ type: 'compact_20260112', trigger: { type: 'input_tokens', value: COMPACTION_SEUIL }, instructions: CONSIGNE_RESUME }] },
    _beta: 'compact-2026-01-12',
  };
}

const TACHES = { question: demandeQuestion };

export default async (request) => {
  if (request.method !== 'POST') return json({ erreur: 'Méthode non permise.' }, 405);

  const jeton = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const u = await quiEst(jeton);
  if (!u) return json({ erreur: 'compte', message: 'Connexion expirée : rechargez la page, puis réessayez.' }, 401);
  if (!u.verifie) return json({ erreur: 'compte', message: 'Ce compte n’a pas accès à l’IA : son adresse n’est pas encore confirmée.' }, 403);
  const proprio = u.email === PROPRIETAIRE;

  const corps = await request.json().catch(() => null);
  const tache = corps && TACHES[corps.tache];
  if (!tache) return json({ erreur: 'tache', message: 'Tâche inconnue.' }, 400);

  let cle = '';
  if (proprio) {
    cle = (typeof Netlify !== 'undefined' && Netlify.env.get('ANTHROPIC_API_KEY')) || '';
    if (!cle) return json({ erreur: 'cle', message: 'La clé de l’API Claude n’est pas encore réglée dans Netlify.' }, 503);
  } else {
    cle = (request.headers.get('x-lumen-cle') || '').trim();
    if (!/^sk-ant-[A-Za-z0-9_-]{20,}$/.test(cle)) return json({ erreur: 'cle-perso', message: 'Pour parler avec l’IA, enregistrez votre clé de l’API Anthropic : Mes questions, puis « Ma clé ».' }, 403);
  }

  const demande = await tache(corps.donnees || {});
  /* une tâche qui se sert d'une fonction encore en bêta le dit (_beta) */
  const beta = demande._beta; delete demande._beta;
  /* ── LA RÉPONSE PART TOUT DE SUITE ──
     Avec une grande page (un cours entier, un livre), l'IA peut mettre
     longtemps à commencer : Netlify coupe une fonction qui n'a encore rien
     renvoyé au bout de quarante secondes (erreur 500). Le fil s'ouvre donc
     aussitôt ; un signe de vie y passe toutes les dix secondes tant que
     l'IA n'a pas commencé, puis sa réponse est relayée telle quelle. Une
     panne de l'IA arrive dans le fil comme un événement « error », que la
     page affiche avec sa raison. */
  const enc = new TextEncoder();
  const { readable, writable } = new TransformStream();
  const ecrit = writable.getWriter();
  const erreurFil = msg => ecrit.write(enc.encode('event: error\ndata: ' + JSON.stringify({ type: 'error', error: { message: msg } }) + '\n\n'));
  (async () => {
    let attente = setInterval(() => { ecrit.write(enc.encode(': attente\n\n')).catch(() => {}); }, 10000);
    const finAttente = () => { if (attente) { clearInterval(attente); attente = null; } };
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: Object.assign({
          'x-api-key': cle,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        }, beta ? { 'anthropic-beta': beta } : {}),
        body: JSON.stringify(demande),
      }).catch(() => null);
      finAttente();
      if (!r) { await erreurFil('le service de l’IA ne répond pas. Réessayez dans un instant.'); return; }
      if (!r.ok) {
        const t = await r.text().catch(() => '');
        let m = '';
        try { m = JSON.parse(t).error.message; } catch (_) { m = t.slice(0, 300); }
        if (!proprio && (r.status === 401 || r.status === 403)) await erreurFil('Anthropic refuse votre clé de l’API. Vérifiez-la dans « Ma clé ».');
        else await erreurFil('erreur ' + r.status + (m ? ' (' + m + ')' : ''));
        return;
      }
      const lect = r.body.getReader();
      for (;;) {
        const { value, done } = await lect.read();
        if (done) break;
        await ecrit.write(value);
      }
    } catch (e) {
      finAttente();
      await erreurFil('la réponse a été coupée en route. Réessayez.').catch(() => {});
    } finally {
      finAttente();
      ecrit.close().catch(() => {});
    }
  })();
  return new Response(readable, {
    status: 200,
    headers: { 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-store' },
  });
};

export const config = { path: '/api/ia' };

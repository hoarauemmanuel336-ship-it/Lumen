/* ============================================================
   LUMEN — la porte
   Le site est privé : aucune page, aucun fichier n'est servi sans
   le mot de passe. Le mot de passe n'est écrit nulle part dans le
   code : il vit dans la variable LUMEN_MOT_DE_PASSE, réglée dans
   Netlify (Site configuration → Environment variables).
   Une fois la porte passée, l'appareil est reconnu pendant un an,
   et chaque page ouverte prolonge ce délai.
   ============================================================ */

const COOKIE = 'lumen_cle';
const DUREE = 60 * 60 * 24 * 365;

/* Ce qui reste servi sans mot de passe : robots.txt, les icônes et
   les manifestes (le navigateur les demande sans cookie pour installer
   l'application sur l'écran d'accueil ; ils ne contiennent rien).
   La fabrique de la méditation est appelée par l'horloge du site, sans
   cookie : elle vérifie elle-même son jeton et ne rend rien. */
function libre(p) {
  return p === '/robots.txt'
    || p === '/api/meditation-fabrique'
    || p === '/manifest.webmanifest'
    || p === '/memoriser-manifest.webmanifest'
    || p.startsWith('/icones/')
    || /^\/[a-z0-9-]+\.png$/i.test(p);
}

async function jeton(mdp) {
  const cle = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(mdp),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', cle, new TextEncoder().encode('lumen-porte-v1'));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function egal(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

function lireCookie(req, nom) {
  const c = req.headers.get('cookie') || '';
  for (const morceau of c.split(';')) {
    const [k, ...v] = morceau.trim().split('=');
    if (k === nom) return v.join('=');
  }
  return '';
}

function poseCookie(valeur, age) {
  return `${COOKIE}=${valeur}; Path=/; Max-Age=${age}; HttpOnly; Secure; SameSite=Lax`;
}

function suiteSure(s) {
  return (typeof s === 'string' && s.startsWith('/') && !s.startsWith('//')) ? s : '/';
}

function page(message, suite, statut) {
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const html = `<!doctype html>
<html lang="fr"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Lumen</title>
<link rel="icon" href="/icones/lumen-192.png">
<style>
  :root{color-scheme:dark}
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
    background:#0a0a0a;color:#efe6cf;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;padding:16px}
  form{width:100%;max-width:320px;display:flex;flex-direction:column;gap:14px;text-align:center}
  h1{font-family:Georgia,"Times New Roman",serif;font-weight:400;font-size:34px;letter-spacing:.08em;margin:0 0 6px}
  input{width:100%;padding:12px 14px;border-radius:10px;border:1px solid rgba(239,230,207,.22);
    background:#000;color:#efe6cf;font-size:16px;outline:none;text-align:center}
  input:focus{border-color:rgba(239,230,207,.6)}
  button{padding:12px;border-radius:10px;border:0;background:#efe6cf;color:#0a0a0a;font-size:15px;cursor:pointer}
  p{margin:0;font-size:14px;color:#e58c7a;min-height:1.2em}
</style>
</head><body>
<form method="post" action="/__entree">
  <h1>Lumen</h1>
  <input type="password" name="mot_de_passe" placeholder="Mot de passe" autocomplete="current-password" autofocus required>
  <input type="hidden" name="suite" value="${esc(suite)}">
  <button type="submit">Entrer</button>
  <p>${esc(message)}</p>
</form>
</body></html>`;
  return new Response(html, {
    status: statut,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex, nofollow',
    },
  });
}

export default async (request, context) => {
  const url = new URL(request.url);
  const p = url.pathname;

  if (libre(p)) return context.next();

  const mdp = (typeof Netlify !== 'undefined' && Netlify.env.get('LUMEN_MOT_DE_PASSE')) || '';
  if (!mdp) return page('Le mot de passe n’est pas encore réglé dans Netlify.', '/', 503);
  const attendu = await jeton(mdp);

  /* Sortie : oublier cet appareil */
  if (p === '/__sortie') {
    return new Response(null, { status: 303, headers: { location: '/', 'set-cookie': poseCookie('', 0) } });
  }

  /* Entrée : vérifier le mot de passe envoyé par le formulaire */
  if (p === '/__entree' && request.method === 'POST') {
    const f = await request.formData().catch(() => null);
    const essai = f ? String(f.get('mot_de_passe') || '') : '';
    const suite = suiteSure(f ? String(f.get('suite') || '/') : '/');
    if (essai && egal(await jeton(essai), attendu)) {
      return new Response(null, { status: 303, headers: { location: suite, 'set-cookie': poseCookie(attendu, DUREE) } });
    }
    await new Promise(r => setTimeout(r, 900));
    return page('Mot de passe incorrect.', suite, 401);
  }

  /* Appareil reconnu : la page est servie, et une page HTML prolonge
     la reconnaissance d'un an */
  if (egal(lireCookie(request, COOKIE), attendu)) {
    const rep = await context.next();
    const r = new Response(rep.body, rep);
    r.headers.set('x-robots-tag', 'noindex, nofollow');
    if ((request.headers.get('accept') || '').includes('text/html')) {
      r.headers.append('set-cookie', poseCookie(attendu, DUREE));
    }
    return r;
  }

  /* Sinon : la porte */
  return page('', p + url.search, 401);
};

export const config = { path: '/*' };

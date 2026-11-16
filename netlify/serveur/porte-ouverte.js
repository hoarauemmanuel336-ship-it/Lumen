/* ============================================================
   LUMEN — la clé de l'appareil, vérifiée par un passage
   Selon l'ordre où Netlify enchaîne ses fonctions, la porte (porte.js)
   peut passer après un passage qui répond lui-même : un tel passage
   vérifie donc la clé de l'appareil, avec le même calcul que la porte.
   ============================================================ */
async function jetonPorte(mdp) {
  const cle = await crypto.subtle.importKey('raw', new TextEncoder().encode(mdp), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', cle, new TextEncoder().encode('lumen-porte-v1'));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function cookie(req, nom) {
  for (const m of (req.headers.get('cookie') || '').split(';')) {
    const [k, ...v] = m.trim().split('=');
    if (k === nom) return v.join('=');
  }
  return '';
}
export async function porteOuverte(req) {
  const mdp = (typeof Netlify !== 'undefined' && Netlify.env.get('LUMEN_MOT_DE_PASSE')) || '';
  if (!mdp) return false;
  const a = await jetonPorte(mdp), b = cookie(req, 'lumen_cle');
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

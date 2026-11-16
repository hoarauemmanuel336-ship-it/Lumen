/* ============================================================
   LUMEN — qui est connecté
   Google dit à qui appartient le jeton de connexion envoyé par la page.
   Sert aux réglages réservés à Emmanuel (la pause des méditations).
   ============================================================ */
export const PROPRIETAIRE = 'hoarauemmanuel336@gmail.com';
/* clé publique par nature (la même que dans les pages) : elle sert
   seulement à demander à Google à qui appartient un jeton */
const CLE_FIREBASE = 'AIzaSyC19lFNWUd-KYhCP4o7gpp0IcyfRTyHOyA';

export async function quiEst(jeton) {
  if (!jeton) return null;
  const r = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + CLE_FIREBASE, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ idToken: jeton }),
  }).catch(() => null);
  if (!r || !r.ok) return null;
  const j = await r.json().catch(() => null);
  const u = j && j.users && j.users[0];
  return u ? { email: String(u.email || '').toLowerCase(), verifie: !!u.emailVerified } : null;
}

export async function estProprietaire(req) {
  const u = await quiEst((req.headers.get('authorization') || '').replace(/^Bearer\s+/i, ''));
  return !!(u && u.verifie && u.email === PROPRIETAIRE);
}

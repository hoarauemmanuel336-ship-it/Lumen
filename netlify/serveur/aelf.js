/* ============================================================
   LUMEN — le texte officiel de l'AELF, nettoyé
   Partagé par les passages qui servent les textes de la liturgie
   (edge-functions/liturgie.js pour la messe, heures.js pour la Liturgie
   des Heures). Le texte ne garde que la mise en forme de l'AELF
   (paragraphes, retours à la ligne, numéros de versets, italique, gras) :
   tout le reste est retiré avant d'entrer dans une page.
   ============================================================ */

const PERMIS = { p: 1, br: 1, span: 1, em: 1, i: 1, strong: 1, b: 1, u: 1, sup: 1, sub: 1, blockquote: 1 };
export function propre(html) {
  let s = String(html == null ? '' : html)
    .replace(/<(script|style|iframe|object)[\s\S]*?<\/\1>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  s = s.replace(/<\/?([a-zA-Z0-9]+)([^>]*)>/g, (tout, nom, attr) => {
    const n = nom.toLowerCase();
    if (!PERMIS[n]) return '';
    const ferme = tout.charAt(1) === '/';
    if (ferme) return n === 'br' ? '' : '</' + n + '>';
    if (n === 'br') return '<br>';
    /* seuls les numéros de versets gardent leur marque */
    if (n === 'span') return /verse_number/.test(attr) ? '<span class="vn">' : '<span>';
    return '<' + n + '>';
  });
  /* un « < » qui n'était pas une balise permise reste du texte */
  s = s.replace(/<(?!\/?(p|br|span|em|i|strong|b|u|sup|sub|blockquote)\b)/gi, '&lt;');
  /* les retours à la ligne en trop : doublés, ou glissés entre deux paragraphes */
  s = s.replace(/(<br>\s*){2,}/g, '<br>').replace(/<\/p>\s*<br>\s*/g, '</p>').replace(/<p>\s*<br>/g, '<p>').replace(/<br>\s*<\/p>/g, '</p>');
  s = s.trim();
  if (!s) return '';
  /* un texte sans paragraphe (certaines lectures brèves) en reçoit un */
  if (!/^<(p|blockquote)\b/i.test(s)) s = '<p>' + s.replace(/\s*\n\s*/g, '<br>').replace(/(<br>\s*){2,}/g, '<br>') + '</p>';
  return s;
}
export function texte(v) { return String(v == null ? '' : v).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(); }


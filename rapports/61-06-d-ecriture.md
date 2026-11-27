# Rapport d'écriture : 61-06-d, La Dormition (lettre d)

## Livraison
- Fichier : `/home/claude/eglise/redaction/61-06-d.html` (environ 241 Ko), contenant seulement `<cours lettre="d" …> … </cours>`.
- Pièces : `/home/claude/eglise/redaction/parts/61-06-d/` (00-ouverture, 01 à 12, 99-bilan, plan.md).
- 12 leçons, 72 exercices de leçon (6 par leçon) et 6 exercices de bilan, soit 78 ; 45 citations bibliques de la Chérubin, toutes validées par le contrôle.

## Plan suivi
1. Le mot « Dormition » (koimèsis, la mort-sommeil dans l'Écriture, cimetière, deux contresens).
2. Le silence de saint Épiphane (silence des trois premiers siècles, Panarion 78, trois hypothèses, portée).
3. Les récits du passage de Marie (familles du Transitus, scénario, Décret gélasien, ce qu'ils attestent).
4. La fête du 15 août et l'empereur Maurice (dates diverses, Nicéphore Calliste, année byzantine, réception à Rome).
5. Saint Germain de Constantinople. 6. Saint André de Crète. 7. Saint Jean Damascène (dont l'Histoire euthymiaque).
8. Jérusalem et Éphèse (le tombeau, Sion, la tradition d'Éphèse, Meryem Ana Evi, peser les deux).
9. L'icône de la Dormition (composition, âme emmaillotée, miroir de la Nativité).
10. Marie est-elle morte ? (mortalistes et immortalistes, réponses, statut).
11. La catéchèse de Jean-Paul II du 25 juin 1997.
12. Dormition et Assomption, une même foi (fond commun, accents, Églises orientales catholiques, orthodoxes et 1950).
Bilan : 6 exercices croisés.

Chaque élément de la commande a sa place : mot (l. 1), Épiphane (l. 2), Transitus (l. 3), Maurice (l. 4), les trois homélistes (l. 5-7), tombeau (l. 8), Éphèse (l. 8), icône (l. 9), question de la mort (l. 10), catéchèse de 1997 (l. 11), Dormition et Assomption (l. 12).

## Choix
- Partage avec le cours sur l'Assomption (61-05-a, déjà rédigé) : les débuts de la fête (Kathisma, Gethsémani) et la formule *expleto terrestris vitae cursu* sont rappelés d'une phrase avec un lien `#ouverture-a` ; ce cours-ci traite à fond le débat sur la mort, la catéchèse de 1997, les homélistes et les lieux.
- Les citations du Magistère dont je n'avais pas le texte français officiel (MD 21-22, catéchèse de 1997, UR 15 et 17) sont paraphrasées sans guillemets ; seul le tropaire du CEC 966 est cité mot pour mot (vérifié sur vatican.va).
- Les immortalistes reçoivent leur argument le plus fort (Romains 6:23, debitum mortis, mort du Christ comme sacrifice choisi) avant la réponse ; la position orthodoxe sur 1950 est présentée comme les orthodoxes la comprennent avant d'être jugée.
- Degrés d'autorité tenus partout : Assomption de foi ; mort de Marie opinion commune ; immortalité opinion minoritaire permise ; catéchèse de 1997 enseignement ordinaire non définitif ; lieux et apparitions/visions (Emmerich) hors de la foi.
- Passage humaniser fait sur les pièces : formule répétée « On peut maintenant répondre à la question du début » supprimée dans les 12 leçons, contrastes « pas X mais Y » réduits, « véritable » et « d'ailleurs » allégés, quelques chutes réécrites.

## Contrôles
- `verifier.py` : aucun problème réel. Restent 27 signalements « TUTOIEMENT ? », tous dans le tropaire byzantin cité par le CEC 966 (« Dans ton enfantement tu as gardé… ») et ses reprises dans les leçons 5 et 12 : faux positifs.
- `liens.py` : 0 lien à revoir.
- Assemblage d'essai (`/tmp/61-06-d-essai.html`) : réussi (1 cours, 12 leçons).

## Incertitudes
- La recherche web était épuisée dès le début : vérifications par WebFetch seulement (vatican.va, newadvent, Wikipédia). Le détail est dans `doutes.md` sous `## 61-06-d`. Points les plus fragiles : libellé exact du Panarion 78 (paraphrasé), contenu précis des homélies de Germain et d'André (thèmes donnés de mémoire), noms et positions des théologiens immortalistes (Arnaldi, Jugie, Roschini), iconographie et œuvres d'art citées, référence exacte du Traité de l'amour de Dieu.
- À harmoniser au relecteur : la date d'attestation de l'église du tombeau (« VIe siècle » ici et dans 61-05-a ; la Catholic Encyclopedia parle d'une basilique de la fin du IVe ou du début du Ve siècle).

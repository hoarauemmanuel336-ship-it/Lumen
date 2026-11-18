# Rapport d'écriture : 31-04-r, La Réforme radicale

Fichier livré : `/home/claude/histoire/redaction/31-04-r.html` (lettre r, environ 250 Ko). Parties dans `redaction/parts/31-04-r/` (00-ouverture, 01 à 10, 99-bilan, plan.md).

## Contenu

10 leçons, 61 exercices de leçon et 6 exercices de bilan (67 au total), 60 citations bibliques vérifiées sur la Chérubin.

1. Le mot anabaptiste et la Réforme radicale (étymologie, refus du nom, loi de 413 et diète de Spire 1529, Réforme radicale / magistérielle, trois familles, monogenèse et polygenèse, Trente session VII).
2. Conrad Grebel et les premiers baptêmes d'adultes à Zurich (1525).
3. La Confession de Schleitheim (1527) et la séparation d'avec le monde (Sattler, sept articles, deux royaumes, non-résistance, regard catholique sur le monde, le serment et la force).
4. Thomas Müntzer, le prédicateur de l'Esprit (vie jusqu'à Allstedt, parole intérieure, Christ amer, élus et impies, liturgie allemande).
5. Thomas Müntzer, le sermon aux princes et la guerre des Paysans (Daniel 2, Frankenhausen, historiographie, Hans Hut, jugement de l'Église).
6. Le royaume anabaptiste de Münster (1534-1535) (Hoffman, Matthijs, Jean de Leyde, chute, cages de Saint-Lambert, millénarisme).
7. Menno Simons.
8. Les mennonites et la famille anabaptiste (martyrs et chiffres, Miroir des martyrs, Dordrecht, migrations, huttérites, amish, baptistes distingués, dialogue catholique-mennonite 1998-2003).
9. Les antitrinitaires du XVIe siècle (Écriture seule et critique humaniste, Servet en rappel avec lien vers le cours sur Calvin, Castellion, Italiens en exil, Église mineure de Pologne, Transylvanie, Torda, Dávid, Cum quorundam).
10. Fauste Socin et les sociniens (vie, doctrine, Raków, Catéchisme, expulsion de 1658, postérité, réponse catholique).

Toute la commande est traitée : le mot (L1), Grebel (L2), Schleitheim (L3), Müntzer (L4-5), Münster (L6), Menno et les mennonites (L7-8), antitrinitaires (L9), Socin et sociniens (L10).

## Choix

- Deux leçons pour Müntzer (théologie, puis action et historiographie) et deux pour Menno / les mennonites, parce que la matière l'appelle ; Hans Hut est traité en L5 pour montrer le lien Müntzer-anabaptisme (polygenèse).
- Partage avec les autres cours : la guerre des Paysans et les douze articles renvoient au cours sur Luther ; l'affaire Servet (procès) au cours sur Calvin ; la théologie zwinglienne du baptême au cours sur Zwingli ; la doctrine du baptême au fichier 68 (cours v et b) ; le millénarisme au fichier 77 (cours m) ; Chalcédoine et Nicée au fichier 28 ; Sola scriptura au fichier 02 (cours r) ; révélations privées et nécessité de la Révélation au fichier 01 ; la mystique rhénane au fichier 30 (cours m) ; Inquisition romaine au cours f du même fichier ; les erreurs trinitaires et le vocabulaire trinitaire par `#sujet:` ; les évangéliques (baptistes) par `#sujet:oecumenisme.evangeliques`.
- Les annonces de place (« la leçon 8 revient… ») ont été retirées au profit de simples liens.
- Distinction faits / historiens / jugement de l'Église tenue dans chaque leçon ; chiffres des victimes donnés en fourchette (2 000 à quelques milliers ; Clasen ~850 pour le Sud ; ~1 500 aux Pays-Bas).

## Contrôles

- `verifier.py` : aucun problème trouvé.
- `liens.py` : 0 lien à revoir.
- Assemblage d'essai (`/tmp/31-04-r-essai.html`) : réussi (1 cours, 10 leçons).
- Passage humaniser fait à la main sur tout le texte (contrastes « pas X mais Y », chutes, formules répétées « On peut maintenant répondre… » retirées, annonces de place supprimées).

## Incertitudes

La recherche web était épuisée dès le premier appel et WebFetch demandait une autorisation non disponible : rien n'a pu être vérifié en ligne. Le cours est écrit de mémoire ; toutes les citations de documents du Magistère et des confessions sont paraphrasées. Restent entre guillemets la phrase de Castellion, dans sa traduction française courante, et quelques formules brèves traduites librement (« Christ doux comme le miel », « Christ amer », « chair sans esprit et douillette de Wittenberg », « hors de la perfection du Christ », « comme l'eau passe par un tuyau », « avec le glaive de Gédéon », « Évangile de toutes les créatures »), toutes signalées. La liste détaillée des points à vérifier est dans `doutes.md`, section `## 31-04-r`.

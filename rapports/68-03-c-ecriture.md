# 68-03-c La célébration du baptême : rapport d'écriture

Livré : `/home/claude/liturgie/redaction/68-03-c.html` (lettre c), 12 leçons, 72 exercices de leçon et 7 exercices de bilan, 98 citations bibliques contrôlées, environ 268 Ko. Les parties sont dans `redaction/parts/68-03-c/`, avec `plan.md`.

## Plan suivi
1. Le baptême de la nuit pascale dans l'Église ancienne. 2. Le Rituel du baptême des petits enfants (1969). 3. Le Rituel de l'initiation chrétienne des adultes (1972). 4. Les rites d'accueil et le signe de croix sur le front. 5. La liturgie de la Parole (avec la prière universelle et l'invocation des saints). 6. La prière d'exorcisme et l'onction avec l'huile des catéchumènes. 7. La bénédiction de l'eau et ses rappels de l'histoire du salut. 8. La renonciation à Satan. 9. La profession de foi baptismale (et le bain qui suit). 10. L'onction du saint chrême après le baptême. 11. Le vêtement blanc et le cierge allumé au cierge pascal. 12. Le rite de l'*Effata* et la conclusion de la célébration (Notre Père, bénédiction, envoi). Bilan : 7 exercices croisés.

Les 14 éléments de la commande sont tous traités ; l'exorcisme et l'huile des catéchumènes partagent une leçon (ils se suivent dans le rite et le Catéchisme 1237 les traite ensemble), de même que le vêtement blanc et le cierge.

## Choix
- Les éléments propres à d'autres cours sont rappelés d'une phrase avec lien : matière, forme, ministre, parrains et nom (#ouverture-m) ; effets, concupiscence, sacerdoce commun (#ouverture-e) ; baptême des enfants et report du baptême (#ouverture-b) ; rebaptême (#ouverture-v) ; Vigile pascale moderne, litanie et cierge plongé dans l'eau (65-…#ouverture-v) ; saint chrême et mot Christ (69-…#ouverture-r) ; séparation de la confirmation (69-…#ouverture-i) ; grand exorcisme (66-…#ouverture-s) ; funérailles (66-…#ouverture-f).
- La bénédiction de l'eau, déjà présentée dans le cours sur la Vigile, est traitée ici sous l'angle de sa structure (anamnèse, épiclèse), de *Sacrosanctum concilium* 70 et du temps pascal, avec les eaux de l'histoire du salut citées d'après le Catéchisme.
- Les formules du rituel français n'ont pu être vérifiées sur l'édition officielle : elles sont paraphrasées sans guillemets, sauf quelques fragments vérifiés sur un livret paroissial et la parole d'accueil de 2013 (diocèse de Paris). La conclusion de la profession de foi est donnée en latin, avec une traduction propre au cours.
- Citations du Catéchisme et de *Sacrosanctum concilium* vérifiées sur vatican.va par segments courts.

## Contrôle
`verifier.py` ne signale plus que des faux tutoiements dans des formules citées (« je te baptise », « tu es une création nouvelle », prière de bénédiction de l'eau adressée à Dieu, citation d'Ambroise par le Catéchisme). Assemblage d'essai réussi (`assembler.py`, 1 cours, 12 leçons). Passage humaniser fait leçon par leçon : formule de clôture « On peut répondre à la question du début » retirée des 12 leçons, contrastes et chutes gratuits réécrits, gras décoratif retiré du tableau de la leçon 3.

## Incertain
Voir `doutes.md`, section 68-03-c : surtout les rubriques et formules du Rituel de 1969 et du rituel des adultes (paraphrasées de mémoire), les dates du décret de 1969 (source secondaire) et de 1972, les témoignages patristiques paraphrasés.

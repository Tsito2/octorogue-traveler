# Rapport — Phase 2 : Pouvoir Latent (Burst) & Swap de Duo

*Exécuté le 19 juillet 2026. Toutes les opérations ci-dessous ont été appliquées directement au dépôt, dans le moteur de combat actif uniquement.*

## 1. Vérification des interfaces

Aucun des champs demandés n'avait été ajouté lors de la Phase 1 (qui s'était limitée à `breakPower`/`maxBP`) : `lpGain`, `isBurst`, `requiredRow`, `isDuoCombo` (Skill) et `burstSkillId`, `preferredRow` (Job) ont donc tous été ajoutés cette phase, avec des valeurs par défaut dans les JSON pour que la démo reste jouable.

## 2. Fichiers modifiés

| Fichier | Rôle dans cette phase |
|---|---|
| `src/core/skills.ts` | Ajout de `lpGain?`, `isBurst?`, `requiredRow?`, `isDuoCombo?` à `Skill` |
| `src/core/jobs.ts` | Ajout de `burstSkillId?`, `preferredRow?` à `Job` |
| `src/core/stats.ts` | Ajout de `row: "front" \| "back"` et `duoPartnerId?: string` à `BattleStats` ; valeurs par défaut dans `createBattleStats` (`row: "front"`) |
| `src/data/skills.json` | Ajout de 3 compétences : `duo_strike` (Duo Combo), `warrior_burst` et `scholar_burst` (Burst) ; `lpGain` ajouté à `basic_attack`/`fireball` |
| `src/data/jobs.json` | `warrior` et `scholar` reçoivent `burstSkillId`, `preferredRow`, et `duo_strike` dans leur liste de compétences |
| `src/core/combat.ts` | Cœur de la Phase 2 : nouveaux types d'action `"swap"`, `"duoCombo"`, `"burst"` ; méthodes `performSwap`, `performDuoCombo`, `performBurst` ; accumulation de LP centralisée dans `executeSkillAction` (dégâts subis, Break, `skill.lpGain`) |
| `src/core/encounters.ts` | `createHeroFromTemplate` initialise `row` depuis `job.preferredRow` ; `createTestEncounter` lie Olberic et Cyrus comme partenaires de duo (`duoPartnerId` réciproque) pour que la démo soit testable |
| `src/scenes/CombatScene.ts` | HUD (LP + rang), menu conditionnel Swap/Burst/Duo Combo, raccourcis clavier S/B/D, filtrage du sous-menu Skills pour exclure les compétences de Duo Combo |

Aucun fichier du module orphelin (déjà supprimé en Phase 0) n'a été touché ou recréé.

## 3. Logique de Duo Swap

- `CombatEngine.performSwap(actor)` inverse la rangée de l'acteur (`front` ↔ `back`) et, si `actor.duoPartnerId` est défini, inverse également celle du partenaire dans le même mouvement.
- Action immédiate : pas de ciblage ni de coût BP/SP, mais **consomme le tour de l'acteur** (choix de simplicité pour cette V1 — voir limites ci-dessous).
- `createTestEncounter()` lie Olberic ↔ Cyrus comme partenaires, avec Olberic en rangée avant (job Champion) et Cyrus en rangée arrière (job Érudit) au début du combat.

## 4. Logique de Duo Combo

- `CombatEngine.performDuoCombo(actor, action)` n'autorise l'action que si : la compétence visée a `isDuoCombo: true`, le partenaire (`actor.duoPartnerId`) est vivant, **et** les deux combattants sont en rangée `front`. Sinon, un message d'échec est journalisé sans effet (le tour est tout de même consommé, comme pour toute action invalide dans le moteur existant).
- Le coup combiné additionne la moitié de l'ATK/MAG du partenaire à celles de l'acteur pour le calcul de dégâts (`calculateDamage`), sans muter les statistiques réelles du partenaire.
- Les deux combattants gagnent du LP (l'acteur reçoit `skill.lpGain` complet, le partenaire la moitié).
- Sécurité : une compétence `isDuoCombo` ne peut plus être lancée par erreur via le chemin de compétence classique (garde ajoutée dans `resolveAction`, et le sous-menu Skills de l'UI la filtre également).

## 5. Logique de Pouvoir Latent (Burst)

- L'accumulation de LP est centralisée dans `executeSkillAction` (utilisée par le chemin de compétence classique **et** le Duo Combo) :
  - la cible gagne du LP en subissant des dégâts (inchangé) ;
  - l'attaquant gagne du LP en cas de Rupture de bouclier (inchangé) ;
  - l'attaquant gagne en plus `skill.lpGain` s'il est défini sur la compétence utilisée (nouveau — le champ existait dans la documentation depuis le début du projet mais n'était jamais lu par le moteur).
- `CombatEngine.performBurst(actor, targetId)` : refuse l'action si `lp < maxLP` ; sinon, résout la compétence `job.burstSkillId` de l'acteur contre la cible, **remet `lp` à 0**, puis journalise. Un héros sans `burstSkillId` sur son job ne peut jamais faire de Burst (garde silencieuse).

## 6. Câblage UI minimal (CombatScene)

### HUD
Chaque panneau héros affiche désormais une 3ᵉ ligne : `LP {lp}/{maxLP}  |  Rang : Avant/Arrière`, à côté des lignes HP et SP/BP existantes.

### Menu et touches
| Action | Option de menu | Touche directe | Condition d'apparition |
|---|---|---|---|
| Swap | `[ Swap (S) ]` (toujours visible) | **S** | Toujours disponible pour le héros actif |
| Burst | `[ Burst (B) ]` (apparaît seulement si dispo) | **B** | `lp === maxLP` et le job du héros a un `burstSkillId` |
| Duo Combo | `[ Duo Combo (D) ]` (apparaît seulement si dispo) | **D** | Le héros connaît une compétence `isDuoCombo`, son partenaire est vivant, et les deux sont en rangée avant |

Swap s'exécute immédiatement (pas de ciblage). Burst et Duo Combo réutilisent l'écran de ciblage déjà construit en Phase 1 (choix de l'ennemi + BP), avec un intitulé dédié (« BURST » / « DUO COMBO ») dans le message affiché.

## 7. Vérification de compilation

```
$ npx tsc --noEmit -p tsconfig.json
EXIT_CODE=0
```

**Aucune erreur TypeScript.** Comme lors des phases précédentes, le bundling complet (`npm start`) n'a pas pu être exécuté jusqu'au bout dans le sandbox de vérification (délai dépassé sans erreur affichée) ; il est recommandé de lancer `npm start` en local pour valider visuellement l'ensemble avant de considérer la phase close.

## 8. Limites connues et points ouverts (non traités volontairement)

- **Swap consomme un tour.** C'est une simplification assumée pour cette V1 (le moteur exécute toute action via le même cycle `resolveAction` + `endTurn`) ; dans Octopath Traveler II, le changement de rangée est généralement une action gratuite. Un futur ajustement pourrait faire de `"swap"` une action hors-tour si le ressenti de jeu s'avère trop pénalisant.
- **L'IA ennemie ne swap, ne combo, ni ne burst jamais** (`buildSimpleAIAction` reste inchangé, hors périmètre de cette phase).
- **Esthétique non touchée** conformément à la consigne : positions/tailles ajustées au strict nécessaire pour éviter que le menu à 6 options ou le HUD à 3 lignes ne débordent de l'écran 800×600, sans recherche de mise en forme.

## Comment tester Swap et Burst dans la démo

1. Lancer `npm start`, choisir **Nouvelle Partie** pour entrer dans le combat de démo (Olberic + Cyrus vs Rat des bois).
2. **Swap** : à n'importe quel tour héros, appuyer sur **S** (ou choisir `[ Swap (S) ]` dans le menu) — Olberic (rangée avant) et Cyrus (rangée arrière) échangent immédiatement de rangée. Le HUD affiche le changement sur la ligne `Rang :`.
3. **Duo Combo** : après avoir Swap Cyrus en rangée avant (pour que les deux soient `Avant`), l'option `[ Duo Combo (D) ]` apparaît dans le menu du héros actif — appuyer sur **D** (ou la sélectionner), choisir la cible, valider.
4. **Burst** : enchaîner quelques attaques/compétences jusqu'à ce que la ligne `LP` d'un héros atteigne `100/100` — l'option `[ Burst (B) ]` apparaît alors ; appuyer sur **B** (ou la sélectionner), choisir la cible, valider pour déclencher le Burst du job (Rugissement du Champion pour Olberic, Éruption Arcanique pour Cyrus).

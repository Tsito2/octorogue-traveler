# Statistiques — Octorogue Traveler

*Comptages établis par lecture exhaustive de chaque fichier du dépôt (hors `node_modules/`, `.git/`, `.idea/`). Les lignes sont comptées à partir du contenu réel de chaque fichier.*

## Fichiers du dépôt (hors dépendances et métadonnées d'IDE)

| Catégorie | Nombre de fichiers |
|---|---|
| Fichiers TypeScript (`.ts`) | 29 |
| Fichiers JSON de données (`src/data/*.json`) | 4 |
| Fichiers de configuration (`package.json`, `tsconfig.json`, `webpack.config.js`, `config.yaml`) | 4 |
| Documentation (`README.md`, `docs/gameplay.md`) | 2 |
| HTML (`index.html`) | 1 |
| Assets binaires (`assets/**`) | 2 |
| `.gitignore` | 1 |
| **Total** | **43** |

## Lignes de code

| Ensemble | Fichiers | Lignes (approx.) |
|---|---|---|
| Module actif (`index.ts`, `core/`, `scenes/`, `data/*.ts`) | 17 | ≈ 946 |
| Module orphelin (`characters/`, `combat/*` hors scènes, `ui/`) | 12 | ≈ 421 |
| **Total TypeScript** | **29** | **≈ 1 467** |
| JSON de données | 4 | ≈ 105 |
| Configuration (webpack, tsconfig, package.json, config.yaml) | 4 | ≈ 114 |
| Documentation (README + docs/gameplay.md) | 2 | ≈ 161 |

Le fichier le plus long du dépôt est `src/scenes/CombatScene.ts` avec 324 lignes, suivi de `src/core/combat.ts` (160 lignes) et `src/characters/Character.ts` (90 lignes, module orphelin).

## Classes

| Ensemble | Nombre | Détail |
|---|---|---|
| Scènes Phaser (classes `extends Phaser.Scene`) | 4 | `MainMenuScene`, `GameScene`, `CombatScene`, `DialogueScene` |
| Moteur actif (hors scènes) | 1 | `CombatEngine` |
| Module orphelin | 12 | `Character`, `Hikari`, `Enemy`, `Party`, `BattleManager`, `TurnOrderCalculator`, `ActionResolver`, `DamageCalculator`, `BattleEvents`, `StatusEffect`, `HUD`, `DialogueBox` |
| **Total** | **17** | |

## Interfaces

16 interfaces au total : `CombatSceneData`, `Action`, `CombatLogEntry`, `CombatStateSnapshot`, `EncounterData`, `EnemyTemplate`, `DamageResult`, `Job`, `Skill`, `Stats`, `Resources`, `BattleStats`, `CharacterTemplateStats`, `CharacterTemplate`, `DamageOutcome`, `DamageOptions`.

## Types / alias de type

6 alias de type : `DamageType`, `SkillCategory`, `SkillTarget`, `EnemyDictionary`, `JobDictionary`, `SkillDictionary`.

## Scènes Phaser

4 scènes déclarées et enregistrées dans `SceneManager` : `MainMenuScene`, `GameScene`, `CombatScene`, `DialogueScene`. 3 sur 4 sont atteignables en jeu (`DialogueScene` est orpheline du point de vue de la navigation).

## Fichiers JSON de contenu

4 : `characters.json` (2 entrées), `enemies.json` (1 entrée), `jobs.json` (2 entrées), `skills.json` (2 entrées) — soit **7 entrées de contenu** au total tous fichiers confondus.

## Assets

2 fichiers binaires : 1 image (`background2.jpg`), 1 musique (`Main-Theme.mp3`). 0 spritesheet, 0 effet sonore.

## Systèmes identifiés

| Système | État |
|---|---|
| Système de scènes (`SceneManager`) | Actif |
| Système de combat data-driven (`core/*`) | Actif |
| Système de menu | Actif |
| Système de dialogue | Câblé mais inatteignable |
| Système de combat alternatif (`combat/*` hors scènes) | Orphelin (mort) |
| Système de personnages alternatif (`characters/*`) | Orphelin (mort) |
| Système d'UI générique (`ui/*`) | Orphelin (mort) |
| Système de sauvegarde | Absent |
| Système de progression | Absent |
| Système d'inventaire/équipement | Absent |

## Dépendances npm

| Type | Nombre | Liste |
|---|---|---|
| Production (`dependencies`) | 1 | `phaser` (`^3.87.0`) |
| Développement (`devDependencies`) | 7 | `copy-webpack-plugin`, `html-webpack-plugin`, `ts-loader`, `typescript`, `webpack`, `webpack-cli`, `webpack-dev-server` |
| **Total déclaré** | **8** | |

## Occurrences TODO / FIXME / commentaires de tâche

0 occurrence de `TODO`, `FIXME`, `XXX`, `HACK` ou `@todo` trouvée dans `src/`. En revanche, 11 occurrences de `console.log` subsistent dans le code (dont 2 stubs volontaires dans `MainMenuScene` pour "Continuer"/"Options", et 9 dans le module orphelin utilisées comme substitut de journalisation/HUD).

## Estimation de progression globale

*Méthode : chaque pourcentage est une estimation qualitative fondée sur le rapport entre ce qui existe/fonctionne et ce qu'impliquerait la vision du projet telle que décrite dans `README.md` et `docs/gameplay.md` (RPG complet façon Octopath Traveler : exploration, dialogues, combat, progression). Il ne s'agit pas d'une mesure automatisée mais d'un jugement d'audit explicite.*

| Domaine | Progression | Justification |
|---|---|---|
| Architecture | 55 % | Séparation données/logique/scènes posée et fonctionnelle pour le combat ; manque une architecture pour l'exploration, la sauvegarde, et un nettoyage du module orphelin |
| Gameplay | 20 % | Une boucle de combat complète et jouable existe ; aucune exploration, aucune progression, aucune fin de partie exploitable |
| Interface | 15 % | HUD de combat basique fonctionnel sans ciblage ni dépense de BP côté joueur ; menu principal navigable mais 2 options sur 3 non fonctionnelles ; aucun écran d'options/sauvegarde |
| Contenu | 5 % | 2 héros, 1 ennemi, 2 compétences, 1 décor, 1 musique : volume de contenu très en dessous de ce qu'impliquerait un RPG même court |
| Data (structures) | 45 % | Les modèles de données (`Stats`, `Skill`, `Job`, `EnemyTemplate`, `BattleStats`) sont déjà riches et extensibles, mais le volume de données réel est très faible et plusieurs champs documentés (`ipGain`, `breakPower`) ne sont pas encore modélisés |
| **Projet global** | **≈ 22 %** | Moyenne pondérée qualitative : le moteur de combat (le plus gros chantier technique) est bien avancé, mais il ne représente qu'une partie du jeu complet visé ; tout le reste (contenu, hors-combat, polish, sauvegarde) reste très majoritairement à faire |

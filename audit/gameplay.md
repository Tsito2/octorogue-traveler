# Gameplay — État des fonctionnalités

Légende : ✅ Terminée · 🟡 Partielle · ❌ Absente

## Menu et navigation

| Fonctionnalité | État | Détail |
|---|---|---|
| Affichage du menu principal (titre, options) | ✅ | `MainMenuScene.create()` : titre + 3 options rendues |
| Navigation clavier (Haut/Bas) | ✅ | `changeSelection`, bornée par `Phaser.Math.Clamp` |
| Surbrillance de l'option sélectionnée | ✅ | `updateMenuHighlight()` change le fond de l'option active |
| Musique de fond en boucle, déverrouillage audio navigateur | ✅ | Gère `this.sound.locked` avec fallback sur premier input |
| Option "Nouvelle Partie" | ✅ | Lance `GameScene` et arrête la musique |
| Option "Continuer" | ❌ | `console.log("Continuer")` uniquement, aucune sauvegarde à charger |
| Option "Options" | ❌ | `console.log("Options")` uniquement, aucun écran de réglages (volume, contrôles) |

## Boucle de jeu hors combat

| Fonctionnalité | État | Détail |
|---|---|---|
| Scène de jeu / exploration | ❌ | `GameScene` ne fait que créer une rencontre de test et démarrer `CombatScene` immédiatement — aucune carte, déplacement, ni interaction |
| Scène de dialogue | 🟡 | Code fonctionnel isolément (texte + clic pour revenir au menu) mais **jamais démarrée** dans le flux réel du jeu ; pas de système de dialogue à contenu variable (pas de fichier de script, pas de personnages parlants) |
| Chargement des assets | ✅ | `preload()` charge correctement les 2 assets existants (fond, musique) dans `MainMenuScene` et `CombatScene` |
| Overworld / carte du monde | ❌ | Aucun code, aucun asset de tuiles trouvé |
| Système de sauvegarde | ❌ | Aucun mécanisme de sérialisation/chargement d'état trouvé dans le dépôt |
| Système de progression (niveaux, XP) | ❌ | Aucun champ XP/niveau dans les modèles de données |
| Inventaire / objets | ❌ | Aucune structure de données ni UI |
| Équipement | ❌ | Aucune structure de données ni UI |

## Moteur de combat (`core/combat.ts`)

| Fonctionnalité | État | Détail |
|---|---|---|
| Boucle de tour (héros/ennemis alternés selon ordre fixe) | ✅ | `CombatEngine.advanceTurn` / `findNextActorIndex` |
| Résolution d'action (compétence + cible) | ✅ | `resolveAction` |
| Attaque de base | ✅ | Skill `basic_attack` défini en donnée |
| Action "Défendre" | 🟡 | Gérée par une branche spéciale codée en dur (`action.skillId === "defend"`) plutôt que comme une entrée de `skills.json` ; effet limité à +1 BP |
| IA ennemie | 🟡 | Extrêmement simple : utilise toujours `skillIds[0]` sur le premier héros vivant (`buildSimpleAIAction`), aucune variété de comportement |
| Détection de victoire / défaite | ✅ | `checkVictory()` |
| Écran de victoire / défaite | 🟡 | Message affiché (`Victoire !` / `Défaite...`) mais aucune suite programmée (pas de retour menu, pas de récompenses) |
| Journal de combat | ✅ | `CombatLogEntry[]`, affichage des 6 derniers messages dans `CombatScene` |
| Sélection de compétence par le joueur | ✅ | Sous-menu skills, navigation clavier + souris |
| Sélection de cible par le joueur | ❌ | `executeSkill` cible toujours automatiquement `getFirstLivingEnemy()` ; pas de curseur de ciblage même avec plusieurs ennemis |
| Ciblage allié / soi-même | ❌ | Les valeurs `SkillTarget` `"single_ally"` et `"self"` sont définies dans le type mais jamais traitées par `CombatEngine` |

## Statistiques et ressources

| Fonctionnalité | État | Détail |
|---|---|---|
| HP (points de vie) | ✅ | Suivi, affiché, cause la mort si ≤ 0 |
| SP (points de compétence) | ✅ | Décrémenté par `spendResources`, affiché pour les héros seulement (pas pour les ennemis dans le HUD) |
| BP (Boost Points) | 🟡 | Moteur complet (accumulation +1/tour, dépense, `bpScaling: "power"` / `"hits"`) mais **l'UI ne permet jamais au joueur de choisir combien de BP dépenser** : `bpSpent` vaut toujours `0` dans tous les appels de `CombatScene` |
| IP (Influence Points) | 🟡 | Accumulés (`gainIP` sur dégâts subis et sur Break) mais **jamais affichés dans le HUD ni utilisés** par aucune action (pas d'ultime, pas de limite) |
| Précision / Esquive | ✅ | Utilisées dans `calculateDamage` (`clampProbability`) |
| Taux critique | ✅ | Basé sur `lck`, multiplicateur ×1.5 |
| Bouclier / Break | ✅ | Décrément par coup sur faiblesse, passage en `isBroken`, multiplicateur de dégâts ×1.5, timer de 2 tours |
| Multi-coups (`bpScaling: "hits"`) | ✅ | Implémenté dans `calculateDamage`, mais aucune compétence de donnée actuelle n'utilise cette option (seul `fireball` utilise `"power"`) |
| Statuts (poison, stun, buffs/debuffs) | ❌ | La classe `StatusEffect` existe uniquement dans le module orphelin (`combat/StatusEffect.ts`), jamais intégrée à `CombatEngine` |

## HUD de combat

| Fonctionnalité | État | Détail |
|---|---|---|
| Affichage HP/SP/BP des héros | ✅ | `renderHeroes()` |
| Affichage HP/Bouclier/Faiblesses des ennemis | ✅ | `renderEnemies()` |
| Affichage IP (héros ou ennemis) | ❌ | Aucun affichage de la ressource IP dans le HUD malgré son suivi dans le moteur |
| Icônes/portraits de personnages | 🟡 | Simple rectangle coloré en guise d'icône (`icon` dans `renderHeroes`), aucun sprite réel |
| Animations de combat | ❌ | Aucune animation de sprite (attaque, dégâts, mort) ; tout est statique |

## Contenu de jeu

| Fonctionnalité | État | Détail |
|---|---|---|
| Personnages jouables | 🟡 | 2 définis (Olberic, Cyrus) dans `characters.json` |
| Jobs | 🟡 | 2 définis (Champion, Érudit) dans `jobs.json` |
| Ennemis | 🟡 | 1 seul défini (Rat des bois) dans `enemies.json` |
| Compétences | 🟡 | 2 définies en donnée (`basic_attack`, `fireball`) + `"defend"` codé en dur hors donnée |
| Rencontres | 🟡 | 1 seule rencontre codée en dur (`createTestEncounter`), aucun système de génération/paramétrage de rencontres |
| Musique | 🟡 | 1 seul thème, réutilisé identiquement au menu et en combat |
| Décors | 🟡 | 1 seul fond d'écran, réutilisé identiquement au menu et en combat |
| Sprites de personnages/ennemis | ❌ | Aucun asset graphique de personnage trouvé dans `assets/` malgré une classe `Hikari` prête à afficher une feuille de sprite `"hikari"` jamais fournie |

## Qualité / outillage

| Fonctionnalité | État | Détail |
|---|---|---|
| Build de production (`npm run build`) | ✅ | Script Webpack fonctionnel (`webpack --mode production`) |
| Serveur de développement (`npm start`) | ✅ | `webpack serve`, port 8080, hot reload |
| Tests automatisés | ❌ | `npm test` est un stub qui échoue volontairement (`echo "Error: no test specified" && exit 1`) |
| Lint | ❌ | Aucun script `lint` dans `package.json` alors que le workflow CI s'appelle "TypeScript Lint" |
| CI (GitHub Actions) | 🟡 | `config.yaml` définit un workflow mais est placé à la racine du dépôt au lieu de `.github/workflows/`, donc probablement inactif sur GitHub |

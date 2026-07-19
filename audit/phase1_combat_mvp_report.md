# Rapport — Phase 1 : correctif d'affichage + Combat MVP jouable

*Exécuté le 19 juillet 2026. Toutes les opérations ci-dessous ont été appliquées directement au dépôt.*

## 1. Bug d'affichage dupliqué

### Cause

Le bundle Webpack (`bundle.js`) s'exécutait **deux fois** dans la page, donc `new Phaser.Game(config)` était appelé deux fois (un seul appel existe dans `src/index.ts`, mais le fichier compilé était chargé deux fois côté HTML), créant deux canvas Phaser accolés dans `#game-container`.

En inspectant `dist/index.html` (sortie de build existante), la cause exacte est apparue clairement : deux balises `<script>` chargeant `bundle.js` étaient présentes dans le HTML final :

```html
<script defer="defer" src="bundle.js"></script>   <!-- injectée automatiquement par HtmlWebpackPlugin -->
...
<script src="bundle.js"></script>                  <!-- codée en dur dans index.html (template source) -->
```

`webpack.config.js` utilise `HtmlWebpackPlugin` avec son injection automatique par défaut (`inject: true`), qui ajoute déjà une balise `<script>` pointant vers le bundle compilé. Le fichier source `index.html` contenait **en plus** une balise `<script src="bundle.js"></script>` codée en dur. Résultat : le plugin ajoutait sa propre balise sans supprimer celle déjà présente dans le template, donc le script s'exécutait deux fois.

### Solution appliquée

- Retrait de la balise `<script src="bundle.js"></script>` codée en dur dans `index.html` (un commentaire explicatif a été laissé à sa place pour éviter une régression future).
- `HtmlWebpackPlugin` reste seul responsable de l'injection du bundle (déjà correctement configuré dans `webpack.config.js`, aucune modification nécessaire côté Webpack).
- Ajout de `display: flex; align-items: center; justify-content: center;` sur `#game-container` pour garantir un canvas unique bien centré à l'écran (auparavant sans règle de centrage explicite).

**Fichiers modifiés :** `index.html`.

## 2. Extension des interfaces de données (Phase 1 — préparation)

| Fichier | Modification |
|---|---|
| `src/core/skills.ts` | Ajout de `breakPower: number` à l'interface `Skill` (remplace le -1 fixe auparavant codé en dur dans `formulas.ts`) |
| `src/core/jobs.ts` | Ajout de `maxBP: number` à l'interface `Job` (remplace la constante `5` auparavant codée en dur dans `encounters.ts`) |
| `src/data/skills.json` | `breakPower: 1` ajouté à `basic_attack` et `fireball` |
| `src/data/jobs.json` | `maxBP: 5` ajouté à `warrior` (Olberic) et `scholar` (Cyrus) |
| `src/core/formulas.ts` | `applyBreak` utilise désormais `skill.breakPower` au lieu de `-1` codé en dur |
| `src/core/encounters.ts` | `createHeroFromTemplate` utilise `job?.maxBP ?? 5` au lieu de `5` codé en dur |

Aucune valeur n'a été laissée manquante : la démo (Olberic, Cyrus, Rat des bois, Attaque, Boules de Feu) dispose de toutes les données requises par les nouveaux champs.

## 3. Combat MVP jouable — `src/scenes/CombatScene.ts`

### Sélection de cible

Choisir « Attaque » ou une compétence dans le sous-menu Skills n'exécute plus automatiquement l'action sur le premier ennemi vivant. Le jeu entre désormais dans une **phase de ciblage** :

- Les ennemis vivants deviennent la liste de cibles disponibles (`beginTargeting`).
- La cible sélectionnée est mise en surbrillance directement sur son cadre dans le HUD (bordure jaune au lieu de rouge).
- Un ennemi peut aussi être ciblé/validé directement à la souris (survol = présélection, clic = validation immédiate).

### Dépense de BP

Un texte d'invite (« *Attaque -> Cible : Rat des bois | BP : 1/1* ») et deux boutons `[ - BP ]` / `[ + BP ]` apparaissent pendant le ciblage. La valeur choisie (`bpSpent`) est bornée par le BP réellement disponible du héros actif et transmise telle quelle à `CombatEngine.advanceTurn(...)`, qui l'utilisait déjà en interne (`bpScaling`, `calculateDamage`) sans jamais la recevoir jusqu'ici.

### Ce qui n'a volontairement pas été implémenté

Conformément à la contrainte de la tâche, ni le Pouvoir Latent (Burst / `lp`), ni le Duo Swap n'ont été câblés dans l'UI à ce stade — seuls le ciblage et le BP ont été rendus jouables.

**Fichier modifié :** `src/scenes/CombatScene.ts`.

## 4. Vérification de compilation

```
$ npx tsc --noEmit -p tsconfig.json
EXIT_CODE=0
```

**Aucune erreur TypeScript.**

*Note : comme lors de la Phase 0, le bundling complet via `npm run build` / `npm start` (Webpack + ts-loader + Phaser) n'a pas pu être mené à son terme dans le délai du bac à sable de vérification utilisé pour cette tâche (le processus dépasse systématiquement le temps imparti sans afficher d'erreur avant l'interruption). Le correctif du bug d'affichage a été vérifié de façon structurelle : la balise `<script>` dupliquée a été localisée avec certitude dans la sortie de build existante (`dist/index.html`), retirée du template source, et il ne reste plus qu'un seul point d'instanciation de `Phaser.Game` dans tout `src/` (`src/index.ts`, vérifié par recherche exhaustive). Il est recommandé de lancer `npm start` localement pour confirmer visuellement l'affichage à écran unique avant mise en production.*

## Résumé chiffré

| Métrique | Valeur |
|---|---|
| Cause du bug d'affichage | Double injection de `<script src="bundle.js">` (template + HtmlWebpackPlugin) |
| Fichiers modifiés pour le correctif d'affichage | 1 (`index.html`) |
| Fichiers modifiés pour `breakPower`/`maxBP` | 6 (`core/skills.ts`, `core/jobs.ts`, `core/formulas.ts`, `core/encounters.ts`, `data/skills.json`, `data/jobs.json`) |
| Fichiers modifiés pour le ciblage + BP | 1 (`scenes/CombatScene.ts`) |
| Erreurs TypeScript après implémentation | 0 |

---

## Comment utiliser le ciblage et les BP dans la nouvelle interface V1

1. Depuis le menu d'action du combat, choisir **Attaque** ou une compétence dans **Skills** (clavier : Haut/Bas puis Entrée ; souris : clic sur l'option).
2. Le jeu passe en **mode ciblage** : un cadre jaune indique l'ennemi actuellement visé, et un message en bas de l'écran rappelle la compétence, la cible et le BP sélectionné.
3. **Choisir la cible** :
   - Clavier : Haut/Bas pour passer d'un ennemi vivant à l'autre.
   - Souris : survoler un ennemi le présélectionne ; cliquer dessus valide immédiatement l'attaque (avec le BP actuellement sélectionné).
4. **Choisir le BP à dépenser** (optionnel, 0 par défaut) :
   - Clavier : Gauche/Droite pour diminuer/augmenter le BP dépensé (borné par le BP disponible du héros).
   - Souris : boutons `[ - BP ]` / `[ + BP ]` affichés sous le message de ciblage.
5. **Valider l'action** : Entrée ou Espace (clavier), ou clic direct sur l'ennemi ciblé (souris).
6. **Annuler le ciblage** sans consommer de tour : touche Échap — retourne au menu Attaque/Skills/Défendre (ou au sous-menu Skills si c'est de là que le ciblage a été lancé).

L'action « Défendre » reste immédiate (pas de ciblage, elle s'applique toujours au héros actif) et régénère 1 BP comme auparavant.

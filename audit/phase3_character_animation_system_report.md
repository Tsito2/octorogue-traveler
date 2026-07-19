# Rapport — Système d'animations data-driven pour les sprites personnages

*Exécuté le 19 juillet 2026. Toutes les opérations ci-dessous ont été appliquées directement au dépôt.*

## ⚠️ Écart constaté sur les assets fournis

Avant toute chose : le dossier `assets/characters/OT2/` contient **9 fichiers**, pas 8, et un nom diffère de la consigne.

| Attendu (consigne) | Réel sur disque | Statut |
|---|---|---|
| `Agnea.png` | `Agnea.png` | ✅ conforme |
| `Castti.png` | `Castti.png` | ✅ conforme |
| `Hikari.png` | `Hikari.png` | ✅ conforme |
| `Ochette.png` | `Ochette.png` | ✅ conforme |
| `Osvald.png` | `Osvald.png` | ✅ conforme |
| `Partitio.png` | `Partitio.png` | ✅ conforme |
| `Temenos.png` | `Temenos.png` | ✅ conforme |
| `Throne.png` | `Throné.png` | ⚠️ nom réel accentué — le code référence le vrai nom de fichier (`Throné.png`), encodé via `encodeURIComponent` pour un chargement fiable |
| *(non mentionné)* | `Akala and Mahina.png` | ⚠️ fichier supplémentaire non prévu, semble représenter **deux** personnages sur une seule feuille — **non intégré** au manifeste de chargement (voir plus bas), à clarifier avec vous avant de lui attribuer un `spriteKey` |

## Fichiers créés

| Fichier | Rôle |
|---|---|
| `src/data/animations.json` | Données d'animation (clé → clips `idle`/`attack`/`hurt` avec `start`/`end`/`frameRate`/`repeat`), une entrée par `spriteKey` connu, valeurs fictives |
| `src/core/AnimationManager.ts` | Service qui lit `animations.json` et génère les `scene.anims.create(...)` correspondants — aucune animation codée en dur |
| `src/scenes/PreloadScene.ts` | Nouvelle scène de démarrage : charge dynamiquement les spritesheets personnages, enregistre les animations, puis démarre `MainMenuScene` |

## Fichiers modifiés

| Fichier | Modification |
|---|---|
| `src/data/characters.ts` | `CharacterTemplate` reçoit un champ `spriteKey: string` |
| `src/data/characters.json` | Olberic → `spriteKey: "spr_hikari"`, Cyrus → `spriteKey: "spr_osvald"` (voir note de mapping ci-dessous) |
| `src/core/stats.ts` | `BattleStats` reçoit un champ optionnel `spriteKey?: string` (véhicule la donnée jusqu'au runtime de combat) |
| `src/core/encounters.ts` | `createHeroFromTemplate` propage `template.spriteKey` vers le `BattleStats` créé |
| `src/core/SceneManager.ts` | `PreloadScene` ajoutée en tête de la liste des scènes (première scène démarrée par Phaser) |
| `src/scenes/CombatScene.ts` | Le rectangle placeholder du HUD héros est remplacé par un vrai `Phaser.GameObjects.Sprite` jouant l'animation `idle`, avec repli automatique sur le rectangle si le sprite est indisponible |

## Note sur le mapping spriteKey des personnages existants

Ni Olberic ni Cyrus (les 2 héros de la démo) ne correspondent nommément à l'un des 8 sprites fournis. J'ai choisi de les faire correspondre **par archétype de job**, cohérence directement suggérée par l'exemple donné dans la consigne (`spr_hikari`) :
- **Olberic** (job `warrior`) → `spr_hikari` — Hikari est l'archétype Guerrier dans Octopath Traveler II.
- **Cyrus** (job `scholar`) → `spr_osvald` — Osvald est l'archétype Érudit dans Octopath Traveler II.

C'est une correspondance par cohérence thématique, réversible en une ligne dans `characters.json` si vous préférez un autre mapping (ou renommer directement les personnages).

## Où modifier FRAME_WIDTH / FRAME_HEIGHT

**`src/scenes/PreloadScene.ts`, lignes 18-19** :

```ts
export const FRAME_WIDTH = 64;
export const FRAME_HEIGHT = 64;
```

C'est la **seule** valeur à changer une fois les vraies dimensions de grille mesurées sur les fichiers `assets/characters/OT2/*.png`. Ces constantes sont exportées et réutilisées automatiquement :
- par `PreloadScene.preload()` pour découper chaque spritesheet en frames,
- par `CombatScene.createHeroIcon()` (import `{ FRAME_WIDTH, FRAME_HEIGHT }` depuis `PreloadScene`) pour calculer l'échelle d'affichage dans le cadre 50×50 du HUD.

*Toutes les spritesheets du manifeste utilisent actuellement la même taille de frame. Si les 8 fichiers ont des grilles de tailles différentes, il faudra passer d'une constante unique à une taille par fichier dans `CHARACTER_SPRITESHEETS` (structure prévue pour être étendue facilement, ex. ajouter `frameWidth`/`frameHeight` par entrée).*

## Structure de `animations.json`

```json
{
  "<spriteKey>": {
    "<nomAnimation>": {
      "start": 0,
      "end": 3,
      "frameRate": 6,
      "repeat": -1
    }
  }
}
```

- `<spriteKey>` : doit correspondre exactement à la clé de texture chargée dans `PreloadScene.ts` (`spr_agnea`, `spr_hikari`, etc.) et au champ `spriteKey` de `characters.json`.
- `<nomAnimation>` : nom libre (`idle`, `attack`, `hurt`, `victory`, `defeat`, ...). La clé Phaser générée est automatiquement `"<spriteKey>_<nomAnimation>"` (ex. `spr_hikari_attack`), gérée par `AnimationManager.getAnimationKey()`.
- `start` / `end` : index de frame (0-based) dans la grille de la spritesheet, à ajuster selon les vraies feuilles.
- `frameRate` : images par seconde de lecture.
- `repeat` : `-1` = boucle infinie (`idle`), `0` = jouée une seule fois (`attack`, `hurt`).

### Pour ajouter l'animation d'attaque ou de dégâts subis

Les clips `attack` et `hurt` sont **déjà présents** pour les 8 `spriteKey` (valeurs fictives, `start`/`end` à ajuster) :

```json
"spr_hikari": {
  "idle":   { "start": 0, "end": 3, "frameRate": 6,  "repeat": -1 },
  "attack": { "start": 4, "end": 7, "frameRate": 10, "repeat": 0 },
  "hurt":   { "start": 8, "end": 9, "frameRate": 8,  "repeat": 0 }
}
```

Pour ajouter un nouveau type d'animation (ex. `victory`), ajouter simplement une entrée du même format dans le bloc du `spriteKey` concerné — aucune modification de code n'est nécessaire, `AnimationManager.registerAll()` la prendra en compte automatiquement au prochain démarrage. Pour la déclencher en jeu : `sprite.play(AnimationManager.getAnimationKey(spriteKey, "victory"))`.

## Vérification de compilation

```
$ npx tsc --noEmit -p tsconfig.json
EXIT_CODE=0
```

**Aucune erreur TypeScript.** Comme lors des phases précédentes, le bundling complet (`npm start`) n'a pas pu être exécuté jusqu'au bout dans le sandbox de vérification (délai dépassé sans erreur affichée avant l'interruption) : il est recommandé de lancer `npm start` en local pour confirmer visuellement l'affichage des sprites (même avec des dimensions de frame provisoires) avant de considérer cette phase close.

## Limites connues

- Seuls les héros affichent désormais un sprite réel ; les ennemis restent en texte/rectangles (hors périmètre de cette tâche, aucun sprite d'ennemi n'a été fourni).
- `Akala and Mahina.png` n'est chargé par aucun `spriteKey` tant que sa nature (un ou deux personnages) n'est pas clarifiée.
- Les index `start`/`end` de `animations.json` sont fictifs pour les 8 spritesheets : l'affichage sera visuellement incorrect (mauvais découpage de frames) tant que `FRAME_WIDTH`/`FRAME_HEIGHT` et les index ne sont pas ajustés aux vraies feuilles.

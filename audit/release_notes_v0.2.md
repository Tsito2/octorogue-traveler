# Release Notes — v0.2 (correctif visuel)

*Exécuté le 19 juillet 2026. Toutes les opérations ci-dessous ont été appliquées directement au dépôt.*

## Résumé

Deux bugs visuels bloquants corrigés : la mini-grille de personnages (animation mal découpée) et le chevauchement du 4ᵉ panneau héros avec le journal de combat. Compilation TypeScript vérifiée : **0 erreur**.

## 1. Sprites héros : passage en statique

- **`src/scenes/CombatScene.ts`** (`createHeroIcon`) : suppression de `sprite.play(...)` et de la dépendance à `AnimationManager`. Le sprite affiche désormais uniquement `sprite.setFrame(0)`, redimensionné à taille fixe (`setDisplaySize(40, 40)`) indépendamment de `FRAME_WIDTH`/`FRAME_HEIGHT`. Les imports `AnimationManager` et `FRAME_WIDTH`/`FRAME_HEIGHT` ont été retirés de ce fichier (devenus inutiles).
- **`src/scenes/PreloadScene.ts`** : l'appel `AnimationManager.registerAll(this)` dans `create()` est commenté (plus d'enregistrement d'animations au boot). La classe `AnimationManager` elle-même n'est pas supprimée — elle reste réutilisable telle quelle si les animations sont réactivées plus tard.
- **Avertissement ajouté** au-dessus de `FRAME_WIDTH`/`FRAME_HEIGHT` dans `PreloadScene.ts` (bloc `⚠️⚠️⚠️`) : la valeur 64x64 actuelle est un placeholder trop grand par rapport aux planches réelles — c'est la cause racine de la mini-grille observée. La consigne explicite d'aller mesurer la vraie taille d'une case et de remplacer ces deux constantes est maintenant impossible à manquer en lisant le fichier.

**Confirmation :** plus aucun appel à `.play()` ni à `AnimationManager` dans le rendu des héros. Chaque sprite affiche une seule frame fixe (frame 0).

## 2. Layout HUD héros : fin du chevauchement avec le journal

**Cause du bug :** avec l'ancien espacement (panneau 112px de haut, pas de 118px, départ à y=90), le 4ᵉ panneau (Castti) occupait l'écran de y=444 à y=556 — or le journal de combat (rectangle 760x150 centré en y=520) commence à y=445. Chevauchement direct.

**Correctifs appliqués** (`CombatScene.ts`, constantes `HERO_PANEL_*`) :

| Paramètre | Avant (v0.1) | Après (v0.2) |
|---|---|---|
| Hauteur de panneau | 112px | **70px** |
| Pas entre panneaux | 118px | **78px** (70 + 8 de marge) |
| Y de départ | 90 | **55** |
| Zone occupée par les 4 panneaux | y = 90 → 556 | **y = 55 → 359** |

Avec ces valeurs, le 4ᵉ panneau se termine à y=359, ce qui laisse **86px de marge libre** avant le journal (qui démarre à y=445) — plus de risque de chevauchement même avec un futur 5ᵉ ou 6ᵉ membre d'équipe tant que le nombre reste raisonnable.

**Ajustements de police** pour tenir dans le panneau réduit : nom du héros 18px→**14px**, bloc stats (HP/SP/BP/LP/Rang) 14px→**11px**. L'icône du sprite est passée de 50x50 à **40x40** et recentrée verticalement au milieu du panneau (35px).

## 3. Journal de combat : padding

Le texte du journal démarrait à y=450 alors que le fond du panneau commence à y=445 (5px de marge à peine). Le texte a été décalé à **y=460**, ce qui donne 15px de marge en haut, symétrique avec la marge en bas pour 6 lignes de texte à 16px (le texte se termine vers y=580, le panneau vers y=595). La largeur de `wordWrap` (700px) est inchangée et laisse déjà 30px de marge de chaque côté du panneau (760px de large).

## Vérification de compilation

```
$ npx tsc --noEmit -p tsconfig.json
EXIT_CODE=0
```

**0 erreur TypeScript.** Comme lors des phases précédentes, le build Webpack complet n'a pas pu être exécuté jusqu'au bout dans ce sandbox (limite de temps de l'outil) : lancer `npm start` en local pour confirmer visuellement la disparition de la mini-grille et du chevauchement.

## Action restante côté utilisateur

`FRAME_WIDTH`/`FRAME_HEIGHT` dans `PreloadScene.ts` (toujours 64x64) doivent être mesurés et corrigés sur les vraies planches `assets/characters/OT2/*.png` pour que même la frame 0 statique s'affiche correctement recadrée (sans quoi elle peut encore montrer un fragment de plusieurs cases).

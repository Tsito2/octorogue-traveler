# Release Notes — v0.2.1 (hotfix ergonomie combat)

*Exécuté le 19 juillet 2026. Toutes les opérations ci-dessous ont été appliquées directement au dépôt (`src/scenes/CombatScene.ts`, `src/scenes/PreloadScene.ts` inchangé cette fois).*

## Résumé

Trois correctifs critiques : le menu d'actions et le journal de combat sont maintenant deux panneaux physiquement séparés, la jauge "LP" est renommée "Burst", et une rustine `setCrop` force l'affichage d'un seul personnage en attendant la correction de `FRAME_WIDTH`/`FRAME_HEIGHT`. Compilation vérifiée : **0 erreur TypeScript**.

## 1. Séparation physique Menu / Console

**Cause du bug :** le menu (`buildRootMenu`, x=60, y=450 à 570) et le journal de combat (`logPanel`, rectangle centré en (400,520) de 760x150, donc y=445 à 595) occupaient la **même zone verticale** — le menu était littéralement dessiné par-dessus le fond du journal.

**Nouveau découpage (deux panneaux distincts, jamais superposés) :**

| Élément | X | Y | Remarque |
|---|---|---|---|
| Panneau **ACTIONS** (menu) | 20 → 390 (largeur 370) | 415 → 590 (hauteur 175) | fond `#14161b`, bordure bleue |
| Panneau **JOURNAL DE COMBAT** (console) | 410 → 780 (largeur 370) | 415 → 590 (hauteur 175) | fond `#14161b`, bordure orange |
| Couloir vide entre les deux | 390 → 410 (20px) | — | garantit qu'ils ne se touchent jamais |

- Menu racine : colonne à `x=40`, `baseY=433`, pas de 24px — jusqu'à 6 options (Attaque/Skills/Défendre/Swap/Burst/DuoCombo) tiennent jusqu'à `y=553`, avant la fin du panneau (`590`).
- Sous-menu Skills : 2ᵉ colonne à `x=220` (toujours dans le panneau, qui va jusqu'à 390), même `baseY=433`.
- Journal : texte à `x=430`, `y=437`, largeur de `wordWrap` réduite à `330px` (panneau de 370px moins 40px de marge), et **limité aux 4 dernières actions** (`slice(-4)` au lieu de `slice(-6)`) pour ne jamais déborder du panneau.
- Bande de ciblage (prompt de cible + boutons BP, visible seulement pendant la sélection) repositionnée entre `y=372` et `y=411` — au-dessus des deux panneaux (qui commencent à `y=415`), pour ne chevaucher ni le menu ni la console même pendant le ciblage.

Chaque zone a désormais son propre fond sombre et son propre en-tête (`ACTIONS` / `JOURNAL DE COMBAT`) pour une lecture immédiate.

## 2. HUD : "LP" renommé "Burst"

`renderHeroes()` : la ligne `LP {valeur}/{max}` devient `Burst {valeur}/{max}`. Choix de "Burst" (plutôt que "Latent") pour rester cohérent avec le libellé déjà utilisé dans le menu d'actions ("Burst (B)") — le joueur associe directement la jauge à l'action qu'elle débloque.

## 3. Rustine sprites : un seul personnage affiché

**Cause exacte :** `FRAME_WIDTH`/`FRAME_HEIGHT` (`PreloadScene.ts`) valent toujours 64x64, une taille trop grande par rapport à une case réelle des planches OT2. La frame 0 découpée par Phaser contient donc une grille 2x2 de 4 personnages au lieu d'une case unique — `setFrame(0)` seul ne suffisait pas car le problème est dans le découpage en amont, pas dans le choix de la frame.

**Correctif temporaire** (`createHeroIcon`) : après `setFrame(0)`, un `sprite.setCrop(0, 0, FRAME_WIDTH / 2, FRAME_HEIGHT / 2)` recadre manuellement le quart supérieur gauche de la frame, suivi de `setDisplaySize(40, 40)` pour remettre à l'échelle d'affichage. Un commentaire ⚠️ explicite dans le code indique que cette rustine devient obsolète (et peut être retirée) dès que `FRAME_WIDTH`/`FRAME_HEIGHT` seront mesurés et corrigés sur les vraies planches.

## Vérification de compilation

```
$ npx tsc --noEmit -p tsconfig.json
EXIT_CODE=0
```

**0 erreur TypeScript.** Comme lors des phases précédentes, le build Webpack complet n'a pas pu être exécuté jusqu'au bout dans ce sandbox (limite de temps de l'outil) : lancer `npm start` en local pour confirmer visuellement la séparation menu/console et l'affichage à un seul personnage.

## Action restante côté utilisateur

`FRAME_WIDTH`/`FRAME_HEIGHT` dans `PreloadScene.ts` doivent toujours être mesurés sur les vraies planches `assets/characters/OT2/*.png` et corrigés. Une fois fait, la rustine `setCrop` de `createHeroIcon()` (avec son commentaire ⚠️) peut être retirée — elle deviendra inutile puisque `setFrame(0)` seul suffira alors à afficher une case correcte.

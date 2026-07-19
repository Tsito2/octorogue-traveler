# Release Notes — v0.1 (première démo jouable)

*Exécuté le 19 juillet 2026. Toutes les opérations ci-dessous ont été appliquées directement au dépôt.*

## Résumé

Le roster de démonstration passe de 2 héros (Olberic/Cyrus, code mort de test) à **4 héros définitifs** formant deux duos, avec musique de combat en boucle et sprite réel pour l'ennemi. Compilation TypeScript vérifiée : **0 erreur**.

## Nouvelles classes (jobs)

Trois jobs ajoutés dans `src/data/jobs.json`, chacun avec une attaque de base, `duo_strike`, `maxBP: 5` et des valeurs par défaut sûres (`burstSkillId` absent = option Burst simplement non proposée en combat, pas de crash) :

| Job | Armes | Éléments | Rangée préférée |
|---|---|---|---|
| `hunter` (Chasseur) | arc | — | Arrière |
| `dancer` (Danseuse) | dague | lumière | Avant |
| `apothecary` (Apothicaire) | hache | glace | Arrière |

`warrior` (existant) reste inchangé. `scholar` (existant, associé à Cyrus) est conservé tel quel dans `jobs.json` bien qu'il ne soit plus utilisé par le roster de démo — non supprimé pour rester dans le périmètre demandé (roster/jobs), à retirer sur demande.

## Nouveau roster (`src/data/characters.json`)

Olberic et Cyrus retirés. 4 héros ajoutés avec stats dédiées :

| Héros | Job | spriteKey | HP | Profil |
|---|---|---|---|---|
| Ochette | hunter | `spr_ochette` | 95 | ATK/SPD élevés |
| Hikari | warrior | `spr_hikari` | 130 | Tank/ATK |
| Agnea | dancer | `spr_agnea` | 85 | SPD/MAG, évasion |
| Castti | apothecary | `spr_castti` | 90 | MAG/RES, soutien |

## Duos et placement (`src/core/encounters.ts`)

`createTestEncounter()` reconstruit entièrement pour tester Swap et Duo Combo dès le premier tour :

- **Duo 1 — Hikari (front) + Agnea (front)** : les deux rangées déjà alignées à l'avant → Duo Combo jouable immédiatement, sans Swap.
- **Duo 2 — Ochette (back) + Castti (back)** : les deux rangées alignées à l'arrière → un seul Swap suffit à amener le duo au front et débloquer le Duo Combo.

Ce choix (paires *alignées* plutôt que scindées) tient compte d'un comportement du moteur découvert en Phase 2 : `performSwap` bascule les deux rangées du duo *simultanément*, donc une paire scindée (un front, un back) ne peut jamais atteindre "les deux en front" par swaps successifs — seule une paire alignée le peut.

## Ennemi et son

- **`src/data/enemies.json`** : `forest_rat` reçoit `"spriteKey": "spr_rat"`, propagé via `src/core/enemies.ts` (nouveau champ optionnel `spriteKey?` sur `EnemyTemplate`), `src/data/enemies.ts` et `src/core/encounters.ts` (`createEnemyFromTemplate` transmet désormais `spriteKey` au `BattleStats`).
- **`src/scenes/PreloadScene.ts`** : charge `spr_rat` comme image statique (`assets/ennemies/mob/rat.png`) et la musique de combat comme `battleTheme` (`assets/music/Battle 0.mp3`, espace encodé via `encodeURIComponent`, même précaution que pour `Throné.png`).
- **`src/scenes/CombatScene.ts`** :
  - `preload()` ne charge plus `battleTheme` (l'ancienne ligne pointait par erreur vers `Main-Theme.mp3` et serait entrée en conflit avec le chargement correct fait dans `PreloadScene`) — supprimée.
  - `create()` joue déjà la musique en boucle (`{ volume: 0.4, loop: true }`), inchangé, désormais alimenté par le bon fichier.
  - Nouvelle méthode `createEnemyIcon()` : affiche un vrai `Sprite` pour "Rat des bois" à la place du placeholder rectangulaire, avec `setDisplaySize(60, 60)` et **`setFlipX(true)`** — le sprite du rat fait face à droite nativement, or l'ennemi est affiché à droite du plateau face aux héros à gauche, d'où le flip systématique.

## Vérification de compilation

```
$ npx tsc --noEmit -p tsconfig.json
EXIT_CODE=0
```

**0 erreur TypeScript.** Comme lors des phases précédentes, le build Webpack complet n'a pas pu être exécuté jusqu'au bout dans ce sandbox (limite de temps de l'outil) : lancer `npm start` en local pour confirmer visuellement l'affichage des 4 héros, du rat retourné et l'audio de combat.

## Limites connues

- `scholar` reste dans `jobs.json`, orphelin de tout personnage du roster actuel.
- Les stats des 4 nouveaux héros et des 3 nouveaux jobs sont des valeurs de départ raisonnables mais provisoires, à rééquilibrer par la suite.
- Aucun des 3 nouveaux jobs n'a de `burstSkillId` : le bouton Burst ne s'affichera donc pas pour Ochette/Agnea/Castti (seul Hikari, job `warrior`, en dispose). À ajouter si le Burst doit être testable sur les 4 héros.

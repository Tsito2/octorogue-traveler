# Assets — Octorogue Traveler

## Inventaire complet

Le dossier `assets/` du dépôt ne contient que **2 fichiers** au total :

| Fichier | Type | Utilisé par | Statut |
|---|---|---|---|
| `assets/backgrounds/background2.jpg` | Image (fond) | `MainMenuScene.preload()`, `CombatScene.preload()` | ✅ Utilisé (dans les 2 scènes) |
| `assets/music/Main-Theme.mp3` | Audio (musique) | `MainMenuScene.preload()` (clé `mainTheme`), `CombatScene.preload()` (clé `battleTheme`) | ✅ Utilisé (même fichier chargé sous deux clés différentes) |

Il n'y a **aucune image de personnage, aucune spritesheet, aucun effet sonore (SFX), aucune icône d'interface, aucune police personnalisée** dans le dépôt.

## Images

- 1 seule image : `background2.jpg`, utilisée comme fond plein écran identique pour le menu principal et pour le combat (`setDisplaySize(this.scale.width, this.scale.height)` dans les deux scènes). Aucune distinction visuelle entre les deux contextes.
- Aucune image de personnage, portrait, icône ou élément d'UI graphique : le HUD de combat utilise exclusivement des primitives Phaser (rectangles colorés, texte) — voir `CombatScene.renderHeroes()` où l'« icône » d'un héros est un simple rectangle bleu (`0x4a90e2`).

## Musiques

- 1 seule piste : `Main-Theme.mp3`. Chargée deux fois sous deux clés Phaser différentes (`mainTheme` au menu, `battleTheme` en combat) mais il s'agit bien du même fichier physique — il n'y a donc pas de thème de combat distinct du thème de menu, malgré le nommage `battleTheme` qui le laisse penser.
- Le `README.md` racine attribue cette musique à *Octopath Traveler Official, by Yasunori Nishiki* (section Crédits) — probable réutilisation d'un asset sous licence tierce à des fins de prototypage ; à traiter avant toute publication du jeu.

## Sons (SFX)

Aucun effet sonore n'existe dans le dépôt : pas de son de coup, de sélection de menu, de victoire/défaite, de Break, etc.

## Spritesheets

Aucune spritesheet n'est présente. Cela contredit directement le code de `src/characters/Hikari.ts`, qui définit deux animations (`walk`, `run`) basées sur une texture nommée `"hikari"` censée être une feuille de sprites, mais :
1. Aucun fichier de ce nom n'existe dans `assets/`.
2. Aucun appel `this.load.spritesheet("hikari", ...)` n'existe nulle part dans le code (recherché dans tout `src/`).
3. La classe `Hikari` elle-même fait partie du module orphelin jamais instancié (voir `architecture.md`).

Il s'agit donc d'une ressource **prévue mais totalement absente**, dans un module qui de toute façon n'est pas connecté au jeu actif.

## Ressources inutilisées

Aucune ressource binaire inutilisée n'a été trouvée : les 2 seuls fichiers présents dans `assets/` sont tous deux effectivement chargés par le code actif. Il n'y a donc pas de "poids mort" du côté des assets eux-mêmes — le poids mort du dépôt est entièrement situé côté code (voir `architecture.md`, module orphelin).

## Ressources manquantes

En croisant le code et la documentation (`README.md`, `docs/gameplay.md`) avec le contenu réel de `assets/`, les ressources suivantes sont attendues mais absentes :

- **Spritesheet `hikari`** : référencée par `src/characters/Hikari.ts` (module orphelin), jamais fournie.
- **`menu-bg.png`** : mentionnée explicitement dans la structure de projet documentée par `README.md` racine (section "Structure du projet"), mais le fichier réellement présent et chargé est `background2.jpg` — la documentation ne correspond plus au dépôt actuel.
- **Portraits/sprites de personnages jouables** (Olberic, Cyrus) : aucun asset graphique associé, malgré leur présence dans `characters.json`.
- **Sprite de l'ennemi** (Rat des bois) : aucun asset graphique, l'ennemi n'est représenté que par du texte dans le HUD.
- **Effets sonores** de combat (coup, critique, Break, victoire, défaite, sélection de menu) : aucun trouvé.
- **Thème de combat distinct** : le nommage du code (`battleTheme`) suggère qu'un thème différent était prévu pour le combat, mais c'est actuellement le même fichier que la musique de menu.
- **Assets d'interface** (cadres, icônes de statut, curseurs) : le HUD actuel est composé uniquement de primitives géométriques Phaser, sans aucun habillage graphique dédié.

## Hypothèse signalée

Il n'est pas possible de déterminer, à partir du seul contenu du dépôt, si l'attribution de la musique à *Octopath Traveler Official* (mentionnée dans `README.md`) constitue un problème de droits pour un usage commercial futur ; ce point relève d'une décision produit/juridique hors du périmètre de cet audit technique, mais est signalé ici car il concerne directement l'unique asset audio du jeu.

# Audit global — Octorogue Traveler

## Résumé global

Octorogue Traveler est un RPG 2D au tour par tour développé en TypeScript sur le framework Phaser 3, ouvertement inspiré d'Octopath Traveler (menu, mécaniques Break/Boost, esthétique). Le dépôt contient deux ensembles de code très différents dans leur niveau de finition :

1. **Un module actif et fonctionnel** (`src/index.ts`, `src/core/`, `src/scenes/`, `src/data/`) qui constitue le jeu réellement jouable : un menu principal, une scène de jeu placeholder, et une scène de combat au tour par tour data-driven (JSON) avec un moteur (`CombatEngine`) gérant dégâts, critiques, précision/esquive, Break (bouclier), Boost (BP) et Influence Points (IP).
2. **Un module orphelin** (`src/characters/Character.ts`, `src/characters/Hikari.ts`, tout `src/combat/*` sauf le dossier n'existe pas — précisément `BattleEvents.ts`, `BattleManager.ts`, `Party.ts`, `StatusEffect.ts`, `TurnOrderCalculator.ts`, `ActionResolver.ts`, `DamageCalculator.ts`, `Enemy.ts` — ainsi que `src/ui/DialogueBox.ts` et `src/ui/HUD.ts`) qui n'est importé par **aucun** fichier du module actif. Il s'agit d'un prototype de moteur de combat antérieur, jamais supprimé, qui duplique une bonne partie des concepts du moteur actif (dégâts, Break, tour, événements) avec une API différente et plus simple.

Le jeu, dans son état actuel, permet de : lancer le menu principal (navigation clavier, musique), démarrer une "Nouvelle Partie" qui enchaîne immédiatement sur un combat de test (2 héros contre 1 ennemi), mener ce combat jusqu'à victoire ou défaite avec un HUD basique et un journal de combat. Aucune exploration, aucun dialogue accessible, aucune sauvegarde, aucun contenu narratif ou système de progression n'existe à ce jour.

## État actuel

- **Ce qui fonctionne de bout en bout** : boot Phaser → menu principal → combat de démonstration → écran de victoire/défaite (sans suite).
- **Ce qui est câblé mais inaccessible en jeu** : `DialogueScene` est enregistrée dans `SceneManager` mais aucun code du jeu ne l'appelle (`this.scene.start("DialogueScene")` n'apparaît nulle part) ; elle est donc du code mort du point de vue du joueur.
- **Ce qui existe en double, non connecté** : le module `src/characters/` + `src/combat/*` (hors scènes) + `src/ui/*`, jamais importé par `src/index.ts` ni par aucune scène. Le module ne compile pas d'erreur (TypeScript ne signale pas de code inutilisé par défaut) mais n'est exécuté par rien.
- **Ce qui est documenté mais non implémenté** : `docs/gameplay.md` mentionne un champ `ipGain` sur les compétences et un champ `breakPower` variable — aucun des deux n'existe dans l'interface `Skill` (`src/core/skills.ts`) ni dans `skills.json`. La logique actuelle applique un Break fixe de -1 bouclier par coup touchant une faiblesse, indépendamment de la compétence.

## Niveau de maturité

Le projet est au stade de **prototype technique vertical** : une tranche verticale du jeu (menu → combat) est jouable de bout en bout avec un moteur de combat déjà relativement riche sur le plan des règles (Break, Boost, critiques, précision), mais le contenu (personnages, ennemis, compétences), l'interface (ciblage, IA, gestion des ressources depuis l'UI) et les systèmes hors-combat (exploration, dialogues, sauvegarde, progression) restent très en retrait. Ce n'est ni une démo jouable complète, ni un simple squelette : c'est un moteur de combat avancé sans le jeu autour.

## Points forts

Le moteur de combat (`src/core/`) est bien architecturé pour un prototype : séparation claire entre données (JSON), modèles (`stats.ts`, `skills.ts`, `jobs.ts`, `enemies.ts`), calculs (`formulas.ts`) et orchestration (`combat.ts`). Les structures de données JSON + wrapper TypeScript (`characters.json`/`characters.ts`, etc.) permettent d'ajouter du contenu sans toucher au moteur, ce qui est une base saine pour la suite. Le typage TypeScript est strict (`strict: true` dans `tsconfig.json`) et globalement respecté. Le code du module actif est lisible, commenté en français de façon pertinente, et sans `TODO`/`FIXME` oubliés (aucune occurrence trouvée dans `src/`). La documentation `docs/gameplay.md` décrit correctement les règles du moteur actif (Break, Boost, IP, formules).

## Points faibles

Le module `src/characters/` + `src/combat/*` (hors scènes Phaser) + `src/ui/*` est du code mort : il double le moteur de combat actif avec une API divergente, n'est référencé nulle part, et représente un risque de confusion pour tout futur contributeur qui ne saurait pas lequel des deux moteurs est "le vrai". Le `README.md` à la racine est obsolète : il décrit une arborescence sans `core/combat.ts`, sans `data/`, sans `characters/`, sans `combat/`, et référence un asset `menu-bg.png` qui n'existe pas (l'asset réel est `background2.jpg`). Le fichier `config.yaml` à la racine est en réalité un workflow GitHub Actions ("TypeScript Lint") mais n'est pas placé dans `.github/workflows/`, ce qui signifie qu'il ne s'exécute probablement jamais comme CI ; de plus il appelle `npm run build` alors qu'aucun script `lint` n'existe dans `package.json`. Le contenu de jeu est minimal : 2 héros, 1 ennemi, 2 compétences de données (+ "défendre" codé en dur), 1 seul décor, 1 seule musique. Aucun test automatisé n'est présent (le script `npm test` est un stub qui échoue volontairement). La sélection de cible n'existe pas côté joueur : `executeSkill` cible toujours automatiquement le premier ennemi vivant, même si plusieurs sont présents ou si la compétence viserait normalement un allié (`target: "single_ally"` et `"self"` sont définis dans le type mais jamais traités par le moteur).

## Dette technique

- Code mort à trancher : supprimer, fusionner ou clairement isoler (ex. dossier `_legacy/` documenté) le module `characters/` + `combat/*` + `ui/*` non utilisé.
- Documentation désynchronisée : `README.md` racine à réécrire pour refléter l'architecture réelle ; asset `menu-bg.png` référencé mais absent.
- CI cassée ou inopérante : `config.yaml` mal placé, script `lint` manquant.
- Compétence `"defend"` gérée par une branche spéciale dans `CombatEngine.resolveAction` plutôt que comme une entrée de `skills.json`, ce qui casse l'homogénéité du système data-driven.
- Absence totale de tests (unitaires sur `formulas.ts`/`combat.ts` seraient particulièrement utiles vu la logique de calcul de dégâts).
- BP dépensé (`bpSpent`) toujours égal à 0 dans `CombatScene` : le moteur supporte la dépense de BP mais aucune UI ne permet au joueur de choisir d'en dépenser, rendant ce système invisible en jeu malgré son implémentation complète côté moteur.
- IP (Influence Points) accumulés mais jamais consommés : la jauge est calculée et affichée nulle part dans le HUD, et aucune action ne les utilise.

## Estimation du travail restant

Pour atteindre un jeu complet tel que décrit dans les intentions du projet (exploration, dialogues, plusieurs zones/ennemis/personnages, sauvegarde, progression, interface complète de combat avec ciblage et dépense de BP), le travail restant est majoritaire par rapport à l'existant : le moteur de combat de base est la fondation la plus avancée, mais tout le reste (contenu, systèmes hors-combat, polish d'interface, IA, sauvegarde) reste très largement à construire. Voir `roadmap.md` pour le détail priorisé et `statistics.md` pour l'estimation chiffrée par domaine.

## Notes sur 10

| Critère | Note | Justification courte |
|---|---|---|
| Architecture | 6/10 | Séparation données/logique/scènes saine dans le module actif, mais coexistence non résolue avec un module orphelin dupliqué |
| Qualité du code | 6/10 | Typage strict, code lisible, mais duplication (2 moteurs de combat), cas spéciaux ad hoc (`"defend"`) |
| Maintenabilité | 5/10 | Code mort et documentation obsolète augmentent le risque de confusion pour un nouveau contributeur |
| Extensibilité | 6/10 | Le pattern JSON + dictionnaire TypeScript est facilement extensible pour le contenu ; les hooks pour IP/statuts/ciblage restent à concevoir |
| Gameplay | 3/10 | Une seule boucle de combat jouable, sans exploration, dialogues actifs, progression ou sauvegarde |
| Lisibilité | 7/10 | Code court, noms clairs, commentaires français pertinents dans le module actif |
| Organisation | 5/10 | Structure de dossiers logique pour le module actif, brouillée par le module mort et l'absence de dossier de tests |

*Notes attribuées selon une échelle qualitative fondée sur l'observation directe du dépôt ; elles reflètent un jugement d'audit et non une mesure automatisée.*

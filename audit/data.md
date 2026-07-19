# Données — Octorogue Traveler

## Fichiers JSON présents

Le dépôt contient exactement 4 fichiers JSON de contenu, tous dans `src/data/` :

| Fichier | Lignes | Entrées | Contenu |
|---|---|---|---|
| `characters.json` | 41 | 2 | Olberic (job `warrior`), Cyrus (job `scholar`) |
| `enemies.json` | 24 | 1 | Rat des bois (`forest_rat`) |
| `jobs.json` | 17 | 2 | Champion (`warrior`), Érudit (`scholar`) |
| `skills.json` | 23 | 2 | Attaque (`basic_attack`), Boules de Feu (`fireball`) |

Chaque JSON est accompagné d'un fichier `.ts` du même nom qui : (1) type la donnée brute, (2) la transforme en dictionnaire indexé par `id` (`Record<string, T>`), (3) l'exporte pour consommation par `core/encounters.ts` ou `core/combat.ts`. Ce pattern JSON + wrapper TypeScript est cohérent et répété à l'identique sur les 4 fichiers, ce qui est un bon signe de convention établie.

## Structures de données (modèles)

### `Stats` (`core/stats.ts`)
```ts
interface Stats {
  maxHP, maxSP, atk, mag, def, res, spd, eva, acc, lck: number;
}
```
Modèle des statistiques brutes d'un combattant. Utilisé identiquement pour héros et ennemis.

### `Resources` (`core/stats.ts`)
```ts
interface Resources {
  hp, sp, bp, ip, shield, maxBP, maxIP: number;
}
```
État courant des ressources consommables en combat (distinct des stats maximales).

### `BattleStats` (`core/stats.ts`)
```ts
interface BattleStats {
  id, name: string;
  faction: "heroes" | "enemies";
  jobId?, enemyTemplateId?: string;
  stats: Stats;
  resources: Resources;
  weapons?, elements?, weaknesses: DamageType[];
  isBroken: boolean;
  breakTimer: number;
  skillIds: string[];
}
```
Modèle unifié d'un combattant actif (héros ou ennemi), instancié via `createBattleStats`. C'est l'objet central manipulé par `CombatEngine`.

### `CharacterTemplate` (`data/characters.ts`)
```ts
interface CharacterTemplate {
  id, name, job: string;
  stats: { hp, sp, bp, ip, atk, mag, def, res, spd, eva, acc, lck };
}
```
Modèle brut d'un héros tel que stocké en JSON, converti en `BattleStats` via `createHeroFromTemplate` (`core/encounters.ts`).

### `EnemyTemplate` (`core/enemies.ts`)
```ts
interface EnemyTemplate {
  id, name, description: string;
  stats: Stats;
  weaknesses: DamageType[];
  shield: number;
  skills: string[];
  ipReward?: number;
  resourceDefaults?: Partial<Resources>;
}
```
Remarque : le champ `description` est toujours rempli avec le `name` de l'ennemi (`data/enemies.ts` ligne 8 : `description: enemy.name`), donc **aucune description réelle n'existe actuellement** — c'est une donnée dupliquée plutôt qu'une vraie description narrative.

### `Job` (`core/jobs.ts`)
```ts
interface Job {
  id, name: string;
  weapons: DamageType[];
  elements: DamageType[];
  skills: string[];
}
```

### `Skill` (`core/skills.ts`)
```ts
interface Skill {
  id, name: string;
  type: "physical" | "magical" | "support";
  element: DamageType | null;
  power, spCost: number;
  bpScaling?: "power" | "hits";
  target: "single_enemy" | "single_ally" | "self";
  tags?: DamageType[];
}
```
Remarque : le type `SkillCategory` inclut `"support"` mais **aucune compétence de type `"support"` n'existe** dans `skills.json`, et `CombatEngine`/`formulas.ts` ne traitent que `"physical"` et `"magical"` (le calcul de dégâts suppose toujours l'une des deux catégories offensives, sans branche pour le soin ou les buffs).

### `DamageType` (`core/stats.ts`)
```ts
type DamageType = "sword" | "spear" | "axe" | "bow" | "dagger" | "staff"
  | "fire" | "ice" | "lightning" | "light" | "dark" | "neutral";
```
12 types définis (6 armes + 6 éléments/neutre). Seuls `sword`, `staff` et `fire` sont réellement utilisés dans les données actuelles (`jobs.json`, `skills.json`, `enemies.json` faiblesses). Les 9 autres types sont définis dans le système de types mais sans aucune donnée de contenu les utilisant — c'est une extension prévue mais non exploitée.

## Objets métier et flux de transformation

```
JSON brut (data/*.json)
   → wrapper .ts (typage + Record<id, T>)
      → core/encounters.ts (assemblage : template + job → BattleStats)
         → CombatEngine (état de combat vivant, muté pendant la partie)
            → CombatStateSnapshot (copie immuable exposée à l'UI)
```

Ce flux est cohérent et bien séparé : la donnée brute n'est jamais mutée directement, l'assemblage se fait une fois à la création de l'affrontement, et l'état de combat vivant est isolé dans `CombatEngine`.

## Données manquantes pour la vision finale

En comparant la richesse du système de types (12 `DamageType`, 3 `SkillCategory`, 3 `SkillTarget`, champs `ipReward`, `resourceDefaults`) au volume de contenu réellement présent, l'écart est important :

- **Personnages** : seulement 2 héros ; pas de champ pour portrait/sprite, pas de biographie, pas de statistiques de progression (XP, niveau), pas d'équipement.
- **Ennemis** : seulement 1 ennemi ; le champ `description` n'est pas exploité (toujours égal au nom) ; pas de variété de comportement IA associée à la donnée (l'IA est entièrement générique côté moteur).
- **Compétences** : seulement 2 ; aucune compétence de soin/buff/debuff malgré le type `"support"` prévu ; aucune compétence utilisant `bpScaling: "hits"` bien que le moteur le supporte ; champ `ipGain` documenté dans `docs/gameplay.md` mais absent du type `Skill` et des JSON.
- **Jobs** : seulement 2 ; pas de progression de job (les Job System d'Octopath Traveler impliquent typiquement des changements de job, des points de maîtrise, etc., absents ici).
- **Rencontres** : aucune donnée de rencontre en dehors d'une fonction codée en dur (`createTestEncounter`) ; pas de fichier `encounters.json`, pas de notion de zone/chapitre.
- **Dialogues** : aucune structure de donnée pour des scripts de dialogue (pas de `dialogues.json` ou équivalent) alors que `DialogueScene` existe.
- **Objets/inventaire/équipement** : aucune structure de données trouvée.
- **Sauvegarde** : aucune structure de données de sauvegarde de partie.

## Hypothèses signalées

- Le champ `ipReward` sur `EnemyTemplate` est renseigné en dur à `15` pour tout ennemi (`data/enemies.ts` ligne 24 : `ipReward: 15`), indépendamment de la donnée JSON — hypothèse : ceci est un placeholder temporaire, aucune confirmation dans le code que la valeur JSON serait un jour lue pour ce champ (le JSON ne contient d'ailleurs pas de champ `ipReward`).
- Aucun historique Git détaillé n'a été exploité pour cet audit (l'analyse porte sur l'état du dépôt à l'instant présent, pas sur son évolution).

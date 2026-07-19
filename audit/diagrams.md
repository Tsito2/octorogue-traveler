# Diagrammes — Octorogue Traveler

*Diagrammes complémentaires à `architecture.md`, centrés sur le fonctionnement interne (navigation, moteur de combat, relations de classes, structure des données).*

## Architecture générale

```mermaid
graph TB
    Boot["src/index.ts\n(new Phaser.Game)"] --> SM["core/SceneManager.ts"]
    SM --> Scenes["4 scènes Phaser"]

    Scenes --> Menu["MainMenuScene"]
    Scenes --> Game["GameScene"]
    Scenes --> Combat["CombatScene"]
    Scenes --> Dialogue["DialogueScene (orpheline)"]

    Combat --> Engine["core/combat.ts\nCombatEngine"]
    Engine --> Rules["core/formulas.ts"]
    Engine --> Model["core/stats.ts"]
    Game --> Enc["core/encounters.ts"]
    Enc --> DataLayer["src/data/* (JSON + wrappers)"]

    classDef dead fill:#2a1a1a,stroke:#c0392b,color:#eee;
    class Dialogue dead;
```

## Navigation entre scènes

```mermaid
flowchart LR
    Start(["Démarrage du jeu"]) --> Menu["MainMenuScene"]
    Menu -- "Flèches Haut/Bas" --> Menu
    Menu -- "Entrée sur Nouvelle Partie" --> Game["GameScene"]
    Menu -. "Entrée sur Continuer (stub)" .-> Menu
    Menu -. "Entrée sur Options (stub)" .-> Menu
    Game -- "createTestEncounter() automatique" --> Combat["CombatScene"]
    Combat -- "Victoire" --> EndWin(["Écran Victoire (sans suite)"])
    Combat -- "Défaite" --> EndLose(["Écran Défaite (sans suite)"])

    Dialogue["DialogueScene"] -. "jamais démarrée par le code actif" .-> Dialogue
    Dialogue -- "clic (si atteinte manuellement)" --> Menu
```

## Moteur de combat — cycle d'un tour

```mermaid
sequenceDiagram
    participant UI as CombatScene
    participant Engine as CombatEngine
    participant Formulas as formulas.ts

    UI->>Engine: advanceTurn(action?)
    alt Acteur = héros, aucune action fournie
        Engine-->>UI: requiresInput = true
        UI->>UI: attend clic/touche joueur
        UI->>Engine: advanceTurn({actorId, skillId, targetId, bpSpent})
    else Acteur = ennemi
        Engine->>Engine: buildSimpleAIAction() (skillIds[0] vs 1er héros vivant)
    end
    Engine->>Engine: resolveAction(actor, action)
    alt skillId === "defend"
        Engine->>Engine: performDefend() (+1 BP, log)
    else compétence normale
        Engine->>Formulas: spendResources(actor, skill, bpSpent)
        Engine->>Formulas: calculateDamage(actor, target, skill, bpSpent)
        Formulas-->>Engine: { hit, damage, isCritical, didBreak, hitsLanded }
        Engine->>Engine: applique dégâts, gainIP(cible), gainIP(attaquant) si Break
        Engine->>Engine: log du résultat
    end
    Engine->>Engine: endTurn() → tickResources(acteur), calcul prochain acteur vivant
    Engine-->>UI: CombatStateSnapshot (copie immuable)
    UI->>UI: refreshState() → re-rendu HUD + menu + log
```

## Relations entre les principales classes (module actif)

```mermaid
classDiagram
    class CombatEngine {
        -actors: BattleStats[]
        -turnIndex: number
        -log: CombatLogEntry[]
        +getState() CombatStateSnapshot
        +advanceTurn(action?) 
        -resolveAction(actor, action)
        -performDefend(actor)
        -endTurn()
        -checkVictory()
        -buildSimpleAIAction(actor)
    }
    class BattleStats {
        id: string
        name: string
        faction: "heroes"|"enemies"
        stats: Stats
        resources: Resources
        weaknesses: DamageType[]
        isBroken: boolean
        breakTimer: number
        skillIds: string[]
    }
    class Stats {
        maxHP, maxSP, atk, mag, def, res, spd, eva, acc, lck
    }
    class Resources {
        hp, sp, bp, ip, shield, maxBP, maxIP
    }
    class Skill {
        id, name, type, element, power, spCost, bpScaling, target, tags
    }
    class CombatScene {
        -engine: CombatEngine
        -currentState: CombatStateSnapshot
        +refreshState()
        +executeSkill(skillId)
        +executeBasicAttack()
        +handleDefend()
    }

    CombatEngine "1" o-- "*" BattleStats : gère
    BattleStats "1" *-- "1" Stats
    BattleStats "1" *-- "1" Resources
    CombatEngine ..> Skill : consulte (data/skills.ts)
    CombatScene --> CombatEngine : pilote
```

## Relations entre les principales classes (module orphelin, non exécuté)

```mermaid
classDiagram
    class Character {
        name, health, maxHealth, sp, maxSp
        attackPower, magicPower, defense, resistance
        speed, evasion, accuracy, luck, shield
        isBroken: boolean
        latentPower: number
        +isAlive()
        +takeDamage(amount)
        +heal(amount)
        +attack(target)
    }
    class Enemy {
        +constructor(...)
    }
    class Party {
        members: Character[]
        +getRandomMember()
    }
    class BattleManager {
        -playerParty: Party
        -enemyParty: Party
        -turnOrder: any[]
        +startBattle()
        -calculateTurnOrder()
        -nextTurn()
        -resolveAction(actor)
    }
    class TurnOrderCalculator {
        +calculate() Character[]
    }
    class ActionResolver {
        +resolve(actor, playerParty, enemyParty, events)
    }
    class DamageCalculator {
        +calculate(attacker, target, options) DamageOutcome
    }
    class BattleEvents {
        -logs: string[]
        +log(message)
        +getLogs()
    }

    Enemy --|> Character
    Party "1" o-- "*" Character
    BattleManager --> Party
    BattleManager --> TurnOrderCalculator
    BattleManager --> ActionResolver
    BattleManager --> BattleEvents
    TurnOrderCalculator --> Party
    ActionResolver --> DamageCalculator
    ActionResolver --> BattleEvents
    DamageCalculator --> Character

    note for BattleManager "Ensemble non importé par\nsrc/index.ts : jamais exécuté"
```

## Structure des données (JSON → modèles)

```mermaid
erDiagram
    CHARACTER_TEMPLATE ||--|| JOB : "job (id)"
    CHARACTER_TEMPLATE {
        string id
        string name
        string job
        object stats
    }
    JOB {
        string id
        string name
        array weapons
        array elements
        array skills
    }
    JOB ||--o{ SKILL : "skills[] (id)"
    ENEMY_TEMPLATE ||--o{ SKILL : "skills[] (id)"
    SKILL {
        string id
        string name
        string type
        string element
        number power
        number spCost
        string bpScaling
        string target
    }
    ENEMY_TEMPLATE {
        string id
        string name
        object stats
        array weaknesses
        number shield
        array skills
    }
    BATTLE_STATS ||--|| STATS : contient
    BATTLE_STATS ||--|| RESOURCES : contient
    BATTLE_STATS {
        string id
        string name
        string faction
        array weaknesses
        boolean isBroken
        number breakTimer
        array skillIds
    }
    CHARACTER_TEMPLATE ||--o{ BATTLE_STATS : "createHeroFromTemplate()"
    ENEMY_TEMPLATE ||--o{ BATTLE_STATS : "createEnemyFromTemplate()"
```

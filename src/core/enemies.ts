import { DamageType, Resources, Stats } from "./stats";

export interface EnemyTemplate {
    id: string;
    name: string;
    description: string;
    stats: Stats;
    weaknesses: DamageType[];
    shield: number;
    skills: string[];
    lpReward?: number;
    resourceDefaults?: Partial<Resources>;
    /** Clé de spritesheet/image à utiliser pour l'affichage (voir PreloadScene + CombatScene). Absent = pas de sprite réel. */
    spriteKey?: string;
}

export type EnemyDictionary = Record<string, EnemyTemplate>;

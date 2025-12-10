import { DamageType, Resources, Stats } from "./stats";

export interface EnemyTemplate {
    id: string;
    name: string;
    description: string;
    stats: Stats;
    weaknesses: DamageType[];
    shield: number;
    skills: string[];
    ipReward?: number;
    resourceDefaults?: Partial<Resources>;
}

export type EnemyDictionary = Record<string, EnemyTemplate>;

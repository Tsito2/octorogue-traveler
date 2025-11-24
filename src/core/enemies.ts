import { DamageType, Stats } from "./stats";

export interface EnemyTemplate {
    id: string;
    name: string;
    description: string;
    stats: Stats;
    weaknesses: DamageType[];
    shield: number;
    skills: string[];
    ipReward?: number;
}

export type EnemyDictionary = Record<string, EnemyTemplate>;

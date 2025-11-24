import { Stats } from "./stats";

export interface Job {
    id: string;
    name: string;
    description: string;
    baseStats: Stats;
    skills: string[];
    maxBP: number;
    bpRegenPerTurn: number;
}

export type JobDictionary = Record<string, Job>;

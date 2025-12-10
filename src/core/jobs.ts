import { DamageType } from "./stats";

export interface Job {
    id: string;
    name: string;
    weapons: DamageType[];
    elements: DamageType[];
    skills: string[];
}

export type JobDictionary = Record<string, Job>;

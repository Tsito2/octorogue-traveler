import { DamageType } from "./stats";

export type SkillCategory = "physical" | "elemental" | "support";

export interface Skill {
    id: string;
    name: string;
    description: string;
    power: number;
    accuracy: number;
    spCost: number;
    category: SkillCategory;
    element: DamageType;
    target: "single-enemy" | "single-ally" | "self";
    breakPower?: number;
    ipGain?: number;
    bpScaling?: number;
}

export type SkillDictionary = Record<string, Skill>;

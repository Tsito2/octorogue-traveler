import { DamageType } from "./stats";

export interface Job {
    id: string;
    name: string;
    weapons: DamageType[];
    elements: DamageType[];
    skills: string[];
    /** Plafond de Boost Points pour ce job. Remplace la constante 5 auparavant codée en dur dans encounters.ts. */
    maxBP: number;
    /** Compétence de Burst déclenchée par l'action "burst" quand lp === maxLP. */
    burstSkillId?: string;
    /** Rangée de départ privilégiée pour ce job (front = mêlée, back = soutien/mage). */
    preferredRow?: "front" | "back";
}

export type JobDictionary = Record<string, Job>;

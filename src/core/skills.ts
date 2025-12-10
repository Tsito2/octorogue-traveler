import { DamageType } from "./stats";

export type SkillCategory = "physical" | "magical" | "support";

export type SkillTarget = "single_enemy" | "single_ally" | "self";

export interface Skill {
    id: string;
    name: string;
    type: SkillCategory;
    element: DamageType | null;
    power: number;
    spCost: number;
    bpScaling?: "power" | "hits";
    target: SkillTarget;
    /**
     * Tags permettent de faire matcher une faiblesse (arme ou élément) quand l'élément est nul.
     * Exemple : une attaque physique peut récupérer le type d'arme du personnage.
     */
    tags?: DamageType[];
}

export type SkillDictionary = Record<string, Skill>;

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
    /**
     * Réduction de bouclier infligée quand la compétence touche une faiblesse.
     * Remplace la valeur fixe de -1 auparavant codée en dur dans formulas.ts.
     */
    breakPower: number;
    target: SkillTarget;
    /**
     * Tags permettent de faire matcher une faiblesse (arme ou élément) quand l'élément est nul.
     * Exemple : une attaque physique peut récupérer le type d'arme du personnage.
     */
    tags?: DamageType[];
    /** Pouvoir Latent (LP) octroyé au lanceur lorsqu'il utilise cette compétence, en plus des gains passifs du moteur. */
    lpGain?: number;
    /** Marque une compétence de Burst : ne peut être déclenchée que via l'action "burst" (lp === maxLP). */
    isBurst?: boolean;
    /** Rangée requise pour utiliser la compétence. "any" ou absent = pas de contrainte. */
    requiredRow?: "front" | "back" | "any";
    /** Marque une compétence de Duo Combo : ne peut être déclenchée que via l'action "duoCombo", à deux en rangée avant. */
    isDuoCombo?: boolean;
}

export type SkillDictionary = Record<string, Skill>;

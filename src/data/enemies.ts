import { EnemyDictionary } from "../core/enemies";

export const enemies: EnemyDictionary = {
    forest_rat: {
        id: "forest_rat",
        name: "Rat des bois",
        description: "Une créature agressive mais fragile.",
        stats: {
            maxHP: 60,
            maxSP: 0,
            physicalAttack: 12,
            physicalDefense: 6,
            elementalAttack: 4,
            elementalDefense: 6,
            speed: 11,
            accuracy: 85,
            evasion: 6,
            critRate: 4,
        },
        weaknesses: ["sword", "fire"],
        shield: 3,
        skills: ["attack"],
        ipReward: 15,
    },
};

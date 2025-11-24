import { JobDictionary } from "../core/jobs";

export const jobs: JobDictionary = {
    warrior: {
        id: "warrior",
        name: "Guerrier",
        description: "Maître des armes lourdes et du combat rapproché.",
        baseStats: {
            maxHP: 120,
            maxSP: 30,
            physicalAttack: 18,
            physicalDefense: 14,
            elementalAttack: 8,
            elementalDefense: 10,
            speed: 10,
            accuracy: 95,
            evasion: 8,
            critRate: 8,
        },
        skills: ["attack", "power_slash"],
        maxBP: 5,
        bpRegenPerTurn: 1,
    },
    scholar: {
        id: "scholar",
        name: "Savant",
        description: "Spécialiste des sorts élémentaires.",
        baseStats: {
            maxHP: 80,
            maxSP: 50,
            physicalAttack: 8,
            physicalDefense: 10,
            elementalAttack: 18,
            elementalDefense: 14,
            speed: 12,
            accuracy: 90,
            evasion: 10,
            critRate: 5,
        },
        skills: ["attack", "fireball"],
        maxBP: 4,
        bpRegenPerTurn: 1,
    },
};

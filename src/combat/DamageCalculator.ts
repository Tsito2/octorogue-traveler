// DamageCalculator.ts - Calcule les dégâts infligés par une attaque

import { Character } from "../characters/Character";

export interface DamageOutcome {
    hit: boolean;
    damage: number;
    isCritical: boolean;
    didBreak: boolean;
    hitsLanded: number;
}

export interface DamageOptions {
    power?: number;
    type?: "physical" | "magical";
    bpSpent?: number;
    bpScaling?: "power" | "hits";
    element?: string | null;
}

export class DamageCalculator {
    calculate(attacker: Character, target: Character, options: DamageOptions = {}): DamageOutcome {
        const power = options.power ?? 1;
        const attackType = options.type ?? "physical";
        const bpSpent = options.bpSpent ?? 0;
        const bpMultiplier = options.bpScaling === "power" ? 1 + 0.25 * bpSpent : 1;
        const hits = options.bpScaling === "hits" ? 1 + bpSpent : 1;

        const hitChance = Math.max(0.05, Math.min(0.95, attacker.accuracy / (attacker.accuracy + target.evasion)));
        const critChance = Math.min(0.25, 0.05 + attacker.luck / 200);

        let totalDamage = 0;
        let hitsLanded = 0;
        let isCritical = false;
        let didBreak = false;
        const weaknessMatch = options.element ? target.weaknesses.includes(options.element) : false;

        for (let i = 0; i < hits; i++) {
            if (Math.random() >= hitChance) {
                continue;
            }
            hitsLanded += 1;

            const offensiveStat = attackType === "physical" ? attacker.attackPower : attacker.magicPower;
            const defensiveStat = attackType === "physical" ? target.defense : target.resistance;
            let damage = Math.max(1, Math.round(offensiveStat * power * bpMultiplier - defensiveStat));

            if (Math.random() < critChance) {
                isCritical = true;
                damage = Math.round(damage * 1.5);
            }

            if (target.isBroken) {
                damage = Math.round(damage * 1.5);
            }

            totalDamage += damage;

            if (weaknessMatch) {
                target.shield = Math.max(0, target.shield - 1);
                if (target.shield <= 0 && !target.isBroken) {
                    target.isBroken = true;
                    didBreak = true;
                }
            }
        }

        return { hit: hitsLanded > 0, damage: totalDamage, isCritical, didBreak, hitsLanded };
    }
}

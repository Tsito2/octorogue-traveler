// DamageCalculator.ts - Calcule les dégâts infligés par une attaque

import { Character } from "../characters/Character";

export class DamageCalculator {
    calculate(attacker: Character, target: Character): number {
        const baseDamage = attacker.attackPower - target.defense; // Utilise attackPower et defense
        const finalDamage = Math.max(baseDamage, 0); // Évite les dégâts négatifs
        return finalDamage;
    }
}

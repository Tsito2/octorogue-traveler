// ActionResolver.ts - Résout les actions d'un personnage

import { Party } from "./Party";
import { Character } from "../characters/Character";
import { DamageCalculator } from "./DamageCalculator";
import { BattleEvents } from "./BattleEvents";

export class ActionResolver {
    resolve(actor: Character, playerParty: Party, enemyParty: Party, events: BattleEvents): void {
        // Exemple : attaque par défaut
        const target = enemyParty.getRandomMember();
        if (!target) return;

        const damage = new DamageCalculator().calculate(actor, target);
        target.takeDamage(damage);

        events.log(`${actor.name} attaque ${target.name} et inflige ${damage} dégâts.`);
    }
}

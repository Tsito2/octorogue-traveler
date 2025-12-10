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

        const outcome = new DamageCalculator().calculate(actor, target, { type: "physical", power: 1, bpScaling: "power" });

        if (!outcome.hit) {
            events.log(`${actor.name} attaque ${target.name} mais échoue.`);
            return;
        }

        target.takeDamage(outcome.damage);
        target.gainLatentPower(5);
        if (outcome.didBreak) {
            actor.gainLatentPower(20);
        }

        const critText = outcome.isCritical ? " (critique)" : "";
        const breakText = outcome.didBreak ? " – Rupture !" : "";
        const hitsText = outcome.hitsLanded > 1 ? ` x${outcome.hitsLanded}` : "";
        events.log(`${actor.name} attaque ${target.name}${hitsText} et inflige ${outcome.damage} dégâts${critText}${breakText}.`);
    }
}

// TurnOrderCalculator.ts - Calcule l'ordre des tours

import { Party } from "./Party";
import { Character } from "../characters/Character";

export class TurnOrderCalculator {
    private playerParty: Party;
    private enemyParty: Party;

    constructor(playerParty: Party, enemyParty: Party) {
        this.playerParty = playerParty;
        this.enemyParty = enemyParty;
    }

    calculate(): Character[] {
        const allCharacters = [...this.playerParty.members, ...this.enemyParty.members];
        return allCharacters.sort((a, b) => b.speed - a.speed); // Tri décroissant par vitesse
    }
}

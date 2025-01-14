// BattleManager.ts - Gère le flux général du combat

import { Party } from "./Party";
import { TurnOrderCalculator } from "./TurnOrderCalculator";
import { ActionResolver } from "./ActionResolver";
import { BattleEvents } from "./BattleEvents";

export class BattleManager {
    private playerParty: Party;
    private enemyParty: Party;
    private turnOrder: any[] = [];
    private events: BattleEvents;

    constructor(playerParty: Party, enemyParty: Party) {
        this.playerParty = playerParty;
        this.enemyParty = enemyParty;
        this.events = new BattleEvents();
    }

    startBattle(): void {
        console.log("Le combat commence !");
        this.calculateTurnOrder();
        this.nextTurn();
    }

    private calculateTurnOrder(): void {
        const calculator = new TurnOrderCalculator(this.playerParty, this.enemyParty);
        this.turnOrder = calculator.calculate();
    }

    private nextTurn(): void {
        if (this.turnOrder.length === 0) {
            console.log("Le combat est terminé !");
            return;
        }
        const currentActor = this.turnOrder.shift();
        this.resolveAction(currentActor);
        this.nextTurn();
    }

    private resolveAction(actor: any): void {
        const resolver = new ActionResolver();
        resolver.resolve(actor, this.playerParty, this.enemyParty, this.events);
    }
}

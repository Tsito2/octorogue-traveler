import { Character } from "./Character";

export class Hikari extends Character {
    constructor() {
        super("Hikari", 100, 20, "/characters/Hikari.png");
    }

    specialMove(target: Character): void {
        const damage = this.attackPower * 2;
        target.health -= damage;
        console.log(`${this.name} uses a special move on ${target.name} for ${damage} damage!`);
    }
}
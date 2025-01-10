import { Hikari } from "../characters/Hikari";
import { Character } from "../characters/Character";

export class CombatScene {
    player: Hikari;
    enemy: Character;

    constructor() {
        this.player = new Hikari();
        this.enemy = new Character("Enemy", 50, 10, "");
    }

    startCombat(): void {
        console.log("Combat starts!");
        this.player.attack(this.enemy);
        if (this.enemy.health > 0) {
            this.enemy.attack(this.player);
        }
    }
}
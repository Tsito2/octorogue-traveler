export class Character {
    name: string;
    health: number;
    attackPower: number;
    spriteSheet: string;

    constructor(name: string, health: number, attackPower: number, spriteSheet: string) {
        this.name = name;
        this.health = health;
        this.attackPower = attackPower;
        this.spriteSheet = spriteSheet;
    }

    attack(target: Character): void {
        target.health -= this.attackPower;
        console.log(`${this.name} attacks ${target.name} for ${this.attackPower} damage!`);
    }
}
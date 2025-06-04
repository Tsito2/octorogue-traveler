// Character.ts - Représente un personnage (joueur ou ennemi)

export class Character {
    name: string;
    health: number;
    maxHealth: number;
    sp: number;
    maxSp: number;
    attackPower: number;
    defense: number;
    speed: number; // Vitesse pour le calcul du tour
    spriteSheet: string;

    constructor(
        name: string,
        health: number,
        sp: number,
        attackPower: number,
        defense: number,
        speed: number,
        spriteSheet: string
    ) {
        this.name = name;
        this.health = health;
        this.maxHealth = health;
        this.sp = sp;
        this.maxSp = sp;
        this.attackPower = attackPower;
        this.defense = defense;
        this.speed = speed;
        this.spriteSheet = spriteSheet;
    }

    isAlive(): boolean {
        return this.health > 0;
    }

    takeDamage(amount: number): void {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
        console.log(`${this.name} subit ${amount} dégâts ! Restant : ${this.health}/${this.maxHealth}`);
    }

    heal(amount: number): void {
        this.health += amount;
        if (this.health > this.maxHealth) this.health = this.maxHealth;
        console.log(`${this.name} récupère ${amount} points de vie !`);
    }

    useSp(amount: number): void {
        this.sp -= amount;
        if (this.sp < 0) this.sp = 0;
    }

    attack(target: Character): void {
        target.takeDamage(this.attackPower);
        console.log(`${this.name} attaque ${target.name} pour ${this.attackPower} dégâts !`);
    }
}

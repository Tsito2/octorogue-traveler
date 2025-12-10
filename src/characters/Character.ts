// Character.ts - Représente un personnage (joueur ou ennemi)

export class Character {
    name: string;
    health: number;
    maxHealth: number;
    sp: number;
    maxSp: number;
    attackPower: number;
    magicPower: number;
    defense: number;
    resistance: number;
    speed: number; // Vitesse pour le calcul du tour
    evasion: number;
    accuracy: number;
    luck: number;
    shield: number;
    isBroken: boolean;
    latentPower: number;
    spriteSheet: string;
    weaknesses: string[];

    constructor(
        name: string,
        health: number,
        sp: number,
        attackPower: number,
        magicPower: number,
        defense: number,
        resistance: number,
        speed: number,
        evasion = 5,
        accuracy = 95,
        luck = 5,
        shield = 0,
        latentPower = 0,
        weaknesses: string[] = [],
        spriteSheet: string
    ) {
        this.name = name;
        this.health = health;
        this.maxHealth = health;
        this.sp = sp;
        this.maxSp = sp;
        this.attackPower = attackPower;
        this.magicPower = magicPower;
        this.defense = defense;
        this.resistance = resistance;
        this.speed = speed;
        this.evasion = evasion;
        this.accuracy = accuracy;
        this.luck = luck;
        this.shield = shield;
        this.isBroken = false;
        this.latentPower = latentPower;
        this.spriteSheet = spriteSheet;
        this.weaknesses = weaknesses;
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

    gainLatentPower(amount: number): void {
        this.latentPower = Math.min(100, Math.max(0, this.latentPower + amount));
    }

    attack(target: Character): void {
        target.takeDamage(this.attackPower);
        console.log(`${this.name} attaque ${target.name} pour ${this.attackPower} dégâts !`);
    }
}

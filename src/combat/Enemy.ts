// Enemy.ts - Définit les ennemis

import { Character } from "../characters/Character";

export class Enemy extends Character {
    constructor(name: string, health: number, attackPower: number, defense: number, speed: number, spriteSheet: string) {
        super(name, health, attackPower, defense, speed, spriteSheet);
    }

    // Ajoute des comportements spécifiques aux ennemis
}

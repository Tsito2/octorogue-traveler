// StatusEffect.ts - Définit les effets de statut (poison, stun, etc.)

export class StatusEffect {
    name: string;
    duration: number;

    constructor(name: string, duration: number) {
        this.name = name;
        this.duration = duration;
    }

    applyEffect(target: any): void {
        console.log(`${this.name} est appliqué à ${target.name}`);
    }

    decreaseDuration(): void {
        this.duration -= 1;
    }

    isExpired(): boolean {
        return this.duration <= 0;
    }
}

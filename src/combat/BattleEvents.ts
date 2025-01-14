// BattleEvents.ts - Journalise les événements de combat

export class BattleEvents {
    private logs: string[] = [];

    log(message: string): void {
        this.logs.push(message);
        console.log(message);
    }

    getLogs(): string[] {
        return this.logs;
    }
}

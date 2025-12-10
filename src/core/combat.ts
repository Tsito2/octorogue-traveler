import { BattleStats, clampResource } from "./stats";
import { skills as skillData } from "../data/skills";
import { Skill } from "./skills";
import { calculateDamage, gainIP, spendResources, tickResources } from "./formulas";

const IP_ON_DAMAGE = 5;
const IP_ON_BREAK = 20;

export interface Action {
    actorId: string;
    skillId: string;
    targetId: string;
    bpSpent?: number;
}

export interface CombatLogEntry {
    message: string;
}

export interface CombatStateSnapshot {
    actors: BattleStats[];
    turnActorId: string;
    victory: "heroes" | "enemies" | null;
    log: CombatLogEntry[];
}

export class CombatEngine {
    private actors: BattleStats[];
    private turnIndex = 0;
    private log: CombatLogEntry[] = [];

    constructor(party: BattleStats[], enemies: BattleStats[]) {
        this.actors = [...party, ...enemies];
    }

    public getState(): CombatStateSnapshot {
        return {
            actors: this.actors.map((actor) => ({
                ...actor,
                stats: { ...actor.stats },
                resources: { ...actor.resources },
                weaknesses: [...actor.weaknesses],
                skillIds: [...actor.skillIds],
                weapons: actor.weapons ? [...actor.weapons] : undefined,
                elements: actor.elements ? [...actor.elements] : undefined,
            })),
            turnActorId: this.getActiveActor().id,
            victory: this.checkVictory(),
            log: [...this.log],
        };
    }

    public advanceTurn(action?: Action): { requiresInput: boolean; state: CombatStateSnapshot } {
        const actor = this.getActiveActor();
        if (!actor) {
            return { requiresInput: false, state: this.getState() };
        }

        if (actor.faction === "heroes" && !action) {
            return { requiresInput: true, state: this.getState() };
        }

        if (actor.faction === "enemies" && !action) {
            action = this.buildSimpleAIAction(actor);
        }

        if (!action) {
            return { requiresInput: true, state: this.getState() };
        }

        this.resolveAction(actor, action);
        this.endTurn();

        return { requiresInput: false, state: this.getState() };
    }

    private resolveAction(actor: BattleStats, action: Action): void {
        if (action.skillId === "defend") {
            this.performDefend(actor);
            return;
        }

        const skill = this.getSkill(action.skillId);
        const target = this.actors.find((a) => a.id === action.targetId && a.resources.hp > 0);
        const bpSpent = action.bpSpent ?? 0;
        if (!skill || !target) {
            this.log.push({ message: `${actor.name} hésite et perd son tour.` });
            return;
        }

        spendResources(actor, skill, bpSpent);
        const { hit, damage, isCritical, didBreak, hitsLanded } = calculateDamage(actor, target, skill, bpSpent);
        if (!hit) {
            this.log.push({ message: `${actor.name} utilise ${skill.name} mais manque ${target.name}.` });
            return;
        }

        target.resources.hp = clampResource(target.resources.hp - damage, target.stats.maxHP);
        gainIP(target, IP_ON_DAMAGE);
        if (didBreak) {
            gainIP(actor, IP_ON_BREAK);
        }

        const critText = isCritical ? " (critique)" : "";
        const breakText = didBreak ? " – Rupture !" : "";
        const hitsText = hitsLanded > 1 ? ` x${hitsLanded}` : "";
        this.log.push({ message: `${actor.name} utilise ${skill.name}${hitsText} et inflige ${damage} dégâts à ${target.name}${critText}${breakText}.` });

        if (target.resources.hp <= 0) {
            this.log.push({ message: `${target.name} est vaincu !` });
        }
    }

    private performDefend(actor: BattleStats): void {
        actor.resources.bp = clampResource(actor.resources.bp + 1, actor.resources.maxBP);
        this.log.push({ message: `${actor.name} se défend et prépare sa prochaine action.` });
    }

    private endTurn(): void {
        tickResources(this.getActiveActor());
        this.turnIndex = this.findNextActorIndex(this.turnIndex + 1);
    }

    private findNextActorIndex(startIndex: number): number {
        const aliveActors = this.actors.filter((actor) => actor.resources.hp > 0);
        if (aliveActors.length === 0) return 0;

        for (let i = 0; i < this.actors.length; i++) {
            const idx = (startIndex + i) % this.actors.length;
            if (this.actors[idx].resources.hp > 0) {
                return idx;
            }
        }
        return startIndex % this.actors.length;
    }

    private getActiveActor(): BattleStats {
        return this.actors[this.turnIndex];
    }

    private checkVictory(): "heroes" | "enemies" | null {
        const heroesAlive = this.actors.some((actor) => actor.faction === "heroes" && actor.resources.hp > 0);
        const enemiesAlive = this.actors.some((actor) => actor.faction === "enemies" && actor.resources.hp > 0);
        if (!heroesAlive) return "enemies";
        if (!enemiesAlive) return "heroes";
        return null;
    }

    private buildSimpleAIAction(actor: BattleStats): Action | undefined {
        const skillId = actor.skillIds[0];
        const target = this.actors.find((a) => a.faction === "heroes" && a.resources.hp > 0);
        if (!skillId || !target) return undefined;
        return { actorId: actor.id, skillId, targetId: target.id, bpSpent: 0 };
    }

    private getSkill(skillId: string): Skill | undefined {
        return skillData[skillId];
    }
}

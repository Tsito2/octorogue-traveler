import { BattleStats, clampResource } from "./stats";
import { skills as skillData } from "../data/skills";
import { jobs as jobsData } from "../data/jobs";
import { Skill } from "./skills";
import { calculateDamage, gainLP, spendResources, tickResources } from "./formulas";

const LP_ON_DAMAGE = 5;
const LP_ON_BREAK = 20;

export interface Action {
    actorId: string;
    /** Omis (ou "skill") = compétence classique (y compris "defend"). */
    type?: "swap" | "duoCombo" | "burst";
    /** Id de compétence : requis pour le type classique et pour "duoCombo", ignoré pour "swap"/"burst". */
    skillId?: string;
    /** Cible ennemie : requise pour le type classique, "duoCombo" et "burst", ignorée pour "swap". */
    targetId?: string;
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
        if (action.type === "swap") {
            this.performSwap(actor);
            return;
        }
        if (action.type === "burst") {
            this.performBurst(actor, action.targetId);
            return;
        }
        if (action.type === "duoCombo") {
            this.performDuoCombo(actor, action);
            return;
        }

        if (action.skillId === "defend") {
            this.performDefend(actor);
            return;
        }

        const skill = this.getSkill(action.skillId);
        if (skill?.isDuoCombo) {
            // Une compétence de Duo Combo ne peut être lancée que via l'action "duoCombo".
            this.log.push({ message: `${actor.name} doit passer par l'option Duo Combo pour utiliser ${skill.name}.` });
            return;
        }

        const target = this.actors.find((a) => a.id === action.targetId && a.resources.hp > 0);
        const bpSpent = action.bpSpent ?? 0;
        if (!skill || !target) {
            this.log.push({ message: `${actor.name} hésite et perd son tour.` });
            return;
        }

        this.executeSkillAction(actor, target, skill, bpSpent);
    }

    /**
     * Résout une compétence offensive classique : coût, dégâts, Break, gains de LP et journal.
     * Réutilisée par le chemin de compétence normal ainsi que par le Duo Combo.
     */
    private executeSkillAction(actor: BattleStats, target: BattleStats, skill: Skill, bpSpent: number, attackerOverride?: BattleStats): void {
        spendResources(actor, skill, bpSpent);
        if (skill.lpGain) {
            gainLP(actor, skill.lpGain);
        }

        const { hit, damage, isCritical, didBreak, hitsLanded } = calculateDamage(attackerOverride ?? actor, target, skill, bpSpent);
        if (!hit) {
            this.log.push({ message: `${actor.name} utilise ${skill.name} mais manque ${target.name}.` });
            return;
        }

        target.resources.hp = clampResource(target.resources.hp - damage, target.stats.maxHP);
        gainLP(target, LP_ON_DAMAGE);
        if (didBreak) {
            gainLP(actor, LP_ON_BREAK);
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

    // --- Swap de Duo ---

    /** Inverse la rangée de l'acteur, et celle de son partenaire de duo si défini. */
    private performSwap(actor: BattleStats): void {
        actor.row = actor.row === "front" ? "back" : "front";
        let message = `${actor.name} passe en rangée ${this.rowLabel(actor.row)}.`;

        const partner = actor.duoPartnerId ? this.actors.find((a) => a.id === actor.duoPartnerId) : undefined;
        if (partner) {
            partner.row = partner.row === "front" ? "back" : "front";
            message = `${actor.name} et ${partner.name} échangent de rangée (${actor.name} : ${this.rowLabel(actor.row)}, ${partner.name} : ${this.rowLabel(partner.row)}).`;
        }

        this.log.push({ message });
    }

    private rowLabel(row: "front" | "back"): string {
        return row === "front" ? "avant" : "arrière";
    }

    // --- Duo Combo ---

    /** N'est autorisé que si la compétence est marquée isDuoCombo et que les deux partenaires sont vivants en rangée avant. */
    private performDuoCombo(actor: BattleStats, action: Action): void {
        const skill = this.getSkill(action.skillId);
        if (!skill || !skill.isDuoCombo) {
            this.log.push({ message: `${actor.name} ne dispose d'aucune compétence de Duo Combo valide.` });
            return;
        }

        const partner = actor.duoPartnerId ? this.actors.find((a) => a.id === actor.duoPartnerId) : undefined;
        if (!partner || partner.resources.hp <= 0 || actor.row !== "front" || partner.row !== "front") {
            this.log.push({ message: `${actor.name} a besoin de son partenaire, vivant et en rangée avant, pour lancer ${skill.name}.` });
            return;
        }

        const target = this.actors.find((a) => a.id === action.targetId && a.resources.hp > 0);
        if (!target) {
            this.log.push({ message: `${actor.name} hésite et perd son tour.` });
            return;
        }

        // Les statistiques offensives du partenaire renforcent celles de l'acteur pour ce coup combiné.
        const comboAttacker: BattleStats = {
            ...actor,
            stats: {
                ...actor.stats,
                atk: actor.stats.atk + Math.round(partner.stats.atk * 0.5),
                mag: actor.stats.mag + Math.round(partner.stats.mag * 0.5),
            },
        };

        const bpSpent = action.bpSpent ?? 0;
        this.log.push({ message: `${actor.name} et ${partner.name} combinent leurs forces !` });
        this.executeSkillAction(actor, target, skill, bpSpent, comboAttacker);

        if (skill.lpGain) {
            gainLP(partner, Math.round(skill.lpGain / 2));
        }
    }

    // --- Burst (Pouvoir Latent) ---

    /** Ne peut être déclenché que si lp === maxLP. Consomme toute la jauge et lance la compétence de Burst du job. */
    private performBurst(actor: BattleStats, targetId?: string): void {
        if (actor.resources.lp < actor.resources.maxLP) {
            this.log.push({ message: `${actor.name} n'a pas encore assez de Pouvoir Latent pour un Burst.` });
            return;
        }

        const job = actor.jobId ? jobsData[actor.jobId] : undefined;
        const skill = job?.burstSkillId ? this.getSkill(job.burstSkillId) : undefined;
        const target = targetId ? this.actors.find((a) => a.id === targetId && a.resources.hp > 0) : undefined;

        if (!skill || !target) {
            this.log.push({ message: `${actor.name} ne peut pas déclencher de Burst pour le moment.` });
            return;
        }

        actor.resources.lp = 0;
        this.log.push({ message: `${actor.name} libère son Pouvoir Latent !` });
        this.executeSkillAction(actor, target, skill, 0);
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

    private getSkill(skillId?: string): Skill | undefined {
        return skillId ? skillData[skillId] : undefined;
    }
}

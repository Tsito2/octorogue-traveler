import { BattleStats, clampResource, DamageType } from "./stats";
import { Skill } from "./skills";

export interface DamageResult {
    hit: boolean;
    damage: number;
    isCritical: boolean;
    didBreak: boolean;
    hitsLanded: number;
}

export function calculateDamage(attacker: BattleStats, defender: BattleStats, skill: Skill, bpSpent: number): DamageResult {
    const bpMultiplier = skill.bpScaling === "power" ? 1 + 0.25 * bpSpent : 1;
    const hits = skill.bpScaling === "hits" ? 1 + bpSpent : 1;

    const critChance = Math.min(0.25, 0.05 + attacker.stats.lck / 200);
    const hitChance = clampProbability(attacker.stats.acc / (attacker.stats.acc + defender.stats.eva));

    let totalDamage = 0;
    let isCritical = false;
    let hitsLanded = 0;
    let didBreak = false;

    for (let i = 0; i < hits; i++) {
        const hitRoll = Math.random() < hitChance;
        if (!hitRoll) continue;
        hitsLanded += 1;

        const offensiveStat = skill.type === "physical" ? attacker.stats.atk : attacker.stats.mag;
        const defensiveStat = skill.type === "physical" ? defender.stats.def : defender.stats.res;
        let damage = Math.max(1, Math.round(offensiveStat * skill.power * bpMultiplier - defensiveStat));

        const critRoll = Math.random() < critChance;
        if (critRoll) {
            isCritical = true;
            damage = Math.round(damage * 1.5);
        }

        if (defender.isBroken) {
            damage = Math.round(damage * 1.5);
        }

        totalDamage += damage;
        const brokeThisHit = applyBreak(defender, skill, attacker);
        didBreak = didBreak || brokeThisHit;
    }

    return { hit: hitsLanded > 0, damage: totalDamage, isCritical, didBreak, hitsLanded };
}

function clampProbability(probability: number): number {
    return Math.max(0.05, Math.min(0.95, probability));
}

export function applyBreak(defender: BattleStats, skill: Skill, attacker?: BattleStats): boolean {
    const tags = buildSkillTags(skill, attacker);
    const matchesWeakness = tags.some((tag) => defender.weaknesses.includes(tag));
    if (!matchesWeakness) return false;

    defender.resources.shield = clampResource(defender.resources.shield - 1, Infinity);
    if (defender.resources.shield <= 0) {
        defender.isBroken = true;
        defender.breakTimer = 2;
        defender.resources.shield = 0;
        return true;
    }
    return false;
}

export function tickResources(actor: BattleStats): void {
    actor.resources.bp = clampResource(actor.resources.bp + 1, actor.resources.maxBP);
    if (actor.isBroken) {
        actor.breakTimer -= 1;
        if (actor.breakTimer <= 0) {
            actor.isBroken = false;
            actor.resources.shield = Math.max(actor.resources.shield, 1);
        }
    }
}

export function spendResources(actor: BattleStats, skill: Skill, bpSpent: number): void {
    actor.resources.sp = clampResource(actor.resources.sp - skill.spCost, actor.stats.maxSP);
    actor.resources.bp = clampResource(actor.resources.bp - bpSpent, actor.resources.maxBP);
}

export function gainIP(actor: BattleStats, amount: number): void {
    actor.resources.ip = clampResource(actor.resources.ip + amount, actor.resources.maxIP);
}

function buildSkillTags(skill: Skill, attacker?: BattleStats): DamageType[] {
    const tags: DamageType[] = [];
    if (skill.element) {
        tags.push(skill.element);
    }
    if (skill.tags) {
        tags.push(...skill.tags);
    }
    if (!skill.element && attacker?.weapons?.length) {
        tags.push(...attacker.weapons);
    }
    if (!skill.element && attacker?.elements?.length) {
        tags.push(...attacker.elements);
    }
    return tags;
}

import { BattleStats, clampResource } from "./stats";
import { Skill } from "./skills";

export interface DamageResult {
    hit: boolean;
    damage: number;
    isCritical: boolean;
    didBreak: boolean;
}

export function calculateDamage(attacker: BattleStats, defender: BattleStats, skill: Skill, bpSpent: number): DamageResult {
    const offensiveStat = skill.category === "physical" ? attacker.stats.physicalAttack : attacker.stats.elementalAttack;
    const defensiveStat = skill.category === "physical" ? defender.stats.physicalDefense : defender.stats.elementalDefense;

    const hitChance = Math.max(10, Math.min(100, skill.accuracy + attacker.stats.accuracy - defender.stats.evasion));
    const hit = Math.random() * 100 < hitChance;
    if (!hit) {
        return { hit: false, damage: 0, isCritical: false, didBreak: false };
    }

    const basePower = skill.power + (skill.bpScaling ?? 0) * bpSpent;
    let damage = Math.max(1, Math.round((offensiveStat * basePower) / Math.max(1, defensiveStat)));

    const critChance = attacker.stats.critRate;
    const isCritical = Math.random() * 100 < critChance;
    if (isCritical) {
        damage = Math.round(damage * 1.5);
    }

    if (defender.isBroken) {
        damage = Math.round(damage * 1.5);
    }

    const didBreak = applyBreak(defender, skill);

    return { hit, damage, isCritical, didBreak };
}

export function applyBreak(defender: BattleStats, skill: Skill): boolean {
    if (skill.breakPower === undefined || skill.breakPower === 0) {
        return false;
    }

    const matchesWeakness = defender.weaknesses.includes(skill.element);
    if (!matchesWeakness) {
        return false;
    }

    defender.resources.shield = clampResource(defender.resources.shield - skill.breakPower, Infinity);
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

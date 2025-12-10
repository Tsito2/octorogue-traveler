import { BattleStats, createBattleStats, Stats } from "./stats";
import { jobs } from "../data/jobs";
import { skills } from "../data/skills";
import { enemies as enemyTemplates } from "../data/enemies";
import { characterDictionary } from "../data/characters";

export interface EncounterData {
    heroes: BattleStats[];
    enemies: BattleStats[];
}

function toStats(raw: { hp: number; sp: number; atk: number; mag: number; def: number; res: number; spd: number; eva: number; acc: number; lck: number }): Stats {
    return {
        maxHP: raw.hp,
        maxSP: raw.sp,
        atk: raw.atk,
        mag: raw.mag,
        def: raw.def,
        res: raw.res,
        spd: raw.spd,
        eva: raw.eva,
        acc: raw.acc,
        lck: raw.lck,
    };
}

export function createHeroFromTemplate(templateId: string): BattleStats {
    const template = characterDictionary[templateId];
    const job = jobs[template.job as keyof typeof jobs];
    const stats = toStats(template.stats);
    const heroSkills = Array.from(new Set(["basic_attack", ...(job?.skills ?? [])]));

    return createBattleStats({
        id: template.id,
        name: template.name,
        faction: "heroes",
        jobId: job?.id,
        stats,
        resources: {
            hp: stats.maxHP,
            sp: stats.maxSP,
            bp: template.stats.bp,
            ip: template.stats.ip,
            shield: 4,
            maxBP: 5,
            maxIP: 100,
        },
        weaknesses: job?.weapons ?? ["sword"],
        weapons: job?.weapons,
        elements: job?.elements,
        skillIds: heroSkills,
    });
}

export function createEnemyFromTemplate(templateId: keyof typeof enemyTemplates): BattleStats {
    const template = enemyTemplates[templateId];
    return createBattleStats({
        id: template.id,
        name: template.name,
        faction: "enemies",
        enemyTemplateId: template.id,
        stats: template.stats,
        resources: {
            hp: template.stats.maxHP,
            sp: template.stats.maxSP,
            bp: template.resourceDefaults?.bp ?? 0,
            ip: template.resourceDefaults?.ip ?? 0,
            shield: template.shield,
            maxBP: 0,
            maxIP: 100,
        },
        weaknesses: template.weaknesses,
        skillIds: template.skills,
    });
}

export function createTestEncounter(): EncounterData {
    const heroes = [createHeroFromTemplate("olberic"), createHeroFromTemplate("cyrus")];

    const enemies = [createEnemyFromTemplate("forest_rat")];

    return { heroes, enemies };
}

export { skills };

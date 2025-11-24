import { createBattleStats } from "./stats";
import { jobs } from "../data/jobs";
import { skills } from "../data/skills";
import { enemies as enemyTemplates } from "../data/enemies";
import { BattleStats } from "./stats";

export interface EncounterData {
    heroes: BattleStats[];
    enemies: BattleStats[];
}

export function createHeroFromJob(id: string, jobId: keyof typeof jobs, name: string): BattleStats {
    const job = jobs[jobId];
    const stats = job.baseStats;
    return createBattleStats({
        id,
        name,
        faction: "heroes",
        jobId: job.id,
        stats,
        resources: {
            hp: stats.maxHP,
            sp: stats.maxSP,
            bp: 1,
            ip: 0,
            shield: 4,
            maxBP: job.maxBP,
            maxIP: 100,
        },
        weaknesses: ["sword"],
        skillIds: job.skills,
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
            bp: 0,
            ip: 0,
            shield: template.shield,
            maxBP: 0,
            maxIP: 100,
        },
        weaknesses: template.weaknesses,
        skillIds: template.skills,
    });
}

export function createTestEncounter(): EncounterData {
    const heroes = [
        createHeroFromJob("hero-1", "warrior", "Olberic"),
        createHeroFromJob("hero-2", "scholar", "Cyrus"),
    ];

    const enemies = [createEnemyFromTemplate("forest_rat")];

    return { heroes, enemies };
}

export { skills };

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
            lp: template.stats.lp,
            shield: 4,
            maxBP: job?.maxBP ?? 5,
            maxLP: 100,
        },
        weaknesses: job?.weapons ?? ["sword"],
        weapons: job?.weapons,
        elements: job?.elements,
        skillIds: heroSkills,
        row: job?.preferredRow ?? "front",
        spriteKey: template.spriteKey,
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
            lp: template.resourceDefaults?.lp ?? 0,
            shield: template.shield,
            maxBP: 0,
            maxLP: 100,
        },
        weaknesses: template.weaknesses,
        skillIds: template.skills,
        spriteKey: template.spriteKey,
    });
}

export function createTestEncounter(): EncounterData {
    // Roster v0.1 : 4 héros formant deux duos.
    const ochette = createHeroFromTemplate("ochette");
    const hikari = createHeroFromTemplate("hikari");
    const agnea = createHeroFromTemplate("agnea");
    const castti = createHeroFromTemplate("castti");

    // Duo 1 : Hikari (guerrière, front) + Agnea (danseuse, front) — les deux rangées alignées à l'avant,
    // le Duo Combo est donc immédiatement jouable sans Swap préalable.
    hikari.row = "front";
    agnea.row = "front";
    hikari.duoPartnerId = agnea.id;
    agnea.duoPartnerId = hikari.id;

    // Duo 2 : Ochette (chasseuse, back) + Castti (apothicaire, back) — les deux rangées alignées à l'arrière :
    // un seul Swap suffit à amener le duo au front et débloquer le Duo Combo, ce qui permet de tester
    // la mécanique de Swap (performSwap bascule les deux rangées du duo simultanément) dès le premier tour.
    ochette.row = "back";
    castti.row = "back";
    ochette.duoPartnerId = castti.id;
    castti.duoPartnerId = ochette.id;

    const heroes = [hikari, agnea, ochette, castti];
    const enemies = [createEnemyFromTemplate("forest_rat")];

    return { heroes, enemies };
}

export { skills };

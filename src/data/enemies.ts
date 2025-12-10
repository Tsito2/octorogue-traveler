import { EnemyDictionary } from "../core/enemies";
import enemiesJson from "./enemies.json";

export const enemies: EnemyDictionary = enemiesJson.reduce((acc, enemy) => {
    acc[enemy.id] = {
        id: enemy.id,
        name: enemy.name,
        description: enemy.name,
        stats: {
            maxHP: enemy.stats.hp,
            maxSP: enemy.stats.sp,
            atk: enemy.stats.atk,
            mag: enemy.stats.mag,
            def: enemy.stats.def,
            res: enemy.stats.res,
            spd: enemy.stats.spd,
            eva: enemy.stats.eva,
            acc: enemy.stats.acc,
            lck: enemy.stats.lck,
        },
        weaknesses: enemy.weaknesses,
        shield: enemy.shield,
        skills: enemy.skills,
        ipReward: 15,
        resourceDefaults: {
            bp: enemy.stats.bp,
            ip: enemy.stats.ip,
        },
    } as EnemyDictionary[keyof EnemyDictionary];
    return acc;
}, {} as EnemyDictionary);

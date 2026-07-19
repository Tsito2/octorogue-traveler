export type DamageType =
    | "sword"
    | "spear"
    | "axe"
    | "bow"
    | "dagger"
    | "staff"
    | "fire"
    | "ice"
    | "lightning"
    | "light"
    | "dark"
    | "neutral";

export interface Stats {
    maxHP: number;
    maxSP: number;
    atk: number;
    mag: number;
    def: number;
    res: number;
    spd: number;
    eva: number;
    acc: number;
    lck: number;
}

export interface Resources {
    hp: number;
    sp: number;
    bp: number;
    lp: number;
    shield: number;
    maxBP: number;
    maxLP: number;
}

export interface BattleStats {
    id: string;
    name: string;
    faction: "heroes" | "enemies";
    jobId?: string;
    enemyTemplateId?: string;
    stats: Stats;
    resources: Resources;
    weapons?: DamageType[];
    elements?: DamageType[];
    weaknesses: DamageType[];
    isBroken: boolean;
    breakTimer: number;
    skillIds: string[];
    /** Rangée de formation actuelle (mécanique de Swap de Duo). */
    row: "front" | "back";
    /** Id du partenaire de duo (pour le Swap et le Duo Combo), le cas échéant. */
    duoPartnerId?: string;
    /** Clé de spritesheet à utiliser pour l'affichage (voir PreloadScene + AnimationManager). Absent = pas de sprite réel (ex. ennemis pour l'instant). */
    spriteKey?: string;
}

export const defaultStats: Stats = {
    maxHP: 50,
    maxSP: 20,
    atk: 10,
    mag: 10,
    def: 8,
    res: 8,
    spd: 10,
    eva: 10,
    acc: 90,
    lck: 5,
};

export const defaultResources: Resources = {
    hp: defaultStats.maxHP,
    sp: defaultStats.maxSP,
    bp: 1,
    lp: 0,
    shield: 3,
    maxBP: 5,
    maxLP: 100,
};

export function cloneStats(stats: Stats): Stats {
    return { ...stats };
}

export function clampResource(value: number, max: number): number {
    return Math.max(0, Math.min(value, max));
}

export function createBattleStats(options: Partial<BattleStats> & { id: string; name: string; faction: "heroes" | "enemies" }): BattleStats {
    const stats = options.stats ?? defaultStats;
    const resources: Resources = {
        ...defaultResources,
        ...options.resources,
        hp: options.resources?.hp ?? stats.maxHP,
        sp: options.resources?.sp ?? stats.maxSP,
    } as Resources;

    return {
        ...options,
        stats: cloneStats(stats),
        resources,
        weapons: options.weapons ?? [],
        elements: options.elements ?? [],
        weaknesses: options.weaknesses ?? ["sword"],
        isBroken: options.isBroken ?? false,
        breakTimer: options.breakTimer ?? 0,
        skillIds: options.skillIds ?? [],
        row: options.row ?? "front",
        duoPartnerId: options.duoPartnerId,
    };
}

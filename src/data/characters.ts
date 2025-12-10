import charactersJson from "./characters.json";

export interface CharacterTemplateStats {
    hp: number;
    sp: number;
    bp: number;
    ip: number;
    atk: number;
    mag: number;
    def: number;
    res: number;
    spd: number;
    eva: number;
    acc: number;
    lck: number;
}

export interface CharacterTemplate {
    id: string;
    name: string;
    job: string;
    stats: CharacterTemplateStats;
}

export const characters = charactersJson as CharacterTemplate[];
export const characterDictionary = characters.reduce<Record<string, CharacterTemplate>>((acc, character) => {
    acc[character.id] = character;
    return acc;
}, {});

import { SkillDictionary } from "../core/skills";
import skillsJson from "./skills.json";

export const skills: SkillDictionary = skillsJson.reduce((acc, skill) => {
    acc[skill.id] = {
        ...skill,
        tags: skill.element ? [skill.element] : [],
    } as SkillDictionary[keyof SkillDictionary];
    return acc;
}, {} as SkillDictionary);

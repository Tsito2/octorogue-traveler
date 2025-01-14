// Party.ts - Définit un groupe de personnages

import { Character } from "../characters/Character";

export class Party {
    members: Character[];

    constructor(members: Character[]) {
        this.members = members;
    }

    getRandomMember(): Character | null {
        const aliveMembers = this.members.filter(member => member.isAlive());
        if (aliveMembers.length === 0) return null;
        return aliveMembers[Math.floor(Math.random() * aliveMembers.length)];
    }
}

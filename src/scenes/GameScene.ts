import Phaser from "phaser";
import { createTestEncounter } from "../core/encounters";

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" });
    }

    create(): void {
        const encounter = createTestEncounter();
        this.scene.start("CombatScene", { encounter });
    }
}

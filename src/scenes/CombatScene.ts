// @ts-ignore
import Phaser from "phaser";

class CombatScene extends Phaser.Scene {
    constructor() {
        super("CombatScene");
    }

    create() {
        // @ts-ignore
        this.add.text(400, 300, "Combat Start!", { font: "24px Arial", color: "#ffffff" }).setOrigin(0.5);
    }
}

export default CombatScene;

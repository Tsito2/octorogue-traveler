import Phaser from "phaser";

export default class CombatScene extends Phaser.Scene {
    constructor() {
        super({ key: "CombatScene" });
    }

    preload(): void {
        // Précharge des assets si nécessaire
    }

    create(): void {
        // Exemple : afficher un message temporaire pour tester
        this.add.text(400, 300, "Combat Scene", {
            fontSize: "32px",
            color: "#fff",
        }).setOrigin(0.5);

        // Retour au menu principal après un clic
        this.input.once("pointerdown", () => {
            this.scene.start("MainMenuScene");
        });
    }
}

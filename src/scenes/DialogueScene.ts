import Phaser from "phaser";

export default class DialogueScene extends Phaser.Scene {
    constructor() {
        super({ key: "DialogueScene" });
    }

    preload(): void {
        // Précharge des assets si nécessaire
    }

    create(): void {
        // Exemple : afficher un texte de dialogue temporaire
        this.add.text(400, 300, "Dialogue Scene", {
            fontSize: "32px",
            color: "#fff",
        }).setOrigin(0.5);

        // Retour au menu principal après un clic
        this.input.once("pointerdown", () => {
            this.scene.start("MainMenuScene");
        });
    }
}

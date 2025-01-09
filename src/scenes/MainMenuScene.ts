// @ts-ignore
import Phaser from "phaser";

class MainMenuScene extends Phaser.Scene {
    load: any;
    add: any;
    constructor() {
        super("MainMenuScene");
    }

    preload() {
        // Charger des assets ici
        this.load.image("background", "assets/backgrounds/main-menu.png");
    }

    create() {
        // Ajouter un fond et un texte
        this.add.image(400, 300, "background");
        this.add.text(400, 50, "Octopath Roguelike", { font: "32px Arial", color: "#ffffff" }).setOrigin(0.5);

        // Gérer l'entrée utilisateur
        // @ts-ignore
        this.input.keyboard.on("keydown-ENTER", () => {
            // @ts-ignore
            this.scene.start("CombatScene"); // Passe à une scène de combat
        });
    }
}

export default MainMenuScene;

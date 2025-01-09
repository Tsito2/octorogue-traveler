// @ts-ignore
import Phaser from "phaser";

class MainScene extends Phaser.Scene {
    anims: any;
    constructor() {
        super("MainScene");
    }

    preload() {
        // Charger le sprite de ton personnage
        // @ts-ignore
        this.load.spritesheet("hikari", "assets/Hikari.png", {
            frameWidth: 64, // Largeur d'une frame (à ajuster selon ton sprite)
            frameHeight: 64, // Hauteur d'une frame (à ajuster selon ton sprite)
        });
    }

    create() {
        // Ajouter ton personnage à la scène
        // @ts-ignore
        const hikari = this.add.sprite(400, 300, "hikari");

        // Animer le personnage (ajuste selon ton sprite)
        // @ts-ignore
        this.anims.create({
            key: "walk",
            frames: this.anims.generateFrameNumbers("hikari", { start: 0, end: 7 }), // Frames à ajuster
            frameRate: 10,
            repeat: -1,
        });

        hikari.play("walk");
    }

    update() {
        // Boucle principale du jeu (à compléter plus tard)
    }
}

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [MainScene],
    physics: {
        default: "arcade",
    },
};

new Phaser.Game(config);

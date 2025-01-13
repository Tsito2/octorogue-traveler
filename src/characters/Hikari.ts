import Phaser from "phaser";

export default class Hikari extends Phaser.GameObjects.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "hikari"); // Utilise la feuille de sprite Hikari
        scene.add.existing(this); // Ajoute Hikari à la scène

        // Définit toutes les animations de Hikari
        this.defineAnimations(scene);
    }

    private defineAnimations(scene: Phaser.Scene): void {
        // Animation de marche
        scene.anims.create({
            key: "walk",
            frames: scene.anims.generateFrameNumbers("hikari", { start: 6, end: 10 }),
            frameRate: 10,
            repeat: -1,
        });

        // Animation de course (à ajuster selon les indices exacts)
        scene.anims.create({
            key: "run",
            frames: scene.anims.generateFrameNumbers("hikari", { start: 24, end: 29 }),
            frameRate: 15,
            repeat: -1,
        });

        // Ajouter ici d'autres animations si besoin
    }
}

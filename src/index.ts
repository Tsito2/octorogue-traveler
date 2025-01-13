import Phaser from "phaser";

// Configuration Phaser
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO, // Phaser choisit WebGL ou Canvas selon le support
    width: 800, // Largeur de l'écran
    height: 600, // Hauteur de l'écran
    backgroundColor: "#3498db", // Couleur de fond (bleu clair)
    scene: {
        // Fonction preload pour charger les assets
        preload: function (this: Phaser.Scene) {
            // Charger la feuille de sprite
            this.load.spritesheet("hikari", "assets/characters/Hikari.png", {
                frameWidth: 44, // Largeur d'un sprite
                frameHeight: 48, // Hauteur d'un sprite
            });
        },

        // Fonction create pour configurer et jouer les animations
        create: function (this: Phaser.Scene) {
            // Définir une animation appelée "walk" (par exemple, pour marcher)
            this.anims.create({
                key: "walk",
                frames: this.anims.generateFrameNumbers("hikari", { start: 0, end: 10 }), // Ajuster les indices selon les frames de marche
                frameRate: 10, // Vitesse de l'animation (10 frames par seconde)
                repeat: -1, // Répéter indéfiniment
            });

            // Ajouter le sprite Hikari au centre et jouer l'animation "walk"
            const hikari = this.add.sprite(400, 300, "hikari");
            hikari.play("walk");
        },
    },
};

// Initialiser le jeu avec la configuration
const game = new Phaser.Game(config);

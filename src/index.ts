import Phaser from "phaser";

// Configuration Phaser
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO, // Phaser choisit WebGL ou Canvas selon le support
    width: 800, // Largeur de l'écran
    height: 600, // Hauteur de l'écran
    backgroundColor: '#3498db', // Couleur de fond (bleu clair)
    scene: {
        // Fonction preload pour charger les assets
        preload: function (this: Phaser.Scene) {
            // Charger le sprite sheet (64x64 pixels par sprite, à ajuster selon ton image)
            this.load.spritesheet("hikari", "../assets/characters/Hikari.png", {
                frameWidth: 64, // Largeur d'un sprite
                frameHeight: 64, // Hauteur d'un sprite
            });
            console.log("Loading sprite sheet...");
        },

        // Fonction create pour afficher les éléments
        create: function (this: Phaser.Scene) {
            if (this.textures.exists("hikari")) {
                console.log("Sprite sheet loaded successfully!");

                // Tester toutes les frames du sprite sheet
                for (let i = 0; i < this.textures.get("hikari").frameTotal; i++) {
                    // Afficher chaque sprite avec un décalage horizontal
                    this.add.image(100 + i * 70, 300, "hikari", i);
                }
            } else {
                console.error("Sprite sheet not loaded!");
            }
        },
    },
};

// Initialiser le jeu avec la configuration
const game = new Phaser.Game(config);

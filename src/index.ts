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
                frameWidth: 64, // Largeur d'un sprite
                frameHeight: 64, // Hauteur d'un sprite
            });
        },

        // Fonction create pour afficher les éléments
        create: function (this: Phaser.Scene) {
            // Ajouter une seule frame de la feuille de sprite
            const hikariFrameIndex = 0; // Indice de la frame que tu veux afficher (0 = première frame)
            this.add.image(400, 300, "hikari", hikariFrameIndex);
        },
    },
};

// Initialiser le jeu avec la configuration
const game = new Phaser.Game(config);

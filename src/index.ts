import Phaser from "phaser";
import scenes from "./core/SceneManager";

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: "#3498db",
    scene: scenes, // Charger toutes les scènes centralisées
};

const game = new Phaser.Game(config);

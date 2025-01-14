import MainMenuScene from "../scenes/MainMenuScene";
import CombatScene from "../scenes/CombatScene";

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [MainMenuScene, CombatScene], // MainMenuScene doit être listée avant CombatScene
};

const game = new Phaser.Game(config);

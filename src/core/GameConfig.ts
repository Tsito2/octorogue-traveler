// @ts-ignore
import Phaser from "phaser";

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [],
    physics: {
        default: "arcade",
        arcade: {
            debug: false,
        },
    },
};

export default config;

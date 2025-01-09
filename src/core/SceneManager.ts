// @ts-ignore
import Phaser from "phaser";
// @ts-ignore
import MainMenuScene from "../scenes/MainMenuScene";
// @ts-ignore
import CombatScene from "../scenes/CombatScene";
// @ts-ignore
import DialogueScene from "../scenes/DialogueScene";

const scenes = [MainMenuScene, CombatScene, DialogueScene];

export const initializeScenes = (game: Phaser.Game) => {
    scenes.forEach((SceneClass) => game.scene.add(SceneClass.name, SceneClass));
};

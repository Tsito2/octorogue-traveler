import PreloadScene from "../scenes/PreloadScene";
import MainMenuScene from "../scenes/MainMenuScene";
import GameScene from "../scenes/GameScene";
import CombatScene from "../scenes/CombatScene";
import DialogueScene from "../scenes/DialogueScene";

// PreloadScene doit rester la première scène de la liste : c'est elle que Phaser démarre
// automatiquement au lancement du jeu (voir src/index.ts), avant le menu principal.
const scenes = [PreloadScene, MainMenuScene, GameScene, CombatScene, DialogueScene];

export default scenes;

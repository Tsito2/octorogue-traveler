export class SceneManager {
    currentScene: any;

    constructor(initialScene: any) {
        this.currentScene = initialScene;
    }

    switchScene(newScene: any): void {
        this.currentScene = newScene;
        console.log(`Switched to ${newScene.constructor.name}`);
    }
}
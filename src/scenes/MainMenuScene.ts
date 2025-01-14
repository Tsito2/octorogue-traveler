import Phaser from "phaser";

export default class MainMenuScene extends Phaser.Scene {
    private menuOptions: Phaser.GameObjects.Text[] = [];
    private selectedIndex: number = 0;

    constructor() {
        super({ key: "MainMenuScene" });
    }

    preload(): void {
        // Charger les assets pour le menu principal (arrière-plan, musique)
        this.load.image("background", "assets/backgrounds/background2.jpg");
        this.load.audio("mainTheme", "assets/music/Main-Theme.mp3");
    }

    create(): void {
        // Ajouter l'arrière-plan
        this.add.image(400, 300, "background");

        // Jouer la musique de fond en boucle
        const music = this.sound.add("mainTheme", { volume: 0.5, loop: true });
        music.play();

        // Ajouter le titre principal
        this.add.text(400, 100, "Octorogue Traveler", {
            fontFamily: "Times New Roman",
            fontSize: "48px",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 4,
        }).setOrigin(0.5);

        // Ajouter les options de menu
        this.menuOptions = [
            this.add.text(400, 200, "Nouvelle Partie", this.getMenuTextStyle()).setOrigin(0.5),
            this.add.text(400, 300, "Continuer", this.getMenuTextStyle()).setOrigin(0.5),
            this.add.text(400, 400, "Options", this.getMenuTextStyle()).setOrigin(0.5),
        ];

        // Mettre en surbrillance l'option sélectionnée par défaut
        this.updateMenuHighlight();

        // Vérifier que `this.input.keyboard` est défini avant d'ajouter des écouteurs
        if (this.input.keyboard) {
            this.input.keyboard.on("keydown-UP", () => this.changeSelection(-1));
            this.input.keyboard.on("keydown-DOWN", () => this.changeSelection(1));
            this.input.keyboard.on("keydown-ENTER", () => this.selectOption(music));
        }
    }

    private getMenuTextStyle(): Phaser.Types.GameObjects.Text.TextStyle {
        return {
            fontFamily: "Times New Roman",
            fontSize: "32px",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 3,
        };
    }

    private changeSelection(delta: number): void {
        // Met à jour l'index sélectionné
        this.selectedIndex = Phaser.Math.Clamp(this.selectedIndex + delta, 0, this.menuOptions.length - 1);
        this.updateMenuHighlight();
    }

    private updateMenuHighlight(): void {
        // Parcourt toutes les options pour mettre à jour leur apparence
        this.menuOptions.forEach((option, index) => {
            if (index === this.selectedIndex) {
                option.setBackgroundColor("#333333"); // Arrière-plan sombre pour l'option sélectionnée
            } else {
                option.setBackgroundColor(""); // Pas d'arrière-plan pour les autres
            }
        });
    }

    private selectOption(music: Phaser.Sound.BaseSound): void {
        // Action basée sur l'option sélectionnée
        switch (this.selectedIndex) {
            case 0: // Nouvelle Partie
                this.scene.start("CombatScene");
                music.stop();
                break;
            case 1: // Continuer
                console.log("Continuer");
                break;
            case 2: // Options
                console.log("Options");
                break;
        }
    }
}

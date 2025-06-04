import Phaser from "phaser";
import { Character } from "../characters/Character";

export default class CombatScene extends Phaser.Scene {
    private actionMenu: Phaser.GameObjects.Text[] = [];
    private cursor!: Phaser.GameObjects.Text;
    private selectedIndex: number = 0;
    private party: Character[] = [];

    constructor() {
        super({ key: "CombatScene" });
    }

    preload(): void {
        // Charger les assets pour la scène de combat
        this.load.image("combatBackground", "assets/backgrounds/isle.png");
        this.load.image("iconSword", "assets/icons/sword.png"); // Icône pour "épée"
        this.load.image("iconFire", "assets/icons/fire.png");   // Icône pour "feu"
        this.load.audio("battleTheme", "assets/music/Battle-1.mp3");
    }

    create(): void {
        // Ajouter un background
        this.add.image(400, 300, "combatBackground");

        // Créer le groupe de personnages jouables
        this.party = [
            new Character("H'aanit", 2906, 95, 200, 50, 10, ""),
            new Character("Primrose", 2721, 217, 180, 40, 9, ""),
        ];

        // Afficher les informations de chaque personnage
        this.party.forEach((char, idx) => {
            this.add.text(
                550,
                400 + idx * 80,
                `${char.name}\nHP: ${char.health}/${char.maxHealth}\nSP: ${char.sp}/${char.maxSp}`,
                { font: "20px Arial", color: "#ffffff" }
            );
        });

        // Musique de combat
        const music = this.sound.add("battleTheme", { volume: 0.5, loop: true });
        music.play();

        // Ajouter des icônes de vulnérabilité
        this.add.image(200, 100, "iconSword").setScale(0.5);
        this.add.image(250, 100, "iconFire").setScale(0.5);
        this.add.text(150, 80, "Vulnerable:", { font: "24px Arial", color: "#ffffff" });

        // Créer le menu d'actions
        const actions = ["Attack", "Warrior Skills", "Item", "Defend", "Flee"];
        actions.forEach((action, index) => {
            const text = this.add.text(100, 300 + index * 40, action, {
                font: "28px Arial",
                color: "#ffffff",
                backgroundColor: index === this.selectedIndex ? "#333333" : "",
            }).setOrigin(0);

            this.actionMenu.push(text);
        });

        // Curseur pour indiquer l'option sélectionnée
        this.cursor = this.add.text(80, 300, ">", {
            font: "28px Arial",
            color: "#ffffff",
        }).setOrigin(0);
        this.cursor.y = this.actionMenu[this.selectedIndex].y;

        // Ecoute des touches pour naviguer dans le menu
        this.input.keyboard?.on("keydown-UP", () => this.changeSelection(-1));
        this.input.keyboard?.on("keydown-DOWN", () => this.changeSelection(1));
        this.input.keyboard?.on("keydown-ENTER", () => this.selectAction());
    }

    private changeSelection(delta: number): void {
        // Changer l'index sélectionné
        this.selectedIndex = Phaser.Math.Clamp(this.selectedIndex + delta, 0, this.actionMenu.length - 1);

        // Mettre à jour l'apparence des options
        this.actionMenu.forEach((text, index) => {
            text.setBackgroundColor(index === this.selectedIndex ? "#333333" : "");
        });

        // Déplacer le curseur à côté de l'option sélectionnée
        this.cursor.y = this.actionMenu[this.selectedIndex].y;
    }

    private selectAction(): void {
        // Réagir à l'action sélectionnée
        console.log(`Selected: ${this.actionMenu[this.selectedIndex].text}`);
    }
}

import Phaser from "phaser";
import { CombatEngine } from "../core/combat";
import { createTestEncounter, EncounterData } from "../core/encounters";
import { BattleStats } from "../core/stats";
import { skills } from "../data/skills";

interface CombatSceneData {
    encounter?: EncounterData;
}

export default class CombatScene extends Phaser.Scene {
    private engine!: CombatEngine;
    private selectedIndex = 0;
    private actionMenu: Phaser.GameObjects.Text[] = [];
    private cursor!: Phaser.GameObjects.Text;
    private logText!: Phaser.GameObjects.Text;
    private heroText: Phaser.GameObjects.Text[] = [];
    private enemyText: Phaser.GameObjects.Text[] = [];
    private currentState: ReturnType<CombatEngine["getState"]> | null = null;

    constructor() {
        super({ key: "CombatScene" });
    }

    init(data: CombatSceneData): void {
        const encounter = data.encounter ?? createTestEncounter();
        this.engine = new CombatEngine(encounter.heroes, encounter.enemies);
    }

    preload(): void {
        // Utilise les assets déjà présents pour éviter les erreurs de chargement
        this.load.image("combatBackground", "assets/backgrounds/background2.jpg");
        this.load.audio("battleTheme", "assets/music/Main-Theme.mp3");
    }

    create(): void {
        const background = this.add.image(0, 0, "combatBackground").setOrigin(0, 0);
        background.setDisplaySize(this.scale.width, this.scale.height);
        const music = this.sound.add("battleTheme", { volume: 0.4, loop: true });
        music.play();

        this.logText = this.add.text(40, 360, "", { font: "16px Arial", color: "#ffffff", wordWrap: { width: 720 } });
        this.cursor = this.add.text(60, 300, ">", { font: "24px Arial", color: "#ffffff" });

        this.input.keyboard?.on("keydown-UP", () => this.changeSelection(-1));
        this.input.keyboard?.on("keydown-DOWN", () => this.changeSelection(1));
        this.input.keyboard?.on("keydown-ENTER", () => this.confirmSelection());

        this.refreshState();
        this.runUntilInput();
    }

    private refreshState(): void {
        this.currentState = this.engine.getState();
        const heroes: BattleStats[] = this.currentState.actors.filter((a) => a.faction === "heroes");
        const enemies: BattleStats[] = this.currentState.actors.filter((a) => a.faction === "enemies");

        this.heroText.forEach((text) => text.destroy());
        this.enemyText.forEach((text) => text.destroy());
        this.actionMenu.forEach((text) => text.destroy());
        this.heroText = [];
        this.enemyText = [];
        this.actionMenu = [];

        heroes.forEach((hero, idx) => {
            const text = this.add.text(
                500,
                380 + idx * 60,
                `${hero.name}\nHP ${hero.resources.hp}/${hero.stats.maxHP} | SP ${hero.resources.sp}/${hero.stats.maxSP} | BP ${hero.resources.bp}/${hero.resources.maxBP}`,
                { font: "18px Arial", color: "#ffffff" }
            );
            this.heroText.push(text);
        });

        enemies.forEach((enemy, idx) => {
            const status = enemy.isBroken ? "(Brisé)" : `Bouclier ${enemy.resources.shield}`;
            const text = this.add.text(60, 120 + idx * 40, `${enemy.name} ${status} - HP ${enemy.resources.hp}/${enemy.stats.maxHP}`, {
                font: "20px Arial",
                color: "#ffffff",
            });
            this.enemyText.push(text);
        });

        this.buildActionMenu();
        this.renderLog();
    }

    private buildActionMenu(): void {
        if (!this.currentState) return;
        const actor = this.currentState.actors.find((a) => a.id === this.currentState?.turnActorId);
        const heroSkills = actor?.skillIds ?? [];

        this.selectedIndex = 0;
        heroSkills.forEach((skillId, index) => {
            const skillName = skills[skillId]?.name ?? skillId;
            const text = this.add.text(90, 280 + index * 30, skillName, {
                font: "20px Arial",
                color: "#ffffff",
                backgroundColor: index === this.selectedIndex ? "#333333" : "",
            });
            this.actionMenu.push(text);
        });
        this.updateCursor();
    }

    private renderLog(): void {
        const messages = this.currentState?.log.map((entry) => entry.message).slice(-6) ?? [];
        this.logText.setText(messages.join("\n"));
    }

    private changeSelection(delta: number): void {
        if (this.actionMenu.length === 0) return;
        this.selectedIndex = Phaser.Math.Clamp(this.selectedIndex + delta, 0, this.actionMenu.length - 1);
        this.actionMenu.forEach((text, index) => {
            text.setBackgroundColor(index === this.selectedIndex ? "#333333" : "");
        });
        this.updateCursor();
    }

    private updateCursor(): void {
        if (!this.actionMenu[this.selectedIndex]) return;
        this.cursor.y = this.actionMenu[this.selectedIndex].y;
    }

    private confirmSelection(): void {
        if (!this.currentState) return;
        const actor = this.currentState.actors.find((a) => a.id === this.currentState?.turnActorId);
        if (!actor) return;
        const skillId = actor.skillIds[this.selectedIndex];
        const target = this.currentState.actors.find((a) => a.faction === "enemies" && a.resources.hp > 0);
        if (!skillId || !target) return;

        this.engine.advanceTurn({ actorId: actor.id, skillId, targetId: target.id, bpSpent: 0 });
        this.refreshState();
        this.runUntilInput();
    }

    private runUntilInput(): void {
        let turnResult = this.engine.advanceTurn();
        while (!turnResult.requiresInput && !turnResult.state.victory) {
            this.currentState = turnResult.state;
            this.refreshState();
            turnResult = this.engine.advanceTurn();
        }
        this.currentState = turnResult.state;
        this.refreshState();

        if (this.currentState.victory) {
            this.add.text(400, 80, this.currentState.victory === "heroes" ? "Victoire !" : "Défaite...", {
                font: "32px Arial",
                color: "#ffcc00",
            }).setOrigin(0.5);
            this.input.keyboard?.removeAllListeners();
        }
    }
}

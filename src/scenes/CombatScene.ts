import Phaser from "phaser";
import { CombatEngine } from "../core/combat";
import { createTestEncounter, EncounterData } from "../core/encounters";
import { BattleStats } from "../core/stats";
import { skills as skillData } from "../data/skills";

interface CombatSceneData {
    encounter?: EncounterData;
}

export default class CombatScene extends Phaser.Scene {
    private engine!: CombatEngine;
    private logText!: Phaser.GameObjects.Text;
    private heroHud: Phaser.GameObjects.Container[] = [];
    private enemyHud: Phaser.GameObjects.Container[] = [];
    private mainMenu: Phaser.GameObjects.Text[] = [];
    private skillMenu: Phaser.GameObjects.Text[] = [];
    private overlay!: Phaser.GameObjects.Rectangle;
    private logPanel!: Phaser.GameObjects.Rectangle;
    private currentState: ReturnType<CombatEngine["getState"]> | null = null;

    constructor() {
        super({ key: "CombatScene" });
    }

    init(data: CombatSceneData): void {
        const encounter = data.encounter ?? createTestEncounter();
        this.engine = new CombatEngine(encounter.heroes, encounter.enemies);
    }

    preload(): void {
        this.load.image("combatBackground", "assets/backgrounds/background2.jpg");
        this.load.audio("battleTheme", "assets/music/Main-Theme.mp3");
    }

    create(): void {
        const background = this.add.image(0, 0, "combatBackground").setOrigin(0, 0);
        background.setDisplaySize(this.scale.width, this.scale.height);

        this.overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.4).setDepth(1);
        this.logPanel = this.add.rectangle(400, 520, 720, 140, 0x000000, 0.6).setDepth(2);
        this.logText = this.add.text(60, 460, "", { font: "16px Arial", color: "#ffffff", wordWrap: { width: 680 } }).setDepth(3);

        const music = this.sound.add("battleTheme", { volume: 0.4, loop: true });
        const startMusic = () => {
            if (!music.isPlaying) {
                music.play();
            }
        };

        if (this.sound.locked) {
            this.sound.once(Phaser.Sound.Events.UNLOCKED, startMusic);
            this.input.once("pointerdown", startMusic);
            this.input.keyboard?.once("keydown", startMusic);
        } else {
            startMusic();
        }

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => music.stop());

        this.refreshState();
        this.runUntilInput();
    }

    private refreshState(): void {
        this.currentState = this.engine.getState();
        const heroes: BattleStats[] = this.currentState.actors.filter((a) => a.faction === "heroes");
        const enemies: BattleStats[] = this.currentState.actors.filter((a) => a.faction === "enemies");

        this.heroHud.forEach((c) => c.destroy());
        this.enemyHud.forEach((c) => c.destroy());
        this.clearMenu(this.mainMenu);
        this.clearMenu(this.skillMenu);
        this.heroHud = [];
        this.enemyHud = [];

        this.renderHeroes(heroes);
        this.renderEnemies(enemies);

        this.renderLog();

        if (this.currentState.victory) {
            this.add
                .text(400, 80, this.currentState.victory === "heroes" ? "Victoire !" : "Défaite...", {
                    font: "32px Arial",
                    color: "#ffcc00",
                })
                .setOrigin(0.5)
                .setDepth(3);
            return;
        }

        this.buildRootMenu();
    }

    private renderHeroes(heroes: BattleStats[]): void {
        heroes.forEach((hero, idx) => {
            const container = this.add.container(50, 400 + idx * 80).setDepth(2);
            const icon = this.add.rectangle(0, -10, 50, 50, 0x4a90e2, 0.7).setOrigin(0, 0);
            const nameText = this.add.text(60, -10, hero.name, { font: "18px Arial", color: "#ffffff" });
            const statsText = this.add.text(
                60,
                12,
                `HP ${hero.resources.hp}/${hero.stats.maxHP}\nSP ${hero.resources.sp}/${hero.stats.maxSP} | BP ${hero.resources.bp}/${hero.resources.maxBP}`,
                { font: "14px Arial", color: "#dddddd" }
            );

            container.add([icon, nameText, statsText]);
            this.heroHud.push(container);
        });
    }

    private renderEnemies(enemies: BattleStats[]): void {
        enemies.forEach((enemy, idx) => {
            const container = this.add.container(470, 120 + idx * 80).setDepth(2);
            const nameText = this.add.text(0, 0, enemy.name, { font: "20px Arial", color: "#ffffff" });
            const hpText = this.add.text(0, 22, `HP ${enemy.resources.hp}/${enemy.stats.maxHP}`, { font: "16px Arial", color: "#dddddd" });
            const shieldLabel = enemy.isBroken ? "Brisé" : `Bouclier: ${enemy.resources.shield}`;
            const shieldText = this.add.text(0, 40, shieldLabel, { font: "16px Arial", color: "#ffcc00" });
            const weaknessText = this.add.text(
                0,
                58,
                `Faiblesses: ${enemy.weaknesses.map((w) => `[${w.toUpperCase()}]`).join(" ")}`,
                { font: "14px Arial", color: "#ffffff" }
            );

            container.add([nameText, hpText, shieldText, weaknessText]);
            this.enemyHud.push(container);
        });
    }

    private buildRootMenu(): void {
        this.clearMenu(this.mainMenu);
        this.clearMenu(this.skillMenu);
        const baseY = 470;

        const options = [
            { label: "Attaque", handler: () => this.executeBasicAttack() },
            { label: "Skills", handler: () => this.showSkillMenu() },
            { label: "Défendre", handler: () => this.handleDefend() },
        ];

        options.forEach((option, index) => {
            const text = this.add
                .text(60, baseY + index * 30, `[ ${option.label} ]`, { font: "20px Arial", color: "#ffffff" })
                .setDepth(3)
                .setInteractive({ useHandCursor: true })
                .on("pointerover", () => text.setColor("#ffcc00"))
                .on("pointerout", () => text.setColor("#ffffff"))
                .on("pointerdown", option.handler);
            this.mainMenu.push(text);
        });
    }

    private showSkillMenu(): void {
        this.clearMenu(this.skillMenu);
        const actor = this.getActiveHero();
        if (!actor) return;
        const baseY = 470;

        actor.skillIds.forEach((skillId, index) => {
            const skill = skillData[skillId];
            const label = skill?.name ?? skillId;
            const text = this.add
                .text(200, baseY + index * 26, label, { font: "18px Arial", color: "#ffffff" })
                .setDepth(3)
                .setInteractive({ useHandCursor: true })
                .on("pointerover", () => text.setColor("#ffcc00"))
                .on("pointerout", () => text.setColor("#ffffff"))
                .on("pointerdown", () => this.executeSkill(skillId));
            this.skillMenu.push(text);
        });
    }

    private clearMenu(menu: Phaser.GameObjects.Text[]): void {
        menu.forEach((text) => text.destroy());
        menu.length = 0;
    }

    private renderLog(): void {
        const messages = this.currentState?.log.map((entry) => entry.message).slice(-6) ?? [];
        this.logText.setText(messages.join("\n"));
    }

    private executeBasicAttack(): void {
        if (!this.currentState) return;
        this.executeSkill("basic_attack");
    }

    private handleDefend(): void {
        const actor = this.getActiveHero();
        if (!actor) return;
        this.engine.advanceTurn({ actorId: actor.id, skillId: "defend", targetId: actor.id, bpSpent: 0 });
        this.refreshState();
        this.runUntilInput();
    }

    private executeSkill(skillId: string): void {
        if (!this.currentState) return;
        const actor = this.getActiveHero();
        const target = this.getFirstLivingEnemy();
        if (!actor || !target) return;

        this.engine.advanceTurn({ actorId: actor.id, skillId, targetId: target.id, bpSpent: 0 });
        this.refreshState();
        this.runUntilInput();
    }

    private getActiveHero(): BattleStats | undefined {
        const activeId = this.currentState?.turnActorId;
        return this.currentState?.actors.find((a) => a.id === activeId && a.faction === "heroes");
    }

    private getFirstLivingEnemy(): BattleStats | undefined {
        return this.currentState?.actors.find((a) => a.faction === "enemies" && a.resources.hp > 0);
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
    }
}

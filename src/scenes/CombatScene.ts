import Phaser from "phaser";
import { CombatEngine } from "../core/combat";
import { createTestEncounter, EncounterData } from "../core/encounters";
import { BattleStats } from "../core/stats";
import { skills as skillData } from "../data/skills";
import { jobs as jobsData } from "../data/jobs";
// FRAME_WIDTH/FRAME_HEIGHT réutilisés uniquement pour la rustine de recadrage manuel (voir
// createHeroIcon) tant que ces constantes ne correspondent pas encore à la vraie taille de case.
import { FRAME_WIDTH, FRAME_HEIGHT } from "./PreloadScene";

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
    private rootMenuOptions: { label: string; handler: () => void }[] = [];
    private overlay!: Phaser.GameObjects.Rectangle;
    private menuPanel!: Phaser.GameObjects.Rectangle;
    private logPanel!: Phaser.GameObjects.Rectangle;
    private currentState: ReturnType<CombatEngine["getState"]> | null = null;
    private activeMenu: "root" | "skills" | "target" = "root";
    private mainSelectionIndex = 0;
    private skillSelectionIndex = 0;

    // --- Ciblage & dépense de BP (V1 MVP) ---
    private pendingSkillId: string | null = null;
    private pendingActionType?: "duoCombo" | "burst";
    private targetOrigin: "root" | "skills" = "root";
    private targetOptions: BattleStats[] = [];
    private targetSelectionIndex = 0;
    private bpSelected = 0;
    private enemyBackgroundsById: Map<string, Phaser.GameObjects.Rectangle> = new Map();
    private targetPromptText?: Phaser.GameObjects.Text;
    private bpMinusButton?: Phaser.GameObjects.Text;
    private bpPlusButton?: Phaser.GameObjects.Text;

    // --- Layout bas d'écran (v0.2.1) : menu d'actions et console strictement séparés ---
    // Bande de ciblage (prompt + boutons BP, visible seulement pendant la sélection de cible) :
    // se termine à y≈411, juste au-dessus des deux panneaux ci-dessous (aucun chevauchement).
    // Panneaux menu/console : commencent à y=415 (415-590), largeur 370 chacun, avec un couloir
    // vide de 20px entre les deux (x=390 à x=410) pour qu'ils ne se touchent JAMAIS.
    private static readonly BOTTOM_PANEL_TOP = 415;
    private static readonly BOTTOM_PANEL_HEIGHT = 175;
    private static readonly MENU_PANEL_X_RANGE: [number, number] = [20, 390];
    private static readonly CONSOLE_PANEL_X_RANGE: [number, number] = [410, 780];

    constructor() {
        super({ key: "CombatScene" });
    }

    init(data: CombatSceneData): void {
        const encounter = data.encounter ?? createTestEncounter();
        this.engine = new CombatEngine(encounter.heroes, encounter.enemies);
    }

    preload(): void {
        this.load.image("combatBackground", "assets/backgrounds/background2.jpg");
        // La musique de combat ("battleTheme") et le sprite de l'ennemi ("spr_rat") sont désormais
        // chargés une seule fois dans PreloadScene (au boot) : les charger ici aussi écraserait/
        // dupliquerait le chargement et risquerait de pointer vers le mauvais fichier.
    }

    create(): void {
        const background = this.add.image(0, 0, "combatBackground").setOrigin(0, 0);
        background.setDisplaySize(this.scale.width, this.scale.height);

        this.overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.4).setDepth(1);
        this.add.rectangle(210, 210, 360, 320, 0x000000, 0.5).setDepth(1);
        this.add.rectangle(590, 210, 360, 320, 0x000000, 0.5).setDepth(1);

        // --- Zone Gauche : menu d'actions --- x:20-390, y:415-590 (voir constantes BOTTOM_PANEL_*).
        const [menuLeft, menuRight] = CombatScene.MENU_PANEL_X_RANGE;
        const menuPanelWidth = menuRight - menuLeft;
        const panelCenterY = CombatScene.BOTTOM_PANEL_TOP + CombatScene.BOTTOM_PANEL_HEIGHT / 2;
        this.menuPanel = this.add
            .rectangle(menuLeft + menuPanelWidth / 2, panelCenterY, menuPanelWidth, CombatScene.BOTTOM_PANEL_HEIGHT, 0x14161b, 0.8)
            .setStrokeStyle(2, 0x4a90e2, 0.6)
            .setDepth(2);
        this.add.text(menuLeft + 20, CombatScene.BOTTOM_PANEL_TOP + 4, "ACTIONS", { font: "12px Arial", color: "#888888" }).setDepth(3);

        // --- Zone Droite : console / journal de combat --- x:410-780, y:415-590. Séparée de la
        // zone menu par un couloir vide de 20px (x=390 à x=410) : ces deux zones ne se croisent jamais.
        const [consoleLeft, consoleRight] = CombatScene.CONSOLE_PANEL_X_RANGE;
        const consolePanelWidth = consoleRight - consoleLeft;
        this.logPanel = this.add
            .rectangle(consoleLeft + consolePanelWidth / 2, panelCenterY, consolePanelWidth, CombatScene.BOTTOM_PANEL_HEIGHT, 0x14161b, 0.8)
            .setStrokeStyle(2, 0xf5a623, 0.6)
            .setDepth(2);
        this.add
            .text(consoleLeft + 20, CombatScene.BOTTOM_PANEL_TOP + 4, "JOURNAL DE COMBAT", { font: "12px Arial", color: "#888888" })
            .setDepth(3);
        this.logText = this.add
            .text(consoleLeft + 20, CombatScene.BOTTOM_PANEL_TOP + 22, "", {
                font: "13px Arial",
                color: "#ffffff",
                wordWrap: { width: consolePanelWidth - 40 },
            })
            .setDepth(3);

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
        this.setupKeyboardControls();
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
        this.endTargeting();
        this.activeMenu = "root";

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

    // --- Layout HUD héros (v0.2) ---
    // 4 panneaux doivent tenir entre le haut de l'écran et le journal de combat (qui commence vers y=445).
    // Panneau réduit (70px de haut, 8px d'écart) : 4 panneaux + écarts = 4*70 + 3*8 = 304px, en partant de y=55
    // le 4e panneau se termine à y=359, ce qui laisse ~86px de marge avant le journal.
    private static readonly HERO_PANEL_HEIGHT = 70;
    private static readonly HERO_PANEL_GAP = 8;
    private static readonly HERO_PANEL_START_Y = 55;
    private static readonly HERO_ICON_SIZE = 40;

    private renderHeroes(heroes: BattleStats[]): void {
        const { HERO_PANEL_HEIGHT: panelHeight, HERO_PANEL_GAP: gap, HERO_PANEL_START_Y: startY } = CombatScene;

        heroes.forEach((hero, idx) => {
            const y = startY + idx * (panelHeight + gap);
            const container = this.add.container(40, y).setDepth(2);
            const background = this.add
                .rectangle(0, 0, 320, panelHeight, 0x1c1f26, 0.7)
                .setOrigin(0, 0)
                .setStrokeStyle(2, 0x4a90e2, 0.6);
            const icon = this.createHeroIcon(hero);
            const nameText = this.add.text(72, 6, hero.name, { font: "14px Arial", color: "#ffffff" });
            const rowLabel = hero.row === "front" ? "Avant" : "Arrière";
            // HUD compact (v0.2) : HP/SP/BP/Burst/rangée tiennent dans un panneau plus fin qu'avant.
            // "LP" (Latent Power) renommé en "Burst" pour la jauge : c'est le nom déjà utilisé pour
            // l'action correspondante dans le menu ("Burst (B)"), donc plus cohérent pour le joueur.
            const statsText = this.add.text(
                72,
                24,
                `HP ${hero.resources.hp}/${hero.stats.maxHP}\n` +
                    `SP ${hero.resources.sp}/${hero.stats.maxSP}  |  BP ${hero.resources.bp}/${hero.resources.maxBP}\n` +
                    `Burst ${hero.resources.lp}/${hero.resources.maxLP}  |  Rang : ${rowLabel}`,
                { font: "11px Arial", color: "#dddddd" }
            );

            container.add([background, icon, nameText, statsText]);
            this.heroHud.push(container);
        });
    }

    /**
     * Icône du HUD héros : un véritable Sprite si le personnage a un spriteKey chargé (voir
     * PreloadScene), sinon un rectangle de repli.
     *
     * ⚠️ RUSTINE TEMPORAIRE (v0.2.1) : FRAME_WIDTH/FRAME_HEIGHT (PreloadScene.ts, toujours 64x64)
     * ne correspondent pas encore à la taille réelle d'une case des planches OT2. `setFrame(0)`
     * seul montre donc une grille 2x2 de 4 personnages au lieu d'un seul, car Phaser a découpé la
     * spritesheet en frames trop grandes qui contiennent chacune plusieurs cases réelles. En
     * attendant que l'utilisateur mesure et corrige ces deux constantes, on recadre manuellement
     * le quart supérieur gauche de la frame 0 avec setCrop() pour forcer l'affichage d'un seul
     * personnage. Cette rustine devient inutile (et peut être retirée) une fois FRAME_WIDTH/
     * FRAME_HEIGHT ajustés à la vraie taille de case.
     */
    private createHeroIcon(hero: BattleStats): Phaser.GameObjects.GameObject {
        const spriteKey = hero.spriteKey;
        const iconSize = CombatScene.HERO_ICON_SIZE;
        const iconCenter = iconSize / 2 + 5;

        if (spriteKey && this.textures.exists(spriteKey)) {
            const sprite = this.add.sprite(iconCenter, CombatScene.HERO_PANEL_HEIGHT / 2, spriteKey).setOrigin(0.5);
            sprite.setFrame(0);
            // Recadrage manuel sur le coin supérieur gauche de la frame (voir avertissement ci-dessus).
            sprite.setCrop(0, 0, FRAME_WIDTH / 2, FRAME_HEIGHT / 2);
            sprite.setDisplaySize(iconSize, iconSize);
            return sprite;
        }

        // Repli : rectangle générique si aucun sprite n'est disponible pour ce héros.
        return this.add
            .rectangle(iconCenter, CombatScene.HERO_PANEL_HEIGHT / 2, iconSize, iconSize, 0x4a90e2, 0.8)
            .setOrigin(0.5);
    }

    private renderEnemies(enemies: BattleStats[]): void {
        this.enemyBackgroundsById.clear();

        enemies.forEach((enemy, idx) => {
            const container = this.add.container(420, 90 + idx * 95).setDepth(2);
            const background = this.add.rectangle(0, 0, 320, 90, 0x261c1c, 0.7).setOrigin(0, 0).setStrokeStyle(2, 0xc0392b, 0.6);
            const nameText = this.add.text(16, 10, enemy.name, { font: "20px Arial", color: "#ffffff" });
            const hpText = this.add.text(16, 32, `HP ${enemy.resources.hp}/${enemy.stats.maxHP}`, { font: "16px Arial", color: "#dddddd" });
            const shieldLabel = enemy.isBroken ? "Brisé" : `Bouclier: ${enemy.resources.shield}`;
            const shieldText = this.add.text(16, 50, shieldLabel, { font: "16px Arial", color: "#ffcc00" });
            const weaknessText = this.add.text(
                16,
                68,
                `Faiblesses: ${enemy.weaknesses.map((w) => `[${w.toUpperCase()}]`).join(" ")}`,
                { font: "14px Arial", color: "#ffffff" }
            );
            const icon = this.createEnemyIcon(enemy);

            container.add([background, nameText, hpText, shieldText, weaknessText, ...(icon ? [icon] : [])]);
            this.enemyHud.push(container);
            this.enemyBackgroundsById.set(enemy.id, background);

            // Cible cliquable à la souris pendant la phase de ciblage (V1 MVP)
            if (enemy.resources.hp > 0) {
                background
                    .setInteractive({ useHandCursor: true })
                    .on("pointerover", () => this.hoverTarget(enemy.id))
                    .on("pointerdown", () => this.selectTargetAndConfirm(enemy.id));
            }
        });
    }

    /**
     * Icône du HUD ennemi : un véritable Sprite (image statique, ex. "spr_rat") si l'ennemi a un
     * spriteKey chargé (voir PreloadScene), sinon rien (repli sur le texte seul, comportement inchangé).
     * L'art du rat est orienté vers la droite par défaut ; les ennemis étant affichés à droite et
     * faisant face aux héros à gauche, on retourne systématiquement le sprite avec setFlipX(true).
     */
    private createEnemyIcon(enemy: BattleStats): Phaser.GameObjects.GameObject | undefined {
        const spriteKey = enemy.spriteKey;
        if (!spriteKey || !this.textures.exists(spriteKey)) return undefined;

        const sprite = this.add.sprite(270, 45, spriteKey).setOrigin(0.5);
        sprite.setDisplaySize(60, 60);
        sprite.setFlipX(true);

        return sprite;
    }

    private buildRootMenu(): void {
        this.clearMenu(this.mainMenu);
        this.clearMenu(this.skillMenu);
        // Menu ancré dans le panneau "ACTIONS" (x:20-390, y:415-590, voir create()). Colonne racine
        // à x=40 ; jusqu'à 6 options (Attaque/Skills/Défendre/Swap/Burst/DuoCombo) tiennent entre
        // y=433 et y=433+5*24=553, largement avant le bas du panneau (590).
        const baseY = 433;
        const rowHeight = 24;
        const actor = this.getActiveHero();

        this.rootMenuOptions = [
            { label: "Attaque", handler: () => this.beginTargeting("basic_attack", "root") },
            { label: "Skills", handler: () => this.showSkillMenu() },
            { label: "Défendre", handler: () => this.handleDefend() },
            { label: "Swap (S)", handler: () => this.triggerSwap() },
        ];

        if (actor) {
            const burstSkillId = this.getAvailableBurstSkillId(actor);
            if (burstSkillId) {
                this.rootMenuOptions.push({
                    label: "Burst (B)",
                    handler: () => this.beginTargeting(burstSkillId, "root", "burst"),
                });
            }

            const duoComboSkillId = this.getAvailableDuoComboSkillId(actor);
            if (duoComboSkillId) {
                this.rootMenuOptions.push({
                    label: "Duo Combo (D)",
                    handler: () => this.beginTargeting(duoComboSkillId, "root", "duoCombo"),
                });
            }
        }

        this.rootMenuOptions.forEach((option, index) => {
            const text = this.add
                .text(40, baseY + index * rowHeight, `[ ${option.label} ]`, { font: "15px Arial", color: "#ffffff" })
                .setDepth(3)
                .setInteractive({ useHandCursor: true })
                .on("pointerover", () => this.setSelection("root", index))
                .on("pointerdown", () => {
                    if (this.activeMenu !== "target") option.handler();
                });
            this.mainMenu.push(text);
        });

        this.setSelection("root", 0);
    }

    private showSkillMenu(): void {
        this.clearMenu(this.skillMenu);
        const actor = this.getActiveHero();
        if (!actor) return;
        // Sous-menu affiché dans une 2e colonne du même panneau "ACTIONS" (x=220), à droite de la
        // colonne racine (x=40) : les deux listes restent dans les bornes x:20-390 du panneau, donc
        // jamais l'une sur l'autre ni sur la console (x≥410).
        const baseY = 433;

        // Les compétences de Duo Combo ne se lancent que via l'option dédiée "Duo Combo", pas depuis ce sous-menu.
        const regularSkillIds = actor.skillIds.filter((skillId) => !skillData[skillId]?.isDuoCombo);

        regularSkillIds.forEach((skillId, index) => {
            const skill = skillData[skillId];
            const label = skill?.name ?? skillId;
            const text = this.add
                .text(220, baseY + index * 24, label, { font: "14px Arial", color: "#ffffff" })
                .setDepth(3)
                .setInteractive({ useHandCursor: true })
                .on("pointerover", () => this.setSelection("skills", index))
                .on("pointerdown", () => {
                    if (this.activeMenu !== "target") this.beginTargeting(skillId, "skills");
                });
            this.skillMenu.push(text);
        });

        if (this.skillMenu.length > 0) {
            this.setSelection("skills", 0);
        }
    }

    private clearMenu(menu: Phaser.GameObjects.Text[]): void {
        menu.forEach((text) => text.destroy());
        menu.length = 0;
    }

    private setSelection(menu: "root" | "skills", index: number): void {
        if (this.activeMenu === "target") return;
        this.activeMenu = menu;

        if (menu === "root") {
            if (this.rootMenuOptions.length === 0) return;
            this.mainSelectionIndex = Phaser.Math.Wrap(index, 0, this.rootMenuOptions.length);
            this.highlightMenu(this.mainMenu, this.mainSelectionIndex);
        } else {
            if (this.skillMenu.length === 0) return;
            this.skillSelectionIndex = Phaser.Math.Wrap(index, 0, this.skillMenu.length);
            this.highlightMenu(this.skillMenu, this.skillSelectionIndex);
        }
    }

    private highlightMenu(menu: Phaser.GameObjects.Text[], selectedIndex: number): void {
        menu.forEach((item, idx) => {
            item.setColor(idx === selectedIndex ? "#ffcc00" : "#ffffff");
            item.setFontStyle(idx === selectedIndex ? "bold" : "normal");
        });
    }

    /** Journal limité aux 4 dernières actions pour ne jamais déborder de son panneau (voir create()). */
    private renderLog(): void {
        const messages = this.currentState?.log.map((entry) => entry.message).slice(-4) ?? [];
        this.logText.setText(messages.join("\n"));
    }

    private setupKeyboardControls(): void {
        const keyboard = this.input.keyboard;
        if (!keyboard) return;

        keyboard.on("keydown-UP", this.handleMoveUp, this);
        keyboard.on("keydown-DOWN", this.handleMoveDown, this);
        keyboard.on("keydown-ENTER", this.handleConfirm, this);
        keyboard.on("keydown-SPACE", this.handleConfirm, this);
        // En phase de ciblage, GAUCHE/DROITE ajustent le BP dépensé au lieu de confirmer/annuler.
        keyboard.on("keydown-RIGHT", this.handleRight, this);
        keyboard.on("keydown-LEFT", this.handleLeft, this);
        keyboard.on("keydown-ESC", this.handleBack, this);
        // Touches directes pour les mécaniques avancées (Phase 2), utilisables dès que l'action est disponible.
        keyboard.on("keydown-S", this.handleSwapKey, this);
        keyboard.on("keydown-B", this.handleBurstKey, this);
        keyboard.on("keydown-D", this.handleDuoComboKey, this);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            keyboard.off("keydown-UP", this.handleMoveUp, this);
            keyboard.off("keydown-DOWN", this.handleMoveDown, this);
            keyboard.off("keydown-ENTER", this.handleConfirm, this);
            keyboard.off("keydown-SPACE", this.handleConfirm, this);
            keyboard.off("keydown-RIGHT", this.handleRight, this);
            keyboard.off("keydown-LEFT", this.handleLeft, this);
            keyboard.off("keydown-ESC", this.handleBack, this);
            keyboard.off("keydown-S", this.handleSwapKey, this);
            keyboard.off("keydown-B", this.handleBurstKey, this);
            keyboard.off("keydown-D", this.handleDuoComboKey, this);
        });
    }

    private handleMoveUp(): void {
        this.moveSelection(-1);
    }

    private handleMoveDown(): void {
        this.moveSelection(1);
    }

    private handleConfirm(): void {
        if (this.activeMenu === "target") {
            this.confirmTargetedAction();
            return;
        }

        if (this.activeMenu === "skills") {
            const actor = this.getActiveHero();
            const regularSkillIds = actor?.skillIds.filter((skillId) => !skillData[skillId]?.isDuoCombo) ?? [];
            const skillId = regularSkillIds[this.skillSelectionIndex];
            if (skillId) {
                this.beginTargeting(skillId, "skills");
            }
            return;
        }

        const option = this.rootMenuOptions[this.mainSelectionIndex];
        option?.handler();
    }

    private handleBack(): void {
        if (this.activeMenu === "target") {
            this.cancelTargeting();
            return;
        }

        if (this.activeMenu === "skills") {
            this.clearMenu(this.skillMenu);
            this.activeMenu = "root";
            this.highlightMenu(this.mainMenu, this.mainSelectionIndex);
        }
    }

    private handleRight(): void {
        if (this.activeMenu === "target") {
            this.adjustBP(1);
        } else {
            this.handleConfirm();
        }
    }

    private handleLeft(): void {
        if (this.activeMenu === "target") {
            this.adjustBP(-1);
        } else {
            this.handleBack();
        }
    }

    /** Touche S : Swap immédiat, ignoré pendant une phase de ciblage en cours. */
    private handleSwapKey(): void {
        if (this.activeMenu === "target") return;
        this.triggerSwap();
    }

    /** Touche B : ouvre le ciblage pour le Burst si la jauge LP du héros actif est pleine. */
    private handleBurstKey(): void {
        if (this.activeMenu === "target") return;
        const actor = this.getActiveHero();
        if (!actor) return;
        const burstSkillId = this.getAvailableBurstSkillId(actor);
        if (burstSkillId) {
            this.beginTargeting(burstSkillId, "root", "burst");
        }
    }

    /** Touche D : ouvre le ciblage pour le Duo Combo si le partenaire est vivant et les deux en rangée avant. */
    private handleDuoComboKey(): void {
        if (this.activeMenu === "target") return;
        const actor = this.getActiveHero();
        if (!actor) return;
        const duoComboSkillId = this.getAvailableDuoComboSkillId(actor);
        if (duoComboSkillId) {
            this.beginTargeting(duoComboSkillId, "root", "duoCombo");
        }
    }

    private moveSelection(delta: number): void {
        if (this.activeMenu === "target") {
            this.setTargetSelection(this.targetSelectionIndex + delta);
        } else if (this.activeMenu === "skills") {
            this.setSelection("skills", this.skillSelectionIndex + delta);
        } else {
            this.setSelection("root", this.mainSelectionIndex + delta);
        }
    }

    private handleDefend(): void {
        const actor = this.getActiveHero();
        if (!actor) return;
        this.engine.advanceTurn({ actorId: actor.id, skillId: "defend", targetId: actor.id, bpSpent: 0 });
        this.refreshState();
        this.runUntilInput();
    }

    /** Swap de Duo : action immédiate (pas de ciblage), inverse la rangée du héros actif et de son partenaire. */
    private triggerSwap(): void {
        const actor = this.getActiveHero();
        if (!actor) return;
        this.engine.advanceTurn({ actorId: actor.id, type: "swap" });
        this.refreshState();
        this.runUntilInput();
    }

    private getActiveHero(): BattleStats | undefined {
        const activeId = this.currentState?.turnActorId;
        return this.currentState?.actors.find((a) => a.id === activeId && a.faction === "heroes");
    }

    /** Retourne l'id de la compétence de Burst du héros si sa jauge LP est pleine, sinon undefined. */
    private getAvailableBurstSkillId(actor: BattleStats): string | undefined {
        const job = actor.jobId ? jobsData[actor.jobId] : undefined;
        if (!job?.burstSkillId) return undefined;
        if (actor.resources.lp < actor.resources.maxLP) return undefined;
        return job.burstSkillId;
    }

    /** Retourne l'id de la compétence de Duo Combo du héros si son partenaire est vivant et tous deux en rangée avant. */
    private getAvailableDuoComboSkillId(actor: BattleStats): string | undefined {
        const comboSkillId = actor.skillIds.find((id) => skillData[id]?.isDuoCombo);
        if (!comboSkillId) return undefined;

        const partner = actor.duoPartnerId ? this.currentState?.actors.find((a) => a.id === actor.duoPartnerId) : undefined;
        if (!partner || partner.resources.hp <= 0) return undefined;
        if (actor.row !== "front" || partner.row !== "front") return undefined;

        return comboSkillId;
    }

    // --- Ciblage & dépense de BP (V1 MVP) ---

    /**
     * Démarre la phase de ciblage pour une compétence donnée (classique, Burst ou Duo Combo) :
     * le joueur choisit sa cible et son BP avant validation.
     */
    private beginTargeting(skillId: string, origin: "root" | "skills", actionType?: "duoCombo" | "burst"): void {
        if (!this.currentState) return;
        const livingEnemies = this.currentState.actors.filter((a) => a.faction === "enemies" && a.resources.hp > 0);
        if (livingEnemies.length === 0) return;

        this.pendingSkillId = skillId;
        this.pendingActionType = actionType;
        this.targetOrigin = origin;
        this.targetOptions = livingEnemies;
        this.targetSelectionIndex = 0;
        this.bpSelected = 0;
        this.activeMenu = "target";

        // Les menus restent visibles mais sont désélectionnés le temps du ciblage.
        this.highlightMenu(this.mainMenu, -1);
        this.highlightMenu(this.skillMenu, -1);

        // Bande de ciblage : entre le bas du HUD héros (y≈359) et le haut des panneaux menu/console
        // (y=415, voir constantes BOTTOM_PANEL_*). Prompt centré en y=372, boutons BP en y=402 :
        // aucun des deux ne descend jusqu'à 415, donc pas de chevauchement avec les panneaux.
        if (!this.targetPromptText) {
            this.targetPromptText = this.add
                .text(400, 372, "", {
                    font: "14px Arial",
                    color: "#ffffff",
                    align: "center",
                    backgroundColor: "#000000cc",
                    padding: { x: 12, y: 6 },
                })
                .setOrigin(0.5)
                .setDepth(4);
        }
        if (!this.bpMinusButton) {
            this.bpMinusButton = this.add
                .text(250, 402, "[ - BP ]", { font: "14px Arial", color: "#ffffff" })
                .setOrigin(0.5)
                .setDepth(4)
                .setInteractive({ useHandCursor: true })
                .on("pointerdown", () => this.adjustBP(-1));
        }
        if (!this.bpPlusButton) {
            this.bpPlusButton = this.add
                .text(550, 402, "[ + BP ]", { font: "14px Arial", color: "#ffffff" })
                .setOrigin(0.5)
                .setDepth(4)
                .setInteractive({ useHandCursor: true })
                .on("pointerdown", () => this.adjustBP(1));
        }

        this.updateTargetHighlight();
        this.updateTargetPrompt();
    }

    /** Survol/clic souris d'un ennemi pendant la phase de ciblage. */
    private hoverTarget(enemyId: string): void {
        if (this.activeMenu !== "target") return;
        const index = this.targetOptions.findIndex((t) => t.id === enemyId);
        if (index === -1) return;
        this.targetSelectionIndex = index;
        this.updateTargetHighlight();
        this.updateTargetPrompt();
    }

    private selectTargetAndConfirm(enemyId: string): void {
        if (this.activeMenu !== "target") return;
        const index = this.targetOptions.findIndex((t) => t.id === enemyId);
        if (index === -1) return;
        this.targetSelectionIndex = index;
        this.confirmTargetedAction();
    }

    private setTargetSelection(index: number): void {
        if (this.targetOptions.length === 0) return;
        this.targetSelectionIndex = Phaser.Math.Wrap(index, 0, this.targetOptions.length);
        this.updateTargetHighlight();
        this.updateTargetPrompt();
    }

    private adjustBP(delta: number): void {
        const actor = this.getActiveHero();
        if (!actor) return;
        const maxBp = actor.resources.bp;
        this.bpSelected = Phaser.Math.Clamp(this.bpSelected + delta, 0, maxBp);
        this.updateTargetPrompt();
    }

    private updateTargetHighlight(): void {
        const selectedId = this.targetOptions[this.targetSelectionIndex]?.id;
        this.enemyBackgroundsById.forEach((rect, id) => {
            const isSelected = id === selectedId;
            rect.setStrokeStyle(isSelected ? 3 : 2, isSelected ? 0xffcc00 : 0xc0392b, isSelected ? 1 : 0.6);
        });
    }

    private updateTargetPrompt(): void {
        if (!this.targetPromptText || !this.pendingSkillId) return;
        const target = this.targetOptions[this.targetSelectionIndex];
        const actor = this.getActiveHero();
        const skillName = skillData[this.pendingSkillId]?.name ?? this.pendingSkillId;
        const actionLabel =
            this.pendingActionType === "burst" ? "BURST" : this.pendingActionType === "duoCombo" ? "DUO COMBO" : skillName;
        const maxBp = actor?.resources.bp ?? 0;

        this.targetPromptText.setText(
            `${actionLabel} -> Cible : ${target?.name ?? "-"}   |   BP : ${this.bpSelected}/${maxBp}\n` +
                `Haut/Bas : cible   Gauche/Droite ou boutons : BP   Entrée : valider   Échap : annuler`
        );
    }

    /** Exécute l'action en attente (compétence + cible + BP choisis) auprès du moteur de combat. */
    private confirmTargetedAction(): void {
        if (!this.pendingSkillId) return;
        const actor = this.getActiveHero();
        const target = this.targetOptions[this.targetSelectionIndex];
        if (!actor || !target) return;

        this.engine.advanceTurn({
            actorId: actor.id,
            type: this.pendingActionType,
            skillId: this.pendingSkillId,
            targetId: target.id,
            bpSpent: this.bpSelected,
        });
        this.endTargeting();
        this.refreshState();
        this.runUntilInput();
    }

    /**
     * Nettoie l'état/l'UI de ciblage, sans changer le menu actif ni toucher au HUD ennemi
     * (utilisé aussi par refreshState, qui a déjà détruit/reconstruit le HUD à ce stade).
     */
    private endTargeting(): void {
        this.pendingSkillId = null;
        this.pendingActionType = undefined;
        this.targetOptions = [];
        this.targetPromptText?.destroy();
        this.targetPromptText = undefined;
        this.bpMinusButton?.destroy();
        this.bpMinusButton = undefined;
        this.bpPlusButton?.destroy();
        this.bpPlusButton = undefined;
    }

    /** Annule la phase de ciblage et revient au menu d'origine (root ou skills) sans consommer de tour. */
    private cancelTargeting(): void {
        const origin = this.targetOrigin;
        // Le HUD ennemi reste affiché (pas de refreshState ici) : on réinitialise son surlignage.
        this.enemyBackgroundsById.forEach((rect) => rect.setStrokeStyle(2, 0xc0392b, 0.6));
        this.endTargeting();
        this.activeMenu = origin;
        this.highlightMenu(this.mainMenu, this.mainSelectionIndex);
        if (origin === "skills") {
            this.highlightMenu(this.skillMenu, this.skillSelectionIndex);
        }
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

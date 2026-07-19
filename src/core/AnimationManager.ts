import Phaser from "phaser";
import animationsJson from "../data/animations.json";

/**
 * Définition brute d'un clip d'animation dans animations.json.
 * start/end sont des index de frame dans la spritesheet (valeurs fictives tant que l'utilisateur
 * n'a pas mesuré les vraies grilles — voir data.md / le rapport de cette phase).
 */
export interface AnimationClipConfig {
    start: number;
    end: number;
    frameRate: number;
    /** -1 = boucle infinie (ex. idle), 0 = joué une seule fois (ex. attack, hurt). */
    repeat: number;
}

/** Ensemble des clips nommés (idle, attack, hurt, ...) pour un spriteKey donné. */
export type SpriteAnimationConfig = Record<string, AnimationClipConfig>;

/** animations.json dans son ensemble : spriteKey -> { animName -> clip }. */
export type AnimationsData = Record<string, SpriteAnimationConfig>;

const animationsData = animationsJson as AnimationsData;

/**
 * Service data-driven : transforme animations.json en animations Phaser (scene.anims.create).
 * Ne code aucune animation en dur — toute nouvelle compétence/spriteKey ajoutée au JSON est
 * automatiquement disponible sans modification de ce fichier ni des scènes.
 */
export class AnimationManager {
    /**
     * Enregistre les animations d'un spriteKey précis à partir de animations.json.
     * Sans effet si le spriteKey est absent du JSON, ou si la texture correspondante n'est pas chargée.
     */
    static registerAnimations(scene: Phaser.Scene, spriteKey: string): void {
        const clips = animationsData[spriteKey];
        if (!clips) return;
        if (!scene.textures.exists(spriteKey)) return;

        Object.entries(clips).forEach(([animName, clip]) => {
            const animKey = AnimationManager.getAnimationKey(spriteKey, animName);
            // scene.anims est un registre global au Game (partagé entre toutes les scènes) :
            // on évite de le recréer s'il existe déjà (ex. après un retour sur CombatScene).
            if (scene.anims.exists(animKey)) return;

            scene.anims.create({
                key: animKey,
                frames: scene.anims.generateFrameNumbers(spriteKey, { start: clip.start, end: clip.end }),
                frameRate: clip.frameRate,
                repeat: clip.repeat,
            });
        });
    }

    /** Enregistre les animations de tous les spriteKeys définis dans animations.json (appelé une fois au boot, voir PreloadScene). */
    static registerAll(scene: Phaser.Scene): void {
        Object.keys(animationsData).forEach((spriteKey) => AnimationManager.registerAnimations(scene, spriteKey));
    }

    /** Convention de nommage des clés d'animation Phaser : "<spriteKey>_<animName>", ex. "spr_hikari_idle". */
    static getAnimationKey(spriteKey: string, animName: string): string {
        return `${spriteKey}_${animName}`;
    }

    /** true si le clip demandé existe dans animations.json pour ce spriteKey (utile avant d'appeler .play()). */
    static hasAnimation(spriteKey: string, animName: string): boolean {
        return Boolean(animationsData[spriteKey]?.[animName]);
    }
}

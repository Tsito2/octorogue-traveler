import Phaser from "phaser";
// v0.2 : AnimationManager n'est plus invoqué depuis cette scène (animations mises en pause,
// voir le commentaire dans create() ci-dessous) — import conservé en commentaire pour réactivation rapide.
// import { AnimationManager } from "../core/AnimationManager";

/**
 * ============================================================================
 * ⚠️⚠️⚠️  ACTION REQUISE — DIMENSIONS DE FRAME DES SPRITESHEETS PERSONNAGES  ⚠️⚠️⚠️
 * ============================================================================
 * v0.2 — BUG CONNU : la valeur 64x64 ci-dessous est un PLACEHOLDER et est
 * actuellement TROP GRANDE par rapport aux planches réelles fournies dans
 * assets/characters/OT2/. Résultat visible en jeu : chaque "sprite" affiche
 * une mini-grille de 4 personnages au lieu d'un seul (le découpage en frames
 * tombe au milieu de plusieurs cases au lieu de tomber pile sur une case).
 *
 * TU DOIS mesurer la taille exacte d'UNE SEULE case de la grille (en pixels,
 * avec un éditeur d'image) sur les fichiers *.png de assets/characters/OT2/,
 * puis remplacer FRAME_WIDTH et FRAME_HEIGHT ci-dessous par ces valeurs exactes.
 * Tant que ce n'est pas fait, l'affichage restera incorrect même en sprite
 * statique (v0.2 affiche la frame 0, mais si frame 0 ne correspond pas à une
 * case complète, elle contiendra quand même des morceaux de cases voisines).
 *
 * Ces deux constantes sont la SEULE chose à modifier ici : tout le reste
 * (chargement, découpage en frames) en dépend automatiquement.
 */
export const FRAME_WIDTH = 64;
export const FRAME_HEIGHT = 64;

/**
 * Manifeste des spritesheets de personnages à charger dynamiquement (Data-Driven).
 * spriteKey = clé de texture Phaser (référencée par CharacterTemplate.spriteKey dans
 * src/data/characters.json et utilisée par AnimationManager / CombatScene).
 *
 * Basé sur les fichiers effectivement présents dans assets/characters/OT2/ à ce jour.
 * Note : "Akala and Mahina.png" est présent dans le dossier mais n'est pas repris ici
 * (fichier non prévu par la spec initiale, semble représenter deux personnages sur une
 * seule feuille — à clarifier avec l'utilisateur avant de lui attribuer un spriteKey).
 */
const CHARACTER_SPRITESHEETS: { spriteKey: string; file: string }[] = [
    { spriteKey: "spr_agnea", file: "Agnea.png" },
    { spriteKey: "spr_castti", file: "Castti.png" },
    { spriteKey: "spr_hikari", file: "Hikari.png" },
    { spriteKey: "spr_ochette", file: "Ochette.png" },
    { spriteKey: "spr_osvald", file: "Osvald.png" },
    { spriteKey: "spr_partitio", file: "Partitio.png" },
    { spriteKey: "spr_temenos", file: "Temenos.png" },
    // Le fichier réel porte un accent ("Throné.png"), contrairement au "Throne.png" attendu :
    // on référence ici le nom de fichier réel pour que le chargement fonctionne.
    { spriteKey: "spr_throne", file: "Throné.png" },
];

const CHARACTERS_PATH = "assets/characters/OT2/";

// Ennemi v0.1 : image statique (pas de spritesheet/animation pour l'instant), clé référencée par
// enemies.json (spriteKey: "spr_rat") et utilisée directement dans CombatScene.
const RAT_SPRITE_KEY = "spr_rat";
const RAT_IMAGE_PATH = "assets/ennemies/mob/rat.png";

// Musique de combat v0.1. Le nom de fichier contient un espace littéral ("Battle 0.mp3") :
// on l'encode avec encodeURIComponent (même précaution que pour "Throné.png") pour un
// chargement fiable quel que soit le serveur/bundler.
const BATTLE_MUSIC_KEY = "battleTheme";
const MUSIC_PATH = "assets/music/";
const BATTLE_MUSIC_FILE = "Battle 0.mp3";

/**
 * Scène de démarrage (boot/preload) : point d'entrée unique du chargement des assets
 * de personnages. S'exécute avant MainMenuScene et ne fait qu'y transiter une fois
 * les spritesheets chargées et les animations enregistrées (voir AnimationManager).
 */
export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: "PreloadScene" });
    }

    preload(): void {
        CHARACTER_SPRITESHEETS.forEach(({ spriteKey, file }) => {
            // encodeURIComponent : certains fichiers fournis contiennent des caractères accentués
            // (ex. "Throné.png"), à encoder pour un chargement fiable quel que soit le serveur.
            this.load.spritesheet(spriteKey, `${CHARACTERS_PATH}${encodeURIComponent(file)}`, {
                frameWidth: FRAME_WIDTH,
                frameHeight: FRAME_HEIGHT,
            });
        });

        // Sprite de l'ennemi de démo (image statique, pas de découpage en frames).
        this.load.image(RAT_SPRITE_KEY, RAT_IMAGE_PATH);

        // Musique de combat (espace du nom de fichier encodé).
        this.load.audio(BATTLE_MUSIC_KEY, `${MUSIC_PATH}${encodeURIComponent(BATTLE_MUSIC_FILE)}`);
    }

    create(): void {
        // v0.2 : le système d'animation est mis en pause (voir avertissement FRAME_WIDTH/FRAME_HEIGHT
        // ci-dessus). CombatScene affiche désormais une frame statique (sprite.setFrame(0)) au lieu de
        // jouer une animation "idle" en boucle. On n'enregistre donc plus les clips d'animations.json
        // ici pour l'instant — AnimationManager reste disponible tel quel pour une réactivation future,
        // une fois FRAME_WIDTH/FRAME_HEIGHT corrigés.
        // AnimationManager.registerAll(this);

        this.scene.start("MainMenuScene");
    }
}

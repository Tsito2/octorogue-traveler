# Octorogue Traveler

## Description
Octorogue Traveler est un jeu en 2D réalisé avec le framework **Phaser 3**. Le projet inclut un système de navigation entre différentes scènes (menu principal, combat, dialogues, etc.), une gestion des inputs pour interagir avec le menu principal, ainsi qu’une intégration de musique et d’éléments visuels pour enrichir l’expérience utilisateur.

## Fonctionnalités principales
- **Menu Principal** :
    - Affichage du titre “Octorogue Traveler”.
    - Trois options principales : Nouvelle Partie, Continuer, et Options.
    - Navigation dans le menu avec les flèches Haut et Bas.
    - Indication visuelle pour l’option sélectionnée (fond sombre).
    - Validation avec la touche Entrée.
    - Lecture en boucle de la musique de fond du menu principal.

- **Système de scènes** :
    - Gestion des transitions entre le menu principal, les scènes de jeu (“GameScene”), de dialogue (“DialogueScene”), et de combat (“CombatScene”).

## Structure du projet
Voici la structure actuelle du projet :

```
octoroguetraveler/
├── assets/
│   ├── backgrounds/
│   │   └── menu-bg.png
│   ├── music/
│   │   └── Main-Theme.mp3
├── src/
│   ├── core/
│   │   └── SceneManager.ts
│   ├── scenes/
│   │   ├── MainMenuScene.ts
│   │   ├── GameScene.ts
│   │   ├── DialogueScene.ts
│   │   └── CombatScene.ts
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Détails des fichiers principaux

#### 1. **assets/**
- **backgrounds/menu-bg.png** : Image de fond utilisée dans le menu principal.
- **music/Main-Theme.mp3** : Musique de fond jouée dans le menu principal.

#### 2. **src/core/SceneManager.ts**
- Gère la transition et la configuration des différentes scènes du jeu.
- Importe les scènes définies dans le dossier `scenes/` et les initialise.

#### 3. **src/scenes/**
- **MainMenuScene.ts** :
    - Gère l’interface du menu principal, y compris les options, la navigation, et la musique de fond.
    - Permet de naviguer vers la “GameScene” avec la sélection “Nouvelle Partie”.
- **GameScene.ts** :
    - Placeholder pour la scène principale du jeu.
    - Gère les éléments interactifs et la logique principale du gameplay (à compléter).
- **DialogueScene.ts** :
    - Placeholder pour les scènes de dialogue avec des personnages (à compléter).
- **CombatScene.ts** :
    - Placeholder pour les scènes de combat (à compléter).

#### 4. **src/index.ts**
- Point d’entrée principal de l’application.
- Configure Phaser avec les paramètres de base, comme les dimensions de l’écran et le mode de rendu.

## Dépendances
Pour installer les dépendances nécessaires au projet, exécutez :
```bash
npm install
```

## Lancer le projet
Pour lancer le projet localement, utilisez la commande suivante :
```bash
npm start
```
Cela démarre un serveur local et ouvre le jeu dans votre navigateur.

## Améliorations futures
- Implémentation complète des scènes de combat et de dialogue.
- Ajout de sauvegardes fonctionnelles pour l’option “Continuer”.
- Création d’une interface pour les options (ajustement du volume, commandes, etc.).
- Intégration d’assets supplémentaires pour enrichir l’expérience visuelle.

## Technologies utilisées
- **Phaser 3** : Framework pour le développement de jeux en 2D.
- **TypeScript** : Langage utilisé pour ajouter de la typage et structurer le code.
- **Node.js/NPM** : Gestion des dépendances et exécution locale.

## Crédits
- Développement par Tsitohaina Ramiandrisoa.
- Assets visuels et sonores : 
Musique : Octopath Traveler Official, by Yasunori Nishiki
Character Sprites : Spriters-ressources.com

---

N’hésitez pas à apporter vos contributions pour améliorer le jeu !


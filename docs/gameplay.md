# Système de jeu

Ce document décrit les statistiques et les systèmes principaux (Break, Boost/BP, IP) utilisés par le moteur de combat TypeScript.

## Statistiques de base

- **HP (Points de Vie)** : quantité de dégâts qu'un combattant peut encaisser avant d'être K.O.
- **SP (Skill Points)** : ressource consommée par les compétences.
- **BP (Boost Points)** : points de boost dépensables pour amplifier une compétence. Chaque tour régénère 1 BP jusqu'à un maximum propre au job.
- **IP (Influence Points)** : jauge de momentum gagnée en infligeant ou en subissant des dégâts. Peut servir à des actions spéciales ou à déclencher des limites.
- **ATT Physique** : attaque utilisée pour les compétences physiques.
- **DEF Physique** : défense réduisant les dégâts physiques reçus.
- **ATT Élémentaire** : puissance des compétences élémentaires.
- **DEF Élémentaire** : résistance face aux dégâts élémentaires.
- **Vitesse** : ordre de tour (dans cette implémentation, l'ordre est fixe mais peut évoluer pour tenir compte de la vitesse).
- **Précision (ACC)** : probabilité de toucher la cible. Un calcul basé sur la précision de l'attaquant et l'esquive de la cible peut être ajouté.
- **Esquive (EVA)** : chance d'éviter une attaque.
- **Taux Critique** : chance d'infliger un coup critique (1,5× dégâts).
- **Bouclier** : valeur de protection des ennemis. Lorsqu'elle tombe à 0, l'ennemi subit l'état **Break**.

## Break

- Chaque ennemi possède une valeur de **Bouclier** ainsi qu'une liste de **faiblesses** (armes/éléments).
- Les compétences appliquent une valeur de **Break** (1 par défaut dans les données d'exemple) qui réduit le bouclier si l'élément/arme correspond à une faiblesse.
- Quand le bouclier atteint 0, l'ennemi est **Brisé** :
  - Les dégâts reçus sont augmentés (×1,5).
  - Il perd ses actions pendant la durée de rupture (2 tours dans l'implémentation de base).
  - Le bouclier est réinitialisé à au moins 1 lorsque la rupture se termine.

## Boost (BP)

- Les héros accumulent 1 BP par tour jusqu'à un plafond défini par leur job.
- Dépenser du BP augmente la puissance d'une compétence via un coefficient propre à la compétence (**bpScaling**).
- Les compétences peuvent aussi coûter du SP ; si un héros n'a pas assez de ressource, l'action devrait échouer (à implémenter au besoin).

## Influence Points (IP)

- Chaque compétence peut octroyer des IP au lanceur (champ **ipGain** dans les données).
- Les combattants gagnent également une petite quantité d'IP lorsqu'ils subissent des dégâts, ce qui encourage un va-et-vient offensif.
- L'utilisation précise des IP (ultimes, buffs, etc.) reste à définir, mais la jauge est déjà gérée dans le moteur.

## Formules de dégâts (simplifiées)

- **Offensif** : `ATT Physique` pour les compétences physiques, `ATT Élémentaire` pour les compétences élémentaires.
- **Défensif** : `DEF Physique` ou `DEF Élémentaire` selon la catégorie de la compétence.
- **Puissance** : valeur de base de la compétence (`power`) augmentée d'un bonus proportionnel aux BP dépensés (`bpScaling × BP dépensés`).
- **Critique** : chance basée sur le `Taux Critique`, multiplicateur ×1,5.
- **Break** : si la compétence a une **breakPower** (>0) et cible une faiblesse, la valeur de bouclier diminue. À 0, l'ennemi est Brisé.

## Flux de tour

1. Le moteur sélectionne l'acteur actif (ordre fixe pour l'instant).
2. Si c'est un héros, l'UI doit fournir une action : compétence, cible, et BP à dépenser.
3. L'action applique ses coûts (SP/BP), calcule les dégâts, gère le Break, puis distribue des points d'IP.
4. En fin de tour, le moteur régénère 1 BP et fait décroître la durée de l'état **Break**.
5. Le tour passe au combattant vivant suivant.

Ces règles offrent un squelette de combat inspiré d'OCTOPATH tout en restant agnostiques de Phaser et faciles à étendre.

# Roadmap — État actuel vs vision finale

## Vision finale (telle que déduite de `README.md`, `docs/gameplay.md` et de la nature du projet)

Octorogue Traveler vise, d'après sa propre documentation et son inspiration revendiquée (Octopath Traveler), un RPG 2D complet comprenant : navigation entre scènes riches (menu, exploration, dialogues, combat), un moteur de combat au tour par tour avec mécaniques Break/Boost/IP approfondies, plusieurs personnages jouables avec système de job, une galerie d'ennemis variés, une progression de personnage, une sauvegarde de partie, et une interface complète (habillage graphique, ciblage, options). C'est une vision de jeu complet ; l'état actuel est celui d'un prototype de moteur de combat avec une tranche verticale jouable.

## Comparaison état actuel / vision finale

| Axe | Vision finale | État actuel | Écart |
|---|---|---|---|
| Exploration | Carte(s) jouable(s), déplacement, interactions | `GameScene` est un pass-through immédiat vers le combat | Quasi-total |
| Dialogues | Système de scripts de dialogue, personnages parlants | `DialogueScene` fonctionnelle isolément mais inatteignable, aucun contenu | Quasi-total |
| Combat | Système complet avec ciblage, IA variée, statuts, ultimes IP | Boucle de base solide (dégâts, Break, Boost) sans ciblage joueur, IA simpliste, IP inutilisés, statuts absents | Partiel |
| Contenu | Plusieurs héros/jobs/ennemis/compétences/zones | 2 héros, 2 jobs, 1 ennemi, 2 compétences, 1 rencontre | Très important |
| Progression | Niveaux, XP, équipement, débloquage | Absent | Total |
| Sauvegarde | Sauvegarde/chargement de partie | Absent (option "Continuer" est un stub) | Total |
| Interface | HUD complet, habillage graphique, options (volume, contrôles) | HUD fonctionnel mais géométrique (pas de sprites), pas d'écran d'options | Important |
| Qualité/outillage | Tests automatisés, CI active, lint | Aucun test, CI mal configurée, pas de script lint | Total |
| Cohérence du code | Un seul moteur de combat clair | Deux moteurs de combat coexistent (1 actif, 1 orphelin) | À résoudre avant d'ajouter du contenu |

## Roadmap priorisée

### 🔴 Critique

**1. Statuer sur le module orphelin (`characters/`, `combat/*` hors scènes, `ui/*`)**
- Difficulté : faible (décision + suppression/déplacement, pas de nouvelle logique)
- Impact : élevé (clarifie immédiatement l'architecture, réduit la dette technique, évite qu'un futur développeur code sur le mauvais moteur)
- Dépendances : aucune
- Justification : ce module double intégralement les responsabilités de `core/combat.ts` avec une API différente et plus pauvre (pas de Break configurable par arme, pas de BP scalable via données). Le garder tel quel sans décision explicite est le risque n°1 identifié dans cet audit.

**2. Réécrire `README.md` pour refléter l'architecture réelle**
- Difficulté : faible
- Impact : élevé (toute personne rejoignant le projet se fie en premier au README)
- Dépendances : idéalement après le point 1 (pour ne documenter que l'architecture retenue)
- Justification : le README actuel décrit une arborescence qui ne correspond plus au dépôt (absence de `core/combat.ts`, `data/`, `characters/`, `combat/`, référence à un asset `menu-bg.png` inexistant).

**3. Corriger ou retirer la CI (`config.yaml`)**
- Difficulté : faible
- Impact : moyen à élevé (une CI qui semble exister mais ne s'exécute jamais donne une fausse confiance)
- Dépendances : aucune
- Justification : le fichier doit être déplacé vers `.github/workflows/` pour être pris en compte par GitHub Actions, et le script `lint` qu'il appelle implicitement (par son nom "TypeScript Lint") n'existe pas dans `package.json`.

### 🟠 Haute

**4. Sélection de cible côté joueur**
- Difficulté : moyenne (UI de curseur + état de sélection dans `CombatScene`, le moteur `CombatEngine.resolveAction` accepte déjà un `targetId` arbitraire)
- Impact : élevé (actuellement le combat n'a aucun intérêt tactique dès qu'il y a plus d'un ennemi, puisque la cible est toujours automatique)
- Dépendances : aucune (le moteur est déjà prêt à recevoir n'importe quel `targetId`)
- Justification : fonctionnalité de gameplay de base pour tout RPG au tour par tour à ennemis multiples.

**5. Exposer la dépense de BP dans l'UI**
- Difficulté : moyenne (ajouter un contrôle +/- avant validation d'une compétence dans `CombatScene`)
- Impact : élevé (le système de Boost est entièrement implémenté côté moteur mais totalement invisible en jeu)
- Dépendances : aucune
- Justification : `bpScaling` (`"power"`/`"hits"`) est déjà géré par `formulas.ts`, seul le pont UI manque.

**6. Suite après victoire/défaite**
- Difficulté : faible à moyenne (retour au menu, écran de résultats, ou reprise de l'exploration selon la conception retenue)
- Impact : élevé (actuellement le joueur reste bloqué sur l'écran final sans aucune action possible)
- Dépendances : dépend de l'existence ou non d'une boucle d'exploration (point 7) pour décider de la destination après combat
- Justification : c'est une impasse de jeu (dead end) telle quelle.

**7. Boucle minimale d'exploration dans `GameScene`**
- Difficulté : élevée (déplacement, collisions, déclenchement de rencontres/dialogues)
- Impact : élevé (condition nécessaire pour que le jeu soit autre chose qu'une démo de combat)
- Dépendances : nécessite des assets de carte/tuiles qui n'existent pas encore
- Justification : `GameScene` est actuellement un simple redirecteur ; c'est la fonctionnalité manquante la plus structurante pour transformer le prototype en jeu.

### 🟡 Moyenne

**8. Connecter `DialogueScene` au flux de jeu et lui donner du contenu**
- Difficulté : moyenne (système de script de dialogue à concevoir, déclenchement depuis exploration ou avant/après combat)
- Impact : moyen (nécessaire pour la narration, mais le jeu peut progresser sans dans l'immédiat)
- Dépendances : bénéficie du point 7 (exploration) pour avoir un déclencheur naturel

**9. IA ennemie variée**
- Difficulté : moyenne
- Impact : moyen (le combat actuel reste jouable sans, mais sans profondeur tactique côté adversaire)
- Dépendances : bénéficie de plus de compétences/ennemis en donnée (point 11)

**10. Utilisation des IP (ultimes/limites)**
- Difficulté : moyenne à élevée (conception de règles + UI dédiée)
- Impact : moyen (mécanique caractéristique du genre inspiré, actuellement inerte)
- Dépendances : nécessite d'abord d'afficher l'IP dans le HUD

**11. Enrichissement du contenu (héros, ennemis, jobs, compétences, rencontres)**
- Difficulté : faible par unité de contenu (le pipeline JSON → modèle est déjà en place et extensible), mais volume de travail cumulé élevé
- Impact : élevé sur la perception de complétude du jeu
- Dépendances : aucune technique ; bénéficie d'assets graphiques (point 12) pour être pleinement satisfaisant

**12. Assets graphiques de personnages/ennemis**
- Difficulté : élevée (production artistique, hors périmètre purement logiciel)
- Impact : élevé (le HUD actuel, purement géométrique, est le principal signe visuel d'inachèvement)
- Dépendances : aucune technique, mais nécessite une décision sur le style artistique final

### 🟢 Faible

**13. Effets sonores (SFX)**
- Difficulté : faible techniquement (intégration Phaser triviale), dépend de la disponibilité des fichiers audio
- Impact : faible à moyen (confort/feedback, non bloquant pour le gameplay)
- Dépendances : aucune

**14. Écran d'options (volume, contrôles)**
- Difficulté : faible
- Impact : faible (confort joueur, non structurant)
- Dépendances : aucune

**15. Tests automatisés sur `formulas.ts`/`combat.ts`**
- Difficulté : faible à moyenne (logique pure, facilement testable unitairement)
- Impact : moyen à long terme (sécurise les évolutions futures du moteur de calcul) mais faible impact immédiat sur le jeu jouable
- Dépendances : aucune, mais gagnerait à être fait avant d'enrichir fortement le contenu (point 11) pour éviter les régressions silencieuses

**16. Statuts (poison, stun, buffs/debuffs)**
- Difficulté : élevée (nouvelle mécanique transverse à intégrer dans `CombatEngine` et le HUD)
- Impact : moyen (approfondit le combat mais n'est pas indispensable pour un premier jeu complet)
- Dépendances : bénéficie d'un combat déjà stabilisé (points 4, 5, 6) avant d'ajouter une couche de complexité supplémentaire

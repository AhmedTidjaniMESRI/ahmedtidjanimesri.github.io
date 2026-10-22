/**
 * Portfolio Data - Ahmed Tidjani MESRI
 * Projets fidèlement alignés avec le CV officiel :
 * 1. UNOVA : Intégration web & optimisation mobile
 * 2. Conception d'une Application Web de Questionnaires (PHP & MariaDB | Équipe de 5)
 * 3. Programmation du Jeu de Société LATICE (Java & JavaFX | Équipe de 4)
 */

export const PROJECTS_DATA = [
  {
    id: "unova-integration-web",
    title: "Intégration Web & Progiciel Métier chez UNOVA",
    category: "stage",
    categoryLabel: "Expérience Professionnelle",
    badge: "Stage chez UNOVA",
    year: "Avril 2026 - Juin 2026",
    role: "Développeur Web Junior",
    context: "UNOVA (Limoges) - Agence de développement sur mesure.",
    shortDesc: "Intégration web complète dans un site vitrine, une application de gestion d’entreprise et un site de vente, avec environnement WSL Ubuntu.",
    description: `Durant mon stage de 10 semaines au sein de l'agence UNOVA à Limoges, j'ai participé activement au développement web front-end et back-end sur plusieurs solutions numériques :
 
 - **Intégration web multi-projets :** travail sur le site vitrine Sulf (animations modernes, vitrine interactive), sur l'application de gestion d'entreprise Easy-Flow (ERP modulaire SaaS) et sur une plateforme de vente.
 - **Environnement & Système :** mise en place et configuration complète d'un environnement de développement sous WSL Ubuntu pour fluidifier les builds et l'outillage Linux.`,
     sheet: {
       objectif: "Intégrer de nouvelles pages et fonctionnalités dans trois produits clients : le site vitrine Sulf, le logiciel de gestion d'entreprise Easy-Flow (ERP en SaaS) et un site de vente.",
       contribution: [
         "J'ai eu pour mission de réaliser les tâches de développement et d'intégration qui m'étaient attribuées sur GitLab, en suivant la méthode agile de l'équipe.",
         "Sur le site vitrine Sulf, j'ai intégré la page « Clients » avec ses animations d'apparition, le carrousel des logos de clubs et les articles de clubs générés à partir d'un même modèle.",
         "J'ai adapté les pages Clients et Accueil au format mobile (responsive).",
         "Sur le logiciel Easy-Flow, j'ai implémenté la modale « Ajouter un acheteur » sur les commandes, à partir de la modale « Ajouter un contact » existante.",
         "J'ai développé la génération des reçus fiscaux en PDF pour les dons, avec un contenu qui s'adapte au type de donateur.",
         "J'ai installé et configuré mon environnement de développement sous WSL Ubuntu avec Docker."
       ],
       moyens: ["Ruby on Rails", "JavaScript", "Tailwind CSS", "SCSS", "Prawn (PDF)", "Docker", "WSL Ubuntu", "GitLab", "Méthode agile"],
       resultat: "Fonctionnalités livrées et intégrées aux projets de l'agence. J'ai appris à m'adapter à des architectures différentes (MVC classique pour un site vitrine, architecture modulaire pour un ERP) et à travailler sur du code existant en équipe.",
       preuves: [
         { img: "assets/projects/unova/sulf-clients-hero.jpg", caption: "Sulf — page « Clients » intégrée" },
         { img: "assets/projects/unova/sulf-clients-cartes.jpg", caption: "Sulf — cartes des clubs clients" },
         { img: "assets/projects/unova/sulf-cas-scabb.jpg", caption: "Sulf — article de club généré depuis un modèle" },
         { img: "assets/projects/unova/sulf-responsive-mobile.png", caption: "Sulf — version mobile (responsive)" },
         { img: "assets/projects/unova/easyflow-historique-vente.png", caption: "Easy-Flow — commande avec « Ajouter un acheteur »" },
         { img: "assets/projects/unova/easyflow-modale-acheteur.png", caption: "Easy-Flow — modale « Ajouter un acheteur »" },
         { img: "assets/projects/unova/easyflow-recu-fiscal.png", caption: "Easy-Flow — reçu fiscal PDF généré" }
       ]
     },
     tags: ["Ruby on Rails", "Vite", "Tailwind CSS", "JavaScript", "WSL Ubuntu", "Architecture MVC"],
     metrics: [
       { label: "Période", val: "Avr - Juin 2026" },
       { label: "Rôle", val: "Dev Web Junior" },
       { label: "Environnement", val: "WSL Ubuntu" }
     ],
     features: [
       "Développement web front-end et back-end sur Ruby on Rails et Vite",
       "Intégration responsive dans un site vitrine haute performance",
       "Développement de composants modulaires pour une application de gestion d'entreprise (ERP)",
       "Intervention sur un site de vente et workflows commerciaux",
       "Configuration et gestion de l'environnement WSL Ubuntu"
     ],
     challenges: "S'adapter rapidement à des architectures différentes (site vitrine standard vs progiciel modulaire) et fiabiliser la chaîne d'outillage sous WSL.",
     image: "assets/projects/unova/sulf-clients-hero.jpg",
     demoUrl: null,
     githubUrl: null,
     reportMention: "Stage Développeur Web Junior - UNOVA Limoges"
   },
   {
     id: "unova-mobile-optimization",
     title: "Optimisation d'Application Mobile & Infra Réseau",
     category: "stage",
     categoryLabel: "Expérience Professionnelle",
     badge: "Stage chez UNOVA",
     year: "Avril 2026 - Juin 2026",
     role: "Développeur Web & Mobile Junior",
     context: "UNOVA (Limoges) - Pôle Mobilité & Réseau.",
     shortDesc: "Développement et optimisation d'une application mobile avec configuration de la communication réseau entre WSL Ubuntu et un serveur Windows.",
     description: `Second volet majeur de mon expérience chez UNOVA :
 
 - **Développement & Optimisation mobile :** analyse des performances, fluidification de l'expérience utilisateur et optimisation du code de l'application mobile de l'entreprise.
 - **Communication réseau & Système :** configuration poussée de la passerelle de communication et des flux réseau entre un environnement WSL Ubuntu et un serveur Windows pour assurer les tests et l'interfaçage transparent des services en local.`,
     sheet: {
       objectif: "Améliorer les performances et la fluidité de l'application mobile, et permettre aux services lancés sous WSL Ubuntu de communiquer avec un serveur Windows pour pouvoir tester l'application en local.",
       contribution: [
         "J'ai eu pour mission d'analyser les lenteurs de l'application mobile et d'optimiser son code.",
         "J'ai configuré la communication réseau entre WSL Ubuntu et le serveur Windows (adresses, passerelle, redirection de ports).",
         "J'ai testé les échanges entre le client et le serveur."
       ],
       moyens: ["Développement mobile", "WSL Ubuntu", "Serveur Windows", "Réseau TCP/IP", "Redirection de ports"],
       resultat: "Application plus fluide et environnement de test local fonctionnel entre WSL et Windows. J'ai appris à diagnostiquer un problème réseau entre deux systèmes et à mesurer avant d'optimiser.",
       preuves: [
         { img: "assets/projects/unova/rezo-padel-evenements.jpg", caption: "Rézo Padel — liste des évènements" },
         { img: "assets/projects/unova/rezo-padel-detail.jpg", caption: "Rézo Padel — détail d'un évènement" },
         { img: "assets/projects/unova/rezo-padel-annuaire.jpg", caption: "Rézo Padel — annuaire des membres" },
         { img: "assets/projects/unova/rezo-padel-compte.jpg", caption: "Rézo Padel — espace compte" },
         { img: "assets/projects/unova/rezo-padel-connexion.jpg", caption: "Rézo Padel — écran de connexion" }
       ]
     },
     tags: ["Développement Mobile", "Réseau TCP/IP", "WSL Ubuntu", "Serveur Windows", "Routage & Ports", "Optimisation"],
     metrics: [
       { label: "Type", val: "Application Mobile" },
       { label: "Réseau", val: "WSL ↔ Windows" },
       { label: "Objectif", val: "Performance UX" }
     ],
     features: [
       "Optimisation des performances et réactivité de l'application mobile",
       "Résolution des goulots d'étranglement côté client mobile",
       "Configuration de la communication réseau entre sous-système WSL Ubuntu et hôte Windows",
       "Gestion des adresses IP virtuelles, passerelles et redirection de ports",
       "Maintien de la cohérence des échanges client/serveur"
     ],
     challenges: "Résoudre les problématiques de connectivité réseau spécifiques au pont virtuel WSL 2 vers Windows Server tout en optimisant le runtime mobile.",
     image: "assets/projects/unova/rezo-padel-app.jpg",
     demoUrl: null,
     githubUrl: null,
     reportMention: "Mission Réseau & Mobilité - UNOVA"
   },
   {
     id: "survey-app-rails-mysql",
     title: "Conception d'une Application Web de Questionnaires",
     category: "academique",
     categoryLabel: "Projet Académique",
     badge: "Projet en Équipe (5 pers.)",
     year: "Septembre 2025 - Mars 2026",
     role: "Développeur Full-Stack & Base de données",
     context: "IUT du Limousin, département Informatique (Équipe de 5 personnes).",
     shortDesc: "Application Web qui crée et stocke des questionnaires diffusables instantanément avec un code d'accès ou un QR code.",
     description: `Projet académique d'envergure mené sur 7 mois au sein d'une équipe de 5 étudiants à l'IUT du Limousin :
 
 L'application permet aux utilisateurs de créer, personnaliser et diffuser des sondages et questionnaires interactifs. La diffusion se fait via un code unique sécurisé ou par scan direct de **QR code**. Les réponses sont collectées en temps réel et stockées dans une base de données relationnelle optimisée.`,
     sheet: {
       contexte: "Projet universitaire (SAE) de BUT Informatique à l'IUT du Limousin, réalisé en équipe de 5 de septembre 2025 à mars 2026.",
       objectif: "Créer une application web qui permet de créer et stocker des questionnaires, puis de les diffuser simplement grâce à un code ou un QR code.",
       contribution: [
         "J'ai développé l'affichage, la suppression et la réponse aux questionnaires.",
         "J'ai ajouté les paramètres d'accès aux questionnaires et l'option de filtre dans la vue éditeur.",
         "J'ai fait évoluer la table des questionnaires dans la base de données MariaDB.",
         "J'ai travaillé en équipe avec Git (branches, fusions) et Slack."
       ],
       moyens: ["PHP", "MariaDB / SQL", "JavaScript", "Architecture MVC", "Génération de QR code", "Git", "Slack"],
       resultat: "Une application fonctionnelle : on crée un questionnaire, on le partage par code ou QR code et on récupère les réponses. J'ai appris à concevoir une base de données relationnelle et à travailler à 5 sur le même code.",
       preuves: [
         { img: "assets/projects/questionary/dashboard.jpg", caption: "Tableau de bord avec filtres par année et par BUT" },
         { img: "assets/projects/questionary/reponse.jpg", caption: "Page de réponse à un questionnaire" },
         { img: "assets/projects/questionary/editeur.jpg", caption: "Éditeur de questionnaire" },
         { img: "assets/projects/questionary/analyse.jpg", caption: "Analyse des réponses en graphiques" }
       ]
     },
     tags: ["PHP", "MariaDB", "QR Code", "Travail d'équipe", "Méthodes Agiles", "GIT & SLACK"],
     metrics: [
       { label: "Équipe", val: "5 personnes" },
       { label: "Période", val: "Sept 25 - Mar 26" },
       { label: "Stack", val: "PHP + MariaDB" }
     ],
     features: [
       "Développement web front-end et back-end en PHP (architecture MVC)",
       "Génération dynamique et partage instantané par code court et QR code",
       "Création, modélisation et manipulation d'une base de données relationnelle en MariaDB",
       "Tableau de bord de suivi des réponses et des statistiques des questionnaires",
       "Gestion de projet collaborative avec Git, Slack et rituels agiles"
     ],
     challenges: "Garantir l'intégrité des données lors des soumissions concurrentes de réponses et synchroniser efficacement le travail au sein d'une équipe de 5 développeurs.",
     image: "assets/projects/questionary/analyse.jpg",
     demoUrl: null,
     githubUrl: "https://github.com/Mdeterne/php-mariadb-Questionary",
     reportMention: "Projet Académique IUT du Limousin - Équipe de 5 personnes"
   },
   {
     id: "latice-board-game",
     title: "Programmation du Jeu de Société LATICE",
     category: "academique",
     categoryLabel: "Projet Académique",
     badge: "Projet en Équipe (4 pers.)",
     year: "Février 2025 - Mai 2025",
     role: "Développeur Java & JavaFX",
     context: "IUT du Limousin, département Informatique (Équipe de 4 personnes).",
     shortDesc: "Développement complet du jeu de société LATICE avec moteur de règles de pose de tuiles, calcul de points et interface graphique JavaFX.",
    description: `Projet universitaire réalisé en équipe de 4 personnes à l'IUT de Limoges :

LATICE est un jeu de société de stratégie et de réflexion où les joueurs posent des tuiles colorées sur une grille afin de former des combinaisons et comptabiliser un maximum de points. Le projet a nécessité une conception orientée objet rigoureuse pour séparer le moteur de règles métier et l'interface utilisateur graphique.`,
    sheet: {
      contexte: "Projet universitaire (SAE) de BUT Informatique à l'IUT du Limousin, réalisé en équipe de 4 de février à mai 2025.",
      objectif: "Programmer le jeu de société LATICE, où les joueurs posent des tuiles sur un plateau et marquent des points selon les combinaisons formées.",
      contribution: [
        "Programmation back-end en Java : règles de pose, calcul des points, validation des coups",
        "Programmation de l'interface graphique en JavaFX",
        "Travail d'équipe : découpage en modules et mise en commun avec Git"
      ],
      moyens: ["Java", "JavaFX", "Programmation orientée objet", "Modèle-Vue", "Git"],
      resultat: "Un jeu jouable de bout en bout, avec tour par tour, comptage des points et fin de partie automatique. J'ai appris à séparer la logique du jeu de son affichage et à coder proprement en orienté objet.",
      preuves: [{ img: "assets/projects/latice-partie.png", caption: "LATICE — début de partie (capture du jeu)" }]
    },
    tags: ["Java", "JavaFX", "POO & Algorithmique", "Travail d'équipe", "Git", "Jeu de Société"],
    metrics: [
      { label: "Équipe", val: "4 personnes" },
      { label: "Période", val: "Fév - Mai 2025" },
      { label: "Stack", val: "Java & JavaFX" }
    ],
    features: [
      "Programmation du moteur de jeu back-end complet en Java (règles de pose, décompte de points, validation des coups)",
      "Programmation de l'interface graphique front-end interactive en JavaFX",
      "Gestion du plateau de jeu matriciel, du sac de tuiles et de la main des joueurs",
      "Système de tour par tour et conditions de victoire automatisées",
      "Travail d'équipe avec répartition des modules et revues de code sous Git"
    ],
    challenges: "Implémenter une détection algorithmique sans faille des adjacences de tuiles multiples sur la grille et maintenir une séparation stricte Modèle-Vue.",
    image: "assets/projects/latice-partie.png",
    demoUrl: null,
    githubUrl: "https://github.com/julesgayet/latice",
    reportMention: "Projet Académique IUT du Limousin - Équipe de 4 personnes"
  }
];

export const SKILLS_SYSTEMS = [
  {
    id: "backend",
    sunName: "BACK",
    rotDir: "rot-cw",
    rotSpeed: "34s",
    title: "Développement Back-End",
    subtitle: "Architecture & Logique Métier",
    themeColor: "#00e5ff",
    themeGlow: "rgba(0, 229, 255, 0.45)",
    themeRgb: "0, 229, 255",
    icon: '<rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>',
    planets: [
      { name: "Java & POO", pos: "pos-top", logos: ["assets/tech/java.svg"], detail: "JavaFX, POO & Algorithmique" },
      { name: "Ruby on Rails", pos: "pos-right", logos: ["assets/tech/rails.svg"], detail: "Architecture MVC & API REST" },
      { name: "PHP", pos: "pos-bottom", logos: ["assets/tech/php.svg"], detail: "Backend Web & Scripts" },
      { name: "Python", pos: "pos-left", logos: ["assets/tech/python.svg"], detail: "Traitement de données & Scripts" }
    ]
  },
  {
    id: "frontend",
    sunName: "FRONT",
    rotDir: "rot-ccw",
    rotSpeed: "30s",
    title: "Développement Front-End",
    subtitle: "Interfaces Utilisateur & Ergonomie",
    themeColor: "#f59e0b",
    themeGlow: "rgba(245, 158, 11, 0.45)",
    themeRgb: "245, 158, 11",
    icon: '<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>',
    planets: [
      { name: "JavaScript", pos: "pos-top", logos: ["assets/tech/javascript.svg"], detail: "ES6+, DOM & Interactivité" },
      { name: "Tailwind & SCSS", pos: "pos-right", logos: ["assets/tech/tailwind.svg", "assets/tech/sass.svg"], detail: "Styling Moderne & Responsive" },
      { name: "HTML5 & CSS3", pos: "pos-bottom", logos: ["assets/tech/html5.svg", "assets/tech/css3.svg"], detail: "Flexbox, Grid & Sémantique" },
      { name: "JavaFX (IHM)", pos: "pos-left", logos: ["assets/tech/java.svg"], detail: "IHM Desktop & Scène Graphique" }
    ]
  },
  {
    id: "database_network",
    sunName: "DONNÉES<br>& RÉSEAU",
    rotDir: "rot-cw",
    rotSpeed: "36s",
    title: "Données & Architecture Réseau",
    subtitle: "Stockage, Modélisation & Protocoles",
    themeColor: "#38bdf8",
    themeGlow: "rgba(56, 189, 248, 0.45)",
    themeRgb: "56, 189, 248",
    icon: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
    planets: [
      { name: "MySQL & PostgreSQL", pos: "pos-top", logos: ["assets/tech/mysql.svg", "assets/tech/postgresql.svg"], detail: "SGBD Relationnels & SQL" },
      { name: "Ports & Protocoles", pos: "pos-right", detail: "Communication Inter-Réseau" },
      { name: "TCP/IP & Routage", pos: "pos-bottom", detail: "Adressage & Topologies Réseau" },
      { name: "Analyse de données", pos: "pos-left", detail: "Extraction & Structuration" }
    ]
  },
  {
    id: "gestion",
    sunName: "GESTION",
    rotDir: "rot-ccw",
    rotSpeed: "32s",
    title: "Gestion de Projet",
    subtitle: "Méthodologie & Environnement Dev",
    themeColor: "#a78bfa",
    themeGlow: "rgba(167, 139, 250, 0.45)",
    themeRgb: "167, 139, 250",
    icon: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    planets: [
      { name: "Git & GitHub", pos: "pos-top", logos: ["assets/tech/git.svg", "assets/tech/github.svg"], detail: "Branches, Merges & Pull Requests" },
      { name: "WSL & Linux", pos: "pos-right", logos: ["assets/tech/windows.svg", "assets/tech/linux.svg"], detail: "Ubuntu, Terminal & Scripts" },
      { name: "Organisation & Suivi", pos: "pos-bottom", detail: "Slack, Rituels & Planification" },
      { name: "Méthodes Agiles", pos: "pos-left", detail: "Scrum, Sprints & Backlog" }
    ]
  },
  {
    id: "soft_skills",
    sunName: "SOFT<br>SKILLS",
    rotDir: "rot-cw",
    rotSpeed: "34s",
    title: "Soft Skills & Relationnel",
    subtitle: "Qualités Humaines & Collaboration",
    themeColor: "#34d399",
    themeGlow: "rgba(52, 211, 153, 0.45)",
    themeRgb: "52, 211, 153",
    icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    planets: [
      { name: "Travail d'équipe", pos: "pos-top", detail: "Synergie, Partage & Entraide" },
      { name: "Communication", pos: "pos-right", detail: "Clarté, Écoute & Présentation" },
      { name: "Adaptabilité", pos: "pos-bottom", detail: "Curiosité & Veille Continue" },
      { name: "Autonomie & Rigueur", pos: "pos-left", detail: "Sens du détail & Persévérance" }
    ]
  }
];

export const SKILLS_DATA = {
  backend: [
    { name: "Java & POO (JavaFX)", level: 90, icon: "logos:java" },
    { name: "Ruby on Rails (RoR)", level: 88, icon: "logos:rails" },
    { name: "PHP", level: 85, icon: "logos:php" },
    { name: "Python", level: 85, icon: "logos:python" }
  ],
  frontend: [
    { name: "HTML5 & CSS3", level: 95, icon: "logos:html-5" },
    { name: "JavaScript", level: 88, icon: "logos:javascript" },
    { name: "JavaFX (IHM Graphique)", level: 88, icon: "carbon:gui" },
    { name: "Tailwind CSS & SCSS", level: 90, icon: "logos:tailwindcss" }
  ],
  database_network: [
    { name: "MySQL & PostgreSQL", level: 90, icon: "logos:mysql" },
    { name: "Architecture Réseau (TCP/IP, Routage, Ports)", level: 88, icon: "carbon:network-4" },
    { name: "Communication & Adressage Réseau", level: 86, icon: "carbon:connection-signal" },
    { name: "Analyse & Manipulation de données", level: 88, icon: "carbon:data-structured" }
  ],
  tools_soft: [
    { name: "WSL Ubuntu & Linux", level: 92, icon: "logos:ubuntu" },
    { name: "Git, GitHub & Slack", level: 92, icon: "logos:git-icon" },
    { name: "Méthodes Agiles & Organisation", level: 90, icon: "carbon:chart-line" },
    { name: "Travail d'équipe & Communication", level: 95, icon: "carbon:user-multiple" }
  ]
};

export const TIMELINE_DATA = [
  {
    period: "2024 - 2027",
    title: "Bachelor Universitaire de Technologie en Informatique (BUT 3)",
    place: "IUT du Limousin - Université de Limoges",
    badge: "En cours",
    description: "Formation d'excellence en développement informatique, gestion de données, architectures logicielles et réseaux. Projets d'envergure en équipe (PHP/MariaDB, Java/JavaFX). Recherche de stage : 22/02/2027 au 12/06/2027."
  },
  {
    period: "Avril 2026 - Juin 2026",
    title: "Développeur Web Junior (Stage en Agence)",
    place: "UNOVA - Limoges",
    badge: "Expérience Entreprise",
    description: "Intégration web dans un site vitrine, une application de gestion d'entreprise (ERP) et un site de vente. Configuration WSL Ubuntu. Optimisation d'application mobile et communication réseau WSL ↔ serveur Windows."
  },
  {
    period: "2021 - 2024",
    title: "Baccalauréat Général",
    place: "Lycée Charles Augustin Coulomb",
    badge: "Obtenu",
    description: "Spécialités : Mathématiques et Numérique et Sciences de l'Informatique (NSI). Bases solides en algorithmique, structures de données et logique formelle."
  }
];

export const CV_PROFILE_DATA = {
  name: "Ahmed MESRI",
  subTitle: "Étudiant en 3ème année de BUT Informatique à l'IUT de Limoges",
  availability: "Recherche de stage : 22/02/2027 – 12/06/2027",
  email: "m.tidjani87@gmail.com",
  phone: "+33 7 67 66 11 13",
  address: "8 impasse de la Barboute, 16730 Trois Palis",
  bio: "Je maîtrise le développement informatique, la gestion de données et l'architecture réseau. De plus, j'aime apprendre de nouvelles choses et partager.",
  hobbies: [
    { category: "Jeux vidéos", items: "League of Legends, Hollow Knight, Elden Ring, The Binding of Isaac" },
    { category: "Sport", items: "Foot, Basket" },
    { category: "Manga", items: "JoJo's Bizarre Adventure" }
  ],
  languages: [
    { lang: "Français", level: "Langue maternelle" },
    { lang: "Anglais", level: "Niveau professionnel" }
  ]
};

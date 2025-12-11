#!/usr/bin/env node

/**
 * Translation Generator Script
 * Generates all translation files for supported languages
 */

const fs = require('fs');
const path = require('path');

// Load English base translations
const enUS = require('../src/i18n/en-US.json');

// Translation mappings for all supported languages
const translations = {
  'fr-FR': {
    // French translations
    ui: {
      buttons: {
        start: "Démarrer la quête",
        cancel: "Annuler",
        close: "Fermer",
        next: "Quête suivante",
        allQuests: "Toutes les quêtes",
        downloadBadge: "Badge",
        shareLinkedIn: "Partager sur LinkedIn",
        reset: "Réinitialiser la progression",
        confirm: "Confirmer",
        ok: "OK",
        retry: "Recharger la page",
        send: "Envoyer"
      },
      headers: {
        questSelection: "Joule Quest",
        readyToStart: "Prêt à commencer ?",
        questComplete: "Quête terminée !",
        questCompleteWithErrors: "Quête terminée (avec erreurs)",
        success: "Succès !",
        oops: "Oups !",
        stepFailed: "Étape échouée",
        stepSkipped: "Étape ignorée",
        yourTurn: "À ton tour !",
        resetProgress: "Réinitialiser toute la progression ?",
        questLocked: "Quête verrouillée"
      },
      labels: {
        points: "POINTS",
        quests: "QUÊTES",
        step: "Étape {current}/{total}",
        difficulty: "Difficulté",
        estimatedTime: "Temps estimé",
        waitingForYou: "En attente que tu termines cette étape...",
        openingQuestSelection: "Ouverture de la sélection de quêtes...",
        hint: "Astuce",
        rewards: "Récompenses",
        congrats: "Tu es un maître de Joule !",
        congratsPartial: "Continue à pratiquer pour maîtriser Joule !",
        progress: "Progression"
      },
      messages: {
        resetConfirm: "Cela va :\n• Supprimer toutes les quêtes terminées\n• Réinitialiser les points à 0\n• Recommencer\n\nCette action ne peut pas être annulée.",
        questLockedInfo: "🔒 Termine {count} quête{s} supplémentaire{s} pour débloquer",
        continueNextStep: "⏭️ Passage à l'étape suivante...",
        questWillContinue: "💡 Cette étape est optionnelle - poursuite de la quête...",
        questComplete: "🎉 Quête terminée ! Clique sur 'Envoyer' pour soumettre la récompense (optionnel). 🏆",
        questCompleteGoal: "🎉 Quête terminée ! Clique sur 'Enregistrer' pour créer l'objectif (optionnel). 🏆"
      },
      tabs: {
        employee: "Employé",
        manager: "Manager",
        agent: "Agent",
        sales: "Ventes",
        procurement: "Achats",
        delivery: "Livraison"
      },
      icons: {
        employee: "👤",
        manager: "👔",
        agent: "⚡",
        sales: "📊",
        procurement: "📦",
        delivery: "🚚"
      }
    },
    journeys: {
      employee: {
        name: "Ta première semaine",
        description: "Suis ton parcours d'employé nerveux à membre d'équipe confiant lors de ta première semaine dans l'entreprise"
      },
      manager: {
        name: "Le nouveau manager",
        description: "Tu as été promu ! Navigue dans tes premières semaines en tant que manager, de l'approbation des demandes à la construction de ton style de leadership"
      },
      agent: {
        name: "Révolution IA",
        description: "Libère la puissance de l'IA pour transformer ton travail - de la création d'objectifs à l'analyse de données"
      },
      "s4hana-sales": {
        name: "Le parcours du héros des ventes",
        description: "Ta mission : Maîtriser les opérations de vente du suivi des commandes à l'excellence de facturation. Les clients comptent sur toi !"
      },
      "s4hana-procurement": {
        name: "Champion des achats",
        description: "Guerrier de la chaîne d'approvisionnement ! Navigue dans le monde complexe des bons de commande, des demandes et de la gestion des fournisseurs"
      },
      "s4hana-delivery": {
        name: "Magicien de l'entrepôt",
        description: "Le sol de l'entrepôt est ton domaine. Maîtrise le suivi des livraisons, les opérations de préparation et la logistique d'expédition"
      }
    },
    errors: {
      contentScriptNotLoaded: {
        icon: "🔄",
        title: "Configuration de l'extension nécessaire",
        message: "Joule Quest se connecte à cette page. Cela prend généralement quelques instants.",
        causes: [
          "L'extension vient d'être installée ou mise à jour",
          "La page était déjà ouverte avant l'installation de l'extension",
          "La page est toujours en cours de chargement en arrière-plan"
        ],
        solutions: [
          "⏱️ Attends 5-10 secondes que la page se charge complètement",
          "⌘ Si ça ne fonctionne toujours pas, actualise cette page (⌘R ou Ctrl+R)",
          "🔌 Assure-toi que l'extension est activée dans Chrome"
        ],
        actionText: "Recharger la page"
      },
      jouleNotFound: {
        icon: "🔍",
        title: "Joule non disponible",
        message: "Impossible de trouver l'assistant Joule sur cette page.",
        causes: [
          "Joule n'est pas activé pour ton compte",
          "Mauvaise page SF (Joule non disponible ici)",
          "La page est toujours en cours de chargement"
        ],
        solutions: [
          "🏠 Navigue d'abord vers la page d'accueil SF",
          "⏳ Attends que la page se charge complètement",
          "💬 Contacte l'administrateur si le problème persiste"
        ]
      },
      jouleIframeNotFound: {
        icon: "⚠️",
        title: "Joule ne répond pas",
        message: "L'assistant Joule ne répond pas.",
        causes: [
          "Le panneau Joule s'est peut-être fermé de manière inattendue",
          "Connexion à Joule interrompue"
        ],
        solutions: [
          "🔄 La quête réessaiera automatiquement",
          "🏠 Essaie d'actualiser la page si le problème persiste"
        ]
      },
      stepTimeout: {
        icon: "⏱️",
        title: "Expiration de l'étape",
        message: "Cette étape a pris plus de temps que prévu.",
        causes: [
          "Joule traite une demande complexe",
          "La connexion réseau est lente",
          "L'élément de la page n'apparaît pas"
        ],
        solutions: [
          "⏭️ La quête passera à l'étape suivante",
          "🔄 Rejoue la quête pour réessayer plus tard"
        ]
      },
      elementNotFound: {
        icon: "🔍",
        title: "Élément non trouvé",
        message: "Impossible de trouver l'élément requis sur la page.",
        causes: [
          "La mise en page de la page a peut-être changé",
          "L'élément est toujours en cours de chargement",
          "Mauvaise page pour cette quête"
        ],
        solutions: [
          "⏭️ La quête passera à l'étape suivante",
          "🏠 Assure-toi que tu es sur la bonne page"
        ]
      },
      promptSendFailed: {
        icon: "📤",
        title: "Message non envoyé",
        message: "Impossible d'envoyer le message à Joule.",
        causes: [
          "Le champ de saisie Joule n'est pas prêt",
          "Connexion interrompue",
          "Joule est occupé à traiter"
        ],
        solutions: [
          "⏭️ La quête passera à l'étape suivante",
          "🔄 L'étape réessaiera automatiquement"
        ]
      },
      buttonNotFound: {
        icon: "🔘",
        title: "Bouton non trouvé",
        message: "Impossible de trouver le bouton attendu.",
        causes: [
          "Le texte du bouton a peut-être changé",
          "La page est toujours en cours de chargement",
          "Le format de réponse de Joule a changé"
        ],
        solutions: [
          "⏭️ La quête passera à l'étape suivante",
          "👀 Vérifie la console du navigateur pour plus de détails"
        ]
      },
      inputFieldNotFound: {
        icon: "📝",
        title: "Champ de saisie non trouvé",
        message: "Impossible de trouver le champ de saisie pour entrer des données.",
        causes: [
          "Format de réponse Joule inattendu",
          "Le champ est toujours en cours de chargement",
          "La configuration de l'étape doit peut-être être mise à jour"
        ],
        solutions: [
          "⏭️ La quête passera à l'étape suivante",
          "🔄 Essaie de rejouer la quête"
        ]
      },
      unknownError: {
        icon: "❌",
        title: "Quelque chose s'est mal passé",
        message: "Une erreur inattendue s'est produite.",
        causes: [
          "Problème de connexion réseau",
          "Conflit de page avec l'extension",
          "Problème de compatibilité du navigateur"
        ],
        solutions: [
          "🔄 Essaie d'actualiser la page",
          "💬 Signale le problème s'il persiste"
        ]
      },
      whyThisHappened: "Pourquoi c'est arrivé :",
      whatToDo: "Que faire :",
      technicalDetails: "Détails techniques"
    },
    popup: {
      title: "Joule Quest",
      loading: "Ouverture de la sélection de quêtes..."
    }
  }
};

// Generate translation file
function generateTranslationFile(langCode) {
  const translation = translations[langCode];
  if (!translation) {
    console.error(`No translations found for ${langCode}`);
    return;
  }

  const filePath = path.join(__dirname, '..', 'src', 'i18n', `${langCode}.json`);
  fs.writeFileSync(filePath, JSON.stringify(translation, null, 2), 'utf8');
  console.log(`✅ Generated: ${langCode}.json`);
}

// Generate all translation files
console.log('Generating translation files...\n');
Object.keys(translations).forEach(generateTranslationFile);
console.log('\n✨ All translation files generated!');

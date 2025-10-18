// Traductions françaises pour YourCap
export const fr = {
  common: {
    loading: "Chargement...",
    save: "Sauvegarder",
    cancel: "Annuler",
    continue: "Continuer",
    back: "Retour",
    edit: "Modifier",
    delete: "Supprimer",
    close: "Fermer",
    confirm: "Confirmer",
    yes: "Oui",
    no: "Non",
    error: "Erreur",
    success: "Succès",
    warning: "Attention",
    info: "Information",
    retry: "Réessayer",
    done: "Terminé",
    next: "Suivant",
    previous: "Précédent",
    search: "Rechercher",
    filter: "Filtrer",
    clear: "Effacer",
    select: "Sélectionner",
    add: "Ajouter",
    remove: "Supprimer",
    required: "Requis",
    optional: "Optionnel",
  },

  // Page d'accueil
  welcome: {
    title: "N'oubliez plus jamais qui vous doit",
    subtitle: "Suivez vos dettes facilement et en toute sécurité.",
    signIn: "Se connecter",
    createAccount: "Créer un compte",
  },

  // Authentification
  auth: {
    login: {
      title: "Bon retour",
      subtitle: "Entrez vos identifiants",
      emailOrPhone: "Email ou Numéro de téléphone",
      pinTitle: "Entrez votre PIN",
      pinSubtitle: "Entrez votre PIN à 6 chiffres pour continuer",
      verifyIdentity: "Vérifiez votre identité",
      biometricSubtitle: "Utilisez votre PIN ou la biométrie pour continuer",
      welcomeBack: "Bon retour !",
      dontHaveAccount: "Vous n'avez pas de compte ?",
      signUp: "S'inscrire",
      useDifferentAccount: "Utiliser un autre compte",
    },
    register: {
      title: "S'inscrire",
      subtitle: "Créez votre compte",
      fullName: "Nom complet",
      phoneNumber: "6xx xxx xxx ou 2xx xxx xxx",
      email: "Email (optionnel)",
      createPin: "Créer un PIN",
      createPinSubtitle: "Créez un PIN à 6 chiffres pour votre compte",
      confirmPin: "Confirmer le PIN",
      confirmPinSubtitle: "Entrez votre PIN à 6 chiffres à nouveau pour confirmer",
      creatingAccount: "Création de votre compte...",
      accountCreated: "Compte créé avec succès !",
      alreadyHaveAccount: "Vous avez déjà un compte ?",
      signIn: "Se connecter",
    },
    validation: {
      fullNameRequired: "Le nom complet est requis",
      phoneRequired: "Le numéro de téléphone est requis",
      invalidPhone: "Veuillez entrer un numéro de téléphone camerounais valide",
      invalidEmail: "Veuillez entrer une adresse email valide",
      pinLength: "Le PIN doit contenir 6 chiffres",
      pinMismatch: "Les PINs ne correspondent pas",
      invalidCredentials: "Identifiants invalides. Veuillez réessayer.",
      pleaseEnterEmailOrPhone: "Veuillez entrer votre email ou numéro de téléphone",
    },
    errors: {
      registrationFailed: "Échec de l'inscription. Veuillez réessayer.",
      unexpectedError: "Une erreur inattendue s'est produite. Veuillez réessayer plus tard.",
      biometricFailed: "Échec de l'authentification biométrique",
      biometricError: "Erreur d'authentification biométrique",
    },
  },

  // Navigation
  tabs: {
    dashboard: "Tableau de bord",
    history: "Historique",
    settings: "Paramètres",
  },

  // Tableau de bord
  dashboard: {
    title: "Tableau de bord",
    quickActions: "Actions rapides",
    addDebt: "Ajouter une dette",
    addCredit: "Ajouter un crédit",
    summary: {
      totalOwed: "Total dû",
      totalLent: "Total prêté",
      people: "personnes",
      person: "personne",
    },
    empty: {
      title: "Aucune dette enregistrée",
      subtitle: "Commencez par ajouter votre première dette ou crédit",
      addFirst: "Ajouter la première",
    },
    debt: {
      owes: "doit",
      owed: "vous doit",
    },
  },

  // Dettes
  debt: {
    add: {
      title: "Ajouter une dette",
      editTitle: "Modifier la dette",
      name: "Nom de la personne",
      namePlaceholder: "Ex: Jean Dupont",
      amount: "Montant",
      amountPlaceholder: "0",
      description: "Description",
      descriptionPlaceholder: "Raison de la dette...",
      type: "Type",
      typeIOwed: "Je dois (quelqu'un me doit)",
      typeIOwe: "Je prête (je dois à quelqu'un)",
      save: "Sauvegarder",
      delete: "Supprimer cette dette",
      validation: {
        nameRequired: "Le nom est requis",
        amountRequired: "Le montant est requis",
        amountPositive: "Le montant doit être positif",
      },
    },
    list: {
      filterAll: "Tous",
      filterOwed: "On me doit",
      filterIowe: "Je dois",
      searchPlaceholder: "Rechercher par nom...",
      empty: "Aucune dette trouvée",
      emptyFilter: "Aucune dette trouvée pour ce filtre",
    },
    item: {
      you: "Vous",
      owes: "doit",
      owed: "vous doit",
      viewDetails: "Voir les détails",
    },
    details: {
      amount: "Montant",
      description: "Description",
      createdAt: "Créé le",
      updatedAt: "Modifié le",
      markAsPaid: "Marquer comme payé",
      edit: "Modifier",
      delete: "Supprimer",
    },
    delete: {
      title: "Supprimer la dette",
      message: "Êtes-vous sûr de vouloir supprimer cette dette ? Cette action ne peut pas être annulée.",
      confirm: "Supprimer",
      cancel: "Annuler",
    },
  },

  // Paramètres
  settings: {
    title: "Paramètres",
    profile: "Profil",
    security: "Sécurité",
    notifications: "Notifications",
    language: "Langue",
    data: "Données",
    about: "À propos",
    logout: "Se déconnecter",

    // Profile section
    editProfile: "Modifier le profil",
    changePin: "Changer le PIN",

    // Security section
    biometric: "Authentification biométrique",
    biometricDescription: "Utiliser l'empreinte digitale ou Face ID",

    // Notifications section
    enableNotifications: "Activer les notifications",
    reminderTime: "Heure de rappel",
    reminderDays: "Jours avant rappel",
    multipleTimes: "Heures multiples",
    summaryNotifications: "Notifications de résumé",
    daily: "Quotidien",
    weekly: "Hebdomadaire",

    // Language section
    selectLanguage: "Sélectionner la langue",
    french: "Français",
    english: "English",

    // Data section
    exportData: "Exporter les données",
    importData: "Importer les données",
    dataStructure: "Structure des données",

    // Logout
    logoutConfirm: "Êtes-vous sûr de vouloir vous déconnecter ?",
    logoutTitle: "Confirmer la déconnexion",
    logoutCancel: "Annuler",
  },

  // Modals profil
  profile: {
    edit: {
      title: "Modifier le Profil",
      subtitle: "Informations Personnelles",
      description: "Modifiez vos informations de profil",
      fullName: "Nom complet",
      phoneNumber: "6xx xxx xxx ou 2xx xxx xxx",
      email: "Email (optionnel)",
      requiredFields: "* Champs obligatoires",
      success: "Profil mis à jour avec succès !",
      error: "Erreur lors de la mise à jour du profil",
      validation: {
        fullNameRequired: "Le nom complet est requis",
        phoneRequired: "Le numéro de téléphone est requis",
        invalidPhone: "Veuillez entrer un numéro de téléphone camerounais valide",
        invalidEmail: "Veuillez entrer une adresse email valide",
      },
    },
    changePin: {
      title: "Changer PIN",
      currentPin: "PIN Actuel",
      currentPinSubtitle: "Entrez votre PIN actuel pour continuer",
      newPin: "Nouveau PIN",
      newPinSubtitle: "Créez votre nouveau PIN de 6 chiffres",
      confirmPin: "Confirmer PIN",
      confirmPinSubtitle: "Confirmez votre nouveau PIN",
      steps: {
        current: "Actuel",
        new: "Nouveau",
        confirm: "Confirmer",
      },
      verifying: "Vérification...",
      updating: "Mise à jour...",
      processing: "Traitement...",
      success: "PIN modifié avec succès !",
      validation: {
        incorrectPin: "PIN actuel incorrect",
        pinMustBeDifferent: "Le nouveau PIN doit être différent de l'ancien",
        pinMismatch: "Les PINs ne correspondent pas",
      },
      errors: {
        updateFailed: "Erreur lors de la modification du PIN",
        unexpectedError: "Une erreur inattendue s'est produite",
      },
    },
  },

  // Notifications
  notifications: {
    permission: {
      title: "Activer les notifications",
      message: "Autorisez les notifications pour recevoir des rappels de dettes.",
      allow: "Autoriser",
      later: "Plus tard",
    },
    summary: {
      title: "Résumé des dettes",
      youOwe: "Vous devez à",
      youAreOwed: "On vous doit",
      totalPeople: "personnes au total",
      totalAmount: "pour un montant total de",
    },
    reminder: {
      title: "Rappel de dette",
      message: "N'oubliez pas votre dette avec",
    },
  },

  // Import/Export
  importExport: {
    title: "Gestion des données",
    export: {
      title: "Exporter",
      button: "Exporter en CSV",
      description: "Téléchargez vos données dans un fichier CSV",
      success: "Données exportées avec succès !",
      error: "Erreur lors de l'export",
    },
    import: {
      title: "Importer",
      fromText: "Depuis le texte",
      fromFile: "Depuis un fichier",
      textPlaceholder: "Collez votre contenu CSV ici...",
      selectFile: "Sélectionner un fichier CSV",
      success: "Données importées avec succès !",
      validation: "Validation des données...",
      errors: {
        invalidFormat: "Format de fichier invalide",
        parseError: "Erreur lors de l'analyse du fichier",
        validationError: "Erreur de validation des données",
      },
    },
    dataStructure: {
      title: "Structure des données CSV",
      description: "Format requis pour l'import des dettes :",
      example: "Exemple :",
      fields: {
        name: "nom",
        amount: "montant",
        type: "type",
        description: "description",
        date: "date",
      },
      typeValues: {
        owed: "owed (on vous doit)",
        owe: "owe (vous devez)",
      },
      rules: {
        title: "Règles de validation :",
        nameRequired: "Le nom est obligatoire",
        amountPositive: "Le montant doit être un nombre positif",
        typeValid: "Le type doit être 'owed' ou 'owe'",
        dateFormat: "La date doit être au format YYYY-MM-DD (optionnel)",
      },
    },
  },

  // Messages d'erreur généraux
  errors: {
    network: "Erreur de connexion. Vérifiez votre connexion internet.",
    server: "Erreur serveur. Veuillez réessayer plus tard.",
    unknown: "Une erreur inattendue s'est produite.",
    validation: "Erreur de validation des données.",
  },

  // Messages de succès
  success: {
    saved: "Sauvegardé avec succès !",
    updated: "Mis à jour avec succès !",
    deleted: "Supprimé avec succès !",
    created: "Créé avec succès !",
  },
}

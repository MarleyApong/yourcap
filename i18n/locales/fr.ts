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
    none: "Aucun",
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
      amountPlaceholder: "Ex: 50000",
      description: "Description",
      descriptionPlaceholder: "Ex: Prêt pour urgence médicale",
      type: "Type",
      typeIOwed: "Je dois (quelqu'un me doit)",
      typeIOwe: "Je prête (je dois à quelqu'un)",
      save: "Enregistrer la dette",
      delete: "Supprimer cette dette",
      debtType: {
        title: "Type de dette",
        owing: "Quelqu'un me doit",
        owed: "Je dois à quelqu'un",
        owingDescription: "Enregistrer l'argent que quelqu'un vous doit - suivez quand vous avez prêté de l'argent et quand il devrait être remboursé.",
        owedDescription: "Enregistrer l'argent que vous devez à quelqu'un - gardez une trace de vos obligations d'emprunt et des dates d'échéance."
      },
      contact: {
        title: "Informations de contact",
        subtitle: "Ajoutez les détails de la personne pour une identification et un contact faciles.",
        phone: "Numéro de téléphone",
        phonePlaceholder: "6XX XXX XXX",
        email: "Email (Optionnel)",
        emailPlaceholder: "xxx@xxx.xx"
      },
      financial: {
        title: "Détails financiers",
        subtitle: "Spécifiez le montant, la devise et les dates importantes pour cette dette.",
        currency: "Devise",
        loanDate: "Date du prêt",
        dueDate: "Date d'échéance"
      },
      validation: {
        nameRequired: "Le nom du contact est requis",
        phoneRequired: "Le numéro de téléphone est requis",
        amountRequired: "Le montant est requis",
        amountPositive: "Le montant doit être positif",
        invalidAmount: "Veuillez saisir un montant valide supérieur à 0",
        invalidDueDate: "La date d'échéance ne peut pas être antérieure à la date du prêt"
      },
      success: "Enregistrement de dette créé avec succès !",
      error: "Échec de la création de la dette. Veuillez réessayer.",
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

    // Session Management
    sessionManagement: "Gestion des sessions",
    rememberMe: "Se souvenir de moi",
    rememberMeDescription: "Rester connecté sur cet appareil",
    sessionDuration: "Durée de session",
    autoLogout: "Déconnexion automatique après inactivité",

    // Modal texts
    termsOfService: "Conditions d'utilisation",
    privacyPolicy: "Politique de confidentialité",
    helpSupport: "Aide et Support",
    deleteAccount: "Supprimer le compte",
    iUnderstand: "J'ai compris",
    close: "Fermer",
    
    // About modal texts
    lastUpdated: "Dernière mise à jour :",
    termsWelcome: "Bienvenue sur YourCap ! Ces Conditions d'utilisation régissent votre utilisation de notre application de gestion de dettes.",
    termsAgreement: "En utilisant notre application, vous acceptez ces conditions. Veuillez les lire attentivement.",
    freeService: "Service gratuit :",
    freeServiceText: "Actuellement, YourCap est entièrement gratuit. Nous pourrions introduire des fonctionnalités premium à l'avenir avec une communication claire.",
    dataUsage: "Utilisation des données :",
    dataUsageText: "Pour améliorer nos services, nous pourrions collecter des données d'utilisation anonymisées. Les informations personnelles ne seront jamais vendues à des tiers.",
    userResponsibilities: "Responsabilités de l'utilisateur :",
    userResponsibilitiesText: "Vous êtes responsable de maintenir la confidentialité de votre compte et d'assurer l'exactitude de vos enregistrements de dettes.",
    
    // Privacy modal texts
    privacyImportant: "Votre confidentialité est importante pour nous. Cette Politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations.",
    informationWeCollect: "Informations que nous collectons :",
    accountInfo: "• Informations de compte (nom, email, numéro de téléphone)",
    debtRecords: "• Enregistrements de dettes et informations financières", 
    usageData: "• Données d'utilisation de l'application à des fins d'amélioration",
    howWeUse: "Comment nous utilisons vos informations :",
    provideServices: "• Pour fournir et améliorer nos services",
    sendNotifications: "• Pour envoyer des notifications importantes sur vos dettes",
    analytics: "• À des fins analytiques pour améliorer l'expérience utilisateur",
    dataSecure: "Vos données sont stockées de manière sécurisée et ne sont jamais partagées avec des tiers sans votre consentement, sauf si requis par la loi.",
    
    // Help modal texts
    helpIntro: "Besoin d'aide avec YourCap ? Voici quelques ressources :",
    faq: "Questions fréquemment posées :",
    howToAddDebt: "• Comment ajouter une nouvelle dette ?",
    howToAddDebtAnswer: "Allez à l'onglet Tableau de bord et appuyez sur le bouton \"+\" pour ajouter un nouvel enregistrement de dette.",
    howToChangePin: "• Comment changer mon PIN ?",
    howToChangePinAnswer: "Naviguez vers Paramètres → Profil → Changer PIN pour mettre à jour votre PIN de sécurité.",
    contactSupport: "Contact Support :",
    supportEmail: "Email: support@yourcap.app",
    responseTime: "Nous répondons généralement dans les 24 heures.",
    
    // Delete account texts
    deleteAccountConfirm: "Cela supprimera définitivement votre compte et toutes les données associées. Cette action ne peut pas être annulée.",
    deleteAccountTitle: "Supprimer le compte ?",
    deleteAccountButton: "Supprimer",
    accountDeletionSoon: "Fonction de suppression de compte bientôt disponible !",
    
    // Development tools
    developmentTools: "Outils de développement",
    testSummaryNotification: "Tester notification de résumé",
    testNotificationSent: "Notification de test envoyée !",
    rescheduleNotifications: "Reprogrammer toutes les notifications",
    notificationsRescheduled: "Toutes les notifications reprogrammées !",
    
    // Danger zone
    dangerZone: "Zone de danger",
    logOut: "Se déconnecter",

    // Additional notification settings
    notificationsEnabled: "Notifications activées",
    notificationsDisabled: "Notifications désactivées",
    notificationPermissionsDenied: "Autorisations de notification refusées",
    notificationTypes: "Types de notifications",
    systemNotifications: "Notifications système",
    systemNotificationsDesc: "Notifications push sur votre appareil",
    systemNotificationsEnabled: "Notifications système activées",
    systemNotificationsDisabled: "Notifications système désactivées",
    emailNotifications: "Notifications par email",
    emailNotificationsDesc: "Envoyer des rappels à votre email",
    emailComingSoon: "Notifications par email bientôt disponibles!",
    smsNotifications: "Notifications SMS",
    smsNotificationsDesc: "Envoyer des rappels par SMS",
    smsComingSoon: "Notifications SMS bientôt disponibles!",
    daysBeforeReminder: "Jours avant rappel",
    reminderScheduleUpdated: "Calendrier des rappels mis à jour",
    preferredNotificationTimes: "Heures préférées pour les notifications",

    // Time and duration labels
    immediately: "Immédiatement",
    oneMin: "1 min",
    fiveMin: "5 min",
    fifteenMin: "15 min",
    thirtyMin: "30 min",
    sixtyMin: "60 min",
    oneHundredTwentyMin: "120 min",
    oneHour: "1 heure",
    eightHours: "8 heures",
    twentyFourHours: "24 heures",
    sevenDays: "7 jours",
    oneDay: "1 jour",
    threeDays: "3 jours",
    fiveDays: "5 jours",
    fiveAm: "5h00",
    sixAm: "6h00",
    sevenAm: "7h00",
    eightAm: "8h00",
    nineAm: "9h00",
    twelvePm: "12h00",
    onePm: "13h00",
    twoPm: "14h00",
    threePm: "15h00",
    sixPm: "18h00",
    eightPm: "20h00",
    ninePm: "21h00",

    // Additional summary notifications
    summaryNotificationsDesc: "Résumé régulier de vos dettes",
    summaryNotificationsEnabled: "Notifications de résumé activées",
    summaryNotificationsDisabled: "Notifications de résumé désactivées",
    summaryFrequency: "Fréquence du résumé",
    summaryTime: "Heure du résumé",
    summaryFrequencyUpdated: "Fréquence du résumé mise à jour",
    summaryTimeUpdated: "Heure du résumé mise à jour",
    selectMultipleTimes: "Sélectionnez plusieurs heures pour les rappels",
    notificationTimesUpdated: "Heures de notification mises à jour",

    // About section titles
    termsOfServiceTitle: "Conditions d'utilisation",
    privacyPolicyTitle: "Politique de confidentialité",
    helpSupportTitle: "Aide et support",

    // Import Export
    debtsImported: "dettes importées!",
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
      sectionTitle: "📤 Exporter vos données",
      description: "Sauvegardez toutes vos dettes au format CSV",
      button: "Exporter mes dettes",
      buttonAlt: "Exporter en CSV",
      success: "Données exportées avec succès !",
      error: "Erreur lors de l'export",
      dataError: "Erreur lors de l'export des données",
    },
    import: {
      title: "Importer",
      sectionTitle: "📥 Importer des données",
      description: "Importez des dettes depuis un fichier CSV",
      fromText: "Depuis le texte",
      fromFile: "Depuis un fichier",
      pasteCSV: "Coller CSV",
      fileButton: "Fichier",
      structureButton: "Structure",
      templateButton: "Template",
      templateSuccess: "Template téléchargé!",
      templateError: "Erreur lors du téléchargement du template",
      textPlaceholder: "Collez votre contenu CSV ici...",
      selectFile: "Sélectionner un fichier CSV",
      success: "Données importées avec succès !",
      importedSuccess: "dettes importées avec succès!",
      importedFromFile: "dettes importées depuis le fichier!",
      validation: "Validation des données...",
      pleaseEnterCSV: "Veuillez coller le contenu CSV",
      // Modal
      modalTitle: "Importer CSV",
      modalDescription: "Collez le contenu de votre fichier CSV ci-dessous :",
      modalPlaceholder: "contact_name,contact_phone,amount,currency,loan_date,due_date,status,debt_type\\nJohn Doe,+237123456789,50000,XAF,2024-01-15,2024-02-15,PENDING,OWING",
      modalCancel: "Annuler",
      modalImport: "Importer",
      // Results and errors
      importFileError: "Aucune dette n'a pu être importée depuis le fichier",
      importFileGeneralError: "Erreur lors de l'import du fichier",
      importTextError: "Aucune dette n'a pu être importée",
      importGeneralError: "Erreur lors de l'import",
      importCompletedWarnings: "Import terminé avec des avertissements",
      importErrors: "Erreurs d'import",
      errorsEncountered: "Erreurs rencontrées:",
      // Validation
      validationErrors: "Erreurs de validation",
      validationMessage: "ligne(s) contiennent des erreurs:",
      continueWithValid: "Voulez-vous continuer avec les",
      validLines: "lignes valides?",
      continueButton: "Continuer",
      cancelButton: "Annuler",
      line: "Ligne",
      errors: {
        invalidFormat: "Format de fichier invalide",
        invalidCSVFormat: "Format CSV invalide",
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

  // Modals
  modals: {
    editProfile: {
      title: "Modifier le profil",
      fullName: "Nom complet",
      fullNamePlaceholder: "Votre nom complet",
      email: "Adresse email",
      emailPlaceholder: "votre@email.com",
      phoneNumber: "Numéro de téléphone",
      phonePlaceholder: "6XXXXXXXX",
      subtitle: "Modifiez vos informations de profil",
      save: "Sauvegarder",
      cancel: "Annuler",
      validation: {
        fullNameRequired: "Le nom complet est requis",
        phoneRequired: "Le numéro de téléphone est requis",
        invalidPhone: "Veuillez entrer un numéro de téléphone camerounais valide",
        invalidEmail: "Veuillez entrer une adresse email valide"
      },
      success: "Profil mis à jour avec succès!",
      error: "Erreur lors de la mise à jour du profil",
      unexpectedError: "Une erreur inattendue s'est produite"
    },
    changePin: {
      title: "Modifier le code PIN",
      currentPin: "Code PIN actuel",
      newPin: "Nouveau code PIN",
      confirmPin: "Confirmer le nouveau PIN",
      change: "Modifier",
      cancel: "Annuler",
      steps: {
        current: "PIN Actuel",
        new: "Nouveau PIN",
        confirm: "Confirmer PIN",
        currentSubtitle: "Entrez votre PIN actuel pour continuer",
        newSubtitle: "Créez votre nouveau PIN de 6 chiffres",
        confirmSubtitle: "Confirmez votre nouveau PIN"
      },
      validation: {
        currentPinRequired: "Le code PIN actuel est requis",
        newPinRequired: "Le nouveau code PIN est requis",
        confirmPinRequired: "La confirmation du code PIN est requise",
        pinMismatch: "Les codes PIN ne correspondent pas",
        invalidCurrentPin: "Le code PIN actuel est incorrect",
        pinMustBeDifferent: "Le nouveau PIN doit être différent de l'ancien"
      },
      success: "Code PIN modifié avec succès!",
      error: "Erreur lors de la modification du code PIN",
      verifying: "Vérification...",
      updating: "Mise à jour...",
      processing: "Traitement..."
    }
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

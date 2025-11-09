// English translations for YourCap
export const en = {
  common: {
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    continue: "Continue",
    back: "Back",
    edit: "Edit",
    delete: "Delete",
    close: "Close",
    confirm: "Confirm",
    yes: "Yes",
    no: "No",
    error: "Error",
    success: "Success",
    warning: "Warning",
    info: "Information",
    retry: "Retry",
    done: "Done",
    none: "None",
    next: "Next",
    previous: "Previous",
    search: "Search",
    filter: "Filter",
    clear: "Clear",
    select: "Select",
    add: "Add",
    remove: "Remove",
    required: "Required",
    optional: "Optional",
  },

  // Welcome page
  welcome: {
    title: "Never forget who owes you again",
    subtitle: "Keep track of debts easily and securely.",
    signIn: "Sign in",
    createAccount: "Create an account",
  },

  // Authentication
  auth: {
    login: {
      title: "Welcome Back",
      subtitle: "Enter your credentials",
      emailOrPhone: "Email or Phone Number",
      pinTitle: "Enter PIN",
      pinSubtitle: "Enter your 6-digit PIN to continue",
      verifyIdentity: "Verify Identity",
      biometricSubtitle: "Use your PIN or biometric to continue",
      welcomeBack: "Welcome back!",
      dontHaveAccount: "Don't have an account?",
      signUp: "Sign up",
      useDifferentAccount: "Use different account",
    },
    register: {
      title: "Register",
      subtitle: "Create your account",
      fullName: "Full name",
      phoneNumber: "6xx xxx xxx or 2xx xxx xxx",
      email: "Email (optional)",
      createPin: "Create PIN",
      createPinSubtitle: "Create a 6-digit PIN for your account",
      confirmPin: "Confirm PIN",
      confirmPinSubtitle: "Enter your 6-digit PIN again to confirm",
      creatingAccount: "Creating your account...",
      accountCreated: "Account created successfully!",
      alreadyHaveAccount: "Already have an account?",
      signIn: "Sign in",
    },
    validation: {
      fullNameRequired: "Full name is required",
      phoneRequired: "Phone number is required",
      invalidPhone: "Please enter a valid Cameroonian phone number",
      invalidEmail: "Please enter a valid email address",
      pinLength: "PIN must be 6 digits",
      pinMismatch: "PINs do not match",
      invalidCredentials: "Invalid credentials. Please try again.",
      pleaseEnterEmailOrPhone: "Please enter your email or phone number",
    },
    errors: {
      registrationFailed: "Registration failed. Please try again.",
      unexpectedError: "An unexpected error occurred. Please try again later.",
      biometricFailed: "Biometric authentication failed",
      biometricError: "Biometric authentication error",
    },
  },

  // Navigation
  tabs: {
    dashboard: "Dashboard",
    history: "History",
    settings: "Settings",
  },

  // Dashboard
  dashboard: {
    title: "Dashboard",
    quickActions: "Quick actions",
    addDebt: "Add debt",
    addCredit: "Add credit",
    summary: {
      totalOwed: "Total owed",
      totalLent: "Total lent",
      people: "people",
      person: "person",
    },
    empty: {
      title: "No debts recorded",
      subtitle: "Start by adding your first debt or credit",
      addFirst: "Add first",
    },
    debt: {
      owes: "owes",
      owed: "owes you",
    },
  },

  // Debts
  debt: {
    add: {
      title: "Add debt",
      editTitle: "Edit debt",
      name: "Person's name",
      namePlaceholder: "Ex: John Doe",
      amount: "Amount",
      amountPlaceholder: "Ex: 50000",
      description: "Description",
      descriptionPlaceholder: "Ex: Loan for medical emergency",
      type: "Type",
      typeIOwed: "I'm owed (someone owes me)",
      typeIOwe: "I owe (I owe someone)",
      save: "Save debt",
      delete: "Delete this debt",
      debtType: {
        title: "Debt Type",
        owing: "Someone owes me",
        owed: "I owe someone",
        owingDescription: "Record money that someone owes you - track when you lent money and when it should be repaid.",
        owedDescription: "Record money that you owe to someone - keep track of your borrowing obligations and due dates."
      },
      contact: {
        title: "Contact Information",
        subtitle: "Add the person's details for easy identification and contact.",
        phone: "Phone Number",
        phonePlaceholder: "6XX XXX XXX",
        email: "Email (Optional)",
        emailPlaceholder: "xxx@xxx.xx"
      },
      financial: {
        title: "Financial Details",
        subtitle: "Specify the amount, currency and important dates for this debt.",
        currency: "Currency",
        loanDate: "Loan Date",
        dueDate: "Due Date"
      },
      validation: {
        nameRequired: "Contact name is required",
        phoneRequired: "Phone number is required",
        amountRequired: "Amount is required",
        amountPositive: "Amount must be positive",
        invalidAmount: "Please enter a valid amount greater than 0",
        invalidDueDate: "Due date cannot be before loan date"
      },
      success: "Debt record created successfully!",
      error: "Failed to create debt. Please try again.",
    },
    list: {
      filterAll: "All",
      filterOwed: "I'm owed",
      filterIowe: "I owe",
      searchPlaceholder: "Search by name...",
      empty: "No debts found",
      emptyFilter: "No debts found for this filter",
    },
    item: {
      you: "You",
      owes: "owes",
      owed: "owes you",
      viewDetails: "View details",
    },
    details: {
      amount: "Amount",
      description: "Description",
      createdAt: "Created on",
      updatedAt: "Updated on",
      markAsPaid: "Mark as paid",
      edit: "Edit",
      delete: "Delete",
    },
    delete: {
      title: "Delete debt",
      message: "Are you sure you want to delete this debt? This action cannot be undone.",
      confirm: "Delete",
      cancel: "Cancel",
    },
  },

  // Settings
  settings: {
    title: "Settings",
    profile: "Profile",
    security: "Security",
    notifications: "Notifications",
    language: "Language",
    data: "Data",
    about: "About",
    logout: "Log out",

    // Profile section
    editProfile: "Edit profile",
    changePin: "Change PIN",

    // Security section
    biometric: "Biometric authentication",
    biometricDescription: "Use fingerprint or Face ID",

    // Notifications section
    enableNotifications: "Enable notifications",
    reminderTime: "Reminder time",
    reminderDays: "Days before reminder",
    multipleTimes: "Multiple times",
    summaryNotifications: "Summary notifications",
    daily: "Daily",
    weekly: "Weekly",

    // Language section
    selectLanguage: "Select language",
    french: "Français",
    english: "English",

    // Data section
    exportData: "Export data",
    importData: "Import data",
    dataStructure: "Data structure",

    // Logout
    logoutConfirm: "Are you sure you want to log out?",
    logoutTitle: "Confirm Logout",
    logoutCancel: "Cancel",

    // Session Management
    sessionManagement: "Session Management",
    rememberMe: "Remember Me",
    rememberMeDescription: "Keep me logged in on this device",
    sessionDuration: "Session Duration",
    autoLogout: "Auto-logout after inactivity",
    backgroundLockDelay: "Background lock delay",
    lockImmediately: "Immediately",
    lockFiveSeconds: "5 seconds",
    lockTenSeconds: "10 seconds", 
    lockThirtySeconds: "30 seconds",
    lockOneMinute: "1 minute",

    // Modal texts
    termsOfService: "Terms of Service",
    privacyPolicy: "Privacy Policy",
    helpSupport: "Help & Support",
    deleteAccount: "Delete Account",
    iUnderstand: "I Understand",
    close: "Close",
    
    // About modal texts
    lastUpdated: "Last Updated:",
    termsWelcome: "Welcome to YourCap! These Terms of Service govern your use of our debt management application.",
    termsAgreement: "By using our app, you agree to these terms. Please read them carefully.",
    freeService: "Free Service:",
    freeServiceText: "Currently, YourCap is completely free to use. We may introduce premium features in the future with clear communication.",
    dataUsage: "Data Usage:",
    dataUsageText: "To improve our services, we may collect anonymized usage data. Personal information will never be sold to third parties.",
    userResponsibilities: "User Responsibilities:",
    userResponsibilitiesText: "You are responsible for maintaining the confidentiality of your account and ensuring the accuracy of your debt records.",
    
    // Privacy modal texts
    privacyImportant: "Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information.",
    informationWeCollect: "Information We Collect:",
    accountInfo: "• Account information (name, email, phone number)",
    debtRecords: "• Debt records and financial information", 
    usageData: "• App usage data for improvement purposes",
    howWeUse: "How We Use Your Information:",
    provideServices: "• To provide and improve our services",
    sendNotifications: "• To send important notifications about your debts",
    analytics: "• For analytical purposes to enhance user experience",
    dataSecure: "Your data is stored securely and never shared with third parties without your consent, except as required by law.",
    
    // Help modal texts
    helpIntro: "Need help with YourCap? Here are some resources:",
    faq: "Frequently Asked Questions:",
    howToAddDebt: "• How to add a new debt?",
    howToAddDebtAnswer: "Go to the Dashboard tab and tap the \"+\" button to add a new debt record.",
    howToChangePin: "• How to change my PIN?",
    howToChangePinAnswer: "Navigate to Settings → Profile → Change PIN to update your security PIN.",
    contactSupport: "Contact Support:",
    supportEmail: "Email: support@yourcap.app",
    responseTime: "We typically respond within 24 hours.",
    
    // Delete account texts
    deleteAccountConfirm: "This will permanently delete your account and all associated data. This action cannot be undone.",
    deleteAccountTitle: "Delete Account?",
    deleteAccountButton: "Delete",
    accountDeletionSoon: "Account deletion feature coming soon!",
    
    // Development tools
    developmentTools: "Development Tools",
    testSummaryNotification: "Test Summary Notification",
    testNotificationSent: "Test summary notification sent!",
    rescheduleNotifications: "Reschedule All Notifications",
    notificationsRescheduled: "All notifications rescheduled!",
    
    // Danger zone
    dangerZone: "Danger Zone",
    logOut: "Log Out",

    // Additional notification settings
    notificationsEnabled: "Notifications enabled",
    notificationsDisabled: "Notifications disabled",
    notificationPermissionsDenied: "Notification permissions denied",
    notificationTypes: "Notification Types",
    systemNotifications: "System Notifications",
    systemNotificationsDesc: "Push notifications on your device",
    systemNotificationsEnabled: "System notifications enabled",
    systemNotificationsDisabled: "System notifications disabled",
    emailNotifications: "Email Notifications",
    emailNotificationsDesc: "Send reminders to your email",
    emailComingSoon: "Email notifications coming soon!",
    smsNotifications: "SMS Notifications",
    smsNotificationsDesc: "Send reminders via SMS",
    smsComingSoon: "SMS notifications coming soon!",
    daysBeforeReminder: "Days Before Reminder",
    reminderScheduleUpdated: "Reminder schedule updated",
    preferredNotificationTimes: "Preferred Times for Notifications",

    // Time and duration labels
    immediately: "Immediately",
    oneMin: "1 min",
    fiveMin: "5 min",
    fifteenMin: "15 min",
    thirtyMin: "30 min",
    sixtyMin: "60 min",
    oneHundredTwentyMin: "120 min",
    oneHour: "1 hour",
    eightHours: "8 hours",
    twentyFourHours: "24 hours",
    sevenDays: "7 days",
    oneDay: "1 day",
    threeDays: "3 days",
    fiveDays: "5 days",
    fiveAm: "5:00 AM",
    sixAm: "6:00 AM",
    sevenAm: "7:00 AM",
    eightAm: "8:00 AM",
    nineAm: "9:00 AM",
    twelvePm: "12:00 PM",
    onePm: "1:00 PM",
    twoPm: "2:00 PM",
    threePm: "3:00 PM",
    sixPm: "6:00 PM",
    eightPm: "8:00 PM",
    ninePm: "9:00 PM",

    // Additional summary notifications
    summaryNotificationsDesc: "Regular summary of your debts",
    summaryNotificationsEnabled: "Summary notifications enabled",
    summaryNotificationsDisabled: "Summary notifications disabled",
    summaryFrequency: "Summary Frequency",
    summaryTime: "Summary Time",
    summaryFrequencyUpdated: "Summary frequency updated",
    summaryTimeUpdated: "Summary time updated",
    selectMultipleTimes: "Select multiple times for reminders",
    notificationTimesUpdated: "Notification times updated",

    // About section titles
    termsOfServiceTitle: "Terms of Service",
    privacyPolicyTitle: "Privacy Policy",
    helpSupportTitle: "Help & Support",

    // Import Export
    debtsImported: "debts imported!",
  },

  // Profile modals
  profile: {
    edit: {
      title: "Edit Profile",
      subtitle: "Personal Information",
      description: "Edit your profile information",
      fullName: "Full name",
      phoneNumber: "6xx xxx xxx or 2xx xxx xxx",
      email: "Email (optional)",
      requiredFields: "* Required fields",
      success: "Profile updated successfully!",
      error: "Error updating profile",
      validation: {
        fullNameRequired: "Full name is required",
        phoneRequired: "Phone number is required",
        invalidPhone: "Please enter a valid Cameroonian phone number",
        invalidEmail: "Please enter a valid email address",
      },
    },
    changePin: {
      title: "Change PIN",
      currentPin: "Current PIN",
      currentPinSubtitle: "Enter your current PIN to continue",
      newPin: "New PIN",
      newPinSubtitle: "Create your new 6-digit PIN",
      confirmPin: "Confirm PIN",
      confirmPinSubtitle: "Confirm your new PIN",
      steps: {
        current: "Current",
        new: "New",
        confirm: "Confirm",
      },
      verifying: "Verifying...",
      updating: "Updating...",
      processing: "Processing...",
      success: "PIN changed successfully!",
      validation: {
        incorrectPin: "Current PIN is incorrect",
        pinMustBeDifferent: "New PIN must be different from current PIN",
        pinMismatch: "PINs do not match",
      },
      errors: {
        updateFailed: "Error changing PIN",
        unexpectedError: "An unexpected error occurred",
      },
    },
  },

  // Notifications
  notifications: {
    permission: {
      title: "Enable notifications",
      message: "Allow notifications to receive debt reminders.",
      allow: "Allow",
      later: "Later",
    },
    summary: {
      title: "Debt summary",
      dailySummary: "📊 Daily Summary",
      weeklySummary: "📊 Weekly Summary",
      summaryContent: "Check your debt summary and reminders",
      noPendingDebts: "🎉 You have no pending debts!",
      debtSummaryTitle: "📊 Your Debt Summary",
      youOwe: "You owe",
      youAreOwed: "You are owed",
      totalPeople: "people in total",
      totalAmount: "for a total amount of",
      // Dynamic formats
      owingFormat: "💰 {count} person{plural} owe{pluralOwes} you {amount} {currency}",
      owedFormat: "⚠️ You owe {amount} {currency} to {count} person{plural}",
    },
    reminder: {
      title: "Debt reminder",
      message: "Don't forget your debt with",
    },
  },

  // Import/Export
  importExport: {
    title: "Data management",
    export: {
      title: "Export",
      sectionTitle: "📤 Export your data",
      description: "Save all your debts in CSV format",
      button: "Export my debts",
      buttonAlt: "Export to CSV",
      success: "Data exported successfully!",
      error: "Error during export",
      dataError: "Error exporting data",
    },
    import: {
      title: "Import",
      sectionTitle: "📥 Import data",
      description: "Import debts from a CSV file",
      fromText: "From text",
      fromFile: "From file",
      pasteCSV: "Paste CSV",
      fileButton: "File",
      structureButton: "Structure",
      templateButton: "Template",
      templateSuccess: "Template downloaded!",
      templateError: "Error downloading template",
      textPlaceholder: "Paste your CSV content here...",
      selectFile: "Select a CSV file",
      success: "Data imported successfully!",
      importedSuccess: "debts imported successfully!",
      importedFromFile: "debts imported from file!",
      validation: "Validating data...",
      pleaseEnterCSV: "Please paste CSV content",
      // Modal
      modalTitle: "Import CSV",
      modalDescription: "Paste your CSV file content below:",
      modalPlaceholder: "contact_name,contact_phone,amount,currency,loan_date,due_date,status,debt_type\\nJohn Doe,+237123456789,50000,XAF,2024-01-15,2024-02-15,PENDING,OWING",
      modalCancel: "Cancel",
      modalImport: "Import",
      // Results and errors
      importFileError: "No debts could be imported from file",
      importFileGeneralError: "Error importing file",
      importTextError: "No debts could be imported",
      importGeneralError: "Error during import",
      importCompletedWarnings: "Import completed with warnings",
      importErrors: "Import errors",
      errorsEncountered: "Errors encountered:",
      // Validation
      validationErrors: "Validation errors",
      validationMessage: "line(s) contain errors:",
      continueWithValid: "Do you want to continue with the",
      validLines: "valid lines?",
      continueButton: "Continue",
      cancelButton: "Cancel",
      line: "Line",
      errors: {
        invalidFormat: "Invalid file format",
        invalidCSVFormat: "Invalid CSV format",
        parseError: "Error parsing file",
        validationError: "Data validation error",
      },
    },
    dataStructure: {
      title: "CSV data structure",
      description: "Required format for importing debts:",
      example: "Example:",
      fields: {
        name: "name",
        amount: "amount",
        type: "type",
        description: "description",
        date: "date",
      },
      typeValues: {
        owed: "owed (you are owed)",
        owe: "owe (you owe)",
      },
      rules: {
        title: "Validation rules:",
        nameRequired: "Name is required",
        amountPositive: "Amount must be a positive number",
        typeValid: "Type must be 'owed' or 'owe'",
        dateFormat: "Date must be in YYYY-MM-DD format (optional)",
      },
    },
  },

  // Modals
  modals: {
    editProfile: {
      title: "Edit Profile",
      fullName: "Full Name",
      fullNamePlaceholder: "Your full name",
      email: "Email Address",
      emailPlaceholder: "your@email.com",
      phoneNumber: "Phone Number",
      phonePlaceholder: "6XXXXXXXX",
      subtitle: "Edit your profile information",
      save: "Save",
      cancel: "Cancel",
      validation: {
        fullNameRequired: "Full name is required",
        phoneRequired: "Phone number is required",
        invalidPhone: "Please enter a valid Cameroonian phone number",
        invalidEmail: "Please enter a valid email address"
      },
      success: "Profile updated successfully!",
      error: "Error updating profile",
      unexpectedError: "An unexpected error occurred"
    },
    changePin: {
      title: "Change PIN Code",
      currentPin: "Current PIN",
      newPin: "New PIN",
      confirmPin: "Confirm New PIN",
      change: "Change",
      cancel: "Cancel",
      steps: {
        current: "Current PIN",
        new: "New PIN",
        confirm: "Confirm PIN",
        currentSubtitle: "Enter your current PIN to continue",
        newSubtitle: "Create your new 6-digit PIN",
        confirmSubtitle: "Confirm your new PIN"
      },
      validation: {
        currentPinRequired: "Current PIN is required",
        newPinRequired: "New PIN is required",
        confirmPinRequired: "PIN confirmation is required",
        pinMismatch: "PINs do not match",
        invalidCurrentPin: "Current PIN is incorrect",
        pinMustBeDifferent: "New PIN must be different from current PIN"
      },
      success: "PIN changed successfully!",
      error: "Error changing PIN",
      verifying: "Verifying...",
      updating: "Updating...",
      processing: "Processing..."
    }
  },

  // History page
  history: {
    title: "History",
    addDebt: "Add Debt",
    loading: "Loading your debts...",
    filters: {
      all: "All",
      owed: "Owed",
      iOwe: "I owe",
      pending: "Pending",
      paid: "Paid"
    },
    empty: {
      title: "No debts found",
      description: "Try adjusting your filters or add your first debt to get started.",
      buttonText: "Add New Debt"
    },
    debtType: {
      owesYou: "Owes you",
      youOwe: "You owe"
    },
    dateLabels: {
      loan: "Loan",
      due: "Due"
    },
    error: "Failed to load debts. Please try again."
  },

  // General error messages
  errors: {
    network: "Network error. Check your internet connection.",
    server: "Server error. Please try again later.",
    unknown: "An unexpected error occurred.",
    validation: "Data validation error.",
  },

  // Success messages
  success: {
    saved: "Saved successfully!",
    updated: "Updated successfully!",
    deleted: "Deleted successfully!",
    created: "Created successfully!",
  },
}

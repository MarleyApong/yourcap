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
      amountPlaceholder: "0",
      description: "Description",
      descriptionPlaceholder: "Reason for debt...",
      type: "Type",
      typeIOwed: "I'm owed (someone owes me)",
      typeIOwe: "I owe (I owe someone)",
      save: "Save",
      delete: "Delete this debt",
      validation: {
        nameRequired: "Name is required",
        amountRequired: "Amount is required",
        amountPositive: "Amount must be positive",
      },
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
      youOwe: "You owe",
      youAreOwed: "You are owed",
      totalPeople: "people in total",
      totalAmount: "for a total amount of",
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
      button: "Export to CSV",
      description: "Download your data in a CSV file",
      success: "Data exported successfully!",
      error: "Error during export",
    },
    import: {
      title: "Import",
      fromText: "From text",
      fromFile: "From file",
      textPlaceholder: "Paste your CSV content here...",
      selectFile: "Select a CSV file",
      success: "Data imported successfully!",
      validation: "Validating data...",
      errors: {
        invalidFormat: "Invalid file format",
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

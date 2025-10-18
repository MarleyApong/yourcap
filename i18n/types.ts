// Types générés automatiquement pour YourCap
// Généré le 18/10/2025
export interface TranslationKeys {
  // Common
  'common.loading': string;
  'common.save': string;
  'common.cancel': string;
  'common.continue': string;
  'common.back': string;
  'common.edit': string;
  'common.delete': string;
  'common.close': string;
  'common.confirm': string;
  'common.yes': string;
  'common.no': string;
  'common.error': string;
  'common.success': string;
  'common.warning': string;
  'common.info': string;
  'common.retry': string;
  'common.done': string;
  'common.next': string;
  'common.previous': string;
  'common.search': string;
  'common.filter': string;
  'common.clear': string;
  'common.select': string;
  'common.add': string;
  'common.remove': string;
  'common.required': string;
  'common.optional': string;

  // Welcome
  'welcome.title': string;
  'welcome.subtitle': string;
  'welcome.signIn': string;
  'welcome.createAccount': string;

  // Auth - Login
  'auth.login.title': string;
  'auth.login.subtitle': string;
  'auth.login.emailOrPhone': string;
  'auth.login.pinTitle': string;
  'auth.login.pinSubtitle': string;
  'auth.login.verifyIdentity': string;
  'auth.login.biometricSubtitle': string;
  'auth.login.welcomeBack': string;
  'auth.login.dontHaveAccount': string;
  'auth.login.signUp': string;
  'auth.login.useDifferentAccount': string;

  // Auth - Register  
  'auth.register.title': string;
  'auth.register.subtitle': string;
  'auth.register.fullName': string;
  'auth.register.phoneNumber': string;
  'auth.register.email': string;
  'auth.register.createPin': string;
  'auth.register.createPinSubtitle': string;
  'auth.register.confirmPin': string;
  'auth.register.confirmPinSubtitle': string;
  'auth.register.creatingAccount': string;
  'auth.register.accountCreated': string;
  'auth.register.alreadyHaveAccount': string;
  'auth.register.signIn': string;

  // Auth - Validation
  'auth.validation.fullNameRequired': string;
  'auth.validation.phoneRequired': string;
  'auth.validation.invalidPhone': string;
  'auth.validation.invalidEmail': string;
  'auth.validation.pinLength': string;
  'auth.validation.pinMismatch': string;
  'auth.validation.invalidCredentials': string;
  'auth.validation.pleaseEnterEmailOrPhone': string;

  // Auth - Errors
  'auth.errors.registrationFailed': string;
  'auth.errors.unexpectedError': string;
  'auth.errors.biometricFailed': string;
  'auth.errors.biometricError': string;

  // Tabs
  'tabs.dashboard': string;
  'tabs.history': string;
  'tabs.settings': string;

  // Dashboard
  'dashboard.title': string;
  'dashboard.quickActions': string;
  'dashboard.addDebt': string;
  'dashboard.addCredit': string;
  'dashboard.summary.totalOwed': string;
  'dashboard.summary.totalLent': string;
  'dashboard.summary.people': string;
  'dashboard.summary.person': string;
  'dashboard.empty.title': string;
  'dashboard.empty.subtitle': string;
  'dashboard.empty.addFirst': string;
  'dashboard.debt.owes': string;
  'dashboard.debt.owed': string;

  // Debt
  'debt.add.title': string;
  'debt.add.editTitle': string;
  'debt.add.name': string;
  'debt.add.namePlaceholder': string;
  'debt.add.amount': string;
  'debt.add.amountPlaceholder': string;
  'debt.add.description': string;
  'debt.add.descriptionPlaceholder': string;
  'debt.add.type': string;
  'debt.add.typeIOwed': string;
  'debt.add.typeIOwe': string;
  'debt.add.save': string;
  'debt.add.delete': string;
  'debt.add.validation.nameRequired': string;
  'debt.add.validation.amountRequired': string;
  'debt.add.validation.amountPositive': string;

  'debt.list.filterAll': string;
  'debt.list.filterOwed': string;
  'debt.list.filterIowe': string;
  'debt.list.searchPlaceholder': string;
  'debt.list.empty': string;
  'debt.list.emptyFilter': string;

  'debt.item.you': string;
  'debt.item.owes': string;
  'debt.item.owed': string;
  'debt.item.viewDetails': string;

  'debt.details.amount': string;
  'debt.details.description': string;
  'debt.details.createdAt': string;
  'debt.details.updatedAt': string;
  'debt.details.markAsPaid': string;
  'debt.details.edit': string;
  'debt.details.delete': string;

  'debt.delete.title': string;
  'debt.delete.message': string;
  'debt.delete.confirm': string;
  'debt.delete.cancel': string;

  // Settings
  'settings.title': string;
  'settings.profile': string;
  'settings.security': string;
  'settings.notifications': string;
  'settings.language': string;
  'settings.data': string;
  'settings.about': string;
  'settings.logout': string;
  'settings.editProfile': string;
  'settings.changePin': string;
  'settings.biometric': string;
  'settings.biometricDescription': string;
  'settings.enableNotifications': string;
  'settings.reminderTime': string;
  'settings.reminderDays': string;
  'settings.multipleTimes': string;
  'settings.summaryNotifications': string;
  'settings.daily': string;
  'settings.weekly': string;
  'settings.selectLanguage': string;
  'settings.french': string;
  'settings.english': string;
  'settings.exportData': string;
  'settings.importData': string;
  'settings.dataStructure': string;
  'settings.logoutConfirm': string;
  'settings.logoutTitle': string;
  'settings.logoutCancel': string;

  // Profile
  'profile.edit.title': string;
  'profile.edit.subtitle': string;
  'profile.edit.description': string;
  'profile.edit.fullName': string;
  'profile.edit.phoneNumber': string;
  'profile.edit.email': string;
  'profile.edit.requiredFields': string;
  'profile.edit.success': string;
  'profile.edit.error': string;
  'profile.edit.validation.fullNameRequired': string;
  'profile.edit.validation.phoneRequired': string;
  'profile.edit.validation.invalidPhone': string;
  'profile.edit.validation.invalidEmail': string;

  'profile.changePin.title': string;
  'profile.changePin.currentPin': string;
  'profile.changePin.currentPinSubtitle': string;
  'profile.changePin.newPin': string;
  'profile.changePin.newPinSubtitle': string;
  'profile.changePin.confirmPin': string;
  'profile.changePin.confirmPinSubtitle': string;
  'profile.changePin.steps.current': string;
  'profile.changePin.steps.new': string;
  'profile.changePin.steps.confirm': string;
  'profile.changePin.verifying': string;
  'profile.changePin.updating': string;
  'profile.changePin.processing': string;
  'profile.changePin.success': string;
  'profile.changePin.validation.incorrectPin': string;
  'profile.changePin.validation.pinMustBeDifferent': string;
  'profile.changePin.validation.pinMismatch': string;
  'profile.changePin.errors.updateFailed': string;
  'profile.changePin.errors.unexpectedError': string;

  // Notifications
  'notifications.permission.title': string;
  'notifications.permission.message': string;
  'notifications.permission.allow': string;
  'notifications.permission.later': string;
  'notifications.summary.title': string;
  'notifications.summary.youOwe': string;
  'notifications.summary.youAreOwed': string;
  'notifications.summary.totalPeople': string;
  'notifications.summary.totalAmount': string;
  'notifications.reminder.title': string;
  'notifications.reminder.message': string;

  // Import/Export
  'importExport.title': string;
  'importExport.export.title': string;
  'importExport.export.button': string;
  'importExport.export.description': string;
  'importExport.export.success': string;
  'importExport.export.error': string;
  'importExport.import.title': string;
  'importExport.import.fromText': string;
  'importExport.import.fromFile': string;
  'importExport.import.textPlaceholder': string;
  'importExport.import.selectFile': string;
  'importExport.import.success': string;
  'importExport.import.validation': string;
  'importExport.import.errors.invalidFormat': string;
  'importExport.import.errors.parseError': string;
  'importExport.import.errors.validationError': string;
  'importExport.dataStructure.title': string;
  'importExport.dataStructure.description': string;
  'importExport.dataStructure.example': string;
  'importExport.dataStructure.fields.name': string;
  'importExport.dataStructure.fields.amount': string;
  'importExport.dataStructure.fields.type': string;
  'importExport.dataStructure.fields.description': string;
  'importExport.dataStructure.fields.date': string;
  'importExport.dataStructure.typeValues.owed': string;
  'importExport.dataStructure.typeValues.owe': string;
  'importExport.dataStructure.rules.title': string;
  'importExport.dataStructure.rules.nameRequired': string;
  'importExport.dataStructure.rules.amountPositive': string;
  'importExport.dataStructure.rules.typeValid': string;
  'importExport.dataStructure.rules.dateFormat': string;

  // Errors
  'errors.network': string;
  'errors.server': string;
  'errors.unknown': string;
  'errors.validation': string;

  // Success
  'success.saved': string;
  'success.updated': string;
  'success.deleted': string;
  'success.created': string;
}

export type TranslationKey = keyof TranslationKeys;

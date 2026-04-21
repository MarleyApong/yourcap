// Bump TERMS_VERSION ONLY when the T&C content changes.
// Bump when a new app version introduces notable features.
export const TERMS_VERSION = "1.0"

type ChangelogEntries = {
  en: string[]
  fr: string[]
  es: string[]
  de: string[]
  pt: string[]
}

// Add a new entry here each time you want to show a "What's new" screen.
// Key = app version (must match app.json "version").
// Do NOT add an entry for the initial release version.
export const CHANGELOG: Record<string, ChangelogEntries> = {
  "1.5.0": {
    en: [
      "Partial payments — record multiple payments on a single debt and track progress",
      "Interest rates — configure flat or monthly interest when adding a debt",
      "Faster login — PIN verification is now near-instant (migrated to expo-crypto)",
      "PIN keypad ordered by default — enable shuffle in Security settings for extra privacy",
      "Forgot PIN? — reset your PIN directly from the login screen",
      "Security settings — reorganized into clear sections (Protection, Auto-lock, PIN keypad)",
      "Language selection at first launch — auto-detected from your device",
    ],
    fr: [
      "Paiements partiels — enregistrez plusieurs paiements sur une dette et suivez la progression",
      "Taux d'intérêt — configurez un intérêt fixe ou mensuel à l'ajout d'une dette",
      "Connexion plus rapide — la vérification du PIN est désormais quasi instantanée",
      "Clavier PIN en ordre par défaut — activez le mélange dans Sécurité pour plus de confidentialité",
      "PIN oublié ? — réinitialisez votre PIN directement depuis l'écran de connexion",
      "Paramètres Sécurité — réorganisés en sections claires (Protection, Verrouillage, Clavier PIN)",
      "Sélection de langue au premier lancement — détectée automatiquement depuis votre appareil",
    ],
    es: [
      "Pagos parciales — registra varios pagos en una deuda y sigue el progreso",
      "Tasas de interés — configura interés fijo o mensual al agregar una deuda",
      "Inicio de sesión más rápido — la verificación del PIN es ahora casi instantánea",
      "Teclado PIN ordenado por defecto — activa el orden aleatorio en Seguridad para más privacidad",
      "¿PIN olvidado? — restablece tu PIN directamente desde la pantalla de inicio",
      "Ajustes de seguridad — reorganizados en secciones claras (Protección, Bloqueo, Teclado PIN)",
      "Selección de idioma al primer inicio — detectado automáticamente desde tu dispositivo",
    ],
    de: [
      "Teilzahlungen — mehrere Zahlungen für eine Schuld erfassen und Fortschritt verfolgen",
      "Zinssätze — festen oder monatlichen Zins beim Hinzufügen einer Schuld festlegen",
      "Schnellere Anmeldung — PIN-Prüfung ist jetzt nahezu sofort (auf expo-crypto migriert)",
      "PIN-Tastatur standardmäßig sortiert — Mischen in den Sicherheitseinstellungen aktivierbar",
      "PIN vergessen? — PIN direkt vom Anmeldebildschirm zurücksetzen",
      "Sicherheitseinstellungen — in klare Abschnitte unterteilt (Schutz, Sperre, PIN-Tastatur)",
      "Sprachauswahl beim ersten Start — automatisch vom Gerät erkannt",
    ],
    pt: [
      "Pagamentos parciais — registre vários pagamentos em uma dívida e acompanhe o progresso",
      "Taxas de juros — configure juros fixos ou mensais ao adicionar uma dívida",
      "Login mais rápido — a verificação do PIN agora é quase instantânea",
      "Teclado PIN em ordem por padrão — ative o embaralhamento em Segurança para mais privacidade",
      "PIN esquecido? — redefina seu PIN diretamente da tela de login",
      "Configurações de segurança — reorganizadas em seções claras (Proteção, Bloqueio, Teclado PIN)",
      "Seleção de idioma no primeiro acesso — detectado automaticamente do seu dispositivo",
    ],
  },
  "1.4.0": {
    en: [
      "Dashboard redesigned — overdue & due-soon alerts plus a recent debts section",
      "Contact picker — select from your phone contacts with auto-fill",
      "New multi-step add-debt form for a smoother experience",
      "Quick login — recent accounts shown as chips on the login screen",
      "Floating + button on the dashboard for instant debt creation",
      "Animated transitions throughout the app",
      "Smarter push notifications — correct singular/plural in all languages",
      "Help & Support — rate the app, share it, or report a bug directly",
      "Better dark mode — colors now adapt correctly to every accent theme",
    ],
    fr: [
      "Tableau de bord repensé — alertes retard/échéance proche + section dettes récentes",
      "Sélecteur de contacts — choisissez depuis vos contacts avec auto-complétion",
      "Nouveau formulaire multi-étapes pour ajouter une dette plus facilement",
      "Connexion rapide — comptes récents affichés en chips sur l'écran de connexion",
      "Bouton + flottant sur le tableau de bord pour créer une dette instantanément",
      "Transitions animées dans toute l'application",
      "Notifications push améliorées — singulier/pluriel correct dans toutes les langues",
      "Aide & Support — notez l'app, partagez-la ou signalez un bug directement",
      "Meilleur mode sombre — couleurs adaptées à chaque thème d'accent",
    ],
    es: [
      "Panel rediseñado — alertas de vencimiento próximo/atrasado y sección de deudas recientes",
      "Selector de contactos — elige desde tus contactos con autocompletar",
      "Nuevo formulario de varios pasos para agregar una deuda más fácilmente",
      "Inicio rápido — cuentas recientes como chips en la pantalla de acceso",
      "Botón + flotante en el panel para crear una deuda al instante",
      "Transiciones animadas en toda la aplicación",
      "Notificaciones push mejoradas — singular/plural correcto en todos los idiomas",
      "Ayuda y Soporte — valora la app, compártela o reporta un error directamente",
      "Mejor modo oscuro — colores adaptados a cada tema de acento",
    ],
    de: [
      "Dashboard neu gestaltet — Warnungen für überfällige/bald fällige Schulden + Abschnitt \"Zuletzt\"",
      "Kontakt-Auswahl — direkt aus den Telefonkontakten mit Auto-Ausfüllen",
      "Neues mehrstufiges Formular zum einfacheren Hinzufügen von Schulden",
      "Schnellanmeldung — zuletzt verwendete Konten als Chips auf dem Login-Bildschirm",
      "Schwebende +-Schaltfläche im Dashboard für sofortige Schuldenerfassung",
      "Animierte Übergänge in der gesamten App",
      "Verbesserte Push-Benachrichtigungen — korrekte Singular-/Pluralformen in allen Sprachen",
      "Hilfe & Support — App bewerten, teilen oder direkt einen Fehler melden",
      "Verbesserter Dunkelmodus — Farben passen sich an jedes Akzentthema an",
    ],
    pt: [
      "Painel redesenhado — alertas de vencimento próximo/atrasado e seção de dívidas recentes",
      "Seletor de contatos — escolha dos seus contatos com preenchimento automático",
      "Novo formulário em várias etapas para adicionar dívidas mais facilmente",
      "Login rápido — contas recentes exibidas como chips na tela de login",
      "Botão + flutuante no painel para criar dívidas instantaneamente",
      "Transições animadas em todo o aplicativo",
      "Notificações push melhoradas — singular/plural correto em todos os idiomas",
      "Ajuda e Suporte — avalie o app, compartilhe ou reporte um bug diretamente",
      "Modo escuro aprimorado — cores adaptadas a cada tema de destaque",
    ],
  },
}

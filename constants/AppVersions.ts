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

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
  "1.9.0": {
    en: [
      "Late payment penalty — set a daily or monthly penalty rate applied automatically when a debt is overdue",
      "New Navy theme — fresh default color, plus 6 accent choices including Green and Teal now available",
      "Inactivity & background lock fixed — lock now triggers reliably after the configured delay on all devices",
      "Edit profile header spacing fixed — no longer overlaps the status bar on Android",
    ],
    fr: [
      "Pénalité de retard — définissez un taux journalier ou mensuel appliqué automatiquement si une dette n'est pas remboursée à temps",
      "Nouveau thème Marine — couleur par défaut rafraîchie, plus 6 choix d'accent dont Vert et Turquoise désormais disponibles",
      "Verrouillage par inactivité et arrière-plan corrigé — le verrou se déclenche maintenant correctement après le délai configuré",
      "Espacement du header profil corrigé — ne chevauche plus la barre de statut sur Android",
    ],
    es: [
      "Penalización por retraso — establece una tasa diaria o mensual aplicada automáticamente si una deuda no se paga a tiempo",
      "Nuevo tema Marino — color predeterminado actualizado, más 6 opciones de acento incluyendo Verde y Turquesa",
      "Bloqueo por inactividad y fondo corregido — el bloqueo se activa correctamente tras el tiempo configurado",
      "Espaciado del encabezado de perfil corregido — ya no se superpone a la barra de estado en Android",
    ],
    de: [
      "Verzugszinsen — lege einen täglichen oder monatlichen Strafzins fest, der automatisch bei überfälligen Schulden gilt",
      "Neues Marine-Thema — neue Standardfarbe und 6 Akzentoptionen, darunter Grün und Türkis",
      "Inaktivitäts- und Hintergrundsperrung behoben — Sperre wird nun zuverlässig nach der eingestellten Zeit ausgelöst",
      "Header-Abstand im Profil behoben — überlappt die Statusleiste auf Android nicht mehr",
    ],
    pt: [
      "Multa por atraso — defina uma taxa diária ou mensal aplicada automaticamente quando uma dívida não é paga no prazo",
      "Novo tema Marinho — cor padrão atualizada, mais 6 opções de destaque incluindo Verde e Azul-petróleo",
      "Bloqueio por inatividade e fundo corrigido — o bloqueio agora é acionado corretamente após o tempo configurado",
      "Espaçamento do cabeçalho do perfil corrigido — não sobrepõe mais a barra de status no Android",
    ],
  },
  "1.8.0": {
    en: [
      "Pick from phone book — select a contact directly from your phone to auto-fill name and number",
      "Duplicate numbers filtered — format duplicates (spaces, dashes) are automatically removed when selecting a contact",
    ],
    fr: [
      "Sélection depuis le répertoire — choisissez un contact directement depuis votre téléphone pour pré-remplir le nom et le numéro",
      "Numéros dupliqués filtrés — les doublons de format (espaces, tirets) sont automatiquement ignorés lors de la sélection",
    ],
    es: [
      "Selección desde el directorio — elige un contacto directamente desde tu teléfono para rellenar nombre y número automáticamente",
      "Números duplicados filtrados — los duplicados de formato (espacios, guiones) se eliminan automáticamente al seleccionar un contacto",
    ],
    de: [
      "Auswahl aus dem Telefonbuch — wähle einen Kontakt direkt vom Telefon, um Name und Nummer automatisch auszufüllen",
      "Doppelte Nummern gefiltert — Formatduplikate (Leerzeichen, Bindestriche) werden bei der Kontaktauswahl automatisch entfernt",
    ],
    pt: [
      "Seleção do catálogo — escolha um contato diretamente do telefone para preencher nome e número automaticamente",
      "Números duplicados filtrados — duplicatas de formato (espaços, hífens) são removidas automaticamente ao selecionar um contato",
    ],
  },
  "1.7.0": {
    en: [
      "Redesigned balance summary — net balance headline with separate receivable and payable cards",
      "Inactivity lock fixed — screen now locks after the configured idle time",
      "Security settings — confirmation toast after every change",
    ],
    fr: [
      "Résumé du solde repensé — solde net en titre avec cartes séparées pour créances et dettes",
      "Verrouillage par inactivité corrigé — l'écran se verrouille après le délai configuré",
      "Paramètres de sécurité — confirmation toast après chaque modification",
    ],
    es: [
      "Resumen de saldo rediseñado — saldo neto destacado con tarjetas separadas para cobros y pagos",
      "Bloqueo por inactividad corregido — la pantalla se bloquea tras el tiempo configurado",
      "Ajustes de seguridad — confirmación toast tras cada cambio",
    ],
    de: [
      "Neu gestaltete Saldoübersicht — Nettosaldo als Überschrift mit getrennten Karten für Forderungen und Schulden",
      "Inaktivitätssperre behoben — Bildschirm sperrt nach der eingestellten Leerlaufzeit",
      "Sicherheitseinstellungen — Bestätigung nach jeder Änderung",
    ],
    pt: [
      "Resumo de saldo redesenhado — saldo líquido em destaque com cartões separados para recebíveis e pagáveis",
      "Bloqueio por inatividade corrigido — tela bloqueia após o tempo de inatividade configurado",
      "Configurações de segurança — confirmação toast após cada alteração",
    ],
  },
  "1.5.0": {
    en: [
      "Partial payments — record multiple payments per debt and track progress",
      "Interest rates — add flat or monthly interest to a debt",
      "Faster login — PIN verification is now near-instant",
      "PIN keypad in order by default — enable shuffle in Security settings",
      "Forgot PIN? — reset it directly from the login screen",
      "Security settings — reorganized into 3 clear sections",
      "Language selection at first launch — auto-detected from your device",
    ],
    fr: [
      "Paiements partiels — enregistrez plusieurs paiements sur une dette",
      "Taux d'intérêt — intérêt fixe ou mensuel à l'ajout d'une dette",
      "Connexion plus rapide — vérification du PIN quasi instantanée",
      "Clavier PIN en ordre par défaut — mélange activable dans Sécurité",
      "PIN oublié ? — réinitialisez-le depuis l'écran de connexion",
      "Paramètres Sécurité — réorganisés en 3 sections claires",
      "Langue au premier lancement — détectée depuis votre appareil",
    ],
    es: [
      "Pagos parciales — registra varios pagos en una deuda y sigue el progreso",
      "Tasas de interés — interés fijo o mensual al agregar una deuda",
      "Inicio de sesión más rápido — verificación del PIN casi instantánea",
      "Teclado PIN ordenado por defecto — activa aleatorio en Seguridad",
      "¿PIN olvidado? — restablécelo desde la pantalla de inicio",
      "Ajustes de seguridad — reorganizados en 3 secciones claras",
      "Selección de idioma al primer inicio — detectado automáticamente",
    ],
    de: [
      "Teilzahlungen — mehrere Zahlungen pro Schuld erfassen und verfolgen",
      "Zinssätze — festen oder monatlichen Zins bei Schulden festlegen",
      "Schnellere Anmeldung — PIN-Prüfung jetzt nahezu sofort",
      "PIN-Tastatur sortiert — Mischen in Sicherheitseinstellungen aktivierbar",
      "PIN vergessen? — direkt vom Anmeldebildschirm zurücksetzen",
      "Sicherheitseinstellungen — in 3 klare Abschnitte unterteilt",
      "Sprachauswahl beim ersten Start — automatisch vom Gerät erkannt",
    ],
    pt: [
      "Pagamentos parciais — registre vários pagamentos por dívida",
      "Taxas de juros — juros fixos ou mensais ao adicionar uma dívida",
      "Login mais rápido — verificação do PIN agora quase instantânea",
      "Teclado PIN em ordem — ative embaralhamento em Segurança",
      "PIN esquecido? — redefina-o direto da tela de login",
      "Configurações de segurança — reorganizadas em 3 seções claras",
      "Seleção de idioma no primeiro acesso — detectado do seu dispositivo",
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

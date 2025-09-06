import { AlertOptions } from "@/components/ui/alert/alert-provider"

interface GlobalAlertMethods {
  info: (message: string, title?: string, options?: Partial<AlertOptions>) => void
  success: (message: string, title?: string, options?: Partial<AlertOptions>) => void
  error: (message: string, title?: string, options?: Partial<AlertOptions>) => void
  warning: (message: string, title?: string, options?: Partial<AlertOptions>) => void
  confirm: (message: string, onConfirm: () => void, options?: Partial<AlertOptions>) => void
  show: (options: AlertOptions) => void
}

class AlertManager {
  private showAlertFn: ((options: AlertOptions) => void) | null = null

  // Méthode pour initialiser le gestionnaire d'alertes (appelée par le provider)
  init(showAlertFn: (options: AlertOptions) => void) {
    this.showAlertFn = showAlertFn
  }

  // Méthodes publiques accessibles globalement
  info = (message: string, title?: string, options?: Partial<AlertOptions>) => {
    if (!this.showAlertFn) {
      console.warn("Alert system not initialized. Make sure AlertProvider is wrapped around your app.")
      return
    }
    this.showAlertFn({
      type: "info",
      message,
      title,
      duration: 3000,
      ...options,
    })
  }

  success = (message: string, title?: string, options?: Partial<AlertOptions>) => {
    if (!this.showAlertFn) {
      console.warn("Alert system not initialized. Make sure AlertProvider is wrapped around your app.")
      return
    }
    this.showAlertFn({
      type: "success",
      message,
      title,
      duration: 3000,
      ...options,
    })
  }

  error = (message: string, title?: string, options?: Partial<AlertOptions>) => {
    if (!this.showAlertFn) {
      console.warn("Alert system not initialized. Make sure AlertProvider is wrapped around your app.")
      return
    }
    this.showAlertFn({
      type: "error",
      message,
      title,
      duration: 4000,
      ...options,
    })
  }

  warning = (message: string, title?: string, options?: Partial<AlertOptions>) => {
    if (!this.showAlertFn) {
      console.warn("Alert system not initialized. Make sure AlertProvider is wrapped around your app.")
      return
    }
    this.showAlertFn({
      type: "warning",
      message,
      title,
      duration: 4000,
      ...options,
    })
  }

  confirm = (message: string, onConfirm: () => void, options?: Partial<AlertOptions>) => {
    if (!this.showAlertFn) {
      console.warn("Alert system not initialized. Make sure AlertProvider is wrapped around your app.")
      return
    }
    this.showAlertFn({
      type: "confirm",
      message,
      onConfirm,
      title: options?.title || "Confirmation",
      confirmText: options?.confirmText || "Confirm",
      cancelText: options?.cancelText || "Cancel",
      ...options,
    })
  }

  show = (options: AlertOptions) => {
    if (!this.showAlertFn) {
      console.warn("Alert system not initialized. Make sure AlertProvider is wrapped around your app.")
      return
    }
    this.showAlertFn(options)
  }
}

// Instance globale
const alertManager = new AlertManager()

// Export de l'objet Alert global
export const Alert = alertManager

// Export pour TypeScript global
declare global {
  var Alert: GlobalAlertMethods
}

// Assignation globale
if (typeof globalThis !== "undefined") {
  globalThis.Alert = alertManager as GlobalAlertMethods
}

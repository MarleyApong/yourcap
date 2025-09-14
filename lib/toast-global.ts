import { ToastOptions } from "@/components/ui/toast/toast-provider"

interface GlobalToastMethods {
  info: (message: string, title?: string, options?: Partial<ToastOptions>) => void
  success: (message: string, title?: string, options?: Partial<ToastOptions>) => void
  error: (message: string, title?: string, options?: Partial<ToastOptions>) => void
  warning: (message: string, title?: string, options?: Partial<ToastOptions>) => void
  confirm: (message: string, onConfirm: () => void, options?: Partial<ToastOptions>) => void
  show: (options: ToastOptions) => void
}

class ToastManager {
  private showToastFn: ((options: ToastOptions) => void) | null = null

  // Méthode pour initialiser le gestionnaire d'alertes (appelée par le provider)
  init(showToastFn: (options: ToastOptions) => void) {
    this.showToastFn = showToastFn
  }

  // Méthodes publiques accessibles globalement
  info = (message: string, title?: string, options?: Partial<ToastOptions>) => {
    if (!this.showToastFn) {
      console.warn("Toast system not initialized. Make sure ToastProvider is wrapped around your app.")
      return
    }
    this.showToastFn({
      type: "info",
      message,
      title,
      duration: 3000,
      ...options,
    })
  }

  success = (message: string, title?: string, options?: Partial<ToastOptions>) => {
    if (!this.showToastFn) {
      console.warn("Toast system not initialized. Make sure ToastProvider is wrapped around your app.")
      return
    }
    this.showToastFn({
      type: "success",
      message,
      title,
      duration: 3000,
      ...options,
    })
  }

  error = (message: string, title?: string, options?: Partial<ToastOptions>) => {
    if (!this.showToastFn) {
      console.warn("Toast system not initialized. Make sure ToastProvider is wrapped around your app.")
      return
    }
    this.showToastFn({
      type: "error",
      message,
      title,
      duration: 4000,
      ...options,
    })
  }

  warning = (message: string, title?: string, options?: Partial<ToastOptions>) => {
    if (!this.showToastFn) {
      console.warn("Toast system not initialized. Make sure ToastProvider is wrapped around your app.")
      return
    }
    this.showToastFn({
      type: "warning",
      message,
      title,
      duration: 4000,
      ...options,
    })
  }

  confirm = (message: string, onConfirm: () => void, options?: Partial<ToastOptions>) => {
    if (!this.showToastFn) {
      console.warn("Toast system not initialized. Make sure ToastProvider is wrapped around your app.")
      return
    }
    this.showToastFn({
      type: "confirm",
      message,
      onConfirm,
      title: options?.title || "Confirmation",
      confirmText: options?.confirmText || "Confirm",
      cancelText: options?.cancelText || "Cancel",
      ...options,
    })
  }

  show = (options: ToastOptions) => {
    if (!this.showToastFn) {
      console.warn("Toast system not initialized. Make sure ToastProvider is wrapped around your app.")
      return
    }
    this.showToastFn(options)
  }
}

// Instance globale
const alertManager = new ToastManager()

// Export de l'objet Toast global
export const Toast = alertManager

// Export pour TypeScript global
declare global {
  var Toast: GlobalToastMethods
}

// Assignation globale
if (typeof globalThis !== "undefined") {
  globalThis.Toast = alertManager as GlobalToastMethods
}

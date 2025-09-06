import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { AlertModal } from './alert-modal'
import { Alert } from '@/lib/alert-global'

export interface AlertOptions {
  title?: string
  message: string
  type?: 'info' | 'success' | 'error' | 'warning' | 'confirm'
  position?: 'center' | 'top' | 'bottom'
  duration?: number
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void
  hideAlert: () => void
}

interface AlertState extends AlertOptions {
  visible: boolean
}

const AlertContext = createContext<AlertContextType | null>(null)

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    message: '',
    type: 'info',
    position: 'center',
    duration: 0
  })

  const showAlert = (options: AlertOptions) => {
    setAlertState({
      ...options,
      visible: true,
      type: options.type || 'info',
      position: options.position || 'center',
      duration: options.duration || 0
    })

    if (options.duration && options.duration > 0 && options.type !== 'confirm') {
      setTimeout(() => {
        hideAlert()
      }, options.duration)
    }
  }

  const hideAlert = () => {
    setAlertState(prev => ({ ...prev, visible: false }))
  }

  // Initialisation du système global d'alertes
  useEffect(() => {
    Alert.init(showAlert)
  }, [])

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <AlertModal
        {...alertState}
        type={alertState.type ?? 'info'}
        position={alertState.position ?? 'center'}
        onClose={hideAlert}
      />
    </AlertContext.Provider>
  )
}

export const useAlert = () => {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider')
  }
  return context
}
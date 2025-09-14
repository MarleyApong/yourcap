import { Toast } from '@/lib/toast-global'
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { ToastModal } from './toast-modal'

export interface ToastOptions {
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

interface ToastContextType {
  showToast: (options: ToastOptions) => void
  hideToast: () => void
}

interface ToastState extends ToastOptions {
  visible: boolean
}

const ToastContext = createContext<ToastContextType | null>(null)

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alertState, setToastState] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'info',
    position: 'center',
    duration: 0
  })

  const showToast = (options: ToastOptions) => {
    setToastState({
      ...options,
      visible: true,
      type: options.type || 'info',
      position: options.position || 'center',
      duration: options.duration || 0
    })

    if (options.duration && options.duration > 0 && options.type !== 'confirm') {
      setTimeout(() => {
        hideToast()
      }, options.duration)
    }
  }

  const hideToast = () => {
    setToastState(prev => ({ ...prev, visible: false }))
  }

  // Initialisation du système global d'alertes
  useEffect(() => {
    Toast.init(showToast)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <ToastModal
        {...alertState}
        type={alertState.type ?? 'info'}
        position={alertState.position ?? 'center'}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within an ToastProvider')
  }
  return context
}
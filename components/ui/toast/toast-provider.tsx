import { Toast } from '@/lib/toast-global'
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { CompactToast, ToastModal } from './toast-modal'

export interface ToastOptions {
  title?: string
  message: string
  type?: 'info' | 'success' | 'error' | 'warning' | 'confirm'
  position?: 'center' | 'top' | 'bottom'
  duration?: number
  compact?: boolean
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
    const baseMs = options.message.length * 50
    const type = options.type || 'info'
    const autoDuration = type === 'confirm' ? 0
      : type === 'error' ? Math.min(6000, Math.max(3500, baseMs))
      : Math.min(5000, Math.max(2500, baseMs))
    const duration = (options.duration !== undefined && options.duration > 0)
      ? options.duration
      : autoDuration

    setToastState({
      ...options,
      visible: true,
      type,
      position: options.position || 'center',
      duration,
    })

    if (duration > 0 && type !== 'confirm') {
      setTimeout(() => {
        hideToast()
      }, duration)
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
      {alertState.compact ? (
        <CompactToast
          {...alertState}
          type={alertState.type ?? 'info'}
          onClose={hideToast}
        />
      ) : (
        <ToastModal
          {...alertState}
          type={alertState.type ?? 'info'}
          position={alertState.position ?? 'center'}
          onClose={hideToast}
        />
      )}
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
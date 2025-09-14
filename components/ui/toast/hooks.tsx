import { ToastOptions, useToast } from './toast-provider'

export const useSimpleToast = () => {
  const { showToast } = useToast()

  const info = (message: string, title?: string, options?: Partial<ToastOptions>) => {
    showToast({ 
      type: 'info', 
      message, 
      title, 
      duration: 3000,
      ...options 
    })
  }

  const success = (message: string, title?: string, options?: Partial<ToastOptions>) => {
    showToast({ 
      type: 'success', 
      message, 
      title,
      duration: 3000,
      ...options 
    })
  }

  const error = (message: string, title?: string, options?: Partial<ToastOptions>) => {
    showToast({ 
      type: 'error', 
      message, 
      title,
      duration: 4000,
      ...options 
    })
  }

  const warning = (message: string, title?: string, options?: Partial<ToastOptions>) => {
    showToast({ 
      type: 'warning', 
      message, 
      title,
      duration: 4000,
      ...options 
    })
  }

  const confirm = (
    message: string, 
    onConfirm: () => void, 
    options?: Partial<ToastOptions>
  ) => {
    showToast({ 
      type: 'confirm', 
      message, 
      onConfirm,
      title: options?.title || 'Confirmation',
      confirmText: options?.confirmText || 'Confirm',
      cancelText: options?.cancelText || 'Cancel',
      ...options 
    })
  }

  return { info, success, error, warning, confirm, showToast }
}

// const toast = useSimpleToast()
// toast.success('Success message!')
// toast.error('Error message!')
// toast.confirm('Delete item?', () => deleteItem())

// toast.info('Message', 'Title', {
//   position: 'top',
//   duration: 5000
// })
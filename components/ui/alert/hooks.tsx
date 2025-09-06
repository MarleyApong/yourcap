import { useAlert, AlertOptions } from './alert-provider'

export const useSimpleAlert = () => {
  const { showAlert } = useAlert()

  const info = (message: string, title?: string, options?: Partial<AlertOptions>) => {
    showAlert({ 
      type: 'info', 
      message, 
      title, 
      duration: 3000,
      ...options 
    })
  }

  const success = (message: string, title?: string, options?: Partial<AlertOptions>) => {
    showAlert({ 
      type: 'success', 
      message, 
      title,
      duration: 3000,
      ...options 
    })
  }

  const error = (message: string, title?: string, options?: Partial<AlertOptions>) => {
    showAlert({ 
      type: 'error', 
      message, 
      title,
      duration: 4000,
      ...options 
    })
  }

  const warning = (message: string, title?: string, options?: Partial<AlertOptions>) => {
    showAlert({ 
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
    options?: Partial<AlertOptions>
  ) => {
    showAlert({ 
      type: 'confirm', 
      message, 
      onConfirm,
      title: options?.title || 'Confirmation',
      confirmText: options?.confirmText || 'Confirm',
      cancelText: options?.cancelText || 'Cancel',
      ...options 
    })
  }

  return { info, success, error, warning, confirm, showAlert }
}

// const alert = useSimpleAlert()
// alert.success('Success message!')
// alert.error('Error message!')
// alert.confirm('Delete item?', () => deleteItem())

// alert.info('Message', 'Title', {
//   position: 'top',
//   duration: 5000
// })
// declare module "@fontsource/poppins"
declare module "*.css"
declare module "*.png"
declare module "*.jpg"
declare module "*.jpeg"
declare module "*.svg"

declare const __APP_VERSION__: string

declare module "@react-native-async-storage/async-storage" {
  export default AsyncStorage
}

declare global {
  interface GlobalToastMethods {
    info: (message: string, title?: string, options?: Partial<import('@/components/ui/toast/toast-provider').ToastOptions>) => void
    success: (message: string, title?: string, options?: Partial<import('@/components/ui/toast/toast-provider').ToastOptions>) => void
    error: (message: string, title?: string, options?: Partial<import('@/components/ui/toast/toast-provider').ToastOptions>) => void
    warning: (message: string, title?: string, options?: Partial<import('@/components/ui/toast/toast-provider').ToastOptions>) => void
    confirm: (message: string, onConfirm: () => void, options?: Partial<import('@/components/ui/toast/toast-provider').ToastOptions>) => void
    show: (options: import('@/components/ui/toast/toast-provider').ToastOptions) => void
  }

  var Toast: GlobalToastMethods
}
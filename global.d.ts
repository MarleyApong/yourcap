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
  interface GlobalAlertMethods {
    info: (message: string, title?: string, options?: Partial<import('@/components/ui/alert/alert-provider').AlertOptions>) => void
    success: (message: string, title?: string, options?: Partial<import('@/components/ui/alert/alert-provider').AlertOptions>) => void
    error: (message: string, title?: string, options?: Partial<import('@/components/ui/alert/alert-provider').AlertOptions>) => void
    warning: (message: string, title?: string, options?: Partial<import('@/components/ui/alert/alert-provider').AlertOptions>) => void
    confirm: (message: string, onConfirm: () => void, options?: Partial<import('@/components/ui/alert/alert-provider').AlertOptions>) => void
    show: (options: import('@/components/ui/alert/alert-provider').AlertOptions) => void
  }

  var Alert: GlobalAlertMethods
}
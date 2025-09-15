import * as LocalAuthentication from "expo-local-authentication"

export interface BiometricCapabilities {
  isAvailable: boolean
  biometryType: string | null
  hasHardware: boolean
  isEnrolled: boolean
}

export const checkBiometricCapabilities = async (): Promise<BiometricCapabilities> => {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync()
    const isEnrolled = await LocalAuthentication.isEnrolledAsync()
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync()

    console.log("🔐 Biometric check - Hardware:", hasHardware, "Enrolled:", isEnrolled, "Types:", supportedTypes)

    let biometryType = null
    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      biometryType = "fingerprint"
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      biometryType = "face"
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      biometryType = "iris"
    }

    const isAvailable = hasHardware && isEnrolled && supportedTypes.length > 0

    return {
      isAvailable,
      biometryType,
      hasHardware,
      isEnrolled,
    }
  } catch (error) {
    console.error("❌ Error checking biometric capabilities:", error)
    return {
      isAvailable: false,
      biometryType: null,
      hasHardware: false,
      isEnrolled: false,
    }
  }
}

export const authenticateWithBiometric = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const capabilities = await checkBiometricCapabilities()

    console.log("🔐 Starting authentication with capabilities:", capabilities)

    if (!capabilities.hasHardware) {
      return {
        success: false,
        error: "No biometric hardware available on this device",
      }
    }

    if (!capabilities.isEnrolled) {
      return {
        success: false,
        error: "No biometric credentials enrolled. Please set up biometric authentication in your device settings.",
      }
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Authenticate to access your account",
      cancelLabel: "Cancel",
      disableDeviceFallback: true, // Forcer uniquement la biométrie
      requireConfirmation: false,
      fallbackLabel: "Use PIN", // Texte pour le fallback
    })

    console.log("🔐 Authentication result:", result)

    if (result.success) {
      return { success: true }
    }

    // Gérer les différents types d'erreurs
    let errorMessage = "Authentication failed"
    if (result.error === "user_cancel") {
      errorMessage = "Authentication was cancelled"
    } else if (result.error === "authentication_failed") {
      errorMessage = "Biometric authentication failed. Please try again."
    } else if (result.error === "lockout") {
      errorMessage = "Account locked. Please try again later."
    }
    else if (result.error === "system_cancel") {
      errorMessage = "Authentication was cancelled by the system"
    }
    

    return {
      success: false,
      error: errorMessage,
    }
  } catch (error) {
    console.error("❌ Biometric authentication error:", error)
    return {
      success: false,
      error: "An unexpected error occurred during authentication",
    }
  }
}

export const getBiometricDisplayName = (biometryType: string | null): string => {
  switch (biometryType) {
    case "fingerprint":
      return "Fingerprint"
    case "face":
      return "Face ID"
    case "iris":
      return "Iris"
    default:
      return "Biometric"
  }
}

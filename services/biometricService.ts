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

    let biometryType = null
    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      biometryType = "fingerprint"
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      biometryType = "face"
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      biometryType = "iris"
    }

    return {
      isAvailable: hasHardware && isEnrolled,
      biometryType,
      hasHardware,
      isEnrolled,
    }
  } catch (error) {
    console.error("Error checking biometric capabilities:", error)
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
    const hasHardware = await LocalAuthentication.hasHardwareAsync()
    const isEnrolled = await LocalAuthentication.isEnrolledAsync()

    console.log("Biometric hardware available:", hasHardware)
    console.log("Biometric credentials enrolled:", isEnrolled)

    if (!hasHardware) {
      return {
        success: false,
        error: "No biometric hardware available on this device",
      }
    }

    if (!isEnrolled) {
      return {
        success: false,
        error: "No biometric credentials enrolled. Please set up biometric authentication in your device settings.",
      }
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Authenticate to access your account",
      cancelLabel: "Use PIN instead",
      disableDeviceFallback: false, // Permettre le fallback
      requireConfirmation: false,
    })

    console.log("LocalAuthentication result:", result)

    return {
      success: result.success,
      error: result.success ? undefined : result.error || "Authentication failed",
    }
  } catch (error) {
    console.error("Biometric authentication error:", error)
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

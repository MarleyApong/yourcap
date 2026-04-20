import { Loader } from "@/components/ui/loader"
import PinInput from "@/components/ui/pin-input"
import { useTheme } from "@/core/theme"
import { useTranslation } from "@/i18n"
import { Toast } from "@/lib/toast-global"
import { updateUserPin, verifyUserPin } from "@/services/userService"
import { useAuthStore } from "@/stores/authStore"
import { Feather } from "@expo/vector-icons"
import React, { useEffect, useState } from "react"
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"

interface ChangePinModalProps {
  visible: boolean
  onClose: () => void
}

export const ChangePinModal: React.FC<ChangePinModalProps> = ({ visible, onClose }) => {
  const { user } = useAuthStore()
  const { colors } = useTheme()
  const { t } = useTranslation()

  const [step, setStep] = useState(1)
  const [currentPin, setCurrentPin] = useState("")
  const [newPin, setNewPin] = useState("")
  const [loading, setLoading] = useState(false)
  const [resetKey, setResetKey] = useState(0)

  useEffect(() => {
    if (visible) {
      setStep(1)
      setCurrentPin("")
      setNewPin("")
      setResetKey((prev) => prev + 1)
    }
  }, [visible])

  const verifyCurrentPin = async (pin: string): Promise<boolean> => {
    if (!user?.user_id) return false
    try {
      return await verifyUserPin(user.user_id, pin)
    } catch {
      return false
    }
  }

  const updatePin = async (pin: string): Promise<boolean> => {
    if (!user?.user_id) return false
    try {
      return await updateUserPin(user.user_id, pin)
    } catch {
      return false
    }
  }

  const handleCurrentPinComplete = async (pin: string) => {
    setLoading(true)
    try {
      const isValid = await verifyCurrentPin(pin)
      if (isValid) {
        setCurrentPin(pin)
        setStep(2)
        Toast.success(t("modals.changePin.currentPinVerified"))
      } else {
        Toast.error(t("modals.changePin.validation.invalidCurrentPin"))
        setResetKey((prev) => prev + 1)
      }
    } catch {
      Toast.error(t("modals.changePin.error"))
      setResetKey((prev) => prev + 1)
    } finally {
      setLoading(false)
    }
  }

  const handleNewPinComplete = (pin: string) => {
    if (pin === currentPin) {
      Toast.error(t("modals.changePin.validation.pinMustBeDifferent"))
      setResetKey((prev) => prev + 1)
      return
    }
    setNewPin(pin)
    setStep(3)
  }

  const handleConfirmPinComplete = async (pin: string) => {
    if (pin !== newPin) {
      Toast.error(t("modals.changePin.validation.pinMismatch"))
      setResetKey((prev) => prev + 1)
      return
    }
    setLoading(true)
    try {
      const success = await updatePin(pin)
      if (success) {
        Toast.success(t("modals.changePin.success"))
        onClose()
      } else {
        Toast.error(t("modals.changePin.error"))
        setStep(2)
        setNewPin("")
        setResetKey((prev) => prev + 1)
      }
    } catch {
      Toast.error(t("modals.changePin.error"))
      setStep(2)
      setNewPin("")
      setResetKey((prev) => prev + 1)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (step === 1) {
      onClose()
    } else if (step === 2) {
      setStep(1)
      setCurrentPin("")
      setResetKey((prev) => prev + 1)
    } else {
      setStep(2)
      setNewPin("")
      setResetKey((prev) => prev + 1)
    }
  }

  const handlePinComplete = (pin: string) => {
    switch (step) {
      case 1: handleCurrentPinComplete(pin); break
      case 2: handleNewPinComplete(pin); break
      case 3: handleConfirmPinComplete(pin); break
    }
  }

  const getTitle = () => {
    switch (step) {
      case 1: return t("modals.changePin.steps.current")
      case 2: return t("modals.changePin.steps.new")
      case 3: return t("modals.changePin.steps.confirm")
      default: return t("modals.changePin.title")
    }
  }

  const getSubtitle = () => {
    switch (step) {
      case 1: return t("modals.changePin.steps.currentSubtitle")
      case 2: return t("modals.changePin.steps.newSubtitle")
      case 3: return t("modals.changePin.steps.confirmSubtitle")
      default: return ""
    }
  }

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <View style={[styles.root, { backgroundColor: colors.background.primary }]}>
        <KeyboardAwareScrollView
          enableOnAndroid
          extraScrollHeight={Platform.OS === "ios" ? 60 : 80}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Pressable onPress={handleBack} style={styles.backBtn}>
              <Feather name="chevron-left" size={24} color={colors.foreground.primary} />
            </Pressable>
            <Text style={[styles.headerTitle, { color: colors.foreground.primary }]}>
              {t("modals.changePin.title")}
            </Text>
            <View style={styles.spacer} />
          </View>

          {/* Progress */}
          <View style={styles.progress}>
            <View style={styles.progressRow}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={styles.stepWrapper}>
                  <View
                    style={[
                      styles.stepCircle,
                      {
                        backgroundColor: step >= i ? colors.primary.default : colors.muted.default,
                        borderColor: step >= i ? colors.primary.default : "transparent",
                        borderWidth: step >= i ? 2 : 0,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepNum,
                        { color: step >= i ? colors.primary.foreground : colors.muted.foreground },
                      ]}
                    >
                      {i}
                    </Text>
                  </View>
                  {i < 3 && (
                    <View
                      style={[
                        styles.stepLine,
                        { backgroundColor: step > i ? colors.primary.default : colors.muted.default },
                      ]}
                    />
                  )}
                </View>
              ))}
            </View>
            <View style={styles.stepLabels}>
              {[
                t("modals.changePin.steps.current"),
                t("modals.changePin.steps.new"),
                t("modals.changePin.steps.confirm"),
              ].map((label, i) => (
                <Text
                  key={i}
                  style={[
                    styles.stepLabel,
                    { color: step >= i + 1 ? colors.foreground.primary : colors.muted.foreground },
                  ]}
                >
                  {label}
                </Text>
              ))}
            </View>
          </View>

          {/* PIN Input */}
          <View style={styles.pinWrapper}>
            <PinInput
              key={`pin-${step}-${resetKey}`}
              title={getTitle()}
              subtitle={getSubtitle()}
              onComplete={handlePinComplete}
              showBiometric={false}
              length={6}
            />
          </View>

          {/* Loading Overlay */}
          {loading && (
            <View style={styles.overlay}>
              <View style={[styles.loadingCard, { backgroundColor: colors.primary.default }]}>
                <Loader color={colors.primary.foreground} />
                <Text style={[styles.loadingText, { color: colors.primary.foreground }]}>
                  {step === 1
                    ? t("modals.changePin.verifying")
                    : step === 3
                    ? t("modals.changePin.updating")
                    : t("modals.changePin.processing")}
                </Text>
              </View>
            </View>
          )}
        </KeyboardAwareScrollView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    paddingTop: 56,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  spacer: {
    width: 32,
  },
  progress: {
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  stepWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNum: {
    fontSize: 14,
    fontWeight: "700",
  },
  stepLine: {
    width: 32,
    height: 2,
    marginHorizontal: 8,
  },
  stepLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingHorizontal: 4,
  },
  stepLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  pinWrapper: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingCard: {
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
  },
})

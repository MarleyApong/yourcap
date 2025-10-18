import { Loader } from '@/components/ui/loader'
import PinInput from '@/components/ui/pin-input'
import { useTranslation } from '@/i18n'
import { Toast } from '@/lib/toast-global'
import { useTwColors } from '@/lib/tw-colors'
import { updateUserPin, verifyUserPin } from '@/services/userService'
import { useAuthStore } from '@/stores/authStore'
import { Feather } from '@expo/vector-icons'
import React, { useEffect, useState } from 'react'
import { Modal, Platform, Pressable, Text, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

interface ChangePinModalProps {
  visible: boolean
  onClose: () => void
}

export const ChangePinModal: React.FC<ChangePinModalProps> = ({ visible, onClose }) => {
  const { user } = useAuthStore()
  const { twColor } = useTwColors()
  const { t } = useTranslation()
  
  // State
  const [step, setStep] = useState(1) // 1: Current PIN, 2: New PIN, 3: Confirm PIN
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetKey, setResetKey] = useState(0)

  // Reset modal state when it opens/closes
  useEffect(() => {
    if (visible) {
      setStep(1)
      setCurrentPin('')
      setNewPin('')
      setConfirmPin('')
      setResetKey(prev => prev + 1)
    }
  }, [visible])

  const verifyCurrentPin = async (pin: string): Promise<boolean> => {
    if (!user?.user_id) return false
    
    try {
      return await verifyUserPin(user.user_id, pin)
    } catch (error) {
      console.error("PIN verification error:", error)
      return false
    }
  }

  const updatePin = async (newPin: string): Promise<boolean> => {
    if (!user?.user_id) return false
    
    try {
      return await updateUserPin(user.user_id, newPin)
    } catch (error) {
      console.error("PIN update error:", error)
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
        Toast.success("PIN actuel vérifié")
      } else {
        Toast.error(t("modals.changePin.validation.invalidCurrentPin"))
        setResetKey(prev => prev + 1)
      }
    } catch (error) {
      console.error("Current PIN verification error:", error)
      Toast.error(t("modals.changePin.error"))
      setResetKey(prev => prev + 1)
    } finally {
      setLoading(false)
    }
  }

  const handleNewPinComplete = (pin: string) => {
    if (pin === currentPin) {
      Toast.error(t("modals.changePin.validation.pinMustBeDifferent"))
      setResetKey(prev => prev + 1)
      return
    }
    
    setNewPin(pin)
    setStep(3)
  }

  const handleConfirmPinComplete = async (pin: string) => {
    if (pin !== newPin) {
      Toast.error(t("modals.changePin.validation.pinMismatch"))
      setConfirmPin('')
      setResetKey(prev => prev + 1)
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
        setNewPin('')
        setConfirmPin('')
        setResetKey(prev => prev + 1)
      }
    } catch (error) {
      console.error("PIN update error:", error)
      Toast.error(t("modals.changePin.error"))
      setStep(2)
      setNewPin('')
      setConfirmPin('')
      setResetKey(prev => prev + 1)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (step === 1) {
      onClose()
    } else if (step === 2) {
      setStep(1)
      setCurrentPin('')
      setResetKey(prev => prev + 1)
    } else if (step === 3) {
      setStep(2)
      setNewPin('')
      setResetKey(prev => prev + 1)
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

  const handlePinComplete = (pin: string) => {
    switch (step) {
      case 1:
        handleCurrentPinComplete(pin)
        break
      case 2:
        handleNewPinComplete(pin)
        break
      case 3:
        handleConfirmPinComplete(pin)
        break
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
      <View style={{ backgroundColor: twColor("background") }} className="flex-1">
        <KeyboardAwareScrollView
          enableOnAndroid
          extraScrollHeight={Platform.OS === "ios" ? 60 : 80}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {/* Header */}
          <View className="px-6 pb-4 pt-14 border-b" style={{ borderBottomColor: twColor("border") }}>
            <View className="flex-row items-center justify-between">
              <Pressable onPress={handleBack} className="p-2">
                <Feather name="chevron-left" size={24} color={twColor("foreground")} />
              </Pressable>
              <Text style={{ color: twColor("foreground") }} className="text-xl font-bold">
                {t("modals.changePin.title")}
              </Text>
              <View className="w-8" />
            </View>
          </View>

          {/* Progress Indicator */}
          <View className="px-8 py-6">
            <View className="flex-row items-center justify-center gap-2">
              {[1, 2, 3].map((i) => (
                <View key={i} className="flex-row items-center">
                  <View 
                    className={`w-8 h-8 rounded-full items-center justify-center ${
                      step >= i ? 'border-2' : ''
                    }`}
                    style={{ 
                      backgroundColor: step >= i ? twColor("primary") : twColor("muted"),
                      borderColor: step >= i ? twColor("primary") : 'transparent'
                    }}
                  >
                    <Text 
                      style={{ color: step >= i ? twColor("primary-foreground") : twColor("muted-foreground") }}
                      className="text-sm font-bold"
                    >
                      {i}
                    </Text>
                  </View>
                  {i < 3 && (
                    <View 
                      className="w-8 h-0.5 mx-2"
                      style={{ backgroundColor: step > i ? twColor("primary") : twColor("muted") }}
                    />
                  )}
                </View>
              ))}
            </View>
            <View className="flex-row justify-between mt-3 px-1">
              <Text 
                style={{ color: step >= 1 ? twColor("foreground") : twColor("muted-foreground") }}
                className="text-xs text-center"
              >
                {t("modals.changePin.steps.current")}
              </Text>
              <Text 
                style={{ color: step >= 2 ? twColor("foreground") : twColor("muted-foreground") }}
                className="text-xs text-center"
              >
                {t("modals.changePin.steps.new")}
              </Text>
              <Text 
                style={{ color: step >= 3 ? twColor("foreground") : twColor("muted-foreground") }}
                className="text-xs text-center"
              >
                {t("modals.changePin.steps.confirm")}
              </Text>
            </View>
          </View>

          {/* PIN Input Content */}
          <View className="flex-1">
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
            <View className="absolute inset-0 bg-black/30 flex-1 justify-center items-center">
              <View 
                style={{ backgroundColor: twColor("primary") }}
                className="rounded-xl p-6 items-center"
              >
                <Loader />
                <Text style={{ color: twColor("primary-foreground") }} className="mt-4">
                  {step === 1 ? t("modals.changePin.verifying") : step === 3 ? t("modals.changePin.updating") : t("modals.changePin.processing")}
                </Text>
              </View>
            </View>
          )}
        </KeyboardAwareScrollView>
      </View>
    </Modal>
  )
}
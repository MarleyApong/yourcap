import React, { useEffect, useState } from 'react'
import { View, Text, Modal } from 'react-native'
import PinInput from '@/components/ui/pin-input'
import { useAuthStore } from '@/stores/authStore'
import { isAppLocked } from '@/lib/auth'

export default function AppLockScreen() {
  const { user, loginWithBiometric, login, biometricCapabilities, checkBiometricCapabilities } = useAuthStore()
  const [showLock, setShowLock] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkLockStatus = async () => {
      if (!user) return
      
      const locked = await isAppLocked()
      setShowLock(locked)
      
      if (locked) {
        await checkBiometricCapabilities()
      }
    }

    checkLockStatus()
  }, [user])

  const handlePinComplete = async (pin: string) => {
    if (!user) return
    
    setLoading(true)
    try {
      const identifier = user.email || user.phone_number
      const success = await login({ identifier, pin })
      
      if (success) {
        setShowLock(false)
      }
    } catch (error) {
      console.error('Pin verification failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBiometric = async () => {
    setLoading(true)
    try {
      const success = await loginWithBiometric()
      if (success) {
        setShowLock(false)
      }
    } catch (error) {
      console.error('Biometric verification failed:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!showLock || !user) return null

  return (
    <Modal
      visible={showLock}
      animationType="fade"
      presentationStyle="fullScreen"
    >
      <View className="flex-1 bg-primary-50">
        <View className="pt-16 px-8 mb-8">
          <Text className="text-2xl font-bold text-center text-primary">
            Welcome back
          </Text>
          <Text className="text-lg text-center text-gray-600 mt-2">
            {user.full_name}
          </Text>
        </View>
        
        <PinInput
          title="Verify Identity"
          subtitle="Enter your PIN or use biometric to continue"
          onComplete={handlePinComplete}
          onBiometric={handleBiometric}
          biometricAvailable={biometricCapabilities?.isAvailable && user.biometric_enabled}
          showBiometric={user.biometric_enabled}
          // loading={loading}
        />
      </View>
    </Modal>
  )
}
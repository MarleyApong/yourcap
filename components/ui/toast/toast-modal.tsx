import { useTwColors } from '@/lib/tw-colors'
import { Feather } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import React, { useEffect, useRef } from 'react'
import {
    Animated,
    Dimensions,
    Modal,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native'

interface ToastModalProps {
  visible: boolean
  title?: string
  message: string
  type: 'info' | 'success' | 'error' | 'warning' | 'confirm'
  position: 'center' | 'top' | 'bottom'
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
  onClose: () => void
}

const { height: screenHeight } = Dimensions.get('window')

export const ToastModal: React.FC<ToastModalProps> = ({
  visible,
  title,
  message,
  type,
  position,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  onClose
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const { twColor } = useTwColors()

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible])

  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return { name: 'check-circle' as const, color: twColor('text-success') }
      case 'error':
        return { name: 'x-circle' as const, color: twColor('text-destructive') }
      case 'warning':
        return { name: 'toast-triangle' as const, color: twColor('text-warning') }
      case 'confirm':
        return { name: 'help-circle' as const, color: twColor('text-primary') }
      default:
        return { name: 'info' as const, color: twColor('text-primary') }
    }
  }

  const getPositionStyle = () => {
    const baseTransform = []
    
    switch (position) {
      case 'top':
        baseTransform.push({
          translateY: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-screenHeight * 0.5, 0],
          })
        })
        return {
          justifyContent: 'flex-start' as const,
          paddingTop: 100,
          transform: baseTransform
        }
      case 'bottom':
        baseTransform.push({
          translateY: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [screenHeight * 0.5, 0],
          })
        })
        return {
          justifyContent: 'flex-end' as const,
          paddingBottom: 100,
          transform: baseTransform
        }
      default:
        baseTransform.push({
          scale: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1],
          })
        })
        return {
          justifyContent: 'center' as const,
          transform: baseTransform
        }
    }
  }

  const handleConfirm = () => {
    onConfirm?.()
    onClose()
  }

  const handleCancel = () => {
    onCancel?.()
    onClose()
  }

  const handleBackdropPress = () => {
    if (type !== 'confirm') {
      onClose()
    }
  }

  const iconConfig = getIconConfig()
  const positionStyle = getPositionStyle()

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="none"
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View className="flex-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <Animated.View
            className="flex-1 px-6"
            style={{
              ...positionStyle,
              opacity: opacityAnim,
            }}
          >
            <TouchableWithoutFeedback>
              <Animated.View
                style={{
                  transform: positionStyle.transform,
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 8,
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 24,
                  elevation: 12,
                }}
              >
                <BlurView 
                  intensity={75} 
                  tint="systemMaterial"
                  className="rounded-md overflow-hidden"
                >
                  <View className="p-6 items-center borde border-border rounded-md" style={{ backgroundColor: twColor('bg-background') }}>
                    {/* Icon */}
                    <View className="mb-4">
                      <Feather 
                        name={iconConfig.name as any} 
                        size={48} 
                        color={iconConfig.color} 
                      />
                    </View>

                    {/* Title */}
                    {title && (
                      <Text className="text-xl font-bold mb-2 text-center" style={{ color: twColor('text-card-foreground') }}>
                        {title}
                      </Text>
                    )}

                    {/* Message */}
                    <Text className="text-base text-muted-foreground text-center mb-6 leading-6">
                      {message}
                    </Text>

                    {/* Buttons */}
                    {type === 'confirm' ? (
                      <View className="flex-row gap-3 w-full">
                        <TouchableOpacity
                          onPress={handleCancel}
                          className="flex-1 bg-secondary border border-border py-3 px-4 rounded-xl"
                        >
                          <Text className="text-center font-semibold text-secondary-foreground">
                            {cancelText}
                          </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          onPress={handleConfirm}
                          className="flex-1 bg-primary py-3 px-4 rounded-xl"
                        >
                          <Text className="text-center font-semibold text-primary-foreground">
                            {confirmText}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={onClose}
                        className="bg-primary py-3 px-8 rounded-xl min-w-24"
                      >
                        <Text className="text-center font-semibold text-primary-foreground">
                          OK
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </BlurView>
              </Animated.View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}
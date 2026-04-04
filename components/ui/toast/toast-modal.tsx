import { useTheme } from "@/core/theme"
import { Feather } from "@expo/vector-icons"
import { BlurView } from "expo-blur"
import React, { useEffect, useRef } from "react"
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native"

interface ToastModalProps {
  visible: boolean
  title?: string
  message: string
  type: "info" | "success" | "error" | "warning" | "confirm"
  position: "center" | "top" | "bottom"
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
  onClose: () => void
}

const { height: screenHeight } = Dimensions.get("window")

export const ToastModal: React.FC<ToastModalProps> = ({
  visible,
  title,
  message,
  type,
  position,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  onClose,
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const { colors } = useTheme()

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start()
    }
  }, [visible])

  const getIconConfig = () => {
    switch (type) {
      case "success":
        return { name: "check-circle" as const, color: colors.status.success }
      case "error":
        return { name: "x-circle" as const, color: colors.status.destructive }
      case "warning":
        return { name: "alert-triangle" as const, color: colors.status.warning }
      case "confirm":
        return { name: "help-circle" as const, color: colors.primary.default }
      default:
        return { name: "info" as const, color: colors.primary.default }
    }
  }

  const getPositionStyle = () => {
    switch (position) {
      case "top":
        return {
          justifyContent: "flex-start" as const,
          paddingTop: 100,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-screenHeight * 0.5, 0],
              }),
            },
          ],
        }
      case "bottom":
        return {
          justifyContent: "flex-end" as const,
          paddingBottom: 100,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [screenHeight * 0.5, 0],
              }),
            },
          ],
        }
      default:
        return {
          justifyContent: "center" as const,
          transform: [
            {
              scale: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
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

  const iconConfig = getIconConfig()
  const positionStyle = getPositionStyle()

  return (
    <Modal visible={visible} transparent statusBarTranslucent animationType="none">
      <TouchableWithoutFeedback onPress={() => type !== "confirm" && onClose()}>
        <View style={styles.backdrop}>
          <Animated.View style={[styles.positionWrapper, positionStyle, { opacity: opacityAnim }]}>
            <TouchableWithoutFeedback>
              <Animated.View style={[styles.shadow, { transform: positionStyle.transform }]}>
                <BlurView intensity={75} tint="systemMaterial" style={styles.blur}>
                  <View style={[styles.card, { backgroundColor: colors.background.primary }]}>
                    <View style={styles.iconWrapper}>
                      <Feather name={iconConfig.name as any} size={48} color={iconConfig.color} />
                    </View>

                    {title && (
                      <Text style={[styles.titleText, { color: colors.card.foreground }]}>
                        {title}
                      </Text>
                    )}

                    <Text style={[styles.message, { color: colors.muted.foreground }]}>
                      {message}
                    </Text>

                    {type === "confirm" ? (
                      <View style={styles.buttonRow}>
                        <TouchableOpacity
                          onPress={handleCancel}
                          style={[
                            styles.cancelBtn,
                            {
                              backgroundColor: colors.secondary.default,
                              borderColor: colors.border,
                            },
                          ]}
                        >
                          <Text style={[styles.btnText, { color: colors.secondary.foreground }]}>
                            {cancelText}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={handleConfirm}
                          style={[styles.confirmBtn, { backgroundColor: colors.primary.default }]}
                        >
                          <Text style={[styles.btnText, { color: colors.primary.foreground }]}>
                            {confirmText}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={onClose}
                        style={[styles.okBtn, { backgroundColor: colors.primary.default }]}
                      >
                        <Text style={[styles.btnText, { color: colors.primary.foreground }]}>OK</Text>
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

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  positionWrapper: {
    flex: 1,
    paddingHorizontal: 24,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  blur: {
    borderRadius: 8,
    overflow: "hidden",
  },
  card: {
    padding: 24,
    alignItems: "center",
    borderRadius: 8,
  },
  iconWrapper: {
    marginBottom: 16,
  },
  titleText: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  okBtn: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 96,
  },
  btnText: {
    textAlign: "center",
    fontWeight: "600",
  },
})

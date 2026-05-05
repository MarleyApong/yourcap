import { useTheme } from "@/core/theme"
import { Feather, MaterialIcons } from "@expo/vector-icons"
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, Vibration, View } from "react-native"

export interface PinInputHandle {
  reset: () => void
  shake: () => void
}

interface PinInputProps {
  onComplete: (pin: string) => void
  onBiometric?: () => void
  biometricAvailable?: boolean
  title?: string
  subtitle?: string
  showBiometric?: boolean
  length?: number
  shuffle?: boolean
  onForgotPin?: () => void
  forgotPinLabel?: string
}

const PinInput = forwardRef<PinInputHandle, PinInputProps>(({
  onComplete,
  onBiometric,
  biometricAvailable = false,
  title = "Enter PIN",
  subtitle = "Enter your PIN",
  showBiometric = true,
  length = 6,
  shuffle = false,
  onForgotPin,
  forgotPinLabel,
}, ref) => {
  const [pin, setPin] = useState("")
  const { colors } = useTheme()
  const shakeAnim = useRef(new Animated.Value(0)).current
  const pulseScale = useRef(new Animated.Value(1)).current
  const pulseOpacity = useRef(new Animated.Value(0.5)).current

  // Défini tôt pour être utilisé dans useEffect
  const hasBiometric = showBiometric && biometricAvailable && !!onBiometric

  useImperativeHandle(ref, () => ({
    reset: () => setPin(""),
    shake: () => {
      Vibration.vibrate([0, 60, 60, 60, 60, 60])
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
      ]).start()
    },
  }))

  // Pulse loop sur le bouton biométrie
  useEffect(() => {
    if (!hasBiometric) return
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseScale, { toValue: 1.55, duration: 900, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0, duration: 900, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(pulseScale, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0.5, duration: 0, useNativeDriver: true }),
        ]),
        Animated.delay(400),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [hasBiometric])

  const digits = useMemo(() => {
    const base = Array.from({ length: 10 }, (_, i) => i.toString())
    if (!shuffle) return base
    return [...base].sort(() => Math.random() - 0.5)
  }, [shuffle])

  const keys = shuffle
    ? [
        digits.slice(0, 3),
        digits.slice(3, 6),
        digits.slice(6, 9),
        [hasBiometric ? "biometric" : "clear", digits[9], "delete"],
      ]
    : [
        ["1", "2", "3"],
        ["4", "5", "6"],
        ["7", "8", "9"],
        [hasBiometric ? "biometric" : "clear", "0", "delete"],
      ]

  const handleKeyPress = (key: string) => {
    if (pin.length < length) {
      Vibration.vibrate(30)
      const newPin = pin + key
      setPin(newPin)
      if (newPin.length === length) {
        setTimeout(() => onComplete(newPin), 100)
      }
    }
  }

  const handleDelete = () => {
    Vibration.vibrate(20)
    setPin(prev => prev.slice(0, -1))
  }

  const handleClear = () => {
    Vibration.vibrate(20)
    setPin("")
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <Text style={[styles.title, { color: colors.foreground.primary }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.muted.foreground }]}>{subtitle}</Text>

      {/* Dots avec shake */}
      <Animated.View style={[styles.dots, { transform: [{ translateX: shakeAnim }] }]}>
        {Array.from({ length }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index < pin.length ? colors.primary.default : "transparent",
                borderColor: index < pin.length ? colors.primary.default : colors.border,
              },
            ]}
          />
        ))}
      </Animated.View>

      <View style={styles.keypad}>
        {keys.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((key) => (
              <TouchableOpacity
                key={key}
                onPress={() => {
                  if (key === "delete") handleDelete()
                  else if (key === "clear") handleClear()
                  else if (key === "biometric") onBiometric?.()
                  else handleKeyPress(key)
                }}
                style={[
                  styles.key,
                  key === "delete"
                    ? { backgroundColor: colors.primary.default }
                    : key === "biometric"
                    ? { backgroundColor: colors.primary.default + "18", borderWidth: 1.5, borderColor: colors.primary.default + "50" }
                    : key === "clear"
                    ? { backgroundColor: "transparent", borderWidth: 1.5, borderColor: colors.border }
                    : { backgroundColor: colors.card.background, borderWidth: 1.5, borderColor: colors.border },
                ]}
                activeOpacity={0.65}
              >
                {key === "delete" ? (
                  <Feather name="delete" size={22} color={colors.primary.foreground} />
                ) : key === "biometric" ? (
                  <>
                    {/* Cercle pulse derrière l'icône */}
                    <Animated.View style={[
                      styles.pulse,
                      {
                        backgroundColor: colors.primary.default,
                        opacity: pulseOpacity,
                        transform: [{ scale: pulseScale }],
                      }
                    ]} />
                    <MaterialIcons name="fingerprint" size={28} color={colors.primary.default} />
                  </>
                ) : key === "clear" ? (
                  <Feather name="x" size={20} color={colors.muted.foreground} />
                ) : (
                  <Text style={[styles.keyNumber, { color: colors.foreground.primary }]}>{key}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {onForgotPin && (
        <TouchableOpacity onPress={onForgotPin} activeOpacity={0.7} style={styles.forgotPin}>
          <Text style={[styles.forgotPinText, { color: colors.muted.foreground }]}>{forgotPinLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
})

PinInput.displayName = "PinInput"

export default PinInput

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 32,
    textAlign: "center",
  },
  dots: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 40,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  keypad: {
    gap: 14,
    marginBottom: 28,
  },
  row: {
    flexDirection: "row",
    gap: 14,
  },
  key: {
    width: 78,
    height: 78,
    borderRadius: 39,
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
  },
  pulse: {
    position: "absolute",
    width: 78,
    height: 78,
    borderRadius: 39,
  },
  keyNumber: {
    fontSize: 24,
    fontWeight: "600",
  },
  forgotPin: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  forgotPinText: {
    fontSize: 14,
  },
})

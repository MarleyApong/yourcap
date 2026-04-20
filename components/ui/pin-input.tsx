import { useTheme } from "@/core/theme"
import { Feather, MaterialIcons } from "@expo/vector-icons"
import React, { useState, useMemo } from "react"
import { StyleSheet, Text, TouchableOpacity, Vibration, View } from "react-native"

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

export const PinInput: React.FC<PinInputProps> = ({
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
}) => {
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const { colors } = useTheme()

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
        ["clear", digits[9], "delete"],
      ]
    : [
        ["1", "2", "3"],
        ["4", "5", "6"],
        ["7", "8", "9"],
        ["clear", "0", "delete"],
      ]

  const handleKeyPress = (key: string) => {
    if (pin.length < length) {
      Vibration.vibrate(30)
      const newPin = pin + key
      setPin(newPin)
      setError("")
      if (newPin.length === length) {
        setTimeout(() => onComplete(newPin), 100)
      }
    }
  }

  const handleDelete = () => {
    Vibration.vibrate(20)
    setPin(pin.slice(0, -1))
    setError("")
  }

  const handleClear = () => {
    Vibration.vibrate(20)
    setPin("")
    setError("")
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <Text style={[styles.title, { color: colors.foreground.primary }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.muted.foreground }]}>{subtitle}</Text>

      <View style={styles.dots}>
        {Array.from({ length }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index < pin.length ? colors.primary.default : "transparent",
                borderColor: error
                  ? colors.status.destructive
                  : index < pin.length
                  ? colors.primary.default
                  : colors.border,
              },
            ]}
          />
        ))}
      </View>

      {error ? (
        <Text style={[styles.error, { color: colors.status.destructive }]}>{error}</Text>
      ) : null}

      <View style={styles.keypad}>
        {keys.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((key) => (
              <TouchableOpacity
                key={key}
                onPress={() => {
                  if (key === "delete") handleDelete()
                  else if (key === "clear") handleClear()
                  else handleKeyPress(key)
                }}
                style={[
                  styles.key,
                  key === "delete"
                    ? { backgroundColor: colors.primary.default }
                    : key === "clear"
                    ? { backgroundColor: "transparent", borderWidth: 1.5, borderColor: colors.border }
                    : { backgroundColor: colors.card.background, borderWidth: 1.5, borderColor: colors.border },
                ]}
                activeOpacity={0.65}
              >
                {key === "delete" ? (
                  <Feather name="delete" size={22} color={colors.primary.foreground} />
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

      {showBiometric && biometricAvailable && onBiometric && (
        <TouchableOpacity
          onPress={onBiometric}
          style={[styles.biometric, { backgroundColor: colors.primary.default + "18", borderColor: colors.primary.default + "40", borderWidth: 1 }]}
          activeOpacity={0.7}
        >
          <MaterialIcons name="fingerprint" size={22} color={colors.primary.default} />
          <Text style={[styles.biometricText, { color: colors.primary.default }]}>Use Biometric</Text>
        </TouchableOpacity>
      )}

      {onForgotPin && (
        <TouchableOpacity onPress={onForgotPin} activeOpacity={0.7} style={styles.forgotPin}>
          <Text style={[styles.forgotPinText, { color: colors.muted.foreground }]}>{forgotPinLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

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
  error: {
    textAlign: "center",
    marginBottom: 16,
    fontSize: 14,
    fontWeight: "500",
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
  },
  keyNumber: {
    fontSize: 24,
    fontWeight: "600",
  },
  biometric: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  biometricText: {
    fontWeight: "600",
    fontSize: 14,
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

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
}

export const PinInput: React.FC<PinInputProps> = ({
  onComplete,
  onBiometric,
  biometricAvailable = false,
  title = "Enter PIN",
  subtitle = "Enter your PIN",
  showBiometric = true,
  length = 6,
}) => {
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const { colors } = useTheme()

  const shuffledDigits = useMemo(() => {
    const digits = Array.from({ length: 10 }, (_, i) => i.toString())
    return digits.sort(() => Math.random() - 0.5)
  }, [])

  const keys = [
    shuffledDigits.slice(0, 3),
    shuffledDigits.slice(3, 6),
    shuffledDigits.slice(6, 9),
    ["clear", shuffledDigits[9], "delete"],
  ]

  const handleKeyPress = (key: string) => {
    if (pin.length < length) {
      const newPin = pin + key
      setPin(newPin)
      setError("")
      if (newPin.length === length) {
        setTimeout(() => onComplete(newPin), 100)
      }
    }
  }

  const handleDelete = () => {
    setPin(pin.slice(0, -1))
    setError("")
  }

  const handleClear = () => {
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
                  {
                    backgroundColor:
                      key === "delete" ? colors.primary.default : colors.accent.default,
                  },
                ]}
                activeOpacity={0.7}
              >
                {key === "delete" ? (
                  <Feather name="delete" size={24} color="#ffffff" />
                ) : key === "clear" ? (
                  <Text style={[styles.keyText, { color: colors.foreground.primary }]}>Clear</Text>
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
          style={[styles.biometric, { backgroundColor: colors.primary.default + "1a" }]}
          activeOpacity={0.7}
        >
          <MaterialIcons name="fingerprint" size={24} color={colors.primary.default} />
          <Text style={[styles.biometricText, { color: colors.primary.default }]}>Use Biometric</Text>
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
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 32,
  },
  dots: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 48,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  error: {
    textAlign: "center",
    marginBottom: 16,
    fontSize: 18,
    fontWeight: "500",
  },
  keypad: {
    gap: 16,
    marginBottom: 32,
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },
  key: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  keyText: {
    fontWeight: "500",
  },
  keyNumber: {
    fontSize: 24,
    fontWeight: "600",
  },
  biometric: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 16,
    borderRadius: 12,
  },
  biometricText: {
    fontWeight: "500",
  },
})

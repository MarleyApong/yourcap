import { useTwColors } from "@/lib/tw-colors"
import { Feather, MaterialIcons } from "@expo/vector-icons"
import React, { useState, useMemo } from "react"
import { Text, TouchableOpacity, Vibration, View } from "react-native"

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
  const { twColor } = useTwColors()

  const shuffledDigits = useMemo(() => {
    const digits = Array.from({ length: 10 }, (_, i) => i.toString())
    return digits.sort(() => Math.random() - 0.5)
  }, [])

  const keys = [shuffledDigits.slice(0, 3), shuffledDigits.slice(3, 6), shuffledDigits.slice(6, 9), ["clear", shuffledDigits[9], "delete"]]

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

  const showError = (message: string) => {
    setError(message)
    Vibration.vibrate(500)
    setTimeout(() => {
      setError("")
      setPin("")
    }, 1500)
  }

  return (
    <View className="flex-1 justify-center items-center px-8" style={{ backgroundColor: twColor("background") }}>
      <Text className="text-3xl font-bold mb-2" style={{ color: twColor("text-foreground") }}>
        {title}
      </Text>
      <Text className="text-lg text-muted-foreground mb-8">{subtitle}</Text>

      <View className="flex-row gap-4 mb-12">
        {Array.from({ length }).map((_, index) => (
          <View key={index} className={`w-4 h-4 rounded-full border-2 ${index < pin.length ? "bg-primary border-primary" : error ? "border-destructive" : "border-border"}`} />
        ))}
      </View>

      {error && <Text className="text-destructive text-center mb-4 text-lg font-medium">{error}</Text>}

      <View className="gap-4 mb-8">
        {keys.map((row, rowIndex) => (
          <View key={rowIndex} className="flex-row gap-4">
            {row.map((key) => (
              <TouchableOpacity
                key={key}
                onPress={() => {
                  if (key === "delete") handleDelete()
                  else if (key === "clear") handleClear()
                  else handleKeyPress(key)
                }}
                className={`w-20 h-20 rounded-full ${key === "delete" ? "bg-primary" : "bg-accent"} justify-center items-center`}
                activeOpacity={0.7}
              >
                {key === "delete" ? (
                  <Feather name="delete" size={24} color={twColor("white")} />
                ) : key === "clear" ? (
                  <Text className="text-foreground font-medium">Clear</Text>
                ) : (
                  <Text className="text-2xl font-semibold text-foreground">{key}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {showBiometric && biometricAvailable && onBiometric && (
        <TouchableOpacity onPress={onBiometric} className="flex-row items-center gap-2 p-4 bg-primary/10 rounded-xl" activeOpacity={0.7}>
          <MaterialIcons name="fingerprint" size={24} color={twColor("primary")} />
          <Text className="text-primary font-medium">Use Biometric</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

export default PinInput

import { Loader } from '@/components/ui/loader'
import { useTwColors } from '@/lib/tw-colors'
import { useAuthStore } from '@/stores/authStore'
import { Feather } from '@expo/vector-icons'
import React, { useRef, useState } from 'react'
import { Modal, Platform, Pressable, Text, TextInput, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

interface EditProfileModalProps {
  visible: boolean
  onClose: () => void
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ visible, onClose }) => {
  const { user, updateProfile } = useAuthStore()
  const { twColor } = useTwColors()
  
  // Refs
  const phoneRef = useRef<TextInput>(null)
  const emailRef = useRef<TextInput>(null)

  // State
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = (): boolean => {
    if (!formData.full_name.trim()) {
      Toast.error("Le nom complet est requis")
      return false
    }

    if (!formData.phone_number.trim()) {
      Toast.error("Le numéro de téléphone est requis")
      return false
    }

    if (!/^(6|2)(2|3|[5-9])[0-9]{7}$/.test(formData.phone_number)) {
      Toast.error("Veuillez entrer un numéro de téléphone camerounais valide")
      return false
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      Toast.error("Veuillez entrer une adresse email valide")
      return false
    }

    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const success = await updateProfile({
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone_number: formData.phone_number.trim()
      })

      if (success) {
        Toast.success("Profil mis à jour avec succès!")
        onClose()
      } else {
        Toast.error("Erreur lors de la mise à jour du profil")
      }
    } catch (error) {
      console.error("Update profile error:", error)
      Toast.error("Une erreur inattendue s'est produite")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone_number: user?.phone_number || ''
    })
    onClose()
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
              <Pressable onPress={handleCancel} className="p-2">
                <Feather name="x" size={24} color={twColor("foreground")} />
              </Pressable>
              <Text style={{ color: twColor("foreground") }} className="text-xl font-bold">
                Modifier le Profil
              </Text>
              <View className="w-8" />
            </View>
          </View>

          {/* Content */}
          <View className="flex-1 px-8 py-8">
            {/* Profile Icon */}
            <View className="items-center mb-8">
              <View
                style={{ backgroundColor: twColor("primary") }}
                className="w-24 h-24 rounded-full items-center justify-center mb-4"
              >
                <Feather name="user" size={40} color={twColor("primary-foreground")} />
              </View>
              <Text style={{ color: twColor("foreground") }} className="text-2xl font-bold">
                Informations Personnelles
              </Text>
              <Text style={{ color: twColor("muted-foreground") }} className="text-base mt-2">
                Modifiez vos informations de profil
              </Text>
            </View>

            {/* Form Fields */}
            <View className="w-full flex-col gap-4">
              {/* Full Name */}
              <View className="border rounded-xl flex-row gap-2 items-center px-4 py-3" style={{ borderColor: twColor("primary") }}>
                <Feather name="user" size={24} color={twColor("primary")} />
                <TextInput
                  className="text-xl flex-1"
                  style={{ color: twColor("foreground") }}
                  placeholder="Nom complet"
                  placeholderTextColor={twColor("muted-foreground")}
                  value={formData.full_name}
                  onChangeText={(text) => handleChange('full_name', text)}
                  returnKeyType="next"
                  onSubmitEditing={() => phoneRef.current?.focus()}
                />
              </View>

              {/* Phone Number */}
              <View className="border rounded-xl flex-row gap-2 items-center px-4 py-3" style={{ borderColor: twColor("primary") }}>
                <Feather name="phone" size={24} color={twColor("primary")} />
                <TextInput
                  ref={phoneRef}
                  className="text-xl flex-1"
                  style={{ color: twColor("foreground") }}
                  placeholder="6xx xxx xxx ou 2xx xxx xxx"
                  placeholderTextColor={twColor("muted-foreground")}
                  value={formData.phone_number}
                  onChangeText={(text) => handleChange('phone_number', text)}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                />
              </View>

              {/* Email */}
              <View className="border rounded-xl flex-row gap-2 items-center px-4 py-3" style={{ borderColor: twColor("primary") }}>
                <Feather name="mail" size={24} color={twColor("primary")} />
                <TextInput
                  ref={emailRef}
                  className="text-xl flex-1"
                  style={{ color: twColor("foreground") }}
                  placeholder="Email (optionnel)"
                  placeholderTextColor={twColor("muted-foreground")}
                  value={formData.email}
                  onChangeText={(text) => handleChange('email', text)}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="done"
                  onSubmitEditing={handleSave}
                />
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="px-8 pb-8 border-t" style={{ borderTopColor: twColor("border") }}>
            <View className="flex-row gap-3 pt-6">
              <Pressable
                onPress={handleCancel}
                disabled={loading}
                className="flex-1 p-4 rounded-xl border"
                style={{ 
                  backgroundColor: twColor("card-background"),
                  borderColor: twColor("border")
                }}
              >
                <Text 
                  style={{ color: twColor("foreground") }} 
                  className="text-center font-semibold text-lg"
                >
                  Annuler
                </Text>
              </Pressable>

              <Pressable
                onPress={handleSave}
                disabled={loading}
                className={`flex-1 p-4 rounded-xl flex-row items-center justify-center ${loading ? "opacity-70" : ""}`}
                style={{ 
                  backgroundColor: twColor("primary")
                }}
              >
                {loading ? (
                  <Loader />
                ) : (
                  <>
                    <Feather name="check" size={18} color={twColor("primary-foreground")} />
                    <Text 
                      style={{ color: twColor("primary-foreground") }} 
                      className="text-center font-semibold text-lg ml-2"
                    >
                      Sauvegarder
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </View>
    </Modal>
  )
}
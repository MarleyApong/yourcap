import { Loader } from "@/components/ui/loader"
import { useTheme } from "@/core/theme"
import { useTranslation } from "@/i18n"
import { Toast } from "@/lib/toast-global"
import { useAuthStore } from "@/stores/authStore"
import { Feather } from "@expo/vector-icons"
import React, { useRef, useState } from "react"
import { Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"

interface EditProfileModalProps {
  visible: boolean
  onClose: () => void
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ visible, onClose }) => {
  const { user, updateProfile } = useAuthStore()
  const { colors } = useTheme()
  const { t } = useTranslation()

  const phoneRef = useRef<TextInput>(null)
  const emailRef = useRef<TextInput>(null)

  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone_number: user?.phone_number || "",
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = (): boolean => {
    if (!formData.full_name.trim()) {
      Toast.error(t("modals.editProfile.validation.fullNameRequired"))
      return false
    }
    if (!formData.phone_number.trim()) {
      Toast.error(t("modals.editProfile.validation.phoneRequired"))
      return false
    }
    if (!/^(6|2)(2|3|[5-9])[0-9]{7}$/.test(formData.phone_number)) {
      Toast.error(t("modals.editProfile.validation.invalidPhone"))
      return false
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      Toast.error(t("modals.editProfile.validation.invalidEmail"))
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
        phone_number: formData.phone_number.trim(),
      })
      if (success) {
        Toast.success(t("modals.editProfile.success"))
        onClose()
      } else {
        Toast.error(t("modals.editProfile.error"))
      }
    } catch {
      Toast.error(t("modals.editProfile.unexpectedError"))
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || "",
      email: user?.email || "",
      phone_number: user?.phone_number || "",
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
            <Pressable onPress={handleCancel} style={styles.closeBtn}>
              <Feather name="x" size={24} color={colors.foreground.primary} />
            </Pressable>
            <Text style={[styles.headerTitle, { color: colors.foreground.primary }]}>
              {t("modals.editProfile.title")}
            </Text>
            <View style={styles.spacer} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Avatar */}
            <View style={styles.avatarSection}>
              <View style={[styles.avatar, { backgroundColor: colors.primary.default }]}>
                <Feather name="user" size={28} color={colors.primary.foreground} />
              </View>
              <Text style={[styles.avatarTitle, { color: colors.foreground.primary }]}>
                {t("modals.editProfile.title")}
              </Text>
              <Text style={[styles.avatarSubtitle, { color: colors.muted.foreground }]}>
                {t("modals.editProfile.subtitle")}
              </Text>
            </View>

            {/* Fields */}
            <View style={styles.fields}>
              {/* Full Name */}
              <View style={[styles.field, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
                <Feather name="user" size={18} color={colors.muted.foreground} />
                <TextInput
                  style={[styles.input, { color: colors.foreground.primary }]}
                  placeholder={t("modals.editProfile.fullNamePlaceholder")}
                  placeholderTextColor={colors.muted.foreground}
                  value={formData.full_name}
                  onChangeText={(text) => handleChange("full_name", text)}
                  returnKeyType="next"
                  onSubmitEditing={() => phoneRef.current?.focus()}
                />
              </View>

              {/* Phone */}
              <View style={[styles.field, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
                <Feather name="phone" size={18} color={colors.muted.foreground} />
                <TextInput
                  ref={phoneRef}
                  style={[styles.input, { color: colors.foreground.primary }]}
                  placeholder={t("modals.editProfile.phonePlaceholder")}
                  placeholderTextColor={colors.muted.foreground}
                  value={formData.phone_number}
                  onChangeText={(text) => handleChange("phone_number", text)}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                />
              </View>

              {/* Email */}
              <View style={[styles.field, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
                <Feather name="mail" size={18} color={colors.muted.foreground} />
                <TextInput
                  ref={emailRef}
                  style={[styles.input, { color: colors.foreground.primary }]}
                  placeholder={t("modals.editProfile.emailPlaceholder")}
                  placeholderTextColor={colors.muted.foreground}
                  value={formData.email}
                  onChangeText={(text) => handleChange("email", text)}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="done"
                  onSubmitEditing={handleSave}
                />
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={[styles.actions, { borderTopColor: colors.border }]}>
            <Pressable
              onPress={handleCancel}
              disabled={loading}
              style={[styles.cancelBtn, { backgroundColor: colors.card.background, borderColor: colors.border }]}
            >
              <Text style={[styles.cancelText, { color: colors.foreground.primary }]}>
                {t("modals.editProfile.cancel")}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleSave}
              disabled={loading}
              style={[styles.saveBtn, { backgroundColor: colors.primary.default, opacity: loading ? 0.7 : 1 }]}
            >
              {loading ? (
                <Loader color={colors.primary.foreground} />
              ) : (
                <>
                  <Feather name="check" size={16} color={colors.primary.foreground} />
                  <Text style={[styles.saveText, { color: colors.primary.foreground }]}>
                    {t("modals.editProfile.save")}
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </KeyboardAwareScrollView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 14,
    paddingTop: 20,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeBtn: { padding: 8 },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  spacer: { width: 32 },
  content: { flex: 1, paddingHorizontal: 24, paddingVertical: 24 },
  avatarSection: { alignItems: "center", marginBottom: 24 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarTitle: { fontSize: 18, fontWeight: "700" },
  avatarSubtitle: { fontSize: 13, marginTop: 4 },
  fields: { gap: 14 },
  field: {
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: { fontSize: 15, flex: 1 },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    padding: 13,
    borderRadius: 12,
    borderWidth: 1,
  },
  cancelText: { textAlign: "center", fontWeight: "600", fontSize: 14 },
  saveBtn: {
    flex: 1,
    padding: 13,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  saveText: { textAlign: "center", fontWeight: "600", fontSize: 14 },
})

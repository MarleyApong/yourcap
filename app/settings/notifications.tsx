import { PageHeader } from "@/components/feature/page-header"
import { MultipleSelectionButtons, SelectionButtons } from "@/components/ui/selection-buttons"
import { useTheme } from "@/core/theme"
import { useSettings } from "@/hooks/useSettings"
import { useTranslation } from "@/i18n"
import { Toast } from "@/lib/toast-global"
import { requestNotificationPermissions, scheduleAllDebtReminders, updateNotificationSettings } from "@/services/notificationService"
import { useAuthStore } from "@/stores/authStore"
import { Feather } from "@expo/vector-icons"
import { ScrollView, StyleSheet, Switch, Text, View, Linking } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function NotificationsSettings() {
  const { colors } = useTheme()
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { settings, updateSetting } = useSettings()
  const insets = useSafeAreaInsets()

  const SwitchRow = ({ icon, title, desc, value, onChange }: { icon: string; title: string; desc?: string; value: boolean; onChange: (v: boolean) => void }) => (
    <View style={[styles.switchRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
      <View style={styles.switchLeft}>
        <View style={[styles.iconBox, { backgroundColor: colors.primary.default }]}>
          <Feather name={icon as any} size={18} color={colors.primary.foreground} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.foreground.primary }}>{title}</Text>
          {desc && <Text style={[styles.desc, { color: colors.muted.foreground }]}>{desc}</Text>}
        </View>
      </View>
      <View style={{ borderRadius: 999, borderWidth: 1.5, borderColor: value ? colors.primary.default : colors.border }}>
        <Switch value={value} onValueChange={onChange} trackColor={{ false: colors.muted.default, true: colors.primary.default }} thumbColor={colors.card.background} />
      </View>
    </View>
  )

  const Section = ({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) => (
    <View style={[styles.section, { borderTopWidth: 1, borderTopColor: colors.border }]}>
      <Text style={[styles.sectionLabel, { color: colors.foreground.primary }]}>{label}</Text>
      {desc && <Text style={[styles.desc, { color: colors.muted.foreground, marginBottom: 8 }]}>{desc}</Text>}
      {children}
    </View>
  )

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: colors.background.primary }]} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
      <PageHeader title={t("settings.notifications")} textPosition="center" textAlign="left" />

      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.card.background, borderColor: colors.border }]}>
          {/* Master toggle */}
          <View style={styles.switchRow}>
            <View style={styles.switchLeft}>
              <View style={[styles.iconBox, { backgroundColor: colors.primary.default }]}>
                <Feather name="bell" size={18} color={colors.primary.foreground} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.foreground.primary }}>{t("settings.enableNotifications")}</Text>
              </View>
            </View>
            <View style={{ borderRadius: 999, borderWidth: 1.5, borderColor: settings.notification_enabled ? colors.primary.default : colors.border }}>
              <Switch
                value={settings.notification_enabled}
                onValueChange={async (val) => {
                  if (val) {
                    const hasPermission = await requestNotificationPermissions()
                    if (!hasPermission) {
                      Toast.confirm(
                        t("settings.notificationPermissionDenied") || "Activez les notifications dans les réglages.",
                        () => Linking.openSettings(),
                        { title: t("settings.notificationPermissionTitle") || "Permission requise", confirmText: t("settings.openSettings"), cancelText: t("common.cancel") },
                      )
                      return
                    }
                    await updateSetting("notification_enabled", true)
                    if (user?.user_id) await scheduleAllDebtReminders(user.user_id)
                    Toast.success(t("settings.notificationsEnabled"))
                  } else {
                    await updateSetting("notification_enabled", false)
                    const Notifications = await import("expo-notifications")
                    await Notifications.cancelAllScheduledNotificationsAsync()
                    Toast.success(t("settings.notificationsDisabled"))
                  }
                }}
                trackColor={{ false: colors.muted.default, true: colors.primary.default }}
                thumbColor={colors.card.background}
              />
            </View>
          </View>

          {settings.notification_enabled && (
            <>
              <SwitchRow
                icon="smartphone"
                title={t("settings.systemNotifications")}
                desc={t("settings.systemNotificationsDesc")}
                value={settings.system_notifications}
                onChange={async (val) => {
                  const success = await updateSetting("system_notifications", val)
                  if (success && user?.user_id) {
                    await updateNotificationSettings(user.user_id)
                    Toast.success(val ? t("settings.systemNotificationsEnabled") : t("settings.systemNotificationsDisabled"))
                  }
                }}
              />
              <SwitchRow
                icon="mail"
                title={t("settings.emailNotifications")}
                desc={t("settings.emailNotificationsDesc")}
                value={settings.email_notifications}
                onChange={() => Toast.info(t("settings.emailComingSoon"))}
              />
              <SwitchRow
                icon="message-square"
                title={t("settings.smsNotifications")}
                desc={t("settings.smsNotificationsDesc")}
                value={settings.sms_notifications}
                onChange={() => Toast.info(t("settings.smsComingSoon"))}
              />

              <Section label={t("settings.daysBeforeReminder")}>
                <SelectionButtons
                  options={[
                    { value: 1, label: t("settings.oneDay") },
                    { value: 3, label: t("settings.threeDays") },
                    { value: 5, label: t("settings.fiveDays") },
                    { value: 7, label: t("settings.sevenDays") },
                  ]}
                  selectedValue={settings.days_before_reminder}
                  onSelect={async (days) => {
                    const success = await updateSetting("days_before_reminder", days)
                    if (success && user?.user_id) {
                      await scheduleAllDebtReminders(user.user_id)
                      Toast.success(t("settings.reminderScheduleUpdated"))
                    }
                  }}
                />
              </Section>

              <Section label={t("settings.preferredNotificationTimes")} desc={t("settings.selectMultipleTimes")}>
                <MultipleSelectionButtons
                  options={[
                    { value: "05:00", label: t("settings.fiveAm") },
                    { value: "06:00", label: t("settings.sixAm") },
                    { value: "07:00", label: t("settings.sevenAm") },
                    { value: "08:00", label: t("settings.eightAm") },
                    { value: "09:00", label: t("settings.nineAm") },
                    { value: "12:00", label: t("settings.twelvePm") },
                    { value: "13:00", label: t("settings.onePm") },
                    { value: "14:00", label: t("settings.twoPm") },
                    { value: "15:00", label: t("settings.threePm") },
                    { value: "18:00", label: t("settings.sixPm") },
                    { value: "20:00", label: t("settings.eightPm") },
                  ]}
                  selectedValues={settings.notification_times || [settings.notification_time || "09:00"]}
                  onSelectionChange={async (times) => {
                    const success = await updateSetting("notification_times", times)
                    if (success && user?.user_id) {
                      await scheduleAllDebtReminders(user.user_id)
                      Toast.success(t("settings.notificationTimesUpdated"))
                    }
                  }}
                />
              </Section>

              <Section label={t("settings.summaryNotifications")}>
                <View style={[styles.switchRow, { borderTopWidth: 0, paddingTop: 0 }]}>
                  <Text style={[{ flex: 1, color: colors.muted.foreground, fontSize: 13 }]}>{t("settings.summaryNotificationsDesc")}</Text>
                  <View style={{ borderRadius: 999, borderWidth: 1.5, borderColor: settings.summary_notifications ? colors.primary.default : colors.border }}>
                    <Switch
                      value={settings.summary_notifications}
                      onValueChange={async (val) => {
                        const success = await updateSetting("summary_notifications", val)
                        if (success && user?.user_id) {
                          await scheduleAllDebtReminders(user.user_id)
                          Toast.success(val ? t("settings.summaryNotificationsEnabled") : t("settings.summaryNotificationsDisabled"))
                        }
                      }}
                      trackColor={{ false: colors.muted.default, true: colors.primary.default }}
                      thumbColor={colors.card.background}
                    />
                  </View>
                </View>

                {settings.summary_notifications && (
                  <>
                    <View style={{ marginTop: 12 }}>
                      <Text style={[styles.sectionLabel, { color: colors.foreground.primary }]}>{t("settings.summaryFrequency")}</Text>
                      <SelectionButtons
                        options={[
                          { value: "daily", label: t("settings.daily") },
                          { value: "weekly", label: t("settings.weekly") },
                          { value: "none", label: t("common.none") },
                        ]}
                        selectedValue={settings.summary_frequency || "daily"}
                        onSelect={async (freq) => {
                          const success = await updateSetting("summary_frequency", freq)
                          if (success && user?.user_id) {
                            await scheduleAllDebtReminders(user.user_id)
                            Toast.success(t("settings.summaryFrequencyUpdated"))
                          }
                        }}
                      />
                    </View>

                    {settings.summary_frequency === "weekly" && (
                      <View style={{ marginTop: 12 }}>
                        <Text style={[styles.sectionLabel, { color: colors.foreground.primary }]}>{t("settings.summaryDay")}</Text>
                        <SelectionButtons
                          options={[
                            { value: "1", label: t("settings.sunday") },
                            { value: "2", label: t("settings.monday") },
                            { value: "3", label: t("settings.tuesday") },
                            { value: "4", label: t("settings.wednesday") },
                            { value: "5", label: t("settings.thursday") },
                            { value: "6", label: t("settings.friday") },
                            { value: "7", label: t("settings.saturday") },
                          ]}
                          selectedValue={String(settings.summary_day_of_week || 1)}
                          onSelect={async (day) => {
                            const success = await updateSetting("summary_day_of_week", Number(day))
                            if (success && user?.user_id) {
                              await scheduleAllDebtReminders(user.user_id)
                              Toast.success(t("settings.summaryDayUpdated"))
                            }
                          }}
                        />
                      </View>
                    )}

                    {settings.summary_frequency !== "none" && (
                      <View style={{ marginTop: 12 }}>
                        <Text style={[styles.sectionLabel, { color: colors.foreground.primary }]}>{t("settings.summaryTime")}</Text>
                        <SelectionButtons
                          options={[
                            { value: "08:00", label: t("settings.eightAm") },
                            { value: "12:00", label: t("settings.twelvePm") },
                            { value: "18:00", label: t("settings.sixPm") },
                            { value: "20:00", label: t("settings.eightPm") },
                            { value: "21:00", label: t("settings.ninePm") },
                          ]}
                          selectedValue={settings.summary_notification_time || "20:00"}
                          onSelect={async (time) => {
                            const success = await updateSetting("summary_notification_time", time)
                            if (success && user?.user_id) {
                              await scheduleAllDebtReminders(user.user_id)
                              Toast.success(t("settings.summaryTimeUpdated"))
                            }
                          }}
                        />
                      </View>
                    )}
                  </>
                )}
              </Section>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 24 },
  card: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 24 },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12 },
  switchLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 12 },
  iconBox: { padding: 8, borderRadius: 999 },
  section: { paddingTop: 12, paddingBottom: 4 },
  sectionLabel: { fontWeight: "500", marginBottom: 10 },
  desc: { fontSize: 13, marginTop: 2 },
})

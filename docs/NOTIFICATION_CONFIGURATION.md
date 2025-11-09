# Configuration des Notifications - Résumé

## État Actuel
✅ **Notifications désactivées par défaut** - Respecte les bonnes pratiques de permissions

### Modifications apportées dans `DefaultSettings.ts` :
```typescript
export const DEFAULT_SETTINGS = {
  // ... autres paramètres
  notification_enabled: false,        // ❌ Désactivé par défaut
  system_notifications: false,        // ❌ Désactivé par défaut  
  summary_notifications: false,       // ❌ Désactivé par défaut
  // ... 
}
```

## Flux de Permission
1. **Installation de l'app** → Notifications désactivées
2. **Utilisateur va dans Paramètres** → Voit le toggle notifications désactivé
3. **Utilisateur active le toggle** → `requestNotificationPermissions()` appelée automatiquement
4. **Système demande permission** → Dialog natif iOS/Android
5. **Permission accordée** → Notifications configurées et planifiées
6. **Permission refusée** → Message d'erreur à l'utilisateur

## Code Responsable du Flux

### Dans `settings.tsx` (lignes 549-570) :
```typescript
<Switch
  value={settings.notification_enabled}
  onValueChange={async (val) => {
    const success = await updateSetting("notification_enabled", val)
    if (success && val) {
      // Request permissions and schedule notifications
      const hasPermission = await requestNotificationPermissions()
      if (hasPermission && user?.user_id) {
        await scheduleAllDebtReminders(user.user_id)
        Toast.success(t("settings.notificationsEnabled"))
      } else {
        Toast.error(t("settings.notificationPermissionsDenied"))
      }
    }
  }}
/>
```

### Dans `notificationService.ts` (lignes 15-40) :
```typescript
export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync() // 🚀 Demande permission
    finalStatus = status
  }

  return finalStatus === "granted"
}
```

## Configuration Logo
✅ **Logo des notifications configuré** dans `app.json` :
```json
{
  "expo": {
    "notification": {
      "icon": "./assets/images/logo/logo-white.png"
    }
  }
}
```

## Résultat
🎯 **Parfait respect des bonnes pratiques** :
- Pas de permissions demandées au démarrage
- Utilisateur contrôle total sur les notifications
- Permissions demandées uniquement quand l'utilisateur les active
- Messages clairs de succès/erreur
- Configuration complète des canaux Android
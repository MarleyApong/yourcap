# 🗄️ Mise à Jour Base de Données - `background_lock_delay`

## ✅ **Modifications Appliquées**

### 📊 **Table `settings` - Nouvelle Colonne**

**Colonne ajoutée :**
```sql
ALTER TABLE settings ADD COLUMN background_lock_delay INTEGER DEFAULT 5;
```

**Caractéristiques :**
- **Type :** `INTEGER`
- **Valeur par défaut :** `5` (secondes)
- **Description :** Délai en secondes avant verrouillage quand l'app passe en arrière-plan

### 🔧 **Migration Automatique**

La migration est **automatique** et **sécurisée** :
- ✅ Utilise `ALTER TABLE` avec gestion d'erreur
- ✅ La colonne est ajoutée automatiquement au prochain démarrage
- ✅ Les utilisateurs existants auront la valeur par défaut (5 secondes)
- ✅ Pas de perte de données

**Code de migration dans `db.ts` :**
```typescript
try {
  await db.execAsync(`
    ALTER TABLE settings ADD COLUMN background_lock_delay INTEGER DEFAULT 5;
  `)
  console.log("✅ Added background_lock_delay column")
} catch (error) {
  // Column might already exist, ignore
}
```

### 📝 **Services Mis à Jour**

#### **1. `settingsService.ts`**
- ✅ Colonne ajoutée à la requête `INSERT` pour nouveaux utilisateurs
- ✅ Valeur prise depuis `DEFAULT_SETTINGS.background_lock_delay`

#### **2. `types/settings.ts`**
- ✅ Interface `Settings` : `background_lock_delay?: number`
- ✅ Interface `DefaultSettings` : `background_lock_delay: number`

#### **3. `constants/DefaultSettings.ts`**
- ✅ Paramètre ajouté : `background_lock_delay: 5`

### 🏗️ **Structure Finale de la Table `settings`**

```sql
CREATE TABLE settings (
  user_id TEXT PRIMARY KEY NOT NULL,
  notification_enabled INTEGER DEFAULT 1,
  days_before_reminder INTEGER DEFAULT 3,
  language TEXT DEFAULT 'en',
  inactivity_timeout INTEGER DEFAULT 30,
  background_lock_delay INTEGER DEFAULT 5,    -- 🆕 NOUVEAU
  remember_session INTEGER DEFAULT 1,
  session_duration INTEGER DEFAULT 1440,
  system_notifications INTEGER DEFAULT 1,
  email_notifications INTEGER DEFAULT 0,
  sms_notifications INTEGER DEFAULT 0,
  notification_time TEXT DEFAULT '09:00',
  notification_times TEXT,
  summary_notifications INTEGER DEFAULT 1,
  summary_notification_time TEXT DEFAULT '20:00',
  summary_frequency TEXT DEFAULT 'daily',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

### 🔄 **Impact sur les Utilisateurs Existants**

**Utilisateurs ayant déjà des paramètres :**
- ✅ Colonne ajoutée automatiquement avec valeur par défaut `5`
- ✅ Paramètres existants préservés
- ✅ Interface utilisateur fonctionnelle immédiatement

**Nouveaux utilisateurs :**
- ✅ Paramètre inclus dans la création initiale
- ✅ Valeur par défaut appliquée dès la création

---

## 🎯 **Résultat**

La base de données est **automatiquement mise à jour** pour supporter le nouveau paramètre de délai de verrouillage. **Aucune action manuelle requise** - la migration se fait au prochain démarrage de l'application ! 🚀
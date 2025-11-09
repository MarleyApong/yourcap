# 🔧 Guide de Développement - YourCap

## 🚀 Configuration de l'environnement

### Prérequis
- Node.js 18+
- npm ou yarn
- Android Studio (pour Android)
- Xcode (pour iOS - macOS uniquement)

### Installation
```bash
git clone <repository-url>
cd yourcap
npm install
```

### Démarrage du projet
```bash
# Développement avec Expo
npx expo start

# Sur Android
npx expo run:android

# Sur iOS  
npx expo run:ios
```

## 🏗️ Architecture du projet

```
yourcap/
├── app/                    # Pages et navigation (Expo Router)
│   ├── (tabs)/            # Pages avec navigation par onglets
│   ├── auth/              # Pages d'authentification
│   └── debt/              # Pages de gestion des dettes
├── components/            # Composants réutilisables
│   ├── ui/                # Composants UI de base
│   └── feature/           # Composants métier
├── i18n/                  # Système d'internationalisation
├── services/              # Services et APIs
├── stores/                # State management (Zustand)
├── types/                 # Types TypeScript
├── hooks/                 # Hooks React personnalisés
├── lib/                   # Utilitaires et helpers
└── docs/                  # Documentation
```

## 🎨 Stack technique

- **Framework** : React Native + Expo
- **Navigation** : Expo Router
- **UI** : NativeWind (Tailwind CSS)
- **Base de données** : SQLite + Drizzle ORM
- **State Management** : Zustand
- **Internationalisation** : Système custom i18n
- **Notifications** : Expo Notifications
- **Authentification** : Système custom avec PIN

## 📱 Composants UI

### Structure des composants
```
components/
├── ui/                    # Composants de base
│   ├── text-input.tsx     # Input avec validation
│   ├── date-input.tsx     # Sélecteur de date
│   ├── select-input.tsx   # Dropdown/Select
│   ├── pin-input.tsx      # Input PIN sécurisé
│   └── ...
└── feature/               # Composants métier
    ├── debt/              # Composants liés aux dettes
    ├── dashboard/         # Composants du dashboard
    └── ...
```

### Conventions de nommage
- **Composants** : PascalCase (`TextInput.tsx`)
- **Hooks** : camelCase avec préfixe `use` (`useSettings.ts`)
- **Services** : camelCase (`debtServices.ts`)
- **Types** : PascalCase (`DebtType.ts`)

## 🌈 Système de couleurs

### Couleurs principales
```typescript
// lib/tw-colors.ts
const colors = {
  primary: "#562d8f",        // Violet principal
  "primary-foreground": "#ffffff",
  background: "#ffffff",     // Mode clair
  foreground: "#000000",
  // ... autres couleurs
}
```

### Utilisation
```typescript
import { useTwColors } from '@/lib/tw-colors'

function MonComposant() {
  const { twColor } = useTwColors()
  
  return (
    <View style={{ backgroundColor: twColor("primary") }}>
      <Text style={{ color: twColor("primary-foreground") }}>
        Texte
      </Text>
    </View>
  )
}
```

## 🗄️ Base de données

### Schéma
```typescript
// db/db.ts
export const users = sqliteTable("users", {
  user_id: text("user_id").primaryKey(),
  full_name: text("full_name").notNull(),
  email: text("email"),
  phone_number: text("phone_number").notNull(),
  // ...
})

export const debts = sqliteTable("debts", {
  debt_id: text("debt_id").primaryKey(),
  user_id: text("user_id").references(() => users.user_id),
  contact_name: text("contact_name").notNull(),
  amount: real("amount").notNull(),
  // ...
})
```

### Services
```typescript
// services/debtServices.ts
export const createDebt = async (debtData: CreateDebtData) => {
  // Logique de création
}

export const getUserDebts = async (userId: string) => {
  // Récupération des dettes
}
```

## 🔐 Authentification

### Système PIN
- PIN à 6 chiffres
- Stockage sécurisé (hachage)
- Biométrie optionnelle
- Verrouillage automatique

### Hooks utiles
```typescript
const { user, login, logout } = useAuthStore()
const { settings } = useSettings()
```

## 🌐 Internationalisation

### Ajouter une traduction
```typescript
// i18n/locales/fr.ts
export const fr = {
  newFeature: {
    title: "Nouvelle fonctionnalité",
    description: "Description en français"
  }
}

// i18n/locales/en.ts  
export const en = {
  newFeature: {
    title: "New feature",
    description: "English description"
  }
}
```

### Utilisation
```typescript
const { t } = useTranslation()
return <Text>{t('newFeature.title')}</Text>
```

## 📱 Notifications

### Configuration
```typescript
// services/notificationService.ts
export const scheduleDebtReminder = async (
  debtId: string,
  contactName: string,
  // ...autres paramètres
) => {
  // Logique de planification
}
```

### Types de notifications
- **Rappels de dettes** : Avant échéance
- **Résumés** : Quotidiens/hebdomadaires
- **Notifications push** : Temps réel

## 🧪 Tests et debugging

### Logs utiles
```typescript
console.log("Debug info:", data)
console.error("Error:", error)
```

### Testing sur device
```bash
# Android
npx expo run:android

# iOS
npx expo run:ios
```

## 📦 Build et déploiement

### Development build
```bash
npx expo run:android
npx expo run:ios
```

### Production build
```bash
# Avec EAS
eas build --platform android
eas build --platform ios

# Build local Android
npm run android
cd android && ./gradlew assembleRelease
```

## 🔄 État management

### Zustand stores
```typescript
// stores/authStore.ts
export const useAuthStore = create((set, get) => ({
  user: null,
  login: async (userData) => {
    // Logique de connexion
    set({ user: userData })
  },
  // ...
}))
```

### Hooks personnalisés
```typescript
// hooks/useSettings.ts
export const useSettings = () => {
  // Logique de gestion des paramètres
  return { settings, updateSettings }
}
```

## 📋 Checklist de développement

### Avant chaque commit
- [ ] Code formaté et lint clean
- [ ] Types TypeScript corrects
- [ ] Traductions à jour (fr/en)
- [ ] Tests sur Android/iOS
- [ ] Pas d'erreurs console

### Avant chaque release
- [ ] Build successful
- [ ] Tests complets sur devices
- [ ] Documentation mise à jour
- [ ] CHANGELOG.md mis à jour
- [ ] Version bumped

## 🆘 Dépannage

### Problèmes fréquents

#### Metro bundler
```bash
npx expo start --clear
```

#### Android build
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

#### Dependencies
```bash
npm install
npx expo install --fix
```

## 📚 Ressources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native](https://reactnative.dev/)
- [NativeWind](https://www.nativewind.dev/)
- [Drizzle ORM](https://orm.drizzle.team/)

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## 📞 Support

Pour toute question technique, contactez l'équipe de développement.
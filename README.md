# 💰 YourCap - Gestionnaire de Dettes

YourCap est une application mobile de gestion de dettes personnelles développée avec React Native et Expo.

## ✨ Fonctionnalités

- 🔐 **Authentification sécurisée** avec PIN et biométrie
- 💰 **Gestion complète des dettes** (créer, modifier, suivre)
- 📊 **Dashboard intuitif** avec résumés visuels
- 📱 **Notifications intelligentes** avec rappels personnalisés
- 📄 **Import/Export CSV** pour la sauvegarde des données
- 🌐 **Multilingue** (Français, Anglais)
- 🎨 **Interface moderne** avec thème adaptatif

## 📚 Documentation

Consultez notre documentation complète dans le dossier [`docs/`](./docs/):

- 🚀 **[Guide de développement](./docs/DEVELOPMENT.md)** - Setup et contribution
- 🌐 **[Système i18n](./docs/I18N_IMPLEMENTATION.md)** - Internationalisation
- 📊 **[Import/Export Guide](./docs/IMPORT_EXPORT_GUIDE.md)** - Gestion des données
- 🔔 **[Notifications](./docs/NOTIFICATION_IMPROVEMENTS.md)** - Système de rappels
- 📝 **[Changelog](./CHANGELOG.md)** - Historique des versions

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## 🔧 Développement

### Installation rapide
```bash
git clone <repository-url>
cd yourcap
npm install
npx expo start
```

### Build de production
```bash
# Avec EAS (recommandé)
eas build --platform android

# Build local
npm run android
cd android && ./gradlew assembleRelease
```

Pour plus de détails, consultez le [**Guide de développement**](./docs/DEVELOPMENT.md).

## 🤝 Contribution

Les contributions sont les bienvenues ! Consultez notre [guide de développement](./docs/DEVELOPMENT.md) pour commencer.

## 📄 Licence

Ce projet est sous licence MIT.

# 🌐 Système d'Internationalisation (i18n)

## Vue d'ensemble

YourCap dispose d'un système d'internationalisation complet permettant de supporter plusieurs langues avec changement en temps réel.

## 🎯 Langues supportées

- **Français (fr)** - Langue par défaut
- **Anglais (en)** - Traduction complète
- **Espagnol (es)** - Structure préparée

## 🏗️ Architecture

### Structure des fichiers
```
i18n/
├── index.tsx              # Configuration principale et hook useTranslation
├── types.ts               # Types TypeScript pour toutes les clés
├── generate-types.ts      # Script de génération automatique des types
└── locales/
    ├── index.ts          # Export et configuration des langues
    ├── fr.ts             # Traductions françaises (300+ clés)
    ├── en.ts             # Traductions anglaises (300+ clés)
    └── es.ts             # Traductions espagnoles (structure de base)
```

### Composants traduits (100%)

#### Pages principales
- ✅ `app/index.tsx` - Page d'accueil
- ✅ `app/(tabs)/dashboard.tsx` - Tableau de bord
- ✅ `app/(tabs)/settings.tsx` - Paramètres
- ✅ `app/(tabs)/history.tsx` - Historique
- ✅ `app/(tabs)/_layout.tsx` - Navigation

#### Authentification
- ✅ `app/auth/login.tsx` - Connexion
- ✅ `app/auth/register.tsx` - Inscription

#### Gestion des dettes
- ✅ `app/debt/add.tsx` - Ajout de dette
- ✅ Composants debt (item, formulaires)

#### Modals et composants
- ✅ `EditProfileModal` - Édition de profil
- ✅ `ChangePinModal` - Changement de PIN
- ✅ `ImportExportSection` - Import/Export CSV
- ✅ `LanguageSelector` - Sélecteur de langue

## 🔧 Utilisation

### Hook useTranslation
```typescript
import { useTranslation } from '@/i18n'

function MonComposant() {
  const { t } = useTranslation()
  
  return (
    <Text>{t('welcome.title')}</Text>
  )
}
```

### Changement de langue
```typescript
import { useSettings } from '@/hooks/useSettings'

function LanguageSelector() {
  const { settings, updateSettings } = useSettings()
  
  const changeLanguage = (lang: 'fr' | 'en') => {
    updateSettings({ language: lang })
  }
}
```

## 📊 Statistiques

- **Total des clés** : 300+
- **Pages traduites** : 8/8 (100%)
- **Composants traduits** : 15+ (100%)
- **Couverture** : Française 100%, Anglaise 100%

## 🚀 Fonctionnalités avancées

### Changement en temps réel
- ✅ Interface mise à jour instantanément
- ✅ Synchronisation authStore/useSettings
- ✅ Persistance de la préférence utilisateur

### Types TypeScript
- ✅ Auto-complétion complète
- ✅ Vérification des clés à la compilation
- ✅ Génération automatique des types

### Sélecteur de langue
- ✅ Interface utilisateur intuitive
- ✅ Style bouton avec couleurs thématiques
- ✅ Indicateur de langue active

## 🛠️ Développement

### Ajouter une nouvelle traduction

1. **Ajouter la clé dans fr.ts :**
```typescript
export const fr = {
  // ... existing keys
  newSection: {
    title: "Nouveau titre",
    description: "Description en français"
  }
}
```

2. **Ajouter la traduction anglaise dans en.ts :**
```typescript
export const en = {
  // ... existing keys  
  newSection: {
    title: "New title",
    description: "English description"
  }
}
```

3. **Régénérer les types :**
```bash
npm run generate-i18n-types
```

4. **Utiliser dans le composant :**
```typescript
const { t } = useTranslation()
return <Text>{t('newSection.title')}</Text>
```

### Structure des clés recommandée

```typescript
{
  // Pages
  dashboard: { title: "...", ... },
  settings: { title: "...", ... },
  
  // Composants
  modals: {
    editProfile: { title: "...", ... },
    changePin: { title: "...", ... }
  },
  
  // Messages communs
  common: {
    save: "...",
    cancel: "...",
    loading: "..."
  }
}
```

## 🧪 Tests

### Tester les traductions
1. Changer la langue dans Paramètres
2. Vérifier la mise à jour instantanée
3. Naviguer entre les pages
4. Tester les modals et formulaires

### Points de contrôle
- [ ] Tous les textes sont traduits
- [ ] Pas de clés manquantes en console
- [ ] Changement de langue fluide
- [ ] Persistance après redémarrage

## 📝 Bonnes pratiques

1. **Nommage des clés** : Utilisez une hiérarchie claire (`page.section.element`)
2. **Consistance** : Gardez le même style de traduction
3. **Contexte** : Ajoutez des commentaires pour les traductions complexes
4. **Tests** : Vérifiez toujours les deux langues
5. **Types** : Régénérez les types après chaque ajout

## 🔄 État actuel

✅ **Système complet et fonctionnel**
✅ **Architecture scalable**  
✅ **Changement temps réel**
✅ **200+ clés traduites**
✅ **Types TypeScript sécurisés**

Le système i18n de YourCap est maintenant mature et prêt pour une utilisation en production !
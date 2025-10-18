# Profile Management Features

## Vue d'ensemble

Deux nouvelles fonctionnalités de gestion de profil ont été ajoutées à l'application :

1. **Edit Profile** - Permet à l'utilisateur de modifier ses informations personnelles
2. **Change PIN** - Permet à l'utilisateur de changer son code PIN de sécurité

## Fonctionnalités implémentées

### 1. Edit Profile Modal (`components/feature/edit-profile-modal.tsx`)

**Fonctionnalités :**
- Modal en plein écran avec design cohérent
- Modification du nom complet (obligatoire)
- Modification du numéro de téléphone (obligatoire)
- Modification de l'email (optionnel)
- Validation des données en temps réel
- Vérification d'unicité des emails et numéros de téléphone
- Interface responsive avec clavier intelligent
- Gestion des erreurs et retours utilisateur

**Validation :**
- Nom complet requis
- Numéro de téléphone camerounais valide (6xxxxxxxx ou 2xxxxxxxx)
- Format email valide si fourni
- Unicité des emails et numéros de téléphone

### 2. Change PIN Modal (`components/feature/change-pin-modal.tsx`)

**Fonctionnalités :**
- Processus en 3 étapes avec indicateur de progression
- Étape 1 : Vérification du PIN actuel
- Étape 2 : Saisie du nouveau PIN
- Étape 3 : Confirmation du nouveau PIN
- Interface PinInput réutilisée pour cohérence
- Validation que le nouveau PIN soit différent de l'ancien
- Vérification que les PINs correspondent
- Gestion complète des erreurs

**Sécurité :**
- Vérification cryptographique du PIN actuel
- Hashage bcrypt du nouveau PIN
- Pas de stockage en clair
- Validation côté serveur

## Services ajoutés

### UserService (`services/userService.ts`)

**Nouvelles fonctions :**

```typescript
// Mise à jour du profil utilisateur
updateUserProfile(user_id: string, data: {
  full_name: string
  email: string  
  phone_number: string
}): Promise<boolean>

// Vérification du PIN utilisateur
verifyUserPin(user_id: string, pin: string): Promise<boolean>

// Mise à jour du PIN utilisateur
updateUserPin(user_id: string, newPin: string): Promise<boolean>
```

### AuthStore (`stores/authStore.ts`)

**Nouvelle action :**

```typescript
updateProfile(data: {
  full_name: string
  email: string
  phone_number: string
}): Promise<boolean>
```

## Intégration dans Settings

Les deux nouvelles fonctionnalités sont accessibles depuis la page Settings :

- **Profile Section** → "Edit Profile" → Ouvre EditProfileModal
- **Profile Section** → "Change PIN" → Ouvre ChangePinModal

## Usage

### Depuis Settings.tsx :

```tsx
// States pour les modals
const [editProfileModalVisible, setEditProfileModalVisible] = useState(false)
const [changePinModalVisible, setChangePinModalVisible] = useState(false)

// Boutons d'action
<SettingRow 
  icon="edit" 
  title="Edit Profile" 
  onPress={() => setEditProfileModalVisible(true)} 
/>
<SettingRow 
  icon="lock" 
  title="Change PIN" 
  onPress={() => setChangePinModalVisible(true)} 
/>

// Modals
<EditProfileModal 
  visible={editProfileModalVisible} 
  onClose={() => setEditProfileModalVisible(false)} 
/>
<ChangePinModal 
  visible={changePinModalVisible} 
  onClose={() => setChangePinModalVisible(false)} 
/>
```

## Design Pattern

Les deux modals suivent le même pattern de design que les pages d'authentification :

- **Header** avec bouton retour et titre
- **Contenu principal** avec formulaire ou PinInput
- **Actions** en bas avec boutons d'action
- **Loading states** avec overlay transparent
- **Responsive design** avec KeyboardAwareScrollView
- **Gestion d'erreurs** avec Toast notifications
- **Thème cohérent** utilisant useTwColors

## Tests recommandés

1. **Edit Profile :**
   - Modification réussie avec données valides
   - Validation des champs obligatoires
   - Validation format email et téléphone
   - Unicité email/téléphone
   - Annulation sans sauvegarde

2. **Change PIN :**
   - Changement réussi avec PIN valide
   - Validation PIN actuel incorrect
   - Validation nouveau PIN identique à l'ancien
   - Validation PINs de confirmation différents
   - Navigation entre étapes
   - Annulation à différentes étapes
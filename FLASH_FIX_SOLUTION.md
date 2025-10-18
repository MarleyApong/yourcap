# Solution au problème de latence et flash de l'interface

## Problème identifié

L'utilisateur voyait brièvement la page d'accueil (`index.tsx`) avant que l'écran de PIN/fingerprint s'affiche quand l'application était verrouillée. Cela créait une expérience utilisateur désagréable.

## Cause racine

Le problème venait du timing d'initialisation :

1. **L'app démarre** → Affiche `index.tsx`
2. **`loadUser()` s'exécute** → Vérifie l'authentification
3. **Vérification du verrouillage** → Détermine si l'app est verrouillée
4. **AppLockScreen s'affiche** → Mais trop tard, l'utilisateur a déjà vu la page d'accueil

## Solution implémentée

### 1. Écran de chargement initial (`InitialLoadingScreen`)

Créé un composant d'attente pendant la vérification du statut de verrouillage :

```tsx
// components/feature/initial-loading-screen.tsx
export const InitialLoadingScreen: React.FC = () => {
  return (
    <View className="flex-1 justify-center items-center">
      <View className="bg-primary rounded-xl p-6 items-center">
        <Text className="text-white text-lg">Chargement...</Text>
      </View>
    </View>
  )
}
```

### 2. Modification du layout principal (`_layout.tsx`)

Ajouté une vérification complète du statut avant d'afficher les routes :

```tsx
// Nouvel état pour traquer la vérification de verrouillage
const [lockCheckComplete, setLockCheckComplete] = useState(false)

// Vérification immédiate après loadUser
await loadUser()
const lockStatus = await isAppLocked()
setLockCheckComplete(true)

// Condition d'affichage mise à jour
if (user && !lockCheckComplete) {
  return (
    <ToastProvider>
      <InitialLoadingScreen />
    </ToastProvider>
  )
}
```

### 3. Simplification de l'AppLockScreen

Supprimé la logique de "vérification initiale" qui créait de la complexité, car c'est maintenant géré par le layout principal.

## Flux amélioré

1. **L'app démarre** → Affiche le SplashScreen Expo
2. **Initialisation BD + Fonts** → Loading en cours
3. **`loadUser()` s'exécute** → Charge l'utilisateur
4. **Vérification verrouillage immédiate** → Détermine le statut
5. **Décision d'affichage :**
   - Si utilisateur connecté ET vérification en cours → `InitialLoadingScreen`
   - Si utilisateur connecté ET app verrouillée → `AppLockScreen`
   - Si pas d'utilisateur → Routes normales (page d'accueil)

## Avantages de cette solution

✅ **Pas de flash** - L'utilisateur ne voit plus la page d'accueil par erreur  
✅ **Expérience fluide** - Transition directe vers l'écran de PIN  
✅ **Feedback visuel** - L'utilisateur voit "Chargement..." pendant la vérification  
✅ **Performance** - Vérification rapide et décision immédiate  
✅ **Maintenabilité** - Logique centralisée dans le layout principal

## Test recommandé

Pour tester la solution :

1. **Se connecter** à l'application
2. **Fermer l'app** (elle se verrouille automatiquement)  
3. **Rouvrir l'app** → Vous devriez voir :
   - Bref écran "Chargement..." (< 1 seconde)
   - Directement l'écran de PIN/fingerprint
   - **Pas de flash** de la page d'accueil

## Fichiers modifiés

- ✅ `app/_layout.tsx` - Logique de timing améliorée
- ✅ `components/feature/app-lock-screen.tsx` - Simplification
- ✅ `components/feature/initial-loading-screen.tsx` - Nouveau composant
- ✅ `components/feature/edit-profile-modal.tsx` - Modal d'édition profil
- ✅ `components/feature/change-pin-modal.tsx` - Modal changement PIN
- ✅ `stores/authStore.ts` - Action updateProfile ajoutée
- ✅ `services/userService.ts` - Fonctions de mise à jour profil/PIN

La solution est maintenant prête et devrait éliminer complètement le problème de latence/flash !
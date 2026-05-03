# Versioning — Changelog & Termes et Conditions

Fichier de référence : `constants/AppVersions.ts`

---

## Publier une nouvelle version sans changement de T&C

1. Bumper `version` dans `app.json` (ex: `1.3.0` → `1.4.0`)
2. Ajouter les entrées dans `CHANGELOG` dans `constants/AppVersions.ts` :

```ts
"1.4.0": {
  en: ["Feature A", "Fix B"],
  fr: ["Fonctionnalité A", "Correction B"],
  es: ["..."],
  de: ["..."],
  pt: ["..."],
}
```

→ Le modal "Quoi de neuf" s'affiche une fois après la mise à jour.  
→ Les T&C ne s'affichent pas.

---

## Modifier les Termes et Conditions

1. Modifier le contenu des T&C dans les 5 fichiers `i18n/locales/*.ts` (section `terms.sections`)
2. Bumper `TERMS_VERSION` dans `constants/AppVersions.ts` (ex: `"1.0"` → `"1.1"`)
3. Mettre à jour `terms.lastUpdated` dans les 5 fichiers de locale

→ Le modal T&C s'affiche au prochain lancement.  
→ L'user doit accepter pour continuer, ou supprimer son compte.

---

## Les deux en même temps

Faire les deux étapes ci-dessus. L'ordre d'affichage est : **Changelog → T&C**.

---

## Ne rien afficher

Ne pas toucher à `TERMS_VERSION` et ne pas ajouter d'entrée dans `CHANGELOG` pour la version courante.

---

## Règles importantes

- Ne **jamais** ajouter une entrée `CHANGELOG` pour la version initiale
- Ne bumper `TERMS_VERSION` **que** si le contenu des T&C change vraiment
- La version dans `CHANGELOG` doit correspondre **exactement** à `version` dans `app.json`

---

## Migrations du store Zustand (`core/stores/appStore.ts`)

Le store de préférences (thème, accent) utilise un système de migration versionné via Zustand persist.

**Version actuelle : `1`** (introduite en 1.9.0)

### Quand bumper la version du store

À chaque fois qu'un changement nécessite de modifier des données déjà sauvegardées dans AsyncStorage :
- Valeur par défaut d'un champ qui change
- Nouveau champ obligatoire à initialiser
- Clé renommée ou supprimée

### Procédure

1. Bumper `version` dans les options `persist` de `appStore.ts` (ex: `1` → `2`)
2. Ajouter la logique dans `migrate` :

```ts
migrate: (persisted: any, fromVersion: number) => {
  if (fromVersion < 1) {
    // migration v0 → v1 : reset purple → navy
    if (persisted?.accentColor === "purple") persisted.accentColor = "navy"
  }
  if (fromVersion < 2) {
    // migration v1 → v2 : exemple futur
  }
  return persisted
},
```

`migrate` run **une seule fois** au premier lancement après mise à jour, puis Zustand sauvegarde la nouvelle version dans AsyncStorage — la migration ne tourne jamais deux fois.

### Historique des migrations

| Version store | App version | Changement |
|:---:|:---:|---|
| 0 | < 1.9.0 | Pas de versioning (violet par défaut) |
| 1 | 1.9.0 | Reset accent `purple` → `navy` (nouveau thème par défaut) |

---

## Déploiement Android (build local)

### Prérequis
- Java 17 installé (`java -version`)
- Keystore placé dans `android/app/` avec `android/app/keystore.properties` rempli

### Procédure complète

```bash
# 1. Bumper la version (met à jour app.json, package.json, versionCode)
npm run release:prod

# 2. Builder le AAB
cd android
./gradlew bundleRelease
```

Le fichier généré : `android/app/build/outputs/bundle/release/app-release.aab`

### Uploader sur la Play Console
1. Play Console → Ton app → Production → Créer une version
2. Uploader le `.aab`
3. Publier

---

## Récupérer le keystore depuis EAS (première fois)

```bash
eas credentials --platform android
# → Android Keystore → Download existing keystore
```

Placer le `.jks` dans `android/app/` et remplir `android/app/keystore.properties` :

```properties
storeFile=nom-du-fichier.jks
storePassword=MOT_DE_PASSE_STORE
keyAlias=TON_ALIAS
keyPassword=MOT_DE_PASSE_KEY
```

> Ces fichiers sont dans `.gitignore` — ne jamais les committer.

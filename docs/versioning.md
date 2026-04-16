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

- Ne **jamais** ajouter une entrée `CHANGELOG` pour la version initiale (`1.3.0`)
- Ne bumper `TERMS_VERSION` **que** si le contenu des T&C change vraiment
- La version dans `CHANGELOG` doit correspondre **exactement** à `version` dans `app.json`

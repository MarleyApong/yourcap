// Bump TERMS_VERSION ONLY when the T&C content changes.
// Bump when a new app version introduces notable features.
export const TERMS_VERSION = "1.0"

type ChangelogEntries = {
  en: string[]
  fr: string[]
  es: string[]
  de: string[]
  pt: string[]
}

// Add a new entry here each time you want to show a "What's new" screen.
// Key = app version (must match app.json "version").
// Do NOT add an entry for the initial release version.
export const CHANGELOG: Record<string, ChangelogEntries> = {
  // Example for next release:
  // "1.4.0": {
  //   en: ["New feature X", "Improvement Y"],
  //   fr: ["Nouvelle fonctionnalité X", "Amélioration Y"],
  //   es: ["Nueva función X", "Mejora Y"],
  //   de: ["Neue Funktion X", "Verbesserung Y"],
  //   pt: ["Novo recurso X", "Melhoria Y"],
  // },
}

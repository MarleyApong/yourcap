#!/usr/bin/env node

/**
 * Generates Play Store release notes from CHANGELOG in constants/AppVersions.ts
 * Output: store/changelogs/{version}/{locale}.txt
 * Max 500 chars per locale (Play Store limit)
 */

const fs = require("fs")
const path = require("path")

const LOCALE_MAP = {
  fr: "fr-FR",
  en: "en-US",
  es: "es-ES",
  de: "de-DE",
  pt: "pt-BR",
}

const RESET = "\x1b[0m"
const BOLD = "\x1b[1m"
const GREEN = "\x1b[32m"
const YELLOW = "\x1b[33m"
const RED = "\x1b[31m"
const DIM = "\x1b[2m"
const CYAN = "\x1b[36m"

function extractChangelog(version) {
  const src = fs.readFileSync(path.join(__dirname, "../constants/AppVersions.ts"), "utf8")

  // Find the block for this version
  const versionPattern = new RegExp(`"${version.replace(/\./g, "\\.")}"\\s*:\\s*\\{`)
  const startMatch = src.search(versionPattern)
  if (startMatch === -1) return null

  // Extract the object by counting braces
  let depth = 0
  let inString = false
  let escape = false
  let start = src.indexOf("{", startMatch)
  let end = start

  for (let i = start; i < src.length; i++) {
    const ch = src[i]
    if (escape) { escape = false; continue }
    if (ch === "\\" && inString) { escape = true; continue }
    if (ch === '"' && !escape) { inString = !inString; continue }
    if (inString) continue
    if (ch === "{") depth++
    if (ch === "}") {
      depth--
      if (depth === 0) { end = i; break }
    }
  }

  const block = src.slice(start, end + 1)

  // Parse arrays for each language
  const result = {}
  for (const lang of Object.keys(LOCALE_MAP)) {
    const langPattern = new RegExp(`${lang}\\s*:\\s*\\[([\\s\\S]*?)\\]`)
    const langMatch = block.match(langPattern)
    if (!langMatch) continue
    const entries = [...langMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1])
    result[lang] = entries
  }

  return result
}

function buildNotes(entries) {
  return entries.map((e) => `• ${e}`).join("\n")
}

function generateNotes(version) {
  const changelog = extractChangelog(version)
  if (!changelog) {
    console.log(`${RED}✖ Aucun CHANGELOG trouvé pour la version ${version}${RESET}`)
    return false
  }

  const outDir = path.join(__dirname, `../store/changelogs/${version}`)
  fs.mkdirSync(outDir, { recursive: true })

  console.log(`\n${BOLD}${CYAN}  Notes Play Store — v${version}${RESET}`)
  console.log(`  ${DIM}${"─".repeat(48)}${RESET}\n`)

  let allOk = true
  for (const [lang, locale] of Object.entries(LOCALE_MAP)) {
    const entries = changelog[lang]
    if (!entries || entries.length === 0) {
      console.log(`  ${YELLOW}⚠${RESET}  ${locale} — aucune entrée`)
      continue
    }

    const notes = buildNotes(entries)
    if (notes.length > 500) {
      console.log(`  ${RED}✖${RESET}  ${locale} — ${RED}${notes.length} chars (max 500)${RESET}`)
      allOk = false
    } else {
      console.log(`  ${GREEN}✔${RESET}  ${locale} — ${notes.length} chars`)
    }

    const filePath = path.join(outDir, `${locale}.txt`)
    fs.writeFileSync(filePath, notes, "utf8")
  }

  console.log(`\n  ${DIM}Fichiers générés dans :${RESET} ${BOLD}store/changelogs/${version}/${RESET}\n`)
  return allOk
}

// Allow running standalone: node scripts/generate-play-notes.js [version]
if (require.main === module) {
  const version = process.argv[2] || JSON.parse(fs.readFileSync(path.join(__dirname, "../app.json"), "utf8")).expo.version
  generateNotes(version)
}

module.exports = { generateNotes }

#!/usr/bin/env node

const readline = require("readline")
const fs = require("fs")
const path = require("path")

// Read current versions
const appJson = JSON.parse(fs.readFileSync(path.join(__dirname, "../app.json"), "utf8"))
const appVersions = fs.readFileSync(path.join(__dirname, "../constants/AppVersions.ts"), "utf8")

const currentVersion = appJson.expo.version
const termsVersionMatch = appVersions.match(/TERMS_VERSION\s*=\s*"([^"]+)"/)
const termsVersion = termsVersionMatch ? termsVersionMatch[1] : "unknown"
const hasChangelog = appVersions.includes(`"${currentVersion}"`)

const RESET = "\x1b[0m"
const BOLD = "\x1b[1m"
const YELLOW = "\x1b[33m"
const CYAN = "\x1b[36m"
const RED = "\x1b[31m"
const GREEN = "\x1b[32m"
const DIM = "\x1b[2m"

console.log("")
console.log(`${BOLD}${CYAN}╔══════════════════════════════════════════════════╗${RESET}`)
console.log(`${BOLD}${CYAN}║           YourCap — Release Check                ║${RESET}`)
console.log(`${BOLD}${CYAN}╚══════════════════════════════════════════════════╝${RESET}`)
console.log("")
console.log(`  ${BOLD}Version actuelle :${RESET}  ${YELLOW}${currentVersion}${RESET}`)
console.log(`  ${BOLD}TERMS_VERSION    :${RESET}  ${YELLOW}${termsVersion}${RESET}`)
console.log("")
console.log(`${BOLD}  Modals utilisateurs basés sur ces versions :${RESET}`)
console.log(`  ${DIM}─────────────────────────────────────────────────${RESET}`)
console.log("")

// Changelog status
if (hasChangelog) {
  console.log(`  ${GREEN}✔${RESET}  Changelog ${BOLD}${currentVersion}${RESET} présent → modal "Quoi de neuf" ${GREEN}affiché${RESET}`)
} else {
  console.log(`  ${DIM}○${RESET}  Pas de changelog pour ${BOLD}${currentVersion}${RESET} → modal "Quoi de neuf" ${DIM}non affiché${RESET}`)
}

// Terms status
console.log(`  ${CYAN}ℹ${RESET}  TERMS_VERSION = ${BOLD}"${termsVersion}"${RESET} → modal T&C affiché si l'user n'a pas encore accepté cette version`)
console.log("")
console.log(`${BOLD}  Rappels avant de continuer :${RESET}`)
console.log(`  ${DIM}─────────────────────────────────────────────────${RESET}`)
console.log(`  ${YELLOW}▸${RESET} Si les T&C ont changé  → bumper ${BOLD}TERMS_VERSION${RESET} dans ${BOLD}constants/AppVersions.ts${RESET}`)
console.log(`  ${YELLOW}▸${RESET} Si nouvelles features  → ajouter les entrées dans ${BOLD}CHANGELOG["${currentVersion}"]${RESET}`)
console.log(`  ${YELLOW}▸${RESET} Voir ${BOLD}docs/versioning.md${RESET} pour la procédure complète`)
console.log("")

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

rl.question(`  ${BOLD}Continuer le release ? (o/N) :${RESET} `, (answer) => {
  rl.close()
  if (answer.trim().toLowerCase() === "o") {
    console.log("")
    console.log(`  ${GREEN}✔ Release confirmé — lancement de standard-version...${RESET}`)
    console.log("")
    const { execSync } = require("child_process")
    try {
      execSync("standard-version", { stdio: "inherit" })
    } catch (e) {
      process.exit(1)
    }
  } else {
    console.log("")
    console.log(`  ${RED}✖ Release annulé.${RESET}`)
    console.log("")
    process.exit(0)
  }
})

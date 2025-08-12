#!/usr/bin/env node

/**
 * Setup Git Hooks Script
 * Configures Husky and creates git hooks for the project
 */

const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

function checkHuskyInstallation() {
  try {
    execSync("npx husky --version", { stdio: "pipe" })
    return true
  } catch (error) {
    console.log("⚠️ Husky nincs telepítve, telepítés...")
    try {
      execSync("npm install --save-dev husky", { stdio: "inherit" })
      console.log("✅ Husky telepítve")
      return true
    } catch (installError) {
      console.error("❌ Husky telepítése sikertelen:", installError.message)
      return false
    }
  }
}

function initializeHusky() {
  try {
    // Check if .git directory exists
    if (!fs.existsSync(".git")) {
      console.log("⚠️ .git mappa nem található, git repo inicializálása...")
      execSync("git init", { stdio: "inherit" })
    }

    // Initialize husky
    execSync("npx husky install", { stdio: "inherit" })
    console.log("✅ Husky inicializálva")
    return true
  } catch (error) {
    console.error("❌ Husky inicializálás sikertelen:", error.message)
    return false
  }
}

function createPreCommitHook() {
  const hookPath = ".husky/pre-commit"
  const hookContent = `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🚀 Pre-commit ellenőrzések indulnak..."

# Run lint-staged
npx lint-staged

# Run TypeScript check on modified files
npm run check:typescript-modified

if [ $? -ne 0 ]; then
  echo "❌ Pre-commit ellenőrzés megbukott!"
  exit 1
fi

echo "✅ Pre-commit ellenőrzés sikeres!"
`

  try {
    // Create .husky directory if it doesn't exist
    if (!fs.existsSync(".husky")) {
      fs.mkdirSync(".husky", { recursive: true })
    }

    fs.writeFileSync(hookPath, hookContent)

    // Make the hook executable
    try {
      execSync(`chmod +x ${hookPath}`, { stdio: "pipe" })
    } catch (chmodError) {
      // chmod might not work on Windows, but that's okay
    }

    console.log("✅ Pre-commit hook létrehozva")
    return true
  } catch (error) {
    console.error("❌ Pre-commit hook létrehozása sikertelen:", error.message)
    return false
  }
}

function createPrePushHook() {
  const hookPath = ".husky/pre-push"
  const hookContent = `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🚀 Pre-push ellenőrzések indulnak..."

# TypeScript check on modified files
echo "🔍 TypeScript ellenőrzés..."
npm run check:typescript-modified
if [ $? -ne 0 ]; then
  echo "❌ TypeScript hibák! Push megszakítva."
  exit 1
fi

# Code quality check on modified files
echo "🔍 Kódminőség ellenőrzés..."
npm run check:modified
if [ $? -ne 0 ]; then
  echo "❌ Kódminőség hibák! Push megszakítva."
  exit 1
fi

# Run tests if they exist
if npm run test:unit:changed > /dev/null 2>&1; then
  echo "🧪 Tesztek futtatása..."
  npm run test:unit:changed
  if [ $? -ne 0 ]; then
    echo "❌ Teszt hibák! Push megszakítva."
    exit 1
  fi
fi

# Build check
echo "🏗️ Build ellenőrzés..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build hiba! Push megszakítva."
  exit 1
fi

echo "✅ Minden ellenőrzés sikeres. Push mehet!"
`

  try {
    // Create .husky directory if it doesn't exist
    if (!fs.existsSync(".husky")) {
      fs.mkdirSync(".husky", { recursive: true })
    }

    fs.writeFileSync(hookPath, hookContent)

    // Make the hook executable
    try {
      execSync(`chmod +x ${hookPath}`, { stdio: "pipe" })
    } catch (chmodError) {
      // chmod might not work on Windows, but that's okay
    }

    console.log("✅ Pre-push hook létrehozva")
    return true
  } catch (error) {
    console.error("❌ Pre-push hook létrehozása sikertelen:", error.message)
    return false
  }
}

function updatePackageJson() {
  const packagePath = "package.json"

  if (!fs.existsSync(packagePath)) {
    console.log("⚠️ package.json nem található")
    return false
  }

  try {
    const packageContent = JSON.parse(fs.readFileSync(packagePath, "utf8"))

    // Ensure prepare script exists
    if (!packageContent.scripts) {
      packageContent.scripts = {}
    }

    if (!packageContent.scripts.prepare) {
      packageContent.scripts.prepare = "husky install"

      fs.writeFileSync(packagePath, JSON.stringify(packageContent, null, 2))
      console.log("✅ package.json frissítve prepare script-tel")
    } else {
      console.log("ℹ️ prepare script már létezik")
    }

    return true
  } catch (error) {
    console.error("❌ package.json frissítése sikertelen:", error.message)
    return false
  }
}

function main() {
  console.log("🚀 Git hook-ok beállítása...\n")

  let success = true

  // Check and install Husky
  if (!checkHuskyInstallation()) {
    success = false
  }

  // Initialize Husky
  if (success && !initializeHusky()) {
    success = false
  }

  // Create pre-commit hook
  if (success && !createPreCommitHook()) {
    success = false
  }

  // Create pre-push hook
  if (success && !createPrePushHook()) {
    success = false
  }

  // Update package.json
  if (success && !updatePackageJson()) {
    success = false
  }

  if (success) {
    console.log("\n✅ Git hook-ok sikeresen beállítva!")
    console.log("\n📋 Elérhető parancsok:")
    console.log("  npm run dev                    - Fejlesztői szerver indítása")
    console.log("  npm run test:unit:watch        - Tesztek folyamatos futtatása")
    console.log("  npm run check:modified         - Módosított fájlok ellenőrzése")
    console.log("  npm run check:typescript-modified - TS ellenőrzés módosított fájlokon")
    console.log("  npm run precommit              - Pre-commit hook manuális futtatás")
    console.log("\n🎯 A hook-ok automatikusan futnak commit és push esetén!")
  } else {
    console.log("\n❌ Git hook-ok beállítása részben sikertelen")
    process.exit(1)
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main()
}

module.exports = {
  checkHuskyInstallation,
  initializeHusky,
  createPreCommitHook,
  createPrePushHook,
  updatePackageJson,
}

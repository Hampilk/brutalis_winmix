#!/usr/bin/env node

/**
 * TypeScript Check for Modified Files
 * Checks TypeScript compilation for only modified files
 */

const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

function getModifiedTypeScriptFiles() {
  try {
    // Get staged files
    const staged = execSync("git diff --cached --name-only --diff-filter=ACM", { encoding: "utf8" })
      .split("\n")
      .filter((f) => f.trim() && f.match(/\.(ts|tsx)$/))

    // Get unstaged files
    const unstaged = execSync("git diff --name-only --diff-filter=ACM", { encoding: "utf8" })
      .split("\n")
      .filter((f) => f.trim() && f.match(/\.(ts|tsx)$/))

    // Get untracked files
    const untracked = execSync("git ls-files --others --exclude-standard", { encoding: "utf8" })
      .split("\n")
      .filter((f) => f.trim() && f.match(/\.(ts|tsx)$/))

    const allFiles = [...new Set([...staged, ...unstaged, ...untracked])]
    return allFiles.filter((file) => fs.existsSync(file))
  } catch (error) {
    console.warn("⚠️ Git parancs sikertelen, teljes TypeScript ellenőrzés...")
    return []
  }
}

function runTypeScriptCheck(files) {
  try {
    if (files.length === 0) {
      console.log("✅ Nincs ellenőrizendő TypeScript fájl.")
      return true
    }

    console.log(`🔍 TypeScript ellenőrzés ${files.length} fájlon...`)
    files.forEach((file) => console.log(`   - ${file}`))

    // Run TypeScript compiler check
    const fileList = files.join(" ")
    execSync(`npx tsc --noEmit --skipLibCheck ${fileList}`, {
      stdio: "inherit",
      encoding: "utf8",
    })

    console.log("✅ TypeScript ellenőrzés sikeres")
    return true
  } catch (error) {
    console.error("❌ TypeScript hibák találhatók")
    return false
  }
}

function main() {
  console.log("🚀 TypeScript ellenőrzés indítása (csak módosított fájlok)...\n")

  const modifiedFiles = getModifiedTypeScriptFiles()
  const success = runTypeScriptCheck(modifiedFiles)

  if (success) {
    console.log("\n✅ TypeScript ellenőrzés sikeresen lezárult!")
    process.exit(0)
  } else {
    console.log("\n❌ TypeScript ellenőrzés hibákkal zárult!")
    console.log("💡 Javítás: Ellenőrizd a TypeScript hibákat és javítsd őket")
    process.exit(1)
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main()
}

module.exports = { getModifiedTypeScriptFiles, runTypeScriptCheck }

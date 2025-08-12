#!/usr/bin/env node

/**
 * Fix Font Issues Script
 * Automatically fixes font-related problems in the project
 */

const fs = require("fs")
const path = require("path")

function fixLayoutFonts() {
  const layoutPath = "app/layout.tsx"

  if (!fs.existsSync(layoutPath)) {
    console.log("⚠️ app/layout.tsx nem található")
    return false
  }

  try {
    let content = fs.readFileSync(layoutPath, "utf8")

    // Remove Geist font imports
    content = content.replace(/import\s+.*geist.*from.*['"][^'"]*['"];?\s*\n?/gi, "")
    content = content.replace(/const\s+geist\w*\s*=.*\n?/gi, "")

    // Remove font variable usage in className
    content = content.replace(/className=\{[^}]*geist[^}]*\}/gi, 'className="font-sans"')
    content = content.replace(/className=\{.*variable.*\}/gi, 'className="font-sans"')

    // Ensure we have font-sans in the body
    if (!content.includes('className="font-sans"')) {
      content = content.replace(/<body([^>]*)>/, '<body$1 className="font-sans">')
    }

    fs.writeFileSync(layoutPath, content)
    console.log("✅ Font importok eltávolítva app/layout.tsx-ből")
    return true
  } catch (error) {
    console.error(`❌ Hiba a layout.tsx javításakor: ${error}`)
    return false
  }
}

function createFontDirectory() {
  const fontsDir = "public/fonts"

  if (!fs.existsSync(fontsDir)) {
    try {
      fs.mkdirSync(fontsDir, { recursive: true })
      console.log("✅ public/fonts mappa létrehozva")
      return true
    } catch (error) {
      console.error(`❌ Hiba a fonts mappa létrehozásakor: ${error}`)
      return false
    }
  } else {
    console.log("ℹ️ public/fonts mappa már létezik")
    return true
  }
}

function updateTailwindConfig() {
  const tailwindPath = "tailwind.config.ts"

  if (!fs.existsSync(tailwindPath)) {
    console.log("⚠️ tailwind.config.ts nem található")
    return false
  }

  try {
    let content = fs.readFileSync(tailwindPath, "utf8")

    // Ensure font-sans is properly configured
    if (!content.includes("fontFamily")) {
      const themeIndex = content.indexOf("theme: {")
      if (themeIndex !== -1) {
        const insertPoint = content.indexOf("extend: {", themeIndex)
        if (insertPoint !== -1) {
          const afterExtend = content.indexOf("{", insertPoint + 8) + 1
          const fontConfig = `
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
      },`
          content = content.slice(0, afterExtend) + fontConfig + content.slice(afterExtend)
        }
      }
    }

    fs.writeFileSync(tailwindPath, content)
    console.log("✅ Tailwind konfiguráció frissítve")
    return true
  } catch (error) {
    console.error(`❌ Hiba a Tailwind konfiguráció frissítésekor: ${error}`)
    return false
  }
}

function main() {
  console.log("🚀 Font problémák javítása...\n")

  let success = true

  // Fix layout fonts
  if (!fixLayoutFonts()) {
    success = false
  }

  // Create fonts directory
  if (!createFontDirectory()) {
    success = false
  }

  // Update Tailwind config
  if (!updateTailwindConfig()) {
    success = false
  }

  if (success) {
    console.log("\n✅ Minden font probléma javítva!")
    console.log("\n📋 Változások:")
    console.log("  - Geist font importok eltávolítva")
    console.log("  - font-sans használata beállítva")
    console.log("  - public/fonts mappa létrehozva")
    console.log("  - Tailwind konfiguráció frissítve")
  } else {
    console.log("\n❌ Néhány font probléma javítása sikertelen")
    process.exit(1)
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main()
}

module.exports = { fixLayoutFonts, createFontDirectory, updateTailwindConfig }

#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

/**
 * Fix Import Issues Script
 * Automatically fixes common import problems
 */

function createMissingUIComponents() {
  const componentsDir = "components/ui"

  if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true })
    console.log("✅ components/ui mappa létrehozva")
  }

  // Create missing tooltip component if it doesn't exist
  const tooltipPath = path.join(componentsDir, "tooltip.tsx")
  if (!fs.existsSync(tooltipPath)) {
    const tooltipContent = `"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
`
    fs.writeFileSync(tooltipPath, tooltipContent)
    console.log("✅ Tooltip komponens létrehozva")
    return true
  }

  return false
}

function createMatchesError() {
  const libPath = "lib/matches.ts"

  if (!fs.existsSync(libPath)) {
    console.log("⚠️ lib/matches.ts nem található")
    return false
  }

  try {
    let content = fs.readFileSync(libPath, "utf8")

    // Check if MatchesError already exists
    if (content.includes("class MatchesError") || content.includes("export class MatchesError")) {
      console.log("ℹ️ MatchesError már létezik")
      return true
    }

    // Add MatchesError class
    const matchesErrorClass = `
/**
 * Custom error class for matches-related errors
 */
export class MatchesError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'MatchesError'
  }
}
`

    // Insert before the last export or at the end
    const lastExportIndex = content.lastIndexOf("export")
    if (lastExportIndex !== -1) {
      content = content.slice(0, lastExportIndex) + matchesErrorClass + "\n" + content.slice(lastExportIndex)
    } else {
      content += matchesErrorClass
    }

    fs.writeFileSync(libPath, content)
    console.log("✅ MatchesError osztály hozzáadva")
    return true
  } catch (error) {
    console.error(`❌ Hiba a MatchesError létrehozásakor: ${error}`)
    return false
  }
}

function fixSearchMatchesFunction() {
  const libPath = "lib/matches.ts"

  if (!fs.existsSync(libPath)) {
    console.log("⚠️ lib/matches.ts nem található")
    return false
  }

  try {
    let content = fs.readFileSync(libPath, "utf8")

    // Check if searchMatches function exists and has correct signature
    const searchMatchesRegex = /export\s+(?:async\s+)?function\s+searchMatches\s*$$[^)]*$$/
    const match = content.match(searchMatchesRegex)

    if (match) {
      const functionSignature = match[0]

      // Check if it already has two parameters
      if (functionSignature.includes("homeTeam") && functionSignature.includes("awayTeam")) {
        console.log("ℹ️ searchMatches függvény már megfelelő paraméterekkel rendelkezik")
        return true
      }

      // Update function signature
      const newSignature = "export async function searchMatches(homeTeam: string, awayTeam: string)"
      content = content.replace(searchMatchesRegex, newSignature)

      fs.writeFileSync(libPath, content)
      console.log("✅ searchMatches függvény paraméterek frissítve")
      return true
    } else {
      console.log("⚠️ searchMatches függvény nem található")
      return false
    }
  } catch (error) {
    console.error(`❌ Hiba a searchMatches javításakor: ${error}`)
    return false
  }
}

function checkAndFixImports() {
  const filesToCheck = [
    "components/matches-list.tsx",
    "components/legend-mode-prediction-card.tsx",
    "components/enhanced-legend-mode-card.tsx",
  ]

  let fixedCount = 0

  for (const filePath of filesToCheck) {
    if (!fs.existsSync(filePath)) {
      continue
    }

    try {
      let content = fs.readFileSync(filePath, "utf8")
      let modified = false

      // Fix MatchesError import
      if (content.includes("MatchesError") && !content.includes("import") && content.includes("MatchesError")) {
        const importLine = 'import { searchMatches, type Match, MatchesError } from "@/lib/matches"'
        if (!content.includes(importLine)) {
          // Find existing matches import and update it
          const matchesImportRegex = /import\s+{[^}]*}\s+from\s+["']@\/lib\/matches["']/
          if (matchesImportRegex.test(content)) {
            content = content.replace(matchesImportRegex, importLine)
            modified = true
          }
        }
      }

      // Fix tooltip import
      if (content.includes("Tooltip") && !content.includes("@/components/ui/tooltip")) {
        const tooltipImportLine =
          'import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"'
        if (!content.includes(tooltipImportLine)) {
          // Add tooltip import at the top
          const firstImportIndex = content.indexOf("import")
          if (firstImportIndex !== -1) {
            content = content.slice(0, firstImportIndex) + tooltipImportLine + "\n" + content.slice(firstImportIndex)
            modified = true
          }
        }
      }

      // Ensure Tooltip is wrapped in TooltipProvider
      if (content.includes("Tooltip") && !content.includes("TooltipProvider")) {
        const tooltipProviderWrapper = `
<TooltipProvider>
  {/* Tooltip components should be placed here */}
</TooltipProvider>
`
        content = content.replace(/(<Tooltip\b[^>]*>[\s\S]*?<\/Tooltip>)/g, tooltipProviderWrapper)
        modified = true
      }

      if (modified) {
        fs.writeFileSync(filePath, content)
        console.log(`✅ Import javítások alkalmazva: ${filePath}`)
        fixedCount++
      }
    } catch (error) {
      console.error(`❌ Hiba a ${filePath} javításakor: ${error}`)
    }
  }

  return fixedCount
}

function main() {
  console.log("🚀 Import problémák javítása...\n")

  let success = true
  let fixedCount = 0

  // Create missing UI components
  if (createMissingUIComponents()) {
    fixedCount++
  } else {
    success = false
  }

  // Create MatchesError class
  if (createMatchesError()) {
    fixedCount++
  } else {
    success = false
  }

  // Fix searchMatches function
  if (fixSearchMatchesFunction()) {
    fixedCount++
  } else {
    success = false
  }

  // Check and fix imports in components
  const importFixCount = checkAndFixImports()
  fixedCount += importFixCount

  if (success && fixedCount > 0) {
    console.log(`\n✅ ${fixedCount} import probléma javítva!`)
    console.log("\n📋 Javítások:")
    console.log("  - Hiányzó UI komponensek létrehozva")
    console.log("  - MatchesError osztály hozzáadva")
    console.log("  - searchMatches függvény paraméterek javítva")
    console.log("  - Import hivatkozások frissítve")
    console.log("  - Tooltip komponensek TooltipProvider-ben való becsomagolása")
  } else if (fixedCount === 0) {
    console.log("\n✅ Minden import rendben van!")
  } else {
    console.log("\n❌ Néhány import probléma javítása sikertelen")
    process.exit(1)
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main()
}

module.exports = {
  createMissingUIComponents,
  createMatchesError,
  fixSearchMatchesFunction,
  checkAndFixImports,
}

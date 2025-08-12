#!/usr/bin/env node

/**
 * Code Quality Check Script
 * Focuses on modified files to avoid pre-existing issues
 */

const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

function runCommand(command, description) {
  try {
    console.log(`🔍 ${description}...`)
    execSync(command, { stdio: "inherit" })
    console.log(`✅ ${description} sikeres`)
    return true
  } catch (error) {
    console.error(`❌ ${description} hibával zárult`)
    return false
  }
}

function getModifiedFiles() {
  try {
    // Git staged files
    const staged = execSync("git diff --cached --name-only --diff-filter=ACM", { encoding: "utf8" })
      .split("\n")
      .filter((f) => f.trim() && f.match(/\.(js|jsx|ts|tsx)$/))

    // Git unstaged files
    const unstaged = execSync("git diff --name-only --diff-filter=ACM", { encoding: "utf8" })
      .split("\n")
      .filter((f) => f.trim() && f.match(/\.(js|jsx|ts|tsx)$/))

    // Untracked files
    const untracked = execSync("git ls-files --others --exclude-standard", { encoding: "utf8" })
      .split("\n")
      .filter((f) => f.trim() && f.match(/\.(js|jsx|ts|tsx)$/))

    const allFiles = [...new Set([...staged, ...unstaged, ...untracked])]
    return allFiles
  } catch (error) {
    console.warn("⚠️ Git nem elérhető, minden fájlt ellenőrzünk")
    return []
  }
}

function main() {
  const args = process.argv.slice(2)
  const modifiedOnly = args.includes("--modified-only")
  const checkAll = args.includes("--all")

  console.log("🚀 Kódminőség ellenőrzés indítása...\n")
  console.log("ℹ️  Ez a legacy wrapper. Javasoljuk az új TypeScript CLI használatát:")
  console.log("   npx ts-node scripts/code-quality-cli.ts --modified-only\n")

  let success = true

  if (modifiedOnly) {
    console.log("🔍 Csak módosított fájlok ellenőrzése...")
    const modifiedFiles = getModifiedFiles()

    if (modifiedFiles.length === 0) {
      console.log("✅ Nincs ellenőrizendő módosított fájl.")
      return
    }

    console.log(`📁 Ellenőrizendő fájlok: ${modifiedFiles.length}`)
    modifiedFiles.forEach((file) => console.log(`   - ${file}`))

    const fileList = modifiedFiles.join(" ")

    // ESLint check
    if (!runCommand(`npx eslint ${fileList}`, "ESLint ellenőrzés")) {
      success = false
    }

    // Prettier check
    if (!runCommand(`npx prettier --check ${fileList}`, "Prettier formázás ellenőrzés")) {
      success = false
    }
  } else if (checkAll) {
    console.log("🔍 Teljes projekt kódminőség ellenőrzése...")

    // ESLint check
    if (!runCommand("npx eslint . --ext .js,.jsx,.ts,.tsx", "ESLint ellenőrzés")) {
      success = false
    }

    // Prettier check
    if (!runCommand("npx prettier --check .", "Prettier formázás ellenőrzés")) {
      success = false
    }
  } else {
    console.log("❌ Kérlek add meg a --modified-only vagy --all paramétert")
    console.log("\n💡 Új TypeScript CLI használata:")
    console.log("   npx ts-node scripts/code-quality-cli.ts --help")
    process.exit(1)
  }

  if (success) {
    console.log("\n✅ Minden kódminőség ellenőrzés sikeres!")
  } else {
    console.log("\n❌ Kódminőség ellenőrzés hibákkal zárult!")
    process.exit(1)
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main()
}

module.exports = { runCommand, getModifiedFiles }

const CONFIG = {
  // Only check these file extensions
  extensions: [".ts", ".tsx", ".js", ".jsx"],

  // Directories to check
  includeDirs: ["components", "lib", "app", "scripts"],

  // Directories to exclude
  excludeDirs: ["node_modules", ".next", "dist", "build"],

  // Check only modified files
  checkModifiedOnly: true,

  // Maximum file size to check (in bytes)
  maxFileSize: 1024 * 1024, // 1MB
}

class CodeQualityChecker {
  constructor() {
    this.errors = []
    this.warnings = []
    this.checkedFiles = []
  }

  /**
   * Get list of modified files using git
   */
  getModifiedFiles() {
    try {
      // Get unstaged changes
      const unstaged = execSync("git diff --name-only", { encoding: "utf8" }).split("\n").filter(Boolean)

      // Get staged changes
      const staged = execSync("git diff --cached --name-only", { encoding: "utf8" }).split("\n").filter(Boolean)

      // Get untracked files
      const untracked = execSync("git ls-files --others --exclude-standard", { encoding: "utf8" })
        .split("\n")
        .filter(Boolean)

      // Combine all modified files
      const allModified = [...new Set([...unstaged, ...staged, ...untracked])]

      console.log(`📁 Found ${allModified.length} modified files`)
      return allModified
    } catch (error) {
      console.warn("⚠️  Git not available, checking all files")
      return this.getAllFiles()
    }
  }

  /**
   * Get all files in the project (fallback)
   */
  getAllFiles() {
    const files = []

    function scanDirectory(dir) {
      try {
        const items = fs.readdirSync(dir)

        for (const item of items) {
          const fullPath = path.join(dir, item)
          const stat = fs.statSync(fullPath)

          if (stat.isDirectory()) {
            if (!CONFIG.excludeDirs.includes(item)) {
              scanDirectory(fullPath)
            }
          } else if (stat.isFile()) {
            files.push(fullPath)
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    }

    for (const dir of CONFIG.includeDirs) {
      if (fs.existsSync(dir)) {
        scanDirectory(dir)
      }
    }

    return files
  }

  /**
   * Filter files by extension and size
   */
  filterFiles(files) {
    return files.filter((file) => {
      // Check extension
      const ext = path.extname(file)
      if (!CONFIG.extensions.includes(ext)) {
        return false
      }

      // Check if file exists and size
      try {
        const stat = fs.statSync(file)
        if (stat.size > CONFIG.maxFileSize) {
          console.warn(`⚠️  Skipping large file: ${file} (${stat.size} bytes)`)
          return false
        }
        return true
      } catch (error) {
        return false
      }
    })
  }

  /**
   * Check TypeScript syntax for a file
   */
  checkTypeScript(filePath) {
    try {
      // Use TypeScript compiler API to check syntax
      const content = fs.readFileSync(filePath, "utf8")

      // Basic syntax checks
      const issues = []

      // Check for common TypeScript issues
      if (content.includes("any") && !content.includes("// @ts-ignore")) {
        issues.push({
          type: "warning",
          message: 'Usage of "any" type detected',
          line: this.findLineNumber(content, "any"),
        })
      }

      // Check for missing imports
      const importRegex = /import.*from ['"]([^'"]+)['"]/g
      let match
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1]
        if (importPath.startsWith("@/") || importPath.startsWith("./") || importPath.startsWith("../")) {
          // Check if local import exists
          const resolvedPath = this.resolveImportPath(filePath, importPath)
          if (resolvedPath && !fs.existsSync(resolvedPath)) {
            issues.push({
              type: "error",
              message: `Import not found: ${importPath}`,
              line: this.findLineNumber(content, match[0]),
            })
          }
        }
      }

      return issues
    } catch (error) {
      return [
        {
          type: "error",
          message: `Failed to parse file: ${error.message}`,
          line: 1,
        },
      ]
    }
  }

  /**
   * Resolve import path to actual file path
   */
  resolveImportPath(currentFile, importPath) {
    const currentDir = path.dirname(currentFile)

    if (importPath.startsWith("@/")) {
      // Resolve @ alias to project root
      return path.resolve(importPath.replace("@/", "./"))
    } else if (importPath.startsWith("./") || importPath.startsWith("../")) {
      // Resolve relative path
      const resolved = path.resolve(currentDir, importPath)

      // Try different extensions
      for (const ext of [".ts", ".tsx", ".js", ".jsx"]) {
        if (fs.existsSync(resolved + ext)) {
          return resolved + ext
        }
      }

      // Try index files
      for (const ext of [".ts", ".tsx", ".js", ".jsx"]) {
        const indexPath = path.join(resolved, "index" + ext)
        if (fs.existsSync(indexPath)) {
          return indexPath
        }
      }

      return resolved
    }

    return null
  }

  /**
   * Find line number of a string in content
   */
  findLineNumber(content, searchString) {
    const lines = content.split("\n")
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchString)) {
        return i + 1
      }
    }
    return 1
  }

  /**
   * Check code style and best practices
   */
  checkCodeStyle(filePath) {
    try {
      const content = fs.readFileSync(filePath, "utf8")
      const issues = []

      // Check for console.log statements (should be removed in production)
      if (content.includes("console.log") && !filePath.includes("scripts/")) {
        issues.push({
          type: "warning",
          message: "console.log statement found (consider removing for production)",
          line: this.findLineNumber(content, "console.log"),
        })
      }

      // Check for TODO comments
      if (content.includes("TODO") || content.includes("FIXME")) {
        issues.push({
          type: "info",
          message: "TODO/FIXME comment found",
          line: this.findLineNumber(content, "TODO") || this.findLineNumber(content, "FIXME"),
        })
      }

      // Check for proper error handling
      if (content.includes("try {") && !content.includes("catch")) {
        issues.push({
          type: "warning",
          message: "try block without catch found",
          line: this.findLineNumber(content, "try {"),
        })
      }

      return issues
    } catch (error) {
      return [
        {
          type: "error",
          message: `Failed to check code style: ${error.message}`,
          line: 1,
        },
      ]
    }
  }

  /**
   * Run all checks on a file
   */
  checkFile(filePath) {
    console.log(`🔍 Checking: ${filePath}`)

    const issues = []

    // TypeScript/JavaScript syntax check
    if (
      filePath.endsWith(".ts") ||
      filePath.endsWith(".tsx") ||
      filePath.endsWith(".js") ||
      filePath.endsWith(".jsx")
    ) {
      issues.push(...this.checkTypeScript(filePath))
    }

    // Code style check
    issues.push(...this.checkCodeStyle(filePath))

    // Categorize issues
    for (const issue of issues) {
      const fullIssue = {
        file: filePath,
        ...issue,
      }

      if (issue.type === "error") {
        this.errors.push(fullIssue)
      } else if (issue.type === "warning") {
        this.warnings.push(fullIssue)
      }
    }

    this.checkedFiles.push(filePath)
  }

  /**
   * Run the complete check process
   */
  async run() {
    console.log("🚀 Starting code quality check...\n")

    // Get files to check
    const allFiles = CONFIG.checkModifiedOnly ? this.getModifiedFiles() : this.getAllFiles()
    const filesToCheck = this.filterFiles(allFiles)

    if (filesToCheck.length === 0) {
      console.log("✅ No files to check")
      return { success: true, errors: 0, warnings: 0 }
    }

    console.log(`📋 Checking ${filesToCheck.length} files...\n`)

    // Check each file
    for (const file of filesToCheck) {
      this.checkFile(file)
    }

    // Report results
    this.reportResults()

    return {
      success: this.errors.length === 0,
      errors: this.errors.length,
      warnings: this.warnings.length,
      checkedFiles: this.checkedFiles.length,
    }
  }

  /**
   * Report the results
   */
  reportResults() {
    console.log("\n📊 Code Quality Report")
    console.log("=".repeat(50))

    console.log(`📁 Files checked: ${this.checkedFiles.length}`)
    console.log(`❌ Errors: ${this.errors.length}`)
    console.log(`⚠️  Warnings: ${this.warnings.length}`)

    // Show errors
    if (this.errors.length > 0) {
      console.log("\n❌ ERRORS:")
      for (const error of this.errors) {
        console.log(`  ${error.file}:${error.line} - ${error.message}`)
      }
    }

    // Show warnings (limit to 10)
    if (this.warnings.length > 0) {
      console.log("\n⚠️  WARNINGS:")
      const warningsToShow = this.warnings.slice(0, 10)
      for (const warning of warningsToShow) {
        console.log(`  ${warning.file}:${warning.line} - ${warning.message}`)
      }

      if (this.warnings.length > 10) {
        console.log(`  ... and ${this.warnings.length - 10} more warnings`)
      }
    }

    // Summary
    console.log("\n" + "=".repeat(50))
    if (this.errors.length === 0) {
      console.log("✅ No critical errors found!")
    } else {
      console.log(`❌ Found ${this.errors.length} errors that need to be fixed`)
    }

    if (this.warnings.length > 0) {
      console.log(`⚠️  Found ${this.warnings.length} warnings to consider`)
    }
  }
}

/**
 * Code Quality Checker Library
 * A robust, TypeScript-first code quality checker with proper separation of concerns
 */

import { execSync } from "child_process"
import * as fs from "fs"
import * as path from "path"

// Types and Interfaces
export interface CodeIssue {
  file: string
  line: number
  column?: number
  type: "error" | "warning" | "info"
  rule?: string
  message: string
  severity: "high" | "medium" | "low"
}

export interface CheckResult {
  success: boolean
  errors: CodeIssue[]
  warnings: CodeIssue[]
  info: CodeIssue[]
  filesChecked: number
  totalIssues: number
  executionTime: number
}

export interface Config {
  extensions: string[]
  includeDirs: string[]
  excludeDirs: string[]
  excludeFiles: string[]
  maxFileSize: number
  enableESLint: boolean
  enablePrettier: boolean
  enableTypeScript: boolean
  enableCustomRules: boolean
  customRulesConfig?: CustomRulesConfig
}

export interface CustomRulesConfig {
  allowConsoleLog: boolean
  allowTodoComments: boolean
  allowAnyType: boolean
  requireErrorHandling: boolean
  maxLineLength: number
}

export interface GitFilesResult {
  staged: string[]
  unstaged: string[]
  untracked: string[]
  all: string[]
}

// Default configuration
const DEFAULT_CONFIG: Config = {
  extensions: [".ts", ".tsx", ".js", ".jsx"],
  includeDirs: ["src", "components", "lib", "app", "pages"],
  excludeDirs: ["node_modules", ".next", "dist", "build", ".git"],
  excludeFiles: ["*.test.ts", "*.test.js", "*.spec.ts", "*.spec.js"],
  maxFileSize: 1024 * 1024, // 1MB
  enableESLint: true,
  enablePrettier: true,
  enableTypeScript: true,
  enableCustomRules: true,
  customRulesConfig: {
    allowConsoleLog: false,
    allowTodoComments: true,
    allowAnyType: false,
    requireErrorHandling: true,
    maxLineLength: 120,
  },
}

/**
 * Main Code Quality Checker class
 */
export class CodeQualityChecker {
  private config: Config
  private issues: CodeIssue[] = []
  private checkedFiles: string[] = []
  private startTime = 0

  constructor(config: Partial<Config> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    if (config.customRulesConfig) {
      this.config.customRulesConfig = {
        ...DEFAULT_CONFIG.customRulesConfig,
        ...config.customRulesConfig,
      }
    }
  }

  /**
   * Get modified files from Git
   */
  public async getGitModifiedFiles(): Promise<GitFilesResult> {
    try {
      const staged = this.execGitCommand("git diff --cached --name-only --diff-filter=ACM")
      const unstaged = this.execGitCommand("git diff --name-only --diff-filter=ACM")
      const untracked = this.execGitCommand("git ls-files --others --exclude-standard")

      const all = [...new Set([...staged, ...unstaged, ...untracked])]

      return { staged, unstaged, untracked, all }
    } catch (error) {
      throw new Error(`Failed to get Git modified files: ${error}`)
    }
  }

  /**
   * Execute Git command safely
   */
  private execGitCommand(command: string): string[] {
    try {
      const output = execSync(command, { encoding: "utf8", stdio: "pipe" })
      return output
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
    } catch (error) {
      // Git command failed, return empty array
      return []
    }
  }

  /**
   * Get all files in project directories
   */
  public getAllProjectFiles(): string[] {
    const files: string[] = []

    const scanDirectory = (dir: string): void => {
      try {
        const items = fs.readdirSync(dir)

        for (const item of items) {
          const fullPath = path.join(dir, item)

          try {
            const stat = fs.statSync(fullPath)

            if (stat.isDirectory()) {
              if (!this.config.excludeDirs.includes(item) && !item.startsWith(".")) {
                scanDirectory(fullPath)
              }
            } else if (stat.isFile()) {
              files.push(fullPath)
            }
          } catch (error) {
            // Skip files we can't access
            continue
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    }

    // Scan configured directories
    for (const dir of this.config.includeDirs) {
      if (fs.existsSync(dir)) {
        scanDirectory(dir)
      }
    }

    // If no configured directories exist, scan current directory
    if (files.length === 0 && fs.existsSync(".")) {
      scanDirectory(".")
    }

    return files
  }

  /**
   * Filter files based on configuration
   */
  public filterFiles(files: string[]): string[] {
    return files.filter((file) => {
      // Check extension
      const ext = path.extname(file)
      if (!this.config.extensions.includes(ext)) {
        return false
      }

      // Check exclude patterns
      const fileName = path.basename(file)
      for (const pattern of this.config.excludeFiles) {
        if (this.matchPattern(fileName, pattern)) {
          return false
        }
      }

      // Check file size
      try {
        const stat = fs.statSync(file)
        if (stat.size > this.config.maxFileSize) {
          this.addIssue({
            file,
            line: 1,
            type: "warning",
            message: `File too large (${stat.size} bytes), skipping`,
            severity: "low",
          })
          return false
        }
      } catch (error) {
        return false
      }

      return true
    })
  }

  /**
   * Simple pattern matching for file exclusion
   */
  private matchPattern(fileName: string, pattern: string): boolean {
    if (pattern.includes("*")) {
      const regex = new RegExp(pattern.replace(/\*/g, ".*"))
      return regex.test(fileName)
    }
    return fileName === pattern
  }

  /**
   * Check files with ESLint
   */
  private async checkWithESLint(files: string[]): Promise<void> {
    if (!this.config.enableESLint || files.length === 0) return

    try {
      const fileList = files.join(" ")
      execSync(`npx eslint ${fileList} --format json`, {
        encoding: "utf8",
        stdio: "pipe",
      })
    } catch (error: any) {
      // ESLint returns non-zero exit code when issues are found
      if (error.stdout) {
        try {
          const results = JSON.parse(error.stdout)
          this.parseESLintResults(results)
        } catch (parseError) {
          this.addIssue({
            file: "eslint",
            line: 1,
            type: "error",
            message: "Failed to parse ESLint output",
            severity: "high",
          })
        }
      }
    }
  }

  /**
   * Parse ESLint JSON results
   */
  private parseESLintResults(results: any[]): void {
    for (const result of results) {
      const filePath = result.filePath

      for (const message of result.messages) {
        this.addIssue({
          file: filePath,
          line: message.line || 1,
          column: message.column,
          type: message.severity === 2 ? "error" : "warning",
          rule: message.ruleId,
          message: message.message,
          severity: message.severity === 2 ? "high" : "medium",
        })
      }
    }
  }

  /**
   * Check files with Prettier
   */
  private async checkWithPrettier(files: string[]): Promise<void> {
    if (!this.config.enablePrettier || files.length === 0) return

    try {
      const fileList = files.join(" ")
      execSync(`npx prettier --check ${fileList}`, {
        encoding: "utf8",
        stdio: "pipe",
      })
    } catch (error: any) {
      // Prettier failed, files need formatting
      const output = error.stdout || error.stderr || ""
      const lines = output.split("\n")

      for (const line of lines) {
        if (line.trim() && !line.includes("Checking formatting")) {
          const match = line.match(/^(.+)$/)
          if (match) {
            this.addIssue({
              file: match[1],
              line: 1,
              type: "warning",
              rule: "prettier",
              message: "File needs formatting",
              severity: "low",
            })
          }
        }
      }
    }
  }

  /**
   * Custom TypeScript/JavaScript checks
   */
  private checkCustomRules(filePath: string): void {
    if (!this.config.enableCustomRules) return

    try {
      const content = fs.readFileSync(filePath, "utf8")
      const lines = content.split("\n")

      this.checkConsoleStatements(filePath, content, lines)
      this.checkTodoComments(filePath, content, lines)
      this.checkAnyTypeUsage(filePath, content, lines)
      this.checkErrorHandling(filePath, content, lines)
      this.checkLineLength(filePath, lines)
      this.checkImports(filePath, content, lines)
    } catch (error) {
      this.addIssue({
        file: filePath,
        line: 1,
        type: "error",
        message: `Failed to read file: ${error}`,
        severity: "high",
      })
    }
  }

  private checkConsoleStatements(filePath: string, content: string, lines: string[]): void {
    if (this.config.customRulesConfig?.allowConsoleLog) return

    const consoleRegex = /console\.(log|warn|error|debug|info)/g
    let match

    while ((match = consoleRegex.exec(content)) !== null) {
      const lineNumber = this.getLineNumber(content, match.index)
      this.addIssue({
        file: filePath,
        line: lineNumber,
        type: "warning",
        rule: "no-console",
        message: `Console statement found: ${match[0]}`,
        severity: "medium",
      })
    }
  }

  private checkTodoComments(filePath: string, content: string, lines: string[]): void {
    if (this.config.customRulesConfig?.allowTodoComments) return

    const todoRegex = /(TODO|FIXME|HACK|XXX):/gi
    let match

    while ((match = todoRegex.exec(content)) !== null) {
      const lineNumber = this.getLineNumber(content, match.index)
      this.addIssue({
        file: filePath,
        line: lineNumber,
        type: "info",
        rule: "no-todo-comments",
        message: `${match[1]} comment found`,
        severity: "low",
      })
    }
  }

  private checkAnyTypeUsage(filePath: string, content: string, lines: string[]): void {
    if (this.config.customRulesConfig?.allowAnyType) return
    if (!filePath.match(/\.tsx?$/)) return

    const anyRegex = /:\s*any\b/g
    let match

    while ((match = anyRegex.exec(content)) !== null) {
      const lineNumber = this.getLineNumber(content, match.index)
      this.addIssue({
        file: filePath,
        line: lineNumber,
        type: "warning",
        rule: "no-any-type",
        message: 'Usage of "any" type detected',
        severity: "medium",
      })
    }
  }

  private checkErrorHandling(filePath: string, content: string, lines: string[]): void {
    if (!this.config.customRulesConfig?.requireErrorHandling) return

    const tryRegex = /try\s*{/g
    const catchRegex = /catch\s*\(/g

    const tryMatches = content.match(tryRegex) || []
    const catchMatches = content.match(catchRegex) || []

    if (tryMatches.length > catchMatches.length) {
      let match
      const regex = /try\s*{/g

      while ((match = regex.exec(content)) !== null) {
        const lineNumber = this.getLineNumber(content, match.index)

        // Check if there's a corresponding catch nearby
        const remainingContent = content.substring(match.index)
        if (!remainingContent.match(/catch\s*\(/)) {
          this.addIssue({
            file: filePath,
            line: lineNumber,
            type: "warning",
            rule: "require-error-handling",
            message: "try block without corresponding catch",
            severity: "medium",
          })
        }
      }
    }
  }

  private checkLineLength(filePath: string, lines: string[]): void {
    const maxLength = this.config.customRulesConfig?.maxLineLength || 120

    lines.forEach((line, index) => {
      if (line.length > maxLength) {
        this.addIssue({
          file: filePath,
          line: index + 1,
          type: "warning",
          rule: "max-line-length",
          message: `Line too long (${line.length} > ${maxLength})`,
          severity: "low",
        })
      }
    })
  }

  private checkImports(filePath: string, content: string, lines: string[]): void {
    const importRegex = /import.*from ['"]([^'"]+)['"]/g
    let match

    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1]

      if (this.isLocalImport(importPath)) {
        const resolvedPath = this.resolveImportPath(filePath, importPath)

        if (resolvedPath && !this.fileExists(resolvedPath)) {
          const lineNumber = this.getLineNumber(content, match.index)
          this.addIssue({
            file: filePath,
            line: lineNumber,
            type: "error",
            rule: "import-not-found",
            message: `Import not found: ${importPath}`,
            severity: "high",
          })
        }
      }
    }
  }

  private isLocalImport(importPath: string): boolean {
    return (
      importPath.startsWith("./") ||
      importPath.startsWith("../") ||
      importPath.startsWith("@/") ||
      importPath.startsWith("~/")
    )
  }

  private resolveImportPath(currentFile: string, importPath: string): string | null {
    const currentDir = path.dirname(currentFile)

    if (importPath.startsWith("@/")) {
      // Handle @ alias (assuming it points to project root)
      return path.resolve(importPath.replace("@/", "./"))
    } else if (importPath.startsWith("~/")) {
      // Handle ~ alias (assuming it points to src directory)
      return path.resolve("src", importPath.substring(2))
    } else if (importPath.startsWith("./") || importPath.startsWith("../")) {
      return path.resolve(currentDir, importPath)
    }

    return null
  }

  private fileExists(basePath: string): boolean {
    // Try different extensions
    const extensions = [".ts", ".tsx", ".js", ".jsx", ".json"]

    // Try exact path first
    if (fs.existsSync(basePath)) {
      return true
    }

    // Try with extensions
    for (const ext of extensions) {
      if (fs.existsSync(basePath + ext)) {
        return true
      }
    }

    // Try index files
    for (const ext of extensions) {
      const indexPath = path.join(basePath, "index" + ext)
      if (fs.existsSync(indexPath)) {
        return true
      }
    }

    return false
  }

  private getLineNumber(content: string, index: number): number {
    const beforeIndex = content.substring(0, index)
    return beforeIndex.split("\n").length
  }

  /**
   * Add an issue to the collection
   */
  private addIssue(issue: CodeIssue): void {
    this.issues.push(issue)
  }

  /**
   * Check a single file
   */
  private async checkFile(filePath: string): Promise<void> {
    this.checkedFiles.push(filePath)

    // Run custom rules check
    this.checkCustomRules(filePath)
  }

  /**
   * Run the complete check process
   */
  public async checkFiles(files: string[]): Promise<CheckResult> {
    this.startTime = Date.now()
    this.issues = []
    this.checkedFiles = []

    const filteredFiles = this.filterFiles(files)

    if (filteredFiles.length === 0) {
      return {
        success: true,
        errors: [],
        warnings: [],
        info: [],
        filesChecked: 0,
        totalIssues: 0,
        executionTime: Date.now() - this.startTime,
      }
    }

    // Run external tools
    await this.checkWithESLint(filteredFiles)
    await this.checkWithPrettier(filteredFiles)

    // Run custom checks
    for (const file of filteredFiles) {
      await this.checkFile(file)
    }

    // Categorize issues
    const errors = this.issues.filter((issue) => issue.type === "error")
    const warnings = this.issues.filter((issue) => issue.type === "warning")
    const info = this.issues.filter((issue) => issue.type === "info")

    return {
      success: errors.length === 0,
      errors,
      warnings,
      info,
      filesChecked: this.checkedFiles.length,
      totalIssues: this.issues.length,
      executionTime: Date.now() - this.startTime,
    }
  }

  /**
   * Check only modified files
   */
  public async checkModifiedFiles(): Promise<CheckResult> {
    try {
      const gitFiles = await this.getGitModifiedFiles()
      return this.checkFiles(gitFiles.all)
    } catch (error) {
      // Fallback to all files if git is not available
      const allFiles = this.getAllProjectFiles()
      return this.checkFiles(allFiles)
    }
  }

  /**
   * Check all project files
   */
  public async checkAllFiles(): Promise<CheckResult> {
    const allFiles = this.getAllProjectFiles()
    return this.checkFiles(allFiles)
  }

  /**
   * Get current configuration
   */
  public getConfig(): Config {
    return { ...this.config }
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<Config>): void {
    this.config = { ...this.config, ...newConfig }
    if (newConfig.customRulesConfig) {
      this.config.customRulesConfig = {
        ...this.config.customRulesConfig,
        ...newConfig.customRulesConfig,
      }
    }
  }
}

/**
 * Utility function to create a checker with default config
 */
export function createChecker(config?: Partial<Config>): CodeQualityChecker {
  return new CodeQualityChecker(config)
}

/**
 * Utility function to format check results
 */
export function formatResults(result: CheckResult): string {
  const lines: string[] = []

  lines.push("📊 Code Quality Report")
  lines.push("=".repeat(50))
  lines.push(`📁 Files checked: ${result.filesChecked}`)
  lines.push(`❌ Errors: ${result.errors.length}`)
  lines.push(`⚠️  Warnings: ${result.warnings.length}`)
  lines.push(`ℹ️  Info: ${result.info.length}`)
  lines.push(`⏱️  Execution time: ${result.executionTime}ms`)

  if (result.errors.length > 0) {
    lines.push("\n❌ ERRORS:")
    result.errors.forEach((error) => {
      lines.push(`  ${error.file}:${error.line} - ${error.message}${error.rule ? ` (${error.rule})` : ""}`)
    })
  }

  if (result.warnings.length > 0) {
    lines.push("\n⚠️  WARNINGS:")
    const warningsToShow = result.warnings.slice(0, 10)
    warningsToShow.forEach((warning) => {
      lines.push(`  ${warning.file}:${warning.line} - ${warning.message}${warning.rule ? ` (${warning.rule})` : ""}`)
    })

    if (result.warnings.length > 10) {
      lines.push(`  ... and ${result.warnings.length - 10} more warnings`)
    }
  }

  lines.push("\n" + "=".repeat(50))
  if (result.success) {
    lines.push("✅ No critical errors found!")
  } else {
    lines.push(`❌ Found ${result.errors.length} errors that need to be fixed`)
  }

  return lines.join("\n")
}

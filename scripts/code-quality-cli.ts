#!/usr/bin/env node

/**
 * Code Quality Check CLI
 * Command-line interface for the code quality checker
 */

import { Command } from "commander"
import { CodeQualityChecker, type Config, formatResults } from "../lib/codeQualityLib"
import * as fs from "fs"
import * as path from "path"

interface CLIOptions {
  modifiedOnly: boolean
  all: boolean
  config?: string
  eslint: boolean
  prettier: boolean
  typescript: boolean
  customRules: boolean
  verbose: boolean
  output?: string
  exitCode: boolean
}

class CodeQualityCLI {
  private program: Command
  private checker: CodeQualityChecker

  constructor() {
    this.program = new Command()
    this.setupCLI()
    this.checker = new CodeQualityChecker()
  }

  private setupCLI(): void {
    this.program
      .name("code-quality-check")
      .description("Advanced code quality checker with TypeScript support")
      .version("2.0.0")

    this.program
      .option("-m, --modified-only", "Check only modified files (Git)", false)
      .option("-a, --all", "Check all project files", false)
      .option("-c, --config <path>", "Path to configuration file")
      .option("--no-eslint", "Disable ESLint checking")
      .option("--no-prettier", "Disable Prettier checking")
      .option("--no-typescript", "Disable TypeScript checking")
      .option("--no-custom-rules", "Disable custom rule checking")
      .option("-v, --verbose", "Enable verbose output", false)
      .option("-o, --output <path>", "Write results to file")
      .option("--no-exit-code", "Don't exit with error code on issues")
      .helpOption("-h, --help", "Display help information")

    this.program.action(async (options: CLIOptions) => {
      await this.run(options)
    })
  }

  private async loadConfig(configPath?: string): Promise<Partial<Config>> {
    if (!configPath) {
      // Try to find config file in common locations
      const possiblePaths = [
        ".codequalityrc.json",
        ".codequalityrc.js",
        "codequality.config.json",
        "codequality.config.js",
      ]

      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          configPath = possiblePath
          break
        }
      }
    }

    if (!configPath || !fs.existsSync(configPath)) {
      return {}
    }

    try {
      if (configPath.endsWith(".js")) {
        // For .js config files, we'd need to require them
        // For simplicity, we'll just handle JSON for now
        console.warn("⚠️  JavaScript config files not yet supported, using defaults")
        return {}
      } else {
        const configContent = fs.readFileSync(configPath, "utf8")
        return JSON.parse(configContent)
      }
    } catch (error) {
      console.error(`❌ Failed to load config from ${configPath}: ${error}`)
      process.exit(1)
    }
  }

  private mergeConfigWithOptions(config: Partial<Config>, options: CLIOptions): Partial<Config> {
    return {
      ...config,
      enableESLint: options.eslint,
      enablePrettier: options.prettier,
      enableTypeScript: options.typescript,
      enableCustomRules: options.customRules,
    }
  }

  private async run(options: CLIOptions): Promise<void> {
    try {
      console.log("🚀 Starting code quality check...\n")

      // Validate options
      if (!options.modifiedOnly && !options.all) {
        console.error("❌ Please specify either --modified-only or --all")
        this.program.help()
        return
      }

      if (options.modifiedOnly && options.all) {
        console.error("❌ Cannot use both --modified-only and --all options")
        process.exit(1)
      }

      // Load configuration
      const config = await this.loadConfig(options.config)
      const finalConfig = this.mergeConfigWithOptions(config, options)

      if (options.verbose) {
        console.log("📋 Configuration:")
        console.log(JSON.stringify(finalConfig, null, 2))
        console.log("")
      }

      // Update checker configuration
      this.checker.updateConfig(finalConfig)

      // Run checks
      let result
      if (options.modifiedOnly) {
        console.log("🔍 Checking modified files only...")
        result = await this.checker.checkModifiedFiles()
      } else {
        console.log("🔍 Checking all project files...")
        result = await this.checker.checkAllFiles()
      }

      // Format and display results
      const formattedResults = formatResults(result)
      console.log("\n" + formattedResults)

      // Write to file if requested
      if (options.output) {
        await this.writeResultsToFile(options.output, result, formattedResults)
      }

      // Exit with appropriate code
      if (options.exitCode && !result.success) {
        console.log("\n❌ Exiting with error code due to issues found")
        process.exit(1)
      } else {
        console.log("\n✅ Code quality check completed")
        process.exit(0)
      }
    } catch (error) {
      console.error(`❌ Unexpected error: ${error}`)
      if (options.verbose) {
        console.error(error)
      }
      process.exit(1)
    }
  }

  private async writeResultsToFile(outputPath: string, result: any, formattedResults: string): Promise<void> {
    try {
      const outputDir = path.dirname(outputPath)

      // Create directory if it doesn't exist
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }

      // Determine format based on extension
      const ext = path.extname(outputPath).toLowerCase()

      if (ext === ".json") {
        fs.writeFileSync(outputPath, JSON.stringify(result, null, 2))
      } else {
        fs.writeFileSync(outputPath, formattedResults)
      }

      console.log(`📄 Results written to: ${outputPath}`)
    } catch (error) {
      console.error(`❌ Failed to write results to file: ${error}`)
    }
  }

  public async execute(argv: string[] = process.argv): Promise<void> {
    await this.program.parseAsync(argv)
  }
}

// Execute CLI if this file is run directly
if (require.main === module) {
  const cli = new CodeQualityCLI()
  cli.execute().catch((error) => {
    console.error("❌ CLI execution failed:", error)
    process.exit(1)
  })
}

export { CodeQualityCLI }

#!/usr/bin/env tsx

/**
 * Production Deployment Script for AlmstkshfBlog
 * 
 * This script orchestrates the complete deployment process:
 * 1. Environment validation
 * 2. Database migration and seeding
 * 3. Build process
 * 4. Deployment verification
 * 5. Health checks
 */

import dotenv from "dotenv";
dotenv.config();

import { execSync } from "child_process";
import { DatabaseMigrator } from "./db-migrate";
import { seedDatabase } from "./db-seed";
import { DeploymentVerifier } from "./verify-deployment";

interface DeploymentOptions {
  skipBuild?: boolean;
  skipSeed?: boolean;
  skipVerify?: boolean;
  force?: boolean;
  verbose?: boolean;
  dryRun?: boolean;
}

class ProductionDeployer {
  private verbose: boolean;
  private dryRun: boolean;

  constructor(options: DeploymentOptions = {}) {
    this.verbose = options.verbose || false;
    this.dryRun = options.dryRun || false;
  }

  private log(message: string) {
    console.log(`[DEPLOY] ${message}`);
  }

  private error(message: string) {
    console.error(`[DEPLOY ERROR] ${message}`);
  }

  private success(message: string) {
    console.log(`[DEPLOY SUCCESS] ${message}`);
  }

  private async executeCommand(command: string, description: string): Promise<boolean> {
    try {
      this.log(`${description}...`);
      
      if (this.dryRun) {
        this.log(`DRY RUN: Would execute: ${command}`);
        return true;
      }

      execSync(command, { 
        stdio: this.verbose ? "inherit" : "pipe",
        cwd: process.cwd()
      });
      
      this.success(`${description} completed`);
      return true;
    } catch (error) {
      this.error(`${description} failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Validate environment for production deployment
   */
  async validateEnvironment(): Promise<boolean> {
    this.log("Validating environment for production deployment...");

    const requiredEnvVars = [
      "DATABASE_URL",
      "NODE_ENV"
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      this.error(`Missing required environment variables: ${missingVars.join(", ")}`);
      return false;
    }

    // Validate NODE_ENV
    if (process.env.NODE_ENV !== "production") {
      this.error(`NODE_ENV must be set to "production", currently: ${process.env.NODE_ENV}`);
      return false;
    }

    // Validate DATABASE_URL format
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl.startsWith("postgresql://")) {
      this.error("DATABASE_URL must be a valid PostgreSQL connection string");
      return false;
    }

    this.success("Environment validation passed");
    return true;
  }

  /**
   * Run database migration and seeding
   */
  async setupDatabase(options: DeploymentOptions): Promise<boolean> {
    this.log("Setting up database...");

    if (this.dryRun) {
      this.log("DRY RUN: Would migrate database and seed data");
      return true;
    }

    try {
      // Run migration
      const migrator = new DatabaseMigrator({ verbose: this.verbose });
      const migrationSuccess = await migrator.migrate({
        seed: !options.skipSeed,
        force: options.force,
        verbose: this.verbose
      });

      if (!migrationSuccess) {
        this.error("Database migration failed");
        return false;
      }

      this.success("Database setup completed");
      return true;
    } catch (error) {
      this.error(`Database setup failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Build the application
   */
  async buildApplication(options: DeploymentOptions): Promise<boolean> {
    if (options.skipBuild) {
      this.log("Skipping build process");
      return true;
    }

    this.log("Building application...");

    // Install dependencies
    if (!(await this.executeCommand("npm ci", "Installing dependencies"))) {
      return false;
    }

    // Type checking
    if (!(await this.executeCommand("npm run check", "Type checking"))) {
      return false;
    }

    // Build client and functions
    if (!(await this.executeCommand("npm run build", "Building application"))) {
      return false;
    }

    this.success("Application build completed");
    return true;
  }

  /**
   * Run deployment verification
   */
  async verifyDeployment(options: DeploymentOptions): Promise<boolean> {
    if (options.skipVerify) {
      this.log("Skipping deployment verification");
      return true;
    }

    this.log("Running deployment verification...");

    if (this.dryRun) {
      this.log("DRY RUN: Would run deployment verification");
      return true;
    }

    try {
      const verifier = new DeploymentVerifier({ verbose: this.verbose });
      const verificationSuccess = await verifier.verify({ skipApi: true }); // Skip API tests in production deployment

      if (!verificationSuccess) {
        this.error("Deployment verification failed");
        return false;
      }

      this.success("Deployment verification passed");
      return true;
    } catch (error) {
      this.error(`Deployment verification failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Generate deployment summary
   */
  generateDeploymentSummary(): void {
    console.log("\n" + "=".repeat(60));
    console.log("PRODUCTION DEPLOYMENT SUMMARY");
    console.log("=".repeat(60));
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Database: ${process.env.DATABASE_URL?.split("@")[1]?.split("/")[0] || "Unknown"}`);
    console.log(`Site URL: ${process.env.SITE_URL || "Not configured"}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log("=".repeat(60));
  }

  /**
   * Run complete deployment process
   */
  async deploy(options: DeploymentOptions = {}): Promise<boolean> {
    console.log("🚀 Starting AlmstkshfBlog Production Deployment...\n");

    if (this.dryRun) {
      console.log("🔍 DRY RUN MODE - No actual changes will be made\n");
    }

    // Step 1: Validate environment
    if (!(await this.validateEnvironment())) {
      return false;
    }

    // Step 2: Setup database
    if (!(await this.setupDatabase(options))) {
      return false;
    }

    // Step 3: Build application
    if (!(await this.buildApplication(options))) {
      return false;
    }

    // Step 4: Verify deployment
    if (!(await this.verifyDeployment(options))) {
      return false;
    }

    // Generate summary
    this.generateDeploymentSummary();

    console.log("\n🎉 PRODUCTION DEPLOYMENT SUCCESSFUL!");
    console.log("Your AlmstkshfBlog is ready for production use.");
    
    if (!this.dryRun) {
      console.log("\nNext steps:");
      console.log("1. Deploy to Netlify: netlify deploy --prod");
      console.log("2. Configure custom domain (if needed)");
      console.log("3. Set up monitoring and alerts");
      console.log("4. Run post-deployment verification");
    }

    return true;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options: DeploymentOptions = {
    skipBuild: args.includes("--skip-build"),
    skipSeed: args.includes("--skip-seed"),
    skipVerify: args.includes("--skip-verify"),
    force: args.includes("--force"),
    verbose: args.includes("--verbose") || args.includes("-v"),
    dryRun: args.includes("--dry-run")
  };

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Production Deployment Tool for AlmstkshfBlog

Usage: tsx scripts/deploy-production.ts [options]

Options:
  --skip-build       Skip the build process
  --skip-seed        Skip database seeding
  --skip-verify      Skip deployment verification
  --force            Force operations even if data exists
  --verbose          Enable verbose logging
  -v                 Short for --verbose
  --dry-run          Show what would be done without making changes
  --help             Show this help message
  -h                 Short for --help

Examples:
  tsx scripts/deploy-production.ts                    # Full deployment
  tsx scripts/deploy-production.ts --verbose          # Verbose output
  tsx scripts/deploy-production.ts --dry-run          # Preview deployment
  tsx scripts/deploy-production.ts --skip-build       # Skip build step
  tsx scripts/deploy-production.ts --force --verbose  # Force deployment with verbose output

Prerequisites:
  - NODE_ENV=production
  - DATABASE_URL configured
  - All dependencies installed
  - Netlify CLI configured (for final deployment)
`);
    process.exit(0);
  }

  // Confirm production deployment
  if (!options.dryRun && process.env.NODE_ENV === "production") {
    console.log("⚠️  You are about to deploy to PRODUCTION environment.");
    console.log("This will modify your production database and deploy live code.");
    console.log("Press Ctrl+C to cancel, or any key to continue...");
    
    // Wait for user confirmation (simplified for script)
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });
  }

  const deployer = new ProductionDeployer(options);
  const success = await deployer.deploy(options);
  
  process.exit(success ? 0 : 1);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
}

export { ProductionDeployer };
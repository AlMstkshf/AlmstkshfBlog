#!/usr/bin/env tsx

/**
 * Database Migration Script for AlmstkshfBlog
 * 
 * This script handles:
 * - Database schema creation/updates using Drizzle
 * - Initial data seeding (categories and articles)
 * - Production deployment verification
 */

import dotenv from "dotenv";
dotenv.config();

import { db } from "../server/db";
import { categories, articles } from "../shared/schema";
import { eq, count } from "drizzle-orm";
import { execSync } from "child_process";

interface MigrationOptions {
  seed?: boolean;
  force?: boolean;
  verbose?: boolean;
}

class DatabaseMigrator {
  private verbose: boolean;

  constructor(options: MigrationOptions = {}) {
    this.verbose = options.verbose || false;
  }

  private log(message: string) {
    if (this.verbose) {
      console.log(`[DB-MIGRATE] ${message}`);
    }
  }

  private error(message: string) {
    console.error(`[DB-MIGRATE ERROR] ${message}`);
  }

  private success(message: string) {
    console.log(`[DB-MIGRATE SUCCESS] ${message}`);
  }

  /**
   * Push schema changes to database using Drizzle Kit
   */
  async pushSchema(): Promise<boolean> {
    try {
      this.log("Pushing database schema changes...");
      
      // Use drizzle-kit push to sync schema
      execSync("npm run db:push", { 
        stdio: this.verbose ? "inherit" : "pipe",
        cwd: process.cwd()
      });
      
      this.success("Database schema updated successfully");
      return true;
    } catch (error) {
      this.error(`Schema push failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Verify database connection and basic operations
   */
  async verifyConnection(): Promise<boolean> {
    try {
      this.log("Verifying database connection...");
      
      // Test basic query
      const result = await db.select().from(categories).limit(1);
      
      this.success("Database connection verified");
      return true;
    } catch (error) {
      this.error(`Database connection failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if initial data already exists
   */
  async checkExistingData(): Promise<{ categories: number; articles: number }> {
    try {
      const [categoryCount] = await db
        .select({ count: count() })
        .from(categories);
      
      const [articleCount] = await db
        .select({ count: count() })
        .from(articles);

      return {
        categories: categoryCount?.count || 0,
        articles: articleCount?.count || 0
      };
    } catch (error) {
      this.error(`Failed to check existing data: ${error.message}`);
      return { categories: 0, articles: 0 };
    }
  }

  /**
   * Run complete migration process
   */
  async migrate(options: MigrationOptions = {}): Promise<boolean> {
    this.log("Starting database migration...");

    // Step 1: Verify connection
    if (!(await this.verifyConnection())) {
      return false;
    }

    // Step 2: Push schema changes
    if (!(await this.pushSchema())) {
      return false;
    }

    // Step 3: Check existing data
    const existingData = await this.checkExistingData();
    this.log(`Found ${existingData.categories} categories and ${existingData.articles} articles`);

    // Step 4: Seed data if requested and needed
    if (options.seed) {
      if (existingData.categories === 0 || existingData.articles === 0 || options.force) {
        this.log("Seeding initial data...");
        // Import and run seeder (will be created next)
        const { seedDatabase } = await import("./db-seed");
        const seedSuccess = await seedDatabase({ force: options.force, verbose: this.verbose });
        
        if (!seedSuccess) {
          this.error("Data seeding failed");
          return false;
        }
      } else {
        this.log("Data already exists, skipping seeding (use --force to override)");
      }
    }

    this.success("Database migration completed successfully");
    return true;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options: MigrationOptions = {
    seed: args.includes("--seed"),
    force: args.includes("--force"),
    verbose: args.includes("--verbose") || args.includes("-v")
  };

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Database Migration Tool for AlmstkshfBlog

Usage: tsx scripts/db-migrate.ts [options]

Options:
  --seed     Seed initial data (categories and articles)
  --force    Force seeding even if data exists
  --verbose  Enable verbose logging
  -v         Short for --verbose
  --help     Show this help message
  -h         Short for --help

Examples:
  tsx scripts/db-migrate.ts                    # Just migrate schema
  tsx scripts/db-migrate.ts --seed             # Migrate and seed data
  tsx scripts/db-migrate.ts --seed --force -v  # Force seed with verbose output
`);
    process.exit(0);
  }

  const migrator = new DatabaseMigrator(options);
  const success = await migrator.migrate(options);
  
  process.exit(success ? 0 : 1);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
}

export { DatabaseMigrator };
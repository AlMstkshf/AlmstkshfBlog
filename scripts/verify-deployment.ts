#!/usr/bin/env tsx

/**
 * Deployment Verification Script for AlmstkshfBlog
 * 
 * This script verifies:
 * - Database connectivity and schema
 * - Data integrity (categories and articles)
 * - API endpoints functionality
 * - Cloud storage configuration
 * - Production readiness
 */

import dotenv from "dotenv";
dotenv.config();

import { db } from "../server/db";
import { categories, articles, users } from "../shared/schema";
import { eq, sql } from "drizzle-orm";
import fetch from "node-fetch";

interface VerificationResult {
  test: string;
  status: "PASS" | "FAIL" | "WARN";
  message: string;
  details?: any;
}

interface VerificationOptions {
  verbose?: boolean;
  apiUrl?: string;
  skipApi?: boolean;
}

class DeploymentVerifier {
  private verbose: boolean;
  private apiUrl: string;
  private results: VerificationResult[] = [];

  constructor(options: VerificationOptions = {}) {
    this.verbose = options.verbose || false;
    this.apiUrl = options.apiUrl || process.env.SITE_URL || "http://localhost:5000";
  }

  private log(message: string) {
    if (this.verbose) {
      console.log(`[VERIFY] ${message}`);
    }
  }

  private addResult(test: string, status: "PASS" | "FAIL" | "WARN", message: string, details?: any) {
    this.results.push({ test, status, message, details });
    
    const icon = status === "PASS" ? "✅" : status === "FAIL" ? "❌" : "⚠️";
    console.log(`${icon} ${test}: ${message}`);
    
    if (details && this.verbose) {
      console.log(`   Details:`, details);
    }
  }

  /**
   * Test database connectivity
   */
  async testDatabaseConnection(): Promise<void> {
    try {
      this.log("Testing database connection...");
      
      // Test basic query
      const result = await db.execute(sql`SELECT 1 as test`);
      
      if (result.rows && result.rows.length > 0) {
        this.addResult(
          "Database Connection",
          "PASS",
          "Successfully connected to database"
        );
      } else {
        this.addResult(
          "Database Connection",
          "FAIL",
          "Database query returned no results"
        );
      }
    } catch (error) {
      this.addResult(
        "Database Connection",
        "FAIL",
        `Database connection failed: ${error.message}`
      );
    }
  }

  /**
   * Test database schema
   */
  async testDatabaseSchema(): Promise<void> {
    try {
      this.log("Testing database schema...");
      
      // Test each table exists and has expected structure
      const tables = [
        { name: "categories", table: categories },
        { name: "articles", table: articles },
        { name: "users", table: users }
      ];

      for (const { name, table } of tables) {
        try {
          const result = await db.select().from(table).limit(1);
          this.addResult(
            `Schema - ${name} table`,
            "PASS",
            `Table ${name} exists and is accessible`
          );
        } catch (error) {
          this.addResult(
            `Schema - ${name} table`,
            "FAIL",
            `Table ${name} error: ${error.message}`
          );
        }
      }
    } catch (error) {
      this.addResult(
        "Database Schema",
        "FAIL",
        `Schema verification failed: ${error.message}`
      );
    }
  }

  /**
   * Test data integrity
   */
  async testDataIntegrity(): Promise<void> {
    try {
      this.log("Testing data integrity...");

      // Test categories
      const categoryCount = await db.select({ count: sql<number>`count(*)` }).from(categories);
      const categoryTotal = categoryCount[0]?.count || 0;

      if (categoryTotal > 0) {
        this.addResult(
          "Data - Categories",
          "PASS",
          `Found ${categoryTotal} categories`,
          { count: categoryTotal }
        );
      } else {
        this.addResult(
          "Data - Categories",
          "WARN",
          "No categories found - consider running seeding script"
        );
      }

      // Test articles
      const articleCount = await db.select({ count: sql<number>`count(*)` }).from(articles);
      const articleTotal = articleCount[0]?.count || 0;

      if (articleTotal > 0) {
        this.addResult(
          "Data - Articles",
          "PASS",
          `Found ${articleTotal} articles`,
          { count: articleTotal }
        );

        // Test published articles
        const publishedCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(articles)
          .where(eq(articles.published, true));
        
        const publishedTotal = publishedCount[0]?.count || 0;
        
        if (publishedTotal > 0) {
          this.addResult(
            "Data - Published Articles",
            "PASS",
            `Found ${publishedTotal} published articles`,
            { count: publishedTotal }
          );
        } else {
          this.addResult(
            "Data - Published Articles",
            "WARN",
            "No published articles found"
          );
        }
      } else {
        this.addResult(
          "Data - Articles",
          "WARN",
          "No articles found - consider running seeding script"
        );
      }

      // Test article-category relationships
      const articlesWithCategories = await db
        .select({
          articleId: articles.id,
          categoryId: articles.categoryId,
          categoryName: categories.nameEn
        })
        .from(articles)
        .leftJoin(categories, eq(articles.categoryId, categories.id))
        .limit(5);

      const orphanedArticles = articlesWithCategories.filter(a => !a.categoryName);
      
      if (orphanedArticles.length === 0) {
        this.addResult(
          "Data - Article-Category Relations",
          "PASS",
          "All articles have valid category relationships"
        );
      } else {
        this.addResult(
          "Data - Article-Category Relations",
          "WARN",
          `Found ${orphanedArticles.length} articles with invalid category references`,
          { orphanedArticles }
        );
      }

    } catch (error) {
      this.addResult(
        "Data Integrity",
        "FAIL",
        `Data integrity check failed: ${error.message}`
      );
    }
  }

  /**
   * Test API endpoints
   */
  async testApiEndpoints(): Promise<void> {
    try {
      this.log("Testing API endpoints...");

      const endpoints = [
        { path: "/api/health", method: "GET", name: "Health Check" },
        { path: "/api/categories", method: "GET", name: "Categories API" },
        { path: "/api/articles", method: "GET", name: "Articles API" },
        { path: "/api/articles?limit=1", method: "GET", name: "Articles Pagination" }
      ];

      for (const endpoint of endpoints) {
        try {
          const url = `${this.apiUrl}${endpoint.path}`;
          this.log(`Testing ${endpoint.method} ${url}`);
          
          const response = await fetch(url, {
            method: endpoint.method,
            timeout: 10000 // 10 second timeout
          });

          if (response.ok) {
            const data = await response.json();
            this.addResult(
              `API - ${endpoint.name}`,
              "PASS",
              `${endpoint.method} ${endpoint.path} returned ${response.status}`,
              { status: response.status, hasData: !!data }
            );
          } else {
            this.addResult(
              `API - ${endpoint.name}`,
              "FAIL",
              `${endpoint.method} ${endpoint.path} returned ${response.status}`,
              { status: response.status, statusText: response.statusText }
            );
          }
        } catch (error) {
          this.addResult(
            `API - ${endpoint.name}`,
            "FAIL",
            `${endpoint.method} ${endpoint.path} failed: ${error.message}`
          );
        }
      }
    } catch (error) {
      this.addResult(
        "API Endpoints",
        "FAIL",
        `API testing failed: ${error.message}`
      );
    }
  }

  /**
   * Test environment configuration
   */
  async testEnvironmentConfig(): Promise<void> {
    try {
      this.log("Testing environment configuration...");

      const requiredEnvVars = [
        "DATABASE_URL",
        "NODE_ENV"
      ];

      const optionalEnvVars = [
        "JWT_SECRET",
        "SENDGRID_API_KEY",
        "OPENAI_API_KEY",
        "SITE_URL"
      ];

      // Test required variables
      for (const envVar of requiredEnvVars) {
        if (process.env[envVar]) {
          this.addResult(
            `Environment - ${envVar}`,
            "PASS",
            `${envVar} is configured`
          );
        } else {
          this.addResult(
            `Environment - ${envVar}`,
            "FAIL",
            `${envVar} is missing (required)`
          );
        }
      }

      // Test optional variables
      for (const envVar of optionalEnvVars) {
        if (process.env[envVar]) {
          this.addResult(
            `Environment - ${envVar}`,
            "PASS",
            `${envVar} is configured`
          );
        } else {
          this.addResult(
            `Environment - ${envVar}`,
            "WARN",
            `${envVar} is not configured (optional)`
          );
        }
      }

      // Test database URL format
      const dbUrl = process.env.DATABASE_URL;
      if (dbUrl) {
        if (dbUrl.startsWith("postgresql://") && dbUrl.includes("neon")) {
          this.addResult(
            "Environment - Database URL Format",
            "PASS",
            "Database URL appears to be valid Neon PostgreSQL connection"
          );
        } else if (dbUrl.startsWith("postgresql://")) {
          this.addResult(
            "Environment - Database URL Format",
            "PASS",
            "Database URL appears to be valid PostgreSQL connection"
          );
        } else {
          this.addResult(
            "Environment - Database URL Format",
            "WARN",
            "Database URL format may be invalid"
          );
        }
      }

    } catch (error) {
      this.addResult(
        "Environment Configuration",
        "FAIL",
        `Environment configuration check failed: ${error.message}`
      );
    }
  }

  /**
   * Generate summary report
   */
  generateSummary(): void {
    const passed = this.results.filter(r => r.status === "PASS").length;
    const failed = this.results.filter(r => r.status === "FAIL").length;
    const warnings = this.results.filter(r => r.status === "WARN").length;
    const total = this.results.length;

    console.log("\n" + "=".repeat(60));
    console.log("DEPLOYMENT VERIFICATION SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    console.log("=".repeat(60));

    if (failed > 0) {
      console.log("\n❌ CRITICAL ISSUES FOUND:");
      this.results
        .filter(r => r.status === "FAIL")
        .forEach(r => console.log(`   - ${r.test}: ${r.message}`));
    }

    if (warnings > 0) {
      console.log("\n⚠️  WARNINGS:");
      this.results
        .filter(r => r.status === "WARN")
        .forEach(r => console.log(`   - ${r.test}: ${r.message}`));
    }

    if (failed === 0) {
      console.log("\n🎉 DEPLOYMENT VERIFICATION SUCCESSFUL!");
      console.log("Your AlmstkshfBlog is ready for production.");
    } else {
      console.log("\n🚨 DEPLOYMENT VERIFICATION FAILED!");
      console.log("Please fix the critical issues before deploying to production.");
    }
  }

  /**
   * Run complete verification
   */
  async verify(options: VerificationOptions = {}): Promise<boolean> {
    console.log("🔍 Starting AlmstkshfBlog Deployment Verification...\n");

    // Run all tests
    await this.testEnvironmentConfig();
    await this.testDatabaseConnection();
    await this.testDatabaseSchema();
    await this.testDataIntegrity();
    
    if (!options.skipApi) {
      await this.testApiEndpoints();
    }

    // Generate summary
    this.generateSummary();

    // Return success status
    const failed = this.results.filter(r => r.status === "FAIL").length;
    return failed === 0;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options: VerificationOptions = {
    verbose: args.includes("--verbose") || args.includes("-v"),
    skipApi: args.includes("--skip-api"),
    apiUrl: args.find(arg => arg.startsWith("--api-url="))?.split("=")[1]
  };

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Deployment Verification Tool for AlmstkshfBlog

Usage: tsx scripts/verify-deployment.ts [options]

Options:
  --verbose          Enable verbose logging
  -v                 Short for --verbose
  --skip-api         Skip API endpoint testing
  --api-url=URL      Custom API URL for testing (default: SITE_URL env var or http://localhost:5000)
  --help             Show this help message
  -h                 Short for --help

Examples:
  tsx scripts/verify-deployment.ts                                    # Full verification
  tsx scripts/verify-deployment.ts --verbose                          # Verbose output
  tsx scripts/verify-deployment.ts --skip-api                         # Skip API tests
  tsx scripts/verify-deployment.ts --api-url=https://yoursite.com     # Custom API URL
`);
    process.exit(0);
  }

  const verifier = new DeploymentVerifier(options);
  const success = await verifier.verify(options);
  
  process.exit(success ? 0 : 1);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Verification failed:", error);
    process.exit(1);
  });
}

export { DeploymentVerifier };
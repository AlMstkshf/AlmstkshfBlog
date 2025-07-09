#!/usr/bin/env tsx

import dotenv from "dotenv";
dotenv.config();

import { db } from "./server/db";
import { categories, articles } from "./shared/schema";
import { count } from "drizzle-orm";

async function debugSeeding() {
  try {
    console.log("🔍 Debug: Testing database connection...");
    
    // Test basic connection
    const [categoryCount] = await db
      .select({ count: count() })
      .from(categories);
    
    const [articleCount] = await db
      .select({ count: count() })
      .from(articles);

    console.log(`📊 Current state:`);
    console.log(`   Categories: ${categoryCount?.count || 0}`);
    console.log(`   Articles: ${articleCount?.count || 0}`);
    
    // Test importing the seeding function
    console.log("🔍 Debug: Testing seeding import...");
    const { seedDatabase } = await import("./scripts/db-seed");
    
    console.log("🔍 Debug: Running seeding with verbose mode (no force)...");
    const result = await seedDatabase({ verbose: true, force: false });
    
    if (result) {
      console.log("✅ Seeding completed successfully!");
      
      // Check final state
      const [finalCategoryCount] = await db
        .select({ count: count() })
        .from(categories);
      
      const [finalArticleCount] = await db
        .select({ count: count() })
        .from(articles);

      console.log(`📊 Final state:`);
      console.log(`   Categories: ${finalCategoryCount?.count || 0}`);
      console.log(`   Articles: ${finalArticleCount?.count || 0}`);
    } else {
      console.log("❌ Seeding failed!");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Debug test failed:", error);
    process.exit(1);
  }
}

debugSeeding();
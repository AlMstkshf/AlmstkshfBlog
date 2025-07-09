#!/usr/bin/env tsx

import dotenv from "dotenv";
dotenv.config();

import { db } from "./server/db";
import { categories, articles } from "./shared/schema";
import { count } from "drizzle-orm";

async function testSeed() {
  try {
    console.log("Testing simple seeding...");
    
    // Check current state
    const [categoryCount] = await db
      .select({ count: count() })
      .from(categories);
    
    const [articleCount] = await db
      .select({ count: count() })
      .from(articles);

    console.log(`Current state - Categories: ${categoryCount?.count || 0}, Articles: ${articleCount?.count || 0}`);
    
    // Try to insert a simple category if none exist
    if ((categoryCount?.count || 0) === 0) {
      console.log("Inserting test category...");
      const result = await db.insert(categories).values({
        slug: "test-category",
        nameEn: "Test Category",
        nameAr: "فئة تجريبية",
        descriptionEn: "Test description",
        descriptionAr: "وصف تجريبي",
        iconName: "Test"
      }).returning();
      
      console.log("Category inserted:", result[0]);
    }
    
    console.log("Simple seeding test completed!");
    process.exit(0);
  } catch (error) {
    console.error("Simple seeding test failed:", error);
    process.exit(1);
  }
}

testSeed();
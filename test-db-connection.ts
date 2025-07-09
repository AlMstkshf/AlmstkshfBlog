#!/usr/bin/env tsx

import dotenv from "dotenv";
dotenv.config();

import { db } from "./server/db";
import { categories, articles } from "./shared/schema";
import { count } from "drizzle-orm";

async function testConnection() {
  try {
    console.log("Testing database connection...");
    
    // Test basic query
    const [categoryCount] = await db
      .select({ count: count() })
      .from(categories);
    
    const [articleCount] = await db
      .select({ count: count() })
      .from(articles);

    console.log(`Categories: ${categoryCount?.count || 0}`);
    console.log(`Articles: ${articleCount?.count || 0}`);
    
    console.log("Database connection successful!");
    process.exit(0);
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

testConnection();
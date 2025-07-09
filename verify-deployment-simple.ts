#!/usr/bin/env tsx

import dotenv from "dotenv";
dotenv.config();

import { db } from "./server/db";
import { categories, articles } from "./shared/schema";
import { sql } from "drizzle-orm";
import { cloudStorage } from "./server/cloud-storage";

async function verifyDeployment() {
  console.log("🔍 AlmstkshfBlog Deployment Verification\n");
  
  let allPassed = true;
  
  // 1. Environment Variables Check
  console.log("1. Environment Configuration:");
  const requiredEnvs = ["DATABASE_URL", "NODE_ENV"];
  const optionalEnvs = ["JWT_SECRET", "SITE_URL", "ADMIN_EMAIL"];
  
  for (const env of requiredEnvs) {
    if (process.env[env]) {
      console.log(`   ✅ ${env}: Configured`);
    } else {
      console.log(`   ❌ ${env}: Missing (REQUIRED)`);
      allPassed = false;
    }
  }
  
  for (const env of optionalEnvs) {
    if (process.env[env]) {
      console.log(`   ✅ ${env}: Configured`);
    } else {
      console.log(`   ⚠️  ${env}: Not configured (optional)`);
    }
  }
  
  // 2. Database Connection
  console.log("\n2. Database Connection:");
  try {
    const result = await db.execute(sql`SELECT 1 as test`);
    if (result.rows && result.rows.length > 0) {
      console.log("   ✅ Database connection: Successful");
    } else {
      console.log("   ❌ Database connection: Failed - no results");
      allPassed = false;
    }
  } catch (error) {
    console.log(`   ❌ Database connection: Failed - ${error.message}`);
    allPassed = false;
  }
  
  // 3. Data Verification
  console.log("\n3. Data Verification:");
  try {
    const categoryCount = await db.select({ count: sql<number>`count(*)` }).from(categories);
    const categoryTotal = categoryCount[0]?.count || 0;
    console.log(`   ✅ Categories: ${categoryTotal} found`);
    
    const articleCount = await db.select({ count: sql<number>`count(*)` }).from(articles);
    const articleTotal = articleCount[0]?.count || 0;
    console.log(`   ✅ Articles: ${articleTotal} found`);
    
    if (categoryTotal === 0 || articleTotal === 0) {
      console.log("   ⚠️  Consider running: npm run db:seed");
    }
  } catch (error) {
    console.log(`   ❌ Data verification: Failed - ${error.message}`);
    allPassed = false;
  }
  
  // 4. Cloud Storage
  console.log("\n4. Cloud Storage:");
  try {
    const testBuffer = Buffer.from("test", "utf-8");
    const uploadResult = await cloudStorage.uploadFile(testBuffer, "test.txt", "text/plain");
    console.log(`   ✅ File upload: Working (${uploadResult.url})`);
    
    // Clean up test file
    await cloudStorage.deleteFile(uploadResult.key);
    console.log("   ✅ File deletion: Working");
  } catch (error) {
    console.log(`   ❌ Cloud storage: Failed - ${error.message}`);
    allPassed = false;
  }
  
  // 5. Build Check
  console.log("\n5. Build Configuration:");
  try {
    const fs = await import("fs/promises");
    const packageJsonContent = await fs.readFile("./package.json", "utf-8");
    const packageJson = JSON.parse(packageJsonContent);
    if (packageJson.scripts && packageJson.scripts.build) {
      console.log("   ✅ Build script: Available");
    } else {
      console.log("   ❌ Build script: Missing");
      allPassed = false;
    }
  } catch (error) {
    console.log("   ⚠️  Build script check: Could not read package.json");
  }
  
  // Summary
  console.log("\n" + "=".repeat(50));
  if (allPassed) {
    console.log("🎉 DEPLOYMENT VERIFICATION PASSED!");
    console.log("Your AlmstkshfBlog is ready for production deployment.");
    console.log("\nNext steps:");
    console.log("1. Run: npm run build");
    console.log("2. Deploy to Netlify");
    console.log("3. Set environment variables in Netlify dashboard");
  } else {
    console.log("🚨 DEPLOYMENT VERIFICATION FAILED!");
    console.log("Please fix the issues above before deploying.");
  }
  console.log("=".repeat(50));
  
  process.exit(allPassed ? 0 : 1);
}

verifyDeployment().catch(error => {
  console.error("Verification failed:", error);
  process.exit(1);
});
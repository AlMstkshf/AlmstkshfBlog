#!/usr/bin/env tsx

import dotenv from "dotenv";
dotenv.config();

import { cloudStorage } from "./server/cloud-storage";

async function testCloudStorage() {
  try {
    console.log("🔍 Testing Netlify Blobs cloud storage...\n");
    
    // Test 1: Upload a simple text file
    console.log("1. Testing file upload...");
    const testContent = "This is a test file for AlmstkshfBlog cloud storage integration.";
    const buffer = Buffer.from(testContent, 'utf-8');
    
    const uploadResult = await cloudStorage.uploadFile(
      buffer,
      "test-file.txt",
      "text/plain"
    );
    
    console.log("✅ Upload successful:");
    console.log(`   Filename: ${uploadResult.filename}`);
    console.log(`   Key: ${uploadResult.key}`);
    console.log(`   Size: ${uploadResult.size} bytes`);
    console.log(`   URL: ${uploadResult.url}`);
    console.log("");
    
    // Test 2: Retrieve the file
    console.log("2. Testing file retrieval...");
    const retrievedFile = await cloudStorage.getFile(uploadResult.key);
    
    if (retrievedFile) {
      const retrievedContent = retrievedFile.buffer.toString('utf-8');
      console.log("✅ Retrieval successful:");
      console.log(`   Content matches: ${retrievedContent === testContent ? '✅' : '❌'}`);
      console.log(`   Metadata: ${JSON.stringify(retrievedFile.metadata, null, 2)}`);
    } else {
      console.log("❌ File retrieval failed");
    }
    console.log("");
    
    // Test 3: List files
    console.log("3. Testing file listing...");
    const files = await cloudStorage.listFiles("documents");
    console.log(`✅ Found ${files.length} files in documents folder:`);
    files.forEach(file => console.log(`   - ${file}`));
    console.log("");
    
    // Test 4: Get file URL
    console.log("4. Testing file URL generation...");
    const fileUrl = await cloudStorage.getFileUrl(uploadResult.key);
    console.log(`✅ File URL: ${fileUrl || 'Not available'}`);
    console.log("");
    
    // Test 5: Clean up - delete test file
    console.log("5. Testing file deletion...");
    const deleteResult = await cloudStorage.deleteFile(uploadResult.key);
    console.log(`✅ Deletion ${deleteResult ? 'successful' : 'failed'}`);
    
    console.log("\n🎉 Cloud storage integration test completed successfully!");
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Cloud storage test failed:", error);
    process.exit(1);
  }
}

testCloudStorage();
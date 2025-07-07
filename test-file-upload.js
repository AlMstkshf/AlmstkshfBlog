#!/usr/bin/env node

/**
 * File Upload Test Script
 * Tests the cloud storage file upload functionality
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://almstkshfblog.netlify.app';

// Create a test file
function createTestFile() {
  const testContent = `Test file created at ${new Date().toISOString()}
This is a test file for verifying cloud storage functionality.
Platform: Bilingual Media Intelligence Platform
Storage: Netlify Blobs
Status: Testing file upload system`;
  
  const filename = 'test-upload.txt';
  fs.writeFileSync(filename, testContent);
  return filename;
}

// Upload file using multipart form data
function uploadFile(filename) {
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(filename);
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    
    const formData = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="file"; filename="' + filename + '"',
      'Content-Type: text/plain',
      '',
      fileContent.toString(),
      `--${boundary}--`
    ].join('\r\n');
    
    const options = {
      hostname: 'almstkshfblog.netlify.app',
      port: 443,
      path: '/api/upload',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(formData)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: response });
        } catch (error) {
          resolve({ statusCode: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Upload timeout'));
    });
    
    req.write(formData);
    req.end();
  });
}

// Test file download
function downloadFile(fileUrl) {
  return new Promise((resolve, reject) => {
    const req = https.get(fileUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data: data.substring(0, 100) });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Download timeout'));
    });
  });
}

async function testFileUpload() {
  console.log('🧪 Testing File Upload Functionality...\n');
  
  try {
    // Step 1: Create test file
    console.log('📝 Creating test file...');
    const testFile = createTestFile();
    console.log(`✅ Test file created: ${testFile}`);
    
    // Step 2: Upload file
    console.log('\n📤 Uploading file to cloud storage...');
    const uploadResult = await uploadFile(testFile);
    
    if (uploadResult.statusCode === 200 && uploadResult.data.success) {
      console.log('✅ File uploaded successfully!');
      console.log(`📁 File details:`);
      console.log(`   - Original: ${uploadResult.data.file.originalName}`);
      console.log(`   - Stored as: ${uploadResult.data.file.filename}`);
      console.log(`   - Size: ${uploadResult.data.file.size} bytes`);
      console.log(`   - Type: ${uploadResult.data.file.mimetype}`);
      console.log(`   - URL: ${uploadResult.data.file.url}`);
      
      // Step 3: Test file download
      console.log('\n📥 Testing file download...');
      const downloadUrl = `${SITE_URL}${uploadResult.data.file.url}`;
      const downloadResult = await downloadFile(downloadUrl);
      
      if (downloadResult.statusCode === 200) {
        console.log('✅ File download successful!');
        console.log(`📄 Content preview: ${downloadResult.data}...`);
      } else {
        console.log(`❌ File download failed: ${downloadResult.statusCode}`);
      }
      
    } else {
      console.log(`❌ File upload failed: ${uploadResult.statusCode}`);
      console.log(`Response: ${JSON.stringify(uploadResult.data, null, 2)}`);
    }
    
    // Cleanup
    fs.unlinkSync(testFile);
    console.log(`\n🧹 Cleaned up test file: ${testFile}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('\n🎯 File Upload Test Complete!');
  console.log('\n📋 Manual Testing:');
  console.log('1. Try uploading an image file');
  console.log('2. Try uploading a PDF document');
  console.log('3. Verify files are organized in correct folders');
  console.log('4. Check file serving with proper headers');
}

// Run the test
testFileUpload().catch(console.error);
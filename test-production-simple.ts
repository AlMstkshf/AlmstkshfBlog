#!/usr/bin/env tsx

/**
 * Simple Production Test Script
 * Quick test to check if the production deployment is working
 */

const PRODUCTION_URL = 'https://almstkshfblog.netlify.app';

async function testEndpoint(name: string, url: string) {
  console.log(`Testing ${name}...`);
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'AlmstkshfBlog-Tester/1.0'
      }
    });
    
    console.log(`✅ ${name}: ${response.status} ${response.statusText}`);
    
    if (response.ok && url.includes('/api/')) {
      try {
        const data = await response.json();
        console.log(`   Data preview:`, JSON.stringify(data).substring(0, 100) + '...');
      } catch (e) {
        console.log(`   Response is not JSON`);
      }
    }
  } catch (error) {
    console.log(`❌ ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  console.log('');
}

async function main() {
  console.log('🚀 AlmstkshfBlog Production Test');
  console.log(`🌐 Testing: ${PRODUCTION_URL}`);
  console.log('=' .repeat(50));
  console.log('');

  // Test basic endpoints
  await testEndpoint('Homepage', `${PRODUCTION_URL}/`);
  await testEndpoint('Health API', `${PRODUCTION_URL}/api/health`);
  await testEndpoint('Articles API', `${PRODUCTION_URL}/api/articles`);
  await testEndpoint('Categories API', `${PRODUCTION_URL}/api/categories`);
  
  console.log('🏁 Test completed!');
}

main().catch(console.error);
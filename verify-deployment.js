#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Tests the deployed application endpoints
 */

import https from 'https';
import http from 'http';

const SITE_URL = 'https://almstkshfblog.netlify.app';

const endpoints = [
  { path: '/', name: 'Homepage' },
  { path: '/api/health', name: 'Health Check' },
  { path: '/api/articles', name: 'Articles API' },
  { path: '/api/categories', name: 'Categories API' },
  { path: '/api/analytics', name: 'Analytics API' },
  { path: '/api/sitemap.xml', name: 'Sitemap' },
  { path: '/api/rss.xml', name: 'RSS Feed' },
  { path: '/blog', name: 'Blog Page' },
  { path: '/about', name: 'About Page' },
  { path: '/contact', name: 'Contact Page' }
];

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const req = protocol.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data.substring(0, 200) // First 200 chars
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function verifyDeployment() {
  console.log('🚀 Verifying Netlify Deployment...\n');
  console.log(`Site URL: ${SITE_URL}\n`);
  
  let passed = 0;
  let failed = 0;
  
  for (const endpoint of endpoints) {
    const url = `${SITE_URL}${endpoint.path}`;
    
    try {
      console.log(`Testing ${endpoint.name}...`);
      const response = await makeRequest(url);
      
      if (response.statusCode >= 200 && response.statusCode < 400) {
        console.log(`✅ ${endpoint.name}: ${response.statusCode}`);
        passed++;
      } else {
        console.log(`❌ ${endpoint.name}: ${response.statusCode}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ${error.message}`);
      failed++;
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📊 Deployment Verification Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Deployment is successful.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the deployment configuration.');
  }
  
  console.log('\n🔧 Next Steps:');
  console.log('1. Test bilingual functionality (English/Arabic)');
  console.log('2. Test contact form submission');
  console.log('3. Test newsletter subscription');
  console.log('4. Test file upload functionality (POST /api/upload)');
  console.log('5. Check serverless function logs in Netlify dashboard');
  console.log('6. Verify database operations');
  console.log('7. Test cloud storage file serving');
}

// Run verification
verifyDeployment().catch(console.error);
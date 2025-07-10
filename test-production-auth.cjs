/**
 * Production Authentication Testing Script
 * Tests authentication against the live Netlify deployment
 */

const https = require('https');
const http = require('http');

const PRODUCTION_URL = 'https://almstkshfblog.netlify.app';
const TEST_CREDENTIALS = [
  { username: 'admin', password: 'P@ssword#123' },
  { username: 'rased@almstkshf.com', password: 'P@ssword#123' }
];

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AlMustakshef-Auth-Test/1.0',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData,
            rawData: data
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: null,
            rawData: data,
            parseError: error.message
          });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testProductionAuth() {
  console.log('🚀 Testing Production Authentication on Netlify...\n');
  console.log(`🌐 Production URL: ${PRODUCTION_URL}\n`);

  try {
    // Test 1: Check if the site is accessible
    console.log('📋 Test 1: Site Accessibility');
    const siteResponse = await makeRequest(PRODUCTION_URL);
    
    if (siteResponse.statusCode === 200) {
      console.log('✅ Production site is accessible');
    } else {
      console.log(`⚠️  Site returned status: ${siteResponse.statusCode}`);
    }

    // Test 2: Check API health
    console.log('\n📋 Test 2: API Health Check');
    try {
      const healthResponse = await makeRequest(`${PRODUCTION_URL}/api/health`);
      
      if (healthResponse.statusCode === 200) {
        console.log('✅ API health endpoint is working');
        console.log('📊 Health data:', healthResponse.data);
      } else {
        console.log(`⚠️  API health returned status: ${healthResponse.statusCode}`);
        console.log('📄 Response:', healthResponse.rawData);
      }
    } catch (error) {
      console.log('❌ API health check failed:', error.message);
    }

    // Test 3: Authentication Tests
    console.log('\n📋 Test 3: Authentication Tests');
    
    for (const credentials of TEST_CREDENTIALS) {
      console.log(`\n🔐 Testing login with: ${credentials.username}`);
      
      try {
        const loginResponse = await makeRequest(`${PRODUCTION_URL}/api/auth/login`, {
          method: 'POST',
          body: credentials
        });

        console.log(`📊 Status: ${loginResponse.statusCode}`);
        
        if (loginResponse.statusCode === 200 && loginResponse.data.success) {
          console.log('✅ Login successful!');
          console.log('🎫 Token received:', loginResponse.data.accessToken ? 'Yes' : 'No');
          console.log('👤 User data:', loginResponse.data.user ? 'Yes' : 'No');
          
          // Test authenticated request
          if (loginResponse.data.accessToken) {
            console.log('🔒 Testing authenticated request...');
            const authResponse = await makeRequest(`${PRODUCTION_URL}/api/articles`, {
              headers: {
                'Authorization': `Bearer ${loginResponse.data.accessToken}`
              }
            });
            
            if (authResponse.statusCode === 200) {
              console.log('✅ Authenticated API request successful');
            } else {
              console.log(`⚠️  Authenticated request failed: ${authResponse.statusCode}`);
            }
          }
        } else {
          console.log('❌ Login failed');
          console.log('📄 Response:', loginResponse.data || loginResponse.rawData);
        }
      } catch (error) {
        console.log('❌ Login request failed:', error.message);
      }
    }

    // Test 4: Environment Variables Check
    console.log('\n📋 Test 4: Environment Variables Status');
    try {
      const envResponse = await makeRequest(`${PRODUCTION_URL}/api/debug/env`, {
        method: 'GET'
      });
      
      if (envResponse.statusCode === 200) {
        console.log('✅ Environment debug endpoint accessible');
        console.log('📊 Environment status:', envResponse.data);
      } else {
        console.log(`⚠️  Environment debug returned: ${envResponse.statusCode}`);
      }
    } catch (error) {
      console.log('ℹ️  Environment debug endpoint not available (expected in production)');
    }

    console.log('\n🎯 Production Authentication Test Summary:');
    console.log('1. Site accessibility: Check above results');
    console.log('2. API health: Check above results');
    console.log('3. Authentication: Check above results');
    console.log('4. Environment variables: Check Netlify dashboard');

  } catch (error) {
    console.error('\n❌ Production test failed:', error.message);
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testProductionAuth()
    .then(() => {
      console.log('\n✅ Production authentication testing completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Production authentication testing failed:', error);
      process.exit(1);
    });
}

module.exports = { testProductionAuth };
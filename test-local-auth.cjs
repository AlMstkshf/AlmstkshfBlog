/**
 * Local Authentication Testing Script
 * Tests authentication against the local development server
 */

const http = require('http');

const LOCAL_URL = 'http://localhost:5000';
const TEST_CREDENTIALS = [
  { username: 'admin', password: 'P@ssword#123' },
  { username: 'rased@almstkshf.com', password: 'P@ssword#123' }
];

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AlMustakshef-Local-Auth-Test/1.0',
        ...options.headers
      }
    };

    const req = http.request(requestOptions, (res) => {
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

async function testLocalAuth() {
  console.log('🚀 Testing Local Authentication...\n');
  console.log(`🌐 Local URL: ${LOCAL_URL}\n`);

  try {
    // Test 1: Check if the local server is running
    console.log('📋 Test 1: Local Server Accessibility');
    try {
      const serverResponse = await makeRequest(LOCAL_URL);
      
      if (serverResponse.statusCode === 200) {
        console.log('✅ Local server is accessible');
      } else {
        console.log(`⚠️  Server returned status: ${serverResponse.statusCode}`);
      }
    } catch (error) {
      console.log('❌ Local server is not accessible. Make sure it\'s running with: npm run dev');
      console.log('   Error:', error.message);
      return;
    }

    // Test 2: Check API health
    console.log('\n📋 Test 2: API Health Check');
    try {
      const healthResponse = await makeRequest(`${LOCAL_URL}/api/health`);
      
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
        const loginResponse = await makeRequest(`${LOCAL_URL}/api/auth/login`, {
          method: 'POST',
          body: credentials
        });

        console.log(`📊 Status: ${loginResponse.statusCode}`);
        
        if (loginResponse.statusCode === 200 && loginResponse.data.success) {
          console.log('✅ Login successful!');
          console.log('🎫 Token received:', loginResponse.data.accessToken ? 'Yes' : 'No');
          console.log('👤 User data:', loginResponse.data.user ? 'Yes' : 'No');
          console.log('📝 User details:', JSON.stringify(loginResponse.data.user, null, 2));
          
          // Test authenticated request
          if (loginResponse.data.accessToken) {
            console.log('🔒 Testing authenticated request...');
            const authResponse = await makeRequest(`${LOCAL_URL}/api/articles`, {
              headers: {
                'Authorization': `Bearer ${loginResponse.data.accessToken}`
              }
            });
            
            if (authResponse.statusCode === 200) {
              console.log('✅ Authenticated API request successful');
              console.log('📊 Articles count:', authResponse.data.articles ? authResponse.data.articles.length : 'N/A');
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

    // Test 4: Test logout
    console.log('\n📋 Test 4: Logout Test');
    try {
      const logoutResponse = await makeRequest(`${LOCAL_URL}/api/auth/logout`, {
        method: 'POST'
      });
      
      if (logoutResponse.statusCode === 200) {
        console.log('✅ Logout endpoint working');
      } else {
        console.log(`⚠️  Logout returned status: ${logoutResponse.statusCode}`);
      }
    } catch (error) {
      console.log('❌ Logout test failed:', error.message);
    }

    console.log('\n🎯 Local Authentication Test Summary:');
    console.log('1. Server accessibility: Check above results');
    console.log('2. API health: Check above results');
    console.log('3. Authentication: Check above results');
    console.log('4. Logout: Check above results');

  } catch (error) {
    console.error('\n❌ Local test failed:', error.message);
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testLocalAuth()
    .then(() => {
      console.log('\n✅ Local authentication testing completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Local authentication testing failed:', error);
      process.exit(1);
    });
}

module.exports = { testLocalAuth };
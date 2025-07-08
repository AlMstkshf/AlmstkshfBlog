import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

// Test data
const testCredentials = {
  username: 'admin',
  password: 'password'
};

const invalidCredentials = {
  username: 'admin',
  password: 'wrongpassword'
};

// Helper function to make requests
async function makeRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return {
      status: response.status,
      headers: response.headers,
      data
    };
  } catch (error) {
    return {
      error: error.message
    };
  }
}

// Test functions
async function testServerHealth() {
  console.log('\n🔍 Testing server health...');
  try {
    const response = await fetch(`${BASE_URL}/api/categories`);
    if (response.ok) {
      console.log('✅ Server is running and responding');
      return true;
    } else {
      console.log('❌ Server responded with error:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Server is not reachable:', error.message);
    return false;
  }
}

async function testLogin(credentials, shouldSucceed = true) {
  console.log(`\n🔐 Testing login with ${credentials.username}/${credentials.password}...`);
  
  const result = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
  
  if (result.error) {
    console.log('❌ Request failed:', result.error);
    return null;
  }
  
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (shouldSucceed) {
    if (result.status === 200 && result.data.success) {
      console.log('✅ Login successful');
      return result.data.data.accessToken;
    } else {
      console.log('❌ Login failed unexpectedly');
      return null;
    }
  } else {
    if (result.status === 401 || result.status === 400) {
      console.log('✅ Login correctly rejected');
      return null;
    } else {
      console.log('❌ Login should have been rejected');
      return null;
    }
  }
}

async function testTokenVerification(token) {
  console.log('\n🔍 Testing token verification...');
  
  const result = await makeRequest('/api/auth/verify', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (result.error) {
    console.log('❌ Request failed:', result.error);
    return false;
  }
  
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.status === 200 && result.data.success) {
    console.log('✅ Token verification successful');
    return true;
  } else {
    console.log('❌ Token verification failed');
    return false;
  }
}

async function testTokenRefresh() {
  console.log('\n🔄 Testing token refresh...');
  
  const result = await makeRequest('/api/auth/refresh', {
    method: 'POST'
  });
  
  if (result.error) {
    console.log('❌ Request failed:', result.error);
    return null;
  }
  
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  // This should fail without a refresh token cookie
  if (result.status === 401) {
    console.log('✅ Refresh correctly rejected (no refresh token)');
    return null;
  } else {
    console.log('❌ Unexpected refresh response');
    return null;
  }
}

async function testLogout() {
  console.log('\n🚪 Testing logout...');
  
  const result = await makeRequest('/api/auth/logout', {
    method: 'POST'
  });
  
  if (result.error) {
    console.log('❌ Request failed:', result.error);
    return false;
  }
  
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.status === 200 && result.data.success) {
    console.log('✅ Logout successful');
    return true;
  } else {
    console.log('❌ Logout failed');
    return false;
  }
}

async function testRateLimit() {
  console.log('\n⏱️ Testing rate limiting (5 failed attempts)...');
  
  for (let i = 1; i <= 6; i++) {
    console.log(`Attempt ${i}:`);
    const result = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(invalidCredentials)
    });
    
    if (result.error) {
      console.log('❌ Request failed:', result.error);
      continue;
    }
    
    console.log(`  Status: ${result.status}`);
    
    if (result.status === 429) {
      console.log('✅ Rate limiting activated after', i, 'attempts');
      console.log('  Response:', JSON.stringify(result.data, null, 2));
      break;
    } else if (i === 6) {
      console.log('❌ Rate limiting not activated after 6 attempts');
    }
    
    // Small delay between attempts
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Authentication System Tests');
  console.log('=====================================');
  
  // Test 1: Server Health
  const serverHealthy = await testServerHealth();
  if (!serverHealthy) {
    console.log('\n❌ Server is not running. Please start the server with: npm run dev');
    return;
  }
  
  // Test 2: Valid Login
  const token = await testLogin(testCredentials, true);
  if (!token) {
    console.log('\n❌ Cannot proceed without valid token');
    return;
  }
  
  // Test 3: Invalid Login
  await testLogin(invalidCredentials, false);
  
  // Test 4: Token Verification
  await testTokenVerification(token);
  
  // Test 5: Token Refresh (without cookie)
  await testTokenRefresh();
  
  // Test 6: Logout
  await testLogout();
  
  // Test 7: Rate Limiting
  await testRateLimit();
  
  console.log('\n🎉 Authentication tests completed!');
  console.log('=====================================');
}

// Check if node-fetch is available
try {
  runTests();
} catch (error) {
  console.log('❌ Error: node-fetch is required. Install it with: npm install node-fetch');
  console.log('Or use the simple HTTP test instead.');
}
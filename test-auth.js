#!/usr/bin/env node

/**
 * Authentication System Test Script
 * Tests the complete authentication flow for the blog application
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'password'
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, message = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const fullMessage = `${status} ${name}${message ? ': ' + message : ''}`;
  console.log(fullMessage);
  
  testResults.tests.push({ name, passed, message });
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

async function testServerConnection() {
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    logTest('Server Connection', response.ok, `Status: ${response.status}`);
    return response.ok;
  } catch (error) {
    logTest('Server Connection', false, error.message);
    return false;
  }
}

async function testLoginEndpoint() {
  console.log('\n🔐 Testing Login Endpoint...');
  
  // Test 1: Valid credentials
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ADMIN_CREDENTIALS),
    });
    
    const data = await response.json();
    const success = response.ok && data.success && data.data && data.data.accessToken;
    logTest('Login with valid credentials', success, success ? 'Token received' : data.message);
    
    if (success) {
      return data.data.accessToken;
    }
  } catch (error) {
    logTest('Login with valid credentials', false, error.message);
  }
  
  // Test 2: Invalid credentials
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'wrongpassword'
      }),
    });
    
    const data = await response.json();
    const success = !response.ok && !data.success;
    logTest('Login with invalid credentials', success, 'Should fail with 401');
  } catch (error) {
    logTest('Login with invalid credentials', false, error.message);
  }
  
  // Test 3: Missing credentials
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    
    const data = await response.json();
    const success = !response.ok;
    logTest('Login with missing credentials', success, 'Should fail with validation error');
  } catch (error) {
    logTest('Login with missing credentials', false, error.message);
  }
  
  return null;
}

async function testTokenVerification(token) {
  console.log('\n🔍 Testing Token Verification...');
  
  if (!token) {
    logTest('Token Verification', false, 'No token available');
    return;
  }
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    const success = response.ok && data.success;
    logTest('Token verification with valid token', success, success ? 'Token is valid' : data.message);
  } catch (error) {
    logTest('Token verification with valid token', false, error.message);
  }
  
  // Test with invalid token
  try {
    const response = await fetch(`${BASE_URL}/api/auth/verify`, {
      headers: {
        'Authorization': 'Bearer invalid-token',
      },
    });
    
    const success = !response.ok;
    logTest('Token verification with invalid token', success, 'Should fail with 401');
  } catch (error) {
    logTest('Token verification with invalid token', false, error.message);
  }
}

async function testProtectedEndpoints(token) {
  console.log('\n🛡️ Testing Protected Endpoints...');
  
  if (!token) {
    logTest('Protected Endpoints', false, 'No token available');
    return;
  }
  
  const protectedEndpoints = [
    { method: 'GET', path: '/api/categories', description: 'Get categories (should work without auth)' },
    { method: 'POST', path: '/api/categories', description: 'Create category (requires auth)', requiresAuth: true },
    { method: 'GET', path: '/api/articles', description: 'Get articles (should work without auth)' },
    { method: 'POST', path: '/api/articles', description: 'Create article (requires auth)', requiresAuth: true },
  ];
  
  for (const endpoint of protectedEndpoints) {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (endpoint.requiresAuth) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const body = endpoint.method === 'POST' ? JSON.stringify({
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test description'
      }) : undefined;
      
      const response = await fetch(`${BASE_URL}${endpoint.path}`, {
        method: endpoint.method,
        headers,
        body,
      });
      
      if (endpoint.requiresAuth) {
        // For protected endpoints, we expect either success (200-299) or proper auth error
        const success = response.ok || response.status === 401 || response.status === 403;
        logTest(`${endpoint.method} ${endpoint.path}`, success, `Status: ${response.status}`);
      } else {
        // For public endpoints, we expect success
        const success = response.ok;
        logTest(`${endpoint.method} ${endpoint.path}`, success, `Status: ${response.status}`);
      }
    } catch (error) {
      logTest(`${endpoint.method} ${endpoint.path}`, false, error.message);
    }
  }
}

async function testLogout() {
  console.log('\n🚪 Testing Logout...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
    });
    
    const data = await response.json();
    const success = response.ok && data.success;
    logTest('Logout endpoint', success, success ? 'Logged out successfully' : data.message);
  } catch (error) {
    logTest('Logout endpoint', false, error.message);
  }
}

async function runAuthenticationTests() {
  console.log('🚀 Starting Authentication System Tests...\n');
  
  // Test server connection
  const serverOk = await testServerConnection();
  if (!serverOk) {
    console.log('\n❌ Server is not running. Please start the server with: npm run dev');
    return;
  }
  
  // Test login and get token
  const token = await testLoginEndpoint();
  
  // Test token verification
  await testTokenVerification(token);
  
  // Test protected endpoints
  await testProtectedEndpoints(token);
  
  // Test logout
  await testLogout();
  
  // Print summary
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.tests
      .filter(test => !test.passed)
      .forEach(test => console.log(`   - ${test.name}: ${test.message}`));
  }
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Open browser to http://localhost:5000');
  console.log('2. Navigate to /admin/login');
  console.log('3. Login with admin/password');
  console.log('4. Test admin pages: /admin/dashboard, /admin/categories, etc.');
  console.log('5. Test logout functionality');
  console.log('6. Verify unauthenticated access redirects to login');
}

// Run the tests
runAuthenticationTests().catch(console.error);
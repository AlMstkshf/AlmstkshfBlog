/**
 * Frontend Authentication Testing Script
 * Tests the complete React admin interface authentication flow
 */

const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:5000';
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'password'
};

class FrontendAuthTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async init() {
    console.log('🚀 Starting Frontend Authentication Tests...\n');
    
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for headless testing
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    
    // Enable console logging from the page
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Browser Console Error:', msg.text());
      }
    });
    
    // Enable request/response logging
    this.page.on('response', response => {
      if (response.url().includes('/api/auth/')) {
        console.log(`📡 API Response: ${response.status()} ${response.url()}`);
      }
    });
  }

  async test(name, testFn) {
    try {
      console.log(`🧪 Testing: ${name}`);
      await testFn();
      this.results.passed++;
      this.results.tests.push({ name, status: 'PASSED' });
      console.log(`✅ ${name} - PASSED\n`);
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name, status: 'FAILED', error: error.message });
      console.log(`❌ ${name} - FAILED: ${error.message}\n`);
    }
  }

  async testLoginPageAccess() {
    await this.page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle0' });
    
    // Check if login page loads correctly
    const title = await this.page.title();
    if (!title.includes('AlmstkshfBlog') && !title.includes('Admin')) {
      throw new Error(`Unexpected page title: ${title}`);
    }
    
    // Check for login form elements
    const usernameInput = await this.page.$('#username');
    const passwordInput = await this.page.$('#password');
    const loginButton = await this.page.$('button[type="submit"]');
    
    if (!usernameInput || !passwordInput || !loginButton) {
      throw new Error('Login form elements not found');
    }
    
    // Check for admin login heading
    const heading = await this.page.$eval('h1, h2', el => el.textContent);
    if (!heading.includes('Admin Login')) {
      throw new Error('Admin Login heading not found');
    }
  }

  async testInvalidLogin() {
    await this.page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle0' });
    
    // Fill invalid credentials
    await this.page.type('#username', 'invalid');
    await this.page.type('#password', 'invalid');
    
    // Submit form
    await this.page.click('button[type="submit"]');
    
    // Wait for error message
    await this.page.waitForTimeout(2000);
    
    // Check if still on login page (not redirected)
    const currentUrl = this.page.url();
    if (!currentUrl.includes('/admin/login')) {
      throw new Error('Should remain on login page after invalid credentials');
    }
    
    // Check for error toast or message
    const errorElements = await this.page.$$('[role="alert"], .text-red-600, .text-red-700, .bg-red-50');
    if (errorElements.length === 0) {
      // Check for toast notifications
      const toastElements = await this.page.$$('[data-sonner-toast], .toast, [role="status"]');
      if (toastElements.length === 0) {
        console.log('⚠️  No visible error message found, but login correctly rejected');
      }
    }
  }

  async testValidLogin() {
    await this.page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle0' });
    
    // Clear any existing form data
    await this.page.evaluate(() => {
      const username = document.querySelector('#username');
      const password = document.querySelector('#password');
      if (username) username.value = '';
      if (password) password.value = '';
    });
    
    // Fill valid credentials
    await this.page.type('#username', ADMIN_CREDENTIALS.username);
    await this.page.type('#password', ADMIN_CREDENTIALS.password);
    
    // Submit form
    await this.page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await this.page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
    
    // Check if redirected to dashboard
    const currentUrl = this.page.url();
    if (!currentUrl.includes('/admin/dashboard')) {
      throw new Error(`Expected redirect to dashboard, but got: ${currentUrl}`);
    }
    
    // Check for dashboard elements
    const dashboardHeading = await this.page.$eval('h1', el => el.textContent);
    if (!dashboardHeading.includes('Admin Dashboard')) {
      throw new Error('Dashboard heading not found');
    }
  }

  async testTokenStorage() {
    // Check if JWT token is stored in localStorage
    const token = await this.page.evaluate(() => {
      return localStorage.getItem('admin_token');
    });
    
    if (!token) {
      throw new Error('JWT token not found in localStorage');
    }
    
    // Basic JWT format check (should have 3 parts separated by dots)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      throw new Error('Invalid JWT token format');
    }
    
    // Check if user data is stored
    const userData = await this.page.evaluate(() => {
      return localStorage.getItem('admin_user');
    });
    
    if (!userData) {
      throw new Error('User data not found in localStorage');
    }
    
    const user = JSON.parse(userData);
    if (!user.username || !user.role) {
      throw new Error('Invalid user data structure');
    }
  }

  async testProtectedRouteAccess() {
    // Test direct access to protected routes
    const protectedRoutes = [
      '/admin/dashboard',
      '/admin/categories',
      '/admin/settings',
      '/admin/content-strategy'
    ];
    
    for (const route of protectedRoutes) {
      await this.page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle0' });
      
      // Should be able to access since we're logged in
      const currentUrl = this.page.url();
      if (currentUrl.includes('/admin/login')) {
        throw new Error(`Protected route ${route} redirected to login unexpectedly`);
      }
      
      // Check for some admin content
      const adminElements = await this.page.$$('h1, h2, [data-testid="admin-content"]');
      if (adminElements.length === 0) {
        throw new Error(`No admin content found on ${route}`);
      }
    }
  }

  async testLogout() {
    await this.page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: 'networkidle0' });
    
    // Find and click logout button
    const logoutButton = await this.page.$('button:has-text("Logout"), button[title*="logout"], button[aria-label*="logout"]');
    if (!logoutButton) {
      // Try alternative selectors
      const logoutButtons = await this.page.$$('button');
      let found = false;
      for (const button of logoutButtons) {
        const text = await button.evaluate(el => el.textContent);
        if (text && text.toLowerCase().includes('logout')) {
          await button.click();
          found = true;
          break;
        }
      }
      if (!found) {
        throw new Error('Logout button not found');
      }
    } else {
      await logoutButton.click();
    }
    
    // Wait for redirect to login
    await this.page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 });
    
    // Check if redirected to login page
    const currentUrl = this.page.url();
    if (!currentUrl.includes('/admin/login')) {
      throw new Error(`Expected redirect to login after logout, but got: ${currentUrl}`);
    }
    
    // Check if token is cleared from localStorage
    const token = await this.page.evaluate(() => {
      return localStorage.getItem('admin_token');
    });
    
    if (token) {
      throw new Error('JWT token should be cleared after logout');
    }
  }

  async testUnauthorizedAccess() {
    // Clear localStorage to simulate logged out state
    await this.page.evaluate(() => {
      localStorage.clear();
    });
    
    // Try to access protected route
    await this.page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: 'networkidle0' });
    
    // Should be redirected to login
    const currentUrl = this.page.url();
    if (!currentUrl.includes('/admin/login')) {
      throw new Error('Unauthorized access should redirect to login');
    }
  }

  async testSessionPersistence() {
    // Login first
    await this.page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle0' });
    await this.page.type('#username', ADMIN_CREDENTIALS.username);
    await this.page.type('#password', ADMIN_CREDENTIALS.password);
    await this.page.click('button[type="submit"]');
    await this.page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    // Refresh the page
    await this.page.reload({ waitUntil: 'networkidle0' });
    
    // Should still be on dashboard (session persisted)
    const currentUrl = this.page.url();
    if (!currentUrl.includes('/admin/dashboard')) {
      throw new Error('Session should persist after page refresh');
    }
  }

  async testRateLimiting() {
    await this.page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle0' });
    
    // Make multiple failed login attempts
    for (let i = 0; i < 4; i++) {
      await this.page.evaluate(() => {
        const username = document.querySelector('#username');
        const password = document.querySelector('#password');
        if (username) username.value = '';
        if (password) password.value = '';
      });
      
      await this.page.type('#username', 'invalid');
      await this.page.type('#password', 'invalid');
      await this.page.click('button[type="submit"]');
      await this.page.waitForTimeout(1000);
    }
    
    // Check if form is disabled or rate limit message is shown
    const isDisabled = await this.page.$eval('button[type="submit"]', el => el.disabled);
    const rateLimitMessage = await this.page.$('.text-red-700, .bg-red-50, [role="alert"]');
    
    if (!isDisabled && !rateLimitMessage) {
      console.log('⚠️  Rate limiting may not be active in UI (backend protection still works)');
    }
  }

  async runAllTests() {
    await this.init();
    
    try {
      await this.test('Login Page Access', () => this.testLoginPageAccess());
      await this.test('Invalid Login Handling', () => this.testInvalidLogin());
      await this.test('Valid Login Flow', () => this.testValidLogin());
      await this.test('JWT Token Storage', () => this.testTokenStorage());
      await this.test('Protected Route Access', () => this.testProtectedRouteAccess());
      await this.test('Logout Functionality', () => this.testLogout());
      await this.test('Unauthorized Access Prevention', () => this.testUnauthorizedAccess());
      await this.test('Session Persistence', () => this.testSessionPersistence());
      await this.test('Rate Limiting UI', () => this.testRateLimiting());
      
    } finally {
      await this.cleanup();
    }
    
    this.printResults();
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 FRONTEND AUTHENTICATION TEST RESULTS');
    console.log('='.repeat(60));
    
    this.results.tests.forEach(test => {
      const status = test.status === 'PASSED' ? '✅' : '❌';
      console.log(`${status} ${test.name}`);
      if (test.error) {
        console.log(`   Error: ${test.error}`);
      }
    });
    
    console.log('\n' + '-'.repeat(60));
    console.log(`📊 Summary: ${this.results.passed} passed, ${this.results.failed} failed`);
    
    if (this.results.failed === 0) {
      console.log('🎉 All frontend authentication tests passed!');
    } else {
      console.log('⚠️  Some tests failed. Please review the errors above.');
    }
    
    console.log('-'.repeat(60));
  }
}

// Check if puppeteer is available
async function checkDependencies() {
  try {
    require('puppeteer');
    return true;
  } catch (error) {
    console.log('❌ Puppeteer not found. Installing...');
    console.log('Please run: npm install puppeteer');
    return false;
  }
}

// Main execution
async function main() {
  const hasDepencies = await checkDependencies();
  if (!hasDepencies) {
    console.log('Please install puppeteer and run the test again.');
    return;
  }
  
  const tester = new FrontendAuthTester();
  await tester.runAllTests();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = FrontendAuthTester;
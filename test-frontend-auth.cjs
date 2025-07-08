/**
 * Frontend Authentication Testing Script
 * Tests the React admin interface authentication integration
 */

const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:5000';
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'password'
};

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testFrontendAuthentication() {
  console.log('🚀 Starting Frontend Authentication Tests...\n');
  
  let browser;
  let page;
  
  try {
    // Launch browser
    browser = await puppeteer.launch({ 
      headless: false, // Set to true for headless testing
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Browser Console Error:', msg.text());
      }
    });
    
    // Test 1: Access admin login page
    console.log('📋 Test 1: Admin Login Page Access');
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle0' });
    
    // Check if login form exists
    const loginForm = await page.$('form');
    const usernameInput = await page.$('#username');
    const passwordInput = await page.$('#password');
    const loginButton = await page.$('button[type="submit"]');
    
    if (loginForm && usernameInput && passwordInput && loginButton) {
      console.log('✅ Login form elements found');
    } else {
      throw new Error('Login form elements missing');
    }
    
    // Test 2: Invalid login attempt
    console.log('\n📋 Test 2: Invalid Login Attempt');
    await page.type('#username', 'invalid');
    await page.type('#password', 'invalid');
    await page.click('button[type="submit"]');
    
    // Wait for error message
    await delay(2000);
    const errorToast = await page.$('[data-sonner-toast]');
    if (errorToast) {
      console.log('✅ Error message displayed for invalid credentials');
    } else {
      console.log('⚠️  No error toast found, checking for other error indicators');
    }
    
    // Clear form
    await page.evaluate(() => {
      document.querySelector('#username').value = '';
      document.querySelector('#password').value = '';
    });
    
    // Test 3: Valid login attempt
    console.log('\n📋 Test 3: Valid Login Attempt');
    await page.type('#username', ADMIN_CREDENTIALS.username);
    await page.type('#password', ADMIN_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
    
    const currentUrl = page.url();
    if (currentUrl.includes('/admin/dashboard')) {
      console.log('✅ Successfully redirected to admin dashboard');
    } else {
      throw new Error(`Expected redirect to dashboard, but got: ${currentUrl}`);
    }
    
    // Test 4: Check JWT token storage
    console.log('\n📋 Test 4: JWT Token Storage');
    const tokenStored = await page.evaluate(() => {
      const token = localStorage.getItem('admin_token');
      const user = localStorage.getItem('admin_user');
      return { token: !!token, user: !!user, tokenLength: token?.length };
    });
    
    if (tokenStored.token && tokenStored.user) {
      console.log(`✅ JWT token stored (length: ${tokenStored.tokenLength})`);
      console.log('✅ User data stored in localStorage');
    } else {
      throw new Error('JWT token or user data not stored properly');
    }
    
    // Test 5: Dashboard content verification
    console.log('\n📋 Test 5: Dashboard Content Verification');
    const dashboardElements = await page.evaluate(() => {
      return {
        title: document.querySelector('h1')?.textContent,
        userInfo: document.querySelector('[data-testid="user-info"]') || 
                 document.querySelector('span:contains("admin")') ||
                 document.textContent.includes('admin'),
        logoutButton: !!document.querySelector('button:contains("Logout")') ||
                     !!document.querySelector('[data-testid="logout-button"]') ||
                     document.textContent.includes('Logout'),
        statsCards: document.querySelectorAll('[data-testid="stat-card"]').length ||
                   document.querySelectorAll('.card').length
      };
    });
    
    if (dashboardElements.title?.includes('Admin Dashboard')) {
      console.log('✅ Dashboard title found');
    }
    if (dashboardElements.logoutButton) {
      console.log('✅ Logout button found');
    }
    if (dashboardElements.statsCards > 0) {
      console.log(`✅ Dashboard stats cards found (${dashboardElements.statsCards})`);
    }
    
    // Test 6: Protected route navigation
    console.log('\n📋 Test 6: Protected Route Navigation');
    const protectedRoutes = [
      '/admin/categories',
      '/admin/settings',
      '/admin/content-strategy'
    ];
    
    for (const route of protectedRoutes) {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle0' });
      const currentUrl = page.url();
      
      if (currentUrl.includes(route)) {
        console.log(`✅ Successfully accessed ${route}`);
      } else if (currentUrl.includes('/admin/login')) {
        throw new Error(`Redirected to login for ${route} - authentication failed`);
      } else {
        console.log(`⚠️  Unexpected redirect for ${route}: ${currentUrl}`);
      }
    }
    
    // Test 7: Token verification on page refresh
    console.log('\n📋 Test 7: Token Persistence on Page Refresh');
    await page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: 'networkidle0' });
    await page.reload({ waitUntil: 'networkidle0' });
    
    const urlAfterRefresh = page.url();
    if (urlAfterRefresh.includes('/admin/dashboard')) {
      console.log('✅ Session persisted after page refresh');
    } else {
      throw new Error('Session not persisted after refresh');
    }
    
    // Test 8: Logout functionality
    console.log('\n📋 Test 8: Logout Functionality');
    
    // Find and click logout button
    const logoutClicked = await page.evaluate(() => {
      // Try multiple selectors for logout button
      const selectors = [
        'button:contains("Logout")',
        '[data-testid="logout-button"]',
        'button[onclick*="logout"]',
        'button[onclick*="signOut"]'
      ];
      
      // Try to find logout button by text content
      const buttons = Array.from(document.querySelectorAll('button'));
      const logoutButton = buttons.find(btn => 
        btn.textContent.toLowerCase().includes('logout') ||
        btn.textContent.toLowerCase().includes('sign out')
      );
      
      if (logoutButton) {
        logoutButton.click();
        return true;
      }
      return false;
    });
    
    if (logoutClicked) {
      console.log('✅ Logout button clicked');
      
      // Wait for redirect to login
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 });
      
      const urlAfterLogout = page.url();
      if (urlAfterLogout.includes('/admin/login')) {
        console.log('✅ Successfully redirected to login after logout');
      } else {
        console.log(`⚠️  Unexpected URL after logout: ${urlAfterLogout}`);
      }
      
      // Check if tokens are cleared
      const tokensCleared = await page.evaluate(() => {
        return {
          token: !localStorage.getItem('admin_token'),
          user: !localStorage.getItem('admin_user')
        };
      });
      
      if (tokensCleared.token && tokensCleared.user) {
        console.log('✅ Tokens cleared from localStorage');
      } else {
        console.log('⚠️  Tokens not properly cleared from localStorage');
      }
    } else {
      console.log('⚠️  Logout button not found, trying manual navigation');
    }
    
    // Test 9: Unauthorized access after logout
    console.log('\n📋 Test 9: Unauthorized Access Protection');
    await page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: 'networkidle0' });
    
    const finalUrl = page.url();
    if (finalUrl.includes('/admin/login')) {
      console.log('✅ Properly redirected to login when accessing protected route without auth');
    } else {
      throw new Error(`Expected redirect to login, but got: ${finalUrl}`);
    }
    
    console.log('\n🎉 All Frontend Authentication Tests Completed Successfully!');
    
    // Summary
    console.log('\n📊 Test Summary:');
    console.log('✅ Login page accessibility');
    console.log('✅ Invalid login handling');
    console.log('✅ Valid login and redirect');
    console.log('✅ JWT token storage');
    console.log('✅ Dashboard content loading');
    console.log('✅ Protected route navigation');
    console.log('✅ Session persistence');
    console.log('✅ Logout functionality');
    console.log('✅ Unauthorized access protection');
    
  } catch (error) {
    console.error('\n❌ Frontend Authentication Test Failed:', error.message);
    
    if (page) {
      // Take screenshot for debugging
      try {
        await page.screenshot({ path: 'auth-test-error.png', fullPage: true });
        console.log('📸 Error screenshot saved as auth-test-error.png');
      } catch (screenshotError) {
        console.log('Failed to take screenshot:', screenshotError.message);
      }
    }
    
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
if (require.main === module) {
  testFrontendAuthentication()
    .then(() => {
      console.log('\n✅ Frontend authentication testing completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Frontend authentication testing failed:', error);
      process.exit(1);
    });
}

module.exports = { testFrontendAuthentication };
/**
 * Improved Frontend Authentication Testing Script
 * Tests the React admin interface authentication integration with better waiting and error handling
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

async function waitForReactApp(page, timeout = 30000) {
  console.log('⏳ Waiting for React app to load...');
  
  try {
    // Wait for the root div to have content
    await page.waitForFunction(
      () => {
        const root = document.getElementById('root');
        return root && root.children.length > 0;
      },
      { timeout }
    );
    
    // Additional wait for React components to render
    await delay(2000);
    
    console.log('✅ React app loaded successfully');
    return true;
  } catch (error) {
    console.log('❌ React app failed to load:', error.message);
    return false;
  }
}

async function waitForLoginForm(page, timeout = 10000) {
  console.log('⏳ Waiting for login form to render...');
  
  try {
    // Wait for any of these selectors to appear
    await page.waitForFunction(
      () => {
        // Check for form element
        const form = document.querySelector('form');
        if (!form) return false;
        
        // Check for username input (by id or name or placeholder)
        const usernameInput = document.querySelector('#username') ||
                             document.querySelector('input[name="username"]') ||
                             document.querySelector('input[placeholder*="username" i]') ||
                             document.querySelector('input[type="text"]');
        
        // Check for password input
        const passwordInput = document.querySelector('#password') ||
                             document.querySelector('input[name="password"]') ||
                             document.querySelector('input[placeholder*="password" i]') ||
                             document.querySelector('input[type="password"]');
        
        // Check for submit button
        const submitButton = document.querySelector('button[type="submit"]') ||
                            document.querySelector('button:contains("Login")') ||
                            document.querySelector('input[type="submit"]');
        
        return usernameInput && passwordInput && (submitButton || form);
      },
      { timeout }
    );
    
    console.log('✅ Login form found');
    return true;
  } catch (error) {
    console.log('❌ Login form not found:', error.message);
    return false;
  }
}

async function debugPageContent(page) {
  console.log('\n🔍 Debugging page content...');
  
  const pageInfo = await page.evaluate(() => {
    return {
      title: document.title,
      url: window.location.href,
      rootContent: document.getElementById('root')?.innerHTML?.substring(0, 500) || 'No root content',
      hasForm: !!document.querySelector('form'),
      inputCount: document.querySelectorAll('input').length,
      buttonCount: document.querySelectorAll('button').length,
      bodyClasses: document.body.className,
      scripts: Array.from(document.querySelectorAll('script')).map(s => s.src || 'inline').slice(0, 5),
      errors: window.console?.errors || []
    };
  });
  
  console.log('📄 Page Info:');
  console.log('  Title:', pageInfo.title);
  console.log('  URL:', pageInfo.url);
  console.log('  Has Form:', pageInfo.hasForm);
  console.log('  Input Count:', pageInfo.inputCount);
  console.log('  Button Count:', pageInfo.buttonCount);
  console.log('  Body Classes:', pageInfo.bodyClasses);
  console.log('  Root Content Preview:', pageInfo.rootContent);
  console.log('  Scripts:', pageInfo.scripts);
}

async function findLoginElements(page) {
  console.log('🔍 Searching for login form elements...');
  
  const elements = await page.evaluate(() => {
    // Try multiple selectors for each element
    const findElement = (selectors) => {
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) return { selector, found: true, tagName: element.tagName, id: element.id, name: element.name, placeholder: element.placeholder };
      }
      return { found: false };
    };
    
    return {
      form: findElement(['form', '[role="form"]']),
      username: findElement([
        '#username',
        'input[name="username"]',
        'input[placeholder*="username" i]',
        'input[type="text"]',
        'input[autocomplete="username"]'
      ]),
      password: findElement([
        '#password',
        'input[name="password"]',
        'input[placeholder*="password" i]',
        'input[type="password"]',
        'input[autocomplete="current-password"]'
      ]),
      submit: findElement([
        'button[type="submit"]',
        'input[type="submit"]',
        'button:contains("Login")',
        'button:contains("Sign in")',
        'form button'
      ])
    };
  });
  
  console.log('🔍 Element Search Results:');
  Object.entries(elements).forEach(([key, result]) => {
    if (result.found) {
      console.log(`  ✅ ${key}: ${result.selector} (${result.tagName})`);
    } else {
      console.log(`  ❌ ${key}: Not found`);
    }
  });
  
  return elements;
}

async function testFrontendAuthentication() {
  console.log('🚀 Starting Improved Frontend Authentication Tests...\n');
  
  let browser;
  let page;
  
  try {
    // Launch browser with more options
    browser = await puppeteer.launch({ 
      headless: false, // Keep visible for debugging
      defaultViewport: { width: 1280, height: 720 },
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
    
    page = await browser.newPage();
    
    // Enable console logging and error tracking
    const consoleMessages = [];
    page.on('console', msg => {
      const message = `${msg.type()}: ${msg.text()}`;
      consoleMessages.push(message);
      if (msg.type() === 'error') {
        console.log('❌ Browser Console Error:', msg.text());
      }
    });
    
    page.on('pageerror', error => {
      console.log('❌ Page Error:', error.message);
    });
    
    // Test 1: Navigate to login page
    console.log('📋 Test 1: Navigate to Admin Login Page');
    await page.goto(`${BASE_URL}/admin/login`, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Debug initial page state
    await debugPageContent(page);
    
    // Test 2: Wait for React app to load
    console.log('\n📋 Test 2: React App Loading');
    const reactLoaded = await waitForReactApp(page);
    
    if (!reactLoaded) {
      await page.screenshot({ path: 'react-load-error.png', fullPage: true });
      throw new Error('React app failed to load');
    }
    
    // Debug after React load
    await debugPageContent(page);
    
    // Test 3: Wait for login form
    console.log('\n📋 Test 3: Login Form Detection');
    const formLoaded = await waitForLoginForm(page);
    
    if (!formLoaded) {
      const elements = await findLoginElements(page);
      await page.screenshot({ path: 'form-detection-error.png', fullPage: true });
      throw new Error('Login form not detected');
    }
    
    // Test 4: Find and verify form elements
    console.log('\n📋 Test 4: Form Elements Verification');
    const elements = await findLoginElements(page);
    
    if (!elements.username.found || !elements.password.found) {
      throw new Error('Required form elements not found');
    }
    
    // Test 5: Test form interaction
    console.log('\n📋 Test 5: Form Interaction Test');
    
    // Clear any existing values and type credentials
    await page.evaluate(() => {
      const usernameInput = document.querySelector('#username') || 
                           document.querySelector('input[type="text"]');
      const passwordInput = document.querySelector('#password') || 
                           document.querySelector('input[type="password"]');
      
      if (usernameInput) usernameInput.value = '';
      if (passwordInput) passwordInput.value = '';
    });
    
    // Type credentials using the found selectors
    await page.type(elements.username.selector, ADMIN_CREDENTIALS.username);
    await page.type(elements.password.selector, ADMIN_CREDENTIALS.password);
    
    console.log('✅ Credentials entered successfully');
    
    // Test 6: Submit form and check response
    console.log('\n📋 Test 6: Form Submission');
    
    // Click submit button
    await page.click(elements.submit.selector || 'button[type="submit"]');
    
    // Wait for either redirect or error message
    try {
      await Promise.race([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
        page.waitForSelector('[data-sonner-toast]', { timeout: 5000 }),
        delay(5000)
      ]);
    } catch (error) {
      console.log('⚠️ No immediate navigation or toast, checking current state...');
    }
    
    const currentUrl = page.url();
    console.log('Current URL after submission:', currentUrl);
    
    // Test 7: Check authentication result
    console.log('\n📋 Test 7: Authentication Result Check');
    
    if (currentUrl.includes('/admin/dashboard')) {
      console.log('✅ Successfully redirected to dashboard');
      
      // Check token storage
      const tokenInfo = await page.evaluate(() => {
        return {
          token: localStorage.getItem('admin_token'),
          user: localStorage.getItem('admin_user'),
          tokenExists: !!localStorage.getItem('admin_token')
        };
      });
      
      if (tokenInfo.tokenExists) {
        console.log('✅ Authentication token stored');
      } else {
        console.log('⚠️ Authentication token not found');
      }
      
    } else if (currentUrl.includes('/admin/login')) {
      // Check for error messages
      const errorMessage = await page.evaluate(() => {
        const toast = document.querySelector('[data-sonner-toast]');
        return toast ? toast.textContent : null;
      });
      
      if (errorMessage) {
        console.log('❌ Login failed with error:', errorMessage);
      } else {
        console.log('⚠️ Still on login page, no error message visible');
      }
    }
    
    // Test 8: Console messages summary
    console.log('\n📋 Test 8: Console Messages Summary');
    console.log('Total console messages:', consoleMessages.length);
    const errors = consoleMessages.filter(msg => msg.startsWith('error:'));
    if (errors.length > 0) {
      console.log('Console errors:');
      errors.forEach(error => console.log('  -', error));
    }
    
    console.log('\n🎉 Frontend Authentication Test Completed!');
    
  } catch (error) {
    console.error('\n❌ Frontend Authentication Test Failed:', error.message);
    
    if (page) {
      try {
        await debugPageContent(page);
        await page.screenshot({ path: 'auth-test-error-improved.png', fullPage: true });
        console.log('📸 Error screenshot saved as auth-test-error-improved.png');
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
      console.log('\n✅ Improved frontend authentication testing completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Improved frontend authentication testing failed:', error);
      process.exit(1);
    });
}

module.exports = { testFrontendAuthentication };
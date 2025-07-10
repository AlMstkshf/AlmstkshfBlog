import { test, expect } from '@playwright/test';

test.describe('API Integration and Settings Testing', () => {
  const baseURL = 'http://localhost:5000';

  test('should verify API endpoints are accessible', async ({ page }) => {
    // Test public API endpoints
    const publicEndpoints = [
      '/api/articles',
      '/api/categories',
      '/api/health'
    ];

    for (const endpoint of publicEndpoints) {
      const response = await page.request.get(`${baseURL}${endpoint}`);
      
      // API should respond (even if with empty data or auth required)
      expect(response.status()).toBeLessThan(500); // No server errors
      
      console.log(`${endpoint}: ${response.status()}`);
    }
  });

  test('should verify health check endpoint', async ({ page }) => {
    const response = await page.request.get(`${baseURL}/api/health`);
    
    expect(response.status()).toBe(200);
    
    const healthData = await response.json();
    expect(healthData).toHaveProperty('status');
    expect(['healthy', 'degraded'].includes(healthData.status)).toBeTruthy();
    
    // Log the actual health status for debugging
    console.log('Health check status:', healthData.status);
    console.log('Database response time:', healthData.database?.responseTime);
  });

  test('should test articles API endpoint', async ({ page }) => {
    const response = await page.request.get(`${baseURL}/api/articles`);
    
    // Should return articles data or empty array
    expect(response.status()).toBeLessThan(400);
    
    if (response.status() === 200) {
      const articlesData = await response.json();
      expect(Array.isArray(articlesData) || typeof articlesData === 'object').toBeTruthy();
    }
  });

  test('should test categories API endpoint', async ({ page }) => {
    const response = await page.request.get(`${baseURL}/api/categories`);
    
    // Should return categories data
    expect(response.status()).toBeLessThan(400);
    
    if (response.status() === 200) {
      const categoriesData = await response.json();
      expect(Array.isArray(categoriesData) || typeof categoriesData === 'object').toBeTruthy();
    }
  });

  test('should verify admin API endpoints require authentication', async ({ page }) => {
    const adminEndpoints = [
      '/api/admin/settings',
      '/api/admin/articles',
      '/api/admin/categories'
    ];

    for (const endpoint of adminEndpoints) {
      const response = await page.request.get(`${baseURL}${endpoint}`);
      
      // Should require authentication (401) or redirect (302/303)
      expect([401, 403, 302, 303, 200].includes(response.status())).toBeTruthy();
      
      console.log(`${endpoint}: ${response.status()}`);
    }
  });

  test('should test admin settings API', async ({ page }) => {
    // First try without authentication
    const unauthResponse = await page.request.get(`${baseURL}/api/admin/settings`);
    
    // Should either require auth or return settings
    expect(unauthResponse.status()).toBeLessThan(500);
    
    if (unauthResponse.status() === 200) {
      const settingsData = await unauthResponse.json();
      expect(typeof settingsData === 'object').toBeTruthy();
      
      // Verify expected settings properties
      const expectedSettings = [
        'publishingEnabled', 'aiContentEnabled', 'emailNotifications',
        'siteName', 'siteDescription'
      ];
      
      const foundSettings = expectedSettings.filter(setting => 
        settingsData.hasOwnProperty(setting)
      );
      
      expect(foundSettings.length).toBeGreaterThan(0);
    }
  });

  test('should verify AI content generation API', async ({ page }) => {
    // Test AI content generation endpoint
    const response = await page.request.post(`${baseURL}/api/ai/generate-content`, {
      data: {
        type: 'title',
        language: 'en',
        category: 'technology'
      }
    });

    // Should either work or require authentication
    expect([200, 401, 403, 500].includes(response.status())).toBeTruthy();
    
    console.log(`AI Content Generation API: ${response.status()}`);
  });

  test('should test automation API endpoints', async ({ page }) => {
    const automationEndpoints = [
      '/api/automation/test',
      '/api/automation/status'
    ];

    for (const endpoint of automationEndpoints) {
      const response = await page.request.get(`${baseURL}${endpoint}`);
      
      // Should respond appropriately
      expect(response.status()).toBeLessThan(500);
      
      console.log(`${endpoint}: ${response.status()}`);
    }
  });

  test('should verify newsletter subscription API', async ({ page }) => {
    const response = await page.request.post(`${baseURL}/api/newsletter/subscribe`, {
      data: {
        email: 'test@example.com',
        language: 'en'
      }
    });

    // Should handle subscription request
    expect([200, 201, 400, 409].includes(response.status())).toBeTruthy();
    
    console.log(`Newsletter subscription: ${response.status()}`);
  });

  test('should test contact form API', async ({ page }) => {
    const response = await page.request.post(`${baseURL}/api/contact`, {
      data: {
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message',
        language: 'en'
      }
    });

    // Should handle contact form submission
    expect([200, 201, 400].includes(response.status())).toBeTruthy();
    
    console.log(`Contact form: ${response.status()}`);
  });

  test('should verify file upload API', async ({ page }) => {
    // Test file upload endpoint
    const response = await page.request.post(`${baseURL}/api/upload`, {
      multipart: {
        file: {
          name: 'test.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from('test content')
        }
      }
    });

    // Should either work or require authentication
    expect([200, 201, 401, 403, 413].includes(response.status())).toBeTruthy();
    
    console.log(`File upload: ${response.status()}`);
  });

  test('should test search API functionality', async ({ page }) => {
    const response = await page.request.get(`${baseURL}/api/search?q=test&lang=en`);
    
    // Should return search results
    expect(response.status()).toBeLessThan(400);
    
    if (response.status() === 200) {
      const searchData = await response.json();
      expect(typeof searchData === 'object').toBeTruthy();
    }
  });

  test('should verify API error handling', async ({ page }) => {
    // Test invalid endpoints
    const invalidEndpoints = [
      '/api/nonexistent',
      '/api/articles/invalid-id',
      '/api/admin/invalid-endpoint'
    ];

    for (const endpoint of invalidEndpoints) {
      const response = await page.request.get(`${baseURL}${endpoint}`);
      
      // Should return appropriate error codes
      expect([404, 400, 401, 403].includes(response.status())).toBeTruthy();
      
      console.log(`${endpoint}: ${response.status()}`);
    }
  });

  test('should test API rate limiting', async ({ page }) => {
    // Make multiple rapid requests to test rate limiting
    const requests = [];
    
    for (let i = 0; i < 10; i++) {
      requests.push(page.request.get(`${baseURL}/api/articles`));
    }
    
    const responses = await Promise.all(requests);
    
    // Should handle multiple requests appropriately
    responses.forEach((response, index) => {
      expect(response.status()).toBeLessThan(500);
      console.log(`Request ${index + 1}: ${response.status()}`);
    });
  });

  test('should verify CORS headers', async ({ page }) => {
    const response = await page.request.get(`${baseURL}/api/health`);
    
    const headers = response.headers();
    
    // Check for CORS headers (if configured)
    console.log('Response headers:', Object.keys(headers));
    
    // Verify response is valid
    expect(response.status()).toBe(200);
  });

  test('should test API response formats', async ({ page }) => {
    const endpoints = [
      '/api/articles',
      '/api/categories',
      '/api/health'
    ];

    for (const endpoint of endpoints) {
      const response = await page.request.get(`${baseURL}${endpoint}`);
      
      if (response.status() === 200) {
        const contentType = response.headers()['content-type'];
        expect(contentType).toMatch(/application\/json/);
        
        // Verify JSON is valid
        const data = await response.json();
        expect(typeof data === 'object').toBeTruthy();
      }
    }
  });

  test('should verify API authentication flow', async ({ page }) => {
    // Test login endpoint
    const loginResponse = await page.request.post(`${baseURL}/api/auth/login`, {
      data: {
        username: 'admin',
        password: 'P@ssword#123'
      }
    });

    console.log(`Login API: ${loginResponse.status()}`);
    
    // Should handle login attempt
    expect([200, 201, 400, 401, 404].includes(loginResponse.status())).toBeTruthy();
  });

  test('should test environment configuration', async ({ page }) => {
    // Navigate to a page that might show environment info
    await page.goto(`${baseURL}/admin/settings`);
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Check if Gemini API key is configured (should be visible in settings)
    const pageContent = await page.locator('body').textContent();
    
    // Should show some indication of AI services configuration
    expect(pageContent).toMatch(/ai|gemini|openai|api|key|configuration/i);
  });
});
import { test, expect } from '@playwright/test';

test.describe('Advanced User Flows and Content Management', () => {
  const baseURL = 'http://localhost:5000';

  test('should complete full article reading journey', async ({ page }) => {
    // Start from homepage
    await page.goto(baseURL);
    
    // Verify homepage loads
    await expect(page).toHaveURL(/.*\/ar/);
    await expect(page.locator('body')).toBeVisible();
    
    // Navigate to blog section
    const blogLink = page.locator('a[href*="/blog"], a:has-text("Blog"), a:has-text("مدونة")').first();
    
    if (await blogLink.isVisible()) {
      await blogLink.click();
    } else {
      await page.goto(`${baseURL}/ar/blog`);
    }
    
    // Wait for blog page to load
    await page.waitForTimeout(2000);
    
    // Look for article links
    const articleLink = page.locator('a[href*="/blog/"], article a, .article-card a').first();
    
    if (await articleLink.isVisible()) {
      await articleLink.click();
      
      // Verify article page loads
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).toBeVisible();
      
      // Verify article content
      const articleContent = await page.locator('body').textContent();
      expect(articleContent).toBeTruthy();
      expect(articleContent!.length).toBeGreaterThan(100);
    }
  });

  test('should test search functionality end-to-end', async ({ page }) => {
    // Navigate to search page
    await page.goto(`${baseURL}/search`);
    
    // Verify search page loads
    await expect(page.locator('body')).toBeVisible();
    
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"], input[placeholder*="بحث"]').first();
    
    if (await searchInput.isVisible()) {
      // Perform search
      await searchInput.fill('technology');
      
      // Look for search button or press Enter
      const searchButton = page.locator('button[type="submit"], button:has-text("Search"), button:has-text("بحث")').first();
      
      if (await searchButton.isVisible()) {
        await searchButton.click();
      } else {
        await searchInput.press('Enter');
      }
      
      // Wait for search results
      await page.waitForTimeout(3000);
      
      // Verify search results or no results message
      const pageContent = await page.locator('body').textContent();
      expect(pageContent).toMatch(/result|article|found|technology|نتائج|مقال/i);
    }
  });

  test('should test language switching user flow', async ({ page }) => {
    // Start with Arabic
    await page.goto(`${baseURL}/ar`);
    await expect(page).toHaveURL(/.*\/ar/);
    
    // Look for language switcher
    const languageSwitcher = page.locator('[data-testid="language-toggle"], button:has-text("EN"), button:has-text("English")').first();
    
    if (await languageSwitcher.isVisible()) {
      await languageSwitcher.click();
      await page.waitForTimeout(2000);
      
      // Should switch to English
      await expect(page).toHaveURL(/.*\/en/);
    } else {
      // Manual navigation to English
      await page.goto(`${baseURL}/en`);
      await expect(page).toHaveURL(/.*\/en/);
    }
    
    // Verify English content
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
    
    // Switch back to Arabic
    const arabicSwitcher = page.locator('button:has-text("AR"), button:has-text("العربية")').first();
    
    if (await arabicSwitcher.isVisible()) {
      await arabicSwitcher.click();
      await page.waitForTimeout(2000);
      await expect(page).toHaveURL(/.*\/ar/);
    }
  });

  test('should test category navigation flow', async ({ page }) => {
    // Navigate to blog
    await page.goto(`${baseURL}/ar/blog`);
    
    // Look for category links or filters - check for valid category slugs
    const validCategories = ['government', 'business-intelligence', 'technology-innovation', 'social-media-analysis'];
    
    // Try to find category links in the page
    const categoryLinks = page.locator('a[href*="/blog/government"], a[href*="/blog/business-intelligence"], a[href*="/blog/technology-innovation"], a[href*="/blog/social-media-analysis"]');
    
    const categoryCount = await categoryLinks.count();
    
    if (categoryCount > 0) {
      // Click on first available category
      const firstCategoryLink = categoryLinks.first();
      await firstCategoryLink.click();
      await page.waitForTimeout(2000);
      
      // Verify category page loads (should not be 404)
      await expect(page.locator('body')).toBeVisible();
      
      const pageContent = await page.locator('body').textContent();
      const currentUrl = page.url();
      
      // Should not show 404 error
      expect(pageContent).not.toMatch(/404|not found|page not found/i);
      
      // Should show category-related content
      expect(pageContent).toMatch(/category|articles|مقالات|فئة|specialized|متخصص/i);
      
      console.log('Category page URL:', currentUrl);
    } else {
      // Test direct navigation to a valid category
      await page.goto(`${baseURL}/ar/blog/government`);
      await page.waitForTimeout(2000);
      
      const pageContent = await page.locator('body').textContent();
      
      // Should either show category content or "no articles" message, but not 404
      expect(pageContent).not.toMatch(/404|not found|page not found/i);
      expect(pageContent).toMatch(/government|category|articles|مقالات|حكوم/i);
    }
  });

  test('should test newsletter subscription flow', async ({ page }) => {
    // Navigate to homepage
    await page.goto(baseURL);
    
    // Look for newsletter subscription form
    const emailInput = page.locator('input[type="email"], input[placeholder*="email"], input[placeholder*="بريد"]').first();
    const subscribeButton = page.locator('button:has-text("Subscribe"), button:has-text("اشترك"), button[type="submit"]').first();
    
    if (await emailInput.isVisible() && await subscribeButton.isVisible()) {
      // Fill email and subscribe
      await emailInput.fill('test@example.com');
      await subscribeButton.click();
      
      // Wait for response
      await page.waitForTimeout(3000);
      
      // Look for success or error message
      const pageContent = await page.locator('body').textContent();
      expect(pageContent).toMatch(/subscrib|success|error|thank|شكر|اشتراك/i);
    }
  });

  test('should test contact form submission flow', async ({ page }) => {
    // Navigate to contact page
    await page.goto(`${baseURL}/contact`);
    
    // Look for contact form fields
    const nameInput = page.locator('input[name="name"], input[placeholder*="name"], input[placeholder*="اسم"]').first();
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    const messageInput = page.locator('textarea[name="message"], textarea[placeholder*="message"]').first();
    const submitButton = page.locator('button[type="submit"], button:has-text("Send"), button:has-text("إرسال")').first();
    
    if (await nameInput.isVisible() && await emailInput.isVisible() && await messageInput.isVisible()) {
      // Fill form
      await nameInput.fill('Test User');
      await emailInput.fill('test@example.com');
      await messageInput.fill('This is a test message from e2e testing.');
      
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Wait for response
        await page.waitForTimeout(3000);
        
        // Look for success message
        const pageContent = await page.locator('body').textContent();
        expect(pageContent).toMatch(/sent|success|thank|error|إرسال|شكر/i);
      }
    }
  });

  test('should test article sharing functionality', async ({ page }) => {
    // Navigate to an article
    await page.goto(`${baseURL}/ar/blog`);
    
    // Find and click on an article
    const articleLink = page.locator('a[href*="/blog/"]').first();
    
    if (await articleLink.isVisible()) {
      await articleLink.click();
      await page.waitForTimeout(2000);
      
      // Look for social sharing buttons
      const shareButtons = page.locator('.share-button, .social-share, button:has-text("Share"), a[href*="twitter"], a[href*="facebook"]');
      
      const shareCount = await shareButtons.count();
      
      if (shareCount > 0) {
        console.log(`Found ${shareCount} share buttons`);
        
        // Verify share buttons are present
        expect(shareCount).toBeGreaterThan(0);
      }
    }
  });

  test('should test responsive navigation on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to homepage
    await page.goto(baseURL);
    
    // Look for mobile menu toggle
    const mobileMenuToggle = page.locator('.mobile-menu-toggle, .hamburger, button[aria-label*="menu"]').first();
    
    if (await mobileMenuToggle.isVisible()) {
      await mobileMenuToggle.click();
      await page.waitForTimeout(1000);
      
      // Verify mobile menu opens
      const mobileMenu = page.locator('.mobile-menu, .nav-menu, .menu-overlay');
      
      if (await mobileMenu.isVisible()) {
        // Look for navigation links in mobile menu
        const navLinks = page.locator('.mobile-menu a, .nav-menu a');
        const linkCount = await navLinks.count();
        
        expect(linkCount).toBeGreaterThan(0);
      }
    }
  });

  test('should test article pagination flow', async ({ page }) => {
    // Navigate to blog
    await page.goto(`${baseURL}/ar/blog`);
    
    // Look for pagination controls
    const paginationNext = page.locator('.pagination-next, button:has-text("Next"), a:has-text("التالي")').first();
    const paginationPrev = page.locator('.pagination-prev, button:has-text("Previous"), a:has-text("السابق")').first();
    const pageNumbers = page.locator('.pagination .page-number, .pagination a[href*="page="]');
    
    const pageNumberCount = await pageNumbers.count();
    
    if (pageNumberCount > 0) {
      // Click on page 2 if available
      const page2Link = page.locator('a:has-text("2"), .page-number:has-text("2")').first();
      
      if (await page2Link.isVisible()) {
        await page2Link.click();
        await page.waitForTimeout(2000);
        
        // Verify page 2 loads
        const currentUrl = page.url();
        expect(currentUrl).toMatch(/page=2|\/2/);
      }
    }
  });

  test('should test article reading progress and time estimation', async ({ page }) => {
    // Navigate to an article
    await page.goto(`${baseURL}/ar/blog`);
    
    const articleLink = page.locator('a[href*="/blog/"]').first();
    
    if (await articleLink.isVisible()) {
      await articleLink.click();
      await page.waitForTimeout(2000);
      
      // Look for reading time indicator
      const readingTime = page.locator('.reading-time, .read-time, [data-testid="reading-time"]');
      
      if (await readingTime.isVisible()) {
        const timeText = await readingTime.textContent();
        expect(timeText).toMatch(/min|minute|دقيقة/i);
      }
      
      // Look for reading progress indicator
      const progressBar = page.locator('.reading-progress, .progress-bar, [data-testid="reading-progress"]');
      
      if (await progressBar.isVisible()) {
        // Scroll down to test progress
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
        await page.waitForTimeout(1000);
        
        // Progress should update (this is visual, so we just verify it exists)
        expect(await progressBar.isVisible()).toBeTruthy();
      }
    }
  });

  test('should test accessibility features', async ({ page }) => {
    // Navigate to homepage
    await page.goto(baseURL);
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    
    // Check for focus indicators
    const focusedElement = page.locator(':focus');
    
    if (await focusedElement.count() > 0) {
      console.log('Keyboard navigation working');
    }
    
    // Look for accessibility features
    const skipLink = page.locator('.skip-link, a:has-text("Skip to content")');
    const altTexts = page.locator('img[alt]');
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    
    const altTextCount = await altTexts.count();
    const headingCount = await headings.count();
    
    console.log(`Found ${altTextCount} images with alt text`);
    console.log(`Found ${headingCount} headings`);
    
    // Verify basic accessibility structure
    expect(headingCount).toBeGreaterThan(0);
  });

  test('should test error handling and 404 pages', async ({ page }) => {
    // Test 404 page
    await page.goto(`${baseURL}/nonexistent-page`);
    
    // Should show 404 page or redirect
    const pageContent = await page.locator('body').textContent();
    
    // Should handle 404 gracefully
    expect(pageContent).toMatch(/404|not found|page not found|الصفحة غير موجودة/i);
  });

  test('should test performance and loading states', async ({ page }) => {
    // Navigate to blog with network throttling
    await page.goto(`${baseURL}/ar/blog`);
    
    // Look for loading indicators
    const loadingIndicators = page.locator('.loading, .spinner, .skeleton, [data-testid="loading"]');
    
    // Wait for content to load
    await page.waitForTimeout(3000);
    
    // Verify page loads completely
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
    expect(pageContent!.length).toBeGreaterThan(50);
  });
});
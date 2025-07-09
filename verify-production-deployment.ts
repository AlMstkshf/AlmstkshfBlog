#!/usr/bin/env tsx

/**
 * Production Deployment Verification Script
 * Tests all critical endpoints and functionality after Netlify deployment
 */

import { config } from 'dotenv';

// Load environment variables
config();

const PRODUCTION_URL = 'https://almstkshfblog.netlify.app';
const TIMEOUT = 10000; // 10 seconds

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  responseTime?: number;
}

class ProductionTester {
  private results: TestResult[] = [];

  private async makeRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'User-Agent': 'AlmstkshfBlog-ProductionTester/1.0',
          ...options.headers,
        },
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private addResult(name: string, status: 'PASS' | 'FAIL' | 'SKIP', message: string, responseTime?: number) {
    this.results.push({ name, status, message, responseTime });
  }

  private async testEndpoint(name: string, endpoint: string, expectedStatus: number = 200): Promise<void> {
    const startTime = Date.now();
    try {
      const response = await this.makeRequest(`${PRODUCTION_URL}${endpoint}`);
      const responseTime = Date.now() - startTime;
      
      if (response.status === expectedStatus) {
        this.addResult(name, 'PASS', `Status: ${response.status}`, responseTime);
      } else {
        this.addResult(name, 'FAIL', `Expected ${expectedStatus}, got ${response.status}`, responseTime);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.addResult(name, 'FAIL', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, responseTime);
    }
  }

  private async testApiEndpoint(name: string, endpoint: string): Promise<void> {
    const startTime = Date.now();
    try {
      const response = await this.makeRequest(`${PRODUCTION_URL}${endpoint}`);
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        this.addResult(name, 'PASS', `Status: ${response.status}, Data received`, responseTime);
      } else {
        this.addResult(name, 'FAIL', `Status: ${response.status}`, responseTime);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.addResult(name, 'FAIL', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, responseTime);
    }
  }

  private async testArticlesData(): Promise<void> {
    const startTime = Date.now();
    try {
      const response = await this.makeRequest(`${PRODUCTION_URL}/api/articles`);
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        const articles = data.articles || data;
        
        if (Array.isArray(articles) && articles.length >= 7) {
          this.addResult('Articles Data', 'PASS', `Found ${articles.length} articles`, responseTime);
        } else {
          this.addResult('Articles Data', 'FAIL', `Expected 7+ articles, found ${articles?.length || 0}`, responseTime);
        }
      } else {
        this.addResult('Articles Data', 'FAIL', `Status: ${response.status}`, responseTime);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.addResult('Articles Data', 'FAIL', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, responseTime);
    }
  }

  private async testCategoriesData(): Promise<void> {
    const startTime = Date.now();
    try {
      const response = await this.makeRequest(`${PRODUCTION_URL}/api/categories`);
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        const categories = data.categories || data;
        
        if (Array.isArray(categories) && categories.length >= 4) {
          this.addResult('Categories Data', 'PASS', `Found ${categories.length} categories`, responseTime);
        } else {
          this.addResult('Categories Data', 'FAIL', `Expected 4+ categories, found ${categories?.length || 0}`, responseTime);
        }
      } else {
        this.addResult('Categories Data', 'FAIL', `Status: ${response.status}`, responseTime);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.addResult('Categories Data', 'FAIL', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, responseTime);
    }
  }

  private async testFeaturedArticles(): Promise<void> {
    const startTime = Date.now();
    try {
      const response = await this.makeRequest(`${PRODUCTION_URL}/api/articles/featured`);
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        const featured = data.articles || data;
        
        if (Array.isArray(featured) && featured.length >= 3) {
          this.addResult('Featured Articles', 'PASS', `Found ${featured.length} featured articles`, responseTime);
        } else {
          this.addResult('Featured Articles', 'FAIL', `Expected 3+ featured articles, found ${featured?.length || 0}`, responseTime);
        }
      } else {
        this.addResult('Featured Articles', 'FAIL', `Status: ${response.status}`, responseTime);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.addResult('Featured Articles', 'FAIL', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, responseTime);
    }
  }

  public async runAllTests(): Promise<void> {
    console.log('🚀 AlmstkshfBlog Production Deployment Verification');
    console.log(`🌐 Testing: ${PRODUCTION_URL}`);
    console.log('=' .repeat(60));

    // Test basic connectivity
    console.log('\n📡 Testing Basic Connectivity...');
    await this.testEndpoint('Homepage', '/');
    await this.testEndpoint('Health Check', '/api/health');

    // Test API endpoints
    console.log('\n🔌 Testing API Endpoints...');
    await this.testApiEndpoint('Articles API', '/api/articles');
    await this.testApiEndpoint('Categories API', '/api/categories');
    await this.testApiEndpoint('Featured Articles API', '/api/articles/featured');

    // Test data integrity
    console.log('\n📊 Testing Data Integrity...');
    await this.testArticlesData();
    await this.testCategoriesData();
    await this.testFeaturedArticles();

    // Test frontend pages
    console.log('\n🖥️  Testing Frontend Pages...');
    await this.testEndpoint('Articles Page', '/articles');
    await this.testEndpoint('Categories Page', '/categories');
    await this.testEndpoint('About Page', '/about');

    // Display results
    this.displayResults();
  }

  private displayResults(): void {
    console.log('\n' + '=' .repeat(60));
    console.log('📋 TEST RESULTS SUMMARY');
    console.log('=' .repeat(60));

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;

    this.results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
      const time = result.responseTime ? ` (${result.responseTime}ms)` : '';
      console.log(`${icon} ${result.name}: ${result.message}${time}`);
    });

    console.log('\n' + '=' .repeat(60));
    console.log(`📊 SUMMARY: ${passed} passed, ${failed} failed, ${skipped} skipped`);
    
    if (failed === 0) {
      console.log('🎉 ALL TESTS PASSED! Production deployment is successful.');
      console.log(`🌐 Your blog is live at: ${PRODUCTION_URL}`);
    } else {
      console.log('⚠️  Some tests failed. Please check the issues above.');
    }
    
    console.log('=' .repeat(60));
  }
}

// Run the tests
async function main() {
  const tester = new ProductionTester();
  await tester.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

export default ProductionTester;
interface BenchmarkResult {
  timestamp: number;
  testName: string;
  responseTime: number;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  databaseResponseTime?: number;
  apiCalls: number;
  errors: number;
  success: boolean;
}

interface ComparisonResult {
  improvement: number; // percentage
  isImprovement: boolean;
  metric: string;
  beforeValue: number;
  afterValue: number;
  significantChange: boolean; // >5% change
}

export class PerformanceBenchmark {
  private results: BenchmarkResult[] = [];
  private baselineResults: BenchmarkResult[] = [];

  // Benchmark API endpoints
  async benchmarkApiEndpoint(
    url: string, 
    testName: string, 
    iterations: number = 10
  ): Promise<BenchmarkResult> {
    const results: number[] = [];
    let errors = 0;
    
    console.log(`Starting benchmark: ${testName} (${iterations} iterations)`);
    
    for (let i = 0; i < iterations; i++) {
      try {
        const start = performance.now();
        const response = await fetch(url);
        const end = performance.now();
        
        if (response.ok) {
          results.push(end - start);
        } else {
          errors++;
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        errors++;
      }
    }

    const avgResponseTime = results.length > 0 
      ? results.reduce((a, b) => a + b, 0) / results.length 
      : 0;

    const result: BenchmarkResult = {
      timestamp: Date.now(),
      testName,
      responseTime: avgResponseTime,
      memoryUsage: process.memoryUsage(),
      apiCalls: iterations,
      errors,
      success: errors < iterations * 0.1 // <10% error rate = success
    };

    this.results.push(result);
    return result;
  }

  // Benchmark database operations
  async benchmarkDatabase(testName: string): Promise<BenchmarkResult> {
    const start = performance.now();
    
    try {
      // Test simple database query
      const { storage } = await import('../storage');
      await storage.getCategories();
      
      const end = performance.now();
      
      const result: BenchmarkResult = {
        timestamp: Date.now(),
        testName,
        responseTime: end - start,
        databaseResponseTime: end - start,
        memoryUsage: process.memoryUsage(),
        apiCalls: 1,
        errors: 0,
        success: true
      };

      this.results.push(result);
      return result;
    } catch (error) {
      const result: BenchmarkResult = {
        timestamp: Date.now(),
        testName,
        responseTime: 0,
        databaseResponseTime: 0,
        memoryUsage: process.memoryUsage(),
        apiCalls: 1,
        errors: 1,
        success: false
      };

      this.results.push(result);
      return result;
    }
  }

  // Set baseline (before changes)
  async setBaseline(): Promise<void> {
    console.log('Setting performance baseline...');
    
    const tests = [
      { url: 'http://localhost:5000/api/articles', name: 'Articles API' },
      { url: 'http://localhost:5000/api/categories', name: 'Categories API' },
    ];

    this.baselineResults = [];
    
    for (const test of tests) {
      const result = await this.benchmarkApiEndpoint(test.url, test.name);
      this.baselineResults.push(result);
    }

    // Database benchmark
    const dbResult = await this.benchmarkDatabase('Database Query');
    this.baselineResults.push(dbResult);

    console.log('Baseline set successfully');
    this.logResults(this.baselineResults, 'BASELINE');
  }

  // Compare current performance with baseline
  async compareWithBaseline(): Promise<ComparisonResult[]> {
    if (this.baselineResults.length === 0) {
      throw new Error('No baseline set. Run setBaseline() first.');
    }

    console.log('Running comparison benchmarks...');
    
    const currentResults: BenchmarkResult[] = [];
    
    // Re-run the same tests
    const tests = [
      { url: 'http://localhost:5000/api/articles', name: 'Articles API' },
      { url: 'http://localhost:5000/api/categories', name: 'Categories API' },
    ];

    for (const test of tests) {
      const result = await this.benchmarkApiEndpoint(test.url, test.name);
      currentResults.push(result);
    }

    const dbResult = await this.benchmarkDatabase('Database Query');
    currentResults.push(dbResult);

    // Compare results
    const comparisons: ComparisonResult[] = [];

    for (let i = 0; i < this.baselineResults.length; i++) {
      const baseline = this.baselineResults[i];
      const current = currentResults[i];

      if (baseline && current && baseline.testName === current.testName) {
        const responseTimeComparison = this.calculateImprovement(
          baseline.responseTime,
          current.responseTime,
          'Response Time'
        );

        const memoryComparison = this.calculateImprovement(
          baseline.memoryUsage.heapUsed,
          current.memoryUsage.heapUsed,
          'Memory Usage'
        );

        comparisons.push(responseTimeComparison, memoryComparison);
      }
    }

    this.logComparison(comparisons);
    return comparisons;
  }

  private calculateImprovement(
    before: number, 
    after: number, 
    metric: string
  ): ComparisonResult {
    const improvement = ((before - after) / before) * 100;
    const isImprovement = metric === 'Memory Usage' ? improvement > 0 : improvement > 0;
    
    return {
      improvement: Math.abs(improvement),
      isImprovement,
      metric,
      beforeValue: before,
      afterValue: after,
      significantChange: Math.abs(improvement) > 5
    };
  }

  private logResults(results: BenchmarkResult[], label: string): void {
    console.log(`\n=== ${label} RESULTS ===`);
    results.forEach(result => {
      console.log(`${result.testName}:`);
      console.log(`  Response Time: ${result.responseTime.toFixed(2)}ms`);
      console.log(`  Memory (Heap): ${(result.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`);
      console.log(`  Success Rate: ${((result.apiCalls - result.errors) / result.apiCalls * 100).toFixed(1)}%`);
      console.log('');
    });
  }

  private logComparison(comparisons: ComparisonResult[]): void {
    console.log('\n=== PERFORMANCE COMPARISON ===');
    comparisons.forEach(comp => {
      const status = comp.isImprovement ? '✅ IMPROVED' : '❌ DEGRADED';
      const significance = comp.significantChange ? 'SIGNIFICANT' : 'minor';
      
      console.log(`${comp.metric}: ${status} (${comp.improvement.toFixed(1)}% - ${significance})`);
      console.log(`  Before: ${comp.beforeValue.toFixed(2)} | After: ${comp.afterValue.toFixed(2)}`);
    });
  }

  // Get detailed report
  getDetailedReport(): {
    baseline: BenchmarkResult[];
    current: BenchmarkResult[];
    summary: string;
  } {
    return {
      baseline: this.baselineResults,
      current: this.results.slice(-this.baselineResults.length),
      summary: `Total tests: ${this.results.length}, Baseline tests: ${this.baselineResults.length}`
    };
  }

  // Verify improvements are real (multiple runs)
  async verifyImprovement(iterations: number = 3): Promise<boolean> {
    const comparisons: ComparisonResult[][] = [];
    
    for (let i = 0; i < iterations; i++) {
      const comparison = await this.compareWithBaseline();
      comparisons.push(comparison);
      
      // Wait between iterations
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Check if improvements are consistent
    const consistentImprovements = comparisons[0].map((_, index) => {
      const allImproved = comparisons.every(comp => comp[index]?.isImprovement);
      const avgImprovement = comparisons.reduce((sum, comp) => 
        sum + (comp[index]?.improvement || 0), 0) / comparisons.length;
      
      return allImproved && avgImprovement > 5; // >5% consistent improvement
    });

    return consistentImprovements.some(improved => improved);
  }
}

export const performanceBenchmark = new PerformanceBenchmark();
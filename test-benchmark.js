  // test/performance-benchmark.test.ts
  import 'ts-node/register';
  import { performanceBenchmark } from '../server/automation/performanceBenchmark';

  async function runTest(): Promise<void> {
    try {
      console.log('🔍 Setting baseline performance...');
      await performanceBenchmark.setBaseline();

      console.log('⏱️ Waiting 3 seconds...');
      await new Promise((res) => setTimeout(res, 3000));

      console.log('📊 Comparing current performance with baseline...');
      const comparison = await performanceBenchmark.compareWithBaseline();
      console.log('📈 Comparison result:', comparison);

      console.log('✅ Test completed successfully');
      process.exit(0);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('❌ Test failed:', message);
      process.exit(1);
    }
  }

  runTest();

#!/usr/bin/env tsx

/**
 * Deployment Status Checker
 * Provides clear status and next steps for production deployment
 */

const PRODUCTION_URL = 'https://almstkshfblog.netlify.app';

interface StatusCheck {
  name: string;
  url: string;
  status: 'WORKING' | 'FAILED' | 'PENDING';
  message: string;
}

async function checkEndpoint(name: string, url: string): Promise<StatusCheck> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': 'AlmstkshfBlog-StatusChecker/1.0' }
    });

    if (response.ok) {
      return {
        name,
        url,
        status: 'WORKING',
        message: `${response.status} ${response.statusText}`
      };
    } else {
      return {
        name,
        url,
        status: 'FAILED',
        message: `${response.status} ${response.statusText}`
      };
    }
  } catch (error) {
    return {
      name,
      url,
      status: 'FAILED',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function main() {
  console.log('🔍 AlmstkshfBlog Deployment Status Check');
  console.log(`🌐 Production URL: ${PRODUCTION_URL}`);
  console.log('=' .repeat(60));
  console.log('');

  // Check all critical endpoints
  const checks = await Promise.all([
    checkEndpoint('Homepage', `${PRODUCTION_URL}/`),
    checkEndpoint('Health API', `${PRODUCTION_URL}/api/health`),
    checkEndpoint('Articles API', `${PRODUCTION_URL}/api/articles`),
    checkEndpoint('Categories API', `${PRODUCTION_URL}/api/categories`)
  ]);

  // Display results
  checks.forEach(check => {
    const icon = check.status === 'WORKING' ? '✅' : '❌';
    console.log(`${icon} ${check.name}: ${check.message}`);
  });

  console.log('');
  console.log('=' .repeat(60));

  // Analyze results and provide guidance
  const workingCount = checks.filter(c => c.status === 'WORKING').length;
  const failedCount = checks.filter(c => c.status === 'FAILED').length;

  if (workingCount === checks.length) {
    console.log('🎉 DEPLOYMENT SUCCESSFUL!');
    console.log('All systems are working correctly.');
    console.log('');
    console.log('✅ Next Steps:');
    console.log('1. Run full production testing: npx tsx verify-production-deployment.ts');
    console.log('2. Test all article pages and functionality');
    console.log('3. Verify bilingual content and responsive design');
    
  } else if (checks[0].status === 'WORKING' && failedCount > 0) {
    console.log('⚠️  PARTIAL DEPLOYMENT - ACTION REQUIRED');
    console.log('Static site is working, but API endpoints are failing.');
    console.log('');
    console.log('🔧 IMMEDIATE ACTION NEEDED:');
    console.log('1. Set environment variables in Netlify Dashboard');
    console.log('2. Go to: https://app.netlify.com/');
    console.log('3. Find site: AlmstkshfBlog (ID: ff08dac9-35e3-4b42-8133-f8046ae35f24)');
    console.log('4. Navigate to: Site Settings > Environment Variables');
    console.log('5. Add all 6 required environment variables (see NETLIFY_SETUP_INSTRUCTIONS.md)');
    console.log('6. Trigger new deployment after adding variables');
    console.log('');
    console.log('📋 Required Environment Variables:');
    console.log('   - DATABASE_URL');
    console.log('   - NODE_ENV');
    console.log('   - JWT_SECRET');
    console.log('   - JWT_REFRESH_SECRET');
    console.log('   - SITE_URL');
    console.log('   - ADMIN_EMAIL');
    
  } else {
    console.log('❌ DEPLOYMENT FAILED');
    console.log('Multiple systems are not working.');
    console.log('');
    console.log('🔧 Troubleshooting Steps:');
    console.log('1. Check Netlify deployment logs');
    console.log('2. Verify build completed successfully');
    console.log('3. Check for any build errors');
    console.log('4. Ensure all files are properly committed and pushed');
  }

  console.log('');
  console.log('📖 For detailed instructions, see: NETLIFY_SETUP_INSTRUCTIONS.md');
  console.log('=' .repeat(60));
}

main().catch(console.error);
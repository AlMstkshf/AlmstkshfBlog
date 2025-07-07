#!/usr/bin/env node

/**
 * Deployment Status Check
 * Quick verification of deployment readiness
 */

import fs from 'fs';
import path from 'path';

console.log('🚀 DEPLOYMENT STATUS CHECK\n');

const checks = [
  {
    name: 'netlify.toml configuration',
    check: () => fs.existsSync('netlify.toml'),
    details: 'Netlify configuration file'
  },
  {
    name: 'Serverless function built',
    check: () => fs.existsSync('netlify/functions/api.js'),
    details: 'Built serverless function'
  },
  {
    name: 'Client build directory',
    check: () => fs.existsSync('dist/public'),
    details: 'Client build output'
  },
  {
    name: 'Package.json build script',
    check: () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return pkg.scripts && pkg.scripts.build;
    },
    details: 'Build script configured'
  },
  {
    name: 'Cloud storage service',
    check: () => fs.existsSync('server/cloud-storage.ts'),
    details: 'Cloud storage implementation'
  },
  {
    name: 'Deployment guide',
    check: () => fs.existsSync('FINAL_DEPLOYMENT_GUIDE.md'),
    details: 'Deployment documentation'
  },
  {
    name: 'Verification scripts',
    check: () => fs.existsSync('verify-deployment.js') && fs.existsSync('test-file-upload.js'),
    details: 'Testing scripts available'
  }
];

let allPassed = true;

checks.forEach(({ name, check, details }) => {
  const passed = check();
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${name}`);
  if (!passed) {
    console.log(`   ⚠️  ${details}`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 ALL CHECKS PASSED - READY FOR DEPLOYMENT!');
  console.log('\nNext steps:');
  console.log('1. Go to https://app.netlify.com/');
  console.log('2. Import GitHub repo: AlMstkshf/AlmstkshfBlog');
  console.log('3. Set environment variables');
  console.log('4. Deploy!');
  console.log('\nExpected URL: https://almstkshfblog.netlify.app');
} else {
  console.log('❌ SOME CHECKS FAILED - REVIEW ISSUES ABOVE');
}

console.log('\n📋 Build command: npm run build');
console.log('📁 Publish directory: dist/public');
console.log('⚡ Functions directory: netlify/functions');
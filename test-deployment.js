#!/usr/bin/env node

// Simple test script to verify deployment readiness
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Testing Deployment Readiness...\n');

// Check if required files exist
const requiredFiles = [
  'netlify.toml',
  'netlify/functions/api.js',
  'dist/public/index.html',
  'package.json',
  '.env'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - exists`);
  } else {
    console.log(`❌ ${file} - missing`);
    allFilesExist = false;
  }
});

// Check package.json scripts
const packageJson = JSON.parse(fs.readFileSync(join(__dirname, 'package.json'), 'utf8'));
const requiredScripts = ['build', 'build:client', 'build:functions'];

console.log('\n📦 Checking package.json scripts:');
requiredScripts.forEach(script => {
  if (packageJson.scripts[script]) {
    console.log(`✅ ${script} - defined`);
  } else {
    console.log(`❌ ${script} - missing`);
    allFilesExist = false;
  }
});

// Check dependencies
const requiredDeps = ['serverless-http', '@netlify/functions'];
console.log('\n📚 Checking required dependencies:');
requiredDeps.forEach(dep => {
  if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
    console.log(`✅ ${dep} - installed`);
  } else {
    console.log(`❌ ${dep} - missing`);
    allFilesExist = false;
  }
});

// Check environment variables
console.log('\n🔐 Checking environment variables:');
const envFile = fs.readFileSync(join(__dirname, '.env'), 'utf8');
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];

requiredEnvVars.forEach(envVar => {
  if (envFile.includes(envVar)) {
    console.log(`✅ ${envVar} - defined`);
  } else {
    console.log(`❌ ${envVar} - missing`);
    allFilesExist = false;
  }
});

console.log('\n' + '='.repeat(50));
if (allFilesExist) {
  console.log('🎉 Deployment Ready! All checks passed.');
  console.log('\nNext steps:');
  console.log('1. Set environment variables in Netlify dashboard');
  console.log('2. Deploy to production');
  console.log('3. Test all functionality');
} else {
  console.log('⚠️  Some issues found. Please fix them before deploying.');
}
console.log('='.repeat(50));
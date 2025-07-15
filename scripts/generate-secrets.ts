#!/usr/bin/env tsx
/**
 * Security Secret Generator
 * Generates cryptographically secure secrets for JWT tokens and admin passwords
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';

interface SecuritySecrets {
  jwtSecret: string;
  jwtRefreshSecret: string;
  adminPassword: string;
  adminPasswordHash: string;
  sessionSecret: string;
}

/**
 * Generate a cryptographically secure random string
 */
function generateSecureSecret(length: number = 64): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate a secure random password with mixed characters
 */
function generateSecurePassword(length: number = 32): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    password += charset[randomIndex];
  }
  
  return password;
}

/**
 * Hash password using bcrypt with high salt rounds
 */
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 14; // Higher than default for better security
  return bcrypt.hash(password, saltRounds);
}

/**
 * Generate all required security secrets
 */
async function generateSecrets(): Promise<SecuritySecrets> {
  console.log('🔐 Generating cryptographically secure secrets...\n');
  
  // Generate JWT secrets (128 characters each for maximum security)
  const jwtSecret = generateSecureSecret(64); // 128 hex chars
  const jwtRefreshSecret = generateSecureSecret(64); // 128 hex chars
  const sessionSecret = generateSecureSecret(32); // 64 hex chars
  
  // Generate admin password
  const adminPassword = generateSecurePassword(24);
  const adminPasswordHash = await hashPassword(adminPassword);
  
  return {
    jwtSecret,
    jwtRefreshSecret,
    adminPassword,
    adminPasswordHash,
    sessionSecret
  };
}

/**
 * Display secrets in a secure format
 */
function displaySecrets(secrets: SecuritySecrets) {
  console.log('✅ Security secrets generated successfully!\n');
  
  console.log('📋 Copy these environment variables to your .env file:\n');
  console.log('# JWT Configuration (Cryptographically Secure)');
  console.log(`JWT_SECRET=${secrets.jwtSecret}`);
  console.log(`JWT_REFRESH_SECRET=${secrets.jwtRefreshSecret}`);
  console.log(`SESSION_SECRET=${secrets.sessionSecret}`);
  console.log('');
  
  console.log('# Admin Configuration');
  console.log(`ADMIN_USERNAME=admin`);
  console.log(`ADMIN_EMAIL=admin@yourdomain.com`);
  console.log(`ADMIN_PASSWORD_HASH=${secrets.adminPasswordHash}`);
  console.log('');
  
  console.log('🔑 IMPORTANT - Save this admin password securely:');
  console.log(`Admin Password: ${secrets.adminPassword}`);
  console.log('');
  
  console.log('⚠️  SECURITY WARNINGS:');
  console.log('1. Never commit these secrets to version control');
  console.log('2. Store the admin password in a secure password manager');
  console.log('3. Use different secrets for each environment (dev/staging/prod)');
  console.log('4. Rotate these secrets regularly (every 90 days recommended)');
  console.log('5. Ensure your .env file is in .gitignore');
  console.log('');
  
  console.log('📊 Secret Strength Analysis:');
  console.log(`JWT Secret Length: ${secrets.jwtSecret.length} characters`);
  console.log(`JWT Refresh Secret Length: ${secrets.jwtRefreshSecret.length} characters`);
  console.log(`Admin Password Length: ${secrets.adminPassword.length} characters`);
  console.log(`Session Secret Length: ${secrets.sessionSecret.length} characters`);
  console.log(`Password Hash Algorithm: bcrypt with 14 salt rounds`);
}

/**
 * Generate environment file template
 */
function generateEnvTemplate(secrets: SecuritySecrets): string {
  return `# Environment Configuration
NODE_ENV=production

# Database Configuration (Replace with your actual database URL)
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# JWT Configuration (Cryptographically Secure - Generated ${new Date().toISOString()})
JWT_SECRET=${secrets.jwtSecret}
JWT_REFRESH_SECRET=${secrets.jwtRefreshSecret}
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Session Configuration
SESSION_SECRET=${secrets.sessionSecret}

# Admin Configuration
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD_HASH=${secrets.adminPasswordHash}

# Site Configuration
SITE_URL=https://yourdomain.com
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Email Configuration (Optional)
SENDGRID_API_KEY=your-sendgrid-api-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# AI Configuration (Optional)
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
GOOGLE_AI_API_KEY=your-google-ai-api-key
GEMINI_API_KEY=your-gemini-api-key

# Security Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX_ATTEMPTS=5
AUTH_RATE_LIMIT_WINDOW_MS=900000

# Content Security Policy
CSP_REPORT_URI=https://yourdomain.com/api/csp-report
`;
}

/**
 * Main execution function
 */
async function main() {
  try {
    const secrets = await generateSecrets();
    displaySecrets(secrets);
    
    // Optionally write to .env.secure file
    const envTemplate = generateEnvTemplate(secrets);
    const fs = await import('fs');
    const path = await import('path');
    
    const envPath = path.join(process.cwd(), '.env.secure');
    fs.writeFileSync(envPath, envTemplate);
    
    console.log(`📁 Environment template saved to: ${envPath}`);
    console.log('   Review and rename to .env after updating the database URL and other settings');
    
  } catch (error) {
    console.error('❌ Error generating secrets:', error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateSecrets, generateSecureSecret, generateSecurePassword, hashPassword };
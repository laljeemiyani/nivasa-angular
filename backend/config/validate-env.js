/**
 * Environment Validation Script
 * Run this before the app starts to catch missing/misconfigured env vars early.
 * Prints clear, actionable errors to the terminal.
 */
const fs = require('fs');
const path = require('path');

const ENV_PATH = path.join(__dirname, '..', '.env');
const ENV_EXAMPLE_PATH = path.join(__dirname, '..', '.env.example');

// ── Check .env file exists ──────────────────────────────────────────────────
if (!fs.existsSync(ENV_PATH)) {
  console.error('\n' + '='.repeat(70));
  console.error('❌ ERROR: Missing .env file!');
  console.error('='.repeat(70));
  console.error('');
  console.error('  The backend requires a .env file to run.');
  console.error('  Create one by copying the example:');
  console.error('');
  if (process.platform === 'win32') {
    console.error('    copy .env.example .env');
  } else {
    console.error('    cp .env.example .env');
  }
  console.error('');
  console.error('  Then edit .env with your local configuration.');
  console.error('='.repeat(70) + '\n');
  process.exit(1);
}

// ── Load and validate vars ──────────────────────────────────────────────────
require('dotenv').config({ path: ENV_PATH });

const warnings = [];
const errors = [];
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';
const DEFAULT_JWT_SECRET = 'your_super_secret_jwt_key_change_this_in_production';
const DEFAULT_ADMIN_EMAIL = 'admin@nivasa.com';
const DEFAULT_ADMIN_PASSWORD = 'admin123';

// Critical vars that must be set
if (!process.env.MONGODB_URI) {
  errors.push('MONGODB_URI is not set. The database connection will fail.');
}

if (!process.env.JWT_SECRET) {
  if (IS_PRODUCTION) {
    errors.push('JWT_SECRET is not set. Production requires a strong, unique JWT secret.');
  } else {
    warnings.push('JWT_SECRET is not set. Falling back to the local development default.');
  }
} else if (process.env.JWT_SECRET === DEFAULT_JWT_SECRET) {
  if (IS_PRODUCTION) {
    errors.push('JWT_SECRET is using the default/example value. Set a strong production secret.');
  } else {
    warnings.push('JWT_SECRET is using the default/example value. Change this before production.');
  }
}

if (!process.env.ADMIN_EMAIL) {
  if (IS_PRODUCTION) {
    errors.push('ADMIN_EMAIL is not set. Production admin bootstrap requires an explicit admin email.');
  } else {
    warnings.push('ADMIN_EMAIL is not set. Falling back to the local development default.');
  }
} else if (IS_PRODUCTION && process.env.ADMIN_EMAIL === DEFAULT_ADMIN_EMAIL) {
  errors.push('ADMIN_EMAIL is using the default value. Set a unique production admin email.');
}

if (!process.env.ADMIN_PASSWORD) {
  if (IS_PRODUCTION) {
    errors.push('ADMIN_PASSWORD is not set. Production admin bootstrap requires an explicit admin password.');
  } else {
    warnings.push('ADMIN_PASSWORD is not set. Falling back to the local development default.');
  }
} else if (IS_PRODUCTION && process.env.ADMIN_PASSWORD === DEFAULT_ADMIN_PASSWORD) {
  errors.push('ADMIN_PASSWORD is using the default value. Set a strong production admin password.');
}

if (!process.env.FRONTEND_URL) {
  warnings.push('FRONTEND_URL is not set. Defaulting to http://localhost:4200');
}

if (!process.env.PORT) {
  warnings.push('PORT is not set. Defaulting to 5001');
}

// Report
if (errors.length > 0) {
  console.error('\n' + '='.repeat(70));
  console.error('❌ ENVIRONMENT ERRORS:');
  console.error('='.repeat(70));
  errors.forEach((e) => console.error(`  • ${e}`));
  console.error('='.repeat(70) + '\n');
  process.exit(1);
}

if (warnings.length > 0) {
  console.warn('\n' + '-'.repeat(70));
  console.warn('⚠️  ENVIRONMENT WARNINGS:');
  console.warn('-'.repeat(70));
  warnings.forEach((w) => console.warn(`  • ${w}`));
  console.warn('-'.repeat(70) + '\n');
}

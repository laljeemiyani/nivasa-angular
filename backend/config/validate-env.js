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

// Critical vars that must be set
if (!process.env.MONGODB_URI) {
  errors.push('MONGODB_URI is not set. The database connection will fail.');
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your_super_secret_jwt_key_change_this_in_production') {
  warnings.push('JWT_SECRET is using the default/example value. Change this for production!');
}

if (!process.env.FRONTEND_URL) {
  warnings.push('FRONTEND_URL is not set. Defaulting to http://localhost:4200');
}

if (!process.env.PORT) {
  warnings.push('PORT is not set. Defaulting to 5000');
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

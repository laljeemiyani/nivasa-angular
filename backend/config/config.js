require('dotenv').config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';
const DEFAULT_JWT_SECRET = 'your_super_secret_jwt_key_change_this_in_production';
const DEFAULT_ADMIN_EMAIL = 'admin@nivasa.com';
const DEFAULT_ADMIN_PASSWORD = 'admin123';

module.exports = {
  // Server Configuration
  PORT: process.env.PORT || 5001,
  NODE_ENV,

  // Database Configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/nivasa_society',

  // JWT Configuration
  JWT_SECRET: IS_PRODUCTION ? process.env.JWT_SECRET : process.env.JWT_SECRET || DEFAULT_JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',

  // File Upload Configuration
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
  UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',

  // CORS Configuration
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:4200',

  // Admin Default Credentials (Change in production)
  ADMIN_EMAIL: IS_PRODUCTION ? process.env.ADMIN_EMAIL : process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL,
  ADMIN_PASSWORD: IS_PRODUCTION ? process.env.ADMIN_PASSWORD : process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD,

  // Security Configuration
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12,

  // Rate Limiting Configuration
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
};

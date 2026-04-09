const User = require('../models/User');
const config = require('../config/config');
const mongoose = require('mongoose');

const DEFAULT_ADMIN_EMAIL = 'admin@nivasa.com';
const DEFAULT_ADMIN_PASSWORD = 'admin123';

const initAdmin = async () => {
  const isProduction = config.NODE_ENV === 'production';

  try {
    if (!config.ADMIN_EMAIL || !config.ADMIN_PASSWORD) {
      const message = 'Admin initialization skipped because ADMIN_EMAIL or ADMIN_PASSWORD is not configured.';

      if (isProduction) {
        throw new Error(message);
      }

      console.warn(message);
      return;
    }

    if (
      isProduction &&
      (config.ADMIN_EMAIL === DEFAULT_ADMIN_EMAIL || config.ADMIN_PASSWORD === DEFAULT_ADMIN_PASSWORD)
    ) {
      throw new Error('Refusing to initialize admin with default credentials in production.');
    }

    // Check if mongoose is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ Database not connected, skipping admin initialization');
      return;
    }
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: config.ADMIN_EMAIL });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const admin = new User({
      fullName: 'Society Administrator',
      email: config.ADMIN_EMAIL,
      password: config.ADMIN_PASSWORD,
      phoneNumber: '9999999999',
      role: 'admin',
      status: 'approved',
      residentType: 'Owner'
    });

    await admin.save();
    console.log('Admin user created successfully');
    
  } catch (error) {
    console.error('Error initializing admin:', error);

    if (isProduction) {
      throw error;
    }
  }
};

module.exports = initAdmin;

const mongoose = require('mongoose');

const connectDB = async () => {
  // Never silently switch storage engines. Failing fast prevents accidental
  // startup with ephemeral DBs and protects persisted data expectations.
  const mongoUri =
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nivasa_society';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    throw error;
  }
};

module.exports = connectDB;

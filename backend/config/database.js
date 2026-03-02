const mongoose = require('mongoose');
const seedDatabase = require('../utils/seeder');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nivasa_society');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);

    // Fallback to In-Memory Database for Development
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ Attempting to start In-Memory MongoDB...');
      try {
        // Dynamic import to avoid production issues if devDependencies are pruned
        const {MongoMemoryServer} = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        console.log(`🟢 InMemory MongoDB started at ${uri}`);

        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected (InMemory): ${conn.connection.host}`);

        // Seed the in-memory database
        await seedDatabase();

        return; // Successfully connected to fallback
      } catch (memError) {
        console.error('❌ Failed to start In-Memory MongoDB:', memError.message);
      }
    }

    process.exit(1);
  }
};

module.exports = connectDB;

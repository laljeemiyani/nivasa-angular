const mongoose = require('mongoose');
const seedDatabase = require('../utils/seeder');

const connectDB = async () => {
  try {
    // Try to connect to local MongoDB first
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nivasa_society';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);

    // Fallback to In-Memory Database for Development
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ Attempting to start In-Memory MongoDB...');
      try {
        // Dynamic import to avoid production issues if devDependencies are pruned
        const {MongoMemoryServer} = require('mongodb-memory-server');
        
        // Configure memory server with custom temp dir in workspace
        const mongod = await MongoMemoryServer.create({
          instance: {
            dbName: 'nivasa_society_test'
          },
          binary: {
            downloadDir: './.mongodb-binaries'
          }
        });
        const uri = mongod.getUri();

        console.log(`🟢 InMemory MongoDB started at ${uri}`);

        const conn = await mongoose.connect(uri);
        console.log(`✅ MongoDB Connected (InMemory): ${conn.connection.host}`);

        // Seed the in-memory database
        await seedDatabase();

        return; // Successfully connected to fallback
      } catch (memError) {
        console.error('❌ Failed to start In-Memory MongoDB:', memError.message);
        console.log('💡 Please ensure MongoDB is installed and running, or check permissions');
      }
    }

    // Don't exit process, just log error and continue (for demo purposes)
    console.log('⚠️ Running without database connection. Some features may not work.');
  }
};

module.exports = connectDB;

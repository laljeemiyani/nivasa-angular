const {MongoMemoryServer} = require('mongodb-memory-server');
const mongoose = require('mongoose');
const seedDatabase = require('./utils/seeder');
require('dotenv').config();

async function startServer() {
    try {
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        process.env.MONGODB_URI = uri;
        console.log(`🟢 InMemory MongoDB started at ${uri}`);

        // Connect to DB
        await mongoose.connect(uri);
        console.log('MongoDB Connected (InMemory)');

        // Seed DB
        await seedDatabase();

        // Start Express App
        // We need to ensure index.js doesn't try to connect again or handles it gracefully
        // Since index.js calls connectDB(), and connectDB checks if connected?
        // Actually connectDB calls mongoose.connect. Mongoose handles multiple calls usually,
        // but better to set a flag or let index.js run.
        // However, index.js is a module that runs on require.
        // Let's just set the env var and let index.js do the connection using the URI.

        // But wait, index.js calls connectDB() which calls mongoose.connect(process.env.MONGODB_URI).
        // So if I set process.env.MONGODB_URI here, index.js will use it.
        // But I already connected here to seed.
        // Mongoose might complain about double connection.

        // Let's disconnect first?
        await mongoose.disconnect();

        require('./index');
    } catch (err) {
        console.error(err);
    }
}

startServer();

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const seedDatabase = require('../utils/seeder');

// Load env vars
dotenv.config({path: path.join(__dirname, '../.env')});

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('Database connection failed:', err.message);
        process.exit(1);
    }
};

const runSeed = async () => {
    await connectDB();
    try {
        await seedDatabase();
        console.log('Done!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

runSeed();

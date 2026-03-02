const express = require('express');
const cors = require('cors');
const path = require('path');

// Import configurations and database
const config = require('./config/config');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const noticeRoutes = require('./routes/notices');
const complaintRoutes = require('./routes/complaints');
const familyRoutes = require('./routes/family');
const vehicleRoutes = require('./routes/vehicles');

// Connect to database
connectDB();

// Initialize admin user
const initAdmin = require('./scripts/initAdmin');
initAdmin();

const app = express();

// Basic middleware
app.use(cors({
    origin: config.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({extended: true, limit: '10mb'}));

// Logging middleware
if (config.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/vehicles', vehicleRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Nivasa Society Management API is running',
        timestamp: new Date().toISOString(),
        environment: config.NODE_ENV
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Nivasa Society Management System API',
        version: '1.0.0',
        documentation: '/api/health'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);

    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal server error',
        ...(config.NODE_ENV === 'development' && {stack: error.stack})
    });
});

const PORT = config.PORT;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${config.NODE_ENV}`);
    console.log(`🌐 Frontend URL: ${config.FRONTEND_URL}`);
    console.log(`📁 Upload path: ${config.UPLOAD_PATH}`);
});

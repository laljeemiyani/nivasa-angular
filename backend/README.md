# Nivasa Society Management System - Backend

## Overview
This is the backend for the Nivasa Society Management System, a comprehensive solution for managing housing society operations including resident management, complaints, notices, and vehicle tracking.

## Features
- User authentication and authorization
- Resident management
- Complaint handling
- Notice board
- Vehicle management
- Family member management
- Admin dashboard

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)

## Setup Instructions

### 1. Clone the repository
```bash
git clone <repository-url>
cd nivasa-web
```

### 2. Install dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### 3. Configure environment variables
```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your specific configuration if needed
```

### 4. MongoDB Setup
The application is configured to automatically:
- Connect to MongoDB using the connection string in your .env file (defaults to `mongodb://localhost:27017/nivasa_society`)
- Create the necessary collections
- Initialize an admin user on first startup

No manual database setup is required. When you start the server, it will:
1. Connect to MongoDB (creating the database if it doesn't exist)
2. Check if an admin user exists
3. If no admin exists, create one using the credentials in your .env file

### 5. Start the server
```bash
# Development mode with auto-reload
npm run dev

# OR Production mode
npm start
```

## Default Admin Credentials
After starting the server for the first time, you can log in with these default credentials:

- **Email**: admin@nivasa.com (or the value in your .env file)
- **Password**: admin123 (or the value in your .env file)

**Important**: For production, make sure to change these default credentials in your .env file before deployment.

## API Documentation

The API provides endpoints for:
- Authentication (/api/auth)
- Admin operations (/api/admin)
- Notices (/api/notices)
- Complaints (/api/complaints)
- Family members (/api/family)
- Vehicles (/api/vehicles)

A health check endpoint is available at `/api/health`.

## Scripts
- `npm start`: Start the server
- `npm run dev`: Start the server with nodemon for development
- `npm run start-full`: Start the full server with all features
- `npm run dev-full`: Start the full server with nodemon
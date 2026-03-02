# Nivasa Society Management System

## Overview
Nivasa Society Management System is a comprehensive solution for managing housing society operations. It simplifies and digitizes daily operations such as resident management, complaint resolution, notice circulation, and vehicle tracking.

## Features
- User authentication and authorization
- Resident management
- Complaint handling
- Notice board
- Vehicle management
- Family member management
- Admin dashboard

## Tech Stack
- **Frontend**: React.js with TailwindCSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)

## Quick Start

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

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Configure environment variables
```bash
# Navigate to backend directory
cd ../backend

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

### 5. Start the application
```bash
# Navigate to the project root
cd ..

# Start both frontend and backend in development mode
npm run dev
```

## Default Admin Credentials
After starting the server for the first time, you can log in with these default credentials:

- **Email**: admin@nivasa.com (or the value in your .env file)
- **Password**: admin123 (or the value in your .env file)

**Important**: For production, make sure to change these default credentials in your .env file before deployment.

## Available Scripts

### Root Directory
- `npm run dev`: Start both frontend and backend in development mode
- `npm run client`: Start only the frontend
- `npm run server`: Start only the backend

### Backend Directory
- `npm start`: Start the server
- `npm run dev`: Start the server with nodemon for development
- `npm run start-full`: Start the full server with all features
- `npm run dev-full`: Start the full server with nodemon

### Frontend Directory
- `npm run dev`: Start the development server
- `npm run build`: Build for production
- `npm run preview`: Preview the production build

## Project Structure
```
├── backend/           # Backend code
│   ├── config/        # Configuration files
│   ├── controllers/   # Request handlers
│   ├── middlewares/   # Express middlewares
│   ├── models/        # Mongoose models
│   ├── routes/        # API routes
│   ├── scripts/       # Utility scripts
│   └── uploads/       # Uploaded files
├── frontend/          # Frontend code
│   ├── public/        # Static files
│   └── src/           # React source code
└── package.json       # Root package.json
```
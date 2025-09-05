Lingobuddy 🧠🌍


Lingobuddy is a language learning platform that connects users through real-time video chat to build friendships and practice native and learning languages. The application includes features for user authentication, friend management, and call recordings.

📦 Tech Stack
Frontend
Framework: React + Vite

Styling: Tailwind CSS, DaisyUI

State Management: Zustand

Data Fetching: React Query

Routing: React Router

Video Calls: Stream Video SDK

Chat: Stream Chat React

Backend
Platform: Node.js, Express

Database: MongoDB (via Mongoose)

Authentication: JWT, Passport.js for Google OAuth

Video Calls: Stream Node SDK

Other: Nodemailer for email (OTP) services, bcryptjs for password hashing

🚀 Getting Started
To get a local copy of the project up and running, follow these steps.

Prerequisites
Node.js (>=18)

npm or yarn

MongoDB Atlas account

Stream API credentials (API Key and Secret)

Google OAuth credentials (Client ID and Secret)

Gmail account credentials for Nodemailer (you need to generate an app password)

Installation
Clone the repository and install the dependencies for both the backend and frontend.

# Clone the repository
git clone <repository_url>
cd Lingobuddy

# Backend setup
cd backend
npm install 

# Frontend setup
cd ../frontend/Lingobuddy-frontend
npm install

Configuration
Create a .env file in the root of your backend directory and add the following environment variables:

# MongoDB
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET_KEY=your_jwt_secret

# Stream API
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback

# Nodemailer
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Set environment to development for local use
NODE_ENV=development

Note: For Google OAuth, ensure the redirect URI http://localhost:5001/api/auth/google/callback is authorized in your Google Cloud Console. The NODE_ENV=development is important for local testing to avoid SSL protocol errors.

Running the Application
In separate terminal windows, start the backend and frontend servers.

# Start the backend server
cd backend
npm run dev

# Start the frontend server
cd frontend/Lingobuddy-frontend
npm run dev

The application should now be running on http://localhost:5173.

import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './lib/db.js';
import session from "express-session";
import passport from "passport";
import "./config/passport.js"; // import your strategy
import { StreamClient } from '@stream-io/node-sdk'; // ✅ Add this import

dotenv.config();

const app = express();

// ✅ Ensure Stream API credentials are available
if (!process.env.STREAM_API_KEY || !process.env.STREAM_API_SECRET) {
    console.warn('⚠️  Stream API credentials not found. Recording features will be disabled.');
}

const streamClient = new StreamClient(
    process.env.STREAM_API_KEY, 
    process.env.STREAM_API_SECRET
);

// One-time permission setup function
const setupStreamPermissions = async () => {
    // Skip setup if credentials are missing
    if (!process.env.STREAM_API_KEY || !process.env.STREAM_API_SECRET) {
        console.log('⏭️  Skipping Stream permissions setup (missing credentials)');
        return;
    }

    try {
        console.log('🔧 Setting up Stream call type permissions...');
        
        await streamClient.video.createCallType({
            name: 'default',
            grants: {
                admin: [
                    "start-record-call", 
                    "stop-record-call", 
                    "list-recordings", 
                    "delete-recordings",
                    "join-Call",
                    "create-Call"
                ],
                user: [
                    "list-recordings",
                    "join-Call"
                ],
                call_member: [
                    "start-record-call",
                    "stop-record-call", 
                    "list-recordings",
                    "join-call"
                ]
            },
            settings: {
                recording: {
                    mode: 'available',
                    audio_only: false,
                    quality: '720p' // ✅ Fixed: Use valid quality value
                }
            }
        });
        
        console.log('✅ Stream permissions configured successfully');
    } catch (error) {
        if (error.message.includes('already exists')) {
            console.log('✅ Stream call type already exists with permissions');
        } else {
            console.error('❌ Error setting up Stream permissions:', error.message);
            throw error; // Re-throw to be caught by the caller
        }
    }
};

app.use(cors({
  origin: 'http://localhost:5173',  // ✅ Vite dev server origin
  credentials: true,                // ✅ Send cookies (important for auth)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // ✅ Include preflight
}));

app.use(express.json());
app.use(cookieParser());

// ✅ Add these
app.use(
  session({
    secret: process.env.JWT_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// ✅ Routes come after middleware
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import chatRoutes from './routes/chat.routes.js';

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 5001;

// ✅ Corrected app.listen with proper async handling
app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  
  // Connect to database
  connectDB();
  
  // Setup Stream permissions
  try {
    await setupStreamPermissions();
  } catch (error) {
    console.error('⚠️  Failed to setup Stream permissions, but server will continue:', error.message);
    // Don't crash the server if permission setup fails
  }
});
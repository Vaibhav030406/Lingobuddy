import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './lib/db.js';
import session from "express-session";
import passport from "passport";
import "./config/passport.js";
import { StreamClient } from '@stream-io/node-sdk';
// Removed path, fileURLToPath, fs imports as they are no longer needed
// after removing static file serving logic.

// --- CONFIGURATION SETUP ---
dotenv.config();

// Stream setup (moved outside of the app setup function)
if (!process.env.STREAM_API_KEY || !process.env.STREAM_API_SECRET) {
    console.warn('⚠️  Stream API credentials not found. Recording features will be disabled.');
}

const streamClient = new StreamClient(
    process.env.STREAM_API_KEY, 
    process.env.STREAM_API_SECRET
);

const setupStreamPermissions = async () => {
    if (!process.env.STREAM_API_KEY || !process.env.STREAM_API_SECRET) {
        console.log('⭐️  Skipping Stream permissions setup (missing credentials)');
        return;
    }

    try {
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
                    quality: '1080p'
                }
            }
        });
        
        console.log('✅ Stream permissions configured successfully');
    } catch (error) {
        if (error.message.includes('already exists')) {
            console.log('✅ Stream call type already exists with permissions');
        } else {
            console.error('❌ Error setting up Stream permissions:', error.message);
        }
    }
};

// CORS configuration for production
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            process.env.CLIENT_URL,
            process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined, 
            'http://localhost:3000', // For development
            'http://localhost:5001'  // For development
        ].filter(Boolean);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('❌ CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
};

const app = express();

// --- DATABASE AND STREAM SETUP (RUN ONCE PER SERVERLESS COLD START) ---
// Since this runs at the module level, Vercel executes it during a cold start.
// This is the correct pattern for serverless MongoDB connections.
if (process.env.VERCEL) {
    connectDB();
    setupStreamPermissions();
}

// --- MIDDLEWARE SETUP ---
app.use(cors(corsOptions));
// Trust proxy is vital for Vercel/Netlify environments to correctly read HTTPS headers
app.set('trust proxy', 1);

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.use(
  session({
    secret: process.env.JWT_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days (adjusted to match JWT expiry)
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Import routes
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import chatRoutes from './routes/chat.routes.js';

// --- API ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV 
    });
});

// Test API endpoint
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'API is working!', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// --- ROOT ROUTE ---
if (process.env.NODE_ENV === 'production') {
    app.get('/', (req, res) => {
        res.json({ message: 'LingoBuddy API is running successfully.' });
    });
} else {
    // Development fallback (only runs if Node is started locally without NODE_ENV=production)
    app.get('*', (req, res) => {
        if (req.path.startsWith('/api/')) {
            // API endpoints handled above
        } else {
            res.json({ 
                message: 'Development mode - run frontend separately',
                api: 'Backend is running'
            });
        }
    });
}


// --- SERVER STARTUP LOGIC ---
const PORT = process.env.PORT || 5001;

// Only start the listener if not running in a serverless environment (e.g., Vercel)
// We also moved connectDB() outside this block for Vercel.
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(PORT, async () => {
        // ConnectDB and setupStreamPermissions are called here only for local dev
        try {
            await connectDB();
            console.log('✅ Database connected');
        } catch (error) {
            console.error('❌ Database connection failed:', error);
        }
        
        try {
            await setupStreamPermissions();
        } catch (error) {
            console.error('⚠️  Stream setup failed:', error.message);
        }
        
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
        console.log(`🔗 Client URL: ${process.env.CLIENT_URL}`);
    });
}

// 🎯 CRITICAL: Export the app instance for Vercel to use as a Serverless Function
export default app;

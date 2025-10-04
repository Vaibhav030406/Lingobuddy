import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './lib/db.js';
import session from "express-session";
import passport from "passport";
import "./config/passport.js";
import { StreamClient } from '@stream-io/node-sdk';

dotenv.config();

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

// 🎯 CRITICAL FIX: Enhanced CORS Configuration
const ALLOWED_ORIGINS = [
    process.env.CLIENT_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined, 
    'http://localhost:3000',
    'http://localhost:5001',
    'http://localhost:5173'
].filter(Boolean);

console.log('🌍 Allowed CORS Origins:', ALLOWED_ORIGINS);

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (e.g., mobile apps, Postman, server-to-server)
        if (!origin) {
            console.log('✅ CORS: Allowing request with no origin');
            return callback(null, true);
        }
        
        if (ALLOWED_ORIGINS.includes(origin)) {
            console.log(`✅ CORS: Allowed origin ${origin}`);
            callback(null, true);
        } else {
            console.log(`❌ CORS: Blocked origin ${origin}`);
            console.log(`   Allowed origins:`, ALLOWED_ORIGINS);
            callback(new Error(`Not allowed by CORS: ${origin}`));
        }
    },
    credentials: true, // CRITICAL: Allow credentials (cookies)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'Cookie',
        'X-Requested-With',
        'Accept',
        'Origin'
    ],
    exposedHeaders: ['Set-Cookie'], // Allow frontend to see Set-Cookie header
    maxAge: 86400, // Cache preflight requests for 24 hours
    preflightContinue: false,
    optionsSuccessStatus: 204
};

const app = express();

// 🎯 CRITICAL: Trust proxy MUST come before any other middleware
app.set('trust proxy', 1);

// Database and Stream setup for serverless
if (process.env.VERCEL) {
    connectDB();
    setupStreamPermissions();
}

// 🎯 CRITICAL: Apply CORS before any routes
app.use(cors(corsOptions));

// 🎯 CRITICAL: Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Parse JSON and cookies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(
  session({
    secret: process.env.JWT_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'none', // Required for cross-origin
      maxAge: 7 * 24 * 60 * 60 * 1000
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

// 🎯 DEBUG: Log all incoming requests
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path}`);
    console.log(`   Origin: ${req.headers.origin || 'none'}`);
    console.log(`   Cookies: ${Object.keys(req.cookies).join(', ') || 'none'}`);
    next();
});

// Import routes
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import chatRoutes from './routes/chat.routes.js';

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        corsEnabled: true,
        allowedOrigins: ALLOWED_ORIGINS
    });
});

// Test API endpoint
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'API is working!', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        origin: req.headers.origin,
        cookies: Object.keys(req.cookies)
    });
});

// Root route
if (process.env.NODE_ENV === 'production') {
    app.get('/', (req, res) => {
        res.json({ 
            message: 'LingoBuddy API is running successfully.',
            cors: 'enabled',
            origins: ALLOWED_ORIGINS.length
        });
    });
} else {
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api/')) {
            res.json({ 
                message: 'Development mode - run frontend separately',
                api: 'Backend is running'
            });
        }
    });
}

// Server startup
const PORT = process.env.PORT || 5001;

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(PORT, async () => {
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
        console.log(`🍪 CORS Origins:`, ALLOWED_ORIGINS);
    });
}

export default app;
import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './lib/db.js';
import session from "express-session";
import passport from "passport";
import "./config/passport.js";
import { StreamClient } from '@stream-io/node-sdk';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Define __dirname for ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

const app = express();

// Stream setup
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
            'http://localhost:3000', // For development
            'http://localhost:5001', // For development
            'http://localhost:5173'  // Added for Vite's default port
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

app.use(cors(corsOptions));

// Trust proxy for Render
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
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Import routes
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import chatRoutes from './routes/chat.routes.js';

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);

// Health check endpoint for Render
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

// Static file serving for production
if (process.env.NODE_ENV === 'production') {
    const staticPath = path.join(__dirname, '../../frontend/Lingobuddy-frontend/dist');
    
    if (fs.existsSync(staticPath) && fs.existsSync(path.join(staticPath, 'index.html'))) {
        console.log('✅ Serving static files from:', staticPath);
        
        // Serve static files with proper caching
        app.use(express.static(staticPath, {
            maxAge: '1y',
            etag: false
        }));
        
        // Handle React Router (SPA routing)
        app.get('*', (req, res) => {
            // Don't serve index.html for API routes
            if (req.path.startsWith('/api/')) {
                return res.status(404).json({ error: 'API endpoint not found' });
            }
            
            res.sendFile(path.join(staticPath, 'index.html'));
        });
        
    } else {
        console.error('❌ Frontend build not found at:', staticPath);
        
        app.get('*', (req, res) => {
            if (req.path.startsWith('/api/')) {
                return res.status(404).json({ error: 'API endpoint not found' });
            }
            res.status(503).json({ 
                error: 'Frontend not available',
                message: 'Frontend build not found'
            });
        });
    }
} else {
    // Development fallback
    app.get('*', (req, res) => {
        if (req.path.startsWith('/api/')) {
            return res.status(404).json({ error: 'API endpoint not found' });
        }
        res.json({ 
            message: 'Development mode - run frontend separately',
            api: 'Backend is running'
        });
    });
}

const PORT = process.env.PORT || 5001;

app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Client URL: ${process.env.CLIENT_URL}`);
    
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
});
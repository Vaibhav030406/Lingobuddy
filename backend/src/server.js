import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './lib/db.js';
import session from 'express-session';
import passport from 'passport';
import './config/passport.js';
import { StreamClient } from '@stream-io/node-sdk';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname for ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

const app = express();

if (!process.env.STREAM_API_KEY || !process.env.STREAM_API_SECRET) {
  console.warn('⚠️  Stream API credentials not found. Recording features will be disabled.');
}

const streamClient = new StreamClient(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

const setupStreamPermissions = async () => {
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
          'start-record-call',
          'stop-record-call',
          'list-recordings',
          'delete-recordings',
          'join-Call',
          'create-Call',
        ],
        user: ['list-recordings', 'join-Call'],
        call_member: [
          'start-record-call',
          'stop-record-call',
          'list-recordings',
          'join-call',
        ],
      },
      settings: {
        recording: {
          mode: 'available',
          audio_only: false,
          quality: '1080p',
        },
      },
    });

    console.log('✅ Stream permissions configured successfully');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('✅ Stream call type already exists with permissions');
    } else {
      console.error('❌ Error setting up Stream permissions:', error.message);
      throw error;
    }
  }
};

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);

app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: process.env.JWT_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import chatRoutes from './routes/chat.routes.js';

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/Lingobuddy-frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/Lingobuddy-frontend/dist', 'index.html'));
  });
}
const PORT = process.env.PORT || 5001;

app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);

  connectDB();

  try {
    await setupStreamPermissions();
  } catch (error) {
    console.error('⚠️  Failed to setup Stream permissions, but server will continue:', error.message);
  }
});
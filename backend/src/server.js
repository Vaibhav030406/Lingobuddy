import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './lib/db.js';
import session from "express-session";
import passport from "passport";
import "./config/passport.js"; // import your strategy


dotenv.config();

const app = express();

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

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});

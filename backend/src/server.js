import express from 'express';
import coookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from './lib/db.js';

import authRoutes from './routes/auth.route.js';
const app = express();

const PORT = process.env.PORT;

app.use(express.json());
app.use(coookieParser());
app.use("/api/auth",authRoutes)
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
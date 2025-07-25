import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error("MongoDB URI is not defined in the environment variables.");
    process.exit(1);
}
export const connectDB = async () => {
    try{
        const conn = await mongoose.connect(MONGO_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    }
    catch(error){
        console.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};
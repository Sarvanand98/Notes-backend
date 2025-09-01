import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config();
export const connectDB = async () => {
    try {
        const connect=await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDb connected ${connect.connection.host}`);
    
    } catch (error) {
        console.log("Error connecting to DB:", error);
        process.exit(1); // Stop the server if DB fails
    }
};
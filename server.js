import express from "express"
import authRoute from "./routes/auth.route.js"
import noteRoute from "./routes/note.route.js"

import { connectDB } from "./libs/db.js";
import cors from "cors"
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();

const app=express();
app.use(express.json())
const allowedOrigins = [
  "http://localhost:5173"
  
];
app.use(cors({
    origin:allowedOrigins,
    credentials:true
}))
app.use(cookieParser());
const PORT = process.env.PORT || 5001

connectDB();

app.use("/api/auth",authRoute)
app.use("/api/notes",noteRoute)


app.listen(PORT,()=>{
    console.log("server live at 5001");
    
})
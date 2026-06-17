import mongoose from "mongoose";
import { Env } from "../utils/Env.js";

export const connectDb = async()=>{
    try {
        
        await mongoose.connect(Env.MONGODB_URL);
        console.log("connected to the database");

    } catch (error) {
        console.error("error while connecting to the database" , error);
        process.exit(1);      
    }

};
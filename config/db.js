import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log("Mongodb connection", conn.connection.host);
    } catch (err) {
        console.error("error in mongo connection", err.message);
        process.exit(1);
    }
}

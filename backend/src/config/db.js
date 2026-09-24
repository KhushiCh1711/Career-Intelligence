import mongoose from "mongoose";
import "dotenv/config";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/pathway";

export async function connectDB() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log(`MongoDB connected → ${uri}`);
}

export default mongoose;

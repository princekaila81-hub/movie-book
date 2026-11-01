import mongoose from "mongoose";


const connectDB = async () => {
  try {
    if (!process.env.MONGO_URL) {
      throw new Error("MONGO_URL is missing in .env");
    }

    const con = await mongoose.connect(process.env.MONGO_URL);
    console.log(`MongoDB Atlas connected: ${con.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

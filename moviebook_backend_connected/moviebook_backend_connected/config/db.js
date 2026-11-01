import mongoose from "mongoose";

let connectionPromise;

const connectDB = async () => {
  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL is missing in the environment");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGO_URL)
      .then((con) => {
        console.log(`MongoDB Atlas connected: ${con.connection.host}`);
        return con.connection;
      })
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });
  }

  try {
    return await connectionPromise;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
};

export default connectDB;

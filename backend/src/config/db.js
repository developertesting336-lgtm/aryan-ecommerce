
import mongoose from "mongoose";

async function database() {
  const mongoUri = process.env.DATABASE;

  if (!mongoUri || !/^mongodb(\+srv)?:\/\//.test(mongoUri)) {
    throw new Error(
      "DATABASE is missing or is not a valid MongoDB connection string"
    );
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 5,
    });

    console.log("MongoDB connected successfully");

    return mongoose.connection;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
}

export default database;

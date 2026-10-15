
// import mongoose from "mongoose";

// async function database() {
//   const mongoUri = process.env.DATABASE;

//   if (!mongoUri || !/^mongodb(\+srv)?:\/\//.test(mongoUri)) {
//     throw new Error(
//       "DATABASE is missing or is not a valid MongoDB connection string"
//     );
//   }

//   try {
//     await mongoose.connect(mongoUri, {
//       serverSelectionTimeoutMS: 10000,
//       maxPoolSize: 5,
//     });

//     console.log("MongoDB connected successfully");

//     return mongoose.connection;
//   } catch (error) {
//     console.error("MongoDB connection failed:", error.message);
//     throw error;
//   }
// }

// export default database;






import mongoose from "mongoose";

let cached = globalThis.mongooseCache;

if (!cached) {
  cached = globalThis.mongooseCache = {
    conn: null,
    promise: null,
  };
}

async function database() {
  const uri = process.env.DATABASE;

  if (!uri || !/^mongodb(\+srv)?:\/\//.test(uri)) {
    throw new Error(
      "DATABASE is missing or is not a valid MongoDB URI"
    );
  }

  if (
    cached.conn &&
    mongoose.connection.readyState === 1
  ) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 5,
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log("MongoDB connected successfully");
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    throw error;
  }
}

export default database;

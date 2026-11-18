import mongoose from "mongoose";
import dns from "node:dns";

// Prevent SRV DNS timeout issues on Windows and regional ISPs by using public DNS
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // Ignore in environments where setting DNS servers is restricted
}

// Connection Event Listeners
mongoose.connection.on("connected", () => {
  console.log(
    `[Mongoose Event] Connected to Host: "${mongoose.connection.host}" | DB: "${mongoose.connection.name}" | readyState: ${mongoose.connection.readyState}`
  );
});

mongoose.connection.on("error", (err) => {
  console.error(
    `[Mongoose Event] Connection Error: ${err.message} | readyState: ${mongoose.connection.readyState}`
  );
});

mongoose.connection.on("disconnected", () => {
  console.warn(
    `[Mongoose Event] Disconnected | readyState: ${mongoose.connection.readyState}`
  );
});

let cached = globalThis.mongooseCache;

if (!cached) {
  cached = globalThis.mongooseCache = {
    conn: null,
    promise: null,
  };
}

export async function connectDB() {
  const rawUri =
    process.env.DATABASE ||
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    "";

  const uri = rawUri.trim().replace(/^["']|["']$/g, "");

  if (!uri || !/^mongodb(\+srv)?:\/\//.test(uri)) {
    throw new Error(
      `DATABASE / MONGODB_URI is missing or invalid in environment. Received: "${rawUri}"`
    );
  }

  // If already connected, reuse connection
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If not connected or connection dropped, start a new connection
  if (!cached.promise || mongoose.connection.readyState === 0) {
    cached.promise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log(
      `MongoDB connected successfully (readyState: ${mongoose.connection.readyState}, Host: ${mongoose.connection.host}, DB: ${mongoose.connection.name})`
    );
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
}

export const database = connectDB;
export default connectDB;

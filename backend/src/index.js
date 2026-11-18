import "dotenv/config";
import express from "express";
import { createServer } from "http";
import cors from "cors";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";

import { connectDB } from "./config/db.js";
import { startAgenda } from "./config/agenda.js";
import "./jobs/agendajobs.js";
import loadRoutes from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { stripeWebhook } from "./controllers/payment.controller.js";
import User from "./models/user.model.js";

const app = express();
const port = Number(process.env.PORT) || 4000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// 1. REQUEST LOGGING (Runs before all routes)
// ============================================================================
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`📡 [HTTP INCOMING] ${req.method} ${req.originalUrl}`);
  res.on("finish", () => {
    console.log(
      `🏁 [HTTP COMPLETED] ${req.method} ${req.originalUrl} -> Status ${res.statusCode} (${Date.now() - start}ms)`
    );
  });
  next();
});

app.use(morgan("dev"));

// ============================================================================
// 2. STRIPE WEBHOOK (Must be before express.json to receive raw body)
// ============================================================================
app.post(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// ============================================================================
// 3. BODY PARSERS & CORS
// ============================================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4000",
  "http://127.0.0.1:4000",
  "https://aryan-ecommerce-mu.vercel.app",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes(origin.replace(/\/$/, "")) ||
        process.env.NODE_ENV !== "production"
      ) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  })
);

// ============================================================================
// 4. DATABASE CONNECTION MIDDLEWARE (For serverless environments like Vercel)
// ============================================================================
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection middleware error:", error.message);
    next(error);
  }
});

// ============================================================================
// 5. HEALTH CHECK ROUTES
// ============================================================================
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "server running",
    readyState: mongoose.connection.readyState,
  });
});

app.get("/api/health", async (req, res) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    let testUser = null;

    if (isConnected) {
      testUser = await User.findOne().select("_id email role").lean();
    }

    res.status(200).json({
      status: "ok",
      database: {
        connected: isConnected,
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
      },
      testQueryExecuted: true,
      testUserFound: Boolean(testUser),
      userPreview: testUser ? { _id: testUser._id, email: testUser.email } : null,
      serverTime: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      database: {
        connected: mongoose.connection.readyState === 1,
        readyState: mongoose.connection.readyState,
      },
      error: err.message,
    });
  }
});

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ============================================================================
// 6. APPLICATION ROUTES
// ============================================================================
loadRoutes(app);

// Error Handler
app.use(errorHandler);

// ============================================================================
// 7. SERVER INITIALIZATION (connectDB -> app.listen -> startAgenda)
// ============================================================================
async function startServer() {
  if (process.env.VERCEL) {
    return;
  }

  try {
    // Step 1: Connect to MongoDB first
    await connectDB();

    // Step 2: Start HTTP server only after DB is ready
    const server = createServer(app);
    server.listen(port, "0.0.0.0", async () => {
      console.log(`🔥 Server listening at http://localhost:${port}`);

      // Step 3: Start Agenda only after DB connection and server are listening
      await startAgenda();
    });
  } catch (err) {
    console.error("❌ Fatal startup error:", err.message);
    process.exit(1);
  }
}

startServer();

export default app;

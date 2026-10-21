import { config } from "dotenv";
import express from "express"
import {createServer} from "http"
import dotenv from 'dotenv';
import { json } from "express";
import cors from 'cors'
import morgan from 'morgan'
import database from "./config/db.js";
import loadRoutes from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import path from "path";
import { stripeWebhook } from "./controllers/payment.controller.js";
import { fileURLToPath } from "url";
import { agenda } from "./config/agenda.js";
import "./jobs/agendajobs.js"
dotenv.config();
const app = express();
const port = process.env.PORT || 4000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const allowedOrigins = [
   process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://aryan-ecommerce-mu.vercel.app",
];
app.use((req, res, next) => {
  req.startTime = Date.now();
  res.on("finish", () => console.log("full request:", Date.now() - req.startTime, "ms"));
  next();
});
app.post(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhook
);
app.use(morgan('dev'));
app.use(json());
// Start Agenda
(async () => {
  await agenda.start();
  console.log("Agenda started");
})();
app.use(cors({
   origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials:true,
}));
app.get("/health",(req,res)=>{
    res.json({
        message:"server running"
    })
})

app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);
loadRoutes(app);
app.use(errorHandler);
const server = createServer(app);

server.listen(port,async()=>{
    console.log(`🔥 server running on http://localhost:${port}`);
  await  database();
});


// import "dotenv/config";

// import express from "express";
// import cors from "cors";
// import morgan from "morgan";
// import path from "node:path";
// import { fileURLToPath } from "node:url";

// import database from "./config/db.js";
// import loadRoutes from "./routes/index.js";
// import { errorHandler } from "./middlewares/errorHandler.js";
// import { stripeWebhook } from "./controllers/payment.controller.js";

// const app = express();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const allowedOrigins = [
//   process.env.CLIENT_URL,
//   "http://localhost:5173",
//   "http://127.0.0.1:5173",
//   "https://aryan-ecommerce-mu.vercel.app",
// ].filter(Boolean);

// app.use(
//   cors({
//     origin(origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         return callback(null, true);
//       }

//       return callback(new Error("Not allowed by CORS"));
//     },
//     credentials: true,
//   })
// );

// app.use(morgan("dev"));

// // Preserve raw body for Stripe signature verification.
// app.post(
//   "/api/webhooks/stripe",
//   express.raw({ type: "application/json" }),
//   stripeWebhook
// );

// app.use(express.json());

// // Connect before accessing database-backed routes.
// app.use(async (req, res, next) => {
//   try {
//     await database();
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// app.get("/health", (req, res) => {
//   res.json({ message: "Server running" });
// });

// // Local static uploads only; use Cloudinary for persistent media.
// app.use(
//   "/uploads",
//   express.static(path.join(__dirname, "../uploads"))
// );

// loadRoutes(app);

// app.use(errorHandler);

// // Vercel handles the HTTP server lifecycle.
// export default app;

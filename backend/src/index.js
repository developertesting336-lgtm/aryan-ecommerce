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
dotenv.config();
const app = express();
const port = process.env.PORT || 4000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://aryan-ecommerce-mu.vercel.app",
];
app.post(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhook
);
app.use(morgan('dev'));
app.use(json());
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

server.listen(port,()=>{
    console.log(`🔥 server running on http://localhost:${port}`);
    database();
});


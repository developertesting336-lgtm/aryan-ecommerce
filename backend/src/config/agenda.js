import { Agenda } from "agenda";
import { MongoBackend } from "@agendajs/mongo-backend";

const rawUri =
  process.env.DATABASE ||
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  "";
const mongoUri = rawUri.trim().replace(/^["']|["']$/g, "");

export let agenda = null;

if (!process.env.VERCEL && mongoUri && /^mongodb(\+srv)?:\/\//.test(mongoUri)) {
  agenda = new Agenda({
    backend: new MongoBackend({
      address: mongoUri,
      collection: "agendaJobs",
    }),
    processEvery: "10 seconds",
  });

  agenda.on("start", (job) => {
    console.log("🚀 Agenda job started:", job.attrs.name);
  });

  agenda.on("success", (job) => {
    console.log("✅ Agenda job completed:", job.attrs.name);
  });

  agenda.on("fail", (error, job) => {
    console.log("❌ Agenda job failed:", job?.attrs?.name, error?.message);
  });
} else {
  // Safe stub for serverless or environments without background worker
  agenda = {
    start: async () => {},
    stop: async () => {},
    define: () => {},
    every: () => {},
    now: () => {},
    schedule: async () => {},
    on: () => {},
  };
}

export async function startAgenda() {
  if (process.env.VERCEL) return;
  if (!agenda || typeof agenda.start !== "function") return;
  try {
    await agenda.start();
    console.log("Agenda started");
  } catch (err) {
    console.warn("Agenda start failed:", err.message);
  }
}

export default agenda;

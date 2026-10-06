import { Agenda } from "agenda";
import { MongoBackend } from "@agendajs/mongo-backend";

export const agenda = new Agenda({
  backend: new MongoBackend({
    address: process.env.DATABASE,
    collection: "agendaJobs",
  }),
  processEvery: "5 seconds",
});

// Debug listeners
agenda.on("start", (job) => {
  console.log("🚀 Job started:", job.attrs.name);
});

agenda.on("success", (job) => {
  console.log("✅ Job completed:", job.attrs.name);
});

agenda.on("fail", (error, job) => {
  console.log("❌ Job failed:", job?.attrs?.name);
  console.log("Error:", error);
});
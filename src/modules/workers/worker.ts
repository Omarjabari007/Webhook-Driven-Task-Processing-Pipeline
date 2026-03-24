import { processPendingJobs } from "./jobs.processor.js";
import { processPendingDeliveries } from "./deliveries.processor.js";

async function startWorker() {
  console.log("Worker Started...");
  setInterval(async () => {
    try {
      await processPendingJobs();
      await processPendingDeliveries();
    } catch (err) {
      console.error("Worker error:", err);
    }
  }, 5000);
}

startWorker();
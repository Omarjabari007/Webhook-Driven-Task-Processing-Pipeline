import { processPendingJobs } from "./jobs.processor.ts";
import { processPendingDeliveries } from "./deliveries.processor.ts";

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
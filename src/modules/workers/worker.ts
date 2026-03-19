import { processPendingJobs } from "./worker.service.ts";

async function startWorker() {
    console.log("Worker Started...");
    setInterval(async () => {
        try{
            await processPendingJobs();
        }catch(err){
            console.error("Worker error:", err);
        }
    },5000)
}
startWorker();
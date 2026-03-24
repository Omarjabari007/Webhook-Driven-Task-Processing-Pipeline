import { db } from "../../db/index.js";
import { jobs } from "../../db/schema/jobs.js";
import { webhookEvents } from "../../db/schema/webhookEvents.js";
import { pipelines } from "../../db/schema/pipelines.js";
import { subscribers } from "../../db/schema/subscribers.js";
import { deliveries } from "../../db/schema/deliveries.js";

import { eq } from "drizzle-orm"; 
import { actions } from "../actions/index.js";
const MAX_JOB_RETRIES = 3;

export async function processPendingJobs() {
  const pendingJobs = await db.select().from(jobs).where(eq(jobs.status, "pending"));
  for (const job of pendingJobs) {
    try {
      console.log("Processing job:", job.id);
      //set process
      await db.update(jobs).set({ status: "processing" }).where(eq(jobs.id, job.id));

      //get event
      const [event] = await db.select().from(webhookEvents).where(eq(webhookEvents.id, job.eventId));
      if (!event) throw new Error("Webhook event not found");
      const payload = event.payload as any;
      const pipelineId = event.pipelineId;
      //get pipeline
      const [pipeline] = await db.select().from(pipelines).where(eq(pipelines.id, pipelineId));
      if (!pipeline){
        throw new Error("Pipeline not found");
      } 
      //action
      const handler = actions[pipeline.actionType as keyof typeof actions];
      if(!handler){
        throw new Error(`Unknown action type: ${pipeline.actionType}`);
      }
      //result
      const result =  await handler(payload, job);

      if (!result) {
        const newAttempts = job.attempts + 1;
        if (newAttempts >= MAX_JOB_RETRIES) {
          console.error(`Job ${job.id} reached max retries`);
          await db.update(jobs).set({
            status: "failed",
            attempts: newAttempts,
          }).where(eq(jobs.id, job.id));
            } else {
              console.log(`Retrying job ${job.id} (attempt ${newAttempts})`);
              await db.update(jobs).set({
                status: "pending",
                attempts: newAttempts,
          }).where(eq(jobs.id, job.id));
           }
          continue; }
      
await db.update(jobs)
        .set({
          status: "completed",
          result,
          processedAt: new Date(),
        }).where(eq(jobs.id, job.id));
        
      //deliveries
      const subs = await db.select().from(subscribers).where(eq(subscribers.pipelineId, pipelineId));
      for (const sub of subs) {
        await db.insert(deliveries).values({
          jobId: job.id,
          subscriberId: sub.id,
          status: "pending",
          attempts: 0,
        });
      }
      console.log(`Created ${subs.length} deliveries for job ${job.id}`);

    } catch (err: any) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        const newAttempts = job.attempts + 1;
        if (newAttempts >= MAX_JOB_RETRIES) {
          console.error(`Job ${job.id} permanently failed: ${errorMessage}`);
        await db.update(jobs).set({
          status: "failed",
          attempts: newAttempts,
          result: {
            error:errorMessage
          }
        }).where(eq(jobs.id, job.id));
  } else {
    console.log(`Retrying job ${job.id} after error (attempt ${newAttempts})`);
    await db.update(jobs).set({
      status: "pending",
      attempts: newAttempts,
    }).where(eq(jobs.id, job.id));
  }
}
  }
}


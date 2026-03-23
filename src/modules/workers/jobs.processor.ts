import { db } from "../../db/index.ts";
import { jobs } from "../../db/schema/jobs.ts";
import { webhookEvents } from "../../db/schema/webhookEvents.ts";
import { pipelines } from "../../db/schema/pipelines.ts";
import { subscribers } from "../../db/schema/subscribers.ts";
import { deliveries } from "../../db/schema/deliveries.ts";

import { eq } from "drizzle-orm";
import { actions } from "../actions/index.ts";

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
      if(!result){
        console.log("Action not ready, will retry:", job.id);
        continue;
      }
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

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error({
        message: "Job failed",
        jobId: job.id,
        error: errorMessage
        });
      await db.update(jobs).set({ status: "failed" }).where(eq(jobs.id, job.id));
    }
  }
}


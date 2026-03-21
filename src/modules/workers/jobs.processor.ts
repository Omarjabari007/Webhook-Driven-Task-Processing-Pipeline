import { db } from "../../db/index.ts";
import { jobs } from "../../db/schema/jobs.ts";
import { webhookEvents } from "../../db/schema/webhookEvents.ts";
import { pipelines } from "../../db/schema/pipelines.ts";
import { subscribers } from "../../db/schema/subscribers.ts";
import { deliveries } from "../../db/schema/deliveries.ts";

import { eq } from "drizzle-orm";

export async function processPendingJobs() {
  const pendingJobs = await db.select().from(jobs).where(eq(jobs.status, "pending"));
  for (const job of pendingJobs) {
    try {
      console.log("Processing job:", job.id);
      //set to processing
      await db.update(jobs).set({ status: "processing" }).where(eq(jobs.id, job.id));
      //get event
      const [event] = await db.select().from(webhookEvents).where(eq(webhookEvents.id, job.eventId));
      if (!event) throw new Error("Webhook event not found");

      const payload = event.payload as any;
      const pipelineId = event.pipelineId;

      //get pipeline
      const [pipeline] = await db.select().from(pipelines).where(eq(pipelines.id, pipelineId));
      if (!pipeline) throw new Error("Pipeline not found");

      //process based on action aoe4 for now
      let result: any = null;
      const MAX_JOB_RETRIES = 5;

      if (pipeline.actionType === "aoe4_match_summary") {
        const matchId = payload?.matchId;
        if (!matchId) {
          throw new Error("Invalid payload: missing matchId");
        }
        const isReady = job.attempts >= 2;
        if (!isReady) {
          console.log(`Match ${matchId} not ready yet (attempt ${job.attempts})`);
          const newAttempts = job.attempts + 1;

          if (newAttempts >= MAX_JOB_RETRIES) {
            await db.update(jobs).set({
              status: "failed",attempts: newAttempts,}).where(eq(jobs.id, job.id));
              console.log("Job failed after max retries:", job.id);
            }
            else {
              await db.update(jobs).set({
          status: "pending",attempts: newAttempts,}).where(eq(jobs.id, job.id))
          console.log("Retrying job later:", job.id);
    }
    continue; //skip delivery.
  }
        //test data
        result = {
          summary: `Match ${matchId} processed`,
        };
      }
      //save the result
      await db.update(jobs).set({
        status: "completed",result,processedAt: new Date(),
        }).where(eq(jobs.id, job.id));

      //delivers
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
      console.error("Job failed:", job.id, err);

      await db.update(jobs).set({ status: "failed" }).where(eq(jobs.id, job.id));
    }
  }
}
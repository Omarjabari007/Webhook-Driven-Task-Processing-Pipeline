import { db } from "../../db/index.ts";
import { jobs } from "../../db/schema/jobs.ts"; 
import { webhookEvents } from "../../db/schema/webhookEvents.ts"; 
import { pipelines } from "../../db/schema/pipelines.ts"; 
import { subscribers } from "../../db/schema/index.ts"; 
import { deliveries } from "../../db/schema/deliveries.ts";
import { eq } from "drizzle-orm";
import fetch from "node-fetch";

const MAX_RETRIES = 3;

export async function processPendingJobs() {
  const pendingJobs = await db.select().from(jobs).where(eq(jobs.status, "pending"));
  for (const job of pendingJobs) {
    try {
      console.log("Processing job:", job.id);
      // set to processing
      await db.update(jobs).set({ status: "processing" }).where(eq(jobs.id, job.id));
      //get event
      const event = await db.select().from(webhookEvents).where(eq(webhookEvents.id, job.eventId));
      if (event.length === 0) continue;
      const [eventRow] = event;
      if(!eventRow) continue;
      const payload = eventRow.payload as any;
      const pipelineId = eventRow.pipelineId;

      //get pipeline

      const pipeline = await db.select().from(pipelines).where(eq(pipelines.id, pipelineId));
      if (pipeline.length === 0) continue;

      //process based on action aoe4 for now
      const pipelineRow = pipeline[0]!;
      let result: any = null;
      if (pipelineRow.actionType === "aoe4_match_summary") {
        const matchId = payload?.matchId;
        if (!matchId) {
            throw new Error("Invalid payload: missing matchId");
        }
        //test data
        result = {
          summary: `Match ${matchId} processed`
        };
      }
      //save the result
      await db.update(jobs).set({status: "completed", result,processedAt: new Date()})
      .where(eq(jobs.id, job.id));
      //send to subscribers
      const subs = await db.select().from(subscribers).where(eq(subscribers.pipelineId, pipelineId));

      for (const sub of subs) {
        console.log("Sending to:", sub.url);

        try {
            const response = await fetch(sub.url , {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(result)
            });
            console.log("Response status:", response.status);
        } catch (err) {
          console.error("Failed to send:",err);
        }
      }

    } catch (err) {
      console.error("Job failed:", job.id, err);
      await db.update(jobs).set({ status: "failed" }).where(eq(jobs.id, job.id));
    }
  }
}
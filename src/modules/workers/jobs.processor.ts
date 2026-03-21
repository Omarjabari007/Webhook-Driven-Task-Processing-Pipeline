import { db } from "../../db/index.ts";
import { jobs } from "../../db/schema/jobs.ts";
import { webhookEvents } from "../../db/schema/webhookEvents.ts";
import { pipelines } from "../../db/schema/pipelines.ts";
import { subscribers } from "../../db/schema/subscribers.ts";
import { deliveries } from "../../db/schema/deliveries.ts";
import { formatCiv } from "../../utils/format.ts";
import type { Player } from "./types.ts";

import { eq } from "drizzle-orm";

const MAX_JOB_RETRIES = 5;

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
      if (!pipeline) throw new Error("Pipeline not found");
      let result: any = null;

      //aoe4
      if (pipeline.actionType === "aoe4_match_summary") {
        const matchId = payload?.matchId;
        const profileId = payload?.profileId;

        if (!matchId || !profileId) {
          throw new Error("Invalid payload: missing matchId or profileId");
        }

        let apiData: any = null;

        try {
          const response = await fetch(
            `https://aoe4world.com/api/v0/players/${profileId}/games/${matchId}`
          );

          if (!response.ok) {
            throw new Error("Match not ready yet");
          }
          apiData = await response.json();
        } catch (err) {
          console.log(`Match ${matchId} not ready yet (attempt ${job.attempts})`);

          const newAttempts = job.attempts + 1;

          if (newAttempts >= MAX_JOB_RETRIES) {
            await db.update(jobs)
              .set({
                status: "failed",
                attempts: newAttempts,
              }).where(eq(jobs.id, job.id));
            console.log("Job failed after max retries:", job.id);
          } else {
            await db.update(jobs)
              .set({
                status: "pending",
                attempts: newAttempts,
              }).where(eq(jobs.id, job.id));
            console.log("Retrying job later:", job.id);
          }

          continue;
        }
        //result
        const teams = apiData?.teams || [];
        const players: Player[] = teams.flat().map((p: any) => ({
          name: p.name,
          result: p.result,
          civilization: p.civilization
        }));

        const winner = players.find(p => p.result === "win");
        const loser = players.find(p => p.result === "loss");

        const durationMinutes = Math.round(apiData.duration / 60);
        result = {
          matchId,
          map: apiData.map,
          duration: `${durationMinutes} minutes`,
          players,
          summary: winner && loser
            ? `${winner.name} (${formatCiv(winner.civilization)}) defeated ${loser.name} (${formatCiv(loser.civilization)}) on ${apiData.map} in ${durationMinutes} minutes`
            : `Match ${matchId} processed`
        };
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
      console.error("Job failed:", job.id, err);

      await db.update(jobs).set({ status: "failed" }).where(eq(jobs.id, job.id));
    }
  }
}


import { db } from "../../db/index.ts";
import { deliveries } from "../../db/schema/deliveries.ts";
import { subscribers } from "../../db/schema/subscribers.ts";
import { jobs } from "../../db/schema/jobs.ts";
import fetch from "node-fetch";
import type { MatchSummaryResult } from "./types.ts";

import { eq } from "drizzle-orm";

const MAX_RETRIES = 3;

export async function processPendingDeliveries() {
  const pendingDeliveries = await db.select().from(deliveries).where(eq(deliveries.status, "pending"));

  if(pendingDeliveries.length === 0){
    return;
  }
  console.log(`Processing ${pendingDeliveries.length} pending deliveries`);

  for (const delivery of pendingDeliveries) {
    try {
      if (delivery.attempts >= MAX_RETRIES) {
        console.log("Max retries reached:", delivery.id);
        await db.update(deliveries).set({ status: "failed" }).where(eq(deliveries.id, delivery.id));
        continue;
      }

      //get subscriber
      const [sub] = await db.select().from(subscribers).where(eq(subscribers.id, delivery.subscriberId));
      if (!sub) throw new Error("Subscriber not found");

      // get job result
      const [job] = await db.select().from(jobs).where(eq(jobs.id, delivery.jobId));
      if (!job || !job.result) {
        throw new Error("Job result not ready");
      }
      console.log("Sending to:", sub.url);

      let body: string;
      const result = job.result as MatchSummaryResult;
      if (sub.url.includes("discord.com") && result?.summary) 
        {
        body = JSON.stringify(
          {
            content: result.summary
          });

        } else {
          body = JSON.stringify(job.result);
        }
        const response = await fetch(sub.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },body,});

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          console.log("Delivery success:", delivery.id);
          await db.update(deliveries).set({ status: "success" }).where(eq(deliveries.id, delivery.id));
          } 
          catch (err: any) {
            console.error("Delivery failed:", delivery.id, err.message);
            const newAttempts = delivery.attempts + 1;
            await db.update(deliveries)
            .set({
              attempts: newAttempts,
              lastError: err.message,
              status: newAttempts >= MAX_RETRIES ? "failed" : "pending",
            }).where(eq(deliveries.id, delivery.id));
    }
  }
}
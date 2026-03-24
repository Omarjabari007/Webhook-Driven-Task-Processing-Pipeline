import { db } from "../../db/index.js";
import { deliveries } from "../../db/schema/deliveries.js";
import { subscribers } from "../../db/schema/subscribers.js";
import { jobs } from "../../db/schema/jobs.js";
import fetch from "node-fetch";
import { getBackoffDelay } from "../../utils/backoff.js";
import type { JobResult } from "./types.js";
import { eq, and, lte, isNull, or } from "drizzle-orm";


const MAX_RETRIES = 3;

export async function processPendingDeliveries() {
const now = new Date();
const pendingDeliveries = await db.select().from(deliveries).where(and(
      eq(deliveries.status, "pending"),
      or(
        isNull(deliveries.nextRetryAt), 
        lte(deliveries.nextRetryAt, now) 
      )));

  if(pendingDeliveries.length === 0){
    return;
  }
  console.log(`Processing ${pendingDeliveries.length} pending deliveries`);

  for (const delivery of pendingDeliveries) {
    try {
      if (delivery.attempts >= MAX_RETRIES) {
        console.log("Moved to dead", delivery.id);
        await db.update(deliveries).set({ status: "dead" }).where(eq(deliveries.id, delivery.id));
        continue;
      }

      //get subscriber
      const [sub] = await db.select().from(subscribers).where(eq(subscribers.id, delivery.subscriberId));
      if (!sub) throw new Error("Subscriber not found");

      // get job result
      const [job] = await db.select().from(jobs).where(eq(jobs.id, delivery.jobId));
      if (!sub || !job?.result) {
        throw new Error("Missing data");
      }

      let body: string;
      const result = job.result as JobResult;
      if (sub.url.includes("discord.com") && result.summary) 
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
            const newAttempts = delivery.attempts + 1;
            const delay = getBackoffDelay(newAttempts);
            const nextRetry = new Date(Date.now() + delay);
            if(newAttempts >= MAX_RETRIES) {
              console.error(`Delivery ${delivery.id} failed permanently after 
                ${newAttempts} attempts → moved to dead`)
            }else{
              console.error(`Retry ${newAttempts} in ${delay / 1000}s for delivery ${delivery.id}`)
            }
            await db.update(deliveries)
            .set({
              attempts: newAttempts,
              lastError: err.message,
              nextRetryAt: nextRetry,
              status: newAttempts >= MAX_RETRIES ? "dead" : "pending",
            }).where(eq(deliveries.id, delivery.id));
    }
  }
}
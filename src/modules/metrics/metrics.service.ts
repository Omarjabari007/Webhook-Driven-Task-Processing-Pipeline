import { db } from "../../db/index.ts";
import { jobs } from "../../db/schema/jobs.ts";
import { deliveries } from "../../db/schema/deliveries.ts";
import { count, eq } from "drizzle-orm";

export async function getMetrics() {
    // jobs
    const [{ count: totalJobs } = { count: 0 }] = await db.select({ count: count() }).from(jobs);
    const [{ count: completedJobs } = { count: 0}] = await db.select({ count: count() }).from(jobs)
    .where(eq(jobs.status, "completed"));

    const [{ count: failedJobs } = {count: 0}] = await db.select({ count: count() }).from(jobs)
    .where(eq(jobs.status, "failed"));

    //deliveries
    const [{ count: totalDeliveries } = {count: 0}] = await db.select({ count: count() })
    .from(deliveries);

    const [{ count: deadDeliveries } = {count: 0}] = await db.select({ count: count() })
    .from(deliveries).where(eq(deliveries.status, "dead"));

    const successRate =totalJobs > 0? `${((completedJobs / totalJobs) * 100).toFixed(2)}%`: "0";

    return {
        totalJobs,
        completedJobs,
        failedJobs,
        successRate,
        totalDeliveries,
        deadDeliveries,
  };
}
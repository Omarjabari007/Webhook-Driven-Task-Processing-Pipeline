import { db } from "../../db/index.ts";
import { jobs } from "../../db/schema/jobs.ts";
import { eq } from "drizzle-orm";

export async function processPendingJobs() {
    const pendingJobs = await db.select().from(jobs).where(eq(jobs.status, "pending"));
}
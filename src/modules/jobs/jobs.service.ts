import { db } from "../../db/index.ts";
import { jobs } from "../../db/schema/jobs.ts";
import { deliveries } from "../../db/schema/deliveries.ts";

import { eq } from "drizzle-orm";
import { AppError } from "../../utils/AppError.ts";

export async function getJobs() {
  return db.select().from(jobs);
}

export async function getJobById(id: string) {
  const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
  if (!job) {
    throw new AppError("Job not found", 404);
  }
  return job;
}

export async function getJobDeliveries(jobId: string) {
  const job = await db.select().from(jobs).where(eq(jobs.id, jobId));
  if (job.length === 0) {
    throw new AppError("Job not found", 404);
  }
  return db.select().from(deliveries).where(eq(deliveries.jobId, jobId));
}

export async function replayJob(jobId: string) {
  const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId));
  if(!job){
    throw new AppError("Job not found", 404);
  }
  const [newJob] = await db.insert(jobs).values({
    eventId: job.eventId,
    status: "pending",
    attempts: 0
  }).returning();
  return {
    message: "Job replayed",
    newJobId: newJob?.id
  }
}

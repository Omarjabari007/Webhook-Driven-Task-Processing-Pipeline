import { db } from "../../db/index.js";
import { pipelines } from "../../db/schema/pipelines.js";
import { webhookEvents } from "../../db/schema/webhookEvents.js";
import { jobs } from "../../db/schema/jobs.js";
import { eq } from "drizzle-orm";
import { AppError } from "../../utils/AppError.js";

export async function handleWebhook(sourcePath: string, payload: any) {
    const [pipeline] = await db.select().from(pipelines).where(eq(pipelines.sourcePath, sourcePath));
    if(!pipeline){
        throw new AppError("Pipeline not found", 404);
    }
    const pipelineId = pipeline.id;
    const eventResult = await db.insert(webhookEvents).values({
        pipelineId,
        payload
    }).returning();
    const event = eventResult[0];
    if(!event){
        throw new AppError("Failed to create webhook event" , 500);
    }
    await db.insert(jobs).values({
        eventId: event.id,
        status: "pending"
    })
    return {message : "Webhook received"}
}
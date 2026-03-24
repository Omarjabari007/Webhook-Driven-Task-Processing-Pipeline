import { db } from "../../db/index.js";
import { subscribers } from "../../db/schema/subscribers.js";
import {pipelines} from "../../db/schema/pipelines.js"
import { eq } from "drizzle-orm";
import { AppError } from "../../utils/AppError.js";

import type { CreateSubscriberDTO , SubscriberResponse } from "./subscribers.type.js";

export async function createSubscriber( pipelineId: string, data: CreateSubscriberDTO
): Promise<SubscriberResponse> {
  const pipeline = await db.select().from(pipelines).where(eq(pipelines.id, pipelineId));

  if (pipeline.length === 0) {
    throw new AppError("Pipeline not found", 404);
  }

  try {
    const result = await db.insert(subscribers).values({pipelineId,url: data.url,}).returning();
    const subscriber = result[0];

    if (!subscriber) {
      throw new AppError("Failed to create subscriber", 500);
    }
    return subscriber;
  } catch (err: any) {
    const code = err.code || err.cause?.code;
    if(code === "23505"){
        throw new AppError("Subscriber already exist for this pipeline" , 409);
    }
    throw err;
  }
}

export async function getSubscriberByPipeline(pipelineId: string): Promise<SubscriberResponse[]>{
    const pipeline = await db.select().from(pipelines).where(eq(pipelines.id, pipelineId));
    if(pipeline.length === 0){
        throw new AppError("Pipeline not found" , 404);
    }
    return db.select().from(subscribers).where(eq(subscribers.pipelineId , pipelineId));
}

export async function deleteSubscriber(id: string): Promise<void> {
    const result = await db.delete(subscribers).where(eq(subscribers.id,id)).returning();
    if(result.length === 0){
        throw new AppError("Subscriber not found" , 404);
    }
}
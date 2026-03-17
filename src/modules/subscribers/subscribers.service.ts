import { db } from "../../db/index.ts";
import { subscribers } from "../../db/schema/subscribers.ts";
import {pipelines} from "../../db/schema/pipelines.ts"
import { eq } from "drizzle-orm";
import { AppError } from "../../utils/AppError.ts";

import type { CreateSubscriberDTO , SubscriberResponse } from "./subscribers.type.ts";

export async function createSubscriber(pipelineId: string , data: CreateSubscriberDTO)
:Promise<SubscriberResponse>{
const pipeline = await db.select().from(pipelines).where(eq(pipelines.id, pipelineId)); //check if exist
if(pipeline.length === 0){
    throw new AppError("Pipeline not found", 404);
}
const result = await db.insert(subscribers).values({
    pipelineId,
    url: data.url
}).returning();
const subscriber = result[0];
if (!subscriber) {
  throw new AppError("Failed to create subscriber", 500);
}
return subscriber;
}

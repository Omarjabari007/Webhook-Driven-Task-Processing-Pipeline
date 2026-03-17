import {db} from "../../db/index.ts"
import {pipelines} from "../../db/schema/pipelines.ts"
import { mapPipeline } from "../../mappers/pipeline.mapper.ts"
import { eq } from "drizzle-orm"

import type { CreatePipelineDTO , PipelineResponse } from "./pipelines.types.ts"
import { AppError } from "../../utils/AppError.ts"

export async function createPipeline(data:CreatePipelineDTO): Promise<PipelineResponse>{
    const result = await db.insert(pipelines)
    .values({
        name: data.name,
        sourcePath: data.sourcePath,
        actionType: data.actionType,
        config: data.config
    })
    .returning();
    const pipeline = result[0]
    if(!pipeline){
        throw new AppError("Failed to create pipeline" , 500);
    }
    return mapPipeline(pipeline);
} 

export async function getPipelines() : Promise<PipelineResponse[]> {
    const rows = await db.select().from(pipelines)
    return rows.map(mapPipeline);
}

export async function getPipelineById(id : string) : Promise<PipelineResponse> {
    const rows = await db.select().from(pipelines).where(eq(pipelines.id , id))
    if(rows.length === 0){
        throw new AppError("Pipeline not found" , 404);
    }
    return mapPipeline(rows[0]);
}

export async function deletePipeline(id : string): Promise<void> {
    await db.delete(pipelines).where(eq(pipelines.id , id))
}
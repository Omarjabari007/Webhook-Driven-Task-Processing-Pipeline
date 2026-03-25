import {db} from "../../db/index.js"
import {pipelines} from "../../db/schema/pipelines.js"
import { mapPipeline } from "../../mappers/pipeline.mapper.js"
import { eq } from "drizzle-orm"

import type { CreatePipelineDTO , PipelineResponse } from "./pipelines.types.js"
import { AppError } from "../../utils/AppError.js"

export async function createPipeline(data:CreatePipelineDTO): Promise<PipelineResponse>{
    try{
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
} catch(err: any){
    const code = err.code || err.cause?.code;
    if(code === "23505"){
        throw new AppError(`Pipeline with sourcePath "${data.sourcePath}" already exists`,409);
    }
    throw err;
}

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
    try{
        const result = await db.delete(pipelines).where(eq(pipelines.id , id)).returning()
        if(result.length === 0){
            throw new AppError("Pipeline not found" , 404);
        }        
    } catch (err : any){
        const code = err.code || err.cause?.code;
        if(code === "23503"){
            throw new AppError("Cannot delete pipeline, Remove related subscribers, jobs, and deliveries first",400)
        }
        throw err;
    }
}
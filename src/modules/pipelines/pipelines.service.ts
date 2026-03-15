import {db} from "../../db/index.ts"
import {pipelines} from "../../db/schema/pipelines.ts"
import { mapPipeline } from "../../mappers/pipeline.mapper.ts"

import type { CreatePipelineDTO , PipelineResponse } from "./pipelines.types.ts"

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
        throw new Error("Failed to create pipeline");
    }
    return mapPipeline(pipeline);
} 
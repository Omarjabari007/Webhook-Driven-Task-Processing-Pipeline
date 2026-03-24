import type { PipelineResponse , PipelineConfig ,pipelineActionType } 
from "../modules/pipelines/pipelines.types.js";

export function mapPipeline(row: any): PipelineResponse {
    return {
        id: row.id,
        name: row.name,
        sourcePath: row.sourcePath,
        actionType: row.actionType as pipelineActionType,
        config: row.config as PipelineConfig,
        createdAt: row.createdAt
    }
}
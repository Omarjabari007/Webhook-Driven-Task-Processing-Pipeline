export type pipelineActionType = "aoe4_match_summary"; // add more later 

export interface Aoe4PipelineConfig {
    apiUrl: string;
}

export type PipelineConfig =  Aoe4PipelineConfig; // add more later depend on the type

export interface CreatePipelineDTO {
    name: string;
    sourcePath: string;
    actionType: pipelineActionType;
    config?: PipelineConfig;
}

export interface PipelineResponse {
    id: string;
    name: string;
    sourcePath: string;
    actionType: pipelineActionType;
    config: PipelineConfig;
    createdAt: Date;
}


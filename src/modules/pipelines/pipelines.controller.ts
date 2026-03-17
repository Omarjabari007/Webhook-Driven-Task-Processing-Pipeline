import type { Request , Response } from "express";
import {createPipeline , getPipelines , getPipelineById , deletePipeline} from "./pipelines.service.ts"

export async function createPipelineController(req : Request , res : Response){
        const pipeline = await createPipeline(req.body)
        res.status(201).json(pipeline)
}

export async function getPipelinesController(req : Request , res : Response){
        const pipelines = await getPipelines()
        res.json(pipelines);    
}

export async function getPipelineByIdController ( req : Request , res : Response){
        const id = req.params.id as string;
        const pipeline = await getPipelineById(id);
        res.json(pipeline);
}

export async function deletePipelineController( req:Request , res : Response) {
        const id = req.params.id as string;
        await deletePipeline(id)
        res.status(204).send()    
}
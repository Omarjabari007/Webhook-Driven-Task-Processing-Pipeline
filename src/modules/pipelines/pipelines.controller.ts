import type { Request , Response } from "express";
import {createPipeline , getPipelines , getPipelineById , deletePipeline} from "./pipelines.service.ts"
import type { CreatePipelineDTO } from "./pipelines.types.ts";
import { AppError } from "../../utils/AppError.ts";

export async function createPipelineController(req : Request , res : Response){
        console.log("BODY:", req.body)
        const data = req.body as CreatePipelineDTO
        const pipeline = await createPipeline(data)
        res.status(201).json(pipeline)
}

export async function getPipelinesController(req : Request , res : Response){
        const pipelines = await getPipelines()
        res.json(pipelines);    
}

export async function getPipelineByIdController ( req : Request , res : Response){
        const { id } = req.params

        if (!id || Array.isArray(id)) {
            throw new AppError("Invalid pipeline id", 400);
        }
        const pipeline = await getPipelineById(id);
        res.json(pipeline)
}

export async function deletePipelineController( req:Request , res : Response) {
        const {id} = req.params;
        if (!id || Array.isArray(id)) {
            throw new AppError("Invalid pipeline id" , 400);
        }
        await deletePipeline(id)
        res.status(204).send()    
}
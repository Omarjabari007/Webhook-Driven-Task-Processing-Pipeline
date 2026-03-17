import type { Request , Response } from "express";
import {createPipeline , getPipelines , getPipelineById} from "./pipelines.service.ts"
import type { CreatePipelineDTO } from "./pipelines.types.ts";

export async function createPipelineController(req : Request , res : Response){
    try{
        console.log("BODY:", req.body)
        const data = req.body as CreatePipelineDTO
        const pipeline = await createPipeline(data)
        res.status(201).json(pipeline)
    }catch(error){
        console.error(error)
        res.status(500).json({message: "Failed to create pipeline"})
    }
}

export async function getPipelinesController(req : Request , res : Response){
    try{
        const pipelines = await getPipelines()
        res.json(pipelines);
    }
    catch(error){
        console.error(error)
        res.status(500).json({message: "Failed to fetch pipelines"})
    }
}

export async function getPipelineByIdController ( req : Request , res : Response){
    try{
        const { id } = req.params

        if (!id || Array.isArray(id)) {
            return res.status(400).json({ message: "Invalid pipeline id" })
        }
        const pipeline = await getPipelineById(id);
        if (!pipeline) {
            return res.status(404).json({ message: "Pipeline not found" })
        }
        res.json(pipeline)
    }
    catch(error){
        console.error(error);
        res.status(500).json({message : "Failed to fetch pipeline by id"})
    }
}
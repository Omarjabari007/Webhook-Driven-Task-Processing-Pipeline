import type { Request , Response } from "express";
import {createPipeline} from "./pipelines.service.ts"
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
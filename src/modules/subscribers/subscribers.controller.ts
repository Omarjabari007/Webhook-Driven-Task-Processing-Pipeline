import type { Request , Response } from "express";
import { createSubscriber , getSubscriberByPipeline , deleteSubscriber } from "./subscribers.service.js";

export async function createSubscriberController(req: Request , res : Response) {
    const pipelineId = req.params.pipelineId as string;
    const subscriber = await createSubscriber(pipelineId,req.body);
    res.status(201).json(subscriber);
}

export async function getSubscribersController(req:Request , res : Response) {
    const pipelineId = req.params.pipelineId as string;
    const subscribers = await getSubscriberByPipeline(pipelineId);
    res.json(subscribers);
}

export async function deleteSubscriberController(req : Request , res : Response) {
    const id = req.params.id as string;
    await deleteSubscriber(id);
    res.status(204).send();
}
import type { Request , Response } from "express";
import { handleWebhook } from "./webhooks.service.ts";

export async function webhookController(req : Request , res : Response) {
    const sourcePath = req.params.sourcePath as string;
    await handleWebhook(sourcePath, req.body);
    res.status(202).json({
        message: "Webhook accepted"
    })
}
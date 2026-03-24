import type { Request , Response } from "express";
import { handleWebhook } from "./webhooks.service.js";
import { verifySignature } from "../../utils/signature.js";

export async function webhookController(req : Request , res : Response) {
    const signature = req.headers["x-signature"] as string;
    
    if(!signature){
        return res.status(401).json({message: "Missing signature"});
    }

    const isValid = verifySignature(req.body, signature);

    if(!isValid){
        return res.status(403).json({message: "Invalid signature"});
    }

    const sourcePath = req.params.sourcePath as string;
    await handleWebhook(sourcePath, req.body);
    res.status(202).json({
        message: "Webhook accepted"
    })
}
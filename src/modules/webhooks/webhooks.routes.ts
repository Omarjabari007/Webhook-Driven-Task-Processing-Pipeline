import { Router } from "express";
import { webhookController } from "./webhooks.controller.ts";
import { validate } from "../../middlewares/validate.middleware.ts";
import { asyncHandler } from "../../utils/asyncHandler.ts";
import { webhookSchema } from "./webhooks.schema.ts";
import { rateLimit } from "../../middlewares/rateLimit.middleware.ts";

const router = Router();

router.post("/webhooks/:sourcePath"
    ,rateLimit
    , validate(webhookSchema) 
    ,asyncHandler(webhookController)
)

export default router;

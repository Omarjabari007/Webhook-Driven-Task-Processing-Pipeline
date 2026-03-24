import { Router } from "express";
import { webhookController } from "./webhooks.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { webhookSchema } from "./webhooks.schema.js";
import { rateLimit } from "../../middlewares/rateLimit.middleware.js";

const router = Router();

router.post("/webhooks/:sourcePath"
    ,rateLimit
    , validate(webhookSchema) 
    ,asyncHandler(webhookController)
)

export default router;

import { Router } from "express";
import { webhookController } from "./webhooks.controller.ts";
import { validate } from "../../middlewares/validate.middleware.ts";
import { asyncHandler } from "../../utils/asyncHandler.ts";
import { webhookSchema } from "./webhooks.schema.ts";

const router = Router();

router.post("/webhooks/:sourcePath", validate(webhookSchema) ,asyncHandler(webhookController));

export default router;

import { Router } from "express";
import { createSubscriberController , getSubscribersController } from "./subscribers.controller.ts";

import { validate } from "../../middlewares/validate.middleware.ts";
import { asyncHandler } from "../../utils/asyncHandler.ts";

import { SubscriberCreationSchema} from "./subscribers.schema.ts";

const router = Router();

router.post("/pipelines/:pipelineId/subscribers",validate(SubscriberCreationSchema,),
asyncHandler(createSubscriberController));

router.get("/pipelines/:pipelineId/subscribers", asyncHandler(getSubscribersController));

export default router;
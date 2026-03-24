import { Router } from "express";
import { createSubscriberController , getSubscribersController , deleteSubscriberController} from "./subscribers.controller.js";

import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

import { SubscriberCreationSchema , subscriberIdSchema , pipelineIdSchema} from "./subscribers.schema.js";

const router = Router();

router.post("/pipelines/:pipelineId/subscribers",validate(SubscriberCreationSchema,),
asyncHandler(createSubscriberController));

router.get("/pipelines/:pipelineId/subscribers",validate(pipelineIdSchema),
 asyncHandler(getSubscribersController));

router.delete("/subscribers/:id", validate(subscriberIdSchema),
 asyncHandler(deleteSubscriberController));

export default router;
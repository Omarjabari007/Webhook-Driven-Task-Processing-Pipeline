import { Router } from "express";
import { createSubscriberController , getSubscribersController , deleteSubscriberController} from "./subscribers.controller.ts";

import { validate } from "../../middlewares/validate.middleware.ts";
import { asyncHandler } from "../../utils/asyncHandler.ts";

import { SubscriberCreationSchema , subscriberIdSchema} from "./subscribers.schema.ts";

const router = Router();

router.post("/pipelines/:pipelineId/subscribers",validate(SubscriberCreationSchema,),
asyncHandler(createSubscriberController));

router.get("/pipelines/:pipelineId/subscribers", asyncHandler(getSubscribersController));

router.delete("/subscribers/:id", validate(subscriberIdSchema),
 asyncHandler(deleteSubscriberController));

export default router;
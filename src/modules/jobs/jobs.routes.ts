import { Router } from "express";
import { getJobsController , getJobByIdController , 
getJobDeliveriesController, replayJobController } from "./jobs.controller.js";

import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { jobIdSchema } from "./jobs.schema.js";

const router = Router();

router.get("/jobs", asyncHandler(getJobsController));
router.get("/jobs/:id", validate(jobIdSchema), asyncHandler(getJobByIdController));
router.get("/jobs/:id/deliveries", validate(jobIdSchema), asyncHandler(getJobDeliveriesController));
router.post("/jobs/:id/replay", asyncHandler(replayJobController));

export default router;
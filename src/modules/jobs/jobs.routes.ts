import { Router } from "express";
import { getJobsController , getJobByIdController , 
getJobDeliveriesController } from "./jobs.controller.ts";

import { asyncHandler } from "../../utils/asyncHandler.ts";
import { validate } from "../../middlewares/validate.middleware.ts";
import { jobIdSchema } from "./jobs.schema.ts";

const router = Router();

router.get("/jobs", asyncHandler(getJobsController));
router.get("/jobs/:id", validate(jobIdSchema), asyncHandler(getJobByIdController));
router.get("/jobs/:id/deliveries", validate(jobIdSchema), asyncHandler(getJobDeliveriesController));

export default router;
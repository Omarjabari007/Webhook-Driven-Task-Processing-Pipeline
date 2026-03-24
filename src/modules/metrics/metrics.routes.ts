import { Router } from "express";
import { getMetricsController } from "./metrics.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const router = Router();

router.get("/metrics", asyncHandler(getMetricsController));

export default router;
import { Router } from "express";
import { getMetricsController } from "./metrics.controller.ts";
import { asyncHandler } from "../../utils/asyncHandler.ts";

const router = Router();

router.get("/metrics", asyncHandler(getMetricsController));

export default router;
import { Router } from "express";
import { createPipelineController ,getPipelineByIdController , getPipelinesController,deletePipelineController } from "./pipelines.controller.ts";
import { asyncHandler } from "../../utils/asyncHandler.ts";

const router = Router()

router.post("/",createPipelineController)
router.get("/", getPipelinesController)
router.get("/:id" , asyncHandler(getPipelineByIdController))
router.delete("/:id" , deletePipelineController)
export default router

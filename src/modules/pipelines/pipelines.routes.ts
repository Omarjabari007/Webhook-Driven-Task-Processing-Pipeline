import { Router } from "express";
import { createPipelineController ,getPipelineByIdController , getPipelinesController,deletePipelineController } from "./pipelines.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { PipelineCreationSchema , pipelineIdSchema } from "./pipelines.schema.js";

const router = Router()

router.post("/",validate(PipelineCreationSchema),asyncHandler(createPipelineController))
router.get("/", asyncHandler(getPipelinesController))
router.get("/:id" , validate(pipelineIdSchema), asyncHandler(getPipelineByIdController))
router.delete("/:id" , validate(pipelineIdSchema), asyncHandler(deletePipelineController))
export default router

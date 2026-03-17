import { Router } from "express";
import { createPipelineController ,getPipelineByIdController , getPipelinesController,deletePipelineController } from "./pipelines.controller.ts";
import { asyncHandler } from "../../utils/asyncHandler.ts";
import { validate } from "../../middlewares/validate.middleware.ts";
import { PipelineCreationSchema , pipelineIdSchema } from "./pipelines.schema.ts";

const router = Router()

router.post("/",validate(PipelineCreationSchema),asyncHandler(createPipelineController))
router.get("/", asyncHandler(getPipelinesController))
router.get("/:id" , validate(pipelineIdSchema), asyncHandler(getPipelineByIdController))
router.delete("/:id" , validate(pipelineIdSchema), asyncHandler(deletePipelineController))
export default router

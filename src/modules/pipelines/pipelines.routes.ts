import { Router } from "express";
import { createPipelineController ,getPipelineByIdController , getPipelinesController,deletePipelineController } from "./pipelines.controller.ts";

const router = Router()

router.post("/",createPipelineController)
router.get("/", getPipelinesController)
router.get("/:id" , getPipelineByIdController)
router.delete("/:id" , deletePipelineController)
export default router

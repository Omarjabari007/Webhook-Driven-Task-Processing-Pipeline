import { Router } from "express";
import { createPipelineController ,getPipelineByIdController , getPipelinesController } from "./pipelines.controller.ts";

const router = Router()

router.post("/",createPipelineController)
router.get("/", getPipelinesController)
router.get("/:id" , getPipelineByIdController)

export default router
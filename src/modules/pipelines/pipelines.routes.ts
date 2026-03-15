import { Router } from "express";
import { createPipelineController } from "./pipelines.controller.ts";
import { createPipeline } from "./pipelines.service.ts";

const router = Router()

router.post("/",createPipeline)

export default router
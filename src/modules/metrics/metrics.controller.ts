import type { Request, Response } from "express";
import { getMetrics } from "./metrics.service.ts";

export async function getMetricsController(req: Request, res: Response) {
  const metrics = await getMetrics();
  res.json(metrics);
}
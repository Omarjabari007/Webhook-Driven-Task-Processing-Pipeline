import type { Request, Response } from "express";
import { getJobs, getJobById, getJobDeliveries } from "./jobs.service.ts";

export async function getJobsController(req: Request, res: Response) {
  const data = await getJobs();
  res.json(data);
}

export async function getJobByIdController(req: Request, res: Response) {
    const id = req.params.id as string;
    const job = await getJobById(id);
    res.json(job);
}

export async function getJobDeliveriesController(req: Request, res: Response) {
    const id = req.params.id as string;
    const deliveries = await getJobDeliveries(id);
    res.json(deliveries);
}
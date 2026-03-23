import express from "express";
import { db } from "./db/index.js";
import { sql } from "drizzle-orm";
import pipelinesRoutes from "./modules/pipelines/pipelines.routes.ts"
import { errorMiddleware } from "./middlewares/error.middleware.ts";
import subsriberRoutes from "./modules/subscribers/subscribers.routes.ts";
import webhookRoutes from "./modules/webhooks/webhooks.routes.ts";
import jobRoutes from "./modules/jobs/jobs.routes.ts";
import metricsRoutes from "./modules/metrics/metrics.routes.ts";

const app = express();

app.use(express.json());

app.use("/pipelines" , pipelinesRoutes);
app.use(subsriberRoutes);
app.use(webhookRoutes);
app.use(jobRoutes);
app.use(metricsRoutes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

async function testDB() {
  await db.execute(sql`SELECT 1`);
  console.log("database connected");
}

testDB();

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
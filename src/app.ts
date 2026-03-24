import express from "express";
import { db } from "./db/index.js";
import { sql } from "drizzle-orm";
import pipelinesRoutes from "./modules/pipelines/pipelines.routes.js"
import { errorMiddleware } from "./middlewares/error.middleware.js";
import subsriberRoutes from "./modules/subscribers/subscribers.routes.js";
import webhookRoutes from "./modules/webhooks/webhooks.routes.js";
import jobRoutes from "./modules/jobs/jobs.routes.js";
import metricsRoutes from "./modules/metrics/metrics.routes.js";

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
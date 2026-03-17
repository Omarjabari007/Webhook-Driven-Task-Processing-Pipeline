import express from "express";
import { db } from "./db/index.js";
import { sql } from "drizzle-orm";
import pipelinesRoutes from "./modules/pipelines/pipelines.routes.ts"
import { errorMiddleware } from "./middlewares/error.middleware.ts";

const app = express();

app.use(express.json());

app.use("/pipelines" , pipelinesRoutes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

async function testDB() {
  await db.execute(sql`SELECT 1`);
  console.log("database connected");
}

testDB();



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
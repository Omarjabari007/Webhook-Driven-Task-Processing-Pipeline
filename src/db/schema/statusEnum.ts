import {pgEnum} from "drizzle-orm/pg-core";

export const jobStatus = pgEnum("job_status" , [
    "pending",
    "processing",
    "completed",
    "failed"
]);

export const deliveryStatus = pgEnum("delivery_status" , [
    "pending",
    "success",
    "failed",
    "dead"
]);
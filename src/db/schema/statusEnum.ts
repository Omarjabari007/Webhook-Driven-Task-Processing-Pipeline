import {pgEnum} from "drizzle-orm/pg-core";

export const jobStatus = pgEnum("job_status" , [
    "pending",
    "processing",
    "completed",
    "failed"
]);


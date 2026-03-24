import {pgTable , uuid , timestamp , integer , text, index} from "drizzle-orm/pg-core"
import {jobs} from "./index.js"
import {subscribers} from "./index.js"
import { deliveryStatus } from "./statusEnum.js"

export const deliveries = pgTable("deliveries" , {
    id: uuid("id").defaultRandom().primaryKey(),
    jobId: uuid("job_id").references(() => jobs.id).notNull(),
    subscriberId: uuid("subscriber_id").references(()=> subscribers.id).notNull(),
    status: deliveryStatus("status").default("pending").notNull(),
    attempts: integer("attempts").default(0).notNull(),
    lastError: text("last_error"),
    nextRetryAt: timestamp("next_retry_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
},(table) => ({
    statusRetryIdx: index("deliveries_status_retry_idx").on(table.status, table.nextRetryAt),
    jobIdx: index("deliveries_job_id_idx").on(table.jobId),
})
);

export type Delivery = typeof deliveries.$inferSelect;
export type NewDelivery = typeof deliveries.$inferInsert;
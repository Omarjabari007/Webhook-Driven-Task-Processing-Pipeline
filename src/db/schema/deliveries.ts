import {pgTable , uuid , timestamp , integer , text, index} from "drizzle-orm/pg-core"
import {jobs} from "./index.ts"
import {subscribers} from "./index.ts"
import { deliveryStatus } from "./statusEnum.ts"

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
    statusIdx: index("deliveries_status_idx").on(table.status),
    jobIdx: index("deliveries_job_id_idx").on(table.jobId),
    retryIdx: index("deliveries_next_retry_idx").on(table.nextRetryAt),
})
);

export type Delivery = typeof deliveries.$inferSelect;
export type NewDelivery = typeof deliveries.$inferInsert;
import {pgTable , uuid , jsonb , timestamp , integer, index} from "drizzle-orm/pg-core"
import { webhookEvents } from "./webhookEvents.ts"
import { jobStatus } from "./statusEnum.ts"

export const jobs = pgTable("jobs", {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id").references(() => webhookEvents.id).notNull(),
    status: jobStatus("status").default("pending").notNull(),
    attempts: integer("attempts").default(0).notNull(),
    result: jsonb("result"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    processedAt: timestamp("processed_at"),
},(table) => ({
    statusIdx: index("jobs_status_idx").on(table.status),
    eventIdx: index("jobs_event_id_idx").on(table.eventId),
})
);

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
import {pgTable , uuid , jsonb , timestamp , integer} from "drizzle-orm/pg-core"
import { webhookEvents } from "./index.ts"
import { jobStatus } from "./statusEnum.ts"

export const jobs = pgTable("jobs", {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id").references(() => webhookEvents.id).notNull(),
    status: jobStatus("status").default("pending").notNull(),
    attempts: integer("attempts").default(0).notNull(),
    result: jsonb("result"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    processedAt: timestamp("processed_at"),
});

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
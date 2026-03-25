import {pgTable , uuid, jsonb , timestamp} from "drizzle-orm/pg-core"
import {pipelines} from "./pipelines.ts"

export const webhookEvents = pgTable("webhook_events", {
    id: uuid("id").defaultRandom().primaryKey(),
    pipelineId: uuid("pipeline_id").references(() => pipelines.id).notNull(),
    payload: jsonb("payload").notNull(),
    receivedAt: timestamp("received_at").defaultNow().notNull(),
});

export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type NewWebhookEvent = typeof webhookEvents.$inferInsert;
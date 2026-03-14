import {pgTable, uuid, text , timestamp} from "drizzle-orm/pg-core"
import { pipelines } from "./index.ts"

export const subscribers = pgTable("subscribers" , {
    id: uuid("id").defaultRandom().primaryKey(),
    pipelineId: uuid("pipeline_id").references(()=>pipelines.id).notNull(),
    url: text("url").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Subscriber = typeof subscribers.$inferSelect;
export type NewSubscriber = typeof subscribers.$inferInsert;
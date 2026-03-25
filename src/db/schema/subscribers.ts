import {pgTable, uuid, text , timestamp ,uniqueIndex} from "drizzle-orm/pg-core"
import { pipelines } from "./pipelines.ts"

export const subscribers = pgTable("subscribers" , {
    id: uuid("id").defaultRandom().primaryKey(),
    pipelineId: uuid("pipeline_id").references(()=>pipelines.id).notNull(),
    url: text("url").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
},
(table) => ({
    pipelineUniqueUrl: uniqueIndex("unique_pipeline_url").on(table.pipelineId,table.url)
})
);

export type Subscriber = typeof subscribers.$inferSelect;
export type NewSubscriber = typeof subscribers.$inferInsert;
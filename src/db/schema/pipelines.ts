import { pgTable , uuid , text , jsonb , timestamp } from "drizzle-orm/pg-core";

export const pipelines = pgTable("pipelines", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    sourcePath: text("source_path").notNull().unique(),
    actionType: text("action_type").notNull(),
    config: jsonb("config"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Pipeline = typeof pipelines.$inferSelect;
export type NewPipeline = typeof pipelines.$inferInsert;
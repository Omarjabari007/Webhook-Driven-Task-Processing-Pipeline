CREATE INDEX "deliveries_status_retry_idx" ON "deliveries" USING btree ("status","next_retry_at");--> statement-breakpoint
CREATE INDEX "deliveries_job_id_idx" ON "deliveries" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "jobs_status_idx" ON "jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "jobs_event_id_idx" ON "jobs" USING btree ("event_id");
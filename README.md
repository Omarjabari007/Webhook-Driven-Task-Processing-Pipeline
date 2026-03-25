# Webhook-Driven Task Processing Pipeline

A production-style backend system that ingests webhooks, processes them asynchronously, and delivers results reliably to subscribers with retry logic, observability, and security.

---

## Tech Stack

| Category         | Technology              |
| ---------------- | ----------------------- |
| Runtime          | Node.js                 |
| Language         | TypeScript              |
| Framework        | Express.js              |
| Database         | PostgreSQL              |
| ORM              | Drizzle ORM             |
| Validation       | Zod                     |
| Security         | (bcrypt, HMAC)          |
| Containerization | Docker + Docker Compose |
| CI/CD            | GitHub Actions          |

---

## System Overview

This system allows users to create **pipelines** that connect:

- A webhook source
- A processing action
- One or more subscribers

Incoming requests are:

- validated
- stored
- processed asynchronously
- delivered with retry guarantees

---

## Pipelines

![Pipeline Diagram](./docs/pipeline.png)
Each pipeline defines:

- `sourcePath` → unique webhook URL
- `actionType` → processing logic
- subscribers → delivery targets

---

## Processing Lifecycle

> ![Architecture](./docs/source.png)

Webhook requests are ingested, validated, stored as events, processed asynchronously by a worker, and their results are delivered to subscribers with retry and status tracking.

## Key Strengths

- Clean separation between API and worker
- Reliable retry logic (jobs + deliveries)
- Replay system for recovery
- Secure webhook verification
- Rate limiting to prevent abuse

---

## Processing Actions

The system implements **3 Specific actions Related to an External API**:

### AOE4 API :

AOE4 ( age of empires 4 is a strategy video games that mostly 2 players or more play in a map with different or similar civillizations each one build his own civ buildings and army with strategy you can use a plan to beat your enemy, your purpose is to destroy the enemy civ)

I used AOE4 external API to fetch data from the game database and used it in my app for 3 type of actions.

### 1. Match Summary

- Fetches match data from AOE4 API
- Extracts winner, duration, map
- Produces readable summary

### 2. Player Profile

- Retrieves player stats
- Computes win rate
- Returns ranking insights

### 3. Map Meta

- Determines best civilization for a map
- Uses aggregated stats
- Provides gameplay recommendation

---

## Replay System

- Endpoint: `POST /jobs/:id/replay`
- Creates a new job from existing event
- Useful for:
  - fixing failed jobs
  - reprocessing after API recovery
  - debugging pipelines

---

## Reliability & Fault Tolerance

### Failure Scenarios & Handling

| Scenario             | System Behavior                                        |
| -------------------- | ------------------------------------------------------ |
| Missing signature    | Request rejected with 401 (early return in controller) |
| Invalid signature    | Request rejected with 403                              |
| External API failure | Job marked pending and retried                         |
| Subscriber failure   | Delivery retried with backoff                          |
| Max retries reached  | Delivery marked as `dead`                              |
| Worker crash         | Jobs remain `pending` and reprocessed                  |

---

### Retry Strategy for jobs + deliveries

- Max attempts: 3
- Exponential backoff for deliveries
- Deliveries use `nextRetryAt`

---

### Dead State

If delivery fails after max retries:

```text
status = "dead"
```

This ensures:

- no infinite retries
- clear failure tracking

---

## Security

### HMAC Signature

- Uses SHA256
- Prevents spoofed requests

### Rate Limiting

- Per `sourcePath` or IP
- Prevents abuse

---

## Monitoring & Observability

### Metrics Endpoint

```http
GET /metrics
```

Returns:

- totalJobs
- completedJobs
- failedJobs
- successRate
- totalDeliveries
- deadDeliveries

---

### Health Check

```http
GET /health
```

Returns:

- uptime
- server status
- timestamp

---

## Database Schema

> ![Architecture](./docs/tables%20relations.png)

### Tables

- pipelines
- webhook_events
- jobs
- deliveries
- subscribers

---

### Indexes

#### Jobs

- `jobs_status_idx`
- `jobs_event_id_idx`

#### Deliveries

- `deliveries_status_retry_idx`
- `deliveries_job_id_idx`

#### Subscribers

- `unique_pipeline_url` (unique constraint)

---

These indexes optimize:

- job polling
- retry scheduling
- lookup performance

---

## Design Decisions & Tradeoffs

### 1. Database as Queue

**Chosen over RabbitMQ**

- Simpler setup
- Fewer dependencies

---

### 2. Polling Worker

- Easy implementation
- Predictable

---

### 3. At-Least-Once Delivery

- Reliable
  : Possible duplicates

---

### 4. In-Memory Rate Limiting

Implemented using a simple in-memory Map.

Advantages:

- Very fast (no DB or external service)
- Easy to implement

Tradeoff:

- Not shared across multiple instances
- Each server has its own limit tracking

---

# Webhook-Driven Task Processing Pipeline

## Getting Started

### Requirements

**For Windows:**

- Docker Desktop
- Git

**Optional:**

- Node.js 22+
  _(Only needed if you want to run the local signing script for testing)_

> **Note:** Node.js is **NOT required** to run the app using Docker Compose.

---

## Setup

```bash
git clone https://github.com/Omarjabari007/Webhook-Driven-Task-Processing-Pipeline.git
cd Webhook-Driven-Task-Processing-Pipeline
```

---

## Environment Configuration

Create a `.env` file in the project root:

```env
PORT=3000
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=webhook_db
DATABASE_URL=postgresql://postgres:postgres@webhook-psql:5432/webhook_db
WEBHOOK_SECRET=secret123
```

---

## Run the Application

```bash
docker compose up --build
```

---

## Verify the App is Running

Open in browser:

```
http://localhost:3000/health
```

Expected response:

```json
{
  "status": "ok"
}
```

---

## Important Notes

- You **must create** a `.env` file before running Docker.
- Inside Docker, the database hostname is:

```
webhook-psql
```

---

## Optional: Local Signature Generation (Testing)

If you want to test signed webhook requests locally:

```bash
npm install
```

Then run:

```bash
npm run sign "{\"map\":\"Rocky River\"}"
```

---

## Troubleshooting

### `.env` file not found

Make sure you created a `.env` file before running:

```bash
docker compose up --build
```

---

### `tsx is not recognized`

Run:

```bash
npm install
```

---

## API Example (Full Flow)

### Create Pipeline

```bash
curl -X POST http://localhost:3000/pipelines \
-H "Content-Type: application/json" \
-d '{
  "name": "Meta",
  "sourcePath": "aoe4-meta",
  "actionType": "aoe4_meta"
}'
```

📌 **Response will include an `id`** — this is your **pipeline ID**
You will use it in the next step.

Example:

```json
{
  "id": "123e4567-abc-xyz"
}
```

---

### Add Subscriber

Replace `<pipeline_id>` with your actual pipeline ID:

```bash
curl -X POST http://localhost:3000/pipelines/<pipeline_id>/subscribers \
-H "Content-Type: application/json" \
-d '{
  "url": "https://discord.com/api/webhooks/PUT_YOUR_WEBHOOK_HERE"
}'
```

### Discord Integration

- Go to your Discord server → Channel Settings → Integrations → Webhooks
- Create a webhook and copy the URL
- Replace:

```text
PUT_YOUR_WEBHOOK_HERE
```

---

### Payload Format (for Discord)

```json
{
  "content": "<message>"
}
```

---

### Generate Signature

```bash
npm install
npm run sign "{\"map\":\"Rocky River\"}"
```

---

### Send Webhook

```bash
curl -X POST http://localhost:3000/webhooks/aoe4-meta \
-H "Content-Type: application/json" \
-H "x-signature: <signature>" \
-d '{"map":"Rocky River"}'
```

---

### Check Subscriber

Go to your Discord channel and verify the message was received

---

## Notes About `curl` (Windows vs Linux)

### Windows (CMD)

Use `^` for multi-line commands:

```bash
curl -X POST http://localhost:3000/pipelines ^
-H "Content-Type: application/json" ^
-d "{\"name\":\"Meta\",\"sourcePath\":\"aoe4-meta\",\"actionType\":\"aoe4_meta\"}"
```

---

### Linux / macOS

Use `\` instead:

```bash
curl -X POST http://localhost:3000/pipelines \
-H "Content-Type: application/json" \
-d '{"name":"Meta","sourcePath":"aoe4-meta","actionType":"aoe4_meta"}'
```

---

### Universal (One-line, works everywhere)

```bash
curl -X POST http://localhost:3000/pipelines -H "Content-Type: application/json" -d "{\"name\":\"Meta\",\"sourcePath\":\"aoe4-meta\",\"actionType\":\"aoe4_meta\"}"
```

---

## Tips

- Always replace:
  - `<pipeline_id>` → with your actual pipeline ID
  - `PUT_YOUR_WEBHOOK_HERE` → with your Discord webhook URL

- If something fails, try the **one-line curl version** to avoid shell issues

---

## Summary

This project allows you to:

- Create pipelines
- Attach subscribers
- Process webhook events
- Deliver processed results (e.g. to Discord)

---

## Additional Endpoints to check :

### Health Check

---

```bash
GET:  http://localhost:3000/health
```

---

### Metrics Check

```bash
GET:  http://localhost:3000/metrics
```

---

### Pipelines

```bash
GET: http://localhost:3000/pipelines
```

```bash
GET: http://localhost:3000/pipelines/<pipeline-id>
DELETE: http://localhost:3000/pipelines/<pipeline-id>
```

Note: For delete pipeline : **_be sure to delete subscribers and jobs from that pipelines first_**

---

### Subscirbers for specific pipelind id

```bash
GET: http://localhost:3000/pipelines/<pipeline-id>/subscribers
DELETE: http://localhost:3000/pipelines/<pipeline-id>/subscribers
```

---

---

### Jobs

```bash
GET: http://localhost:3000/jobs
```

```bash
GET: http://localhost:3000/jobs/<id>
```

---

### Deliveries

```bash
GET: http://localhost:3000/jobs/<job-id>/deliveries
```

---

### Replay System

```bash
POST: http://localhost:3000/jobs/<job-id>/replay
```

---

## Project Structure

```text
src/
├── app.ts
│
├── db/
│   ├── index.ts
│   └── schema/
│       ├── pipelines.ts
│       ├── subscribers.ts
│       ├── webhookEvents.ts
│       ├── jobs.ts
│       ├── deliveries.ts
│       ├── statusEnum.ts
│       └── index.ts
│
├── modules/
│   ├── pipelines/
│   │   ├── pipelines.controller.ts
│   │   ├── pipelines.service.ts
│   │   ├── pipelines.routes.ts
│   │   ├── pipelines.schema.ts
│   │   └── pipelines.types.ts
│   │
│   ├── subscribers/
│   │   ├── subscribers.controller.ts
│   │   ├── subscribers.service.ts
│   │   ├── subscribers.routes.ts
│   │   ├── subscribers.schema.ts
│   │   └── subscribers.type.ts
│   │
│   ├── webhooks/
│   │   ├── webhooks.controller.ts
│   │   ├── webhooks.service.ts
│   │   ├── webhooks.routes.ts
│   │   └── webhooks.schema.ts
│   │
│   ├── jobs/
│   │   ├── jobs.controller.ts
│   │   ├── jobs.service.ts
│   │   ├── jobs.routes.ts
│   │   └── jobs.schema.ts
│   │
│   ├── workers/
│   │   ├── worker.ts
│   │   ├── jobs.processor.ts
│   │   ├── deliveries.processor.ts
│   │   └── types.ts
│   │
│   ├── actions/
│   │   ├── aoe4.action.ts
│   │   ├── aoe4_player_profile.ts
│   │   ├── aoe4-meta.action.ts
│   │   └── index.ts
│   │
│   └── metrics/
│       ├── metrics.controller.ts
│       ├── metrics.service.ts
│       └── metrics.routes.ts
│
├── middlewares/
│   ├── error.middleware.ts
│   ├── validate.middleware.ts
│   └── rateLimit.middleware.ts
│
├── mappers/
│   └── pipeline.mapper.ts
│
├── utils/
│   ├── AppError.ts
│   ├── asyncHandler.ts
│   ├── backoff.ts
│   ├── signature.ts
│   └── format.ts
---
```

## Requirements Fulfilled

| Requirement          | Status |
| -------------------- | ------ |
| CRUD pipelines       | ✅     |
| Webhook ingestion    | ✅     |
| Background worker    | ✅     |
| 3 processing actions | ✅     |
| Retry logic          | ✅     |
| Job tracking API     | ✅     |
| Docker setup         | ✅     |
| CI/CD pipeline       | ✅     |
| Documentation        | ✅     |

---

## Evaluation Criteria Coverage

| Area           | Implementation              |
| -------------- | --------------------------- |
| Architecture   | Modular + worker separation |
| Reliability    | Retry + dead state          |
| Code Quality   | TypeScript + Zod            |
| Infrastructure | Docker + CI                 |
| Documentation  | This README                 |
| Creativity     | AOE4 integrations           |

---

## Stretch Goals Implemented

- Rate limiting
- Signature verification
- Metrics endpoint
- Replay system
- Discord integration

---

## Future Enhancements

- Logging system (structured logs)
- Pipeline chaining
- Dashboard UI
- Distributed queue (Redis/RabbitMQ)
- Dead-letter queue

---

```

```

# main-utils, aldo, becky-misc, becky Fargate services — Analysis Notes

## main-utils

### Overview
CDK app for utility/backup automation on BEPOWER_MAIN account. Step Functions orchestrate Lambda functions for Git, Confluence, ClickUp backups + SLOC analysis.

### Patterns Found
- **Step Functions orchestration** — complex workflow with Parallel, Map, Choice, error handling (addCatch)
- **Lambda function factory** — `commonFunctionProps` shared across all functions (runtime, logging, bundling, layers)
- **AWS Powertools** — Lambda Powertools layer for structured logging, tracing, metrics
- **EFS for Lambda** — shared filesystem for git clone operations across Lambda invocations
- **EventBridge Scheduler** — cron trigger for prod-only scheduled execution
- **Log routing** — CloudWatch → Kinesis Firehose → Splunk via SubscriptionFilter
- **Secrets management** — all credentials from SecretsManager (GitHub, Bitbucket, Atlassian, Slack, ClickUp)
- **S3 lifecycle** — auto-delete artifacts after 7 days, rolling backup retention

### CDK Patterns (same as bep-cdk)
- Extends PipelineStack, uses Stage composition
- Manual approval between staging → production
- CodeScan integration (SonarQube)
- `addPromoteBeforeUpdatePipeline` pattern

---

## aldo

### Overview
AI-powered Slack bot for technical documentation (RAG). Monorepo with 4 packages: `common`, `cli`, `aws` (CDK), plus FlowRAG for embeddings.

### Patterns Found
- **Modern stack** — ESM, Biome, Vitest, Node 22+, tsconfig/node22
- **CommonStack pattern** — shared resources (LogGroup, commonNodejsFunctionProps, secrets) in a dedicated stack, passed to other stacks via props
- **Stack decomposition by concern** — CommonStack, StorageStack, ApiStack, BotStack, IngestionStack
- **Cross-stack references via props** — BotStack receives `apiStack`, `commonStack`, `storageStack` as props (not exports)
- **ESM Lambda bundling** — `OutputFormat.ESM` with `createRequire` banner for CJS compatibility
- **DynamoDB on-demand** — TableV2 with on-demand billing, GSI for user lookups
- **SQS FIFO** — async message processing with DLQ (14-day retention)
- **Lambda structured logging** — JSON format, Powertools, source maps enabled

### CDK Patterns
- Same pipeline pattern (PipelineStack, Stage, waves, manual approval)
- Route53MainStack for DNS delegation
- `.js` extensions in imports (ESM)

---

## becky-misc

### Overview
CDK app for Redis maintenance operations (backup, monitoring, init, AppConfig). Utility stacks for the Becky ecosystem.

### Patterns Found
- Step Functions for Redis stream backup/monitoring
- Lambda functions for Redis operations (clear streams, pending checks)
- AppConfig stack for centralized configuration

---

## Becky Fargate Services (session, becky-ocpi, ocpp-universal-fe)

### Common Architecture Pattern

All Becky Fargate services follow the same structure:

```
service/
├── cdk/
│   ├── bin/service.ts          # CDK app entry (prod + noprod pipelines)
│   ├── lib/
│   │   ├── const.ts            # PROJECT_NAME = `Becky{Service}`
│   │   ├── stacks/
│   │   │   ├── pipeline-stack.ts   # Extends PipelineStack
│   │   │   └── service-stack.ts    # Fargate service + infra
│   │   └── stages/
│   │       └── service-stage.ts    # Extends Stage
├── src/                        # Application code (NestJS or plain Node)
├── config/                     # Environment configs (JSON per stage)
├── migrations/                 # SQL migrations
└── e2e/                        # E2E tests
```

### NestJS Patterns (session, becky-ocpi)

1. **Module-per-domain** — each business domain is a NestJS module:
   - `session/`, `sdr/`, `tariff/`, `billing/` (session service)
   - `location/`, `credentials/`, `session/`, `cdr/`, `token/`, `tariff/` (OCPI)

2. **Module structure**:
   ```
   domain/
   ├── domain.module.ts          # NestJS module definition
   ├── domain.service.ts         # Business logic
   ├── controllers/
   │   ├── domain.event-controller.ts   # Redis message broker events
   │   └── domain.task-controller.ts    # SQS task queue handlers
   ├── entities/
   │   └── entity.entity.ts      # TypeORM entities
   └── repositories/
       └── entity.repository.ts  # TypeORM custom repositories
   ```

3. **Three transport layers**:
   - HTTP (Express) — REST API + health check
   - Redis Message Broker — event-driven communication between services
   - SQS Task Queue — scheduled/async tasks

4. **Configuration** — `ConfigurationService` extends abstract base, loads from JSON files per environment

5. **Middleware chain** (OCPI): RequestContext → Logger → RateLimiter → CorrelationId → Interop

6. **Shared libraries**:
   - `@bepower/nestjs-common` — LoggerService, TypeOrmJsonLogger, OpenTelemetry instrument, RedisMsgBrokerTransport
   - `@bepower/task-lib` — TaskTransport for SQS-based task processing
   - `@bepower/redis-message-broker` — inter-service messaging
   - `@bepower/becky-cdk` — shared CDK constructs (BeckyDatabaseStack, BeckyEcsStack)
   - `@bepower/becky-pricing-models` — shared pricing/tariff models

7. **Mutex pattern** — Redis-based distributed locking via decorator (`@Mutex`)

### CDK Patterns for Fargate Services

1. **Database provisioning** — `BeckyDatabaseStack.createDatabase()` from becky-common
2. **ECS helpers** — `BeckyEcsStack.addHelpers()` adds all sidecars (Firelens, OTel, Dynatrace, Inspector)
3. **Service discovery** — Cloud Map private DNS namespace per stage
4. **Secrets injection** — ECS secrets from SecretsManager (DB, Redis, API keys)
5. **Firelens logging** — app logs → Kinesis Firehose → Splunk
6. **Health checks** — wget-based container health check
7. **Task scheduling** — EventBridge rules → SQS queue → task controller
8. **Security groups** — per-service SG, explicit allowFrom/allowTo rules
9. **Dual pipeline** — develop → noprod, main → prod (separate PipelineStack instances)
10. **DataDog integration** — agent sidecar for APM/DBM (prod only, alongside Dynatrace)

### ocpp-universal-fe (non-NestJS)

- Plain Node.js WebSocket server (Express + ws)
- OCPP 1.6 and 2.0.1 protocol frontend
- Custom logger/tracer factories (functional pattern)
- API Gateway WebSocket integration (CDK side)
- ECS metadata for instance identification
- No framework, minimal dependencies

### Observability Stack (across all services)
- **Logging**: Firelens → Kinesis Firehose → Splunk + CloudWatch
- **Tracing**: OpenTelemetry (Jaeger exporter) + Dynatrace OneAgent
- **APM**: Dynatrace sidecar (all envs) + DataDog agent (prod)
- **Metrics**: CloudWatch Container Insights
- **Health**: HTTP health endpoint per service

### Environment Configuration
- JSON config files per stage: `config/env/{development,staging,preprod,prod}.json`
- `config/default.json` for shared defaults
- `ConfigurationService` merges default + stage config
- Secrets injected via ECS Secret references (not in config files)

# BePower Best Practices — Consolidated Notes

These notes will be used to generate steering templates and skills for @bepower/dev.

---

## Block 1: CDK Architecture

### 1.1 Stack Hierarchy

All CDK projects extend the base classes from `@bepower/bep-cdk-lib`:

```
BaseStack (abstract)
  ├── Stack          → application stacks (VPC, stage, isProd)
  ├── NestedStack    → sub-stacks in same account
  └── PipelineStack  → CI/CD (branch, destinationAccount, notifications)

Stage                → groups stacks per environment
```

Every stack constructor receives: `projectName`, `departments[]`, `level`, `scope`, `id`, `props`.
ABAC tagging (Project, Department, Level, Environment, EnvironmentName) is automatic in the constructor.

### 1.2 Stage Composition

```typescript
class MyStage extends Stage {
  constructor(scope, id, props) {
    super(scope, id, props);
    const commonProps = { account, isFirstStage, stage, env: account.env };

    const ecsStack = new EcsStack(this, 'Ecs', { ...commonProps });
    const dbStack = new DbStack(this, 'Db', { ...commonProps, ecsStack });
    // Cross-account stack in same stage
    new DnsStack(this, 'Dns', { ...commonProps, account: Account.BEPOWER_MAIN, env: Account.BEPOWER_MAIN.env });
  }
}
```

Rules:
- `commonProps` shared across all stacks in a stage
- Cross-account stacks allowed in same stage (e.g., DNS on BEPOWER_MAIN)
- Dependencies between stacks via constructor props
- `isFirstStage` flag: first stage creates shared resources, subsequent stages import them

### 1.3 Pipeline Pattern

All projects follow the same structure:

```
bin/app.ts
  → new PipelineStack(app, id, { account: DEPLOYMENT, destinationAccount, branch })

PipelineStack:
  → CodePipeline (self-mutating, GitHub source via CodeStar connection)
  → Wave 1: CDK tests + CodeScan + first stage (development or preprod)
  → Wave 2: ManualApprovalStep + second stage (staging or prod)
  → addPromoteBeforeUpdatePipeline() — gate before self-mutation
```

Constants across all pipelines:
- Pipeline runs in DEPLOYMENT account, deploys to destination account
- GitHub connection via CodeStar (ARN from Account registry)
- GitHub token from SecretsManager (`github` secret)
- Docker credentials from SecretsManager (`docker` secret)
- Slack and/or Teams notifications
- CodeScan (SonarQube) as pre-step in first wave
- LinuxBuildImage.STANDARD_7_0

Dual pipeline pattern for services:
- `develop` branch → noprod (development → staging)
- `main` branch → prod (preprod → prod)

### 1.4 Cross-Stack Communication

| Mechanism | When to use |
|---|---|
| **Props** | Stacks in the same Stage (preferred) |
| **Dual export** (CfnOutput + SSM Parameter) | Cross-stage or cross-account |

Dual export pattern (from bep-cdk-lib):
- `createExports(id, name, value, description?)` → creates both CfnOutput and SSM StringParameter
- `retrieveExport(name, id?, useParameter?)` → reads from Fn.importValue or SSM
- Naming: colon-separated `project:resource:attribute:stage` → SSM path `/project/resource/attribute/stage`

### 1.5 Static Retrieve Pattern

Stacks expose static methods for cross-stack resource sharing:

```typescript
class BeckyEcsStack extends Stack {
  // Lookup existing resources
  static retrieveCluster(stack: Stack): ICluster { ... }
  static retrieveNamespace(stack: Stack): INamespace { ... }
  static retrieveSecurityGroup(stack: Stack): ISecurityGroup { ... }

  // Compute strings (names, export keys)
  static getClusterName(stack: Stack): string { ... }
  static getAppConfigApplicationIdExport(stack: Stack): string { ... }

  // Create new resources (factory)
  static createDatabase(stack, name, migrationsPath?): { database, proxy, secret } { ... }

  // Add sidecars/helpers to a task definition
  static addHelpers(stack, name, taskDef, container): void { ... }
  static addFirelens(stack, name, taskDef, logGroup): void { ... }
  static addInspector(stack, name, container): CustomResource { ... }
}
```

Naming convention:
- `retrieve*()` — lookup existing resources (fromXxx)
- `get*()` — compute strings (names, export keys)
- `create*()` — create new resources (factory pattern)
- `add*()` — add sidecars/helpers to existing constructs

### 1.6 Account Model

Static registry in `Account` class:
- Each account: `project`, `environment`, `id`, `region`, `domain?`, `vpc?`, `githubConnectionId?`
- Factory pattern for VPC and PipelineBucket retrieval
- Environments: `Main | Prod | NoProd | ThirdParty`
- Domains: `bepower.io` (prod), `bepower.tech` (noprod)

Proposed taxonomy (not yet implemented):
- `application` — CPO, MOBILITY, WEBSITES, PLENITUDE
- `data` — DATA
- `infrastructure` — NETWORK, DEPLOYMENT, BEPOWER_MAIN
- `security` — SECURITY
- `third-party` — ASCEND

### 1.7 Naming Conventions

| Resource | Pattern | Example |
|---|---|---|
| Export names | `project:resource:attribute:stage` | `becky:db:session:id:development` |
| Stack names | `ProjectResource{Stage}` | `BeckyEcsDevelopment` |
| Resource names | `project-resource-stage` | `becky-redis-development` |
| Secret names | `stage/project/service/type` | `development/becky/session/db` |
| Log groups | `/service/project/name/stage` | `/ecs/becky/session/development` |
| Function names | `project-resource-cr-stage` | `becky-db-cr-development` |
| Pipeline names | `ProjectNamePipeline` | `BeckySessionPipeline` |
| CDK construct IDs | PascalCase | `BeckyEcsStack`, `DatabaseSecret` |

---

## Block 2: NestJS / Microservices

### 2.1 Module-per-domain

Every business domain is an isolated NestJS module:

```
src/
├── app.module.ts                    # Root module, imports all domain modules
├── common/                          # Shared: config, base entities, mutex
├── health.controller.ts             # Health check endpoint
├── main.ts                          # Bootstrap (3 transports)
├── message-broker/                  # Redis message broker setup
├── session/                         # Domain module
│   ├── session.module.ts
│   ├── session.service.ts
│   ├── controllers/
│   │   ├── session.event-controller.ts       # Redis events
│   │   └── close-session.task-controller.ts  # SQS tasks
│   ├── entities/
│   │   └── session.entity.ts
│   └── repositories/
│       └── session.repository.ts
├── sdr/                             # Another domain module
├── tariff/
└── billing/
```

### 2.2 Three Transport Layers

Every Fargate service exposes 3 interfaces:

```typescript
const app = await NestFactory.create(AppModule, { logger: new LoggerService() });

// 1. Redis Message Broker — inter-service events
const redisMsgBroker = app.get(RedisMsgBrokerTransport);
await app.connectMicroservice({ strategy: redisMsgBroker }).listen();

// 2. SQS Task Queue — scheduled/async tasks
const taskTransport = app.get(TaskTransport);
await app.connectMicroservice({ strategy: taskTransport }).listen();

// 3. HTTP — REST API + health check
await app.listen(3001);
```

### 2.3 Controller Naming

- `*.event-controller.ts` — handles events from Redis message broker
- `*.task-controller.ts` — handles tasks from SQS queue
- `health.controller.ts` — HTTP health check

### 2.4 Configuration

- `ConfigurationService` extends abstract base from `@bepower/nestjs-common`
- JSON files per stage: `config/default.json` + `config/env/{stage}.json`
- Secrets injected via ECS Secret references (never in config files)
- TypeORM config via `getTypeORMConfig()` with entity auto-discovery

### 2.5 Middleware Chain

Applied in `AppModule.configure()`, excluded for `/health`:

```
RequestContext → Logger → RateLimiter → CorrelationId → Interop
```

### 2.6 Shared Libraries

| Library | Purpose |
|---|---|
| `@bepower/nestjs-common` | LoggerService, TypeOrmJsonLogger, OTel instrument, RedisMsgBrokerTransport |
| `@bepower/task-lib` | TaskTransport for SQS task processing |
| `@bepower/redis-message-broker` | Inter-service messaging |
| `@bepower/becky-cdk` | Shared CDK constructs (BeckyDatabaseStack, BeckyEcsStack) |
| `@bepower/becky-pricing-models` | Shared pricing/tariff domain models |

### 2.7 Mutex Pattern

Distributed locking via Redis with `@Mutex` decorator — for operations that must not run concurrently (e.g., session close).

---

## Block 3: Observability

### 3.1 Logging

```
Application → Firelens (FluentBit) → Kinesis Firehose → Splunk
                                   → CloudWatch Logs (backup/debug)
```

- Two Firehose streams per account: `splunk-app` (application logs) and `splunk-infra` (infrastructure logs)
- Each with `-cw` variant for CloudWatch-sourced logs (decompression processor)
- FluentBit config stored in S3, loaded via `aws_fluent_bit_init_s3_1` env var
- Lambda functions: JSON logging format (`LoggingFormat.JSON`), AWS Powertools for structured logs
- Log group naming: `/service/project/name/stage` (e.g., `/ecs/becky/session/development`)
- Retention: 1 week (default), 1 month (database logs), 3 days (dev/utility)

### 3.2 Tracing

- OpenTelemetry SDK with Jaeger exporter
- `@bepower/nestjs-common/opentelemetry/instrument` loaded at startup via `-r` flag
- OTel collector sidecar in ECS tasks
- Lambda: `Tracing.ACTIVE` (X-Ray)

### 3.3 APM

- Dynatrace OneAgent: Lambda layer (Node.js/Java/Python) + ECS sidecar
- DataDog agent: ECS sidecar (prod only, for DBM — database monitoring)
- Both can coexist on same service

### 3.4 Health Checks

- HTTP endpoint: `/health` (NestJS) or custom path
- ECS container health check: `wget --no-verbose --tries=1 --spider http://localhost:{port}/health || exit 1`
- Start period: 1 minute

### 3.5 Metrics

- CloudWatch Container Insights on ECS clusters
- AWS Powertools Metrics namespace per project
- Dynatrace + DataDog for application metrics

---

## Block 4: Data & Storage

### 4.1 Aurora PostgreSQL

Standard provisioning via `BeckyDatabaseStack.createDatabase()`:
- Aurora PostgreSQL (version 14.3)
- Writer + Reader instances
- Prod: `m5.xlarge` / `r7g.xlarge`, NoProd: `t4g.medium`
- Private isolated subnets, storage encrypted
- 7-day backup retention
- CloudWatch logs export (postgresql), 1-month retention

### 4.2 RDS Proxy

- Always created alongside database
- Application connects through proxy (connection pooling)
- Proxy uses application secret (not master)

### 4.3 Database RBAC

Three PostgreSQL roles:
- `it_cloud_base` — full admin (ALL on schema, tables, sequences, functions)
- `applications` — CRUD (SELECT, INSERT, UPDATE, DELETE, TRIGGER + USAGE on sequences)
- `viewer` — read-only (SELECT + USAGE on sequences)

Event trigger `on_create_funct()` auto-grants permissions on new tables.
Application user inherits `applications` role.

### 4.4 Secret Rotation

- Master secret: auto-generated by CDK (`Credentials.fromGeneratedSecret`)
- Application secret: `DatabaseSecret` with `masterSecret` reference
- Multi-user rotation: `database.addRotationMultiUser('SecretRotation', { secret })`
- Secret naming: `stage/project/service/db` and `stage/project/service/db/master`

### 4.5 Database Migrations

- SQL files in `migrations/` directory
- Uploaded to S3 via `BucketDeployment`
- Applied by Custom Resource (Lambda) during deployment
- Two-phase CR: `onEvent` (fast, retrieves secrets) + `isComplete` (connects to DB, runs SQL)

### 4.6 Redis (ElastiCache)

- Replication Group (cluster mode enabled)
- Auth token from SecretsManager
- Transit + at-rest encryption
- Prod: multi-AZ, 2 node groups, 2 replicas each (`m7g.large`)
- NoProd: single AZ, 1 node group, 1 replica (`t4g.micro`)
- 10-day snapshot retention
- CloudWatch logs (engine + slow logs, JSON format)
- ACL users managed via Custom Resource

### 4.7 DynamoDB

- TableV2 with on-demand billing
- GSI for access patterns (e.g., user-index)
- RemovalPolicy.DESTROY for non-critical tables

### 4.8 S3

- `BlockPublicAccess.BLOCK_ALL` always
- Encryption: S3_MANAGED or KMS_MANAGED
- Lifecycle rules for temporary data (e.g., artifacts expire after 7 days)
- RemovalPolicy.DESTROY for dev/utility buckets

---

## Block 5: Security

### 5.1 Secrets Management

- All credentials in AWS SecretsManager (never hardcoded, never in config files)
- Secret naming: `stage/project/service/type` or `service-name`
- ECS secrets injected via `ECSSecret.fromSecretsManager(secret, 'key')`
- Lambda: secret ARN passed as environment variable, read via SDK
- Pipeline: GitHub token and Docker credentials from SecretsManager

### 5.2 IAM

- Least privilege: specific actions on specific resources
- Lambda CRs: minimal managed policies (`AWSLambdaBasicExecutionRole`, `AWSLambdaVPCAccessExecutionRole`)
- CDK grant methods preferred: `bucket.grantRead()`, `secret.grantRead()`, `table.grantReadWriteData()`
- Cross-account trust via CDK bootstrap qualifier (`bepcdkv9`)

### 5.3 Network

- 3-tier subnets: public, private (natted), isolated
- Databases in isolated subnets
- Lambda CRs in private subnets (when DB access needed)
- Dedicated security groups per resource type
- Explicit `allowFrom` / `allowTo` rules between services

### 5.4 Encryption

- RDS: storage encrypted
- ElastiCache: transit + at-rest encryption
- S3: KMS or S3-managed encryption
- Pipeline artifacts: KMS encryption with cross-account key sharing

---

## Block 6: Serverless

### 6.1 Lambda Common Props

Every project defines a `commonFunctionProps` object shared across all functions:

```typescript
const commonFunctionProps: NodejsFunctionProps = {
  depsLockFilePath: join(__dirname, '..', '..', 'package-lock.json'),
  runtime: Runtime.NODEJS_20_X,  // or NODEJS_24_X for newer projects
  loggingFormat: LoggingFormat.JSON,
  logGroup,
  tracing: Tracing.ACTIVE,
  bundling: {
    sourceMap: true,
    // ESM for newer projects:
    format: OutputFormat.ESM,
    minify: true,
  },
  environment: {
    NODE_OPTIONS: '--enable-source-maps',
    STAGE: stack.stage,
    POWERTOOLS_LOG_LEVEL: 'DEBUG',
  },
};
```

### 6.2 AWS Powertools

- Lambda Powertools layer for structured logging, tracing, metrics
- External modules in bundling (not bundled, loaded from layer)
- `POWERTOOLS_LOG_LEVEL`, `POWERTOOLS_METRICS_NAMESPACE`, `POWERTOOLS_SERVICE_NAME` env vars

### 6.3 Custom Resources (Two-Phase Pattern)

```
Provider
  ├── onEventHandler    → fast, returns data (e.g., retrieves secrets)
  └── isCompleteHandler → slow, does actual work (e.g., connects to DB, runs SQL)
      queryInterval: 1 minute
```

Used for: database initialization, Redis ACL setup, container vulnerability scanning.

### 6.4 Step Functions

- Parallel branches for independent operations
- Map state for batch processing (e.g., backup each repo)
- Choice state for conditional logic (e.g., even/odd day)
- Error handling via `addCatch` with Pass states
- Logging: ALL level to dedicated LogGroup

### 6.5 EventBridge Scheduling

- `@aws-cdk/aws-scheduler-alpha` for cron triggers
- Prod-only schedules (guarded by `if (this.stage === 'prod')`)
- EventBridge Rules for periodic SQS messages (task scheduling)

# Architecture & Infrastructure

## CDK Stack Hierarchy

All CDK projects extend base classes from `@bepower/bep-cdk-lib`:

```
BaseStack (abstract)
  ├── Stack          → application stacks (VPC, stage, isProd)
  └── PipelineStack  → CI/CD (branch, destinationAccount, notifications)

Stage                → groups stacks per environment
```

**Never use NestedStack** — always use separate `Stack` instances inside the `Stage`.

Every stack constructor receives: `projectName`, `departments[]`, `level`, `scope`, `id`, `props`.
ABAC tagging (Project, Department, Level, Environment, EnvironmentName) is automatic.

## Stage Composition

```typescript
class MyStage extends Stage {
  constructor(scope, id, props) {
    super(scope, id, props);
    const commonProps = { account, isFirstStage, stage, env: account.env };

    const ecsStack = new EcsStack(this, 'Ecs', { ...commonProps });
    new DbStack(this, 'Db', { ...commonProps, ecsStack });
    // Cross-account stack in same stage
    new DnsStack(this, 'Dns', { ...commonProps, account: Account.BEPOWER_MAIN, env: Account.BEPOWER_MAIN.env });
  }
}
```

Key rules:
- `commonProps` shared across all stacks
- Cross-account stacks allowed in same stage (e.g., DNS on BEPOWER_MAIN)
- Dependencies between stacks via `addDependency()` or constructor props
- `isFirstStage`: first stage creates shared resources, subsequent stages import
- Every stack gets an explicit `stackName` (e.g., `${PROJECT_NAME}Resource${capitalCase(stage)}`)

## Route53MainStack (DNS)

Projects with custom domains must include a `Route53MainStack` inside the Stage, deployed cross-account on `Account.BEPOWER_MAIN`:

```typescript
import { Route53Stack } from '@bepower/bep-cdk';
import { Route53MainStack, Account, Department, Level } from '@bepower/bep-cdk-lib';

new Route53MainStack(PROJECT_NAME, [Department.ItDelivery], Level.Middle, this, 'Route53MainStack', {
  ...commonProps,
  account: Account.BEPOWER_MAIN,
  env: Account.BEPOWER_MAIN.env,
  parentDomainName: Route53Stack.getParentDomainName(this.accountBep),
  parentRecordName,
  recordName,
});
```

Use `Route53Stack.getDomainName()` and `Route53Stack.getParentDomainName()` from `@bepower/bep-cdk` to compute domain names.

## Pipeline Pattern

```
bin/app.ts → PipelineStack({ account: DEPLOYMENT, destinationAccount, branch })
  → CodePipeline (self-mutating, GitHub via CodeStar)
  → Wave 1: tests + CodeScan + first stage
  → Wave 2: ManualApprovalStep + second stage
  → addPromoteBeforeUpdatePipeline()
```

- Pipeline in DEPLOYMENT account, deploys to destination
- Dual pipeline: `develop` → noprod, `main` → prod
- GitHub token + Docker credentials from SecretsManager
- Slack/Teams notifications, CodeScan (SonarQube) pre-step

### CodeBuild Node.js version

`STANDARD_7_0` defaults to Node.js 18. Override via `partialBuildSpec` to match the project's engine requirement:

```typescript
codeBuildDefaults: {
  partialBuildSpec: BuildSpec.fromObject({
    phases: { install: { 'runtime-versions': { nodejs: 24 } } },
  }),
  buildEnvironment: { buildImage: LinuxBuildImage.STANDARD_7_0 },
}
```

## Cross-Stack Communication

| Mechanism | When |
|---|---|
| **Props** | Stacks in same Stage (preferred) |
| **Dual export** (CfnOutput + SSM) | Cross-stage or cross-account |

Dual export: `createExports(id, name, value)` creates both CfnOutput and SSM StringParameter.
Naming: `project:resource:attribute:stage` → SSM `/project/resource/attribute/stage`.

## Static Retrieve Pattern

Stacks expose static methods for cross-stack sharing:

- `retrieve*()` — lookup existing resources (fromXxx)
- `get*()` — compute strings (names, export keys)
- `create*()` — create new resources (factory)
- `add*()` — add sidecars/helpers to existing constructs

## NestJS Microservice Structure

```
src/
├── app.module.ts              # Root module
├── main.ts                    # Bootstrap (3 transports)
├── health.controller.ts       # /health endpoint
├── common/                    # Config, base entities, mutex
├── message-broker/            # Redis message broker setup
└── {domain}/                  # One module per business domain
    ├── {domain}.module.ts
    ├── {domain}.service.ts
    ├── controllers/
    │   ├── {name}.event-controller.ts   # Redis events
    │   └── {name}.task-controller.ts    # SQS tasks
    ├── entities/
    │   └── {name}.entity.ts             # TypeORM entities
    └── repositories/
        └── {name}.repository.ts         # TypeORM repositories
```

Three transport layers:
1. **HTTP** (Express) — REST API + health check
2. **Redis Message Broker** — inter-service events
3. **SQS Task Queue** — scheduled/async tasks

## Observability

### Logging
- ECS: Firelens (FluentBit) → Kinesis Firehose → Splunk + CloudWatch backup
- Lambda: JSON format + AWS Powertools structured logging
- Log groups: `/service/project/name/stage`

### Tracing
- OpenTelemetry SDK + Jaeger exporter, loaded via `-r` flag
- OTel collector sidecar in ECS, X-Ray for Lambda

### APM
- Dynatrace OneAgent: Lambda layer + ECS sidecar (all envs)
- DataDog agent: ECS sidecar (prod only, for DBM)

### Health Checks
- HTTP `/health` endpoint
- ECS: `wget` health check, 1-minute start period

## Data & Storage

### Aurora PostgreSQL
- Provisioned via `BeckyDatabaseStack.createDatabase()` factory
- Writer + Reader, RDS Proxy always, storage encrypted
- 3-tier RBAC: `it_cloud_base` (admin), `applications` (CRUD), `viewer` (read-only)
- Secret rotation (multi-user), migrations from S3 via Custom Resource

### Redis (ElastiCache)
- Replication Group, cluster mode, auth token from SecretsManager
- Transit + at-rest encryption, ACL users via Custom Resource
- Prod: multi-AZ, multiple replicas; NoProd: single AZ, minimal

### S3
- `BlockPublicAccess.BLOCK_ALL` always
- Lifecycle rules for temporary data
- KMS or S3-managed encryption

## Security

- **Secrets**: all in SecretsManager, naming `stage/project/service/type`
- **IAM**: least privilege, CDK grant methods (`bucket.grantRead()`)
- **Network**: 3-tier subnets, DB in isolated, dedicated SGs, explicit rules
- **Encryption**: at rest everywhere (RDS, ElastiCache, S3, pipeline artifacts)

## Serverless Patterns

### Lambda
- Shared `commonFunctionProps` (runtime, logging, bundling, tracing)
- AWS Powertools layer (logging, tracing, metrics)
- ESM bundling for newer projects (`OutputFormat.ESM`)

### Custom Resources (Two-Phase)
- `onEventHandler` (fast) + `isCompleteHandler` (slow, does actual work)
- Used for: DB init, Redis ACL, container vulnerability scanning

### Step Functions
- Parallel for independent operations, Map for batch processing
- Error handling via `addCatch`, logging ALL to dedicated LogGroup

### Scheduling
- EventBridge for cron triggers (prod-only guard)
- EventBridge Rules → SQS for periodic tasks

## Naming Conventions

| Resource | Pattern | Example |
|---|---|---|
| Exports | `project:resource:attribute:stage` | `becky:db:session:id:dev` |
| Stack names | `ProjectResource{Stage}` | `BeckyEcsDevelopment` |
| Resources | `project-resource-stage` | `becky-redis-development` |
| Secrets | `stage/project/service/type` | `dev/becky/session/db` |
| Log groups | `/service/project/name/stage` | `/ecs/becky/session/dev` |
| Functions | `project-resource-cr-stage` | `becky-db-cr-development` |
| Construct IDs | PascalCase | `DatabaseSecret` |

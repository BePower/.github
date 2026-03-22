# becky-common — Analysis Notes

## Overview
CDK app for Becky project's shared infrastructure. Depends on `@bepower/bep-cdk` and `@bepower/bep-cdk-lib`.
Manages: ECS cluster, Aurora PostgreSQL, Redis (ElastiCache), DNS, CI/CD pipeline, observability sidecars.

## Architecture Patterns

### 1. Stage-based deployment composition
- `BeckyCommonStage` composes multiple stacks with shared `commonProps`
- Stack ordering via dependencies (ecsStack → dnsStack, databaseStack)
- Cross-account stacks in same stage (MainDnsStack deploys to BEPOWER_MAIN account)

### 2. Static factory methods on stacks (retrieve pattern)
- Stacks expose `static retrieve*()` methods for cross-stack resource sharing
- Examples: `BeckyEcsStack.retrieveCluster()`, `BeckyEcsStack.retrieveNamespace()`, `BeckyDatabaseStack.retrieveSecret()`
- Consumers call these from other stacks without direct stack references
- Naming convention: `retrieve*` for lookups, `get*` for computed strings, `create*` for new resources

### 3. Custom Resources for database/Redis provisioning
- Two-phase pattern: `onEvent` handler (fast, returns data) + `isComplete` handler (slow, does actual work)
- Database CR: creates user, runs SQL scaffolding from S3
- Redis CR: sets up ACL users, generates passwords, stores in SecretsManager
- Inspector CR: validates container image vulnerabilities before deployment

### 4. ECS helper composition (static methods)
- `BeckyEcsStack.addHelpers()` — single call adds all sidecars:
  - Inspector (vulnerability scanning)
  - Firelens (log routing to Kinesis/CloudWatch)
  - OpenTelemetry collector
  - Dynatrace agent (from bep-cdk-lib)
- Each helper is also available individually as static method

### 5. AppConfig integration
- `BeckyEcsStack.addAppConfig()` — creates configuration profile, hosted version, environment, deployment
- First stage creates resources + exports IDs, subsequent stages import them
- Returns `readPolicy` for the consuming service to attach

### 6. Database provisioning pattern
- `BeckyDatabaseStack.createDatabase()` — static factory that creates:
  - Aurora PostgreSQL cluster (writer + reader)
  - Application secret (rotated, multi-user)
  - RDS Proxy
  - Custom Resource for schema initialization
  - Optional migrations from S3
- SQL scaffolding: 3 roles (it_cloud_base, applications, viewer) with proper RBAC
- Event trigger auto-grants permissions on new tables

### 7. Redis provisioning pattern
- ElastiCache Replication Group (cluster mode enabled)
- Auth token from SecretsManager
- Prod: multi-AZ, 2 node groups, 2 replicas each
- NoProd: single AZ, 1 node group, 1 replica
- Custom Resource for ACL user management

## Naming Conventions
- Export names: `project:resource:attribute:stage` (e.g., `becky:db:name:id:development`)
- Stack names: `ProjectResource{Stage}` (e.g., `BeckyEcsDevelopment`)
- Resource names: `project-resource-stage` (e.g., `becky-redis-development`)
- Secret names: `stage/project/service/type` (e.g., `development/becky/name/db`)
- Log groups: `/service/project/name/stage` (e.g., `/ecs/becky/name/development`)
- Function names: `project-resource-cr-stage` (e.g., `becky-db-cr-development`)

## Security Patterns
- Database: 3-tier RBAC (admin, applications, viewer) via PostgreSQL roles
- Database: secret rotation with multi-user strategy
- Database: RDS Proxy for connection pooling + IAM auth
- Redis: auth token + ACL users (admin + per-service)
- Redis: transit encryption + at-rest encryption
- Storage: encrypted at rest (RDS, ElastiCache, S3)
- Network: dedicated security groups per resource type
- Lambda CRs: minimal IAM (specific managed policies + inline)

## Observability Stack
- Firelens (FluentBit) → Kinesis Firehose → Splunk (app logs)
- Firelens (FluentBit) → CloudWatch Logs (backup/debug)
- OpenTelemetry collector sidecar (traces)
- Dynatrace OneAgent sidecar (APM)
- CloudWatch Container Insights on ECS cluster
- CloudWatch Logs for Redis (engine + slow logs)
- CloudWatch Logs for RDS (postgresql logs, 1 month retention)

## Infrastructure Sizing
- Database: m5.xlarge (prod) / t4g.medium (noprod), 7-day backup
- Redis: m7g.large (prod) / t4g.micro (noprod), 10-day snapshots
- Prod: multi-AZ, multiple replicas
- NoProd: single AZ, minimal replicas

## Cross-Stack Communication
- Dual mechanism (CfnOutput + SSM Parameter) inherited from bep-cdk-lib
- `isFirstStage` flag: first stage creates shared resources, subsequent stages import
- Cross-account: MainDnsStack deploys to BEPOWER_MAIN from CPO account

## Pipeline Pattern
- Extends `PipelineStack` from bep-cdk-lib
- Branch-based: `develop` → noprod, `main` → prod
- Two waves: first (dev/preprod) + second (staging/prod) with manual approval
- CDK tests run as pre-step in first wave
- Slack notifications per environment

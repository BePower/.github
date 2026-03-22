# bep-cdk — Analysis Notes

## Overview
Monorepo with 2 packages: `@bepower/bep-cdk` (CDK app) + `@bepower/bep-cdk-lib` (construct library).
Central infrastructure repo — manages DNS, certificates, Kinesis/Splunk, pipelines for ALL BePower AWS accounts.

## Architecture Patterns

### 1. Construct Library mirrors aws-cdk-lib structure
- `bep-cdk-lib` organizes modules like aws-cdk-lib itself:
  - `core/` — base classes (BaseStack, Stack, NestedStack, PipelineStack, Stage)
  - `aws-kinesisfirehose/` — custom processors
  - `aws-kinesisfirehose-destinations/` — Splunk destination
  - `aws-logs-destinations/` — Firehose log destination
  - `aws-sns-subscriptions/` — Kinesis subscription
  - `resources/` — Account, VPC, PipelineBucket factories
  - `misc/` — Dynatrace integration
- Barrel exports via `index.ts` at each module level

### 2. Stack hierarchy with composition via interfaces
- `BaseStack` (abstract) → `Stack` → concrete stacks (Route53Stack, KinesisStack, etc.)
- `NestedStack` — parallel hierarchy for nested stacks
- `PipelineStack` — specialized for CI/CD pipelines
- `Stage` — CDK Stage wrapper with BePower context
- Interfaces for composable behaviors (addendum pattern):
  - `StackAddendumAbac` — departments, level (ABAC tagging)
  - `StackAddendumAccount` — BePower account reference
  - `StackAddendumExport` — cross-stack exports (CfnOutput + SSM Parameter)
  - `StackAddendumProject` — project name tagging
  - `StackAddendumStage` — stage name, isFirstStage
  - `StackAddendumProd` — isProd helper
  - `StackAddendumVpc` — VPC reference
  - `StackAddendum` = all of the above combined

### 3. Account registry (singleton pattern)
- `Account` class with static instances for every AWS account
- Each account knows: project, environment, id, region, domain, VPC config, GitHub connection
- Factory pattern for VPC and PipelineBucket retrieval
- `ResourceRetrievalFactory<T>` / `ResourceRetrievalFactoryStage<T>` interfaces

### 4. Mandatory tagging (ABAC)
- Every stack auto-tags: Project, Department, Environment, EnvironmentName, Level
- Tags applied in constructor via `Tags.of(this).add()`
- Departments and Level are enums

### 5. Cross-stack exports dual mechanism
- `createExports()` creates BOTH CfnOutput AND SSM StringParameter
- `retrieveExport()` can read from either Fn.importValue or SSM
- Colon-separated naming: `project:resource:attribute` → SSM path `/project/resource/attribute`

### 6. Multi-account, multi-stage pipeline
- Pipeline in Deployment account, deploys to all other accounts
- Stages: development → staging → preprod → prod
- Manual approval gates between stages
- Self-mutating pipeline (CDK Pipelines)
- Notifications: Slack + Microsoft Teams channels

### 7. Environment model
- 4 stages: development, staging, preprod, prod
- StageNameEnvironment maps to numeric levels (1, 12, 123, 1234)
- Prod/NoProd domain split: bepower.io / bepower.tech
- Account per project+environment (e.g., CPO_PROD, CPO_NOPROD)

## CDK Best Practices Found

### Construct design
- Custom constructs implement CDK interfaces (IDestination, IDataProcessor, ILogSubscriptionDestination, ITopicSubscription)
- Props interfaces extend CDK props (StackProps & custom addendum)
- Protected methods for internal reuse (createLogGroup, createS3Bucket, createDeliveryStream)
- Static helper methods on stacks (Route53Stack.retrieveCertificate, getDomainName, etc.)

### Testing patterns
- Snapshot-free: uses `Template.fromStack()` + `hasResourceProperties()` assertions
- Shared test helpers in `common-test.ts` — reusable test functions per addendum
- Parameterized tests with `describe.each()` for stage/isFirstStage combinations
- Test class extends abstract base to test it (TestStack extends Stack)
- `expect.assertions(N)` used consistently
- Tests co-located with source in bep-cdk-lib (not in separate test/ dir)

### Naming conventions
- PascalCase for CDK construct IDs
- paramCase for resource names (pipeline names, export names)
- Colon-separated export names
- Stack names match construct IDs

### Security
- Least privilege IAM (specific actions, specific resources)
- S3 BlockPublicAccess.BLOCK_ALL
- KMS encryption for pipeline artifacts
- Cross-account trust via CDK bootstrap qualifier
- Secrets from SecretsManager (never hardcoded)

## Code Style (legacy, pre-@bepower/dev)
- CommonJS (not ESM)
- Jest (not Vitest)
- ESLint + Prettier (not Biome)
- Lerna for monorepo management
- `auto` for releases
- Target ES2018
- Tests co-located with source (bep-cdk-lib) or in test/ dir (bep-cdk)

## Key Types
- `StageName = 'development' | 'staging' | 'preprod' | 'prod'`
- `Department` enum (Afc, Data, ItCloud, ItConsultant, ItDelivery, ItSecurity, Marketing)
- `Level` enum (Admin=1, Privileged=12, High=123, Middle=1234, Low=12345)
- `Project` enum (Bepower, Deployment, Network, Cpo, Mobility, Security, Data, etc.)
- `ProjectEnvironment` enum (Main, Prod, NoProd, ThirdParty)

## Observability
- Dynatrace integration (Lambda layers + ECS sidecar)
- Splunk via Kinesis Firehose (app logs + infra logs)
- CloudWatch log groups with 1-week retention
- API Gateway structured access logs (JSON format with identity, authorizer, WAF fields)

## Infrastructure Patterns
- DNS: delegated hosted zones per account, cross-account delegation
- Certificates: wildcard certs per domain, cross-region (us-east-1) for CloudFront
- VPC: factory pattern, supports both fromLookup and fromVpcAttributes
- 3-tier subnets: public, private (natted), isolated

## Account Taxonomy (to formalize)

Current `ProjectEnvironment` captures only environment (Main/Prod/NoProd/ThirdParty), not account purpose.
The codebase has ad-hoc boolean getters (`isMain`, `isDeployment`, `isNetwork`, `isCpo`, etc.) instead of a structured categorization.

### Proposed: AccountType

| Type | Accounts | Characteristics |
|------|----------|----------------|
| `application` | CPO, MOBILITY, WEBSITES, PLENITUDE | VPC with 3-tier subnets, domain, deploy pipeline, app workloads |
| `data` | DATA | Similar to application but focus on ETL, Kinesis, Splunk pipelines |
| `infrastructure` | NETWORK, DEPLOYMENT, BEPOWER_MAIN | Serve other accounts: DNS root, delegation roles, pipeline artifacts, CIDR management |
| `security` | SECURITY | VPC, audit/compliance focus |
| `third-party` | ASCEND | No VPC, no domain, excluded from bootstrap |

### Benefits
- Replaces ad-hoc `isMain`, `isCpo`, `isDeployment`, `isNetwork` getters with `account.type`
- Bootstrap blacklist becomes category-based instead of hardcoded
- Pipeline department assignment can use account type
- Tagging and IAM policies can be driven by category
- Clearer mental model for new team members

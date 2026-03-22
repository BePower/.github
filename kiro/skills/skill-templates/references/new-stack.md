# Create New Stack in CDK Project

## 1. Detect project structure

Check:
- CDK entry point (`bin/*.ts` or `cdk/bin/*.ts`)
- Existing stacks in `lib/stacks/` or `cdk/lib/stacks/`
- Stage file in `lib/stages/` or `cdk/lib/stages/`
- Constants file with `PROJECT_NAME`
- Whether project uses `@bepower/bep-cdk-lib` base classes

## 2. Determine stack type

Based on what the stack manages:
- **Application stack** → extends `Stack` (needs VPC, stage, isProd)
- **Pipeline stack** → extends `PipelineStack` (needs branch, destinationAccount)
- **Nested stack** → extends `NestedStack` (sub-stack in same account)

## 3. Create stack file

In `lib/stacks/{name}-stack.ts` (or `cdk/lib/stacks/`):

```typescript
import { Department, Level, Stack, StackProps } from '@bepower/bep-cdk-lib';
import { Construct } from 'constructs';

import { PROJECT_NAME } from '../constants';

export class <Name>Stack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(PROJECT_NAME, [Department.<dept>], Level.<level>, scope, id, props);

    // TODO: Add resources
  }
}
```

Use the project's existing `Department` and `Level` values as reference.

## 4. Add to stage

In the stage file, add the new stack with `commonProps`:

```typescript
new <Name>Stack(this, '<Name>Stack', {
  ...commonProps,
  stackName: `<ProjectName><Name>${capitalCase(this.stage)}`,
});
```

If the stack depends on another stack, pass it via props.

## 5. Create test file

```typescript
import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Account } from '@bepower/bep-cdk-lib';

import { <Name>Stack } from '../lib/stacks/<name>-stack';

describe('<Name>Stack', () => {
  it('should create resources', () => {
    const app = new App();
    const stack = new <Name>Stack(app, 'TestStack', {
      account: Account.CPO_NOPROD,
      isFirstStage: true,
      stage: 'development',
    });

    const template = Template.fromStack(stack);
    // Add assertions
  });
});
```

## 6. Naming conventions

- Stack class: `PascalCase` + `Stack` suffix (e.g., `StorageStack`)
- File name: `kebab-case` + `-stack.ts` (e.g., `storage-stack.ts`)
- Stack name (CloudFormation): `ProjectNameResource{Stage}` (e.g., `BeckyStorageDevelopment`)
- Construct IDs: `PascalCase` (e.g., `DatabaseSecret`, `BackupBucket`)
- Resource names: `project-resource-stage` (e.g., `becky-storage-development`)
- Exports: `project:resource:attribute:stage` (e.g., `becky:storage:bucket:arn:development`)

import { Stack, type StackProps } from 'aws-cdk-lib';
import type { Construct } from 'constructs';

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // TODO: Add ECS Fargate service, Aurora DB, Redis, SQS queues
  }
}

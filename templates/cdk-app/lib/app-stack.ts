import { join } from 'node:path';

import { Duration, Stack, type StackProps } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import type { Construct } from 'constructs';

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new NodejsFunction(this, 'HelloFunction', {
      entry: join(__dirname, '..', 'src', 'handlers', 'hello.ts'),
      handler: 'handler',
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.seconds(30),
    });
  }
}

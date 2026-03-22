import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { describe, it } from 'vitest';

import { AppStack } from '../lib/app-stack';

describe('AppStack', () => {
  it('should create a Lambda function', () => {
    const app = new App();
    const stack = new AppStack(app, 'TestStack');
    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::Lambda::Function', {
      Runtime: 'nodejs22.x',
    });
  });
});

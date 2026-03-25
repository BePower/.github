import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { describe, it } from 'vitest';

import { AppStack } from '../lib/app-stack';

describe('AppStack', () => {
  it('should synthesize without errors', () => {
    const app = new App();
    const stack = new AppStack(app, 'TestStack');
    Template.fromStack(stack);
  });
});

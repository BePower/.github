import { App, Stack } from 'aws-cdk-lib';
import { describe, expect, it } from 'vitest';

import { ExampleConstruct } from '../src/index';

describe('ExampleConstruct', () => {
  it('should create with name', () => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');
    const construct = new ExampleConstruct(stack, 'Test', { name: 'test' });

    expect(construct.name).toBe('test');
  });
});

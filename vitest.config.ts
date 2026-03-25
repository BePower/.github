import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['node_modules/**', 'templates/package/cdk/**', 'templates/package/nestjs/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary'],
      include: ['cli/**/*.ts'],
      exclude: ['**/index.ts', '**/types.ts'],
    },
  },
});

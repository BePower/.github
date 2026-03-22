import { describe, expect, it } from 'vitest';

import { DEV_DEPENDENCIES, SCRIPTS } from '../cli/utils/constants.js';

describe('DEV_DEPENDENCIES', () => {
  it('should contain all expected core packages', () => {
    const expected = [
      '@biomejs/biome',
      'lefthook',
      'tsdown',
      'typescript',
      'vitest',
      '@commitlint/cli',
    ];
    for (const pkg of expected) {
      expect(DEV_DEPENDENCIES).toHaveProperty(pkg);
    }
  });

  it('should have semver-compatible version strings', () => {
    for (const [pkg, version] of Object.entries(DEV_DEPENDENCIES)) {
      expect(version, `${pkg} version should start with ^`).toMatch(/^\^/);
    }
  });
});

describe('SCRIPTS', () => {
  it('should contain all expected script names', () => {
    const expected = ['build', 'clean', 'lint', 'lint:format', 'lint:typecheck', 'test', 'prepare'];
    for (const name of expected) {
      expect(SCRIPTS).toHaveProperty(name);
    }
  });

  it('should use biome for formatting', () => {
    expect(SCRIPTS['lint:format']).toContain('biome');
  });

  it('should use tsdown for building', () => {
    expect(SCRIPTS.build).toBe('tsdown');
  });

  it('should use vitest for testing', () => {
    expect(SCRIPTS.test).toContain('vitest');
  });

  it('should use lefthook for prepare', () => {
    expect(SCRIPTS.prepare).toContain('lefthook');
  });
});

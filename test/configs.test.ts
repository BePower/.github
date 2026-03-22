import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  CONFIG_FILES,
  copyConfig,
  copyWorkflows,
  fileExists,
  mergePackageJson,
} from '../cli/utils/configs.js';

let tempDir: string;

beforeEach(async () => {
  tempDir = await import('node:fs/promises').then((fs) => fs.mkdtemp(join(tmpdir(), 'dev-test-')));
});

afterEach(async () => {
  await import('node:fs/promises').then((fs) => fs.rm(tempDir, { recursive: true, force: true }));
});

describe('fileExists', () => {
  it('should return true for existing file', async () => {
    const file = join(tempDir, 'test.txt');
    await writeFile(file, 'hello');
    expect(await fileExists(file)).toBe(true);
  });

  it('should return false for non-existing file', async () => {
    expect(await fileExists(join(tempDir, 'nope.txt'))).toBe(false);
  });
});

describe('copyConfig', () => {
  it('should copy config file to target directory', async () => {
    const file = CONFIG_FILES[0];
    const result = await copyConfig(file, tempDir);

    expect(result).toBe(true);
    expect(await fileExists(join(tempDir, file.dest))).toBe(true);
  });

  it('should not overwrite existing file', async () => {
    const file = CONFIG_FILES[0];
    await writeFile(join(tempDir, file.dest), 'existing');

    const result = await copyConfig(file, tempDir);

    expect(result).toBe(false);
    expect(await readFile(join(tempDir, file.dest), 'utf-8')).toBe('existing');
  });
});

describe('copyWorkflows', () => {
  it('should copy base workflow files', async () => {
    await copyWorkflows('base', tempDir);

    const workflowDir = join(tempDir, '.github/workflows');
    expect(await fileExists(join(workflowDir, 'ci.yml'))).toBe(true);
    expect(await fileExists(join(workflowDir, 'pr.yml'))).toBe(true);
    expect(await fileExists(join(workflowDir, 'security.yml'))).toBe(true);
  });

  it('should place dependabot.yml in .github/ not .github/workflows/', async () => {
    await copyWorkflows('base', tempDir);

    expect(await fileExists(join(tempDir, '.github/dependabot.yml'))).toBe(true);
    expect(await fileExists(join(tempDir, '.github/workflows/dependabot.yml'))).toBe(false);
  });

  it('should not overwrite existing workflow files', async () => {
    const workflowDir = join(tempDir, '.github/workflows');
    await mkdir(workflowDir, { recursive: true });
    await writeFile(join(workflowDir, 'ci.yml'), 'custom');

    await copyWorkflows('base', tempDir);

    expect(await readFile(join(workflowDir, 'ci.yml'), 'utf-8')).toBe('custom');
  });
});

describe('mergePackageJson', () => {
  it('should merge scripts and devDependencies', async () => {
    await writeFile(
      join(tempDir, 'package.json'),
      JSON.stringify({ name: 'test', scripts: { existing: 'cmd' } }),
    );

    await mergePackageJson(tempDir, {
      scripts: { build: 'tsdown' },
      devDependencies: { vitest: '^4.0.0' },
    });

    const pkg = JSON.parse(await readFile(join(tempDir, 'package.json'), 'utf-8'));
    expect(pkg.scripts.existing).toBe('cmd');
    expect(pkg.scripts.build).toBe('tsdown');
    expect(pkg.devDependencies.vitest).toBe('^4.0.0');
  });

  it('should add engines only if not already present', async () => {
    await writeFile(join(tempDir, 'package.json'), JSON.stringify({ name: 'test' }));

    await mergePackageJson(tempDir, { engines: { node: '>= 22' } });

    const pkg = JSON.parse(await readFile(join(tempDir, 'package.json'), 'utf-8'));
    expect(pkg.engines).toEqual({ node: '>= 22' });
  });

  it('should not overwrite existing engines', async () => {
    await writeFile(
      join(tempDir, 'package.json'),
      JSON.stringify({ name: 'test', engines: { node: '>= 20' } }),
    );

    await mergePackageJson(tempDir, { engines: { node: '>= 22' } });

    const pkg = JSON.parse(await readFile(join(tempDir, 'package.json'), 'utf-8'));
    expect(pkg.engines).toEqual({ node: '>= 20' });
  });
});

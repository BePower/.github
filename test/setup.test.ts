import { readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fileExists } from '../cli/utils/configs.js';

let tempDir: string;
let originalCwd: string;

beforeEach(async () => {
  originalCwd = process.cwd();
  const fs = await import('node:fs/promises');
  tempDir = await fs.mkdtemp(join(tmpdir(), 'dev-test-setup-'));
  process.chdir(tempDir);
});

afterEach(async () => {
  process.chdir(originalCwd);
  vi.restoreAllMocks();
  await import('node:fs/promises').then((fs) => fs.rm(tempDir, { recursive: true, force: true }));
});

describe('setup command', () => {
  it('should exit with error if no package.json exists', async () => {
    vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit');
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { setup } = await import('../cli/commands/setup.js');
    await expect(setup.parseAsync([], { from: 'user' })).rejects.toThrow('process.exit');

    expect(console.error).toHaveBeenCalledWith(
      'package.json not found. Run this in a project directory.',
    );
  });

  it('should copy configs and merge package.json', async () => {
    await writeFile(join(tempDir, 'package.json'), JSON.stringify({ name: 'test', scripts: {} }));
    vi.spyOn(console, 'log').mockImplementation(() => {});

    const { setup } = await import('../cli/commands/setup.js');
    await setup.parseAsync([], { from: 'user' });

    expect(await fileExists(join(tempDir, 'biome.json'))).toBe(true);
    expect(await fileExists(join(tempDir, '.editorconfig'))).toBe(true);
    expect(await fileExists(join(tempDir, 'lefthook.yml'))).toBe(true);
    expect(await fileExists(join(tempDir, '.npmrc'))).toBe(true);
    expect(await fileExists(join(tempDir, '.github/workflows/ci.yml'))).toBe(true);

    const pkg = JSON.parse(await readFile(join(tempDir, 'package.json'), 'utf-8'));
    expect(pkg.scripts.build).toBe('tsdown');
    expect(pkg.devDependencies).toHaveProperty('vitest');
    expect(pkg.engines).toEqual({ node: '>= 22' });
  });

  it('should not overwrite existing config files', async () => {
    await writeFile(join(tempDir, 'package.json'), JSON.stringify({ name: 'test', scripts: {} }));
    await writeFile(join(tempDir, 'biome.json'), 'custom');
    const mockLog = vi.spyOn(console, 'log').mockImplementation(() => {});

    const { setup } = await import('../cli/commands/setup.js');
    await setup.parseAsync([], { from: 'user' });

    expect(await readFile(join(tempDir, 'biome.json'), 'utf-8')).toBe('custom');
    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('· biome.json (exists)'));
  });
});

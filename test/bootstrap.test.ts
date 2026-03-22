import { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fileExists } from '../cli/utils/configs.js';

let tempDir: string;

beforeEach(async () => {
  const fs = await import('node:fs/promises');
  tempDir = await fs.mkdtemp(join(tmpdir(), 'dev-test-bootstrap-'));
});

afterEach(async () => {
  vi.restoreAllMocks();
  await import('node:fs/promises').then((fs) => fs.rm(tempDir, { recursive: true, force: true }));
});

vi.mock('node:child_process', () => ({
  exec: vi.fn((_cmd: string, cb: (err: null, result: { stdout: string }) => void) => {
    cb(null, { stdout: '' });
  }),
}));

describe('bootstrap command', () => {
  it('should scaffold a single project with configs', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(tempDir);
    vi.spyOn(console, 'log').mockImplementation(() => {});

    const { bootstrap } = await import('../cli/commands/bootstrap.js');
    await bootstrap.parseAsync(['@bepower/test-lib'], { from: 'user' });

    expect(await fileExists(join(tempDir, 'package.json'))).toBe(true);
    expect(await fileExists(join(tempDir, 'biome.json'))).toBe(true);
    expect(await fileExists(join(tempDir, 'lefthook.yml'))).toBe(true);
    expect(await fileExists(join(tempDir, '.npmrc'))).toBe(true);

    const gitignore = await readFile(join(tempDir, '.gitignore'), 'utf-8');
    expect(gitignore).toContain('dist/');
    expect(gitignore).toContain('node_modules/');
    expect(gitignore).not.toContain('cdk.out');

    const pkg = JSON.parse(await readFile(join(tempDir, 'package.json'), 'utf-8'));
    expect(pkg.devDependencies).toHaveProperty('vitest');
    expect(pkg.homepage).toContain('test-lib');
    expect(pkg.publishConfig).toEqual({ registry: 'https://npm.pkg.github.com' });
  });

  it('should exclude tsdown and tsconfig for cdk-app type', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(tempDir);
    vi.spyOn(console, 'log').mockImplementation(() => {});

    const { bootstrap } = await import('../cli/commands/bootstrap.js');
    await bootstrap.parseAsync(['@bepower/my-cdk', '-t', 'cdk-app'], { from: 'user' });

    const pkg = JSON.parse(await readFile(join(tempDir, 'package.json'), 'utf-8'));
    expect(pkg.devDependencies).not.toHaveProperty('tsdown');
    expect(pkg.devDependencies).not.toHaveProperty('@tsconfig/node22');

    const gitignore = await readFile(join(tempDir, '.gitignore'), 'utf-8');
    expect(gitignore).toContain('cdk.out');

    expect(pkg.publishConfig).toBeUndefined();
  });

  it('should handle name without scope', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(tempDir);
    vi.spyOn(console, 'log').mockImplementation(() => {});

    const { bootstrap } = await import('../cli/commands/bootstrap.js');
    await bootstrap.parseAsync(['my-tool'], { from: 'user' });

    const pkg = JSON.parse(await readFile(join(tempDir, 'package.json'), 'utf-8'));
    expect(pkg.homepage).toBe('https://github.com/BePower/my-tool#readme');
    expect(pkg.repository.url).toBe('git+https://github.com/BePower/my-tool.git');
  });

  it('should exit with error for invalid type', async () => {
    vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit');
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { bootstrap } = await import('../cli/commands/bootstrap.js');
    await expect(
      bootstrap.parseAsync(['@bepower/test', '-t', 'invalid'], { from: 'user' }),
    ).rejects.toThrow('process.exit');

    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Invalid type: invalid'));
  });
});

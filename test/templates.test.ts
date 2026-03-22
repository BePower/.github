import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { copyTemplate } from '../cli/utils/templates.js';

let tempDir: string;
let srcDir: string;

beforeEach(async () => {
  const fs = await import('node:fs/promises');
  tempDir = await fs.mkdtemp(join(tmpdir(), 'dev-test-'));
  srcDir = join(tempDir, 'src');
  await mkdir(srcDir, { recursive: true });
});

afterEach(async () => {
  await import('node:fs/promises').then((fs) => fs.rm(tempDir, { recursive: true, force: true }));
});

describe('copyTemplate', () => {
  it('should copy files with variable substitution', async () => {
    await writeFile(join(srcDir, 'readme.md'), '# {{name}}\n\nBy {{author}}');
    const destDir = join(tempDir, 'dest');
    await mkdir(destDir);

    await copyTemplate(srcDir, destDir, { name: '@bepower/test', author: 'BePower' });

    const content = await readFile(join(destDir, 'readme.md'), 'utf-8');
    expect(content).toBe('# @bepower/test\n\nBy BePower');
  });

  it('should recursively copy directories', async () => {
    await mkdir(join(srcDir, 'sub'), { recursive: true });
    await writeFile(join(srcDir, 'sub/file.ts'), 'export const pkg = "{{name}}";');
    const destDir = join(tempDir, 'dest');
    await mkdir(destDir);

    await copyTemplate(srcDir, destDir, { name: 'my-pkg' });

    const content = await readFile(join(destDir, 'sub/file.ts'), 'utf-8');
    expect(content).toBe('export const pkg = "my-pkg";');
  });

  it('should leave content unchanged when no vars match', async () => {
    await writeFile(join(srcDir, 'plain.txt'), 'no variables here');
    const destDir = join(tempDir, 'dest');
    await mkdir(destDir);

    await copyTemplate(srcDir, destDir, { name: 'test' });

    const content = await readFile(join(destDir, 'plain.txt'), 'utf-8');
    expect(content).toBe('no variables here');
  });
});

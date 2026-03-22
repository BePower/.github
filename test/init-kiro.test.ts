import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fileExists } from '../cli/utils/configs.js';

let tempDir: string;

vi.mock('node:os', async (importOriginal) => {
  const original = await importOriginal<typeof import('node:os')>();
  return { ...original, homedir: vi.fn(() => original.homedir()) };
});

beforeEach(async () => {
  const fs = await import('node:fs/promises');
  tempDir = await fs.mkdtemp(join(tmpdir(), 'dev-test-kiro-'));
});

afterEach(async () => {
  vi.restoreAllMocks();
  await import('node:fs/promises').then((fs) => fs.rm(tempDir, { recursive: true, force: true }));
});

describe('init-kiro command', () => {
  it('should copy agent, prompt, and skills to home .kiro directory', async () => {
    const os = await import('node:os');
    vi.mocked(os.homedir).mockReturnValue(tempDir);
    vi.spyOn(console, 'log').mockImplementation(() => {});

    const { initKiro } = await import('../cli/commands/init-kiro.js');
    await initKiro.parseAsync([], { from: 'user' });

    const kiroDir = join(tempDir, '.kiro');
    expect(await fileExists(join(kiroDir, 'agents/bepower-setup.json'))).toBe(true);
    expect(await fileExists(join(kiroDir, 'prompts/bepower-setup.md'))).toBe(true);
    expect(await fileExists(join(kiroDir, 'skills/bepower-dev'))).toBe(true);
  });
});

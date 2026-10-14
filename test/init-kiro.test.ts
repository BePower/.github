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
  it('should install all agents, prompts, skills, and hooks', async () => {
    const os = await import('node:os');
    vi.mocked(os.homedir).mockReturnValue(tempDir);
    vi.spyOn(console, 'log').mockImplementation(() => {});

    const { initKiro } = await import('../cli/commands/init-kiro.js');
    await initKiro.parseAsync([], { from: 'user' });

    const kiroDir = join(tempDir, '.kiro');

    // Agents
    expect(await fileExists(join(kiroDir, 'agents/potr-setup.json'))).toBe(true);
    expect(await fileExists(join(kiroDir, 'agents/potr-functional-analyst.json'))).toBe(true);
    expect(await fileExists(join(kiroDir, 'agents/potr-upgrade-guardian.json'))).toBe(true);
    expect(await fileExists(join(kiroDir, 'agents/potr-rev-eng.json'))).toBe(true);

    // Prompts
    expect(await fileExists(join(kiroDir, 'prompts/potr-setup.md'))).toBe(true);
    expect(await fileExists(join(kiroDir, 'prompts/potr-functional-analyst.md'))).toBe(true);
    expect(await fileExists(join(kiroDir, 'prompts/potr-upgrade-guardian.md'))).toBe(true);
    expect(await fileExists(join(kiroDir, 'prompts/potr-rev-eng.md'))).toBe(true);

    // Resources
    expect(await fileExists(join(kiroDir, 'resources/potr-functional-analyst'))).toBe(true);

    // Skills
    expect(await fileExists(join(kiroDir, 'skills/bepower-dev'))).toBe(true);

    // Hooks
    expect(await fileExists(join(kiroDir, 'hooks/safety-gate.md'))).toBe(true);
    expect(await fileExists(join(kiroDir, 'hooks/context-injection.md'))).toBe(true);
    expect(await fileExists(join(kiroDir, 'hooks/barrel-export.md'))).toBe(true);
    expect(await fileExists(join(kiroDir, 'hooks/post-task-summary.md'))).toBe(true);
  });
});

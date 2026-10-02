import { afterEach, describe, expect, it, vi } from 'vitest';

// Mock child_process so the command never shells out to a real `kirocrew`.
const execMock = vi.hoisted(() => vi.fn());
vi.mock('node:child_process', () => ({ exec: execMock }));

/**
 * promisify(exec) resolves with { stdout, stderr }. Our mock speaks the
 * callback signature promisify expects: (cmd, cb) => cb(err, { stdout }).
 */
function mockExec(handler: (cmd: string) => { stdout: string } | Error): void {
  execMock.mockImplementation(
    (cmd: string, cb: (err: Error | null, out?: { stdout: string; stderr: string }) => void) => {
      const result = handler(cmd);
      if (result instanceof Error) cb(result);
      else cb(null, { stdout: result.stdout, stderr: '' });
    },
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  execMock.mockReset();
});

describe('init-crew command', () => {
  it('creates crew members for each agent template when none exist', async () => {
    const created: string[] = [];
    mockExec((cmd) => {
      if (cmd.includes('--version')) return { stdout: 'kirocrew 1.0.0' };
      if (cmd.includes('agent list')) return { stdout: 'NAME\ndefault *\n' };
      if (cmd.includes('agent create')) {
        const name = /--name '?([^' ]+)'?/.exec(cmd)?.[1] ?? '';
        created.push(name);
        return { stdout: `Created agent: ${name}` };
      }
      return { stdout: '' };
    });
    vi.spyOn(console, 'log').mockImplementation(() => {});

    const { bootstrapCrew } = await import('../cli/commands/init-crew.js');
    const ran = await bootstrapCrew();

    expect(ran).toBe(true);
    expect(created).toEqual(['upgrade-guardian', 'rev-eng', 'bepower-setup', 'functional-analyst']);
  });

  it('skips members that already exist (idempotent)', async () => {
    const created: string[] = [];
    mockExec((cmd) => {
      if (cmd.includes('--version')) return { stdout: 'kirocrew 1.0.0' };
      if (cmd.includes('agent list')) {
        return { stdout: 'NAME\nupgrade-guardian\nrev-eng\nbepower-setup\nfunctional-analyst\n' };
      }
      if (cmd.includes('agent create')) {
        created.push(/--name '?([^' ]+)'?/.exec(cmd)?.[1] ?? '');
        return { stdout: 'Created' };
      }
      return { stdout: '' };
    });
    vi.spyOn(console, 'log').mockImplementation(() => {});

    const { bootstrapCrew } = await import('../cli/commands/init-crew.js');
    const ran = await bootstrapCrew();

    expect(ran).toBe(true);
    expect(created).toEqual([]); // all already present -> none created
  });

  it('returns false and does not throw when kirocrew is not installed', async () => {
    mockExec((cmd) => {
      if (cmd.includes('--version')) return new Error('command not found: kirocrew');
      return { stdout: '' };
    });
    vi.spyOn(console, 'log').mockImplementation(() => {});

    const { bootstrapCrew } = await import('../cli/commands/init-crew.js');
    const ran = await bootstrapCrew();

    expect(ran).toBe(false);
  });
});

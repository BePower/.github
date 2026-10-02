import { exec } from 'node:child_process';
import { promisify } from 'node:util';

import { Command } from '@commander-js/extra-typings';

const execAsync = promisify(exec);

/**
 * The Kiro agent templates (installed by `init-kiro` into `~/.kiro/agents/`)
 * that we want surfaced as selectable KiroCrew members in the dashboard.
 *
 * `init-kiro` already copies these JSON specs; KiroCrew reads agent templates
 * from the same `~/.kiro/agents/` directory, so each one only needs a crew
 * member bound to it (`kirocrew agent create --kiro-agent <template>`).
 */
const CREW_AGENTS = ['upgrade-guardian', 'rev-eng', 'bepower-setup', 'functional-analyst'] as const;

const CREW_WORKSPACE = 'default';

/** True when the `kirocrew` binary is resolvable on PATH. */
async function isKiroCrewInstalled(): Promise<boolean> {
  try {
    await execAsync('kirocrew --version');
    return true;
  } catch {
    return false;
  }
}

/** Names of crew members that already exist, parsed from `kirocrew agent list`. */
async function existingMembers(): Promise<Set<string>> {
  const { stdout } = await execAsync('kirocrew agent list');
  const names = stdout
    .split('\n')
    .slice(1) // drop the header row
    .map((line) => line.trim().split(/\s+/)[0])
    .filter((name): name is string => Boolean(name) && name !== 'NAME');
  // The active member is marked with a trailing ` *` -> strip it.
  return new Set(names.map((name) => name.replace(/\*$/, '')));
}

/**
 * Create the KiroCrew members bound to the installed agent templates.
 * Idempotent: members that already exist are skipped, not re-created.
 * Returns true when the bootstrap ran (KiroCrew present), false otherwise.
 */
export async function bootstrapCrew(): Promise<boolean> {
  if (!(await isKiroCrewInstalled())) {
    console.log('ℹ KiroCrew is not installed (no `kirocrew` on PATH) — skipping crew bootstrap.');
    console.log(
      '  Install it from https://github.com/kirodotdev/KiroCrew, then run `dev init-crew`.',
    );
    return false;
  }

  let present: Set<string>;
  try {
    present = await existingMembers();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`✗ Could not read existing crew members (\`kirocrew agent list\`): ${message}`);
    return false;
  }

  for (const agent of CREW_AGENTS) {
    if (present.has(agent)) {
      console.log(`  • ${agent} — already a crew member, skipped`);
      continue;
    }
    try {
      await execAsync(
        `kirocrew agent create --name '${agent}' --kiro-agent '${agent}' --workspace '${CREW_WORKSPACE}'`,
      );
      console.log(`  ✓ ${agent} — crew member created`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      // Treat an "already exists" race as success; surface anything else.
      if (message.includes('already exists')) {
        console.log(`  • ${agent} — already a crew member, skipped`);
      } else {
        console.error(`  ✗ ${agent} — failed: ${message}`);
      }
    }
  }

  console.log('\n✓ KiroCrew members ready. Open the dashboard agent picker to select one.');
  return true;
}

export const initCrew = new Command()
  .name('init-crew')
  .description('Register the installed Kiro agents as selectable KiroCrew dashboard members')
  .action(async () => {
    try {
      console.log('Initializing KiroCrew members from installed agent templates…\n');
      await bootstrapCrew();
    } catch (error) {
      console.error(
        `✗ Failed to initialize KiroCrew: ${error instanceof Error ? error.message : String(error)}`,
      );
      process.exitCode = 1;
    }
  });

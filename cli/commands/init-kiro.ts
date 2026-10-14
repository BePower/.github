import { cp, mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';

import { Command } from '@commander-js/extra-typings';

import { paths } from '../utils/paths.js';
import { bootstrapCrew } from './init-crew.js';

/**
 * Ask a yes/no question on an interactive TTY. In a non-interactive context
 * (CI, piped stdin) there is nobody to answer, so default to `false` and skip
 * the prompt rather than blocking.
 */
async function confirm(question: string): Promise<boolean> {
  if (!process.stdin.isTTY) return false;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = (await rl.question(`${question} `)).trim().toLowerCase();
    return answer === 'y' || answer === 'yes';
  } finally {
    rl.close();
  }
}

export const initKiro = new Command()
  .name('init-kiro')
  .description('Install Kiro agents globally for AI-assisted project configuration')
  .action(async () => {
    try {
      const home = homedir();
      const kiroDir = join(home, '.kiro');

      // Agents
      await mkdir(join(kiroDir, 'agents'), { recursive: true });
      await cp(join(paths.kiro, 'agents/potr-setup.json'), join(kiroDir, 'agents/potr-setup.json'));
      await cp(
        join(paths.kiro, 'agents/potr-functional-analyst.json'),
        join(kiroDir, 'agents/potr-functional-analyst.json'),
      );
      await cp(
        join(paths.kiro, 'agents/potr-upgrade-guardian.json'),
        join(kiroDir, 'agents/potr-upgrade-guardian.json'),
      );
      await cp(
        join(paths.kiro, 'agents/potr-rev-eng.json'),
        join(kiroDir, 'agents/potr-rev-eng.json'),
      );

      // Prompts
      await mkdir(join(kiroDir, 'prompts'), { recursive: true });
      await cp(join(paths.kiro, 'prompts/potr-setup.md'), join(kiroDir, 'prompts/potr-setup.md'));
      await cp(
        join(paths.kiro, 'prompts/potr-functional-analyst.md'),
        join(kiroDir, 'prompts/potr-functional-analyst.md'),
      );
      await cp(
        join(paths.kiro, 'prompts/potr-upgrade-guardian.md'),
        join(kiroDir, 'prompts/potr-upgrade-guardian.md'),
      );
      await cp(
        join(paths.kiro, 'prompts/potr-rev-eng.md'),
        join(kiroDir, 'prompts/potr-rev-eng.md'),
      );

      // Resources (potr-functional-analyst templates)
      await cp(join(paths.kiro, 'resources'), join(kiroDir, 'resources'), { recursive: true });

      // Skills (bepower-dev workflow skills)
      const skillsDest = join(kiroDir, 'skills/bepower-dev');
      await cp(join(paths.kiro, 'skills'), skillsDest, { recursive: true });

      // Copy steering files as skill references (source of truth: kiro/steering/)
      await cp(join(paths.kiro, 'steering'), join(skillsDest, 'steering-templates/references'), {
        recursive: true,
      });

      // Hooks (safety gate, barrel export, context injection, post-task summary)
      await mkdir(join(kiroDir, 'hooks'), { recursive: true });
      await cp(join(paths.kiro, 'hooks'), join(kiroDir, 'hooks'), { recursive: true });

      console.log('✓ Kiro agents installed globally');
      console.log(`\n  Agents:`);
      console.log(`    ${join(kiroDir, 'agents/potr-setup.json')}`);
      console.log(`    ${join(kiroDir, 'agents/potr-functional-analyst.json')}`);
      console.log(`  Prompts: ${join(kiroDir, 'prompts/')}`);
      console.log(`  Skills:  ${skillsDest}/`);
      console.log(`  Hooks:   ${join(kiroDir, 'hooks/')}`);
      console.log('\nAvailable agents:');
      console.log('  • potr-setup — Generate .kiro/ config for a project');
      console.log('  • potr-functional-analyst — Interactive requirements gathering (Italian)');
      console.log(
        '  • potr-upgrade-guardian — Assess dependency/framework upgrade safety (read-only)',
      );
      console.log('  • potr-rev-eng — Reverse-engineer a web app API via Playwright (read-only)');

      // Offer to also wire these agents into KiroCrew (dashboard members).
      // Only prompts on an interactive TTY; non-interactive runs skip silently.
      const wantsCrew = await confirm('\nAlso initialize KiroCrew with these agents? (y/N)');
      if (wantsCrew) {
        console.log('');
        await bootstrapCrew();
      } else {
        console.log(
          '\nTip: run `dev init-crew` later to register these agents as KiroCrew members.',
        );
      }
    } catch (error) {
      console.error(
        `✗ Failed to install Kiro agents: ${error instanceof Error ? error.message : String(error)}`,
      );
      process.exitCode = 1;
    }
  });

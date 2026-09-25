import { cp, mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';

import { Command } from '@commander-js/extra-typings';

import { paths } from '../utils/paths.js';

export const initKiro = new Command()
  .name('init-kiro')
  .description('Install Kiro agents globally for AI-assisted project configuration')
  .action(async () => {
    const home = homedir();
    const kiroDir = join(home, '.kiro');

    // Agents
    await mkdir(join(kiroDir, 'agents'), { recursive: true });
    await cp(
      join(paths.kiro, 'agents/bepower-setup.json'),
      join(kiroDir, 'agents/bepower-setup.json'),
    );
    await cp(
      join(paths.kiro, 'agents/functional-analyst.json'),
      join(kiroDir, 'agents/functional-analyst.json'),
    );
    await cp(
      join(paths.kiro, 'agents/upgrade-guardian.json'),
      join(kiroDir, 'agents/upgrade-guardian.json'),
    );
    await cp(join(paths.kiro, 'agents/rev-eng.json'), join(kiroDir, 'agents/rev-eng.json'));

    // Prompts
    await mkdir(join(kiroDir, 'prompts'), { recursive: true });
    await cp(
      join(paths.kiro, 'prompts/bepower-setup.md'),
      join(kiroDir, 'prompts/bepower-setup.md'),
    );
    await cp(
      join(paths.kiro, 'prompts/functional-analyst.md'),
      join(kiroDir, 'prompts/functional-analyst.md'),
    );
    await cp(
      join(paths.kiro, 'prompts/upgrade-guardian.md'),
      join(kiroDir, 'prompts/upgrade-guardian.md'),
    );
    await cp(join(paths.kiro, 'prompts/rev-eng.md'), join(kiroDir, 'prompts/rev-eng.md'));

    // Resources (functional-analyst templates)
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
    console.log(`    ${join(kiroDir, 'agents/bepower-setup.json')}`);
    console.log(`    ${join(kiroDir, 'agents/functional-analyst.json')}`);
    console.log(`  Prompts: ${join(kiroDir, 'prompts/')}`);
    console.log(`  Skills:  ${skillsDest}/`);
    console.log(`  Hooks:   ${join(kiroDir, 'hooks/')}`);
    console.log('\nAvailable agents:');
    console.log('  • bepower-setup — Generate .kiro/ config for a project');
    console.log('  • functional-analyst — Interactive requirements gathering (Italian)');
    console.log('  • upgrade-guardian — Assess dependency/framework upgrade safety (read-only)');
    console.log('  • rev-eng — Reverse-engineer a web app API via Playwright (read-only)');
  });

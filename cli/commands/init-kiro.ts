import { cp, mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';

import { Command } from '@commander-js/extra-typings';

import { paths } from '../utils/paths.js';

export const initKiro = new Command()
  .name('init-kiro')
  .description('Install the bepower-setup agent globally for Kiro-powered project configuration')
  .action(async () => {
    const home = homedir();
    const kiroDir = join(home, '.kiro');

    await mkdir(join(kiroDir, 'agents'), { recursive: true });
    await cp(
      join(paths.kiro, 'agents/bepower-setup.json'),
      join(kiroDir, 'agents/bepower-setup.json'),
    );

    await mkdir(join(kiroDir, 'prompts'), { recursive: true });
    await cp(
      join(paths.kiro, 'prompts/bepower-setup.md'),
      join(kiroDir, 'prompts/bepower-setup.md'),
    );

    const skillsDest = join(kiroDir, 'skills/bepower-dev');
    await cp(join(paths.kiro, 'skills'), skillsDest, { recursive: true });

    // Copy steering files as skill references (source of truth: kiro/steering/)
    await cp(join(paths.kiro, 'steering'), join(skillsDest, 'steering-templates/references'), {
      recursive: true,
    });

    console.log('✓ bepower-setup agent installed globally');
    console.log(`\n  Agent:  ${join(kiroDir, 'agents/bepower-setup.json')}`);
    console.log(`  Prompt: ${join(kiroDir, 'prompts/bepower-setup.md')}`);
    console.log(`  Skills: ${skillsDest}/`);
    console.log('\nTo configure a project:');
    console.log('  1. Run: kiro-cli chat');
    console.log('  2. Use: /agent swap bepower-setup');
  });

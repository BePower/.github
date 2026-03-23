import { Command } from '@commander-js/extra-typings';

import {
  CONFIG_FILES,
  copyConfig,
  copyWorkflows,
  fileExists,
  mergePackageJson,
} from '../utils/configs.js';
import { DEV_DEPENDENCIES, SCRIPTS } from '../utils/constants.js';

export const setup = new Command()
  .name('setup')
  .description('Add standard configuration to an existing project')
  .option('-f, --force', 'Overwrite existing config files')
  .action(async (options) => {
    const cwd = process.cwd();
    const force = options.force ?? false;

    if (!(await fileExists('package.json'))) {
      console.error('package.json not found. Run this in a project directory.');
      process.exit(1);
    }

    if (force) {
      console.log('Force mode: overwriting existing configs\n');
    }

    for (const file of CONFIG_FILES) {
      const copied = await copyConfig(file, cwd, force);
      if (copied) {
        console.log(force ? `  ↻ ${file.dest} (updated)` : `  ✓ ${file.dest}`);
      } else {
        console.log(`  · ${file.dest} (exists)`);
      }
    }

    await mergePackageJson(cwd, {
      scripts: SCRIPTS,
      devDependencies: DEV_DEPENDENCIES,
      engines: { node: '>= 22' },
    });
    console.log('  ✓ package.json (deps + scripts merged)');

    await copyWorkflows('base', cwd, force);
    console.log('  ✓ .github/workflows/ (base)');

    console.log('\n✓ Setup complete!');
    console.log('\nNext: run `dev init-kiro` to set up AI-assisted development.');
  });

import { exec } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { Command } from '@commander-js/extra-typings';

import { copyConfig, copyWorkflows, getConfigFiles, mergePackageJson } from '../utils/configs.js';
import { DEV_DEPENDENCIES, SCRIPTS } from '../utils/constants.js';
import { paths } from '../utils/paths.js';
import { copyTemplate } from '../utils/templates.js';

const execAsync = promisify(exec);

const SINGLE_TEMPLATES = ['lib', 'cdk', 'nestjs'] as const;

export const bootstrap = new Command()
  .name('bootstrap')
  .description('Bootstrap a new project with standard configuration')
  .argument('[name]', 'Package name', '@bepower/new-package')
  .option('--monorepo', 'Create a monorepo with workspaces')
  .option('-t, --template <template>', `Single project template: ${SINGLE_TEMPLATES.join(', ')}`)
  .action(async (name, options) => {
    const isMonorepo = options.monorepo ?? false;

    if (!isMonorepo && !options.template) {
      console.error(
        `--template is required for single projects. Valid: ${SINGLE_TEMPLATES.join(', ')}`,
      );
      process.exit(1);
    }

    if (isMonorepo && options.template) {
      console.error(
        '--monorepo and --template are mutually exclusive. Use `dev add` to add packages to a monorepo.',
      );
      process.exit(1);
    }

    if (
      options.template &&
      !SINGLE_TEMPLATES.includes(options.template as (typeof SINGLE_TEMPLATES)[number])
    ) {
      console.error(`Invalid template: ${options.template}. Valid: ${SINGLE_TEMPLATES.join(', ')}`);
      process.exit(1);
    }

    const scope = name.includes('/') ? name.split('/')[0] : '';
    const repoName = name.includes('/') ? name.split('/')[1] : name;

    const vars: Record<string, string> = {
      name,
      scope,
      description: '',
      author: 'BePower',
      homepage: `https://github.com/BePower/${repoName}#readme`,
      bugs: `https://github.com/BePower/${repoName}/issues`,
      repository: `git+https://github.com/BePower/${repoName}.git`,
    };

    const cwd = process.cwd();
    const rootType = isMonorepo ? 'monorepo' : 'single';
    await copyTemplate(join(paths.templates, 'root', rootType), cwd, vars);

    if (!isMonorepo && options.template) {
      // For single projects, overlay the package template at root
      const templateVars = { ...vars, path: '.' };
      await copyTemplate(join(paths.templates, 'package', options.template), cwd, templateVars);

      // Merge template package.json into root package.json
      const rootPkg = JSON.parse(await readFile(join(cwd, 'package.json'), 'utf-8'));
      const tplPkgPath = join(paths.templates, 'package', options.template, 'package.json');
      let tplPkgContent = await readFile(tplPkgPath, 'utf-8');
      for (const [key, value] of Object.entries(templateVars)) {
        tplPkgContent = tplPkgContent.replaceAll(`{{${key}}}`, value);
      }
      const tplPkg = JSON.parse(tplPkgContent);
      const merged = {
        ...rootPkg,
        ...tplPkg,
        scripts: { ...rootPkg.scripts, ...tplPkg.scripts },
        dependencies: { ...rootPkg.dependencies, ...tplPkg.dependencies },
        devDependencies: { ...rootPkg.devDependencies, ...tplPkg.devDependencies },
      };
      await writeFile(join(cwd, 'package.json'), `${JSON.stringify(merged, null, 2)}\n`);
    }

    const isCdk = options.template === 'cdk';
    const isNestjs = options.template === 'nestjs';
    const skipGoldenConfigs = isCdk || isNestjs;

    // Copy golden configs (skip tsconfig/tsdown for cdk/nestjs — they have their own)
    const configFiles = getConfigFiles({ workspace: isMonorepo });
    for (const file of configFiles) {
      if (skipGoldenConfigs && ['tsconfig.json', 'tsdown.config.ts'].includes(file.dest)) continue;
      await copyConfig(file, cwd);
    }

    // Merge devDependencies and scripts
    const devDeps = { ...DEV_DEPENDENCIES };
    if (isCdk || isNestjs) {
      delete devDeps.tsdown;
      delete devDeps['@tsconfig/node22'];
    }
    await mergePackageJson(cwd, {
      scripts: SCRIPTS,
      devDependencies: devDeps,
    });

    await copyWorkflows('base', cwd);

    const gitignoreLines = [
      'dist/',
      'node_modules/',
      'coverage/',
      '*.lcov',
      '*.tsbuildinfo',
      '*.log',
      '.env',
      '.env.*',
      '!.env.example',
    ];
    if (isCdk || isNestjs) {
      gitignoreLines.push('cdk.out');
    }
    await writeFile(join(cwd, '.gitignore'), `${gitignoreLines.join('\n')}\n`);

    console.log('Installing dependencies...');
    await execAsync('npm install');

    console.log('Initializing git...');
    await execAsync('git init && git add . && git commit -m "chore: initial commit"');

    const label = isMonorepo ? 'monorepo' : options.template;
    console.log(`\n✓ Project bootstrapped! (${label})`);
    if (isMonorepo) {
      console.log('\nNext: run `dev add <path> --template <type>` to add packages.');
    }
    console.log('Then: run `dev init-kiro` to set up AI-assisted development.');
  });

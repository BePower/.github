import { exec } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { Command } from '@commander-js/extra-typings';

import { CONFIG_FILES, copyConfig, copyWorkflows } from '../utils/configs.js';
import { paths } from '../utils/paths.js';
import { copyTemplate } from '../utils/templates.js';

const execAsync = promisify(exec);

const DEV_DEPENDENCIES: Record<string, string> = {
  '@biomejs/biome': '^2.4.8',
  '@commitlint/cli': '^20.5.0',
  '@commitlint/config-conventional': '^20.5.0',
  '@tsconfig/node22': '^22.0.5',
  '@types/node': '^25.5.0',
  '@vitest/coverage-v8': '^4.1.0',
  bonvoy: '^0.13.1',
  concurrently: '^9.2.1',
  lefthook: '^2.1.4',
  'lockfile-lint': '^5.0.0',
  'ls-engines': '^0.10.0',
  'npm-package-json-lint': '^9.1.0',
  rimraf: '^6.1.3',
  'sort-package-json': '^3.6.1',
  tsdown: '^0.21.4',
  typescript: '^5.9.3',
  vitest: '^4.1.0',
};

const VALID_TYPES = ['single', 'monorepo', 'cdk-app', 'cdk-lib', 'ecs-microservice'] as const;

export const bootstrap = new Command()
  .name('bootstrap')
  .description('Bootstrap a new project with standard configuration')
  .argument('[name]', 'Package name', '@bepower/new-package')
  .option('-t, --type <type>', `Project type: ${VALID_TYPES.join(', ')}`, 'single')
  .action(async (name, options) => {
    if (!VALID_TYPES.includes(options.type as (typeof VALID_TYPES)[number])) {
      console.error(`Invalid type: ${options.type}. Valid types: ${VALID_TYPES.join(', ')}`);
      process.exit(1);
    }

    const scope = name.includes('/') ? name.split('/')[0] : '';
    const repoName = name.includes('/') ? name.split('/')[1] : name;
    const templateDir = join(paths.root, 'templates', options.type);

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
    await copyTemplate(templateDir, cwd, vars);

    const isCdkType = ['cdk-app', 'cdk-lib', 'ecs-microservice'].includes(options.type);
    const isPublishable = !['cdk-app', 'ecs-microservice'].includes(options.type);

    const pkgPath = join(cwd, 'package.json');
    const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'));
    const devDeps = { ...DEV_DEPENDENCIES };
    if (isCdkType) {
      delete devDeps.tsdown;
      delete devDeps['@tsconfig/node22'];
    }
    pkg.devDependencies = { ...pkg.devDependencies, ...devDeps };
    pkg.homepage = vars.homepage;
    pkg.bugs = { url: vars.bugs };
    pkg.repository = { type: 'git', url: vars.repository };
    if (isPublishable) {
      pkg.publishConfig = { registry: 'https://npm.pkg.github.com' };
    }
    await writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

    const configsToSkip = isCdkType ? ['tsconfig.json', 'tsdown.config.ts'] : [];
    for (const file of CONFIG_FILES) {
      if (configsToSkip.includes(file.dest)) continue;
      await copyConfig(file, cwd);
    }

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
    if (isCdkType) {
      gitignoreLines.push('cdk.out');
    }
    await writeFile(join(cwd, '.gitignore'), `${gitignoreLines.join('\n')}\n`);

    console.log('Installing dependencies...');
    await execAsync('npm install');

    console.log('Initializing git...');
    await execAsync('git init && git add . && git commit -m "chore: initial commit"');

    console.log(`\n✓ Project bootstrapped! (${options.type})`);
    console.log('\nNext: run `dev init-kiro` to set up AI-assisted development.');
  });

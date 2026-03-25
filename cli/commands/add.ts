import { readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

import { Command } from '@commander-js/extra-typings';

import { fileExists } from '../utils/configs.js';
import { paths } from '../utils/paths.js';
import { copyTemplate } from '../utils/templates.js';

const TEMPLATES = ['lib', 'cdk', 'nestjs'] as const;

export const add = new Command()
  .name('add')
  .description('Add a package to a monorepo')
  .argument('<path>', 'Package path (e.g. packages/infra)')
  .requiredOption('-t, --template <template>', `Package template: ${TEMPLATES.join(', ')}`)
  .action(async (pkgPath, options) => {
    if (!TEMPLATES.includes(options.template as (typeof TEMPLATES)[number])) {
      console.error(`Invalid template: ${options.template}. Valid: ${TEMPLATES.join(', ')}`);
      process.exit(1);
    }

    const cwd = process.cwd();
    const rootPkgPath = join(cwd, 'package.json');

    if (!(await fileExists(rootPkgPath))) {
      console.error('package.json not found. Run this in a project root.');
      process.exit(1);
    }

    const rootPkg = JSON.parse(await readFile(rootPkgPath, 'utf-8'));
    if (!rootPkg.workspaces) {
      console.error(
        'Not a monorepo (no workspaces in package.json). Use `dev bootstrap --monorepo` first.',
      );
      process.exit(1);
    }

    const targetDir = join(cwd, pkgPath);
    if (await fileExists(targetDir)) {
      console.error(`Directory already exists: ${pkgPath}`);
      process.exit(1);
    }

    const scope = rootPkg.name?.includes('/') ? rootPkg.name.split('/')[0] : '';
    const pkgName = scope ? `${scope}/${basename(pkgPath)}` : basename(pkgPath);
    const repoName = rootPkg.name?.includes('/') ? rootPkg.name.split('/')[1] : rootPkg.name;

    const vars: Record<string, string> = {
      name: pkgName,
      scope,
      description: '',
      path: pkgPath,
      homepage: `https://github.com/BePower/${repoName}#readme`,
      bugs: `https://github.com/BePower/${repoName}/issues`,
      repository: `git+https://github.com/BePower/${repoName}.git`,
    };

    await copyTemplate(join(paths.templates, 'package', options.template), targetDir, vars);

    // Ensure workspaces includes the new package path
    const parentDir = pkgPath.split('/').slice(0, -1).join('/');
    const workspaceGlob = `${parentDir}/*`;
    if (!rootPkg.workspaces.includes(pkgPath) && !rootPkg.workspaces.includes(workspaceGlob)) {
      rootPkg.workspaces.push(pkgPath);
      await writeFile(rootPkgPath, `${JSON.stringify(rootPkg, null, 2)}\n`);
      console.log(`  ✓ Added ${pkgPath} to workspaces`);
    }

    console.log(`\n✓ Package added: ${pkgName} (${options.template}) at ${pkgPath}`);
    console.log('\nNext: run `npm install` to install dependencies.');
  });

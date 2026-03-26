import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = dirname(__filename);

function findPackageRoot(startDir: string): string {
  let dir = startDir;
  while (!existsSync(join(dir, 'configs'))) {
    const parent = dirname(dir);
    if (parent === dir) throw new Error('Could not find @bepower/dev package root');
    dir = parent;
  }
  return dir;
}

const packageRoot: string = findPackageRoot(__dirname);

export const paths: {
  root: string;
  configs: string;
  kiro: string;
  workflows: string;
  templates: string;
} = {
  root: packageRoot,
  configs: join(packageRoot, 'configs'),
  kiro: join(packageRoot, 'kiro'),
  workflows: join(packageRoot, 'workflows'),
  templates: join(packageRoot, 'templates'),
};

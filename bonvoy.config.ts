import type { BonvoyConfig } from '@bonvoy/core';

export default {
  versioning: 'independent',
  commitMessage: 'chore: :bookmark: release',
  tagFormat: '{name}@{version}',
  workflow: 'direct',
  github: { owner: 'BePower', repo: '.github' },
  plugins: [
    '@bonvoy/plugin-conventional',
    '@bonvoy/plugin-changelog',
    '@bonvoy/plugin-git',
    '@bonvoy/plugin-npm',
    '@bonvoy/plugin-github',
  ],
} satisfies BonvoyConfig;

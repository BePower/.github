# {{name}}

{{description}}

## Packages

- `{{scope}}/core` — Core CDK constructs

## Development

### Prerequisites

- Node.js >= 22
- npm

### Setup

```bash
npm install
```

### Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build with tsc |
| `npm test` | Run tests |
| `npm run test:coverage` | Tests with coverage |
| `npm run lint` | Run all linters |

### Git Hooks

Git hooks are managed by [Lefthook](https://github.com/evilmartians/lefthook) and run automatically:

- **pre-commit**: biome → lockfile → package-lint → sort → build → typecheck → test
- **commit-msg**: commitlint (conventional commits)

## CI/CD

This project uses GitHub Actions for CI. Packages are published to GitHub Packages on release.

## Contributing

See [CONTRIBUTING.md](https://github.com/BePower/.github/blob/main/CONTRIBUTING.md).

## License

MIT

# {{name}}

{{description}}

## Development

### Prerequisites

- Node.js >= 22
- npm
- AWS CLI configured with appropriate credentials

### Setup

```bash
npm install
```

### Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build with tsc |
| `npm test` | Run tests |
| `npm run lint` | Run all linters |
| `npx cdk synth` | Synthesize CloudFormation template |
| `npx cdk diff` | Compare deployed stack with current state |
| `npx cdk deploy` | Deploy stack to AWS |

### Git Hooks

Git hooks are managed by [Lefthook](https://github.com/evilmartians/lefthook) and run automatically:

- **pre-commit**: biome → lockfile → package-lint → sort → build → typecheck → test
- **commit-msg**: commitlint (conventional commits)

## Architecture

```
├── bin/            # CDK app entry point
├── lib/            # CDK stacks and constructs
├── src/handlers/   # Lambda handlers (bundled by CDK with esbuild)
└── test/           # Stack tests
```

## CI/CD

Deployment is managed via CDK Pipelines. Push to `main` triggers the pipeline.

## Contributing

See [CONTRIBUTING.md](https://github.com/BePower/.github/blob/main/CONTRIBUTING.md).

## License

MIT

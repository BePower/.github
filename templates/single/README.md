# {{name}}

{{description}}

## Installation

```bash
npm install {{name}}
```

## Usage

```typescript
import { hello } from '{{name}}';

hello('World');
```

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
| `npm run build` | Build with tsdown |
| `npm test` | Run tests |
| `npm run test:coverage` | Tests with coverage |
| `npm run lint` | Run all linters |
| `npm run lint:format` | Biome check + fix |
| `npm run lint:typecheck` | TypeScript type-check |
| `npm run clean` | Remove dist/ |

### Git Hooks

Git hooks are managed by [Lefthook](https://github.com/evilmartians/lefthook) and run automatically:

- **pre-commit**: biome → lockfile → package-lint → sort → build → typecheck → test
- **commit-msg**: commitlint (conventional commits)

## CI/CD

This project uses GitHub Actions for CI. Workflows are in `.github/workflows/`.

## Contributing

See [CONTRIBUTING.md](https://github.com/BePower/.github/blob/main/CONTRIBUTING.md).

## License

MIT

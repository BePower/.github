# {{name}}

{{description}}

## Development

### Prerequisites

- Node.js >= 22
- npm
- Docker & Docker Compose (for local development)
- AWS CLI configured with appropriate credentials

### Setup

```bash
npm install
cp .env.example .env       # Configure environment variables
docker compose up -d        # Start postgres + redis
npm run start:dev           # Start with hot reload
```

### Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build TypeScript |
| `npm run start:dev` | Start with hot reload (nodemon) |
| `npm test` | Run tests |
| `npm run lint` | Run all linters |
| `npx cdk synth` | Synthesize CDK (from `cdk/`) |
| `npx cdk deploy` | Deploy to AWS |

### Local Services (Docker Compose)

| Service | Port | Purpose |
|---------|------|---------|
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Message broker + cache |
| Jaeger | 16686 | Tracing UI |

### Git Hooks

Git hooks are managed by [Lefthook](https://github.com/evilmartians/lefthook) and run automatically:

- **pre-commit**: biome → lockfile → package-lint → sort → build → typecheck → test
- **commit-msg**: commitlint (conventional commits)

## Architecture

```
├── src/                    # NestJS application
│   ├── main.ts             # Bootstrap
│   ├── app.module.ts       # Root module
│   └── <domain>/           # Feature modules
├── config/                 # Runtime config (node-config-ts)
├── migrations/             # SQL migrations
├── cdk/                    # CDK infrastructure (separate workspace)
├── codedeploy-config/      # ECS Blue/Green deploy specs
├── Dockerfile              # Multi-stage build
└── docker-compose.yml      # Local dev services
```

## CI/CD

Deployment is managed via CDK Pipelines with ECS Blue/Green deploy via CodeDeploy.

## Contributing

See [CONTRIBUTING.md](https://github.com/BePower/.github/blob/main/CONTRIBUTING.md).

## License

MIT

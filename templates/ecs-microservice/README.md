# {{name}}

{{description}}

## Development

```bash
npm install
docker compose up -d    # Start postgres + redis
cp .env.example .env    # Configure environment
npm run start:dev       # Start with hot reload
```

## Build & Deploy

```bash
npm run build           # Build TypeScript
npm test                # Run tests
npx cdk synth           # Synthesize CDK
npx cdk deploy          # Deploy to AWS
```

## License

MIT

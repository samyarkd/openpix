# AGENTS Configuration

## Commands

- dev: `bun run dev`
- build: `bun run build`
- start: `bun run start`
- lint: `bun run lint`
- format: `bun run format`
- type-check: `bun run type:check`
- (no test script) run a single test once configured:
  `npx vitest path/to/testfile -- -t "Test Name"`

## Code Style

- **Imports**: group external, absolute (`~/`), then relative; sorted alphabetically
- **Formatting**: Prettier (2 spaces, 80 cols, single quotes, semicolons)
- **Types**: explicit props/interfaces, avoid `any`, add return types
- **Naming**: PascalCase for components; camelCase for variables/functions/hooks; kebab-case filenames in `ui`
- **Error handling**: use `try/catch` for async, `throw new Error('msg')`, avoid silent failures

## Tool Rules

- ESLint: `next/core-web-vitals`, `next/typescript`
- No `.cursor` or Copilot instruction rules detected

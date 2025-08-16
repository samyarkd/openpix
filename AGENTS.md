# Repository Guidelines

## Project Structure & Module Organization

- `src/app`: App Router pages (`page.tsx`), `layout.tsx`, and `globals.css`.
- `src/components`: UI and feature components (`ui`, `editor-tabs`, `canvas`, `magicui`).
- `src/hooks`: Reusable hooks (e.g., `use-image.ts`, `use-mobile.ts`).
- `src/lib`: Shared utilities (e.g., `utils.ts`).
- `public/`: Static assets (served at `/`).
- Config: `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `.prettierrc.json`, `postcss.config.mjs`.

## Build, Test, and Development Commands

- `bun run dev`: Start Next.js dev server (Turbopack) at `localhost:3000`.
- `bun run build`: Create a production build in `.next/`.
- `bun run start`: Run the production server.
- `bun run lint`: Lint using Next.js + TypeScript rules.
- `bun run format`: Format the files with prettier.

## Coding Style & Naming Conventions

- Language: TypeScript + React (Next.js App Router).
- Prettier: 2 spaces, 80 columns, single quotes, semicolons, ES5 trailing commas.
- ESLint: Extends `next/core-web-vitals` and `next/typescript`; run `bun run lint`.
- Components: PascalCase for component names; feature files may be `PascalCase.tsx` (e.g., `BrushTab.tsx`). Shared UI in `src/components/ui` uses kebab-case (e.g., `button.tsx`).
- Hooks: File names `use-*.ts` with camelCase exports (e.g., `useImage`).
- Utilities: camelCase exports; prefer kebab-case filenames.

## Testing Guidelines

- No test harness is configured yet. If adding tests, prefer Jest or Vitest with React Testing Library. Name tests after the unit (e.g., `app-sidebar.test.tsx`) and colocate in `__tests__/` or alongside the source. Focus on hooks and critical UI logic.

## Commit & Pull Request Guidelines

- Commits: Use Conventional Commits (e.g., `feat:`, `fix:`, `chore:`, `refactor:`). Keep messages imperative and scoped.
- PRs: Provide a clear description, link issues, and add screenshots/GIFs for UI changes. Note breaking changes explicitly (`BREAKING CHANGE:`) and include brief testing instructions.

## Security & Configuration Tips

- Do not commit secrets; use `.env.local` (ignored by Git). Access via `process.env.*`.
- Keep server-only code out of client components. Place public assets in `public/` and shared config in `components.json`/`next.config.ts`.
- This project is a fully local‑first image editor in the browser and does not upload anything to the cloud.

# React Project Setup. Class Components. Error Boundary

Repository: `ivan-khodorov-REACT2026Q2`

Task: React project setup with class components, REST API search, local storage, loading/error states, and an application error boundary.

## Initial Commit

The first commit should contain only `README.md`.

Recommended commit message:

```bash
chore: initial commit with README
```

Vite, React, dependencies, and source files should be added after the initial README-only commit.

## Requirements

- Vite React TypeScript project created from the `react-ts` template.
- Dedicated branch: `class-components`.
- State and lifecycle logic implemented with class components.
- No React hooks for state or lifecycle.
- No `any`.
- No `ts-ignore`.
- No Redux or other state management libraries.
- No UI component libraries.
- REST API with search and pagination.
- Logical parts split into separate components.
- Exactly two main visual sections: search and results.

## Score Self-Check

Score: `100 / 100`

- [x] Application layout structure: two distinct main sections, search on top and results below. (5/5)
- [x] Search functionality with local storage: saved search term is loaded into the input. (15/15)
- [x] Search results display: each item shows name and description. (10/10)
- [x] Initial data load: first page loads with saved search term or all items when no term exists. (10/10)
- [x] Search execution: search trims spaces, skips unchanged text, requests first page, and updates results. (20/20)
- [x] Search term persistence: changed trimmed value is saved to `localStorage`. (5/5)
- [x] Loading state indication: loader is visible during API requests. (10/10)
- [x] Error handling: API 4xx/5xx responses show a readable message without uncaught errors. (10/10)
- [x] Application Error Boundary: test button triggers an application error, the boundary logs it, and fallback UI is shown. (15/15)

## API

The app uses STAPI character search:

```txt
https://stapi.co/api/v1/rest/character/search
```

Request details:

- method: `POST`;
- page: `pageNumber=0`;
- page size: `pageSize=10`;
- search field: `name`;
- empty search term loads the first page without the `name` field.

## Project Structure

```txt
src/
  components/
    Card.tsx
    ErrorBoundary.tsx
    ErrorMessage.tsx
    Loader.tsx
    Results.tsx
    Search.tsx
  services/
    starTrekCharactersApi.ts
  App.tsx
  App.css
  index.css
  main.tsx
  types.ts
```

## Scripts

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Run ESLint:

```bash
npm run lint
```

Run production build:

```bash
npm run build
```

Run Prettier:

```bash
npm run format:fix
```

Preview production build:

```bash
npm run preview
```

## Quality Setup

- ESLint is configured for TypeScript and React.
- Prettier is configured with `.prettierrc`.
- `format:fix` runs `prettier --write .`.
- Husky runs `npm run lint` before commit.
- `dist` and TypeScript build info files are generated artifacts and should not be submitted.

## Verification

Use these commands before submitting:

```bash
npm run lint
npx tsc -p tsconfig.app.json --noEmit
npm run build
```

Additional checks:

- no React hooks for state or lifecycle in `src`;
- no `any` in `src`;
- no `ts-ignore`;
- no Redux or UI component libraries;
- source files are in the project root, not in a nested app folder;
- PR description includes a score checklist.

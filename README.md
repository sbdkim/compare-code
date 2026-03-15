# Compare Code

Client-side code and text diff workspace for comparing files in the browser with Northline styling and editor-grade controls.

## Live Demo
Current GitHub Pages path:
`https://sbdkim.github.io/code_compare/`

## Key Features
- Side-by-side and unified diff views
- Dual CodeMirror editors
- Myers and patience-lite diff strategies
- Line, word, and character-level highlighting
- Language detection and syntax highlighting for common code formats
- Filters for whitespace, case, and trimmed-line comparison
- Local autosave and import/copy utilities

## Tech Stack
- React 19
- TypeScript
- Vite
- CodeMirror 6
- `diff`
- Vitest and Testing Library

## Setup / Run Locally
```bash
npm install
npm run dev
```

## Tests
```bash
npm test
```

## Deployment Notes
- This project is configured for static hosting and GitHub Pages project-site deployment.
- The Vite base path is configurable via `PAGES_BASE` and currently defaults to the existing repo slug for safe deployment.
- When the repository slug is renamed to `compare-code`, set `PAGES_BASE=/compare-code/` before switching the public Pages URL.

## Architecture
- The diff domain model lives in `src/types/diff.ts`.
- The app separates comparison logic from rendering so different view modes can reuse the same normalized diff document.
- The browser stores editor state, language, comparison settings, and theme in `localStorage`.

## Privacy / Notes
- All comparison happens locally in the browser.
- No code or text content is sent to a backend service.

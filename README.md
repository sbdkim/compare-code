# Compare Code

A browser-based code and text diff workspace with editor-style controls and local-only comparison.

## Live Demo
[https://sbdkim.github.io/compare-code/](https://sbdkim.github.io/compare-code/)

## Key Features
- Side-by-side and unified diff views
- Dual CodeMirror editors
- Myers and patience-lite diff strategies
- Line, word, and character-level highlighting
- Language detection and syntax highlighting for common code formats
- Filters for whitespace, case, and trimmed-line comparison
- Local autosave plus import and copy utilities

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
- The project is configured for static hosting and GitHub Pages project-site deployment.
- The Vite base path is configurable via `PAGES_BASE` and currently targets `/compare-code/`.
- Use `npm run build` to produce the deployable static bundle.

## Project Layout
- `src/` diff logic, React components, and state management
- `public/` static assets used by the deployed app
- `vite.config.ts` build configuration for static hosting
- `index.html` Vite entrypoint

## Notes
- All comparison happens locally in the browser.
- Editor state, language, comparison settings, and theme are stored in `localStorage`.

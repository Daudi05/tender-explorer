# Tender Explorer — Frontend

## Stack
- React 18.2.0
- Vite 5.2.0
- react-router-dom 6.22.3
- date-fns 3.6.0
- Plain CSS (no Tailwind, no UI libraries)

## Setup

```bash
# 1. Copy env file
cp .env.example .env

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev
```

App runs at http://localhost:5173  
Backend must be running at http://127.0.0.1:5000

## Rules for teammates

### CSS
- Use variables from `src/styles/globals.css` — `var(--color-primary)`, `var(--space-4)`, etc.
- Never hardcode hex codes or rgb values in component CSS
- Mobile-first: use `min-width` in media queries, not `max-width`
- No inline `style={{}}` props except for dynamic values (e.g. progress bar width)
- No `!important`

### API calls
- All fetch calls go through `src/api/client.js` — see `src/api/USAGE.md`
- Never write raw `fetch()` in components

### Auth
- Use `useAuth()` from `src/context/AuthContext.jsx` — see `src/context/USAGE.md`
- Protect routes with `<ProtectedRoute>` wrapper

## Project structure

```
src/
  api/
    client.js        ← shared fetch wrapper (everyone uses this)
    USAGE.md
  context/
    AuthContext.jsx  ← auth state (everyone reads from this)
    USAGE.md
  styles/
    globals.css      ← design tokens (all CSS vars live here)
  components/        ← shared components
  pages/             ← one file per route
  App.jsx
  main.jsx
```

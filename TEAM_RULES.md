# Team Rules — Tender Explorer Frontend

## Branch naming
yourname/feature-description (e.g. brian/auth-pages)

## READ before coding
1. src/api/USAGE.md
2. src/context/USAGE.md
3. src/components/ui/USAGE.md (after Abubakar pushes)

## Hard rules
1. Use apiFetch — NEVER raw fetch()
2. Use useAuth() — NEVER touch localStorage directly
3. Use design tokens from globals.css — NEVER hardcode hex/rgb
4. Branch off main, open PR, get 1 review, then merge
5. Run npm run dev with zero console errors before opening PR

## Execution order
1. Abubakar pushes UI library FIRST (blocks everyone)
2. David adds Layout + Navbar + route guards
3. Everyone else replaces their stubs in parallel

## Workload
- Abubakar (UI library)         13 files, 7-9h
- Ivy (Notifications)            7 files, 5-7h
- Allan (Bids + fraud)          10 files, 7-9h
- Brian (Auth + dashboards)     14 files, 9-11h
- Duncan (Docs + awards)        14 files, 10-12h
- David (Routing + tenders)     18 files, 11-13h

## Design tokens locked
Primary: #2563eb · Success: #10b981 · Warning: #f59e0b · Danger: #ef4444
Font: Inter

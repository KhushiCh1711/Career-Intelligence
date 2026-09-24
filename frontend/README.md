# Pathway — Frontend

React (Vite) client for the Pathway career-readiness platform. Talks to the backend entirely
over HTTP — no local computation of scores, matches, or tenant data; that all lives server-side.

## Setup

```bash
cp .env.example .env     # use the Vite /api proxy during local development
npm install
npm run dev                # http://localhost:5173
```

Make sure the backend is running first (`cd ../backend && npm run dev`) and has been seeded
(`npm run seed`) — the sign-in screen loads its college/company lists from the API.

## How auth works here

- The access token is kept in a module-level JS variable (`src/api/client.js`) — never
  localStorage/sessionStorage, so it disappears on a hard refresh (the httpOnly refresh cookie
  then transparently gets you a new one via `refreshSession()` on load).
- Every `api.*` call automatically retries once after a silent refresh if it gets a 401.

## Structure

- `src/api/client.js` — fetch wrapper, token handling, auto-refresh
- `src/context/AuthContext.jsx` — session state used by the whole app
- `src/components/` — shared UI (Card, Bar, RadialGauge, Avatar, Sidebar, AssistantPanel)
- `src/pages/student/`, `src/pages/university/`, `src/pages/company/` — one folder per role,
  matching the backend's route groups
- `src/theme.js` — the design tokens (colors, font) shared across every page

Demo password for every seeded account: `demo1234`.

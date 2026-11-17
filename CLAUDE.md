# CLAUDE.md — Web-GIS Radar Pha Din

Web GIS that displays weather-radar products (MAX, HMAX, ...) from the Pha Din radar station in near
real time, with user login. Monorepo: `backend/` (Express) + `frontend/` (React/Vite), orchestrated
from the root `package.json`.

> Everything in this file was verified against the source code, except the "Unknowns" section.
> Do NOT treat anything in "Unknowns" as fact — ask the user.

## Session workflow (two machines) — read first

The owner works on two Windows PCs (home and office), both with the repo at `D:\Web-GIS-Radar-PHA`.
Claude has no memory between sessions, so shared context lives in `docs/` and travels via GitHub:

- `docs/Dac-ta-chuc-nang-ban-tin.md` — Bulletins feature spec (source of truth for decisions).
- `docs/Ban-giao-phien-lam-viec.md` — session handoff: progress, pending items, next step.

Bulletins work happens on branch `feature/ban-tin`.

- **Start of session:** `git pull` on the current branch, then read both files in `docs/` before
  doing anything else. Tell the owner the next step from the handoff.
- **End of session (when the owner says they are leaving):** update the handoff (sections 1 and 7,
  plus the date), then commit and push to `feature/ban-tin`. This request counts as approval to
  commit/push the session's work.
- Every schema change is also saved as a `.sql` file in the repo, so the other machine's local DB
  can be updated.
- The owner is learning web development: explain each step in simple Vietnamese before doing it,
  work in small pieces, and let the owner review each piece.

## Commands

| Purpose | Command (run from repo root) |
|---|---|
| Install everything | `npm run install:all` |
| Dev BE + FE | `npm run dev` (BE: nodemon on `PORT` or 5001; FE: Vite on 5173) |
| Backend only | `npm run dev:backend` · production: `npm --prefix backend start` |
| Frontend only | `npm run dev:frontend` |
| Build FE | `npm --prefix frontend run build` → `frontend/dist/` |
| Lint FE | `npm --prefix frontend run lint` (backend has no linter) |
| Tests | **None.** No test files, test script, or CI. Do not invent a test command. |

Runtime requirements: PostgreSQL with both databases + `backend/.env`. In dev the frontend calls the
production GeoServer directly.

Dev environment (confirmed by user): the DB in `backend/.env` is a **local** database (writes allowed
per the rules below). Timeline timestamps come from the local Geo DB; radar images for those
timestamps come from the production GeoServer. The NOTIFY channel must be `radar_product_update`
(matches `SQL.txt`); check with `pg_get_functiondef('notify_radar_product_update'::regproc)`.

## Architecture & stack

- **Frontend**: React 19 (rc), Vite 8, Tailwind CSS v4 (CSS-first config in `src/index.css`,
  dark mode = `.dark` class), react-router-dom 7, Leaflet 1.9 + react-leaflet 5 (rc), axios,
  lucide-react. `tailwind.config.js` has no effect under v4; `@turf/turf` is declared but unused.
- **Backend**: Node + Express 4, ESM (`"type": "module"`), `pg`, bcrypt, jsonwebtoken,
  cookie-parser, cors, dotenv, helmet, express-rate-limit (signin 10 / refresh 60 per 15 min per IP).
- **Database**: PostgreSQL, 2 databases, 2 pools, same user/password:
  - `poolGeo` (`DB_GEO_NAME`) — tables `<product>_mosaic_index` (column `ingestion`), NOTIFY triggers.
  - `poolApp` (`DB_APP_NAME`) — `users`, `sessions`, `roles`, `titles`, `organizations`.
- **GIS**: external GeoServer `https://radarphadin.com.vn/geoserver`, workspace `radar` (WMS,
  WMS-C/GWC, WMTS, WFS). The frontend calls it directly, not through the backend. Basemap: ArcGIS
  Online Canvas.
- **Environment** (`backend/.env`, gitignored): `DB_GEO_NAME, DB_APP_NAME, DB_USER, DB_PASSWD,
  DB_HOST, DB_PORT, PORT, LIMIT_PRODUCTS, ACCESS_TOKEN_SECRET` (server exits at startup if
  `ACCESS_TOKEN_SECRET`/`DB_*` are missing). Optional: `NODE_ENV` (cookie flags), `CORS_ORIGIN`
  (default `http://localhost:5173`), `TRUST_PROXY` (set behind a reverse proxy so rate limiting sees
  real IPs). `LIMIT_PRODUCTS` is clamped to 1–50, default 12.
  Frontend: `VITE_API_BASE_URL` (optional, defaults to `/api`). Vite proxies `/api` → `localhost:5001`.

## Directory layout

```
backend/
  libs/              dbGeoserver.js, dbWebApp.js (pools), initPostgresListener.js (LISTEN), SQL.txt (triggers)
  src/server.js      middleware + route mounting
  src/routes/        authRoute (/api/auth), timesRoute (/api/time), userRoute (/api/users, protected)
  src/controllers/   authController, timeController (SSE), userController
  src/middleware/    authMiddleware.js → protectedRoute (Bearer JWT, sets req.user)
  src/services/      userService.js (user queries + toUserDTO)
frontend/src/
  pages/             DashBoard (/), Login (/login), NotFound (*)
  context/           AuthContext, ThemeContext, SelectionContext, LayerToggleContext
  components/layout/ Header, SideBar, MainContent
  components/map/    MapView, ProductLayer(+Content), WFSLayer, ForecastPointLayer, GetMapInfoHandler, ...
  components/ui/     AnimationControl, ProductLegend, LayerControlToggle, Navigation, Logo
  lib/api.js         axios instance + in-memory access token + auto-refresh on 401
  lib/escapeHtml.js  escape values before building Leaflet popup/tooltip HTML
  lib/constants.js   GeoServer URLs, map panes (z-index), layerControlConfigs
  lib/config/        dropdownConfigs (stations/products/regions), legendConfigs, navItems
```

## Core flows

- **Real-time radar**: INSERT into `max|hmax_mosaic_index` → trigger
  `pg_notify('radar_product_update', {product})` → `initPostgresListener` (auto-reconnects with
  backoff) → pushes `{newTimestamp}` to SSE clients in `productGroups` (in-memory).
  `GET /api/time?product=X` (X must be in `PRODUCT_TABLES` whitelist in `timeController.js`, else
  400) immediately sends `{timestamps, limit}`, then `: ping` every 25s. FE `ProductLayerContent`
  renders one `WMSTileLayer` per timestamp (opacity 1/0) in `paneRadarProducts`; `AnimationControl`
  cycles the index. EventSource reconnects automatically (do not `close()` on error).
- **Auth**: signin → 15-min access JWT (kept in memory only, `lib/api.js`) + random refresh token
  stored in `sessions` (plain text), sent as HttpOnly cookie `refreshToken` (14 days). Each
  `/auth/refresh` **rotates** the token (old one invalid, `expires_at` unchanged). On app mount:
  `/auth/refresh` → `/users/me`. On 401 the interceptor refreshes once (shared promise) and retries.
  `/auth/signup` requires login (`protectedRoute`) and validates input.
- **Naming rule**: product `X` ↔ table `x_mosaic_index` ↔ GeoServer layer `radar:x_mosaic_index`.

## Coding conventions

- ESM on both sides; double quotes, semicolons, trailing commas (Prettier `printWidth: 80` with the
  Tailwind class-sorting plugin — configured in frontend only).
- **All code comments must be written in English** (existing code mixes Vietnamese; new/edited code
  uses English). User-facing text (UI strings, API `message` values) stays in Vietnamese.
- Backend: route → controller → service. Controllers wrap in `try/catch`, log with
  `console.error(...)`, return `{ message }`; unexpected errors → 500 `"Lỗi hệ thống"`.
- SQL always uses `$1, $2…` parameters. DB rows are snake_case → clients receive camelCase via
  `toUserDTO` (never return `password_hash`).
- Frontend: arrow-function components with `export default`; component files PascalCase `.jsx`,
  lib files camelCase `.js`. Shared state via Context + `useXxx()` hook. Internal API calls go
  through `lib/api.js` (no bare axios/fetch to `/api`). Static config lives in `lib/config/` or
  `lib/constants.js`.
- UI: Tailwind utilities with `dark:` variants; icons from lucide-react.
- Leaflet: put layers in a pane from `constants.panes`; floating controls on the map call
  `L.DomEvent.disableClickPropagation/disableScrollPropagation`.

## Rules for new features

- Do not install/upgrade packages, restructure directories, or commit/push without user approval.
- Read the related code first; follow the conventions above; never guess schemas — ask.
- New endpoint: add route + controller (+ service if it touches the DB); routes requiring login are
  mounted behind `protectedRoute`. There is **no** role-based authorization yet — do not assume one.
- New radar product: keep `dropdownConfigs.js`, `legendConfigs.js`, the `*_mosaic_index` table +
  trigger in the Geo DB, and the GeoServer layer in sync — DB/GeoServer parts are done by the user.
- After frontend changes run `lint` and `build`. With no automated tests, state exactly what was
  verified manually.

## Database & security rules

- Write/DDL statements (INSERT/UPDATE/DELETE/CREATE/ALTER/DROP/TRUNCATE) are allowed **only on local
  or dev databases**. Never on production. If the target environment is not clearly local/dev, ask first.
- There are no migrations: report every schema change as SQL to the user so it can be applied to
  other environments.
- The Geo DB is shared with GeoServer: the app only reads it; do not change its tables/triggers
  outside local/dev without approval.
- Never print, log, or commit `.env` values; never hardcode secrets, passwords, or tokens.
- SQL: always parameterized. Dynamic table/column names **must** go through a whitelist (never
  interpolate user input).
- Never log or return `password_hash`, refresh tokens, or access tokens.
- Access token stays in memory only (no localStorage/sessionStorage); refresh token only in the
  HttpOnly cookie.
- Escape GeoServer/user data before injecting it into HTML (Leaflet popups/tooltips).
- Validate input on the backend for every new endpoint.

## Known issues (verified, not yet fixed — do not fix out of scope unless asked)

- No role-based authorization: any logged-in user can call `/api/auth/signup` with any `role`.
- Refresh tokens are stored in plain text in `sessions` (rotation is in place, hashing is not).
- `dropdownConfigs.js`: bounds for Điện Biên (longitude 110–135) and Lào Cai look wrong.
- `LayerToggleContext` initialises `radarStations: false`, ignoring `defaultVisible: true` in `layerControlConfigs`.
- 12 `WMSTileLayer`s are rendered at once (kept on purpose for smooth animation; heavy on GeoServer).
- Pre-existing lint errors (`npm --prefix frontend run lint`, 10 problems): unused vars in `SideBar.jsx`,
  ref read during render in `WFSLayer.jsx`, `react-refresh/only-export-components` in all contexts,
  `module` undefined in `tailwind.config.js`.

## Unknowns (ask the user, do not assume)

- App DB DDL/constraints/indexes/seed data; full Geo DB schema, PostGIS, what writes `*_mosaic_index`.
- Whether the triggers in `SQL.txt` are applied in production; GWC caching for the TIME dimension.
- Deployment (Nginx? contents of the gitignored `deploy/`), production domain/CORS, Node version.
- Official permission model (old README: System Admin / Admin / User) and which roles may create accounts via `/signup`.
- Whether the map page requires login; the value of `LIMIT_PRODUCTS`.
- Phase 2 spec for System status, test strategy, PR workflow. (Bulletins spec: `docs/`.)

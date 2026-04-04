# Architecture

## 1. System Overview

The application is a browser-based dual remote for:

- OBS Studio control over WebSocket
- ProPresenter control over HTTP API

It is designed for live operation where both systems need to be managed from one interface.

## 2. Runtime Stack

- UI framework: React 19 + TypeScript
- Build/runtime: Vite + TanStack Start
- Router: TanStack Router (file-based route generation)
- Server state: TanStack Query
- Styling: Tailwind CSS + custom CSS variables + shadcn/Radix primitives
- Icons: Lucide React

## 3. Module Boundaries

### 3.1 Route Layer

- Route entrypoint and app shell are under `src/routes/`.
- `src/routes/__root.tsx` loads global context (`currentUser`, `baseUrl`) and sets head/meta tags.
- Route tree is generated to `src/routeTree.gen.ts`.

### 3.2 Feature Components

- Dashboard shell: `src/components/Dashboard.tsx`
- OBS feature panel: `src/components/OBSPanel.tsx`
- ProPresenter feature panel: `src/components/ProPresenterRemotePanel.tsx`
- Landing and auth pages under `src/components/*` and route files.

### 3.3 Integration Services

- OBS client service: `src/services/obs.service.ts`
- ProPresenter client service: `src/services/propresenter.service.ts`

Both services use an observer model (`subscribe` + internal `notify`) so UI can react to connection/state changes.

### 3.4 Server Functions and API

- Auth/session/reset flows: `src/server/functions/auth.ts`
- Origin/base URL helper: `src/server/functions/request.ts`
- API routes: `src/routes/_api/hello.tsx`, `src/routes/_api/og.tsx`

## 4. Data and Control Flow

## 4.1 App Boot

1. Router is created in `src/router.tsx`.
2. Root loader in `src/routes/__root.tsx` calls:
   - `authMiddleware()`
   - `getBaseUrl()`
3. Loader data becomes globally available through route context/hooks.
4. `Dashboard` mounts with a staged loading overlay before revealing panels.

## 4.2 OBS Flow

1. User submits host/port/password/protocol in `OBSPanel`.
2. `obsService.connect()` builds/validates URL and opens WebSocket.
3. Initial status is fetched (`stream`, `record`, `scene list`, current scene, studio mode).
4. Panel subscribes to OBS events and mirrors state.
5. Scene/program actions call explicit service methods.
6. Thumbnails are polled and rendered in panel cards.

## 4.3 ProPresenter Flow

1. User submits host/port/protocol in `ProPresenterRemotePanel`.
2. `proPresenterService.connect()` probes version endpoints and fallback ports.
3. On success, periodic polling starts.
4. Panel fetches:
   - active presentation/slides
   - macros
   - timers
   - playlist/library presentation options
5. Tab actions invoke service triggers (slides, transport, clear, macros, timers).

## 5. State Management Strategy

- Global server state context: route loader data + TanStack Query provider
- Feature state: local `useState` in panel components
- External integration state: service class private fields + observer notifications

This pattern keeps transport/protocol complexity inside services and keeps components focused on UX/state composition.

## 6. Styling and Visual System

- Primary style file: `src/styles.css`
- CSS variables define theme colors, spacing behavior, and feature accents.
- shadcn/Radix primitives are used as building blocks from `src/components/ui/*`.

## 7. Reliability and Compatibility Patterns

### OBS

- Connection URL normalization for pasted host/protocol values.
- Fallback screenshot strategy per scene/source if direct scene screenshot fails.
- Local studio preview mode independent from OBS native studio mode toggle.

### ProPresenter

- Version endpoint compatibility (`/version` and `/v1/version`).
- Playlist and presentation parsing includes multiple endpoint/path fallbacks.
- Slide index resolution combines active payload and status payload to reduce stale-index problems.

## 8. Current Constraints

- Auth uses in-memory maps; restart clears users/sessions/reset tokens.
- No persistent datastore or production auth provider.
- Unit tests are not present; test coverage is currently E2E-oriented.
- One placeholder file exists: `src/components/obs/committer.tsx`.

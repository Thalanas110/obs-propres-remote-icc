# Components

## 1. Feature Composition

The user-facing UI is composed from a small set of feature-level components and a large reusable UI primitive layer.

Top-level feature components:

- `src/components/LandingPage.tsx`
- `src/components/Dashboard.tsx`
- `src/components/OBSPanel.tsx`
- `src/components/ProPresenterRemotePanel.tsx`
- `src/components/LoadingScreen.tsx`
- `src/components/NotFound.tsx`
- `src/components/error-component.tsx`

## 2. Dashboard and Entry Screens

## 2.1 `Dashboard.tsx`

- Renders main split layout (OBS left, ProPresenter right).
- Displays loading overlay with state machine:
  - `visible` -> `fading` -> `hidden`
- Timing constants:
  - visible: 2300ms
  - fade: 420ms

## 2.2 `LandingPage.tsx`

- Public marketing/entry screen.
- Includes:
  - hero and feature messaging
  - setup steps
  - CTA links to `/connect`
- Uses pre-defined arrays (`highlights`, `features`, `setupSteps`) for section rendering.

## 2.3 `LoadingScreen.tsx`

- Animated branding splash between OBS and ProPresenter states.
- Alternates active target every 1200ms.
- Uses semantic status structure (`role="status"`, `aria-live="polite"`).

## 2.4 `NotFound.tsx`

- Styled 404 page with:
  - deterministic verse selection per path
  - 8-second auto-redirect to `/`
  - manual "Return" and "Go Back" actions

## 2.5 `error-component.tsx`

- Default router error boundary UI.
- Posts error details to `window.parent` every 2 seconds.
- Displays current error message in page fallback.

## 3. OBS Feature Component

## 3.1 `OBSPanel.tsx`

This is the largest feature component and includes:

- Connection UI (protocol/host/port/password)
- Connection error dialog
- Live stream and recording controls
- Scene switching
- Local Studio Mode (preview/program workflow)
- Live preview thumbnail refresh
- Scene manager:
  - create/rename/delete scene
  - edit scene sources
- Source manager:
  - add source by input kind
  - browser source URL/size editing
  - reorder source stack
  - source visibility toggle
  - source rename/remove

Key implementation details:

- Persistent local studio-mode preference using localStorage key `obs.localStudioMode.enabled`
- Fallback source-kind catalog if OBS kind fetch fails
- Polling previews at 1500ms intervals
- Tracks async screenshot requests with incrementing request IDs to avoid stale updates

## 4. ProPresenter Feature Component

## 4.1 `ProPresenterRemotePanel.tsx`

Acts as orchestrator for all ProPresenter tabs.

Responsibilities:

- Connection state and retry display
- Fetching and refreshing:
  - active presentation
  - playlist/library presentation options
  - macros
  - timers
- Source mode switch (`playlist` vs `library`)
- Slide navigation and jump
- Manual slide override logic to smooth UI against stale status payloads
- Tab switching and action wiring

Polling pattern:

- status refresh: every 3000ms
- presentation list refresh: every 30000ms

## 5. ProPresenter Subcomponents (`src/components/propresenter/`)

- `ProPresenterConnectedHeader.tsx`
  - Online badge, loading spinner, disconnect button.
- `ProPresenterDisconnectedView.tsx`
  - Host/port/protocol inputs and connect action.
- `ProPresenterActivePresentationCard.tsx`
  - Active presentation summary, slide progress bar, presentation source selectors, trigger action.
- `ProPresenterTabBar.tsx`
  - Tabs: slides, transport, clear, macros, timers.
- `ProPresenterSlidesTab.tsx`
  - Slide prev/next/go controls and slide grid with thumbnail fallback.
- `ProPresenterTransportTab.tsx`
  - Play/pause/skip/show/hide media controls.
- `ProPresenterClearTab.tsx`
  - Layer clear actions (all, slide, media, audio, announcements, props, messages).
- `ProPresenterMacrosTab.tsx`
  - Macro list with trigger buttons.
- `ProPresenterTimersTab.tsx`
  - Timer start/stop/reset actions.
- `types.ts`
  - Shared `ActivePres` and `ProPresenterTab` types.

## 6. Auth Components (`src/components/auth/`)

- `auth-card.tsx`
  - Shared centered auth page card layout.
- `auth-field.tsx`
  - Standardized labeled form field via `FormField` + `Input`.
- `auth-form.tsx`
  - Generic submit wrapper with loading state and root-level error display.
- `index.ts`
  - Barrel exports.

## 7. OBS Subfolder Note

- `src/components/obs/committer.tsx`
  - Currently contains only a debug console statement.
  - Not used by core application flows.

## 8. Styling and Class Strategy

Feature components blend:

- custom semantic classes (from `src/styles.css`)
- utility classes (Tailwind)
- reusable component classes from `src/components/ui/*`

This hybrid approach allows custom dashboard visuals while reusing Radix/shadcn primitives.

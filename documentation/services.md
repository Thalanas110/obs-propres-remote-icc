# Services

This document describes the two integration services used by the UI:

- `src/services/obs.service.ts`
- `src/services/propresenter.service.ts`

Both services are singleton exports and maintain internal status state with a subscription API.

## 1. OBS Service (`obs.service.ts`)

## 1.1 Purpose

Provides strongly-typed control over OBS Studio through `obs-websocket-js`.

## 1.2 Exposed Types

- `OBSScene`
- `OBSSceneItem`
- `OBSStatus`

## 1.3 Internal State

- Connection flags (`_connected`, `_streaming`, `_recording`)
- Active scene tracking (`_currentScene`, `_currentPreviewScene`)
- Studio mode tracking (`_studioModeEnabled`)
- Scene cache (`_scenes`)
- Screenshot fallback cache (`_sceneScreenshotFallbackSource`)

## 1.4 Event Bindings

In constructor, subscribes to OBS WebSocket events:

- `StreamStateChanged`
- `RecordStateChanged`
- `CurrentProgramSceneChanged`
- `CurrentPreviewSceneChanged`
- `StudioModeStateChanged`
- `SceneListChanged`
- `ConnectionClosed`

Each updates state and calls `notify()`.

## 1.5 Public API

### Lifecycle and Observability

- `subscribe(fn)`
- `status` getter
- `connect(host, port, password?, protocol?)`
- `disconnect()`

### Streaming and Recording

- `startStream()` / `stopStream()`
- `startRecording()` / `stopRecording()`

### Scene and Studio Control

- `switchScene(sceneName)`
- `setStudioModeEnabled(enabled)`
- `setPreviewScene(sceneName)`
- `transitionPreviewToProgram()`

### Scene CRUD

- `createScene(sceneName)`
- `removeScene(sceneName)`
- `renameScene(sceneName, newSceneName)`
- `refreshScenes()`

### Scene Items / Sources

- `getSceneItems(sceneName)`
- `getInputList()`
- `getInputKinds()`
- `createInputSource(sceneName, sourceName, inputKind, inputSettings?)`
- `createBrowserSource(sceneName, sourceName, url, width?, height?)`
- `updateBrowserSource(inputName, url, width?, height?)`
- `renameSource(sourceName, newSourceName)`
- `setSceneItemEnabled(sceneName, sceneItemId, enabled)`
- `removeSceneItem(sceneName, sceneItemId)`
- `setSceneItemIndex(sceneName, sceneItemId, sceneItemIndex)`

### Preview/Screenshot Capture

- `getProgramSceneScreenshot(width?, height?, quality?)`
- `getPreviewSceneScreenshot(width?, height?, quality?)`
- `getSceneScreenshot(sceneName, width?, height?, quality?)`

## 1.6 Connection URL Handling

`buildConnectionUrl` normalizes pasted values:

- Removes accidental spaces and `%20`
- Supports pasted schemes
- Supports host:port parsing
- Enforces port range 1-65535
- Special-case guidance for `.trycloudflare.com` with `wss` + port 443

## 1.7 Screenshot Fallback Strategy

When direct scene screenshot fails:

1. Try cached fallback source for that scene
2. Try scene name as source
3. Enumerate enabled scene items and try each source
4. Cache working source for future calls

This improves reliability across OBS setups where screenshot behavior differs by source type.

## 2. ProPresenter Service (`propresenter.service.ts`)

## 2.1 Purpose

Provides robust HTTP API integration for ProPresenter with endpoint and payload compatibility fallbacks.

## 2.2 Exposed Types

- Status/presentation types:
  - `ProPresenterStatus`
  - `ActivePresentation`
  - `ActivePresentationSlide`
  - `LibraryPresentation`
  - `PlaylistPresentation`
- Control entities:
  - `Macro`, `PlaylistItem`, `PPTimer`, `PPMessage`, `PPLook`, `PPProp`, `StageLayout`, `PPAudio`

## 2.3 Connection and Polling

### Connection behavior

- Normalizes host
- Probes candidate ports in order: requested port, `1025`, `50001`
- Tries both version paths:
  - `/version`
  - `/v1/version`

### Polling behavior

- On successful connect, starts 5-second polling via `requestVersion()`.
- Updates `_connected` state if connectivity changes.

## 2.4 Public API

### Lifecycle and Observability

- `subscribe(fn)`
- `status` getter
- `connect(host, port, protocol?)`
- `disconnect()`

### Status and Utility

- `getVersion()`
- `getSystemStatus()`
- `getSlideStatus()`
- `getPresentationSlideIndex(groups?)`
- `getPresentationThumbnailUrl(presentationUUID, slideIndex, quality?, thumbnailType?)`

### Presentations and Slides

- `getActivePresentation()`
- `triggerNextSlide()`
- `triggerPreviousSlide()`
- `triggerSlideIndex(presentationUUID, slideIndex)`
- `getLibraryPresentations()`
- `triggerPresentation(presentationUUID)`

### Transport and Media

- `getTransportLayerStatus()`
- `playTransportVideo()`
- `pauseTransportVideo()`
- `skipBackVideo(seconds)`
- `skipForwardVideo(seconds)`
- `showMedia()`
- `hideMedia()`

### Clear Actions

- `clearAll()`
- `clearSlide()`
- `clearMedia()`
- `clearAudio()`
- `clearAnnouncements()`
- `clearProps()`
- `clearMessages()`
- `clearToLogo()`

### Macros, Timers, Messages, Looks, Props

- `getMacros()` / `triggerMacro(uuid)`
- `getTimers()` / `startTimer(uuid)` / `stopTimer(uuid)` / `resetTimer(uuid)`
- `getMessages()` / `showMessage(uuid)` / `hideMessage(uuid)`
- `getLooks()` / `triggerLook(uuid)`
- `getProps()` / `triggerProp(uuid)` / `clearProp(uuid)`

### Stage and Library Helpers

- `getStageLayouts()` / `setStageLayout(layoutUUID)`
- `getAudioPlaylists()`
- `getLibrary()`

### Playlists

- `getPlaylists()`
- `getPlaylistPresentations()`
- `triggerPlaylistItem(playlistUUID, itemUUID, itemIndex?)`

## 2.5 Compatibility and Parsing Strategy

The service contains significant compatibility logic:

- Endpoint fallbacks across multiple route variants
- Flexible nested payload parsing for IDs and indices
- Deduplication of playlist and library results
- Slide index reconciliation from multiple status sources

`getActivePresentation()` also hydrates slide details from `/v1/presentation/{uuid}` if active payload is compact.

## 2.6 Request Helpers

- `request<T>(path, method, body?)`: JSON request with 3s timeout
- `requestOk(path, method, body?)`: bool response helper

Both use `fetch` and `AbortSignal.timeout(3000)`.

## 3. Service Consumption Pattern in UI

- Components subscribe to status changes in `useEffect`.
- Components invoke service methods for actions and polling refresh.
- Services isolate protocol details from component code.

## 4. Notable Design Tradeoffs

- Simple singleton service pattern reduces wiring complexity.
- Services are easy to use but currently tightly coupled to browser runtime and in-memory state.
- Advanced compatibility handling in ProPresenter service increases file complexity but improves real-world resilience.

import { obsService, type OBSScene, type OBSStatus } from '@/services/obs.service'
import {
  Circle,
  ChevronRight,
  Edit3,
  Monitor,
  Play,
  RefreshCw,
  Square,
  WifiOff,
} from 'lucide-react'

interface OBSMainViewProps {
  status: OBSStatus
  localStudioMode: boolean
  localPreviewScene: string | null
  localPreviewFrame: string | null
  localPreviewLoading: boolean
  localPreviewError: string | null
  livePreview: string | null
  previewLoading: boolean
  previewError: string | null
  studioActionError: string | null
  transitioning: boolean
  onDisconnect: () => void
  onToggleLocalStudioMode: () => void
  onSceneTrigger: (sceneName: string) => void
  onRefreshLivePreview: () => void
  onRefreshLocalPreview: () => void
  onTakePreviewToProgram: () => void
  onEditScenes: () => void
}

export function OBSMainView({
  status,
  localStudioMode,
  localPreviewScene,
  localPreviewFrame,
  localPreviewLoading,
  localPreviewError,
  livePreview,
  previewLoading,
  previewError,
  studioActionError,
  transitioning,
  onDisconnect,
  onToggleLocalStudioMode,
  onSceneTrigger,
  onRefreshLivePreview,
  onRefreshLocalPreview,
  onTakePreviewToProgram,
  onEditScenes,
}: OBSMainViewProps) {
  return (
    <div className="obs-panel h-full flex flex-col">
      <div className="panel-header">
        <div className="flex items-center gap-2 min-w-0">
          <Monitor size={16} className="text-sky-400" />
          <span className="panel-title">OBS Studio</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            className="control-btn control-btn-ghost"
            onClick={onEditScenes}
          >
            <Edit3 size={12} />
            Edit Scenes
          </button>

          <button
            className={`control-btn ${
              status.streaming ? 'control-btn-danger' : 'control-btn-primary'
            }`}
            onClick={() =>
              status.streaming
                ? obsService.stopStream()
                : obsService.startStream()
            }
          >
            {status.streaming ? <Square size={15} /> : <Play size={15} />}
            {status.streaming ? 'Stop Live' : 'Live'}
          </button>

          <button
            className={`control-btn ${
              status.recording ? 'control-btn-danger' : 'control-btn-amber'
            }`}
            onClick={() =>
              status.recording
                ? obsService.stopRecording()
                : obsService.startRecording()
            }
          >
            {status.recording ? <Square size={15} /> : <Circle size={15} />}
            {status.recording ? 'Stop Record' : 'Record'}
          </button>

          <button
            onClick={onDisconnect}
            className="icon-btn text-neutral-500 hover:text-red-400"
            title="Disconnect"
          >
            <WifiOff size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Local Studio Mode */}
        <div className="status-card space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-neutral-500">Program Scene</p>
              <p className="text-sm font-medium text-white truncate">
                {status.currentScene || '—'}
              </p>
            </div>

            <button
              className={`control-btn ${localStudioMode ? 'control-btn-amber' : 'control-btn-ghost'} min-w-[108px]`}
              onClick={onToggleLocalStudioMode}
            >
              {localStudioMode ? 'Studio On' : 'Studio Off'}
            </button>
          </div>

          <p className="text-[11px] text-neutral-500">
            {localStudioMode
              ? 'Scene buttons now set Preview first, then Transition to Live.'
              : 'Scene buttons switch directly to Live when Studio Mode is off.'}
          </p>

          {studioActionError && (
            <p className="text-[11px] text-red-400">{studioActionError}</p>
          )}
        </div>

        {localStudioMode ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="status-card">
                <div className="flex items-center justify-between mb-2 gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-neutral-500 uppercase tracking-wider">
                      Preview
                    </p>
                    <p className="text-[11px] text-neutral-400 truncate">
                      {localPreviewScene || 'No preview scene selected'}
                    </p>
                  </div>

                  <button
                    className="icon-btn text-neutral-500 hover:text-amber-300 disabled:opacity-40"
                    onClick={onRefreshLocalPreview}
                    disabled={!localPreviewScene || localPreviewLoading}
                    title="Refresh preview"
                  >
                    <RefreshCw
                      size={12}
                      className={localPreviewLoading ? 'animate-spin' : undefined}
                    />
                  </button>
                </div>

                <div className="relative w-full aspect-video overflow-hidden rounded-md border border-neutral-700 bg-neutral-900">
                  {localPreviewFrame ? (
                    <img
                      src={localPreviewFrame}
                      alt="Preview feed"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-neutral-500">
                      {localPreviewLoading
                        ? 'Loading preview…'
                        : 'Select a scene to preview'}
                    </div>
                  )}
                </div>

                {localPreviewError && (
                  <p className="text-[11px] text-red-400 mt-2">
                    {localPreviewError}
                  </p>
                )}
              </div>

              <div className="status-card">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-neutral-500 uppercase tracking-wider">
                    Live
                  </p>
                  <button
                    className="icon-btn text-neutral-500 hover:text-sky-400 disabled:opacity-40"
                    onClick={onRefreshLivePreview}
                    disabled={previewLoading}
                    title="Refresh live feed"
                  >
                    <RefreshCw
                      size={12}
                      className={previewLoading ? 'animate-spin' : undefined}
                    />
                  </button>
                </div>

                <div className="relative w-full aspect-video overflow-hidden rounded-md border border-neutral-700 bg-neutral-900">
                  {livePreview ? (
                    <img
                      src={livePreview}
                      alt="Live feed"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-neutral-500">
                      {previewLoading ? 'Loading live feed…' : 'No live feed yet'}
                    </div>
                  )}
                </div>

                {previewError && (
                  <p className="text-[11px] text-red-400 mt-2">{previewError}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button className="control-btn control-btn-ghost" disabled>
                Fade
              </button>
              <button
                className={`control-btn ${
                  localPreviewScene && localPreviewScene !== status.currentScene
                    ? 'control-btn-primary'
                    : 'control-btn-ghost'
                }`}
                onClick={onTakePreviewToProgram}
                disabled={
                  transitioning ||
                  !localPreviewScene ||
                  localPreviewScene === status.currentScene
                }
              >
                <ChevronRight size={14} />
                {transitioning ? 'Transitioning…' : 'Transition'}
              </button>
            </div>
          </>
        ) : (
          <div className="status-card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-neutral-500 uppercase tracking-wider">
                Live
              </p>
              <button
                className="icon-btn text-neutral-500 hover:text-sky-400 disabled:opacity-40"
                onClick={onRefreshLivePreview}
                disabled={previewLoading}
                title="Refresh live feed"
              >
                <RefreshCw
                  size={12}
                  className={previewLoading ? 'animate-spin' : undefined}
                />
              </button>
            </div>

            <div className="relative w-full aspect-video overflow-hidden rounded-md border border-neutral-700 bg-neutral-900">
              {livePreview ? (
                <img
                  src={livePreview}
                  alt="Live feed"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-neutral-500">
                  {previewLoading ? 'Loading live feed…' : 'No live feed yet'}
                </div>
              )}
            </div>

            {previewError && (
              <p className="text-[11px] text-red-400 mt-2">{previewError}</p>
            )}
          </div>
        )}

        {/* Scenes List */}
        <div className="status-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-neutral-300 uppercase tracking-[0.12em]">
              Scenes
            </p>
            <button
              className="icon-btn text-neutral-500 hover:text-sky-400"
              onClick={() => void obsService.refreshScenes()}
              title="Refresh scenes"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(11.75rem,1fr))] gap-2.5">
            {status.scenes.map((scene: OBSScene) => {
              const isProgram = scene.sceneName === status.currentScene
              const isPreview =
                localStudioMode &&
                scene.sceneName === localPreviewScene &&
                !isProgram

              return (
                <button
                  key={scene.sceneName}
                  className={`text-left rounded-lg border px-3 py-3 min-h-[3.25rem] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60 ${
                    isProgram
                      ? 'border-sky-300/45 bg-sky-500/15 text-sky-200'
                      : isPreview
                        ? 'border-amber-300/40 bg-amber-400/15 text-amber-100'
                        : 'border-neutral-700 bg-neutral-900/60 text-neutral-200 hover:text-white hover:border-neutral-500'
                  }`}
                  onClick={() => onSceneTrigger(scene.sceneName)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm sm:text-base font-semibold leading-tight">
                      {scene.sceneName}
                    </span>
                    {isProgram ? (
                      <span className="rounded-full border border-sky-300/40 bg-sky-300/15 px-2 py-0.5 text-[11px] uppercase tracking-[0.12em] font-bold">
                        Live
                      </span>
                    ) : isPreview ? (
                      <span className="rounded-full border border-amber-300/40 bg-amber-300/15 px-2 py-0.5 text-[11px] uppercase tracking-[0.12em] font-bold">
                        Preview
                      </span>
                    ) : null}
                  </div>
                </button>
              )
            })}
            {status.scenes.length === 0 && (
              <p className="text-sm text-neutral-500 text-center py-4 col-span-full">
                No scenes found
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import { obsService, type OBSScene, type OBSStatus } from '@/services/obs.service'
import { Check, Edit3, Plus, RefreshCw, Trash2, Video, X } from 'lucide-react'

interface OBSSceneManagerViewProps {
  status: OBSStatus
  localStudioMode: boolean
  localPreviewScene: string | null
  renamingScene: string | null
  renameValue: string
  newSceneName: string
  onBack: () => void
  onSelectScene: (sceneName: string) => void
  onDeleteScene: (sceneName: string) => void
  onStartRenameScene: (sceneName: string) => void
  onRenameScene: (oldName: string) => void
  onCancelRenameScene: () => void
  onRenameValueChange: (value: string) => void
  onNewSceneNameChange: (value: string) => void
  onCreateScene: () => void
}

export function OBSSceneManagerView({
  status,
  localStudioMode,
  localPreviewScene,
  renamingScene,
  renameValue,
  newSceneName,
  onBack,
  onSelectScene,
  onDeleteScene,
  onStartRenameScene,
  onRenameScene,
  onCancelRenameScene,
  onRenameValueChange,
  onNewSceneNameChange,
  onCreateScene,
}: OBSSceneManagerViewProps) {
  return (
    <div className="obs-panel h-full flex flex-col">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <button
            className="icon-btn text-neutral-400 hover:text-white"
            onClick={onBack}
          >
            <X size={14} />
          </button>
          <span className="panel-title text-sm">Edit Scenes</span>
        </div>
        <button
          className="icon-btn text-neutral-500 hover:text-sky-400"
          onClick={() => void obsService.refreshScenes()}
          title="Refresh scenes"
        >
          <RefreshCw size={12} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <p className="text-xs text-neutral-500">
          Rename scenes, manage sources, and remove scenes from here.
        </p>

        <div className="space-y-1">
          {status.scenes.map((scene: OBSScene) => {
            const isProgram = scene.sceneName === status.currentScene
            const isPreview =
              localStudioMode &&
              scene.sceneName === localPreviewScene &&
              !isProgram

            return (
              <div
                key={scene.sceneName}
                className={`scene-row ${isProgram ? 'scene-row-active' : ''} ${isPreview ? 'scene-row-preview' : ''}`}
              >
                {renamingScene === scene.sceneName ? (
                  <div className="flex items-center gap-1 flex-1">
                    <input
                      className="connect-input flex-1 py-0.5 text-xs"
                      value={renameValue}
                      onChange={(e) => onRenameValueChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') onRenameScene(scene.sceneName)
                        if (e.key === 'Escape') onCancelRenameScene()
                      }}
                      autoFocus
                    />
                    <button
                      className="icon-btn text-green-400"
                      onClick={() => onRenameScene(scene.sceneName)}
                    >
                      <Check size={12} />
                    </button>
                    <button
                      className="icon-btn text-neutral-500"
                      onClick={onCancelRenameScene}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="flex-1 text-sm truncate">
                      {scene.sceneName}
                    </p>
                    <div className="flex items-center gap-1 shrink-0">
                      {isProgram && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-sky-400">
                          PGM
                        </span>
                      )}
                      {isPreview && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                          PVW
                        </span>
                      )}
                      <button
                        className="icon-btn text-neutral-500 hover:text-sky-400"
                        onClick={() => onSelectScene(scene.sceneName)}
                        title="Edit sources"
                      >
                        <Video size={12} />
                      </button>
                      <button
                        className="icon-btn text-neutral-500 hover:text-amber-400"
                        onClick={() => onStartRenameScene(scene.sceneName)}
                        title="Rename"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        className="icon-btn text-neutral-500 hover:text-red-400 disabled:opacity-30"
                        onClick={() => onDeleteScene(scene.sceneName)}
                        disabled={scene.sceneName === status.currentScene}
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )
          })}

          {status.scenes.length === 0 && (
            <p className="text-xs text-neutral-600 text-center py-4">
              No scenes found
            </p>
          )}
        </div>

        {/* Create Scene */}
        <div className="flex gap-2 mt-2">
          <input
            className="connect-input flex-1 text-xs"
            value={newSceneName}
            onChange={(e) => onNewSceneNameChange(e.target.value)}
            placeholder="New scene name…"
            onKeyDown={(e) => e.key === 'Enter' && onCreateScene()}
          />
          <button
            className="icon-btn text-sky-400 border border-sky-400/30 rounded px-2 hover:bg-sky-400/10"
            onClick={onCreateScene}
            title="Create scene"
          >
            <Plus size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

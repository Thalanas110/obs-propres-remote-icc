import type { OBSSceneItem } from '@/services/obs.service'
import {
  Check,
  ChevronDown,
  ChevronUp,
  Edit3,
  Eye,
  EyeOff,
  Globe,
  Plus,
  RefreshCw,
  Trash2,
  Video,
  X,
} from 'lucide-react'

interface OBSSceneSourcesViewProps {
  selectedScene: string | null
  sceneItems: OBSSceneItem[]
  loadingItems: boolean
  itemActionError: string | null
  renamingItemId: number | null
  renameItemValue: string
  onBack: () => void
  onRefresh: () => void
  onAddSource: () => void
  onToggleVisibility: (item: OBSSceneItem) => void
  onMoveItem: (item: OBSSceneItem, direction: 'up' | 'down') => void
  onStartRenameItem: (item: OBSSceneItem) => void
  onRenameItem: (item: OBSSceneItem) => void
  onCancelRenameItem: () => void
  onRenameItemValueChange: (value: string) => void
  onEditBrowserSource: (item: OBSSceneItem) => void
  onRemoveItem: (item: OBSSceneItem) => void
}

export function OBSSceneSourcesView({
  selectedScene,
  sceneItems,
  loadingItems,
  itemActionError,
  renamingItemId,
  renameItemValue,
  onBack,
  onRefresh,
  onAddSource,
  onToggleVisibility,
  onMoveItem,
  onStartRenameItem,
  onRenameItem,
  onCancelRenameItem,
  onRenameItemValueChange,
  onEditBrowserSource,
  onRemoveItem,
}: OBSSceneSourcesViewProps) {
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
          <span className="panel-title text-sm">{selectedScene}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="icon-btn text-neutral-500 hover:text-sky-400"
            onClick={onRefresh}
            title="Refresh sources"
          >
            <RefreshCw size={12} />
          </button>
          <button
            className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 bg-transparent border-none cursor-pointer"
            onClick={onAddSource}
          >
            <Plus size={12} /> Add Source
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {itemActionError && (
          <p className="text-[11px] text-red-400 mb-3">{itemActionError}</p>
        )}

        {loadingItems ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw size={16} className="animate-spin text-neutral-500" />
          </div>
        ) : (
          <div className="space-y-1">
            {sceneItems.map((item, index) => (
              <div key={item.sceneItemId} className="source-row">
                {renamingItemId === item.sceneItemId ? (
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    <input
                      className="connect-input flex-1 py-0.5 text-xs"
                      value={renameItemValue}
                      onChange={(e) => onRenameItemValueChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') onRenameItem(item)
                        if (e.key === 'Escape') onCancelRenameItem()
                      }}
                      autoFocus
                    />
                    <button
                      className="icon-btn text-green-400"
                      onClick={() => onRenameItem(item)}
                      title="Save name"
                    >
                      <Check size={12} />
                    </button>
                    <button
                      className="icon-btn text-neutral-500"
                      onClick={onCancelRenameItem}
                      title="Cancel rename"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {item.inputKind === 'browser_source' ? (
                        <Globe size={13} className="text-sky-400 shrink-0" />
                      ) : (
                        <Video size={13} className="text-neutral-500 shrink-0" />
                      )}
                      <span
                        className={`text-xs truncate ${
                          item.sceneItemEnabled
                            ? 'text-neutral-300'
                            : 'text-neutral-500 line-through'
                        }`}
                      >
                        {item.sourceName}
                      </span>
                      <span className="text-xs text-neutral-600 shrink-0">
                        {item.inputKind || 'source'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        className="icon-btn text-neutral-500 hover:text-white disabled:opacity-30"
                        onClick={() => onMoveItem(item, 'up')}
                        disabled={index === 0}
                        title="Move up"
                      >
                        <ChevronUp size={12} />
                      </button>
                      <button
                        className="icon-btn text-neutral-500 hover:text-white disabled:opacity-30"
                        onClick={() => onMoveItem(item, 'down')}
                        disabled={index === sceneItems.length - 1}
                        title="Move down"
                      >
                        <ChevronDown size={12} />
                      </button>
                      <button
                        className={`icon-btn ${
                          item.sceneItemEnabled
                            ? 'text-neutral-500 hover:text-amber-300'
                            : 'text-amber-400 hover:text-amber-300'
                        }`}
                        onClick={() => onToggleVisibility(item)}
                        title={item.sceneItemEnabled ? 'Hide source' : 'Show source'}
                      >
                        {item.sceneItemEnabled ? (
                          <Eye size={12} />
                        ) : (
                          <EyeOff size={12} />
                        )}
                      </button>
                      {item.inputKind === 'browser_source' && (
                        <button
                          className="icon-btn text-neutral-500 hover:text-sky-400"
                          onClick={() => onEditBrowserSource(item)}
                          title="Edit browser source"
                        >
                          <Edit3 size={12} />
                        </button>
                      )}
                      <button
                        className="icon-btn text-neutral-500 hover:text-amber-400"
                        onClick={() => onStartRenameItem(item)}
                        title="Rename source"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        className="icon-btn text-neutral-500 hover:text-red-400"
                        onClick={() => onRemoveItem(item)}
                        title="Remove source"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {sceneItems.length === 0 && (
              <p className="text-xs text-neutral-600 text-center py-8">
                No sources in this scene
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

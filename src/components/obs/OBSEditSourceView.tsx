import type { OBSSceneItem } from '@/services/obs.service'
import { Check, Globe, X } from 'lucide-react'

interface OBSEditSourceViewProps {
  editingItem: OBSSceneItem
  editBsUrl: string
  bsWidth: number
  bsHeight: number
  onBack: () => void
  onUrlChange: (value: string) => void
  onWidthChange: (value: number) => void
  onHeightChange: (value: number) => void
  onUpdate: () => void
}

export function OBSEditSourceView({
  editingItem,
  editBsUrl,
  bsWidth,
  bsHeight,
  onBack,
  onUrlChange,
  onWidthChange,
  onHeightChange,
  onUpdate,
}: OBSEditSourceViewProps) {
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
          <Globe size={14} className="text-sky-400" />
          <span className="panel-title text-sm">
            Edit: {editingItem.sourceName}
          </span>
        </div>
      </div>
      <div className="flex-1 p-4 space-y-3">
        <div className="connect-form-group">
          <label className="connect-label">URL</label>
          <input
            className="connect-input"
            value={editBsUrl}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://…"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="connect-form-group">
            <label className="connect-label">Width</label>
            <input
              className="connect-input"
              type="number"
              value={bsWidth}
              onChange={(e) => onWidthChange(Number(e.target.value))}
            />
          </div>
          <div className="connect-form-group">
            <label className="connect-label">Height</label>
            <input
              className="connect-input"
              type="number"
              value={bsHeight}
              onChange={(e) => onHeightChange(Number(e.target.value))}
            />
          </div>
        </div>
        <button className="connect-btn w-full mt-2" onClick={onUpdate}>
          <Check size={14} /> Update Source
        </button>
      </div>
    </div>
  )
}

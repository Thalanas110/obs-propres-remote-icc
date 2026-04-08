import { Globe, Plus, X } from 'lucide-react'
import { formatInputKindOptionLabel } from './types'

interface OBSAddSourceViewProps {
  availableInputKinds: string[]
  selectedInputKind: string
  loadingInputKinds: boolean
  bsName: string
  bsUrl: string
  bsWidth: number
  bsHeight: number
  addSourceError: string | null
  onBack: () => void
  onInputKindChange: (value: string) => void
  onNameChange: (value: string) => void
  onUrlChange: (value: string) => void
  onWidthChange: (value: number) => void
  onHeightChange: (value: number) => void
  onAddSource: () => void
}

export function OBSAddSourceView({
  availableInputKinds,
  selectedInputKind,
  loadingInputKinds,
  bsName,
  bsUrl,
  bsWidth,
  bsHeight,
  addSourceError,
  onBack,
  onInputKindChange,
  onNameChange,
  onUrlChange,
  onWidthChange,
  onHeightChange,
  onAddSource,
}: OBSAddSourceViewProps) {
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
          <span className="panel-title text-sm">Add Source</span>
        </div>
      </div>
      <div className="flex-1 p-4 space-y-3">
        <div className="connect-form-group">
          <label className="connect-label">Source Type</label>
          <select
            className="connect-input"
            value={selectedInputKind}
            onChange={(e) => onInputKindChange(e.target.value)}
            disabled={loadingInputKinds}
          >
            {availableInputKinds.map((inputKind) => (
              <option key={inputKind} value={inputKind}>
                {formatInputKindOptionLabel(inputKind)}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-neutral-600 mt-1 font-mono">
            {selectedInputKind}
          </p>
        </div>

        <div className="connect-form-group">
          <label className="connect-label">Source Name</label>
          <input
            className="connect-input"
            value={bsName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="My Source"
          />
        </div>

        {selectedInputKind === 'browser_source' && (
          <>
            <div className="connect-form-group">
              <label className="connect-label">URL</label>
              <input
                className="connect-input"
                value={bsUrl}
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
          </>
        )}

        {addSourceError && (
          <p className="text-[11px] text-red-400">{addSourceError}</p>
        )}

        <button
          className="connect-btn w-full mt-2"
          onClick={onAddSource}
          disabled={loadingInputKinds}
        >
          <Plus size={14} /> Add Source
        </button>

        {loadingInputKinds && (
          <p className="text-[11px] text-neutral-500 text-center">
            Loading available OBS source types…
          </p>
        )}
      </div>
    </div>
  )
}

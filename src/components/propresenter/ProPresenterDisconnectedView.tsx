import type { ProPresenterDiscoveredHost } from '@/services/propresenter.service'
import { Lock, Presentation, RefreshCw, Server, Wifi, WifiOff } from 'lucide-react'

interface ProPresenterDisconnectedViewProps {
  protocol: 'http' | 'https'
  host: string
  port: number
  normalizedHost: string
  connecting: boolean
  scanningNetwork: boolean
  scanResults: ProPresenterDiscoveredHost[]
  scanAttempts: number
  connError: string | null
  scanError: string | null
  onProtocolChange: (protocol: 'http' | 'https') => void
  onHostChange: (value: string) => void
  onPortChange: (value: number) => void
  onConnect: () => void
  onScanNetwork: () => void
  onConnectToDiscoveredHost: (candidate: ProPresenterDiscoveredHost) => void
}

export function ProPresenterDisconnectedView({
  protocol,
  host,
  port,
  normalizedHost,
  connecting,
  scanningNetwork,
  scanResults,
  scanAttempts,
  connError,
  scanError,
  onProtocolChange,
  onHostChange,
  onPortChange,
  onConnect,
  onScanNetwork,
  onConnectToDiscoveredHost,
}: ProPresenterDisconnectedViewProps) {
  return (
    <div className="pp-panel h-full flex flex-col">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Presentation size={16} className="text-violet-400" />
          <span className="panel-title">ProPresenter</span>
        </div>
        <div className="flex items-center gap-1.5">
          <WifiOff size={13} className="text-neutral-500" />
          <span className="text-xs text-neutral-500">Disconnected</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 gap-4">
        <div className="w-full max-w-xs space-y-3">
          <div className="grid grid-cols-[2fr,1fr] gap-2">
            <div className="connect-form-group">
              <label className="connect-label">Conn Type</label>
              <div className="flex rounded overflow-hidden border border-neutral-700">
                <button
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors ${
                    protocol === 'http'
                      ? 'bg-violet-500/20 text-violet-400'
                      : 'bg-neutral-800 text-neutral-500 hover:text-neutral-300'
                  }`}
                  onClick={() => onProtocolChange('http')}
                >
                  http://
                </button>
                <button
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors border-l border-neutral-700 ${
                    protocol === 'https'
                      ? 'bg-violet-500/20 text-violet-400'
                      : 'bg-neutral-800 text-neutral-500 hover:text-neutral-300'
                  }`}
                  onClick={() => onProtocolChange('https')}
                >
                  <Lock size={10} /> https://
                </button>
              </div>
            </div>

            <div className="connect-form-group">
              <label className="connect-label">Port</label>
              <input
                className="connect-input"
                type="number"
                value={port}
                onChange={(event) => onPortChange(Number(event.target.value))}
                placeholder="443"
              />
            </div>
          </div>

          <div className="connect-form-group">
            <label className="connect-label">URL</label>
            <input
              className="connect-input"
              value={host}
              onChange={(event) => onHostChange(event.target.value)}
              placeholder="localhost"
            />
          </div>

          <p className="text-xs text-neutral-600 font-mono text-center">
            {protocol}://{normalizedHost || host}:{port}
          </p>

          {connError && (
            <p className="text-xs text-red-400 text-center">{connError}</p>
          )}

          <div className="space-y-2 rounded-md border border-neutral-800 bg-neutral-900/40 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                Network Scan
              </span>
              <button
                className="connect-btn px-2.5 py-1.5 text-[11px]"
                onClick={onScanNetwork}
                disabled={connecting || scanningNetwork}
              >
                {scanningNetwork ? (
                  <RefreshCw size={12} className="animate-spin" />
                ) : (
                  <Server size={12} />
                )}
                {scanningNetwork ? 'Scanning...' : 'Scan Network'}
              </button>
            </div>

            {scanningNetwork && (
              <p className="text-xs text-neutral-400">
                Scanning local network for available PCs...
              </p>
            )}

            {!scanningNetwork && scanAttempts > 0 && scanResults.length === 0 && !scanError && (
              <p className="text-xs text-neutral-500">
                No available PCs were found on this network.
              </p>
            )}

            {scanError && <p className="text-xs text-red-400">{scanError}</p>}

            {scanResults.length > 0 && (
              <div className="max-h-32 space-y-1 overflow-y-auto pr-1">
                {scanResults.map((candidate) => {
                  const candidateKey = `${candidate.protocol}://${candidate.host}:${candidate.port}`

                  return (
                    <button
                      key={candidateKey}
                      className="flex w-full items-center justify-between gap-2 rounded border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-left text-xs transition-colors hover:border-violet-500/40 hover:bg-violet-500/10"
                      onClick={() => onConnectToDiscoveredHost(candidate)}
                      disabled={connecting}
                    >
                      <span className="font-mono text-neutral-300">
                        {candidateKey}
                      </span>
                      <span className="text-[11px] text-violet-300">Connect</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <button
            className="connect-btn w-full"
            onClick={onConnect}
            disabled={connecting}
          >
            {connecting ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Wifi size={14} />
            )}
            {connecting ? 'Connecting...' : 'Connect to ProPresenter'}
          </button>

          <p className="text-xs text-neutral-600 text-center">
            Enable API in ProPresenter -&gt; Preferences -&gt; Network
          </p>
        </div>
      </div>
    </div>
  )
}

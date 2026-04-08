import { Lock, Monitor, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface OBSDisconnectedViewProps {
  protocol: 'ws' | 'wss'
  host: string
  port: number
  normalizedHost: string
  password: string
  connecting: boolean
  showConnectionErrorModal: boolean
  onProtocolChange: (protocol: 'ws' | 'wss') => void
  onHostChange: (value: string) => void
  onPortChange: (value: number) => void
  onPasswordChange: (value: string) => void
  onConnect: () => void
  onConnectionErrorModalChange: (open: boolean) => void
}

export function OBSDisconnectedView({
  protocol,
  host,
  port,
  normalizedHost,
  password,
  connecting,
  showConnectionErrorModal,
  onProtocolChange,
  onHostChange,
  onPortChange,
  onPasswordChange,
  onConnect,
  onConnectionErrorModalChange,
}: OBSDisconnectedViewProps) {
  return (
    <div className="obs-panel h-full flex flex-col">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Monitor size={16} className="text-sky-400" />
          <span className="panel-title">OBS Studio</span>
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
                    protocol === 'ws'
                      ? 'bg-sky-500/20 text-sky-400'
                      : 'bg-neutral-800 text-neutral-500 hover:text-neutral-300'
                  }`}
                  onClick={() => onProtocolChange('ws')}
                >
                  ws://
                </button>
                <button
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors border-l border-neutral-700 ${
                    protocol === 'wss'
                      ? 'bg-sky-500/20 text-sky-400'
                      : 'bg-neutral-800 text-neutral-500 hover:text-neutral-300'
                  }`}
                  onClick={() => onProtocolChange('wss')}
                >
                  <Lock size={10} /> wss://
                </button>
              </div>
            </div>

            <div className="connect-form-group">
              <label className="connect-label">Port</label>
              <input
                className="connect-input"
                type="number"
                value={port}
                onChange={(e) => onPortChange(Number(e.target.value))}
                placeholder="443"
              />
            </div>
          </div>

          <div className="connect-form-group">
            <label className="connect-label">URL</label>
            <input
              className="connect-input"
              value={host}
              onChange={(e) => onHostChange(e.target.value)}
              placeholder="localhost"
            />
          </div>

          <div className="connect-form-group">
            <label className="connect-label">Password</label>
            <input
              className="connect-input"
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="Optional"
            />
          </div>
          {/* Preview URL */}
          <p className="text-xs text-neutral-600 font-mono text-center">
            {protocol}://{normalizedHost || host}:{port}
          </p>
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
            {connecting ? 'Connecting…' : 'Connect to OBS'}
          </button>
        </div>

        <AlertDialog
          open={showConnectionErrorModal}
          onOpenChange={onConnectionErrorModalChange}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Connection error</AlertDialogTitle>
              <AlertDialogDescription>
                An error occured
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

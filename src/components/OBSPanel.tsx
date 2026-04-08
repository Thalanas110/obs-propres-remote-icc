import { useState, useEffect, useCallback, useRef } from 'react'
import { obsService, type OBSSceneItem } from '@/services/obs.service'
import { OBSDisconnectedView } from '@/components/obs/OBSDisconnectedView'
import { OBSMainView } from '@/components/obs/OBSMainView'
import { OBSSceneManagerView } from '@/components/obs/OBSSceneManagerView'
import { OBSSceneSourcesView } from '@/components/obs/OBSSceneSourcesView'
import { OBSAddSourceView } from '@/components/obs/OBSAddSourceView'
import { OBSEditSourceView } from '@/components/obs/OBSEditSourceView'
import {
  FALLBACK_OBS_INPUT_KINDS,
  LOCAL_STUDIO_MODE_STORAGE_KEY,
  type OBSView,
} from '@/components/obs/types'

export function OBSPanel() {
  const [status, setStatus] = useState(obsService.status)
  const [protocol, setProtocol] = useState<'ws' | 'wss'>('ws')
  const [host, setHost] = useState('localhost')
  const [port, setPort] = useState(4455)
  const [password, setPassword] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [showConnectionErrorModal, setShowConnectionErrorModal] =
    useState(false)
  const [localStudioMode, setLocalStudioMode] = useState(false)
  const [localStudioModeReady, setLocalStudioModeReady] = useState(false)
  const [localPreviewScene, setLocalPreviewScene] = useState<string | null>(
    null,
  )
  const [localPreviewFrame, setLocalPreviewFrame] = useState<string | null>(
    null,
  )
  const [localPreviewLoading, setLocalPreviewLoading] = useState(false)
  const [localPreviewError, setLocalPreviewError] = useState<string | null>(
    null,
  )
  const [studioActionError, setStudioActionError] = useState<string | null>(
    null,
  )
  const [transitioning, setTransitioning] = useState(false)

  const normalizedHost = host
    .trim()
    .replace(/^\w+:\/\//i, '')
    .replace(/\/.*$/, '')
    .replace(/:\d+$/, '')

  // Scene management
  const [selectedScene, setSelectedScene] = useState<string | null>(null)
  const [sceneItems, setSceneItems] = useState<OBSSceneItem[]>([])
  const [loadingItems, setLoadingItems] = useState(false)
  const [view, setView] = useState<OBSView>('main')

  // Create scene
  const [newSceneName, setNewSceneName] = useState('')
  const [renamingScene, setRenamingScene] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [renamingItemId, setRenamingItemId] = useState<number | null>(null)
  const [renameItemValue, setRenameItemValue] = useState('')
  const [itemActionError, setItemActionError] = useState<string | null>(null)

  // Source creation
  const [bsName, setBsName] = useState('')
  const [selectedInputKind, setSelectedInputKind] =
    useState('browser_source')
  const [availableInputKinds, setAvailableInputKinds] = useState<string[]>(
    FALLBACK_OBS_INPUT_KINDS,
  )
  const [loadingInputKinds, setLoadingInputKinds] = useState(false)
  const [addSourceError, setAddSourceError] = useState<string | null>(null)
  const [bsUrl, setBsUrl] = useState('')
  const [bsWidth, setBsWidth] = useState(1920)
  const [bsHeight, setBsHeight] = useState(1080)
  const [editingItem, setEditingItem] = useState<OBSSceneItem | null>(null)
  const [editBsUrl, setEditBsUrl] = useState('')
  const [livePreview, setLivePreview] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const previewRequestRef = useRef(0)
  const localPreviewRequestRef = useRef(0)

  useEffect(() => {
    const unsub = obsService.subscribe(() =>
      setStatus({ ...obsService.status }),
    )
    return unsub
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    setLocalStudioMode(
      window.localStorage.getItem(LOCAL_STUDIO_MODE_STORAGE_KEY) === '1',
    )
    setLocalStudioModeReady(true)
  }, [])

  useEffect(() => {
    if (!localStudioModeReady || typeof window === 'undefined') return
    window.localStorage.setItem(
      LOCAL_STUDIO_MODE_STORAGE_KEY,
      localStudioMode ? '1' : '0',
    )
  }, [localStudioMode, localStudioModeReady])

  useEffect(() => {
    if (view !== 'addSource' || !status.connected) return

    let active = true
    setLoadingInputKinds(true)

    void obsService
      .getInputKinds()
      .then((inputKinds) => {
        if (!active) return

        const nextKinds =
          inputKinds.length > 0
            ? inputKinds
            : FALLBACK_OBS_INPUT_KINDS

        setAvailableInputKinds(nextKinds)
        setSelectedInputKind((current) => {
          if (nextKinds.includes(current)) return current
          if (nextKinds.includes('browser_source')) return 'browser_source'
          return nextKinds[0] ?? 'browser_source'
        })
      })
      .finally(() => {
        if (active) {
          setLoadingInputKinds(false)
        }
      })

    return () => {
      active = false
    }
  }, [view, status.connected])

  const refreshLivePreview = useCallback(
    async (showLoading = false) => {
      if (!status.connected || !status.currentScene) {
        setLivePreview(null)
        setPreviewError(null)
        setPreviewLoading(false)
        return
      }

      const requestId = ++previewRequestRef.current
      if (showLoading) setPreviewLoading(true)

      try {
        const frame = await obsService.getProgramSceneScreenshot(960, 540, 70)
        if (requestId !== previewRequestRef.current) return

        if (frame) {
          setLivePreview(frame)
          setPreviewError(null)
        } else {
          setPreviewError('No frame available for the active scene.')
        }
      } catch (err) {
        if (requestId !== previewRequestRef.current) return
        setPreviewError(
          (err as Error).message || 'Unable to load preview from OBS.',
        )
      } finally {
        if (requestId === previewRequestRef.current) {
          setPreviewLoading(false)
        }
      }
    },
    [status.connected, status.currentScene],
  )

  const refreshLocalPreview = useCallback(
    async (showLoading = false) => {
      if (!status.connected || !localStudioMode || !localPreviewScene) {
        setLocalPreviewFrame(null)
        setLocalPreviewError(null)
        setLocalPreviewLoading(false)
        return
      }

      const requestId = ++localPreviewRequestRef.current
      if (showLoading) setLocalPreviewLoading(true)

      try {
        const frame = await obsService.getSceneScreenshot(
          localPreviewScene,
          960,
          540,
          70,
        )

        if (requestId !== localPreviewRequestRef.current) return

        if (frame) {
          setLocalPreviewFrame(frame)
          setLocalPreviewError(null)
        } else {
          setLocalPreviewError(
            'No frame available for the selected preview scene.',
          )
        }
      } catch (err) {
        if (requestId !== localPreviewRequestRef.current) return
        setLocalPreviewError(
          (err as Error).message || 'Unable to load local preview from OBS.',
        )
      } finally {
        if (requestId === localPreviewRequestRef.current) {
          setLocalPreviewLoading(false)
        }
      }
    },
    [status.connected, localStudioMode, localPreviewScene],
  )

  useEffect(() => {
    if (!status.connected || !status.currentScene) {
      previewRequestRef.current += 1
      setLivePreview(null)
      setPreviewError(null)
      setPreviewLoading(false)
      return
    }

    void refreshLivePreview(true)
    const intervalId = window.setInterval(() => {
      void refreshLivePreview()
    }, 1500)

    return () => {
      previewRequestRef.current += 1
      window.clearInterval(intervalId)
    }
  }, [status.connected, status.currentScene, refreshLivePreview])

  useEffect(() => {
    if (!status.connected) {
      localPreviewRequestRef.current += 1
      setLocalPreviewScene(null)
      setLocalPreviewFrame(null)
      setLocalPreviewError(null)
      setLocalPreviewLoading(false)
      return
    }

    if (!localStudioMode) {
      localPreviewRequestRef.current += 1
      setLocalPreviewFrame(null)
      setLocalPreviewError(null)
      setLocalPreviewLoading(false)
      return
    }

    if (status.scenes.length === 0) {
      setLocalPreviewScene(null)
      return
    }

    const sceneExists =
      localPreviewScene &&
      status.scenes.some((scene) => scene.sceneName === localPreviewScene)

    if (sceneExists) return

    const fallbackScene =
      status.scenes.find((scene) => scene.sceneName !== status.currentScene)
        ?.sceneName ??
      status.currentScene ??
      status.scenes[0]?.sceneName ??
      null

    setLocalPreviewScene(fallbackScene)
  }, [
    status.connected,
    status.scenes,
    status.currentScene,
    localStudioMode,
    localPreviewScene,
  ])

  useEffect(() => {
    if (!status.connected || !localStudioMode || !localPreviewScene) {
      localPreviewRequestRef.current += 1
      setLocalPreviewFrame(null)
      setLocalPreviewError(null)
      setLocalPreviewLoading(false)
      return
    }

    void refreshLocalPreview(true)
    const intervalId = window.setInterval(() => {
      void refreshLocalPreview()
    }, 1500)

    return () => {
      localPreviewRequestRef.current += 1
      window.clearInterval(intervalId)
    }
  }, [
    status.connected,
    localStudioMode,
    localPreviewScene,
    refreshLocalPreview,
  ])

  const handleConnect = async () => {
    setConnecting(true)
    setShowConnectionErrorModal(false)
    setStudioActionError(null)
    const result = await obsService.connect(
      normalizedHost || host,
      port,
      password,
      protocol,
    )
    if (!result.success) setShowConnectionErrorModal(true)
    setConnecting(false)
  }

  const handleDisconnect = async () => {
    await obsService.disconnect()
    setStudioActionError(null)
  }

  const handleToggleLocalStudioMode = () => {
    setStudioActionError(null)
    setLocalStudioMode((current) => !current)
  }

  const handleSceneTrigger = async (sceneName: string) => {
    setStudioActionError(null)
    if (localStudioMode) {
      setLocalPreviewScene(sceneName)
      void refreshLocalPreview(true)
      return
    }
    await obsService.switchScene(sceneName)
  }

  const handleTakePreviewToProgram = async () => {
    if (!localPreviewScene || localPreviewScene === status.currentScene) return

    const previousProgramScene = status.currentScene
    const nextProgramScene = localPreviewScene

    setTransitioning(true)
    setStudioActionError(null)

    try {
      await obsService.switchScene(nextProgramScene)

      const sceneToReturnToPreview = previousProgramScene || null

      if (sceneToReturnToPreview) {
        setLocalPreviewScene(sceneToReturnToPreview)
      }

      await Promise.all([refreshLivePreview(), refreshLocalPreview()])
    } catch (err) {
      setStudioActionError(
        (err as Error).message ||
          'Unable to transition the local preview scene to program.',
      )
    } finally {
      setTransitioning(false)
    }
  }

  const loadSceneItems = useCallback(async (sceneName: string) => {
    setLoadingItems(true)
    const items = await obsService.getSceneItems(sceneName)
    setSceneItems(items)
    setLoadingItems(false)
  }, [])

  const handleSelectScene = async (sceneName: string) => {
    setItemActionError(null)
    setAddSourceError(null)
    setRenamingItemId(null)
    setRenameItemValue('')
    setSelectedScene(sceneName)
    await loadSceneItems(sceneName)
    setView('scenes')
  }

  const handleCreateScene = async () => {
    if (!newSceneName.trim()) return
    await obsService.createScene(newSceneName.trim())
    setNewSceneName('')
    await obsService.refreshScenes()
  }

  const handleDeleteScene = async (sceneName: string) => {
    if (sceneName === status.currentScene) return
    await obsService.removeScene(sceneName)
    await obsService.refreshScenes()
    if (localPreviewScene === sceneName) {
      setLocalPreviewScene(null)
      setLocalPreviewFrame(null)
    }
    if (selectedScene === sceneName) {
      setSelectedScene(null)
      setView('sceneManager')
    }
  }

  const handleRenameScene = async (oldName: string) => {
    if (!renameValue.trim() || renameValue === oldName) {
      setRenamingScene(null)
      return
    }
    await obsService.renameScene(oldName, renameValue.trim())
    await obsService.refreshScenes()
    setRenamingScene(null)
  }

  const handleAddSource = async () => {
    if (!selectedScene || !bsName.trim() || !selectedInputKind.trim()) return

    if (!availableInputKinds.includes(selectedInputKind)) {
      setAddSourceError(
        'This source type is not available in your current OBS session.',
      )
      return
    }

    const inputSettings: Record<string, unknown> = {}

    if (selectedInputKind === 'browser_source') {
      if (!bsUrl.trim()) {
        setAddSourceError('A URL is required for Browser Source.')
        return
      }

      inputSettings.url = bsUrl.trim()
      inputSettings.width = Math.max(Math.floor(bsWidth), 1)
      inputSettings.height = Math.max(Math.floor(bsHeight), 1)
    }

    setAddSourceError(null)

    try {
      await obsService.createInputSource(
        selectedScene,
        bsName.trim(),
        selectedInputKind,
        inputSettings,
      )
      await loadSceneItems(selectedScene)
      setBsName('')
      setBsUrl('')
      setView('scenes')
    } catch (err) {
      setAddSourceError(
        (err as Error).message || 'Unable to create this source right now.',
      )
    }
  }

  const handleUpdateBrowserSource = async () => {
    if (!editingItem) return
    await obsService.updateBrowserSource(
      editingItem.sourceName,
      editBsUrl,
      bsWidth,
      bsHeight,
    )
    if (selectedScene) await loadSceneItems(selectedScene)
    setView('scenes')
  }

  const handleRemoveItem = async (item: OBSSceneItem) => {
    if (!selectedScene) return
    setItemActionError(null)

    try {
      await obsService.removeSceneItem(selectedScene, item.sceneItemId)
      await loadSceneItems(selectedScene)
    } catch (err) {
      setItemActionError(
        (err as Error).message || 'Unable to remove this source right now.',
      )
    }
  }

  const handleToggleItemVisibility = async (item: OBSSceneItem) => {
    if (!selectedScene) return
    setItemActionError(null)

    try {
      await obsService.setSceneItemEnabled(
        selectedScene,
        item.sceneItemId,
        !item.sceneItemEnabled,
      )
      await loadSceneItems(selectedScene)
    } catch (err) {
      setItemActionError(
        (err as Error).message ||
          'Unable to change visibility for this source.',
      )
    }
  }

  const handleMoveItem = async (
    item: OBSSceneItem,
    direction: 'up' | 'down',
  ) => {
    if (!selectedScene) return

    const currentListIndex = sceneItems.findIndex(
      (sceneItem) => sceneItem.sceneItemId === item.sceneItemId,
    )

    if (currentListIndex < 0) return

    const targetListIndex =
      direction === 'up' ? currentListIndex - 1 : currentListIndex + 1

    if (targetListIndex < 0 || targetListIndex >= sceneItems.length) return

    const targetItem = sceneItems[targetListIndex]
    setItemActionError(null)

    try {
      await obsService.setSceneItemIndex(
        selectedScene,
        item.sceneItemId,
        targetItem.sceneItemIndex,
      )
      await loadSceneItems(selectedScene)
    } catch (err) {
      setItemActionError(
        (err as Error).message || 'Unable to reorder this source right now.',
      )
    }
  }

  const handleStartRenameItem = (item: OBSSceneItem) => {
    setItemActionError(null)
    setRenamingItemId(item.sceneItemId)
    setRenameItemValue(item.sourceName)
  }

  const handleRenameItem = async (item: OBSSceneItem) => {
    if (!selectedScene) return

    const nextName = renameItemValue.trim()

    if (!nextName || nextName === item.sourceName) {
      setRenamingItemId(null)
      return
    }

    setItemActionError(null)

    try {
      await obsService.renameSource(item.sourceName, nextName)
      await obsService.refreshScenes()

      const nextSelectedScene =
        selectedScene === item.sourceName ? nextName : selectedScene

      if (nextSelectedScene !== selectedScene) {
        setSelectedScene(nextSelectedScene)
      }

      await loadSceneItems(nextSelectedScene)
      setRenamingItemId(null)
      setRenameItemValue('')
    } catch (err) {
      setItemActionError(
        (err as Error).message || 'Unable to rename this source right now.',
      )
    }
  }


  // ── Render ─────────────────────────────────────────────────────────────────
  if (!status.connected) {
    return (
      <OBSDisconnectedView
        protocol={protocol}
        host={host}
        port={port}
        normalizedHost={normalizedHost}
        password={password}
        connecting={connecting}
        showConnectionErrorModal={showConnectionErrorModal}
        onProtocolChange={setProtocol}
        onHostChange={setHost}
        onPortChange={setPort}
        onPasswordChange={setPassword}
        onConnect={() => void handleConnect()}
        onConnectionErrorModalChange={setShowConnectionErrorModal}
      />
    )
  }

  if (view === 'main') {
    return (
      <OBSMainView
        status={status}
        localStudioMode={localStudioMode}
        localPreviewScene={localPreviewScene}
        localPreviewFrame={localPreviewFrame}
        localPreviewLoading={localPreviewLoading}
        localPreviewError={localPreviewError}
        livePreview={livePreview}
        previewLoading={previewLoading}
        previewError={previewError}
        studioActionError={studioActionError}
        transitioning={transitioning}
        onDisconnect={() => void handleDisconnect()}
        onToggleLocalStudioMode={handleToggleLocalStudioMode}
        onSceneTrigger={(name) => void handleSceneTrigger(name)}
        onRefreshLivePreview={() => void refreshLivePreview(true)}
        onRefreshLocalPreview={() => void refreshLocalPreview(true)}
        onTakePreviewToProgram={() => void handleTakePreviewToProgram()}
        onEditScenes={() => setView('sceneManager')}
      />
    )
  }

  if (view === 'sceneManager') {
    return (
      <OBSSceneManagerView
        status={status}
        localStudioMode={localStudioMode}
        localPreviewScene={localPreviewScene}
        renamingScene={renamingScene}
        renameValue={renameValue}
        newSceneName={newSceneName}
        onBack={() => setView('main')}
        onSelectScene={(name) => void handleSelectScene(name)}
        onDeleteScene={(name) => void handleDeleteScene(name)}
        onStartRenameScene={(name) => {
          setRenamingScene(name)
          setRenameValue(name)
        }}
        onRenameScene={(oldName) => void handleRenameScene(oldName)}
        onCancelRenameScene={() => setRenamingScene(null)}
        onRenameValueChange={setRenameValue}
        onNewSceneNameChange={setNewSceneName}
        onCreateScene={() => void handleCreateScene()}
      />
    )
  }

  if (view === 'scenes') {
    return (
      <OBSSceneSourcesView
        selectedScene={selectedScene}
        sceneItems={sceneItems}
        loadingItems={loadingItems}
        itemActionError={itemActionError}
        renamingItemId={renamingItemId}
        renameItemValue={renameItemValue}
        onBack={() => setView('sceneManager')}
        onRefresh={() => selectedScene ? void loadSceneItems(selectedScene) : undefined}
        onAddSource={() => {
          setAddSourceError(null)
          setView('addSource')
        }}
        onToggleVisibility={(item) => void handleToggleItemVisibility(item)}
        onMoveItem={(item, dir) => void handleMoveItem(item, dir)}
        onStartRenameItem={handleStartRenameItem}
        onRenameItem={(item) => void handleRenameItem(item)}
        onCancelRenameItem={() => setRenamingItemId(null)}
        onRenameItemValueChange={setRenameItemValue}
        onEditBrowserSource={(item) => {
          setEditingItem(item)
          setView('editSource')
        }}
        onRemoveItem={(item) => void handleRemoveItem(item)}
      />
    )
  }

  if (view === 'addSource') {
    return (
      <OBSAddSourceView
        availableInputKinds={availableInputKinds}
        selectedInputKind={selectedInputKind}
        loadingInputKinds={loadingInputKinds}
        bsName={bsName}
        bsUrl={bsUrl}
        bsWidth={bsWidth}
        bsHeight={bsHeight}
        addSourceError={addSourceError}
        onBack={() => setView('scenes')}
        onInputKindChange={setSelectedInputKind}
        onNameChange={setBsName}
        onUrlChange={setBsUrl}
        onWidthChange={setBsWidth}
        onHeightChange={setBsHeight}
        onAddSource={() => void handleAddSource()}
      />
    )
  }

  if (view === 'editSource' && editingItem) {
    return (
      <OBSEditSourceView
        editingItem={editingItem}
        editBsUrl={editBsUrl}
        bsWidth={bsWidth}
        bsHeight={bsHeight}
        onBack={() => setView('scenes')}
        onUrlChange={setEditBsUrl}
        onWidthChange={setBsWidth}
        onHeightChange={setBsHeight}
        onUpdate={() => void handleUpdateBrowserSource()}
      />
    )
  }

  return null
}

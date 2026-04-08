export type OBSView = 'main' | 'sceneManager' | 'scenes' | 'addSource' | 'editSource'

export const LOCAL_STUDIO_MODE_STORAGE_KEY = 'obs.localStudioMode.enabled'

export const FALLBACK_OBS_INPUT_KINDS = [
  'browser_source',
  'image_source',
  'ffmpeg_source',
  'slideshow',
  'vlc_source',
  'color_source_v3',
  'text_gdiplus_v2',
  'text_ft2_source_v2',
  'monitor_capture',
  'window_capture',
  'game_capture',
  'dshow_input',
  'v4l2_input',
  'wasapi_input_capture',
  'wasapi_output_capture',
]

export const OBS_INPUT_KIND_LABELS: Record<string, string> = {
  browser_source: 'Browser Source',
  image_source: 'Image',
  ffmpeg_source: 'Media Source',
  slideshow: 'Image Slide Show',
  vlc_source: 'VLC Video Source',
  color_source_v3: 'Color Source',
  text_gdiplus_v2: 'Text (GDI+)',
  text_ft2_source_v2: 'Text (FreeType 2)',
  monitor_capture: 'Display Capture',
  window_capture: 'Window Capture',
  game_capture: 'Game Capture',
  dshow_input: 'Video Capture Device',
  v4l2_input: 'Video Capture Device',
  av_capture_input: 'Video Capture Device',
  av_capture_input_v2: 'Video Capture Device',
  wasapi_input_capture: 'Audio Input Capture',
  wasapi_output_capture: 'Audio Output Capture',
}

export function formatInputKindLabel(inputKind: string): string {
  const key = inputKind.trim()
  if (!key) return 'Source'

  const friendlyLabel = OBS_INPUT_KIND_LABELS[key]
  if (friendlyLabel) return friendlyLabel

  const normalized = key.replace(/_v\d+$/i, '')

  return normalized
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function formatInputKindOptionLabel(inputKind: string): string {
  const friendly = formatInputKindLabel(inputKind)
  return `${friendly} (${inputKind})`
}

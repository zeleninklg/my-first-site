import type { Tool } from '../types/shape'

export const TOOLS: { id: Tool; label: string; hotkey: string }[] = [
  { id: 'select', label: 'Выделение', hotkey: 'V' },
  { id: 'rectangle', label: 'Прямоугольник', hotkey: 'R' },
  { id: 'ellipse', label: 'Эллипс', hotkey: 'O' },
]

export const TOOL_HOTKEYS: Record<string, Tool> = {
  v: 'select',
  r: 'rectangle',
  o: 'ellipse',
}

export const MIN_ZOOM = 0.1
export const MAX_ZOOM = 4
export const ZOOM_STEP = 0.1

export const DEFAULT_FILL = '#4c8dff'
export const MIN_SHAPE_SIZE = 2

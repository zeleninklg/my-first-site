import type { Point, Size, Viewport } from '../types/shape'

export type Bounds = {
  x: number
  y: number
  width: number
  height: number
}

export function screenToCanvas(screen: Point, viewport: Viewport): Point {
  return {
    x: (screen.x - viewport.x) / viewport.zoom,
    y: (screen.y - viewport.y) / viewport.zoom,
  }
}

export function canvasToScreen(canvas: Point, viewport: Viewport): Point {
  return {
    x: canvas.x * viewport.zoom + viewport.x,
    y: canvas.y * viewport.zoom + viewport.y,
  }
}

export function clampZoom(zoom: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, zoom))
}

export function zoomAtPoint(
  viewport: Viewport,
  newZoom: number,
  screenPoint: Point,
): Viewport {
  const zoom = clampZoom(newZoom, 0, Infinity)
  const canvasPoint = screenToCanvas(screenPoint, viewport)
  return {
    zoom,
    x: screenPoint.x - canvasPoint.x * zoom,
    y: screenPoint.y - canvasPoint.y * zoom,
  }
}

export function getShapesBounds(shapes: { x: number; y: number; width: number; height: number }[]): Bounds | null {
  if (shapes.length === 0) return null
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const s of shapes) {
    minX = Math.min(minX, s.x)
    minY = Math.min(minY, s.y)
    maxX = Math.max(maxX, s.x + s.width)
    maxY = Math.max(maxY, s.y + s.height)
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}

export function formatSize(size: Size): string {
  return `${Math.round(size.width)} × ${Math.round(size.height)}`
}

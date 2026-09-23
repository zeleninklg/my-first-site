import { useRef } from 'react'
import { useViewport } from '../hooks/useViewport'
import type { Point, Shape as ShapeModel, Tool } from '../types/shape'
import Shape from './Shape'
import BottomBar from './BottomBar'
import { getShapesBounds } from '../utils/geometry'

type Props = {
  shapes: ShapeModel[]
  draft: ShapeModel | null
  activeTool: Tool
  selectedIds: string[]
  onSelectTool: (tool: Tool) => void
  onSelect: (ids: string[]) => void
  onSelectAt: (id: string) => string[]
  onToggleSelectAt: (id: string) => string[]
  onBeginMove: (screenPoint: Point, ids: string[]) => void
  onMoveMove: (screenPoint: Point, viewport: { x: number; y: number; zoom: number }) => void
  onEndMove: () => void
  onBeginDraw: (kind: 'rectangle' | 'ellipse', screenPoint: Point, viewport: { x: number; y: number; zoom: number }) => void
  onDrawMove: (screenPoint: Point, viewport: { x: number; y: number; zoom: number }) => void
  onDrawEnd: () => void
}

export default function Canvas({
  shapes,
  draft,
  activeTool,
  selectedIds,
  onSelectTool,
  onSelect,
  onSelectAt,
  onToggleSelectAt,
  onBeginMove,
  onMoveMove,
  onEndMove,
  onBeginDraw,
  onDrawMove,
  onDrawEnd,
}: Props) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const isDrawingRef = useRef(false)
  const isMovingRef = useRef(false)
  const { viewport, isPanning, zoomIn, zoomOut, setZoom, zoomToFit, handlers } =
    useViewport(canvasRef)

  const getScreenPoint = (e: React.PointerEvent): Point => {
    const rect = canvasRef.current?.getBoundingClientRect()
    return { x: e.clientX - (rect?.left ?? 0), y: e.clientY - (rect?.top ?? 0) }
  }

  const handleShapePointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation()
    if (activeTool !== 'select') return
    let idsToMove: string[]
    if (e.ctrlKey || e.metaKey) {
      idsToMove = onToggleSelectAt(id)
    } else if (selectedIds.includes(id)) {
      idsToMove = selectedIds
    } else {
      idsToMove = onSelectAt(id)
    }
    if (idsToMove.length === 0) return
    canvasRef.current?.setPointerCapture(e.pointerId)
    isMovingRef.current = true
    onBeginMove(getScreenPoint(e), idsToMove)
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    handlers.onPointerDown(e)
    if (activeTool === 'select') {
      onSelect([])
      return
    }
    e.preventDefault()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    isDrawingRef.current = true
    onBeginDraw(activeTool, getScreenPoint(e), viewport)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    handlers.onPointerMove(e)
    if (isMovingRef.current) {
      onMoveMove(getScreenPoint(e), viewport)
      return
    }
    if (!isDrawingRef.current) return
    onDrawMove(getScreenPoint(e), viewport)
  }

  const handlePointerUp = () => {
    handlers.onPointerUp()
    if (isMovingRef.current) {
      isMovingRef.current = false
      onEndMove()
      return
    }
    if (!isDrawingRef.current) return
    isDrawingRef.current = false
    onDrawEnd()
  }

  const dotSpacing = 50
  const gridSize = dotSpacing * viewport.zoom
  const offsetX = viewport.x % gridSize
  const offsetY = viewport.y % gridSize

  const cursor =
    isPanning ? 'grabbing' : activeTool === 'select' ? 'default' : 'crosshair'

  return (
    <div
      ref={canvasRef}
      className="relative flex-1 overflow-hidden bg-[#1e1e1e]"
      style={{ cursor, touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handlers.onWheel}
    >
      {/* Точечная сетка */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, #3a3a3a 1px, transparent 1px)',
          backgroundSize: `${gridSize}px ${gridSize}px`,
          backgroundPosition: `${offsetX}px ${offsetY}px`,
        }}
      />

      {/* Фигуры (масштабируются вместе с канвасом) */}
      <div
        className="absolute left-0 top-0"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {shapes.map((shape) => (
          <Shape
            key={shape.id}
            shape={shape}
            selected={selectedIds.includes(shape.id)}
            onPointerDown={
              activeTool === 'select'
                ? (e) => handleShapePointerDown(e, shape.id)
                : undefined
            }
          />
        ))}
        {draft && <Shape shape={draft} selected />}
      </div>

      {/* Нижняя панель */}
      <BottomBar
        activeTool={activeTool}
        onSelectTool={onSelectTool}
        selectedShape={
          selectedIds.length > 0
            ? shapes.find((s) => s.id === selectedIds[0]) ?? null
            : null
        }
        selectedCount={selectedIds.length}
        selectedInGroup={
          selectedIds.length > 0 &&
          shapes.some((s) => selectedIds.includes(s.id) && s.groupId)
        }
        shapesCount={shapes.length}
        viewport={viewport}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onSetZoom={setZoom}
        onZoomToFit={() => zoomToFit(getShapesBounds(shapes))}
      />
    </div>
  )
}

import { useState } from 'react'
import { TOOLS, MIN_ZOOM, MAX_ZOOM, ZOOM_STEP } from '../constants/tools'
import type { Shape, Tool, Viewport } from '../types/shape'
import { formatSize } from '../utils/geometry'

type Props = {
  activeTool: Tool
  onSelectTool: (tool: Tool) => void
  selectedShape: Shape | null
  selectedCount: number
  selectedInGroup: boolean
  shapesCount: number
  viewport: Viewport
  onZoomIn: () => void
  onZoomOut: () => void
  onSetZoom: (zoom: number) => void
  onZoomToFit: () => void
}

const ZOOM_OPTIONS = [0.25, 0.5, 1, 2, 4]

function ToolIcon({ id }: { id: Tool }) {
  if (id === 'select') {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4 2l9 6.5-4.2.9L11 14l-2 .9-2.2-4.6L4 12.5V2z" fill="currentColor" />
      </svg>
    )
  }
  if (id === 'rectangle') {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2.5" y="3.5" width="11" height="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
    )
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <ellipse cx="8" cy="8" rx="5.5" ry="4.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

export default function BottomBar({
  activeTool,
  onSelectTool,
  selectedShape,
  selectedCount,
  selectedInGroup,
  shapesCount,
  viewport,
  onZoomIn,
  onZoomOut,
  onSetZoom,
  onZoomToFit,
}: Props) {
  const [zoomMenuOpen, setZoomMenuOpen] = useState(false)

  const zoomPercent = Math.round(viewport.zoom * 100)
  const canZoomIn = viewport.zoom < MAX_ZOOM - ZOOM_STEP / 2
  const canZoomOut = viewport.zoom > MIN_ZOOM + ZOOM_STEP / 2

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
      <div className="pointer-events-auto flex items-center gap-3 rounded-xl border border-[#3a3a3a] bg-[#2c2c2c] px-3 py-2 shadow-lg shadow-black/40">
        {/* Инструменты */}
        <div className="flex items-center gap-1">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              title={`${tool.label} (${tool.hotkey})`}
              onClick={() => onSelectTool(tool.id)}
              className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                activeTool === tool.id
                  ? 'bg-[#4c8dff] text-white'
                  : 'text-neutral-400 hover:bg-[#3a3a3a] hover:text-white'
              }`}
            >
              <ToolIcon id={tool.id} />
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-[#3a3a3a]" />

        {/* Инфо о выделении / счётчик */}
        <div className="flex min-w-40 items-center justify-center px-2 text-xs text-neutral-400">
          {selectedCount > 1 ? (
            <span>
              Выделено: {selectedCount}
              {selectedInGroup ? ' (группа)' : ''}
            </span>
          ) : selectedShape ? (
            <span>
              {selectedShape.kind === 'ellipse' ? 'Эллипс' : 'Прямоугольник'} ·{' '}
              {formatSize(selectedShape)}
              {selectedInGroup ? ' · в группе' : ''}
            </span>
          ) : (
            <span>Фигур: {shapesCount}</span>
          )}
        </div>

        <div className="h-5 w-px bg-[#3a3a3a]" />

        {/* Зум */}
        <div className="flex items-center gap-1">
          <button
            title="Уменьшить"
            onClick={onZoomOut}
            disabled={!canZoomOut}
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-[#3a3a3a] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <div className="relative">
            <button
              title="Масштаб"
              onClick={() => setZoomMenuOpen((open) => !open)}
              className="flex h-8 min-w-14 items-center justify-center rounded-md px-1 text-xs text-neutral-300 transition-colors hover:bg-[#3a3a3a] hover:text-white"
            >
              {zoomPercent}%
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="ml-1">
                <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </button>
            {zoomMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setZoomMenuOpen(false)} />
                <div className="absolute bottom-9 left-1/2 z-20 w-32 -translate-x-1/2 rounded-lg border border-[#3a3a3a] bg-[#2c2c2c] py-1 shadow-lg shadow-black/40">
                  {ZOOM_OPTIONS.map((z) => (
                    <button
                      key={z}
                      onClick={() => {
                        onSetZoom(z)
                        setZoomMenuOpen(false)
                      }}
                      className={`flex w-full items-center justify-between px-3 py-1.5 text-xs transition-colors hover:bg-[#3a3a3a] ${
                        Math.abs(viewport.zoom - z) < 0.001 ? 'text-[#4c8dff]' : 'text-neutral-300'
                      }`}
                    >
                      <span>{z * 100}%</span>
                      {Math.abs(viewport.zoom - z) < 0.001 && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6l2.5 2.5L9.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                      )}
                    </button>
                  ))}
                  <div className="my-1 h-px bg-[#3a3a3a]" />
                  <button
                    onClick={() => {
                      onZoomToFit()
                      setZoomMenuOpen(false)
                    }}
                    className="flex w-full items-center px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:bg-[#3a3a3a]"
                  >
                    Вписать в экран
                  </button>
                  <button
                    onClick={() => {
                      onSetZoom(1)
                      setZoomMenuOpen(false)
                    }}
                    className="flex w-full items-center px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:bg-[#3a3a3a]"
                  >
                    Сбросить (100%)
                  </button>
                </div>
              </>
            )}
          </div>
          <button
            title="Увеличить"
            onClick={onZoomIn}
            disabled={!canZoomIn}
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-[#3a3a3a] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

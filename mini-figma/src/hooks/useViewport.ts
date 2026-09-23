import { useCallback, useEffect, useRef, useState } from 'react'
import type { Viewport } from '../types/shape'
import { MAX_ZOOM, MIN_ZOOM, ZOOM_STEP } from '../constants/tools'
import { clampZoom, zoomAtPoint } from '../utils/geometry'
import type { Bounds } from '../utils/geometry'

export function useViewport(canvasRef: React.RefObject<HTMLDivElement | null>) {
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 })
  const [isPanning, setIsPanning] = useState(false)
  const spacePressed = useRef(false)
  const panStart = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null)

  const centerOnCanvas = useCallback(() => {
    const el = canvasRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setViewport({
      x: rect.width / 2,
      y: rect.height / 2,
      zoom: 1,
    })
  }, [canvasRef])

  useEffect(() => {
    centerOnCanvas()
    const onResize = () => centerOnCanvas()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [centerOnCanvas])

  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null) => {
      const el = target as HTMLElement | null
      return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isTypingTarget(e.target)) {
        e.preventDefault()
        spacePressed.current = true
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spacePressed.current = false
        setIsPanning(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!spacePressed.current) return
      e.preventDefault()
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      panStart.current = { x: e.clientX, y: e.clientY, vx: viewport.x, vy: viewport.y }
      setIsPanning(true)
    },
    [viewport],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isPanning || !panStart.current) return
      const start = panStart.current
      setViewport((v) => ({
        ...v,
        x: start.vx + (e.clientX - start.x),
        y: start.vy + (e.clientY - start.y),
      }))
    },
    [isPanning],
  )

  const onPointerUp = useCallback(() => {
    panStart.current = null
    setIsPanning(false)
  }, [])

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      const screenPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      setViewport((v) => {
        const factor = e.deltaY < 0 ? 1 + ZOOM_STEP : 1 - ZOOM_STEP
        const newZoom = clampZoom(v.zoom * factor, MIN_ZOOM, MAX_ZOOM)
        if (newZoom === v.zoom) return v
        return zoomAtPoint(v, newZoom, screenPoint)
      })
    },
    [canvasRef],
  )

  const zoomIn = useCallback(() => {
    setViewport((v) => ({ ...v, zoom: clampZoom(v.zoom + ZOOM_STEP, MIN_ZOOM, MAX_ZOOM) }))
  }, [])

  const zoomOut = useCallback(() => {
    setViewport((v) => ({ ...v, zoom: clampZoom(v.zoom - ZOOM_STEP, MIN_ZOOM, MAX_ZOOM) }))
  }, [])

  const setZoom = useCallback((zoom: number) => {
    setViewport((v) => ({ ...v, zoom: clampZoom(zoom, MIN_ZOOM, MAX_ZOOM) }))
  }, [])

  const zoomToFit = useCallback(
    (content: Bounds | null) => {
      const el = canvasRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      if (!content || content.width <= 0 || content.height <= 0) {
        setViewport({ x: rect.width / 2, y: rect.height / 2, zoom: 1 })
        return
      }
      const padding = 80
      const zoom = clampZoom(
        Math.min(
          (rect.width - padding * 2) / content.width,
          (rect.height - padding * 2) / content.height,
        ),
        MIN_ZOOM,
        MAX_ZOOM,
      )
      setViewport({
        zoom,
        x: rect.width / 2 - (content.x + content.width / 2) * zoom,
        y: rect.height / 2 - (content.y + content.height / 2) * zoom,
      })
    },
    [canvasRef],
  )

  return {
    viewport,
    isPanning,
    centerOnCanvas,
    zoomIn,
    zoomOut,
    setZoom,
    zoomToFit,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onWheel },
  }
}

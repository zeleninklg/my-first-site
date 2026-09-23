import { useCallback, useRef, useState } from 'react'
import type { Point, Shape, ShapeKind, Viewport } from '../types/shape'
import { DEFAULT_FILL, MIN_SHAPE_SIZE } from '../constants/tools'
import { screenToCanvas } from '../utils/geometry'

function createId(prefix: string): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e6)}`
}

export function useShapes() {
  const [shapes, setShapes] = useState<Shape[]>([])
  const [draft, setDraft] = useState<Shape | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const draftRef = useRef<Shape | null>(null)
  const originRef = useRef<Point | null>(null)
  const moveOriginRef = useRef<Point | null>(null)
  const moveSnapshotRef = useRef<Map<string, Point>>(new Map())

  const addShape = useCallback((shape: Shape) => {
    setShapes((prev) => [...prev, shape])
  }, [])

  const updateShape = useCallback((id: string, patch: Partial<Shape>) => {
    setShapes((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }, [])

  const removeShape = useCallback((id: string) => {
    setShapes((prev) => prev.filter((s) => s.id !== id))
    setSelectedIds((prev) => prev.filter((sid) => sid !== id))
  }, [])

  const select = useCallback((ids: string[]) => {
    setSelectedIds(ids)
  }, [])

  const selectAt = useCallback(
    (id: string): string[] => {
      const shape = shapes.find((s) => s.id === id)
      if (!shape) return []
      const ids = shape.groupId
        ? shapes.filter((s) => s.groupId === shape.groupId).map((s) => s.id)
        : [id]
      setSelectedIds(ids)
      return ids
    },
    [shapes],
  )

  const toggleSelectAt = useCallback(
    (id: string): string[] => {
      const shape = shapes.find((s) => s.id === id)
      if (!shape) return []
      const groupIds = shape.groupId
        ? shapes.filter((s) => s.groupId === shape.groupId).map((s) => s.id)
        : [id]
      let next: string[]
      setSelectedIds((prev) => {
        const allSelected = groupIds.every((gid) => prev.includes(gid))
        next = allSelected
          ? prev.filter((sid) => !groupIds.includes(sid))
          : [...new Set([...prev, ...groupIds])]
        return next
      })
      return next!
    },
    [shapes],
  )

  const groupSelected = useCallback(() => {
    if (selectedIds.length < 2) return
    const groupId = createId('group')
    setShapes((prev) =>
      prev.map((s) => (selectedIds.includes(s.id) ? { ...s, groupId } : s)),
    )
  }, [selectedIds])

  const ungroupSelected = useCallback(() => {
    setShapes((prev) =>
      prev.map((s) => (selectedIds.includes(s.id) ? { ...s, groupId: undefined } : s)),
    )
  }, [selectedIds])

  const beginMove = useCallback(
    (screenPoint: Point, ids: string[]) => {
      moveOriginRef.current = screenPoint
      const snapshot = new Map<string, Point>()
      for (const s of shapes) {
        if (ids.includes(s.id)) snapshot.set(s.id, { x: s.x, y: s.y })
      }
      moveSnapshotRef.current = snapshot
    },
    [shapes],
  )

  const updateMove = useCallback((screenPoint: Point, viewport: Viewport) => {
    const origin = moveOriginRef.current
    if (!origin) return
    const canvasPoint = screenToCanvas(screenPoint, viewport)
    const canvasOrigin = screenToCanvas(origin, viewport)
    const dx = canvasPoint.x - canvasOrigin.x
    const dy = canvasPoint.y - canvasOrigin.y
    const snapshot = moveSnapshotRef.current
    setShapes((prev) =>
      prev.map((s) => {
        const start = snapshot.get(s.id)
        return start ? { ...s, x: start.x + dx, y: start.y + dy } : s
      }),
    )
  }, [])

  const endMove = useCallback(() => {
    moveOriginRef.current = null
    moveSnapshotRef.current = new Map()
  }, [])

  const beginDraw = useCallback(
    (kind: ShapeKind, screenPoint: Point, viewport: Viewport) => {
      const origin = screenToCanvas(screenPoint, viewport)
      originRef.current = origin
      const shape: Shape = {
        id: createId('shape'),
        kind,
        x: origin.x,
        y: origin.y,
        width: 0,
        height: 0,
        fill: DEFAULT_FILL,
      }
      draftRef.current = shape
      setDraft(shape)
      setSelectedIds([])
    },
    [],
  )

  const updateDraw = useCallback((screenPoint: Point, viewport: Viewport) => {
    const current = draftRef.current
    const origin = originRef.current
    if (!current || !origin) return
    const point = screenToCanvas(screenPoint, viewport)
    const next: Shape = {
      ...current,
      x: Math.min(origin.x, point.x),
      y: Math.min(origin.y, point.y),
      width: Math.abs(point.x - origin.x),
      height: Math.abs(point.y - origin.y),
    }
    draftRef.current = next
    setDraft(next)
  }, [])

  const endDraw = useCallback(() => {
    const shape = draftRef.current
    draftRef.current = null
    originRef.current = null
    setDraft(null)
    if (!shape || shape.width < MIN_SHAPE_SIZE || shape.height < MIN_SHAPE_SIZE) return
    setShapes((prev) => [...prev, shape])
    setSelectedIds([shape.id])
  }, [])

  return {
    shapes,
    draft,
    selectedIds,
    addShape,
    updateShape,
    removeShape,
    select,
    selectAt,
    toggleSelectAt,
    groupSelected,
    ungroupSelected,
    beginMove,
    updateMove,
    endMove,
    beginDraw,
    updateDraw,
    endDraw,
  }
}

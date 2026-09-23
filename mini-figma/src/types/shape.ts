export type Point = {
  x: number
  y: number
}

export type Size = {
  width: number
  height: number
}

export type ShapeKind = 'rectangle' | 'ellipse'

export type Shape = {
  id: string
  kind: ShapeKind
  x: number
  y: number
  width: number
  height: number
  fill: string
  groupId?: string
}

export type Tool = 'select' | 'rectangle' | 'ellipse'

export type Viewport = {
  x: number
  y: number
  zoom: number
}

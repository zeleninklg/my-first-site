import type { Shape as ShapeModel } from '../types/shape'

type Props = {
  shape: ShapeModel
  selected?: boolean
  onPointerDown?: (e: React.PointerEvent) => void
}

export default function Shape({ shape, selected, onPointerDown }: Props) {
  return (
    <div
      onPointerDown={onPointerDown}
      className="absolute"
      style={{
        left: shape.x,
        top: shape.y,
        width: shape.width,
        height: shape.height,
        backgroundColor: shape.fill,
        borderRadius: shape.kind === 'ellipse' ? '50%' : undefined,
        outline: selected ? '2px solid #4c8dff' : undefined,
      }}
    />
  )
}

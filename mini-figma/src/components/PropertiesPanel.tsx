import type { Shape } from '../types/shape'

type Props = {
  selectedShape: Shape | null
  onChangeFill: (id: string, fill: string) => void
}

const SWATCHES = ['#4c8dff', '#ef4444', '#22c55e', '#eab308', '#a855f7', '#f97316', '#ffffff', '#171717']

export default function PropertiesPanel({ selectedShape, onChangeFill }: Props) {
  return (
    <div className="w-56 border-l border-[#333] bg-[#2c2c2c] p-3">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Свойства
      </h2>
      {selectedShape ? (
        <div className="flex flex-col gap-2">
          <span className="text-xs text-neutral-400">Заливка</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={selectedShape.fill}
              onChange={(e) => onChangeFill(selectedShape.id, e.target.value)}
              className="h-8 w-8 cursor-pointer rounded border border-[#444] bg-transparent"
            />
            <span className="font-mono text-xs uppercase text-neutral-400">
              {selectedShape.fill}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {SWATCHES.map((color) => (
              <button
                key={color}
                title={color}
                onClick={() => onChangeFill(selectedShape.id, color)}
                className={`h-7 w-full rounded border ${
                  selectedShape.fill.toLowerCase() === color.toLowerCase()
                    ? 'border-[#4c8dff]'
                    : 'border-[#444]'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-neutral-600">Выберите фигуру, чтобы увидеть свойства</p>
      )}
    </div>
  )
}

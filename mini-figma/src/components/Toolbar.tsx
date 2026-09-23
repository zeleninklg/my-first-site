import { TOOLS } from '../constants/tools'
import type { Tool } from '../types/shape'

type Props = {
  activeTool: Tool
  onSelectTool: (tool: Tool) => void
}

export default function Toolbar({ activeTool, onSelectTool }: Props) {
  return (
    <div className="flex w-12 flex-col items-center gap-1 border-r border-[#333] bg-[#2c2c2c] py-2">
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          title={`${tool.label} (${tool.hotkey})`}
          onClick={() => onSelectTool(tool.id)}
          className={`flex h-9 w-9 items-center justify-center rounded-md text-xs font-medium transition-colors ${
            activeTool === tool.id
              ? 'bg-[#4c8dff] text-white'
              : 'text-neutral-400 hover:bg-[#3a3a3a] hover:text-white'
          }`}
        >
          {tool.hotkey}
        </button>
      ))}
    </div>
  )
}

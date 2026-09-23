import { useMemo, useState } from 'react'
import Canvas from './components/Canvas'
import Toolbar from './components/Toolbar'
import PropertiesPanel from './components/PropertiesPanel'
import LayersPanel from './components/LayersPanel'
import { useShapes } from './hooks/useShapes'
import { useHotkeys } from './hooks/useHotkeys'
import { TOOL_HOTKEYS } from './constants/tools'
import type { Tool } from './types/shape'

export default function App() {
  const [activeTool, setActiveTool] = useState<Tool>('select')
  const {
    shapes,
    draft,
    selectedIds,
    updateShape,
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
  } = useShapes()

  useHotkeys((key, e) => {
    const tool = TOOL_HOTKEYS[key]
    if (tool) setActiveTool(tool)
    if (e.ctrlKey || e.metaKey) {
      if (key === 'g' && e.shiftKey) {
        e.preventDefault()
        ungroupSelected()
      } else if (key === 'g') {
        e.preventDefault()
        groupSelected()
      }
    }
  })

  const selectedShape = useMemo(
    () => shapes.find((s) => s.id === selectedIds[0]) ?? null,
    [shapes, selectedIds],
  )

  const changeFill = (id: string, fill: string) => updateShape(id, { fill })

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#1e1e1e] text-neutral-200">
      <Toolbar activeTool={activeTool} onSelectTool={setActiveTool} />
      <Canvas
        shapes={shapes}
        draft={draft}
        activeTool={activeTool}
        selectedIds={selectedIds}
        onSelectTool={setActiveTool}
        onSelect={select}
        onSelectAt={selectAt}
        onToggleSelectAt={toggleSelectAt}
        onBeginMove={beginMove}
        onMoveMove={updateMove}
        onEndMove={endMove}
        onBeginDraw={beginDraw}
        onDrawMove={updateDraw}
        onDrawEnd={endDraw}
      />
      <div className="flex w-56 flex-col">
        <LayersPanel />
        <PropertiesPanel selectedShape={selectedShape} onChangeFill={changeFill} />
      </div>
    </div>
  )
}

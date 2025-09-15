"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Play, Square, RotateCcw, Info, Keyboard } from "lucide-react"
import type { Algorithm, MazeType } from "@/types/pathfinding"

interface ControlPanelProps {
  selectedAlgorithm: Algorithm
  onAlgorithmChange: (algorithm: Algorithm) => void
  animationSpeed: number
  onAnimationSpeedChange: (speed: number) => void
  gridSize: number
  onGridSizeChange: (size: number) => void
  isWeightedMode: boolean
  onWeightedModeChange: (enabled: boolean) => void
  mode: "wall" | "start" | "end" | "weight"
  onModeChange: (mode: "wall" | "start" | "end" | "weight") => void
  isRunning: boolean
  onRunAlgorithm: () => void
  onClearGrid: () => void
  onResetGrid: () => void
  onGenerateMaze: (type: MazeType) => void
  hasStartAndEnd: boolean
}

const algorithmNames: Record<Algorithm, string> = {
  dijkstra: "Dijkstra's Algorithm",
  astar: "A* Search",
  bfs: "Breadth-First Search",
  dfs: "Depth-First Search",
  greedy: "Greedy Best-First",
  bidirectional: "Bidirectional Search",
}

const algorithmDescriptions: Record<Algorithm, string> = {
  dijkstra: "Guarantees shortest path, explores uniformly. Optimal for weighted graphs.",
  astar: "Heuristic-based, optimal and efficient. Best overall performance.",
  bfs: "Unweighted shortest path, explores level by level. Good for unweighted graphs.",
  dfs: "Explores deeply, does not guarantee shortest path. Fast but suboptimal.",
  greedy: "Fast but not optimal, uses heuristic only. May get stuck in local optima.",
  bidirectional: "Searches from both ends simultaneously. Reduces search space significantly.",
}

const algorithmComplexity: Record<Algorithm, { time: string; space: string; optimal: boolean }> = {
  dijkstra: { time: "O((V + E) log V)", space: "O(V)", optimal: true },
  astar: { time: "O(b^d)", space: "O(b^d)", optimal: true },
  bfs: { time: "O(V + E)", space: "O(V)", optimal: true },
  dfs: { time: "O(V + E)", space: "O(V)", optimal: false },
  greedy: { time: "O(b^m)", space: "O(b^m)", optimal: false },
  bidirectional: { time: "O(b^(d/2))", space: "O(b^(d/2))", optimal: true },
}

export function ControlPanel({
  selectedAlgorithm,
  onAlgorithmChange,
  animationSpeed,
  onAnimationSpeedChange,
  gridSize,
  onGridSizeChange,
  isWeightedMode,
  onWeightedModeChange,
  mode,
  onModeChange,
  isRunning,
  onRunAlgorithm,
  onClearGrid,
  onResetGrid,
  onGenerateMaze,
  hasStartAndEnd,
}: ControlPanelProps) {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (isRunning) return

      switch (event.key.toLowerCase()) {
        case "v":
          if (hasStartAndEnd) onRunAlgorithm()
          break
        case "c":
          onClearGrid()
          break
        case "r":
          onResetGrid()
          break
        case "1":
          onModeChange("wall")
          break
        case "2":
          onModeChange("start")
          break
        case "3":
          onModeChange("end")
          break
        case "4":
          if (isWeightedMode) onModeChange("weight")
          break
        case "w":
          onWeightedModeChange(!isWeightedMode)
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [
    isRunning,
    hasStartAndEnd,
    onRunAlgorithm,
    onClearGrid,
    onResetGrid,
    onModeChange,
    isWeightedMode,
    onWeightedModeChange,
  ])

  const complexity = algorithmComplexity[selectedAlgorithm]

  return (
    <TooltipProvider>
      <Card className="p-6 space-y-6 shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Algorithm Selection</label>
              <div className="flex items-center space-x-2">
                <Badge
                  variant={complexity.optimal ? "default" : "destructive"}
                  className={complexity.optimal ? "" : ""}
                >
                  {complexity.optimal ? "Optimal" : "Suboptimal"}
                </Badge>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <div className="space-y-1">
                      <p className="font-medium">{algorithmNames[selectedAlgorithm]}</p>
                      <p className="text-xs">{algorithmDescriptions[selectedAlgorithm]}</p>
                      <div className="text-xs space-y-1 pt-2 border-t">
                        <div>
                          Time: <code>{complexity.time}</code>
                        </div>
                        <div>
                          Space: <code>{complexity.space}</code>
                        </div>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <Select value={selectedAlgorithm} onValueChange={onAlgorithmChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(algorithmNames).map(([key, name]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center justify-between w-full">
                      <span>{name}</span>
                      <Badge
                        variant={algorithmComplexity[key as Algorithm].optimal ? "default" : "destructive"}
                        className="ml-2 text-xs"
                      >
                        {algorithmComplexity[key as Algorithm].optimal ? "Optimal" : "Fast"}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <p className="text-xs text-muted-foreground leading-relaxed">{algorithmDescriptions[selectedAlgorithm]}</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Animation Speed */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Animation Speed</label>
                <Slider
                  value={[animationSpeed]}
                  onValueChange={(value) => onAnimationSpeedChange(value[0])}
                  min={1}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Slow</span>
                  <span>{animationSpeed}ms</span>
                  <span>Fast</span>
                </div>
              </div>

              {/* Grid Size */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Grid Size</label>
                <Slider
                  value={[gridSize]}
                  onValueChange={(value) => onGridSizeChange(value[0])}
                  min={10}
                  max={50}
                  step={5}
                  className="w-full"
                  disabled={isRunning}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>10×10</span>
                  <span>
                    {gridSize}×{gridSize}
                  </span>
                  <span>50×50</span>
                </div>
              </div>
            </div>

            {/* Weighted Mode */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <label className="text-sm font-medium">Weighted Nodes</label>
                <p className="text-xs text-muted-foreground">Enable nodes with higher traversal cost</p>
              </div>
              <Switch checked={isWeightedMode} onCheckedChange={onWeightedModeChange} disabled={isRunning} />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Drawing Mode</label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Keyboard className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs space-y-1">
                  <div>
                    <kbd className="px-1 py-0.5 bg-muted rounded">1</kbd> Wall mode
                  </div>
                  <div>
                    <kbd className="px-1 py-0.5 bg-muted rounded">2</kbd> Start mode
                  </div>
                  <div>
                    <kbd className="px-1 py-0.5 bg-muted rounded">3</kbd> End mode
                  </div>
                  <div>
                    <kbd className="px-1 py-0.5 bg-muted rounded">4</kbd> Weight mode
                  </div>
                  <div>
                    <kbd className="px-1 py-0.5 bg-muted rounded">W</kbd> Toggle weights
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="flex flex-wrap gap-2">
            {(["wall", "start", "end", ...(isWeightedMode ? ["weight"] : [])] as const).map((modeOption) => (
              <Button
                key={modeOption}
                variant={mode === modeOption ? "default" : "outline"}
                size="sm"
                onClick={() => onModeChange(modeOption)}
                disabled={isRunning}
                className="capitalize relative"
              >
                {modeOption === "weight" ? "Weight" : modeOption}
                <span className="absolute -top-1 -right-1 text-xs bg-background text-foreground px-1 rounded border border-border">
                  {modeOption === "wall" ? "1" : modeOption === "start" ? "2" : modeOption === "end" ? "3" : "4"}
                </span>
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onRunAlgorithm}
                  disabled={!hasStartAndEnd || isRunning}
                  className="flex items-center gap-2 relative"
                  size="lg"
                >
                  <Play className="w-4 h-4" />
                  {isRunning ? "Running..." : "Visualize"}
                  <kbd className="absolute -top-1 -right-1 text-xs bg-background text-foreground px-1 rounded border">
                    V
                  </kbd>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Start pathfinding visualization (V)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={onClearGrid}
                  disabled={isRunning}
                  className="flex items-center gap-2 relative bg-transparent"
                >
                  <Square className="w-4 h-4" />
                  Clear Path
                  <kbd className="absolute -top-1 -right-1 text-xs bg-background text-foreground px-1 rounded border">
                    C
                  </kbd>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear visited nodes and path (C)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={onResetGrid}
                  disabled={isRunning}
                  className="flex items-center gap-2 relative bg-transparent"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Grid
                  <kbd className="absolute -top-1 -right-1 text-xs bg-background text-foreground px-1 rounded border">
                    R
                  </kbd>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset entire grid (R)</p>
              </TooltipContent>
            </Tooltip>

            <Select onValueChange={(value) => onGenerateMaze(value as MazeType)} disabled={isRunning}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Generate Maze" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="random">Random Maze</SelectItem>
                <SelectItem value="recursive">Recursive Division</SelectItem>
                <SelectItem value="prim">Prim's Algorithm</SelectItem>
                <SelectItem value="kruskal">Kruskal's Algorithm</SelectItem>
                <SelectItem value="binary">Binary Tree</SelectItem>
                <SelectItem value="sidewinder">Sidewinder</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            {!hasStartAndEnd ? (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Info className="w-4 h-4" />
                <span>Please place both start (green) and end (red) nodes to begin visualization</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                <Play className="w-4 h-4" />
                <span>Ready to visualize! Press V or click Visualize to start</span>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              <strong>Quick Tips:</strong> Use keyboard shortcuts for faster interaction. Hover over elements for
              detailed information. Try different algorithms to compare their behavior!
            </div>
          </div>
        </div>
      </Card>
    </TooltipProvider>
  )
}

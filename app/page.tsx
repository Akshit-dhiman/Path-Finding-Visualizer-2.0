"use client"

import { useState, useCallback, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Grid } from "@/components/grid"
import { ControlPanel } from "@/components/control-panel"
import { StatsPanel } from "@/components/stats-panel"
import { Confetti } from "@/components/confetti"
import { algorithms } from "@/lib/algorithms"
import { generateMaze } from "@/lib/maze-generators"
import type { GridNode, Algorithm, MazeType, VisualizationStats } from "@/types/pathfinding"

export default function PathfindingVisualizer() {
  const [gridSize, setGridSize] = useState(25)
  const [grid, setGrid] = useState<GridNode[][]>([])
  const [startNode, setStartNode] = useState<{ row: number; col: number } | null>(null)
  const [endNode, setEndNode] = useState<{ row: number; col: number } | null>(null)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm>("dijkstra")
  const [animationSpeed, setAnimationSpeed] = useState(50)
  const [isRunning, setIsRunning] = useState(false)
  const [isWeightedMode, setIsWeightedMode] = useState(false)
  const [stats, setStats] = useState<VisualizationStats | null>(null)
  const [mode, setMode] = useState<"wall" | "start" | "end" | "weight">("wall")
  const [showConfetti, setShowConfetti] = useState(false)
  const [previousStats, setPreviousStats] = useState<Array<{ algorithm: Algorithm; stats: VisualizationStats }>>([])

  // Initialize grid
  const initializeGrid = useCallback(() => {
    const newGrid: GridNode[][] = []
    for (let row = 0; row < gridSize; row++) {
      const currentRow: GridNode[] = []
      for (let col = 0; col < gridSize; col++) {
        currentRow.push({
          row,
          col,
          isStart: false,
          isEnd: false,
          isWall: false,
          isVisited: false,
          isPath: false,
          distance: Number.POSITIVE_INFINITY,
          heuristic: 0,
          weight: 1,
          previousNode: null,
        })
      }
      newGrid.push(currentRow)
    }
    setGrid(newGrid)
    setStartNode(null)
    setEndNode(null)
    setStats(null)
  }, [gridSize])

  // Initialize grid on mount and when grid size changes
  useEffect(() => {
    initializeGrid()
  }, [initializeGrid])

  const clearGrid = useCallback(() => {
    const newGrid = grid.map((row) =>
      row.map((node) => ({
        ...node,
        isVisited: false,
        isPath: false,
        distance: Number.POSITIVE_INFINITY,
        heuristic: 0,
        previousNode: null,
      })),
    )
    setGrid(newGrid)
    setStats(null)
  }, [grid])

  const resetGrid = useCallback(() => {
    initializeGrid()
    setPreviousStats([]) // Clear comparison data when resetting
  }, [initializeGrid])

  const handleNodeClick = useCallback(
    (row: number, col: number) => {
      if (isRunning) return

      const newGrid = [...grid]
      const node = newGrid[row][col]

      if (mode === "start") {
        // Clear previous start node
        if (startNode) {
          newGrid[startNode.row][startNode.col].isStart = false
        }
        node.isStart = true
        node.isWall = false
        setStartNode({ row, col })
      } else if (mode === "end") {
        // Clear previous end node
        if (endNode) {
          newGrid[endNode.row][endNode.col].isEnd = false
        }
        node.isEnd = true
        node.isWall = false
        setEndNode({ row, col })
      } else if (mode === "wall") {
        if (!node.isStart && !node.isEnd) {
          node.isWall = !node.isWall
        }
      } else if (mode === "weight" && isWeightedMode) {
        if (!node.isStart && !node.isEnd && !node.isWall) {
          node.weight = node.weight === 1 ? 5 : 1
        }
      }

      setGrid(newGrid)
    },
    [grid, mode, startNode, endNode, isRunning, isWeightedMode],
  )

  const generateMazeHandler = useCallback(
    async (mazeType: MazeType) => {
      if (isRunning) return
      setIsRunning(true)

      const newGrid = await generateMaze(grid, mazeType, animationSpeed, (updatedGrid) => {
        setGrid([...updatedGrid])
      })

      setGrid(newGrid)
      setIsRunning(false)
    },
    [grid, isRunning, animationSpeed],
  )

  const runAlgorithm = useCallback(async () => {
    if (!startNode || !endNode || isRunning) return

    setIsRunning(true)
    clearGrid()

    const algorithm = algorithms[selectedAlgorithm]
    const result = await algorithm(grid, startNode, endNode, animationSpeed, (updatedGrid) => {
      setGrid(updatedGrid)
    })

    setStats(result.stats)

    if (result.stats.pathFound) {
      setShowConfetti(true)
    }

    setIsRunning(false)
  }, [startNode, endNode, isRunning, grid, selectedAlgorithm, animationSpeed, clearGrid])

  const handleSaveStats = useCallback((algorithm: Algorithm, stats: VisualizationStats) => {
    setPreviousStats((prev) => {
      // Remove any existing entry for this algorithm and add the new one
      const filtered = prev.filter((entry) => entry.algorithm !== algorithm)
      return [...filtered, { algorithm, stats }].slice(-5) // Keep only last 5 results
    })
  }, [])

  return (
    <div className="min-h-screen bg-background p-4">
      <Confetti show={showConfetti} onComplete={() => setShowConfetti(false)} />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Pathfinding Visualizer</h1>
          <p className="text-muted-foreground">
            Explore and compare different pathfinding algorithms with interactive visualization
          </p>
        </div>

        {/* Control Panel */}
        <ControlPanel
          selectedAlgorithm={selectedAlgorithm}
          onAlgorithmChange={setSelectedAlgorithm}
          animationSpeed={animationSpeed}
          onAnimationSpeedChange={setAnimationSpeed}
          gridSize={gridSize}
          onGridSizeChange={setGridSize}
          isWeightedMode={isWeightedMode}
          onWeightedModeChange={setIsWeightedMode}
          mode={mode}
          onModeChange={setMode}
          isRunning={isRunning}
          onRunAlgorithm={runAlgorithm}
          onClearGrid={clearGrid}
          onResetGrid={resetGrid}
          onGenerateMaze={generateMazeHandler}
          hasStartAndEnd={!!(startNode && endNode)}
        />

        {/* Main Grid */}
        <Card className="p-6">
          <Grid grid={grid} onNodeClick={handleNodeClick} isRunning={isRunning} mode={mode} />
        </Card>

        {/* Stats Panel */}
        {stats && (
          <StatsPanel
            stats={stats}
            algorithm={selectedAlgorithm}
            previousStats={previousStats}
            onSaveStats={handleSaveStats}
          />
        )}
      </div>
    </div>
  )
}

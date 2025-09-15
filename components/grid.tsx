"use client"

import { memo } from "react"
import { cn } from "@/lib/utils"
import type { GridNode } from "@/types/pathfinding"

interface GridProps {
  grid: GridNode[][]
  onNodeClick: (row: number, col: number) => void
  isRunning: boolean
  mode: "wall" | "start" | "end" | "weight"
}

const Node = memo(
  ({
    node,
    onClick,
    isRunning,
    mode,
  }: {
    node: GridNode
    onClick: () => void
    isRunning: boolean
    mode: string
  }) => {
    const getNodeClass = () => {
      const baseClass =
        "w-6 h-6 border border-border cursor-pointer transition-all duration-300 ease-out relative overflow-hidden"

      if (node.isStart) return cn(baseClass, "bg-green-500 hover:bg-green-600 shadow-lg scale-110 animate-pulse")
      if (node.isEnd) return cn(baseClass, "bg-red-500 hover:bg-red-600 shadow-lg scale-110 animate-pulse")
      if (node.isPath) return cn(baseClass, "bg-yellow-400 shadow-md animate-bounce-subtle")
      if (node.isVisited) return cn(baseClass, "bg-blue-400 animate-fade-in")
      if (node.isWall) return cn(baseClass, "bg-gray-900 dark:bg-gray-100 shadow-inner")
      if (node.weight > 1) return cn(baseClass, "bg-orange-300 hover:bg-orange-400 shadow-sm")

      return cn(baseClass, "bg-background hover:bg-muted hover:scale-105")
    }

    const getNodeContent = () => {
      if (node.isStart) return "S"
      if (node.isEnd) return "E"
      if (node.weight > 1) return node.weight.toString()
      return ""
    }

    const getAnimationStyle = () => {
      if (node.isVisited && !node.isStart && !node.isEnd) {
        return {
          animationDelay: `${Math.min(node.distance * 20, 2000)}ms`,
          animationDuration: "0.6s",
          animationFillMode: "forwards" as const,
        }
      }
      if (node.isPath && !node.isStart && !node.isEnd) {
        return {
          animationDelay: `${node.distance * 50}ms`,
          animationDuration: "0.4s",
          animationFillMode: "forwards" as const,
        }
      }
      return {}
    }

    return (
      <div className={getNodeClass()} onClick={onClick} style={getAnimationStyle()}>
        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white relative">
          {getNodeContent()}

          {/* Ripple effect for visited nodes */}
          {node.isVisited && !node.isStart && !node.isEnd && !node.isPath && (
            <div className="absolute inset-0 bg-blue-300 rounded-full animate-ping opacity-30" />
          )}

          {/* Glow effect for path nodes */}
          {node.isPath && !node.isStart && !node.isEnd && (
            <div className="absolute inset-0 bg-yellow-300 rounded animate-pulse opacity-50" />
          )}

          {/* Weight indicator */}
          {node.weight > 1 && !node.isStart && !node.isEnd && (
            <div className="absolute top-0 right-0 w-2 h-2 bg-orange-600 rounded-full transform translate-x-1 -translate-y-1" />
          )}
        </div>
      </div>
    )
  },
)

Node.displayName = "Node"

export const Grid = memo(({ grid, onNodeClick, isRunning, mode }: GridProps) => {
  if (!grid.length) return null

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="bg-card border rounded-lg p-3 shadow-sm">
        <div className="text-sm text-muted-foreground text-center">
          <span className="font-semibold text-foreground">Current mode: </span>
          <span className="font-bold capitalize text-primary">{mode}</span>
        </div>
        <div className="text-xs text-muted-foreground text-center mt-1">
          {mode === "start" && "Click to place start node (Green)"}
          {mode === "end" && "Click to place end node (Red)"}
          {mode === "wall" && "Click and drag to draw walls (Black)"}
          {mode === "weight" && "Click to add weighted nodes (Orange)"}
        </div>
      </div>

      <div
        className="grid gap-0 border-2 border-border rounded-xl p-4 bg-card shadow-lg"
        style={{
          gridTemplateColumns: `repeat(${grid[0].length}, minmax(0, 1fr))`,
          maxWidth: "min(90vw, 800px)",
          aspectRatio: "1",
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((node, colIndex) => (
            <Node
              key={`${rowIndex}-${colIndex}`}
              node={node}
              onClick={() => onNodeClick(rowIndex, colIndex)}
              isRunning={isRunning}
              mode={mode}
            />
          )),
        )}
      </div>

      <div className="bg-card border rounded-lg p-4 shadow-sm max-w-2xl">
        <h4 className="text-sm font-semibold mb-2 text-center">Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded border animate-pulse"></div>
            <span>Start Node</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded border animate-pulse"></div>
            <span>End Node</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-900 dark:bg-gray-100 rounded border"></div>
            <span>Wall</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-400 rounded border"></div>
            <span>Visited</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-400 rounded border"></div>
            <span>Path</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-300 rounded border relative">
              <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-orange-600 rounded-full transform translate-x-0.5 -translate-y-0.5"></div>
            </div>
            <span>Weighted (5x)</span>
          </div>
        </div>
      </div>
    </div>
  )
})

Grid.displayName = "Grid"

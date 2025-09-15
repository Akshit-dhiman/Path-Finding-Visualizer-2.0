export interface GridNode {
  row: number
  col: number
  isStart: boolean
  isEnd: boolean
  isWall: boolean
  isVisited: boolean
  isPath: boolean
  distance: number
  heuristic: number
  weight: number
  previousNode: GridNode | null
}

export type Algorithm = "dijkstra" | "astar" | "bfs" | "dfs" | "greedy" | "bidirectional"

export type MazeType = "random" | "recursive" | "prim" | "kruskal" | "binary" | "sidewinder"

export interface VisualizationStats {
  pathFound: boolean
  pathLength: number
  nodesVisited: number
  nodesInPath: number
  executionTime: number
}

export interface AlgorithmResult {
  path: GridNode[]
  visitedNodes: GridNode[]
  stats: VisualizationStats
}

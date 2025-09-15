import type { GridNode, AlgorithmResult } from "@/types/pathfinding"

export async function dfs(
  grid: GridNode[][],
  start: { row: number; col: number },
  end: { row: number; col: number },
  animationSpeed: number,
): Promise<AlgorithmResult> {
  const startTime = performance.now()
  const visitedNodes: GridNode[] = []

  for (const row of grid) {
    for (const node of row) {
      node.isVisited = false
      node.isPath = false
      node.previousNode = null
    }
  }

  const startNode = grid[start.row][start.col]
  const endNode = grid[end.row][end.col]

  const result = await dfsRecursive(grid, startNode, endNode, visitedNodes, animationSpeed)
  const endTime = performance.now()

  if (result) {
    const path = reconstructPath(endNode)

    for (const node of path) {
      if (node !== startNode && node !== endNode) {
        node.isPath = true
        await new Promise((resolve) => setTimeout(resolve, 50))
      }
    }

    return {
      path,
      visitedNodes,
      stats: {
        pathFound: true,
        pathLength: path.length,
        nodesVisited: visitedNodes.length,
        nodesInPath: path.length,
        executionTime: Math.round(endTime - startTime),
      },
    }
  }

  return {
    path: [],
    visitedNodes,
    stats: {
      pathFound: false,
      pathLength: 0,
      nodesVisited: visitedNodes.length,
      nodesInPath: 0,
      executionTime: Math.round(endTime - startTime),
    },
  }
}

async function dfsRecursive(
  grid: GridNode[][],
  currentNode: GridNode,
  endNode: GridNode,
  visitedNodes: GridNode[],
  animationSpeed: number,
): Promise<boolean> {
  if (currentNode.isWall || currentNode.isVisited) {
    return false
  }

  currentNode.isVisited = true
  visitedNodes.push(currentNode)

  if (currentNode !== endNode) {
    await new Promise((resolve) => setTimeout(resolve, 101 - animationSpeed))
  }

  if (currentNode === endNode) {
    return true
  }

  const neighbors = getNeighbors(grid, currentNode)
  for (const neighbor of neighbors) {
    if (!neighbor.isVisited && !neighbor.isWall) {
      neighbor.previousNode = currentNode
      if (await dfsRecursive(grid, neighbor, endNode, visitedNodes, animationSpeed)) {
        return true
      }
    }
  }

  return false
}

function getNeighbors(grid: GridNode[][], node: GridNode): GridNode[] {
  const neighbors: GridNode[] = []
  const { row, col } = node
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ]

  for (const [dr, dc] of directions) {
    const newRow = row + dr
    const newCol = col + dc

    if (newRow >= 0 && newRow < grid.length && newCol >= 0 && newCol < grid[0].length) {
      neighbors.push(grid[newRow][newCol])
    }
  }

  return neighbors
}

function reconstructPath(endNode: GridNode): GridNode[] {
  const path: GridNode[] = []
  let currentNode: GridNode | null = endNode

  while (currentNode !== null) {
    path.unshift(currentNode)
    currentNode = currentNode.previousNode
  }

  return path
}

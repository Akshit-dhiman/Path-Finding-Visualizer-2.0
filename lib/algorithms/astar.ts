import type { GridNode, AlgorithmResult } from "@/types/pathfinding"

export async function astar(
  grid: GridNode[][],
  start: { row: number; col: number },
  end: { row: number; col: number },
  animationSpeed: number,
): Promise<AlgorithmResult> {
  const startTime = performance.now()
  const visitedNodes: GridNode[] = []
  const openSet: GridNode[] = []

  for (const row of grid) {
    for (const node of row) {
      node.distance = Number.POSITIVE_INFINITY
      node.heuristic = 0
      node.previousNode = null
      node.isVisited = false
      node.isPath = false
    }
  }

  const startNode = grid[start.row][start.col]
  const endNode = grid[end.row][end.col]

  startNode.distance = 0
  startNode.heuristic = heuristic(startNode, endNode)
  openSet.push(startNode)

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.distance + a.heuristic - (b.distance + b.heuristic))
    const currentNode = openSet.shift()!

    if (currentNode.isWall) continue

    currentNode.isVisited = true
    visitedNodes.push(currentNode)

    if (currentNode !== startNode && currentNode !== endNode) {
      await new Promise((resolve) => setTimeout(resolve, 101 - animationSpeed))
    }

    if (currentNode === endNode) {
      const path = reconstructPath(endNode)
      const endTime = performance.now()

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

    const neighbors = getNeighbors(grid, currentNode)
    for (const neighbor of neighbors) {
      if (neighbor.isVisited || neighbor.isWall) continue

      const tentativeDistance = currentNode.distance + neighbor.weight
      const isInOpenSet = openSet.includes(neighbor)

      if (!isInOpenSet || tentativeDistance < neighbor.distance) {
        neighbor.distance = tentativeDistance
        neighbor.heuristic = heuristic(neighbor, endNode)
        neighbor.previousNode = currentNode

        if (!isInOpenSet) {
          openSet.push(neighbor)
        }
      }
    }
  }

  const endTime = performance.now()
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

function heuristic(nodeA: GridNode, nodeB: GridNode): number {
  return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col)
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

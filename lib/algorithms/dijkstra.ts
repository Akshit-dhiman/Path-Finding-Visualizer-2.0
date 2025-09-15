import type { GridNode, AlgorithmResult } from "@/types/pathfinding"

export async function dijkstra(
  grid: GridNode[][],
  start: { row: number; col: number },
  end: { row: number; col: number },
  animationSpeed: number,
): Promise<AlgorithmResult> {
  const startTime = performance.now()
  const visitedNodes: GridNode[] = []
  const unvisitedNodes: GridNode[] = []

  // Initialize distances and collect all nodes
  for (const row of grid) {
    for (const node of row) {
      node.distance = Number.POSITIVE_INFINITY
      node.previousNode = null
      node.isVisited = false
      node.isPath = false
      unvisitedNodes.push(node)
    }
  }

  const startNode = grid[start.row][start.col]
  const endNode = grid[end.row][end.col]
  startNode.distance = 0

  while (unvisitedNodes.length > 0) {
    unvisitedNodes.sort((a, b) => a.distance - b.distance)
    const currentNode = unvisitedNodes.shift()!

    if (currentNode.isWall || currentNode.distance === Number.POSITIVE_INFINITY) {
      break
    }

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
      if (!neighbor.isVisited && !neighbor.isWall) {
        const tentativeDistance = currentNode.distance + neighbor.weight
        if (tentativeDistance < neighbor.distance) {
          neighbor.distance = tentativeDistance
          neighbor.previousNode = currentNode
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

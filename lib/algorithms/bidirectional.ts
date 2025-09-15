import type { GridNode, AlgorithmResult } from "@/types/pathfinding"

export async function bidirectional(
  grid: GridNode[][],
  start: { row: number; col: number },
  end: { row: number; col: number },
  animationSpeed: number,
): Promise<AlgorithmResult> {
  const startTime = performance.now()
  const visitedNodes: GridNode[] = []
  const startQueue: GridNode[] = []
  const endQueue: GridNode[] = []
  const startVisited = new Set<string>()
  const endVisited = new Set<string>()
  const startParents = new Map<string, GridNode>()
  const endParents = new Map<string, GridNode>()

  for (const row of grid) {
    for (const node of row) {
      node.isVisited = false
      node.isPath = false
      node.previousNode = null
    }
  }

  const startNode = grid[start.row][start.col]
  const endNode = grid[end.row][end.col]

  startQueue.push(startNode)
  endQueue.push(endNode)
  startVisited.add(`${startNode.row}-${startNode.col}`)
  endVisited.add(`${endNode.row}-${endNode.col}`)

  let meetingPoint: GridNode | null = null

  while (startQueue.length > 0 || endQueue.length > 0) {
    if (startQueue.length > 0) {
      const currentNode = startQueue.shift()!
      currentNode.isVisited = true
      visitedNodes.push(currentNode)

      if (currentNode !== startNode && currentNode !== endNode) {
        await new Promise((resolve) => setTimeout(resolve, (101 - animationSpeed) / 2))
      }

      const nodeKey = `${currentNode.row}-${currentNode.col}`
      if (endVisited.has(nodeKey)) {
        meetingPoint = currentNode
        break
      }

      const neighbors = getNeighbors(grid, currentNode)
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.row}-${neighbor.col}`
        if (!neighbor.isWall && !startVisited.has(neighborKey)) {
          startVisited.add(neighborKey)
          startParents.set(neighborKey, currentNode)
          startQueue.push(neighbor)
        }
      }
    }

    if (endQueue.length > 0) {
      const currentNode = endQueue.shift()!
      currentNode.isVisited = true
      if (!visitedNodes.includes(currentNode)) {
        visitedNodes.push(currentNode)
      }

      if (currentNode !== startNode && currentNode !== endNode) {
        await new Promise((resolve) => setTimeout(resolve, (101 - animationSpeed) / 2))
      }

      const nodeKey = `${currentNode.row}-${currentNode.col}`
      if (startVisited.has(nodeKey)) {
        meetingPoint = currentNode
        break
      }

      const neighbors = getNeighbors(grid, currentNode)
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.row}-${neighbor.col}`
        if (!neighbor.isWall && !endVisited.has(neighborKey)) {
          endVisited.add(neighborKey)
          endParents.set(neighborKey, currentNode)
          endQueue.push(neighbor)
        }
      }
    }
  }

  const endTime = performance.now()

  if (meetingPoint) {
    const path = reconstructBidirectionalPath(startNode, endNode, meetingPoint, startParents, endParents)

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

function reconstructBidirectionalPath(
  startNode: GridNode,
  endNode: GridNode,
  meetingPoint: GridNode,
  startParents: Map<string, GridNode>,
  endParents: Map<string, GridNode>,
): GridNode[] {
  const path: GridNode[] = []

  let current: GridNode | undefined = meetingPoint
  const startPath: GridNode[] = []

  while (current) {
    startPath.unshift(current)
    const key = `${current.row}-${current.col}`
    current = startParents.get(key)
  }

  current = endParents.get(`${meetingPoint.row}-${meetingPoint.col}`)
  const endPath: GridNode[] = []

  while (current) {
    endPath.push(current)
    const key = `${current.row}-${current.col}`
    current = endParents.get(key)
  }

  return [...startPath, ...endPath]
}

import type { Algorithm, GridNode, AlgorithmResult } from "@/types/pathfinding"

async function dijkstra(
  grid: GridNode[][],
  start: { row: number; col: number },
  end: { row: number; col: number },
  animationSpeed: number,
  onGridUpdate?: (grid: GridNode[][]) => void,
): Promise<AlgorithmResult> {
  const startTime = performance.now()
  const visitedNodes: GridNode[] = []
  const unvisitedNodes: GridNode[] = []

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

    if (onGridUpdate) {
      onGridUpdate([...grid])
    }

    if (currentNode !== startNode && currentNode !== endNode) {
      await new Promise((resolve) => setTimeout(resolve, 101 - animationSpeed))
    }

    if (currentNode === endNode) {
      const path = reconstructPath(endNode)
      const endTime = performance.now()

      for (const node of path) {
        if (node !== startNode && node !== endNode) {
          node.isPath = true
          if (onGridUpdate) {
            onGridUpdate([...grid])
          }
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

async function astar(
  grid: GridNode[][],
  start: { row: number; col: number },
  end: { row: number; col: number },
  animationSpeed: number,
  onGridUpdate?: (grid: GridNode[][]) => void,
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

    if (onGridUpdate) {
      onGridUpdate([...grid])
    }

    if (currentNode !== startNode && currentNode !== endNode) {
      await new Promise((resolve) => setTimeout(resolve, 101 - animationSpeed))
    }

    if (currentNode === endNode) {
      const path = reconstructPath(endNode)
      const endTime = performance.now()

      for (const node of path) {
        if (node !== startNode && node !== endNode) {
          node.isPath = true
          if (onGridUpdate) {
            onGridUpdate([...grid])
          }
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

async function bfs(
  grid: GridNode[][],
  start: { row: number; col: number },
  end: { row: number; col: number },
  animationSpeed: number,
  onGridUpdate?: (grid: GridNode[][]) => void,
): Promise<AlgorithmResult> {
  const startTime = performance.now()
  const visitedNodes: GridNode[] = []
  const queue: GridNode[] = []

  for (const row of grid) {
    for (const node of row) {
      node.distance = Number.POSITIVE_INFINITY
      node.previousNode = null
      node.isVisited = false
      node.isPath = false
    }
  }

  const startNode = grid[start.row][start.col]
  const endNode = grid[end.row][end.col]

  startNode.distance = 0
  startNode.isVisited = true
  queue.push(startNode)
  visitedNodes.push(startNode)

  while (queue.length > 0) {
    const currentNode = queue.shift()!

    if (onGridUpdate) {
      onGridUpdate([...grid])
    }

    if (currentNode !== startNode && currentNode !== endNode) {
      await new Promise((resolve) => setTimeout(resolve, 101 - animationSpeed))
    }

    if (currentNode === endNode) {
      const path = reconstructPath(endNode)
      const endTime = performance.now()

      for (const node of path) {
        if (node !== startNode && node !== endNode) {
          node.isPath = true
          if (onGridUpdate) {
            onGridUpdate([...grid])
          }
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
        neighbor.isVisited = true
        neighbor.distance = currentNode.distance + 1
        neighbor.previousNode = currentNode
        queue.push(neighbor)
        visitedNodes.push(neighbor)
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

async function dfs(
  grid: GridNode[][],
  start: { row: number; col: number },
  end: { row: number; col: number },
  animationSpeed: number,
  onGridUpdate?: (grid: GridNode[][]) => void,
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

  const result = await dfsRecursive(grid, startNode, endNode, visitedNodes, animationSpeed, onGridUpdate)
  const endTime = performance.now()

  if (result) {
    const path = reconstructPath(endNode)

    for (const node of path) {
      if (node !== startNode && node !== endNode) {
        node.isPath = true
        if (onGridUpdate) {
          onGridUpdate([...grid])
        }
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

async function greedy(
  grid: GridNode[][],
  start: { row: number; col: number },
  end: { row: number; col: number },
  animationSpeed: number,
  onGridUpdate?: (grid: GridNode[][]) => void,
): Promise<AlgorithmResult> {
  const startTime = performance.now()
  const visitedNodes: GridNode[] = []
  const openSet: GridNode[] = []

  for (const row of grid) {
    for (const node of row) {
      node.heuristic = 0
      node.previousNode = null
      node.isVisited = false
      node.isPath = false
    }
  }

  const startNode = grid[start.row][start.col]
  const endNode = grid[end.row][end.col]

  startNode.heuristic = heuristic(startNode, endNode)
  openSet.push(startNode)

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.heuristic - b.heuristic)
    const currentNode = openSet.shift()!

    if (currentNode.isWall || currentNode.isVisited) continue

    currentNode.isVisited = true
    visitedNodes.push(currentNode)

    if (onGridUpdate) {
      onGridUpdate([...grid])
    }

    if (currentNode !== startNode && currentNode !== endNode) {
      await new Promise((resolve) => setTimeout(resolve, 101 - animationSpeed))
    }

    if (currentNode === endNode) {
      const path = reconstructPath(endNode)
      const endTime = performance.now()

      for (const node of path) {
        if (node !== startNode && node !== endNode) {
          node.isPath = true
          if (onGridUpdate) {
            onGridUpdate([...grid])
          }
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
      if (!neighbor.isVisited && !neighbor.isWall && !openSet.includes(neighbor)) {
        neighbor.heuristic = heuristic(neighbor, endNode)
        neighbor.previousNode = currentNode
        openSet.push(neighbor)
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

async function bidirectional(
  grid: GridNode[][],
  start: { row: number; col: number },
  end: { row: number; col: number },
  animationSpeed: number,
  onGridUpdate?: (grid: GridNode[][]) => void,
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

      if (onGridUpdate) {
        onGridUpdate([...grid])
      }

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

      if (onGridUpdate) {
        onGridUpdate([...grid])
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
        if (onGridUpdate) {
          onGridUpdate([...grid])
        }
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

// Helper functions
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

function heuristic(nodeA: GridNode, nodeB: GridNode): number {
  return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col)
}

async function dfsRecursive(
  grid: GridNode[][],
  currentNode: GridNode,
  endNode: GridNode,
  visitedNodes: GridNode[],
  animationSpeed: number,
  onGridUpdate?: (grid: GridNode[][]) => void,
): Promise<boolean> {
  if (currentNode.isWall || currentNode.isVisited) {
    return false
  }

  currentNode.isVisited = true
  visitedNodes.push(currentNode)

  if (onGridUpdate) {
    onGridUpdate([...grid])
  }

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
      if (await dfsRecursive(grid, neighbor, endNode, visitedNodes, animationSpeed, onGridUpdate)) {
        return true
      }
    }
  }

  return false
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

export const algorithms: Record<
  Algorithm,
  (
    grid: GridNode[][],
    start: { row: number; col: number },
    end: { row: number; col: number },
    animationSpeed: number,
    onGridUpdate?: (grid: GridNode[][]) => void,
  ) => Promise<AlgorithmResult>
> = {
  dijkstra,
  astar,
  bfs,
  dfs,
  greedy,
  bidirectional,
}

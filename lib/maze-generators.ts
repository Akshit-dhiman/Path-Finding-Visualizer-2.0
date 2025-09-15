import type { GridNode, MazeType } from "@/types/pathfinding"

export async function generateMaze(
  grid: GridNode[][],
  type: MazeType,
  animationSpeed = 50,
  onUpdate?: (grid: GridNode[][]) => void,
): Promise<GridNode[][]> {
  const newGrid = grid.map((row) =>
    row.map((node) => ({
      ...node,
      isWall: false,
      isVisited: false,
      isPath: false,
      distance: Number.POSITIVE_INFINITY,
      previousNode: null,
    })),
  )

  switch (type) {
    case "random":
      return await generateRandomMaze(newGrid, animationSpeed, onUpdate)
    case "recursive":
      return await generateRecursiveMaze(newGrid, animationSpeed, onUpdate)
    case "prim":
      return await generatePrimMaze(newGrid, animationSpeed, onUpdate)
    case "kruskal":
      return await generateKruskalMaze(newGrid, animationSpeed, onUpdate)
    case "binary":
      return await generateBinaryTreeMaze(newGrid, animationSpeed, onUpdate)
    case "sidewinder":
      return await generateSidewinderMaze(newGrid, animationSpeed, onUpdate)
    default:
      return newGrid
  }
}

async function generateRandomMaze(
  grid: GridNode[][],
  animationSpeed: number,
  onUpdate?: (grid: GridNode[][]) => void,
): Promise<GridNode[][]> {
  const rows = grid.length
  const cols = grid[0].length

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const node = grid[row][col]
      if (!node.isStart && !node.isEnd && Math.random() < 0.35) {
        node.isWall = true

        if (onUpdate && (row * cols + col) % 5 === 0) {
          onUpdate([...grid])
          await new Promise((resolve) => setTimeout(resolve, Math.max(1, 101 - animationSpeed)))
        }
      }
    }
  }

  if (onUpdate) onUpdate([...grid])
  return grid
}

async function generateRecursiveMaze(
  grid: GridNode[][],
  animationSpeed: number,
  onUpdate?: (grid: GridNode[][]) => void,
): Promise<GridNode[][]> {
  const rows = grid.length
  const cols = grid[0].length

  // Fill with walls
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const node = grid[row][col]
      if (!node.isStart && !node.isEnd) {
        node.isWall = true
      }
    }
  }

  if (onUpdate) {
    onUpdate([...grid])
    await new Promise((resolve) => setTimeout(resolve, 200))
  }

  // Recursive division
  await divide(grid, 0, 0, cols - 1, rows - 1, true, animationSpeed, onUpdate)

  return grid
}

async function divide(
  grid: GridNode[][],
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  horizontal: boolean,
  animationSpeed: number,
  onUpdate?: (grid: GridNode[][]) => void,
) {
  if (x2 - x1 < 2 || y2 - y1 < 2) return

  if (horizontal) {
    const y = Math.floor((y1 + y2) / 2)
    const hole = Math.floor(Math.random() * (x2 - x1)) + x1

    for (let x = x1; x <= x2; x++) {
      if (x !== hole && !grid[y][x].isStart && !grid[y][x].isEnd) {
        grid[y][x].isWall = false
      }
    }

    if (onUpdate) {
      onUpdate([...grid])
      await new Promise((resolve) => setTimeout(resolve, Math.max(10, 101 - animationSpeed)))
    }

    await divide(grid, x1, y1, x2, y - 1, !horizontal, animationSpeed, onUpdate)
    await divide(grid, x1, y + 1, x2, y2, !horizontal, animationSpeed, onUpdate)
  } else {
    const x = Math.floor((x1 + x2) / 2)
    const hole = Math.floor(Math.random() * (y2 - y1)) + y1

    for (let y = y1; y <= y2; y++) {
      if (y !== hole && !grid[y][x].isStart && !grid[y][x].isEnd) {
        grid[y][x].isWall = false
      }
    }

    if (onUpdate) {
      onUpdate([...grid])
      await new Promise((resolve) => setTimeout(resolve, Math.max(10, 101 - animationSpeed)))
    }

    await divide(grid, x1, y1, x - 1, y2, !horizontal, animationSpeed, onUpdate)
    await divide(grid, x + 1, y1, x2, y2, !horizontal, animationSpeed, onUpdate)
  }
}

async function generatePrimMaze(
  grid: GridNode[][],
  animationSpeed: number,
  onUpdate?: (grid: GridNode[][]) => void,
): Promise<GridNode[][]> {
  const rows = grid.length
  const cols = grid[0].length

  // Fill with walls
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const node = grid[row][col]
      if (!node.isStart && !node.isEnd) {
        node.isWall = true
      }
    }
  }

  if (onUpdate) {
    onUpdate([...grid])
    await new Promise((resolve) => setTimeout(resolve, 200))
  }

  // Start from random cell
  const startRow = Math.floor(Math.random() * rows)
  const startCol = Math.floor(Math.random() * cols)

  if (!grid[startRow][startCol].isStart && !grid[startRow][startCol].isEnd) {
    grid[startRow][startCol].isWall = false
  }

  const walls: Array<{ row: number; col: number }> = []
  addWalls(grid, startRow, startCol, walls)

  while (walls.length > 0) {
    const randomIndex = Math.floor(Math.random() * walls.length)
    const wall = walls[randomIndex]
    walls.splice(randomIndex, 1)

    const { row, col } = wall
    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      const node = grid[row][col]
      if (node.isWall && !node.isStart && !node.isEnd) {
        const neighbors = getNeighbors(grid, row, col).filter((n) => !n.isWall)
        if (neighbors.length === 1) {
          node.isWall = false
          addWalls(grid, row, col, walls)

          if (onUpdate && Math.random() < 0.1) {
            onUpdate([...grid])
            await new Promise((resolve) => setTimeout(resolve, Math.max(5, 101 - animationSpeed)))
          }
        }
      }
    }
  }

  if (onUpdate) onUpdate([...grid])
  return grid
}

async function generateKruskalMaze(
  grid: GridNode[][],
  animationSpeed: number,
  onUpdate?: (grid: GridNode[][]) => void,
): Promise<GridNode[][]> {
  const rows = grid.length
  const cols = grid[0].length

  // Fill with walls
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const node = grid[row][col]
      if (!node.isStart && !node.isEnd) {
        node.isWall = true
      }
    }
  }

  if (onUpdate) {
    onUpdate([...grid])
    await new Promise((resolve) => setTimeout(resolve, 200))
  }

  // Create disjoint set for union-find
  const parent: number[][] = []
  for (let row = 0; row < rows; row++) {
    parent[row] = []
    for (let col = 0; col < cols; col++) {
      parent[row][col] = row * cols + col
    }
  }

  const find = (row: number, col: number): number => {
    const id = row * cols + col
    if (parent[row][col] !== id) {
      const parentRow = Math.floor(parent[row][col] / cols)
      const parentCol = parent[row][col] % cols
      parent[row][col] = find(parentRow, parentCol)
    }
    return parent[row][col]
  }

  const union = (row1: number, col1: number, row2: number, col2: number) => {
    const root1 = find(row1, col1)
    const root2 = find(row2, col2)
    if (root1 !== root2) {
      const parentRow = Math.floor(root2 / cols)
      const parentCol = root2 % cols
      parent[parentRow][parentCol] = root1
    }
  }

  // Create list of all possible edges
  const edges: Array<{ row1: number; col1: number; row2: number; col2: number }> = []
  for (let row = 0; row < rows; row += 2) {
    for (let col = 0; col < cols; col += 2) {
      if (row + 2 < rows) edges.push({ row1: row, col1: col, row2: row + 2, col2: col })
      if (col + 2 < cols) edges.push({ row1: row, col1: col, row2: row, col2: col + 2 })
    }
  }

  // Shuffle edges
  for (let i = edges.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[edges[i], edges[j]] = [edges[j], edges[i]]
  }

  // Process edges
  for (const edge of edges) {
    const { row1, col1, row2, col2 } = edge
    if (find(row1, col1) !== find(row2, col2)) {
      union(row1, col1, row2, col2)

      // Remove walls
      if (!grid[row1][col1].isStart && !grid[row1][col1].isEnd) grid[row1][col1].isWall = false
      if (!grid[row2][col2].isStart && !grid[row2][col2].isEnd) grid[row2][col2].isWall = false

      const wallRow = (row1 + row2) / 2
      const wallCol = (col1 + col2) / 2
      if (!grid[wallRow][wallCol].isStart && !grid[wallRow][wallCol].isEnd) {
        grid[wallRow][wallCol].isWall = false
      }

      if (onUpdate && Math.random() < 0.05) {
        onUpdate([...grid])
        await new Promise((resolve) => setTimeout(resolve, Math.max(10, 101 - animationSpeed)))
      }
    }
  }

  if (onUpdate) onUpdate([...grid])
  return grid
}

async function generateBinaryTreeMaze(
  grid: GridNode[][],
  animationSpeed: number,
  onUpdate?: (grid: GridNode[][]) => void,
): Promise<GridNode[][]> {
  const rows = grid.length
  const cols = grid[0].length

  // Fill with walls
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const node = grid[row][col]
      if (!node.isStart && !node.isEnd) {
        node.isWall = true
      }
    }
  }

  if (onUpdate) {
    onUpdate([...grid])
    await new Promise((resolve) => setTimeout(resolve, 200))
  }

  // Generate maze
  for (let row = 0; row < rows; row += 2) {
    for (let col = 0; col < cols; col += 2) {
      if (!grid[row][col].isStart && !grid[row][col].isEnd) {
        grid[row][col].isWall = false
      }

      const neighbors = []
      if (row > 0) neighbors.push({ row: row - 2, col })
      if (col < cols - 2) neighbors.push({ row, col: col + 2 })

      if (neighbors.length > 0) {
        const chosen = neighbors[Math.floor(Math.random() * neighbors.length)]
        const wallRow = (row + chosen.row) / 2
        const wallCol = (col + chosen.col) / 2

        if (!grid[wallRow][wallCol].isStart && !grid[wallRow][wallCol].isEnd) {
          grid[wallRow][wallCol].isWall = false
        }

        if (onUpdate && Math.random() < 0.1) {
          onUpdate([...grid])
          await new Promise((resolve) => setTimeout(resolve, Math.max(5, 101 - animationSpeed)))
        }
      }
    }
  }

  if (onUpdate) onUpdate([...grid])
  return grid
}

async function generateSidewinderMaze(
  grid: GridNode[][],
  animationSpeed: number,
  onUpdate?: (grid: GridNode[][]) => void,
): Promise<GridNode[][]> {
  const rows = grid.length
  const cols = grid[0].length

  // Fill with walls
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const node = grid[row][col]
      if (!node.isStart && !node.isEnd) {
        node.isWall = true
      }
    }
  }

  if (onUpdate) {
    onUpdate([...grid])
    await new Promise((resolve) => setTimeout(resolve, 200))
  }

  // Generate maze
  for (let row = 0; row < rows; row += 2) {
    let runStart = 0
    for (let col = 0; col < cols; col += 2) {
      if (!grid[row][col].isStart && !grid[row][col].isEnd) {
        grid[row][col].isWall = false
      }

      const carveEast = col < cols - 2 && (row === 0 || Math.random() < 0.5)
      const carveNorth = row > 0 && !carveEast

      if (carveEast) {
        if (!grid[row][col + 1].isStart && !grid[row][col + 1].isEnd) {
          grid[row][col + 1].isWall = false
        }
      } else {
        if (carveNorth) {
          const runCol = runStart + Math.floor(Math.random() * ((col - runStart) / 2 + 1)) * 2
          if (!grid[row - 1][runCol].isStart && !grid[row - 1][runCol].isEnd) {
            grid[row - 1][runCol].isWall = false
          }
        }
        runStart = col + 2
      }

      if (onUpdate && Math.random() < 0.1) {
        onUpdate([...grid])
        await new Promise((resolve) => setTimeout(resolve, Math.max(5, 101 - animationSpeed)))
      }
    }
  }

  if (onUpdate) onUpdate([...grid])
  return grid
}

function addWalls(grid: GridNode[][], row: number, col: number, walls: Array<{ row: number; col: number }>) {
  const directions = [
    [-2, 0],
    [2, 0],
    [0, -2],
    [0, 2],
  ]

  for (const [dr, dc] of directions) {
    const newRow = row + dr
    const newCol = col + dc

    if (newRow >= 0 && newRow < grid.length && newCol >= 0 && newCol < grid[0].length) {
      const node = grid[newRow][newCol]
      if (node.isWall && !node.isStart && !node.isEnd) {
        walls.push({ row: newRow, col: newCol })
      }
    }
  }
}

function getNeighbors(grid: GridNode[][], row: number, col: number): GridNode[] {
  const neighbors: GridNode[] = []
  const directions = [
    [-2, 0],
    [2, 0],
    [0, -2],
    [0, 2],
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

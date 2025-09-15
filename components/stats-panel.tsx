"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Route, Eye, TrendingUp, BarChart3, Target, Award } from "lucide-react"
import type { VisualizationStats, Algorithm } from "@/types/pathfinding"

interface StatsPanelProps {
  stats: VisualizationStats
  algorithm: Algorithm
  previousStats?: Array<{ algorithm: Algorithm; stats: VisualizationStats }>
  onSaveStats?: (algorithm: Algorithm, stats: VisualizationStats) => void
}

const algorithmComplexity: Record<Algorithm, { time: string; space: string; optimal: boolean }> = {
  dijkstra: { time: "O((V + E) log V)", space: "O(V)", optimal: true },
  astar: { time: "O(b^d)", space: "O(b^d)", optimal: true },
  bfs: { time: "O(V + E)", space: "O(V)", optimal: true },
  dfs: { time: "O(V + E)", space: "O(V)", optimal: false },
  greedy: { time: "O(b^m)", space: "O(b^m)", optimal: false },
  bidirectional: { time: "O(b^(d/2))", space: "O(b^(d/2))", optimal: true },
}

const algorithmNames: Record<Algorithm, string> = {
  dijkstra: "Dijkstra's Algorithm",
  astar: "A* Search",
  bfs: "Breadth-First Search",
  dfs: "Depth-First Search",
  greedy: "Greedy Best-First",
  bidirectional: "Bidirectional Search",
}

export function StatsPanel({ stats, algorithm, previousStats = [], onSaveStats }: StatsPanelProps) {
  const [showComparison, setShowComparison] = useState(false)
  const complexity = algorithmComplexity[algorithm]

  const efficiency = stats.pathFound ? Math.round((stats.nodesInPath / stats.nodesVisited) * 100) : 0
  const explorationRatio = stats.pathFound ? Math.round((stats.nodesVisited / (stats.nodesInPath || 1)) * 100) : 0

  const getPerformanceRating = () => {
    if (!stats.pathFound) return { rating: "F", color: "destructive" as const, score: 0 }

    let score = 0

    // Efficiency (40% weight)
    score += (efficiency / 100) * 40

    // Speed (30% weight) - lower execution time is better
    const speedScore = Math.max(0, 1 - stats.executionTime / 2000) // normalize to 2 seconds max
    score += speedScore * 30

    // Optimality (30% weight)
    score += complexity.optimal ? 30 : 15

    if (score >= 85) return { rating: "A+", color: "default" as const, score }
    if (score >= 75) return { rating: "A", color: "default" as const, score }
    if (score >= 65) return { rating: "B+", color: "secondary" as const, score }
    if (score >= 55) return { rating: "B", color: "secondary" as const, score }
    if (score >= 45) return { rating: "C", color: "outline" as const, score }
    return { rating: "D", color: "destructive" as const, score }
  }

  const performanceRating = getPerformanceRating()

  const handleSaveStats = () => {
    if (onSaveStats) {
      onSaveStats(algorithm, stats)
    }
  }

  return (
    <Card className="p-6 shadow-lg">
      <Tabs defaultValue="current" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold">Performance Analytics</h3>
            <Badge variant={stats.pathFound ? "default" : "destructive"}>
              {stats.pathFound ? "Path Found" : "No Path"}
            </Badge>
            <Badge variant={performanceRating.color} className="font-bold">
              {performanceRating.rating}
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            <TabsList>
              <TabsTrigger value="current">Current</TabsTrigger>
              <TabsTrigger value="comparison" disabled={previousStats.length === 0}>
                Compare ({previousStats.length})
              </TabsTrigger>
            </TabsList>
            {onSaveStats && (
              <Button size="sm" variant="outline" onClick={handleSaveStats}>
                Save Results
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="current" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-lg font-bold">{stats.executionTime}ms</div>
                <div className="text-xs text-muted-foreground">Execution Time</div>
                <Progress value={Math.min((stats.executionTime / 2000) * 100, 100)} className="h-1 mt-1" />
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <Route className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-lg font-bold">{stats.pathLength}</div>
                <div className="text-xs text-muted-foreground">Path Length</div>
                <div
                  className={`text-xs mt-1 font-medium ${complexity.optimal ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                >
                  {complexity.optimal ? "Optimal" : "Suboptimal"}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <Eye className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-lg font-bold">{stats.nodesVisited}</div>
                <div className="text-xs text-muted-foreground">Nodes Visited</div>
                <Progress value={Math.min((stats.nodesVisited / 1000) * 100, 100)} className="h-1 mt-1" />
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <Target className="w-5 h-5 text-orange-500" />
              <div>
                <div className="text-lg font-bold">{efficiency}%</div>
                <div className="text-xs text-muted-foreground">Efficiency</div>
                <Progress value={efficiency} className="h-1 mt-1" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Algorithm Analysis</span>
              </h4>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Algorithm:</span>
                  <span className="font-medium">{algorithmNames[algorithm]}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Time Complexity:</span>
                  <code className="bg-muted px-2 py-1 rounded text-xs">{complexity.time}</code>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Space Complexity:</span>
                  <code className="bg-muted px-2 py-1 rounded text-xs">{complexity.space}</code>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Guarantees Optimal:</span>
                  <Badge variant={complexity.optimal ? "default" : "destructive"} className="">
                    {complexity.optimal ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Performance Metrics</span>
              </h4>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Overall Rating:</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant={performanceRating.color} className="font-bold">
                      {performanceRating.rating}
                    </Badge>
                    <span className="text-xs text-muted-foreground">({Math.round(performanceRating.score)}/100)</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Exploration Ratio:</span>
                  <span className="font-medium">{explorationRatio}%</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Nodes per Path Node:</span>
                  <span className="font-medium">
                    {stats.pathFound ? Math.round((stats.nodesVisited / stats.nodesInPath) * 10) / 10 : "N/A"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Speed Rating:</span>
                  <Badge
                    variant={
                      stats.executionTime < 500 ? "default" : stats.executionTime < 1000 ? "secondary" : "outline"
                    }
                  >
                    {stats.executionTime < 500 ? "Fast" : stats.executionTime < 1000 ? "Medium" : "Slow"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="text-sm font-semibold mb-2 flex items-center space-x-2">
              <Award className="w-4 h-4" />
              <span>Performance Insights</span>
            </h4>
            <div className="text-sm text-muted-foreground space-y-1">
              {stats.pathFound ? (
                <>
                  <p>
                    • This algorithm explored <strong>{stats.nodesVisited}</strong> nodes to find a path of length{" "}
                    <strong>{stats.pathLength}</strong>
                  </p>
                  <p>
                    • Efficiency of <strong>{efficiency}%</strong> means{" "}
                    {efficiency > 80
                      ? "excellent pathfinding with minimal exploration"
                      : efficiency > 60
                        ? "good pathfinding with moderate exploration"
                        : "extensive exploration was needed"}
                  </p>
                  <p>
                    • Completed in <strong>{stats.executionTime}ms</strong> -{" "}
                    {stats.executionTime < 500
                      ? "very fast execution"
                      : stats.executionTime < 1000
                        ? "reasonable execution time"
                        : "slower execution, consider optimizing grid size or animation speed"}
                  </p>
                </>
              ) : (
                <p>
                  • No path was found between the start and end nodes. Try removing some walls or checking connectivity.
                </p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          {previousStats.length > 0 ? (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Algorithm Comparison</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Algorithm</th>
                      <th className="text-right p-2">Time (ms)</th>
                      <th className="text-right p-2">Path Length</th>
                      <th className="text-right p-2">Nodes Visited</th>
                      <th className="text-right p-2">Efficiency</th>
                      <th className="text-right p-2">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b bg-muted/30">
                      <td className="p-2 font-medium">{algorithmNames[algorithm]} (Current)</td>
                      <td className="text-right p-2">{stats.executionTime}</td>
                      <td className="text-right p-2">{stats.pathLength}</td>
                      <td className="text-right p-2">{stats.nodesVisited}</td>
                      <td className="text-right p-2">{efficiency}%</td>
                      <td className="text-right p-2">
                        <Badge variant={performanceRating.color} size="sm">
                          {performanceRating.rating}
                        </Badge>
                      </td>
                    </tr>
                    {previousStats.map((prevStat, index) => {
                      const prevEfficiency = prevStat.stats.pathFound
                        ? Math.round((prevStat.stats.nodesInPath / prevStat.stats.nodesVisited) * 100)
                        : 0
                      return (
                        <tr key={index} className="border-b">
                          <td className="p-2">{algorithmNames[prevStat.algorithm]}</td>
                          <td className="text-right p-2">{prevStat.stats.executionTime}</td>
                          <td className="text-right p-2">{prevStat.stats.pathLength}</td>
                          <td className="text-right p-2">{prevStat.stats.nodesVisited}</td>
                          <td className="text-right p-2">{prevEfficiency}%</td>
                          <td className="text-right p-2">-</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p>No previous results to compare.</p>
              <p className="text-sm">Run different algorithms to see comparisons here.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  )
}

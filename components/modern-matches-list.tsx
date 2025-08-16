"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Search, TrendingUp, Target, BarChart3, Zap, Calendar, Users, Trophy, Activity } from "lucide-react"
import { searchMatches, calculateStatistics } from "@/lib/matches"
import { PredictionsPanel } from "@/components/PredictionsPanel"
import { usePredictionsRealTime } from "@/hooks/useRealTimeData"
import type { Match, StatisticsResult } from "@/types/match"

export default function ModernMatchesList() {
  const [homeTeam, setHomeTeam] = useState("")
  const [awayTeam, setAwayTeam] = useState("")
  const [matches, setMatches] = useState<Match[]>([])
  const [homeMatches, setHomeMatches] = useState<Match[]>([])
  const [awayMatches, setAwayMatches] = useState<Match[]>([])
  const [statistics, setStatistics] = useState<StatisticsResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("search")

  // Real-time predictions updates
  const { isConnected: predictionsConnected } = usePredictionsRealTime(homeTeam, awayTeam, (prediction) => {
    console.log("Received real-time prediction update:", prediction)
    // The PredictionsPanel will automatically refresh via its own subscription
  })

  const handleSearch = async () => {
    if (!homeTeam.trim() || !awayTeam.trim()) return

    setLoading(true)
    try {
      const searchResults = await searchMatches(homeTeam, awayTeam)
      setMatches(searchResults.matches)
      setHomeMatches(searchResults.homeMatches)
      setAwayMatches(searchResults.awayMatches)

      const stats = await calculateStatistics(searchResults.matches)
      setStatistics(stats)

      setActiveTab("results")
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const getResultBadge = (homeGoals: number, awayGoals: number, isHomeTeam: boolean) => {
    if (homeGoals > awayGoals) {
      return isHomeTeam ? (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">W</Badge>
      ) : (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">L</Badge>
      )
    } else if (homeGoals < awayGoals) {
      return isHomeTeam ? (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">L</Badge>
      ) : (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">W</Badge>
      )
    } else {
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">D</Badge>
    }
  }

  const quickPredictionSummary = useMemo(() => {
    if (!statistics) return null

    const homeWinProb = statistics.home_form_index || 0.33
    const awayWinProb = statistics.away_form_index || 0.33
    const drawProb = 1 - homeWinProb - awayWinProb

    return {
      homeWinProb: Math.max(0.1, homeWinProb),
      drawProb: Math.max(0.1, drawProb),
      awayWinProb: Math.max(0.1, awayWinProb),
    }
  }, [statistics])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b0f] via-[#1a1b3a] to-[#0f0f23] p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30">
              <Activity className="h-8 w-8 text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Football Analytics Pro
            </h1>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Advanced football statistics and AI-powered predictions with real-time updates
          </p>
          {predictionsConnected && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <Zap className="h-3 w-3 mr-1" />
              Live Predictions Active
            </Badge>
          )}
        </div>

        {/* Search Section */}
        <Card className="bg-black/40 backdrop-blur-xl border-gray-800/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Search className="h-5 w-5 text-blue-400" />
              Team Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Home Team</label>
                <Input
                  placeholder="Enter home team name..."
                  value={homeTeam}
                  onChange={(e) => setHomeTeam(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Away Team</label>
                <Input
                  placeholder="Enter away team name..."
                  value={awayTeam}
                  onChange={(e) => setAwayTeam(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-500"
                />
              </div>
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading || !homeTeam.trim() || !awayTeam.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analyze Teams
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Tabs */}
        {(matches.length > 0 || statistics) && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-black/40 backdrop-blur-xl border-gray-800/50">
              <TabsTrigger value="results" className="data-[state=active]:bg-blue-600">
                <Trophy className="h-4 w-4 mr-2" />
                Results
              </TabsTrigger>
              <TabsTrigger value="predictions" className="data-[state=active]:bg-purple-600">
                <Target className="h-4 w-4 mr-2" />
                Predictions
              </TabsTrigger>
              <TabsTrigger value="statistics" className="data-[state=active]:bg-green-600">
                <BarChart3 className="h-4 w-4 mr-2" />
                Statistics
              </TabsTrigger>
              <TabsTrigger value="analysis" className="data-[state=active]:bg-orange-600">
                <TrendingUp className="h-4 w-4 mr-2" />
                Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="space-y-6">
              {/* Quick Stats Overview */}
              {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-black/40 backdrop-blur-xl border-gray-800/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/20">
                          <Users className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Total Matches</p>
                          <p className="text-2xl font-bold text-white">{matches.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 backdrop-blur-xl border-gray-800/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/20">
                          <Target className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Avg Goals</p>
                          <p className="text-2xl font-bold text-white">
                            {statistics.average_goals?.average_total_goals?.toFixed(1) || "0.0"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 backdrop-blur-xl border-gray-800/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/20">
                          <Activity className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">BTTS %</p>
                          <p className="text-2xl font-bold text-white">
                            {statistics.both_teams_scored_percentage?.toFixed(0) || "0"}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 backdrop-blur-xl border-gray-800/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-500/20">
                          <TrendingUp className="h-5 w-5 text-orange-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Form Index</p>
                          <p className="text-2xl font-bold text-white">
                            {((statistics.home_form_index || 0) * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Matches List */}
              <Card className="bg-black/40 backdrop-blur-xl border-gray-800/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Calendar className="h-5 w-5 text-blue-400" />
                    Head-to-Head Matches ({matches.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {matches.slice(0, 10).map((match, index) => (
                      <div
                        key={match.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-gray-900/30 border border-gray-800/50 hover:bg-gray-900/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-gray-400 min-w-[80px]">{formatDate(match.match_time)}</div>
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-white min-w-[120px] text-right">{match.home_team}</span>
                            <div className="flex items-center gap-2 min-w-[60px] justify-center">
                              <span className="text-xl font-bold text-blue-400">{match.full_time_home_goals}</span>
                              <span className="text-gray-500">-</span>
                              <span className="text-xl font-bold text-purple-400">{match.full_time_away_goals}</span>
                            </div>
                            <span className="font-medium text-white min-w-[120px]">{match.away_team}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getResultBadge(
                            match.full_time_home_goals,
                            match.full_time_away_goals,
                            match.home_team === homeTeam,
                          )}
                          <div className="text-xs text-gray-500">
                            HT: {match.half_time_home_goals}-{match.half_time_away_goals}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="predictions" className="space-y-6">
              <PredictionsPanel
                homeTeam={homeTeam}
                awayTeam={awayTeam}
                matches={matches}
                homeMatches={homeMatches}
                awayMatches={awayMatches}
              />
            </TabsContent>

            <TabsContent value="statistics" className="space-y-6">
              {statistics && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Form Analysis */}
                  <Card className="bg-black/40 backdrop-blur-xl border-gray-800/50">
                    <CardHeader>
                      <CardTitle className="text-white">Team Form</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">{homeTeam} Form</span>
                          <span className="text-white">{((statistics.home_form_index || 0) * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={(statistics.home_form_index || 0) * 100} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">{awayTeam} Form</span>
                          <span className="text-white">{((statistics.away_form_index || 0) * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={(statistics.away_form_index || 0) * 100} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Goal Statistics */}
                  <Card className="bg-black/40 backdrop-blur-xl border-gray-800/50">
                    <CardHeader>
                      <CardTitle className="text-white">Goal Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-400">
                            {statistics.average_goals?.average_home_goals?.toFixed(1) || "0.0"}
                          </p>
                          <p className="text-sm text-gray-400">Avg Home Goals</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-400">
                            {statistics.average_goals?.average_away_goals?.toFixed(1) || "0.0"}
                          </p>
                          <p className="text-sm text-gray-400">Avg Away Goals</p>
                        </div>
                      </div>
                      <div className="text-center pt-2 border-t border-gray-800">
                        <p className="text-3xl font-bold text-green-400">
                          {statistics.average_goals?.average_total_goals?.toFixed(1) || "0.0"}
                        </p>
                        <p className="text-sm text-gray-400">Total Goals Per Match</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              {quickPredictionSummary && (
                <Card className="bg-black/40 backdrop-blur-xl border-gray-800/50">
                  <CardHeader>
                    <CardTitle className="text-white">Quick Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <p className="text-2xl font-bold text-green-400">
                          {(quickPredictionSummary.homeWinProb * 100).toFixed(0)}%
                        </p>
                        <p className="text-sm text-gray-400">{homeTeam} Win</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <p className="text-2xl font-bold text-yellow-400">
                          {(quickPredictionSummary.drawProb * 100).toFixed(0)}%
                        </p>
                        <p className="text-sm text-gray-400">Draw</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="text-2xl font-bold text-red-400">
                          {(quickPredictionSummary.awayWinProb * 100).toFixed(0)}%
                        </p>
                        <p className="text-sm text-gray-400">{awayTeam} Win</p>
                      </div>
                    </div>
                    <div className="text-center text-sm text-gray-400">
                      <p>Based on historical form and performance data</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}

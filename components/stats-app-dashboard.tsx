"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  Bell,
  TrendingUp,
  Target,
  Activity,
  BarChart3,
  PieChart,
  Zap,
  Crown,
  Shield,
  Flame,
  Star,
  Clock,
  Calendar,
  MapPin,
  Users,
  Trophy,
} from "lucide-react"
import { searchMatches } from "@/lib/matches"
import { calculateStatistics } from "@/lib/football-statistics"
import type { Match, StatisticsResult } from "@/lib/football-statistics"

export default function StatsAppDashboard() {
  const [homeTeam, setHomeTeam] = useState("Barcelona")
  const [awayTeam, setAwayTeam] = useState("Getafe")
  const [matches, setMatches] = useState<Match[]>([])
  const [statistics, setStatistics] = useState<StatisticsResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    // Auto-load Barcelona vs Getafe on mount
    handleSearch()
  }, [])

  const handleSearch = async () => {
    if (!homeTeam && !awayTeam) return

    setLoading(true)
    try {
      const results = await searchMatches(homeTeam, awayTeam)
      setMatches(results)
      const stats = calculateStatistics(results, homeTeam, awayTeam)
      setStatistics(stats)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }

  const mockLegendData = {
    home: {
      comeback_frequency: 21,
      comeback_success: 67,
      resilience_score: 0.321,
      mental_toughness: "STRONG",
    },
    away: {
      comeback_frequency: 23,
      comeback_success: 83,
      resilience_score: 0.385,
      mental_toughness: "BEAST",
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b0f] via-[#1a1b2e] to-[#16213e] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">StatsApp</h1>
                <p className="text-xs text-gray-400">Barcelona vs Getafe — Részletes elemzés</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Keresés (csapat, liga, dátum)..."
                  className="pl-10 w-80 bg-white/5 border-white/10 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Bell className="w-5 h-5" />
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2">
                <Zap className="w-4 h-4 mr-2" />
                AI Elemzés
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Match Header */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-white/10 backdrop-blur-xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg mb-2">
                      BA
                    </div>
                    <h3 className="text-xl font-bold text-white">Barcelona</h3>
                    <p className="text-sm text-blue-400">Forma: 100% • Hazai</p>
                  </div>

                  <div className="text-center mx-8">
                    <div className="text-6xl font-black text-white mb-2">3 - 1</div>
                    <p className="text-sm text-gray-400">La Liga • 19. forduló</p>
                    <p className="text-xs text-gray-500">Végeremény</p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-lg mb-2">
                      GE
                    </div>
                    <h3 className="text-xl font-bold text-white">Getafe</h3>
                    <p className="text-sm text-red-400">Forma: 0% • Vendég</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>2025. február 10.</span>
                    <Clock className="w-4 h-4 ml-2" />
                    <span>21:00</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>Estadi Olímpic, Barcelona</span>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <Activity className="w-3 h-3 mr-1" />
                    AI Bizonyosság: 80%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          {[
            { label: "BTTS", value: "70%", icon: Target, color: "text-green-400" },
            { label: "Átlag gólok", value: "3", icon: Activity, color: "text-blue-400" },
            { label: "H2H", value: "8-2-0", icon: Users, color: "text-purple-400" },
            { label: "xG (H)", value: "2.1", icon: TrendingUp, color: "text-orange-400" },
            { label: "xG (V)", value: "0.9", icon: TrendingUp, color: "text-red-400" },
            { label: "Labdabirtoklás", value: "62%", icon: PieChart, color: "text-cyan-400" },
            { label: "Kapura lövés", value: "7—3", icon: Target, color: "text-yellow-400" },
            { label: "AI Bizonyosság", value: "80%", icon: Zap, color: "text-purple-400" },
          ].map((stat, index) => (
            <Card key={index} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
              <CardContent className="p-4 text-center">
                <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
                <div className="text-lg font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-8 bg-white/5 rounded-2xl p-2">
          {[
            { id: "overview", label: "Áttekintés", icon: BarChart3 },
            { id: "h2h", label: "Játékosok", icon: Users },
            { id: "stats", label: "Idősor", icon: Clock },
            { id: "ai", label: "AI Elemzés", icon: Zap },
            { id: "predictions", label: "Vélemények", icon: Star },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === tab.id
                  ? "bg-purple-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Statistics */}
            <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  Kulcs statisztikák
                </h3>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Team Comparison Bars */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-300">Mindkét csapat gólja</span>
                      <div className="flex items-center gap-4">
                        <span className="text-blue-400 font-bold">Igen</span>
                        <span className="text-gray-400">vs</span>
                        <span className="text-red-400 font-bold">Nem</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-800 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: "70%" }}></div>
                      </div>
                      <span className="text-sm font-bold text-white">70%</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-300">Hazai győzelem valószínűség</span>
                      <div className="flex items-center gap-4">
                        <span className="text-blue-400 font-bold">Barcelona</span>
                        <span className="text-gray-400">vs</span>
                        <span className="text-red-400 font-bold">Getafe</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-800 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                      </div>
                      <span className="text-sm font-bold text-white">85%</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-300">Várható gólok</span>
                      <div className="flex items-center gap-4">
                        <span className="text-blue-400 font-bold">2.1</span>
                        <span className="text-gray-400">vs</span>
                        <span className="text-red-400 font-bold">0.9</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-800 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: "70%" }}></div>
                      </div>
                      <span className="text-sm font-bold text-white">70%</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-300">Forma index</span>
                      <div className="flex items-center gap-4">
                        <span className="text-blue-400 font-bold">100%</span>
                        <span className="text-gray-400">vs</span>
                        <span className="text-red-400 font-bold">0%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-800 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "100%" }}></div>
                      </div>
                      <span className="text-sm font-bold text-white">100%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Match Statistics */}
            <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  Részletes mérkőzés statisztikák
                </h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Labdabirtoklás</span>
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">62%</span>
                        <span className="text-gray-500">—</span>
                        <span className="text-orange-400 font-bold">38%</span>
                      </div>
                    </div>
                    <Progress value={62} className="h-2" />

                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Összes lövés</span>
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">15</span>
                        <span className="text-gray-500">—</span>
                        <span className="text-orange-400 font-bold">8</span>
                      </div>
                    </div>
                    <Progress value={65} className="h-2" />

                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Szabálytalanságok</span>
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">12</span>
                        <span className="text-gray-500">—</span>
                        <span className="text-orange-400 font-bold">18</span>
                      </div>
                    </div>
                    <Progress value={40} className="h-2" />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Kapura lövések</span>
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">7</span>
                        <span className="text-gray-500">—</span>
                        <span className="text-orange-400 font-bold">3</span>
                      </div>
                    </div>
                    <Progress value={70} className="h-2" />

                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Szögletek</span>
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">6</span>
                        <span className="text-gray-500">—</span>
                        <span className="text-orange-400 font-bold">2</span>
                      </div>
                    </div>
                    <Progress value={75} className="h-2" />

                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Passz pontosság</span>
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">89%</span>
                        <span className="text-gray-500">—</span>
                        <span className="text-orange-400 font-bold">76%</span>
                      </div>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* LEGEND MODE Analysis */}
            <Card className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/30 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-400" />
                    LEGEND MODE Analysis
                  </h3>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Special Insights</Badge>
                </div>
                <p className="text-sm text-gray-400">Mental Toughness & Comeback Profile</p>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl p-6 mb-6">
                  <p className="text-yellow-400 font-medium mb-2">
                    Insights: Getafe are the "Comeback Kings" with higher Mental Toughness and superior comeback
                    statistics.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-400" />
                      Barcelona
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">Comeback Frequency</span>
                          <span className="text-blue-400 font-bold">{mockLegendData.home.comeback_frequency}%</span>
                        </div>
                        <Progress value={mockLegendData.home.comeback_frequency} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">Success Rate</span>
                          <span className="text-blue-400 font-bold">{mockLegendData.home.comeback_success}%</span>
                        </div>
                        <Progress value={mockLegendData.home.comeback_success} className="h-2" />
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        <Shield className="w-3 h-3 mr-1" />
                        {mockLegendData.home.mental_toughness}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <Shield className="w-4 h-4 text-red-400" />
                      Getafe
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">Comeback Frequency</span>
                          <span className="text-red-400 font-bold">{mockLegendData.away.comeback_frequency}%</span>
                        </div>
                        <Progress value={mockLegendData.away.comeback_frequency} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">Success Rate</span>
                          <span className="text-red-400 font-bold">{mockLegendData.away.comeback_success}%</span>
                        </div>
                        <Progress value={mockLegendData.away.comeback_success} className="h-2" />
                      </div>
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                        <Flame className="w-3 h-3 mr-1" />
                        {mockLegendData.away.mental_toughness}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl">
                  <h5 className="font-bold text-white mb-2 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-purple-400" />
                    Head-to-Head Comeback History
                  </h5>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-400">2</div>
                      <div className="text-xs text-gray-400">Barcelona comebacks</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-400">2.75</div>
                      <div className="text-xs text-gray-400">Avg match intensity</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-400">3</div>
                      <div className="text-xs text-gray-400">Getafe comebacks</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Side Panels */}
          <div className="space-y-6">
            {/* Recent H2H Matches */}
            <Card className="bg-gradient-to-br from-green-900/20 to-teal-900/20 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-400" />
                  Egymás elleni meccsek
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { date: "2023.12.15", result: "3-2", league: "La Liga", winner: "BAR" },
                  { date: "2023.08.20", result: "3-1", league: "La Liga", winner: "BAR" },
                  { date: "2023.04.16", result: "1-0", league: "La Liga", winner: "BAR" },
                  { date: "2023.01.22", result: "3-2", league: "La Liga", winner: "BAR" },
                  { date: "2022.10.02", result: "3-1", league: "La Liga", winner: "BAR" },
                ].map((match, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-gray-400">{match.date}</div>
                      <Badge variant="secondary" className="text-xs">
                        {match.league}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-bold text-white">{match.result}</div>
                      <div
                        className={`w-2 h-2 rounded-full ${match.winner === "BAR" ? "bg-blue-400" : "bg-red-400"}`}
                      ></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Facts */}
            <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-indigo-400" />
                  Gyors tények
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-400">Sorozat</span>
                  </div>
                  <p className="text-sm text-white">Barcelona 8 győzelem</p>
                </div>

                <div className="p-3 bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-green-400">Átlag</span>
                  </div>
                  <p className="text-sm text-white">3.0 gól/meccs</p>
                </div>

                <div className="p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-blue-400">BTTS</span>
                  </div>
                  <p className="text-sm text-white">70% valószínűség</p>
                </div>

                <div className="p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Crown className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-purple-400">Legend</span>
                  </div>
                  <p className="text-sm text-white">Getafe comeback kings</p>
                </div>
              </CardContent>
            </Card>

            {/* AI Predictions */}
            <Card className="bg-gradient-to-br from-pink-900/20 to-rose-900/20 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-pink-400" />
                  AI Predikciók
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <div className="text-lg font-bold text-green-400">80%</div>
                    <div className="text-xs text-gray-400">Hazai</div>
                  </div>
                  <div className="p-3 bg-gray-500/20 rounded-xl">
                    <div className="text-lg font-bold text-gray-400">10%</div>
                    <div className="text-xs text-gray-400">Döntetlen</div>
                  </div>
                  <div className="p-3 bg-red-500/20 rounded-xl">
                    <div className="text-lg font-bold text-red-400">10%</div>
                    <div className="text-xs text-gray-400">Vendég</div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl">
                  <h4 className="font-bold text-white mb-2">Modell bizonyosság</h4>
                  <div className="text-2xl font-bold text-purple-400">80%</div>
                  <p className="text-xs text-gray-400 mt-1">Poisson + xG + AI</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Várható gólok (xG)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 font-bold">2.1</span>
                    <span className="text-gray-500">vs</span>
                    <span className="text-red-400 font-bold">0.9</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Előrejelzett eredmény</span>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <Trophy className="w-3 h-3 mr-1" />
                    Hazai győzelem
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

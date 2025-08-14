"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import {
  Search,
  Settings,
  Bell,
  TrendingUp,
  Target,
  Users,
  BarChart3,
  Zap,
  Trophy,
  Activity,
  Clock,
  Loader2,
} from "lucide-react"
import { searchMatches } from "@/lib/matches"
import { calculateStatistics } from "@/lib/football-statistics"
import { VIRTUAL_TEAMS } from "@/lib/teams"
import type { Match, StatisticsResult } from "@/lib/football-statistics"

export default function ModernMatchesList() {
  const [homeTeam, setHomeTeam] = useState("")
  const [awayTeam, setAwayTeam] = useState("")
  const [matches, setMatches] = useState<Match[]>([])
  const [statistics, setStatistics] = useState<StatisticsResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b0f] via-[#1a1b3a] to-[#0f0f23] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">StatsApp</h1>
                <p className="text-sm text-gray-400">Futballmeccsek Adatbázis</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Keresés (csapat, liga, dátum)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80 bg-white/10 border-white/20 focus:border-purple-500 focus:ring-purple-500/20 text-white placeholder:text-gray-400"
                />
              </div>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
                <Settings className="w-5 h-5" />
              </Button>
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold px-6">
                Frissítés
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Match Search Card */}
        <Card className="bg-black/40 border-white/10 backdrop-blur-xl mb-8">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Search className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Meccsek keresése</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300">Hazai csapat</label>
                <Select value={homeTeam} onValueChange={setHomeTeam}>
                  <SelectTrigger className="bg-white/10 border-white/20 focus:border-purple-500 text-white">
                    <SelectValue placeholder="Válassz hazai csapatot" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/20">
                    {VIRTUAL_TEAMS.map((name) => (
                      <SelectItem key={name} value={name} className="text-white hover:bg-white/10">
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300">Vendég csapat</label>
                <Select value={awayTeam} onValueChange={setAwayTeam}>
                  <SelectTrigger className="bg-white/10 border-white/20 focus:border-purple-500 text-white">
                    <SelectValue placeholder="Válassz vendég csapatot" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/20">
                    {VIRTUAL_TEAMS.map((name) => (
                      <SelectItem key={name} value={name} className="text-white hover:bg-white/10">
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleSearch}
                disabled={loading || (!homeTeam && !awayTeam)}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold px-8 py-3 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Keresés...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Keresés
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setHomeTeam("")
                  setAwayTeam("")
                  setMatches([])
                  setStatistics(null)
                }}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Törlés
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Grid */}
        {statistics && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
            <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-gray-400 uppercase tracking-wide">BTTS</span>
                </div>
                <div className="text-2xl font-bold text-white">{Math.round(statistics.bttsPercentage)}%</div>
                <div className="text-xs text-gray-400">Igen</div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Átlag gólok</span>
                </div>
                <div className="text-2xl font-bold text-white">{statistics.averageGoals.toFixed(1)}</div>
                <div className="text-xs text-gray-400">10 meccs</div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-gray-400 uppercase tracking-wide">H2H</span>
                </div>
                <div className="text-2xl font-bold text-white">8-2-0</div>
                <div className="text-xs text-gray-400">W-D-L</div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-gray-400 uppercase tracking-wide">xG (H)</span>
                </div>
                <div className="text-2xl font-bold text-white">2.1</div>
                <div className="text-xs text-gray-400">Barcelona</div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-gray-400 uppercase tracking-wide">xG (V)</span>
                </div>
                <div className="text-2xl font-bold text-white">0.9</div>
                <div className="text-xs text-gray-400">Getafe</div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Labdabirtoklás</span>
                </div>
                <div className="text-2xl font-bold text-white">62%</div>
                <div className="text-xs text-gray-400">Barcelona</div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Kapura lövés</span>
                </div>
                <div className="text-2xl font-bold text-white">7—3</div>
                <div className="text-xs text-gray-400">Összesen</div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-gray-400 uppercase tracking-wide">AI Bizonyosság</span>
                </div>
                <div className="text-2xl font-bold text-white">80%</div>
                <div className="text-xs text-gray-400">Modell</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Tabs */}
        {statistics && (
          <div className="flex gap-2 mb-8">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6">
              <BarChart3 className="w-4 h-4 mr-2" />
              Áttekintés
            </Button>
            <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10 px-6">
              <Users className="w-4 h-4 mr-2" />
              Játékosok
            </Button>
            <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10 px-6">
              <Clock className="w-4 h-4 mr-2" />
              Idősor
            </Button>
            <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10 px-6">
              <TrendingUp className="w-4 h-4 mr-2" />
              AI Elemzés
            </Button>
            <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10 px-6">
              <Trophy className="w-4 h-4 mr-2" />
              Vélemények
            </Button>
          </div>
        )}

        {/* Match Results */}
        {matches.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Match Card */}
            <div className="lg:col-span-2">
              <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                        BA
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{homeTeam}</h3>
                        <p className="text-sm text-gray-400">Forma: 100% • Hazai</p>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-6xl font-bold text-white mb-2">
                        {matches[0]?.full_time_home_goals || 0} - {matches[0]?.full_time_away_goals || 0}
                      </div>
                      <p className="text-sm text-gray-400">
                        La Liga •{" "}
                        {matches[0]?.match_time ? new Date(matches[0].match_time).toLocaleDateString("hu-HU") : "N/A"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Végeredmény</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <h3 className="text-xl font-bold text-white">{awayTeam}</h3>
                        <p className="text-sm text-gray-400">Forma: 0% • Vendég</p>
                      </div>
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                        GE
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-white mb-1">70%</div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">BTTS</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white mb-1">3</div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Átlag gólok</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white mb-1">8-2-0</div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">H2H</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white mb-1">2.1</div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">xG (H)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Egymás elleni meccsek</h3>
                  <div className="space-y-3">
                    {matches.slice(0, 5).map((match, index) => (
                      <div key={match.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="text-sm">
                          <div className="text-white font-medium">
                            {match.home_team} vs {match.away_team}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {new Date(match.match_time).toLocaleDateString("hu-HU")}
                          </div>
                        </div>
                        <Badge className="bg-purple-600/20 text-purple-300 border-purple-600/30">
                          {match.full_time_home_goals}-{match.full_time_away_goals}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Gyors tények</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-gray-300">Barcelona 8 győzelem</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span className="text-sm text-gray-300">Átlag 3.0 gól/meccs</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-sm text-gray-300">70% valószínűség</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-sm text-gray-300">Getafe comeback kings</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && matches.length === 0 && !statistics && (
          <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Kezdj el keresni</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Válassz ki két csapatot a fenti keresőből, hogy részletes statisztikákat és elemzéseket láthass.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

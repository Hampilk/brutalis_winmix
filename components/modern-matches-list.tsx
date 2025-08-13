"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Settings,
  Home,
  Bell,
  Calendar,
  CheckSquare,
  Clock,
  Plus,
  TrendingUp,
  Filter,
  Grid3X3,
  Play,
} from "lucide-react"
import ModernStatsGrid from "./modern-stats-grid"
import ModernAnalyticsCard from "./modern-analytics-card"
import { searchMatches } from "@/lib/matches"
import { calculateStatistics } from "@/lib/football-statistics"
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

  const recentMatches = matches.slice(0, 5)

  return (
    <div className="min-h-screen bg-[#0c0d11] text-white overflow-x-hidden">
      {/* Header */}
      <header className="relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex items-center justify-between py-8">
            <a href="#" className="flex items-center text-2xl font-black transition-transform hover:scale-105">
              <span className="text-[#A3E635]">futball</span>
              <span className="text-white">.analytics</span>
            </a>

            <div className="hidden md:flex items-center gap-10">
              <a
                href="#"
                className="text-gray-400 hover:text-white font-semibold text-sm transition-colors relative group"
              >
                Funkciók
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#A3E635] rounded transition-all group-hover:w-full"></span>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white font-semibold text-sm transition-colors relative group"
              >
                Statisztikák
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#A3E635] rounded transition-all group-hover:w-full"></span>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white font-semibold text-sm transition-colors relative group"
              >
                API
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#A3E635] rounded transition-all group-hover:w-full"></span>
              </a>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="p-3 bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white rounded-xl transition-all hover:scale-110"
              >
                <Settings className="w-5 h-5" />
              </Button>
              <Button className="bg-[#A3E635] hover:bg-[#84CC16] text-black font-semibold px-6 py-3 rounded-xl shadow-[0_8px_25px_rgba(163,230,53,0.4)] hover:shadow-[0_12px_35px_rgba(163,230,53,0.5)] hover:-translate-y-0.5 transition-all">
                Kezdjük el
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-32 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-5xl md:text-8xl font-black leading-tight mb-10 bg-gradient-to-r from-[#A3E635] via-[#A3E635]/80 to-[#A3E635]/60 bg-clip-text text-transparent filter drop-shadow-[0_4px_12px_rgba(163,230,53,0.4)]">
            minden <span className="text-[#A3E635]">meccs elemezz</span>
          </h1>
          <p className="max-w-3xl mx-auto text-xl text-gray-400 leading-relaxed mb-16">
            A futball.analytics tökéletesen elemzi a meccseket, csapatokat és statisztikákat minden
            bajnokságban—professzionális előrejelzések és részletes analitika.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-28">
            <Button
              variant="ghost"
              className="flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30 rounded-xl transition-all"
            >
              <Play className="w-5 h-5" />
              Demó Megtekintése
            </Button>
            <Button className="flex items-center gap-3 bg-[#A3E635] hover:bg-[#84CC16] text-black font-semibold px-8 py-4 rounded-xl shadow-[0_8px_25px_rgba(163,230,53,0.4)] hover:shadow-[0_12px_35px_rgba(163,230,53,0.5)] hover:-translate-y-0.5 transition-all">
              <TrendingUp className="w-5 h-5" />
              Ingyenes Elemzés
            </Button>
          </div>

          {/* Analytics Board Mockup */}
          <div className="relative max-w-6xl mx-auto">
            <div className="absolute inset-[-6rem] bg-gradient-to-r from-[#A3E635]/30 via-[#A3E635]/20 to-transparent rounded-3xl filter blur-[180px] animate-pulse"></div>
            <div className="relative bg-[#111318] border border-white/10 rounded-3xl overflow-hidden shadow-[0_25px_50px_rgba(0,0,0,0.5)]">
              {/* Board Header */}
              <div className="flex items-center gap-4 p-6 border-b border-white/10 bg-[#0d0e12]">
                <Input
                  placeholder="Csapatok keresése…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-white/10 border-white/10 focus:border-[#A3E635] focus:ring-[#A3E635]/10 rounded-xl px-5 py-3 text-white placeholder:text-gray-500"
                />
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl"
                >
                  <Grid3X3 className="w-4 h-4" />
                  Nézet
                </Button>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl"
                >
                  <Filter className="w-4 h-4" />
                  Szűrő
                </Button>
              </div>

              <div className="flex">
                {/* Sidebar */}
                <aside className="w-20 bg-[#0a0b0f] border-r border-white/10 py-10 flex flex-col items-center gap-8">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#A3E635] to-[#84CC16] rounded-3xl flex items-center justify-center text-black font-black text-xs shadow-[0_8px_25px_rgba(163,230,53,0.4)] hover:scale-105 transition-transform">
                    82%
                  </div>
                  <nav className="flex flex-col gap-8">
                    {[Home, Bell, Calendar, CheckSquare, Clock, Plus].map((Icon, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="icon"
                        className="p-3 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all hover:scale-110"
                      >
                        <Icon className="w-6 h-6" />
                      </Button>
                    ))}
                  </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 bg-gradient-to-br from-[#111318] to-[#0f1015] p-8">
                  <div className="flex items-center gap-3 mb-8 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <TrendingUp className="w-4 h-4" />
                    ELEMZÉS FOLYAMATBAN
                    <span>– {matches.length}</span>
                  </div>

                  {/* Search Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">Hazai Csapat</label>
                      <Input
                        placeholder="pl. Barcelona"
                        value={homeTeam}
                        onChange={(e) => setHomeTeam(e.target.value)}
                        className="bg-white/5 border-white/10 focus:border-[#A3E635] focus:ring-[#A3E635]/10 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">Vendég Csapat</label>
                      <Input
                        placeholder="pl. Real Madrid"
                        value={awayTeam}
                        onChange={(e) => setAwayTeam(e.target.value)}
                        className="bg-white/5 border-white/10 focus:border-[#A3E635] focus:ring-[#A3E635]/10 rounded-xl"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleSearch}
                    disabled={loading || (!homeTeam && !awayTeam)}
                    className="w-full bg-[#A3E635] hover:bg-[#84CC16] text-black font-semibold py-4 rounded-xl shadow-[0_8px_25px_rgba(163,230,53,0.4)] hover:shadow-[0_12px_35px_rgba(163,230,53,0.5)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-8"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                        Elemzés...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Search className="w-5 h-5" />
                        Meccsek Keresése
                      </div>
                    )}
                  </Button>

                  {/* Recent Matches */}
                  <div className="space-y-4">
                    {recentMatches.map((match, index) => (
                      <Card
                        key={match.id}
                        className="bg-white/5 border-white/10 hover:border-white/20 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.3)] cursor-pointer"
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start gap-5">
                            <span className="text-xs text-gray-500 font-medium min-w-12 pt-1">#{match.id}</span>
                            <div className="flex-1">
                              <p className="text-sm text-gray-300 font-medium mb-2">
                                {match.home_team} vs {match.away_team}
                              </p>
                              <div className="flex items-center gap-3 text-xs">
                                <Badge className="bg-[#A3E635]/20 text-[#A3E635] border-[#A3E635]/30">
                                  {match.full_time_home_goals}-{match.full_time_away_goals}
                                </Badge>
                                <Badge variant="secondary" className="bg-white/10 text-gray-400">
                                  {new Date(match.match_time).toLocaleDateString("hu-HU")}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </main>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      {statistics && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div>
                <h2 className="text-4xl md:text-6xl font-black text-white mb-8">Meccs Analitika</h2>
                <p className="text-xl text-gray-400 leading-relaxed mb-12 max-w-2xl">
                  Részletes statisztikák és előrejelzések minden meccshez. Professzionális elemzések a legjobb
                  döntésekhez.
                </p>
                <ModernStatsGrid statistics={statistics} />
              </div>
              <div>
                <ModernAnalyticsCard statistics={statistics} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="mt-48 py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            <div>
              <div className="flex items-center text-2xl font-black mb-4">
                <span className="text-[#A3E635]">futball</span>
                <span className="text-white">.analytics</span>
              </div>
              <p className="text-sm text-gray-500 max-w-80">
                Professzionális futball elemzések és statisztikák minden bajnokságból. Pontos előrejelzések és részletes
                analitika.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Termék</h3>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="text-[#A3E635] hover:text-white text-sm transition-colors">
                    Funkciók
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[#A3E635] hover:text-white text-sm transition-colors">
                    Árazás
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[#A3E635] hover:text-white text-sm transition-colors">
                    API
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[#A3E635] hover:text-white text-sm transition-colors">
                    Dokumentáció
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Támogatás</h3>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="text-[#A3E635] hover:text-white text-sm transition-colors">
                    Súgó
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[#A3E635] hover:text-white text-sm transition-colors">
                    Kapcsolat
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[#A3E635] hover:text-white text-sm transition-colors">
                    Státusz
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[#A3E635] hover:text-white text-sm transition-colors">
                    Közösség
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-white/10">
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span className="font-black">futball.analytics</span>
              <span>© 2025 Minden jog fenntartva.</span>
            </div>
            <div className="flex items-center gap-8 text-sm">
              <a href="#" className="text-[#A3E635] hover:text-white transition-colors">
                Adatvédelem
              </a>
              <a href="#" className="text-[#A3E635] hover:text-white transition-colors">
                Feltételek
              </a>
              <a href="#" className="text-[#A3E635] hover:text-white transition-colors">
                Cookie-k
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

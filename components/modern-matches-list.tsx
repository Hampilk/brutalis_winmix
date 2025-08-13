"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import {
  Search,
  Calendar,
  Target,
  Loader2,
  Play,
  Zap,
  Settings,
  Home,
  Bell,
  CheckSquare,
  Clock,
  Plus,
  ChevronDown,
} from "lucide-react"
import { searchMatches, searchMatchesByTeam } from "@/lib/matches"
import { VIRTUAL_TEAMS } from "@/lib/teams"
import { calculateStatistics } from "@/lib/football-statistics"
import type { Match } from "@/lib/supabase"
import type { StatisticsResult } from "@/lib/football-statistics"
import ModernStatsGrid from "./modern-stats-grid"
import ModernAnalyticsCard from "./modern-analytics-card"

export default function ModernMatchesList() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [homeTeam, setHomeTeam] = useState("")
  const [awayTeam, setAwayTeam] = useState("")
  const [statistics, setStatistics] = useState<StatisticsResult | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCustomization, setShowCustomization] = useState(false)

  // Keresés végrehajtása
  const handleSearch = async () => {
    setLoading(true)
    setError(null)

    try {
      let searchResults: Match[] = []

      if (homeTeam.trim() || awayTeam.trim()) {
        searchResults = await searchMatches(homeTeam.trim() || undefined, awayTeam.trim() || undefined, 100)
      } else if (searchQuery.trim()) {
        searchResults = await searchMatchesByTeam(searchQuery.trim(), 100)
      } else {
        searchResults = []
      }

      setMatches(searchResults)

      if (searchResults.length > 0) {
        const stats = calculateStatistics(searchResults, homeTeam.trim() || undefined, awayTeam.trim() || undefined)
        setStatistics(stats)
      } else {
        setStatistics(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ismeretlen hiba történt")
      setMatches([])
      setStatistics(null)
    } finally {
      setLoading(false)
    }
  }

  const handleClearSearch = () => {
    setHomeTeam("")
    setAwayTeam("")
    setSearchQuery("")
    setMatches([])
    setStatistics(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-[#0c0d11] text-white overflow-x-hidden">
      {/* Header */}
      <header className="relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex items-center justify-between py-8">
            <a
              href="#"
              className="flex items-center text-white text-2xl font-black transition-transform hover:scale-105"
            >
              <span className="text-[#A3E635]">futball</span>
              <span>.analytics</span>
            </a>

            <div className="hidden md:flex items-center gap-10">
              <a
                href="#"
                className="text-gray-400 hover:text-white font-semibold text-sm transition-colors relative px-3 py-2 rounded-lg hover:after:w-full after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-[#A3E635] after:rounded after:transition-all"
              >
                Funkciók
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white font-semibold text-sm transition-colors relative px-3 py-2 rounded-lg hover:after:w-full after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-[#A3E635] after:rounded after:transition-all"
              >
                Statisztikák
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white font-semibold text-sm transition-colors relative px-3 py-2 rounded-lg hover:after:w-full after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-[#A3E635] after:rounded after:transition-all"
              >
                API
              </a>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowCustomization(true)}
                className="p-3 bg-white/10 text-gray-400 hover:text-white hover:bg-white/20 rounded-xl transition-all hover:scale-110"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-[#A3E635] text-black font-semibold text-sm rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(163,230,53,0.5)]">
                <Zap className="w-4 h-4" />
                Kezdjük el
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-32 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-5xl md:text-8xl font-black leading-none tracking-tight mb-10 bg-gradient-to-r from-[#A3E635] via-[#A3E635]/80 to-[#A3E635]/60 bg-clip-text text-transparent drop-shadow-[0_4px_12px_rgba(163,230,53,0.4)]">
            minden <span className="text-[#A3E635]">meccs elemezz</span>
          </h1>
          <p className="max-w-3xl mx-auto text-xl text-gray-400 leading-relaxed mb-16">
            A Futball Analytics tökéletesen szinkronban tartja a meccseredményeket, statisztikákat és predikciós
            modelleket minden ligában—valós idejű elemzés fáradtság nélkül.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-28">
            <button className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/30 rounded-xl transition-all">
              <Play className="w-5 h-5" />
              Demó Megtekintése
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-[#A3E635] text-black font-semibold rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(163,230,53,0.5)]">
              <Zap className="w-5 h-5" />
              Ingyenes Kezdés
            </button>
          </div>

          {/* Modern Search Board */}
          <div className="relative max-w-6xl mx-auto">
            <div className="absolute inset-[-6rem] bg-gradient-to-r from-[#A3E635]/30 via-[#A3E635]/20 to-transparent rounded-3xl blur-[180px] animate-pulse"></div>
            <div className="relative bg-[#111318] border border-white/10 rounded-3xl overflow-hidden shadow-[0_25px_50px_rgba(0,0,0,0.5)]">
              {/* Board Header */}
              <div className="flex items-center gap-4 p-8 border-b border-white/10 bg-[#0d0e12]">
                <Input
                  placeholder="Meccsek keresése…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-white/10 border-white/20 rounded-xl px-5 py-3 text-white placeholder:text-gray-500 focus:border-[#A3E635] focus:ring-[#A3E635]/20"
                />
                <button className="flex items-center gap-2 px-4 py-3 bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/30 rounded-xl text-white transition-all">
                  <Target className="w-4 h-4" />
                  Nézet
                </button>
                <button className="flex items-center gap-2 px-4 py-3 bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/30 rounded-xl text-white transition-all">
                  <Search className="w-4 h-4" />
                  Szűrő
                </button>
              </div>

              <div className="flex">
                {/* Sidebar */}
                <aside className="w-20 bg-[#0a0b0f] border-r border-white/10 py-10 flex flex-col items-center gap-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#A3E635] to-[#A3E635]/80 flex items-center justify-center text-black font-black text-xs shadow-[0_8px_25px_rgba(163,230,53,0.4)] transition-all hover:scale-105 hover:shadow-[0_12px_35px_rgba(163,230,53,0.5)]">
                    {statistics ? Math.round((statistics.totalMatches / 100) * 100) : 0}%
                  </div>
                  <nav className="flex flex-col gap-8">
                    <button className="p-3 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all hover:scale-110">
                      <Home className="w-6 h-6" />
                    </button>
                    <button className="p-3 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all hover:scale-110">
                      <Bell className="w-6 h-6" />
                    </button>
                    <button className="p-3 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all hover:scale-110">
                      <Calendar className="w-6 h-6" />
                    </button>
                    <button className="p-3 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all hover:scale-110">
                      <CheckSquare className="w-6 h-6" />
                    </button>
                    <button className="p-3 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all hover:scale-110">
                      <Clock className="w-6 h-6" />
                    </button>
                    <button className="p-3 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all hover:scale-110">
                      <Plus className="w-6 h-6" />
                    </button>
                  </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 bg-gradient-to-br from-[#111318] to-[#0f1015] p-8">
                  <div className="flex items-center gap-3 mb-8 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <ChevronDown className="w-4 h-4" />
                    KERESÉSI FELTÉTELEK
                    <span>– {homeTeam || awayTeam ? "2" : "0"}</span>
                  </div>

                  {/* Search Form */}
                  <div className="space-y-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-white">Hazai csapat</label>
                        <Select value={homeTeam} onValueChange={setHomeTeam}>
                          <SelectTrigger className="bg-white/5 border-white/20 rounded-2xl text-white hover:border-white/30 transition-all">
                            <SelectValue placeholder="Válassz hazai csapatot" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#111318] border-white/20">
                            {VIRTUAL_TEAMS.map((name) => (
                              <SelectItem key={name} value={name} className="text-white hover:bg-white/10">
                                {name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-white">Vendég csapat</label>
                        <Select value={awayTeam} onValueChange={setAwayTeam}>
                          <SelectTrigger className="bg-white/5 border-white/20 rounded-2xl text-white hover:border-white/30 transition-all">
                            <SelectValue placeholder="Válassz vendég csapatot" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#111318] border-white/20">
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
                        disabled={loading}
                        className="bg-[#A3E635] text-black hover:bg-[#84CC16] rounded-2xl font-semibold transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(163,230,53,0.4)]"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Keresés...
                          </>
                        ) : (
                          <>
                            <Search className="h-4 w-4 mr-2" />
                            Keresés
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleClearSearch}
                        className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:border-white/30 rounded-2xl transition-all"
                      >
                        Törlés
                      </Button>
                    </div>
                  </div>

                  {/* Match Results */}
                  {matches.length > 0 && (
                    <div className="space-y-4">
                      {matches.slice(0, 5).map((match, index) => (
                        <div
                          key={match.id}
                          className="bg-white/5 border border-white/10 rounded-2xl p-5 transition-all hover:border-white/20 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.3)] cursor-pointer"
                        >
                          <div className="flex items-center gap-5">
                            <span className="text-xs text-gray-500 font-medium min-w-12">M-{match.id}</span>
                            <p className="flex-1 text-sm text-gray-300 font-medium">
                              {match.home_team} vs {match.away_team}
                            </p>
                            <div className="flex items-center gap-3">
                              <Badge className="bg-white/10 text-gray-300 text-xs">
                                {match.full_time_home_goals}-{match.full_time_away_goals}
                              </Badge>
                              <Badge className="bg-[#A3E635]/20 text-[#A3E635] text-xs">
                                <Target className="w-3 h-3 mr-1" />
                                {match.full_time_home_goals + match.full_time_away_goals} gól
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </main>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      {statistics && (
        <section className="py-40">
          <div className="max-w-7xl mx-auto px-6">
            <ModernStatsGrid statistics={statistics} />
            <div className="mt-20">
              <ModernAnalyticsCard statistics={statistics} />
            </div>
          </div>
        </section>
      )}

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
            <p className="text-red-400 font-semibold">Hiba történt:</p>
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-48 py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            <div className="flex items-start gap-4">
              <div>
                <div className="flex items-center text-white text-2xl font-black mb-4">
                  <span className="text-[#A3E635]">futball</span>
                  <span>.analytics</span>
                </div>
                <p className="text-sm text-gray-500 max-w-80">
                  Valós idejű futball meccs elemzés és predikciós modellek fejlesztőcsapatok számára. Automatizáld az
                  analitikát velünk.
                </p>
              </div>
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
                    Statisztikák
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[#A3E635] hover:text-white text-sm transition-colors">
                    Integrációk
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[#A3E635] hover:text-white text-sm transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Támogatás</h3>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="text-[#A3E635] hover:text-white text-sm transition-colors">
                    Dokumentáció
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[#A3E635] hover:text-white text-sm transition-colors">
                    Útmutatók
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
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10">
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span className="font-black">futball.analytics</span>
              <span>© 2025 Football Analytics. Minden jog fenntartva.</span>
            </div>
            <div className="flex items-center gap-8 text-sm mt-8 md:mt-0">
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

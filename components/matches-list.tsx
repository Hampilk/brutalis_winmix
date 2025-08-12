"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Search, AlertCircle } from "lucide-react"
import { searchMatches, getFormattedMatches } from "@/lib/matches"
import { isSupabaseConfigured } from "@/lib/supabase"
import type { Match } from "@/lib/supabase"

export default function MatchesList() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [homeTeam, setHomeTeam] = useState("")
  const [awayTeam, setAwayTeam] = useState("")
  const [searching, setSearching] = useState(false)
  const [isOfflineMode, setIsOfflineMode] = useState(false)

  // Check if we're in offline mode
  useEffect(() => {
    setIsOfflineMode(!isSupabaseConfigured())
  }, [])

  // Load initial matches
  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    try {
      setLoading(true)
      setError(null)
      const formattedMatches = await getFormattedMatches(50)
      // Convert FormattedMatch back to Match for display
      const matchData = formattedMatches.map((fm) => ({
        id: fm.id,
        match_time: new Date().toISOString(), // Placeholder
        home_team: fm.home_team,
        away_team: fm.away_team,
        half_time_home_goals: Number.parseInt(fm.half_time_result.split("-")[0]),
        half_time_away_goals: Number.parseInt(fm.half_time_result.split("-")[1]),
        full_time_home_goals: Number.parseInt(fm.result.split("-")[0]),
        full_time_away_goals: Number.parseInt(fm.result.split("-")[1]),
        league: "Unknown",
        season: "2023/24",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))
      setMatches(matchData)
    } catch (err) {
      console.error("Error loading matches:", err)
      setError(err instanceof Error ? err.message : "Hiba történt a meccsek betöltése során")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    try {
      setSearching(true)
      setError(null)
      const results = await searchMatches(homeTeam.trim() || undefined, awayTeam.trim() || undefined, 50)
      setMatches(results)
    } catch (err) {
      console.error("Error searching matches:", err)
      setError(err instanceof Error ? err.message : "Hiba történt a keresés során")
    } finally {
      setSearching(false)
    }
  }

  const clearSearch = () => {
    setHomeTeam("")
    setAwayTeam("")
    loadMatches()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Meccsek betöltése...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Offline Mode Banner */}
      {isOfflineMode && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Offline Demo Mód:</strong> Az alkalmazás demo adatokkal fut, mivel a Supabase nincs konfigurálva. A
            keresés és statisztikák továbbra is működnek a mintaadatokon.
          </AlertDescription>
        </Alert>
      )}

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Meccs keresés
          </CardTitle>
          <CardDescription>Keress meccseket hazai és/vagy vendég csapat alapján</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Hazai csapat..."
                value={homeTeam}
                onChange={(e) => setHomeTeam(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="flex-1">
              <Input
                placeholder="Vendég csapat..."
                value={awayTeam}
                onChange={(e) => setAwayTeam(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSearch} disabled={searching}>
                {searching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Keresés...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Keresés
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={clearSearch}>
                Törlés
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Meccsek ({matches.length})</h2>
          {isOfflineMode && <Badge variant="secondary">Demo adatok</Badge>}
        </div>

        {matches.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nem találhatók meccsek a megadott kritériumokkal.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {matches.map((match) => (
              <Card key={match.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="font-semibold text-lg">{match.home_team}</span>
                        <Badge variant="outline" className="text-lg font-bold">
                          {match.full_time_home_goals}-{match.full_time_away_goals}
                        </Badge>
                        <span className="font-semibold text-lg">{match.away_team}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          Félidő: {match.half_time_home_goals}-{match.half_time_away_goals}
                        </span>
                        {match.league && <Badge variant="secondary">{match.league}</Badge>}
                        {match.season && <Badge variant="outline">{match.season}</Badge>}
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>Gólok: {match.full_time_home_goals + match.full_time_away_goals}</div>
                      <div>
                        {match.full_time_home_goals > 0 && match.full_time_away_goals > 0
                          ? "Mindkét csapat szerzett gólt"
                          : "Nem mindkét csapat szerzett gólt"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

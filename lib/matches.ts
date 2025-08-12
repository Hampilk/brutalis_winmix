import { supabase, isSupabaseConfigured } from "./supabase"
import type { Match, FormattedMatch } from "./supabase"
import { offlineSearchMatches, offlineSearchByTeam, offlineTeamNames, OFFLINE_MATCHES } from "./offline-data"

// Hibaüzenet a hiányzó konfiguráció esetén
const SUPABASE_ERROR = "Supabase nincs megfelelően konfigurálva. Ellenőrizd a környezeti változókat."
const TABLE_NOT_FOUND_ERROR =
  "A 'matches' tábla nem található. Kérlek, győződj meg róla, hogy létrehoztad a Supabase adatbázisodban."

// Prevent wildcard/LIKE injection by escaping % and _ characters
function sanitizeIlikePattern(input: string): string {
  // Normalize spaces and trim
  const normalized = input.replace(/\s+/g, " ").trim()
  // Escape LIKE wildcards (% and _)
  return normalized.replace(/[%]/g, "\\%").replace(/[_]/g, "\\_")
}

// Összes meccs lekérdezése (limitált, hogy ne legyen túl lassú)
export async function getAllMatches(limit = 100): Promise<Match[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return OFFLINE_MATCHES.slice().sort((a, b) => (a.match_time < b.match_time ? 1 : -1)).slice(0, limit)
  }

  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .order("match_time", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Hiba a meccsek lekérdezése során:", error)
    if (error.message.includes("relation") && error.message.includes("does not exist")) {
      throw new Error(TABLE_NOT_FOUND_ERROR)
    }
    throw error
  }

  return data || []
}

// Keresési függvény hazai és vendég csapat alapján
export async function searchMatches(homeTeam?: string, awayTeam?: string, limit = 50): Promise<Match[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return offlineSearchMatches(homeTeam?.trim() || undefined, awayTeam?.trim() || undefined, limit)
  }

  let query = supabase.from("matches").select("*")

  const home = homeTeam && homeTeam.trim() ? sanitizeIlikePattern(homeTeam) : undefined
  const away = awayTeam && awayTeam.trim() ? sanitizeIlikePattern(awayTeam) : undefined

  if (home) {
    query = query.ilike("home_team", `%${home}%`)
  }
  if (away) {
    query = query.ilike("away_team", `%${away}%`)
  }

  query = query.order("match_time", { ascending: false }).limit(limit)

  const { data, error } = await query

  if (error) {
    console.error("Hiba a meccsek keresése során:", error)
    if (error.message.includes("relation") && error.message.includes("does not exist")) {
      throw new Error(TABLE_NOT_FOUND_ERROR)
    }
    throw error
  }

  return data || []
}

// Csapat nevek lekérdezése autocomplete-hez
export async function getTeamNames(): Promise<string[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return offlineTeamNames()
  }

  const { data, error } = await supabase.from("matches").select("home_team, away_team").limit(1000)

  if (error) {
    console.error("Hiba a csapat nevek lekérdezése során:", error)
    return []
  }

  const teams = new Set<string>()
  data?.forEach((match) => {
    if (match.home_team) teams.add(match.home_team)
    if (match.away_team) teams.add(match.away_team)
  })

  return Array.from(teams).sort()
}

// Formázott meccsek lekérdezése
export async function getFormattedMatches(limit = 100): Promise<FormattedMatch[]> {
  const matches = await getAllMatches(limit)

  return matches.map((match) => ({
    id: match.id,
    match_date: new Date(match.match_time).toLocaleDateString("hu-HU"),
    home_team: match.home_team,
    away_team: match.away_team,
    result: `${match.full_time_home_goals}-${match.full_time_away_goals}`,
    half_time_result: `${match.half_time_home_goals}-${match.half_time_away_goals}`,
    total_goals: match.full_time_home_goals + match.full_time_away_goals,
    both_teams_scored: match.full_time_home_goals > 0 && match.full_time_away_goals > 0,
  }))
}

// Meccs keresése csapat név alapján
export async function searchMatchesByTeam(teamName: string, limit = 50): Promise<Match[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return offlineSearchByTeam(teamName, limit)
  }

  const safe = sanitizeIlikePattern(teamName)

  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .or(`home_team.ilike.%${safe}%,away_team.ilike.%${safe}%`)
    .order("match_time", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Hiba a meccsek keresése során:", error)
    if (error.message.includes("relation") && error.message.includes("does not exist")) {
      throw new Error(TABLE_NOT_FOUND_ERROR)
    }
    throw error
  }

  return data || []
}

// Csapat statisztikák lekérdezése
export async function getTeamStatistics(teamName: string): Promise<any> {
  if (!isSupabaseConfigured() || !supabase) {
    return offlineSearchByTeam(teamName, 100)
  }

  const safe = sanitizeIlikePattern(teamName)

  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .or(`home_team.ilike.%${safe}%,away_team.ilike.%${safe}%`)
    .order("match_time", { ascending: false })
    .limit(100)

  if (error) {
    console.error("Hiba a csapat statisztikák lekérdezése során:", error)
    throw error
  }

  return data || []
}

// Új meccs hozzáadása
export async function addMatch(match: Omit<Match, "id" | "created_at" | "updated_at">): Promise<Match> {
  if (!isSupabaseConfigured()) {
    throw new Error(SUPABASE_ERROR)
  }
  if (!supabase) {
    throw new Error("Supabase kliens nincs inicializálva.")
  }

  const { data, error } = await supabase.from("matches").insert([match]).select().single()

  if (error) {
    console.error("Hiba a meccs hozzáadása során:", error)
    if (error.message.includes("relation") && error.message.includes("does not exist")) {
      throw new Error(TABLE_NOT_FOUND_ERROR)
    }
    throw error
  }

  return data
}

// Meccs frissítése
export async function updateMatch(id: number, updates: Partial<Match>): Promise<Match> {
  if (!isSupabaseConfigured()) {
    throw new Error(SUPABASE_ERROR)
  }
  if (!supabase) {
    throw new Error("Supabase kliens nincs inicializálva.")
  }

  const { data, error } = await supabase
    .from("matches")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Hiba a meccs frissítése során:", error)
    if (error.message.includes("relation") && error.message.includes("does not exist")) {
      throw new Error(TABLE_NOT_FOUND_ERROR)
    }
    throw error
  }

  return data
}

// Meccs törlése
export async function deleteMatch(id: number): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error(SUPABASE_ERROR)
  }
  if (!supabase) {
    throw new Error("Supabase kliens nincs inicializálva.")
  }

  const { error } = await supabase.from("matches").delete().eq("id", id)

  if (error) {
    console.error("Hiba a meccs törlése során:", error)
    if (error.message.includes("relation") && error.message.includes("does not exist")) {
      throw new Error(TABLE_NOT_FOUND_ERROR)
    }
    throw error
  }
}

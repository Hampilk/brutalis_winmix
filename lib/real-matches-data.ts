import { supabase, isSupabaseConfigured } from "./supabase"
import type { Match } from "./supabase"

// Valós adatok lekérdezése a Supabase adatbázisból
export async function getRealMatchesData(homeTeam?: string, awayTeam?: string, limit = 100): Promise<Match[]> {
  try {
    if (!supabase || !isSupabaseConfigured()) {
      console.warn("Supabase nincs konfigurálva - valós adatok nem elérhetők")
      return []
    }

    let query = supabase.from("matches").select("*")

    // Szűrés csapatok alapján - using individual filters to avoid parsing issues
    if (homeTeam && awayTeam) {
      // Search for matches where either team can be home or away
      query = query.or(
        `and(home_team.ilike.%${homeTeam}%,away_team.ilike.%${awayTeam}%),and(home_team.ilike.%${awayTeam}%,away_team.ilike.%${homeTeam}%)`,
      )
    } else if (homeTeam) {
      query = query.or(`home_team.ilike.%${homeTeam}%,away_team.ilike.%${homeTeam}%`)
    } else if (awayTeam) {
      query = query.or(`home_team.ilike.%${awayTeam}%,away_team.ilike.%${awayTeam}%`)
    }

    const { data, error } = await query.order("created_at", { ascending: false }).limit(limit)

    if (error) {
      console.error("Hiba a valós meccs adatok lekérdezése során:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Hiba a valós meccs adatok lekérdezése során:", error)
    return []
  }
}

// Csapat statisztikák lekérdezése valós adatokból
export async function getTeamRealStatistics(teamName: string): Promise<{
  totalMatches: number
  wins: number
  draws: number
  losses: number
  goalsScored: number
  goalsConceded: number
  homeMatches: number
  awayMatches: number
  recentForm: Match[]
}> {
  try {
    if (!supabase || !isSupabaseConfigured()) {
      console.warn("Supabase nincs konfigurálva - csapat statisztikák nem elérhetők")
      return {
        totalMatches: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsScored: 0,
        goalsConceded: 0,
        homeMatches: 0,
        awayMatches: 0,
        recentForm: [],
      }
    }

    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .or(`home_team.ilike.%${teamName}%,away_team.ilike.%${teamName}%`)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error || !data) {
      console.error("Hiba a csapat statisztikák lekérdezése során:", error)
      return {
        totalMatches: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsScored: 0,
        goalsConceded: 0,
        homeMatches: 0,
        awayMatches: 0,
        recentForm: [],
      }
    }

    let wins = 0
    let draws = 0
    let losses = 0
    let goalsScored = 0
    let goalsConceded = 0
    let homeMatches = 0
    let awayMatches = 0

    data.forEach((match) => {
      const isHome = match.home_team.toLowerCase().includes(teamName.toLowerCase())

      if (isHome) {
        homeMatches++
        goalsScored += match.full_time_home_goals
        goalsConceded += match.full_time_away_goals

        if (match.full_time_home_goals > match.full_time_away_goals) wins++
        else if (match.full_time_home_goals === match.full_time_away_goals) draws++
        else losses++
      } else {
        awayMatches++
        goalsScored += match.full_time_away_goals
        goalsConceded += match.full_time_home_goals

        if (match.full_time_away_goals > match.full_time_home_goals) wins++
        else if (match.full_time_away_goals === match.full_time_home_goals) draws++
        else losses++
      }
    })

    return {
      totalMatches: data.length,
      wins,
      draws,
      losses,
      goalsScored,
      goalsConceded,
      homeMatches,
      awayMatches,
      recentForm: data.slice(0, 10),
    }
  } catch (error) {
    console.error("Hiba a csapat statisztikák lekérdezése során:", error)
    return {
      totalMatches: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsScored: 0,
      goalsConceded: 0,
      homeMatches: 0,
      awayMatches: 0,
      recentForm: [],
    }
  }
}

// Head-to-head meccsek lekérdezése
export async function getHeadToHeadMatches(team1: string, team2: string): Promise<Match[]> {
  try {
    if (!supabase || !isSupabaseConfigured()) {
      console.warn("Supabase nincs konfigurálva - head-to-head adatok nem elérhetők")
      return []
    }

    // Execute two separate queries and combine results to avoid parsing issues
    const [query1, query2] = await Promise.all([
      supabase
        .from("matches")
        .select("*")
        .ilike("home_team", `%${team1}%`)
        .ilike("away_team", `%${team2}%`)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("matches")
        .select("*")
        .ilike("home_team", `%${team2}%`)
        .ilike("away_team", `%${team1}%`)
        .order("created_at", { ascending: false })
        .limit(10),
    ])

    if (query1.error || query2.error) {
      console.error("Hiba a head-to-head meccsek lekérdezése során:", query1.error || query2.error)
      return []
    }

    // Combine and sort results
    const allMatches = [...(query1.data || []), ...(query2.data || [])]
    return allMatches.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 20)
  } catch (error) {
    console.error("Hiba a head-to-head meccsek lekérdezése során:", error)
    return []
  }
}

// Liga statisztikák lekérdezése
export async function getLeagueStatistics(league = "spain"): Promise<{
  totalMatches: number
  totalGoals: number
  averageGoalsPerMatch: number
  bothTeamsScoredPercentage: number
  homeWinPercentage: number
  drawPercentage: number
  awayWinPercentage: number
}> {
  try {
    if (!supabase || !isSupabaseConfigured()) {
      console.warn("Supabase nincs konfigurálva - liga statisztikák nem elérhetők")
      return {
        totalMatches: 0,
        totalGoals: 0,
        averageGoalsPerMatch: 0,
        bothTeamsScoredPercentage: 0,
        homeWinPercentage: 0,
        drawPercentage: 0,
        awayWinPercentage: 0,
      }
    }

    const { data, error } = await supabase.from("matches").select("*").eq("league", league).limit(1000)

    if (error || !data) {
      console.error("Hiba a liga statisztikák lekérdezése során:", error)
      return {
        totalMatches: 0,
        totalGoals: 0,
        averageGoalsPerMatch: 0,
        bothTeamsScoredPercentage: 0,
        homeWinPercentage: 0,
        drawPercentage: 0,
        awayWinPercentage: 0,
      }
    }

    let totalGoals = 0
    let bothTeamsScored = 0
    let homeWins = 0
    let draws = 0
    let awayWins = 0

    data.forEach((match) => {
      const homeGoals = match.full_time_home_goals
      const awayGoals = match.full_time_away_goals

      totalGoals += homeGoals + awayGoals

      if (homeGoals > 0 && awayGoals > 0) bothTeamsScored++

      if (homeGoals > awayGoals) homeWins++
      else if (homeGoals === awayGoals) draws++
      else awayWins++
    })

    const totalMatches = data.length

    return {
      totalMatches,
      totalGoals,
      averageGoalsPerMatch: totalMatches > 0 ? totalGoals / totalMatches : 0,
      bothTeamsScoredPercentage: totalMatches > 0 ? (bothTeamsScored / totalMatches) * 100 : 0,
      homeWinPercentage: totalMatches > 0 ? (homeWins / totalMatches) * 100 : 0,
      drawPercentage: totalMatches > 0 ? (draws / totalMatches) * 100 : 0,
      awayWinPercentage: totalMatches > 0 ? (awayWins / totalMatches) * 100 : 0,
    }
  } catch (error) {
    console.error("Hiba a liga statisztikák lekérdezése során:", error)
    return {
      totalMatches: 0,
      totalGoals: 0,
      averageGoalsPerMatch: 0,
      bothTeamsScoredPercentage: 0,
      homeWinPercentage: 0,
      drawPercentage: 0,
      awayWinPercentage: 0,
    }
  }
}

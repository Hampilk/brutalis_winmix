import type { Match } from "./supabase"

// A small offline dataset to keep the app usable when Supabase is not configured
export const OFFLINE_MATCHES: Match[] = [
  {
    id: 1,
    match_time: "2024-01-15T15:00:00Z",
    home_team: "Barcelona",
    away_team: "Real Madrid",
    half_time_home_goals: 1,
    half_time_away_goals: 0,
    full_time_home_goals: 2,
    full_time_away_goals: 1,
    league: "spain",
    season: "2023/24",
    created_at: "2024-01-15T17:00:00Z",
    updated_at: "2024-01-15T17:00:00Z",
  },
  {
    id: 2,
    match_time: "2024-01-14T18:30:00Z",
    home_team: "Valencia",
    away_team: "Sevilla",
    half_time_home_goals: 0,
    half_time_away_goals: 1,
    full_time_home_goals: 1,
    full_time_away_goals: 1,
    league: "spain",
    season: "2023/24",
    created_at: "2024-01-14T20:30:00Z",
    updated_at: "2024-01-14T20:30:00Z",
  },
  {
    id: 3,
    match_time: "2024-01-13T20:00:00Z",
    home_team: "Athletic Bilbao",
    away_team: "Villarreal",
    half_time_home_goals: 2,
    half_time_away_goals: 0,
    full_time_home_goals: 3,
    full_time_away_goals: 1,
    league: "spain",
    season: "2023/24",
    created_at: "2024-01-13T22:00:00Z",
    updated_at: "2024-01-13T22:00:00Z",
  },
  {
    id: 4,
    match_time: "2024-01-12T16:15:00Z",
    home_team: "Las Palmas",
    away_team: "Getafe",
    half_time_home_goals: 0,
    half_time_away_goals: 0,
    full_time_home_goals: 0,
    full_time_away_goals: 2,
    league: "spain",
    season: "2023/24",
    created_at: "2024-01-12T18:15:00Z",
    updated_at: "2024-01-12T18:15:00Z",
  },
  {
    id: 5,
    match_time: "2024-01-11T19:45:00Z",
    home_team: "Girona",
    away_team: "Alaves",
    half_time_home_goals: 1,
    half_time_away_goals: 1,
    full_time_home_goals: 2,
    full_time_away_goals: 2,
    league: "spain",
    season: "2023/24",
    created_at: "2024-01-11T21:45:00Z",
    updated_at: "2024-01-11T21:45:00Z",
  },
  {
    id: 6,
    match_time: "2024-02-02T20:00:00Z",
    home_team: "Manchester City",
    away_team: "Liverpool",
    half_time_home_goals: 1,
    half_time_away_goals: 1,
    full_time_home_goals: 2,
    full_time_away_goals: 2,
    league: "england",
    season: "2023/24",
    created_at: "2024-02-02T22:10:00Z",
    updated_at: "2024-02-02T22:10:00Z",
  },
  {
    id: 7,
    match_time: "2024-02-05T18:00:00Z",
    home_team: "Arsenal",
    away_team: "Chelsea",
    half_time_home_goals: 0,
    half_time_away_goals: 0,
    full_time_home_goals: 1,
    full_time_away_goals: 0,
    league: "england",
    season: "2023/24",
    created_at: "2024-02-05T20:05:00Z",
    updated_at: "2024-02-05T20:05:00Z",
  },
  {
    id: 8,
    match_time: "2024-02-07T19:30:00Z",
    home_team: "Bayern Munich",
    away_team: "Borussia Dortmund",
    half_time_home_goals: 2,
    half_time_away_goals: 1,
    full_time_home_goals: 3,
    full_time_away_goals: 2,
    league: "germany",
    season: "2023/24",
    created_at: "2024-02-07T21:35:00Z",
    updated_at: "2024-02-07T21:35:00Z",
  },
  {
    id: 9,
    match_time: "2024-02-09T20:45:00Z",
    home_team: "Juventus",
    away_team: "Inter",
    half_time_home_goals: 0,
    half_time_away_goals: 0,
    full_time_home_goals: 0,
    full_time_away_goals: 1,
    league: "italy",
    season: "2023/24",
    created_at: "2024-02-09T22:50:00Z",
    updated_at: "2024-02-09T22:50:00Z",
  },
  {
    id: 10,
    match_time: "2024-02-12T21:00:00Z",
    home_team: "PSG",
    away_team: "Marseille",
    half_time_home_goals: 1,
    half_time_away_goals: 0,
    full_time_home_goals: 2,
    full_time_away_goals: 0,
    league: "france",
    season: "2023/24",
    created_at: "2024-02-12T23:05:00Z",
    updated_at: "2024-02-12T23:05:00Z",
  },
]

export function offlineSearchMatches(homeTeam?: string, awayTeam?: string, limit = 50): Match[] {
  let results = [...OFFLINE_MATCHES]
  if (homeTeam) {
    const q = homeTeam.toLowerCase()
    results = results.filter((m) => m.home_team.toLowerCase().includes(q))
  }
  if (awayTeam) {
    const q = awayTeam.toLowerCase()
    results = results.filter((m) => m.away_team.toLowerCase().includes(q))
  }
  return results.sort((a, b) => (a.match_time < b.match_time ? 1 : -1)).slice(0, limit)
}

export function offlineSearchByTeam(teamName: string, limit = 50): Match[] {
  const q = teamName.toLowerCase()
  const results = OFFLINE_MATCHES.filter(
    (m) => m.home_team.toLowerCase().includes(q) || m.away_team.toLowerCase().includes(q),
  ).sort((a, b) => (a.match_time < b.match_time ? 1 : -1))
  return results.slice(0, limit)
}

export function offlineTeamNames(): string[] {
  const set = new Set<string>()
  OFFLINE_MATCHES.forEach((m) => {
    set.add(m.home_team)
    set.add(m.away_team)
  })
  return Array.from(set).sort()
}

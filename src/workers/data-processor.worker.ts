export interface BaselinePrediction {
  home_win_probability: number
  draw_probability: number
  away_win_probability: number
  btts_probability: number
  over25_probability: number
  confidence_score: number
  key_factors: string[]
  model_version: string
  prediction_source: "local"
}

interface Match {
  id: number
  home_team: string
  away_team: string
  full_time_home_goals: number
  full_time_away_goals: number
  half_time_home_goals: number
  half_time_away_goals: number
  match_time: string
}

interface WorkerMessage {
  type: string
  payload: any
}

// Poisson probability calculation
function poissonProbability(lambda: number, k: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k)
}

function factorial(n: number): number {
  if (n <= 1) return 1
  let result = 1
  for (let i = 2; i <= n; i++) {
    result *= i
  }
  return result
}

// Calculate form index based on recent matches
function calculateFormIndex(matches: Match[], teamName: string, isHome: boolean): number {
  const recentMatches = matches
    .filter((match) => (isHome ? match.home_team === teamName : match.away_team === teamName))
    .sort((a, b) => new Date(b.match_time).getTime() - new Date(a.match_time).getTime())
    .slice(0, 5)

  if (recentMatches.length === 0) return 0.5

  let points = 0
  let maxPoints = 0

  recentMatches.forEach((match) => {
    maxPoints += 3
    const homeGoals = match.full_time_home_goals
    const awayGoals = match.full_time_away_goals

    if (isHome) {
      if (match.home_team === teamName) {
        if (homeGoals > awayGoals) points += 3
        else if (homeGoals === awayGoals) points += 1
      }
    } else {
      if (match.away_team === teamName) {
        if (awayGoals > homeGoals) points += 3
        else if (awayGoals === homeGoals) points += 1
      }
    }
  })

  return maxPoints > 0 ? points / maxPoints : 0.5
}

// Calculate expected goals using Poisson distribution
function calculateExpectedGoals(matches: Match[], teamName: string, isHome: boolean): number {
  const relevantMatches = matches.filter((match) =>
    isHome ? match.home_team === teamName : match.away_team === teamName,
  )

  if (relevantMatches.length === 0) return 1.5

  const totalGoals = relevantMatches.reduce((sum, match) => {
    return sum + (isHome ? match.full_time_home_goals : match.full_time_away_goals)
  }, 0)

  const avgGoals = totalGoals / relevantMatches.length

  // Apply home/away adjustment
  return isHome ? avgGoals * 1.1 : avgGoals * 0.9
}

// Calculate BTTS probability
function calculateBTTSProbability(matches: Match[]): number {
  if (matches.length === 0) return 0.5

  const bttsMatches = matches.filter((match) => match.full_time_home_goals > 0 && match.full_time_away_goals > 0)

  return bttsMatches.length / matches.length
}

// Calculate Over 2.5 goals probability using Poisson
function calculateOver25Probability(homeExpected: number, awayExpected: number): number {
  let probability = 0

  // Calculate probability for 0, 1, 2 goals (under 2.5)
  for (let homeGoals = 0; homeGoals <= 5; homeGoals++) {
    for (let awayGoals = 0; awayGoals <= 5; awayGoals++) {
      if (homeGoals + awayGoals <= 2) {
        probability += poissonProbability(homeExpected, homeGoals) * poissonProbability(awayExpected, awayGoals)
      }
    }
  }

  return Math.max(0, Math.min(1, 1 - probability))
}

// Main prediction calculation
function calculateBaseline(payload: any): BaselinePrediction {
  const { homeTeam, awayTeam, matches, homeMatches, awayMatches } = payload

  // Calculate form indices
  const homeFormIndex = calculateFormIndex([...matches, ...homeMatches], homeTeam, true)
  const awayFormIndex = calculateFormIndex([...matches, ...awayMatches], awayTeam, false)

  // Calculate expected goals
  const homeExpectedGoals = calculateExpectedGoals([...matches, ...homeMatches], homeTeam, true)
  const awayExpectedGoals = calculateExpectedGoals([...matches, ...awayMatches], awayTeam, false)

  // Calculate match outcome probabilities using Poisson + form
  let homeWinProb = 0
  let drawProb = 0
  let awayWinProb = 0

  // Poisson-based probabilities
  for (let homeGoals = 0; homeGoals <= 5; homeGoals++) {
    for (let awayGoals = 0; awayGoals <= 5; awayGoals++) {
      const prob = poissonProbability(homeExpectedGoals, homeGoals) * poissonProbability(awayExpectedGoals, awayGoals)

      if (homeGoals > awayGoals) homeWinProb += prob
      else if (homeGoals === awayGoals) drawProb += prob
      else awayWinProb += prob
    }
  }

  // Adjust with form indices
  const formDifference = homeFormIndex - awayFormIndex
  const adjustment = formDifference * 0.2

  homeWinProb = Math.max(0.05, Math.min(0.9, homeWinProb + adjustment))
  awayWinProb = Math.max(0.05, Math.min(0.9, awayWinProb - adjustment))
  drawProb = Math.max(0.05, 1 - homeWinProb - awayWinProb)

  // Normalize probabilities
  const total = homeWinProb + drawProb + awayWinProb
  homeWinProb /= total
  drawProb /= total
  awayWinProb /= total

  // Calculate other markets
  const bttsProb = calculateBTTSProbability(matches)
  const over25Prob = calculateOver25Probability(homeExpectedGoals, awayExpectedGoals)

  // Calculate confidence based on data availability
  let confidence = 0.3 // Base confidence
  confidence += Math.min(0.3, matches.length * 0.03) // H2H data
  confidence += Math.min(0.2, homeMatches.length * 0.01) // Home team data
  confidence += Math.min(0.2, awayMatches.length * 0.01) // Away team data

  // Generate key factors
  const keyFactors: string[] = []

  if (homeFormIndex > 0.7) keyFactors.push(`${homeTeam} excellent form`)
  else if (homeFormIndex < 0.3) keyFactors.push(`${homeTeam} poor form`)

  if (awayFormIndex > 0.7) keyFactors.push(`${awayTeam} excellent form`)
  else if (awayFormIndex < 0.3) keyFactors.push(`${awayTeam} poor form`)

  if (homeExpectedGoals > 2.5) keyFactors.push("High-scoring home team")
  if (awayExpectedGoals > 2.5) keyFactors.push("High-scoring away team")

  if (bttsProb > 0.7) keyFactors.push("Both teams likely to score")
  if (over25Prob > 0.7) keyFactors.push("High-scoring match expected")

  if (matches.length > 10) keyFactors.push("Strong H2H history")

  return {
    home_win_probability: homeWinProb,
    draw_probability: drawProb,
    away_win_probability: awayWinProb,
    btts_probability: bttsProb,
    over25_probability: over25Prob,
    confidence_score: confidence,
    key_factors: keyFactors,
    model_version: "baseline-v1.0",
    prediction_source: "local",
  }
}

// Worker message handler
self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type, payload } = e.data

  try {
    switch (type) {
      case "CALCULATE_PREDICTIONS":
        const prediction = calculateBaseline(payload)
        self.postMessage({
          type: "PREDICTION_RESULT",
          payload: prediction,
        })
        break

      default:
        self.postMessage({
          type: "ERROR",
          payload: { message: `Unknown message type: ${type}` },
        })
    }
  } catch (error) {
    self.postMessage({
      type: "ERROR",
      payload: { message: error instanceof Error ? error.message : "Unknown error" },
    })
  }
}

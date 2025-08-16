import type { Match } from "@/types/match"

export interface WorkerMessage {
  type: "CALCULATE_STATISTICS" | "CALCULATE_PREDICTIONS" | "PROCESS_MATCHES"
  payload: any
}

export interface PredictionCalculationPayload {
  homeTeam: string
  awayTeam: string
  matches: Match[]
  homeMatches: Match[]
  awayMatches: Match[]
}

export interface BaselinePrediction {
  home_win_probability: number
  draw_probability: number
  away_win_probability: number
  btts_probability: number
  over25_probability: number
  confidence_score: number
  key_factors: string[]
  prediction_source: "local"
  model_version: "baseline-v1.0"
}

class PredictionCalculator {
  private calculatePoissonProbability(lambda: number, k: number): number {
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / this.factorial(k)
  }

  private factorial(n: number): number {
    if (n <= 1) return 1
    return n * this.factorial(n - 1)
  }

  private calculateFormIndex(matches: Match[], isHome: boolean): number {
    const recentMatches = matches.slice(0, 5)
    let points = 0
    let totalMatches = 0

    for (const match of recentMatches) {
      const isHomeTeam = isHome
      const homeGoals = match.full_time_home_goals
      const awayGoals = match.full_time_away_goals

      if (isHomeTeam) {
        if (homeGoals > awayGoals) points += 3
        else if (homeGoals === awayGoals) points += 1
      } else {
        if (awayGoals > homeGoals) points += 3
        else if (homeGoals === awayGoals) points += 1
      }
      totalMatches++
    }

    return totalMatches > 0 ? points / (totalMatches * 3) : 0.5
  }

  private calculateExpectedGoals(matches: Match[], isHome: boolean): number {
    if (matches.length === 0) return 1.5

    let totalGoals = 0
    let totalMatches = 0

    for (const match of matches.slice(0, 10)) {
      if (isHome) {
        totalGoals += match.full_time_home_goals
      } else {
        totalGoals += match.full_time_away_goals
      }
      totalMatches++
    }

    const avgGoals = totalMatches > 0 ? totalGoals / totalMatches : 1.5

    // Apply home advantage
    return isHome ? avgGoals * 1.1 : avgGoals * 0.9
  }

  private calculateBTTSProbability(homeXG: number, awayXG: number): number {
    const homeNoGoal = this.calculatePoissonProbability(homeXG, 0)
    const awayNoGoal = this.calculatePoissonProbability(awayXG, 0)
    return 1 - (homeNoGoal + awayNoGoal - homeNoGoal * awayNoGoal)
  }

  private calculateOver25Probability(homeXG: number, awayXG: number): number {
    let prob = 0
    const maxGoals = 8

    for (let homeGoals = 0; homeGoals <= maxGoals; homeGoals++) {
      for (let awayGoals = 0; awayGoals <= maxGoals; awayGoals++) {
        if (homeGoals + awayGoals > 2.5) {
          const homeProb = this.calculatePoissonProbability(homeXG, homeGoals)
          const awayProb = this.calculatePoissonProbability(awayXG, awayGoals)
          prob += homeProb * awayProb
        }
      }
    }

    return Math.min(prob, 0.95)
  }

  calculateBaseline(payload: PredictionCalculationPayload): BaselinePrediction {
    const { homeTeam, awayTeam, matches, homeMatches, awayMatches } = payload

    // Calculate form indices
    const homeForm = this.calculateFormIndex(homeMatches, true)
    const awayForm = this.calculateFormIndex(awayMatches, false)

    // Calculate expected goals
    const homeXG = this.calculateExpectedGoals(homeMatches, true)
    const awayXG = this.calculateExpectedGoals(awayMatches, false)

    // Calculate match outcome probabilities using Poisson
    let homeWinProb = 0
    let drawProb = 0
    let awayWinProb = 0

    const maxGoals = 6
    for (let homeGoals = 0; homeGoals <= maxGoals; homeGoals++) {
      for (let awayGoals = 0; awayGoals <= maxGoals; awayGoals++) {
        const homeProb = this.calculatePoissonProbability(homeXG, homeGoals)
        const awayProb = this.calculatePoissonProbability(awayXG, awayGoals)
        const jointProb = homeProb * awayProb

        if (homeGoals > awayGoals) {
          homeWinProb += jointProb
        } else if (homeGoals === awayGoals) {
          drawProb += jointProb
        } else {
          awayWinProb += jointProb
        }
      }
    }

    // Apply form adjustment
    const formDiff = homeForm - awayForm
    const formAdjustment = formDiff * 0.1

    homeWinProb = Math.max(0.05, Math.min(0.9, homeWinProb + formAdjustment))
    awayWinProb = Math.max(0.05, Math.min(0.9, awayWinProb - formAdjustment))
    drawProb = Math.max(0.05, 1 - homeWinProb - awayWinProb)

    // Normalize probabilities
    const total = homeWinProb + drawProb + awayWinProb
    homeWinProb /= total
    drawProb /= total
    awayWinProb /= total

    // Calculate other probabilities
    const bttsProb = this.calculateBTTSProbability(homeXG, awayXG)
    const over25Prob = this.calculateOver25Probability(homeXG, awayXG)

    // Calculate confidence based on data quality
    let confidence = 0.3 // Base confidence
    confidence += Math.min(0.3, matches.length / 50) // H2H data
    confidence += Math.min(0.2, homeMatches.length / 100) // Home team data
    confidence += Math.min(0.2, awayMatches.length / 100) // Away team data

    // Key factors
    const keyFactors: string[] = []
    if (homeForm > 0.7) keyFactors.push(`${homeTeam} in excellent form`)
    if (awayForm > 0.7) keyFactors.push(`${awayTeam} in excellent form`)
    if (homeXG > 2.5) keyFactors.push("High-scoring home team")
    if (awayXG > 2.5) keyFactors.push("High-scoring away team")
    if (bttsProb > 0.7) keyFactors.push("Both teams likely to score")
    if (over25Prob > 0.7) keyFactors.push("High-scoring match expected")

    return {
      home_win_probability: homeWinProb,
      draw_probability: drawProb,
      away_win_probability: awayWinProb,
      btts_probability: bttsProb,
      over25_probability: over25Prob,
      confidence_score: confidence,
      key_factors: keyFactors,
      prediction_source: "local",
      model_version: "baseline-v1.0",
    }
  }
}

const calculator = new PredictionCalculator()

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type, payload } = e.data

  try {
    switch (type) {
      case "CALCULATE_PREDICTIONS":
        const prediction = calculator.calculateBaseline(payload)
        self.postMessage({
          type: "PREDICTION_RESULT",
          payload: prediction,
        })
        break

      case "CALCULATE_STATISTICS":
        // Existing statistics calculation logic
        // ... (keep existing implementation)
        break

      case "PROCESS_MATCHES":
        // Existing match processing logic
        // ... (keep existing implementation)
        break

      default:
        throw new Error(`Unknown message type: ${type}`)
    }
  } catch (error) {
    self.postMessage({
      type: "ERROR",
      payload: {
        message: error instanceof Error ? error.message : "Unknown error",
        type,
      },
    })
  }
}

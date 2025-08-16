import { supabase } from "@/lib/supabase"

export interface PredictionParams {
  homeTeam: string
  awayTeam: string
  league?: string
  matchDate?: string
}

export interface PredictionResult {
  id: string
  home_team: string
  away_team: string
  league: string
  home_win_probability: number
  draw_probability: number
  away_win_probability: number
  btts_probability: number
  over25_probability: number
  confidence_score: number
  key_factors: string[]
  prediction_source: "edge" | "local"
  generated_at: string
  expires_at: string
  model_version: string
}

export interface AccuracyStats {
  total_predictions: number
  correct_predictions: number
  accuracy_percentage: number
  average_confidence: number
  brier_score: number
  calibration_data: Array<{
    predicted_probability: number
    actual_frequency: number
    count: number
  }>
}

class PredictionService {
  private cache = new Map<string, PredictionResult>()
  private readonly CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

  private getCacheKey(params: PredictionParams): string {
    return `${params.homeTeam}-${params.awayTeam}-${params.league || "default"}-${params.matchDate || "today"}`
  }

  private isCacheValid(prediction: PredictionResult): boolean {
    const expiresAt = new Date(prediction.expires_at)
    return expiresAt > new Date()
  }

  async fetchPredictions(params: PredictionParams): Promise<PredictionResult | null> {
    const cacheKey = this.getCacheKey(params)
    const cached = this.cache.get(cacheKey)

    // Return cached result if valid
    if (cached && this.isCacheValid(cached)) {
      return cached
    }

    try {
      const { data, error } = await supabase
        .from("predictions")
        .select("*")
        .eq("home_team", params.homeTeam)
        .eq("away_team", params.awayTeam)
        .eq("league", params.league || "Premier League")
        .gte("expires_at", new Date().toISOString())
        .order("generated_at", { ascending: false })
        .limit(1)
        .single()

      if (error) {
        console.warn("Failed to fetch prediction from database:", error)
        return null
      }

      const prediction: PredictionResult = {
        id: data.id,
        home_team: data.home_team,
        away_team: data.away_team,
        league: data.league,
        home_win_probability: data.features?.home_win_probability || 0.33,
        draw_probability: data.features?.draw_probability || 0.33,
        away_win_probability: data.features?.away_win_probability || 0.33,
        btts_probability: data.features?.btts_probability || 0.5,
        over25_probability: data.features?.over25_probability || 0.5,
        confidence_score: data.features?.confidence_score || 0.5,
        key_factors: data.features?.key_factors || [],
        prediction_source: "edge",
        generated_at: data.generated_at,
        expires_at: data.expires_at,
        model_version: data.model_version,
      }

      // Cache the result
      this.cache.set(cacheKey, prediction)
      return prediction
    } catch (error) {
      console.error("Error fetching predictions:", error)
      return null
    }
  }

  async triggerUpdate(params: PredictionParams): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc("calculate_all_features_batch", {
        p_home_team: params.homeTeam,
        p_away_team: params.awayTeam,
        p_league: params.league || "Premier League",
      })

      if (error) {
        console.error("Failed to trigger prediction update:", error)
        return false
      }

      // Clear cache to force fresh fetch
      const cacheKey = this.getCacheKey(params)
      this.cache.delete(cacheKey)

      return true
    } catch (error) {
      console.error("Error triggering prediction update:", error)
      return false
    }
  }

  async getAccuracyStats(dateFrom: string, dateTo: string): Promise<AccuracyStats | null> {
    try {
      const { data, error } = await supabase.rpc("get_prediction_accuracy_stats", {
        date_from: dateFrom,
        date_to: dateTo,
      })

      if (error) {
        console.error("Failed to fetch accuracy stats:", error)
        return null
      }

      return data as AccuracyStats
    } catch (error) {
      console.error("Error fetching accuracy stats:", error)
      return null
    }
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const predictionService = new PredictionService()

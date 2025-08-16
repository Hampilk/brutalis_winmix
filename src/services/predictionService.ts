import { supabase } from "@/lib/supabase"
import { cacheUtils } from "@/lib/cache-utils"

export interface PredictionParams {
  homeTeam: string
  awayTeam: string
  league?: string
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
  model_version: string
  generated_at: string
  expires_at: string
  prediction_source: "edge" | "local"
}

export interface AccuracyStats {
  total_predictions: number
  correct_predictions: number
  accuracy_percentage: number
  brier_score: number
  calibration_score: number
}

class PredictionService {
  private cacheKey(params: PredictionParams): string {
    return `prediction_${params.homeTeam}_${params.awayTeam}_${params.league || "default"}`
  }

  async fetchPredictions(params: PredictionParams): Promise<PredictionResult | null> {
    try {
      // Check cache first
      const cacheKey = this.cacheKey(params)
      const cached = cacheUtils.get<PredictionResult>(cacheKey)

      if (cached && new Date(cached.expires_at) > new Date()) {
        return { ...cached, prediction_source: "edge" }
      }

      // Fetch from Supabase
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

      if (error || !data) {
        console.log("No prediction found in database:", error?.message)
        return null
      }

      const prediction: PredictionResult = {
        id: data.id,
        home_team: data.home_team,
        away_team: data.away_team,
        league: data.league,
        home_win_probability: data.prediction?.home_win_probability || 0.33,
        draw_probability: data.prediction?.draw_probability || 0.33,
        away_win_probability: data.prediction?.away_win_probability || 0.33,
        btts_probability: data.prediction?.btts_probability || 0.5,
        over25_probability: data.prediction?.over25_probability || 0.5,
        confidence_score: data.prediction?.confidence_score || 0.5,
        key_factors: data.prediction?.key_factors || [],
        model_version: data.model_version,
        generated_at: data.generated_at,
        expires_at: data.expires_at,
        prediction_source: "edge",
      }

      // Cache the result
      cacheUtils.set(cacheKey, prediction, 3600) // 1 hour cache

      return prediction
    } catch (error) {
      console.error("Error fetching predictions:", error)
      return null
    }
  }

  async triggerUpdate(params: PredictionParams): Promise<boolean> {
    try {
      const { error } = await supabase.rpc("update_enhanced_predictions", {
        p_home_team: params.homeTeam,
        p_away_team: params.awayTeam,
        p_league: params.league || "Premier League",
      })

      if (error) {
        console.error("Error triggering prediction update:", error)
        return false
      }

      // Clear cache to force refresh
      const cacheKey = this.cacheKey(params)
      cacheUtils.delete(cacheKey)

      return true
    } catch (error) {
      console.error("Error triggering prediction update:", error)
      return false
    }
  }

  async getAccuracyStats(dateFrom?: string, dateTo?: string): Promise<AccuracyStats | null> {
    try {
      const { data, error } = await supabase.rpc("get_prediction_accuracy_stats", {
        date_from: dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        date_to: dateTo || new Date().toISOString(),
      })

      if (error || !data) {
        console.error("Error fetching accuracy stats:", error)
        return null
      }

      return {
        total_predictions: data.total_predictions || 0,
        correct_predictions: data.correct_predictions || 0,
        accuracy_percentage: data.accuracy_percentage || 0,
        brier_score: data.brier_score || 1,
        calibration_score: data.calibration_score || 0,
      }
    } catch (error) {
      console.error("Error fetching accuracy stats:", error)
      return null
    }
  }
}

export const predictionService = new PredictionService()

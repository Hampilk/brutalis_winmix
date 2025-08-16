"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Loader2, RefreshCw, TrendingUp, Target, Zap } from "lucide-react"
import { predictionService, type PredictionResult, type PredictionParams } from "@/services/predictionService"
import type { BaselinePrediction } from "@/workers/data-processor.worker"
import type { Match } from "@/types/match"

interface PredictionsPanelProps {
  homeTeam: string
  awayTeam: string
  league?: string
  matches?: Match[]
  homeMatches?: Match[]
  awayMatches?: Match[]
  className?: string
}

export function PredictionsPanel({
  homeTeam,
  awayTeam,
  league = "Premier League",
  matches = [],
  homeMatches = [],
  awayMatches = [],
  className,
}: PredictionsPanelProps) {
  const [prediction, setPrediction] = useState<PredictionResult | BaselinePrediction | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [worker, setWorker] = useState<Worker | null>(null)

  // Initialize Web Worker
  useEffect(() => {
    const newWorker = new Worker(new URL("@/workers/data-processor.worker.ts", import.meta.url))
    setWorker(newWorker)

    newWorker.onmessage = (e) => {
      const { type, payload } = e.data

      if (type === "PREDICTION_RESULT") {
        setPrediction(payload)
        setLoading(false)
      } else if (type === "ERROR") {
        setError(payload.message)
        setLoading(false)
      }
    }

    return () => {
      newWorker.terminate()
    }
  }, [])

  const fetchPrediction = useCallback(async () => {
    if (!homeTeam || !awayTeam) return

    setLoading(true)
    setError(null)

    const params: PredictionParams = {
      homeTeam,
      awayTeam,
      league,
    }

    try {
      // Try to get prediction from backend first
      const backendPrediction = await predictionService.fetchPredictions(params)

      if (backendPrediction) {
        setPrediction(backendPrediction)
        setLoading(false)
      } else {
        // Fallback to Web Worker baseline calculation
        if (worker) {
          worker.postMessage({
            type: "CALCULATE_PREDICTIONS",
            payload: {
              homeTeam,
              awayTeam,
              matches,
              homeMatches,
              awayMatches,
            },
          })
        } else {
          setError("Prediction service unavailable")
          setLoading(false)
        }
      }
    } catch (err) {
      setError("Failed to fetch prediction")
      setLoading(false)
    }
  }, [homeTeam, awayTeam, league, matches, homeMatches, awayMatches, worker])

  const handleRefresh = async () => {
    const params: PredictionParams = { homeTeam, awayTeam, league }
    const success = await predictionService.triggerUpdate(params)

    if (success) {
      setTimeout(() => fetchPrediction(), 2000) // Wait for backend processing
    } else {
      setError("Failed to trigger prediction update")
    }
  }

  useEffect(() => {
    fetchPrediction()
  }, [fetchPrediction])

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`
  }

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return "bg-green-500"
    if (confidence >= 0.6) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getConfidenceText = (confidence: number): string => {
    if (confidence >= 0.8) return "High"
    if (confidence >= 0.6) return "Medium"
    return "Low"
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Calculating predictions...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p>{error}</p>
            <Button onClick={fetchPrediction} className="mt-2 bg-transparent" variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!prediction) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p>No prediction available</p>
            <Button onClick={fetchPrediction} className="mt-2 bg-transparent" variant="outline">
              Generate Prediction
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Match Prediction
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant={prediction.prediction_source === "edge" ? "default" : "secondary"}
              className="flex items-center gap-1"
            >
              {prediction.prediction_source === "edge" ? (
                <Zap className="h-3 w-3" />
              ) : (
                <TrendingUp className="h-3 w-3" />
              )}
              {prediction.prediction_source === "edge" ? "Edge Model" : "Local Model"}
            </Badge>
            <Button onClick={handleRefresh} size="sm" variant="ghost" disabled={loading}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Match Outcome Probabilities */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Match Outcome</h4>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">{homeTeam} Win</span>
              <span className="text-sm font-medium">{formatPercentage(prediction.home_win_probability)}</span>
            </div>
            <Progress value={prediction.home_win_probability * 100} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Draw</span>
              <span className="text-sm font-medium">{formatPercentage(prediction.draw_probability)}</span>
            </div>
            <Progress value={prediction.draw_probability * 100} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">{awayTeam} Win</span>
              <span className="text-sm font-medium">{formatPercentage(prediction.away_win_probability)}</span>
            </div>
            <Progress value={prediction.away_win_probability * 100} className="h-2" />
          </div>
        </div>

        {/* Additional Markets */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Both Teams to Score</h4>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatPercentage(prediction.btts_probability)}</div>
              <Progress value={prediction.btts_probability * 100} className="h-2 mt-2" />
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Over 2.5 Goals</h4>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatPercentage(prediction.over25_probability)}</div>
              <Progress value={prediction.over25_probability * 100} className="h-2 mt-2" />
            </div>
          </div>
        </div>

        {/* Confidence Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Confidence</h4>
            <Badge className={getConfidenceColor(prediction.confidence_score)}>
              {getConfidenceText(prediction.confidence_score)}
            </Badge>
          </div>
          <Progress value={prediction.confidence_score * 100} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {formatPercentage(prediction.confidence_score)} confidence based on available data
          </p>
        </div>

        {/* Key Factors */}
        {prediction.key_factors && prediction.key_factors.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Key Factors</h4>
            <div className="flex flex-wrap gap-1">
              {prediction.key_factors.map((factor, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {factor}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Model Info */}
        <div className="text-xs text-muted-foreground border-t pt-2">
          <div className="flex justify-between">
            <span>Model: {prediction.model_version}</span>
            {"generated_at" in prediction && (
              <span>Generated: {new Date(prediction.generated_at).toLocaleTimeString()}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

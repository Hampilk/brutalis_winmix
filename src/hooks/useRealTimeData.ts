"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import type { RealtimeChannel } from "@supabase/supabase-js"

export interface RealTimeConfig {
  table: string
  event?: "INSERT" | "UPDATE" | "DELETE" | "*"
  filter?: string
  onUpdate?: (payload: any) => void
  onInsert?: (payload: any) => void
  onDelete?: (payload: any) => void
}

export function useRealTimeData(config: RealTimeConfig) {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  const { table, event = "*", filter, onUpdate, onInsert, onDelete } = config

  const handlePayload = useCallback(
    (payload: any) => {
      const { eventType, new: newRecord, old: oldRecord } = payload

      switch (eventType) {
        case "INSERT":
          onInsert?.(newRecord)
          break
        case "UPDATE":
          onUpdate?.(newRecord)
          break
        case "DELETE":
          onDelete?.(oldRecord)
          break
      }
    },
    [onInsert, onUpdate, onDelete],
  )

  useEffect(() => {
    if (!supabase) {
      setError("Supabase client not initialized")
      return
    }

    const channelName = `realtime-${table}-${Date.now()}`
    const newChannel = supabase.channel(channelName)

    let subscription = newChannel.on(
      "postgres_changes",
      {
        event: event,
        schema: "public",
        table: table,
        filter: filter,
      },
      handlePayload,
    )

    subscription = subscription.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        setIsConnected(true)
        setError(null)
      } else if (status === "CHANNEL_ERROR") {
        setIsConnected(false)
        setError("Failed to connect to real-time updates")
      } else if (status === "TIMED_OUT") {
        setIsConnected(false)
        setError("Real-time connection timed out")
      }
    })

    setChannel(newChannel)

    return () => {
      newChannel.unsubscribe()
      setChannel(null)
      setIsConnected(false)
    }
  }, [table, event, filter, handlePayload])

  const reconnect = useCallback(() => {
    if (channel) {
      channel.unsubscribe()
    }
    // Trigger re-initialization by updating a dependency
    setError(null)
  }, [channel])

  return {
    isConnected,
    error,
    reconnect,
  }
}

// Specialized hook for predictions real-time updates
export function usePredictionsRealTime(
  homeTeam?: string,
  awayTeam?: string,
  onPredictionUpdate?: (prediction: any) => void,
) {
  const filter = homeTeam && awayTeam ? `home_team=eq.${homeTeam},away_team=eq.${awayTeam}` : undefined

  return useRealTimeData({
    table: "predictions",
    event: "*",
    filter,
    onInsert: onPredictionUpdate,
    onUpdate: onPredictionUpdate,
  })
}

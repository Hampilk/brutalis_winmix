"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { RealtimeChannel } from "@supabase/supabase-js"

interface UseRealTimeDataOptions {
  table: string
  filter?: string
  onInsert?: (payload: any) => void
  onUpdate?: (payload: any) => void
  onDelete?: (payload: any) => void
}

export function useRealTimeData(options: UseRealTimeDataOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!supabase) return

    const channelName = `realtime-${options.table}-${Date.now()}`
    const newChannel = supabase.channel(channelName)

    const channelBuilder = newChannel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: options.table,
        filter: options.filter,
      },
      (payload) => {
        switch (payload.eventType) {
          case "INSERT":
            options.onInsert?.(payload.new)
            break
          case "UPDATE":
            options.onUpdate?.(payload.new)
            break
          case "DELETE":
            options.onDelete?.(payload.old)
            break
        }
      },
    )

    channelBuilder.subscribe((status) => {
      setIsConnected(status === "SUBSCRIBED")
    })

    setChannel(newChannel)

    return () => {
      newChannel.unsubscribe()
      setChannel(null)
      setIsConnected(false)
    }
  }, [options.table, options.filter])

  return { isConnected, channel }
}

// Specialized hook for predictions
export function usePredictionsRealTime(homeTeam: string, awayTeam: string, onUpdate?: (prediction: any) => void) {
  const filter = homeTeam && awayTeam ? `home_team=eq.${homeTeam}&away_team=eq.${awayTeam}` : undefined

  return useRealTimeData({
    table: "predictions",
    filter,
    onInsert: onUpdate,
    onUpdate: onUpdate,
  })
}

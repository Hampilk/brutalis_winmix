"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"
import { useEffect, useRef } from "react"
import type { StatisticsResult } from "@/lib/football-statistics"

interface ModernAnalyticsCardProps {
  statistics: StatisticsResult
}

export default function ModernAnalyticsCard({ statistics }: ModernAnalyticsCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    ctx.scale(2, 2)

    // Clear canvas
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

    // Sample data for visualization
    const data = [
      statistics.general_stats.average_goals.average_home_goals,
      statistics.general_stats.average_goals.average_away_goals,
      statistics.general_stats.average_goals.average_total_goals,
      statistics.general_stats.both_teams_scored_percentage / 10, // Scale down for visualization
    ]

    const maxValue = Math.max(...data)
    const padding = 40
    const chartWidth = canvas.offsetWidth - padding * 2
    const chartHeight = canvas.offsetHeight - padding * 2

    // Draw grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(padding + chartWidth, y)
      ctx.stroke()
    }

    // Draw line chart
    ctx.strokeStyle = "#A3E635"
    ctx.lineWidth = 3
    ctx.beginPath()

    data.forEach((value, index) => {
      const x = padding + (chartWidth / (data.length - 1)) * index
      const y = padding + chartHeight - (value / maxValue) * chartHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }

      // Draw points
      ctx.fillStyle = "#A3E635"
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()
    })

    ctx.stroke()

    // Add glow effect
    ctx.shadowColor = "#A3E635"
    ctx.shadowBlur = 10
    ctx.stroke()
  }, [statistics])

  return (
    <div className="relative">
      <div className="absolute inset-[-6rem] bg-gradient-to-r from-[#A3E635]/20 via-[#A3E635]/10 to-transparent rounded-3xl filter blur-12 animate-pulse"></div>
      <Card className="relative bg-[#111318] border-white/10 rounded-3xl overflow-hidden">
        <CardContent className="p-10">
          <div className="flex items-center gap-3 mb-8 text-sm font-semibold text-gray-400">
            <TrendingUp className="w-4 h-4 text-[#A3E635]" />
            <span>Statisztikai Elemzés – Utolsó Meccsek</span>
          </div>

          <div className="h-96 relative">
            <canvas ref={canvasRef} className="w-full h-full" style={{ width: "100%", height: "100%" }} />
          </div>

          {statistics.team_analysis && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Forma Index</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-[#A3E635]/20 text-[#A3E635]">
                    Hazai: {statistics.team_analysis.home_form_index}%
                  </Badge>
                  <Badge className="bg-blue-400/20 text-blue-400">
                    Vendég: {statistics.team_analysis.away_form_index}%
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">H2H Meccsek</span>
                <Badge className="bg-white/10 text-gray-300">{statistics.team_analysis.matches_count} meccs</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

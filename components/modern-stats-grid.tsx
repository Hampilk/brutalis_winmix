import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Target, Users, BarChart3 } from "lucide-react"
import type { StatisticsResult } from "@/lib/football-statistics"

interface ModernStatsGridProps {
  statistics: StatisticsResult
}

export default function ModernStatsGrid({ statistics }: ModernStatsGridProps) {
  const stats = [
    {
      title: "Összes Meccs",
      value: statistics.total_matches.toString(),
      icon: BarChart3,
      color: "text-[#A3E635]",
      bgColor: "bg-[#A3E635]/20",
    },
    {
      title: "Átlag Gólok",
      value: statistics.general_stats.average_goals.average_total_goals.toFixed(1),
      icon: Target,
      color: "text-blue-400",
      bgColor: "bg-blue-400/20",
    },
    {
      title: "BTTS Arány",
      value: `${Math.round(statistics.general_stats.both_teams_scored_percentage)}%`,
      icon: Users,
      color: "text-purple-400",
      bgColor: "bg-purple-400/20",
    },
    {
      title: "Hazai Gólok",
      value: statistics.general_stats.average_goals.average_home_goals.toFixed(1),
      icon: TrendingUp,
      color: "text-orange-400",
      bgColor: "bg-orange-400/20",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="bg-[#111318] border-white/10 hover:border-white/20 transition-all hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.3)]"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-2xl ${stat.bgColor} flex items-center justify-center ${stat.color} transition-transform hover:scale-110`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
              <Badge className="bg-white/10 text-gray-300 text-xs">Live</Badge>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-black text-white">{stat.value}</p>
              <p className="text-sm text-gray-400 font-medium">{stat.title}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

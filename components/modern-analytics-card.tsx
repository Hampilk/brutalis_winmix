import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Clock, AlertCircle } from "lucide-react"
import type { StatisticsResult } from "@/lib/football-statistics"

interface ModernAnalyticsCardProps {
  statistics: StatisticsResult
}

export default function ModernAnalyticsCard({ statistics }: ModernAnalyticsCardProps) {
  const features = [
    {
      icon: TrendingUp,
      text: "Heti trendvonal gördülő átlaggal",
    },
    {
      icon: Clock,
      text: "Meccs, gól és eredmény idő bontása",
    },
    {
      icon: AlertCircle,
      text: "Intelligens riasztások statisztikai kiugrások esetén",
    },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
      <div className="space-y-8">
        <h2 className="text-5xl font-black text-white leading-tight">Meccs eredmény analitika</h2>
        <p className="text-xl text-gray-400 leading-relaxed max-w-2xl">
          Szűk keresztmetszetek felismerése mielőtt rossz fogadásokat tennénk. A Football Analytics minden meccset, gólt
          és eredményt elemez, hogy kristálytiszta képet adjon a csapat teljesítményéről.
        </p>
        <ul className="space-y-5">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-4 text-gray-400 hover:text-white transition-colors">
              <div className="w-10 h-10 bg-[#A3E635]/10 rounded-xl flex items-center justify-center text-[#A3E635] transition-transform hover:scale-110">
                <feature.icon className="w-5 h-5" />
              </div>
              <span className="font-medium">{feature.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative">
        <div className="absolute inset-[-6rem] bg-gradient-to-r from-[#A3E635]/20 via-[#A3E635]/10 to-transparent rounded-3xl blur-12 animate-pulse"></div>
        <Card className="relative bg-[#111318] border-white/10 shadow-[0_25px_50px_rgba(0,0,0,0.5)]">
          <CardContent className="p-10">
            <div className="flex items-center gap-3 mb-8 text-sm font-semibold text-gray-400">
              <TrendingUp className="w-4 h-4 text-[#A3E635]" />
              <span>Meccs Statisztikák – Utolsó {statistics.totalMatches} Meccs</span>
            </div>
            <div className="h-96 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#A3E635] to-[#A3E635]/80 flex items-center justify-center text-black font-black text-2xl shadow-[0_8px_25px_rgba(163,230,53,0.4)]">
                  {Math.round(statistics.averageGoals * 10)}%
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-black text-white">{statistics.averageGoals.toFixed(1)} átlag gól</p>
                  <p className="text-gray-400">{statistics.totalMatches} meccs alapján</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

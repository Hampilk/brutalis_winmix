interface CacheItem<T> {
  data: T
  timestamp: number
  expiresAt: number
}

class CacheUtils {
  private cache = new Map<string, CacheItem<any>>()
  private readonly DEFAULT_TTL = 3600 // 1 hour in seconds

  set<T>(key: string, data: T, ttlSeconds: number = this.DEFAULT_TTL): void {
    const now = Date.now()
    const expiresAt = now + ttlSeconds * 1000

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt,
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  has(key: string): boolean {
    const item = this.cache.get(key)

    if (!item) {
      return false
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  size(): number {
    // Clean expired items first
    this.cleanExpired()
    return this.cache.size
  }

  keys(): string[] {
    this.cleanExpired()
    return Array.from(this.cache.keys())
  }

  private cleanExpired(): void {
    const now = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key)
      }
    }
  }

  // Prediction-specific utilities
  getPredictionKey(homeTeam: string, awayTeam: string, league?: string): string {
    return `prediction_${homeTeam}_${awayTeam}_${league || "default"}`
  }

  getStatsKey(dateFrom: string, dateTo: string): string {
    return `stats_${dateFrom}_${dateTo}`
  }

  // Get cache statistics
  getStats() {
    this.cleanExpired()

    return {
      totalItems: this.cache.size,
      memoryUsage: JSON.stringify(Array.from(this.cache.entries())).length,
      oldestItem: Math.min(...Array.from(this.cache.values()).map((item) => item.timestamp)),
      newestItem: Math.max(...Array.from(this.cache.values()).map((item) => item.timestamp)),
    }
  }
}

export const cacheUtils = new CacheUtils()

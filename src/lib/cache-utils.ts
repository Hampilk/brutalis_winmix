interface CacheItem<T> {
  data: T
  timestamp: number
  expires_at: string
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>()
  private readonly DEFAULT_TTL = 30 * 60 * 1000 // 30 minutes

  set<T>(key: string, data: T, expiresAt?: string): void {
    const expires_at = expiresAt || new Date(Date.now() + this.DEFAULT_TTL).toISOString()

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expires_at,
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    // Check if expired
    const expiresAt = new Date(item.expires_at)
    if (expiresAt <= new Date()) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    const expiresAt = new Date(item.expires_at)
    if (expiresAt <= new Date()) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Clean up expired items
  cleanup(): void {
    const now = new Date()
    for (const [key, item] of this.cache.entries()) {
      const expiresAt = new Date(item.expires_at)
      if (expiresAt <= now) {
        this.cache.delete(key)
      }
    }
  }

  // Get cache statistics
  getStats(): {
    size: number
    expired: number
    valid: number
  } {
    const now = new Date()
    let expired = 0
    let valid = 0

    for (const item of this.cache.values()) {
      const expiresAt = new Date(item.expires_at)
      if (expiresAt <= now) {
        expired++
      } else {
        valid++
      }
    }

    return {
      size: this.cache.size,
      expired,
      valid,
    }
  }
}

export const cacheManager = new CacheManager()

// Prediction-specific cache utilities
export const predictionCache = {
  getKey: (homeTeam: string, awayTeam: string, league = "default") => `prediction:${homeTeam}:${awayTeam}:${league}`,

  set: (homeTeam: string, awayTeam: string, prediction: any, league = "default") => {
    const key = predictionCache.getKey(homeTeam, awayTeam, league)
    cacheManager.set(key, prediction, prediction.expires_at)
  },

  get: (homeTeam: string, awayTeam: string, league = "default") => {
    const key = predictionCache.getKey(homeTeam, awayTeam, league)
    return cacheManager.get(key)
  },

  has: (homeTeam: string, awayTeam: string, league = "default") => {
    const key = predictionCache.getKey(homeTeam, awayTeam, league)
    return cacheManager.has(key)
  },

  delete: (homeTeam: string, awayTeam: string, league = "default") => {
    const key = predictionCache.getKey(homeTeam, awayTeam, league)
    return cacheManager.delete(key)
  },
}

// Auto cleanup every 5 minutes
if (typeof window !== "undefined") {
  setInterval(
    () => {
      cacheManager.cleanup()
    },
    5 * 60 * 1000,
  )
}

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

export interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum number of entries
  staleWhileRevalidate?: boolean // Return stale data while fetching fresh data
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>()
  private maxSize: number
  private defaultTTL: number

  constructor(maxSize = 100, defaultTTL = 5 * 60 * 1000) { // 5 minutes default
    this.maxSize = maxSize
    this.defaultTTL = defaultTTL
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now()
    const expiresAt = now + (ttl || this.defaultTTL)

    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    const now = Date.now()
    
    // Check if expired
    if (now > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  getStale<T>(key: string): T | null {
    const entry = this.cache.get(key)
    return entry ? entry.data as T : null
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return false
    }

    const now = Date.now()
    
    if (now > entry.expiresAt) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []
    
    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        keysToDelete.push(key)
      }
    })
    
    keysToDelete.forEach(key => this.cache.delete(key))
  }
}

// Global cache instance
const globalCache = new MemoryCache()

// Cleanup expired entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    globalCache.cleanup()
  }, 5 * 60 * 1000)
}

/**
 * Hook for caching data with automatic expiration and revalidation
 */
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
) {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes
    staleWhileRevalidate = true
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const fetcherRef = useRef(fetcher)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Update fetcher ref when it changes
  useEffect(() => {
    fetcherRef.current = fetcher
  }, [fetcher])

  const fetchData = useCallback(async (useStale = false) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    try {
      // Check cache first
      const cachedData = useStale ? globalCache.getStale<T>(key) : globalCache.get<T>(key)
      
      if (cachedData && !useStale) {
        setData(cachedData)
        setError(null)
        return cachedData
      }

      // If we have stale data and staleWhileRevalidate is enabled, return it immediately
      if (cachedData && staleWhileRevalidate && useStale) {
        setData(cachedData)
        setError(null)
      } else {
        setLoading(true)
      }

      // Fetch fresh data
      const freshData = await fetcherRef.current()

      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return cachedData
      }

      // Cache the fresh data
      globalCache.set(key, freshData, ttl)
      
      setData(freshData)
      setError(null)
      setLoading(false)

      return freshData
    } catch (err) {
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return data
      }

      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      setLoading(false)

      // Return stale data if available
      const staleData = globalCache.getStale<T>(key)
      if (staleData) {
        setData(staleData)
        return staleData
      }

      throw error
    }
  }, [key, ttl, staleWhileRevalidate, data])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  const mutate = useCallback(async (newData?: T) => {
    if (newData) {
      // Optimistic update
      globalCache.set(key, newData, ttl)
      setData(newData)
      setError(null)
    } else {
      // Revalidate
      await fetchData()
    }
  }, [key, ttl, fetchData])

  const invalidate = useCallback(() => {
    globalCache.delete(key)
    setData(null)
    setError(null)
  }, [key])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    data,
    loading,
    error,
    mutate,
    invalidate,
    revalidate: () => fetchData(),
    isStale: !globalCache.has(key) && !!data
  }
}

/**
 * Hook for caching multiple related items (like a list)
 */
export function useCacheList<T>(
  key: string,
  fetcher: () => Promise<T[]>,
  options: CacheOptions = {}
) {
  const cacheResult = useCache(key, fetcher, options)

  const addItem = useCallback((item: T) => {
    if (cacheResult.data) {
      const newData = [...cacheResult.data, item]
      cacheResult.mutate(newData)
    }
  }, [cacheResult])

  const updateItem = useCallback((index: number, item: T) => {
    if (cacheResult.data) {
      const newData = [...cacheResult.data]
      newData[index] = item
      cacheResult.mutate(newData)
    }
  }, [cacheResult])

  const removeItem = useCallback((index: number) => {
    if (cacheResult.data) {
      const newData = cacheResult.data.filter((_, i) => i !== index)
      cacheResult.mutate(newData)
    }
  }, [cacheResult])

  const findItem = useCallback((predicate: (item: T) => boolean) => {
    return cacheResult.data?.find(predicate) || null
  }, [cacheResult.data])

  return {
    ...cacheResult,
    items: cacheResult.data || [],
    addItem,
    updateItem,
    removeItem,
    findItem
  }
}

/**
 * Cache utilities
 */
export const cacheUtils = {
  // Clear all cache
  clearAll: () => globalCache.clear(),
  
  // Get cache size
  getSize: () => globalCache.size(),
  
  // Manual cleanup
  cleanup: () => globalCache.cleanup(),
  
  // Check if key exists in cache
  has: (key: string) => globalCache.has(key),
  
  // Delete specific key
  delete: (key: string) => globalCache.delete(key),
  
  // Set data manually
  set: <T>(key: string, data: T, ttl?: number) => globalCache.set(key, data, ttl),
  
  // Get data manually
  get: <T>(key: string) => globalCache.get<T>(key)
}
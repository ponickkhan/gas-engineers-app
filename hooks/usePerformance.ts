'use client'

import { useEffect, useRef, useCallback } from 'react'

export interface PerformanceMetrics {
  renderTime: number
  componentName: string
  timestamp: number
}

export interface NetworkMetrics {
  url: string
  method: string
  duration: number
  status: number
  size?: number
  timestamp: number
}

class PerformanceMonitor {
  private renderMetrics: PerformanceMetrics[] = []
  private networkMetrics: NetworkMetrics[] = []
  private observers: Map<string, PerformanceObserver> = new Map()

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers()
    }
  }

  private initializeObservers() {
    // Observe navigation timing
    if ('PerformanceObserver' in window) {
      try {
        const navObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming
              console.log('Navigation timing:', {
                domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
                loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
                totalTime: navEntry.loadEventEnd - navEntry.fetchStart
              })
            }
          })
        })
        
        navObserver.observe({ entryTypes: ['navigation'] })
        this.observers.set('navigation', navObserver)
      } catch (e) {
        console.warn('Navigation observer not supported')
      }

      // Observe resource timing
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry) => {
            if (entry.entryType === 'resource') {
              const resourceEntry = entry as PerformanceResourceTiming
              this.networkMetrics.push({
                url: entry.name,
                method: 'GET', // Default, actual method not available in resource timing
                duration: resourceEntry.responseEnd - resourceEntry.requestStart,
                status: 200, // Default, actual status not available
                size: resourceEntry.transferSize || 0,
                timestamp: Date.now()
              })
            }
          })
        })
        
        resourceObserver.observe({ entryTypes: ['resource'] })
        this.observers.set('resource', resourceObserver)
      } catch (e) {
        console.warn('Resource observer not supported')
      }

      // Observe largest contentful paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          console.log('Largest Contentful Paint:', lastEntry.startTime)
        })
        
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        this.observers.set('lcp', lcpObserver)
      } catch (e) {
        console.warn('LCP observer not supported')
      }

      // Observe first input delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry) => {
            const fidEntry = entry as PerformanceEventTiming
            console.log('First Input Delay:', fidEntry.processingStart - fidEntry.startTime)
          })
        })
        
        fidObserver.observe({ entryTypes: ['first-input'] })
        this.observers.set('fid', fidObserver)
      } catch (e) {
        console.warn('FID observer not supported')
      }
    }
  }

  recordRender(componentName: string, renderTime: number) {
    this.renderMetrics.push({
      componentName,
      renderTime,
      timestamp: Date.now()
    })

    // Keep only last 100 entries
    if (this.renderMetrics.length > 100) {
      this.renderMetrics = this.renderMetrics.slice(-100)
    }
  }

  recordNetwork(metrics: Omit<NetworkMetrics, 'timestamp'>) {
    this.networkMetrics.push({
      ...metrics,
      timestamp: Date.now()
    })

    // Keep only last 100 entries
    if (this.networkMetrics.length > 100) {
      this.networkMetrics = this.networkMetrics.slice(-100)
    }
  }

  getRenderMetrics() {
    return [...this.renderMetrics]
  }

  getNetworkMetrics() {
    return [...this.networkMetrics]
  }

  getAverageRenderTime(componentName?: string) {
    const metrics = componentName 
      ? this.renderMetrics.filter(m => m.componentName === componentName)
      : this.renderMetrics

    if (metrics.length === 0) return 0

    const total = metrics.reduce((sum, m) => sum + m.renderTime, 0)
    return total / metrics.length
  }

  getSlowComponents(threshold = 16) { // 16ms = 60fps
    const componentTimes = new Map<string, number[]>()
    
    this.renderMetrics.forEach(metric => {
      if (!componentTimes.has(metric.componentName)) {
        componentTimes.set(metric.componentName, [])
      }
      componentTimes.get(metric.componentName)!.push(metric.renderTime)
    })

    const slowComponents: Array<{ name: string; averageTime: number; maxTime: number }> = []

    componentTimes.forEach((times, name) => {
      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length
      const maxTime = Math.max(...times)
      
      if (averageTime > threshold) {
        slowComponents.push({ name, averageTime, maxTime })
      }
    })

    return slowComponents.sort((a, b) => b.averageTime - a.averageTime)
  }

  clear() {
    this.renderMetrics = []
    this.networkMetrics = []
  }

  disconnect() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
  }
}

// Global performance monitor instance
const performanceMonitor = new PerformanceMonitor()

/**
 * Hook to measure component render performance
 */
export function useRenderPerformance(componentName: string) {
  const renderStartRef = useRef<number>()
  const mountTimeRef = useRef<number>()

  useEffect(() => {
    mountTimeRef.current = performance.now()
  }, [])

  const startMeasure = useCallback(() => {
    renderStartRef.current = performance.now()
  }, [])

  const endMeasure = useCallback(() => {
    if (renderStartRef.current) {
      const renderTime = performance.now() - renderStartRef.current
      performanceMonitor.recordRender(componentName, renderTime)
      
      if (process.env.NODE_ENV === 'development' && renderTime > 16) {
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`)
      }
    }
  }, [componentName])

  const getMountTime = useCallback(() => {
    return mountTimeRef.current ? performance.now() - mountTimeRef.current : 0
  }, [])

  return {
    startMeasure,
    endMeasure,
    getMountTime
  }
}

/**
 * Hook to measure network request performance
 */
export function useNetworkPerformance() {
  const recordRequest = useCallback((
    url: string,
    method: string,
    duration: number,
    status: number,
    size?: number
  ) => {
    performanceMonitor.recordNetwork({
      url,
      method,
      duration,
      status,
      size
    })
  }, [])

  const measureRequest = useCallback(async <T>(
    url: string,
    method: string,
    requestFn: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now()
    
    try {
      const result = await requestFn()
      const duration = performance.now() - startTime
      
      recordRequest(url, method, duration, 200) // Assume success
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      recordRequest(url, method, duration, 500) // Assume server error
      throw error
    }
  }, [recordRequest])

  return {
    recordRequest,
    measureRequest
  }
}

/**
 * Hook to get performance metrics
 */
export function usePerformanceMetrics() {
  const getRenderMetrics = useCallback(() => {
    return performanceMonitor.getRenderMetrics()
  }, [])

  const getNetworkMetrics = useCallback(() => {
    return performanceMonitor.getNetworkMetrics()
  }, [])

  const getAverageRenderTime = useCallback((componentName?: string) => {
    return performanceMonitor.getAverageRenderTime(componentName)
  }, [])

  const getSlowComponents = useCallback((threshold?: number) => {
    return performanceMonitor.getSlowComponents(threshold)
  }, [])

  const clearMetrics = useCallback(() => {
    performanceMonitor.clear()
  }, [])

  return {
    getRenderMetrics,
    getNetworkMetrics,
    getAverageRenderTime,
    getSlowComponents,
    clearMetrics
  }
}

/**
 * Hook to measure and log Web Vitals
 */
export function useWebVitals() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Measure Cumulative Layout Shift
    let clsValue = 0
    let clsEntries: PerformanceEntry[] = []

    const measureCLS = () => {
      if ('PerformanceObserver' in window) {
        try {
          const clsObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value
                clsEntries.push(entry)
              }
            })
          })
          
          clsObserver.observe({ entryTypes: ['layout-shift'] })
          
          // Log CLS on page unload
          window.addEventListener('beforeunload', () => {
            console.log('Cumulative Layout Shift:', clsValue)
          })
        } catch (e) {
          console.warn('CLS measurement not supported')
        }
      }
    }

    measureCLS()

    // Measure Time to First Byte
    const measureTTFB = () => {
      if ('performance' in window && 'getEntriesByType' in performance) {
        const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
        if (navEntries.length > 0) {
          const ttfb = navEntries[0].responseStart - navEntries[0].requestStart
          console.log('Time to First Byte:', ttfb)
        }
      }
    }

    measureTTFB()
  }, [])
}

/**
 * Performance debugging utilities
 */
export const performanceUtils = {
  // Log current performance metrics
  logMetrics: () => {
    console.group('Performance Metrics')
    console.log('Render Metrics:', performanceMonitor.getRenderMetrics())
    console.log('Network Metrics:', performanceMonitor.getNetworkMetrics())
    console.log('Slow Components:', performanceMonitor.getSlowComponents())
    console.groupEnd()
  },

  // Get performance summary
  getSummary: () => {
    const renderMetrics = performanceMonitor.getRenderMetrics()
    const networkMetrics = performanceMonitor.getNetworkMetrics()
    const slowComponents = performanceMonitor.getSlowComponents()

    return {
      totalRenders: renderMetrics.length,
      averageRenderTime: performanceMonitor.getAverageRenderTime(),
      totalRequests: networkMetrics.length,
      averageRequestTime: networkMetrics.length > 0 
        ? networkMetrics.reduce((sum, m) => sum + m.duration, 0) / networkMetrics.length 
        : 0,
      slowComponentsCount: slowComponents.length,
      slowComponents: slowComponents.slice(0, 5) // Top 5 slowest
    }
  },

  // Clear all metrics
  clear: () => performanceMonitor.clear(),

  // Disconnect observers
  disconnect: () => performanceMonitor.disconnect()
}
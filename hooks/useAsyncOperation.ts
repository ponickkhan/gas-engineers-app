'use client'

import { useState, useCallback, useRef } from 'react'
import { withRetry, parseError, getUserFriendlyMessage, logError, type AppError } from '@/utils/errorHandling'
import { useToast } from '@/components/ui/Toast'

export interface AsyncOperationState {
  loading: boolean
  error: AppError | null
  data: any
}

export interface AsyncOperationOptions {
  showSuccessToast?: boolean
  showErrorToast?: boolean
  successMessage?: string
  retryOptions?: {
    maxAttempts?: number
    baseDelay?: number
  }
  onSuccess?: (data: any) => void
  onError?: (error: AppError) => void
}

/**
 * Hook for managing async operations with loading states, error handling, and retry logic
 */
export function useAsyncOperation<T = any>(
  operation: () => Promise<T>,
  options: AsyncOperationOptions = {}
) {
  const [state, setState] = useState<AsyncOperationState>({
    loading: false,
    error: null,
    data: null
  })
  
  const { addToast } = useToast()
  const abortControllerRef = useRef<AbortController | null>(null)
  
  const execute = useCallback(async (...args: any[]): Promise<T | undefined> => {
    // Cancel previous operation if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController()
    
    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }))
    
    try {
      const result = await withRetry(
        () => operation(),
        options.retryOptions
      )
      
      // Check if operation was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return undefined
      }
      
      setState({
        loading: false,
        error: null,
        data: result
      })
      
      // Show success toast if enabled
      if (options.showSuccessToast && options.successMessage) {
        addToast({
          type: 'success',
          title: 'Success',
          message: options.successMessage
        })
      }
      
      // Call success callback
      if (options.onSuccess) {
        options.onSuccess(result)
      }
      
      return result
    } catch (error: any) {
      // Check if operation was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return undefined
      }
      
      const appError = parseError(error)
      logError(appError, 'useAsyncOperation')
      
      setState({
        loading: false,
        error: appError,
        data: null
      })
      
      // Show error toast if enabled
      if (options.showErrorToast !== false) {
        addToast({
          type: 'error',
          title: 'Error',
          message: getUserFriendlyMessage(appError)
        })
      }
      
      // Call error callback
      if (options.onError) {
        options.onError(appError)
      }
      
      return undefined
    }
  }, [operation, options, addToast])
  
  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      data: null
    })
  }, [])
  
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setState(prev => ({
        ...prev,
        loading: false
      }))
    }
  }, [])
  
  return {
    ...state,
    execute,
    reset,
    cancel,
    isLoading: state.loading,
    hasError: !!state.error,
    isSuccess: !state.loading && !state.error && state.data !== null
  }
}

/**
 * Hook for managing multiple async operations
 */
export function useAsyncOperations() {
  const [operations, setOperations] = useState<Record<string, AsyncOperationState>>({})
  const { addToast } = useToast()
  
  const executeOperation = useCallback(async <T>(
    key: string,
    operation: () => Promise<T>,
    options: AsyncOperationOptions = {}
  ): Promise<T | undefined> => {
    setOperations(prev => ({
      ...prev,
      [key]: {
        loading: true,
        error: null,
        data: null
      }
    }))
    
    try {
      const result = await withRetry(
        () => operation(),
        options.retryOptions
      )
      
      setOperations(prev => ({
        ...prev,
        [key]: {
          loading: false,
          error: null,
          data: result
        }
      }))
      
      // Show success toast if enabled
      if (options.showSuccessToast && options.successMessage) {
        addToast({
          type: 'success',
          title: 'Success',
          message: options.successMessage
        })
      }
      
      // Call success callback
      if (options.onSuccess) {
        options.onSuccess(result)
      }
      
      return result
    } catch (error: any) {
      const appError = parseError(error)
      logError(appError, `useAsyncOperations:${key}`)
      
      setOperations(prev => ({
        ...prev,
        [key]: {
          loading: false,
          error: appError,
          data: null
        }
      }))
      
      // Show error toast if enabled
      if (options.showErrorToast !== false) {
        addToast({
          type: 'error',
          title: 'Error',
          message: getUserFriendlyMessage(appError)
        })
      }
      
      // Call error callback
      if (options.onError) {
        options.onError(appError)
      }
      
      return undefined
    }
  }, [addToast])
  
  const getOperation = useCallback((key: string) => {
    return operations[key] || {
      loading: false,
      error: null,
      data: null
    }
  }, [operations])
  
  const resetOperation = useCallback((key: string) => {
    setOperations(prev => {
      const newOperations = { ...prev }
      delete newOperations[key]
      return newOperations
    })
  }, [])
  
  const resetAllOperations = useCallback(() => {
    setOperations({})
  }, [])
  
  return {
    operations,
    executeOperation,
    getOperation,
    resetOperation,
    resetAllOperations,
    isAnyLoading: Object.values(operations).some(op => op.loading),
    hasAnyError: Object.values(operations).some(op => op.error)
  }
}
/**
 * Error handling utilities for network requests and application errors
 */

export enum ErrorType {
  VALIDATION = 'validation',
  NETWORK = 'network',
  AUTH = 'auth',
  PERMISSION = 'permission',
  SERVER = 'server',
  UNKNOWN = 'unknown'
}

export interface AppError {
  type: ErrorType
  message: string
  field?: string
  code?: string
  details?: any
  retryable?: boolean
}

export class NetworkError extends Error {
  public readonly type: ErrorType
  public readonly code?: string
  public readonly retryable: boolean
  public readonly details?: any

  constructor(message: string, code?: string, retryable = true, details?: any) {
    super(message)
    this.name = 'NetworkError'
    this.type = ErrorType.NETWORK
    this.code = code
    this.retryable = retryable
    this.details = details
  }
}

export class ValidationError extends Error {
  public readonly type: ErrorType
  public readonly field?: string
  public readonly details?: any

  constructor(message: string, field?: string, details?: any) {
    super(message)
    this.name = 'ValidationError'
    this.type = ErrorType.VALIDATION
    this.field = field
    this.details = details
  }
}

export class AuthError extends Error {
  public readonly type: ErrorType
  public readonly code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'AuthError'
    this.type = ErrorType.AUTH
    this.code = code
  }
}

/**
 * Retry configuration options
 */
export interface RetryOptions {
  maxAttempts?: number
  baseDelay?: number
  maxDelay?: number
  backoffFactor?: number
  retryCondition?: (error: any) => boolean
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryCondition: (error: any) => {
    // Retry on network errors, server errors (5xx), and timeout errors
    if (error instanceof NetworkError) {
      return error.retryable
    }
    
    // Retry on fetch network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return true
    }
    
    // Retry on specific HTTP status codes
    if (error.status) {
      return error.status >= 500 || error.status === 408 || error.status === 429
    }
    
    return false
  }
}

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options }
  let lastError: any
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // Don't retry if condition is not met
      if (!config.retryCondition(error)) {
        throw error
      }
      
      // Don't retry on last attempt
      if (attempt === config.maxAttempts) {
        throw error
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.baseDelay * Math.pow(config.backoffFactor, attempt - 1),
        config.maxDelay
      )
      
      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms:`, error instanceof Error ? error.message : String(error))
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

/**
 * Parse and normalize errors from different sources
 */
export function parseError(error: any): AppError {
  // Handle Supabase errors
  if (error?.code && error?.message) {
    if (error.code === 'PGRST116') {
      return {
        type: ErrorType.VALIDATION,
        message: 'Record not found',
        code: error.code,
        retryable: false
      }
    }
    
    if (error.code.startsWith('23')) {
      return {
        type: ErrorType.VALIDATION,
        message: 'Data validation error',
        code: error.code,
        details: error.details,
        retryable: false
      }
    }
    
    if (error.code === '42501') {
      return {
        type: ErrorType.PERMISSION,
        message: 'Permission denied',
        code: error.code,
        retryable: false
      }
    }
  }
  
  // Handle authentication errors
  if (error?.message?.includes('auth') || error?.message?.includes('unauthorized')) {
    return {
      type: ErrorType.AUTH,
      message: 'Authentication required',
      code: error.code,
      retryable: false
    }
  }
  
  // Handle network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      type: ErrorType.NETWORK,
      message: 'Network connection error. Please check your internet connection.',
      retryable: true
    }
  }
  
  // Handle HTTP errors
  if (error?.status) {
    if (error.status >= 500) {
      return {
        type: ErrorType.SERVER,
        message: 'Server error. Please try again later.',
        code: error.status.toString(),
        retryable: true
      }
    }
    
    if (error.status === 401) {
      return {
        type: ErrorType.AUTH,
        message: 'Authentication required',
        code: '401',
        retryable: false
      }
    }
    
    if (error.status === 403) {
      return {
        type: ErrorType.PERMISSION,
        message: 'Permission denied',
        code: '403',
        retryable: false
      }
    }
    
    if (error.status === 404) {
      return {
        type: ErrorType.VALIDATION,
        message: 'Resource not found',
        code: '404',
        retryable: false
      }
    }
  }
  
  // Handle validation errors
  if (error instanceof ValidationError) {
    return {
      type: ErrorType.VALIDATION,
      message: error.message,
      field: error.field,
      details: error.details,
      retryable: false
    }
  }
  
  // Default error
  return {
    type: ErrorType.UNKNOWN,
    message: error?.message || 'An unexpected error occurred',
    retryable: false
  }
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: AppError): string {
  switch (error.type) {
    case ErrorType.NETWORK:
      return 'Connection problem. Please check your internet connection and try again.'
    
    case ErrorType.AUTH:
      return 'Please log in to continue.'
    
    case ErrorType.PERMISSION:
      return 'You don\'t have permission to perform this action.'
    
    case ErrorType.VALIDATION:
      return error.message || 'Please check your input and try again.'
    
    case ErrorType.SERVER:
      return 'Server is temporarily unavailable. Please try again in a few moments.'
    
    default:
      return error.message || 'Something went wrong. Please try again.'
  }
}

/**
 * Log error to external service (placeholder)
 */
export function logError(error: AppError, context?: string) {
  const errorLog = {
    type: error.type,
    message: error.message,
    code: error.code,
    field: error.field,
    context,
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown'
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorLog)
  } else {
    // TODO: Send to external error tracking service
    console.error('Production error:', errorLog)
  }
}

/**
 * Create a safe async function that handles errors gracefully
 */
export function createSafeAsyncFunction<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: {
    onError?: (error: AppError) => void
    defaultValue?: R
    context?: string
  } = {}
) {
  return async (...args: T): Promise<R | undefined> => {
    try {
      return await fn(...args)
    } catch (error) {
      const appError = parseError(error)
      logError(appError, options.context)
      
      if (options.onError) {
        options.onError(appError)
      }
      
      return options.defaultValue
    }
  }
}
'use client'

import React from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { AppError, ErrorType, getUserFriendlyMessage } from '@/utils/errorHandling'
import { cn } from '@/utils/cn'

export interface ErrorDisplayProps {
  error: AppError | Error | string
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
  variant?: 'inline' | 'card' | 'banner'
  showDetails?: boolean
}

export function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  className = '',
  variant = 'inline',
  showDetails = false
}: ErrorDisplayProps) {
  // Normalize error to AppError
  const appError: AppError = typeof error === 'string' 
    ? { type: ErrorType.UNKNOWN, message: error }
    : error instanceof Error
    ? { type: ErrorType.UNKNOWN, message: error.message }
    : error

  const getErrorIcon = (type: ErrorType) => {
    switch (type) {
      case ErrorType.NETWORK:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case ErrorType.AUTH:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        )
      case ErrorType.PERMISSION:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        )
      case ErrorType.VALIDATION:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  const getErrorColor = (type: ErrorType) => {
    switch (type) {
      case ErrorType.NETWORK:
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case ErrorType.AUTH:
        return 'text-purple-600 bg-purple-50 border-purple-200'
      case ErrorType.PERMISSION:
        return 'text-red-600 bg-red-50 border-red-200'
      case ErrorType.VALIDATION:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-red-600 bg-red-50 border-red-200'
    }
  }

  const colorClasses = getErrorColor(appError.type)
  const userMessage = getUserFriendlyMessage(appError)

  if (variant === 'banner') {
    return (
      <div className={cn(
        'border-l-4 p-4',
        colorClasses,
        className
      )}>
        <div className="flex">
          <div className="flex-shrink-0">
            {getErrorIcon(appError.type)}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">
              {userMessage}
            </p>
            {showDetails && appError.code && (
              <p className="mt-1 text-xs opacity-75">
                Error code: {appError.code}
              </p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex space-x-2">
            {onRetry && appError.retryable && (
              <Button
                size="sm"
                variant="outline"
                onClick={onRetry}
                className="text-xs"
              >
                Retry
              </Button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <Card className={cn('border-l-4', colorClasses, className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-sm">
            {getErrorIcon(appError.type)}
            <span className="ml-2">Error</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm mb-3">{userMessage}</p>
          
          {showDetails && (
            <div className="text-xs opacity-75 mb-3">
              {appError.code && <p>Code: {appError.code}</p>}
              {appError.field && <p>Field: {appError.field}</p>}
            </div>
          )}
          
          <div className="flex space-x-2">
            {onRetry && appError.retryable && (
              <Button
                size="sm"
                variant="outline"
                onClick={onRetry}
              >
                Try Again
              </Button>
            )}
            {onDismiss && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onDismiss}
              >
                Dismiss
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Inline variant (default)
  return (
    <div className={cn(
      'flex items-center p-3 rounded-md border',
      colorClasses,
      className
    )}>
      <div className="flex-shrink-0">
        {getErrorIcon(appError.type)}
      </div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium">{userMessage}</p>
        {showDetails && appError.code && (
          <p className="text-xs opacity-75 mt-1">
            Error code: {appError.code}
          </p>
        )}
      </div>
      {(onRetry || onDismiss) && (
        <div className="ml-4 flex-shrink-0 flex space-x-2">
          {onRetry && appError.retryable && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRetry}
              className="text-xs"
            >
              Retry
            </Button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="inline-flex rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <span className="sr-only">Dismiss</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// Field error component for forms
export interface FieldErrorProps {
  error?: string
  className?: string
}

export function FieldError({ error, className = '' }: FieldErrorProps) {
  if (!error) return null

  return (
    <p className={cn('text-sm text-red-600 mt-1', className)}>
      {error}
    </p>
  )
}

// Success message component
export interface SuccessMessageProps {
  message: string
  onDismiss?: () => void
  className?: string
}

export function SuccessMessage({ 
  message, 
  onDismiss, 
  className = '' 
}: SuccessMessageProps) {
  return (
    <div className={cn(
      'flex items-center p-3 rounded-md border border-green-200 bg-green-50 text-green-800',
      className
    )}>
      <div className="flex-shrink-0">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onDismiss && (
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={onDismiss}
            className="inline-flex rounded-md p-1 text-green-600 hover:text-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <span className="sr-only">Dismiss</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
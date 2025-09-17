'use client'

import React, { useState, useCallback } from 'react'
import { cn } from '@/utils/cn'
import { FieldError } from '@/components/error/ErrorDisplay'
import { LoadingSpinner } from '@/components/ui/LoadingStates'

export interface EnhancedFormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  warning?: string
  success?: boolean
  helperText?: string
  isValidating?: boolean
  required?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onValidate?: (value: string) => Promise<string | null>
  validateOnBlur?: boolean
  validateOnChange?: boolean
  debounceMs?: number
}

export function EnhancedFormField({
  label,
  error,
  warning,
  success,
  helperText,
  isValidating = false,
  required = false,
  leftIcon,
  rightIcon,
  onValidate,
  validateOnBlur = true,
  validateOnChange = false,
  debounceMs = 300,
  className = '',
  ...props
}: EnhancedFormFieldProps) {
  const [localError, setLocalError] = useState<string | null>(null)
  const [localValidating, setLocalValidating] = useState(false)
  const [validationTimeout, setValidationTimeout] = useState<NodeJS.Timeout | null>(null)

  const displayError = error || localError
  const displayValidating = isValidating || localValidating

  const validateField = useCallback(async (value: string) => {
    if (!onValidate) return

    setLocalValidating(true)
    try {
      const validationError = await onValidate(value)
      setLocalError(validationError)
    } catch (err) {
      setLocalError('Validation failed')
    } finally {
      setLocalValidating(false)
    }
  }, [onValidate])

  const handleValidation = useCallback((value: string, immediate = false) => {
    if (!onValidate) return

    // Clear existing timeout
    if (validationTimeout) {
      clearTimeout(validationTimeout)
    }

    if (immediate) {
      validateField(value)
    } else {
      // Debounce validation
      const timeout = setTimeout(() => {
        validateField(value)
      }, debounceMs)
      setValidationTimeout(timeout)
    }
  }, [onValidate, validateField, validationTimeout, debounceMs])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    // Clear local error when user starts typing
    if (localError) {
      setLocalError(null)
    }

    // Call original onChange
    if (props.onChange) {
      props.onChange(e)
    }

    // Validate on change if enabled
    if (validateOnChange) {
      handleValidation(value)
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Call original onBlur
    if (props.onBlur) {
      props.onBlur(e)
    }

    // Validate on blur if enabled
    if (validateOnBlur) {
      handleValidation(value, true)
    }
  }

  const getFieldState = () => {
    if (displayError) return 'error'
    if (warning) return 'warning'
    if (success) return 'success'
    return 'default'
  }

  const fieldState = getFieldState()

  const getFieldClasses = () => {
    const baseClasses = 'block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-offset-0 transition-colors'
    
    switch (fieldState) {
      case 'error':
        return cn(baseClasses, 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500')
      case 'warning':
        return cn(baseClasses, 'border-yellow-300 text-yellow-900 placeholder-yellow-300 focus:border-yellow-500 focus:ring-yellow-500')
      case 'success':
        return cn(baseClasses, 'border-green-300 text-green-900 placeholder-green-300 focus:border-green-500 focus:ring-green-500')
      default:
        return cn(baseClasses, 'focus:border-blue-500 focus:ring-blue-500')
    }
  }

  const getLabelClasses = () => {
    const baseClasses = 'block text-sm font-medium mb-1'
    
    switch (fieldState) {
      case 'error':
        return cn(baseClasses, 'text-red-700')
      case 'warning':
        return cn(baseClasses, 'text-yellow-700')
      case 'success':
        return cn(baseClasses, 'text-green-700')
      default:
        return cn(baseClasses, 'text-gray-700')
    }
  }

  const getStatusIcon = () => {
    if (displayValidating) {
      return <LoadingSpinner size="sm" />
    }
    
    switch (fieldState) {
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <label className={getLabelClasses()}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        
        <input
          {...props}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            getFieldClasses(),
            leftIcon && 'pl-10',
            (rightIcon || getStatusIcon()) && 'pr-10'
          )}
          aria-invalid={!!displayError}
          aria-describedby={
            displayError ? `${props.id}-error` : 
            warning ? `${props.id}-warning` :
            helperText ? `${props.id}-helper` : undefined
          }
        />
        
        {(rightIcon || getStatusIcon()) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightIcon || getStatusIcon()}
          </div>
        )}
      </div>
      
      {displayError && (
        <FieldError 
          error={displayError} 
          className={props.id ? `${props.id}-error` : undefined}
        />
      )}
      
      {warning && !displayError && (
        <p className={cn('text-sm text-yellow-600 mt-1', props.id && `${props.id}-warning`)}>
          {warning}
        </p>
      )}
      
      {helperText && !displayError && !warning && (
        <p className={cn('text-sm text-gray-500 mt-1', props.id && `${props.id}-helper`)}>
          {helperText}
        </p>
      )}
    </div>
  )
}

// Enhanced TextArea component
export interface EnhancedTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  warning?: string
  success?: boolean
  helperText?: string
  required?: boolean
  maxLength?: number
  showCharCount?: boolean
}

export function EnhancedTextArea({
  label,
  error,
  warning,
  success,
  helperText,
  required = false,
  maxLength,
  showCharCount = false,
  className = '',
  ...props
}: EnhancedTextAreaProps) {
  const [charCount, setCharCount] = useState(props.defaultValue?.toString().length || 0)

  const getFieldState = () => {
    if (error) return 'error'
    if (warning) return 'warning'
    if (success) return 'success'
    return 'default'
  }

  const fieldState = getFieldState()

  const getFieldClasses = () => {
    const baseClasses = 'block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-offset-0 transition-colors'
    
    switch (fieldState) {
      case 'error':
        return cn(baseClasses, 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500')
      case 'warning':
        return cn(baseClasses, 'border-yellow-300 text-yellow-900 placeholder-yellow-300 focus:border-yellow-500 focus:ring-yellow-500')
      case 'success':
        return cn(baseClasses, 'border-green-300 text-green-900 placeholder-green-300 focus:border-green-500 focus:ring-green-500')
      default:
        return cn(baseClasses, 'focus:border-blue-500 focus:ring-blue-500')
    }
  }

  const getLabelClasses = () => {
    const baseClasses = 'block text-sm font-medium mb-1'
    
    switch (fieldState) {
      case 'error':
        return cn(baseClasses, 'text-red-700')
      case 'warning':
        return cn(baseClasses, 'text-yellow-700')
      case 'success':
        return cn(baseClasses, 'text-green-700')
      default:
        return cn(baseClasses, 'text-gray-700')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (showCharCount || maxLength) {
      setCharCount(e.target.value.length)
    }
    
    if (props.onChange) {
      props.onChange(e)
    }
  }

  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <label className={getLabelClasses()}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        {...props}
        onChange={handleChange}
        className={getFieldClasses()}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${props.id}-error` : 
          warning ? `${props.id}-warning` :
          helperText ? `${props.id}-helper` : undefined
        }
      />
      
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {error && (
            <FieldError 
              error={error} 
              className={props.id ? `${props.id}-error` : undefined}
            />
          )}
          
          {warning && !error && (
            <p className={cn('text-sm text-yellow-600 mt-1', props.id && `${props.id}-warning`)}>
              {warning}
            </p>
          )}
          
          {helperText && !error && !warning && (
            <p className={cn('text-sm text-gray-500 mt-1', props.id && `${props.id}-helper`)}>
              {helperText}
            </p>
          )}
        </div>
        
        {(showCharCount || maxLength) && (
          <div className="text-xs text-gray-500 mt-1 ml-2">
            {charCount}{maxLength && `/${maxLength}`}
          </div>
        )}
      </div>
    </div>
  )
}
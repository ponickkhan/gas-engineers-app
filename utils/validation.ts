/**
 * Enhanced validation utilities for forms and data
 */

import React from 'react'
import { z } from 'zod'

// Common validation patterns
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  postcode: /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}$/i,
  gasSafeNumber: /^[0-9]{6}$/,
  invoiceNumber: /^INV-\d{4}-\d{4}$/
}

// Custom validation messages
export const ValidationMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  postcode: 'Please enter a valid UK postcode',
  gasSafeNumber: 'Gas Safe number must be 6 digits',
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must be no more than ${max} characters`,
  min: (min: number) => `Must be at least ${min}`,
  max: (max: number) => `Must be no more than ${max}`,
  date: 'Please enter a valid date',
  futureDate: 'Date must be in the future',
  pastDate: 'Date must be in the past'
}

// Enhanced Zod schemas with custom error messages
export const createEmailSchema = (required = true) => {
  const schema = z.string().email(ValidationMessages.email)
  return required ? schema.min(1, ValidationMessages.required) : schema.optional().or(z.literal(''))
}

export const createPhoneSchema = (required = false) => {
  const schema = z.string().regex(ValidationPatterns.phone, ValidationMessages.phone)
  return required ? schema.min(1, ValidationMessages.required) : schema.optional()
}

export const createPostcodeSchema = (required = false) => {
  const schema = z.string().regex(ValidationPatterns.postcode, ValidationMessages.postcode)
  return required ? schema.min(1, ValidationMessages.required) : schema.optional()
}

export const createGasSafeSchema = (required = true) => {
  const schema = z.string().regex(ValidationPatterns.gasSafeNumber, ValidationMessages.gasSafeNumber)
  return required ? schema.min(1, ValidationMessages.required) : schema.optional()
}

export const createDateSchema = (required = true, futureOnly = false, pastOnly = false) => {
  let baseSchema = z.string()
  
  // Apply required constraint first if needed
  if (required) {
    baseSchema = baseSchema.min(1, ValidationMessages.required)
  }
  
  // Apply refinements
  if (futureOnly && pastOnly) {
    // This is contradictory, but handle it
    return baseSchema.refine(
      () => false,
      { message: 'Date cannot be both in future and past' }
    )
  } else if (futureOnly) {
    return baseSchema.refine(
      (date) => new Date(date) > new Date(),
      { message: ValidationMessages.futureDate }
    )
  } else if (pastOnly) {
    return baseSchema.refine(
      (date) => new Date(date) < new Date(),
      { message: ValidationMessages.pastDate }
    )
  } else {
    // No refinements, return as optional if not required
    return required ? baseSchema : baseSchema.optional()
  }
}

export const createStringSchema = (
  required = false,
  minLength?: number,
  maxLength?: number
) => {
  let schema = z.string()
  
  if (minLength) {
    schema = schema.min(minLength, ValidationMessages.minLength(minLength))
  }
  
  if (maxLength) {
    schema = schema.max(maxLength, ValidationMessages.maxLength(maxLength))
  }
  
  return required ? schema.min(1, ValidationMessages.required) : schema.optional()
}

export const createNumberSchema = (
  required = false,
  min?: number,
  max?: number
) => {
  let schema = z.number()
  
  if (min !== undefined) {
    schema = schema.min(min, ValidationMessages.min(min))
  }
  
  if (max !== undefined) {
    schema = schema.max(max, ValidationMessages.max(max))
  }
  
  if (required) {
    return schema
  }
  
  return z.union([schema, z.string().transform(val => val === '' ? undefined : Number(val))]).optional()
}

// Real-time validation hook
export function useRealTimeValidation<T extends z.ZodSchema>(
  schema: T,
  value: any,
  debounceMs = 300
) {
  const [error, setError] = React.useState<string | null>(null)
  const [isValidating, setIsValidating] = React.useState(false)
  const timeoutRef = React.useRef<NodeJS.Timeout>()
  
  React.useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    setIsValidating(true)
    
    timeoutRef.current = setTimeout(() => {
      try {
        schema.parse(value)
        setError(null)
      } catch (err) {
        if (err instanceof z.ZodError) {
          setError(err.errors[0]?.message || 'Invalid value')
        }
      } finally {
        setIsValidating(false)
      }
    }, debounceMs)
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, schema, debounceMs])
  
  return { error, isValidating }
}

// Form field validation state
export interface FieldValidationState {
  error?: string
  warning?: string
  success?: boolean
  isValidating?: boolean
}

// Validation result
export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
  warnings: Record<string, string>
}

// Validate entire form data
export function validateFormData<T>(
  schema: z.ZodSchema<T>,
  data: any
): ValidationResult {
  try {
    schema.parse(data)
    return {
      isValid: true,
      errors: {},
      warnings: {}
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      
      error.errors.forEach(err => {
        const path = err.path.join('.')
        errors[path] = err.message
      })
      
      return {
        isValid: false,
        errors,
        warnings: {}
      }
    }
    
    return {
      isValid: false,
      errors: { _root: 'Validation failed' },
      warnings: {}
    }
  }
}

// Async validation function
export async function validateAsync<T>(
  schema: z.ZodSchema<T>,
  data: any,
  customValidators?: Array<(data: any) => Promise<string | null>>
): Promise<ValidationResult> {
  // First run synchronous validation
  const syncResult = validateFormData(schema, data)
  
  if (!syncResult.isValid) {
    return syncResult
  }
  
  // Run custom async validators
  if (customValidators && customValidators.length > 0) {
    const asyncErrors: Record<string, string> = {}
    
    for (const validator of customValidators) {
      try {
        const error = await validator(data)
        if (error) {
          asyncErrors._async = error
        }
      } catch (err) {
        asyncErrors._async = 'Validation error occurred'
      }
    }
    
    if (Object.keys(asyncErrors).length > 0) {
      return {
        isValid: false,
        errors: asyncErrors,
        warnings: {}
      }
    }
  }
  
  return syncResult
}

// Common validation rules
export const CommonValidationRules = {
  // Check if email is already in use
  uniqueEmail: async (email: string): Promise<string | null> => {
    // TODO: Implement email uniqueness check
    return null
  },
  
  // Check if invoice number is unique
  uniqueInvoiceNumber: async (invoiceNumber: string, userId: string): Promise<string | null> => {
    // TODO: Implement invoice number uniqueness check
    return null
  },
  
  // Validate file upload
  validateFile: (file: File, maxSize: number, allowedTypes: string[]): string | null => {
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`
    }
    
    if (!allowedTypes.includes(file.type)) {
      return `File type must be one of: ${allowedTypes.join(', ')}`
    }
    
    return null
  }
}
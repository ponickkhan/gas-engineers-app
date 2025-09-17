import { FieldError, FieldErrorsImpl, Merge } from 'react-hook-form'

/**
 * Safely extracts error message from React Hook Form error objects
 */
export function getErrorMessage(
  error: string | FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined
): string | undefined {
  if (!error) return undefined
  
  if (typeof error === 'string') {
    return error
  }
  
  if (typeof error === 'object' && 'message' in error) {
    return typeof error.message === 'string' ? error.message : undefined
  }
  
  return undefined
}

/**
 * Safely extracts nested error message from React Hook Form error objects
 */
export function getNestedErrorMessage(
  errors: any,
  path: string
): string | undefined {
  const keys = path.split('.')
  let current = errors
  
  for (const key of keys) {
    if (!current || typeof current !== 'object') {
      return undefined
    }
    current = current[key]
  }
  
  return getErrorMessage(current)
}